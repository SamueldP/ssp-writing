/**
 * Verbatim 1-to-1 reference data, C# / JSON source locations, In-Game Context flows,
 * Raylib UI pixel/character budgets, and Section 5 Audit Summary extracted strictly
 * from writing_code_audit.md.
 */

export type SourceBadgeKind = 'LIVE_JSON' | 'HARDCODED_CS' | 'NOT_WIRED';

export interface SourceBadgeInfo {
  kind: SourceBadgeKind;
  label: string;
  location: string;
  note?: string;
}

export interface InGameContextFlow {
  before: string;
  thisLine: string;
  after: string;
  pacingNote?: string;
}

export interface RaylibLimitSpec {
  id: string;
  label: string;
  virtualRect: string;
  innerWidthPx: number;
  denseRow: boolean;
  charsPerLineZero: number;
  charsPerLinePlusThree: number;
  maxLines?: number;
  softCharLimit: number;
  enforceSingleLineAtPlusThree?: boolean;
  notes: string;
}

// ============================================================================
// SECTION 4: CALIBRATED RAYLIB UI TEXT WIDTH & FORMATTING CONSTRAINTS
// ============================================================================

export const RAYLIB_LIMITS: Record<string, RaylibLimitSpec> = {
  comms_line: {
    id: 'comms_line',
    label: 'CRT Comms Spoken Line (334px inner, fontSize 10)',
    virtualRect: 'B1/B2: (680, 40, 364, 172) | Option A: (908, 40, 364, 216)',
    innerWidthPx: 334,
    denseRow: false,
    charsPerLineZero: 41,
    charsPerLinePlusThree: 35,
    maxLines: 4,
    softCharLimit: 140,
    notes: 'Speaker tags (> BOOTH 04: , CAPT: , HAIL [REG]: ) consume 6–18 chars on line 1. 11 visible rows (scrollable, 65 chars/sec).'
  },
  talking_head_hail: {
    id: 'talking_head_hail',
    label: 'Pre-Shift Live Viewscreen Hail (334px inner, 32 chars/sec)',
    virtualRect: 'B1/B2: (680, 40, 364, 172) · 11 visible rows',
    innerWidthPx: 334,
    denseRow: false,
    charsPerLineZero: 41,
    charsPerLinePlusThree: 35,
    maxLines: 11,
    softCharLimit: 385,
    notes: 'Streams at 32 chars/sec with 0.95s pause between lines. Keep individual spoken sentences under ~140 chars (~4 wrapped lines at +3).'
  },
  morning_directive: {
    id: 'morning_directive',
    label: 'Morning Shift Directive (CRT Comms Log, 334px inner)',
    virtualRect: 'Printed into CRT Comms Log (680, 40, 364, 172)',
    innerWidthPx: 334,
    denseRow: false,
    charsPerLineZero: 41,
    charsPerLinePlusThree: 35,
    maxLines: 14,
    softCharLimit: 490,
    notes: 'WrapTextByPixelWidth (max 64 lines). Keep ==== or ---- dividers <= 35 chars so they do not wrap/clip at +3 font offset.'
  },
  field_booklet_page: {
    id: 'field_booklet_page',
    label: 'Field Booklet Page ("884-D — MY NOTES", 280px inner, denseRow: true)',
    virtualRect: 'Open: 316 x 264 (FieldBooklet.cs:22-25, 322-331)',
    innerWidthPx: 280,
    denseRow: true,
    charsPerLineZero: 35,
    charsPerLinePlusThree: 35,
    maxLines: 9,
    softCharLimit: 315,
    notes: 'Locked at 16px (~35 chars/line) across +0..+3 offsets. Hard cap of 1 header + 9 body lines (~315 chars); NOT scrollable (excess clipped).'
  },
  email_subject: {
    id: 'email_subject',
    label: 'Terminal MESSAGES Subject (Unread 246px / Read 300px)',
    virtualRect: 'Left Inbox row 316 x 52 (TerminalOverlay.cs:1092-1156)',
    innerWidthPx: 246,
    denseRow: false,
    charsPerLineZero: 31,
    charsPerLinePlusThree: 25,
    maxLines: 1,
    softCharLimit: 31,
    enforceSingleLineAtPlusThree: true,
    notes: 'Truncated single line: ~25 chars (+3 unread) / ~31 chars (+0 unread) / ~37 chars (+0 read).'
  },
  email_body: {
    id: 'email_body',
    label: 'Terminal MESSAGES Reader Body (688px inner)',
    virtualRect: 'Right Reader (448, 112, 736, 496) · 26 visible lines',
    innerWidthPx: 688,
    denseRow: false,
    charsPerLineZero: 86,
    charsPerLinePlusThree: 72,
    maxLines: 26,
    softCharLimit: 1500,
    notes: 'WrapMultilineText at 688px (~86 chars/line @ +0, ~72 chars/line @ +3). Keep horizontal ---- dividers <= 72 chars so they do not overflow at +3.'
  },
  forum_title: {
    id: 'forum_title',
    label: 'FORUM Thread Title (Left Index 332px, max 2 lines)',
    virtualRect: 'Left Thread List (96, 164, 376, 444) · row 348 x 54',
    innerWidthPx: 332,
    denseRow: false,
    charsPerLineZero: 41,
    charsPerLinePlusThree: 34,
    maxLines: 2,
    softCharLimit: 68,
    notes: 'Left index wraps up to 2 lines (~34 chars/line @ +3 -> 68 chars max; ~82 chars @ +0). Right header truncates [TAG] + Title at 680px (~71 chars @ +3).'
  },
  forum_body: {
    id: 'forum_body',
    label: 'FORUM Post & Reply Body (656px wrap width)',
    virtualRect: 'Right Stream (480, 195, 704, 413) · 24 visible lines',
    innerWidthPx: 656,
    denseRow: false,
    charsPerLineZero: 82,
    charsPerLinePlusThree: 69,
    maxLines: 24,
    softCharLimit: 820,
    notes: '~82 chars/line (+0) / ~69 chars/line (+3), 24 visible lines (scrollable). Author header (@Handle [Role] -- Time) truncates at 660px (~69 chars @ +3).'
  },
  corridor_poster_wall: {
    id: 'corridor_poster_wall',
    label: 'Corridor Wall Poster / Banner (72px wall / 520px transit banner)',
    virtualRect: 'Wall Poster 72x48 (~60px) | Transit Banner 540x74 (~520px)',
    innerWidthPx: 520,
    denseRow: false,
    charsPerLineZero: 65,
    charsPerLinePlusThree: 54,
    maxLines: 1,
    softCharLimit: 54,
    enforceSingleLineAtPlusThree: true,
    notes: 'In-world wall poster fits ~7 chars/line; centered transit banner fits ~54 chars (+3) / ~65 chars (+0) with no wrap.'
  },
  corridor_poster_body: {
    id: 'corridor_poster_body',
    label: 'Corridor Zoom-In Poster Body (Proposed Modal)',
    virtualRect: 'Not wired in CorridorScreen.cs yet',
    innerWidthPx: 520,
    denseRow: false,
    charsPerLineZero: 65,
    charsPerLinePlusThree: 54,
    maxLines: 6,
    softCharLimit: 270,
    notes: 'Proposed zoomable poster fine print (~54 chars/line @ +3).'
  },
  corridor_bark: {
    id: 'corridor_bark',
    label: 'Corridor Overhead Bark / Transit Subtitle (520px inner)',
    virtualRect: 'Transit Banner (540 x 74) · CorridorScreen.cs:264-294',
    innerWidthPx: 520,
    denseRow: false,
    charsPerLineZero: 65,
    charsPerLinePlusThree: 54,
    maxLines: 1,
    softCharLimit: 54,
    enforceSingleLineAtPlusThree: true,
    notes: 'Keep single-line transit banners / overhead barks <= 54 chars so they do not overflow 540px at +3 font offset.'
  },
  failure_ending_card: {
    id: 'failure_ending_card',
    label: 'Failure Ending Screen (720x440, ~680px safe inner, NO WRAP)',
    virtualRect: '(280, 140, 720, 440) · QuartersScreen.cs:2202-2228',
    innerWidthPx: 680,
    denseRow: false,
    charsPerLineZero: 85,
    charsPerLinePlusThree: 71,
    maxLines: 3,
    softCharLimit: 213,
    enforceSingleLineAtPlusThree: true,
    notes: 'Title (@20px): max 38 chars (+3) / 42 (+0). Body 1 & Body 2 (@10px, single-line centered, NO WRAP): max 71 chars/line (+3) / 85 (+0).'
  },
  victory_ending_card: {
    id: 'victory_ending_card',
    label: 'Intro / Victory Ending Card Plaque (808px wrap, fontSize 18)',
    virtualRect: '920 x 528 card -> 856 x 140 plaque (IntroScreen.cs:25-28, 160-182)',
    innerWidthPx: 808,
    denseRow: false,
    charsPerLineZero: 70,
    charsPerLinePlusThree: 58,
    maxLines: 5,
    softCharLimit: 290,
    notes: 'Reference IntroScreen.cs plaque: wraps at 808px (~58 chars/line @ +3, ~70 @ +0), max 5 lines (~290 chars per card).'
  },
  raid_audit_modal: {
    id: 'raid_audit_modal',
    label: 'Sleep Raid Audit Modal Log Line (756px inner, max 11 lines)',
    virtualRect: '(224, 104, 832, 512) -> log box 784 x 344 (QuartersScreen.cs:2162-2200)',
    innerWidthPx: 756,
    denseRow: false,
    charsPerLineZero: 94,
    charsPerLinePlusThree: 79,
    maxLines: 11,
    softCharLimit: 869,
    enforceSingleLineAtPlusThree: true,
    notes: 'Each log entry is single-line truncated at 756px (~79 chars/line @ +3, ~94 @ +0), max 11 lines total (not scrollable).'
  }
};

// ============================================================================
// SECTION 1: TURN-BY-TURN ENCOUNTER SCRIPT FLOW (REFERENCE PANEL DATA)
// ============================================================================

export interface EncounterFlowStage {
  stage: string;
  title: string;
  sourceLoc: string;
  summary: string;
  steps: {
    num: string;
    speaker: 'SYSTEM' | 'OFFICER' | 'CAPTAIN' | 'NOTE';
    line: string;
    detail: string;
  }[];
}

export const ENCOUNTER_SCRIPT_FLOW: EncounterFlowStage[] = [
  {
    stage: 'STAGE 0',
    title: 'Pre-Shift Live Viewscreen Hails (Before Ship 1, Shift Timer Frozen)',
    sourceLoc: 'UI/DeskScreen.cs:1086-1121 · UI/DeskScreen.ProtocolsAndComms.cs:14-352',
    summary: 'Triggered in DeskScreen.OnEnter() at 32 chars/sec with 0.95s line pause. On non-hail days, BuildDailyShiftDirectiveLines() prints directly as [SYSTEM].',
    steps: [
      {
        num: '0.1',
        speaker: 'CAPTAIN',
        line: 'Day 1 Vorst (8 lines) · Day 2 Nixa (5 lines) · Day 4 Vorst Branch A/B (4 lines) · Day 8 Nixa (7 lines) · Day 15 Nixa (4 lines)',
        detail: 'Opens with [INTERNAL HAIL] header. When closed, prints [SYS] HAIL CLOSED + daily shift directive lines + "PRESS [NEXT HAIL] TO BEGIN DAY XX WATCH."'
      }
    ]
  },
  {
    stage: 'STAGE 1',
    title: 'Ship Arrival & Greeting + Inline recentCallbacks',
    sourceLoc: 'UI/DeskScreen.cs:1718-1735, 2682-2756 · Simulation/ShipGenerator.cs:995-1022',
    summary: 'Player clicks [NEXT HAIL] -> ShipGlidingIn (3.2s) -> OpeningGreetingDelay (0.18s).',
    steps: [
      {
        num: '1.1',
        speaker: 'SYSTEM',
        line: '"APPROACH VECTOR LOCKED -- VESSEL GLIDING INTO BAY..."',
        detail: 'Displays during the 3.2s ShipGlidingIn phase, then clears when vessel reaches bay.'
      },
      {
        num: '1.2',
        speaker: 'CAPTAIN',
        line: 'HAIL [{RegistrationCode}]: "{GreetingHailLine}"',
        detail: 'Assembly order: C# prefix fallback -> overridden by faction_pools.json greetings (if non-TODO) -> if EncounterHistoryQuery matches [day-3..day-1] (TookBribe > RepeatedDetentions >= 2 > ClearedViolation >= 1), recentCallbacks line is APPENDED INLINE separated by a single space: "{greeting} {callbackLine}". (Day 3 Ghost Route bypasses faction_pools.json).'
      }
    ]
  },
  {
    stage: 'STAGE 2',
    title: 'Protocol Request & Automatic Shields-Down Cadence',
    sourceLoc: 'UI/DeskScreen.cs:1739-1747, 2025-2096 · Simulation/ShipGenerator.cs:1024-1026',
    summary: 'Fires automatically 0.18s after OpeningGreetingDelay begins.',
    steps: [
      {
        num: '2.1',
        speaker: 'OFFICER',
        line: '> BOOTH 04: "Send subspace protocols."',
        detail: 'Enqueued automatically with preDelaySeconds: 0.10f behind the arrival greeting.'
      },
      {
        num: '2.2',
        speaker: 'OFFICER',
        line: '[ONLY if ActualShieldsUp == true] "..." (0.25s) -> > BOOTH 04: "Shields down, please." (0.20s)',
        detail: 'Enters AwaitingAutoShieldsDrop (ComplianceDelaySeconds: >=+6 rep 0.20s, mid 0.55s, <=-5 rep 1.35s).'
      },
      {
        num: '2.3',
        speaker: 'CAPTAIN',
        line: 'Complied: CAPT: "Shields down." (or "Fine. Dropping shields now." if rep <= -5) | Refused (Day 22+ & rep <= -9): CAPT: "{RefusalLine}"',
        detail: 'Followed by [SYS] SHIELDS LOWERED -- SUBSPACE CHANNEL CLEAR. (or [SYS] COMPLIANCE REFUSAL VERIFIED. which skips download and jumps to InspectingSlateAndShip).'
      },
      {
        num: '2.4',
        speaker: 'SYSTEM',
        line: 'DownloadingProtocols (1.80s) onto Primary Data Slate (or Blank Contraband Slate in Slate Bus)',
        detail: 'If Slate Bus is empty: "[SLATE BUS] NO SLATE DETECTED -- PLUG DATA SLATE INTO SLATE BUS."'
      }
    ]
  },
  {
    stage: 'STAGE 3',
    title: 'Protocol Download Completion, Wafer Demux & Auto-Interrogation',
    sourceLoc: 'UI/DeskScreen.cs:2242-2334 · Simulation/ShipGenerator.cs:1053-1082',
    summary: 'Triggered when Primary Data Slate download reaches 1.80s.',
    steps: [
      {
        num: '3.1',
        speaker: 'CAPTAIN',
        line: 'CAPT: "{SubspaceUploadLine}"',
        detail: 'C# fallbacks: ORN- "Checksum packet sent.", BMC- "Telemetry uploaded.", PRJ- "Packet sent!", default "Protocols sent." (preDelay: 0.16s).'
      },
      {
        num: '3.2',
        speaker: 'SYSTEM',
        line: '[Day 12+ Wafer Demux] Prints Ceramic Cargo Manifest Cert-Wafer (or warns if omitted / hopper empty 0/3)',
        detail: 'If hopper empty: "[WAFER WRITER] HOPPER EMPTY (0/3) -- PRINT HELD. WIPE A WAFER IN TOP SLOT." + NOTE.'
      },
      {
        num: '3.3',
        speaker: 'OFFICER',
        line: '> BOOTH 04: "Confirm route, purpose of visit, and cargo."',
        detail: 'Auto-Interrogation fires automatically on Day 1+ (preDelay: 0.08s).'
      },
      {
        num: '3.4',
        speaker: 'CAPTAIN',
        line: 'CAPT: "{AutoInterrogationReplyLine}"',
        detail: 'Routine format: "{spokenOrigin} to {shortDest}. {shortPurpose}. {spokenCargo}." Marked as isCaptainStatementEvidence: true for Protocol Review pairing.'
      }
    ]
  },
  {
    stage: 'STAGE 4',
    title: 'Mid-Encounter Interactions (Inspection Phase)',
    sourceLoc: 'UI/DeskScreen.HardwareModules.cs:143-164 · UI/DeskScreen.ProtocolsAndComms.cs:360-1281 · UI/DeskScreen.cs:2120-2551',
    summary: 'On-demand interactions while vessel is in InspectingSlateAndShip (Phase 6).',
    steps: [
      {
        num: '4A',
        speaker: 'OFFICER',
        line: '[Slate Unplug / Re-Transmit] > BOOTH 04: "Link dropped. Re-transmit subspace protocols." -> CAPT: "{ReTransmitAnnoyedLine}"',
        detail: 'On Day 6+ silent Blank Slate swap: > BOOTH 04: "Send subspace protocols." (no annoyed reply). Prematurely wiped wafer: > BOOTH 04: "Re-transmit auxiliary certificates." -> CAPT: "Already sent them. Sending again."'
      },
      {
        num: '4B',
        speaker: 'OFFICER',
        line: '[Day 2+ Auto-SPS Weapons] > BOOTH 04: "Power down weapons." (fires ONLY when SPS reticle sweeps near hot weapon mount)',
        detail: 'Never fires on arrival! Honest: CAPT: "Weapons cold." (or "Cutting weapon power." if rep <= -5). Liar (SpoofedBluff): CAPT: "{SpoofedWeaponsBluffLine}" (mounts stay orange-hot). Refusal: CAPT: "{RefusalLine}".'
      },
      {
        num: '4C',
        speaker: 'OFFICER',
        line: '[Day 3 Ghost Route Only] Click [INSPECT ROUTE] -> > BOOTH 04: "Your departure timing does not match the {declaredOrigin} lane."',
        detail: '0.28s portrait static flicker -> 0.60s [RECEIVING...] -> Captain deflection challenging you to clear or explain to Kordani Command.'
      },
      {
        num: '4D',
        speaker: 'OFFICER',
        line: '[Protocol Review Discrepancy] [PROTOCOL FAULT] (0.50s) -> > BOOTH 04: "{officerPrompt}" -> 0.60s [RECEIVING...] -> CAPT: "{captainExcuse}"',
        detail: 'Flushes prior comms. Checks faction_pools.json excuses[key] -> excuses["General"] -> C# ShipGenerator fallback. (6 cargo/spoken/stoker faults use C# fallback only).'
      },
      {
        num: '4E',
        speaker: 'CAPTAIN',
        line: '[Covert Delivery Upload (1.35s)] Intended Recipient (2 lines + crystal burnt) | KDF-/BMC- Pact Cruiser (alarm + +1 Strike) | Wrong Civilian (junk buffer complaint)',
        detail: 'Triggered by slotting a pre-loaded Covert Mission Data Slate into the Slate Bus while a ship is docked.'
      }
    ]
  },
  {
    stage: 'STAGE 5',
    title: 'Clearance, Detention & Departure',
    sourceLoc: 'UI/DeskScreen.cs:1826-1906, 2553-2850',
    summary: 'Resolution via Clearance Dock -> Slate Bus (Path A) or Detain Lever (Path B).',
    steps: [
      {
        num: '5A',
        speaker: 'SYSTEM',
        line: '[Path A — Grant Access] Clearance Dock (1.80s) -> Slate Bus TX (1.80s) -> "[SLATE BUS] CLEARANCE TRANSMITTED -- DEPARTURE AUTHORIZED."',
        detail: 'Captains have NO departure or thank-you spoken line. Resolves after 1.25s -> "[DOCKED] Vessel {reg} cleared (+10 SC)."'
      },
      {
        num: '5B',
        speaker: 'CAPTAIN',
        line: '[Path B — Detain Lever] > BOOTH 04: [DETAIN LEVER PULLED -- {tag}] -> CAPT: "{DetentionReactionLine}"',
        detail: 'Snaps active comms immediately. WARNING: Zero C# fallback for DetentionReactionLine — if faction_pools.json is [TODO], captain emits silence! Clamps finish in 1.80s.'
      }
    ]
  }
];

// ============================================================================
// SECTION 3.2: VERBATIM AUTHORED FACTION POOLS (FTV- & MNG-)
// ============================================================================

export const AUTHORED_FACTION_POOLS_VERBATIM: Record<
  'FTV-' | 'MNG-',
  {
    greetings: string[];
    excuses: Record<string, string[]>;
    detentionReactions: string[];
    recentCallbacks: {
      ClearedViolation: string[];
      RepeatedDetentions: string[];
      TookBribe: string[];
    };
  }
> = {
  'FTV-': {
    greetings: [
      '{shipName} ({reg}) holding. Clear our lane.',
      '{shipName}, {reg}, inbound. Run the check.',
      'Tramp hull {reg} holding. Packet queued.'
    ],
    excuses: {
      TransponderMismatch: [
        'Beacon {reg} was re-riveted in a drydock rush out on the rim — the hull transponder just lags a cycle behind.',
        'Brown Dwarf static chews half our packet headers. Trust the slate on {shipName}, not that bargain-bin receiver.'
      ],
      FalsifiedOriginWaveform: [
        'We skirted a gravity eddy off {origin} to dodge toll pickets — that coil trace always bends funny afterward.',
        'Look, independent haulers take the quiet drift lanes out of {origin}. Your salvaged spectrometer is reading ghosts.'
      ],
      General: [
        "We're scraping margin on thin fuel out of {origin} — give an independent captain some slack on the paperwork.",
        "Brengop factors squeeze us at every buoy. It's a harmless filing snag on {reg}, nothing worth locking clamps over.",
        "Look, {shipName} hauls honest freight for outer-belt ports. Don't bury us in Pact fines over a clerk's typo."
      ]
    },
    detentionReactions: [
      'Clamps?! That impound fee is going to wipe three weeks of salvage margin on {shipName}!',
      "Easy on the hull, Booth 04! You keep clamping free traders and nobody's going to haul water to your dock.",
      'Fine — lock the berth! Tell the Brengop factor he can try squeezing Scrip out of an empty hold.'
    ],
    recentCallbacks: {
      ClearedViolation: [
        'Word on the outer buoys says Booth 04 cuts free traders a break on messy slates. Good to know.',
        'Heard from a tramp crew out of {origin} that you waved a rough packet through. Appreciate the fair watch.'
      ],
      RepeatedDetentions: [
        'Free Trader channels are flashing red about Booth 04 clamps. Keep your finger off that lever, officer.',
        'Two tramp hulls detained in as many shifts — half the independent lane is thinking of bypassing Void Gate 3.'
      ],
      TookBribe: [
        'Chatter on the rim says Booth 04 knows how to pocket quiet Scrip when the slate gets thick.',
        "Captains along the drift say you're open to practical arrangements if the manifest runs heavy."
      ]
    }
  },
  'MNG-': {
    greetings: [
      'Guild rig {shipName} holding. Cycle our packet.',
      '{reg}, Guild haul inbound. Open the lane.',
      '{shipName} ({reg}) holding. Keep the scan brisk.'
    ],
    excuses: {
      TransponderMismatch: [
        'Ore grit and micro-slag eat transponder casings on the Oruun-4 run — {reg} is valid on the syndicate ledger.',
        'That hull unit got swapped off a sister barge in the belt. Check the slate checksum for {shipName}, not the casing.'
      ],
      FalsifiedOriginWaveform: [
        'High-iron belt dust off {origin} twists every warp residue coil in this sector. Ask your maintenance chief.',
        'We ran a sling-burn around heavy slag fields outside {origin}. Your secondhand strip is reading belt static.'
      ],
      General: [
        'Guild dispatch stamped {reg} before launch — take up any clerical noise with the Dul-Krag factor, not my crew.',
        'Every hour {shipName} sits in holding costs tonnage at the refinery. Clear the berth and file a note.',
        "We haul steel and silicate for Pact foundries. A smudge on the slate doesn't make us smugglers."
      ]
    },
    detentionReactions: [
      "You're clamping a Mining Guild rig?! Dispatch will have your berth tariff tripled by morning!",
      'Big mistake, Booth 04. Delaying Guild ore out of {origin} lands straight on the Brengop ledger.',
      'Lock the clamps then — our claim-guard escorts will remember who stalled {shipName} at the gate.'
    ],
    recentCallbacks: {
      ClearedViolation: [
        'Syndicate dispatch noted you kept Guild ore moving last shift despite slate hiccups. Smart watch, clerk.',
        "Word in the Oruun-4 haulers' channel is Booth 04 doesn't nitpick Guild barges. Keep the lane green."
      ],
      RepeatedDetentions: [
        "Guild foremen are fuming over Booth 04 clamping our rigs two shifts running. Don't test the syndicate.",
        "Watch yourself, clerk — holding up Guild tonnage puts your station's ore quotas in the red."
      ],
      TookBribe: [
        'Foremen say Booth 04 takes a practical cut to keep heavy rigs on schedule. Good to keep in mind.',
        'Heard around the Oruun-4 docks that a little extra Scrip clears Guild paperwork real fast here.'
      ]
    }
  }
};

// Hardcoded C# prefix greeting fallbacks in Simulation/ShipGenerator.cs:997-1004
export const CS_HARDCODED_GREETING_FALLBACKS: Record<string, string> = {
  'KDF-': '{shipName} holding. Pact military transit.',
  'BMC-': '{shipName} inbound. Time is Scrip.',
  'KRW-': '{shipName} at gate. Process our lane.',
  'ORN-': '{reg} holding vector. Telemetry ready.',
  'PRJ-': '{shipName} holding! Very legal dock!',
  'HBR-': '{shipName} requesting Void Gate transit.',
  'GUV-': '{shipName} holding. Requesting standard dock.',
  'FTV-': '{shipName} holding. Clear our lane.',
  'MNG-': '{shipName} holding. Clear our lane.',
  'FTC-': '{shipName} holding. Clear our lane.',
  'ZNI-': '{shipName} holding. Clear our lane.',
  'TLV-': '{shipName} holding. Clear our lane.',
  DEFAULT: '{shipName} holding. Clear our lane.'
};

// ============================================================================
// EXCUSE KEYS METADATA (9 LIVE IN faction_pools.json + 6 C#-ONLY + 3 FUTURE)
// ============================================================================

export interface ExcuseKeyAuditMeta {
  key: string;
  legacyAliases?: string[];
  label: string;
  day: string;
  sortDay: number;
  system: string;
  inFactionPoolsJson: boolean;
  sourceBadge: SourceBadgeInfo;
  discrepancyPair: string;
  infractionEnum: string;
  officerChallengePrompt: string;
   officerChallengeSource: string;
  csCaptainFallbackExcuse: string;
  csFallbackSource: string;
}

export const EXCUSE_KEYS_AUDIT: ExcuseKeyAuditMeta[] = [
  // --- 9 KEYS LIVE IN data/dialogue/faction_pools.json ---
  {
    key: 'TransponderMismatch',
    legacyAliases: ['TransponderIdMismatch'],
    label: 'Transponder ID vs. Data Slate REG CODE',
    day: 'Day 1+',
    sortDay: 1,
    system: 'Basic Registration',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.TransponderMismatch'
    },
    discrepancyPair: 'DataSlatePrefix + VisualSignalTransponderId',
    infractionEnum: 'ShipInfractionType.TransponderIdMismatch',
    officerChallengePrompt: `> BOOTH 04: "Our raw transponder reads '{RawTransponderId}', which does not match your Data Slate code '{RegistrationCode}'."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:448',
    csCaptainFallbackExcuse: `"Raw sensor ID {spec.GroundTruth.RawTransponderId}?! Brown Dwarf static must be scrambling your local transponder receiver -- trust the Data Slate!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1091'
  },
  {
    key: 'SpoofedWeaponsHot',
    legacyAliases: ['SpoofedHotWeapons'],
    label: 'Spoofed Hot Weapons ([!] HOT WEAPONS)',
    day: 'Day 2+',
    sortDay: 2,
    system: 'SPS Probe',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.SpoofedWeaponsHot'
    },
    discrepancyPair: 'DataSlateWeapons + SpsMiniScreenHotWeapons / SpsLensConduit',
    infractionEnum: 'ShipInfractionType.SpoofedWeaponsHot',
    officerChallengePrompt: `> BOOTH 04: "Your Data Slate claims weapons OFFLINE, yet SPS shows live power feeding forward mounts."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:482',
    csCaptainFallbackExcuse: `"Look, our slate clearly says weapons OFFLINE! That hot orange glow on your SPS is just a... faulty diagnostic shunt. We aren't powering anything down!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1094'
  },
  {
    key: 'FalsifiedOriginWaveform',
    legacyAliases: ['WarpMismatch'],
    label: 'Falsified Origin Waveform / Ashen Rift Bleed',
    day: 'Day 4+',
    sortDay: 4,
    system: 'Warp Checker',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.FalsifiedOriginWaveform'
    },
    discrepancyPair: 'DataSlateOrigin / CommsTranscriptStatement + WarpStripPaper',
    infractionEnum: 'ShipInfractionType.FalsifiedOriginWaveform',
    officerChallengePrompt: `> BOOTH 04: "Your thermal warp strip does not match your declared departure from {OriginSystem}."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:492',
    csCaptainFallbackExcuse: `"Your salvaged spectrometer coil is drifting! Our logbook says {spec.Slate.OriginSystem} -- ignore that waveform strip!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1097'
  },
  {
    key: 'ExpiredRegistration',
    label: 'Expired Registration (EXP: CYC vs. Header Cycle)',
    day: 'Day 8+',
    sortDay: 8,
    system: 'Reference Manual Pt 1',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.ExpiredRegistration'
    },
    discrepancyPair: 'DataSlateExpiry + TopHeaderCycle',
    infractionEnum: 'ShipInfractionType.ExpiredRegistration',
    officerChallengePrompt: `> BOOTH 04: "Your registration expired on {RegistrationExpiryDisplay}. Current cycle is {curCycle}."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:454',
    csCaptainFallbackExcuse: `"Our renewal fee was wired to the port factor last month! {spec.Slate.RegistrationExpiryDisplay} is just a clerical lag -- cut us a break!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1100'
  },
  {
    key: 'PrefixOrganizationMismatch',
    legacyAliases: ['PrefixOrgMismatch'],
    label: 'Prefix vs. Organization Mismatch (SHIP REGISTRAR)',
    day: 'Day 8+',
    sortDay: 8,
    system: 'Reference Manual Pt 1',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.PrefixOrganizationMismatch'
    },
    discrepancyPair: 'DataSlatePrefix / Org + DataSlateOrg / Manual Prefix',
    infractionEnum: 'ShipInfractionType.PrefixOrganizationMismatch',
    officerChallengePrompt: `> BOOTH 04: "Prefix '{DeclaredPrefix}' does not belong to '{DeclaredFactionName}'."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:459',
    csCaptainFallbackExcuse: `"Charter lease paperwork changed hands mid-run! {prefix} and {spec.Slate.DeclaredFactionName} share the same holding broker -- mostly!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1103'
  },
  {
    key: 'PrefixSpeciesMismatch',
    label: 'Prefix vs. Captain Species Mismatch (SPECIES REGISTRAR)',
    day: 'Day 8+',
    sortDay: 8,
    system: 'Reference Manual Pt 1',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.PrefixSpeciesMismatch'
    },
    discrepancyPair: 'DataSlatePrefix / Org / Species + DataSlateSpecies / Manual Species',
    infractionEnum: 'ShipInfractionType.PrefixSpeciesMismatch',
    officerChallengePrompt: `> BOOTH 04: "Prefix '{DeclaredPrefix}' is restricted and does not permit a {DeclaredCaptainSpecies} captain."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:464',
    csCaptainFallbackExcuse: `"The regular captain came down with drift-fever before departure! I am only filling in on the {prefix} bridge for one jump!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1106'
  },
  {
    key: 'PrefixHullSilhouetteMismatch',
    legacyAliases: ['HullMismatch'],
    label: 'Hull Silhouette / Ship Class Mismatch (HULLS Tab)',
    day: 'Day 10+',
    sortDay: 10,
    system: 'Reference Manual Pt 2',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.PrefixHullSilhouetteMismatch'
    },
    discrepancyPair: 'DataSlatePrefix / Org / Class + ViewportShipHull / Manual Hull',
    infractionEnum: 'ShipInfractionType.PrefixHullSilhouetteMismatch (shared by Class & Hull)',
    officerChallengePrompt: `> BOOTH 04 (Hull): "Your Data Slate declares '{DeclaredPrefix}', which does not match your hull silhouette." (:476) | (Class): "Your Data Slate declares a {ShortClass(Declared)} vessel, yet sensors show a {ShortClass(Actual)} hull silhouette." (:471)`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:471, 476',
    csCaptainFallbackExcuse: `Hull (:1085): "Wait -- we bought this hull surplus last quarter! The registry refit paperwork for {reg} must still be stuck in port processing!" | Class (:1088): "Our {ShortClass} hull classification was updated at drydock -- your visual sensors must be misreading our refit!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1085, 1088'
  },
  {
    key: 'UnexplainedCargoPowerDraw',
    label: 'Unexplained Violet Cargo Power Draw ([!] POWERED CARGO)',
    day: 'Day 12+',
    sortDay: 12,
    system: 'SPS Probe & Wafer Cargo',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.UnexplainedCargoPowerDraw'
    },
    discrepancyPair: 'DataSlateCargo / CargoManifestWafer + SpsMiniScreenCargoPower / SpsLensConduit',
    infractionEnum: 'ShipInfractionType.UnexplainedCargoPowerDraw',
    officerChallengePrompt: `> BOOTH 04: "Your manifest declares an empty unpowered hold, yet SPS shows high-draw violet power in your cargo bay."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:487',
    csCaptainFallbackExcuse: `"Violet draw in our hold? Just... deck heaters! Keep your scanner off our cargo bay and clear the berth!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1109'
  },
  {
    key: 'General',
    label: 'General Catch-All Plea / Fallback Excuse',
    day: 'Any Day',
    sortDay: 1,
    system: 'Protocol Review Fallback',
    inFactionPoolsJson: true,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json · excuses.General',
      note: 'TRAP WARNING (ShipGenerator.cs:1157-1164): PickExcuseOrDefault checks excuses.General BEFORE C# infraction-specific fallbacks!'
    },
    discrepancyPair: 'Fallback when specific JSON excuse key is [TODO] (or RefusedShieldsOrWeaponsCompliance alias)',
    infractionEnum: 'General fallback bucket',
    officerChallengePrompt: '> BOOTH 04: "{Any of the 9 JSON-wired Protocol Review officer challenges}"',
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:448-492',
    csCaptainFallbackExcuse: 'Note: For FTV- and MNG-, authored excuses.General currently overrides C# specific fallbacks whenever a specific JSON excuse key is still [TODO].',
    csFallbackSource: 'Simulation/ShipGenerator.cs:1157-1164'
  },

  // --- 6 ACTIVE C# INFRACTIONS HARDCODED IN ShipGenerator.cs (NOT IN faction_pools.json YET) ---
  {
    key: 'SpokenRouteDiscrepancy',
    label: 'Spoken Route vs. Filed Origin Discrepancy',
    day: 'Day 1+',
    sortDay: 1,
    system: 'Auto-Interrogation',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'HARDCODED_CS',
      label: 'HARDCODED C# · NOT IN JSON YET',
      location: 'Simulation/ShipGenerator.cs:1112 · ProtocolsAndComms.cs:497'
    },
    discrepancyPair: 'CommsTranscriptStatement + DataSlateOrigin / WarpStripPaper',
    infractionEnum: 'ShipInfractionType.SpokenRouteDiscrepancy',
    officerChallengePrompt: `> BOOTH 04: "You stated departure from {SpokenOriginSystem} on comms, contradicting your filed origin {OriginSystem}."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:497',
    csCaptainFallbackExcuse: `"Did I say {spokenOrigin}? Long watch on the bridge -- check the slate, I meant {spec.Slate.OriginSystem}!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1112'
  },
  {
    key: 'SpokenCargoDiscrepancy',
    label: 'Spoken Cargo vs. Manifest Discrepancy',
    day: 'Day 1+',
    sortDay: 1,
    system: 'Auto-Interrogation',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'HARDCODED_CS',
      label: 'HARDCODED C# · NOT IN JSON YET',
      location: 'Simulation/ShipGenerator.cs:1115 · ProtocolsAndComms.cs:502'
    },
    discrepancyPair: 'CommsTranscriptStatement + CargoManifestWafer / DataSlateCargo',
    infractionEnum: 'ShipInfractionType.SpokenCargoDiscrepancy',
    officerChallengePrompt: `> BOOTH 04: "You declared {SpokenCargoItem} on comms, contradicting your Cargo Manifest ({WaferCargoManifestItem})."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:502',
    csCaptainFallbackExcuse: `"Uh, {spokenCargo} was our last haul! Quartermaster must have swapped the hold crates at launch!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1115'
  },
  {
    key: 'BannedCargoItem',
    legacyAliases: ['CargoBanned'],
    label: 'Permanently Banned Cargo Item (5-Item List)',
    day: 'Day 12+',
    sortDay: 12,
    system: 'Wafer Writer & Manual CARGO Tab',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'HARDCODED_CS',
      label: 'HARDCODED C# · NOT IN JSON YET',
      location: 'Simulation/ShipGenerator.cs:1118 · ProtocolsAndComms.cs:507'
    },
    discrepancyPair: 'CargoManifestWafer / DataSlateCargo + Manual Cargo (or SPS Violet)',
    infractionEnum: 'ShipInfractionType.BannedCargoItem',
    officerChallengePrompt: `> BOOTH 04: "Your Cargo Manifest lists {WaferCargoManifestItem}, which is permanently banned at Void Gate 3."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:507',
    csCaptainFallbackExcuse: `"Wait -- {spec.GroundTruth.WaferCargoManifestItem} is on the permanent contraband list?! The broker swore we had a transit exemption!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1118'
  },
  {
    key: 'CargoManifestDiscrepancy',
    label: 'Cert-Wafer vs. Data Slate Cargo Mismatch',
    day: 'Day 12+',
    sortDay: 12,
    system: 'Wafer Writer & Data Slate',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'HARDCODED_CS',
      label: 'HARDCODED C# · NOT IN JSON YET',
      location: 'Simulation/ShipGenerator.cs:1121 · ProtocolsAndComms.cs:512'
    },
    discrepancyPair: 'CargoManifestWafer + DataSlateCargo',
    infractionEnum: 'ShipInfractionType.CargoManifestDiscrepancy',
    officerChallengePrompt: `> BOOTH 04: "Your Cargo Manifest cert-wafer lists {WaferCargoManifestItem}, contradicting your Data Slate ({CargoManifest})."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:512',
    csCaptainFallbackExcuse: `"The cert-wafer says {spec.GroundTruth.WaferCargoManifestItem} while the slate says {spec.Slate.CargoManifest}? Dockside clerk loaded the wrong manifest lot!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1121'
  },
  {
    key: 'WithheldIllicitCargoManifest',
    label: 'Dishonest Omitted Cargo Manifest Cert-Wafer',
    day: 'Day 12+',
    sortDay: 12,
    system: 'Wafer Writer Module',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'HARDCODED_CS',
      label: 'HARDCODED C# · NOT IN JSON YET',
      location: 'Simulation/ShipGenerator.cs:1124 · ProtocolsAndComms.cs:517'
    },
    discrepancyPair: 'WaferWriterModule + any target (when OmittedManifestIsDishonest == true)',
    infractionEnum: 'ShipInfractionType.WithheldIllicitCargoManifest',
    officerChallengePrompt: `> BOOTH 04: "Your subspace bundle omitted the mandatory Cargo Manifest cert-wafer. Produce it or prepare for detention."`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:517',
    csCaptainFallbackExcuse: `"We... didn't file a cargo wafer at departure! Look, our hold is private charter -- just wave us through without it!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1124'
  },
  {
    key: 'StokerMassMismatch',
    legacyAliases: ['OverweightStoker'],
    label: 'Stellar Stoker Measured Mass > Declared Tonnage',
    day: 'Day 15+',
    sortDay: 15,
    system: 'Stellar Stoker Mass Dial',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'HARDCODED_CS',
      label: 'HARDCODED C# [TODO] · NOT IN JSON YET',
      location: 'Simulation/ShipGenerator.cs:1126-1127 · ProtocolsAndComms.cs:523-525'
    },
    discrepancyPair: 'StokerMeasuredMassLed + DataSlateMass / CargoManifestWafer / DataSlateCargo',
    infractionEnum: 'ShipInfractionType.StokerMassMismatch',
    officerChallengePrompt: `> BOOTH 04: "Stellar Stoker anchor reads {ActualMass:N0} T, exceeding your declared {DeclaredTonnage:N0} T." [// TODO: USER DIALOGUE PASS]`,
    officerChallengeSource: 'UI/DeskScreen.ProtocolsAndComms.cs:523',
    csCaptainFallbackExcuse: `Primary (:1127, // TODO: USER DIALOGUE PASS): "Extra {ActualMass - DeclaredTonnage} tons? Just... spare reactor ballast we loaded after filing!" | Secondary (:525): "Ballast trim must have run heavy. That scale's off!"`,
    csFallbackSource: 'Simulation/ShipGenerator.cs:1126-1127 & ProtocolsAndComms.cs:525'
  },

  // --- 3 FUTURE / UNWIRED ShipInfractionType ENUM VALUES (data/ShipSpec.cs:5-26) ---
  {
    key: 'BiometricSpeciesMismatch',
    legacyAliases: ['FaceOrCamMismatch'],
    label: 'Viewscreen Face / Biometric Species / Broken Camera Spoof',
    day: 'Day 18+',
    sortDay: 18,
    system: 'Viewscreen & Comms Audit',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'NOT_WIRED',
      label: 'NOT WIRED IN C# YET',
      location: 'data/ShipSpec.cs:5-26 (ShipInfractionType.BiometricSpeciesMismatch)'
    },
    discrepancyPair: 'Viewscreen Portrait / SPS Comms Conduit + Declared Captain Species',
    infractionEnum: 'ShipInfractionType.BiometricSpeciesMismatch',
    officerChallengePrompt: '[NOT WIRED IN C# YET — No officer challenge branch in ProtocolsAndComms.cs]',
    officerChallengeSource: 'data/ShipSpec.cs:5-26',
    csCaptainFallbackExcuse: '[NOT WIRED IN C# YET — Future Day 18+ Viewscreen Face Match / Broken Camera audit excuse]',
    csFallbackSource: 'data/ShipSpec.cs:5-26'
  },
  {
    key: 'UndeclaredCargoBioSignature',
    legacyAliases: ['BioQuarantine'],
    label: 'Undeclared Cargo Bio-Signature / Forged Bio-Clearance Wafer',
    day: 'Day 21+',
    sortDay: 21,
    system: 'Bio-Quarantine & SPS Green Bio-Scan',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'NOT_WIRED',
      label: 'NOT WIRED IN C# YET',
      location: 'data/ShipSpec.cs:5-26 (ShipInfractionType.UndeclaredCargoBioSignature)'
    },
    discrepancyPair: 'SPS Green Bio-Signature / Bio-Clearance Wafer + Cargo Manifest',
    infractionEnum: 'ShipInfractionType.UndeclaredCargoBioSignature',
    officerChallengePrompt: '[NOT WIRED IN C# YET — No officer challenge branch in ProtocolsAndComms.cs]',
    officerChallengeSource: 'data/ShipSpec.cs:5-26',
    csCaptainFallbackExcuse: '[NOT WIRED IN C# YET — Future Day 21+ Bio-Quarantine / Stowaway / Forged Bio-Clearance excuse]',
    csFallbackSource: 'data/ShipSpec.cs:5-26'
  },
  {
    key: 'InvalidBrengopTransitPass',
    legacyAliases: ['TransitPassMismatch'],
    label: 'Invalid Brengop Transit Pass Cert-Wafer (3rd Wafer)',
    day: 'Day 24+',
    sortDay: 24,
    system: 'Transit Pass Wafer',
    inFactionPoolsJson: false,
    sourceBadge: {
      kind: 'NOT_WIRED',
      label: 'NOT WIRED IN C# YET',
      location: 'data/ShipSpec.cs:5-26 (ShipInfractionType.InvalidBrengopTransitPass)'
    },
    discrepancyPair: 'Brengop Transit Pass Cert-Wafer + Data Slate / Tariff Tier',
    infractionEnum: 'ShipInfractionType.InvalidBrengopTransitPass',
    officerChallengePrompt: '[NOT WIRED IN C# YET — No officer challenge branch in ProtocolsAndComms.cs]',
    officerChallengeSource: 'data/ShipSpec.cs:5-26',
    csCaptainFallbackExcuse: '[NOT WIRED IN C# YET — Future Day 24+ Brengop Transit Pass excuse]',
    csFallbackSource: 'data/ShipSpec.cs:5-26'
  }
];

export function getFactionCardAuditDetails(
  factionCode: string,
  arrKey: string
): {
  badge: SourceBadgeInfo;
  contextFlow: InGameContextFlow;
  currentlyInGame: string;
  currentSource: string;
} {
  const authoredPool =
    factionCode === 'FTV-' || factionCode === 'MNG-'
      ? AUTHORED_FACTION_POOLS_VERBATIM[factionCode]
      : null;

  if (arrKey === 'greetings') {
    const jsonLines = authoredPool?.greetings
      ? authoredPool.greetings.map((l, i) => `JSON #${i + 1}: "${l}"`).join('\n')
      : `JSON: "[TODO: ${factionCode} greeting 1..3]" (skipped by IsPlayableLine)`;
    const csFallback = CS_HARDCODED_GREETING_FALLBACKS[factionCode] || CS_HARDCODED_GREETING_FALLBACKS.DEFAULT;
    return {
      badge: {
        kind: 'LIVE_JSON',
        label: 'LIVE JSON',
        location: 'data/dialogue/faction_pools.json · greetings'
      },
      contextFlow: {
        before: 'Player clicks [NEXT HAIL] -> 3.2s ShipGlidingIn ("APPROACH VECTOR LOCKED -- VESSEL GLIDING INTO BAY...") completes.',
        thisLine: `HAIL [{RegistrationCode}]: "{GreetingHailLine}" (+ inline recentCallbacks line appended with a single space if rolling history matches).`,
        after: '0.18s later -> > BOOTH 04: "Send subspace protocols." (followed by "..." -> "Shields down, please." if ActualShieldsUp == true).',
        pacingNote: 'Tokens supported: {shipName}, {reg}, {origin}, {destination}. Streams at 65 chars/sec.'
      },
      currentlyInGame: `${jsonLines}\nC# Fallback (ShipGenerator.cs:997-1004): "${csFallback}"`,
      currentSource: 'data/dialogue/faction_pools.json & Simulation/ShipGenerator.cs:997-1004'
    };
  }

  if (arrKey === 'greetingsHostile') {
    return {
      badge: {
        kind: 'NOT_WIRED',
        label: 'NOT WIRED IN C# YET',
        location: 'Simulation/FactionDialoguePool.cs:15-28 (greetingsHostile absent)'
      },
      contextFlow: {
        before: 'ShipGlidingIn (3.2s) finishes when factionRep <= -5.',
        thisLine: 'Proposed hostile greeting when factionRep <= -5 (excluded from strict C# faction_pools.json export so deserialization remains 1-to-1).',
        after: '0.18s later -> > BOOTH 04: "Send subspace protocols."',
        pacingNote: 'Currently in C#, factionRep <= -5 only changes ComplianceDelaySeconds (1.35s) and Shields/Weapons compliance replies ("Fine. Dropping shields now." / "Cutting weapon power.").'
      },
      currentlyInGame: '[NOT IN faction_pools.json OR C#] FactionDialoguePool.FactionPoolEntry only reads greetings, excuses, detentionReactions, and recentCallbacks.',
      currentSource: 'Simulation/FactionDialoguePool.cs:15-28 & ShipGenerator.cs:1024-1030'
    };
  }

  if (arrKey === 'greetingsWarm') {
    return {
      badge: {
        kind: 'NOT_WIRED',
        label: 'NOT WIRED IN C# YET',
        location: 'Simulation/FactionDialoguePool.cs:15-28 (greetingsWarm absent)'
      },
      contextFlow: {
        before: 'ShipGlidingIn (3.2s) finishes when factionRep >= +6.',
        thisLine: 'Proposed warm greeting when factionRep >= +6 (excluded from strict C# faction_pools.json export).',
        after: '0.18s later -> > BOOTH 04: "Send subspace protocols."',
        pacingNote: 'Currently in C#, factionRep >= +6 reduces ComplianceDelaySeconds to 0.20s.'
      },
      currentlyInGame: '[NOT IN faction_pools.json OR C#] FactionDialoguePool.FactionPoolEntry only reads greetings, excuses, detentionReactions, and recentCallbacks.',
      currentSource: 'Simulation/FactionDialoguePool.cs:15-28 & ShipGenerator.cs:687-689'
    };
  }

  if (arrKey === 'detentionReactions') {
    const jsonLines = authoredPool?.detentionReactions
      ? authoredPool.detentionReactions.map((l, i) => `JSON #${i + 1}: "${l}"`).join('\n')
      : `JSON: "[TODO: ${factionCode} detention reaction 1..2]" (skipped by IsPlayableLine)`;
    return {
      badge: {
        kind: 'LIVE_JSON',
        label: 'LIVE JSON',
        location: 'data/dialogue/faction_pools.json · detentionReactions'
      },
      contextFlow: {
        before: 'Player pulls Detain Lever -> SnapActiveAndDropPendingQueue() -> > BOOTH 04: [DETAIN LEVER PULLED -- VERIFIED / UNVERIFIED CLAMP].',
        thisLine: 'CAPT: "{DetentionReactionLine}" (Immediate; suppressAutoReceivingLag: true).',
        after: '1.80s DetainClamping (at 65%: "[DATA SLATE] ACTIVE TELEMETRY WIPED.") -> "[DETAINED] Vessel {reg} detained (+10 SC)" or "[CITATION]".',
        pacingNote: 'CRITICAL C# GAP (ShipGenerator.cs:1154): Zero C# fallback exists! When JSON is [TODO], captain emits complete silence on detain.'
      },
      currentlyInGame: `${jsonLines}\nC# Fallback (ShipGenerator.cs:1154): string.Empty (SILENCE — no C# fallback exists!)`,
      currentSource: 'data/dialogue/faction_pools.json & UI/DeskScreen.cs:2671-2677'
    };
  }

  if (arrKey.startsWith('recentCallbacks.')) {
    const kind = arrKey.split('.')[1] as 'ClearedViolation' | 'RepeatedDetentions' | 'TookBribe';
    const jsonLines = authoredPool?.recentCallbacks?.[kind]
      ? authoredPool.recentCallbacks[kind].map((l, i) => `JSON #${i + 1}: "${l}"`).join('\n')
      : `JSON: "[TODO: ${factionCode} ${kind} callback 1..2]" (skipped by IsPlayableLine)`;
    const triggerDesc =
      kind === 'ClearedViolation'
        ? 'Cleared >= 1 violation for this prefix within [day-3 .. day-1]'
        : kind === 'RepeatedDetentions'
        ? 'Detained >= 2 vessels of this prefix within [day-3 .. day-1]'
        : 'TookBribe within [day-3 .. day-1] (NOTE: ValidationEngine.cs currently hardcodes tookBribe: false on all 7 call sites!)';
    return {
      badge: {
        kind: kind === 'TookBribe' ? 'NOT_WIRED' : 'LIVE_JSON',
        label: kind === 'TookBribe' ? 'LIVE JSON (TRIGGER UNWIRED IN C#)' : 'LIVE JSON',
        location: `data/dialogue/faction_pools.json · recentCallbacks.${kind}`
      },
      contextFlow: {
        before: `ShipGlidingIn (3.2s) finishes -> EncounterHistoryQuery checks [day-3..day-1] (${triggerDesc}).`,
        thisLine: 'APPENDED INLINE onto GreetingHailLine separated by a single space: HAIL [{reg}]: "{greeting} {callbackLine}" (NOT a separate message!).',
        after: '0.18s later -> > BOOTH 04: "Send subspace protocols."',
        pacingNote: 'Priority order in ShipGenerator.cs:1013-1022: TookBribe > RepeatedDetentions (>=2) > ClearedViolation (>=1).'
      },
      currentlyInGame: `${jsonLines}\nC# Fallback: None (if [TODO], greeting plays alone without a callback suffix).`,
      currentSource: 'data/dialogue/faction_pools.json & Simulation/ShipGenerator.cs:1013-1022'
    };
  }

  if (arrKey.startsWith('excuses.')) {
    const key = arrKey.split('.')[1];
    const meta = EXCUSE_KEYS_AUDIT.find(e => e.key === key) || EXCUSE_KEYS_AUDIT[0];
    const authoredExcuses = authoredPool?.excuses?.[key];
    const generalTrapNote =
      !authoredExcuses && authoredPool && meta.inFactionPoolsJson && key !== 'General'
        ? `\n[ACTIVE GENERAL TRAP]: Because ${factionCode} has authored excuses.General lines, PickExcuseOrDefault (ShipGenerator.cs:1157-1164) currently plays ${factionCode}'s generic "General" excuse instead of the C# fallback below!`
        : '';
    const jsonPart = meta.inFactionPoolsJson
      ? authoredExcuses
        ? authoredExcuses.map((l, i) => `JSON #${i + 1}: "${l}"`).join('\n')
        : `JSON: "[TODO: ${factionCode} ${key} excuse 1..2]" (skipped by IsPlayableLine)`
      : `JSON: Key "${key}" is NOT in data/dialogue/faction_pools.json`;

    return {
      badge: meta.sourceBadge,
      contextFlow: {
        before: `Player pairs [${meta.discrepancyPair}] in Protocol Review -> 0.50s [PROTOCOL FAULT] -> ${meta.officerChallengePrompt}`,
        thisLine: `0.28s portrait static flicker -> 0.60s [RECEIVING...] -> CAPT: "{${key} excuse}"`,
        after: 'Fault verified (ProtocolReviewVerified = true). Player pulls Detain Lever (or slots Clearance Dock).',
        pacingNote: `Lookup chain: faction_pools.json excuses["${key}"] -> DEFAULT excuses["${key}"] -> excuses["General"] -> C# ShipGenerator fallback.`
      },
      currentlyInGame: `${jsonPart}\nC# Fallback (${meta.csFallbackSource}): ${meta.csCaptainFallbackExcuse}${generalTrapNote}`,
      currentSource: `${meta.officerChallengeSource} & ${meta.csFallbackSource}`
    };
  }

  return {
    badge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON',
      location: 'data/dialogue/faction_pools.json'
    },
    contextFlow: {
      before: 'Booth 04 comms prompt',
      thisLine: 'Captain response',
      after: 'Next encounter phase'
    },
    currentlyInGame: '[TODO]',
    currentSource: 'data/dialogue/faction_pools.json'
  };
}

// ============================================================================
// SECTION 2.2 & 3.3: 14 LIVE THREADS IN data/forum.json
// ============================================================================

export interface LiveForumPostAudit {
  handle: string;
  roleTag: string;
  timestamp: string;
  body: string;
}

export interface LiveForumThreadAudit {
  id: string;
  title: string;
  boardTag: string;
  minDay: number;
  maxDay: number;
  requiredFlags: string[];
  powerScoreCondition: { prefix: string; state: string } | null;
  stage: string;
  pillar: string;
  posts: LiveForumPostAudit[];
}

export const LIVE_FORUM_THREADS_AUDIT: LiveForumThreadAudit[] = [
  {
    id: 'd1_spectrometer_outage',
    title: 'Booth 04 warp spectrometer STILL dark?',
    boardTag: 'OPS',
    minDay: 1,
    maxDay: 2,
    requiredFlags: [],
    powerScoreCondition: null,
    stage: 'Stage 1 (Days 1–6: Mundane Friction)',
    pillar: 'Contract Trap',
    posts: [
      {
        handle: 'dock_hand_maren',
        roleTag: 'DECK 3 BAY CREW',
        timestamp: 'CYC 2409.04 // 06:12',
        body: 'Three shifts running and the thermal coil in Booth 04 is still tagged MAINTENANCE PENDING. Brengop factor says replacement coils eat into quarterly bonus margins. [TODO: USER DIALOGUE PASS]'
      },
      {
        handle: 'ftc_wrench_88',
        roleTag: 'EX-FTC TECH',
        timestamp: 'CYC 2409.04 // 08:44',
        body: "That infrared surge off the Brown Dwarf cooked two coils last cycle. If Kordani doesn't force a salvage pull from Deck 4, customs is flying blind on jump origins."
      }
    ]
  },
  {
    id: 'd1_ration_paste',
    title: 'Replicator nutrient paste tastes like coolant',
    boardTag: 'GENERAL',
    minDay: 1,
    maxDay: 4,
    requiredFlags: [],
    powerScoreCondition: null,
    stage: 'Stage 1 (Days 1–6: Mundane Friction)',
    pillar: 'Contract Trap',
    posts: [
      {
        handle: 'berth_11_joss',
        roleTag: 'NIGHT LOADER',
        timestamp: 'CYC 2409.04 // 21:05',
        body: 'Anyone else living on SKU-014 dry bricks to make berth lease? Hands were shaking so bad on crane alignment today I nearly clipped a Mining Guild barge. [TODO: USER DIALOGUE PASS]'
      },
      {
        handle: 'med_tech_tala',
        roleTag: 'INFIRMARY',
        timestamp: 'CYC 2409.04 // 22:18',
        body: 'Two consecutive nights on dry bricks craters fine motor steadiness. Spend the 20 SC on paste if you run precision consoles.'
      }
    ]
  },
  {
    id: 'd2_lower_deck_rumors',
    title: 'Deck 4 vent relay humming again at 0400',
    boardTag: 'DECK4',
    minDay: 6,
    maxDay: 6,
    requiredFlags: [],
    powerScoreCondition: null,
    stage: 'Stage 1 (Days 1–6: Mundane Friction)',
    pillar: 'Station Chatter',
    posts: [
      {
        handle: 'vent_rat_09',
        roleTag: 'UNVERIFIED',
        timestamp: 'CYC 2409.04 // 04:19',
        body: 'Reminder for new berth tenants: official PACT REQ leaves paper trails. Whatever gets dropped in your 0500 service chute off the lower vent relay stays off Brengop ledgers -- just scrub your local hex logs before Kordani walks the hall.'
      }
    ]
  },
  {
    id: 'd3_coil_repaired_cleared',
    title: 'KDF security alert -- unlogged vector out of VG-3',
    boardTag: 'SECTOR',
    minDay: 4,
    maxDay: 5,
    requiredFlags: ['day2_cleared'],
    powerScoreCondition: null,
    stage: 'Stage 1 (Days 1–6: Mundane Friction)',
    pillar: 'Reactive Fallout',
    posts: [
      {
        handle: 'nav_watch_soren',
        roleTag: 'PERIMETER RELAY',
        timestamp: 'CYC 2409.04 // 03:40',
        body: 'Perimeter dishes lit up at 0214 -- a vessel cleared yesterday jumped out on a completely falsified vector. Kordani marched straight into Deck 4 salvage and ripped a replacement warp coil out for Booth 04. [TODO: USER DIALOGUE PASS]'
      },
      {
        handle: 'dock_hand_maren',
        roleTag: 'DECK 3 BAY CREW',
        timestamp: 'CYC 2409.04 // 05:11',
        body: 'Heard Kordani activated formal Security Strikes across customs too. Three strikes and they toss your berth while you sleep.'
      }
    ]
  },
  {
    id: 'd3_coil_repaired_detained',
    title: 'Boarding team found falsified logs in Detain Bay 2',
    boardTag: 'SECTOR',
    minDay: 4,
    maxDay: 5,
    requiredFlags: ['day2_detained'],
    powerScoreCondition: null,
    stage: 'Stage 1 (Days 1–6: Mundane Friction)',
    pillar: 'Reactive Fallout',
    posts: [
      {
        handle: 'nav_watch_soren',
        roleTag: 'PERIMETER RELAY',
        timestamp: 'CYC 2409.04 // 04:02',
        body: 'Word is Booth 04 clamped a clean-paper hauler yesterday on pure gut instinct and KDF boarding teams actually found cooked jump logs inside. Kordani forced Brengop to repair the warp spectrometer immediately anyway. [TODO: USER DIALOGUE PASS]'
      },
      {
        handle: 'ftc_wrench_88',
        roleTag: 'EX-FTC TECH',
        timestamp: 'CYC 2409.04 // 05:25',
        body: 'Salvaged coil runs hotter than a Stoker baffle, and KDF turned Security Strikes live starting this watch. Play it by the book.'
      }
    ]
  },
  {
    id: 'd4_d7_early_sector_chatter',
    title: 'Post-war registries still a mess out on the rim',
    boardTag: 'GENERAL',
    minDay: 4,
    maxDay: 9,
    requiredFlags: [],
    powerScoreCondition: null,
    stage: 'Stage 2 (Days 7–18: Open Turf War)',
    pillar: 'Ashen Rift Superstition',
    posts: [
      {
        handle: 'hauler_kess',
        roleTag: 'FREE TRADER',
        timestamp: 'CYC 2409.04 // 19:50',
        body: "Half the hulls passing Void Gate 3 were patched together after the Concord war. Kordani's new reference tablets are strict on prefix-to-hull matching, so double check silhouettes before stamping anything. [TODO: USER DIALOGUE PASS]"
      },
      {
        handle: 'berth_11_joss',
        roleTag: 'NIGHT LOADER',
        timestamp: 'CYC 2409.04 // 20:32',
        body: 'And watch out for anyone asking about the Ashen Rift. Nobody comes out of that red nebula with clean warp residue.'
      }
    ]
  },
  {
    id: 'evt_stoker_overload_brownout',
    title: 'WHO OVERLOADED THE STELLAR STOKER?! Corridor lights keep dying!',
    boardTag: 'OPS',
    minDay: 1,
    maxDay: 30,
    requiredFlags: ['stoker_overload'],
    powerScoreCondition: null,
    stage: 'Stage 2 (Days 7–18: Open Turf War)',
    pillar: 'Reactive Fallout',
    posts: [
      {
        handle: 'ftc_wrench_88',
        roleTag: 'EX-FTC TECH',
        timestamp: 'STATION ALERT // LIVE',
        body: 'Gravity anchor coils took a shear spike above 100% strain! Corridor lamps and berth amber strips are flickering across the entire customs ring. Expect rolling power brownouts next shift. [TODO: USER DIALOGUE PASS]'
      },
      {
        handle: 'dock_hand_maren',
        roleTag: 'DECK 3 BAY CREW',
        timestamp: 'STATION ALERT // +14m',
        body: 'Kordani patrol squads just locked down the officer quarters wing looking for orbital sabotage. Hope whoever let undeclared tonnage into the Stoker has clean logs.'
      }
    ]
  },
  {
    id: 'evt_berth_search_rumors',
    title: 'KDF boots in the quarters corridor at 0300',
    boardTag: 'RUMORS',
    minDay: 1,
    maxDay: 30,
    requiredFlags: ['berth_search'],
    powerScoreCondition: null,
    stage: 'Stage 3 (Days 19–25: Climax Foreshadowing)',
    pillar: 'Reactive Fallout',
    posts: [
      {
        handle: 'berth_11_joss',
        roleTag: 'NIGHT LOADER',
        timestamp: 'CYC 2409.04 // 05:08',
        body: 'Heard magnetic lock breakers down by Berth 04 before wake bell. Kordani audit teams check terminal I/O buffers first and coat pockets second. Never sleep with unscrubbed [UNAUTH_IO] flags. [TODO: USER DIALOGUE PASS]'
      }
    ]
  },
  {
    id: 'evt_missed_berth_lease',
    title: 'Brengop Factor posting foreclosure slips on Habitat Ring B',
    boardTag: 'GENERAL',
    minDay: 1,
    maxDay: 30,
    requiredFlags: ['missed_lease'],
    powerScoreCondition: null,
    stage: 'Stage 2 (Days 7–18: Open Turf War)',
    pillar: 'Contract Trap',
    posts: [
      {
        handle: 'berth_11_joss',
        roleTag: 'NIGHT LOADER',
        timestamp: 'CYC 2409.04 // 22:40',
        body: 'Reminder: Brengop gives you ONE deferred lease night with a red flag. Miss two nights of 30 SC berth rent and they strip your badge and drop you onto the lower reactor decks. [TODO: USER DIALOGUE PASS]'
      }
    ]
  },
  {
    id: 'evt_deck4_chatter',
    title: 'Runner drops running tight before 0500 shift change',
    boardTag: 'DECK4',
    minDay: 1,
    maxDay: 30,
    requiredFlags: ['deck4_used'],
    powerScoreCondition: null,
    stage: 'Stage 2 (Days 7–18: Open Turf War)',
    pillar: 'Station Chatter',
    posts: [
      {
        handle: 'vent_rat_09',
        roleTag: 'D4 RELAY',
        timestamp: 'CYC 2409.04 // 04:55',
        body: "Chute drop confirmed on Habitat Ring. Keep fake slates tucked under the desk vent grate if heat climbs -- and never feed a covert payload into a Pact cruiser's Slate Bus. [TODO: USER DIALOGUE PASS]"
      }
    ]
  },
  {
    id: 'power_kdf_dominant',
    title: 'Kordani patrol cruisers stacking double at the outer buoy',
    boardTag: 'SECTOR',
    minDay: 2,
    maxDay: 30,
    requiredFlags: [],
    powerScoreCondition: { prefix: 'KDF-', state: 'Dominant' },
    stage: 'Stage 2 (Days 7–18: Open Turf War)',
    pillar: 'Reactive Fallout',
    posts: [
      {
        handle: 'hauler_kess',
        roleTag: 'FREE TRADER',
        timestamp: 'SECTOR WIRE // LIVE',
        body: 'KDF throughput is way up this cycle. Non-Pact captains are sweating bullets in the approach lane with Kordani hulls parked outside the gate. [TODO: USER DIALOGUE PASS]'
      }
    ]
  },
  {
    id: 'power_mng_dominant',
    title: 'Mining Guild escorts pushing Free Traders off the outer belt',
    boardTag: 'SECTOR',
    minDay: 2,
    maxDay: 30,
    requiredFlags: [],
    powerScoreCondition: { prefix: 'MNG-', state: 'Dominant' },
    stage: 'Stage 2 (Days 7–18: Open Turf War)',
    pillar: 'Reactive Fallout',
    posts: [
      {
        handle: 'hauler_kess',
        roleTag: 'FREE TRADER',
        timestamp: 'SECTOR WIRE // LIVE',
        body: "Half our FTV rigs docked with plasma scorch along their flanks today. Mining Guild's flush with traffic and acting like they own every asteroid lane. [TODO: USER DIALOGUE PASS]"
      }
    ]
  },
  {
    id: 'power_bmc_dominant',
    title: 'Brengop Mercantile raising dockside docking surcharges again',
    boardTag: 'SECTOR',
    minDay: 2,
    maxDay: 30,
    requiredFlags: [],
    powerScoreCondition: { prefix: 'BMC-', state: 'Dominant' },
    stage: 'Stage 2 (Days 7–18: Open Turf War)',
    pillar: 'Contract Trap',
    posts: [
      {
        handle: 'dock_hand_maren',
        roleTag: 'DECK 3 BAY CREW',
        timestamp: 'SECTOR WIRE // LIVE',
        body: "Consortium freight volume is through the roof and they STILL won't fix the broken auxiliary units in officer berths. Classic Brengop. [TODO: USER DIALOGUE PASS]"
      }
    ]
  },
  {
    id: 'power_guv_dominant',
    title: 'Galactic Union envoys spotted near the observation deck',
    boardTag: 'SECTOR',
    minDay: 2,
    maxDay: 30,
    requiredFlags: [],
    powerScoreCondition: { prefix: 'GUV-', state: 'Dominant' },
    stage: 'Stage 2 (Days 7–18: Open Turf War)',
    pillar: 'Reactive Fallout',
    posts: [
      {
        handle: 'nav_watch_soren',
        roleTag: 'PERIMETER RELAY',
        timestamp: 'SECTOR WIRE // LIVE',
        body: 'More GUV- transponders clearing the gate lately. Kordani Command hates seeing Union hulls this close to the Brown Dwarf. [TODO: USER DIALOGUE PASS]'
      }
    ]
  }
];

// ============================================================================
// SECTION 2.3 & 3.4: 5 LIVE MISSIONS IN data/covert_missions.json
// ============================================================================

export interface CovertMissionAuditSpec {
  missionId: string;
  missionType: 'Delivery' | 'Intercept';
  title: string;
  assigningFaction: string;
  minAvailableDay: number;
  autoActivateOnHack: boolean;
  triggerEmailDay: number;
  triggerEmailPhase: 'Morning' | 'Evening';
  scheduledDeliveryDay: number;
  targetPrefix: string;
  targetRegistration: string;
  targetShipName: string;
  slatePayloadLabel: string;
  payloadDescription: string;
  encryptedSubject: string;
  decryptedBody: string;
  rewardScrip: number;
  rewardFactionPrefix: string;
  rewardRepDelta: number;
  targetPowerDelta: number;
  grantDoubleAgentTrust: boolean;
}

export const COVERT_MISSIONS_AUDIT: CovertMissionAuditSpec[] = [
  {
    missionId: 'day6_mng_intro',
    missionType: 'Intercept',
    title: 'RELAY_D4 INTRO // MINING GUILD PACKET',
    assigningFaction: 'UNKNOWN // RELAY_D4',
    minAvailableDay: 6,
    autoActivateOnHack: true,
    triggerEmailDay: 6,
    triggerEmailPhase: 'Morning',
    scheduledDeliveryDay: 6,
    targetPrefix: 'MNG-',
    targetRegistration: '',
    targetShipName: '',
    slatePayloadLabel: 'MNG- TELEMETRY INTERCEPT',
    payloadDescription:
      'Slot the unmarked black Blank Data Slate from your 0500 chute when a Mining Guild (MNG-) ship docks. Pocket it and transmit via CRYPTO / LOGS tonight. [TODO: USER DIALOGUE PASS]',
    encryptedSubject: '',
    decryptedBody: '',
    rewardScrip: 45,
    rewardFactionPrefix: 'FTV-',
    rewardRepDelta: 1,
    targetPowerDelta: -1,
    grantDoubleAgentTrust: false
  },
  {
    missionId: 'intercept_op_01',
    missionType: 'Intercept',
    title: '[PLACEHOLDER INT-01] CONSORTIUM FREIGHT TELEMETRY',
    assigningFaction: 'GALACTIC UNION HANDLER [TODO]',
    minAvailableDay: 7,
    autoActivateOnHack: false,
    triggerEmailDay: 0,
    triggerEmailPhase: 'Evening',
    scheduledDeliveryDay: 8,
    targetPrefix: 'BMC-',
    targetRegistration: '',
    targetShipName: '',
    slatePayloadLabel: 'BMC- FREIGHT INTERCEPT [INT-01]',
    payloadDescription:
      'Requires a Blank Data Slate (15 SC). Silently swap into Booth 04 Slate Bus on any Brengop Consortium (BMC-) vessel, pocket it, and transmit via CRYPTO / LOGS. [TODO: USER DIALOGUE PASS]',
    encryptedSubject: '',
    decryptedBody: '',
    rewardScrip: 50,
    rewardFactionPrefix: 'GUV-',
    rewardRepDelta: 2,
    targetPowerDelta: -1,
    grantDoubleAgentTrust: true
  },
  {
    missionId: 'intercept_op_02',
    missionType: 'Intercept',
    title: '[PLACEHOLDER INT-02] KORDANI PATROL TELEMETRY',
    assigningFaction: 'KRUSHVAK LIAISON [TODO]',
    minAvailableDay: 10,
    autoActivateOnHack: false,
    triggerEmailDay: 0,
    triggerEmailPhase: 'Evening',
    scheduledDeliveryDay: 11,
    targetPrefix: 'KDF-',
    targetRegistration: '',
    targetShipName: '',
    slatePayloadLabel: 'KDF- PATROL INTERCEPT [INT-02]',
    payloadDescription:
      "Requires a Blank Data Slate (15 SC). Silently copy any Kordani Defense Fleet (KDF-) vessel's subspace packet in Booth 04 Slate Bus and transmit via CRYPTO / LOGS. [TODO: USER DIALOGUE PASS]",
    encryptedSubject: '',
    decryptedBody: '',
    rewardScrip: 60,
    rewardFactionPrefix: 'KRW-',
    rewardRepDelta: 2,
    targetPowerDelta: -1,
    grantDoubleAgentTrust: false
  },
  {
    missionId: 'slate_bus_mission_01',
    missionType: 'Delivery',
    title: '[PLACEHOLDER OP-01] RIM COURIER TELEMETRY DROP',
    assigningFaction: 'DECK 4 CONTACT [TODO]',
    minAvailableDay: 12,
    autoActivateOnHack: false,
    triggerEmailDay: 12,
    triggerEmailPhase: 'Evening',
    scheduledDeliveryDay: 13,
    targetPrefix: 'FTV-',
    targetRegistration: 'FTV-719-R',
    targetShipName: 'CINDER LARK',
    slatePayloadLabel: 'COVERT MISSION SLATE [OP-01]',
    payloadDescription:
      'Sealed single-use jump-beacon offsets for Free Trader FTV-719-R (CINDER LARK). Drops at 0500. Upload in Booth 04 Slate Bus; crystal burns on use. DO NOT upload to KDF- or BMC-!',
    encryptedSubject: 'ENCRYPTED DISPATCH // RELAY DROP [OP-01]',
    decryptedBody:
      'PORT OFFICER -- Decrypt confirmed. A sealed pre-loaded Covert Mission Data Slate [OP-01] has been queued for your 0500 Service Chute. Check your Morning Ship Roster for Free Trader vessel FTV-719-R (CINDER LARK). When it docks at Booth 04, slot this Mission Slate into the Slate Bus to upload our dead-drop telemetry. WARNING: Single-use glass burns on completion; never slot a covert slate while a KDF- or BMC- Pact vessel is docked! [TODO: USER DIALOGUE PASS]',
    rewardScrip: 45,
    rewardFactionPrefix: 'FTV-',
    rewardRepDelta: 2,
    targetPowerDelta: 0,
    grantDoubleAgentTrust: false
  },
  {
    missionId: 'slate_bus_mission_02',
    missionType: 'Delivery',
    title: '[PLACEHOLDER OP-02] UNION LISTENING POST PACKET',
    assigningFaction: 'GU HANDLER [TODO]',
    minAvailableDay: 14,
    autoActivateOnHack: false,
    triggerEmailDay: 14,
    triggerEmailPhase: 'Evening',
    scheduledDeliveryDay: 15,
    targetPrefix: 'FTC-',
    targetRegistration: 'FTC-408-M',
    targetShipName: 'MERIDIAN DRIFT',
    slatePayloadLabel: 'COVERT MISSION SLATE [OP-02]',
    payloadDescription:
      'Sealed single-use sensor calibration keys for Far-Line vessel FTC-408-M (MERIDIAN DRIFT). Drops at 0500. Upload in Slate Bus during shift.',
    encryptedSubject: 'ENCRYPTED DISPATCH // UNION HANDLER [OP-02]',
    decryptedBody:
      "OFFICER -- Sealed Covert Mission Data Slate [OP-02] queued for your next 0500 Service Chute drop. Watch the Morning Ship Roster for Far-Line Transit Corp hull FTC-408-M (MERIDIAN DRIFT) and upload via Booth 04's Slate Bus while docked. Single-use crystal burns on delivery. [TODO: USER DIALOGUE PASS]",
    rewardScrip: 55,
    rewardFactionPrefix: 'GUV-',
    rewardRepDelta: 2,
    targetPowerDelta: 0,
    grantDoubleAgentTrust: true
  }
];

// ============================================================================
// SECTION 5: CODE VS. WORKBENCH SYNC SUMMARY CHECKLISTS
// ============================================================================

export const SECTION_5_HARDCODED_MIGRATION_LIST = [
  {
    id: 'hc_1',
    title: 'Protocol Review Officer Challenges (16 prompts + 2 honest omitted-manifest prompts)',
    location: 'UI/DeskScreen.ProtocolsAndComms.cs:448-530, 905, 1245',
    detail: 'Move all 16 officer challenge prompts + 2 honest omitted-manifest prompts out of C# switches into JSON (and resolve the StokerMassMismatch // TODO: USER DIALOGUE PASS prompt at :523).'
  },
  {
    id: 'hc_2',
    title: 'Routine Encounter Captain Fallbacks & Officer Beats',
    location: 'Simulation/ShipGenerator.cs:995-1133 · UI/DeskScreen.cs:1953-2546 · HardwareModules.cs:155 · DocumentsAndDrag.cs:1853, 1918-1921',
    detail: 'Move or align hardcoded GreetingHailLine, ShieldsLoweredLine, WeaponsPoweredDownLine, RefusalLine, SpoofedWeaponsBluffLine, SubspaceUploadLine, ReTransmitAnnoyedLine, AutoInterrogationReplyLine, all 15 ConfrontationGuiltyExcuse* fallbacks, covert upload reactions, and "Send subspace protocols." / "Shields down, please." / "Power down weapons." officer beats.'
  },
  {
    id: 'hc_3',
    title: 'Pre-Shift Live Viewscreen Hails & Morning Shift Directives (Days 1–28)',
    location: 'data/Day2And3ScriptedDialogue.cs:12-306 · data/placeholders_todo.json:4-8',
    detail: 'Move Day 1/2/4/8/15 live hails (including Day 15 Regeer Nixa 4 // TODO: USER DIALOGUE PASS lines) and Days 1–28 shift directives (plus Day 17 conflicting Kordani/Brengop directives) into data-driven JSON.'
  },
  {
    id: 'hc_4',
    title: 'Day 3 Ghost Route & Future Story Encounters',
    location: 'Simulation/ShipGenerator.cs:782-936 · Core/GameState.cs:530-546',
    detail: 'Externalize Day 3 Ghost Route dialogue/slots; author and wire Day 9 Ghost, SideQuest_HelaniCourierWarpSignature, SideQuest_OrunFreighter442, and KordaniDestroyOverrideUnlocked.'
  },
  {
    id: 'hc_5',
    title: 'Quarters Emails, Field Booklet ("884-D — MY NOTES") & Endings',
    location: 'Core/QuartersModels.cs:115-162 · Simulation/EconomyEngine.cs:214-234, 718-750 · UI/FieldBooklet.cs:73-170 · UI/QuartersScreen.cs:2202-2228',
    detail: 'Externalize scripted emails, Field Booklet 9 pages, failure endings, and author/wire the 5 unimplemented victory endings (PathA–PathE) + Day 28 epilogue trigger.'
  },
  {
    id: 'hc_6',
    title: 'Corridor Barks, Posters & Playtest Tutorial Replacement',
    location: 'UI/CorridorScreen.cs:249-314 · UI/TutorialOverlay.cs:252-381',
    detail: 'Author/implement corridor overhead barks and zoomable posters; replace the 6 temporary [PLAYTEST] tutorial cards with in-character comms or finalized data.'
  }
];

export const SECTION_5_MISMATCHES_AND_LEAKS = [
  {
    id: 'mm_1',
    severity: 'HIGH',
    title: 'Live Placeholder Leaks in data/covert_missions.json & TerminalOverlay.cs',
    location: 'UI/TerminalOverlay.cs:1144-1184, 1606, 1917-1930 · DeskScreen.cs:2464 · IntelEconomy.cs:241-269',
    detail: '[PLACEHOLDER OP-01], [PLACEHOLDER INT-01], [PLACEHOLDER OP-02], [PLACEHOLDER INT-02] are NOT matched by StripAuthoringTodoTags (\\s*\\[TODO(?::[^\\]]*)?\\]) and render verbatim in DECK 4, CRYPTO / LOGS, and settlement emails. assigningFaction ("DECK 4 CONTACT [TODO]", etc.) is also not stripped in email Sender headers or security logs. (Workbench exporter automatically sanitizes these!)'
  },
  {
    id: 'mm_2',
    severity: 'HIGH',
    title: 'excuses.General Fallback Precedence Bug for FTV- & MNG-',
    location: 'Simulation/ShipGenerator.cs:1157-1164',
    detail: 'PickExcuseOrDefault checks TryPickExcuse(prefix, "General", spec) BEFORE falling back to C# infraction-specific excuses. Because FTV- and MNG- have authored General lines while 6 specific keys are [TODO], they speak generic General lines for SpoofedWeaponsHot, ExpiredRegistration, PrefixOrganizationMismatch, PrefixSpeciesMismatch, PrefixHullSilhouetteMismatch, and UnexplainedCargoPowerDraw.'
  },
  {
    id: 'mm_3',
    severity: 'HIGH',
    title: 'Zero C# Detention Fallback (10 Factions + Day 3 Ghost Route Silent on Detain)',
    location: 'Simulation/ShipGenerator.cs:1154 · UI/DeskScreen.cs:2671-2677',
    detail: 'DetentionReactionLine = FactionDialoguePool.TryPickDetentionReaction(prefix, spec) ?? string.Empty. Because only FTV- and MNG- have authored detentionReactions in faction_pools.json, all other 10 factions emit silence when detained.'
  },
  {
    id: 'mm_4',
    severity: 'HIGH',
    title: 'Live "[TODO]" Strings Rendered on Star Chart (17 Live Slots)',
    location: 'data/sector_map.json · data/SectorMapModels.cs:79, 115-150 · UI/StarChartModal.cs:274-293',
    detail: 'All 7 clickable inner nodes\' tag, VG-3\'s faction, and all 9 clickable inner routes\' export default to literal "[TODO]" and render live without stripping in StarChartModal.cs.'
  },
  {
    id: 'mm_5',
    severity: 'MEDIUM',
    title: '10 ShipInfractionType Keys Missing from data/dialogue/faction_pools.json',
    location: 'data/ShipSpec.cs:5-26 · Simulation/ShipGenerator.cs:1111-1127',
    detail: '6 active faults are hardcoded in C# only (SpokenRouteDiscrepancy, SpokenCargoDiscrepancy, BannedCargoItem, CargoManifestDiscrepancy, WithheldIllicitCargoManifest, StokerMassMismatch); 1 is aliased (RefusedShieldsOrWeaponsCompliance => General); 3 are unwired future enums (BiometricSpeciesMismatch, UndeclaredCargoBioSignature, InvalidBrengopTransitPass).'
  },
  {
    id: 'mm_6',
    severity: 'MEDIUM',
    title: 'greetingsHostile / greetingsWarm & data/quests.json Do Not Exist in C#',
    location: 'Simulation/FactionDialoguePool.cs:15-28 · data/ForumModels.cs:68-177',
    detail: 'FactionPoolEntry only reads greetings, excuses, detentionReactions, and recentCallbacks. Mission JSON is data/covert_missions.json (no quests.json loader exists).'
  },
  {
    id: 'mm_7',
    severity: 'MEDIUM',
    title: 'Zero {VARIABLE} Token Substitution in data/forum.json',
    location: 'UI/TerminalOverlay.cs:1290-1314 · Simulation/FactionDialoguePool.cs:240-255',
    detail: 'Only FactionDialoguePool substitutes {shipName}, {reg}, {origin}, {destination}. Forum posts render raw text without token replacement.'
  },
  {
    id: 'mm_8',
    severity: 'MEDIUM',
    title: 'UI Wrapping / Horizontal Overflow Hotspots at +3 Font Offset',
    location: 'QuartersScreen.cs:2216 · CorridorScreen.cs:249, 282 · QuartersModels.cs:138 · LedgerOverlay.cs:260, 269',
    detail: '(1) Fail_SecurityDetainment 86-char body1 overflows 720px box (~817px at +3); (2) "BMC NOTICE" overflows 72px wall poster & 65-char Stoker brownout subtitle overflows 540px banner; (3) 80-dash divider in Contract #884-D overflows 688px reader; (4) 61–62 char foreclosure banners overflow 496px ledger.'
  }
];

export const SECTION_5_BASELINE_COUNTS = [
  {
    source: 'data/dialogue/faction_pools.json',
    authored: '38',
    todo: '343',
    notes: '381 total slots (FTV-: 19 authored / 12 [TODO]; MNG-: 19 authored / 12 [TODO]; other 11 buckets: 0 authored / 29 [TODO] each)'
  },
  {
    source: 'data/sector_map.json',
    authored: '15 (+47 node names)',
    todo: '142 (17 live on inner map)',
    notes: '6 core node factions + 9 region labels authored; 41 node factions + 47 node tags + 54 route exports [TODO] (1 VG-3 faction + 7 inner tags + 9 inner exports render live)'
  },
  {
    source: 'data/forum.json',
    authored: '0 finalized threads',
    todo: '13 inline [TODO] posts + 1 _todoNote',
    notes: 'Global _todoNote marks all 14 threads (21 posts) for user dialogue pass; 13 posts carry inline [TODO: USER DIALOGUE PASS]'
  },
  {
    source: 'data/covert_missions.json',
    authored: '0 finalized missions',
    todo: '13 field values + 1 _todoNote',
    notes: '5 missions total; 4 [PLACEHOLDER ...] titles + 4 [TODO] factions + 5 [TODO: USER DIALOGUE PASS] descriptions/bodies'
  },
  {
    source: 'data/placeholders_todo.json',
    authored: '2 rough specs (pathA, pathE)',
    todo: '6',
    notes: 'Universe name (1) + Day 17 conflicting directives (2) + Path B/C/D arcs (3); unread by runtime code'
  },
  {
    source: 'C# // TODO: USER DIALOGUE PASS strings',
    authored: '—',
    todo: '10 runtime strings (11 markers)',
    notes: 'Day 15 Nixa hail (4), Stoker mass officer prompt (1) & 2 excuses (2), Day 12 Wafer intro (1), Empty hopper note (1), Prematurely wiped wafer reply (1)'
  },
  {
    source: 'UI/TutorialOverlay.cs',
    authored: '—',
    todo: '6 [PLAYTEST] cards',
    notes: 'Temporary playtest tutorial cards pending in-character comms replacement'
  },
  {
    source: 'Unimplemented Systems',
    authored: '—',
    todo: '8 major gaps',
    notes: '5 Victory Endings (PathA–PathE), Bribes/Stings, Day 9 Ghost, Corridor Barks/NPCs/Posters, quests.json (absent), Day 28 wrap-up, 3 QuestFlags stubs, 10 missing ShipInfractionType excuse pools'
  }
];
