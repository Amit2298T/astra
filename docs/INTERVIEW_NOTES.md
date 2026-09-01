# ASTRA Interview Notes

## Why did you build ASTRA?

I wanted to explore a difficult product question: how can one browser experience connect planetary, stellar, and galactic scales without losing usability or scientific honesty? ASTRA let me combine 3D interaction, data modeling, orbital math, performance work, and educational UX in one coherent project.

## Why React Three Fiber instead of raw Three.js?

React Three Fiber gives the scene a declarative component model that fits the rest of the Next.js application. It makes state, conditional scene mounting, reuse, and UI integration easier while preserving access to Three.js objects and per-frame updates where needed. Drei supplied focused helpers without replacing the underlying scene architecture.

## How did you manage camera state?

I treated the camera as shared application state with explicit modes and ownership. Selection does not automatically initiate travel. A travel action assigns a target to the camera controller; manual input can then cancel or supersede that scripted control so two systems never fight for the camera indefinitely.

## How do you travel between moving objects?

Rendered destinations register live `THREE.Object3D` references in a scene registry. The travel manager resolves the target when travel begins, and the controller uses its current world position during the transition or tracking phase. This avoids storing a coordinate that becomes stale as a planet or moon continues orbiting.

## How did you handle astronomical scale?

I separated canonical scientific values from display geometry. Typed data retains the facts and units; scale helpers map them to readable radii and distances for each view. The UI explicitly describes the compression because literal sizes and distances cannot both remain visible and navigable on a normal screen.

## How is the Milky Way rendered?

It is a deterministic point-based visualization. The high-quality profile uses 55,000 galaxy points, with lower profiles reducing the population. Static population and geometry inputs are memoized so routine interaction does not rebuild the galaxy, and the camera angle, density, and color treatment provide the perceived structure.

## Why aren't real astronomical distances used directly?

Literal distances would make planets nearly invisible and travel impractically long. ASTRA aims to communicate hierarchy and relative context, so it uses a documented visual scale while retaining scientific values in the data and information panels.

## How did you optimize 3D rendering?

I capped DPR, scaled particles and geometry through coherent quality profiles, memoized static buffers, conditionally mounted specialty scenes, simplified inactive systems, and limited frame-loop work to state that actually moves. I also respect reduced-motion preferences for decorative effects.

## How does quality-tier detection work?

The performance module selects a conservative high, medium, or low profile from available device signals. Each profile is a tested object that controls maximum DPR, particle population scales, and orbit geometry segments. It is a rendering heuristic, not a claim that a specific device will hold a guaranteed frame rate.

## How did you implement Moon tidal locking?

The Moon's orbital position comes from the shared simulation time. Its orientation is then derived from the direction back to Earth so the same local hemisphere remains pointed at the parent body. Tests check both orbital behavior and the facing relationship rather than relying only on visual inspection.

## How are star systems represented?

Standard systems use typed `StarSystemConfig` data describing the star, planets, orbital parameters, metadata, and rendering scale. A shared scene consumes those configurations. Galaxy markers and canonical IDs remain stable, while specialty phenomena use separate components when a generic planetary renderer is not appropriate.

## How does the ASTRA Guide work without an external AI API?

A typed local provider normalizes the prompt, detects supported intents and astronomy entities, and builds a response from curated project data. The behavior is deterministic and covered by tests. Unsupported input receives scoped guidance instead of an invented answer, and the project never markets it as generative AI.

## What would you improve next?

I would first add automated end-to-end and visual-regression coverage plus measured performance baselines on representative devices. Product additions could then include more realistic Asteroid and Kuiper Belt rendering, lunar or Mars terrain, an astronaut/EVA mode, and optional additional mission datasets.
