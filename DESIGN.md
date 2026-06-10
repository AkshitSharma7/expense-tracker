# Design Brief

## Direction

Expense Tracker — Premium fintech minimalism with clean hierarchy, trustworthy dark sidebar, and purposeful blue-purple accents for financial clarity and control.

## Tone

Calm and authoritative — a refined financial interface that prioritizes clarity and confidence over decoration.

## Differentiation

Accent blue-purple (#3D5AFE/268°) reserved strictly for interactive elements and progress states, creating visual focus without oversaturation in an otherwise neutral palette.

## Color Palette

| Token          | OKLCH           | Role                                |
| -------------- | --------------- | ----------------------------------- |
| background     | 0.9775 0.002    | Main content area, light neutral    |
| foreground     | 0.22 0.04 271   | Body text, high contrast            |
| card           | 1.0 0 0         | Card backgrounds, white             |
| accent         | 0.55 0.22 275   | Buttons, active states, highlights  |
| primary        | 0.52 0.16 268   | Secondary interactive, links        |
| muted          | 0.88 0.01 200   | Disabled, subtle backgrounds        |
| sidebar        | 0.152 0.04 271  | Navigation zone, dark navy          |
| destructive    | 0.55 0.22 25    | Errors, delete actions, warnings    |

## Typography

- Display: General Sans — navigation, headers, category labels (strong, geometric sans-serif)
- Body: DM Sans — body text, transaction descriptions, UI labels (warm, humanist sans-serif)
- Mono: Geist Mono — transaction IDs, amounts, data values
- Scale: h1 `text-3xl font-display font-bold`, h2 `text-xl font-display font-semibold`, label `text-sm font-body font-medium`, body `text-base font-body font-normal`

## Elevation & Depth

Subtle shadow hierarchy: cards use `shadow-card` (2px blur), modals use `shadow-elevated` (10px blur), with intentional surface layering via background color shifts rather than aggressive elevation.

## Structural Zones

| Zone        | Background        | Border              | Notes                                |
| ----------- | ----------------- | ------------------- | ------------------------------------ |
| Sidebar     | sidebar (navy)    | sidebar-foreground  | Fixed left nav, 200px, white text   |
| Header      | background        | border (subtle)     | Top controls, search, export buttons |
| Content     | background        | —                   | Light, card-based info grouping      |
| Card panels | card (white)      | border              | Transaction history, summaries      |
| Footer      | muted (pale grey) | border-top          | Summary stats, pagination           |

## Spacing & Rhythm

16px inter-section gaps, 20px padding inside cards, 8px micro-spacing for form controls; alternating row backgrounds (#FFFFFF and #F9FAFB) for table clarity without visual chaos.

## Component Patterns

- Buttons: `rounded-lg`, `bg-accent`, `hover:bg-primary` with `transition-smooth`
- Cards: `bg-card` `rounded-lg` `border border-border` `shadow-card`, 20px padding
- Badges: Small `rounded-md`, semantic colors (success green, warning red), uppercase labels
- Nav items: `sidebar-nav-item` base class, `.sidebar-nav-active` for current route highlight

## Motion

- Entrance: 0.3s fade-in + 0.3s slide-in-from-left for list items, modals
- Hover: `transition-smooth` (0.3s cubic-bezier) on all interactive elements
- Decorative: Gentle pulse on alerts, slide transitions between dashboard views

## Constraints

- No full-page gradients; use solid colors with intentional surface shifts instead
- Limit chart colors to 5 defined palette values (--chart-1 through --chart-5)
- Accent color reserved for primary CTAs and active states only; use muted for disabled states
- All interactive elements must have visible `:hover` and `:focus` states for accessibility

## Signature Detail

Accent blue (#3D5AFE) as a focused control signal — appears on the primary action button, active nav highlight, and progress bars, creating psychological clarity without visual noise in a primarily neutral interface.

---

**Fonts**: General Sans (display, nav), DM Sans (body), Geist Mono (data)  
**Theme**: Light-mode default with dark-mode class support  
**Chart colors**: 5-color palette for consistent financial visualizations  
**Sidebar state**: Active nav item highlighted with accent blue background and white text
