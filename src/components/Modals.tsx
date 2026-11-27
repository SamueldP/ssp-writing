import React, { useState } from 'react';
import {
  WorkbenchState,
  previewGlobalFindReplace,
  executeGlobalFindReplace,
  buildFactionPoolsExport,
  buildCorridorPostersExport,
  buildCorridorBarksExport,
  buildSectorMapExport,
  buildForumThreadsExport,
  buildQuestsExport,
  buildTutorialsExport,
  buildEndingsExport,
  buildObsidianMarkdownExport
} from '../utils/workbenchLogic';

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
  onImportFactionPoolsClick,
  onImportBackupClick,
  onResetDefaults,
  onDownloadSelfContainedHtml,
  onToast
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!open) return null;

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
        aria-label="Exports, Game JSON and Backups"
        className="bg-[#121720] border border-[#e5a03c] max-w-4xl w-full max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[#263040] flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-[#e5a03c] tracking-wider">
            GAME-READY JSON EXPORTS, OBSIDIAN SYNC & WORKBENCH BACKUPS
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-[#18202c] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
          >
            CLOSE [ESC]
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <div className="bg-[#0b0e13] border border-dashed border-[#334155] p-3.5 text-xs text-[#8492a6]">
            <strong className="font-mono text-[#e5a03c]">SAFE WORKFLOW:</strong> Browser{' '}
            <code className="text-[#4cc9c0]">localStorage</code> auto-saves every keystroke across both v1 and v2 schemas. Unfilled fields export cleanly as{' '}
            <code className="text-[#4cc9c0]">&quot;[TODO]&quot;</code> so your game parser skips them safely.
          </div>

          {/* 1. Direct Game-Ready JSON Files */}
          <div>
            <div className="font-mono text-xs font-bold text-[#e5a03c] uppercase tracking-wider pb-1.5 mb-3 border-b border-[#263040]">
              1. Direct Game-Ready JSON Files (28-Day Unified Campaign)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-[#d8dee9]">data/dialogue/faction_pools.json</div>
                  <div className="text-xs text-[#8492a6] mt-1">
                    Includes all 12 canonical ship registries + DEFAULT, all 3 reputation greeting tiers (neutral, hostile, warm), all 12 excuse keys, detention reactions, and rolling callbacks.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => expJson('faction_pools.json', buildFactionPoolsExport(state))}
                    className="px-3 py-1.5 bg-[#4cc9c0]/15 border border-[#4cc9c0] font-mono text-xs font-bold text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer"
                  >
                    EXPORT faction_pools.json
                  </button>
                  <button
                    type="button"
                    onClick={onImportFactionPoolsClick}
                    className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                  >
                    IMPORT faction_pools.json
                  </button>
                </div>
              </div>

              <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-[#d8dee9]">Morning Corridor JSONs</div>
                  <div className="text-xs text-[#8492a6] mt-1">
                    Zoomable wall posters (<code className="text-[#4cc9c0]">corridor_posters.json</code>) and proximity overhead NPC barks (<code className="text-[#4cc9c0]">corridor_barks.json</code>).
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
                  <div className="font-mono text-xs font-bold text-[#d8dee9]">data/sector_map.json & forum_threads.json</div>
                  <div className="text-xs text-[#8492a6] mt-1">
                    Star Chart systems metadata (VG-3, Gharok, Veridia, Oruun-4, Ash, Korr-Vath, Dul-Krag) and Quarters FORUM anchor posts across all 4 stages.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => expJson('sector_map.json', buildSectorMapExport(state))}
                    className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                  >
                    EXPORT sector_map.json
                  </button>
                  <button
                    type="button"
                    onClick={() => expJson('forum_threads.json', buildForumThreadsExport(state))}
                    className="px-3 py-1.5 bg-[#121720] border border-[#334155] font-mono text-xs text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer"
                  >
                    EXPORT forum_threads.json
                  </button>
                </div>
              </div>

              <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-[#d8dee9]">quests.json, tutorials.json & endings.json</div>
                  <div className="text-xs text-[#8492a6] mt-1">
                    All non-CUT quests with dynamic beats & sort days, diegetic Quarters/Desk tutorial nudges, and all 7 campaign endings.
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

          {/* 2. Obsidian Sync, Standalone HTML & Full Backups */}
          <div>
            <div className="font-mono text-xs font-bold text-[#e5a03c] uppercase tracking-wider pb-1.5 mb-3 border-b border-[#263040]">
              2. Obsidian Vault Markdown, Standalone Offline HTML & Workbench Backups
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#18202c] border border-[#263040] p-3.5 flex flex-col justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-[#d8dee9]">Obsidian Markdown & Standalone HTML</div>
                  <div className="text-xs text-[#8492a6] mt-1">
                    Export complete <code className="text-[#4cc9c0]">Subspace_Protocols_Authored_Writing.md</code> (including hostile/warm greetings, callbacks, custom quests, and quartersMisc) or download the standalone offline <code className="text-[#4cc9c0]">.html</code> file.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadFile('Subspace_Protocols_Authored_Writing.md', buildObsidianMarkdownExport(state), 'text/markdown');
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
                  <div className="font-mono text-xs font-bold text-[#d8dee9]">Full Workbench Backup & Reset</div>
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
            GLOBAL FIND & REPLACE + CORPORATE FACTION RENAME
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
              Type any custom corporate name (e.g., <code className="text-[#d8dee9]">Brengop</code>, <code className="text-[#d8dee9]">Brusari</code>, <code className="text-[#d8dee9]">Buitar</code>, <code className="text-[#d8dee9]">Bancor</code>) to update the corporate label and one-click replace all occurrences across the project.
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
              Custom Global Find & Replace
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
                <span>1. Factions: <strong className="text-[#d8dee9]">{summary.byTab.factions}</strong></span>
                <span>2. Hails/Sys: <strong className="text-[#d8dee9]">{summary.byTab.core}</strong></span>
                <span>3. FORUM: <strong className="text-[#d8dee9]">{summary.byTab.forum}</strong></span>
                <span>4. Main Paths: <strong className="text-[#d8dee9]">{summary.byTab.paths}</strong></span>
                <span>5. Quests: <strong className="text-[#d8dee9]">{summary.byTab.quests}</strong></span>
                <span>6. Corridor/Map: <strong className="text-[#d8dee9]">{summary.byTab.corridor}</strong></span>
                <span>7. Endings: <strong className="text-[#d8dee9]">{summary.byTab.endings}</strong></span>
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
