---
colors:
  background: "#F4F0EA"
  surface: "#FFFFFF"
  text-primary: "#1E1B18"
  text-secondary: "#6B6560"
  accent: "#A67C52"
  border: "#D9D2C9"
typography:
  display:
    family: "Cormorant Garamond"
    weights: [300, 400]
    usage: "hero headline, section titles"
  body:
    family: "General Sans"
    weights: [400, 500]
    usage: "paragraphs, labels, navigation"
  scale:
    hero: "clamp(3.5rem, 8vw, 7rem)"
    h2: "clamp(2rem, 4vw, 3.25rem)"
    body: "1.0625rem"
    small: "0.8125rem"
spacing:
  section-y: "clamp(6rem, 12vw, 10rem)"
  gutter: "clamp(1.5rem, 4vw, 3rem)"
radii:
  card: "4px"
  button: "2px"
shadows:
  mirror-reflection: "0 30px 60px -20px rgba(30, 27, 24, 0.18), 0 8px 20px -8px rgba(30, 27, 24, 0.08)"
---

# Mirror Brand — Design Rationale

## Why this palette

The brand sells physical objects that play with light. The palette is built around **warm limestone** and **aged brass**, not cool gray or pure white. Brass is the only accent, and it is used exclusively for primary actions and one signature element per screen (a hairline under the hero, a small label). If brass appears more than twice on a screen, it loses its meaning.

## Why these typefaces

Cormorant Garamond at light weights gives the editorial, gallery-like feel appropriate for handcrafted mirrors. General Sans provides a quiet, humanist counterpoint. **Do not substitute Inter, Roboto, or system fonts** — they immediately signal "generic SaaS" and break the luxury register.

## Layout principles

- **Asymmetry over symmetry.** A 7/5 or 8/4 split for text/image pairs. Never a centered two-column layout.
- **Hairlines, not boxes.** Use 1px borders in `border` color to separate content. Avoid card shadows except for the `mirror-reflection` shadow on product images.
- **Photography is the hero.** Every mirror image sits on a wall-like background or a real interior.
- **Motion is slow and restrained.** Hover transitions at 400–600ms, `ease-out`. No bouncing, no spring physics.

## The "mirror reflection" shadow

Every product image should feel like it is mounted on a wall. Apply the `mirror-reflection` shadow to the image container, not to the `<img>` itself. The shadow is layered: a large soft spread and a tighter contact shadow. This is the single most important detail that makes the product feel physical rather than rendered.
