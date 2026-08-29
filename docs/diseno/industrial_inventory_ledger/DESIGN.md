---
name: Industrial Ledger
colors:
  surface: '#f8faf6'
  surface-dim: '#d8dbd7'
  surface-bright: '#f8faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f1'
  surface-container: '#eceeeb'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e1e3e0'
  on-surface: '#191c1b'
  on-surface-variant: '#404944'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#eff1ee'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2d6955'
  primary: '#002f22'
  on-primary: '#ffffff'
  primary-container: '#004735'
  on-primary-container: '#79b59d'
  inverse-primary: '#96d3ba'
  secondary: '#605e57'
  on-secondary: '#ffffff'
  secondary-container: '#e3dfd6'
  on-secondary-container: '#65635b'
  tertiary: '#471a13'
  on-tertiary: '#ffffff'
  tertiary-container: '#622f27'
  on-tertiary-container: '#df978b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b2efd6'
  primary-fixed-dim: '#96d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#10503e'
  secondary-fixed: '#e6e2d9'
  secondary-fixed-dim: '#cac6bd'
  on-secondary-fixed: '#1d1c16'
  on-secondary-fixed-variant: '#484740'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#370e08'
  on-tertiary-fixed-variant: '#6d382f'
  background: '#f8faf6'
  on-background: '#191c1b'
  surface-variant: '#e1e3e0'
  surface-bg: '#F7F6F3'
  border-fine: '#E3E1DC'
  error-alert: '#ba1a1a'
  status-available: '#004735'
  navigation-active: '#1f5f4b'
typography:
  page-title:
    fontFamily: IBM Plex Sans
    fontSize: 19px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  card-title:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-base:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  data-mono:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 18px
  indicator:
    fontFamily: IBM Plex Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  metadata:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
---

## Brand & Style

The brand identity is rooted in **Corporate Pragmatism**. It is designed for high-efficiency wholesale environments where data density and legibility are paramount. The aesthetic is "Functional Minimalism"—eschewing decorative flourishes in favor of a structured, reliable, and systematic interface. 

The emotional response should be one of **order, precision, and institutional trust**. It utilizes a "Fine-Line" utility style, characterized by thin borders, a muted professional palette, and a clear hierarchy that prioritizes rapid information scanning over visual flair.

## Colors

The color system employs a "Forest Professional" palette. The primary brand color is a deep, stable green (#004735) used for essential actions and status indicators, symbolizing growth and reliability. 

The neutral foundation uses a warm "Parchment" gray (#F7F6F3) for backgrounds to reduce eye strain during long working sessions, moving away from harsh pure whites. Accent colors are strictly functional: a muted secondary gray for metadata and a sharp red for urgent attention. Surface transitions are subtle, utilizing a tiered container system to differentiate content areas without heavy shadows.

## Typography

The system utilizes **IBM Plex Sans** as its primary typeface to evoke a technical, engineering-focused feel. It is supplemented by **IBM Plex Mono** for SKUs, prices, and quantities to ensure character alignment and a "data-first" appearance.

The type hierarchy is dense. Small caps are used for section labels to provide structure without requiring large font sizes. Tabular figures (`tnum`) must be enabled globally to ensure that numerical data remains aligned in vertical lists.

## Layout & Spacing

The layout follows a **Fixed-Width Centered** approach for larger screens (max-width 1240px) and a fluid layout for mobile. 

The vertical rhythm is tight, using a 4px baseline. Most components utilize `p-3` (12px) or `p-2` (8px) internal padding to maintain a high information density suitable for professional tools. Gutters are fixed at 16px. On mobile, the interface uses a persistent Bottom Navigation Bar (64px height) and a slim Top App Bar (56px) to maximize the vertical scroll area for product lists.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layering and Fine Borders**. 

Depth is communicated through:
1.  **Surface Tiers:** The background uses a base neutral (#F7F6F3), while interactive cards and containers use a brighter "Surface" color (#FFFFFF).
2.  **Fine-Line Outlines:** Every container is defined by a 1px solid border (#E3E1DC). This creates a "grid-paper" feel that feels organized and tactile without the "mushiness" of soft shadows.
3.  **Active States:** Interactive elements use subtle background color shifts (e.g., `surface-container-high`) rather than lifting off the page.

## Shapes

The shape language is **Soft-Geometric**. A base radius of 4px (`rounded`) is used for standard inputs and small containers. Larger "Feature Cards" and Navigation elements use an 8px (`rounded-lg`) or 12px (`rounded-xl`) radius to provide a slight modern friendliness without appearing "bubbly." Functional status dots and icon buttons are perfectly circular to distinguish them from structural content.

## Components

-   **Indicators:** Large-format stat blocks with `label-caps` headers and `indicator` value text. Must include a 1px border.
-   **Product Cards:** Horizontal layout featuring a 48px square thumbnail with `rounded-md` corners. SKU data must use the Mono typeface.
-   **Status Badges:** Small 8px circular indicators placed next to `metadata` text. Colors are semantic (Green = Available, Red = Attention).
-   **Bottom Navigation:** Uses a "Selected Pill" background for the active state (12px radius). Icons are Material Symbols Outlined, 24px.
-   **Action Buttons:** Flat style with `rounded-full` for icon-only buttons. Hover states should be a subtle shift to `surface-container-high`.
-   **Dividers:** Minimalist 1px lines using the `outline-variant` color to separate list items or header sections.