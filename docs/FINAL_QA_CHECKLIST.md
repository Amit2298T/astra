# ASTRA Final QA Checklist

Use a production build (`npm run build && npm start`) for the final browser pass.

## Routes and navigation

- [ ] `/`, `/explore`, `/scale`, `/compare`, `/mission-control`, `/star-map`, `/guide`, and `/sources` return HTTP 200.
- [ ] Every navigation link and Home/return control reaches the expected context.
- [ ] Invalid URL parameters render a safe default without a blank screen.

## Explorer and deep links

- [ ] Test every target in `EXPLORER_ENTRY_TARGETS`, plus an invalid target.
- [ ] Exercise select, focus, follow, travel, free roam, and object/source panels.
- [ ] Check Solar System, Earth/Moon, dwarf planets, belts, Voyager 1, and corrected motion.
- [ ] Enter and return from Alpha Centauri, Sirius, Barnard's Star, Epsilon Eridani, Tau Ceti, and TRAPPIST-1.
- [ ] Confirm TRAPPIST-1 labels, selected-planet priority, Center, and System Overview.
- [ ] Check Galaxy overview, Nearby Stars, Sagittarius A*, all nebulae, and all clusters.

## Input, accessibility, and responsive layout

- [ ] Verify WASD, Space/Ctrl, Shift boost, speed presets, wheel cycling, mouse look, and Esc unlock.
- [ ] Complete a keyboard-only pass; confirm visible focus and meaningful screen-reader labels.
- [ ] Check reduced-motion mode and ensure no native SVG tooltips appear.
- [ ] Check 1920x1080, 1366x768, tablet, and mobile portrait with no page-level horizontal overflow.
- [ ] Confirm mobile Explorer controls and specialty-scene overlays remain usable.

## Performance and diagnostics

- [ ] Exercise high, medium, and low quality profiles on representative hardware.
- [ ] Confirm DPR caps, label LOD, particle tiers, lazy specialty chunks, and active-scene exclusivity.
- [ ] Inspect the browser console for project-owned errors, hydration warnings, and missing assets.
- [ ] Record measured performance separately; do not estimate FPS.

## Sources and deployment

- [ ] Open representative NASA, JPL, Exoplanet Archive, SIMBAD/CDS, IAU, ESA/Hubble, and EHT links.
- [ ] Confirm external links open in a new tab without exposing `window.opener`.
- [ ] Run `npm test`, TypeScript, ESLint, production build, and `git diff --check`.
- [ ] Confirm security headers on a production response.
- [ ] Deploy to Vercel with Node 20.9+ and no secret environment variables.
- [ ] Capture the approved landing, Explorer, Galaxy, specialty-scene, and educational-route screenshots.
