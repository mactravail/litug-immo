# CLAUDE.md — Litug *(working title — replace with the real brand name)*

> Project context for Claude Code. **Read this first, every session.**
> This file is the single source of truth for what we are building and the rules that must never be broken.

---

## 1. What we're building

A **trust-first platform** that lets the Senegalese diaspora buy land and houses in Senegal **without getting scammed**, and follow through all the way to a finished house.

Land fraud (fake titles, the same plot sold to several buyers, phantom plots) is the core pain. **Our product is not "listings" — our product is TRUST.** Everything we build must reinforce that trust or it does not belong here.

**Revenue model (context, not all built at once):**
- **Sellers** pay a subscription → get the AI WhatsApp agent (filters/qualifies buyers) + a dashboard to manage their listings (for sale / sold) + collect verified buyer testimonials.
- **Buyers** pay for **verification** (real check via our notaire/géomètre at the Conservation Foncière).
- **Transaction fee** via the notaire's **séquestre** (escrow).
- **Construction** funnel downstream: free render → paid architect plan → construction paid by milestone.

---

## 2. Who it's for

- **Buyers:** Senegalese diaspora (Europe, esp. Italy & France). Scam-averse, emotional, high-value decisions, almost entirely on **mobile + WhatsApp**, **French-speaking**.
- **Sellers:** individual land sellers and *promoteurs*. Some have large social audiences (TikTok/Instagram) used as a **distribution + testimonial channel**.

---

## 3. The product is TRUST — non-negotiable rules

These are business-critical guardrails. Never violate them, even if asked to "simplify".

1. **"Vérifié" is sacred.** A listing may be marked *Vérifié* **only** after a real check by our notaire/géomètre at the **Conservation Foncière** (and Cadastre for boundaries). Never infer "verified" from a document photo alone.
2. **Show the source of trust.** A verified badge must always display **which notaire**, **the date**, and **the registry checked**. Precise claims only — e.g. *"Vérifié à la Conservation Foncière le 12/03/2026"*, never *"garanti à vie"* or any absolute guarantee.
3. **Radical transparency on every listing.** Every plot shows its document-type badge whether verified or not: 🟢 Titre Foncier · 🟡 Bail · 🔴 Délibération · ⚪️ Non vérifié. **Never hide or soften an unverified status.**
4. **Money is held by the NOTAIRE, never by us.** Transaction funds sit in the notaire's **séquestre** account. The platform orchestrates; the notaire custodies. Funds release to the seller **only when the mutation (title transfer) is registered in the buyer's name.**
5. **Construction is paid by milestone, not by calendar.** Funds release per milestone (foundations → walls → roof …) confirmed by **on-site photo/video from our géomètre**.
6. **Testimonials must be real.** A testimonial is only valid if linked to a **completed on-platform transaction**.
7. **Sold ≠ deleted.** Sold listings stay visible, marked **Vendu**, to deter the same plot being sold twice.

---

## 4. Tech stack

- **Supabase** — Postgres database, Auth, Storage (documents/photos), **Row Level Security**.
- **n8n** (self-hosted on Hostinger VPS) — the automation orchestrator. Connects **WhatsApp ↔ Claude (Anthropic API) ↔ Supabase**.
- **WhatsApp Business API via a BSP provider** (e.g. 360dialog or Gupshup). ⚠️ **Never use unofficial WhatsApp automation — it gets numbers banned.** Use the provider's sandbox number for the demo.
- **Anthropic API (Claude)** — the brain of the conversational agent, called from n8n.
- **Frontend** — Next.js (App Router) + Tailwind CSS + the Supabase JS client. Mobile-first.
- **Hostinger** — VPS hosting for n8n + the web app.

---

## 5. Architecture

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

- The AI runs the buyer conversation; the **human seller is only pulled in for serious buyers**.
- The frontend talks to Supabase directly through the client, protected by RLS.

---

## 6. Data model (high level — detailed in Phase 0)

Core entities (English names in code/DB):

- **sellers** — account, subscription status, profile, social handles.
- **lands** — seller_id, type (`tf` | `bail` | `deliberation`), price, zone, photos, status (`available` | `sold`), verification status + verifying notaire + verification date.
- **leads / buyers** — budget, desired zone, desired document type, source.
- **conversations** — WhatsApp messages the AI logs, linked to a lead.
- **transactions** *(later)* — séquestre status, linked land + buyer + notaire.
- **testimonials** *(later)* — linked to a completed transaction.
- Supabase **Storage** buckets for documents and photos.

---

## 7. Build roadmap — *build in the order we will sell*

> **Golden rule:** build the piece that earns first. Build a **thin vertical slice** end-to-end before widening anything.

- **Phase 0 — CURRENT: Supabase data model.** Tables, fields, relations, RLS, storage buckets.
- **Phase 1 — AI agent on n8n.** The demo / sales hook: WhatsApp → Claude qualifies → reads Supabase → replies → saves lead. *This conversation is the sales demo for sellers.*
- **Phase 2 — Seller dashboard (frontend).** Add/edit plots, upload docs/photos, see captured leads, see verification badges, collect testimonials.
- **Phase 3 — Landing page + buyer-facing site (STARTED).** The trust story, verified listings, badges, testimonials, "how it works". The public landing **is the home page** (`/`, `app/page.tsx`) — bilingual FR/EN, mobile-first. Login/dashboard live behind the **"Se connecter"** link (`/login`); `proxy.ts` keeps `/` public and gates the protected routes.
- **Phase 4 — later:** verification request + payment flow, notaire séquestre, architect/construction funnel.

**First milestone target:** 1 seller, 3–4 real plots in Supabase, the AI answering on WhatsApp, 1 lead saved. Make *that* work fully, then scale.

---

## 8. Design system — **palette "Sahel"** (single source of truth)

Sober, clean, premium. Whitespace is the elegance. **One palette across the whole product** — the landing page, the seller dashboard, and the auth pages all share the same tokens. The canonical tokens live in `app/globals.css` (`:root` + Tailwind `@theme`); `app/landing.css` inherits them and only adds optional palette/font *variants* for the design-exploration panel.

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

**Typography (Google Fonts):**
- Headings / display: **Space Grotesk** (`--font-space-grotesk` → `--font-display`).
- Body & dashboard: **Manrope** (`--font-manrope` → `--font-sans`).
- *(Fraunces / Inter from the old system are retired — do not reintroduce them.)*

**Layout rules:**
- ~60% whitespace, ~30% text/structure, accent colors sparing.
- **Mobile-first — non-negotiable.** **>80% of visitors are on phones** with variable bandwidth: design for 360–390px first, compress images, keep the font payload small, keep it fast.

---

## 9. Domain glossary (Senegal land)

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

---

## 10. Conventions

- **Language — non-negotiable: the entire user-facing product is in French.** This includes the landing page, the seller dashboard, all buttons/labels/badges (e.g. *Vérifié*, *Vendu*, *Non vérifié*), emails, error messages, and the AI agent's WhatsApp replies (the agent may sprinkle light Wolof for warmth). **Never ship user-facing English copy.**
  - **Code stays in English** — table names, field names, variables, comments. This is internal only and never shown to users. Keep the two layers strictly separate.
- **Currency:** FCFA (XOF) primary; show an EUR equivalent for the diaspora.
- **Secrets:** environment variables only — Anthropic key, Supabase `service_role` key, BSP/WhatsApp token. **Never commit secrets.** The `service_role` key lives server-side (n8n) only, never in the frontend.
- **Security:** enable **RLS on every Supabase table**. A seller can read/write only their own rows. Documents in private storage buckets.
- **Performance:** mobile-first, low-bandwidth-friendly.

---

## 11. Current scope — do NOT build yet

- ❌ No real money handling / séquestre code yet.
- ❌ No verification payment flow yet.
- ❌ No construction module yet.
- ❌ Do not mark seed/demo data as *Vérifié* as if it were a real check.

Stay focused on the vertical slice (Phase 0 → Phase 1).
