# DESIGN — storyline and the rent every feature pays
Companion to DIRECTIVES.md. Rule: a feature with an empty "contribution" cell gets cut.

## The story (one shift, one arc)

You are the NEW OPERATIONS COORDINATOR at an Ol Pejeta-like conservancy. One accelerated day:

- **06:00 · Level 1 "FIELD MORNING" (the arcade).** Before you may run the desk, you fly.
  A chirpy robot assistant walks you through it flash-game style: draw a path for the Mini 4
  Pro, photograph the giraffe herd WITHOUT entering its noise buffer, come home before the
  battery dies. Then two drones at once. Then a battery scare. Score: photos, disturbances
  (target zero), drones lost (you get exactly three, they are expensive).
- **09:00 · promotion cutscene (one screen).** The narrator: "Congratulations. The clipboard
  is yours now." Level 2 unlocks.
- **09:00-17:00 · Level 2 "THE OPERATIONS DESK" (the simulator).** Mission requests arrive on
  cards: map a habitat block, track a collared elephant, ferry a vet sample between stations,
  and, mid-shift, the climax: rangers report a suspected poacher near the rhinos, send the
  thermal Mavic 2T to illuminate the area for the ranger team. Every launch passes the
  PRE-FLIGHT GATE, which certifies or refuses in plain language (battery+wind reserve, noise
  buffers, the controlled-airspace sector that needs clearance, traffic deconfliction). The
  map shows everyone's flight cylinders; wind shifts once mid-shift and previously-legal plans
  stop being legal.
- **17:00 · DEBRIEF.** Scorecard in operator units. Then the button that lands the thesis:
  "Hand the same shift to the autonomy layer." The bot replays your day, replanning
  continuously; its scorecard sits beside yours. Closing line: the argument for autonomous
  fleet management, played rather than asserted.

## Feature -> contribution matrix (the rent ledger)

| Feature | In-game role | What it buys toward the interview |
|---|---|---|
| Level 1 arcade | 30-seconds-to-fun on-ramp; teaches paths/battery/buffers | MICHAEL plays and forwards; without this the chain to Lundquist never fires (directive 1) |
| Real fleet w/ real limits | three aircraft, three roles, honest numbers | replica-fidelity signal: "he understood our exact operation" (directive 4); interview talking point |
| Noise buffers around herds | exclusion geometry you must respect | their own Drones 2025 wildlife-noise review as literal game geometry; paper pop-up #1 |
| Pre-flight gate + plain-language refusals | the certify-or-refuse loop of Level 2 | Lundquist's rule-based safety monitoring (2014/16) + WildProcedures homage; the family honesty signature; pop-up #2 |
| Energy budget + wind | reserve maths decides what may fly | his IROS 2022 energy-aware planning + the centre's new EU battery project; pop-up #3 |
| Clearance sector | one zone needs requested clearance w/ delay | their real KAF/Ol Pejeta radio-room reality from the ICUAS paper; shows Bo read the ops, not the abstract |
| Flight cylinders + deconfliction | shared-airspace display; overlapping plans refused | WildOps gamified, credited to Maalouf by name (directive 3); pop-up #4 (U-space planning 2024) |
| Mission-as-program toggle | any plan renders as a six-line program | Lundquist's DSL identity, zero typing friction; pop-up #5 |
| The bot debrief | optimal replay of YOUR shift, side by side | directive 9 verbatim; the autonomy thesis; shows Bo can BUILD the planner, not just play it |
| RTH easter egg | return-to-home annotated "recovery as reverse execution" | private wink at Lundquist 2015 + E-CoRe; costs one tooltip |
| Ground-risk overlay toggle | population-density shading | winks at Maalouf's commits from THIS MONTH; costs one layer |
| Robot narrator + sounds + arrows | tutorial voice (browser TTS), WebAudio chimes | directive 11; the not-boring bar; zero asset cost |
| Vet-sample mission | one mission type | HealthDrone lineage nod (their cited ancestor project) |
| Poacher-illumination climax | mid-shift tension spike | Bo's directive 12; real Ol Pejeta ranger work; fully civilian drama |
| Rhino on the map | ambient fauna near the climax | Ol Pejeta's identity (the northern whites); costs nothing, says everything |
| Checklist-time score stat | "your pre-flight average: X min" vs their 26->13 story | their own field-iteration metric as a score line |
| 8-bit safari art | the approved look | style B decision; charm without the tacticool trap |
| Editorial page frame + provenance + limitations | the shell around the canvas | committee-safe if forwarded; house doctrine; where pop-up papers get full citations |

## Science-grounded mechanics (added 22 Aug from the Ecology & Evolution 2026 noise paper)
The in-game science card quotes the REAL paper (Afridi et al., incl. Schultz Lundquist, field
site = Ol Pejeta itself): altitude bands drive disturbance (below 40 m = sustained vigilance
and relocation), and "greater disturbance during dual-drone operations and in mixed-species
assemblages". Level 2 inherits two rules from this: DUAL-DRONE PENALTY (two aircraft near one
herd multiplies disturbance) and MIXED-HERD BUFFERS (larger circles where species mix). Every
future nature rule follows this pattern: quote first, mechanic second.

## Scope fence (the timebox, directive 14)
IN: everything above. OUT (explicitly): multiplayer, save games, mobile touch polish beyond
basics, terrain generation (one hand-built map), more than 3 flyable drones, more than ~6
mission types, voice acting beyond browser TTS, any backend.

## Success criteria
1. Michael reaches Level 2 unprompted (fun bar). 2. Lundquist sees his own paper inside the
first 3 minutes (pop-up #1 fires in Level 1). 3. The bot debrief lands the autonomy argument
without a word of text from Bo. 4. Nothing in it embarrasses Bo if the whole committee plays.

## Decisions LOCKED (Bo, 22 Aug)
A. **Title: "OPERATION: OL PEJETA"** (Bo typed "Peteja", corrected to the real spelling).
   Page frame subtitle stays academic: "a playable field study of conservancy drone
   operations". Repo/URL: github.com/bolgacg/operation-olpejeta ->
   bolgacg.github.io/operation-olpejeta (reserved).
B. **Narrator: OPSY**, chirpy robotic ops assistant (browser TTS).
C. **Maximum recognisability EVERYWHERE**: real "Ol Pejeta" name with credit line, real
   aircraft names, real paper titles/first pages, WildOps and Maalouf credited by name, real
   ops numbers. Recognition is the strategy.

## CORRECTION (Bo, 22 Aug): the game IS part of the application
The 4209 CV and motivated application WILL reference the game "in a nice and soft way" —
overriding the earlier final-docs assumption. Consequence: the game must be LIVE at its URL
before Monday-morning submission; CV/ML get a soft one-line reference each, edited via vedit,
reprinted, render-asserted, re-staged to "SDU 4209 SUBMIT". Draft lines (Bo approves):
- CV, in the demos entry: "and Operation: Ol Pejeta, a playable study of conservancy drone
  operations built around the centre's own Kenya fieldwork (bolgacg.github.io/operation-olpejeta)."
- ML, one clause in the software paragraph: "including a playable operations study built
  around the centre's Kenya fieldwork, linked in my CV."

## The quantified bot-vs-human comparison (Bo, 22 Aug: "there must be a score")
One SHIFT SCORE, identical rules for human and bot, same seeded mission deck and wind:
- Mission completions: survey +800 · tracking +900 · vet sample +700 · ranger-support climax
  +1200 (partial credit by coverage % on survey/tracking)
- Wildlife disturbance events (noise-buffer entry): −300 each
- Drone lost (battery death mid-air / collision): −2000
- Fleet efficiency bonus: (mean battery % remaining at debrief) × 5
- Throughput line: missions per shift-hour (shown, not scored)
- Pre-flight time line: average gate time, target 13:00 (their 26->13 field story; shown)
DEBRIEF SCREEN: two columns (YOU / AUTONOMY LAYER), row per component, identical totals
formula, headline "Autonomy delta: +X%". Seeded => reproducible => honest. The bot is the
same planner the gate uses, run continuously; this is stated on screen.

## BUILD STATUS (21 Aug, late)
- Level 1 LIVE with all five playtest fixes.
- Level 2 LIVE (commit 83b00a4): shift clock 09:00->17:00 (~6 real minutes), six-mission deck
  arriving on schedule, five-rule pre-flight gate (energy reserve / wildlife buffers / thermal
  payload / controlled airspace / deconfliction) with plain-language refusals + paper pop-ups,
  tower clearance with 18s delay, 12:00->14:30 wind window (northern legs ~2x battery), road
  CORRIDOR routing (straight diagonals would permanently clip the mixed herd; routes follow the
  dirt track, shown in the "view plan as program" DSL as `corridor east_track`), dual-drone +
  mixed-herd disturbance rules, 17:00 debrief with YOU vs AUTONOMY LAYER table + AUTONOMY DELTA %.
- Passability PROVEN numerically: every mission has >=1 certifiable plan at rest; OP-05 is
  correctly refused on energy during the wind window and passes after it lifts (the drama beat).
- Herds drift home after scatters (prevents corridor soft-lock).
- Test params (dev only): ?l2=1 boots straight into L2, &t=HH.H jumps the clock, &sim=refuse|fly|debrief.
- REMAINING (optional polish): energy-paper first-page image in its pop-up, provenance/tour
  section, promotion cutscene. CV/ML soft-reference lines still awaiting Bo approval.

## BUILD STATUS 2 (22 Aug, Bo's live playtest round)
- FIXED from Bo's round-2 feedback: TTS voice forced en-US (was Danish system voice, pitch 1.6 → 1.0);
  L1 crash overlay + TRY AGAIN; battery bar over flying drones; rhino = bonus photo target (+400);
  ↺ RESTART in HUD; pixel tut-arrow (emoji replaced, gamebox-relative coords, hides on touch,
  walkthrough-only); KEEP FLYING removed (softlocked L1).
- Teaching layer: fleet briefing card between L1 and the desk (roles + real specs 43min/34min/249g),
  role labels on assign buttons, "OPSY suggests" per mission, "→ Fix:" line under every refusal.
- ROUTE CHOICE (answer to "why train if paths auto-draw"): NE requests toggle CORRIDOR vs DIRECT;
  direct is shorter but refused when it cuts a buffer — L1's red-circle lesson becomes the desk decision.
- Herd wander now bounded ±4px around home (was integrating drift onto the corridor).
- Scoring fixed per Bo: shift score = L2 points only (L1 no longer leaks in), battery worth 1/pct
  (tiebreaker), missions dominate.
- Real-fieldwork sprinkles (all grounded in Maalouf et al. ICUAS 2025, Lundquist co-author):
  Ewaso river on map + west-of-river rule, PAPERS.airspace card with DIRECT QUOTE (tourist aircraft /
  two airstrips / military airport), airband+military ATC in clearance grant, Route 1/Route 2 in wind
  advisory, rth_failsafe in program view. NO NE camp claim in the paper — river rule used instead.
