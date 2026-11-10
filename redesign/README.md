# Redesign variants (Nov 2026)

Three directions for williwolff.com that move it away from a tech CV towards
"get in touch / book me" and add the creative side (drone and underwater footage).
Open them locally from the repo root, e.g. `npx live-server` then `/redesign/a-both-sides.html`.

- `a-both-sides.html`: closest to today (teal, flat, Inter); three ways to work together, side work, enquiry form.
- `b-above-below.html`: footage-led; showreel hero, gallery on an altitude/depth rail, software second.
- `c-studio.html`: booking-led; a fill-in letter is the hero, services with proof, how a project runs.

`enquiry.js` composes an email to contact@williwolff.com (no backend). All striped or
gradient boxes marked "Placeholder" need real footage or stills.

Round 2, built on B's altitude idea (air above, sea level for the beach and software, water below):

- `b1-descent.html`: the page scrolls from +120 m to −30 m with a live altitude gauge; booking sits on the seabed.
- `b2-cross-section.html`: a drawn coast cross-section is the hero and the menu; one section per zone.
- `b3-logbook.html`: every project and shot is a log entry sorted by elevation, with an elevation profile and Air/Land/Water filter.

Round 3, iterations on B1 Descent:

- `d1-descent-refined.html`: one continuous colour gradient, a ruler gauge with 10 m ticks, a floating booking pill.
- `d2-descent-cinematic.html`: full-screen footage scenes, dive-computer readout, sea level as a bright sand panel with a sideways project strip.
- `d3-descent-column.html`: light portfolio; a pinned drawn water column marks every item at its elevation.

Round 4, a bolder concept:

- `e1-one-breath.html`: the page is one take and one breath. Scroll scrubs a top-down shot from 100 m down onto the court, through the surface and down the freediving line to 30 m. Projects ride on the line as depth tags; contact is the ascent. The canvas is a rendered stand-in; real footage drops in as an image sequence (`SEQ` in the script).
- `e2-one-breath-composed.html`: the same dive built from separate shots: aerial tilt, a drop onto the court, a slow-motion volleyball into the lens as the cut to an eye-level court shot, an over-under waterline shot, then down the line.

Round 5, back to the calm vertical layout:

- `f1-descent-aerial.html`: D1 Refined, with its static hero replaced by one slow scroll-scrubbed top-down drone descent from 100 m to the court. Intro panels fade in over the scene, the ruler reads the drone's altitude, and the shot dissolves into the sand where the sea-level section starts. Below that it is D1, with freediving copy. Same `SEQ` hook for real footage.
- `f2-refined-aerial.html`: D1 Refined left as it is (layout, sky gradient, ruler, motion). Only its frames above sea level change: the hero shot and the two aerial frames hold a top-down drone scene that comes down from 120 m as each frame scrolls past. Freediving copy below. Each canvas takes an image sequence for real footage (`data-seq`, `data-count`).
