#!/usr/bin/env python3
"""OPSY voice lines — pregenerated with edge-tts (en-US-GuyNeural).
Templated in-game lines get a generic spoken variant; exact numbers stay on screen.
Regenerate: python3 tools/make_vo.py   (writes assets/vo/<key>.mp3)"""
import asyncio, pathlib, sys
import edge_tts

VOICE = "en-US-GuyNeural"
RATE = "+4%"
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "vo"

LINES = {
  # Level 1
  "tut_start": "Good morning, coordinator! Drag a line from your drone to fly it.",
  "tut_takeoff": "Airborne! Fly into the green ring around the giraffes and hold steady. The camera fires itself. Never cross the red circle.",
  "tut_photo": "Beautiful shot! Now the zebras, then bring it home before the battery runs out.",
  "tut_landed": "Textbook landing. Fly, observe, disturb nothing, come home. That is the whole job.",
  "science_prompt": "Hold on. Before you go closer, read why that red circle is there. Real research, real zebras, this exact conservancy.",
  "zebra_done": "Zebra portfolio complete! The very herd from the noise study, by the way.",
  "rhino_bonus": "Bonus shot: the rhinos. The rangers will want that one on the wall.",
  "spooked": "You spooked the herd! Minus three hundred. Their therapist bills us.",
  "batt25": "Battery at twenty-five percent. Home is where the charger is!",
  "l1_down": "Drone down in the bush. That is minus two thousand. We do not talk about this at dinner.",
  "l1_flawless": "Flawless morning, coordinator. Not one animal looked up. I am telling the professor.",
  "l1_complete_disturbed": "Assignment complete. Next time we try it without frightening the locals.",
  "sound_on": "Sound on. I have been talking this whole time, you know.",
  # Level 2 desk
  "desk_intro": "Nine o'clock. The desk is yours: three aircraft, three pads, a queue of requests. Pick an aircraft on a card, then draw its route by hand. Out to the objective, home to any pad. The gate only argues about batteries; everything else is your judgement.",
  "draw_line": "Drawing. Drag a line from the aircraft to the objective and release there. Then draw the way home to any pad.",
  "stop_locked": "Objective locked. That is the stop. Now draw the way home: start at the stop, end on any pad.",
  "end_on_objective": "End the outbound line on the objective, then release.",
  "end_on_pad": "End the return line on one of the three pads.",
  "refuse_energy": "Refused: not enough battery for that line. Energy is the one thing the gate will not negotiate. Draw again.",
  "certified": "Certified. Aircraft is airborne.",
  "certified_warn": "Certified, with warnings on the card. Aircraft is airborne.",
  "new_request": "New request on the desk.",
  "ranger_priority": "Priority from the rangers: possible poacher near the rhinos. Thermal aircraft, controlled airspace, no mistakes.",
  "tower_logged": "Tower called. Clearance request logged; they answer on their own schedule, like all towers since the dawn of aviation.",
  "cleared": "Airband radio: cleared into the controlled sector. The real campaign coordinated with military A T C exactly this way. Fly it while it is yours.",
  "wind_on": "Wind advisory: stiff northerly until mid-afternoon. Northern legs now cost nearly double the battery. The Kenya team mapped route one for north winds and route two for south; our gate just recalculates.",
  "wind_off": "Wind advisory lifted. Northern legs are affordable again; the gate has recalculated.",
  "sector_fine": "Tower on the radio, not pleased: uncleared aircraft in the controlled sector. Minus five hundred.",
  "dual_drone": "Two aircraft over one herd. The dual-drone finding was not a suggestion. Minus three hundred.",
  "buffer_hit": "Buffer violation. Minus three hundred.",
  "l2_down": "Aircraft down in the bush. Recovery team dispatched. Minus two thousand.",
  "no_thermal": "The aircraft reached the stop with no thermal camera. The rangers saw nothing. Window lost.",
  "illuminated": "Area illuminated. Rangers moving in. The rhinos never knew we were there.",
  "bot_won": "The autonomy layer beat you. Do not take it personally; it does not take coffee breaks.",
  "matched_machine": "You matched the machine. I am genuinely impressed and slightly suspicious.",
}

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for key, text in LINES.items():
        mp3 = OUT / f"{key}.mp3"
        await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(mp3))
        print(f"{key}: {mp3.stat().st_size//1024}KB")
    print(f"{len(LINES)} lines -> {OUT}")

if __name__ == "__main__":
    asyncio.run(main())
