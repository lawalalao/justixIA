---
name: ui-design
description: Design system for JustiXia. Use when creating or modifying any user-facing HTML/CSS so the site stays visually consistent. Triggers on: new pages, UI components, restyling, color/typography decisions, dark-mode work, button/card/form styling. Enforces no-gradient, no-slop visual rules.
---

# JustiXia UI Design System

A calm, mature, human-friendly visual language for a legal-aid product. Two themes (light + dark), one set of tokens, zero gradients.

## When to use this skill

Invoke whenever the work touches user-facing markup or styles — new pages, redesigns, component additions, color or typography choices, dark-mode fixes. If you are about to write inline CSS that defines colors, fonts, radii, or shadows, stop and use the shared tokens instead.

## Core principles

1. **Plain colors, no gradients.** Solid fills only. No `linear-gradient`, no `radial-gradient`, no rainbow borders, no glow shadows in brand colors.
2. **Tokens, not literals.** Every color/space/radius/shadow comes from a CSS variable in `/styles/tokens.css`. Never hardcode `#xxxxxx` in a page.
3. **Two themes from one truth.** `[data-theme="dark"]` overrides the same variables. Components stay theme-agnostic.
4. **Easy on the eyes.** Off-white in light mode (`#FAFAF7`, not `#FFFFFF` body). Tinted near-black in dark mode (`#0E1514`, not `#000000`). Muted accents over saturated.
5. **Accessibility is non-negotiable.** WCAG AA contrast (≥4.5:1 body, ≥3:1 large text/icons). Visible focus ring. `prefers-reduced-motion` respected.

## Palette

**Primary — teal `#0E7C66`** (light) / `#5FB8A2` (dark). CTAs, active states, focus, primary links.
**Secondary — rose `#FF2D78`** (both themes, used flat). Brand accent, badges, occasional highlights. Never as a CTA bg.
**Neutrals**: see `tokens.css` for the full scale.
**Status**: success `#15803D`, warning `#B45309`, danger `#B91C1C` (light); slightly lifted in dark.

Full token list lives in `/styles/tokens.css` — that file is the source of truth. If a token you need is missing, add it there, don't inline it.

## Typography

- **Headings**: `Fraunces` (variable serif, weight 500–700, slight optical-size adjustment). Loaded from Google Fonts.
- **Body / UI**: `Inter` (weight 400–700). Multi-script: covers French, Arabic, Romanian, Portuguese, Spanish, Wolof.
- **Mono**: system mono stack (no extra font request).

Scale (via tokens):
- `--fs-xs` 12px · `--fs-sm` 14px · `--fs-base` 16px · `--fs-lg` 18px · `--fs-xl` 22px · `--fs-2xl` 28px · `--fs-3xl` 36px · `--fs-4xl` 48px

Headings use Fraunces; everything else Inter. Don't mix.

## Spacing & layout

4-based scale: `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 24 · `--sp-6` 32 · `--sp-7` 48 · `--sp-8` 64.

Container: `max-width: 1200px`, `padding: 0 var(--sp-6)`.

## Radius & elevation

- `--radius-sm` 8px (inputs, small chips)
- `--radius-md` 12px (cards on mobile, buttons not pill)
- `--radius-lg` 16px (cards)
- `--radius-pill` 9999px (CTA buttons, badges)

Shadows are neutral (black with low alpha), never colored:
- `--shadow-sm` `0 1px 2px rgba(0,0,0,0.04)`
- `--shadow-md` `0 2px 12px rgba(0,0,0,0.06)`
- `--shadow-lg` `0 8px 28px rgba(0,0,0,0.10)`

In dark mode, shadows fade (alpha lowered) and a subtle border carries the elevation.

## Components

All available in `/styles/components.css`. Use the classes; don't rebuild.

- `.btn` + modifier (`.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`)
- `.card`
- `.input`, `.textarea`, `.select`, `.field` (wrapper)
- `.alert` + status modifier (`.alert-info`, `.alert-success`, `.alert-warning`, `.alert-danger`)
- `.badge` + modifier
- `.nav` (sticky header)
- `.theme-toggle` (sun/moon icon button)

## Dark mode

- Default theme follows OS via `prefers-color-scheme`.
- User can override via the `.theme-toggle` button — choice persists in `localStorage` (`jx_theme` = `light` | `dark` | `auto`).
- Implementation: `/styles/theme.js` sets `data-theme` on `<html>` early to avoid flash.
- All pages must `<link>` tokens.css + components.css and `<script>` theme.js (in `<head>`, before any rendering).

## Required boilerplate for every page

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>...</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles/tokens.css" />
  <link rel="stylesheet" href="/styles/components.css" />
  <script src="/styles/theme.js"></script>
</head>
```

## DO NOT (anti-slop checklist)

- No `linear-gradient` / `radial-gradient` / `conic-gradient` for **brand colors or decoration**. The single exception: an alpha-only fade (transparent → semi-opaque of the same neutral color) used purely for legibility — e.g. caption overlay on a photo, paywall fade-out on locked text. Never use a gradient that introduces a new hue or that carries visual identity.
- No colored shadows (no pink glow, no teal glow). Shadows are black/transparent only.
- No `backdrop-filter: blur(...)` "glass" effects layered on brand colors.
- No `text-shadow` on body copy.
- No emoji as functional icons. Use SVG (inline or imported). Emoji is OK in user content, never in chrome.
- No font weights above 800.
- No multi-color borders, no animated borders.
- No `letter-spacing` larger than 0.08em except on small uppercase labels.
- No more than 2 typefaces total (Fraunces + Inter).
- No inline `<style>` blocks in pages once migrated. Page-specific styles go in a `<style>` block only if truly local (one-off layout); colors/typography always come from tokens.
- No hardcoded hex colors in HTML files. Always `var(--…)`.
- No hover effects that scale > 1.02 or move > 2px.

## Migration checklist (per page)

When converting an existing page to the system:

1. Add the boilerplate `<link>` + `<script>` tags above to `<head>`.
2. Delete the page-local `:root { … }` block.
3. Replace all hardcoded colors with `var(--…)`. If a token is missing, add it to `tokens.css` first.
4. Replace `.btn-pink` / pink gradients with `.btn-primary` (teal solid) — secondary actions become `.btn-secondary` (rose flat) only when they're brand moments, otherwise `.btn-ghost`.
5. Replace local `.card` / `.input` / `.alert` styles with the shared classes; delete the duplicates.
6. Add the `<button class="theme-toggle">` in the nav.
7. Test light + dark visually. Tab through to confirm focus rings.
