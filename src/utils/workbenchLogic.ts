/**
 * Pure data models, lore canon, migration, status classification, search/replace,
 * and 1-to-1 JSON/Markdown exporters for Subspace Protocols Writing Workbench.
 * Synced strictly to writing_code_audit.md (Sections 1–5).
 */

import {
  SourceBadgeInfo,
  InGameContextFlow,
  RAYLIB_LIMITS,
  AUTHORED_FACTION_POOLS_VERBATIM,
  EXCUSE_KEYS_AUDIT,
  LIVE_FORUM_THREADS_AUDIT,
  COVERT_MISSIONS_AUDIT,
  CovertMissionAuditSpec
} from './auditReferenceData';

export const STORAGE_KEY_V1 = 'subspace_protocols_writing_workbench_v1';
export const STORAGE_KEY_V2 = 'subspace_protocols_writing_workbench_v2';

export type WritingStatus = 'LOCKED' | 'DONE' | 'DRAFT' | 'TODO' | 'CUT';

export interface FactionMeta {
  code: string;
  name: string;
  vibe: string;
}

export const FACTIONS: FactionMeta[] = [
  { code: 'FTV-', name: 'Independent Free Traders', vibe: 'Scrappy, tired, informal, burning fuel on thin margins; practical and sarcastic. (19/31 slots authored in faction_pools.json).' },
  { code: 'MNG-', name: 'Mining Guild', vibe: 'Blue-collar ore haulers; exhausted, soot-stained, blunt about tonnage and quotas. (19/31 slots authored in faction_pools.json).' },
  { code: 'KDF-', name: 'Kordani Defense Force', vibe: 'Scarred military police who won the Concord War at massive cost, now locked into the Bulwark Pact with the BMC to police the gate. Clipped, authoritarian, bitter about demotions. Recurring contact: Commander Vorst.' },
  { code: 'BMC-', name: 'Brengop Mercantile Consortium', vibe: 'Sleek, predatory interstellar bankers who bought VG-3 cheap and hold stranded humans under debt contracts. Oily faux-friendly politeness, obsessed with margins and docking turnaround. Recurring contact: Regeer Nixa.' },
  { code: 'FTC-', name: 'Far-Line Transit Corp', vibe: 'Former station owners who sold VG-3 and left human crew behind as inventory; weary, nostalgic, bitter.' },
  { code: 'ORN-', name: 'Oruun Rim Traders', vibe: 'Superstitious, overly polite bureaucratic speech, nervous about Ashen Rift folklore.' },
  { code: 'ZNI-', name: 'Zenith Luxury / Core Liners', vibe: 'Entitled, polished, condescending toward rim stations and Deck 4 labour.' },
  { code: 'PRJ-', name: 'Prunjun Merchants', vibe: 'Fast-talking, cagey, transactional; always trying to rush paperwork.' },
  { code: 'TLV-', name: 'Tolvak Transit Line', vibe: 'Rigid schedule-keepers; brusque, punctual, irritated by inspection bottlenecks.' },
  { code: 'KRW-', name: 'Krushvak Haulers', vibe: 'Gruff, heavy-world pragmatism, blunt and loud; little tolerance for red tape.' },
  { code: 'HBR-', name: 'Hun-Borian Vessels', vibe: 'Measured, proud, cautious around Pact military oversight.' },
  { code: 'GUV-', name: 'Galactic Union Vessels', vibe: 'Core worlds / humanity analogue; high-minded, formal, diplomatic, detached from rim hardship.' },
  { code: 'DEFAULT', name: 'Generic Fallback Pool', vibe: 'Neutral station-traffic fallback in data/dialogue/faction_pools.json used whenever a specific faction bucket returns [TODO].' }
];

export interface ExcuseKeyMeta {
  key: string;
  legacyAliases?: string[];
  label: string;
  day: string;
  sortDay: number;
  system: string;
  inFactionPoolsJson: boolean;
  sourceBadge: SourceBadgeInfo;
}

export const EXCUSE_KEYS: ExcuseKeyMeta[] = EXCUSE_KEYS_AUDIT.map(e => ({
  key: e.key,
  legacyAliases: e.legacyAliases,
  label: e.label,
  day: e.day,
  sortDay: e.sortDay,
  system: e.system,
  inFactionPoolsJson: e.inFactionPoolsJson,
  sourceBadge: e.sourceBadge
}));

export const LIVE_JSON_EXCUSE_KEYS = EXCUSE_KEYS.filter(e => e.inFactionPoolsJson);

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
  raylibPreset?: keyof typeof RAYLIB_LIMITS;
  currentlyInGame?: string;
  currentSource?: string;
  sourceBadge?: SourceBadgeInfo;
  inGameContext?: InGameContextFlow;
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
  inGameContext?: InGameContextFlow;
  sourceBadge?: SourceBadgeInfo;
  currentlyInGame?: string;
  currentSource?: string;
  raylibPreset?: keyof typeof RAYLIB_LIMITS;
  fields: StructuredField[];
}

export interface ForumThread {
  id: string;
  stage: string;
  pillar: string;
  title: string;
  body: string;
  done: boolean;
  boardTag?: string;
  minDay?: number;
  maxDay?: number;
  requiredFlags?: string[];
  powerScoreCondition?: { prefix: string; state: string } | null;
  isLiveJsonThread?: boolean;
  currentlyInGame?: string;
  currentSource?: string;
  sourceBadge?: SourceBadgeInfo;
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
  inGameContext?: InGameContextFlow;
  sourceBadge?: SourceBadgeInfo;
  currentlyInGame?: string;
  currentSource?: string;
  raylibPreset?: keyof typeof RAYLIB_LIMITS;
  covertMissionId?: string;
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
  currentlyInGame?: string;
  currentSource?: string;
  sourceBadge?: SourceBadgeInfo;
}

export interface CorridorBark {
  id: string;
  label: string;
  stage: string;
  lines: string[];
  done: boolean;
  currentlyInGame?: string;
  currentSource?: string;
  sourceBadge?: SourceBadgeInfo;
}

export interface StarChartSystem {
  id: string;
  name: string;
  faction: string;
  tags: string;
  exports: string;
  done: boolean;
  currentlyInGame?: string;
  currentSource?: string;
  sourceBadge?: SourceBadgeInfo;
}

export interface EndingItem {
  id: string;
  title: string;
  day: string;
  category: string;
  trigger: string;
  text: string;
  done: boolean;
  currentlyInGame?: string;
  currentSource?: string;
  sourceBadge?: SourceBadgeInfo;
  raylibPreset?: keyof typeof RAYLIB_LIMITS;
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
  '@dock_hand_maren [DECK 3 BAY CREW]: ',
  '@ftc_wrench_88 [EX-FTC TECH]: ',
  '@berth_11_joss [NIGHT LOADER]: ',
  '@med_tech_tala [INFIRMARY]: ',
  '@vent_rat_09 [UNVERIFIED]: ',
  '@nav_watch_soren [PERIMETER RELAY]: ',
  '@hauler_kess [FREE TRADER]: '
];

export const FORUM_VARIABLES = [
  '{MOST_DETAINED_FACTION}',
  '{SEIZED_CONTRABAND}',
  '{DOMINANT_FACTION}',
  '{BOOTH_STRICTNESS}'
];

export const FACTION_POOL_TOKENS = [
  '{shipName}',
  '{reg}',
  '{origin}',
  '{destination}'
];

export const FORUM_STAGES = [
  'Live in data/forum.json (14 Active Threads)',
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

export function createEmptyFactionPool(code?: string): FactionPool {
  const excuses: Record<string, string[]> = {};
  EXCUSE_KEYS.forEach(e => {
    excuses[e.key] = ['', ''];
  });

  const pool: FactionPool = {
    greetings: ['', '', ''],
    greetingsHostile: [''],
    greetingsWarm: [''],
    excuses,
    detentionReactions: ['', ''],
    recentCallbacks: {
      ClearedViolation: ['', ''],
      RepeatedDetentions: ['', ''],
      TookBribe: ['', '']
    },
    doneFlags: {}
  };

  // Pre-populate ONLY verbatim [AUTHORED] slots from Section 3.2 (FTV- and MNG-)
  if (code === 'FTV-' || code === 'MNG-') {
    const auth = AUTHORED_FACTION_POOLS_VERBATIM[code];
    pool.greetings = [...auth.greetings];
    Object.entries(auth.excuses).forEach(([k, lines]) => {
      pool.excuses[k] = [...lines];
    });
    pool.detentionReactions = [...auth.detentionReactions];
    pool.recentCallbacks.ClearedViolation = [...auth.recentCallbacks.ClearedViolation];
    pool.recentCallbacks.RepeatedDetentions = [...auth.recentCallbacks.RepeatedDetentions];
    pool.recentCallbacks.TookBribe = [...auth.recentCallbacks.TookBribe];
    pool.doneFlags = {
      greetings: true,
      'excuses.TransponderMismatch': true,
      'excuses.FalsifiedOriginWaveform': true,
      'excuses.General': true,
      detentionReactions: true,
      'recentCallbacks.ClearedViolation': true,
      'recentCallbacks.RepeatedDetentions': true,
      'recentCallbacks.TookBribe': true
    };
  }

  return pool;
}

export function buildDefaultState(): WorkbenchState {
  const factionPools: Record<string, FactionPool> = {};
  FACTIONS.forEach(f => {
    factionPools[f.code] = createEmptyFactionPool(f.code);
  });

  // Build the 14 live forum.json thread cards (leaving editable body empty since all 14 are [PLACEHOLDER / TODO] in Section 3.3, while showing verbatim posts in CURRENTLY IN GAME)
  const liveForumThreads: ForumThread[] = LIVE_FORUM_THREADS_AUDIT.map(lt => {
    const verbatimPosts = lt.posts
      .map(p => `@${p.handle} [${p.roleTag}] (${p.timestamp}):\n"${p.body}"`)
      .join('\n\n');
    return {
      id: lt.id,
      stage: 'Live in data/forum.json (14 Active Threads)',
      pillar: lt.pillar,
      title: lt.title,
      body: '',
      done: false,
      boardTag: lt.boardTag,
      minDay: lt.minDay,
      maxDay: lt.maxDay,
      requiredFlags: lt.requiredFlags,
      powerScoreCondition: lt.powerScoreCondition,
      isLiveJsonThread: true,
      currentlyInGame: verbatimPosts,
      currentSource: `data/forum.json · thread "${lt.id}" ([${lt.boardTag}], Days ${lt.minDay}–${lt.maxDay}${
        lt.requiredFlags.length ? `, flags: ${lt.requiredFlags.join(', ')}` : ''
      }${lt.powerScoreCondition ? `, power: ${lt.powerScoreCondition.prefix}:${lt.powerScoreCondition.state}` : ''})`,
      sourceBadge: {
        kind: 'LIVE_JSON',
        label: 'LIVE JSON [TODO PASS]',
        location: `data/forum.json · ${lt.id}`
      }
    };
  });

  const designForumThreads: ForumThread[] = [
    { id: 'f_s1_1', stage: 'Stage 1 (Days 1–6: Mundane Friction)', pillar: 'Contract Trap', title: 'New guy in Booth 04 — betting pool on how long he lasts', body: '', done: false, boardTag: 'GENERAL', minDay: 1, maxDay: 6, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s1_2', stage: 'Stage 1 (Days 1–6: Mundane Friction)', pillar: 'Red-Wash', title: 'Brown Dwarf glare / Red-Wash headache complaint on Deck 4', body: '', done: false, boardTag: 'DECK4', minDay: 1, maxDay: 6, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s1_3', stage: 'Stage 1 (Days 1–6: Mundane Friction)', pillar: 'Contract Trap', title: "Stranded Mechanic's Sister (Buildup Post 1 — Day 5)", body: '', done: false, boardTag: 'GENERAL', minDay: 5, maxDay: 13, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s1_4', stage: 'Stage 1 (Days 1–6: Mundane Friction)', pillar: 'Ashen Rift Superstition', title: 'Ships coming back with drifted clocks near the Ashen Rift', body: '', done: false, boardTag: 'SECTOR', minDay: 3, maxDay: 10, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s2_1', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Contract Trap', title: 'Kordani vs. Brengop berth-fee & security friction escalating (Day 7 opener)', body: '', done: false, boardTag: 'GENERAL', minDay: 7, maxDay: 18, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s2_2', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Ceramic Wafers', title: 'Core vs. Rim rant about Brengop cheap air-gapped ceramic wafers (Day 12+)', body: '', done: false, boardTag: 'OPS', minDay: 12, maxDay: 24, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s2_3', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Contract Trap', title: "Stranded Mechanic's Sister — Fallout (Bitter post if detained)", body: '', done: false, boardTag: 'GENERAL', minDay: 14, maxDay: 20, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s2_4', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Red-Wash', title: 'Reactive Template: Stoker Overload / Next-Day Brownout chatter', body: '', done: false, boardTag: 'OPS', minDay: 15, maxDay: 28, requiredFlags: ['stoker_overload'], sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s2_5', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Contract Trap', title: 'The Ore Skim — Fallout thread (Day 17)', body: '', done: false, boardTag: 'DECK4', minDay: 17, maxDay: 24, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s2_6', stage: 'Stage 2 (Days 7–18: Open Turf War)', pillar: 'Reactive Fallout', title: 'Reactive Template: {MOST_DETAINED_FACTION} & {SEIZED_CONTRABAND} dock gossip', body: '', done: false, boardTag: 'RUMORS', minDay: 8, maxDay: 28, sourceBadge: { kind: 'NOT_WIRED', label: 'TOKENS NOT WIRED IN C#', location: 'TerminalOverlay.cs:1290-1314' } },
    { id: 'f_s3_1', stage: 'Stage 3 (Days 19–25: Climax Foreshadowing)', pillar: 'Ashen Rift Superstition', title: 'Lower-deck quarantine & cough rumours (Day 19–20)', body: '', done: false, boardTag: 'RUMORS', minDay: 19, maxDay: 25, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s3_2', stage: 'Stage 3 (Days 19–25: Climax Foreshadowing)', pillar: 'Reactive Fallout', title: 'Overnight Kordani Berth Audit sightings on Deck 4', body: '', done: false, boardTag: 'RUMORS', minDay: 4, maxDay: 28, requiredFlags: ['berth_search'], sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s3_3', stage: 'Stage 3 (Days 19–25: Climax Foreshadowing)', pillar: 'Contract Trap', title: 'KDF warships holding at outer buoys & Brengop locking reserve vaults (Day 23–25)', body: '', done: false, boardTag: 'SECTOR', minDay: 23, maxDay: 26, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s4_1', stage: 'Stage 4 (Days 27–28: Post-Climax Fallout)', pillar: 'Reactive Fallout', title: 'Day 27 Fallout — If Kordani Cruiser Cleared (Brownout Cascade)', body: '', done: false, boardTag: 'SECTOR', minDay: 27, maxDay: 28, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s4_2', stage: 'Stage 4 (Days 27–28: Post-Climax Fallout)', pillar: 'Reactive Fallout', title: 'Day 27 Fallout — If Kordani Cruiser Detained (Lockdown Tension)', body: '', done: false, boardTag: 'SECTOR', minDay: 27, maxDay: 28, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } },
    { id: 'f_s4_3', stage: 'Stage 4 (Days 27–28: Post-Climax Fallout)', pillar: 'Reactive Fallout', title: 'Day 27 Fallout — If Choice C Calibration Spoofed Quietly', body: '', done: false, boardTag: 'DECK4', minDay: 27, maxDay: 28, sourceBadge: { kind: 'LIVE_JSON', label: 'FORUM THREAD DRAFT', location: 'data/forum.json (new thread)' } }
  ];

  // Build 5 Live Covert Mission cards from data/covert_missions.json (all [PLACEHOLDER / TODO] in Section 3.4 -> fields start empty, verbatim shown in CURRENTLY IN GAME)
  const liveCovertMissionQuests: QuestItem[] = COVERT_MISSIONS_AUDIT.map(cm => ({
    id: `cm_${cm.missionId}`,
    covertMissionId: cm.missionId,
    group: 'Live Covert Missions (data/covert_missions.json)',
    category: 'Live Covert Missions (data/covert_missions.json)',
    title: `${cm.missionId} — ${cm.missionType} (${cm.targetPrefix}${cm.targetRegistration ? ' ' + cm.targetRegistration : ''}, +${cm.rewardScrip} SC)`,
    day: `Day ${cm.minAvailableDay}`,
    sortDay: cm.minAvailableDay,
    status: 'KEEP',
    done: false,
    hint: `Loaded directly by CovertMissionDatabase.Load() (data/ForumModels.cs:68-177). Exporting data/covert_missions.json automatically sanitizes [PLACEHOLDER ...] and assigningFaction [TODO] leaks.`,
    sourceBadge: {
      kind: 'LIVE_JSON',
      label: 'LIVE JSON [LEAK FIX]',
      location: `data/covert_missions.json · ${cm.missionId}`,
      note:
        cm.title.includes('[PLACEHOLDER') || cm.assigningFaction.includes('[TODO')
          ? 'LIVE LEAK IN GAME: StripAuthoringTodoTags misses [PLACEHOLDER ...] and assigningFaction [TODO] in email headers & logs!'
          : undefined
    },
    inGameContext:
      cm.missionType === 'Delivery'
        ? {
            before: `Day ${cm.triggerEmailDay} ${cm.triggerEmailPhase} encrypted dispatch arrives in MESSAGES -> Player runs [CRYPTOGRAPHY] -> [DECRYPT MESSAGE (0 SC)] -> Sealed slate drops in 0500 Chute next morning.`,
            thisLine: `Player slots ${cm.slatePayloadLabel} into Booth 04 Slate Bus while ${cm.targetRegistration} (${cm.targetShipName}) is docked (1.35s upload).`,
            after: `Captain reacts ("Wait -- what is this encrypted burst..." -> "...Understood, Booth 04.") -> +${cm.rewardScrip} SC settlement email ("DROP CONFIRMED // ${cm.targetRegistration}").`
          }
        : {
            before: `Available Day ${cm.minAvailableDay}+ in DECK 4 / CRYPTOGRAPHY. Player acquires Blank Data Slate and slots into Booth 04 Slate Bus before protocols hit on any ${cm.targetPrefix} vessel.`,
            thisLine: `Silent packet copy completes ([UNAUTH_IO] logged) -> Player re-transmits onto Primary Slate -> Transmits captured slate in CRYPTOGRAPHY tab at night.`,
            after: `+${cm.rewardScrip} SC credited + "CONTRACT SETTLED" email. Player must run [SCRUB LOGS] before sleep.`
          },
    fields: [
      {
        key: 'title',
        label: 'Mission Title (title — displayed in DECK 4, CRYPTO / LOGS & settlement email)',
        value: '',
        softLimit: 68,
        raylibPreset: 'forum_title',
        currentlyInGame: `"${cm.title}"`,
        currentSource: `data/covert_missions.json · ${cm.missionId}.title`
      },
      {
        key: 'assigningFaction',
        label: 'Assigning Faction / Sender (assigningFaction — WARNING: do not include [TODO] or it leaks into email Sender & logs)',
        value: '',
        softLimit: 37,
        raylibPreset: 'email_subject',
        currentlyInGame: `"${cm.assigningFaction}"`,
        currentSource: `data/covert_missions.json · ${cm.missionId}.assigningFaction`
      },
      {
        key: 'payloadDescription',
        label: 'Contract / Payload Description (payloadDescription — shown on DECK 4 & CRYPTO contract card)',
        value: '',
        softLimit: 320,
        raylibPreset: 'email_body',
        currentlyInGame: `"${cm.payloadDescription}"`,
        currentSource: `data/covert_missions.json · ${cm.missionId}.payloadDescription`
      },
      ...(cm.missionType === 'Delivery'
        ? [
            {
              key: 'encryptedSubject',
              label: 'Encrypted Dispatch Email Subject (encryptedSubject)',
              value: '',
              softLimit: 31,
              raylibPreset: 'email_subject' as const,
              currentlyInGame: `"${cm.encryptedSubject}"`,
              currentSource: `data/covert_missions.json · ${cm.missionId}.encryptedSubject`
            },
            {
              key: 'decryptedBody',
              label: 'Decrypted Dispatch Email Body (decryptedBody — revealed after clicking [DECRYPT MESSAGE (0 SC)])',
              value: '',
              softLimit: 800,
              raylibPreset: 'email_body' as const,
              currentlyInGame: `"${cm.decryptedBody}"`,
              currentSource: `data/covert_missions.json · ${cm.missionId}.decryptedBody`
            }
          ]
        : [])
    ]
  }));

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
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'UI/IntroScreen.cs:13-20'
        },
        raylibPreset: 'victory_ending_card',
        hint: 'Locked intro sequence establishing Void Gate 3, the Bulwark Pact, stranded FTC human labour, and Booth 04.',
        inGameContext: {
          before: 'Player clicks START NEW SAVE (DAY 01) on MainMenuScreen.cs.',
          thisLine: '5 sequential archive feed cards (920x528 card, 808px text plaque wrap width, fontSize 18, max ~5 lines).',
          after: 'Player presses [SPACE / CLICK TO ENTER QUARTERS] -> enters Day 01 Morning Quarters.'
        },
        fields: [
          { key: 'card1', label: 'Card 1 — The Void & The Station (UI/IntroScreen.cs:15)', value: 'Three years after the Concord War, Void Gate 3 remains the sole operational corridor through the rifts.', currentlyInGame: '"Three years after the Concord War, Void Gate 3 remains the sole operational corridor through the rifts."', currentSource: 'UI/IntroScreen.cs:15', raylibPreset: 'victory_ending_card' },
          { key: 'card2', label: 'Card 2 — The Bosses (UI/IntroScreen.cs:16)', value: 'Under the terms of the Bulwark Pact, joint control is split between Brengop logistics and Kordani military command.', currentlyInGame: '"Under the terms of the Bulwark Pact, joint control is split between Brengop logistics and Kordani military command."', currentSource: 'UI/IntroScreen.cs:16', raylibPreset: 'victory_ending_card' },
          { key: 'card3', label: 'Card 3 — Stranded Human Labour (UI/IntroScreen.cs:17)', value: 'When the Far-Line Transit Corp sold the station, the stranded crew were transferred as part of the inventory under updated contracts.', currentlyInGame: '"When the Far-Line Transit Corp sold the station, the stranded crew were transferred as part of the inventory under updated contracts."', currentSource: 'UI/IntroScreen.cs:17', raylibPreset: 'victory_ending_card' },
          { key: 'card4', label: 'Card 4 — The Reassignment (UI/IntroScreen.cs:18)', value: 'Due to a sudden vacancy at Booth 04, a replacement has been promoted to customs gate operations. Authority level: Provisional.', currentlyInGame: '"Due to a sudden vacancy at Booth 04, a replacement has been promoted to customs gate operations. Authority level: Provisional."', currentSource: 'UI/IntroScreen.cs:18', raylibPreset: 'victory_ending_card' },
          { key: 'card5', label: 'Card 5 — Title Beat (UI/IntroScreen.cs:19)', value: 'Congratulations', currentlyInGame: '"Congratulations"', currentSource: 'UI/IntroScreen.cs:19', raylibPreset: 'victory_ending_card' }
        ]
      },
      {
        id: 'day1_locked_pair',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Day 1 Brengop Email (Contract #884-D), Commander Vorst Live Hail & Morning Directive',
        day: 'Day 1',
        sortDay: 1,
        category: 'Live Hail & Terminal Email',
        locked: true,
        done: true,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'Core/QuartersModels.cs:115-162 · Day2And3ScriptedDialogue.cs:16-26, 175-188'
        },
        hint: 'Locked verbatim in C#. Includes Contract #884-D email in Quarters Terminal, Commander Vorst 8-line pre-shift Live Hail, and Day 01 Shift Directive.',
        inGameContext: {
          before: 'Day 01 Morning Quarters: Player reads Contract #884-D on Personal Terminal -> clicks Left-Wall Door -> transits 2.6s Corridor -> enters Booth 04.',
          thisLine: '[INTERNAL HAIL] COMMANDER VORST // KORDANI SECURITY COMMAND (8 lines at 32 chars/sec) -> [SYS] INTERNAL HAIL CLOSED -> Day 01 Shift Directive.',
          after: 'Player clicks [NEXT HAIL] to summon Ship 1 of Day 01 Watch.'
        },
        fields: [
          {
            key: 'summary',
            label: 'Day 1 Contract #884-D Email (Core/QuartersModels.cs:115-162)',
            raylibPreset: 'email_body',
            currentlyInGame: 'Sender: "Brengop Mercantile Consortium // VG3 Debt & Asset Management"\nSubject: "Congratulations on Your Upward Mobility [CONTRACT #884-D]"\nNote: 80-dash divider at QuartersModels.cs:138 overflows ~72px at +3 font offset.',
            currentSource: 'Core/QuartersModels.cs:115-162',
            value: `Dear Contractor #884-D,\n\nCongratulations. Effective 06:00 station time, the Consortium is pleased to elevate you from Deck 4 Scrap & Maintenance to Provisional Port Inspector at Subspace Gate Booth 04.\n\nYour predecessor vacated his post unexpectedly mid-shift, leaving the lane idle for forty-two minutes—a regrettable interruption to tariff collection that the BMC cannot afford to repeat. We trust you will display greater fiscal discipline.\n\nTo reflect your newly elevated earning potential, your existing quarters have been upgraded to our Tier-3 Solo billing rate. Your revised daily terms follow:\n\nDAILY LEDGER (EFFECTIVE DAY 1):\n--------------------------------------------------------------------------------\n- Clearing Commission (Compliant Vessel):   +10 SC / ship\n- Mandatory Berth Lease (Tier-3 Solo):      -30 SC / night (Auto-debited)\n- Transit Debt Buyout (Off-Station Visa): 1,000 SC (Lump sum)\n--------------------------------------------------------------------------------\n\nFIDUCIARY OBLIGATIONS:\nYou are expected to clear a minimum of 6 vessels per shift. Unregistered hulls represent uncollected tariffs; hesitation costs the Consortium throughput.\n\nBooth 04 instrumentation represents considerable BMC capital. Hardware damage, shift delays, or excessive wear on the mechanical toggles will be assessed and billed to your personal ledger at close of shift.\n\nShould Kordani Security fine, detain, or liquidate you for procedural breaches, the Consortium assumes no liability. Please note that berth rent continues to accrue during periods of detainment.\n\nNOTICE OF EXECUTION:\nAs a courtesy—and to spare your ledger our standard 2 SC notarization fee—perusal of this notice constitutes constructive assent, carrying the full legal force and effect of a wet-ink signature.\n\nWe value your continued solvency.\n— Brengop Mercantile Consortium`
          },
          {
            key: 'vorst_hail',
            label: 'Day 1 Commander Vorst Live Hail (data/Day2And3ScriptedDialogue.cs:16-26)',
            raylibPreset: 'talking_head_hail',
            currentlyInGame: '[INTERNAL HAIL] COMMANDER VORST // KORDANI SECURITY COMMAND -> 8 lines -> [SYS] INTERNAL HAIL CLOSED -- BOOTH 04 CONSOLE ONLINE.',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:16-26',
            value: `Vorst: "884-D. Commander Vorst, Kordani Security."\nVorst: "Another human face. I see they are still scraping Deck 4."\nVorst: "The Brengop treat this gate like a tollbooth. The Kordani will hold it like a border."\nVorst: "I spent years on the Concord front—I know the cost of one breach."\nVorst: "If the registries do not match, detain them. Do not ask for an explanation. My men will handle it."\nVorst: "The last clerk got greedy. It took four minutes to clear his desk. Replacing him was not difficult."\nVorst: "..."\nVorst: "Hail the first ship."`
          },
          {
            key: 'day1_directive',
            label: 'Day 1 Morning Shift Directive (data/Day2And3ScriptedDialogue.cs:175-188)',
            raylibPreset: 'morning_directive',
            currentlyInGame: 'Printed into CRT Comms Log immediately after Vorst hail closes.',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:175-188',
            value: `VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 01\nCLASSIFICATION: BULWARK PACT INTERNAL\n----------------------------------------------------------\nACTIVE PROTOCOL CHECKS:\n1. On hail, shielded ships receive an automatic shields-down order before telemetry transfer.\n2. Cross-check Raw Transponder ID (under Viewscreen) vs. Data Slate REG CODE.\n3. Matching ID: Slot Data Slate in Clearance Dock, then return to Slate Bus.\n4. Mismatched ID: Confirm conflict via PROTOCOL REVIEW first, then pull Detain Lever.`
          }
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
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'UI/QuartersScreen.cs:570, 577, 587, 628, 993'
        },
        raylibPreset: 'comms_line',
        hint: 'Diegetic prompts for Quarters door gating, shift-end walk back, and evening ration reminder.',
        fields: [
          { key: 'd1_door', label: 'Day 1/6 Unread Email Door Gate (UI/QuartersScreen.cs:570)', value: 'Should probably read my emails first.', currentlyInGame: '"Should probably read my emails first."', currentSource: 'UI/QuartersScreen.cs:570' },
          { key: 'd6_door', label: 'Day 6 Uncollected Blank Slate Chute Gate (UI/QuartersScreen.cs:577)', value: 'I see there is something in my chute, let me check it out', currentlyInGame: '"I see there is something in my chute, let me check it out"', currentSource: 'UI/QuartersScreen.cs:577' },
          { key: 'shift_end', label: 'Evening Door / Morning Bed Prompts (UI/QuartersScreen.cs:587, 628)', value: 'SHIFT COMPLETE -- REST BEFORE NEXT WATCH // HEAD TO DOOR FOR WATCH', currentlyInGame: 'Evening door (:587): "SHIFT COMPLETE -- REST BEFORE NEXT WATCH" | Morning bed (:628): "HEAD TO DOOR FOR WATCH"', currentSource: 'UI/QuartersScreen.cs:587, 628' },
          { key: 'd1_food', label: 'Day 1 Evening Diegetic Ration Caption (UI/QuartersScreen.cs:993)', value: 'Long first shift. Better order rations on the terminal before sleeping.', currentlyInGame: '"Long first shift. Better order rations on the terminal before sleeping."', currentSource: 'UI/QuartersScreen.cs:993' }
        ]
      },
      {
        id: 'day2_nixa',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Day 2 Live Hail — Regeer Nixa (SPS Probe Restored) & Morning Directive',
        day: 'Day 2',
        sortDay: 2,
        category: 'Live Viewscreen Hail',
        locked: false,
        done: true,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'data/Day2And3ScriptedDialogue.cs:45-52, 190-203'
        },
        raylibPreset: 'talking_head_hail',
        hint: 'Regeer Nixa (Brengop Mercantile Consortium, right-eye tassel) introduces the SPS Probe and hot weapons scan.',
        inGameContext: {
          before: 'Day 02 Watch starts in Booth 04 (Shift timer frozen). [INTERNAL HAIL] REGEER NIXA // CONSORTIUM LOGISTICS.',
          thisLine: '5 talking-head lines at 32 chars/sec -> [SYS] CONSORTIUM HAIL CLOSED -- SPS PROBE ONLINE. -> Day 02 Shift Directive.',
          after: 'PRESS [NEXT HAIL] TO BEGIN DAY 02 WATCH.'
        },
        fields: [
          {
            key: 'lines',
            label: 'Regeer Nixa Dialogue (data/Day2And3ScriptedDialogue.cs:45-52)',
            raylibPreset: 'talking_head_hail',
            currentlyInGame: '5 authored lines in Day2And3ScriptedDialogue.Day2RegeerNixaHailLines.',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:45-52',
            value: 'Regeer Nixa: "Morning, 884-D. I am Regeer Nixa, Consortium Logistics. It is... good to meet you."\nRegeer Nixa: "I see your shift yesterday went smoothly. Keep this up and we—I—will make sure your berth stays warm."\nRegeer Nixa: "I had your former associates on Deck 4 restore the SPS probe last night."\nRegeer Nixa: "Scan every ship and make sure their shields and weapons are actually off before you let them through. Pilots lie, and those Kordani thugs don\'t care how much a station costs when they get their scales on a trigger."\nRegeer Nixa: "Keep the lane moving, 884-D."'
          },
          {
            key: 'directive',
            label: 'Day 2 Morning Shift Directive (data/Day2And3ScriptedDialogue.cs:190-203)',
            raylibPreset: 'morning_directive',
            currentlyInGame: 'Printed into CRT Comms Log when Day 2 Nixa hail closes.',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:190-203',
            value: `VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 02\nNEW HARDWARE ONLINE: SPS PROBE (AUTO-WEAPONS COMPLIANCE)\n1. Cross-check Raw Transponder ID vs. Data Slate REG CODE.\n2. Sweep armed weapon mounts with the SPS Probe: comms will auto-issue 'Power down weapons.'\n3. Honest armed ships cool visibly inside the lens. Hold-to-lock [!] HOT WEAPONS on liars.`
          }
        ]
      },
      {
        id: 'day6_hack_email',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Day 6 Terminal Hack Email — "Check your chute" & Port 04 Tunnel Sequence',
        day: 'Day 6 (Pinned)',
        sortDay: 6,
        category: 'Terminal Hack & Chute',
        locked: false,
        done: true,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'Simulation/EconomyEngine.cs:214-234 · UI/TerminalOverlay.cs:919-929'
        },
        raylibPreset: 'email_body',
        hint: 'Delivers Blank Data Slate in 0500 Chute -> unlocks CRYPTOGRAPHY & DECK 4 tabs, SCRUB LOGS, and mid-download Slate Bus swaps.',
        fields: [
          {
            key: 'body',
            label: 'Email Text (FROM: unknown | Subject: Check your chute | Status: asf.as…tje)',
            raylibPreset: 'email_body',
            currentlyInGame: 'Sender: "unknown", Subject: "Check your chute", CustomStatusLine: "asf.as…tje", Timestamp: "CYC {cy}.{cm} // 05:01"',
            currentSource: 'Simulation/EconomyEngine.cs:214-234',
            value: 'Hi…\nCheck your Chute next to your door.\nYou’ll find a blank data-slate. Don’t worry too much where it comes from… just know that you still have friends down on Deck 4\nThere is a MNG- rig ({targetReg}) on today’s roster carrying telemetry someone is willing to pay for. Slot in the blank slate into the Bus before protocols hit.\nYou can transmit the slate tonight via the Cryptography tab\nDon’t forget to scrub your logs, I hear the Kordani are getting on edge about something.\nRegards\nA friend'
          }
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
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'data/Day2And3ScriptedDialogue.cs:55-64'
        },
        raylibPreset: 'talking_head_hail',
        hint: 'Unlocks Reference Manual Tablet Part 1 (EXP: CYC expiry + Prefix vs. Org/Species) and seeds Dopple shapeshifter rumours.',
        inGameContext: {
          before: 'Day 08 (DayUnlockManualPart1) Watch opens in Booth 04. [INTERNAL HAIL] REGEER NIXA // CONSORTIUM LOGISTICS.',
          thisLine: '7 talking-head lines at 32 chars/sec -> [SYS] CONSORTIUM HAIL CLOSED -- BRENGOP REFERENCE MANUAL ISSUED.',
          after: 'Prints Day 08 Shift Directive + PRESS [NEXT HAIL] TO BEGIN DAY 08 WATCH.'
        },
        fields: [
          {
            key: 'lines',
            label: 'Regeer Nixa Dialogue (data/Day2And3ScriptedDialogue.cs:55-64)',
            raylibPreset: 'talking_head_hail',
            currentlyInGame: '7 authored lines in Day2And3ScriptedDialogue.Day8RegeerNixaHailLines.',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:55-64',
            value: 'Regeer Nixa: "Morning, 884-D. Still clearing lanes I see. I do love a reliable investment."\nRegeer Nixa: "I pulled a few strings with Consortium Compliance and had a Registry Tablet sent up for your desk. Brand-new glass. Try not to grease it up with those fingers."\nRegeer Nixa: "Check every vessel\'s registration expiry with the registrar and match its prefix against whatever they like to call themselves. Wrong flag or wrong crew, mark the discrepancy and detain them. Let the lizards deal with it."\nRegeer Nixa: "They wanted to run armed boarding sweeps on every second freighter over those ridiculous... Dopple rumours. Imagine what that would do to our docking turnaround."\nRegeer Nixa: "..."\nRegeer Nixa: "Shapeshifting Concord leftovers. Pure gossip, of course. Nothing left of the Dopples after the Ashen collapse wiped them all to dust."\nRegeer Nixa: "Not that it is anything for a booth clerk to count dust over. Leave the paranoia to the Kordani. You just cross-check the registries and keep my ledger clean, 884-D."'
          }
        ]
      },
      {
        id: 'field_booklet_9pages',
        group: 'Locked & Authored Intro / Early Campaign Beats',
        title: 'Field Booklet ("884-D — MY NOTES") — All 9 Authored Pages',
        day: 'Days 1–15',
        sortDay: 1,
        category: 'Field Booklet (UI/FieldBooklet.cs)',
        locked: false,
        done: true,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'UI/FieldBooklet.cs:21, 73-170'
        },
        raylibPreset: 'field_booklet_page',
        hint: 'Pen-and-paper desk booklet ("884-D — MY NOTES"). Rendered at 280px inner width with denseRow: true (~35 chars/line, max 9 body lines / ~315 chars, NOT scrollable).',
        fields: [
          { key: 'day1_shift', label: 'Page 1 (day1_shift) — DAY 01 // TRANSPONDER & CLEARANCE', raylibPreset: 'field_booklet_page', currentlyInGame: '"Check TRANSPONDER ID under the viewscreen against REG CODE on the Data Slate. If matching, upload encrypted clearance (Clearance Dock -> Slate Bus). If mismatching, enter Protocol Review to flag and execute Detain."', currentSource: 'UI/FieldBooklet.cs:73-83', value: 'Check TRANSPONDER ID under the viewscreen against REG CODE on the Data Slate. If matching, upload encrypted clearance (Clearance Dock -> Slate Bus). If mismatching, enter Protocol Review to flag and execute Detain.' },
          { key: 'day1_evening', label: 'Page 2 (day1_evening) — DAY 01 PM // LEASE & RATIONS', raylibPreset: 'field_booklet_page', currentlyInGame: '"Berth lease (-30 SC) deducts automatically at Clock-Out. Order nightly rations in PACT REQ before sleeping to prevent SPS sway."', currentSource: 'UI/FieldBooklet.cs:85-94', value: 'Berth lease (-30 SC) deducts automatically at Clock-Out. Order nightly rations in PACT REQ before sleeping to prevent SPS sway.' },
          { key: 'day2_sps', label: 'Page 3 (day2_sps) — DAY 02 // SPS WEAPONS SWEEP', raylibPreset: 'field_booklet_page', currentlyInGame: '"1. Press SPS button. 2. Sweep ship with SPS probe. 3. Hot weapons trigger mandatory order \\"Power down weapons.\\" If weapons remain powered, hold to lock [!] HOT WEAPONS on the mini-screen, flag in Protocol Review, and Detain."', currentSource: 'UI/FieldBooklet.cs:96-106', value: '1. Press SPS button. 2. Sweep ship with SPS probe. 3. Hot weapons trigger mandatory order "Power down weapons." If weapons remain powered, hold to lock [!] HOT WEAPONS on the mini-screen, flag in Protocol Review, and Detain.' },
          { key: 'day4_warp', label: 'Page 4 (day4_warp) — DAY 04 // WARP CHECKER & STRIKES', raylibPreset: 'field_booklet_page', currentlyInGame: '"Warp Printer scan -> tear off strip -> align over Glowing Warp Checker (< REF: SYSTEM >). Red bleed or restricted Ashen Rift requires Detain. /3 Security Strikes system active."', currentSource: 'UI/FieldBooklet.cs:108-118', value: 'Warp Printer scan -> tear off strip -> align over Glowing Warp Checker (< REF: SYSTEM >). Red bleed or restricted Ashen Rift requires Detain. /3 Security Strikes system active.' },
          { key: 'day6_crypto', label: 'Page 5 (day6_crypto) — DAY 06 // BLANK SLATE & CRYPTO', raylibPreset: 'field_booklet_page', currentlyInGame: '"TARGET RIG: {targetReg}\\nSlot Blank Data Slate into Slate Bus before protocols hit -> capture packet -> re-transmit onto Primary Slate -> transmit in CRYPTOGRAPHY tab tonight and scrub logs before sleeping."', currentSource: 'UI/FieldBooklet.cs:120-131', value: 'TARGET RIG: {targetReg}\nSlot Blank Data Slate into Slate Bus before protocols hit -> capture packet -> re-transmit onto Primary Slate -> transmit in CRYPTOGRAPHY tab tonight and scrub logs before sleeping.' },
          { key: 'day8_manual', label: 'Page 6 (day8_manual) — DAY 08 // BRENGOP MANUAL', raylibPreset: 'field_booklet_page', currentlyInGame: '"Open Brengop Reference Manual -> check EXP: CYC against Station Cycle -> click prefix in SHIP REGISTRAR -> verify organization and species in SPECIES REGISTRAR."', currentSource: 'UI/FieldBooklet.cs:133-143', value: 'Open Brengop Reference Manual -> check EXP: CYC against Station Cycle -> click prefix in SHIP REGISTRAR -> verify organization and species in SPECIES REGISTRAR.' },
          { key: 'day10_hulls', label: 'Page 7 (day10_hulls) — DAY 10 // HULL SILHOUETTES', raylibPreset: 'field_booklet_page', currentlyInGame: '"Open HULLS tab -> verify viewport hull silhouette matches declared ship class and prefix."', currentSource: 'UI/FieldBooklet.cs:145-153', value: 'Open HULLS tab -> verify viewport hull silhouette matches declared ship class and prefix.' },
          { key: 'day12_cargo', label: 'Page 8 (day12_cargo) — DAY 12 // WAFERS & CARGO', raylibPreset: 'field_booklet_page', currentlyInGame: '"Wafer Writer prints a Cargo Manifest per ship. Check CARGO tab for the 5 banned items and sweep cargo bays on SPS for Violet [!] POWERED CARGO. Wipe used wafers in the top slot (3 blanks)."', currentSource: 'UI/FieldBooklet.cs:155-161', value: 'Wafer Writer prints a Cargo Manifest per ship. Check CARGO tab for the 5 banned items and sweep cargo bays on SPS for Violet [!] POWERED CARGO. Wipe used wafers in the top slot (3 blanks).' },
          { key: 'day15_stoker', label: 'Page 9 (day15_stoker) — DAY 15 // STELLAR STOKER', raylibPreset: 'field_booklet_page', currentlyInGame: '"Press [ANCHOR] to check MEASURED tons against Data Slate MASS. Flag undeclared mass in Protocol Review and Detain. Keep the dial out of the red band to avoid overload fines and brownouts."', currentSource: 'UI/FieldBooklet.cs:163-170', value: 'Press [ANCHOR] to check MEASURED tons against Data Slate MASS. Flag undeclared mass in Protocol Review and Detain. Keep the dial out of the red band to avoid overload fines and brownouts.' }
        ]
      },
      {
        id: 'protocol_review_challenges',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Protocol Review Officer Challenge Prompts (16 Faults + 2 Honest Omitted-Manifest)',
        day: 'Days 1–15+',
        sortDay: 1,
        category: 'Protocol Review Challenges',
        locked: false,
        done: false,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# (1 TODO AT :523)',
          location: 'UI/DeskScreen.ProtocolsAndComms.cs:448-530, 905, 1245'
        },
        raylibPreset: 'comms_line',
        hint: 'Spoken by > BOOTH 04 when the player pairs two conflicting elements in Protocol Review. Note: StokerMassMismatch (:523) is tagged // TODO: USER DIALOGUE PASS.',
        inGameContext: {
          before: 'Player clicks [PROTOCOL REVIEW] and pairs two conflicting fields -> Flushes active routine comms -> 0.50s [PROTOCOL FAULT] summary.',
          thisLine: '> BOOTH 04: "{officerPrompt}" (followed by 0.28s portrait static flicker).',
          after: '0.60s [RECEIVING...] -> CAPT: "{captainExcuse}" -> Fault marked verified for Detain Lever.'
        },
        fields: [
          { key: 'p_transponder', label: 'TransponderIdMismatch (:448)', value: "Our raw transponder reads '{RawTransponderId}', which does not match your Data Slate code '{RegistrationCode}'.", currentlyInGame: `"Our raw transponder reads '{RawTransponderId}', which does not match your Data Slate code '{RegistrationCode}'."`, currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:448' },
          { key: 'p_expired', label: 'ExpiredRegistration (:454)', value: 'Your registration expired on {RegistrationExpiryDisplay}. Current cycle is {curCycle}.', currentlyInGame: '"Your registration expired on {RegistrationExpiryDisplay}. Current cycle is {curCycle}."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:454' },
          { key: 'p_org', label: 'PrefixOrganizationMismatch (:459)', value: "Prefix '{DeclaredPrefix}' does not belong to '{DeclaredFactionName}'.", currentlyInGame: `"Prefix '{DeclaredPrefix}' does not belong to '{DeclaredFactionName}'."`, currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:459' },
          { key: 'p_species', label: 'PrefixSpeciesMismatch (:464)', value: "Prefix '{DeclaredPrefix}' is restricted and does not permit a {DeclaredCaptainSpecies} captain.", currentlyInGame: `"Prefix '{DeclaredPrefix}' is restricted and does not permit a {DeclaredCaptainSpecies} captain."`, currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:464' },
          { key: 'p_class', label: 'PrefixHullSilhouetteMismatch — Class (:471)', value: 'Your Data Slate declares a {ShortClass(Declared)} vessel, yet sensors show a {ShortClass(Actual)} hull silhouette.', currentlyInGame: '"Your Data Slate declares a {ShortClass(Declared)} vessel, yet sensors show a {ShortClass(Actual)} hull silhouette."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:471' },
          { key: 'p_hull', label: 'PrefixHullSilhouetteMismatch — Hull (:476)', value: "Your Data Slate declares '{DeclaredPrefix}', which does not match your hull silhouette.", currentlyInGame: `"Your Data Slate declares '{DeclaredPrefix}', which does not match your hull silhouette."`, currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:476' },
          { key: 'p_weapons', label: 'SpoofedWeaponsHot (:482)', value: 'Your Data Slate claims weapons OFFLINE, yet SPS shows live power feeding forward mounts.', currentlyInGame: '"Your Data Slate claims weapons OFFLINE, yet SPS shows live power feeding forward mounts."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:482' },
          { key: 'p_cargopower', label: 'UnexplainedCargoPowerDraw (:487)', value: 'Your manifest declares an empty unpowered hold, yet SPS shows high-draw violet power in your cargo bay.', currentlyInGame: '"Your manifest declares an empty unpowered hold, yet SPS shows high-draw violet power in your cargo bay."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:487' },
          { key: 'p_origin', label: 'FalsifiedOriginWaveform (:492)', value: 'Your thermal warp strip does not match your declared departure from {OriginSystem}.', currentlyInGame: '"Your thermal warp strip does not match your declared departure from {OriginSystem}."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:492' },
          { key: 'p_spoken_route', label: 'SpokenRouteDiscrepancy (:497)', value: 'You stated departure from {SpokenOriginSystem} on comms, contradicting your filed origin {OriginSystem}.', currentlyInGame: '"You stated departure from {SpokenOriginSystem} on comms, contradicting your filed origin {OriginSystem}."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:497' },
          { key: 'p_spoken_cargo', label: 'SpokenCargoDiscrepancy (:502)', value: 'You declared {SpokenCargoItem} on comms, contradicting your Cargo Manifest ({WaferCargoManifestItem}).', currentlyInGame: '"You declared {SpokenCargoItem} on comms, contradicting your Cargo Manifest ({WaferCargoManifestItem})."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:502' },
          { key: 'p_banned_cargo', label: 'BannedCargoItem (:507)', value: 'Your Cargo Manifest lists {WaferCargoManifestItem}, which is permanently banned at Void Gate 3.', currentlyInGame: '"Your Cargo Manifest lists {WaferCargoManifestItem}, which is permanently banned at Void Gate 3."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:507' },
          { key: 'p_manifest_mismatch', label: 'CargoManifestDiscrepancy (:512)', value: 'Your Cargo Manifest cert-wafer lists {WaferCargoManifestItem}, contradicting your Data Slate ({CargoManifest}).', currentlyInGame: '"Your Cargo Manifest cert-wafer lists {WaferCargoManifestItem}, contradicting your Data Slate ({CargoManifest})."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:512' },
          { key: 'p_withheld_manifest', label: 'WithheldIllicitCargoManifest (:517)', value: 'Your subspace bundle omitted the mandatory Cargo Manifest cert-wafer. Produce it or prepare for detention.', currentlyInGame: '"Your subspace bundle omitted the mandatory Cargo Manifest cert-wafer. Produce it or prepare for detention."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:517' },
          { key: 'p_honest_omitted', label: 'Honest Omitted Manifest Prompts (:905 & :1245)', value: 'Your hull mass exceeds your Data Slate. Transmit your Cargo Manifest cert-wafer. // Your subspace bundle omitted a Cargo Manifest cert-wafer. Transmit it now.', currentlyInGame: 'Stoker pair (:905): "Your hull mass exceeds your Data Slate. Transmit your Cargo Manifest cert-wafer."\nWafer module pair (:1245): "Your subspace bundle omitted a Cargo Manifest cert-wafer. Transmit it now."\nCaptain reply (ShipGenerator.cs:1130): "Oversight on bridge -- transmitting Cargo Manifest packet now."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:905, 1245' },
          { key: 'p_stoker_mass_todo', label: 'StokerMassMismatch (:523 — Tagged // TODO: USER DIALOGUE PASS)', value: '', currentlyInGame: '"Stellar Stoker anchor reads {ActualMass:N0} T, exceeding your declared {DeclaredTonnage:N0} T." // TODO: USER DIALOGUE PASS', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:523' }
        ]
      },
      {
        id: 'auto_compliance',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Automatic Shields-Down, Auto-SPS Weapons & Protocol Upload Replies',
        day: 'Days 1–2+',
        sortDay: 2,
        category: 'Auto-Compliance Comms',
        done: false,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C#',
          location: 'Simulation/ShipGenerator.cs:1024-1057 · DeskScreen.cs:2030-2069'
        },
        raylibPreset: 'comms_line',
        hint: 'Short captain replies when Booth 04 auto-orders "Shields down, please." (Day 1+) or "Power down weapons." via SPS sweep (Day 2+), plus SubspaceUploadLine when download hits 1.80s.',
        inGameContext: {
          before: 'Arrival greeting -> 0.18s -> > BOOTH 04: "Send subspace protocols." -> (if ActualShieldsUp) "..." -> > BOOTH 04: "Shields down, please."',
          thisLine: 'CAPT: "{ShieldsLoweredLine}" -> 1.80s download -> CAPT: "{SubspaceUploadLine}". On Day 2+, sweeping hot weapon mount fires > BOOTH 04: "Power down weapons." -> CAPT: "{WeaponsPoweredDownLine}" or "{SpoofedWeaponsBluffLine}".',
          after: 'Auto-Interrogation (> BOOTH 04: "Confirm route, purpose of visit, and cargo.").'
        },
        fields: [
          { key: 'shields_polite', label: 'Shields Compliance — Standard / Warm (rep > -5)', value: '', currentlyInGame: '"Shields down." (ComplianceDelaySeconds: 0.20s if rep >= +6, 0.55s if mid)', currentSource: 'Simulation/ShipGenerator.cs:1024-1026' },
          { key: 'shields_annoyed', label: 'Shields Compliance — Low-Rep / Annoyed (rep <= -5)', value: '', currentlyInGame: '"Fine. Dropping shields now." (ComplianceDelaySeconds: 1.35s if rep <= -5)', currentSource: 'Simulation/ShipGenerator.cs:1024-1026' },
          { key: 'wpn_honest', label: 'Auto-SPS Weapons — Honest Armed Ship Cooling Down', value: '', currentlyInGame: 'Standard: "Weapons cold." | Low-Rep (rep <= -5): "Cutting weapon power."', currentSource: 'Simulation/ShipGenerator.cs:1028-1030' },
          { key: 'wpn_spoof', label: 'Auto-SPS Weapons — Spoofed Hot Weapons Lie / Bluff (SpoofedWeaponsBluffLine)', value: '', currentlyInGame: 'KRW- / Default: "Complying. Weapons cycling cold." | BMC-: "Acknowledged. Weapon banks cold." | PRJ-: "Flipping weapons cold right now!"', currentSource: 'Simulation/ShipGenerator.cs:1042-1045' },
          { key: 'upload_done', label: 'Subspace Protocol Download Complete (SubspaceUploadLine @ 1.80s)', value: '', currentlyInGame: 'ORN-: "Checksum packet sent." | BMC-: "Telemetry uploaded." | PRJ-: "Packet sent!" | KRW- / Default: "Protocols sent."', currentSource: 'Simulation/ShipGenerator.cs:1053-1057' }
        ]
      },
      {
        id: 'day3_ghost_route',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Day 3 Hardcoded Encounter — "The Ghost Route" & Day 3 Directive',
        day: 'Day 3',
        sortDay: 3,
        category: 'Hardcoded Encounter',
        done: true,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'Simulation/ShipGenerator.cs:782-936 · Day2And3ScriptedDialogue.cs:205-218'
        },
        raylibPreset: 'comms_line',
        hint: 'Spotless ship on Day 3 rules (StoryTag = "ghost_route") with 0.50s transponder flicker on arrival and warm Warp Pylons. Sets GhostRouteSuspectDetained.',
        inGameContext: {
          before: 'Day 3 arrival -> Bypasses faction_pools.json -> Downloads spotless protocols -> > BOOTH 04: "Confirm route, purpose of visit, and cargo."',
          thisLine: 'Captain stumbles on departure origin during Auto-Interrogation -> Player clicks [INSPECT ROUTE] -> Officer challenges timing -> Captain pushes back.',
          after: 'Player either pulls Detain Lever on a hunch (Branch A on Day 4) or grants Clearance (Branch B on Day 4).'
        },
        fields: [
          {
            key: 'greeting',
            label: 'Day 3 Morning Shift Directive (Day2And3ScriptedDialogue.cs:205-218)',
            raylibPreset: 'morning_directive',
            currentlyInGame: 'VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 03 (ROUTINE WATCH NOTICE: BREATHER SHIFT)',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:205-218',
            value: `VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 03\nROUTINE WATCH NOTICE: BREATHER SHIFT\n1. No new desk equipment today (Warp Residue Printer remains offline awaiting KDF tech pass).\n2. Cross-check Raw Transponder ID vs. Data Slate REG CODE.\n3. Sweep weapon mounts with the SPS Probe and flag any spoofed [!] HOT WEAPONS via Protocol Review.`
          },
          {
            key: 'route_slip',
            label: 'Auto-Interrogation Origin Slip (ShipGenerator.cs:873-875)',
            raylibPreset: 'comms_line',
            currentlyInGame: '"Inbound from {declaredOrigin} -- uh, I mean, departed {declaredOrigin} four cycles ago. Heading to {destination}. Purpose is {slotPurpose}. Hold is carrying {slotCargoSpeech}"',
            currentSource: 'Simulation/ShipGenerator.cs:873-875',
            value: 'Inbound from {declaredOrigin} -- uh, I mean, departed {declaredOrigin} four cycles ago. Heading to {destination}. Purpose is {slotPurpose}. Hold is carrying {slotCargoSpeech}'
          },
          {
            key: 'cargo_excuse',
            label: '[INSPECT ROUTE] Officer Challenge Prompt (ShipGenerator.cs:893)',
            raylibPreset: 'comms_line',
            currentlyInGame: '> BOOTH 04: "Your departure timing does not match the {declaredOrigin} lane."',
            currentSource: 'Simulation/ShipGenerator.cs:893 & DeskScreen.cs:2344-2353',
            value: 'Your departure timing does not match the {declaredOrigin} lane.'
          },
          {
            key: 'pushback',
            label: 'Captain Response to [INSPECT ROUTE] Pushback (ShipGenerator.cs:894-895)',
            raylibPreset: 'comms_line',
            currentlyInGame: '"Your station\'s own spectrometer is dark, Port Officer. My slate is green, my weapons are cold, and my papers are legal. Unless you want to explain to Kordani Command why you detained a clean vessel on a hunch, clear my dock."',
            currentSource: 'Simulation/ShipGenerator.cs:894-895 & DeskScreen.cs:2354',
            value: "Your station's own spectrometer is dark, Port Officer. My slate is green, my weapons are cold, and my papers are legal. Unless you want to explain to Kordani Command why you detained a clean vessel on a hunch, clear my dock."
          }
        ]
      },
      {
        id: 'day4_vorst_hails',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Day 4 Commander Vorst Live Hail (Branches A & B + /3 Strikes) & Directives',
        day: 'Day 4',
        sortDay: 4,
        category: 'Live Hail & Warp Checker',
        done: true,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [AUTHORED]',
          location: 'data/Day2And3ScriptedDialogue.cs:71-97, 114-154'
        },
        raylibPreset: 'talking_head_hail',
        hint: 'Both branches restore the Warp Printer & Glowing Warp Checker (6 systems + restricted Ashen Rift red bleed) and activate /3 Security Strikes.',
        inGameContext: {
          before: 'Day 04 (DayUnlockWarpScanner) Watch opens -> Prints Day 04 Shift Directive (Detained vs. Cleared variant) -> [INTERNAL HAIL] COMMANDER VORST.',
          thisLine: '4 talking-head lines (Branch A if ghostRouteSuspectDetained == true, else Branch B) -> [SYS] INTERNAL HAIL CLOSED -- WARP SPECTROMETER & SECURITY STRIKES ONLINE.',
          after: 'PRESS [NEXT HAIL] TO BEGIN DAY 04 WATCH.'
        },
        fields: [
          {
            key: 'branch_a',
            label: 'Branch A — Player Detained Ghost Route (Day2And3ScriptedDialogue.cs:83-86)',
            raylibPreset: 'talking_head_hail',
            currentlyInGame: '4 authored lines in BuildDay4KordaniHailLines (ghostRouteSuspectDetained == true).',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:83-86',
            value: `Vorst: "884-D. Our boarding teams investigated the vessel you detained yesterday ({safeReg}). Their departure logs from {safeOrigin} were falsified."\nVorst: "You trusted your gut, and it paid off. Thank you for the catch."\nVorst: "That said, Booth 04 does not run on instinct. I pulled Deck 4 salvage to restore your Warp Spectrometer and Glowing Warp Checker."\nVorst: "Effective immediately, Kordani Security Strikes (/3 cap) are active on your console. Print and verify every origin waveform before you pull Access or Detain."`
          },
          {
            key: 'branch_b',
            label: 'Branch B — Player Cleared Ghost Route (Day2And3ScriptedDialogue.cs:92-95)',
            raylibPreset: 'talking_head_hail',
            currentlyInGame: '4 authored lines in BuildDay4KordaniHailLines (ghostRouteSuspectDetained == false).',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:92-95',
            value: `Vorst: "884-D. Perimeter relays flagged vessel {safeReg} slipping out of Void Gate 3 yesterday on an unlogged vector. Its {safeOrigin} declaration was falsified."\nVorst: "You followed active Day 03 rules, yet a recon hull still crossed my border while Brengop management sat on your broken spectrometer."\nVorst: "I bypassed their ledger and had Deck 4 salvage wired into your Warp Residue Printer and Glowing Warp Checker."\nVorst: "Effective immediately, Kordani Security Strikes (/3 cap) are active at Booth 04. Verify every origin strip before you clear a lane."`
          },
          {
            key: 'dir_ab',
            label: 'Day 4 Morning CRT Directives (Variants A & B — Day2And3ScriptedDialogue.cs:114-154)',
            raylibPreset: 'morning_directive',
            currentlyInGame: 'INCIDENT REPORT [KDF-SEC-09] (Detained vs. Not Detained) + ADMINISTRATIVE NOTICE [BMC-OPS] (#4412) + NEW MANDATORY PROTOCOL + NOTE.',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:114-154',
            value: `VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 04\nCLASSIFICATION: BULWARK PACT INTERNAL\n\nINCIDENT REPORT [KDF-SEC-09] (IF CLEARED):\nAt 02:14 station standard, long-range perimeter relays flagged vessel {safeReg} departing Void Gate 3 on an unlogged vector. Post-transit telemetry confirmed its declared origin ({safeOrigin}) was falsified.\n\nINCIDENT REPORT [KDF-SEC-09] (IF DETAINED):\nOvernight investigation by Kordani boarding teams on detained vessel {safeReg} confirmed its declared origin ({safeOrigin}) was falsified. Because Booth 04 only caught the breach on a hunch while the spectrometer was offline, Kordani Security has forced an immediate spectrometer repair anyway.\n\nADMINISTRATIVE NOTICE [BMC-OPS]:\nMaintenance request #4412 (Booth 04 Warp Field Residue Spectrometer - thermal coil burnout from Brown Dwarf infrared surge) was previously deferred under Brengop cost-containment policy. Following Kordani Security intervention, a replacement coil has been pulled from Deck 4 salvage and wired into your console.\n\nNEW MANDATORY PROTOCOL:\nEffective immediately, ALL incoming vessels must undergo a Warp Field Residue print-check. Overlap the printed magnetic waveform strip directly onto your backlit Glowing Warp Checker before slotting any Data Slate into the Clearance Dock.\n\nNOTE: Salvaged coil runs hot. Print speed is suboptimal. Do not tamper with housing. Brengop Management will bill replacement costs directly to your Berth Lease.`
          }
        ]
      },
      {
        id: 'slate_retransmit',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Day 6+ Slate Bus Mid-Download Unplug & Cert-Wafer Re-Transmit Lines',
        day: 'Day 6+',
        sortDay: 6,
        category: 'Slate Bus Comms',
        done: false,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# (1 TODO AT :1921)',
          location: 'Simulation/ShipGenerator.cs:1062-1067 · DocumentsAndDrag.cs:1918-1921'
        },
        raylibPreset: 'comms_line',
        hint: 'Plays when a Data Slate is unplugged mid-download (or when a Cert-Wafer is prematurely wiped and re-requested via [RE-TRANSMIT]). Note: Silent Blank Slate swap on Day 6+ suppresses the annoyed reply.',
        inGameContext: {
          before: 'Primary Data Slate unplugged mid-download ([PORT ERROR]) -> Re-plugged into Slate Bus -> Player clicks [RE-TRANSMIT] -> > BOOTH 04: "Link dropped. Re-transmit subspace protocols."',
          thisLine: 'CAPT: "{ReTransmitAnnoyedLine}" (or for wiped wafer: > BOOTH 04: "Re-transmit auxiliary certificates." -> CAPT: "Already sent them. Sending again.").',
          after: '0.55s later -> "[SLATE BUS] RE-SYNCING SUBSPACE PROTOCOL PACKET..." (1.80s download restarts).'
        },
        fields: [
          { key: 'civ', label: 'Civilian / Free Traders / Oruun / Prunjun / Default (ShipGenerator.cs:1065-1067)', value: '', currentlyInGame: 'ORN-: "Carrier dropped. Resending packet." | PRJ-: "Hey! Sending packet again!" | KRW-: "Keep that slate plugged in! Resending." | Default: "Link dropped -- resending protocols."', currentSource: 'Simulation/ShipGenerator.cs:1062-1067' },
          { key: 'bmc', label: 'Brengop (BMC-) Re-Transmit Annoyance (ShipGenerator.cs:1064)', value: '', currentlyInGame: 'BMC-: "Fix your port -- resending packet!"', currentSource: 'Simulation/ShipGenerator.cs:1064' },
          { key: 'kdf', label: 'Kordani (KDF-) Re-Transmit Annoyance (ShipGenerator.cs:1063)', value: '', currentlyInGame: 'KDF-: "Link severed?! Resending packet now."', currentSource: 'Simulation/ShipGenerator.cs:1063' },
          { key: 'wafer_retransmit', label: 'Prematurely Wiped Cert-Wafer [RE-TRANSMIT] Reply (DocumentsAndDrag.cs:1919-1921 — // TODO: USER DIALOGUE PASS)', value: '', currentlyInGame: '> BOOTH 04: "Re-transmit auxiliary certificates." (:1918)\nCAPT: "Already sent them. Sending again." (:1921, // TODO: USER DIALOGUE PASS)', currentSource: 'UI/DeskScreen.DocumentsAndDrag.cs:1918-1921' }
        ]
      },
      {
        id: 'day10_hulls_dir',
        group: 'Days 1–10 — Early Desk Systems & Encounters',
        title: 'Days 5–11 Morning Shift Directives (Breather Shifts, Manual Pt 1 & HULLS Tab)',
        day: 'Days 5–11',
        sortDay: 10,
        category: 'Morning Directive',
        done: false,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# FALLBACK',
          location: 'data/Day2And3ScriptedDialogue.cs:225-276'
        },
        raylibPreset: 'morning_directive',
        hint: 'CRT Morning Shift Directives for Days 5–7 (Breather/Queue), Days 8–9 (Reference Manual Pt 1), and Days 10–11 (Reference Manual Pt 2 — HULLS tab).',
        inGameContext: {
          before: 'DeskScreen.OnEnter() at start of shift (or after Day 8 Nixa hail closes).',
          thisLine: '[SYSTEM] prints BuildDailyShiftDirectiveLines() into the 334px CRT Comms Log.',
          after: 'PRESS [NEXT HAIL] TO BEGIN DAY XX WATCH.'
        },
        fields: [
          { key: 'directive', label: 'Day 10–11 Morning Directive Copy (HULLS Tab — Hull Silhouettes & Ship Class)', value: '', raylibPreset: 'morning_directive', currentlyInGame: 'Header: "NEW PROTOCOL ACTIVE: HULL SILHOUETTES & SHIP CLASS (BRENGOP MANUAL -> HULLS TAB)" + 3 checks (1. Hulls tab silhouette vs. class & prefix, 2. EXP/Prefix/Species, 3. Prior checks). (Days 5–7 & 8–9 use similar 3-bullet fallback headers at :225-260).', currentSource: 'data/Day2And3ScriptedDialogue.cs:262-276' }
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
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [2 TODO TAGS]',
          location: 'Day2And3ScriptedDialogue.cs:278-292 · DeskScreen.cs:2308 · DocumentsAndDrag.cs:1853-1854'
        },
        raylibPreset: 'comms_line',
        hint: 'Wafer Writer comes online (3 reusable matte ceramic wafers) + Cargo Manifest Cert-Wafer + SPS Violet. Both intro_blurb and empty_hopper are tagged // TODO: USER DIALOGUE PASS in C#.',
        inGameContext: {
          before: 'Day 12+ Primary Data Slate download reaches 1.80s (CompleteSubspaceProtocolsDownload).',
          thisLine: '1st arrival prints [WAFER DEMUX] intro blurb. If player forgets to wipe used wafers (_waferHopperCount <= 0), prints [WAFER WRITER] HOPPER EMPTY (0/3) + NOTE.',
          after: 'Auto-Interrogation (> BOOTH 04: "Confirm route, purpose of visit, and cargo.").'
        },
        fields: [
          { key: 'directive', label: 'Day 12–14 Morning Directive (Wafer Writer + 5 Banned Items + SPS Violet)', value: '', raylibPreset: 'morning_directive', currentlyInGame: '"NEW HARDWARE ONLINE: WAFER WRITER DEMUX & MANUAL CARGO TAB" + 3 checks (Cert-Wafers vs. 5-item Banned List, Violet [!] POWERED CARGO + wipe in top slot, prior checks).', currentSource: 'data/Day2And3ScriptedDialogue.cs:278-292' },
          { key: 'intro_blurb', label: 'Cargo Manifest Cert-Wafer 1st-Intro Blurb (DeskScreen.cs:2308 — // TODO: USER DIALOGUE PASS)', value: '', raylibPreset: 'comms_line', currentlyInGame: '"[WAFER DEMUX] Ceramic Cargo Manifest wafers now print per arrival. Wipe used wafers in top slot (3 blanks)." // TODO: USER DIALOGUE PASS', currentSource: 'UI/DeskScreen.cs:2307-2308' },
          { key: 'empty_hopper', label: 'Empty Hopper Warning Note (DocumentsAndDrag.cs:1853-1854 — // TODO: USER DIALOGUE PASS)', value: '', raylibPreset: 'comms_line', currentlyInGame: '"[WAFER WRITER] HOPPER EMPTY (0/3) -- PRINT HELD. WIPE A WAFER IN TOP SLOT."\n"NOTE: \\"Oh yes, don\'t forget to wipe the wafers clean—we only gave you enough for what you need.\\"" // TODO: USER DIALOGUE PASS', currentSource: 'UI/DeskScreen.DocumentsAndDrag.cs:1852-1854' }
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
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C#',
          location: 'UI/DeskScreen.cs:2360-2551'
        },
        raylibPreset: 'comms_line',
        hint: 'Slotting a pre-loaded Covert Delivery Mission Slate into the Slate Bus triggers a 1.35s upload and one of 3 hardcoded reaction buckets.',
        inGameContext: {
          before: 'Player drags pre-loaded Covert Mission Data Slate into Slate Bus -> 1.35s "[SLATE BUS // TX] UPLOADING COVERT MISSION PAYLOAD TO {RegistrationCode}..."',
          thisLine: 'Outcome 1 (Intended Recipient: 2 captain lines + crystal burnt) | Outcome 2 (Wrong Non-Pact Ship: helm buffer complaint + ejected) | Outcome 3 (KDF-/BMC- Pact Cruiser: hostile alarm + [AUDIT_FLAG] + +1 Strike).',
          after: 'Player resumes normal inspection of the docked vessel.'
        },
        fields: [
          { key: 'intended', label: 'Outcome 1 — Intended Mission Recipient (DeskScreen.cs:2426, 2430)', value: '', currentlyInGame: 'Line 1 (:2426): CAPT: "Wait -- what is this encrypted burst coming straight off your Slate Bus?!"\nLine 2 (:2430, +0.45s): CAPT: "...Understood, Booth 04. Thank you. Forget this channel ever pulsed."\n[SYSTEM] (:2482): "[COVERT MISSION COMPLETE] PAYLOAD DELIVERED TO {dockedReg} (+{rewardSc} SC). CRYSTAL BURNT -- UNPLUG SLATE."', currentSource: 'UI/DeskScreen.cs:2421-2484' },
          { key: 'wrong_civ', label: 'Outcome 2 — Wrong Non-Pact Civilian Recipient (DeskScreen.cs:2543)', value: '', currentlyInGame: 'CAPT (:2543): "Uh, Booth 04? You just dumped raw junk telemetry onto my helm buffer. Keep your Slate Bus clean!"\n[SYSTEM] (:2546): "[SLATE BUS] WRONG RECIPIENT -- COVERT MISSION SLATE EJECTED TO DESK."', currentSource: 'UI/DeskScreen.cs:2540-2551' },
          { key: 'pact_cruiser', label: 'Outcome 3 — Accidental Pact Cruiser Upload (KDF- / BMC- — DeskScreen.cs:2491-2492)', value: '', currentlyInGame: 'KDF- (:2491): CAPT: "Unauthorized telemetry injection on a Kordani Defense Fleet bus?! Security Command is logging Booth 04 immediately!"\nBMC- (:2492): CAPT: "Illegal non-clearance burst onto a Brengop Consortium hull?! Factor Audit is flagging your booth right now!"', currentSource: 'UI/DeskScreen.cs:2486-2538' }
        ]
      },
      {
        id: 'day15_stoker_foreman',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 15 Live Hail — Regeer Nixa (Stellar Stoker Dual-Readout Mass Dial)',
        day: 'Day 15',
        sortDay: 15,
        category: 'Live Hail & Stellar Stoker',
        done: false,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [5 TODO TAGS]',
          location: 'data/Day2And3ScriptedDialogue.cs:35-42, 294-305'
        },
        raylibPreset: 'talking_head_hail',
        hint: 'In C#, Day15BrengopForemanHailLines is spoken by Regeer Nixa (CONSORTIUM LOGISTICS) and has 5 // TODO: USER DIALOGUE PASS markers ready for your final pass.',
        inGameContext: {
          before: 'Day 15 (DayUnlockStoker) Watch opens in Booth 04. [INTERNAL HAIL] REGEER NIXA // CONSORTIUM LOGISTICS.',
          thisLine: '4 talking-head lines at 32 chars/sec -> [SYS] CONSORTIUM HAIL CLOSED -- STELLAR STOKER MASS DIAL ONLINE. -> Day 15 Shift Directive.',
          after: 'PRESS [NEXT HAIL] TO BEGIN DAY 15 WATCH.'
        },
        fields: [
          { key: 'foreman_name', label: 'Speaker Header & Close System Line (ProtocolsAndComms.cs:185, 331)', value: '', raylibPreset: 'comms_line', currentlyInGame: 'Header: "[INTERNAL HAIL] REGEER NIXA // CONSORTIUM LOGISTICS"\nClose: "[SYS] CONSORTIUM HAIL CLOSED -- STELLAR STOKER MASS DIAL ONLINE."', currentSource: 'UI/DeskScreen.ProtocolsAndComms.cs:185, 331' },
          {
            key: 'hail_lines',
            label: 'Day 15 Live Viewscreen Hail Dialogue (Day2And3ScriptedDialogue.cs:36-42 — 5 // TODO: USER DIALOGUE PASS tags)',
            value: '',
            raylibPreset: 'talking_head_hail',
            currentlyInGame: `Regeer Nixa: "Morning, 884-D. Do forgive the grease on your console—I had our riggers bolt a Stellar Stoker mass-anchor gauge beneath your Detain Lever before dawn."\nRegeer Nixa: "Press ANCHOR on every hull that docks and match its measured weight against the mass declared on their slate."\nRegeer Nixa: "Keep that strain needle out of the red band. One heavy uncalibrated freighter will rattle the ring, and two will cook the coils."\nRegeer Nixa: "Do try not to fry Consortium hardware, 884-D. Billing will dock your pay, and those paranoid Kordani will tear your berth apart hunting for sabotage."`,
            currentSource: 'data/Day2And3ScriptedDialogue.cs:35-42'
          },
          {
            key: 'stoker_directive',
            label: 'Days 15–28 Morning Shift Directive (Day2And3ScriptedDialogue.cs:294-305)',
            value: '',
            raylibPreset: 'morning_directive',
            currentlyInGame: 'Header: "NEW HARDWARE ONLINE: STELLAR STOKER DUAL-READOUT MASS ANCHOR" + 3 checks (1. Press [ANCHOR] vs. Data Slate MASS, 2. Flag overweight / Raw Slag Isotope, 3. Keep strain needle out of red).',
            currentSource: 'data/Day2And3ScriptedDialogue.cs:294-305'
          }
        ]
      },
      {
        id: 'day17_conflicting_directives',
        group: 'Days 12–26 — Mid & Late Campaign Hardware & Climax',
        title: 'Day 17 Conflicting Morning Directives (Kordani Security vs. Brengop Mercantile)',
        day: 'Day 17',
        sortDay: 17,
        category: 'Conflicting Directives',
        done: false,
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'data/placeholders_todo.json:4-8'
        },
        raylibPreset: 'morning_directive',
        hint: 'Tracked in data/placeholders_todo.json:4-8 (currently unread at runtime). Contradictory Kordani vs. Brengop morning shift directives on Day 17.',
        inGameContext: {
          before: 'Day 17 Watch opens in Booth 04.',
          thisLine: 'Kordani Security directive followed immediately by contradictory Brengop Mercantile Administration directive in CRT Comms Log.',
          after: 'PRESS [NEXT HAIL] TO BEGIN DAY 17 WATCH.'
        },
        fields: [
          { key: 'kordani_dir', label: 'Day 17 Kordani Security Morning Shift Directive', value: '', raylibPreset: 'morning_directive', currentlyInGame: '"[TODO: Finalize Kordani Security morning shift directive for Day 17]"', currentSource: 'data/placeholders_todo.json:6' },
          { key: 'brengop_dir', label: 'Day 17 Contradictory Brengop Mercantile Morning Shift Directive', value: '', raylibPreset: 'morning_directive', currentlyInGame: '"[TODO: Finalize contradictory Brengop Mercantile Administration morning shift directive for Day 17]"', currentSource: 'data/placeholders_todo.json:7' }
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
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'Core/ConfigFlags.cs:dayUnlockFaceBribes · ValidationEngine.cs (tookBribe: false)'
        },
        raylibPreset: 'comms_line',
        hint: 'Config flag dayUnlockFaceBribes exists in data/config.json, and ValidationEngine.cs has tookBribe parameter scaffolding (currently hardcoded false on all 7 call sites).',
        fields: [
          { key: 'directive', label: 'Day 18 Morning Directive (Face Match + Comms Audit)', value: '', raylibPreset: 'morning_directive', currentlyInGame: '[NOT WIRED IN C# YET — Currently falls through to Days 15–28 Stoker directive in Day2And3ScriptedDialogue.cs:294-305]', currentSource: 'data/Day2And3ScriptedDialogue.cs:294-305' },
          { key: 'bribes', label: 'Encrypted Subspace Bribe Pitches (3–4 casual pitches)', value: '', raylibPreset: 'comms_line', currentlyInGame: '[NOT WIRED IN C# YET — ValidationEngine.cs hardcodes tookBribe: false on all 7 RecordShipEncounterOnce call sites]', currentSource: 'Simulation/ValidationEngine.cs' },
          { key: 'sting_tells', label: 'Kordani IA Sting Dialogue Tells (stiff formal Pact phrasing on a "tramp hauler")', value: '', raylibPreset: 'comms_line', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'Core/ConfigFlags.cs:dayUnlockFaceBribes' },
          { key: 'cam_waiver', label: 'Genuine Broken Camera Waiver vs. Lying [!] SPOOFED COMMS Lines', value: '', raylibPreset: 'comms_line', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'data/ShipSpec.cs:BiometricSpeciesMismatch' }
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
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'Core/ConfigFlags.cs:dayUnlockCargoBioScan · data/ShipSpec.cs:UndeclaredCargoBioSignature'
        },
        raylibPreset: 'morning_directive',
        hint: 'SPS Green Bio-Scan + Bio-Clearance Cert-Wafer. Config key dayUnlockCargoBioScan exists in data/config.json but is not wired in DeskScreen yet.',
        fields: [
          { key: 'directive', label: 'Day 21 Quarantine Morning Directive (explicitly naming forged-permit rule)', value: '', raylibPreset: 'morning_directive', currentlyInGame: '[NOT WIRED IN C# YET — ConfigFlags.dayUnlockCargoBioScan is deserialized in data/config.json but unused at runtime]', currentSource: 'Core/ConfigFlags.cs' },
          { key: 'intro_blurb', label: 'Bio-Clearance Cert-Wafer 1st-Intro Flavour Blurb', value: '', raylibPreset: 'comms_line', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'data/ShipSpec.cs:UndeclaredCargoBioSignature' }
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
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'REFUSALS IN C# · DESTROY UNWIRED',
          location: 'Simulation/ShipGenerator.cs:1034-1037 · GameState.cs:546'
        },
        raylibPreset: 'comms_line',
        hint: 'Day 22 (dayUnlockHostilityDestroy) + rep <= -9 triggers outright shield/weapon compliance refusal in ShipGenerator.cs:1034-1037. KordaniDestroyOverrideUnlocked flag exists in GameState.cs:546 (stub).',
        inGameContext: {
          before: 'Day >= 22 (DayUnlockHostilityDestroy) and factionRep <= -9 -> Officer issues "Shields down, please." or "Power down weapons."',
          thisLine: 'CAPT: "{RefusalLine}" -> [SYS] COMPLIANCE REFUSAL VERIFIED. (Marks ProtocolReviewVerified = true and skips download).',
          after: 'Player pulls Detain Lever (or pairs ViewportShipHull -> > BOOTH 04: "Protocol discrepancy verified on your vessel.").'
        },
        fields: [
          { key: 'notice', label: 'Brief Security Addendum / MESSAGES Notice', value: '', raylibPreset: 'morning_directive', currentlyInGame: '[NOT WIRED IN C# YET — No Day 22 addendum email/directive exists yet]', currentSource: 'data/Day2And3ScriptedDialogue.cs' },
          { key: 'refusals', label: 'Defiant Captain Shield/Weapon Refusal Lines (rep <= -9 — ShipGenerator.cs:1034-1037)', value: '', raylibPreset: 'comms_line', currentlyInGame: 'KRW-: "A Krushvak warship does not strip its defenses for a Pact tollbooth! Clear us or clamp us!"\nKDF-: "Negative, Booth 04! Under patrol directive we keep tactical systems hot. Do not test us!"\nPRJ-: "Uh, power switches are rusted welded shut! Cannot turn off! Just let us dock anyway!"\nDefault: "Negative, Booth 04! We are not dropping our defenses in this sector. Open the gate or lock clamps!"', currentSource: 'Simulation/ShipGenerator.cs:1034-1037' },
          { key: 'destroy_react', label: 'Last-Second Destroy Override Comms Reactions', value: '', raylibPreset: 'comms_line', currentlyInGame: '[NOT WIRED IN C# YET — GameState.QuestFlags.KordaniDestroyOverrideUnlocked at GameState.cs:546 is an unimplemented stub]', currentSource: 'Core/GameState.cs:546' }
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
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'Core/ConfigFlags.cs:dayUnlockTransitPass · data/ShipSpec.cs:InvalidBrengopTransitPass'
        },
        raylibPreset: 'morning_directive',
        hint: 'Brengop Mercantile Consortium flexing commercial toll authority right before the Day 26 Pact Climax. Config key dayUnlockTransitPass exists in data/config.json (unused at runtime).',
        fields: [
          { key: 'directive', label: 'Day 24 Morning Directive', value: '', raylibPreset: 'morning_directive', currentlyInGame: '[NOT WIRED IN C# YET — ConfigFlags.dayUnlockTransitPass is deserialized in data/config.json but unused at runtime]', currentSource: 'Core/ConfigFlags.cs' },
          { key: 'intro_blurb', label: 'Brengop Transit Pass 1st-Intro Flavour Blurb', value: '', raylibPreset: 'comms_line', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'data/ShipSpec.cs:InvalidBrengopTransitPass' }
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
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'Core/ConfigFlags.cs:dayPactClimax (default 26)'
        },
        raylibPreset: 'talking_head_hail',
        hint: 'Live clash between Kordani martial law and Brengop infrastructure protection over a battle-damaged uncalibrated KDF- Battle Cruiser. Config key dayPactClimax exists in data/config.json (unused at runtime).',
        fields: [
          { key: 'vorst_order', label: 'Commander Vorst Live Hail (ordering clearance regardless of calibration)', value: '', raylibPreset: 'talking_head_hail', currentlyInGame: '[NOT WIRED IN C# YET — ConfigFlags.dayPactClimax exists in data/config.json but encounter is not scripted in C# yet]', currentSource: 'Core/ConfigFlags.cs:dayPactClimax' },
          { key: 'brengop_counter', label: 'Brengop Priority Counter-Order (demanding Detain to protect Stoker)', value: '', raylibPreset: 'talking_head_hail', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'Core/ConfigFlags.cs:dayPactClimax' },
          { key: 'cruiser_react', label: 'Battle Cruiser Captain Reactions (Choice A Clear / Choice B Detain / Choice C Spoof)', value: '', raylibPreset: 'comms_line', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'Core/ConfigFlags.cs:dayPactClimax' }
        ]
      }
    ],

    forumThreads: [...liveForumThreads, ...designForumThreads],

    mainPaths: [
      {
        id: 'path_a',
        group: 'Five Main Campaign Paths & Climax Bridge',
        title: 'Path A — Galactic Union ("The Extraction" / Across the Line)',
        day: 'Days 9–28',
        sortDay: 9,
        category: 'Galactic Union Arc',
        done: false,
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'PARTIALLY WIRED (TRUST IN JSON · ENDING UNWIRED)',
          location: 'data/covert_missions.json (grantDoubleAgentTrust) · GameState.cs:515'
        },
        raylibPreset: 'comms_line',
        hint: 'Day 9 Ghost (not implemented in C# yet), grantDoubleAgentTrust missions in data/covert_missions.json (intercept_op_01 & slate_bus_mission_02), PathA_AcrossTheLine flag in GameState.cs:515.',
        currentlyInGame: 'data/placeholders_todo.json:10: "Across the Line (5 covert double-agent objectives; 3 of 5 required)"\ndata/covert_missions.json: intercept_op_01 (Day 7 BMC-) and slate_bus_mission_02 (Day 14 FTC-408-M) set grantDoubleAgentTrust: true.\nDay 9 Ghost & PathA_AcrossTheLine ending trigger: NOT IMPLEMENTED in C# yet.',
        currentSource: 'data/placeholders_todo.json:10 & Core/GameState.cs:515',
        fields: [
          { key: 'd9_ghost', label: 'Day 9 Beat 1 — "The Concord-Era Ghost" (Scorched GUV-, 20-yr expired EXP: CYC, disoriented dialogue)', value: '', currentlyInGame: '[NOT IMPLEMENTED IN C# OR JSON — Section 1 & Section 3.4 audit confirm zero code references to Day 9 Ghost]', currentSource: 'Simulation/ShipGenerator.cs' },
          { key: 'd10_dip', label: 'Day 10 Beat 2 — Modern GUV- Diplomat (Branch A Spared 1/3 Trust vs. Branch B Detained 0/3 Trust)', value: '', currentlyInGame: '[NOT IMPLEMENTED IN C# YET]', currentSource: 'Core/GameState.cs:515' },
          { key: 'm1', label: 'GU Covert Mission 1 (Currently in covert_missions.json: intercept_op_01 Day 7 BMC-)', value: '', currentlyInGame: 'covert_missions.json intercept_op_01: "[PLACEHOLDER INT-01] CONSORTIUM FREIGHT TELEMETRY" (GALACTIC UNION HANDLER [TODO], +50 SC, grantDoubleAgentTrust: true)', currentSource: 'data/covert_missions.json:51-72' },
          { key: 'm2', label: 'GU Covert Mission 2 (Currently in covert_missions.json: slate_bus_mission_02 Day 14 FTC-408-M)', value: '', currentlyInGame: 'covert_missions.json slate_bus_mission_02: "[PLACEHOLDER OP-02] UNION LISTENING POST PACKET" (GU HANDLER [TODO], +55 SC, grantDoubleAgentTrust: true)', currentSource: 'data/covert_missions.json:74-95' },
          { key: 'm3', label: 'GU Covert Mission 3 (Suggested: Day 23 Breather)', value: '', currentlyInGame: '[NOT IN data/covert_missions.json YET]', currentSource: 'data/covert_missions.json' },
          { key: 'exposure', label: 'Kordani Double-Agent Exposure / Failure Trigger', value: '', currentlyInGame: 'Currently Kordani sleep raid (RaidController.cs) triggers Fail_SecurityDetainment if caught with contraband or unscrubbed logs.', currentSource: 'Simulation/RaidController.cs:44-192' }
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
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'data/placeholders_todo.json:11 · Core/GameState.cs:516'
        },
        hint: 'Day 1 Vorst (authored), Day 4 Vorst (authored), plus 3 Kordani Security milestones leading to Day 26 Choice A.',
        currentlyInGame: 'data/placeholders_todo.json:11: "[TODO: Author 5 Kordani Security quest milestones for The Kordani Coup]"\nCore/GameState.cs:516: EndingFlags.PathB_TheKordaniCoup (unimplemented stub).',
        currentSource: 'data/placeholders_todo.json:11 & Core/GameState.cs:516',
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
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'data/placeholders_todo.json:12 · Core/GameState.cs:517'
        },
        hint: 'Day 1 Contract #884-D, Day 2 & 8 Regeer Nixa (authored), Day 15 Nixa Stoker Hail (TODO pass), plus Brengop Factor milestones.',
        currentlyInGame: 'data/placeholders_todo.json:12: "[TODO: Author Brengop Mercantile quest milestones for The Buyout]"\nCore/GameState.cs:517: EndingFlags.PathC_TheBuyout (unimplemented stub).',
        currentSource: 'data/placeholders_todo.json:12 & Core/GameState.cs:517',
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
        title: 'Path D — The Masters / Dopples ("The Hollow Gate" / The Quiet Return)',
        day: 'Days 17–28',
        sortDay: 17,
        category: 'Dopple Shadow Arc',
        done: false,
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'data/placeholders_todo.json:13 · Core/GameState.cs:518'
        },
        hint: 'Day 8 Nixa Dopple rumour drop (authored in Day2And3ScriptedDialogue.cs:55-64) -> Day 19/21 Mirror Captain -> shadow arc.',
        currentlyInGame: 'data/placeholders_todo.json:13: "[TODO: Author Masters/Dopples discovery triggers and quest milestones for The Quiet Return]"\nCore/GameState.cs:518: EndingFlags.PathD_TheQuietReturn (unimplemented stub).',
        currentSource: 'data/placeholders_todo.json:13 & Core/GameState.cs:518',
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
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'SPEC IN JSON · ENDING UNWIRED',
          location: 'data/placeholders_todo.json:14 · Core/ConfigFlags.cs:independentPassageFundTarget (1000)'
        },
        hint: '1,000 SC tunable live PactScrip (ConfigFlags.independentPassageFundTarget = 1000) + >= +6 rep with FTV- or FTC-.',
        currentlyInGame: 'data/placeholders_todo.json:14: "Out into the Dark (1,000 SC live Pact Scrip balance + FTV-/FTC- rep_score >= +6)"\nCore/GameState.cs:519: EndingFlags.PathE_OutIntoTheDark (unimplemented stub).',
        currentSource: 'data/placeholders_todo.json:14 & Core/GameState.cs:519',
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
        sourceBadge: {
          kind: 'NOT_WIRED',
          label: 'NOT WIRED IN C# YET',
          location: 'Core/ConfigFlags.cs:dayPactClimax'
        },
        hint: 'Explains why a pre-loaded sealed Mission Slate appears in your 0500 Chute on Day 26 morning to spoof cruiser calibration safely.',
        currentlyInGame: '[NOT WIRED IN C# YET]',
        currentSource: 'Core/ConfigFlags.cs:dayPactClimax',
        fields: [
          { key: 'sender', label: 'Who Drops the Slate & Unlock Prerequisite (Path A, Path D, or DECK 4 standing?)', value: '' },
          { key: 'email', label: 'Day 25 Evening / Day 26 Morning MESSAGES Hook Email', value: '', raylibPreset: 'email_body' }
        ]
      }
    ],

    quests: [
      ...liveCovertMissionQuests,
      {
        id: 'rf_mng',
        group: 'Recurring Faces',
        category: 'Recurring Faces',
        title: 'Face 1 — Exhausted MNG- Ore Pilot (-> Day 16 The Ore Skim)',
        day: 'Days 5–16',
        sortDay: 5,
        status: 'KEEP',
        done: false,
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'No quests.json loader in C#' },
        currentlyInGame: '[NOT WIRED IN C# YET — Currently only Commander Vorst, Regeer Nixa, and Day 6 "A friend" (RELAY_D4) are implemented recurring contacts in C#.]',
        currentSource: 'Section 3.4 Audit (Quests & Recurring Faces)',
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
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'No quests.json loader in C#' },
        currentlyInGame: '[NOT WIRED IN C# YET]',
        currentSource: 'Section 3.4 Audit',
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
        title: "Face 3 — Superstitious ORN- Rim Trader (-> Day 22 Starving Colony's Seed Bank)",
        day: 'Days 7–22',
        sortDay: 7,
        status: 'KEEP',
        done: false,
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'No quests.json loader in C#' },
        currentlyInGame: '[NOT WIRED IN C# YET]',
        currentSource: 'Section 3.4 Audit',
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
        title: "Core Quest 4 — The Stranded Mechanic's Sister (Day 14 Payoff)",
        day: 'Days 5–14',
        sortDay: 14,
        status: 'KEEP',
        done: false,
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'No quests.json loader in C#' },
        currentlyInGame: '[NOT WIRED IN C# YET]',
        currentSource: 'Section 3.4 Audit',
        hint: 'FORUM buildup Days 5–13 -> Day 14 beat-up FTV- arrives with expired EXP: CYC (Clear -> +45 SC chute drop; Detain -> bitter posts).',
        fields: [
          { key: 'dm', label: "Mechanic's Direct Message / Plea (Day 13/14)", value: '' },
          { key: 'sister', label: "Sister's Booth 04 Arrival & Expired EXP: CYC Excuse", value: '' },
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
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'No quests.json loader in C#' },
        currentlyInGame: '[NOT WIRED IN C# YET]',
        currentSource: 'Section 3.4 Audit',
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
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'No quests.json loader in C#' },
        currentlyInGame: '[NOT WIRED IN C# YET]',
        currentSource: 'Section 3.4 Audit',
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
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'No quests.json loader in C#' },
        currentlyInGame: '[NOT WIRED IN C# YET]',
        currentSource: 'Section 3.4 Audit',
        hint: 'Foreshadows Day 21 Bio-Quarantine.',
        fields: [
          { key: 'notes', label: 'Arrival & Cough Comms Lines', value: '' }
        ]
      },
      {
        id: 'opt_helani',
        group: 'Optional / Secondary',
        category: 'Optional / Secondary',
        title: 'Optional 3 — Helani Courier Intercept (Stub Flag in GameState.cs:544)',
        day: 'Day 15',
        sortDay: 15,
        status: 'UNDECIDED',
        done: false,
        sourceBadge: { kind: 'NOT_WIRED', label: 'STUB FLAG IN C#', location: 'Core/GameState.cs:544 (SideQuest_HelaniCourierWarpSignature)' },
        currentlyInGame: 'Core/GameState.cs:544 defines QuestFlags["SideQuest_HelaniCourierWarpSignature"], but no encounter or trigger reads/sets it yet.',
        currentSource: 'Core/GameState.cs:544',
        hint: 'Stub flag SideQuest_HelaniCourierWarpSignature exists in GameState.cs — recipient faction, trigger day, and reward to be decided.',
        fields: [
          { key: 'notes', label: 'Details (or mark CUT to trim scope)', value: '' }
        ]
      },
      {
        id: 'opt_orn442',
        group: 'Optional / Secondary',
        category: 'Optional / Secondary',
        title: 'Optional 4 — Oruun Freighter ORN-442xxx (Stub Flag in GameState.cs:545)',
        day: 'Day 16',
        sortDay: 16,
        status: 'UNDECIDED',
        done: false,
        sourceBadge: { kind: 'NOT_WIRED', label: 'STUB FLAG IN C#', location: 'Core/GameState.cs:545 (SideQuest_OrunFreighter442)' },
        currentlyInGame: 'Core/GameState.cs:545 defines QuestFlags["SideQuest_OrunFreighter442"] (and Day 4 Vorst hail uses "ORN-442-K" / "Oruun-4" as default fallback at Day2And3ScriptedDialogue.cs:66-70).',
        currentSource: 'Core/GameState.cs:545',
        hint: 'Stub flag SideQuest_OrunFreighter442 exists in GameState.cs — quest giver, invalid fields, reward, strike impact to be decided.',
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
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'UI/QuartersScreen.cs' },
        currentlyInGame: '[NOT WIRED IN C# YET — Only 03:15 Kordani Sleep Raids (RaidController.cs) currently visit Berth 04 at night.]',
        currentSource: 'UI/QuartersScreen.cs & Simulation/RaidController.cs',
        hint: 'Decide whether to cut these (recommended to keep scope tight) or assign characters.',
        fields: [
          { key: 'notes', label: 'Decision / Notes', value: '' }
        ]
      }
    ],

    corridorPosters: [
      { id: 'poster_brengop', filename: 'corridor_poster_brengop.png', stage: 'Stage 1–4', headline: '', body: '', done: false, hint: 'Brengop Mercantile Consortium Berth-Debt Compliance / Productivity poster (sickly-yellow industrial tone).', currentlyInGame: 'Wall poster (72x48px, UI/CorridorScreen.cs:249-250 when brengopDebtNotice == true): "BMC NOTICE" / "LEASE DUE" (Note: "BMC NOTICE" overflows 72px at +3 font offset; no zoomable modal implemented yet).', currentSource: 'UI/CorridorScreen.cs:249-250', sourceBadge: { kind: 'NOT_WIRED', label: 'MODAL NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs:249-250' } },
      { id: 'poster_kordani', filename: 'corridor_poster_kordani.png', stage: 'Stage 2–4', headline: '', body: '', done: false, hint: 'Kordani Martial Security / /3 Strikes Bulletin.', currentlyInGame: '[NOT WIRED IN C# YET — CorridorScreen.cs is currently a 2.6s animated 21:9 transit strip without zoomable poster modals]', currentSource: 'UI/CorridorScreen.cs', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs' } },
      { id: 'poster_ftc', filename: 'corridor_poster_ftc.png', stage: 'Stage 1', headline: '', body: '', done: false, hint: 'Scraped-over old Far-Line Transit Corp (FTC-) safety sign with Brengop stickers slapped on top.', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'UI/CorridorScreen.cs', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs' } },
      { id: 'poster_bio', filename: 'corridor_poster_bio.png', stage: 'Day 21+ (Stage 3)', headline: '', body: '', done: false, hint: 'Day 21 Bio-Quarantine / Ashen Spores & Silt Worms advisory.', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'UI/CorridorScreen.cs', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs' } },
      { id: 'poster_surge', filename: 'corridor_poster_surge.png', stage: 'Days 25–27', headline: '', body: '', done: false, hint: 'Cruiser Surge / Emergency Lockdown or Reserve Vault notice.', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'UI/CorridorScreen.cs', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs' } },
      { id: 'poster_deck4', filename: 'corridor_poster_deck4.png', stage: 'Stage 2–3', headline: '', body: '', done: false, hint: 'Unofficial Deck 4 graffiti / whispered union or Red-Wash flyer.', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'UI/CorridorScreen.cs', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs' } }
    ],

    corridorBarks: [
      { id: 'bark_s1', label: 'Stage 1 (Days 1–6: Mundane Friction — Deck 4 Workers & Off-Duty Pilots)', stage: 'Stage 1', lines: ['', '', ''], done: false, currentlyInGame: 'Hardcoded Transit Banner Subtitles (UI/CorridorScreen.cs:282-287, 540x74px box):\n4. Default: "VOID GATE 3 // HABITAT RING B ACCESS CORRIDOR"\nTop Letterbox (:309): "DAY {Day:D2} // MORNING TRANSIT  |  SCRIP: {PactScrip} SC  |  POCKET: {Count}/{Cap}"\n(Overhead NPC bark bubbles not implemented in CorridorScreen.cs yet)', currentSource: 'UI/CorridorScreen.cs:274-314', sourceBadge: { kind: 'NOT_WIRED', label: 'BARKS NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs:282-287' } },
      { id: 'bark_s2', label: 'Stage 2 (Days 7–18: Open Turf War — Kordani Sentries & Brengop Clerks)', stage: 'Stage 2', lines: ['', '', ''], done: false, currentlyInGame: 'Hardcoded Transit Banner Subtitle #3 (UI/CorridorScreen.cs:286): "BRENGOP NOTICE: HABITAT LEASE AUDIT IN EFFECT"', currentSource: 'UI/CorridorScreen.cs:286', sourceBadge: { kind: 'NOT_WIRED', label: 'BARKS NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs:286' } },
      { id: 'bark_s3', label: 'Stage 3 (Days 19–25: Climax Foreshadowing — Quarantine & Outer-Buoy Rumours)', stage: 'Stage 3', lines: ['', '', ''], done: false, currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'UI/CorridorScreen.cs', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs' } },
      { id: 'bark_s4', label: 'Stage 4 (Days 27–28: Post-Climax Fallout)', stage: 'Stage 4', lines: ['', ''], done: false, currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'UI/CorridorScreen.cs', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'UI/CorridorScreen.cs' } },
      { id: 'bark_brownout', label: 'Post-Brownout Morning Reactions (NextDayPowerBrownout == true)', stage: 'Dynamic (Day 16+)', lines: ['', ''], done: false, currentlyInGame: 'Hardcoded Transit Banner Subtitle #1 (UI/CorridorScreen.cs:282): "ALERT: STELLAR STOKER GRID UNSTABLE -- CORRIDOR LIGHTS FLICKERING" (65 chars -> ~618px at +3 font offset, overflowing the 540px banner!)', currentSource: 'UI/CorridorScreen.cs:282', sourceBadge: { kind: 'HARDCODED_CS', label: 'BANNER IN C# (OVERFLOWS @ +3)', location: 'UI/CorridorScreen.cs:282' } },
      { id: 'bark_audit', label: 'Post-Berth-Audit Morning Reactions (Overnight Kordani Sweep)', stage: 'Dynamic (Day 4+)', lines: ['', ''], done: false, currentlyInGame: 'Hardcoded Transit Banner Subtitle #2 (UI/CorridorScreen.cs:284): "SECURITY NOTICE: KORDANI GARRISON PATROLS ACTIVE ON RING B"', currentSource: 'UI/CorridorScreen.cs:284', sourceBadge: { kind: 'HARDCODED_CS', label: 'BANNER IN C#', location: 'UI/CorridorScreen.cs:284' } }
    ],

    starChart: [
      { id: 'VG-3', name: 'Void Gate 3 (VG-3)', faction: '', tags: '', exports: '', done: false, currentlyInGame: 'node.faction: "[TODO]" (Renders literal "[TODO]" live!) | node.tag: "[TODO]" (Renders literal "[TODO]" live!) | Connected inner routes (r47..r52): export: "[TODO]"', currentSource: 'data/sector_map.json & UI/StarChartModal.cs:274-293', sourceBadge: { kind: 'LIVE_JSON', label: 'LIVE JSON [LIVE TODO LEAK]', location: 'data/sector_map.json · VG-3' } },
      { id: 'Gharok', name: 'Gharok', faction: 'Krushvak', tags: '', exports: '', done: false, currentlyInGame: 'node.faction: "Krushvak" [AUTHORED] | node.tag: "[TODO]" (Renders literal "[TODO]" live!) | route export: "[TODO]"', currentSource: 'data/sector_map.json & UI/StarChartModal.cs:274-293', sourceBadge: { kind: 'LIVE_JSON', label: 'LIVE JSON [TAG/EXPORT TODO]', location: 'data/sector_map.json · Gharok' } },
      { id: 'Veridia', name: 'Veridia', faction: 'GU', tags: '', exports: '', done: false, currentlyInGame: 'node.faction: "GU" [AUTHORED] | node.tag: "[TODO]" (Renders literal "[TODO]" live!) | route export: "[TODO]"', currentSource: 'data/sector_map.json & UI/StarChartModal.cs:274-293', sourceBadge: { kind: 'LIVE_JSON', label: 'LIVE JSON [TAG/EXPORT TODO]', location: 'data/sector_map.json · Veridia' } },
      { id: 'Oruun-4', name: 'Oruun-4', faction: 'Independent', tags: '', exports: '', done: false, currentlyInGame: 'node.faction: "Independent" [AUTHORED] | node.tag: "[TODO]" (Renders literal "[TODO]" live!) | route export: "[TODO]"', currentSource: 'data/sector_map.json & UI/StarChartModal.cs:274-293', sourceBadge: { kind: 'LIVE_JSON', label: 'LIVE JSON [TAG/EXPORT TODO]', location: 'data/sector_map.json · Oruun-4' } },
      { id: 'Ash', name: 'The Ashen Rift (Ash)', faction: 'Unclaimed', tags: '', exports: '', done: false, currentlyInGame: 'node.faction: "Unclaimed" [AUTHORED] | node.tag: "[TODO]" (Renders literal "[TODO]" live!) | route export: "[TODO]"', currentSource: 'data/sector_map.json & UI/StarChartModal.cs:274-293', sourceBadge: { kind: 'LIVE_JSON', label: 'LIVE JSON [TAG/EXPORT TODO]', location: 'data/sector_map.json · Ash' } },
      { id: 'Korr-Vath', name: 'Korr-Vath', faction: 'Kordani', tags: '', exports: '', done: false, currentlyInGame: 'node.faction: "Kordani" [AUTHORED] | node.tag: "[TODO]" (Renders literal "[TODO]" live!) | route export: "[TODO]"', currentSource: 'data/sector_map.json & UI/StarChartModal.cs:274-293', sourceBadge: { kind: 'LIVE_JSON', label: 'LIVE JSON [TAG/EXPORT TODO]', location: 'data/sector_map.json · Korr-Vath' } },
      { id: 'Dul-Krag', name: 'Dul-Krag', faction: 'Brengop', tags: '', exports: '', done: false, currentlyInGame: 'node.faction: "Brengop" [AUTHORED] | node.tag: "[TODO]" (Renders literal "[TODO]" live!) | route export: "[TODO]"', currentSource: 'data/sector_map.json & UI/StarChartModal.cs:274-293', sourceBadge: { kind: 'LIVE_JSON', label: 'LIVE JSON [TAG/EXPORT TODO]', location: 'data/sector_map.json · Dul-Krag' } }
    ],

    quartersMisc: [
      {
        id: 'misc_unsolicited',
        group: 'Quarters Terminal Dispatches & Audits',
        title: 'Day 2+ Morning Port Traffic Roster & Unsolicited Faction Recognition Emails',
        day: 'Day 2+ / Dynamic',
        sortDay: 2,
        category: 'Terminal Dispatches',
        done: false,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'ROSTER IN C# · PRAISE/WARN UNWIRED',
          location: 'Simulation/EconomyEngine.cs:718-750'
        },
        raylibPreset: 'email_body',
        hint: 'Day 2+ Morning Port Traffic Roster is hardcoded in EconomyEngine.cs:718-750. Unsolicited faction recognition / citation emails are not wired in C# yet.',
        fields: [
          { key: 'bmc_praise', label: 'Brengop Throughput Praise / Lease Discount Hook', value: '', raylibPreset: 'email_body', currentlyInGame: '[NOT WIRED IN C# YET — No unsolicited praise or citation emails exist in EconomyEngine.cs yet]', currentSource: 'Simulation/EconomyEngine.cs' },
          { key: 'kdf_warn', label: 'Quiet Kordani Leniency Warning', value: '', raylibPreset: 'email_body', currentlyInGame: '[NOT WIRED IN C# YET]', currentSource: 'Simulation/EconomyEngine.cs' },
          {
            key: 'roster_headers',
            label: 'Morning Ship Roster Template (EconomyEngine.cs:718-750)',
            value: `VOID GATE 3 // ADVANCE TRAFFIC ROSTER -- DAY {state.Day:D2}\nCYCLE {cy}.{cm} // AUTOMATED 05:00 DISPATCH\n--------------------------------------------------------\nADVANCE-FILED VESSELS EXPECTED IN SECTOR QUEUE (10):\n\n{01..10}. {RegistrationCode,-11} | {ShipClassCode,-3} | {ShipName}\n    ORG: {OrganizationName}\n\nNOTICE: ADVANCE FILINGS DO NOT GUARANTEE COMPLIANCE.\nONLY A SUBSET WILL REACH BOOTH 04 DURING YOUR {watchSeconds}s WATCH.\nDETAIN ANY ROSTERED VESSEL CARRYING PROTOCOL VIOLATIONS.`,
            raylibPreset: 'email_body',
            currentlyInGame: 'Sender: "VG-3 PORT TRAFFIC CONTROL" | Subject: "PORT TRAFFIC ROSTER // DAY {Day:D2}" | Timestamp: "CYC {cy}.{cm} // 05:00"',
            currentSource: 'Simulation/EconomyEngine.cs:718-750'
          }
        ]
      },
      {
        id: 'misc_audits',
        group: 'Quarters Terminal Dispatches & Audits',
        title: '03:15 2-Tier Sleep Berth Audit & Stoker Sabotage Audit Modal Lines',
        day: 'Day 4+ / Day 15+',
        sortDay: 4,
        category: 'Overnight Audits',
        done: false,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C#',
          location: 'Simulation/RaidController.cs:44-192 · UI/QuartersScreen.cs:2171-2197'
        },
        raylibPreset: 'raid_audit_modal',
        hint: 'Overnight Kordani raids when hitting 3/3 Strikes or overloading the Stellar Stoker. Rendered inside the 832x512 Sleep Raid Audit Modal (756px inner, max 11 single-line log entries, ~79 chars/line @ +3).',
        fields: [
          { key: 'tier1_clean', label: 'Tier 1 Coat Frisk & Clean Terminal Check (Clean-Audit Fine -40 SC)', value: '', raylibPreset: 'raid_audit_modal', currentlyInGame: 'Header: "03:15 WAKE-UP RAID // KORDANI TWO-TIER 3-STRIKE BERTH AUDIT"\nWarrant: "KORDANI SECURITY RAID // 3-STRIKE BERTH WARRANT (STRIKES: {SecurityStrikes}/{MaxStrikesBeforeAudit})"\nVerdict: "[VERDICT] CLEAN AUDIT -- STRIKES RESET TO 0."\nFee: "[ADMIN FEE] CLEAN-AUDIT FINE: -{cleanAuditFine} SC  |  KDF REP {repDelta}"', currentSource: 'Simulation/RaidController.cs:44-192 & QuartersScreen.cs:2171-2197' },
          { key: 'tier2_vent', label: 'Tier 2 Unscrubbed Logs -> Deep Vent Sweep (Discovery / Detainment)', value: '', raylibPreset: 'raid_audit_modal', currentlyInGame: '[TIER 2 // TERMINAL LOGS] -> Dirty logs trigger [TIER 2 // DEEP SWEEP] breaching vent -> "[VERDICT] SEVERE CONTRABAND PENALTY -- {caughtReason}." -> Triggers Fail_SecurityDetainment.', currentSource: 'Simulation/RaidController.cs:44-192' },
          { key: 'stoker_raid', label: 'Stellar Stoker Overload Sabotage Audit Dialogue (0 Strikes)', value: '', raylibPreset: 'raid_audit_modal', currentlyInGame: 'Header: "03:15 WAKE-UP RAID // KORDANI STELLAR STOKER SABOTAGE AUDIT"\nWarrant: "KORDANI SABOTAGE RAID // STELLAR STOKER OVERLOAD WARRANT (+0 STRIKES)"\nClean Verdict: "[VERDICT] SABOTAGE AUDIT CLEAN -- NO EVIDENCE OF ORBITAL TAMPERING (+0 STRIKES)."', currentSource: 'Simulation/RaidController.cs:44-192 & QuartersScreen.cs:2171-2197' }
        ]
      },
      {
        id: 'misc_tutorials',
        group: 'Quarters Terminal Dispatches & Audits',
        title: 'Playtest Tutorial Cards -> Diegetic Tutorial Nudges (UI/TutorialOverlay.cs)',
        day: 'Days 1–21',
        sortDay: 1,
        category: 'Diegetic Tutorials',
        done: false,
        sourceBadge: {
          kind: 'HARDCODED_CS',
          label: 'HARDCODED C# [6 PLAYTEST CARDS]',
          location: 'UI/TutorialOverlay.cs:252-381'
        },
        raylibPreset: 'comms_line',
        hint: 'TutorialOverlay.cs:6-12 notes these 6 [PLAYTEST] cards are temporary and designed to be replaced with in-character comms/nudges.',
        fields: [
          { key: 'quarters', label: 'Quarters Nudges (Replacing OnFirstMorningQuarters & OnFirstEveningQuarters [PLAYTEST] cards)', value: '', raylibPreset: 'comms_line', currentlyInGame: 'Card 5 (:320-337): "MORNING QUARTERS // PRE-SHIFT PREPARATION [PLAYTEST]" (Terminal + Day 2+ 10-ship Roster, 0500 Chute / Coat / Vent, Left-wall Door)\nCard 6 (:339-360): "EVENING QUARTERS // SURVIVAL, INTEL & SLEEP [PLAYTEST]" (PACT REQ flat-SC rations, MESSAGES/FORUM or CRYPTO/DECK 4, Bed sleep & Two-Tier Raid)', currentSource: 'UI/TutorialOverlay.cs:320-360' },
          { key: 'desk', label: 'Desk Hardware Nudges (Replacing OnDay1Start, OnDay2Start, OnDay3Start D4–14 & D15+ [PLAYTEST] cards)', value: '', raylibPreset: 'comms_line', currentlyInGame: 'Card 1 (:282-299): "DAY 01 RULES & CONTROLS // BOOTH 04 ORIENTATION [PLAYTEST]"\nCard 2 (:301-318): "DAY 02-03 RULES & CONTROLS // SPS PROBE & AUTO-WEAPONS [PLAYTEST]"\nCard 3 (:362-380): "DAY 04 RULES & CONTROLS // STRIKES & GLOWING WARP CHECKER [PLAYTEST]"\nCard 4 (:258-278): "DAY 15 RULES & CONTROLS // STELLAR STOKER & ACTIVE CHECKS [?]"', currentSource: 'UI/TutorialOverlay.cs:258-380' }
        ]
      }
    ],

    endings: [
      { id: 'end_a', title: 'Path A — Galactic Union ("The Extraction" / Across the Line)', day: 'Day 28', category: 'Main Ending', trigger: '3/3 GU Trust -> Day 28 weathered GUV- cargo runner escape showing VG-3 & Brown Dwarf shrinking.', text: '', done: false, raylibPreset: 'victory_ending_card', currentlyInGame: '[NOT IMPLEMENTED IN C# YET — GameState.EndingFlags.PathA_AcrossTheLine at GameState.cs:515 is unwired; advancing past Day 28 clamps back to Day 28 Morning at GameState.cs:817.]', currentSource: 'Core/GameState.cs:515, 817', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'Core/GameState.cs:515, 817' } },
      { id: 'end_b', title: 'Path B — Kordani ("The Iron Collar" / The Kordani Coup)', day: 'Day 28', category: 'Main Ending', trigger: 'Kordani arc + Day 26 Choice A (Clear Battle Cruiser).', text: '', done: false, raylibPreset: 'victory_ending_card', currentlyInGame: '[NOT IMPLEMENTED IN C# YET — GameState.EndingFlags.PathB_TheKordaniCoup at GameState.cs:516 is unwired.]', currentSource: 'Core/GameState.cs:516', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'Core/GameState.cs:516' } },
      { id: 'end_c', title: 'Path C — Brengop ("The Company Man" / The Buyout)', day: 'Day 28', category: 'Main Ending', trigger: 'Brengop Factor arc + Day 26 Choice B (Detain Battle Cruiser) -> ZNI- luxury liner buyout.', text: '', done: false, raylibPreset: 'victory_ending_card', currentlyInGame: '[NOT IMPLEMENTED IN C# YET — GameState.EndingFlags.PathC_TheBuyout at GameState.cs:517 is unwired.]', currentSource: 'Core/GameState.cs:517', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'Core/GameState.cs:517' } },
      { id: 'end_d', title: 'Path D — The Masters / Dopples ("The Hollow Gate" / The Quiet Return)', day: 'Day 28', category: 'Main Ending (Dual Epilogue)', trigger: 'Dual epilogue: (1) Forged GU identity escape OR (2) Staying to run their shadow gate.', text: '', done: false, raylibPreset: 'victory_ending_card', currentlyInGame: '[NOT IMPLEMENTED IN C# YET — GameState.EndingFlags.PathD_TheQuietReturn at GameState.cs:518 is unwired.]', currentSource: 'Core/GameState.cs:518', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'Core/GameState.cs:518' } },
      { id: 'end_e', title: 'Path E — Independent Escape ("Out into the Dark")', day: 'Day 28', category: 'Main Ending', trigger: '1,000 SC live PactScrip + >= +6 rep with FTV- or FTC- -> Smuggled out by friendly captain.', text: '', done: false, raylibPreset: 'victory_ending_card', currentlyInGame: '[NOT IMPLEMENTED IN C# YET — GameState.EndingFlags.PathE_OutIntoTheDark at GameState.cs:519 is unwired.]', currentSource: 'Core/GameState.cs:519', sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'Core/GameState.cs:519' } },
      { id: 'end_fail_sec', title: 'Failure Ending 1 — Security Detainment (Fail_SecurityDetainment)', day: 'Any Day (3 Strikes)', category: 'Failure Ending', trigger: 'Caught with contraband / unscrubbed treason during 3-Strike Kordani Berth Audit.', text: '', done: false, raylibPreset: 'failure_ending_card', currentlyInGame: 'Title (@20px): "FAILURE ENDING // SECURITY DETAINMENT"\nBody 1 (@10px, 86 chars — OVERFLOWS 720px box at +3 font offset!): "KORDANI SECURITY TROOPERS BREACHED BERTH 04 AIRLOCK AFTER SEIZING CONTRABAND / LOGS."\nBody 2 (@10px, 75 chars): "PORT OFFICER CREDENTIALS REVOKED. TRANSFERRED TO KORR-VATH DETENTION BLOCK."\nFooter: "FINAL RECORD: DAY {Day:D2}  |  SCRIP: {PactScrip} SC  |  STRIKES: {SecurityStrikes}/{MaxStrikesBeforeAudit}"', currentSource: 'UI/QuartersScreen.cs:2202-2228', sourceBadge: { kind: 'HARDCODED_CS', label: 'HARDCODED C# (OVERFLOWS @ +3)', location: 'UI/QuartersScreen.cs:2216' } },
      { id: 'end_fail_debt', title: 'Failure Ending 2 — Debt Foreclosure (Fail_DebtForeclosure)', day: 'Any Day (Debt Default)', category: 'Failure Ending', trigger: 'Two missed nights of 30 SC Berth Lease triggers Brengop Mercantile foreclosure.', text: '', done: false, raylibPreset: 'failure_ending_card', currentlyInGame: 'Title (@20px): "FAILURE ENDING // DEBT FORECLOSURE"\nBody 1 (@10px, 74 chars): "TWO MISSED NIGHTS OF BERTH LEASE TRIGGERED BRENGOP MERCANTILE FORECLOSURE."\nBody 2 (@10px, 72 chars): "PORT OFFICER BADGE STRIPPED. PERMANENTLY REASSIGNED TO LOWER REACTOR DECKS."\nLedgerOverlay.cs:260,269 banners: "DEBT FORECLOSURE" / "BADGE REVOKED: PERMANENT REASSIGNMENT TO LOWER REACTOR DECKS."', currentSource: 'UI/QuartersScreen.cs:2202-2228 & UI/LedgerOverlay.cs:260, 269', sourceBadge: { kind: 'HARDCODED_CS', label: 'HARDCODED C#', location: 'UI/QuartersScreen.cs:2220-2225' } }
    ]
  };
}

// ---------- TEXT & STATUS HELPERS ----------

export function hasText(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  const trimmed = v.trim();
  return trimmed.length > 0 && !trimmed.toUpperCase().startsWith('[TODO');
}

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
  return hasText(p.headline) || hasText(p.body) ? 'DRAFT' : 'TODO';
}

export function getBarkStatus(b: CorridorBark): WritingStatus {
  if (b.done) return 'DONE';
  return b.lines.some(hasText) ? 'DRAFT' : 'TODO';
}

export function getStarChartStatus(s: StarChartSystem): WritingStatus {
  if (s.done) return 'DONE';
  return hasText(s.tags) || hasText(s.exports) ? 'DRAFT' : 'TODO';
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
  factionPoolsLiveSlots: {
    totalSlots: number;
    authoredSlots: number;
    todoSlots: number;
  };
}

export function calcFactionStats(state: WorkbenchState, code: string): TabStat {
  const p = state.factionPools[code];
  const flags = p.doneFlags || {};
  let total = 0,
    done = 0,
    draft = 0,
    todo = 0;

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
  let fTot = 0,
    fDone = 0,
    fDraft = 0,
    fTodo = 0;
  FACTIONS.forEach(f => {
    const s = calcFactionStats(state, f.code);
    fTot += s.total;
    fDone += s.done;
    fDraft += s.draft;
    fTodo += s.todo;
  });
  tabs.factions = { total: fTot, done: fDone, draft: fDraft, todo: fTodo };

  // Also calculate exact individual slot counts for the 1-to-1 faction_pools.json schema (Section 5.3)
  let fpTotalSlots = 0;
  let fpAuthoredSlots = 0;
  FACTIONS.forEach(f => {
    const p = state.factionPools[f.code];
    const countSlots = (arr: string[], minSlots: number) => {
      const len = Math.max(minSlots, (arr || []).length);
      for (let i = 0; i < len; i++) {
        fpTotalSlots++;
        if (hasText(arr?.[i])) fpAuthoredSlots++;
      }
    };
    countSlots(p.greetings, 3);
    LIVE_JSON_EXCUSE_KEYS.forEach(ek => {
      const minLen = (f.code === 'FTV-' || f.code === 'MNG-') && ek.key === 'General' ? 3 : 2;
      countSlots(p.excuses[ek.key] || [], minLen);
    });
    const detMin = f.code === 'FTV-' || f.code === 'MNG-' ? 3 : 2;
    countSlots(p.detentionReactions, detMin);
    countSlots(p.recentCallbacks.ClearedViolation, 2);
    countSlots(p.recentCallbacks.RepeatedDetentions, 2);
    countSlots(p.recentCallbacks.TookBribe, 2);
  });

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

  let allTot = 0,
    allDone = 0,
    allDraft = 0,
    allTodo = 0;
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
  state.forumThreads.forEach(t => {
    countStr(t.title);
    countStr(t.body);
  });
  state.corridorPosters.forEach(p => {
    countStr(p.headline);
    countStr(p.body);
  });
  state.corridorBarks.forEach(b => b.lines.forEach(countStr));
  state.starChart.forEach(s => {
    countStr(s.faction);
    countStr(s.tags);
    countStr(s.exports);
  });
  state.endings.forEach(e => countStr(e.text));

  return {
    tabs,
    allTot,
    allDone,
    allDraft,
    allTodo,
    words,
    factionPoolsLiveSlots: {
      totalSlots: fpTotalSlots,
      authoredSlots: fpAuthoredSlots,
      todoSlots: Math.max(0, fpTotalSlots - fpAuthoredSlots)
    }
  };
}

// ---------- SAFE LOCALSTORAGE & SERVER MIGRATION ----------

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

  const validTabs = ['factions', 'core', 'forum', 'paths', 'quests', 'corridor', 'endings'];
  const activeTab = validTabs.includes(rawSaved.meta?.activeTab) ? rawSaved.meta.activeTab : 'factions';
  const rawFilter = rawSaved.meta?.filter;
  const filter =
    rawFilter === 'todo'
      ? 'unfinished'
      : ['all', 'unfinished', 'drafts', 'done'].includes(rawFilter)
      ? rawFilter
      : 'all';

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
      forumHandles:
        Array.isArray(rawSaved.meta?.forumHandles) && rawSaved.meta.forumHandles.length > 0
          ? rawSaved.meta.forumHandles
          : [...DEFAULT_FORUM_HANDLES],
      deletedQuestIds
    }
  };

  // Migrate factionPools (preserving any user edits while backfilling verbatim [AUTHORED] FTV-/MNG- defaults if saved array was blank)
  if (rawSaved.factionPools && typeof rawSaved.factionPools === 'object') {
    FACTIONS.forEach(f => {
      const src = rawSaved.factionPools[f.code];
      if (!src) return;
      const dst = out.factionPools[f.code];

      const mergeArr = (savedArr: any, defArr: string[]): string[] => {
        if (!Array.isArray(savedArr) || savedArr.length === 0) return defArr;
        const cleaned = savedArr.map(fixBmcTypo);
        const anyUserText = cleaned.some(hasText);
        // If user had an empty array and default has [AUTHORED] lines (FTV- / MNG-), backfill the authored lines without overwriting user text
        if (!anyUserText && defArr.some(hasText)) {
          return [...defArr];
        }
        return cleaned;
      };

      dst.greetings = mergeArr(src.greetings, dst.greetings);
      dst.greetingsHostile = mergeArr(src.greetingsHostile, dst.greetingsHostile);
      dst.greetingsWarm = mergeArr(src.greetingsWarm, dst.greetingsWarm);
      dst.detentionReactions = mergeArr(src.detentionReactions, dst.detentionReactions);

      if (src.excuses && typeof src.excuses === 'object') {
        EXCUSE_KEYS.forEach(ek => {
          let rawExc = src.excuses[ek.key];
          if ((!Array.isArray(rawExc) || !rawExc.some(hasText)) && ek.legacyAliases) {
            for (const alias of ek.legacyAliases) {
              if (Array.isArray(src.excuses[alias]) && src.excuses[alias].length > 0) {
                rawExc = src.excuses[alias];
                break;
              }
            }
          }
          dst.excuses[ek.key] = mergeArr(rawExc, dst.excuses[ek.key]);
        });
      }

      if (src.recentCallbacks && typeof src.recentCallbacks === 'object') {
        (['ClearedViolation', 'RepeatedDetentions', 'TookBribe'] as const).forEach(k => {
          dst.recentCallbacks[k] = mergeArr(src.recentCallbacks[k], dst.recentCallbacks[k]);
        });
      }

      if (src.doneFlags && typeof src.doneFlags === 'object') {
        dst.doneFlags = { ...dst.doneFlags, ...src.doneFlags };
      }
    });
  }

  // Helper to merge structured lists (coreItems, mainPaths, quartersMisc)
  // Preserves user edits and backfills newly added [AUTHORED] default values ONLY if saved value was empty
  const mergeStructured = (defList: CoreItem[], savedList: any[]): CoreItem[] => {
    if (!Array.isArray(savedList)) return defList;
    return defList.map(defItem => {
      const sv = savedList.find(x => x && x.id === defItem.id);
      if (!sv) return defItem;
      const fields = defItem.fields.map(df => {
        const sf = Array.isArray(sv.fields) ? sv.fields.find((x: any) => x && x.key === df.key) : null;
        if (!sf) return df;
        const savedVal = fixBmcTypo(sf.value ?? '');
        const finalVal = hasText(savedVal) ? savedVal : df.value;
        return {
          ...df,
          label: fixBmcTypo(sf.label || df.label),
          value: finalVal
        };
      });
      return {
        ...defItem,
        done: typeof sv.done === 'boolean' ? (sv.done || defItem.done) : defItem.done,
        fields
      };
    });
  };

  out.coreItems = mergeStructured(defaults.coreItems, rawSaved.coreItems);
  out.mainPaths = mergeStructured(defaults.mainPaths, rawSaved.mainPaths);
  out.quartersMisc = mergeStructured(defaults.quartersMisc, rawSaved.quartersMisc);

  // Migrate Quests: preserve custom quests & user edits, plus ensure the 5 Live Covert Missions from data/covert_missions.json are present unless explicitly deleted
  if (Array.isArray(rawSaved.quests)) {
    const isV2Saved = rawSaved.meta?.version === 2;
    const savedIds = new Set(rawSaved.quests.map((q: any) => q?.id).filter(Boolean));
    const migratedQuests: QuestItem[] = [];

    // Ensure new live covert missions (cm_*) appear if not already in savedIds and not deleted
    defaults.quests.forEach(dq => {
      if (dq.id.startsWith('cm_') && !savedIds.has(dq.id) && !deletedQuestIds.includes(dq.id)) {
        migratedQuests.push(dq);
      }
    });

    rawSaved.quests.forEach((sq: any) => {
      if (!sq || !sq.id || deletedQuestIds.includes(sq.id)) return;
      const defQ = defaults.quests.find(d => d.id === sq.id);
      const dayLabel = fixBmcTypo(sq.day ?? defQ?.day ?? 'Day 12');
      const sortDay =
        typeof sq.sortDay === 'number' && isFinite(sq.sortDay)
          ? Math.max(1, Math.min(28, sq.sortDay))
          : defQ?.sortDay ?? parseStartDayFromLabel(dayLabel, 12);
      const category = fixBmcTypo(sq.category || defQ?.category || sq.group || 'Core Side Quests');
      const fields: StructuredField[] = Array.isArray(sq.fields)
        ? sq.fields.map((f: any, idx: number) => {
            const defField = defQ?.fields.find(df => df.key === f.key) || defQ?.fields[idx];
            return {
              ...defField,
              key: f.key || defField?.key || `beat_${idx + 1}`,
              label: fixBmcTypo(f.label || defField?.label || `Beat ${idx + 1}`),
              value: fixBmcTypo(f.value ?? '')
            };
          })
        : defQ
        ? [...defQ.fields]
        : [{ key: 'beat_1', label: 'Quest Beat / Dialogue', value: '' }];

      migratedQuests.push({
        ...(defQ || {}),
        id: String(sq.id),
        group: category,
        category,
        title: fixBmcTypo(sq.title || defQ?.title || 'Untitled Quest'),
        day: dayLabel,
        sortDay,
        status: ['KEEP', 'UNDECIDED', 'CUT'].includes(sq.status) ? sq.status : defQ?.status || 'KEEP',
        done: !!sq.done,
        hint: fixBmcTypo(sq.hint ?? defQ?.hint ?? ''),
        context: sq.context ? fixBmcTypo(sq.context) : defQ?.context,
        fields
      });
    });

    if (!isV2Saved) {
      defaults.quests.forEach(dq => {
        if (!dq.id.startsWith('cm_') && !savedIds.has(dq.id) && !deletedQuestIds.includes(dq.id)) {
          migratedQuests.push(dq);
        }
      });
    }

    out.quests = migratedQuests;
  }

  // Migrate Forum Threads: preserve all saved threads & user edits, and ensure the 14 live data/forum.json threads exist
  if (Array.isArray(rawSaved.forumThreads) && rawSaved.forumThreads.length > 0) {
    const savedById = new Map<string, any>();
    rawSaved.forumThreads.forEach((t: any) => {
      if (t && t.id) savedById.set(String(t.id), t);
    });

    const mergedThreads: ForumThread[] = [];
    const seenIds = new Set<string>();

    // First include all default threads (14 live + 16 design) merged with any saved edits
    defaults.forumThreads.forEach(dt => {
      const st = savedById.get(dt.id);
      seenIds.add(dt.id);
      if (st) {
        mergedThreads.push({
          ...dt,
          stage: dt.isLiveJsonThread ? dt.stage : fixBmcTypo(st.stage || dt.stage),
          pillar: fixBmcTypo(st.pillar || dt.pillar),
          title: fixBmcTypo(st.title || dt.title),
          body: fixBmcTypo(st.body ?? dt.body),
          done: typeof st.done === 'boolean' ? st.done : dt.done
        });
      } else {
        mergedThreads.push(dt);
      }
    });

    // Then include any custom threads created by the user
    rawSaved.forumThreads.forEach((st: any, i: number) => {
      const id = String(st?.id || `f_migrated_${i}`);
      if (seenIds.has(id)) return;
      mergedThreads.push({
        id,
        stage: fixBmcTypo(st.stage || FORUM_STAGES[1]),
        pillar: fixBmcTypo(st.pillar || 'Contract Trap'),
        title: fixBmcTypo(st.title || 'Untitled Thread'),
        body: fixBmcTypo(st.body || ''),
        done: !!st.done,
        boardTag: st.boardTag || 'GENERAL',
        minDay: st.minDay ?? 1,
        maxDay: st.maxDay ?? 28
      });
    });

    out.forumThreads = mergedThreads;
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

  // Migrate Star Chart (backfilling the 6 [AUTHORED] core node factions if saved faction was blank)
  if (Array.isArray(rawSaved.starChart)) {
    out.starChart = defaults.starChart.map(ds => {
      const ss = rawSaved.starChart.find((x: any) => x && x.id === ds.id);
      if (!ss) return ds;
      const savedFaction = fixBmcTypo(ss.faction ?? '');
      return {
        ...ds,
        faction: hasText(savedFaction) ? savedFaction : ds.faction,
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
    p.greetings.forEach(s => {
      byTab.factions += c(s);
    });
    p.greetingsHostile.forEach(s => {
      byTab.factions += c(s);
    });
    p.greetingsWarm.forEach(s => {
      byTab.factions += c(s);
    });
    Object.values(p.excuses).forEach(arr =>
      arr.forEach(s => {
        byTab.factions += c(s);
      })
    );
    p.detentionReactions.forEach(s => {
      byTab.factions += c(s);
    });
    Object.values(p.recentCallbacks).forEach(arr =>
      arr.forEach(s => {
        byTab.factions += c(s);
      })
    );
  });

  // 2. Core
  state.coreItems.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    byTab.core += c(it.title) + c(it.hint);
    it.fields.forEach(f => {
      byTab.core += c(f.label) + c(f.value);
    });
  });

  // 3. Forum
  state.forumThreads.forEach(t => {
    byTab.forum += c(t.title) + c(t.body);
  });

  // 4. Paths
  state.mainPaths.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    byTab.paths += c(it.title) + c(it.hint);
    it.fields.forEach(f => {
      byTab.paths += c(f.label) + c(f.value);
    });
  });

  // 5. Quests
  state.quests.forEach(q => {
    byTab.quests += c(q.title) + c(q.hint) + c(q.category);
    q.fields.forEach(f => {
      byTab.quests += c(f.label) + c(f.value);
    });
  });

  // 6. Corridor
  state.corridorPosters.forEach(p => {
    byTab.corridor += c(p.headline) + c(p.body) + c(p.hint);
  });
  state.corridorBarks.forEach(b => {
    b.lines.forEach(l => {
      byTab.corridor += c(l);
    });
  });
  state.starChart.forEach(s => {
    byTab.corridor += c(s.faction) + c(s.tags) + c(s.exports);
  });
  state.quartersMisc.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    byTab.corridor += c(it.title) + c(it.hint);
    it.fields.forEach(f => {
      byTab.corridor += c(f.label) + c(f.value);
    });
  });

  // 7. Endings
  state.endings.forEach(e => {
    byTab.endings += c(e.title) + c(e.trigger) + c(e.text);
  });

  const totalMatches = Object.values(byTab).reduce((a, b) => a + b, 0);
  return { totalMatches, byTab };
}

export function executeGlobalFindReplace(
  state: WorkbenchState,
  opts: FindReplaceOptions
): { nextState: WorkbenchState; replacedCount: number } {
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
    Object.keys(p.excuses).forEach(k => {
      p.excuses[k] = p.excuses[k].map(r);
    });
    p.detentionReactions = p.detentionReactions.map(r);
    p.recentCallbacks.ClearedViolation = p.recentCallbacks.ClearedViolation.map(r);
    p.recentCallbacks.RepeatedDetentions = p.recentCallbacks.RepeatedDetentions.map(r);
    p.recentCallbacks.TookBribe = p.recentCallbacks.TookBribe.map(r);
  });

  next.coreItems.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    it.title = r(it.title);
    it.hint = r(it.hint);
    it.fields.forEach(f => {
      f.label = r(f.label);
      f.value = r(f.value);
    });
  });

  next.forumThreads.forEach(t => {
    t.title = r(t.title);
    t.body = r(t.body);
  });

  next.mainPaths.forEach(it => {
    if (it.locked && !opts.includeLocked) return;
    it.title = r(it.title);
    it.hint = r(it.hint);
    it.fields.forEach(f => {
      f.label = r(f.label);
      f.value = r(f.value);
    });
  });

  next.quests.forEach(q => {
    q.title = r(q.title);
    q.hint = r(q.hint);
    q.category = r(q.category);
    q.group = q.category;
    q.fields.forEach(f => {
      f.label = r(f.label);
      f.value = r(f.value);
    });
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
    it.fields.forEach(f => {
      f.label = r(f.label);
      f.value = r(f.value);
    });
  });

  next.endings.forEach(e => {
    e.title = r(e.title);
    e.trigger = r(e.trigger);
    e.text = r(e.text);
  });

  return { nextState: next, replacedCount: summary.totalMatches };
}

// ---------- 1-TO-1 EXPORTERS & IMPORTERS (SECTION 2 OF THE AUDIT) ----------

/**
 * Formats an array of lines for C# FactionDialoguePool.cs:71-78 (IsPlayableLine).
 * Unfilled slots export with the exact "[TODO: <todoLabel> 1..N]" convention from data/dialogue/faction_pools.json.
 */
export function normalizeArrForGame(arr: string[], todoLabel: string, minCount = 2): string[] {
  const cleaned = (arr || [])
    .map(s => (s || '').trim())
    .filter(s => hasText(s));
  if (cleaned.length > 0) return cleaned;
  const count = Math.max(1, minCount);
  const placeholders: string[] = [];
  for (let i = 1; i <= count; i++) {
    placeholders.push(`[TODO: ${todoLabel} ${i}]`);
  }
  return placeholders;
}

/**
 * Exports data/dialogue/faction_pools.json matching FactionDialoguePool.FactionPoolEntry (Simulation/FactionDialoguePool.cs:15-28).
 * - Strict mode (strictCSharpSchema = true): exports ONLY the 4 C# properties (greetings, excuses with the 9 live JSON keys, detentionReactions, recentCallbacks).
 * - Extended mode (strictCSharpSchema = false / default for roundtrip test compatibility when greetingsHostile or greetingsWarm are populated):
 *   If options.strictCSharpSchema is true, excludes greetingsHostile, greetingsWarm, and non-JSON excuse keys.
 */
export function buildFactionPoolsExport(
  state: WorkbenchState,
  options?: { strictCSharpSchema?: boolean }
): Record<string, any> {
  const strict = options?.strictCSharpSchema ?? false;
  const out: Record<string, any> = {};

  FACTIONS.forEach(f => {
    const p = state.factionPools[f.code];
    const excusesOut: Record<string, string[]> = {};
    const keysToExport = strict ? LIVE_JSON_EXCUSE_KEYS : EXCUSE_KEYS;

    keysToExport.forEach(ek => {
      excusesOut[ek.key] = normalizeArrForGame(p.excuses[ek.key] || [], `${f.code} ${ek.key} excuse`, 2);
    });

    const entry: Record<string, any> = {
      greetings: normalizeArrForGame(p.greetings, `${f.code} greeting`, 3),
      excuses: excusesOut,
      detentionReactions: normalizeArrForGame(p.detentionReactions, `${f.code} detention reaction`, 2),
      recentCallbacks: {
        ClearedViolation: normalizeArrForGame(
          p.recentCallbacks.ClearedViolation,
          `${f.code} ClearedViolation callback`,
          2
        ),
        RepeatedDetentions: normalizeArrForGame(
          p.recentCallbacks.RepeatedDetentions,
          `${f.code} RepeatedDetentions callback`,
          2
        ),
        TookBribe: normalizeArrForGame(p.recentCallbacks.TookBribe, `${f.code} TookBribe callback`, 2)
      }
    };

    if (!strict) {
      entry.greetingsHostile = normalizeArrForGame(p.greetingsHostile, `${f.code} hostile greeting`, 1);
      entry.greetingsWarm = normalizeArrForGame(p.greetingsWarm, `${f.code} warm greeting`, 1);
    }

    out[f.code] = entry;
  });

  return out;
}

export function applyImportedFactionPools(
  state: WorkbenchState,
  data: Record<string, any>
): { nextState: WorkbenchState; importedCount: number } {
  const next: WorkbenchState = JSON.parse(JSON.stringify(state));
  let importedCount = 0;

  const cleanIn = (arr: any, minSlots = 1): string[] => {
    if (!Array.isArray(arr) || !arr.length) return Array(minSlots).fill('');
    const mapped = arr.map(x =>
      typeof x === 'string' && x.trim().toUpperCase().startsWith('[TODO') ? '' : x || ''
    );
    const nonEmpty = mapped.filter(Boolean);
    if (nonEmpty.length === 0) return Array(Math.max(minSlots, mapped.length)).fill('');
    return mapped;
  };

  FACTIONS.forEach(f => {
    if (!data || !data[f.code]) return;
    const src = data[f.code];
    const dst = next.factionPools[f.code];
    if (src.greetings) dst.greetings = cleanIn(src.greetings, 3);
    if (src.greetingsHostile) dst.greetingsHostile = cleanIn(src.greetingsHostile, 1);
    if (src.greetingsWarm) dst.greetingsWarm = cleanIn(src.greetingsWarm, 1);
    if (src.detentionReactions) dst.detentionReactions = cleanIn(src.detentionReactions, 2);
    if (src.excuses && typeof src.excuses === 'object') {
      EXCUSE_KEYS.forEach(ek => {
        let incoming = src.excuses[ek.key];
        if (!incoming && ek.legacyAliases) {
          for (const alias of ek.legacyAliases) {
            if (src.excuses[alias]) {
              incoming = src.excuses[alias];
              break;
            }
          }
        }
        if (incoming) dst.excuses[ek.key] = cleanIn(incoming, 2);
      });
    }
    if (src.recentCallbacks && typeof src.recentCallbacks === 'object') {
      (['ClearedViolation', 'RepeatedDetentions', 'TookBribe'] as const).forEach(k => {
        if (src.recentCallbacks[k]) dst.recentCallbacks[k] = cleanIn(src.recentCallbacks[k], 2);
      });
    }
    importedCount++;
  });

  return { nextState: next, importedCount };
}

/**
 * Exports 1-to-1 data/forum.json matching ForumDatabase (data/ForumModels.cs:5-66):
 * { boardName: "VG3-NET // STATION COMMUNAL FORUM v1.4", threads: ForumThreadModel[] }
 */
export function buildForumDatabaseExport(state: WorkbenchState) {
  const parseBodyToPosts = (bodyText: string, fallbackPosts?: { handle: string; roleTag: string; timestamp: string; body: string }[]) => {
    if (!hasText(bodyText)) {
      if (fallbackPosts && fallbackPosts.length > 0) {
        return fallbackPosts;
      }
      return [
        {
          handle: 'dock_hand_maren',
          roleTag: 'DECK 3 BAY CREW',
          timestamp: 'CYC 2409.04 // 06:12',
          body: '[TODO: USER DIALOGUE PASS]'
        }
      ];
    }

    const lines = bodyText
      .split(/\n+/)
      .map(l => l.trim())
      .filter(Boolean);
    const posts: { handle: string; roleTag: string; timestamp: string; body: string }[] = [];

    lines.forEach((line, idx) => {
      // Match patterns like "@handle [ROLE] (TIME): Body" or "[Handle]: Body" or "@handle: Body"
      const mFull = line.match(/^@?([a-zA-Z0-9_]+)\s*(?:\[([^\]]+)\])?\s*(?:\(([^)]+)\))?\s*:\s*(.+)$/);
      const mBracket = line.match(/^\[([^\]]+)\]\s*:\s*(.+)$/);
      const fb = fallbackPosts?.[idx] || fallbackPosts?.[0];

      if (mFull) {
        posts.push({
          handle: mFull[1].replace(/^@/, '').trim(),
          roleTag: (mFull[2] || fb?.roleTag || 'STATION CREW').trim(),
          timestamp: (mFull[3] || fb?.timestamp || 'CYC 2409.04 // 06:12').trim(),
          body: mFull[4].trim().replace(/^"|"$/g, '')
        });
      } else if (mBracket) {
        posts.push({
          handle: mBracket[1].replace(/^@/, '').trim(),
          roleTag: fb?.roleTag || 'STATION CREW',
          timestamp: fb?.timestamp || 'CYC 2409.04 // 06:12',
          body: mBracket[2].trim().replace(/^"|"$/g, '')
        });
      } else if (posts.length > 0) {
        posts[posts.length - 1].body += ' ' + line.replace(/^"|"$/g, '');
      } else {
        posts.push({
          handle: fb?.handle || 'dock_hand_maren',
          roleTag: fb?.roleTag || 'DECK 3 BAY CREW',
          timestamp: fb?.timestamp || 'CYC 2409.04 // 06:12',
          body: line.replace(/^"|"$/g, '')
        });
      }
    });

    return posts;
  };

  const threads = state.forumThreads
    .filter(t => t.isLiveJsonThread || hasText(t.body))
    .map(t => {
      const auditMeta = LIVE_FORUM_THREADS_AUDIT.find(a => a.id === t.id);
      return {
        id: t.id,
        title: hasText(t.title) ? t.title.trim() : auditMeta?.title || `[TODO] ${t.id}`,
        boardTag: (t.boardTag || auditMeta?.boardTag || 'GENERAL').replace(/\[TODO[^\]]*\]/gi, '').trim(),
        minDay: t.minDay ?? auditMeta?.minDay ?? 1,
        maxDay: t.maxDay ?? auditMeta?.maxDay ?? 30,
        requiredFlags: t.requiredFlags ?? auditMeta?.requiredFlags ?? [],
        powerScoreCondition: t.powerScoreCondition !== undefined ? t.powerScoreCondition : auditMeta?.powerScoreCondition ?? null,
        posts: parseBodyToPosts(t.body, auditMeta?.posts)
      };
    });

  return {
    boardName: 'VG3-NET // STATION COMMUNAL FORUM v1.4',
    threads
  };
}

export function buildForumThreadsExport(state: WorkbenchState) {
  return state.forumThreads.map(t => ({
    id: t.id,
    stage: t.stage,
    pillar: t.pillar,
    boardTag: t.boardTag || 'GENERAL',
    minDay: t.minDay ?? 1,
    maxDay: t.maxDay ?? 30,
    requiredFlags: t.requiredFlags || [],
    powerScoreCondition: t.powerScoreCondition ?? null,
    title: hasText(t.title) ? t.title.trim() : `[TODO] ${t.id} title`,
    body: hasText(t.body) ? t.body.trim() : `[TODO] ${t.id} body`,
    status: getForumThreadStatus(t)
  }));
}

/**
 * Exports 1-to-1 data/covert_missions.json matching CovertMissionDatabase (data/ForumModels.cs:68-177).
 * Automatically sanitizes the 2 live C# placeholder leaks identified in Section 2.3 of writing_code_audit.md:
 * 1. Converts [PLACEHOLDER ...] to [TODO: ...] (which StripAuthoringTodoTags actually strips) or uses authored title.
 * 2. Strips any trailing [TODO...] from assigningFaction (which C# fails to strip in email Sender headers & logs).
 */
export function buildCovertMissionsExport(state: WorkbenchState): { missions: CovertMissionAuditSpec[] } {
  const sanitizeNoLeak = (raw: string, stripAllTodo: boolean): string => {
    let s = raw.replace(/\[PLACEHOLDER\s+([^\]]+)\]/gi, '[TODO: $1]');
    if (stripAllTodo) {
      s = s.replace(/\s*\[TODO(?::[^\]]*)?\]/gi, '').trim();
    }
    return s;
  };

  const missions: CovertMissionAuditSpec[] = COVERT_MISSIONS_AUDIT.map(base => {
    const qCard = state.quests.find(q => q.covertMissionId === base.missionId || q.id === `cm_${base.missionId}`);
    const getVal = (key: string, fallback: string) => {
      const f = qCard?.fields.find(x => x.key === key);
      return f && hasText(f.value) ? f.value.trim() : fallback;
    };

    return {
      ...base,
      title: sanitizeNoLeak(getVal('title', base.title), false),
      assigningFaction: sanitizeNoLeak(getVal('assigningFaction', base.assigningFaction), true),
      payloadDescription: sanitizeNoLeak(getVal('payloadDescription', base.payloadDescription), false),
      encryptedSubject: sanitizeNoLeak(getVal('encryptedSubject', base.encryptedSubject), true),
      decryptedBody: sanitizeNoLeak(getVal('decryptedBody', base.decryptedBody), false)
    };
  });

  return { missions };
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
    out[b.id] = normalizeArrForGame(b.lines, b.label, 2);
  });
  return out;
}

/**
 * Exports data/sector_map.json inner node & route metadata matching SectorMapModels.cs:79, 115-150
 * (where empty faction/tag/export default to literal "[TODO]").
 */
export function buildSectorMapExport(state: WorkbenchState) {
  return {
    nodes: state.starChart.map(s => ({
      id: s.id,
      name: s.name,
      faction: hasText(s.faction) ? s.faction.trim() : '[TODO]',
      tag: hasText(s.tags) ? s.tags.trim() : '[TODO]',
      export: hasText(s.exports) ? s.exports.trim() : '[TODO]'
    })),
    systems: state.starChart.map(s => ({
      id: s.id,
      name: s.name,
      controllingFaction: hasText(s.faction) ? s.faction.trim() : `[TODO] ${s.id} faction`,
      tags: hasText(s.tags) ? s.tags.split(',').map(t => t.trim()).filter(Boolean) : [`[TODO] ${s.id} tags`],
      exports: hasText(s.exports) ? s.exports.split(',').map(e => e.trim()).filter(Boolean) : [`[TODO] ${s.id} exports`]
    }))
  };
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
  lines.push(
    `*Exported: ${new Date().toISOString()} | Done: ${stats.allDone}/${stats.allTot} (${pct}%) | Drafts: ${stats.allDraft} | Todo: ${stats.allTodo} | Words: ${stats.words} | Corp: ${state.meta.corpName}*`
  );
  lines.push('');

  lines.push('## 1. Faction Dialogue Pools (data/dialogue/faction_pools.json)');
  FACTIONS.forEach(f => {
    const p = state.factionPools[f.code];
    lines.push(`### ${f.code} — ${f.name}`);
    lines.push(`- **Greetings (Neutral):** ${p.greetings.filter(hasText).join(' | ') || '[TODO]'}`);
    lines.push(`- **Greetings (Hostile, rep <= -5) [NOT WIRED IN C#]:** ${p.greetingsHostile.filter(hasText).join(' | ') || '[TODO]'}`);
    lines.push(`- **Greetings (Warm, rep >= +6) [NOT WIRED IN C#]:** ${p.greetingsWarm.filter(hasText).join(' | ') || '[TODO]'}`);
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

  lines.push('## 3. Quarters FORUM Anchor Posts (data/forum.json)');
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

  lines.push('## 5. Covert Missions, Recurring Faces & Side Quests');
  state.quests.forEach(it => {
    lines.push(
      `### ${it.title} (${it.day}, Start Day ${it.sortDay}) [${it.category} | ${it.status} | ${getStructuredItemStatus(it)}]`
    );
    if (it.hint) lines.push(`*Hint: ${it.hint}*`);
    it.fields.forEach(f => {
      lines.push(`**${f.label}:** ${hasText(f.value) ? f.value.trim() : '[TODO]'}`);
    });
    lines.push('');
  });

  lines.push('## 6. Morning Corridor Posters, Barks, Star Chart & Quarters Misc');
  lines.push('### Corridor Posters');
  state.corridorPosters.forEach(p => {
    lines.push(
      `- **${p.filename}** (${p.stage}) [${getPosterStatus(p)}]: ${hasText(p.headline) ? p.headline : '[TODO]'} — ${
        hasText(p.body) ? p.body : '[TODO]'
      }`
    );
  });
  lines.push('');
  lines.push('### Corridor Overhead Barks');
  state.corridorBarks.forEach(b => {
    lines.push(`- **${b.label}** [${getBarkStatus(b)}]: ${b.lines.filter(hasText).join(' | ') || '[TODO]'}`);
  });
  lines.push('');
  lines.push('### Star Chart Systems (data/sector_map.json)');
  state.starChart.forEach(s => {
    lines.push(
      `- **${s.name}** [${getStarChartStatus(s)}]: Faction=${s.faction || '[TODO]'} | Tags=${s.tags || '[TODO]'} | Exports=${
        s.exports || '[TODO]'
      }`
    );
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
