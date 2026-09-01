# ASTRA — Interactive 3D Universe Explorer

## Overview

ASTRA is a browser-based 3D astronomy experience that links planetary, stellar, galactic, and educational views in one product. It combines an interactive WebGL explorer with supporting tools for scale, comparison, missions, constellations, sources, and deterministic question answering.

## Problem

Most space visualizations specialize in one scale. Solar System models make planets approachable, galaxy renderers communicate large structure, and data sites provide factual lookup, but moving between those mental models is often fragmented. Literal astronomical measurements also produce an unusable interface: planets disappear, distances become untraversable, and the camera loses a meaningful frame of reference.

The engineering problem was therefore broader than drawing space objects. ASTRA needed a coherent navigation model, explicit visual-scale rules, stable scientific data, moving camera targets, and rendering budgets that held up across different devices.

## Goal

Build a polished educational explorer that lets a visitor understand where an object belongs, travel to it predictably, inspect trustworthy context, and continue outward or inward across astronomical scales—all without requiring an external API for the core experience.

## My Role

I designed and implemented ASTRA as a solo project. My work covered product structure, interaction design, React and TypeScript architecture, React Three Fiber scene composition, orbital math, data modeling, performance profiles, responsive UI, testing, source attribution, and deployment preparation.

## Technical Challenges

### 1. Continuous 3D navigation

The experience spans several representations rather than one literal coordinate system. A local planetary scene, the Milky Way, nearby-star space, and a specialty black-hole visualization have different useful scales and camera constraints. The transition model had to feel connected without suggesting that the compressed visuals were literal measurements.

### 2. Camera ownership

Scripted travel, orbit-style inspection, focus tracking, and manual free flight can all attempt to control the same camera. Without an ownership rule, controls fight one another, input feels sticky, and an animation can pull the user back after they begin navigating manually.

### 3. Scaling astronomical distances

Real radii and distances cannot be displayed together in a normal browser viewport. If orbital distances are literal, most bodies are subpixel; if body radii are emphasized, orbit relationships become misleading. The application needed a consistent separation between canonical data and display geometry.

### 4. Scientific motion

Circular animation is simple but erases useful orbital characteristics. Frame-based updates also vary with device performance. The motion layer needed deterministic time-based state, eccentric orbits, inclination, stable initialization, and testable calculations.

### 5. Earth/Moon tidal locking

The Moon must revolve around Earth while keeping the same hemisphere directed toward it. This becomes easy to get wrong when local transforms, orbital phase, mesh orientation, and camera-facing presentation are mixed together.

### 6. Rendering a 55k-point Milky Way

The high-quality galaxy budget alone contains 55,000 points, alongside a background star field, sky band, labels, controls, and other active content. Regenerating populations or allocating geometry during normal interaction would create avoidable CPU work and garbage collection.

### 7. Nearby star-system navigation

Galaxy markers are static catalog positions, but entered systems contain animated local bodies. Labels must remain deterministic and readable, deep links must resolve stable identities, and travel must switch context without mutating scientific records.

### 8. Performance across devices

A fixed desktop render budget is inappropriate for a high-DPR phone or an integrated GPU. Independent ad hoc reductions also produce inconsistent visuals. ASTRA needed a small number of coherent profiles that scale the most expensive dimensions together.

### 9. Scientific data modeling

Astronomy facts arrive with different units, confidence levels, epochs, and source conventions. Display text also changes more often than canonical identifiers. The data model needed traceability without coupling every scene directly to raw source records.

## Solutions

### Layered scene composition

`UniverseCanvas` acts as the explorer composition root. It owns the selected object, active camera target, camera mode, active star system, and scene overlays, then conditionally mounts the relevant local, galaxy, or specialty layers. This produces a continuous product experience while keeping each scale technically manageable.

### Selection separated from targeting

Selecting an object changes context; targeting initiates travel. The distinction prevents information browsing from unexpectedly moving the camera and provides a clean boundary for UI commands, URL restoration, and input ownership.

### Registry-based live destinations

Renderable destinations register their live `THREE.Object3D` references. The travel manager resolves the object at command time, and the camera controller reads its current world position. A planet can therefore continue orbiting after selection without making the destination stale.

### Explicit camera ownership

Scripted transitions own the camera only for the duration of travel or tracking. Manual input cancels or supersedes that behavior through deliberate state changes, preventing competing control loops.

### Canonical data versus visual scale

Scientific values stay in typed data records. Rendering helpers convert them into readable radii, distances, and motion rates. The interface and documentation state where compression is used, allowing the experience to teach relationships without presenting the scene graph as a literal ephemeris.

### Deterministic orbital engine

The astronomy engine uses simulation time and orbital elements to solve positions consistently. Tests cover representative orbital behavior and the Earth/Moon relationship. Moon orientation is calculated from the Earth direction rather than approximated with an unrelated spin animation.

### Reusable star-system configuration

A shared `StarSystemConfig` describes stars, planets, orbital values, metadata, and rendering parameters. The renderer consumes the configuration for standard systems, while visually distinct targets such as Sagittarius A* and nebulae use isolated specialty components.

### Tiered performance profiles

High, medium, and low profiles set a maximum device pixel ratio and scale galaxy, sky, belt, nebula, cluster, and orbit detail as one budget. Static point populations and geometry inputs are memoized, expensive scenes mount only when relevant, and reduced-motion preferences limit decorative work.

### Typed, sourced data

Static astronomy modules keep canonical identifiers, values, units, display metadata, and source references explicit. Validation tests guard important ranges, relationships, required fields, and uniqueness. This makes builds reproducible and keeps the Guide and visualizations aligned.

### Deterministic Guide

The ASTRA Guide uses a typed local provider to normalize a question, identify supported intent and entities, and assemble an answer from curated data. It requires no external AI service, is testable, and returns bounded guidance when a question falls outside its knowledge set.

## Major Features

- Interactive Solar System and reusable exoplanet-system rendering
- Time-based orbital motion and Earth/Moon tidal locking
- Milky Way and Local Stellar Neighborhood exploration
- TRAPPIST-1 system entry and navigation
- Sagittarius A*, nebula, and star-cluster specialty scenes
- Selection, focus travel, deep links, history restoration, and free flight
- Astronomical Scale and Compare tools
- Mission catalog and Mission Control telemetry snapshot
- Interactive constellation map
- Source catalog and deterministic ASTRA Guide
- Responsive controls and quality-tiered rendering

## Performance

The high profile renders 55,000 Milky Way points, 9,160 background stars, a 5,600-point sky band, and up to 9,800 belt points. Medium reduces those budgets to 41,800, 7,511, 4,592, and 7,840; low uses 27,500, 5,313, 3,360, and 5,390. Maximum DPR is capped at 2.0, 1.5, and 1.25 respectively.

Performance work focused on structural cost rather than an unsupported headline FPS number: reuse static buffers, avoid remounting unchanged scene data, simplify inactive systems, conditionally mount heavy specialty scenes, reduce geometry segments with the profile, and keep frame updates narrowly scoped.

## Scientific Data

ASTRA uses curated static records derived from authoritative public astronomy and mission sources, including NASA, JPL, ESA, and IAU material. Canonical values remain separate from labels and visual scale. The Sources route exposes attribution, while tests check high-risk values and cross-record relationships. Specialty visuals and mission snapshots are labeled according to their educational scope.

## Testing

The project currently has 28 deterministic tests across five areas:

- Performance-tier profile selection and budget integrity
- Star-system data and local-destination behavior
- Orbital motion and Moon tidal locking
- ASTRA Guide intent and entity handling
- Astronomy-data validation and consistency

TypeScript, ESLint, production build, and whitespace validation complete the automated release gate. Browser behavior, responsive layouts, WebGL composition, and deep-link flows are checked with the manual final QA checklist; automated end-to-end and screenshot regression coverage are future improvements.

## What I Learned

- Camera control is application state, not merely a visual effect. Explicit ownership makes complex 3D interaction much easier to reason about.
- A useful scientific visualization needs honest abstraction. Separating canonical measurements from display scale is better than hiding compromises inside geometry constants.
- Live-object registries are a strong fit for travel to animated scene entities because identity stays stable while position changes.
- Performance tiers work best when they describe a complete rendering budget instead of scattered device checks inside components.
- Deterministic generation is valuable for large aesthetic datasets: it improves visual consistency, testing, debugging, and screenshot reproducibility.
- Scientific trust depends as much on wording, units, attribution, and limitations as it does on the rendering itself.
- Local typed providers can deliver a useful guided experience when the domain is bounded and factual correctness matters more than open-ended generation.

## Future Improvements

The next iteration could add realistic Asteroid Belt and Kuiper Belt treatments, Moon surface exploration, third-person astronaut/EVA controls, Mars terrain, and optional additional mission datasets. Automated browser journeys, visual regression checks, and measured device performance baselines would strengthen the release process before expanding the scientific catalog.
