import React, { useEffect, useState } from 'react';
import {
  WorkbenchState,
  calcAllStats,
  previewGlobalFindReplace,
  executeGlobalFindReplace,
  buildFactionPoolsExport,
  buildForumDatabaseExport,
  buildCovertMissionsExport,
  buildCorridorPostersExport,
  buildCorridorBarksExport,
  buildSectorMapExport,
  buildForumThreadsExport,
  buildQuestsExport,
  buildTutorialsExport,
  buildEndingsExport,
  buildObsidianMarkdownExport
} from '../utils/workbenchLogic';
import {
  SECTION_5_HARDCODED_MIGRATION_LIST,
  SECTION_5_MISMATCHES_AND_LEAKS,
  SECTION_5_BASELINE_COUNTS
} from '../utils/auditReferenceData';
import { SourceBadge } from './WorkbenchControls';

export function downloadFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  state: WorkbenchState;
  initialView?: 'exports' | 'audit';
  onImportFactionPoolsClick: () => void;
  onImportBackupClick: () => void;
  onResetDefaults: () => void;
  onDownloadSelfContainedHtml: () => void;
  onToast: (msg: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  state,
  initialView = 'exports',
  onImportFactionPoolsClick,
  onImportBackupClick,
  onResetDefaults,
  onDownloadSelfContainedHtml,
  onToast
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'exports' | 'audit'>(initialView);

  useEffect(() => {
    if (open) {
      setActiveSubTab(initialView);
    }
  }, [open, initialView]);

  if (!open) return null;

  const stats = calcAllStats(state);

  const expJson = (filename: string, data: any) => {
    downloadFile(filename, JSON.stringify(data, null, 2));
    onToast(`Exported ${filename}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#05080c]/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Exports, Game JSON, Code Audit and Backups"
        className="bg-[#121720] border border-[#e5a03c] max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[#263040] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-[#e5a03c] tracking-wider">
              1-TO-1 GAME JSON EXPORTS &amp; CODE vs. WORKBENCH SYNC AUDIT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#0b0e13] border border-[#263040] p-0.5">
              <button
                type="button"
                onClick={() => setActiveSubTab('exports')}
                className={`px-3 py-1 font-mono text-xs cursor-pointer ${
                  activeSubTab === 'exports'
                    ? 'bg-[#e5a03c] text-[#0b0e13] font-bold'
                    : 'text-[#8492a6] hover:text-[#d8dee9]'
                }`}
              >
                1. EXPORTS &amp; BACKUPS
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('audit')}
                className={`px-3 py-1 font-mono text-xs cursor-pointer ${
                  activeSubTab === 'audit'
                    ? 'bg-[#4cc9c0] text-[#0b0e13] font-bold'
                    : 'text-[#8492a6] hover:text-[#d8dee9]'
                }`}
              >
                2. CODE vs. WORKBENCH AUDIT (SECTION 5)
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 bg-[#18202c] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
            >
              CLOSE [ESC]
            </button>
          </div>
        </div>

        {activeSubTab === 'exports' ? (
          <div className="p-5 overflow-y-auto space-y-6">
            <div className="bg-[#0b0e13] border border-dashed border-[#334155] p-3.5 text-xs text-[#8492a6]">
              <strong className="font-mono text-[#e5a03c]">1-TO-1 C# SCHEMA SAFETY:</strong> All live JSON exporters match your exact C# deserializers (<code className="text-[#4cc9c0]">FactionDialoguePool.cs</code>, <code className="text-[#4cc9c0]">ForumModels.cs</code>, <code className="text-[#4cc9c0]">SectorMapModels.cs</code>). Unfilled dialogue lines export as <code className="text-[#4cc9c0]">&quot;[TODO: ...]&quot;</code> so <code className="text-[#4cc9c0]">IsPlayableLine</code> and <code className="text-[#4cc9c0]">StripAuthoringTodoTags</code> skip them cleanly, and <code className="text-[#4cc9c0]">covert_missions.json</code> automatically fixes the <code className="text-[#e5a03c]">[PLACEHOLDER ...]</code> &amp; <code className="text-[#e5a03c]">assigningFaction [TODO]</code> leaks.
            </div>

            {/* 1. Active Live C# JSON Files */}
            <div>
              <div className="font-mono text-xs font-bold text-[#4cc9c0] uppercase tracking-wider pb-1.5 mb-3 border-b border-[#263040]">
                1. Live Game-Ready JSON Files (Wired Directly in C# Loaders)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* faction_pools.json */}
                <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#d8dee9]">
                        data/dialogue/faction_pools.json
                      </span>
                      <SourceBadge
                        badge={{
                          kind: 'LIVE_JSON',
                          label: 'LIVE JSON',
                          location: 'FactionDialoguePool.cs:123-161'
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#8492a6] mt-1.5">
                      13 prefixes (<code className="text-[#4cc9c0]">FTV-</code>..
                      <code className="text-[#4cc9c0]">DEFAULT</code>). Strict mode exports the exact 4 C# properties (<code className="text-[#d8dee9]">greetings</code>, 9 live <code className="text-[#d8dee9]">excuses</code> keys, <code className="text-[#d8dee9]">detentionReactions</code>, <code className="text-[#d8dee9]">recentCallbacks</code>). Live slots authored:{' '}
                      <strong className="text-[#52b778]">
                        {stats.factionPoolsLiveSlots.authoredSlots}/{stats.factionPoolsLiveSlots.totalSlots}
                      </strong>
                      .
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        expJson('faction_pools.json', buildFactionPoolsExport(state, { strictCSharpSchema: true }))
                      }
                      className="px-3 py-1.5 bg-[#4cc9c0]/15 border border-[#4cc9c0] font-mono text-xs font-bold text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer"
                    >
                      EXPORT faction_pools.json (1-TO-1 C#)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        expJson(
                          'faction_pools_extended.json',
                          buildFactionPoolsExport(state, { strictCSharpSchema: false })
                        )
                      }
                      title="Includes greetingsHostile, greetingsWarm, and all 18 excuse keys"
                      className="px-2.5 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#94a3b8] hover:border-[#e5a03c] hover:text-[#d8dee9] cursor-pointer"
                    >
                      EXPORT EXTENDED
                    </button>
                    <button
                      type="button"
                      onClick={onImportFactionPoolsClick}
                      className="px-2.5 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      IMPORT faction_pools.json
                    </button>
                  </div>
                </div>

                {/* data/forum.json */}
                <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#d8dee9]">data/forum.json</span>
                      <SourceBadge
                        badge={{
                          kind: 'LIVE_JSON',
                          label: 'LIVE JSON',
                          location: 'ForumModels.cs:64-65'
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#8492a6] mt-1.5">
                      Exports exact <code className="text-[#4cc9c0]">ForumDatabase</code> schema (<code className="text-[#d8dee9]">boardName</code> + <code className="text-[#d8dee9]">threads[]</code> with <code className="text-[#d8dee9]">id, title, boardTag, minDay, maxDay, requiredFlags, powerScoreCondition, posts[]</code>).
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => expJson('forum.json', buildForumDatabaseExport(state))}
                      className="px-3 py-1.5 bg-[#4cc9c0]/15 border border-[#4cc9c0] font-mono text-xs font-bold text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer"
                    >
                      EXPORT forum.json (1-TO-1 C#)
                    </button>
                    <button
                      type="button"
                      onClick={() => expJson('forum_threads.json', buildForumThreadsExport(state))}
                      className="px-2.5 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#94a3b8] hover:border-[#e5a03c] cursor-pointer"
                    >
                      EXPORT FLAT forum_threads.json
                    </button>
                  </div>
                </div>

                {/* data/covert_missions.json */}
                <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#d8dee9]">data/covert_missions.json</span>
                      <SourceBadge
                        badge={{
                          kind: 'LIVE_JSON',
                          label: 'LIVE JSON [LEAK-FREE]',
                          location: 'ForumModels.cs:167-177'
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#8492a6] mt-1.5">
                      Exports all 5 covert missions with the exact 21 <code className="text-[#4cc9c0]">CovertMissionSpec</code> keys and sanitizes <code className="text-[#e5a03c]">[PLACEHOLDER OP-01..INT-02]</code> &amp; <code className="text-[#e5a03c]">assigningFaction [TODO]</code> leaks.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => expJson('covert_missions.json', buildCovertMissionsExport(state))}
                      className="px-3 py-1.5 bg-[#4cc9c0]/15 border border-[#4cc9c0] font-mono text-xs font-bold text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer"
                    >
                      EXPORT covert_missions.json (1-TO-1 C#)
                    </button>
                  </div>
                </div>

                {/* data/sector_map.json */}
                <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#d8dee9]">data/sector_map.json (Nodes)</span>
                      <SourceBadge
                        badge={{
                          kind: 'LIVE_JSON',
                          label: 'LIVE JSON',
                          location: 'SectorMapModels.cs:245-250'
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#8492a6] mt-1.5">
                      7 clickable inner systems (<code className="text-[#d8dee9]">VG-3, Gharok, Veridia, Oruun-4, Ash, Korr-Vath, Dul-Krag</code>) with exact <code className="text-[#4cc9c0]">faction</code>, <code className="text-[#4cc9c0]">tag</code>, and <code className="text-[#4cc9c0]">export</code> keys.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => expJson('sector_map.json', buildSectorMapExport(state))}
                      className="px-3 py-1.5 bg-[#4cc9c0]/15 border border-[#4cc9c0] font-mono text-xs font-bold text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer"
                    >
                      EXPORT sector_map.json
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Unwired / Future C# JSON Exports */}
            <div>
              <div className="font-mono text-xs font-bold text-[#a78bfa] uppercase tracking-wider pb-1.5 mb-3 border-b border-[#263040]">
                2. Staged JSON Exports for Future C# Wiring (Marked NOT WIRED IN C# YET in Section 2 Audit)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#d8dee9]">
                        corridor_posters.json &amp; corridor_barks.json
                      </span>
                      <SourceBadge
                        badge={{
                          kind: 'NOT_WIRED',
                          label: 'NOT WIRED IN C# YET',
                          location: 'CorridorScreen.cs'
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#8492a6] mt-1">
                      Staged JSON files for zoomable hallway posters and proximity NPC barks once <code className="text-[#d8dee9]">CorridorScreen.cs</code> adds a loader.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => expJson('corridor_posters.json', buildCorridorPostersExport(state))}
                      className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      EXPORT corridor_posters.json
                    </button>
                    <button
                      type="button"
                      onClick={() => expJson('corridor_barks.json', buildCorridorBarksExport(state))}
                      className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      EXPORT corridor_barks.json
                    </button>
                  </div>
                </div>

                <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#d8dee9]">
                        quests.json, tutorials.json &amp; endings.json
                      </span>
                      <SourceBadge
                        badge={{
                          kind: 'NOT_WIRED',
                          label: 'NOT WIRED IN C# YET',
                          location: 'No C# loader yet'
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#8492a6] mt-1">
                      Note: Section 2 audit confirms <code className="text-[#d8dee9]">data/quests.json</code> has zero C# references today (active missions use <code className="text-[#4cc9c0]">covert_missions.json</code> above).
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => expJson('quests.json', buildQuestsExport(state))}
                      className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      EXPORT quests.json
                    </button>
                    <button
                      type="button"
                      onClick={() => expJson('tutorials.json', buildTutorialsExport(state))}
                      className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      EXPORT tutorials.json
                    </button>
                    <button
                      type="button"
                      onClick={() => expJson('endings.json', buildEndingsExport(state))}
                      className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      EXPORT endings.json
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Obsidian Sync, Standalone HTML & Full Backups */}
            <div>
              <div className="font-mono text-xs font-bold text-[#e5a03c] uppercase tracking-wider pb-1.5 mb-3 border-b border-[#263040]">
                3. Obsidian Vault Markdown, Standalone Offline HTML &amp; Workbench Backups
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs font-bold text-[#d8dee9]">
                      Obsidian Markdown &amp; Standalone HTML
                    </div>
                    <div className="text-xs text-[#8492a6] mt-1">
                      Export complete <code className="text-[#4cc9c0]">Subspace_Protocols_Authored_Writing.md</code> or download the self-contained offline <code className="text-[#4cc9c0]">.html</code> file.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        downloadFile(
                          'Subspace_Protocols_Authored_Writing.md',
                          buildObsidianMarkdownExport(state),
                          'text/markdown'
                        );
                        onToast('Exported complete Obsidian Markdown!');
                      }}
                      className="px-3 py-1.5 bg-[#e5a03c]/15 border border-[#e5a03c] font-mono text-xs font-bold text-[#e5a03c] hover:bg-[#e5a03c] hover:text-[#0b0e13] cursor-pointer"
                    >
                      EXPORT OBSIDIAN .MD
                    </button>
                    <button
                      type="button"
                      onClick={onDownloadSelfContainedHtml}
                      className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      DOWNLOAD STANDALONE .HTML
                    </button>
                  </div>
                </div>

                <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs font-bold text-[#d8dee9]">Full Workbench Backup &amp; Reset</div>
                    <div className="text-xs text-[#8492a6] mt-1">
                      Save or restore every field, custom quest, beat, and status flag as a single JSON snapshot.
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => expJson('subspace_protocols_writing_backup.json', state)}
                      className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      SAVE BACKUP JSON
                    </button>
                    <button
                      type="button"
                      onClick={onImportBackupClick}
                      className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                    >
                      LOAD BACKUP JSON
                    </button>
                    {!confirmReset ? (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="px-3 py-1.5 bg-[#121720] border border-[#c94a4a] font-mono text-xs text-[#c94a4a] hover:bg-[#c94a4a]/15 cursor-pointer"
                      >
                        RESET DEFAULTS
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmReset(false);
                            onResetDefaults();
                            onClose();
                          }}
                          className="px-2.5 py-1.5 bg-[#c94a4a] text-white font-mono text-xs font-bold cursor-pointer"
                        >
                          CONFIRM RESET
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="px-2 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#8492a6] cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: SECTION 5 CODE vs. WORKBENCH SYNC SUMMARY */
          <div className="p-5 overflow-y-auto space-y-6">
            {/* Live Workbench vs. Baseline Game Codebase Counts (§5.3) */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 mb-3 border-b border-[#263040]">
                <span className="font-mono text-xs font-bold text-[#4cc9c0] uppercase tracking-wider">
                  Section 5.3 — Placeholder / [TODO] vs. Authored Slot Count Summary
                </span>
                <span className="font-mono text-xs text-[#d8dee9]">
                  Live <code className="text-[#4cc9c0]">faction_pools.json</code> Slots in Workbench:{' '}
                  <strong className="text-[#52b778]">{stats.factionPoolsLiveSlots.authoredSlots} Authored</strong> /{' '}
                  <strong className="text-[#e5a03c]">{stats.factionPoolsLiveSlots.todoSlots} [TODO]</strong> (Total:{' '}
                  {stats.factionPoolsLiveSlots.totalSlots})
                </span>
              </div>

              <div className="overflow-x-auto border border-[#263040]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#18202c] text-[#8492a6] border-b border-[#263040]">
                      <th className="py-2 px-3">Source / System</th>
                      <th className="py-2 px-3">Codebase Authored</th>
                      <th className="py-2 px-3">Codebase [TODO] / Placeholders</th>
                      <th className="py-2 px-3">Audit Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2633] bg-[#0b0e13]">
                    {SECTION_5_BASELINE_COUNTS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#121720]">
                        <td className="py-2 px-3 font-bold text-[#4cc9c0] whitespace-nowrap">{row.source}</td>
                        <td className="py-2 px-3 text-[#52b778] whitespace-nowrap">{row.authored}</td>
                        <td className="py-2 px-3 text-[#e5a03c] whitespace-nowrap">{row.todo}</td>
                        <td className="py-2 px-3 text-[#94a3b8] font-sans text-xs">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5.1: Hardcoded C# Text Items That Still Need Migration to JSON */}
            <div>
              <div className="font-mono text-xs font-bold text-[#e5a03c] uppercase tracking-wider pb-1.5 mb-3 border-b border-[#263040]">
                Section 5.1 — Remaining Hardcoded C# Text Items to Migrate to JSON (6 Groups)
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {SECTION_5_HARDCODED_MIGRATION_LIST.map(item => (
                  <div key={item.id} className="bg-[#18202c] border border-[#263040] p-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#d8dee9]">{item.title}</span>
                      <span className="font-mono text-[10.5px] text-[#e5a03c] bg-[#e5a03c]/10 border border-[#e5a03c]/40 px-2 py-0.5">
                        HARDCODED C# · {item.location}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5.2: Exact Code-vs-JSON Mismatches, Live Leaks & UI Overflow Hotspots */}
            <div>
              <div className="font-mono text-xs font-bold text-[#c94a4a] uppercase tracking-wider pb-1.5 mb-3 border-b border-[#263040]">
                Section 5.2 — Code-vs-JSON Mismatches, Live Placeholder Leaks &amp; +3 Font Overflow Hotspots
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {SECTION_5_MISMATCHES_AND_LEAKS.map(mm => (
                  <div key={mm.id} className="bg-[#18202c] border border-[#263040] p-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border ${
                            mm.severity === 'HIGH'
                              ? 'text-[#c94a4a] border-[#c94a4a]/50 bg-[#c94a4a]/15'
                              : 'text-[#e5a03c] border-[#e5a03c]/50 bg-[#e5a03c]/15'
                          }`}
                        >
                          {mm.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#d8dee9]">{mm.title}</span>
                      </div>
                      <span className="font-mono text-[10.5px] text-[#4cc9c0]">{mm.location}</span>
                    </div>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{mm.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface FindReplaceModalProps {
  open: boolean;
  onClose: () => void;
  state: WorkbenchState;
  onApplyState: (next: WorkbenchState) => void;
  onToast: (msg: string) => void;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  open,
  onClose,
  state,
  onApplyState,
  onToast
}) => {
  const [findText, setFindText] = useState(state.meta.corpName || 'Brengop');
  const [replaceText, setReplaceText] = useState('Brusari');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [includeLocked, setIncludeLocked] = useState(false);
  const [customCorpInput, setCustomCorpInput] = useState(state.meta.corpName || 'Brengop');

  if (!open) return null;

  const summary = previewGlobalFindReplace(state, {
    findText,
    replaceText,
    caseSensitive,
    includeLocked
  });

  const handleRunReplace = () => {
    if (!findText.trim()) {
      onToast('Enter search text first.');
      return;
    }
    const { nextState, replacedCount } = executeGlobalFindReplace(state, {
      findText,
      replaceText,
      caseSensitive,
      includeLocked
    });
    if (findText.trim().toLowerCase() === state.meta.corpName.trim().toLowerCase() && replaceText.trim()) {
      nextState.meta.corpName = replaceText.trim();
      setCustomCorpInput(replaceText.trim());
    }
    onApplyState(nextState);
    onToast(`Replaced ${replacedCount} match${replacedCount === 1 ? '' : 'es'} across the workbench.`);
  };

  const handleQuickCorpRename = () => {
    const oldCorp = state.meta.corpName.trim() || 'Brengop';
    const newCorp = customCorpInput.trim();
    if (!newCorp || oldCorp === newCorp) {
      onToast('Enter a different corporate faction name to replace.');
      return;
    }
    const { nextState, replacedCount } = executeGlobalFindReplace(state, {
      findText: oldCorp,
      replaceText: newCorp,
      caseSensitive: true,
      includeLocked
    });
    nextState.meta.corpName = newCorp;
    setFindText(newCorp);
    onApplyState(nextState);
    onToast(`Renamed corporate faction "${oldCorp}" → "${newCorp}" (${replacedCount} occurrences updated).`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#05080c]/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global Find and Replace"
        className="bg-[#121720] border border-[#e5a03c] max-w-2xl w-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[#263040] flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-[#e5a03c] tracking-wider">
            GLOBAL FIND &amp; REPLACE + CORPORATE FACTION RENAME
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-[#18202c] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
          >
            CLOSE [ESC]
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick Corporate Name Rename Box */}
          <div className="bg-[#18202c] border border-[#263040] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#4cc9c0]">
                CORPORATE FACTION NAME (BMC- REGISTRY)
              </span>
              <span className="font-mono text-xs text-[#8492a6]">
                Current: <strong className="text-[#e5a03c]">{state.meta.corpName}</strong> Mercantile Consortium
              </span>
            </div>
            <p className="text-xs text-[#8492a6]">
              Type any custom corporate name (e.g., <code className="text-[#d8dee9]">Brengop</code>,{' '}
              <code className="text-[#d8dee9]">Brusari</code>, <code className="text-[#d8dee9]">Buitar</code>,{' '}
              <code className="text-[#d8dee9]">Bancor</code>) to update the corporate label and one-click replace all
              occurrences across the project.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                aria-label="Custom corporate faction name"
                value={customCorpInput}
                onChange={e => setCustomCorpInput(e.target.value)}
                placeholder="e.g. Brusari"
                className="flex-1 min-w-[180px] bg-[#0b0e13] border border-[#334155] px-3 py-1.5 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleQuickCorpRename}
                className="px-3.5 py-1.5 bg-[#e5a03c]/15 border border-[#e5a03c] font-mono text-xs font-bold text-[#e5a03c] hover:bg-[#e5a03c] hover:text-[#0b0e13] cursor-pointer"
              >
                RENAME &quot;{state.meta.corpName}&quot; → &quot;{customCorpInput || '...'}&quot; ACROSS PROJECT
              </button>
            </div>
          </div>

          {/* Arbitrary Global Find & Replace */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold text-[#e5a03c] uppercase tracking-wider">
              Custom Global Find &amp; Replace
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-xs text-[#8492a6] mb-1">Find Text</label>
                <input
                  type="text"
                  aria-label="Find text"
                  value={findText}
                  onChange={e => setFindText(e.target.value)}
                  placeholder="Search string..."
                  className="w-full bg-[#0b0e13] border border-[#334155] px-3 py-2 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-[#8492a6] mb-1">Replace With</label>
                <input
                  type="text"
                  aria-label="Replace with text"
                  value={replaceText}
                  onChange={e => setReplaceText(e.target.value)}
                  placeholder="Replacement string..."
                  className="w-full bg-[#0b0e13] border border-[#334155] px-3 py-2 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-mono text-[#d8dee9]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={e => setCaseSensitive(e.target.checked)}
                  className="accent-[#e5a03c]"
                />
                <span>Case-Sensitive</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLocked}
                  onChange={e => setIncludeLocked(e.target.checked)}
                  className="accent-[#e5a03c]"
                />
                <span>Include Locked Cards (Day 1 / Intro)</span>
              </label>
            </div>

            {/* Live Match Breakdown */}
            <div className="bg-[#0b0e13] border border-[#263040] p-3 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#8492a6]">LIVE MATCH COUNT ACROSS ALL TABS:</span>
                <strong className="text-sm text-[#e5a03c] tabular-nums">{summary.totalMatches} matches</strong>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#8492a6] pt-1 border-t border-[#18202c]">
                <span>
                  1. Factions: <strong className="text-[#d8dee9]">{summary.byTab.factions}</strong>
                </span>
                <span>
                  2. Hails/Sys: <strong className="text-[#d8dee9]">{summary.byTab.core}</strong>
                </span>
                <span>
                  3. FORUM: <strong className="text-[#d8dee9]">{summary.byTab.forum}</strong>
                </span>
                <span>
                  4. Main Paths: <strong className="text-[#d8dee9]">{summary.byTab.paths}</strong>
                </span>
                <span>
                  5. Quests: <strong className="text-[#d8dee9]">{summary.byTab.quests}</strong>
                </span>
                <span>
                  6. Corridor/Map: <strong className="text-[#d8dee9]">{summary.byTab.corridor}</strong>
                </span>
                <span>
                  7. Endings: <strong className="text-[#d8dee9]">{summary.byTab.endings}</strong>
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#18202c] border border-[#334155] font-mono text-xs text-[#8492a6] hover:text-[#d8dee9] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={!findText || summary.totalMatches === 0}
                onClick={handleRunReplace}
                className="px-4 py-2 bg-[#e5a03c] text-[#0b0e13] font-mono text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                REPLACE ALL ({summary.totalMatches})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
