````markdown
# Design System Strategy: Modern Analog

## 1. Overview & Creative North Star

**The Creative North Star: "The Digital Curator"**

This design system is a bridge between the tactile, high-fidelity past of analog music and the seamless, hyper-connected digital future. We are moving away from the "app-as-a-utility" look and toward the "app-as-a-gallery" experience.

To achieve this, the system rejects the rigid, boxy constraints of standard mobile frameworks. Instead, we utilize **Intentional Asymmetry** and **Editorial Spacing**. Content should feel "placed" rather than "pushed." By leveraging high-contrast typography and a sophisticated layering of dark surfaces, we create an environment that feels like a premium record shop at midnight—intimate, curated, and deeply immersive.

---

## 2. Colors: Depth Through Darkness

Our palette is rooted in `surface` (#131313), providing a rich, charcoal canvas that allows the typography and album art to vibrate.

### The "No-Line" Rule

**Borders are a failure of hierarchy.** Within this system, 1px solid borders for sectioning are strictly prohibited. You must define boundaries through background color shifts.

- Use `surface-container-low` (#1C1B1B) for large section blocks sitting on the main `surface`.
- Use `surface-container-high` (#2A2A2A) to define interactive zones without drawing a line around them.

### Surface Hierarchy & Nesting

Treat the UI as a physical stack of vinyl sleeves.

- **Base Layer:** `surface` (#131313)
- **Secondary Sections:** `surface-container-low` (#1C1B1B)
- **Interactive Cards:** `surface-container-highest` (#353534)
  By nesting higher-tier containers within lower-tier backgrounds, you create a natural "lift" that feels expensive and architectural.

### The Glass & Gradient Rule

To inject "soul" into the digital interface, use **Glassmorphism** for floating elements (like player bars or navigation). Use `surface` colors at 70% opacity with a `20px` backdrop blur. For primary CTAs, do not use flat fills; use a linear gradient from `primary` (#FFB59E) to `primary_container` (#FF5717) at a 135-degree angle to mimic the sheen of a fresh record press.

---

## 3. Typography: Editorial Authority

The typography is the voice of the brand. We pair a high-fashion serif with a functional, geometric sans-serif.

- **Display & Headlines (`newsreader`):** This serif is our "Album Art" face. Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) to create a bold, editorial impact. It should feel authoritative, like a masthead.
- **Body & Labels (`manrope`):** Our "Liner Notes" face. `manrope` provides a technical contrast to the serif. Use `body-md` for all standard reading to ensure the interface feels modern and accessible.
- **Hierarchy Tip:** Never center-align `display` text. Use flush-left alignment with generous top-padding to lean into the "Modern Analog" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering

We do not use shadows to create "pop"; we use tone to create "presence."

- **The Layering Principle:** Depth is achieved by "stacking." Place a `surface-container-lowest` card on a `surface-container-low` section. The slight shift in charcoal creates a soft, natural edge.
- **Ambient Shadows:** If a floating element (like a Modal) requires a shadow, use a `48px` blur at 8% opacity, using the `primary` color as the shadow tint. This mimics the way light catches the edge of an object.
- **The "Ghost Border" Fallback:** If a layout absolutely requires a separator (e.g., in a dense list), use the `outline-variant` (#5C4037) at **15% opacity**. It should be felt, not seen.
- **Glassmorphism:** Use `surface-variant` at 60% opacity with a `16px` backdrop-blur for headers. This allows the vibrant colors of album art to bleed through as the user scrolls, creating a dynamic, living interface.

---

## 5. Components

### Buttons

- **Primary:** A gradient fill (`primary` to `primary_container`). Border radius: `md` (0.75rem). No shadow.
- **Secondary:** Solid `secondary_container` (#8F0193) with `on_secondary_container` (#FFA3F7) text.
- **Tertiary:** Ghost style. No background, `primary` text, `label-md` weight.

### Cards & Lists

- **Strict Rule:** No dividers. Separate items using `1rem` of vertical white space or a background shift to `surface-container-highest`.
- **Corner Radius:** Cards must use `lg` (1rem) to feel like a high-quality object.

### Input Fields

- **Styling:** Fill with `surface-container-lowest`. Use a `Ghost Border` (outline-variant at 20%) that transitions to `primary` (#FFB59E) on focus.
- **Typography:** Labels must be `label-md` in `on_surface_variant` (#E6BEB2).

### Signature Component: The "Sleeve" Card

A custom component for displaying albums or playlists. It features an image with a `sm` (0.25rem) corner radius, nested inside a `surface-container-high` container with a `lg` radius. This creates a "frame within a frame" look reminiscent of a record sleeve.

---

## 6. Do's and Don'ts

### Do:

- **Embrace Negative Space:** If a screen feels crowded, increase the spacing rather than adding a border.
- **Mix Type Scales:** Pair a `display-sm` headline with a `label-sm` sub-headline for a high-end magazine feel.
- **Use Subtle Textures:** Apply a 3% grain overlay to `surface` backgrounds to mimic the matte finish of heavy cardstock.

### Don't:

- **Don't Use Pure Black:** Stick to `surface` (#131313) to keep the shadows and depth visible.
- **Don't Use Standard "Bubbly" Corners:** Avoid the `full` radius for buttons; keep them at `md` to maintain a professional, architectural edge.
- **Don't Center Everything:** Modern Analog thrives on left-aligned content with purposeful "white space" on the right.

### Accessibility Note:

While we use high-contrast charcoal and off-white, always ensure that `on_surface_variant` text on `surface` meets AA standards. When using the vibrant `primary` or `secondary` colors for text, ensure they are only used for decorative labels or large headlines.```
````
