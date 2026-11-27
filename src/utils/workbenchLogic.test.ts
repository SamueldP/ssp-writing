import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FACTIONS,
  EXCUSE_KEYS,
  buildDefaultState,
  getStructuredItemStatus,
  getFactionCardStatus,
  calcAllStats,
  migrateState,
  previewGlobalFindReplace,
  executeGlobalFindReplace,
  buildFactionPoolsExport,
  applyImportedFactionPools,
  buildForumDatabaseExport,
  buildCovertMissionsExport,
  buildObsidianMarkdownExport,
  buildSectorMapExport,
  buildForumThreadsExport,
  buildQuestsExport,
  buildTutorialsExport,
  buildEndingsExport,
  collectUnfinishedTargets
} from './workbenchLogic';

test('Canonical BMC- faction name uses Brengop Mercantile Consortium everywhere', () => {
  const bmc = FACTIONS.find(f => f.code === 'BMC-');
  assert.ok(bmc);
  assert.equal(bmc.name, 'Brengop Mercantile Consortium');
  const state = buildDefaultState();
  const dump = JSON.stringify(state);
  assert.equal(dump.includes('Mining Consortium'), false, 'Should contain zero occurrences of Mining Consortium');
});

test('3-state status logic distinguishes TODO, DRAFT, DONE, LOCKED, and CUT (fixes false-positive isItemDone)', () => {
  // Empty item -> TODO
  const todoItem = {
    done: false,
    fields: [{ key: 'a', label: 'A', value: '' }, { key: 'b', label: 'B', value: '[TODO] placeholder' }]
  };
  assert.equal(getStructuredItemStatus(todoItem), 'TODO');

  // Non-empty fields but not marked done -> DRAFT (NOT DONE!)
  const draftItem = {
    done: false,
    fields: [{ key: 'a', label: 'A', value: 'First line written' }, { key: 'b', label: 'B', value: 'Second line written' }]
  };
  assert.equal(getStructuredItemStatus(draftItem), 'DRAFT');

  // Explicitly marked done -> DONE
  const doneItem = {
    done: true,
    fields: [{ key: 'a', label: 'A', value: 'First line written' }]
  };
  assert.equal(getStructuredItemStatus(doneItem), 'DONE');

  // Locked item -> LOCKED
  const lockedItem = {
    locked: true,
    done: true,
    fields: [{ key: 'a', label: 'A', value: 'Locked text' }]
  };
  assert.equal(getStructuredItemStatus(lockedItem), 'LOCKED');

  // Cut quest -> CUT
  const cutItem = {
    status: 'CUT' as const,
    done: false,
    fields: [{ key: 'a', label: 'A', value: 'Some draft' }]
  };
  assert.equal(getStructuredItemStatus(cutItem), 'CUT');

  // Faction pool card status
  assert.equal(getFactionCardStatus(['', ''], false), 'TODO');
  assert.equal(getFactionCardStatus(['Need to check your transponder.'], false), 'DRAFT');
  assert.equal(getFactionCardStatus(['Need to check your transponder.'], true), 'DONE');
});

test('Faction pools export & import preserves greetingsHostile and greetingsWarm in full workbench mode', () => {
  const state = buildDefaultState();
  state.factionPools['KDF-'].greetings = ['State your business, transport.'];
  state.factionPools['KDF-'].greetingsHostile = ['Do not test Kordani patience, Booth 04.'];
  state.factionPools['KDF-'].greetingsWarm = ['Inspector. Always a clean lane with you on shift.'];
  state.factionPools['KDF-'].recentCallbacks.TookBribe = ['Heard you take scrip under the glass.'];

  const exported = buildFactionPoolsExport(state);
  assert.deepEqual(exported['KDF-'].greetings, ['State your business, transport.']);
  assert.deepEqual(exported['KDF-'].greetingsHostile, ['Do not test Kordani patience, Booth 04.']);
  assert.deepEqual(exported['KDF-'].greetingsWarm, ['Inspector. Always a clean lane with you on shift.']);
  assert.deepEqual(exported['KDF-'].recentCallbacks.TookBribe, ['Heard you take scrip under the glass.']);

  const fresh = buildDefaultState();
  const { nextState, importedCount } = applyImportedFactionPools(fresh, exported);
  assert.equal(importedCount, FACTIONS.length);
  assert.deepEqual(nextState.factionPools['KDF-'].greetingsHostile, ['Do not test Kordani patience, Booth 04.']);
  assert.deepEqual(nextState.factionPools['KDF-'].greetingsWarm, ['Inspector. Always a clean lane with you on shift.']);
});

test('Strict 1-to-1 C# faction_pools.json export matches FactionDialoguePool schema (4 keys, 9 live excuse keys) and pre-populates FTV- & MNG- authored lines', () => {
  const state = buildDefaultState();
  // FTV- and MNG- should have their 19 verbatim authored lines pre-populated, while GUV- remains empty for user authoring
  assert.equal(state.factionPools['FTV-'].greetings.length, 3);
  assert.equal(state.factionPools['FTV-'].greetings[0], '{shipName} ({reg}) holding. Clear our lane.');
  assert.equal(state.factionPools['MNG-'].greetings.length, 3);
  assert.equal(state.factionPools['MNG-'].greetings[0], 'Guild rig {shipName} holding. Cycle our packet.');
  assert.deepEqual(state.factionPools['GUV-'].greetings, ['', '', '']);

  const strictCSharp = buildFactionPoolsExport(state, { strictCSharpSchema: true });
  assert.equal(Object.keys(strictCSharp).length, 13);
  const guvEntry = strictCSharp['GUV-'];
  assert.deepEqual(Object.keys(guvEntry), ['greetings', 'excuses', 'detentionReactions', 'recentCallbacks']);
  assert.equal('greetingsHostile' in guvEntry, false, 'Strict C# schema excludes unwired greetingsHostile');
  assert.equal('greetingsWarm' in guvEntry, false, 'Strict C# schema excludes unwired greetingsWarm');
  assert.equal(Object.keys(guvEntry.excuses).length, 9, 'Strict C# schema exports exact 9 live JSON excuse keys');
  assert.equal(guvEntry.greetings[0], '[TODO: GUV- greeting 1]');
  assert.equal(guvEntry.excuses.SpoofedWeaponsHot[0], '[TODO: GUV- SpoofedWeaponsHot excuse 1]');
});

test('1-to-1 C# forum.json and covert_missions.json exporters match exact C# classes and sanitize live leaks', () => {
  const state = buildDefaultState();
  const forumDb = buildForumDatabaseExport(state);
  assert.equal(forumDb.boardName, 'VG3-NET // STATION COMMUNAL FORUM v1.4');
  assert.ok(Array.isArray(forumDb.threads));
  assert.ok(forumDb.threads.length >= 14);
  const firstLiveThread = forumDb.threads.find((t: any) => t.id === 'd1_spectrometer_outage');
  assert.ok(firstLiveThread);
  assert.equal(firstLiveThread.minDay, 1);
  assert.equal(firstLiveThread.posts.length, 2);
  assert.equal(firstLiveThread.posts[0].handle, 'dock_hand_maren');

  const covertDb = buildCovertMissionsExport(state);
  assert.ok(Array.isArray(covertDb.missions));
  assert.equal(covertDb.missions.length, 5);
  const op1 = covertDb.missions[0];
  assert.equal(op1.assigningFaction.includes('[TODO'), false, 'Sanitizes live [TODO] leak in assigningFaction');
  assert.equal(op1.title.includes('[PLACEHOLDER'), false, 'Sanitizes live [PLACEHOLDER OP-01] leak');
});

test('Legacy excuse keys migrate cleanly to exact C# ShipInfractionType enum names without losing user edits', () => {
  const v1WithLegacyExcuses = {
    meta: {
      corpName: 'Brengop',
      activeTab: 'factions',
      filter: 'all'
    },
    factionPools: {
      'KDF-': {
        greetings: ['Kordani patrol vessel on approach.'],
        excuses: {
          SpoofedHotWeapons: ['Our weapons bus is locked on combat standby!'],
          WarpMismatch: ['Classified Kordani jump vector.'],
          BioQuarantine: ['Medical supplies only.']
        }
      }
    }
  };

  const migrated = migrateState(v1WithLegacyExcuses);
  assert.deepEqual(migrated.factionPools['KDF-'].excuses.SpoofedWeaponsHot, [
    'Our weapons bus is locked on combat standby!'
  ]);
  assert.deepEqual(migrated.factionPools['KDF-'].excuses.FalsifiedOriginWaveform, [
    'Classified Kordani jump vector.'
  ]);
  assert.deepEqual(migrated.factionPools['KDF-'].excuses.UndeclaredCargoBioSignature, [
    'Medical supplies only.'
  ]);
  assert.equal(EXCUSE_KEYS.length, 18);
});

test('Obsidian Markdown export includes greetingsHostile, greetingsWarm, recentCallbacks, quartersMisc, and quests', () => {
  const state = buildDefaultState();
  state.factionPools['BMC-'].greetingsHostile = ['Consortium legal will hear of your delays.'];
  state.factionPools['BMC-'].greetingsWarm = ['An efficient clerk is a profitable clerk.'];
  state.factionPools['BMC-'].recentCallbacks.ClearedViolation = ['Appreciate you overlooking that manifest smudge.'];
  state.quartersMisc[0].fields[0].value = 'UNIQUE_QUARTERS_DISPATCH_TEXT';
  state.quests[0].fields[0].value = 'UNIQUE_QUEST_DIALOGUE_LINE';

  const md = buildObsidianMarkdownExport(state);
  assert.ok(md.includes('Consortium legal will hear of your delays.'), 'Includes greetingsHostile');
  assert.ok(md.includes('An efficient clerk is a profitable clerk.'), 'Includes greetingsWarm');
  assert.ok(md.includes('Appreciate you overlooking that manifest smudge.'), 'Includes recentCallbacks');
  assert.ok(md.includes('UNIQUE_QUARTERS_DISPATCH_TEXT'), 'Includes quartersMisc');
  assert.ok(md.includes('UNIQUE_QUEST_DIALOGUE_LINE'), 'Includes quests');
});

test('Safe v1 to v2 migration fixes BMC typo, preserves authored content, and keeps deleted quests removed', () => {
  const v1Mock = {
    meta: {
      corpName: 'Brengop Mining Consortium (BMC-)',
      activeTab: 'quests',
      filter: 'todo',
      deletedQuestIds: ['opt_helani']
    },
    quests: [
      {
        id: 'rf_mng',
        title: 'Custom Renamed Ore Pilot Quest',
        day: 'Day 11',
        sortDay: 11,
        category: 'Recurring Faces',
        status: 'KEEP',
        done: false,
        hint: 'Brengop Mining Consortium auditor hint',
        fields: [{ key: 'casual', label: 'Visit 1', value: 'My rig is falling apart.' }]
      }
    ]
  };

  const migrated = migrateState(v1Mock);
  assert.equal(migrated.meta.filter, 'unfinished');
  assert.equal(migrated.quests.some(q => q.id === 'opt_helani'), false, 'Deleted quest must not reappear');
  const mng = migrated.quests.find(q => q.id === 'rf_mng');
  assert.ok(mng);
  assert.equal(mng.title, 'Custom Renamed Ore Pilot Quest');
  assert.equal(mng.sortDay, 11);
  assert.equal(mng.hint, 'Brengop Mercantile Consortium auditor hint');
  assert.equal(mng.fields[0].value, 'My rig is falling apart.');
});

test('Global Find & Replace respects case-sensitivity and includeLocked toggle', () => {
  const state = buildDefaultState();
  // Add unlocked text mentioning Brengop
  state.forumThreads[0].body = 'Brengop clerks and brengop auditors are watching.';

  // Locked cards (like intro_5card and day1_locked_pair) are locked
  const previewNoLocked = previewGlobalFindReplace(state, {
    findText: 'Brengop',
    replaceText: 'Brusari',
    caseSensitive: true,
    includeLocked: false
  });
  const previewWithLocked = previewGlobalFindReplace(state, {
    findText: 'Brengop',
    replaceText: 'Brusari',
    caseSensitive: true,
    includeLocked: true
  });

  assert.ok(previewWithLocked.totalMatches > previewNoLocked.totalMatches, 'Locked cards contain additional Brengop matches');

  const { nextState, replacedCount } = executeGlobalFindReplace(state, {
    findText: 'Brengop',
    replaceText: 'Brusari',
    caseSensitive: false,
    includeLocked: false
  });
  assert.ok(replacedCount > 0);
  assert.equal(nextState.forumThreads[0].body, 'Brusari clerks and Brusari auditors are watching.');
  // Locked intro card 2 should still say Brengop because includeLocked was false
  const introCard = nextState.coreItems.find(c => c.id === 'intro_5card');
  assert.ok(introCard?.fields[1].value.includes('Brengop'));
});

test('Direct JSON exporters produce valid game-ready structures and exclude CUT quests', () => {
  const state = buildDefaultState();
  state.quests[0].status = 'CUT';
  const questsJson = buildQuestsExport(state);
  assert.equal(questsJson.some(q => q.id === state.quests[0].id), false, 'CUT quests excluded from quests.json');

  const sectorJson = buildSectorMapExport(state);
  assert.equal(sectorJson.systems.length, 7);
  assert.equal(sectorJson.systems[0].id, 'VG-3');
  assert.equal(sectorJson.nodes[0].faction, '[TODO]');
  assert.equal(sectorJson.nodes[1].faction, 'Krushvak');

  const forumJson = buildForumThreadsExport(state);
  assert.equal(forumJson.length, state.forumThreads.length);

  const tutJson = buildTutorialsExport(state);
  assert.ok('quarters' in tutJson && 'desk' in tutJson);

  const endingsJson = buildEndingsExport(state);
  assert.equal(endingsJson.length, 7);

  const stats = calcAllStats(state);
  assert.equal(stats.factionPoolsLiveSlots.totalSlots, 381);
  assert.equal(stats.factionPoolsLiveSlots.authoredSlots, 38, 'FTV- (19) + MNG- (19) = 38 authored slots in default state');
  assert.equal(stats.factionPoolsLiveSlots.todoSlots, 343, '381 - 38 = 343 [TODO] slots in default state');

  const targets = collectUnfinishedTargets(state);
  assert.ok(targets.length > 10);
});

