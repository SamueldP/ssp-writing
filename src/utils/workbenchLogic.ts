/**
 * Pure data models, lore canon, migration, status classification, search/replace,
 * and JSON/Markdown exporters for Subspace Protocols Writing Workbench.
 */

export const STORAGE_KEY_V1 = 'subspace_protocols_writing_workbench_v1';
export const STORAGE_KEY_V2 = 'subspace_protocols_writing_workbench_v2';

export type WritingStatus = 'LOCKED' | 'DONE' | 'DRAFT' | 'TODO' | 'CUT';

export interface FactionMeta {
  code: string;
  name: string;
  vibe: string;
}

export const FACTIONS: FactionMeta[] = [
  { code: 'KDF-', name: 'Kordani Defense Force', vibe: 'Scarred military police who won the Concord War at massive cost, now locked into the Bulwark Pact with the BMC to police the gate. Clipped, authoritarian, bitter about demotions. Recurring contact: Commander Vorst.' },
  { code: 'BMC-', name: 'Brengop Mercantile Consortium', vibe: 'Sleek, predatory interstellar bankers who bought VG-3 cheap and hold stranded humans under debt contracts. Oily faux-friendly politeness, obsessed with margins and docking turnaround. Recurring contact: Regeer Nixa.' },
  { code: 'GUV-', name: 'Galactic Union Vessels', vibe: 'Core worlds / humanity analogue; high-minded, formal, diplomatic, detached from rim hardship.' },
  { code: 'FTV-', name: 'Independent Free Traders', vibe: 'Scrappy, tired, informal, burning fuel on thin margins; practical and sarcastic.' },
  { code: 'FTC-', name: 'Far-Line Transit Corp', vibe: 'Former station owners who sold VG-3 and left human crew behind as inventory; weary, nostalgic, bitter.' },
  { code: 'MNG-', name: 'Mining Guild', vibe: 'Blue-collar ore haulers; exhausted, soot-stained, blunt about tonnage and quotas.' },
  { code: 'ORN-', name: 'Oruun Rim Traders', vibe: 'Superstitious, overly polite bureaucratic speech, nervous about Ashen Rift folklore.' },
  { code: 'ZNI-', name: 'Zenith Luxury / Core Liners', vibe: 'Entitled, polished, condescending toward rim stations and Deck 4 labour.' },
  { code: 'PRJ-', name: 'Prunjun Merchants', vibe: 'Fast-talking, cagey, transactional; always trying to rush paperwork.' },
  { code: 'TLV-', name: 'Tolvak Transit Line', vibe: 'Rigid schedule-keepers; brusque, punctual, irritated by inspection bottlenecks.' },
  { code: 'KRW-', name: 'Krushvak Haulers', vibe: 'Gruff, heavy-world pragmatism, blunt and loud; little tolerance for red tape.' },
  { code: 'HBR-', name: 'Hun-Borian Vessels', vibe: 'Measured, proud, cautious around Pact military oversight.' },
  { code: 'DEFAULT', name: 'Generic Fallback Pool', vibe: 'Neutral station-traffic fallback used whenever a specific faction pool has no authored lines yet.' }
];

export interface ExcuseKeyMeta {
  key: string;
  label: string;
  day: string;
  sortDay: number;
  system: string;
}

export const EXCUSE_KEYS: ExcuseKeyMeta[] = [
  { key: 'TransponderMismatch', label: 'Transponder vs. Slate REG CODE', day: 'Day 1+', sortDay: 1, system: 'Basic Registration' },
  { key: 'SpoofedHotWeapons', label: 'Spoofed Hot Weapons ([!] HOT WEAPONS)', day: 'Day 2+', sortDay: 2, system: 'SPS Probe' },
  { key: 'WarpMismatch', label: 'Warp Origin / Ashen Rift Bleed', day: 'Day 4+', sortDay: 4, system: 'Warp Checker' },
  { key: 'ExpiredRegistration', label: 'Expired Registration (EXP: CYC)', day: 'Day 8+', sortDay: 8, system: 'Reference Manual Pt 1' },
  { key: 'PrefixOrgMismatch', label: 'Prefix vs. Org / Species Mismatch', day: 'Day 8+', sortDay: 8, system: 'Reference Manual Pt 1' },
  { key: 'HullMismatch', label: 'Hull Silhouette / Class Spoof', day: 'Day 10+', sortDay: 10, system: 'Reference Manual Pt 2' },
  { key: 'CargoBanned', label: 'Banned Cargo / Missing Manifest / Violet SPS', day: 'Day 12+', sortDay: 12, system: 'Wafer Writer & Cargo' },
  { key: 'OverweightStoker', label: 'Undeclared Mass / Stoker Tonnage', day: 'Day 15+', sortDay: 15, system: 'Stellar Stoker' },
  { key: 'FaceOrCamMismatch', label: 'Face Match / Spoofed Broken Camera', day: 'Day 18+', sortDay: 18, system: 'Viewscreen & Comms Audit' },
  { key: 'BioQuarantine', label: 'Bio-Clearance / Stowaway / Forged Permit', day: 'Day 21+', sortDay: 21, system: 'Bio-Quarantine' },
  { key: 'TransitPassMismatch', label: 'Brengop Transit Pass Mismatch', day: 'Day 24+', sortDay: 24, system: 'Transit Pass Wafer' },
  { key: 'General', label: 'General Catch-All Plea / Excuse', day: 'Any Day', sortDay: 1, system: 'Protocol Review' }
];

export interface FactionPool {
  greetings: string[];
  greetingsHostile: string[];
  greetingsWarm: string[];
  excuses: Record<string, string[]>;
  detentionReactions: string[];
  recentCallbacks: {
    ClearedViolation: string[];
    RepeatedDetentions: string[];
    TookBribe: string[];
  };
  doneFlags?: Record<string, boolean>;
}

export interface StructuredField {
  key: string;
  label: string;
  value: string;
  softLimit?: number;
}

export interface CoreItem {
  id: string;
  group: string;
  title: string;
  day: string;
  sortDay: number;
  category: string;
  locked?: boolean;
  done: boolean;
  hint: string;
  context?: string;
  fields: StructuredField[];
}

export interface ForumThread {
  id: string;
  stage: string;
  pillar: string;
  title: string;
  body: string;
  done: boolean;
}

export interface QuestItem {
  id: string;
  group: string;
  title: string;
  day: string;
  sortDay: number;
  category: string;
  status: 'KEEP' | 'UNDECIDED' | 'CUT';
  done: boolean;
  hint: string;
  context?: string;
  fields: StructuredField[];
}

export interface CorridorPoster {
  id: string;
  filename: string;
  stage: string;
  headline: string;
  body: string;
  done: boolean;
  hint: string;
}

export interface CorridorBark {
  id: string;
  label: string;
  stage: string;
  lines: string[];
  done: boolean;
}

export interface StarChartSystem {
  id: string;
  name: string;
  faction: string;
  tags: string;
  exports: string;
  done: boolean;
}

export interface EndingItem {
  id: string;
  title: string;
  day: string;
  category: string;
  trigger: string;
  text: string;
  done: boolean;
}

export interface WorkbenchState {
  meta: {
    version: number;
    corpName: string;
    activeTab: 'factions' | 'core' | 'forum' | 'paths' | 'quests' | 'corridor' | 'endings';
    activeFaction: string;
    filter: 'all' | 'unfinished' | 'drafts' | 'done';
    questSort: 'category' | 'chronological';
    forumHandles: string[];
    deletedQuestIds: string[];
  };
  factionPools: Record<string, FactionPool>;
  coreItems: CoreItem[];
  forumThreads: ForumThread[];
  mainPaths: CoreItem[];
  quests: QuestItem[];
  corridorPosters: CorridorPoster[];
  corridorBarks: CorridorBark[];
  starChart: StarChartSystem[];
  quartersMisc: CoreItem[];
  endings: EndingItem[];
}

export const DEFAULT_FORUM_HANDLES = [
  '[D4_Wrench]: ',
  '[ShiftLead_R]: ',
  '[RedWash_9]: ',
  '[Bay2_Hauler]: ',
  '[BMC_Clerk]: ',
  '[KDF_Patrol4]: ',
  '[Oruun_Scribe]: ',
  '[FTC_Holdout]: '
];

export const FORUM_VARIABLES = [
  '{MOST_DETAINED_FACTION}',
  '{SEIZED_CONTRABAND}',
  '{DOMINANT_FACTION}',
  '{BOOTH_STRICTNESS}'
];

export const FORUM_STAGES = [
  'Stage 1 (Days 1–6: Mundane Friction)',
  'Stage 2 (Days 7–18: Open Turf War)',
  'Stage 3 (Days 19–25: Climax Foreshadowing)',
  'Stage 4 (Days 27–28: Post-Climax Fallout)'
];

export const FORUM_PILLARS = [
  'Contract Trap',
  'Red-Wash',
  'Ashen Rift Superstition',
  'Ceramic Wafers',
  'Reactive Fallout',
  'Station Chatter'
];

export function createEmptyFactionPool(): FactionPool {
  const excuses: Record<string, string[]> = {};
  EXCUSE_KEYS.forEach(e => {
    excuses[e.key] = ['', ''];
  });
  return {
    greetings: ['', '', ''],
    greetingsHostile: [''],
    greetingsWarm: [''],
    excuses,
    detentionReactions: ['', ''],
    recentCallbacks: {
      ClearedViolation: [''],
      RepeatedDetentions: [''],
      TookBribe: ['']
    },
    doneFlags: {}
  };
}

export function buildDefaultState(): WorkbenchState {
  const factionPools: Record<string, FactionPool> = {};
  FACTIONS.forEach(f => {
    factionPools[f.code] = createEmptyFactionPool();
  });

  return {
    meta: {
      version: 2,
      corpName: 'Brengop',
      activeTab: 'factions',
      activeFaction: 'FTV-',
      filter: 'all',
      questSort: 'category',
      forumHandles: [...DEFAULT_FORUM_HANDLES],
      deletedQuestIds: []
    },
    factionPools,
    coreItems: [
      {
        id: 'intro_5card',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: '5-Card New Game Intro Sequence',
        day: 'Day 1 (Intro)',
        sortDay: 1,
        category: 'Intro Sequence',
        locked: true,
        done: true,
        hint: 'Locked intro sequence establishing Void Gate 3, the Bulwark Pact, stranded FTC human labour, and Booth 04.',
        fields: [
          { key: 'card1', label: 'Card 1 — The Void & The Station (Wide shot: VG-3, crimson Brown Dwarf, cyan gate shields)', value: 'Three years after the Concord War, Void Gate 3 remains the sole operational corridor through the rifts.' },
          { key: 'card2', label: 'Card 2 — The Bosses (Short Brengop Regeer w/ slate flanked by 2 Kordani MP)', value: 'Under the terms of the Bulwark Pact, joint control is split between Brengop logistics and Kordani military command.' },
          { key: 'card3', label: 'Card 3 — Stranded Human Labour (FTC workers at docking viewport; Brengop clerk checking inventory)', value: 'When the Far-Line Transit Corp sold the station, the stranded crew were transferred as part of the inventory under updated contracts.' },
          { key: 'card4', label: 'Card 4 — The Reassignment (Half-open Booth 04 bulkhead, angled chair, overturned mug, flickering amber)', value: 'Due to a sudden vacancy at Booth 04, a replacement has been promoted to customs gate operations. Authority level: Provisional.' },
          { key: 'card5', label: 'Card 5 — Title Beat (Solid dark screen)', value: 'Congratulations' }
        ]
      },
      {
        id: 'day1_locked_pair',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Day 1 Brengop Email (Contract #884-D) & Commander Vorst Live Hail',
        day: 'Day 1',
        sortDay: 1,
        category: 'Live Hail & Terminal Email',
        locked: true,
        done: true,
        hint: 'Locked verbatim in game code. Basic Registration (TRANSPONDER ID vs. REG CODE), Wall Star Chart, and 884-D — MY NOTES booklet.',
        fields: [
          { key: 'summary', label: 'Status Note', value: '[LOCKED VERBATIM] Contract #884-D Email (+10 SC/ship, -30 SC/night Berth Lease, 1,000 SC Transit Debt Buyout, constructive assent) + Commander Vorst 8-line Live Hail ("Hail the first ship.").' }
        ]
      },
      {
        id: 'small_gates',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Quarters Door Gates, Shift-End Leave & Day 1 Ration Thought',
        day: 'Days 1–6',
        sortDay: 1,
        category: 'Quarters & UI Prompts',
        locked: false,
        done: true,
        hint: 'Diegetic prompts for Quarters door gating, shift-end walk back, and evening ration reminder.',
        fields: [
          { key: 'd1_door', label: 'Day 1 Unread Email Door Gate', value: 'Should probably read my emails first.' },
          { key: 'd6_door', label: 'Day 6 Unread Email / Chute Door Gate', value: 'Should probably read my emails first. // I see there is something in my chute, let me check it out' },
          { key: 'shift_end', label: 'Shift-End Plain-Text Leave Prompt', value: 'Shift complete. Click to walk back to quarters.' },
          { key: 'd1_food', label: 'Day 1 Evening Diegetic Ration Caption', value: 'Long first shift. Better order rations on the terminal before sleeping.' }
        ]
      },
      {
        id: 'day2_nixa',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Day 2 Live Hail — Regeer Nixa (SPS Probe Restored)',
        day: 'Day 2',
        sortDay: 2,
        category: 'Live Viewscreen Hail',
        locked: false,
        done: true,
        hint: 'Regeer Nixa (Brengop Mercantile Consortium, right-eye tassel) introduces the SPS Probe and hot weapons scan.',
        fields: [
          { key: 'lines', label: 'Regeer Nixa Dialogue', value: 'Regeer Nixa: "Morning, 884-D. I am Regeer Nixa, Consortium Logistics. It is... good to meet you."\nRegeer Nixa: "I see your shift yesterday went smoothly. Keep this up and we—I—will make sure your berth stays warm."\nRegeer Nixa: "I had your former associates on Deck 4 restore the SPS probe last night."\nRegeer Nixa: "Scan every ship and make sure their shields and weapons are actually off before you let them through. Pilots lie, and those Kordani thugs don\'t care how much a station costs when they get their scales on a trigger."\nRegeer Nixa: "Keep the lane moving, 884-D."' }
        ]
      },
      {
        id: 'day6_hack_email',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Day 6 Terminal Hack Email — "CHECK YOUR CHUTE"',
        day: 'Day 6 (Pinned)',
        sortDay: 6,
        category: 'Terminal Hack & Chute',
        locked: false,
        done: true,
        hint: 'Delivers Blank Data Slate in 0500 Chute -> unlocks CRYPTOGRAPHY & DECK 4 tabs, SCRUB LOGS, and mid-download Slate Bus swaps.',
        fields: [
          { key: 'body', label: 'Email Text (FROM: unknown | Status: asf.as…tje)', value: 'Hi…\nCheck your Chute next to your door.\nYou’ll find a blank data-slate. Don’t worry too much where it comes from… just know that you still have friends down on Deck 4\nThere is a MNG- rig on today’s roster carrying telemetry someone is willing to pay for. Slot in the blank slate into the Bus before protocols hit.\nYou can transmit the slate tonight via the Cryptography tab\nDon’t forget to scrub your logs, I hear the Kordani are getting on edge about something.\n\nRegards\nA friend' }
        ]
      },
      {
        id: 'day8_nixa',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Day 8 Live Hail — Regeer Nixa (Brengop Reference Manual Pt 1 & Dopple Rumour)',
        day: 'Day 8',
        sortDay: 8,
        category: 'Live Viewscreen Hail',
        locked: false,
        done: true,
        hint: 'Unlocks Reference Manual Tablet Part 1 (EXP: CYC expiry + Prefix vs. Org/Species) and seeds Dopple shapeshifter rumours.',
        fields: [
          { key: 'lines', label: 'Regeer Nixa Dialogue', value: 'Regeer Nixa: "Morning, 884-D. Still clearing lanes I see. I do love a reliable investment."\nRegeer Nixa: "I pulled a few strings with Consortium Compliance and had a Registry Tablet sent up for your desk. Brand-new glass. Try not to grease it up with those fingers."\nRegeer Nixa: "Check every vessel\'s registration expiry with the registrar and match its prefix against whatever they like to call themselves. Wrong flag or wrong crew, mark the discrepancy and detain them. Let the lizards deal with it."\nRegeer Nixa: "They wanted to run armed boarding sweeps on every second freighter over those ridiculous... Dopple rumours. Imagine what that would do to our docking turnaround."\nRegeer Nixa: "..."\nRegeer Nixa: "Shapeshifting Concord leftovers. Pure gossip, of course. Nothing left of the Dopples after the Ashen collapse wiped them all to dust."\nRegeer Nixa: "Not that it is anything for a booth clerk to count dust over. Leave the paranoia to the Kordani. You just cross-check the registries and keep my ledger clean, 884-D."' }
        ]
      },
      {
        id: 'auto_compliance',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Automatic Shields-Down & Auto-SPS Weapons Compliance Replies',
        day: 'Days 1–2+',
        sortDay: 2,
        category: 'Auto-Compliance Comms',
        done: false,
        hint: 'Short captain replies when Booth 04 auto-orders "Shields down, please." (Day 1+) or "Power down weapons." via SPS sweep (Day 2+).',
        context: 'Flow: "Send subspace protocols." -> "..." -> "Shields down, please." -> captain reply. On Day 2+, sweeping hot weapons auto-fires "Power down weapons."',
        fields: [
          { key: 'shields_polite', label: 'Shields Compliance — Polite / Professional (2–3 short lines)', value: '' },
          { key: 'shields_annoyed', label: 'Shields Compliance — Hurried / Annoyed (2–3 short lines)', value: '' },
          { key: 'wpn_honest', label: 'Auto-SPS Weapons — Honest Armed Ship Cooling Down (2–3 lines)', value: '' },
          { key: 'wpn_spoof', label: 'Auto-SPS Weapons — Spoofed Hot Weapons Lie / Denial (2–3 lines)', value: '' }
        ]
      },
      {
        id: 'day3_ghost_route',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Day 3 Hardcoded Encounter — "The Ghost Route"',
        day: 'Day 3',
        sortDay: 3,
        category: 'Hardcoded Encounter',
        done: false,
        hint: 'Spotless ship on Day 3 rules (random slot 1 or 2) with warm amber Warp Pylons on SPS. Sets GhostRouteSuspectDetained.',
        context: 'Eligible pool: non-GU, non-Pact. Player can click [INSPECT ROUTE] for pushback, then choose to clear or detain on a hunch.',
        fields: [
          { key: 'greeting', label: '[SLOT_GREETING] Arrival Greeting', value: '' },
          { key: 'route_slip', label: '[SLOT_ROUTE_SLIP] Subtle Slip About Declared Origin', value: '' },
          { key: 'cargo_excuse', label: '[SLOT_CARGO_EXCUSE] Casual Deflection / Cargo Line', value: '' },
          { key: 'pushback', label: 'Response to [INSPECT ROUTE] Pushback (Clipped Deflection)', value: '' }
        ]
      },
      {
        id: 'day4_vorst_hails',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Day 4 Commander Vorst Live Hail (Branches A & B + /3 Strikes) & Directives',
        day: 'Day 4',
        sortDay: 4,
        category: 'Live Hail & Warp Checker',
        done: false,
        hint: 'Both branches restore the Warp Printer & Glowing Warp Checker (6 systems + restricted Ashen Rift red bleed) and activate /3 Security Strikes.',
        context: 'Branch A = player detained the Day 3 Ghost Route on a hunch (logs were falsified). Branch B = player cleared them (breach flagged by perimeter relays).',
        fields: [
          { key: 'branch_a', label: 'Branch A — Player Detained Ghost Route (Vorst Hail + /3 Strikes)', value: '' },
          { key: 'branch_b', label: 'Branch B — Player Cleared Ghost Route (Vorst Hail + /3 Strikes)', value: '' },
          { key: 'dir_ab', label: 'Day 4 Morning CRT Directives (Brief Variants A & B)', value: '' }
        ]
      },
      {
        id: 'slate_retransmit',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Day 6+ Slate Bus Mid-Download Unplug / Re-Transmit Annoyance',
        day: 'Day 6+',
        sortDay: 6,
        category: 'Slate Bus Comms',
        done: false,
        hint: 'Plays when you swap a Blank Data Slate out mid-download and ask the captain to re-transmit onto the Primary Slate.',
        context: 'Calm desk UX (no alarms). Faction-flavored annoyance: Civilian/Traders grumble about cheap gear, BMC- threatens billing delays, KDF- demands handshake explanation.',
        fields: [
          { key: 'civ', label: 'Civilian / Free Traders / Miners (2 lines)', value: '' },
          { key: 'bmc', label: 'Brengop (BMC-) Billing/Delay Threat (1–2 lines)', value: '' },
          { key: 'kdf', label: 'Kordani (KDF-) Suspicious Handshake Demand (1–2 lines)', value: '' }
        ]
      },
      {
        id: 'day10_hulls_dir',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Day 10 Morning Shift Directive — Reference Manual Part 2 (HULLS Tab)',
        day: 'Day 10',
        sortDay: 10,
        category: 'Morning Directive',
        done: false,
        hint: 'Short CRT Morning Directive announcing a hull-spoofing spike and unlocking the HULLS tab (Hull Silhouettes & Ship Class).',
        fields: [
          { key: 'directive', label: 'Day 10 Morning Directive Copy', value: '' }
        ]
      },
      {
        id: 'day12_wafers',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 12 Wafer Writer, Cargo Manifest Intro & Empty Hopper Reminder',
        day: 'Day 12',
        sortDay: 12,
        category: 'Wafer Writer & Cargo',
        done: false,
        hint: 'Wafer Writer comes online (3 reusable matte ceramic wafers, zero silicon Brengop cost-cutting) + Cargo Manifest Cert-Wafer + SPS Violet.',
        context: '5 Permanent Banned Items: Disruptor Cells, Unshielded Coils, Raw Slag Isotope, Ashen Spores, Silt Worms.',
        fields: [
          { key: 'directive', label: 'Day 12 Morning Directive (Wafer Writer + 5 Banned Items + SPS Violet)', value: '' },
          { key: 'intro_blurb', label: 'Cargo Manifest Cert-Wafer 1st-Intro Flavour Blurb', value: '' },
          { key: 'empty_hopper', label: 'Empty Hopper Warning Reminder (when player forgets to wipe used wafers)', value: '' }
        ]
      },
      {
        id: 'covert_uploads',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 12+ Covert Mission Slate Bus Upload Reactions (3 Buckets)',
        day: 'Day 12+',
        sortDay: 12,
        category: 'Covert Delivery',
        done: false,
        hint: 'Slotting a pre-loaded Covert Delivery Mission Slate into the Slate Bus triggers one of 3 reaction buckets and burns the crystal.',
        fields: [
          { key: 'intended', label: 'Bucket 1 — Intended Mission Recipient (surprised -> guarded acknowledgment; CRYSTAL BURNT)', value: '' },
          { key: 'wrong_civ', label: 'Bucket 2 — Confused Wrong Civilian Recipient (baffled by junk/encrypted packet)', value: '' },
          { key: 'pact_cruiser', label: 'Bucket 3 — Accidental Pact Cruiser Upload (KDF-/BMC- hostile alarm + +1 Strike)', value: '' }
        ]
      },
      {
        id: 'day15_stoker_foreman',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 15 Live Hail — Brengop Logistics Foreman (Stellar Stoker Dual-Readout)',
        day: 'Day 15',
        sortDay: 15,
        category: 'Live Hail & Stellar Stoker',
        done: false,
        hint: 'Conversational in-world warning on the sickly-yellow Brengop Stellar Stoker module (ANCHOR MASS LED + 0–100% Strain Dial). NO raw % numbers in dialogue.',
        context: 'Mechanics behind the scenes: 15% idle, 65% safe cap, +33% shock per uncalibrated hull -> Sleep Sabotage Audit & next-day 3-State Brownouts, 0 Strikes.',
        fields: [
          { key: 'foreman_name', label: 'Foreman Name / Title (optional)', value: '' },
          { key: 'hail_lines', label: 'Live Viewscreen Hail Dialogue (4–6 crisp lines)', value: '' }
        ]
      },
      {
        id: 'day18_face_bribes',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 18 Viewscreen Face Match, Broken Camera Audit, Bribes & IA Stings',
        day: 'Day 18',
        sortDay: 18,
        category: 'Face Match & Comms Audit',
        done: false,
        hint: 'Mandatory Viewscreen Face Match (Holo / CrudeCrayon), Broken Camera SPS Comms Audit ([!] SPOOFED COMMS), Encrypted Subspace Bribes (30–50 SC) & Kordani IA Stings (+2 Strikes).',
        fields: [
          { key: 'directive', label: 'Day 18 Morning Directive (Face Match + Comms Audit)', value: '' },
          { key: 'bribes', label: 'Encrypted Subspace Bribe Pitches (3–4 casual pitches)', value: '' },
          { key: 'sting_tells', label: 'Kordani IA Sting Dialogue Tells (stiff formal Pact phrasing on a "tramp hauler")', value: '' },
          { key: 'cam_waiver', label: 'Genuine Broken Camera Waiver vs. Lying [!] SPOOFED COMMS Lines', value: '' }
        ]
      },
      {
        id: 'day21_bio',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 21 Bio-Quarantine Directive & Bio-Clearance Cert-Wafer Intro',
        day: 'Day 21',
        sortDay: 21,
        category: 'Bio-Quarantine',
        done: false,
        hint: 'SPS Green Bio-Scan + Bio-Clearance Cert-Wafer. MUST explicitly state the Hard Contraband Rule (Ashen Spores / Silt Worms on a Bio-Clearance = forged permit -> Detain).',
        fields: [
          { key: 'directive', label: 'Day 21 Quarantine Morning Directive (explicitly naming forged-permit rule)', value: '' },
          { key: 'intro_blurb', label: 'Bio-Clearance Cert-Wafer 1st-Intro Flavour Blurb', value: '' }
        ]
      },
      {
        id: 'day22_hostility_destroy',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 22 High-Hostility Refusals (rep <= -9) & Destroy Override (KDF >= +8)',
        day: 'Day 22',
        sortDay: 22,
        category: 'Hostility & Destroy Override',
        done: false,
        hint: 'Brief security addendum + defiant captain refusals and reactions to pulling the Kordani station-defense Destroy Override.',
        fields: [
          { key: 'notice', label: 'Brief Security Addendum / MESSAGES Notice', value: '' },
          { key: 'refusals', label: 'Defiant Captain Shield/Weapon Refusal Lines (rep <= -9)', value: '' },
          { key: 'destroy_react', label: 'Last-Second Destroy Override Comms Reactions', value: '' }
        ]
      },
      {
        id: 'day24_transit_pass',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 24 Brengop Transit Pass Cert-Wafer (3rd Wafer)',
        day: 'Day 24',
        sortDay: 24,
        category: 'Transit Pass Wafer',
        done: false,
        hint: 'Brengop Mercantile Consortium flexing commercial toll authority right before the Day 26 Pact Climax. Sickly-yellow ceramic wafer.',
        fields: [
          { key: 'directive', label: 'Day 24 Morning Directive', value: '' },
          { key: 'intro_blurb', label: 'Brengop Transit Pass 1st-Intro Flavour Blurb', value: '' }
        ]
      },
      {
        id: 'day26_climax',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 26 Pact Climax — "The Uncalibrated Cruiser Surge"',
        day: 'Day 26',
        sortDay: 26,
        category: 'Campaign Climax',
        done: false,
        hint: 'Live clash between Kordani martial law and Brengop infrastructure protection over a battle-damaged uncalibrated KDF- Battle Cruiser.',
        context: 'Vorst orders Clear (Choice A -> spikes Stoker >100%, Path B), Brengop orders Detain (Choice B -> Vorst +1 Strike, Brengop bonus, Path C), or Chute Mission Slate calibration spoof (Choice C -> Paths A/D/E).',
        fields: [
          { key: 'vorst_order', label: 'Commander Vorst Live Hail (ordering clearance regardless of calibration)', value: '' },
          { key: 'brengop_counter', label: 'Brengop Priority Counter-Order (demanding Detain to protect Stoker)', value: '' },
          { key: 'cruiser_react', label: 'Battle Cruiser Captain Reactions (Choice A Clear / Choice B Detain / Choice C Spoof)', value: '' }
        ]
      }
    ],

    forumThreads: [
      { id: 'f_s1_1', stage: 'Stage 1 (Days 1–6: Mundane Friction)', pillar: 'Contract Trap', title: 'New guy in Booth 04 — betting pool on how long he lasts', body: '', done: false },
      { id: 'f_s1_2', stage: 'Stage 1 (Days 1–6: Mundane Friction)', pillar: 'Red-Wash', title: 'Brown Dwarf glare / Red-Wash headache complaint on Deck 4', body: '', done: false },
      { id: 'f_s1_3', stage: 'Stage 1 (Days 1–6: Mundane Friction)', pillar: 'Contract Trap', title: 'Stranded Mechanic\'s Sister (Buildup Post 1 — Day 5)', body: '', done: false },
      { id: 'f_s1_4', stage: 'Stage 1 (Days 1–6: Mundane Friction)', pillar: 'Ashen Rift Superstition', title: 'Ships coming back with drifted clocks near the Ashen Rift', body: '', done: false },
      { id: 'f_s2_1', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Contract Trap', title: 'Kordani vs. Brengop berth-fee & security friction escalating (Day 7 opener)', body: '', done: false },
      { id: 'f_s2_2', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Ceramic Wafers', title: 'Core vs. Rim rant about Brengop cheap air-gapped ceramic wafers (Day 12+)', body: '', done: false },
      { id: 'f_s2_3', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Contract Trap', title: 'Stranded Mechanic\'s Sister — Fallout (Bitter post if detained)', body: '', done: false },
      { id: 'f_s2_4', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Red-Wash', title: 'Reactive Template: Stoker Overload / Next-Day Brownout chatter', body: '', done: false },
      { id: 'f_s2_5', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Contract Trap', title: 'The Ore Skim — Fallout thread (Day 17)', body: '', done: false },
      { id: 'f_s2_6', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Reactive Fallout', title: 'Reactive Template: {MOST_DETAINED_FACTION} & {SEIZED_CONTRABAND} dock gossip', body: '', done: false },
      { id: 'f_s3_1', stage: 'Stage 3 (Days 19–25: Climax Foreshadowing)', pillar: 'Ashen Rift Superstition', title: 'Lower-deck quarantine & cough rumours (Day 19–20)', body: '', done: false },
      { id: 'f_s3_2', stage: 'Stage 3 (Days 19–25: Climax Foreshadowing)', pillar: 'Reactive Fallout', title: 'Overnight Kordani Berth Audit sightings on Deck 4', body: '', done: false },
      { id: 'f_s3_3', stage: 'Stage 3 (Days 19–25: Climax Foreshadowing)', pillar: 'Contract Trap', title: 'KDF warships holding at outer buoys & Brengop locking reserve vaults (Day 23–25)', body: '', done: false },
      { id: 'f_s4_1', stage: 'Stage 4 (Days 27–28: Post-Climax Fallout)', pillar: 'Reactive Fallout', title: 'Day 27 Fallout — If Kordani Cruiser Cleared (Brownout Cascade)', body: '', done: false },
      { id: 'f_s4_2', stage: 'Stage 4 (Days 27–28: Post-Climax Fallout)', pillar: 'Reactive Fallout', title: 'Day 27 Fallout — If Kordani Cruiser Detained (Lockdown Tension)', body: '', done: false },
      { id: 'f_s4_3', stage: 'Stage 4 (Days 27–28: Post-Climax Fallout)', pillar: 'Reactive Fallout', title: 'Day 27 Fallout — If Choice C Calibration Spoofed Quietly', body: '', done: false }
    ],

    mainPaths: [
      {
        id: 'path_a',
        group: 'Five Main Campaign Paths & Climax Bridge',
        title: 'Path A — Galactic Union ("The Extraction")',
        day: 'Days 9–28',
        sortDay: 9,
        category: 'Galactic Union Arc',
        done: false,
        hint: 'Day 9 Ghost (GUV_GhostSpared), Day 10 Modern Diplomat (1/3 or 0/3 Trust), Day 28 weathered GUV- runner escape.',
        context: 'Uses strictly the 2 locked espionage types (Covert Delivery / Intercept & Transmit). Vault objective themes to pick 3 from: (1) Audit Pact military rebuild, (2) Trace Concord/Dopple remnants, (3) Fracture the Pact, (4) Track black-market Concord tech, (5) Investigate trapped far-side ships.',
        fields: [
          { key: 'd9_ghost', label: 'Day 9 Beat 1 — "The Concord-Era Ghost" (Scorched GUV-, 20-yr expired EXP: CYC, disoriented dialogue)', value: '' },
          { key: 'd10_dip', label: 'Day 10 Beat 2 — Modern GUV- Diplomat (Branch A Spared 1/3 Trust vs. Branch B Detained 0/3 Trust)', value: '' },
          { key: 'm1', label: 'GU Covert Mission 1 (Suggested: Day 11 Breather)', value: '' },
          { key: 'm2', label: 'GU Covert Mission 2 (Suggested: Day 17 Breather)', value: '' },
          { key: 'm3', label: 'GU Covert Mission 3 (Suggested: Day 23 Breather)', value: '' },
          { key: 'exposure', label: 'Kordani Double-Agent Exposure / Failure Trigger', value: '' }
        ]
      },
      {
        id: 'path_b',
        group: 'Five Main Campaign Paths & Climax Bridge',
        title: 'Path B — Kordani ("The Iron Collar" / The Kordani Coup)',
        day: 'Days 11–26',
        sortDay: 11,
        category: 'Kordani Security Arc',
        done: false,
        hint: 'Day 1 Vorst, Day 4 Vorst, Day 26 Choice A (Clear the Battle Cruiser).',
        context: '3 core missions (matching Path A) showing Kordani gradually pulling Booth 04 in to sideline Brengop.',
        fields: [
          { key: 'handler', label: 'Handler Name (Vorst direct or junior Kordani Intelligence attaché?)', value: '' },
          { key: 'm1', label: 'Kordani Mission 1 (Early Days 11–14)', value: '' },
          { key: 'm2', label: 'Kordani Mission 2 (Mid Days 17–20)', value: '' },
          { key: 'm3', label: 'Kordani Mission 3 (Late Day 23 — Pre-Climax)', value: '' }
        ]
      },
      {
        id: 'path_c',
        group: 'Five Main Campaign Paths & Climax Bridge',
        title: 'Path C — Brengop ("The Company Man" / The Buyout)',
        day: 'Days 11–28',
        sortDay: 11,
        category: 'Brengop Mercantile Arc',
        done: false,
        hint: 'Day 1 Contract #884-D, Day 2 & 8 Regeer Nixa, Day 15 Foreman, Day 16 Ore Skim, Day 26 Choice B, Day 28 ZNI- luxury liner.',
        context: 'Uses Regeer Nixa directly as your Brengop Factor (already established on Days 2 & 8) to avoid introducing extra names.',
        fields: [
          { key: 'factor', label: 'Brengop Factor Name (Keep Regeer Nixa?) + Unprompted Berth Lease Discount Hook', value: 'Regeer Nixa (Consortium Logistics) — ' },
          { key: 'm1', label: 'Brengop Mission 1 (Days 11–14)', value: '' },
          { key: 'm2', label: 'Brengop Mission 2 (Days 17–20)', value: '' },
          { key: 'm3', label: 'Brengop Mission 3 (Day 23–25)', value: '' }
        ]
      },
      {
        id: 'path_d',
        group: 'Five Main Campaign Paths & Climax Bridge',
        title: 'Path D — The Masters / Dopples ("The Hollow Gate" / Quiet Return)',
        day: 'Days 17–28',
        sortDay: 17,
        category: 'Dopple Shadow Arc',
        done: false,
        hint: 'Day 8 Nixa Dopple rumour drop -> Day 19 Mirror Captain (Meeting 1) -> Day 21 Mirror Captain (Meeting 2 + senderless MESSAGES contact).',
        context: 'Days 21–27 fits a tight 2-mission late-game shadow arc leading to dual Day 28 choices (forged GU identity vs. staying to run their shadow gate).',
        fields: [
          { key: 'voice', label: 'Contact Voice / Style (Senderless MESSAGES tone) + Optional Day 17 Subtle Hint', value: '' },
          { key: 'm1', label: 'Masters / Dopples Mission 1 (Day 23)', value: '' },
          { key: 'm2', label: 'Masters / Dopples Mission 2 / Finale (Day 27)', value: '' },
          { key: 'triggers', label: 'Discovery & Dual Epilogue Trigger Conditions', value: '' }
        ]
      },
      {
        id: 'path_e',
        group: 'Five Main Campaign Paths & Climax Bridge',
        title: 'Path E — Independent Escape ("Out into the Dark")',
        day: 'Days 22–28',
        sortDay: 22,
        category: 'Independent Escape Arc',
        done: false,
        hint: '1,000 SC tunable live PactScrip + >= +6 rep with FTV- or FTC- + Day 22 Seed Bank goodwill.',
        fields: [
          { key: 'berth_offer', label: 'Day 27/28 Friendly FTV- or FTC- Captain Berth-Offer Encounter', value: '' }
        ]
      },
      {
        id: 'd26_choice_c',
        group: 'Five Main Campaign Paths & Climax Bridge',
        title: 'Day 26 Choice C — Bridge Beat (Chute Calibration Spoof)',
        day: 'Days 25–26',
        sortDay: 25,
        category: 'Climax Override Bridge',
        done: false,
        hint: 'Explains why a pre-loaded sealed Mission Slate appears in your 0500 Chute on Day 26 morning to spoof cruiser calibration safely.',
        fields: [
          { key: 'sender', label: 'Who Drops the Slate & Unlock Prerequisite (Path A, Path D, or DECK 4 standing?)', value: '' },
          { key: 'email', label: 'Day 25 Evening / Day 26 Morning MESSAGES Hook Email', value: '' }
        ]
      }
    ],

    quests: [
      {
        id: 'rf_mng',
        group: 'Recurring Faces',
        category: 'Recurring Faces',
        title: 'Face 1 — Exhausted MNG- Ore Pilot (-> Day 16 The Ore Skim)',
        day: 'Days 5–16',
        sortDay: 5,
        status: 'KEEP',
        done: false,
        hint: 'Trademark: Cracked visor / tired sigh. Needs 1–2 casual visits (Days 5–11) before Day 16 payoff.',
        fields: [
          { key: 'casual', label: 'Casual Early Visit Dialogue (Days 5–11)', value: '' },
          { key: 'quest_ore_skim', label: 'Day 16 "The Ore Skim" (Brengop auditor chute Blank Slate + +33% Stoker shock squeeze)', value: '' }
        ]
      },
      {
        id: 'rf_ftv',
        group: 'Recurring Faces',
        category: 'Recurring Faces',
        title: 'Face 2 — Sarcastic FTV- Civilian Courier (-> Day 11/13 The Reassigned Captain)',
        day: 'Days 5–13',
        sortDay: 5,
        status: 'KEEP',
        done: false,
        hint: 'Trademark: Glitching mic / dry humor. Likable early visits (Days 5–9) -> Day 11 Intercept -> Day 13 cold replacement pilot.',
        fields: [
          { key: 'casual', label: 'Casual Early Visit Dialogue (Days 5–9)', value: '' },
          { key: 'd11_contract', label: 'Day 11 "The Reassigned Captain" Compliance Audit Contract & Comms', value: '' },
          { key: 'd13_replace', label: 'Day 13 Cold Replacement Pilot ("Previous master was reassigned.")', value: '' }
        ]
      },
      {
        id: 'rf_orn',
        group: 'Recurring Faces',
        category: 'Recurring Faces',
        title: 'Face 3 — Superstitious ORN- Rim Trader (-> Day 22 Starving Colony\'s Seed Bank)',
        day: 'Days 7–22',
        sortDay: 7,
        status: 'KEEP',
        done: false,
        hint: 'Trademark: Overly polite bureaucratic speech / Ashen Rift warnings. Seeds folklore early (Days 7–14) -> Day 22 bio moral pinch.',
        fields: [
          { key: 'casual', label: 'Casual Early Visit & Ashen Rift Folklore (Days 7–14)', value: '' },
          { key: 'd22_seeds', label: 'Day 22 "The Starving Colony\'s Seed Bank" Moral Pinch Dialogue (feeds Path E)', value: '' }
        ]
      },
      {
        id: 'sq_mechanic',
        group: 'Core Side Quests',
        category: 'Core Side Quests',
        title: 'Core Quest 4 — The Stranded Mechanic\'s Sister (Day 14 Payoff)',
        day: 'Days 5–14',
        sortDay: 14,
        status: 'KEEP',
        done: false,
        hint: 'FORUM buildup Days 5–13 -> Day 14 beat-up FTV- arrives with expired EXP: CYC (Clear -> +45 SC chute drop; Detain -> bitter posts).',
        fields: [
          { key: 'dm', label: 'Mechanic\'s Direct Message / Plea (Day 13/14)', value: '' },
          { key: 'sister', label: 'Sister\'s Booth 04 Arrival & Expired EXP: CYC Excuse', value: '' },
          { key: 'note', label: 'Chute Drop Thank-You Note (+45 SC if Cleared)', value: '' }
        ]
      },
      {
        id: 'sq_mirror',
        group: 'Core Side Quests',
        category: 'Core Side Quests',
        title: 'Core Quest 5 — The Mirror Captain (Path D Breadcrumb)',
        day: 'Days 19 & 21',
        sortDay: 19,
        status: 'KEEP',
        done: false,
        hint: 'Day 19 Meeting 1 (spotless civilian clears cleanly) -> Day 21 Meeting 2 (EXACT same portrait/greeting + Ashen Rift red bleed + optional Green Bio-Sig -> senderless Path D email).',
        fields: [
          { key: 'm1', label: 'Day 19 Meeting 1 — Identical Memorable Greeting & Small Detail', value: '' },
          { key: 'm2', label: 'Day 21 Meeting 2 — Uncanny Word-for-Word Repeat + Deflection When Flagged', value: '' },
          { key: 'email', label: 'Post-Encounter Senderless Path D MESSAGES Email', value: '' }
        ]
      },
      {
        id: 'opt_quiet_pass',
        group: 'Optional / Secondary',
        category: 'Optional / Secondary',
        title: 'Optional 1 — The Quiet Passenger (Pattern-Based DIP Covert Delivery)',
        day: 'Day 12+',
        sortDay: 12,
        status: 'UNDECIDED',
        done: false,
        hint: 'Slip a sealed mission slate onto a nervous DIP vessel ("Understood. Thank you, Booth 04"); days later Kordani mentions hunting a runaway clerk/deserter.',
        fields: [
          { key: 'notes', label: 'Contract & Comms Copy (or leave blank & mark CUT)', value: '' }
        ]
      },
      {
        id: 'opt_first_cough',
        group: 'Optional / Secondary',
        category: 'Optional / Secondary',
        title: 'Optional 2 — The First Cough (Day 19 Ashen Rift Freighter)',
        day: 'Day 19',
        sortDay: 19,
        status: 'UNDECIDED',
        done: false,
        hint: 'Foreshadows Day 21 Bio-Quarantine.',
        fields: [
          { key: 'notes', label: 'Arrival & Cough Comms Lines', value: '' }
        ]
      },
      {
        id: 'opt_helani',
        group: 'Optional / Secondary',
        category: 'Optional / Secondary',
        title: 'Optional 3 — Helani Courier Intercept (Legacy Draft)',
        day: 'Day 15',
        sortDay: 15,
        status: 'UNDECIDED',
        done: false,
        hint: 'Legacy vault draft — recipient faction, trigger day, and reward to be decided.',
        fields: [
          { key: 'notes', label: 'Details (or mark CUT to trim scope)', value: '' }
        ]
      },
      {
        id: 'opt_orn442',
        group: 'Optional / Secondary',
        category: 'Optional / Secondary',
        title: 'Optional 4 — Oruun Freighter ORN-442xxx (Legacy Draft)',
        day: 'Day 16',
        sortDay: 16,
        status: 'UNDECIDED',
        done: false,
        hint: 'Legacy vault draft — quest giver, invalid fields, reward, strike impact to be decided.',
        fields: [
          { key: 'notes', label: 'Details (or mark CUT to trim scope)', value: '' }
        ]
      },
      {
        id: 'opt_night_visitors',
        group: 'Optional / Secondary',
        category: 'Optional / Secondary',
        title: 'Nighttime Quarters Side-Door Corridor Visitors (2+ Empty Vault Slots)',
        day: 'Day 20',
        sortDay: 20,
        status: 'UNDECIDED',
        done: false,
        hint: 'Decide whether to cut these (recommended to keep scope tight) or assign characters.',
        fields: [
          { key: 'notes', label: 'Decision / Notes', value: '' }
        ]
      }
    ],

    corridorPosters: [
      { id: 'poster_brengop', filename: 'corridor_poster_brengop.png', stage: 'Stage 1–4', headline: '', body: '', done: false, hint: 'Brengop Mercantile Consortium Berth-Debt Compliance / Productivity poster (sickly-yellow industrial tone).' },
      { id: 'poster_kordani', filename: 'corridor_poster_kordani.png', stage: 'Stage 2–4', headline: '', body: '', done: false, hint: 'Kordani Martial Security / /3 Strikes Bulletin.' },
      { id: 'poster_ftc', filename: 'corridor_poster_ftc.png', stage: 'Stage 1', headline: '', body: '', done: false, hint: 'Scraped-over old Far-Line Transit Corp (FTC-) safety sign with Brengop stickers slapped on top.' },
      { id: 'poster_bio', filename: 'corridor_poster_bio.png', stage: 'Day 21+ (Stage 3)', headline: '', body: '', done: false, hint: 'Day 21 Bio-Quarantine / Ashen Spores & Silt Worms advisory.' },
      { id: 'poster_surge', filename: 'corridor_poster_surge.png', stage: 'Days 25–27', headline: '', body: '', done: false, hint: 'Cruiser Surge / Emergency Lockdown or Reserve Vault notice.' },
      { id: 'poster_deck4', filename: 'corridor_poster_deck4.png', stage: 'Stage 2–3', headline: '', body: '', done: false, hint: 'Unofficial Deck 4 graffiti / whispered union or Red-Wash flyer.' }
    ],

    corridorBarks: [
      { id: 'bark_s1', label: 'Stage 1 (Days 1–6: Mundane Friction — Deck 4 Workers & Off-Duty Pilots)', stage: 'Stage 1', lines: ['', '', ''], done: false },
      { id: 'bark_s2', label: 'Stage 2 (Days 7–18: Open Turf War — Kordani Sentries & Brengop Clerks)', stage: 'Stage 2', lines: ['', '', ''], done: false },
      { id: 'bark_s3', label: 'Stage 3 (Days 19–25: Climax Foreshadowing — Quarantine & Outer-Buoy Rumours)', stage: 'Stage 3', lines: ['', '', ''], done: false },
      { id: 'bark_s4', label: 'Stage 4 (Days 27–28: Post-Climax Fallout)', stage: 'Stage 4', lines: ['', ''], done: false },
      { id: 'bark_brownout', label: 'Post-Brownout Morning Reactions (NextDayPowerBrownout == true)', stage: 'Dynamic (Day 16+)', lines: ['', ''], done: false },
      { id: 'bark_audit', label: 'Post-Berth-Audit Morning Reactions (Overnight Kordani Sweep)', stage: 'Dynamic (Day 4+)', lines: ['', ''], done: false }
    ],

    starChart: [
      { id: 'VG-3', name: 'Void Gate 3 (VG-3)', faction: 'Bulwark Pact (Brengop / Kordani)', tags: '', exports: '', done: false },
      { id: 'Gharok', name: 'Gharok', faction: '', tags: '', exports: '', done: false },
      { id: 'Veridia', name: 'Veridia', faction: '', tags: '', exports: '', done: false },
      { id: 'Oruun-4', name: 'Oruun-4', faction: '', tags: '', exports: '', done: false },
      { id: 'Ash', name: 'The Ashen Rift (Ash)', faction: 'Restricted / Concord Ruin', tags: '', exports: '', done: false },
      { id: 'Korr-Vath', name: 'Korr-Vath', faction: '', tags: '', exports: '', done: false },
      { id: 'Dul-Krag', name: 'Dul-Krag', faction: '', tags: '', exports: '', done: false }
    ],

    quartersMisc: [
      {
        id: 'misc_unsolicited',
        group: 'Quarters Terminal Dispatches & Audits',
        title: 'Unsolicited Faction Recognition MESSAGES Emails',
        day: 'Dynamic',
        sortDay: 7,
        category: 'Terminal Dispatches',
        done: false,
        hint: 'Sent dynamically based on hidden counters / reputation.',
        fields: [
          { key: 'bmc_praise', label: 'Brengop Throughput Praise / Lease Discount Hook', value: '' },
          { key: 'kdf_warn', label: 'Quiet Kordani Leniency Warning', value: '' },
          { key: 'roster_headers', label: 'Morning Ship Roster Flavor Header Variations (2–3 dry headers)', value: '' }
        ]
      },
      {
        id: 'misc_audits',
        group: 'Quarters Terminal Dispatches & Audits',
        title: '2-Tier Sleep Berth Audit & Stoker Sabotage Audit Dialogue',
        day: 'Day 4+ / Day 15+',
        sortDay: 4,
        category: 'Overnight Audits',
        done: false,
        hint: 'Overnight Kordani knocks when hitting 3/3 Strikes or overloading the Stellar Stoker.',
        fields: [
          { key: 'tier1_clean', label: 'Tier 1 Coat Frisk & Clean Terminal Check (Clean-Audit Fine -40 SC)', value: '' },
          { key: 'tier2_vent', label: 'Tier 2 Unscrubbed Logs -> Deep Vent Sweep (Discovery / Detainment)', value: '' },
          { key: 'stoker_raid', label: 'Stellar Stoker Overload Sabotage Audit Dialogue (0 Strikes)', value: '' }
        ]
      },
      {
        id: 'misc_tutorials',
        group: 'Quarters Terminal Dispatches & Audits',
        title: 'Diegetic Tutorial Nudges (data/dialogue/tutorials.json)',
        day: 'Days 1–21',
        sortDay: 1,
        category: 'Diegetic Tutorials',
        done: false,
        hint: 'Short 1–2 line dry in-character self-talk or comms cues replacing any remaining popups.',
        fields: [
          { key: 'quarters', label: 'Quarters Nudges (Chute, Vent Stash, Glowing Wall Star Chart)', value: '' },
          { key: 'desk', label: 'Desk Hardware Nudges (Wafer Writer, ANCHOR MASS, SPS Comms Audit, Bio-Scan)', value: '' }
        ]
      }
    ],

    endings: [
      { id: 'end_a', title: 'Path A — Galactic Union ("The Extraction" / Across the Line)', day: 'Day 28', category: 'Main Ending', trigger: '3/3 GU Trust -> Day 28 weathered GUV- cargo runner escape showing VG-3 & Brown Dwarf shrinking.', text: '', done: false },
      { id: 'end_b', title: 'Path B — Kordani ("The Iron Collar" / The Kordani Coup)', day: 'Day 28', category: 'Main Ending', trigger: 'Kordani arc + Day 26 Choice A (Clear Battle Cruiser).', text: '', done: false },
      { id: 'end_c', title: 'Path C — Brengop ("The Company Man" / The Buyout)', day: 'Day 28', category: 'Main Ending', trigger: 'Brengop Factor arc + Day 26 Choice B (Detain Battle Cruiser) -> ZNI- luxury liner buyout.', text: '', done: false },
      { id: 'end_d', title: 'Path D — The Masters / Dopples ("The Hollow Gate" / The Quiet Return)', day: 'Day 28', category: 'Main Ending (Dual Epilogue)', trigger: 'Dual epilogue: (1) Forged GU identity escape OR (2) Staying to run their shadow gate.', text: '', done: false },
      { id: 'end_e', title: 'Path E — Independent Escape ("Out into the Dark")', day: 'Day 28', category: 'Main Ending', trigger: '1,000 SC live PactScrip + >= +6 rep with FTV- or FTC- -> Smuggled out by friendly captain.', text: '', done: false },
      { id: 'end_fail_sec', title: 'Failure Ending 1 — Security Detainment', day: 'Any Day (3 Strikes)', category: 'Failure Ending', trigger: 'Caught with contraband / unscrubbed treason during 3-Strike Kordani Berth Audit.', text: '', done: false },
      { id: 'end_fail_debt', title: 'Failure Ending 2 — Debt Foreclosure', day: 'Any Day (Debt Default)', category: 'Failure Ending', trigger: 'Deep unpaid Berth Lease / fines foreclosure by Brengop Mercantile Consortium.', text: '', done: false }
    ]
  };
}

// ---------- TEXT & STATUS HELPERS ----------

export function hasText(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0 && !v.trim().startsWith('[TODO]');
}

/**
 * 3-State Completion Logic (Fixes false-positive isItemDone bug):
 * - LOCKED: item.locked === true
 * - CUT: item.status === 'CUT'
 * - DONE: item.done === true (explicitly marked complete by the user)
 * - DRAFT: not marked done, but at least one field has authored text
 * - TODO: not marked done and no fields have authored text
 */
export function getStructuredItemStatus(item: {
  locked?: boolean;
  done?: boolean;
  status?: 'KEEP' | 'UNDECIDED' | 'CUT';
  fields?: StructuredField[];
}): WritingStatus {
  if (item.status === 'CUT') return 'CUT';
  if (item.locked) return 'LOCKED';
  if (item.done) return 'DONE';
  const anyFilled = (item.fields || []).some(f => hasText(f.value));
  return anyFilled ? 'DRAFT' : 'TODO';
}

export function getFactionCardStatus(lines: string[], explicitDone?: boolean): WritingStatus {
  if (explicitDone) return 'DONE';
  const anyFilled = lines.some(hasText);
  return anyFilled ? 'DRAFT' : 'TODO';
}

export function getForumThreadStatus(t: ForumThread): WritingStatus {
  if (t.done) return 'DONE';
  return hasText(t.body) ? 'DRAFT' : 'TODO';
}

export function getPosterStatus(p: CorridorPoster): WritingStatus {
  if (p.done) return 'DONE';
  return (hasText(p.headline) || hasText(p.body)) ? 'DRAFT' : 'TODO';
}

export function getBarkStatus(b: CorridorBark): WritingStatus {
  if (b.done) return 'DONE';
  return b.lines.some(hasText) ? 'DRAFT' : 'TODO';
}

export function getStarChartStatus(s: StarChartSystem): WritingStatus {
  if (s.done) return 'DONE';
  return (hasText(s.tags) || hasText(s.exports)) ? 'DRAFT' : 'TODO';
}

export function getEndingStatus(e: EndingItem): WritingStatus {
  if (e.done) return 'DONE';
  return hasText(e.text) ? 'DRAFT' : 'TODO';
}

export function matchesStatusFilter(status: WritingStatus, filter: WorkbenchState['meta']['filter']): boolean {
  if (filter === 'all') return true;
  if (status === 'CUT') return false;
  if (filter === 'unfinished') return status === 'TODO' || status === 'DRAFT';
  if (filter === 'drafts') return status === 'DRAFT';
  if (filter === 'done') return status === 'DONE' || status === 'LOCKED';
  return true;
}

// ---------- STATS CALCULATION ----------

export interface TabStat {
  total: number;
  done: number;
  draft: number;
  todo: number;
}

export interface GlobalStats {
  tabs: Record<string, TabStat>;
  allTot: number;
  allDone: number;
  allDraft: number;
  allTodo: number;
  words: number;
}

export function calcFactionStats(state: WorkbenchState, code: string): TabStat {
  const p = state.factionPools[code];
  const flags = p.doneFlags || {};
  let total = 0, done = 0, draft = 0, todo = 0;

  const tally = (arr: string[], flagKey: string) => {
    total++;
    const st = getFactionCardStatus(arr || [], flags[flagKey]);
    if (st === 'DONE') done++;
    else if (st === 'DRAFT') draft++;
    else todo++;
  };

  tally(p.greetings, 'greetings');
  tally(p.greetingsHostile, 'greetingsHostile');
  tally(p.greetingsWarm, 'greetingsWarm');
  EXCUSE_KEYS.forEach(ek => {
    tally(p.excuses[ek.key] || [], `excuses.${ek.key}`);
  });
  tally(p.detentionReactions, 'detentionReactions');
  tally(p.recentCallbacks.ClearedViolation, 'recentCallbacks.ClearedViolation');
  tally(p.recentCallbacks.RepeatedDetentions, 'recentCallbacks.RepeatedDetentions');
  tally(p.recentCallbacks.TookBribe, 'recentCallbacks.TookBribe');

  return { total, done, draft, todo };
}

export function calcAllStats(state: WorkbenchState): GlobalStats {
  const tabs: Record<string, TabStat> = {};

  const tallyStatuses = (statuses: WritingStatus[]): TabStat => {
    const active = statuses.filter(s => s !== 'CUT');
    return {
      total: active.length,
      done: active.filter(s => s === 'DONE' || s === 'LOCKED').length,
      draft: active.filter(s => s === 'DRAFT').length,
      todo: active.filter(s => s === 'TODO').length
    };
  };

  // 1. Factions
  let fTot = 0, fDone = 0, fDraft = 0, fTodo = 0;
  FACTIONS.forEach(f => {
    const s = calcFactionStats(state, f.code);
    fTot += s.total; fDone += s.done; fDraft += s.draft; fTodo += s.todo;
  });
  tabs.factions = { total: fTot, done: fDone, draft: fDraft, todo: fTodo };

  // 2. Core Hails & Systems
  tabs.core = tallyStatuses(state.coreItems.map(getStructuredItemStatus));

  // 3. FORUM
  tabs.forum = tallyStatuses(state.forumThreads.map(getForumThreadStatus));

  // 4. Main Paths
  tabs.paths = tallyStatuses(state.mainPaths.map(getStructuredItemStatus));

  // 5. Quests (excludes CUT automatically)
  tabs.quests = tallyStatuses(state.quests.map(getStructuredItemStatus));

  // 6. Corridor, Star Chart & Quarters Misc
  const corrStatuses: WritingStatus[] = [
    ...state.corridorPosters.map(getPosterStatus),
    ...state.corridorBarks.map(getBarkStatus),
    ...state.starChart.map(getStarChartStatus),
    ...state.quartersMisc.map(getStructuredItemStatus)
  ];
  tabs.corridor = tallyStatuses(corrStatuses);

  // 7. Endings
  tabs.endings = tallyStatuses(state.endings.map(getEndingStatus));

  let allTot = 0, allDone = 0, allDraft = 0, allTodo = 0;
  Object.values(tabs).forEach(t => {
    allTot += t.total;
    allDone += t.done;
    allDraft += t.draft;
    allTodo += t.todo;
  });

  // Word count
  let words = 0;
  const countStr = (s: string) => {
    if (!hasText(s)) return;
    words += s.trim().split(/\s+/).length;
  };
  Object.values(state.factionPools).forEach(p => {
    p.greetings.forEach(countStr);
    p.greetingsHostile.forEach(countStr);
    p.greetingsWarm.forEach(countStr);
    Object.values(p.excuses).forEach(arr => arr.forEach(countStr));
    p.detentionReactions.forEach(countStr);
    Object.values(p.recentCallbacks).forEach(arr => arr.forEach(countStr));
  });
  [...state.coreItems, ...state.mainPaths, ...state.quests, ...state.quartersMisc].forEach(it => {
    (it.fields || []).forEach(f => countStr(f.value));
  });
  state.forumThreads.forEach(t => { countStr(t.title); countStr(t.body); });
  state.corridorPosters.forEach(p => { countStr(p.headline); countStr(p.body); });
  state.corridorBarks.forEach(b => b.lines.forEach(countStr));
  state.starChart.forEach(s => { countStr(s.faction); countStr(s.tags); countStr(s.exports); });
  state.endings.forEach(e => countStr(e.text));

  return { tabs, allTot, allDone, allDraft, allTodo, words };
}

// ---------- SAFE LOCALSTORAGE MIGRATION ----------

export function parseStartDayFromLabel(dayLabel: string, fallback = 12): number {
  if (!dayLabel) return fallback;
  const m = dayLabel.match(/(\d+)/);
  if (!m) return fallback;
  const n = parseInt(m[1], 10);
  return Math.max(1, Math.min(28, n));
}

export function migrateState(rawSaved: any): WorkbenchState {
  const defaults = buildDefaultState();
  if (!rawSaved || typeof rawSaved !== 'object') return defaults;

  const deletedQuestIds: string[] = Array.isArray(rawSaved.meta?.deletedQuestIds)
    ? rawSaved.meta.deletedQuestIds
    : [];

  // Fix typo "Brengop Mining Consortium" -> "Brengop Mercantile Consortium" everywhere in saved strings
  const fixBmcTypo = (s: unknown): string => {
    if (typeof s !== 'string') return '';
    return s.replace(/Brengop Mining Consortium/g, 'Brengop Mercantile Consortium');
  };

  // Migrate meta
  const validTabs = ['factions', 'core', 'forum', 'paths', 'quests', 'corridor', 'endings'];
  const activeTab = validTabs.includes(rawSaved.meta?.activeTab) ? rawSaved.meta.activeTab : 'factions';
  const rawFilter = rawSaved.meta?.filter;
  const filter = rawFilter === 'todo' ? 'unfinished' :
                 (['all', 'unfinished', 'drafts', 'done'].includes(rawFilter) ? rawFilter : 'all');

  let corpName = fixBmcTypo(rawSaved.meta?.corpName || 'Brengop');
  corpName = corpName.replace(/\s*\(BMC-\)\s*$/, '').trim() || 'Brengop';

  const out: WorkbenchState = {
    ...defaults,
    meta: {
      version: 2,
      corpName,
      activeTab,
      activeFaction: rawSaved.meta?.activeFaction || 'FTV-',
      filter,
      questSort: rawSaved.meta?.questSort === 'chronological' ? 'chronological' : 'category',
      forumHandles: Array.isArray(rawSaved.meta?.forumHandles) && rawSaved.meta.forumHandles.length > 0
        ? rawSaved.meta.forumHandles
        : [...DEFAULT_FORUM_HANDLES],
      deletedQuestIds
    }
  };

  // Migrate factionPools
  if (rawSaved.factionPools && typeof rawSaved.factionPools === 'object') {
    FACTIONS.forEach(f => {
      const src = rawSaved.factionPools[f.code];
      if (!src) return;
      const dst = out.factionPools[f.code];
      if (Array.isArray(src.greetings) && src.greetings.length) dst.greetings = src.greetings.map(fixBmcTypo);
      if (Array.isArray(src.greetingsHostile) && src.greetingsHostile.length) dst.greetingsHostile = src.greetingsHostile.map(fixBmcTypo);
      if (Array.isArray(src.greetingsWarm) && src.greetingsWarm.length) dst.greetingsWarm = src.greetingsWarm.map(fixBmcTypo);
      if (Array.isArray(src.detentionReactions) && src.detentionReactions.length) dst.detentionReactions = src.detentionReactions.map(fixBmcTypo);
      if (src.excuses && typeof src.excuses === 'object') {
        EXCUSE_KEYS.forEach(ek => {
          if (Array.isArray(src.excuses[ek.key]) && src.excuses[ek.key].length) {
            dst.excuses[ek.key] = src.excuses[ek.key].map(fixBmcTypo);
          }
        });
      }
      if (src.recentCallbacks && typeof src.recentCallbacks === 'object') {
        (['ClearedViolation', 'RepeatedDetentions', 'TookBribe'] as const).forEach(k => {
          if (Array.isArray(src.recentCallbacks[k]) && src.recentCallbacks[k].length) {
            dst.recentCallbacks[k] = src.recentCallbacks[k].map(fixBmcTypo);
          }
        });
      }
      if (src.doneFlags && typeof src.doneFlags === 'object') {
        dst.doneFlags = { ...src.doneFlags };
      }
    });
  }

  // Helper to merge structured lists (coreItems, mainPaths, quartersMisc)
  const mergeStructured = (defList: CoreItem[], savedList: any[]): CoreItem[] => {
    if (!Array.isArray(savedList)) return defList;
    return defList.map(defItem => {
      const sv = savedList.find(x => x && x.id === defItem.id);
      if (!sv) return defItem;
      const fields = defItem.fields.map(df => {
        const sf = Array.isArray(sv.fields) ? sv.fields.find((x: any) => x && x.key === df.key) : null;
        return sf ? { ...df, label: fixBmcTypo(sf.label || df.label), value: fixBmcTypo(sf.value ?? df.value) } : df;
      });
      return {
        ...defItem,
        done: typeof sv.done === 'boolean' ? sv.done : defItem.done,
        fields
      };
    });
  };

  out.coreItems = mergeStructured(defaults.coreItems, rawSaved.coreItems);
  out.mainPaths = mergeStructured(defaults.mainPaths, rawSaved.mainPaths);
  out.quartersMisc = mergeStructured(defaults.quartersMisc, rawSaved.quartersMisc);

  // Migrate Quests: preserve custom quests, edits to title/day/sortDay/category/hint/fields, and respect deletions!
  if (Array.isArray(rawSaved.quests)) {
    const isV2Saved = rawSaved.meta?.version === 2;
    const savedIds = new Set(rawSaved.quests.map((q: any) => q?.id).filter(Boolean));

    const migratedQuests: QuestItem[] = [];
    // First process saved quests in their saved order
    rawSaved.quests.forEach((sq: any) => {
      if (!sq || !sq.id || deletedQuestIds.includes(sq.id)) return;
      const defQ = defaults.quests.find(d => d.id === sq.id);
      const dayLabel = fixBmcTypo(sq.day ?? defQ?.day ?? 'Day 12');
      const sortDay = typeof sq.sortDay === 'number' && isFinite(sq.sortDay)
        ? Math.max(1, Math.min(28, sq.sortDay))
        : (defQ?.sortDay ?? parseStartDayFromLabel(dayLabel, 12));
      const category = fixBmcTypo(sq.category || defQ?.category || sq.group || 'Core Side Quests');
      const fields: StructuredField[] = Array.isArray(sq.fields)
        ? sq.fields.map((f: any, idx: number) => ({
            key: f.key || `beat_${idx + 1}`,
            label: fixBmcTypo(f.label || `Beat ${idx + 1}`),
            value: fixBmcTypo(f.value ?? '')
          }))
        : (defQ ? [...defQ.fields] : [{ key: 'beat_1', label: 'Quest Beat / Dialogue', value: '' }]);

      migratedQuests.push({
        id: String(sq.id),
        group: category,
        category,
        title: fixBmcTypo(sq.title || defQ?.title || 'Untitled Quest'),
        day: dayLabel,
        sortDay,
        status: ['KEEP', 'UNDECIDED', 'CUT'].includes(sq.status) ? sq.status : (defQ?.status || 'KEEP'),
        done: !!sq.done,
        hint: fixBmcTypo(sq.hint ?? defQ?.hint ?? ''),
        context: sq.context ? fixBmcTypo(sq.context) : defQ?.context,
        fields
      });
    });

    // If migrating from v1 (where user couldn't delete quests, or only had a subset), add any default quests not in deletedQuestIds and not in savedIds ONLY if not v2
    if (!isV2Saved) {
      defaults.quests.forEach(dq => {
        if (!savedIds.has(dq.id) && !deletedQuestIds.includes(dq.id)) {
          migratedQuests.push(dq);
        }
      });
    }

    out.quests = migratedQuests;
  }

  // Migrate Forum Threads
  if (Array.isArray(rawSaved.forumThreads) && rawSaved.forumThreads.length > 0) {
    out.forumThreads = rawSaved.forumThreads.map((t: any, i: number) => ({
      id: String(t.id || `f_migrated_${i}`),
      stage: fixBmcTypo(t.stage || FORUM_STAGES[0]),
      pillar: fixBmcTypo(t.pillar || 'Contract Trap'),
      title: fixBmcTypo(t.title || 'Untitled Thread'),
      body: fixBmcTypo(t.body || ''),
      done: !!t.done
    }));
  }

  // Migrate Corridor Posters
  if (Array.isArray(rawSaved.corridorPosters)) {
    out.corridorPosters = defaults.corridorPosters.map(dp => {
      const sp = rawSaved.corridorPosters.find((x: any) => x && x.id === dp.id);
      if (!sp) return dp;
      return {
        ...dp,
        headline: fixBmcTypo(sp.headline ?? dp.headline),
        body: fixBmcTypo(sp.body ?? dp.body),
        done: !!sp.done
      };
    });
  }

  // Migrate Corridor Barks
  if (Array.isArray(rawSaved.corridorBarks)) {
    out.corridorBarks = defaults.corridorBarks.map(db => {
      const sb = rawSaved.corridorBarks.find((x: any) => x && x.id === db.id);
      if (!sb) return db;
      return {
        ...db,
        lines: Array.isArray(sb.lines) && sb.lines.length ? sb.lines.map(fixBmcTypo) : db.lines,
        done: !!sb.done
      };
    });
  }

  // Migrate Star Chart
  if (Array.isArray(rawSaved.starChart)) {
    out.starChart = defaults.starChart.map(ds => {
      const ss = rawSaved.starChart.find((x: any) => x && x.id === ds.id);
      if (!ss) return ds;
      return {
        ...ds,
        faction: fixBmcTypo(ss.faction ?? ds.faction),
        tags: fixBmcTypo(ss.tags ?? ds.tags),
        exports: fixBmcTypo(ss.exports ?? ds.exports),
        done: !!ss.done
      };
    });
  }

  // Migrate Endings
  if (Array.isArray(rawSaved.endings)) {
    out.endings = defaults.endings.map(de => {
      const se = rawSaved.endings.find((x: any) => x && x.id === de.id);
      if (!se) return de;
      return {
        ...de,
        text: fixBmcTypo(se.text ?? de.text),
        done: !!se.done
      };
    });
  }

  return out;
}

// ---------- GLOBAL FIND & REPLACE ----------

export interface FindReplaceOptions {
  findText: string;
  replaceText: string;
  caseSensitive: boolean;
  includeLocked: boolean;
}

export interface FindMatchSummary {
  totalMatches: number;
  byTab: Record<string, number>;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countOccurrences(text: string, findText: string, caseSensitive: boolean): number {
  if (!findText || !text) return 0;
  const flags = caseSensitive ? 'g' : 'gi';
  const re = new RegExp(escapeRegExp(findText), flags);
  const m = text.match(re);
  return m ? m.length : 0;
}

function replaceOccurrences(text: string, findText: string, replaceText: string, caseSensitive: boolean): string {
  if (!findText || !text) return text;
  const flags = caseSensitive ? 'g' : 'gi';
  const re = new RegExp(escapeRegExp(findText), flags);
  return text.replace(re, replaceText);
}

export function previewGlobalFindReplace(state: WorkbenchState, opts: FindReplaceOptions): FindMatchSummary {
  const byTab: Record<string, number> = {
    factions: 0,
    core: 0,
    forum: 0,
    paths: 0,
    quests: 0,
    corridor: 0,
    endings: 0
  };
  if (!opts.findText) return { totalMatches: 0, byTab };

  const c = (s: string) => countOccurrences(s, opts.findText, opts.caseSensitive);

  // 1. Factions
  Object.values(state.factionPools).forEach(p => {
    p.greetings.forEach(s => { byTab.factions += c(s); });
    p.greetingsHostile.forEach(s => { byTab.factions += c(s); });
    p.greetingsWarm.forEach(s => { byTab.factions += c(s); });
    Object.values(p.excuses).forEach(arr => arr.forEach(s => { byTab.factions += c(s); }));
    p.detentionReactions.forEach(s => { byTab.factions += c(s); });
    Object.values(p.recentCallbacks).forEach(arr => arr.forEach(s => { byTab.factions += c(s); }));
  });

  // 2. Core
  state.coreItems.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    byTab.core += c(it.title) + c(it.hint);
    it.fields.forEach(f => { byTab.core += c(f.label) + c(f.value); });
  });

  // 3. Forum
  state.forumThreads.forEach(t => {
    byTab.forum += c(t.title) + c(t.body);
  });

  // 4. Paths
  state.mainPaths.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    byTab.paths += c(it.title) + c(it.hint);
    it.fields.forEach(f => { byTab.paths += c(f.label) + c(f.value); });
  });

  // 5. Quests
  state.quests.forEach(q => {
    byTab.quests += c(q.title) + c(q.hint) + c(q.category);
    q.fields.forEach(f => { byTab.quests += c(f.label) + c(f.value); });
  });

  // 6. Corridor
  state.corridorPosters.forEach(p => { byTab.corridor += c(p.headline) + c(p.body) + c(p.hint); });
  state.corridorBarks.forEach(b => { b.lines.forEach(l => { byTab.corridor += c(l); }); });
  state.starChart.forEach(s => { byTab.corridor += c(s.faction) + c(s.tags) + c(s.exports); });
  state.quartersMisc.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    byTab.corridor += c(it.title) + c(it.hint);
    it.fields.forEach(f => { byTab.corridor += c(f.label) + c(f.value); });
  });

  // 7. Endings
  state.endings.forEach(e => {
    byTab.endings += c(e.title) + c(e.trigger) + c(e.text);
  });

  const totalMatches = Object.values(byTab).reduce((a, b) => a + b, 0);
  return { totalMatches, byTab };
}

export function executeGlobalFindReplace(state: WorkbenchState, opts: FindReplaceOptions): { nextState: WorkbenchState; replacedCount: number } {
  const summary = previewGlobalFindReplace(state, opts);
  if (!opts.findText || summary.totalMatches === 0) {
    return { nextState: state, replacedCount: 0 };
  }

  const next: WorkbenchState = JSON.parse(JSON.stringify(state));
  const r = (s: string) => replaceOccurrences(s, opts.findText, opts.replaceText, opts.caseSensitive);

  Object.values(next.factionPools).forEach(p => {
    p.greetings = p.greetings.map(r);
    p.greetingsHostile = p.greetingsHostile.map(r);
    p.greetingsWarm = p.greetingsWarm.map(r);
    Object.keys(p.excuses).forEach(k => { p.excuses[k] = p.excuses[k].map(r); });
    p.detentionReactions = p.detentionReactions.map(r);
    p.recentCallbacks.ClearedViolation = p.recentCallbacks.ClearedViolation.map(r);
    p.recentCallbacks.RepeatedDetentions = p.recentCallbacks.RepeatedDetentions.map(r);
    p.recentCallbacks.TookBribe = p.recentCallbacks.TookBribe.map(r);
  });

  next.coreItems.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    it.title = r(it.title);
    it.hint = r(it.hint);
    it.fields.forEach(f => { f.label = r(f.label); f.value = r(f.value); });
  });

  next.forumThreads.forEach(t => {
    t.title = r(t.title);
    t.body = r(t.body);
  });

  next.mainPaths.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    it.title = r(it.title);
    it.hint = r(it.hint);
    it.fields.forEach(f => { f.label = r(f.label); f.value = r(f.value); });
  });

  next.quests.forEach(q => {
    q.title = r(q.title);
    q.hint = r(q.hint);
    q.category = r(q.category);
    q.group = q.category;
    q.fields.forEach(f => { f.label = r(f.label); f.value = r(f.value); });
  });

  next.corridorPosters.forEach(p => {
    p.headline = r(p.headline);
    p.body = r(p.body);
    p.hint = r(p.hint);
  });
  next.corridorBarks.forEach(b => {
    b.lines = b.lines.map(r);
  });
  next.starChart.forEach(s => {
    s.faction = r(s.faction);
    s.tags = r(s.tags);
    s.exports = r(s.exports);
  });
  next.quartersMisc.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    it.title = r(it.title);
    it.hint = r(it.hint);
    it.fields.forEach(f => { f.label = r(f.label); f.value = r(f.value); });
  });

  next.endings.forEach(e => {
    e.title = r(e.title);
    e.trigger = r(e.trigger);
    e.text = r(e.text);
  });

  return { nextState: next, replacedCount: summary.totalMatches };
}

// ---------- EXPORTERS & IMPORTERS ----------

export function normalizeArrForGame(arr: string[], todoPrefix: string): string[] {
  const cleaned = (arr || []).map(s => (s || '').trim()).filter(s => s.length > 0 && !s.startsWith('[TODO]'));
  if (cleaned.length === 0) return [`[TODO] ${todoPrefix}`];
  return cleaned;
}

export function buildFactionPoolsExport(state: WorkbenchState): Record<string, any> {
  const out: Record<string, any> = {};
  FACTIONS.forEach(f => {
    const p = state.factionPools[f.code];
    const excusesOut: Record<string, string[]> = {};
    EXCUSE_KEYS.forEach(ek => {
      excusesOut[ek.key] = normalizeArrForGame(p.excuses[ek.key] || [], `${f.code} ${ek.key} excuse`);
    });
    out[f.code] = {
      greetings: normalizeArrForGame(p.greetings, `${f.code} greeting`),
      greetingsHostile: normalizeArrForGame(p.greetingsHostile, `${f.code} hostile greeting`),
      greetingsWarm: normalizeArrForGame(p.greetingsWarm, `${f.code} warm greeting`),
      excuses: excusesOut,
      detentionReactions: normalizeArrForGame(p.detentionReactions, `${f.code} detention reaction`),
      recentCallbacks: {
        ClearedViolation: normalizeArrForGame(p.recentCallbacks.ClearedViolation, `${f.code} cleared violation callback`),
        RepeatedDetentions: normalizeArrForGame(p.recentCallbacks.RepeatedDetentions, `${f.code} repeated detentions callback`),
        TookBribe: normalizeArrForGame(p.recentCallbacks.TookBribe, `${f.code} bribe callback`)
      }
    };
  });
  return out;
}

export function applyImportedFactionPools(state: WorkbenchState, data: Record<string, any>): { nextState: WorkbenchState; importedCount: number } {
  const next: WorkbenchState = JSON.parse(JSON.stringify(state));
  let importedCount = 0;

  const cleanIn = (arr: any): string[] => {
    if (!Array.isArray(arr) || !arr.length) return [''];
    const mapped = arr.map(x => (typeof x === 'string' && x.trim().startsWith('[TODO]')) ? '' : (x || ''));
    return mapped.length ? mapped : [''];
  };

  FACTIONS.forEach(f => {
    if (!data || !data[f.code]) return;
    const src = data[f.code];
    const dst = next.factionPools[f.code];
    if (src.greetings) dst.greetings = cleanIn(src.greetings);
    if (src.greetingsHostile) dst.greetingsHostile = cleanIn(src.greetingsHostile);
    if (src.greetingsWarm) dst.greetingsWarm = cleanIn(src.greetingsWarm);
    if (src.detentionReactions) dst.detentionReactions = cleanIn(src.detentionReactions);
    if (src.excuses && typeof src.excuses === 'object') {
      EXCUSE_KEYS.forEach(ek => {
        if (src.excuses[ek.key]) dst.excuses[ek.key] = cleanIn(src.excuses[ek.key]);
      });
    }
    if (src.recentCallbacks && typeof src.recentCallbacks === 'object') {
      (['ClearedViolation', 'RepeatedDetentions', 'TookBribe'] as const).forEach(k => {
        if (src.recentCallbacks[k]) dst.recentCallbacks[k] = cleanIn(src.recentCallbacks[k]);
      });
    }
    importedCount++;
  });

  return { nextState: next, importedCount };
}

export function buildCorridorPostersExport(state: WorkbenchState) {
  return state.corridorPosters.map(p => ({
    id: p.id,
    imageFile: p.filename,
    stage: p.stage,
    headline: hasText(p.headline) ? p.headline.trim() : `[TODO] ${p.id} headline`,
    body: hasText(p.body) ? p.body.trim() : `[TODO] ${p.hint}`
  }));
}

export function buildCorridorBarksExport(state: WorkbenchState) {
  const out: Record<string, string[]> = {};
  state.corridorBarks.forEach(b => {
    out[b.id] = normalizeArrForGame(b.lines, b.label);
  });
  return out;
}

export function buildSectorMapExport(state: WorkbenchState) {
  return {
    systems: state.starChart.map(s => ({
      id: s.id,
      name: s.name,
      controllingFaction: hasText(s.faction) ? s.faction.trim() : `[TODO] ${s.id} faction`,
      tags: hasText(s.tags) ? s.tags.split(',').map(t => t.trim()).filter(Boolean) : [`[TODO] ${s.id} tags`],
      exports: hasText(s.exports) ? s.exports.split(',').map(e => e.trim()).filter(Boolean) : [`[TODO] ${s.id} exports`]
    }))
  };
}

export function buildForumThreadsExport(state: WorkbenchState) {
  return state.forumThreads.map(t => ({
    id: t.id,
    stage: t.stage,
    pillar: t.pillar,
    title: hasText(t.title) ? t.title.trim() : `[TODO] ${t.id} title`,
    body: hasText(t.body) ? t.body.trim() : `[TODO] ${t.id} body`,
    status: getForumThreadStatus(t)
  }));
}

export function buildQuestsExport(state: WorkbenchState) {
  return state.quests
    .filter(q => q.status !== 'CUT')
    .map(q => ({
      id: q.id,
      title: q.title,
      dayLabel: q.day,
      sortDay: q.sortDay,
      category: q.category,
      status: q.status,
      writingStatus: getStructuredItemStatus(q),
      hint: q.hint,
      beats: q.fields.map(f => ({
        key: f.key,
        label: f.label,
        text: hasText(f.value) ? f.value.trim() : `[TODO] ${f.label}`
      }))
    }));
}

export function buildTutorialsExport(state: WorkbenchState) {
  const tutItem = state.quartersMisc.find(m => m.id === 'misc_tutorials');
  const quartersField = tutItem?.fields.find(f => f.key === 'quarters')?.value || '';
  const deskField = tutItem?.fields.find(f => f.key === 'desk')?.value || '';
  return {
    quarters: hasText(quartersField) ? quartersField.trim() : '[TODO] Quarters diegetic tutorial nudges',
    desk: hasText(deskField) ? deskField.trim() : '[TODO] Desk hardware diegetic tutorial nudges'
  };
}

export function buildEndingsExport(state: WorkbenchState) {
  return state.endings.map(e => ({
    id: e.id,
    title: e.title,
    day: e.day,
    category: e.category,
    trigger: e.trigger,
    text: hasText(e.text) ? e.text.trim() : `[TODO] ${e.title} epilogue`,
    status: getEndingStatus(e)
  }));
}

export function buildObsidianMarkdownExport(state: WorkbenchState): string {
  const stats = calcAllStats(state);
  const pct = stats.allTot ? Math.round((stats.allDone / stats.allTot) * 100) : 0;
  const lines: string[] = [];
  lines.push(`# Subspace Protocols — Authored Writing Export`);
  lines.push(`*Exported: ${new Date().toISOString()} | Done: ${stats.allDone}/${stats.allTot} (${pct}%) | Drafts: ${stats.allDraft} | Todo: ${stats.allTodo} | Words: ${stats.words} | Corp: ${state.meta.corpName}*`);
  lines.push('');

  lines.push('## 1. Faction Dialogue Pools');
  FACTIONS.forEach(f => {
    const p = state.factionPools[f.code];
    lines.push(`### ${f.code} — ${f.name}`);
    lines.push(`- **Greetings (Neutral):** ${p.greetings.filter(hasText).join(' | ') || '[TODO]'}`);
    lines.push(`- **Greetings (Hostile, rep <= -5):** ${p.greetingsHostile.filter(hasText).join(' | ') || '[TODO]'}`);
    lines.push(`- **Greetings (Warm, rep >= +6):** ${p.greetingsWarm.filter(hasText).join(' | ') || '[TODO]'}`);
    EXCUSE_KEYS.forEach(ek => {
      const vals = (p.excuses[ek.key] || []).filter(hasText);
      lines.push(`- **Excuse (${ek.key} - ${ek.day}):** ${vals.join(' | ') || '[TODO]'}`);
    });
    lines.push(`- **Detention Reactions:** ${p.detentionReactions.filter(hasText).join(' | ') || '[TODO]'}`);
    lines.push(`- **Callback (ClearedViolation):** ${p.recentCallbacks.ClearedViolation.filter(hasText).join(' | ') || '[TODO]'}`);
    lines.push(`- **Callback (RepeatedDetentions):** ${p.recentCallbacks.RepeatedDetentions.filter(hasText).join(' | ') || '[TODO]'}`);
    lines.push(`- **Callback (TookBribe):** ${p.recentCallbacks.TookBribe.filter(hasText).join(' | ') || '[TODO]'}`);
    lines.push('');
  });

  lines.push('## 2. Hails, Directives & Desk Systems (28-Day Campaign)');
  state.coreItems.forEach(it => {
    lines.push(`### ${it.title} (${it.day}) [${getStructuredItemStatus(it)}]`);
    it.fields.forEach(f => {
      lines.push(`**${f.label}:**`);
      lines.push(hasText(f.value) ? f.value.trim() : '[TODO]');
      lines.push('');
    });
  });

  lines.push('## 3. Quarters FORUM Anchor Posts');
  state.forumThreads.forEach(t => {
    lines.push(`### [${t.stage}] ${t.title} (${t.pillar}) [${getForumThreadStatus(t)}]`);
    lines.push(hasText(t.body) ? t.body.trim() : '[TODO]');
    lines.push('');
  });

  lines.push('## 4. Main Story Arcs (Paths A–E & Day 26 Choice C)');
  state.mainPaths.forEach(it => {
    lines.push(`### ${it.title} (${it.day}) [${getStructuredItemStatus(it)}]`);
    it.fields.forEach(f => {
      lines.push(`**${f.label}:** ${hasText(f.value) ? f.value.trim() : '[TODO]'}`);
    });
    lines.push('');
  });

  lines.push('## 5. Recurring Faces & Side Quests');
  state.quests.forEach(it => {
    lines.push(`### ${it.title} (${it.day}, Start Day ${it.sortDay}) [${it.category} | ${it.status} | ${getStructuredItemStatus(it)}]`);
    if (it.hint) lines.push(`*Hint: ${it.hint}*`);
    it.fields.forEach(f => {
      lines.push(`**${f.label}:** ${hasText(f.value) ? f.value.trim() : '[TODO]'}`);
    });
    lines.push('');
  });

  lines.push('## 6. Morning Corridor Posters, Barks, Star Chart & Quarters Misc');
  lines.push('### Corridor Posters');
  state.corridorPosters.forEach(p => {
    lines.push(`- **${p.filename}** (${p.stage}) [${getPosterStatus(p)}]: ${hasText(p.headline) ? p.headline : '[TODO]'} — ${hasText(p.body) ? p.body : '[TODO]'}`);
  });
  lines.push('');
  lines.push('### Corridor Overhead Barks');
  state.corridorBarks.forEach(b => {
    lines.push(`- **${b.label}** [${getBarkStatus(b)}]: ${b.lines.filter(hasText).join(' | ') || '[TODO]'}`);
  });
  lines.push('');
  lines.push('### Star Chart Systems (sector_map.json)');
  state.starChart.forEach(s => {
    lines.push(`- **${s.name}** [${getStarChartStatus(s)}]: Faction=${s.faction || '[TODO]'} | Tags=${s.tags || '[TODO]'} | Exports=${s.exports || '[TODO]'}`);
  });
  lines.push('');
  lines.push('### Quarters Dispatches, Audits & Diegetic Tutorials');
  state.quartersMisc.forEach(it => {
    lines.push(`#### ${it.title} (${it.day}) [${getStructuredItemStatus(it)}]`);
    it.fields.forEach(f => {
      lines.push(`**${f.label}:** ${hasText(f.value) ? f.value.trim() : '[TODO]'}`);
    });
    lines.push('');
  });

  lines.push('## 7. Endings (5 Main + 2 Failure)');
  state.endings.forEach(e => {
    lines.push(`### ${e.title} (${e.day}) [${getEndingStatus(e)}]`);
    lines.push(`*Trigger: ${e.trigger}*`);
    lines.push(hasText(e.text) ? e.text.trim() : '[TODO]');
    lines.push('');
  });

  return lines.join('\n');
}

// ---------- "PICK ONE FOR ME" SPRINT CANDIDATES ----------

export interface SprintTarget {
  tab: WorkbenchState['meta']['activeTab'];
  factionCode?: string;
  cardId: string;
  title: string;
  status: 'TODO' | 'DRAFT';
}

export function collectUnfinishedTargets(state: WorkbenchState): SprintTarget[] {
  const targets: SprintTarget[] = [];

  // 1. Factions
  FACTIONS.forEach(f => {
    const p = state.factionPools[f.code];
    const flags = p.doneFlags || {};
    const check = (arr: string[], key: string, label: string) => {
      const st = getFactionCardStatus(arr, flags[key]);
      if (st === 'TODO' || st === 'DRAFT') {
        targets.push({
          tab: 'factions',
          factionCode: f.code,
          cardId: `fp_${f.code}_${key}`,
          title: `${f.code} — ${label}`,
          status: st
        });
      }
    };
    check(p.greetings, 'greetings', 'Neutral Arrival Greetings');
    check(p.greetingsHostile, 'greetingsHostile', 'Hostile Greetings');
    check(p.greetingsWarm, 'greetingsWarm', 'Warm Greetings');
    EXCUSE_KEYS.forEach(ek => {
      check(p.excuses[ek.key] || [], `excuses.${ek.key}`, ek.label);
    });
    check(p.detentionReactions, 'detentionReactions', 'Detention Reactions');
    check(p.recentCallbacks.ClearedViolation, 'recentCallbacks.ClearedViolation', 'Callback: Cleared Violation');
    check(p.recentCallbacks.RepeatedDetentions, 'recentCallbacks.RepeatedDetentions', 'Callback: Repeated Detentions');
    check(p.recentCallbacks.TookBribe, 'recentCallbacks.TookBribe', 'Callback: Took Bribe');
  });

  // 2. Core
  state.coreItems.forEach(it => {
    const st = getStructuredItemStatus(it);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'core', cardId: `coreItems_${it.id}`, title: it.title, status: st });
    }
  });

  // 3. Forum
  state.forumThreads.forEach(t => {
    const st = getForumThreadStatus(t);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'forum', cardId: `forum_${t.id}`, title: t.title, status: st });
    }
  });

  // 4. Paths
  state.mainPaths.forEach(it => {
    const st = getStructuredItemStatus(it);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'paths', cardId: `mainPaths_${it.id}`, title: it.title, status: st });
    }
  });

  // 5. Quests
  state.quests.forEach(q => {
    const st = getStructuredItemStatus(q);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'quests', cardId: `quests_${q.id}`, title: q.title, status: st });
    }
  });

  // 6. Corridor
  state.corridorPosters.forEach(p => {
    const st = getPosterStatus(p);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'corridor', cardId: `poster_${p.id}`, title: p.filename, status: st });
    }
  });
  state.corridorBarks.forEach(b => {
    const st = getBarkStatus(b);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'corridor', cardId: `bark_${b.id}`, title: b.label, status: st });
    }
  });
  state.starChart.forEach(s => {
    const st = getStarChartStatus(s);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'corridor', cardId: `sc_${s.id}`, title: s.name, status: st });
    }
  });
  state.quartersMisc.forEach(it => {
    const st = getStructuredItemStatus(it);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'corridor', cardId: `quartersMisc_${it.id}`, title: it.title, status: st });
    }
  });

  // 7. Endings
  state.endings.forEach(e => {
    const st = getEndingStatus(e);
    if (st === 'TODO' || st === 'DRAFT') {
      targets.push({ tab: 'endings', cardId: `ending_${e.id}`, title: e.title, status: st });
    }
  });

  return targets;
}
