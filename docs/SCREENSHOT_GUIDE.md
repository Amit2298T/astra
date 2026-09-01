# ASTRA Screenshot Capture Guide

This guide defines the final portfolio screenshot set. Store completed captures in `docs/screenshots/` using the exact filenames below. Do not add mockups or generated substitutes.

## Capture Standard

- Prefer a 1920×1080 viewport; 1440×900 is the supported compact alternative.
- Use a production build or a stable development session with no console or error overlays.
- Capture at 100% browser zoom with the browser chrome cropped out.
- Wait for scene entry, textures, labels, and camera motion to settle.
- Keep the pointer away from the primary subject and avoid accidental hover tooltips.
- Use a consistent dark display environment and the same quality tier across the 3D desktop set when practical.
- Preserve the real interface. Do not composite, relabel, or retouch scientific content.

## Capture Checklist

### 1. Landing — `01-landing.png`

- **Route:** `/`
- **Recommended state:** Fresh page load at the top of the page.
- **Visible:** ASTRA wordmark, hero statement, primary explorer action, and enough of the space treatment to establish the visual identity.
- **Viewport:** 1920×1080 preferred; 1440×900 acceptable.
- **UI state:** No hover state; primary navigation visible; animation settled on a balanced frame.
- **Avoid:** Scrolling below the hero, clipped headline text, browser chrome, loading flashes, or a cursor over the call to action.

### 2. Solar System — `02-solar-system.png`

- **Route:** `/explore?target=solar-system`
- **Recommended state:** System overview after the entry transition completes, with the Sun centered and the camera far enough back to read the orbital structure.
- **Visible:** Sun, multiple planetary orbits, several planet markers or labels, and restrained explorer controls.
- **Viewport:** 1920×1080 preferred.
- **UI state:** Overview mode; no object tooltip; information panels closed unless a compact system heading improves context.
- **Avoid:** A planet hidden behind a panel, extreme orbit clipping, mid-transition blur, or a random tooltip covering the inner planets.

### 3. Earth and Moon — `03-earth-moon.png`

- **Route:** `/explore?target=solar-system`
- **Recommended state:** Select Earth, target it, and wait for the camera to settle while the Moon is clearly separated in screen space.
- **Visible:** Earth, Moon, their local spatial relationship, Earth selection treatment, and enough interface context to identify the target.
- **Viewport:** 1920×1080 or 1440×900.
- **UI state:** Earth selected; focused camera; one concise object panel may remain visible if it does not obscure the Moon.
- **Avoid:** Moon occlusion, excessive zoom that removes orbital context, selecting the Moon by mistake, or capturing during rapid revolution.

### 4. Milky Way — `04-galaxy.png`

- **Route:** `/explore?target=milky-way`
- **Recommended state:** Galaxy overview at an oblique angle that shows the disk, central concentration, and surrounding depth.
- **Visible:** Full Milky Way composition, core, star population, and subtle interface context.
- **Viewport:** 1920×1080 preferred.
- **UI state:** Galaxy camera settled; labels limited to useful orientation cues; large panels closed.
- **Avoid:** Edge-on flattening, an overexposed core, clipping the galaxy disk, or capturing before the point population is stable.

### 5. Nearby Stars — `05-nearby-stars.png`

- **Route:** Begin at `/explore?target=milky-way`, then enter Local Stellar Neighborhood mode.
- **Recommended state:** Frame Solar System, Alpha Centauri, Sirius, TRAPPIST-1, and several secondary systems with readable separation.
- **Visible:** Multiple system markers, the nearby-star spatial field, priority labels, and the active neighborhood context.
- **Viewport:** 1920×1080 preferred.
- **UI state:** No selected secondary system unless it improves the composition; object panel closed.
- **Avoid:** Unnecessary panel overlap, label collisions around Solar System and Alpha Centauri, labels touching viewport edges, or changing marker positions for the capture.

### 6. TRAPPIST-1 — `06-trappist-1.png`

- **Route:** `/explore?target=trappist-1`
- **Recommended state:** Full local-system overview after entry, with all seven planetary orbit paths legible.
- **Visible:** TRAPPIST-1, its seven planets or their markers, orbit hierarchy, system title, and restrained controls.
- **Viewport:** 1920×1080 preferred.
- **UI state:** System overview; star or system selected only if its panel remains compact.
- **Avoid:** Cropped outer orbits, crowded planet labels, a galaxy-level label left over from the previous view, or a camera still traveling.

### 7. Sagittarius A* — `07-sagittarius-a.png`

- **Route:** `/explore?target=sagittarius-a`
- **Recommended state:** Specialty scene fully entered at a three-quarter angle with the accretion and lensing composition clearly visible.
- **Visible:** Central black-hole treatment, accretion structure, depth cues, and a concise information overlay.
- **Viewport:** 1920×1080 preferred.
- **UI state:** Target selected; overlay visible but not dominant; motion settled enough for a crisp frame.
- **Avoid:** A blown-out center, a flat face-on angle, controls obscuring the focal point, or wording that implies a literal physical simulation.

### 8. Orion Nebula — `08-orion-nebula.png`

- **Route:** `/explore?target=orion-nebula`
- **Recommended state:** Nebula specialty scene at its intended overview distance with the brightest structure off-center for depth.
- **Visible:** Nebular volume, embedded stellar cues, color variation, scene title, and minimal controls.
- **Viewport:** 1920×1080 or 1440×900.
- **UI state:** Target selected; optional compact info panel; no unrelated galaxy labels.
- **Avoid:** Crushing dark detail, oversaturated color, clipping the volume, or capturing while particles are still appearing.

### 9. Scale — `09-scale.png`

- **Route:** `/scale`
- **Recommended state:** Choose a comparison point that demonstrates a clear change of astronomical scale and contains recognizable objects.
- **Visible:** Scale visualization, current scale label, navigation controls, and the explanatory copy needed to understand the view.
- **Viewport:** 1440×900 or 1920×1080.
- **UI state:** Stable selected step; no control hover; all scale labels readable.
- **Avoid:** An empty transition state, clipped explanatory copy, browser scrollbars over content, or a selection with visually indistinguishable objects.

### 10. Compare — `10-compare.png`

- **Route:** `/compare`
- **Recommended state:** Compare two familiar objects with a strong size contrast, such as Earth and Jupiter, using the default comparison metric.
- **Visible:** Both objects, their names, numerical context, comparison control, and the visual scale relationship.
- **Viewport:** 1440×900 preferred.
- **UI state:** Valid two-object comparison; selectors closed; no transient hover treatment.
- **Avoid:** Duplicate objects, an empty selector, cropped measurements, or a pairing whose scale difference is impossible to read.

### 11. Mission Control — `11-mission-control.png`

- **Route:** `/mission-control`
- **Recommended state:** Default Voyager mission overview with the primary telemetry snapshot and trajectory context in view.
- **Visible:** Mission identity, key status or distance values, visualization, and the static-data timestamp/context where presented.
- **Viewport:** 1920×1080 or 1440×900.
- **UI state:** Default dashboard; no tooltip blocking telemetry; navigation in its resting state.
- **Avoid:** Implying the snapshot is live, clipping units, overly tall scrolling sections, or hiding the mission name.

### 12. Star Map — `12-star-map.png`

- **Route:** `/star-map`
- **Recommended state:** Select Orion and frame the full constellation with its connecting lines and primary labels.
- **Visible:** Star field, Orion geometry, constellation name, and enough controls to communicate interactivity.
- **Viewport:** 1920×1080 preferred.
- **UI state:** Orion selected; labels enabled; side panel closed or compact.
- **Avoid:** Selecting a star that opens a large overlay, cutting off constellation lines, excessive label density, or low-contrast stars.

### 13. ASTRA Guide — `13-guide.png`

- **Route:** `/guide`
- **Recommended state:** Submit a supported astronomy question and show one complete, concise answer with its suggested follow-up actions.
- **Visible:** Guide identity, user question, deterministic response, input field, and relevant navigation suggestions.
- **Viewport:** 1440×900 preferred.
- **UI state:** Completed response; input not focused; no caret or browser autofill popover.
- **Avoid:** Calling the Guide generative AI, using an unsupported question, exposing debug text, or capturing a partially typed or loading state.

## Final Review

Before committing captures, confirm that every filename matches the checklist, no image contains private browser data, and all scientific labels and units agree with the running application. Update the README checklist only after each corresponding file exists.
