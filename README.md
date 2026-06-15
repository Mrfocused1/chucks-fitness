# Chhuks Fitness

A faithful rebuild of **[lahuella.club/en](https://lahuella.club/en)** — same layout, typography and GSAP
motion system — reskinned as **Chhuks Fitness**, an online + in-person coaching brand.
Runs as a **dark theme** (the page is inverted from the original's light palette: near-black `#0f0f0f`
background, light text, same `#fdca38` yellow accent).

## Run it

```bash
cd chhuks-fitness
python3 -m http.server 8753
# open http://localhost:8753
```
It needs to be **served over http** (not opened as a `file://`) because of the smooth-scroll wrapper and module/asset paths.

## What was reverse-engineered from the original

| Token | Value |
|-------|-------|
| Brand yellow | `#fdca38` (`--brand-500`) |
| Deep gold | `#6a5518` (`--brand-900`) |
| Near-black | `#0f0f0f` (`--gray-950`) |
| Page paper | `#fbfbfb` |
| Grays | `#f2f2f2 · #a5a5a5 · #787878 · #424242` |
| Display font | **CWM Bold** (the original A2-Type face — bundled in `/fonts`) |
| Body font | Inter |

## Animation system (matches La Huella's stack)

- **GSAP ScrollSmoother** — smooth scrolling + `data-speed` parallax (hero, feature, CTA backgrounds)
- **GSAP ScrollTrigger** — scroll-in reveals (batched) + scroll-reactive marquee speed + header hide-on-scroll
- **GSAP SplitText** — line/word reveal on every big heading and the hero
- **Swiper** — the "Ways to train" card carousel
- **lightGallery** — the "Inside the training" gallery lightbox (zoom + thumbnails)
- Custom GSAP: preloader counter, full-screen menu overlay (clip-path), program accordion with a
  cursor-following image preview, height-animated FAQ accordion.

All plugins are the now-free GSAP 3.13 builds, vendored locally in `/vendor` (no CDN, works offline).

## Structure

```
index.html          # single-page site (ScrollSmoother wrapper)
css/styles.css       # design tokens + components (no framework)
js/main.js           # all interactions / GSAP
fonts/CWM-Bold.otf   # original display typeface
assets/              # Pexels imagery (hero, programs, gallery, coach, cta)
vendor/              # GSAP, Swiper, lightGallery (local copies)
_research/           # reference only — original page dump, scrapes, test scripts (safe to delete)
```

## Notes / before going live

- **Fonts:** CWM Bold is a licensed A2-Type face (bundled here for an exact match while prototyping).
  License it, or swap `--font-display` for a free bold grotesque (e.g. Anton / Archivo Black) before any commercial launch.
- **Images:** sourced from Pexels (free to use). Swap for real Chhuks Fitness photography.
- **Links:** the WhatsApp number, social links and "Book a call" are placeholders.
- Verified end-to-end (desktop 1440px + mobile 390px) headlessly — 0 console errors.
