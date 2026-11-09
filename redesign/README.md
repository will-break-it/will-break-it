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
