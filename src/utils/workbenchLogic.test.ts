import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FACTIONS,
  buildDefaultState,
  getStructuredItemStatus,
  getFactionCardStatus,
  calcAllStats,
  migrateState,
  previewGlobalFindReplace,
  executeGlobalFindReplace,
  buildFactionPoolsExport,
  applyImportedFactionPools,
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

test('Faction pools export & import preserves greetingsHostile and greetingsWarm', () => {
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

  // Locked cards (like intro_5card and day2_nixa) are not locked except intro_5card & day1_locked_pair
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

  const forumJson = buildForumThreadsExport(state);
  assert.equal(forumJson.length, state.forumThreads.length);

  const tutJson = buildTutorialsExport(state);
  assert.ok('quarters' in tutJson && 'desk' in tutJson);

  const endingsJson = buildEndingsExport(state);
  assert.equal(endingsJson.length, 7);

  const targets = collectUnfinishedTargets(state);
  assert.ok(targets.length > 10);
});
