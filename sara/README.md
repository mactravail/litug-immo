# Sara — agent IA WhatsApp (Litug)

Trois livrables dans ce dossier :

| Fichier | Rôle |
|---|---|
| `../supabase/migrations/003_sara_agent.sql` | La **fenêtre étroite** + le **multi-locataire** (vue, rôle, GRANTs, tables config). |
| `system-prompt-sara.md` | Le **system prompt** de Sara (déjà recopié dans le workflow). |
| `n8n-sara-workflow.json` | Le **workflow n8n** importable. |

L'architecture de sécurité tient sur **deux couches** :
- **Couche DB (cette migration)** = *quelles tables / quelles colonnes* Sara peut toucher. `sara_role` ne voit que la vue `public_lands` (8 colonnes), lit `whatsapp_numbers` + `seller_knowledge_base`, et lit/écrit `leads` + `conversations`. **Aucun** accès à `lands`, `documents`, `sellers`, CNI, prix d'achat.
- **Couche workflow (n8n)** = *quel vendeur*. Chaque requête est filtrée par le `seller_id` résolu depuis `whatsapp_numbers`. Un acheteur n'atteint jamais les données d'un autre vendeur.

---

## Étape 1 — Appliquer le SQL

Dans **Supabase → SQL Editor**, colle/exécute `003_sara_agent.sql` (ou `supabase db push` si tu utilises la CLI).

Puis, **une seule fois**, à la main (le mot de passe n'est PAS dans le fichier versionné) :

```sql
alter role sara_role with password '[SARA_DB_PASSWORD]';
```

Choisis un mot de passe fort, garde-le comme secret (tu le mettras dans le credential n8n, jamais dans le code).

**Vérifie la fenêtre** (doit échouer pour les tables interdites) :

```sql
set role sara_role;
select * from public_lands limit 1;   -- ✅ OK
select * from lands       limit 1;     -- ❌ permission denied  (attendu)
select * from sellers     limit 1;     -- ❌ permission denied  (attendu)
reset role;
```

### Données de test à insérer

```sql
-- 1) Lier le numéro de TEST Meta à un vendeur existant
insert into whatsapp_numbers (phone_number_id, seller_id, display_phone_number)
values ('[PHONE_NUMBER_ID]', '<UUID_DU_VENDEUR>', '+1555...');

-- 2) (optionnel) base de connaissances du vendeur
insert into seller_knowledge_base (seller_id, presentation, faq, ton)
values ('<UUID_DU_VENDEUR>',
        'Je suis Mamadou, je vends des terrains à Saly et Mbour depuis 8 ans.',
        'Paiement échelonné possible. Bornage inclus. Visites le samedi.',
        'Tutoiement chaleureux.');

-- 3) au moins 1 terrain PUBLIÉ + disponible (sinon Sara n'a rien à proposer)
update lands set published = true where id = '<UUID_TERRAIN>';
```

> `<UUID_DU_VENDEUR>` = un `sellers.id` réel ; `[PHONE_NUMBER_ID]` = l'identifiant du numéro de test dans Meta (voir étape 4).

---

## Étape 2 — Importer le workflow dans n8n

n8n → **Workflows → Import from File** → `n8n-sara-workflow.json`.
Les nœuds rouges = credentials à (ré)assigner (étape 3).

---

## Étape 3 — Créer les 3 credentials n8n

1. **Postgres « Supabase — sara_role »** (utilisé par tous les nœuds Postgres + la mémoire) :
   - Host : `db.<ref>.supabase.co` (ou le pooler `aws-0-...pooler.supabase.com`)
   - Port : `5432` (ou `6543` pooler) · Database : `postgres`
   - User : `sara_role` · Password : `[SARA_DB_PASSWORD]` (celui de l'étape 1)
   - SSL : `require`
   - ⚠️ **Surtout pas** l'utilisateur `postgres` ni la `service_role`.

2. **Anthropic API « Anthropic — [ANTHROPIC_API_KEY] »** : ta clé Anthropic.

3. **Header Auth « WhatsApp Cloud API »** (pour l'envoi) :
   - Name : `Authorization`
   - Value : `Bearer [WHATSAPP_TOKEN]`

Réassigne ces 3 credentials sur les nœuds correspondants, puis **active** le workflow.

---

## Étape 4 — Configurer WhatsApp Cloud API côté Meta

1. **developers.facebook.com** → ton app → **WhatsApp → API Setup**. Note :
   - le **`phone_number_id`** du numéro de **test** → c'est `[PHONE_NUMBER_ID]` (à mettre dans `whatsapp_numbers`).
   - le **token temporaire** → `[WHATSAPP_TOKEN]` (24 h ; pour la durée, génère un token *System User* permanent).
2. **Ajoute ton numéro perso** comme destinataire autorisé (« To » → Manage phone number list). En phase test, Meta n'envoie qu'aux numéros autorisés.
3. **Webhook** : WhatsApp → Configuration → **Edit** :
   - **Callback URL** = l'URL du **Webhook Messages (POST)** de n8n. Récupère-la sur le nœud webhook (Production URL), ex. `https://<ton-n8n>/webhook/sara-whatsapp`.
   - **Verify token** = `[VERIFY_TOKEN]` (la même valeur que dans le nœud « Token de vérif OK ? »).
   - Clique **Verify and save** → Meta appelle le **GET**, le workflow renvoie le `hub.challenge` → ✅.
   - **Subscribe** au champ **`messages`**.

> Les webhooks GET (vérif) et POST (messages) partagent le **même path** `sara-whatsapp`, distingués par la méthode HTTP.

---

## Étape 5 — Tester

Depuis ton numéro perso autorisé, envoie un WhatsApp au **numéro de test Meta**. Tu devrais :
- voir l'exécution dans n8n,
- recevoir la réponse de Sara,
- trouver un **lead** (table `leads`) + une **conversation** (table `conversations`, visible dans le dashboard vendeur `/clients/[id]`).
Quand tu te montres « acheteur sérieux », Sara appelle l'outil → le lead passe `status='qualifie'`, `needs_human=true`.

---

## Points d'attention / limites connues

- **Liaison de paramètres Postgres & texte libre** : les nœuds `Upsert lead`, `Enregistrer la conversation` et l'outil utilisent `queryReplacement` (séparé par virgules). Si un **message ou un nom contient une virgule**, ouvre le nœud et mappe via les **Query Parameters structurés** (un champ par valeur) — le binding positionnel `$1,$2…` reste correct, c'est juste la saisie qui change. Sans virgule, ça marche tel quel.
- **Versions de nœuds n8n** : les `typeVersion` et noms de paramètres peuvent légèrement différer selon ta version n8n. Si un nœud s'importe « cassé », recrée-le et recopie la requête/expression depuis le JSON.
- **Isolation locataire = workflow.** Au niveau DB, les policies de `sara_role` sur `leads`/`conversations` sont `using(true)` (la fenêtre limite *les tables*, pas *le vendeur*). C'est le `where seller_id = …` du workflow qui isole les vendeurs. **Durcissement possible plus tard** : passer par des fonctions `security definer` (`sara_upsert_lead(seller_id, …)`) pour que `sara_role` n'ait aucun accès direct aux tables et que le `seller_id` soit imposé côté DB.
- **Multi-locataire & token d'envoi** : en test, un seul `[WHATSAPP_TOKEN]` pour le numéro de test. En production, chaque vendeur aura son propre numéro/token — il faudra stocker le token par vendeur (chiffré) et le sélectionner dynamiquement à l'envoi.
- **Secrets** : `[SARA_DB_PASSWORD]`, `[ANTHROPIC_API_KEY]`, `[WHATSAPP_TOKEN]`, `[VERIFY_TOKEN]` vivent **uniquement** dans les credentials n8n. Rien en dur, rien commité.
