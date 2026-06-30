---
name: QuickSplit
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#40484e'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#70787f'
  outline-variant: '#bfc7cf'
  surface-tint: '#00658e'
  primary: '#00658e'
  on-primary: '#ffffff'
  primary-container: '#7fcdff'
  on-primary-container: '#00577b'
  inverse-primary: '#85cfff'
  secondary: '#4c6269'
  on-secondary: '#ffffff'
  secondary-container: '#cce4ec'
  on-secondary-container: '#50666d'
  tertiary: '#4552c3'
  on-tertiary: '#ffffff'
  tertiary-container: '#bac0ff'
  on-tertiary-container: '#3744b4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7e7ff'
  primary-fixed-dim: '#85cfff'
  on-primary-fixed: '#001e2e'
  on-primary-fixed-variant: '#004c6c'
  secondary-fixed: '#cfe7ee'
  secondary-fixed-dim: '#b3cad2'
  on-secondary-fixed: '#071e24'
  on-secondary-fixed-variant: '#344a51'
  tertiary-fixed: '#dfe0ff'
  tertiary-fixed-dim: '#bdc2ff'
  on-tertiary-fixed: '#000965'
  on-tertiary-fixed-variant: '#2b38aa'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  container-max: 1200px
---

## Brand & Style

The design system is engineered to feel premium, intelligent, and effortlessly efficient. It targets a modern, tech-savvy audience that values speed and precision in financial transactions. The personality is "Trustworthy Innovation"—combining the stability of traditional finance with the fluidity of AI-driven automation.

Visual movements used in this design system:
- **Glassmorphism:** Applied sparingly for navigation bars and secondary overlays to create a sense of depth and lightness.
- **Modern Minimalism:** Utilizing generous whitespace and a "less is more" approach to data visualization.
- **Tactile Softness:** Elements use significant corner rounding and soft, multi-layered shadows to feel approachable and physically present.

The UI should evoke a sense of calm control. Interaction patterns focus on reducing cognitive load, using soft blue gradients to guide the eye toward primary actions without aggressive visual noise.

## Colors

The palette is built around an "Ocean Breeze" core, utilizing high-clarity blues to communicate intelligence and transparency. 

- **Primary:** A vibrant, medium-toned blue (#7FCDFF) used for active states and primary brand elements.
- **Secondary:** A soft, airy sky tint (#DFF7FF) used for large background areas, container backgrounds, and subtle gradients.
- **Tertiary:** A deep, sophisticated indigo (#5A67D8) used for secondary call-to-actions and to ground the lighter blues.
- **Neutral:** A rich charcoal (#1A1C1E) for high-contrast typography and borders in light mode.

**Dark Mode Strategy:** In dark mode, the secondary blue transforms into a deep navy surface color, while the primary blue maintains its vibrance but gains a slight outer glow to signify its "AI-powered" nature.

## Typography

This design system exclusively utilizes **Inter** to achieve a systematic, utilitarian aesthetic that remains highly readable across all densities.

- **Headlines:** Use tighter letter spacing and semi-bold/bold weights to create a strong visual anchor for financial totals and section titles.
- **Body:** Standardized at 16px for optimal legibility, moving to 14px for metadata and secondary descriptions.
- **Hierarchy:** Contrast is established through weight shifts rather than dramatic size changes to maintain a professional, news-like layout density.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with strict vertical rhythm based on a 4px baseline.

- **Desktop:** A 12-column grid with 24px gutters. Content is contained within a 1200px max-width to prevent line lengths from becoming unreadable.
- **Mobile:** A 4-column grid with 16px gutters and 20px side margins. 
- **Reflow Rules:** Cards and data tables transition from multi-column layouts on desktop to stacked, vertically scrollable lists on mobile. AI-insight components remain sticky or anchored to the bottom of the viewport on mobile devices for easy thumb access.

## Elevation & Depth

Visual hierarchy is communicated through a mix of **Tonal Layering** and **Ambient Shadows**:

- **Level 0 (Base):** The primary background color. 
- **Level 1 (Surface):** White (Light Mode) or Deep Navy (Dark Mode) containers used for main content cards. These use a 1px soft border in a slightly darker/lighter shade than the background.
- **Level 2 (Elevated):** Elements that require immediate attention (like split-bill modals) use multi-layered ambient shadows: a 15% opacity primary-tinted shadow with a 20px blur radius.
- **Glassmorphism:** Applied to the bottom navigation bar and top headers using a 20px backdrop blur and 60% opacity to maintain a sense of context with the content scrolling behind.

## Shapes

The shape language is consistently **Rounded**, reflecting a modern and friendly fintech persona.

- **Standard Elements:** Buttons and input fields use a `0.5rem` (8px) radius.
- **Containers:** Large cards and informational blocks use `rounded-lg` (16px) to create a distinct frame.
- **Interactive Pills:** Chips and filter tags use `rounded-xl` (24px) or full pill shapes to distinguish them from structural elements.
- **AI Elements:** Any AI-generated split suggestions or automated insights should feature "iOS smoothing" (continuous corners) to feel more organic and high-end.

## Components

### Buttons
- **Primary:** Solid `#7FCDFF` with neutral text. Soft outer glow on hover.
- **Secondary:** Outlined with a 1.5px stroke of the primary color.
- **Ghost:** No background, primary color text; used for low-priority actions like "Cancel."

### Input Fields
- Structured with a light gray background and a subtle bottom-only border that transforms into a full primary-color ring on focus.
- Floating labels are preferred to maintain vertical space.

### Cards
- Finely detailed with a 1px stroke. 
- Use a soft blue-to-white vertical gradient in the header area of "Balance Cards" to echo the brand’s premium feel.

### Chips & Tags
- Used for category filtering (e.g., "Dining," "Rent"). These are pill-shaped with light secondary-color backgrounds and primary-color text.

### Split-Indicator
- A unique component for this design system: A horizontal progress bar with avatars positioned at the "split points" to show who has paid their portion in real-time.