---
name: frontend-design
description: Create distinctive, production-grade MatchTable web UI (React 19, TanStack Start, CSS Modules). Use when building pages, components, or visual polish for apps/web — avoids generic AI aesthetics and respects MatchTable brand (Table Card, editorial luxury, zh-CN).
---

This skill guides creation of distinctive, production-grade **MatchTable** web interfaces. Implement real working code aligned with the repo stack — not generic templates or wrong frameworks (no Flutter, Next.js, Tailwind-first layouts).

The user provides UI requirements: a route, feature screen, or component. They may include purpose, audience, or references (e.g. Radix Themes marketing pages).

**Read first when relevant:** `docs/prd/11-ui-design.md`, `.cursor/rules/matchtable-stack.mdc`, `packages/ui/src/styles/tokens.css`.

## Design thinking

Before coding, understand context and commit to a **clear** aesthetic direction:

- **Purpose**: MatchTable — structured dating profiles, discover, compare, connect. Who uses it and what action is primary?
- **Tone**: **Editorial luxury** (PRD default) — light, minimal, premium, magazine-like. Not pink dating-site clichés, not matchmaker/red-introduction style, not heart spam.
- **Constraints**: MatchTable tech stack (below). User-visible text **简体中文**; code/comments **English**.
- **Differentiation**: **Table Card** as the memorable brand unit — structured table rows for profile fields, not generic social cards.

Then implement working React code that is production-grade, cohesive, and refined.

## MatchTable tech stack (mandatory)

| Area          | Use                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| App           | `apps/web` — TanStack Start, file routes in `src/routes/`                                                            |
| Toolchain     | Vite+ — `vp dev apps/web`, `vp build`, `vp check`                                                                    |
| UI library    | `packages/ui` — `Button`, `Card`, `Input`, `TableCard`, `CompareTable`, `Badge`, `Separator`                         |
| Styling       | **CSS Modules** (`*.module.css`) per component; shared page utilities in `apps/web/src/styles/global.css`            |
| Design tokens | `packages/ui/src/styles/tokens.css` — use `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--font-serif)` |
| Forms         | TanStack Form + Zod (`@matchtable/shared` schemas)                                                                   |
| Data          | TanStack Query → Server Functions → Supabase (no client-side Supabase mutations from pages)                          |
| Motion        | `motion` package when needed; prefer purposeful transitions, not noise                                               |

**Do not use:** Next.js, Remix, React Hook Form, Redux/Zustand, Tailwind as primary styling, `useEffect` + `fetch` for server data, TypeScript `any`.

## Visual system

### Brand components

- **TableCard** (`@matchtable/ui`) — default for profile previews/lists; photo + category + nickname + field table.
- **CompareTable** — multi-column compare; pin “我” column when applicable.
- **HeroBackground** — global fixed mesh in `__root.tsx`; do not duplicate per-page gradients.
- **Frosted panels** — auth/login: `backdrop-filter` + semi-transparent white (e.g. `.authFrostedPanel`), not liquid-glass SVG displacement unless explicitly requested.

### Typography

- **Sans** — UI, forms, tables (`var(--font-sans)`, PingFang / system).
- **Serif** — hero/marketing headlines only (`var(--font-serif)`, Source Serif 4); not for dense data tables.
- Clear hierarchy: page title → section title → body → captions (`pageTitle`, `pageSubtitle` in global.css).

### Color & surfaces

- Default **light** UI; optional dark via tokens `[data-theme='dark']`.
- Accent: high-contrast charcoal buttons (`--color-accent`); soft gray surfaces (`--color-surface-soft`).
- Teal mesh accents on hero background only; avoid purple-gradient “AI landing” palettes.
- Cards: inset panel shadow (`--shadow-card`, `--shadow-inset-panel`) on mesh backgrounds.

### Layout

- Feature-first: `apps/web/src/features/<name>/` for feature UI; thin route files in `src/routes/`.
- Home hero: left copy + right showcase (TableCard / compare / discover previews), max-width ~1280px, no broken flex columns.
- Discover/detail: responsive grids; `TableCard` in `global.css` `.grid`.

### Motion

- Subtle: tab switches, card hover (`translateY(-1px)` on TableCard links), form errors.
- One strong entrance on marketing hero is enough; avoid stagger overload.

## Implementation checklist

1. Reuse `@matchtable/ui` primitives — extend in `packages/ui` only when shared across apps.
2. New component styles → co-located `*.module.css`; page-only helpers → `global.css` with clear names (`homeFeatured`, `authFrostedPanel`).
3. Routes: `createFileRoute`, loaders for data, `head()` + `seo()` for meta.
4. Auth screens: `authCard` wrapper width; frosted inner panel; `AuthMethodTabs` + feature forms.
5. Run `vp check` after UI changes — zero ESLint/Oxlint warnings.

## Aesthetics — avoid

- Generic AI slop: Inter-only everywhere, purple gradients, rounded-everything SaaS clone.
- Pink hearts, red “matchmaker” banners, traditional blind-date site layouts.
- Ecommerce product cards for profile data when **TableCard** is the correct pattern.
- Copying Radix marketing **ecommerce demo** verbatim — adapt **business** (profiles, compare, discover).

## References (inspiration, not copy-paste)

- Product tone: Linear, Raycast, Stripe, Notion (light default).
- Radix Themes site: glass inset cards, serif hero, mesh background — **layout language only**; implement with CSS Modules + tokens.

Match implementation complexity to the vision: editorial minimalism needs precise spacing and typography; richer marketing sections need deliberate layout and one strong visual motif (mesh + TableCard wall).
