# CLAUDE.md — Litug

> Project context for Claude Code. **Read first, every session. Single source of truth.**

---

## 1. What we're building

A **trust-first platform** for the Senegalese diaspora to buy land and houses in Senegal **without getting scammed**, all the way to a finished house. Land fraud (fake titles, the same plot sold twice, phantom plots) is the core pain. **Our product is TRUST, not listings.**

**Two pillars:**
- **Land (live):** buyer AI agent + verified listings + notaire séquestre → a clean title.
- **Mustaf — construction (next, §8):** once they own the land, the trust + oversight layer that gets them to a finished house from 4 000 km away — radical transparency, money held by a third party, milestone control.

**Revenue:** sellers pay a subscription (AI agent + dashboard); buyers pay for verification; transaction fee via séquestre; Mustaf = fixed Phase 0 fee + management subscription as a % of project value (3 tiers, §8), **zero materials margin**, construction paid by milestone.

---

## 2. Who it's for

- **Buyers / owners:** diaspora (esp. Italy & France), scam-averse, mobile + WhatsApp, French. A land buyer is a future Mustaf client.
- **Sellers:** individual sellers and *promoteurs*, some with social audiences (distribution + testimonials).
- **Team:** Mustaf field & back-office (procurement, site agent, inspector, controller) + **admin** (the founder).

---

## 3. The product is TRUST — non-negotiable rules

1. **"Vérifié" is sacred.** Marked *Vérifié* only after a real notaire/géomètre check at the Conservation Foncière (+ Cadastre for boundaries). Never from a document photo.
2. **Show the source of trust.** A verified badge shows which notaire, the date, the registry. Precise claims only — never *"garanti à vie"* or any absolute guarantee.
3. **Radical transparency.** Every plot shows its badge: 🟢 Titre Foncier · 🟡 Bail · 🔴 Délibération · ⚪️ Non vérifié. Never hide/soften unverified status.
4. **Money held by a neutral third party, never by us.** Notaire séquestre / partner-bank escrow. Land funds release to the seller only when the mutation is registered in the buyer's name.
5. **Construction is paid by milestone**, released only after independent on-site verification (§8).
6. **Testimonials must be real** — linked to a completed on-platform transaction.
7. **Sold ≠ deleted** — sold listings stay visible, marked **Vendu**.
8. **A phase starts only when fully funded** — no half-financed phases.
9. **Zero materials margin** — wholesale buying, savings to client, every invoice visible. Revenue = subscription + Phase 0 only.
10. **Separation of powers is absolute** — no one both spends money and certifies work. A release needs two distinct roles (inspector certifies + controller releases; maker-checker).
11. **Verify before it's hidden** — structural steps proven (rebar counted + photo, concrete dosage) **before** the pour.
12. **Contributions are NOT ownership** — show **participation %**, never property shares. Always display: *"Ceci est un relevé des contributions, pas un titre de propriété. La propriété est établie par acte notarié."*
13. **Each project is ring-fenced (étanche)** — money/materials never move between projects.

---

## 4. Tech stack

- **Supabase** — Postgres, Auth, Storage, **RLS on every table**.
- **n8n** (Hostinger VPS) — orchestrator: WhatsApp ↔ Claude ↔ Supabase.
- **WhatsApp Business API via a BSP** (360dialog/Gupshup). ⚠️ Never unofficial automation (gets numbers banned); use the sandbox number for demos.
- **Anthropic API (Claude)** — the conversational agent's brain, called from n8n.
- **Frontend** — Next.js (App Router) + Tailwind + Supabase JS, **mobile-first**.
- **Mustaf media** — stored with EXIF/geo + timestamp **preserved and surfaced**; never strip metadata.
- **Mustaf escrow** — **simulated** for now (no real banking until legal validation, §12).
- **Secrets** in env vars only; `service_role` key server-side (n8n) only, never in frontend.

---

## 5. Spaces, roles & access

**Four spaces, one login, one router, one DB (different doors):** `/admin` (founder back-office) · `/equipe` (field & ops team) · `/dashboard` (seller, Sara) · `/mustaf` (owner/client, read-mostly).

- **Single source of truth for access — table `user_roles`:** `user_id`, `role` ∈ `admin|employee|seller|owner`, `employee_subrole` ∈ `procurement|site_agent|inspector|controller`, `status` ∈ `active|suspended|revoked`. A user may hold **several** roles.
- **Login is one place; landing is decided by a router.** After auth, **always redirect to `/apres-connexion`** (never straight to a dashboard). It reads the user's roles → **0:** `/onboarding` · **exactly 1:** straight to that space · **several:** `/choisir-espace` with an always-visible space switcher (remember last choice).
- **Routing is convenience; RLS is the real lock.** `proxy.ts` gates each route by required role; **RLS on every table is the actual security** (a seller physically can't read a construction project; an employee can't read a client's escrow balance or personal data). Never rely on routing alone.
- **Staff roles are staff-created only.** Public sign-up creates `seller`/`owner` only; `admin`/`employee` by invitation. The router checks `status`: `suspended`/`revoked` → blocked with a clear message.

**What each space does:**
- **Admin** — see everything. Subscriptions (seller + Mustaf): validate / suspend / **revoke (soft delete, never hard)**. Mustaf projects: add invoices/photos, advance phase status (within the §8 state machine, **never bypass maker-checker**). Employee oversight: assign tasks + cash advances (with deadline + priority), track work hours, read field reports, **reconcile advances**. **Every sensitive action writes to `audit_log`** (who/what/when, insert-only).
- **Employee (`/equipe`, mobile-first)** — own account only. Sees assigned tasks (priority + deadline) and the **cash advance per task**; clocks in/out (hours); submits **field reports** (cash spent with receipts → remaining; work done / remaining; problems with location + time + *resolved / to-resolve*). Never sees client data; never creates its own advance or releases funds.
- **Seller (`/dashboard`, Sara)** — listings (for sale / sold), captured leads, verification badges, testimonials.
- **Owner (`/mustaf`)** — read-mostly: project, escrow balance, line-by-line expenses, geolocated photos, family contributions (participation %), one-click anomaly flag.

**Cash-advance discipline (anti-fraud):** prefer **direct supplier payment on invoice**; cash advances are the exception. Every advance reconciled (`given = spent + returned`, receipts required); **no new advance while a prior one is unreconciled**.

---

## 6. Architecture

**Land (qualification):**
```
WhatsApp buyer → BSP webhook → n8n → Claude (qualify: budget/zone/doc type)
   → query Supabase for matching plots → reply (info/photos/price) + save lead
   → flag "handoff to human" when the buyer is serious
Frontend ↔ Supabase (RLS-gated)
```
**Mustaf (milestone release):**
```
client deposits (own pace) → ring-fenced escrow sub-account
   → phase fully funded? no → wait | yes → procurement buys (wholesale) + site agent builds
   → independent inspector verifies (BEFORE the pour for structural steps) + signs
   → controller releases (2nd signature) → pay company/materials
   → dashboard updates (expenses, geolocated photos, balance); client can flag anomalies
```

---

## 7. Data model (high level — English in code/DB)

**Land:** `sellers` · `lands` (type `tf|bail|deliberation`, status `available|sold`, verification + notaire + date) · `leads` · `conversations` · `transactions` *(later)* · `testimonials` *(later)*.

**Mustaf:** `construction_projects` (subscription_tier) · `project_members` (contribution_total → participation %) · `escrow_subaccounts` (ring-fenced, simulated) · `deposits` · `construction_phases` (estimate, funded, status) · `expenses` (category, amount, supplier, invoice_url) · `material_orders` (ordered/received/used → reconciliation) · `inspections` (inspector, pre_pour, signature) · `fund_releases` (inspector_id + controller_id, double_signed) · `construction_media` (url, geo, captured_at) · `construction_companies` (rating, retention 10%) · `anomalies`.

**Access & operations:** `user_roles` (access authority, §5) · `tasks` (project, assigned_to, priority, due_date, status) · `cash_advances` (task, worker, given/spent/returned, reconciled) · `advance_receipts` (amount, file_url) · `work_sessions` (started/ended, summary) · `field_reports` (amount_remaining, work_done, work_remaining, status) · `incidents` (description, location+geo, occurred_at, `to_resolve|resolved`) · `audit_log` (actor, action, target, insert-only).

Storage buckets (private): documents, listing photos, construction media, receipts.

---

## 8. Mustaf — the construction module

Turns a verified plot into a finished house the client can trust from abroad. **Principle: you won't eliminate fraud 100% — make it unprofitable, improbable, detectable** (a fragile multi-person conspiracy, not a single dishonest hand).

**8.1 Economic model.** Fixed **Phase 0 fee** (plan + permit dossier + soil study), paid upfront, never folded into the %. **Management subscription = % of project value**, 3 tiers (= supervision intensity): **Suivi essentiel ~8%** (monthly visit) · **Sérénité ~12%, flagship** (weekly visit, independent inspector, 10% retention) · **Tranquillité totale ~16%** (twice-weekly/on-demand, dedicated site agent, real-time alerts). Add a **distance surcharge** + a **floor** (`% OR X FCFA, whichever is higher`). Zero materials margin (§3.9).

**8.2 Escrow & phase-gating.** Client saves at their own pace into a ring-fenced sub-account (third-party custody). A phase starts only when fully funded (§3.8); devis has a validity window — past it, re-quote at current prices. **Litug never advances its own cash.** Just-in-time materials (cement degrades in 3–6 months); no resale between projects (§3.13).

**8.3 Family co-contribution.** Several members share one dashboard; every deposit attributed and visible. Participation % only, with the disclaimer (§3.12). No "build-to-rent group" investment case (regulatory, §12).

**8.4 Anti-fraud (the moat).** Targets: material theft · overbilling collusion · fake progress · quality fraud (less rebar, over-watered concrete) · inspector–company collusion. Defenses: **five separated roles** (procurement buys but never verifies its own delivery · site agent runs but never certifies its own work or touches money · **independent, rotating** inspector verifies before any release, reports to head office · controller releases on a signed inspection · vetted companies, 10% retention, dependent on our client flow) · **verify before the pour** · quantity reconciliation · geolocated + timestamped media · surprise visits · **phase-gated double-signature release** · the **client as free auditor** (one-click anomaly flag) · inspector rotation + cross-checking registers + senior audits · **pay inspectors above market** (the premium funds this).

**8.5 Screens.** *Client (read-mostly, mobile):* project · escrow (balance, deposits, funding progress) · expenses (line-by-line + invoices) · geolocated photo gallery · family contributions · documents · "Signaler une anomalie". *Team:* inspector (checklist, evidence, signature) · controller (release queue, double-validation) · procurement (orders, invoices). *Admin & employee ops:* see §5.

---

## 9. Design system — palette "Monochrome" (single source of truth)

Sober, clean, premium; whitespace is the elegance — monochrome minimalism inspired by modern architecture + rhode (lots of white, black emphasis). **One palette across the whole product.** Canonical tokens in `app/globals.css` (`:root` + Tailwind `@theme`); `app/landing.css` only adds optional variants.

```
--ink:#000000  --ink-soft:#3a3a3a         /* dark anchor — hero/footer (pure black) */
--paper:#ffffff  --paper-2:#dfdfdf  --surface:#ffffff
--green:#000000  --green-bright:#3a3a3a    /* TRUST = black — CTAs, verified badge, security. Name --green kept for compat. */
--gold:#737373  --gold-soft:#d9d9d9        /* ex-premium accent → neutral grey. Name --gold kept for compat. */
--text:#3a3a3a  --text-muted:#737373       /* titles near-black, body grey */
--text-on-ink:#ffffff  --text-on-ink-muted:#d9d9d9
--line:#d9d9d9
```
- **6-grey palette:** `#000000 · #3a3a3a · #737373 · #d9d9d9 · #dfdfdf · #ffffff`. No brand color — emphasis comes from black-on-white contrast.
- **`--green` = TRUST = black** — CTAs, *Vérifié* badge, security cues; anchors dark bands. (Token name kept only for backward compat; it is no longer green/bordeaux.)
- **`--gold` → neutral grey** — used as a subtle secondary tone, no longer a gold accent.
- **Badge & status colors are semantic, NOT brand — these stay colored.** 🟢 TF green, 🟡 Bail, 🔴 Délibération red, and the anomaly = danger red are functional risk signals (§3) and live OUTSIDE the grayscale brand palette (`app/nos-terrains/terrains.css` etc.). Never grey them out; never merge them into the brand palette.
- **Type:** Bricolage Grotesque (display, big marketing titles → `font-display`) / Archivo (UI titles & labels → `font-serif` alias) / Inter (body → `font-sans`). *(Space Grotesk / Manrope / Playfair retired.)*
- **Mobile-first, non-negotiable** — >80% on phones; design for 360–390px, compress images, keep it fast.

---

## 10. Glossary (Senegal land & construction)

- **Titre Foncier (TF)** 🟢 — strongest, fully registered ownership.
- **Bail** 🟡 — long State lease (~80–85% of the market); a lease, not full title.
- **Délibération** 🔴 — weak municipal allocation; where most fraud happens.
- **Conservation Foncière** — registry for TF ownership + encumbrances. **Cadastre** — boundaries/surface.
- **Géomètre agréé** — licensed surveyor (boundaries + construction milestones).
- **Notaire** — authentic deed, **mutation** (transfer to buyer), **séquestre** (escrow). We work *with* them, never replace them. **CNI** — national ID (KYC).
- **Devis** — itemized estimate per phase (has a validity window). **Phase / lot** — funded, verified unit (fondation → élévation → toiture → second œuvre → finitions). **Phase 0** — plan + permits + soil study.
- **Retenue de garantie** — 10% withheld per company until verified completion. **Inspecteur (indépendant, rotatif)** — verifies before release. **Étanche** — ring-fenced. **Dosage** — concrete mix; over-watering = invisible quality fraud, verified before the pour.

---

## 11. Conventions

- **User-facing = French, always** (landing, all dashboards, buttons/badges/status, emails, errors, AI replies — light Wolof for warmth ok). Never ship visible English. **Code stays in English** (tables, fields, comments).
- **Currency:** FCFA (XOF) primary + EUR equivalent everywhere.
- **Security:** RLS on every table — each role sees only what it needs; documents/media in private buckets. Mobile-first, low-bandwidth.

---

## 12. Scope — build order & gates

**Build order (golden rule: build the piece that earns first; thin vertical slice before widening):**
1. Supabase data model + RLS + storage. 2. AI agent on n8n (the sales demo). 3. Seller dashboard. 4. Landing + buyer site (`/` public, login at `/login`, `proxy.ts` gates the rest). 5. **Auth & routing** (`user_roles`, `/apres-connexion`, `/choisir-espace`, `proxy.ts` role guards). 6. Transaction & verification (séquestre orchestration). 7. **Mustaf** (§8) + admin/employee spaces (§5).

**Mustaf sequencing:** prove it on **3–5 real houses by hand** first (anti-fraud R&D); build the dashboard as the thin slice supporting them. First milestone: 1 project, 1 family (3 contributors), 4 phases, foundation funded → verified → released.

**Do NOT build yet:**
- ❌ Real money / banking / payment — **simulate** séquestre & deposits (no integration until legal validation).
- ❌ Mark seed data as *Vérifié* as if real.
- ❌ Ownership shares (participation % + disclaimer only, §3.12).
- ❌ Mixing funds/materials between projects (§3.13).
- ❌ One user both certifying and releasing a phase (§3.10).
- ❌ Granting `admin`/`employee` via public sign-up.
- ❌ "Build-to-rent group" / collective-investment feature (needs a lawyer). No internal materials resale.