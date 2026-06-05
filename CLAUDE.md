# CLAUDE.md — TerreVérifiée *(working title — replace with the real brand name)*

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
- **Phase 3 — Landing page + buyer-facing site.** The trust story, verified listings, badges, testimonials, "how it works".
- **Phase 4 — later:** verification request + payment flow, notaire séquestre, architect/construction funnel.

**First milestone target:** 1 seller, 3–4 real plots in Supabase, the AI answering on WhatsApp, 1 lead saved. Make *that* work fully, then scale.

---

## 8. Design system

Sober, clean, premium. Whitespace is the elegance.

**Colors (design tokens):**
```
--bg:     #FAFAF8   /* warm white — base surface */
--text:   #1A1A1A   /* charcoal — never pure black */
--muted:  #6B6B66   /* warm gray — secondary text, borders */
--accent: #15573F   /* deep green — TRUST. Verified badges, CTAs, security signals ONLY */
--gold:   #C9A86A   /* rare premium accent — tiny doses only */
```
- **Green is reserved.** Use it only on the verified badge, primary CTAs, and security signals. Its power comes from being rare (≤10% of the surface).

**Typography (Google Fonts):**
- Headings: **Fraunces** (serif). Fallbacks: Lora / Libre Baskerville.
- Body & dashboard: **Inter**.

**Layout rules:**
- ~60% whitespace, ~30% text/structure, **≤10% green**.
- **Mobile-first.** Most users are on phones with variable bandwidth — compress images, keep it fast.

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
