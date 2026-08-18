---
name: Serene Editorial
colors:
  surface: '#121412'
  surface-dim: '#121412'
  surface-bright: '#373a37'
  surface-container-lowest: '#0c0f0d'
  surface-container-low: '#1a1c1a'
  surface-container: '#1e201e'
  surface-container-high: '#282b28'
  surface-container-highest: '#333533'
  on-surface: '#e2e3df'
  on-surface-variant: '#c1c8c1'
  inverse-surface: '#e2e3df'
  inverse-on-surface: '#2f312f'
  outline: '#8b938c'
  outline-variant: '#414943'
  surface-tint: '#a4d1b6'
  primary: '#c4f1d5'
  on-primary: '#0c3825'
  primary-container: '#a8d5ba'
  on-primary-container: '#345d48'
  inverse-primary: '#3d6751'
  secondary: '#6bdba2'
  on-secondary: '#003822'
  secondary-container: '#2ca470'
  on-secondary-container: '#00311d'
  tertiary: '#ffe0e0'
  on-tertiary: '#4e2427'
  tertiary-container: '#fcbabd'
  on-tertiary-container: '#79474b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#bfedd1'
  primary-fixed-dim: '#a4d1b6'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#254f3a'
  secondary-fixed: '#88f8bd'
  secondary-fixed-dim: '#6bdba2'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#005233'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#f7b6b9'
  on-tertiary-fixed: '#340f13'
  on-tertiary-fixed-variant: '#68393d'
  background: '#121412'
  on-background: '#e2e3df'
  surface-variant: '#333533'
  deep-forest: '#0B301B'
  surface-dark: '#16442C'
  accent-gold: '#FFB800'
  off-white: '#F4F7F5'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.01em
  display-md:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 24px
  margin-desktop: 64px
  gutter: 16px
  touch-target: 64px
  section-gap: 48px
  element-gap: 16px
---

## Brand & Style

This design system evolves the "Accessible Greenery" foundation into a sophisticated, **Editorial Modern** aesthetic. It blends the calm, trustworthy nature of organic greens with the high-contrast, high-fashion impact seen in contemporary portfolio and lifestyle design. The personality is authoritative yet approachable, shifting from a purely corporate utility to a more distinctive, curated experience.

The visual narrative is defined by:
- **Sophisticated Boldness:** Utilizing high-contrast serif typography to create a sense of heritage and confidence.
- **Intentional Negative Space:** Large margins and clear separation between content blocks to ensure information is digestible and accessible.
- **Tactile Digitalism:** A dark-mode first approach that feels like a premium print publication, using color and typography to guide the user's focus without unnecessary decorative elements.

## Colors

The palette maintains the accessibility-first "Greenery" logic while introducing gold accents for high-impact visual interest, as seen in the reference material.

- **Primary (Soft Mint - #A8D5BA):** The main interactive color, providing peak legibility against dark backgrounds.
- **Secondary (Emerald - #008F5D):** Used for supporting UI elements and branding moments.
- **Deep Forest (#0B301B):** The foundation and background color, creating a rich, low-strain canvas.
- **Surface Dark (#16442C):** Used for elevated containers and card backgrounds to create subtle depth.
- **Off-White (#F4F7F5):** The primary text color, ensuring WCAG AAA compliance and a crisp reading experience.
- **Accent Gold (#FFB800):** Reserved for high-priority highlights, small badges, or decorative iconography to draw immediate attention.

## Typography

The typography system is the core of this design system's character. It uses a high-contrast serif, **Playfair Display**, for all display and headline roles to evoke an editorial, premium feel. This is paired with **Lexend**, chosen for its extreme legibility and "hyper-readable" characteristics, ensuring body text remains accessible at all times.

**Accessibility Rules:**
- **Minimum Body Size:** No body text falls below 18px to support users with visual impairments.
- **Weight:** Headlines utilize "Bold" and "ExtraBold" weights (700-800) to ensure a strong visual hierarchy even on small screens.
- **Line Height:** Generous line heights are applied to body text (1.5x - 1.6x) to prevent crowding and improve tracking for readers with dyslexia or low vision.

## Layout & Spacing

The layout follows a **Fluid Grid** model with an emphasis on vertical rhythm and touch-target accessibility.

- **Grid Model:** 12-column grid for desktop, 4-column for mobile.
- **Safe Margins:** A strict 24px margin on mobile prevents content from feeling cramped and protects interactive areas from accidental screen-edge triggers.
- **Touch Targets:** Every interactive element must adhere to a 64px minimum height/width. This exceeds standard guidelines to provide a "massive" target area for users with motor-skill challenges.
- **Vertical Rhythm:** A strict 8px baseline grid is used. Sections are separated by 48px to create a clear visual distinction between different content topics.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** rather than traditional shadows, which often muddy the colors in dark-mode interfaces.

- **The Layering Rule:** Darker colors are "further away," while lighter greens are "closer." 
  - `Deep Forest` is the base layer.
  - `Surface Dark` is used for primary cards and floating containers.
- **Luminance Border:** Instead of drop shadows, containers use a subtle 1px border in a slightly lighter shade of green or the secondary Emerald to define their silhouette.
- **Glassmorphism:** For top-level navigation bars or persistent mobile headers, a 20px backdrop blur with a 60% opacity Deep Forest fill is used to maintain context while ensuring legibility.

## Shapes

The shape language is **Rounded**, leaning towards a friendly and modern feel. 

- **Standard Radius (16px):** Used for all primary buttons, input fields, and standard cards.
- **Large Radius (24px):** Applied to major content sections or bottom-sheet components to signal they are "containers" of information.
- **Pill (Full):** Used exclusively for chips and badges to distinguish them from actionable buttons.

## Components

### Buttons
Primary buttons utilize the `Soft Mint` background with `Deep Forest` text. They are always 64px in height with a 16px radius. Typography inside buttons uses `label-lg` for maximum clarity.

### Input Fields
Fields use the `Surface Dark` background with a 1px `Emerald` border that thickens to 2px on focus. Labels must be persistent (top-aligned) and never replaced by placeholder text to ensure cognitive accessibility.

### Cards & Lists
Cards use `Surface Dark` to lift content from the `Deep Forest` background. Internal padding is a generous 24px. List items maintain a 64px height and utilize an `Accent Gold` indicator or icon to highlight interactivity.

### Chips & Tags
Pill-shaped containers with a 40px height. They use high-contrast text and a semi-transparent `Emerald` background to remain distinct but secondary to main actions.

### Accessibility Highlights
All components are designed for a "thumb-driven" mobile experience. Primary CTAs are always placed within the bottom 40% of the screen where possible to minimize reach-strain.