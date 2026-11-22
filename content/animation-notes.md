# Animation libraries for a plain-JS phone app (sizes approx., min+gzip)

1. **termynal** (https://github.com/ines/termynal). About 2 KB, MIT. Animated terminal from plain HTML `data-ty` lines, so a typed command and its output can be one CKA step. No dependencies.
2. **Motion, vanilla `animate()`** (https://github.com/motiondivision/motion). About 2.5 KB for the mini build, about 18 KB for the full one. MIT. Uses the Web Animations API, so animation runs on the GPU and stays smooth on phones. Works with ES modules and no framework. Good for sliding Pods and Nodes in and out.
3. **anime.js v4** (https://github.com/juliangarnier/anime). About 10 to 17 KB, and less if you import only some modules. MIT. Timelines, SVG path drawing (`createDrawable`) and stagger. Good for step-by-step SVG diagrams such as "packet travels Service to Pod".
4. **GSAP 3** (https://github.com/greensock/GSAP). About 25 KB core; DrawSVG and MotionPath are extra. Free for all uses since 2025 under the GSAP "no-charge" licence, which is not open source (OSI) and does not allow competing tools. The most capable timeline and scrub control.
5. **asciinema-player** (https://github.com/asciinema/asciinema-player). About 60 to 100 KB of JS and CSS. Apache-2.0. Replays real recorded `.cast` terminal sessions, for example a real Killercoda run, with pause and seek. Heavier, so load it only on the replay view.
6. Bonus: **Rough.js** (https://github.com/rough-stuff/rough). About 9 KB, MIT. Hand-drawn SVG boxes and arrows give cluster diagrams a "fun" look, and pair well with anime.js or Motion.

Pick: termynal for command typing, Motion mini or anime.js for SVG diagrams. Both are MIT, add under 20 KB together, and can be loaded per lesson.
