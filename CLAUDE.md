# CLAUDE.md — Litug

> Project context for Claude Code. **Read this first, every session.**
> This file is the single source of truth for what we are building and the rules that must never be broken.

---

## 1. What we're building

A **trust-first platform** that lets the Senegalese diaspora buy land and houses in Senegal **without getting scammed**, and follow through all the way to a finished house.

Land fraud (fake titles, the same plot sold to several buyers, phantom plots) is the core pain. **Our product is not "listings" — our product is TRUST.** Everything we build must reinforce that trust or it does not belong here.

**Two pillars, one platform, one trust story:**
- **Land pillar (live):** the buyer AI agent + verified listings + the notaire séquestre. Gets a diaspora buyer safely to a clean title.
- **Mustaf — construction pillar (next, see §8):** once the buyer owns the land (or already owns one), **Mustaf** is the trust + oversight layer that gets them to a *finished* house without being robbed from 4 000 km away. Same philosophy as the land pillar — radical transparency, money held by a third party, milestone control — applied to the build.

**Revenue model (context, not all built at once):**
- **Sellers** pay a subscription → get the AI WhatsApp agent (filters/qualifies buyers) + a dashboard to manage their listings (for sale / sold) + collect verified buyer testimonials.
- **Buyers** pay for **verification** (real check via our notaire/géomètre at the Conservation Foncière).
- **Transaction fee** via the notaire's **séquestre** (escrow).
- **Mustaf (construction):** a fixed **Phase 0 fee** (plan + permits + soil study) + a **management subscription as a % of project value**, in 3 tiers (see §8). **Zero margin on materials.** Construction paid by milestone.

---

## 2. Who it's for

- **Buyers:** Senegalese diaspora (Europe, esp. Italy & France). Scam-averse, emotional, high-value decisions, almost entirely on **mobile + WhatsApp**, **French-speaking**. A land buyer is also a future **Mustaf** construction client — the two pillars share the same person across time.
- **Sellers:** individual land sellers and *promoteurs*. Some have large social audiences (TikTok/Instagram) used as a **distribution + testimonial channel**.
- **Mustaf field & back-office team (see §8):** procurement, site agent, independent inspector, head-office controller, admin. These operational roles power the construction module.

---

## 3. The product is TRUST — non-negotiable rules

These are business-critical guardrails. Never violate them, even if asked to "simplify".

1. **"Vérifié" is sacred.** A listing may be marked *Vérifié* **only** after a real check by our notaire/géomètre at the **Conservation Foncière** (and Cadastre for boundaries). Never infer "verified" from a document photo alone.
2. **Show the source of trust.** A verified badge must always display **which notaire**, **the date**, and **the registry checked**. Precise claims only — e.g. *"Vérifié à la Conservation Foncière le 12/03/2026"*, never *"garanti à vie"* or any absolute guarantee.
3. **Radical transparency on every listing.** Every plot shows its document-type badge whether verified or not: 🟢 Titre Foncier · 🟡 Bail · 🔴 Délibération · ⚪️ Non vérifié. **Never hide or soften an unverified status.**
4. **Money is held by a NEUTRAL THIRD PARTY, never by us.** Transaction funds sit in the notaire's **séquestre**; construction funds sit in a ring-fenced escrow (notaire séquestre or partner bank). The platform orchestrates; the third party custodies. Land funds release to the seller **only when the mutation (title transfer) is registered in the buyer's name.**
5. **Construction is paid by milestone, not by calendar.** Funds release per milestone (foundations → walls → roof …) **only** after independent on-site verification (photo/video from our géomètre/inspecteur). See §8 for the full anti-fraud chain.
6. **Testimonials must be real.** A testimonial is only valid if linked to a **completed on-platform transaction**.
7. **Sold ≠ deleted.** Sold listings stay visible, marked **Vendu**, to deter the same plot being sold twice.

**Construction-specific trust rules (Mustaf — see §8 for detail):**

8. **A phase starts only when it is fully funded.** No half-financed phases — that is the #1 cause of abandoned, rotting building sites. If the foundation devis is 1 000 000 FCFA, work begins only when the project sub-account reaches it.
9. **Zero margin on materials.** Litug buys at wholesale from partner suppliers and passes **100% of the savings to the client**; every invoice is visible on the dashboard. Litug's only construction revenue is the management subscription + Phase 0 fee. Never hide a materials markup.
10. **Separation of powers is absolute.** No single person may both **spend money** and **certify work**. A milestone release always requires two distinct roles: the inspector who certifies + the controller who releases (maker-checker, double signature).
11. **Verify before it's hidden.** For structural steps (e.g. foundations), the inspector must record proof (rebar counted + photo, concrete dosage) **before** the pour. Once concrete is poured, the truth is buried forever.
12. **Contributions are NOT ownership.** The family co-contribution view shows each member's **participation %** (who paid how much), never legal property shares. Always display: *"Ceci est un relevé des contributions, pas un titre de propriété. La propriété est établie par acte notarié."*
13. **Each project is ring-fenced (étanche).** Money and materials never move between two clients' projects, in the data model or in operations.

---

## 4. Tech stack

- **Supabase** — Postgres database, Auth, Storage (documents/photos), **Row Level Security**.
- **n8n** (self-hosted on Hostinger VPS) — the automation orchestrator. Connects **WhatsApp ↔ Claude (Anthropic API) ↔ Supabase**.
- **WhatsApp Business API via a BSP provider** (e.g. 360dialog or Gupshup). ⚠️ **Never use unofficial WhatsApp automation — it gets numbers banned.** Use the provider's sandbox number for the demo.
- **Anthropic API (Claude)** — the brain of the conversational agent, called from n8n.
- **Frontend** — Next.js (App Router) + Tailwind CSS + the Supabase JS client. Mobile-first.
- **Hostinger** — VPS hosting for n8n + the web app.
- **Mustaf media** — construction photos/videos are stored in Supabase Storage **with their EXIF/geo + timestamp metadata preserved and surfaced** (geolocated, dated proof — see §8). Never strip this metadata.
- **Mustaf escrow** — for now **simulated** in Supabase (no real banking integration until legal validation, see §12).

---

## 5. Architecture

**Land pillar (buyer qualification):**
```
Buyer on WhatsApp
      │
      ▼
BSP webhook ──► n8n ──► Claude (qualify: budget? zone? document type?)
                 │            │
                 │            ▼
                 │      Supabase  ◄── query matching plots
                 │            │
                 ▼            ▼
        reply with info/photos/price  +  save lead & conversation
                 │
                 └─► flag "handoff to human" when the buyer is serious

Frontend (seller dashboard + public site) ──► Supabase (read/write, gated by RLS)
```

**Mustaf pillar (construction milestone release):**
```
Client deposits at own pace ──► escrow sub-account (per project, ring-fenced)
                                        │
                                        ▼
                         phase fully funded? ──no──► wait (work does not start)
                                        │ yes
                                        ▼
        procurement buys materials (wholesale)  +  site agent runs the build
                                        │
                                        ▼
            independent inspector verifies (BEFORE the pour for structural steps)
                                        │  certifies + signs
                                        ▼
            head-office controller releases funds  (2nd signature)  ──► pay company/materials
                                        │
                                        ▼
        dashboard updates: expenses line-by-line, geolocated photos, balance
            (client can flag any anomaly in one click ──► alert to head office)
```

- The AI runs the buyer conversation; the **human seller is only pulled in for serious buyers**.
- In Mustaf, **no role both spends and certifies**; the client and their family are continuous auditors via the dashboard.
- The frontend talks to Supabase directly through the client, protected by RLS.

---

## 6. Data model (high level — detailed per phase)

Core entities (English names in code/DB):

**Land pillar:**
- **sellers** — account, subscription status, profile, social handles.
- **lands** — seller_id, type (`tf` | `bail` | `deliberation`), price, zone, photos, status (`available` | `sold`), verification status + verifying notaire + verification date.
- **leads / buyers** — budget, desired zone, desired document type, source.
- **conversations** — WhatsApp messages the AI logs, linked to a lead.
- **transactions** *(later)* — séquestre status, linked land + buyer + notaire.
- **testimonials** *(later)* — linked to a completed transaction.

**Mustaf — construction pillar** *(Phase 5)*:
- **construction_projects** — land_id, owner (buyer), subscription_tier (`suivi` | `serenite` | `tranquillite`), total_estimate, status.
- **project_members** — project_id, user_id, role (`contributor`), contribution_total → powers the family co-contribution view (participation %, **not** ownership).
- **escrow_subaccounts** — project_id, balance, custodian (notaire/partner bank). **Ring-fenced per project. Simulated for now.**
- **deposits** — project_id, contributor_id, amount, date (e.g. "Modou +100 000 F, 03/06").
- **construction_phases** — project_id, name, order, estimate, `funded` (bool), status.
- **expenses** — phase_id, category (`ciment` | `fer` | `sable` | `eau` | `main_doeuvre` | `transport` | `management_fee` …), amount, supplier_id, invoice_url, date.
- **material_orders** — phase_id, item, qty_ordered, qty_received, qty_used, supplier_id, invoice → enables quantity reconciliation.
- **inspections** — phase_id, inspector_id, evidence (media), `pre_pour` flag, status, signature.
- **fund_releases** — phase_id, inspector_id, controller_id, amount, double_signed → enforces separation of powers.
- **construction_media** — url, geo, captured_at, phase_id (geolocated + timestamped).
- **construction_companies** — rating, retention_pct (default 10%), status (vetted network).
- **anomalies** — project_id, raised_by (client), target (expense/phase/media), status.
- **users.role** extended with Mustaf operational roles: `procurement`, `site_agent`, `inspector`, `controller`, `admin`.
- Supabase **Storage** buckets for documents, listing photos, and construction media.

---

## 7. Build roadmap — *build in the order we will sell*

> **Golden rule:** build the piece that earns first. Build a **thin vertical slice** end-to-end before widening anything.

- **Phase 0 — Supabase data model.** Tables, fields, relations, RLS, storage buckets.
- **Phase 1 — AI agent on n8n.** WhatsApp → Claude qualifies → reads Supabase → replies → saves lead. *This conversation is the sales demo for sellers.*
- **Phase 2 — Seller dashboard (frontend).** Add/edit plots, upload docs/photos, see captured leads, verification badges, collect testimonials.
- **Phase 3 — Landing page + buyer-facing site.** The trust story, verified listings, badges, testimonials, "how it works". The public landing **is the home page** (`/`, `app/page.tsx`) — bilingual FR/EN, mobile-first. Login/dashboard behind **"Se connecter"** (`/login`); `proxy.ts` keeps `/` public and gates protected routes.
- **Phase 4 — Transaction & verification.** Verification request + payment flow, notaire séquestre orchestration, mutation tracking.
- **Phase 5 — Mustaf (construction module).** The full construction trust + oversight system (see §8): client dashboard, escrow sub-accounts, phase-gated funding, line-by-line expenses, geolocated media, family co-contribution, and the anti-fraud chain (separation of powers, inspections, double-signature release, 10% retention).

**Sequencing wisdom — keep the golden rule:** Mustaf is operationally heavy. Before widening it into a full self-serve product, prove it on **3–5 real houses managed by hand** end-to-end (this is our anti-fraud R&D — it shows where money actually leaks). Build the dashboard as the thin vertical slice that supports those first houses, then scale. **First Mustaf milestone target:** 1 project, 1 family with 3 contributors, 4 phases seeded, the foundation phase funded → verified → released on the dashboard.

---

## 8. Mustaf — the construction module *(the construction pillar)*

Mustaf is what turns a verified plot into a **finished house the diaspora client can trust from abroad**. The land pillar removes the fear of *buying*; Mustaf removes the fear of *building*. The client sees, from their phone, exactly where every franc goes and exactly where the site stands — and no one on the ground can lie to them, because the system is built on separated powers and independent verification.

> **Guiding principle for Mustaf: you will never eliminate fraud 100%. The goal is to make fraud unprofitable, improbable, and detectable** — to require a fragile multi-person conspiracy instead of a single dishonest hand.

### 8.1 Economic model (reflect in the app)
- **Phase 0 — fixed fee, paid upfront:** architect plan + building-permit dossier + soil study. Filters serious clients and recovers real study costs even if they pause. Never fold this fixed cost into the percentage.
- **Management subscription — % of project value, in 3 tiers** (the difference between tiers = intensity of supervision = number of site visits):
  - **Suivi essentiel (~8%)** — monthly visit, dashboard, phase-by-phase payment.
  - **Sérénité (~12%, flagship)** — weekly visit, independent inspector, 10% retention. Designed to be the most profitable and the default choice.
  - **Tranquillité totale (~16%)** — twice-weekly/on-demand visits, dedicated site agent, real-time alerts.
- **Distance surcharge + minimum floor:** far sites cost more in travel without earning more in %, so apply zone tariffs or a transport flat fee, and a floor (`% OR X FCFA, whichever is higher`) so small houses still cover fixed costs.
- **Zero materials margin** (rule §3.9): wholesale buying, savings to client, invoices visible. Revenue = subscription + Phase 0 only.

### 8.2 Escrow & phase-gated funding
- Client **saves at their own pace** (tontine spirit) into a **ring-fenced sub-account per project**, held by a neutral third party (notaire séquestre or partner bank) — **never Litug's account** (rule §3.4, §3.13).
- A **phase starts only when fully funded** (rule §3.8). Devis has a **validity window** (e.g. 30–60 days); past it, recompute at current prices before launching (material prices move).
- **Litug never advances its own cash:** never pay a supplier or mason before the client's funds are confirmed in escrow. This keeps Mustaf low working-capital-risk — a rare advantage in construction. Preserve it.
- **Just-in-time materials:** buy a phase's materials only when that phase starts and they'll be consumed within days (cement degrades in 3–6 months). **No internal materials resale between clients** (rule §3.13).

### 8.3 Family co-contribution (growth engine + risk)
- Multiple family members **share one dashboard**; every deposit is attributed and visible (*"Modou +100 000 F · Fatou +18 000 F · Aïcha +90 000 F"*). One client brings ten future clients — protect this.
- Show **participation %**, never ownership shares (rule §3.12), with the legal disclaimer everywhere. **Do not build the "group of friends builds-to-rent" investment case** — it can fall under collective-investment regulation (UEMOA); out of scope until legal review (see §12).

### 8.4 Anti-fraud architecture (the real moat)
Where fraud happens: material theft · supplier-collusion overbilling · fake progress · **quality fraud** (less rebar, over-watered concrete — invisible once poured) · inspector–company collusion. The team and system are designed against each:

- **Five roles, separated powers** (rule §3.10): **procurement** (buys, never verifies its own delivery) · **site agent** (runs the build, never certifies its own progress or touches money) · **independent inspector** (verifies materials & work before any release; reports to head office, **rotates** between sites so no cozy relationship forms) · **head-office controller** (releases funds only against a signed inspection — 2nd signature) · **vetted construction companies** (carry their own liability, 10% retention held until verified complete — and depend on Litug for their client flow, which is the strongest discipline lever).
- **Verify before it's hidden** (rule §3.11): rebar counted + photographed before the pour; controller attends/validates concrete dosage.
- **Quantity reconciliation:** ordered vs. used per material; flag any gap.
- **Geolocated + timestamped media** (no recycled or off-site photos); **surprise visits** (part of visits unannounced).
- **Phase-gated release** is the lock where every control converges (inspection signed → controller releases).
- **The client is a free auditor:** one-click anomaly flag on any expense, phase, or photo → alert to head office.
- **Who watches the watchers:** inspector rotation, cross-checking the three registers (procurement / inspector / company) for inconsistencies, senior surprise audits, and the client's eye. No one holds the whole truth alone.
- **Incentives:** pay inspectors above market (an underpaid inspector is half-corrupt already); reward clean, on-time delivery and fraud reporting. The premium subscription exists precisely to fund this.

### 8.5 Mustaf dashboard — screens
**Client (mobile-first, top priority):** project view (current phase, % progress, next phase, latest media) · escrow account (balance, deposit history with author, funding progress toward next phase) · expenses (line-by-line by category, each with amount/date/invoice) · visual tracking (geolocated, timestamped gallery per phase) · family contributions (who paid what, participation %, + legal disclaimer) · documents (plan, permits, devis, contracts) · **"Signaler une anomalie"** on every item.

**Team / head office:** inspector (per-phase verification checklist, evidence upload, signature) · controller (queue of certified phases awaiting release, double-validation) · procurement (orders, supplier invoices, wholesale prices) · admin (projects, users, suppliers, rated companies, anomalies).

---

## 9. Design system — **palette "Sahel"** (single source of truth)

Sober, clean, premium. Whitespace is the elegance. **One palette across the whole product** — the landing page, the seller dashboard, the Mustaf construction dashboard, and the auth pages all share the same tokens. The canonical tokens live in `app/globals.css` (`:root` + Tailwind `@theme`); `app/landing.css` inherits them and only adds optional palette/font *variants* for the design-exploration panel.

**Colors (design tokens — Sahel):**
```
--ink:               #200B11   /* dark anchor — hero, footer, impact bands (bordeaux/vin) */
--ink-soft:          #33121A   /* softer dark surface */
--paper:             #F7F2E9   /* warm white — base surface */
--paper-2:           #EFE7D6   /* alternate warm surface */
--surface:           #FFFFFF   /* cards, inputs */
--green:             #7A2233   /* TRUST (bordeaux/vin) — primary CTAs, verified badge, security signals. Var name kept for compatibility. */
--green-bright:      #973047   /* hover / brighter bordeaux */
--gold:              #C9A24A   /* rare premium accent — small doses */
--gold-soft:         #E4CE92   /* gold tint */
--text:              #221316   /* main text — never pure black */
--text-muted:        #6E5B5E   /* secondary text, borders */
--text-on-ink:       #F1E7E9   /* text on dark surfaces */
--text-on-ink-muted: #B29CA1   /* secondary text on dark */
--line:              rgba(34,19,22,.10)  /* subtle borders */
```
- **Bordeaux = TRUST.** The accent is a deep **bordeaux / vin** (the `--green*` variable *names* are kept for code compatibility, but the hue is bordeaux). The dark wine `--ink`/`--green` **anchors** the dark bands (hero, footer, impact) and carries every trust signal: primary CTAs, the *Vérifié* badge, security cues. Keep it meaningful — never use it as a random decorative fill. ⚠️ Bordeaux is intentionally kept **darker and less saturated than the 🔴 Délibération badge** (pure red = danger/fraud) so the two never read the same.
- **Gold is the rare premium accent.** Tiny doses only (a highlighted word, a pin, an icon). Its power comes from being rare.
- **Trust badge colors are semantic, not brand.** The document-type badges (🟢 TF · 🟡 Bail · 🔴 Délibération · ⚪ Non vérifié, see §3) stay visually **distinct** from the brand bordeaux/gold — the 🟢 TF badge stays **green** and the 🔴 Délibération badge stays **bright red**, both distinct from the bordeaux brand accent. Never merge them into the brand palette.
- **Mustaf phase/status colors are semantic too.** Phase states (e.g. *en attente de financement* / *financée* / *en cours* / *vérifiée* / *payée*) and the anomaly flag use clear, consistent status hues distinct from the brand accent. Money and "verified work" signals reuse the trust bordeaux; the anomaly flag uses the danger red. Keep them legible at a glance for a stressed diaspora user.

**Typography (Google Fonts):**
- Headings / display: **Space Grotesk** (`--font-space-grotesk` → `--font-display`).
- Body & dashboard: **Manrope** (`--font-manrope` → `--font-sans`).
- *(Fraunces / Inter from the old system are retired — do not reintroduce them.)*

**Layout rules:**
- ~60% whitespace, ~30% text/structure, accent colors sparing.
- **Mobile-first — non-negotiable.** **>80% of visitors are on phones** with variable bandwidth: design for 360–390px first, compress images, keep the font payload small, keep it fast. This applies doubly to the Mustaf dashboard — the diaspora client checks it from a phone abroad.

---

## 10. Domain glossary (Senegal land & construction)

**Land:**
- **Titre Foncier (TF)** 🟢 — strongest, fully registered ownership at the Conservation Foncière.
- **Bail** 🟡 — long emphyteutic lease from the State (≈80–85% of plots on the market). You own a lease, not full title.
- **Délibération** 🔴 — municipal allocation; weak/precarious; where most fraud happens.
- **Conservation Foncière** (Direction des Domaines) — registry where TF ownership and encumbrances (mortgages, litigation) are checked.
- **Cadastre** — physical existence, boundaries, surface area.
- **Géomètre agréé** — licensed surveyor; confirms boundaries on site and construction milestones.
- **Notaire** — legal authority for the authentic deed, the **mutation**, and the **séquestre**. Our verification + escrow partner. We work *with* the notaire, we never replace them.
- **Mutation** — official transfer of the title into the buyer's name.
- **Séquestre** — the notaire-held escrow account.
- **CNI** — national ID card (seller identity / KYC).

**Construction (Mustaf):**
- **Devis** — itemized cost estimate, here produced per phase; has a validity window.
- **Phase / lot** — a funded, verified unit of work (fondation → élévation → toiture → second œuvre → finitions).
- **Phase 0** — pre-construction package: plan + permit dossier + soil study (fixed fee).
- **Permis de construire / Certificat d'urbanisme / Certificat de conformité** — the building-permit chain Mustaf handles for the client.
- **Retenue de garantie** — 10% withheld from each company until verified completion.
- **Inspecteur (indépendant, rotatif)** — verifies materials & work before release; reports to head office, not to the site agent.
- **Étanche** — ring-fenced: a project's money and materials never mix with another's.
- **Dosage** — concrete mix ratio; over-watering is a common, invisible quality fraud — verified before the pour.

---

## 11. Conventions

- **Language — non-negotiable: the entire user-facing product is in French.** Landing page, seller dashboard, **Mustaf construction dashboard**, all buttons/labels/badges/status (e.g. *Vérifié*, *Vendu*, *Non vérifié*, *Phase financée*, *En attente de vérification*, *Signaler une anomalie*), emails, error messages, and the AI agent's WhatsApp replies (light Wolof for warmth is fine). **Never ship user-facing English copy.**
  - **Code stays in English** — table names, field names, variables, comments. Internal only, never shown to users. Keep the two layers strictly separate.
- **Currency:** FCFA (XOF) primary; show an EUR equivalent for the diaspora — everywhere, including Mustaf expenses and escrow balances.
- **Secrets:** environment variables only — Anthropic key, Supabase `service_role` key, BSP/WhatsApp token. **Never commit secrets.** The `service_role` key lives server-side (n8n) only, never in the frontend.
- **Security:** enable **RLS on every Supabase table**. A seller sees only their own rows; a Mustaf client (and their project_members) sees only their own project; operational roles see only what their role needs. Documents and construction media in **private** storage buckets.
- **Performance:** mobile-first, low-bandwidth-friendly.

---

## 12. Current scope — what to build / NOT build yet

**Land + transaction (existing focus):**
- ❌ No real money handling / séquestre code yet — orchestrate, simulate.
- ❌ Do not mark seed/demo data as *Vérifié* as if it were a real check.

**Mustaf (Phase 5 — now in scope as the next major module, but gated):**
- ✅ Build the **dashboard, data model, phase-gated logic, family contributions, inspection & double-signature release, anomaly flagging** — as a thin vertical slice (1 project, 1 family, 4 phases).
- ❌ **Simulate the escrow / deposits** (demo data) — **no real banking or payment integration** until legal validation of the séquestre/partner-bank structure.
- ❌ **Never display ownership shares** — participation % only, with the legal disclaimer (rule §3.12).
- ❌ **Never mix funds or materials between projects** in the data model (rule §3.13).
- ❌ **Never let one user both certify work AND release funds** for the same phase (rule §3.10).
- ❌ No "group invests to rent it out" / collective-investment feature (regulatory — needs a lawyer).
- ❌ No internal materials-resale marketplace between clients.

Stay focused on the thin vertical slice for each phase before widening.