import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Shuffle,
  Download,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Lock,
  FileCheck2
} from 'lucide-react';
import {
  STORAGE_KEY_V1,
  STORAGE_KEY_V2,
  FACTIONS,
  EXCUSE_KEYS,
  FACTION_POOL_TOKENS,
  FORUM_VARIABLES,
  FORUM_STAGES,
  FORUM_PILLARS,
  WorkbenchState,
  CoreItem,
  QuestItem,
  buildDefaultState,
  migrateState,
  hasText,
  getStructuredItemStatus,
  getFactionCardStatus,
  getForumThreadStatus,
  getPosterStatus,
  getBarkStatus,
  getStarChartStatus,
  getEndingStatus,
  matchesStatusFilter,
  calcFactionStats,
  calcAllStats,
  buildFactionPoolsExport,
  applyImportedFactionPools,
  buildForumDatabaseExport,
  buildCovertMissionsExport,
  buildCorridorPostersExport,
  buildCorridorBarksExport,
  buildSectorMapExport,
  collectUnfinishedTargets
} from './utils/workbenchLogic';
import {
  StatusLabel,
  SourceBadge,
  InGameContextStrip,
  CurrentlyInGameBox,
  EncounterFlowReferencePanel,
  RaylibTextarea
} from './components/WorkbenchControls';
import { getFactionCardAuditDetails } from './utils/auditReferenceData';
import { ExportModal, FindReplaceModal, downloadFile } from './components/Modals';
import { downloadStandaloneOfflineHtml } from './utils/standaloneHtmlBuilder';

const NAV_TABS: {
  id: WorkbenchState['meta']['activeTab'];
  num: string;
  name: string;
}[] = [
  { id: 'factions', num: '1.', name: 'Faction Pools' },
  { id: 'core', num: '2.', name: 'Hails & Systems' },
  { id: 'forum', num: '3.', name: 'FORUM' },
  { id: 'paths', num: '4.', name: 'Main Paths' },
  { id: 'quests', num: '5.', name: 'Faces & Quests' },
  { id: 'corridor', num: '6.', name: 'Corridor & Map' },
  { id: 'endings', num: '7.', name: 'Endings' }
];

function loadInitialWorkbenchState(): WorkbenchState {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      return migrateState(JSON.parse(rawV2));
    }
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const migrated = migrateState(JSON.parse(rawV1));
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
      return migrated;
    }
  } catch (e) {
    console.warn('Failed to parse saved workbench state, using defaults:', e);
  }
  return buildDefaultState();
}

export default function App() {
  const [state, setState] = useState<WorkbenchState>(loadInitialWorkbenchState);
  const [searchQuery, setSearchQuery] = useState('');
  const [factionSection, setFactionSection] = useState<'greetings' | 'excuses' | 'detention' | 'all'>('greetings');
  // Accordion behavior: by default cards start collapsed (except the first greeting card) so the workspace is clean and easy to scan
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'fp_FTV-_greetings': true,
    'fp_FTV-_greetingsHostile': true,
    'fp_FTV-_greetingsWarm': true
  });
  const [saveTime, setSaveTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [serverSyncStatus, setServerSyncStatus] = useState<'loading' | 'synced' | 'saving' | 'offline'>('loading');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authConfigured, setAuthConfigured] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalInitialView, setExportModalInitialView] = useState<'exports' | 'audit'>('exports');
  const [findReplaceModalOpen, setFindReplaceModalOpen] = useState(false);
  const [manageHandlesOpen, setManageHandlesOpen] = useState(false);
  const [newHandleInput, setNewHandleInput] = useState('');
  const [confirmDeleteQuestId, setConfirmDeleteQuestId] = useState<string | null>(null);

  const lastFocusedTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const importBackupInputRef = useRef<HTMLInputElement | null>(null);
  const importFactionPoolsInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const hasHydratedFromServerRef = useRef<boolean>(false);
  const saveDebounceTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2800);
  };

  // Check server auth status on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setAuthConfigured(Boolean(data?.configured));
        setAuthChecking(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthChecking(false);
        setServerSyncStatus('offline');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load persisted state from server.ts (/api/state) once authenticated
  useEffect(() => {
    if (!authToken) return;
    let cancelled = false;
    fetch('/api/state', {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(res => {
        if (res.status === 401) {
          setAuthToken(null);
          throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('Server state unavailable');
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        if (data && data.state) {
          const serverState = migrateState(data.state);
          const serverStats = calcAllStats(serverState);
          const localStats = calcAllStats(state);
          const defaultStats = calcAllStats(buildDefaultState());
          if (localStats.words > serverStats.words && serverStats.words <= defaultStats.words) {
            hasHydratedFromServerRef.current = true;
            fetch('/api/state', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
              },
              body: JSON.stringify({ state })
            })
              .then(() => {
                if (!cancelled) setServerSyncStatus('synced');
              })
              .catch(() => {
                if (!cancelled) setServerSyncStatus('offline');
              });
          } else {
            hasHydratedFromServerRef.current = true;
            setState(serverState);
            setServerSyncStatus('synced');
          }
        } else {
          hasHydratedFromServerRef.current = true;
          setServerSyncStatus('synced');
        }
      })
      .catch(() => {
        if (!cancelled) {
          hasHydratedFromServerRef.current = true;
          setServerSyncStatus('offline');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  // Auto-save to both localStorage (instant) and server.ts /api/state (debounced 400ms)
  useEffect(() => {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY_V2, serialized);
      localStorage.setItem(STORAGE_KEY_V1, serialized);
      setSaveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      // ignore quota warnings in effect
    }

    if (!authToken || !hasHydratedFromServerRef.current) return;
    setServerSyncStatus('saving');
    if (saveDebounceTimerRef.current) window.clearTimeout(saveDebounceTimerRef.current);
    saveDebounceTimerRef.current = window.setTimeout(() => {
      fetch('/api/state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ state })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed save');
          setServerSyncStatus('synced');
        })
        .catch(() => {
          setServerSyncStatus('offline');
        });
    }, 400);
  }, [state, authToken]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const trimmed = passcodeInput.trim();
    if (!trimmed) {
      setAuthError('Enter a passcode.');
      return;
    }
    const endpoint = authConfigured ? '/api/auth/login' : '/api/auth/setup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed })
      });
      const data = await res.json();
      if (!res.ok || !data?.token) {
        setAuthError(data?.error || 'Authentication failed.');
        return;
      }
      setAuthConfigured(true);
      setPasscodeInput('');
      setAuthToken(data.token);
      showToast('Booth 04 terminal unlocked & synced.');
    } catch {
      setAuthError('Could not reach server authentication endpoint.');
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch {
        // ignore network error on logout
      }
    }
    hasHydratedFromServerRef.current = false;
    setAuthToken(null);
  };

  // Escape key closes modals
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExportModalOpen(false);
        setFindReplaceModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const stats = calcAllStats(state);
  const overallPct = stats.allTot ? Math.round((stats.allDone / stats.allTot) * 100) : 0;

  const isCardExpanded = (cardId: string): boolean => {
    if (searchQuery.trim().length > 0) return true;
    return !!expandedCards[cardId];
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const setAllExpanded = (expand: boolean) => {
    if (!expand) {
      setExpandedCards({});
      return;
    }
    const next: Record<string, boolean> = {};
    const activeCode = state.meta.activeFaction || 'FTV-';
    next[`fp_${activeCode}_greetings`] = true;
    next[`fp_${activeCode}_greetingsHostile`] = true;
    next[`fp_${activeCode}_greetingsWarm`] = true;
    EXCUSE_KEYS.forEach(ek => { next[`fp_${activeCode}_excuses.${ek.key}`] = true; });
    next[`fp_${activeCode}_detentionReactions`] = true;
    next[`fp_${activeCode}_recentCallbacks.ClearedViolation`] = true;
    next[`fp_${activeCode}_recentCallbacks.RepeatedDetentions`] = true;
    next[`fp_${activeCode}_recentCallbacks.TookBribe`] = true;

    state.coreItems.forEach(it => {
      if (!it.locked) next[`coreItems_${it.id}`] = true;
    });
    state.mainPaths.forEach(it => { next[`mainPaths_${it.id}`] = true; });
    state.quests.forEach(q => { next[`quests_${q.id}`] = true; });
    state.forumThreads.forEach(t => { next[`forum_${t.id}`] = true; });
    state.corridorPosters.forEach(p => { next[`poster_${p.id}`] = true; });
    state.corridorBarks.forEach(b => { next[`bark_${b.id}`] = true; });
    state.quartersMisc.forEach(it => { next[`quartersMisc_${it.id}`] = true; });
    state.endings.forEach(e => { next[`ending_${e.id}`] = true; });
    setExpandedCards(next);
  };

  const matchesSearch = (blob: string): boolean => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return blob.toLowerCase().includes(q);
  };

  // "Pick One For Me" Sprint Button
  const handlePickOneForMe = () => {
    const targets = collectUnfinishedTargets(state);
    if (targets.length === 0) {
      showToast('All active campaign items are marked DONE!');
      return;
    }
    const pick = targets[Math.floor(Math.random() * targets.length)];
    setSearchQuery('');
    if (pick.tab === 'factions') {
      setFactionSection('all');
    }
    setState(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        activeTab: pick.tab,
        activeFaction: pick.factionCode || prev.meta.activeFaction,
        filter: 'all'
      }
    }));
    setExpandedCards(prev => ({ ...prev, [pick.cardId]: true }));
    showToast(`Sprint target: ${pick.title} [${pick.status}]`);

    window.setTimeout(() => {
      const cardEl = document.querySelector(`[data-card-id="${pick.cardId}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const textareas = Array.from(cardEl.querySelectorAll('textarea'));
        const firstEmpty = textareas.find(ta => !hasText(ta.value)) || textareas[0];
        if (firstEmpty) {
          firstEmpty.focus();
          lastFocusedTextareaRef.current = firstEmpty;
        }
      }
    }, 120);
  };

  // File Import Handlers
  const handleImportFactionPoolsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(txt => {
      try {
        const parsed = JSON.parse(txt);
        const { nextState, importedCount } = applyImportedFactionPools(state, parsed);
        setState(nextState);
        setExportModalOpen(false);
        showToast(`Imported ${importedCount} faction pools from ${file.name}`);
      } catch (err: any) {
        showToast('Invalid faction_pools.json: ' + err.message);
      }
    });
    e.target.value = '';
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(txt => {
      try {
        const parsed = JSON.parse(txt);
        const migrated = migrateState(parsed);
        setState(migrated);
        setExportModalOpen(false);
        showToast(`Restored full backup from ${file.name}`);
      } catch (err: any) {
        showToast('Invalid backup JSON: ' + err.message);
      }
    });
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    localStorage.removeItem(STORAGE_KEY_V1);
    localStorage.removeItem(STORAGE_KEY_V2);
    setState(buildDefaultState());
    setExpandedCards({
      'fp_FTV-_greetings': true,
      'fp_FTV-_greetingsHostile': true,
      'fp_FTV-_greetingsWarm': true
    });
    showToast('Workbench reset to canonical 28-day defaults.');
  };

  // Token insertion into last focused FORUM textarea
  const insertTokenIntoForum = (token: string) => {
    const ta = lastFocusedTextareaRef.current;
    if (!ta || !document.body.contains(ta)) {
      showToast('Click inside a FORUM post textarea first, then click the chip to insert.');
      return;
    }
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const val = ta.value;
    const nextVal = val.slice(0, start) + token + val.slice(end);
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(ta, nextVal);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
    ta.setSelectionRange(start + token.length, start + token.length);
  };

  // ---------- RENDER MODULE 1: FACTION POOLS ----------
  const renderFactionsTab = () => {
    const activeCode = state.meta.activeFaction || 'FTV-';
    const fMeta = FACTIONS.find(f => f.code === activeCode) || FACTIONS[0];
    const pool = state.factionPools[activeCode];
    const doneFlags = pool.doneFlags || {};

    const selectFaction = (code: string) => {
      setState(prev => ({
        ...prev,
        meta: { ...prev.meta, activeFaction: code }
      }));
      setExpandedCards(prev => ({
        ...prev,
        [`fp_${code}_greetings`]: true,
        [`fp_${code}_greetingsHostile`]: true,
        [`fp_${code}_greetingsWarm`]: true
      }));
    };

    const updateLine = (arrKey: string, idx: number, val: string) => {
      setState(prev => {
        const next = { ...prev, factionPools: { ...prev.factionPools } };
        const p = { ...next.factionPools[activeCode] };
        if (arrKey.startsWith('excuses.')) {
          const k = arrKey.split('.')[1];
          p.excuses = { ...p.excuses, [k]: p.excuses[k].map((x, i) => (i === idx ? val : x)) };
        } else if (arrKey.startsWith('recentCallbacks.')) {
          const k = arrKey.split('.')[1] as keyof typeof p.recentCallbacks;
          p.recentCallbacks = {
            ...p.recentCallbacks,
            [k]: p.recentCallbacks[k].map((x, i) => (i === idx ? val : x))
          };
        } else {
          const k = arrKey as 'greetings' | 'greetingsHostile' | 'greetingsWarm' | 'detentionReactions';
          p[k] = p[k].map((x, i) => (i === idx ? val : x));
        }
        next.factionPools[activeCode] = p;
        return next;
      });
    };

    const addLine = (arrKey: string) => {
      const cardId = `fp_${activeCode}_${arrKey}`;
      setExpandedCards(prev => ({ ...prev, [cardId]: true }));
      setState(prev => {
        const next = { ...prev, factionPools: { ...prev.factionPools } };
        const p = { ...next.factionPools[activeCode] };
        if (arrKey.startsWith('excuses.')) {
          const k = arrKey.split('.')[1];
          p.excuses = { ...p.excuses, [k]: [...(p.excuses[k] || []), ''] };
        } else if (arrKey.startsWith('recentCallbacks.')) {
          const k = arrKey.split('.')[1] as keyof typeof p.recentCallbacks;
          p.recentCallbacks = { ...p.recentCallbacks, [k]: [...p.recentCallbacks[k], ''] };
        } else {
          const k = arrKey as 'greetings' | 'greetingsHostile' | 'greetingsWarm' | 'detentionReactions';
          p[k] = [...p[k], ''];
        }
        next.factionPools[activeCode] = p;
        return next;
      });
    };

    const removeLine = (arrKey: string, idx: number) => {
      setState(prev => {
        const next = { ...prev, factionPools: { ...prev.factionPools } };
        const p = { ...next.factionPools[activeCode] };
        if (arrKey.startsWith('excuses.')) {
          const k = arrKey.split('.')[1];
          if (p.excuses[k].length <= 1) return prev;
          p.excuses = { ...p.excuses, [k]: p.excuses[k].filter((_, i) => i !== idx) };
        } else if (arrKey.startsWith('recentCallbacks.')) {
          const k = arrKey.split('.')[1] as keyof typeof p.recentCallbacks;
          if (p.recentCallbacks[k].length <= 1) return prev;
          p.recentCallbacks = { ...p.recentCallbacks, [k]: p.recentCallbacks[k].filter((_, i) => i !== idx) };
        } else {
          const k = arrKey as 'greetings' | 'greetingsHostile' | 'greetingsWarm' | 'detentionReactions';
          if (p[k].length <= 1) return prev;
          p[k] = p[k].filter((_, i) => i !== idx);
        }
        next.factionPools[activeCode] = p;
        return next;
      });
    };

    const toggleFactionCardDone = (arrKey: string) => {
      setState(prev => {
        const next = { ...prev, factionPools: { ...prev.factionPools } };
        const p = { ...next.factionPools[activeCode] };
        const flags = { ...(p.doneFlags || {}) };
        flags[arrKey] = !flags[arrKey];
        p.doneFlags = flags;
        next.factionPools[activeCode] = p;
        return next;
      });
    };

    const renderPoolCard = (
      arrKey: string,
      title: string,
      dayBadge: string,
      categoryLabel: string,
      hint: string,
      arr: string[],
      softLimit = 140
    ) => {
      const cardId = `fp_${activeCode}_${arrKey}`;
      const status = getFactionCardStatus(arr, doneFlags[arrKey]);
      const filledCount = arr.filter(hasText).length;
      const firstPreview = arr.find(hasText);
      const audit = getFactionCardAuditDetails(activeCode, arrKey);
      const blob = `${activeCode} ${fMeta.name} ${title} ${dayBadge} ${categoryLabel} ${hint} ${audit.currentlyInGame} ${audit.currentSource} ${arr.join(' ')}`;

      if (!matchesStatusFilter(status, state.meta.filter) || !matchesSearch(blob)) return null;
      const expanded = isCardExpanded(cardId);

      return (
        <div
          key={cardId}
          data-card-id={cardId}
          className={`border mb-2 transition-colors ${
            expanded ? 'bg-[#151c27] border-[#334155]' : 'bg-[#121720] border-[#222b38] hover:border-[#334155]'
          }`}
        >
          <div
            onClick={() => toggleCard(cardId)}
            className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-[#e5a03c] shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
              )}
              <span className="font-mono text-xs font-bold text-[#d8dee9] truncate">{title}</span>
              <span className="font-mono text-[11px] text-[#64748b] whitespace-nowrap">
                {dayBadge} · {filledCount}/{arr.length}
              </span>
              <StatusLabel status={status} />
              <SourceBadge badge={audit.badge} />
              {!expanded && firstPreview && (
                <span className="font-mono text-[11px] text-[#8492a6] truncate hidden xl:inline ml-1 italic max-w-xs">
                  &ldquo;{firstPreview}&rdquo;
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => addLine(arrKey)}
                className="px-2 py-0.5 bg-[#0b0e13] border border-[#263040] font-mono text-[10.5px] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9] cursor-pointer"
              >
                + LINE
              </button>
              <button
                type="button"
                onClick={() => toggleFactionCardDone(arrKey)}
                className={`px-2 py-0.5 border font-mono text-[10.5px] cursor-pointer whitespace-nowrap ${
                  status === 'DONE'
                    ? 'bg-[#52b778]/15 border-[#52b778] text-[#52b778] font-bold'
                    : 'bg-[#0b0e13] border-[#263040] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9]'
                }`}
              >
                {status === 'DONE' ? 'DONE ✓' : 'MARK DONE'}
              </button>
            </div>
          </div>

          {expanded && (
            <div className="px-4 pb-3.5 pt-2.5 border-t border-[#1e2633] space-y-2.5">
              <p className="text-xs text-[#8492a6]">{hint}</p>

              {/* Section 1: In-Game Context Strip (BEFORE -> THIS LINE -> AFTER) */}
              <InGameContextStrip flow={audit.contextFlow} />

              {/* Section 3: Currently In Game Verbatim Reference Box */}
              <CurrentlyInGameBox
                text={audit.currentlyInGame}
                source={audit.currentSource}
                badge={audit.badge}
              />

              {arr.map((val, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-[11px] text-[#5a6678] pt-2 w-5 shrink-0 tabular-nums">
                    #{idx + 1}
                  </span>
                  <div className="flex-1">
                    <RaylibTextarea
                      value={val}
                      rows={2}
                      raylibPreset="comms_line"
                      softLimit={softLimit}
                      limitLabel="CRT Comms Dialogue Box (334px)"
                      ariaLabel={`${activeCode} ${title} line ${idx + 1}`}
                      placeholder={`Write ${activeCode} variation #${idx + 1} (blank exports as "[TODO]" in faction_pools.json)...`}
                      onFocus={el => { lastFocusedTextareaRef.current = el; }}
                      onChange={v => updateLine(arrKey, idx, v)}
                    />
                  </div>
                  {arr.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(arrKey, idx)}
                      aria-label={`Remove line ${idx + 1}`}
                      className="mt-1 px-2 py-1 bg-[#0b0e13] border border-[#263040] text-[#8492a6] hover:border-[#c94a4a] hover:text-[#c94a4a] font-mono text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const displayName = fMeta.code === 'BMC-' ? `${state.meta.corpName} Mercantile Consortium` : fMeta.name;
    const showAllSections = factionSection === 'all' || searchQuery.trim().length > 0;
    const liveJsonExcuseKeys = EXCUSE_KEYS.filter(ek => ek.inFactionPoolsJson);
    const nonJsonExcuseKeys = EXCUSE_KEYS.filter(ek => !ek.inFactionPoolsJson);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar: 13 Canonical Ship Registries */}
        <aside className="lg:col-span-3 bg-[#121720] border border-[#222b38]">
          <div className="px-3.5 py-2.5 border-b border-[#222b38] flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider">
              Registries (13)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => importFactionPoolsInputRef.current?.click()}
                title="Import faction_pools.json"
                className="px-1.5 py-0.5 bg-[#0b0e13] border border-[#263040] font-mono text-[10px] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9] cursor-pointer"
              >
                IMPORT
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadFile(
                    'faction_pools.json',
                    JSON.stringify(buildFactionPoolsExport(state, { strictCSharpSchema: true }), null, 2)
                  );
                  showToast('Exported 1-to-1 C# faction_pools.json');
                }}
                title="Export 1-to-1 C# data/dialogue/faction_pools.json"
                className="px-1.5 py-0.5 bg-[#4cc9c0]/15 border border-[#4cc9c0]/60 font-mono text-[10px] font-bold text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer"
              >
                EXPORT
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#1a222d]">
            {FACTIONS.map(f => {
              const st = calcFactionStats(state, f.code);
              const isSelected = f.code === activeCode;
              const fName = f.code === 'BMC-' ? `${state.meta.corpName} Mercantile Consortium` : f.name;
              const isAuthoredInRepo = f.code === 'FTV-' || f.code === 'MNG-';
              return (
                <button
                  key={f.code}
                  type="button"
                  onClick={() => selectFaction(f.code)}
                  className={`w-full px-3.5 py-2 text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#1a2332] border-l-2 border-l-[#e5a03c]'
                      : 'hover:bg-[#161d28]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[#e5a03c]' : 'text-[#d8dee9]'}`}>
                        {f.code}
                      </span>
                      <span className="text-[11px] text-[#8492a6] truncate">{fName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isAuthoredInRepo && (
                      <span
                        title="19 lines authored in live data/dialogue/faction_pools.json"
                        className="px-1 py-0.2 bg-[#52b778]/15 border border-[#52b778]/50 font-mono text-[9px] text-[#52b778]"
                      >
                        LIVE
                      </span>
                    )}
                    <span
                      className={`font-mono text-[10px] tabular-nums shrink-0 ${
                        st.done === st.total
                          ? 'text-[#52b778] font-bold'
                          : st.done > 0 || st.draft > 0
                          ? 'text-[#e5a03c]'
                          : 'text-[#5a6678]'
                      }`}
                    >
                      {st.done}/{st.total}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Panel: Selected Faction Editor */}
        <div className="lg:col-span-9 space-y-3.5">
          {/* Section 1 Collapsible Turn-by-Turn Encounter Script Flow Reference */}
          <EncounterFlowReferencePanel />

          {/* Active Faction Header, Token Chips & Section Filter */}
          <div className="bg-[#121720] border border-[#222b38] p-4 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-mono text-sm font-bold text-[#e5a03c]">
                  {fMeta.code} // {displayName.toUpperCase()}
                </h2>
                <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{fMeta.vibe}</p>
              </div>
            </div>

            {/* Active C# Runtime Token Chips (DialogueSystem.cs:111-119) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1e2633]">
              <span className="font-mono text-[10px] font-bold text-[#52b778] uppercase tracking-wider mr-1">
                C# RUNTIME TOKENS (DialogueSystem.cs:111-119):
              </span>
              {FACTION_POOL_TOKENS.map(tok => (
                <button
                  key={tok}
                  type="button"
                  onClick={() => insertTokenIntoForum(tok)}
                  title="Click to insert token into the last focused Faction Pool textarea"
                  className="px-2 py-0.5 bg-[#0b0e13] border border-[#52b778]/50 font-mono text-[11px] text-[#52b778] hover:bg-[#52b778] hover:text-[#0b0e13] cursor-pointer"
                >
                  {tok}
                </button>
              ))}
              <span className="font-mono text-[10px] text-[#64748b] ml-1">
                (Click inside any line below, then click a token to insert)
              </span>
            </div>

            {/* Clean Category Sub-Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1e2633]">
              {([
                { id: 'greetings', label: 'Arrival Greetings (3)' },
                { id: 'excuses', label: 'Protocol Excuses (9 JSON + 9 C#/Future)' },
                { id: 'detention', label: 'Detention & Callbacks (4)' },
                { id: 'all', label: 'Show All (25)' }
              ] as const).map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setFactionSection(sec.id)}
                  className={`px-3 py-1 font-mono text-xs border cursor-pointer transition-colors ${
                    factionSection === sec.id
                      ? 'bg-[#e5a03c] text-[#0b0e13] border-[#e5a03c] font-bold'
                      : 'bg-[#0b0e13] text-[#8492a6] border-[#263040] hover:text-[#d8dee9]'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: 3 Reputation Greeting Tiers */}
          {(showAllSections || factionSection === 'greetings') && (
            <div className="space-y-2">
              <div className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider px-1">
                Arrival Greetings — Neutral (Live JSON) + Reputation Tiers ({activeCode})
              </div>
              {renderPoolCard(
                'greetings',
                `${activeCode} Neutral Arrival Greetings`,
                'Day 1+',
                'Standard Comms',
                'Live in faction_pools.json under greetings[]. Selected by DialogueSystem.SelectArrivalGreeting when no recentCallbacks trigger.',
                pool.greetings
              )}
              {renderPoolCard(
                'greetingsHostile',
                `${activeCode} Low-Rep Hostile Greetings (rep <= -5)`,
                'Day 1+',
                'Reputation Tier: Hostile',
                'Not yet wired in C# FactionDialoguePool class (rep only biases callback chance 25%..65%). Excluded from strict 1-to-1 C# JSON export until wired.',
                pool.greetingsHostile
              )}
              {renderPoolCard(
                'greetingsWarm',
                `${activeCode} High-Rep Warm Greetings (rep >= +6)`,
                'Day 1+',
                'Reputation Tier: Warm',
                'Not yet wired in C# FactionDialoguePool class. Excluded from strict 1-to-1 C# JSON export until wired.',
                pool.greetingsWarm
              )}
            </div>
          )}

          {/* Section 2: All 18 Excuse Types (9 Live JSON + 6 Hardcoded C# + 3 Future Enum) */}
          {(showAllSections || factionSection === 'excuses') && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="font-mono text-[11px] font-bold text-[#52b778] uppercase tracking-wider px-1">
                  Live JSON Protocol Review Excuses — 9 Exact Keys in data/dialogue/faction_pools.json ({activeCode})
                </div>
                {liveJsonExcuseKeys.map(ek =>
                  renderPoolCard(
                    `excuses.${ek.key}`,
                    ek.label,
                    ek.day,
                    ek.system,
                    `Captain deflection when challenged for ${ek.key} during Protocol Review. Exported in strict 1-to-1 faction_pools.json.`,
                    pool.excuses[ek.key] || ['']
                  )
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="font-mono text-[11px] font-bold text-[#e5a03c] uppercase tracking-wider px-1">
                  C#-Hardcoded & Future Enum Excuse Keys — 6 Active in ShipGenerator.cs + 3 Future Enum Keys ({activeCode})
                </div>
                {nonJsonExcuseKeys.map(ek =>
                  renderPoolCard(
                    `excuses.${ek.key}`,
                    ek.label,
                    ek.day,
                    ek.system,
                    `Currently falls back to ShipGenerator.cs:1085-1127 because "${ek.key}" is absent from faction_pools.json. Excluded from strict 1-to-1 JSON export unless full workbench schema is selected.`,
                    pool.excuses[ek.key] || ['']
                  )
                )}
              </div>
            </div>
          )}

          {/* Section 3: Detention Reactions & Rolling Callbacks */}
          {(showAllSections || factionSection === 'detention') && (
            <div className="space-y-2">
              <div className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider px-1">
                Detention Reactions & Rolling 2–3 Shift Callbacks ({activeCode})
              </div>
              {renderPoolCard(
                'detentionReactions',
                `${activeCode} Detention Clamp Reactions`,
                'Day 1+',
                'Detain Lever',
                'Short reaction when the player pulls the Detain Lever and Booth 04 docking clamps lock on.',
                pool.detentionReactions
              )}
              {renderPoolCard(
                'recentCallbacks.ClearedViolation',
                'Recent Callback — Cleared a Violation (Last 2–3 Shifts)',
                'Day 1+',
                'Rolling Memory',
                'Atmospheric callback referencing faction + recent leniency (replaces greeting when 25%..65% roll succeeds).',
                pool.recentCallbacks.ClearedViolation
              )}
              {renderPoolCard(
                'recentCallbacks.RepeatedDetentions',
                'Recent Callback — Repeated Detentions (Last 2–3 Shifts)',
                'Day 1+',
                'Rolling Memory',
                'Word got around the corridor that Booth 04 has been clamping their registry recently.',
                pool.recentCallbacks.RepeatedDetentions
              )}
              {renderPoolCard(
                'recentCallbacks.TookBribe',
                'Recent Callback — Accepted a Subspace Bribe (Last 2–3 Shifts)',
                'Day 18+',
                'Rolling Memory',
                'Subtle gossip hint that Booth 04 is willing to look the other way for 25–40 SC.',
                pool.recentCallbacks.TookBribe
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- GENERIC STRUCTURED LIST RENDERER (TAB 2, TAB 4, QUARTERS MISC) ----------
  const renderStructuredCollection = (
    collectionKey: 'coreItems' | 'mainPaths' | 'quartersMisc',
    items: CoreItem[],
    defaultSoftLimit = 240
  ) => {
    const groups: Record<string, { item: CoreItem; index: number }[]> = {};
    items.forEach((item, index) => {
      const g = item.group || 'Items';
      if (!groups[g]) groups[g] = [];
      groups[g].push({ item, index });
    });

    const updateField = (itemIdx: number, fieldIdx: number, val: string) => {
      setState(prev => {
        const list = [...prev[collectionKey]];
        const target = { ...list[itemIdx], fields: [...list[itemIdx].fields] };
        target.fields[fieldIdx] = { ...target.fields[fieldIdx], value: val };
        list[itemIdx] = target;
        return { ...prev, [collectionKey]: list };
      });
    };

    const toggleDone = (itemIdx: number) => {
      setState(prev => {
        const list = [...prev[collectionKey]];
        list[itemIdx] = { ...list[itemIdx], done: !list[itemIdx].done };
        return { ...prev, [collectionKey]: list };
      });
    };

    const sections = Object.entries(groups).map(([groupName, entries]) => {
      const doneInGroup = entries.filter(e => {
        const st = getStructuredItemStatus(e.item);
        return st === 'DONE' || st === 'LOCKED';
      }).length;

      const visibleCards = entries
        .map(({ item, index }) => {
          const status = getStructuredItemStatus(item);
          const blob = `${item.title} ${item.day} ${item.category} ${item.hint} ${item.context || ''} ${
            item.currentlyInGame || ''
          } ${item.currentSource || ''} ${item.fields
            .map(f => `${f.label} ${f.value} ${f.currentlyInGame || ''} ${f.currentSource || ''}`)
            .join(' ')}`;
          if (!matchesStatusFilter(status, state.meta.filter) || !matchesSearch(blob)) return null;

          const cardId = `${collectionKey}_${item.id}`;
          const expanded = isCardExpanded(cardId);

          return (
            <div
              key={cardId}
              data-card-id={cardId}
              className={`border mb-2 transition-colors ${
                expanded ? 'bg-[#151c27] border-[#334155]' : 'bg-[#121720] border-[#222b38] hover:border-[#334155]'
              }`}
            >
              <div
                onClick={() => toggleCard(cardId)}
                className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-[#e5a03c] shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
                  )}
                  <span className="font-mono text-xs font-bold text-[#d8dee9] truncate">{item.title}</span>
                  <span className="font-mono text-[11px] text-[#e5a03c] whitespace-nowrap">{item.day}</span>
                  <span className="font-mono text-[11px] text-[#64748b] truncate hidden sm:inline">
                    · {item.category}
                  </span>
                  <StatusLabel status={status} />
                  <SourceBadge badge={item.sourceBadge} />
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  {!item.locked && (
                    <button
                      type="button"
                      onClick={() => toggleDone(index)}
                      className={`px-2 py-0.5 border font-mono text-[10.5px] cursor-pointer whitespace-nowrap ${
                        item.done
                          ? 'bg-[#52b778]/15 border-[#52b778] text-[#52b778] font-bold'
                          : 'bg-[#0b0e13] border-[#263040] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9]'
                      }`}
                    >
                      {item.done ? 'DONE ✓' : 'MARK DONE'}
                    </button>
                  )}
                </div>
              </div>

              {expanded && (
                <div className="px-4 pb-4 pt-2.5 border-t border-[#1e2633] space-y-3">
                  {item.hint && <p className="text-xs text-[#8492a6]">{item.hint}</p>}
                  {item.context && (
                    <div className="bg-[#0b0e13] border border-[#222b38] p-2.5 text-xs text-[#94a3b8]">
                      <strong className="font-mono text-[#e5a03c]">CONTEXT:</strong> {item.context}
                    </div>
                  )}

                  {/* Section 1: In-Game Context Strip */}
                  <InGameContextStrip flow={item.inGameContext} />

                  {/* Section 3: Item-Level Currently In Game Reference */}
                  <CurrentlyInGameBox
                    text={item.currentlyInGame}
                    source={item.currentSource}
                    badge={item.sourceBadge}
                  />

                  {item.fields.map((f, fIdx) => (
                    <div key={f.key} className="space-y-1.5 bg-[#0f141d] border border-[#1e2633] p-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="block font-mono text-[11px] font-bold text-[#cbd5e1]">{f.label}</label>
                        {f.sourceBadge && <SourceBadge badge={f.sourceBadge} />}
                      </div>

                      {f.inGameContext && <InGameContextStrip flow={f.inGameContext} />}

                      <CurrentlyInGameBox
                        text={f.currentlyInGame}
                        source={f.currentSource || item.currentSource}
                        badge={f.sourceBadge || item.sourceBadge}
                        onCopyToEditor={
                          !item.locked && f.currentlyInGame && !f.currentlyInGame.startsWith('(')
                            ? () => updateField(index, fIdx, f.currentlyInGame!.replace(/^"|"$/g, ''))
                            : undefined
                        }
                      />

                      <RaylibTextarea
                        value={f.value}
                        readOnly={!!item.locked}
                        rows={
                          f.value && f.value.split('\n').length > 3
                            ? Math.min(8, f.value.split('\n').length + 1)
                            : 3
                        }
                        raylibPreset={f.raylibPreset || item.raylibPreset || 'comms_line'}
                        softLimit={f.softLimit ?? defaultSoftLimit}
                        limitLabel="Standard Hail / Directive"
                        ariaLabel={`${item.title} - ${f.label}`}
                        placeholder="Write dialogue or directive copy here..."
                        onFocus={el => { lastFocusedTextareaRef.current = el; }}
                        onChange={v => updateField(index, fIdx, v)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
        .filter(Boolean);

      if (visibleCards.length === 0) return null;

      return (
        <div key={groupName} className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#222b38]">
            <h3 className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider">{groupName}</h3>
            <span className="font-mono text-[11px] text-[#64748b] tabular-nums">
              {doneInGroup} / {entries.length} DONE
            </span>
          </div>
          {visibleCards}
        </div>
      );
    });

    const nonNull = sections.filter(Boolean);
    if (nonNull.length === 0) {
      return (
        <div className="bg-[#121720] border border-dashed border-[#263040] p-6 text-center font-mono text-xs text-[#8492a6]">
          No cards match the active status filter or search query. Click <strong className="text-[#e5a03c]">ALL</strong> in the toolbar to view all items.
        </div>
      );
    }
    return <div className="space-y-5">{nonNull}</div>;
  };

  // ---------- RENDER MODULE 2: HAILS & SYSTEMS ----------
  const renderCoreTab = () => (
    <div className="space-y-4">
      <div className="bg-[#121720] border border-[#222b38] px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-mono text-xs font-bold text-[#4cc9c0] tracking-wide">
            2. HAILS, DIRECTIVES & DESK SYSTEMS (28-DAY UNIFIED TIMELINE)
          </h2>
          <p className="text-xs text-[#8492a6] mt-0.5">
            Click any card row to expand and edit its dialogue beats. Each card shows its exact in-game C# or JSON source, surrounding encounter beats, and verbatim <code className="text-[#e5a03c]">CURRENTLY IN GAME</code> reference text.
          </p>
        </div>
      </div>
      {renderStructuredCollection('coreItems', state.coreItems, 240)}
    </div>
  );

  // ---------- RENDER MODULE 3: FORUM ----------
  const renderForumTab = () => {
    const addForumThread = () => {
      const id = 'f_custom_' + Date.now();
      const nextThread = {
        id,
        stage: FORUM_STAGES[0],
        pillar: 'Contract Trap',
        title: 'New Quarters FORUM Thread',
        body: '',
        done: false
      };
      setState(prev => ({ ...prev, forumThreads: [...prev.forumThreads, nextThread] }));
      setExpandedCards(prev => ({ ...prev, [`forum_${id}`]: true }));
      showToast('Added new FORUM thread card.');
    };

    const updateForum = (idx: number, field: 'title' | 'stage' | 'pillar' | 'body', val: string) => {
      setState(prev => {
        const list = [...prev.forumThreads];
        list[idx] = { ...list[idx], [field]: val };
        return { ...prev, forumThreads: list };
      });
    };

    const toggleForumDone = (idx: number) => {
      setState(prev => {
        const list = [...prev.forumThreads];
        list[idx] = { ...list[idx], done: !list[idx].done };
        return { ...prev, forumThreads: list };
      });
    };

    const deleteForum = (idx: number) => {
      setState(prev => ({
        ...prev,
        forumThreads: prev.forumThreads.filter((_, i) => i !== idx)
      }));
      showToast('Removed FORUM thread.');
    };

    const addHandle = () => {
      const raw = newHandleInput.trim();
      if (!raw) return;
      const formatted = raw.endsWith(': ') ? raw : raw.endsWith(':') ? `${raw} ` : `[${raw.replace(/^\[|\]$/g, '')}]: `;
      if (!state.meta.forumHandles.includes(formatted)) {
        setState(prev => ({
          ...prev,
          meta: { ...prev.meta, forumHandles: [...prev.meta.forumHandles, formatted] }
        }));
      }
      setNewHandleInput('');
    };

    const removeHandle = (h: string) => {
      setState(prev => ({
        ...prev,
        meta: { ...prev.meta, forumHandles: prev.meta.forumHandles.filter(x => x !== h) }
      }));
    };

    return (
      <div className="space-y-4">
        <div className="bg-[#121720] border border-[#222b38] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-mono text-xs font-bold text-[#4cc9c0] tracking-wide">
              3. QUARTERS FORUM ANCHOR POSTS (4 TENSION STAGES & 4 LORE PILLARS)
            </h2>
            <p className="text-xs text-[#8492a6] mt-0.5">
              Includes the 14 live <code className="text-[#52b778]">data/forum.json</code> threads (21 posts) plus 18 campaign stage anchor slots.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                downloadFile('forum.json', JSON.stringify(buildForumDatabaseExport(state), null, 2));
                showToast('Exported 1-to-1 C# data/forum.json');
              }}
              className="px-3 py-1.5 bg-[#52b778]/15 border border-[#52b778] font-mono text-xs font-bold text-[#52b778] hover:bg-[#52b778] hover:text-[#0b0e13] cursor-pointer whitespace-nowrap"
            >
              EXPORT forum.json (1-TO-1 C#)
            </button>
            <button
              type="button"
              onClick={addForumThread}
              className="px-3 py-1.5 bg-[#e5a03c]/15 border border-[#e5a03c] font-mono text-xs font-bold text-[#e5a03c] hover:bg-[#e5a03c] hover:text-[#0b0e13] cursor-pointer whitespace-nowrap"
            >
              + ADD FORUM THREAD
            </button>
          </div>
        </div>

        {/* Clickable Variables & Recurring Station Handle Chips */}
        <div className="bg-[#121720] border border-[#222b38] p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10.5px] text-[#64748b] mr-1">VARIABLES:</span>
            {FORUM_VARIABLES.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => insertTokenIntoForum(v)}
                className="px-2 py-0.5 bg-[#0b0e13] border border-[#4cc9c0]/60 font-mono text-[11px] text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer"
              >
                {v}
              </button>
            ))}
            <SourceBadge
              badge={{
                kind: 'NOT_WIRED',
                label: 'NOT WIRED IN C# YET',
                location: 'TerminalOverlay.cs renders forum.json literally without variable substitution'
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1e2633]">
            <span className="font-mono text-[10.5px] text-[#64748b] mr-1">HANDLES:</span>
            {state.meta.forumHandles.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => insertTokenIntoForum(h)}
                className="px-2 py-0.5 bg-[#0b0e13] border border-[#e5a03c]/60 font-mono text-[11px] text-[#e5a03c] hover:bg-[#e5a03c] hover:text-[#0b0e13] cursor-pointer"
              >
                {h.trim()}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setManageHandlesOpen(prev => !prev)}
              className="px-2 py-0.5 bg-[#18202c] border border-[#334155] font-mono text-[10.5px] text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer ml-1"
            >
              {manageHandlesOpen ? 'CLOSE' : '+ HANDLE'}
            </button>
          </div>

          {manageHandlesOpen && (
            <div className="pt-2.5 mt-2 border-t border-[#263040] space-y-2">
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newHandleInput}
                  onChange={e => setNewHandleInput(e.target.value)}
                  placeholder="New handle (e.g. Dock3_Welder)"
                  className="flex-1 bg-[#0b0e13] border border-[#334155] px-2.5 py-1 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addHandle}
                  className="px-3 py-1 bg-[#e5a03c] text-[#0b0e13] font-mono text-xs font-bold cursor-pointer"
                >
                  ADD HANDLE
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {state.meta.forumHandles.map(h => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#0b0e13] border border-[#263040] font-mono text-[11px] text-[#8492a6]"
                  >
                    {h.trim()}
                    <button
                      type="button"
                      onClick={() => removeHandle(h)}
                      className="text-[#c94a4a] hover:text-white cursor-pointer"
                      aria-label={`Remove handle ${h}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4 Stages */}
        {FORUM_STAGES.map(stage => {
          const stageEntries = state.forumThreads
            .map((t, idx) => ({ t, idx }))
            .filter(x => x.t.stage === stage);
          const stageDone = stageEntries.filter(x => getForumThreadStatus(x.t) === 'DONE').length;

          const visibleCards = stageEntries
            .map(({ t, idx }) => {
              const status = getForumThreadStatus(t);
              const blob = `${t.title} ${t.stage} ${t.pillar} ${t.body} ${t.currentlyInGame || ''} ${t.currentSource || ''}`;
              if (!matchesStatusFilter(status, state.meta.filter) || !matchesSearch(blob)) return null;

              const cardId = `forum_${t.id}`;
              const expanded = isCardExpanded(cardId);
              const titleOverLimit = t.title.length > 68;

              return (
                <div
                  key={cardId}
                  data-card-id={cardId}
                  className={`border mb-2 transition-colors ${
                    expanded ? 'bg-[#151c27] border-[#334155]' : 'bg-[#121720] border-[#222b38] hover:border-[#334155]'
                  }`}
                >
                  <div
                    onClick={() => toggleCard(cardId)}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                      {expanded ? (
                        <ChevronDown className="w-4 h-4 text-[#e5a03c] shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
                      )}
                      <span className="font-mono text-xs font-bold text-[#d8dee9] truncate">
                        {t.title || 'Untitled Thread'}
                      </span>
                      <span className="font-mono text-[11px] text-[#64748b] whitespace-nowrap">
                        · {t.pillar}
                      </span>
                      {t.minDay !== undefined && (
                        <span className="font-mono text-[10.5px] text-[#e5a03c] whitespace-nowrap">
                          · Unlock Day {t.minDay}
                        </span>
                      )}
                      <StatusLabel status={status} />
                      <SourceBadge badge={t.sourceBadge} />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleForumDone(idx)}
                        className={`px-2 py-0.5 border font-mono text-[10.5px] cursor-pointer whitespace-nowrap ${
                          t.done
                            ? 'bg-[#52b778]/15 border-[#52b778] text-[#52b778] font-bold'
                            : 'bg-[#0b0e13] border-[#263040] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9]'
                        }`}
                      >
                        {t.done ? 'DONE ✓' : 'MARK DONE'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteForum(idx)}
                        aria-label={`Delete forum thread ${t.title}`}
                        className="px-2 py-0.5 bg-[#0b0e13] border border-[#263040] text-[#8492a6] hover:border-[#c94a4a] hover:text-[#c94a4a] font-mono text-[10.5px] cursor-pointer"
                      >
                        DEL
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-4 pb-4 pt-2.5 border-t border-[#1e2633] space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-mono text-[11px] text-[#8492a6] mb-1">
                            Thread Title / Subject (Left Index Pane: 332px)
                          </label>
                          <input
                            type="text"
                            value={t.title}
                            onChange={e => updateForum(idx, 'title', e.target.value)}
                            className={`w-full bg-[#0b0e13] border px-2.5 py-1.5 font-mono text-xs text-[#d8dee9] focus:outline-none ${
                              titleOverLimit
                                ? 'border-[#e5a03c] focus:border-[#e5a03c]'
                                : 'border-[#263040] focus:border-[#e5a03c]'
                            }`}
                          />
                          <div
                            className={`font-mono text-[10px] mt-1 ${
                              titleOverLimit ? 'text-[#e5a03c] font-bold' : 'text-[#5a6678]'
                            }`}
                          >
                            {t.title.length} / 68 chars · Left index max 2 lines (34 chars/line @ +3)
                            {titleOverLimit ? ' [!] CLIPS LEFT INDEX CARD' : ''}
                          </div>
                        </div>
                        <div>
                          <label className="block font-mono text-[11px] text-[#8492a6] mb-1">
                            Campaign Tension Stage
                          </label>
                          <select
                            value={t.stage}
                            onChange={e => updateForum(idx, 'stage', e.target.value)}
                            className="w-full bg-[#0b0e13] border border-[#263040] px-2.5 py-1.5 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                          >
                            {FORUM_STAGES.map(st => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-mono text-[11px] text-[#8492a6] mb-1">
                            Lore Pillar
                          </label>
                          <select
                            value={t.pillar}
                            onChange={e => updateForum(idx, 'pillar', e.target.value)}
                            className="w-full bg-[#0b0e13] border border-[#263040] px-2.5 py-1.5 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                          >
                            {FORUM_PILLARS.map(p => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Section 3: Verbatim Currently In Game Box */}
                      <CurrentlyInGameBox
                        text={t.currentlyInGame}
                        source={t.currentSource}
                        badge={t.sourceBadge}
                        onCopyToEditor={
                          t.currentlyInGame && !t.currentlyInGame.startsWith('(')
                            ? () => updateForum(idx, 'body', t.currentlyInGame!)
                            : undefined
                        }
                      />

                      <div>
                        <label className="block font-mono text-[11px] text-[#8492a6] mb-1">
                          Thread Post & Replies (Format: [Handle]: Post text — exports 1-to-1 to data/forum.json posts[])
                        </label>
                        <RaylibTextarea
                          value={t.body}
                          rows={4}
                          raylibPreset="forum_body"
                          ariaLabel={`Forum post body for ${t.title}`}
                          placeholder={`[D4_Wrench]: Write grounded station chatter here...\n[ShiftLead_R]: Reply here...`}
                          onFocus={el => { lastFocusedTextareaRef.current = el; }}
                          onChange={val => updateForum(idx, 'body', val)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
            .filter(Boolean);

          if (visibleCards.length === 0) return null;

          return (
            <div key={stage} className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#222b38]">
                <h3 className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider">{stage}</h3>
                <span className="font-mono text-[11px] text-[#64748b] tabular-nums">
                  {stageDone} / {stageEntries.length} DONE
                </span>
              </div>
              {visibleCards}
            </div>
          );
        })}
      </div>
    );
  };

  // ---------- RENDER MODULE 4: MAIN PATHS ----------
  const renderPathsTab = () => (
    <div className="space-y-4">
      <div className="bg-[#121720] border border-[#222b38] px-4 py-3">
        <h2 className="font-mono text-xs font-bold text-[#4cc9c0] tracking-wide">
          4. MAIN STORY ARCS (PATHS A–E & DAY 26 CHOICE C BRIDGE)
        </h2>
        <p className="text-xs text-[#8492a6] mt-0.5">
          Five primary allegiance and escape trajectories resolving on Days 27–28, plus the Day 26 Choice C calibration-spoof slate bridge.
        </p>
      </div>
      {renderStructuredCollection('mainPaths', state.mainPaths)}
    </div>
  );

  // ---------- RENDER MODULE 5: FULLY EDITABLE FACES & QUESTS ----------
  const renderQuestsTab = () => {
    const sortMode = state.meta.questSort || 'category';

    const addQuest = () => {
      const id = 'q_custom_' + Date.now();
      const nextQuest: QuestItem = {
        id,
        group: 'Core Side Quests',
        category: 'Core Side Quests',
        title: 'New Custom Encounter / Side Quest',
        day: 'Day 11',
        sortDay: 11,
        status: 'KEEP',
        done: false,
        hint: 'Describe the visual trademark, setup visits, and mechanical payoff.',
        sourceBadge: { kind: 'NOT_WIRED', label: 'NOT WIRED IN C# YET', location: 'Custom Quest Card' },
        fields: [
          { key: 'beat_1', label: 'Setup Visit / Arrival Comms', value: '', raylibPreset: 'comms_line' },
          { key: 'beat_2', label: 'Payoff / Resolution Beat', value: '', raylibPreset: 'comms_line' }
        ]
      };
      setState(prev => ({
        ...prev,
        quests: [nextQuest, ...prev.quests]
      }));
      setExpandedCards(prev => ({ ...prev, [`quests_${id}`]: true }));
      showToast('Added new editable quest card.');
    };

    const deleteQuest = (id: string) => {
      setState(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          deletedQuestIds: prev.meta.deletedQuestIds.includes(id)
            ? prev.meta.deletedQuestIds
            : [...prev.meta.deletedQuestIds, id]
        },
        quests: prev.quests.filter(q => q.id !== id)
      }));
      setConfirmDeleteQuestId(null);
      showToast('Quest deleted permanently.');
    };

    const updateQuestMeta = (id: string, patch: Partial<QuestItem>) => {
      setState(prev => ({
        ...prev,
        quests: prev.quests.map(q =>
          q.id === id
            ? {
                ...q,
                ...patch,
                group: patch.category !== undefined ? patch.category : q.group
              }
            : q
        )
      }));
    };

    const addQuestField = (id: string) => {
      setState(prev => ({
        ...prev,
        quests: prev.quests.map(q => {
          if (q.id !== id) return q;
          const nextNum = q.fields.length + 1;
          return {
            ...q,
            fields: [
              ...q.fields,
              {
                key: `beat_${Date.now()}_${nextNum}`,
                label: `Beat ${nextNum} — Dialogue / Note`,
                value: '',
                raylibPreset: 'comms_line'
              }
            ]
          };
        })
      }));
    };

    const updateQuestField = (id: string, fIdx: number, patch: { label?: string; value?: string }) => {
      setState(prev => ({
        ...prev,
        quests: prev.quests.map(q => {
          if (q.id !== id) return q;
          const nextFields = q.fields.map((f, i) => (i === fIdx ? { ...f, ...patch } : f));
          return { ...q, fields: nextFields };
        })
      }));
    };

    const deleteQuestField = (id: string, fIdx: number) => {
      setState(prev => ({
        ...prev,
        quests: prev.quests.map(q => {
          if (q.id !== id || q.fields.length <= 1) return q;
          return { ...q, fields: q.fields.filter((_, i) => i !== fIdx) };
        })
      }));
    };

    const renderQuestCard = (q: QuestItem) => {
      const status = getStructuredItemStatus(q);
      const blob = `${q.title} ${q.day} Day ${q.sortDay} ${q.category} ${q.hint} ${q.currentlyInGame || ''} ${
        q.currentSource || ''
      } ${q.fields.map(f => `${f.label} ${f.value} ${f.currentlyInGame || ''} ${f.currentSource || ''}`).join(' ')}`;
      if (!matchesStatusFilter(status, state.meta.filter) || !matchesSearch(blob)) return null;

      const cardId = `quests_${q.id}`;
      const expanded = isCardExpanded(cardId);

      return (
        <div
          key={cardId}
          data-card-id={cardId}
          className={`border mb-2 transition-all ${
            q.status === 'CUT' ? 'opacity-55' : ''
          } ${
            expanded ? 'bg-[#151c27] border-[#334155]' : 'bg-[#121720] border-[#222b38] hover:border-[#334155]'
          }`}
        >
          {/* Card Header */}
          <div
            onClick={() => toggleCard(cardId)}
            className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-[#e5a03c] shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
              )}
              <span className="font-mono text-xs font-bold text-[#d8dee9] truncate">{q.title}</span>
              <span className="font-mono text-[11px] text-[#e5a03c] whitespace-nowrap">
                Day {q.sortDay} ({q.day})
              </span>
              <span className="font-mono text-[11px] text-[#64748b] whitespace-nowrap hidden sm:inline">
                · {q.category}
              </span>
              <StatusLabel status={status} />
              <SourceBadge badge={q.sourceBadge} />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap" onClick={e => e.stopPropagation()}>
              <select
                aria-label={`Scope status for ${q.title}`}
                value={q.status}
                onChange={e => updateQuestMeta(q.id, { status: e.target.value as QuestItem['status'] })}
                className="bg-[#0b0e13] border border-[#263040] px-2 py-0.5 font-mono text-[10.5px] text-[#d8dee9] focus:border-[#e5a03c] cursor-pointer"
              >
                <option value="KEEP">KEEP</option>
                <option value="UNDECIDED">UNDECIDED</option>
                <option value="CUT">CUT (Exclude %)</option>
              </select>

              <button
                type="button"
                onClick={() => updateQuestMeta(q.id, { done: !q.done })}
                className={`px-2 py-0.5 border font-mono text-[10.5px] cursor-pointer whitespace-nowrap ${
                  q.done
                    ? 'bg-[#52b778]/15 border-[#52b778] text-[#52b778] font-bold'
                    : 'bg-[#0b0e13] border-[#263040] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9]'
                }`}
              >
                {q.done ? 'DONE ✓' : 'MARK DONE'}
              </button>

              {confirmDeleteQuestId === q.id ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => deleteQuest(q.id)}
                    className="px-2 py-0.5 bg-[#c94a4a] text-white font-mono text-[10.5px] font-bold cursor-pointer"
                  >
                    CONFIRM DEL
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteQuestId(null)}
                    className="px-2 py-0.5 bg-[#0b0e13] border border-[#263040] font-mono text-[10.5px] text-[#8492a6] cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteQuestId(q.id)}
                  aria-label={`Delete quest ${q.title}`}
                  className="px-2 py-0.5 bg-[#0b0e13] border border-[#263040] text-[#8492a6] hover:border-[#c94a4a] hover:text-[#c94a4a] font-mono text-[10.5px] cursor-pointer"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>

          {/* Card Body — Editable Metadata + Dynamic Beat Fields */}
          {expanded && (
            <div className="px-4 pb-4 pt-2.5 border-t border-[#1e2633] space-y-3.5">
              {/* Section 1 In-Game Context & Section 3 Currently In Game */}
              <InGameContextStrip flow={q.inGameContext} />
              <CurrentlyInGameBox
                text={q.currentlyInGame}
                source={q.currentSource}
                badge={q.sourceBadge}
              />

              {/* Editable Quest Metadata Grid */}
              <div className="bg-[#0f141d] border border-[#222b38] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] font-bold text-[#4cc9c0] uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3 h-3" /> Quest Parameters & Timeline Placement
                  </span>
                  <button
                    type="button"
                    onClick={() => addQuestField(q.id)}
                    className="px-2.5 py-0.5 bg-[#e5a03c]/15 border border-[#e5a03c] font-mono text-[10.5px] font-bold text-[#e5a03c] hover:bg-[#e5a03c] hover:text-[#0b0e13] cursor-pointer"
                  >
                    + ADD BEAT / FIELD
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  <div className="md:col-span-5">
                    <label className="block font-mono text-[10.5px] text-[#8492a6] mb-1">
                      Quest Title / Heading
                    </label>
                    <input
                      type="text"
                      aria-label={`Quest title for ${q.id}`}
                      value={q.title}
                      onChange={e => updateQuestMeta(q.id, { title: e.target.value })}
                      className="w-full bg-[#0b0e13] border border-[#222b38] px-2.5 py-1 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-mono text-[10.5px] text-[#8492a6] mb-1">
                      Day Label
                    </label>
                    <input
                      type="text"
                      aria-label={`Day label for ${q.title}`}
                      value={q.day}
                      placeholder="e.g. Day 11"
                      onChange={e => updateQuestMeta(q.id, { day: e.target.value })}
                      className="w-full bg-[#0b0e13] border border-[#222b38] px-2.5 py-1 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-mono text-[10.5px] text-[#8492a6] mb-1">
                      Start Day (1–28)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      aria-label={`Numeric start day for ${q.title}`}
                      value={q.sortDay}
                      onChange={e => {
                        const val = Math.max(1, Math.min(28, Number(e.target.value) || 1));
                        updateQuestMeta(q.id, { sortDay: val });
                      }}
                      className="w-full bg-[#0b0e13] border border-[#222b38] px-2.5 py-1 font-mono text-xs text-[#e5a03c] font-bold tabular-nums focus:border-[#e5a03c] focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block font-mono text-[10.5px] text-[#8492a6] mb-1">
                      Group / Category
                    </label>
                    <input
                      type="text"
                      list="questCategoriesList"
                      aria-label={`Category for ${q.title}`}
                      value={q.category}
                      onChange={e => updateQuestMeta(q.id, { category: e.target.value })}
                      className="w-full bg-[#0b0e13] border border-[#222b38] px-2.5 py-1 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                    />
                    <datalist id="questCategoriesList">
                      <option value="Live Covert Missions (data/covert_missions.json)" />
                      <option value="Recurring Faces" />
                      <option value="Core Side Quests" />
                      <option value="Optional / Secondary" />
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10.5px] text-[#8492a6] mb-1">
                    Short Hint / Design Note
                  </label>
                  <input
                    type="text"
                    aria-label={`Design hint for ${q.title}`}
                    value={q.hint}
                    onChange={e => updateQuestMeta(q.id, { hint: e.target.value })}
                    className="w-full bg-[#0b0e13] border border-[#222b38] px-2.5 py-1 font-mono text-xs text-[#a9b7c9] focus:border-[#e5a03c] focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Beat / Dialogue Textareas */}
              <div className="space-y-2.5">
                {q.fields.map((f, fIdx) => (
                  <div key={f.key} className="bg-[#0f141d] border border-[#222b38] p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-[10.5px] text-[#e5a03c] shrink-0">
                          BEAT #{fIdx + 1}:
                        </span>
                        <input
                          type="text"
                          aria-label={`Beat ${fIdx + 1} label for ${q.title}`}
                          value={f.label}
                          onChange={e => updateQuestField(q.id, fIdx, { label: e.target.value })}
                          className="flex-1 bg-[#0b0e13] border border-[#222b38] px-2 py-0.5 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                        />
                      </div>
                      {q.fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteQuestField(q.id, fIdx)}
                          aria-label={`Remove beat ${f.label}`}
                          className="px-2 py-0.5 bg-[#0b0e13] border border-[#263040] text-[#8492a6] hover:border-[#c94a4a] hover:text-[#c94a4a] font-mono text-[10px] cursor-pointer shrink-0"
                        >
                          REMOVE BEAT
                        </button>
                      )}
                    </div>

                    {f.inGameContext && <InGameContextStrip flow={f.inGameContext} />}

                    <CurrentlyInGameBox
                      text={f.currentlyInGame}
                      source={f.currentSource || q.currentSource}
                      badge={f.sourceBadge || q.sourceBadge}
                      onCopyToEditor={
                        f.currentlyInGame && !f.currentlyInGame.startsWith('(')
                          ? () => updateQuestField(q.id, fIdx, { value: f.currentlyInGame!.replace(/^"|"$/g, '') })
                          : undefined
                      }
                    />

                    <RaylibTextarea
                      value={f.value}
                      rows={3}
                      raylibPreset={f.raylibPreset || q.raylibPreset || 'comms_line'}
                      softLimit={f.softLimit ?? 240}
                      limitLabel="Quest Comms / Beat"
                      ariaLabel={`${q.title} - ${f.label}`}
                      placeholder="Write quest dialogue, contract copy, or chute note here..."
                      onFocus={el => { lastFocusedTextareaRef.current = el; }}
                      onChange={v => updateQuestField(q.id, fIdx, { value: v })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

    // Group or Sort Chronologically
    let contentHtml: React.ReactNode = null;
    if (sortMode === 'chronological') {
      const sorted = [...state.quests].sort((a, b) => a.sortDay - b.sortDay || a.title.localeCompare(b.title));
      const cards = sorted.map(renderQuestCard).filter(Boolean);
      contentHtml = (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 mb-2 border-b border-[#222b38]">
            <h3 className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider">
              Chronological Campaign Timeline (Day 1 → Day 28)
            </h3>
            <span className="font-mono text-[11px] text-[#64748b]">
              Sorted by Start Day
            </span>
          </div>
          {cards.length > 0 ? (
            cards
          ) : (
            <div className="bg-[#121720] border border-dashed border-[#263040] p-6 text-center font-mono text-xs text-[#8492a6]">
              No quests match the current filter.
            </div>
          )}
        </div>
      );
    } else {
      const groups: Record<string, QuestItem[]> = {};
      state.quests.forEach(q => {
        const g = q.category || 'Core Side Quests';
        if (!groups[g]) groups[g] = [];
        groups[g].push(q);
      });
      contentHtml = Object.entries(groups).map(([cat, list]) => {
        const cards = list.map(renderQuestCard).filter(Boolean);
        if (cards.length === 0) return null;
        const doneCount = list.filter(q => getStructuredItemStatus(q) === 'DONE').length;
        const activeCount = list.filter(q => q.status !== 'CUT').length;
        return (
          <div key={cat} className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#222b38]">
              <h3 className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider">{cat}</h3>
              <span className="font-mono text-[11px] text-[#64748b] tabular-nums">
                {doneCount} / {activeCount} ACTIVE DONE
              </span>
            </div>
            {cards}
          </div>
        );
      });
    }

    return (
      <div className="space-y-4">
        <div className="bg-[#121720] border border-[#222b38] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-mono text-xs font-bold text-[#4cc9c0] tracking-wide">
              5. LIVE COVERT MISSIONS, RECURRING FACES & SIDE QUESTS
            </h2>
            <p className="text-xs text-[#8492a6] mt-0.5">
              Includes the 5 live <code className="text-[#52b778]">data/covert_missions.json</code> operations (21 text slots) plus all editable recurring faces and side quests.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                downloadFile('covert_missions.json', JSON.stringify(buildCovertMissionsExport(state), null, 2));
                showToast('Exported 1-to-1 C# data/covert_missions.json');
              }}
              className="px-2.5 py-1 bg-[#52b778]/15 border border-[#52b778] font-mono text-[11px] font-bold text-[#52b778] hover:bg-[#52b778] hover:text-[#0b0e13] cursor-pointer whitespace-nowrap"
            >
              EXPORT covert_missions.json (1-TO-1 C#)
            </button>

            <div className="flex items-center bg-[#0b0e13] border border-[#263040] p-0.5">
              <button
                type="button"
                onClick={() =>
                  setState(prev => ({ ...prev, meta: { ...prev.meta, questSort: 'category' } }))
                }
                className={`px-2.5 py-1 font-mono text-[11px] cursor-pointer whitespace-nowrap ${
                  sortMode === 'category'
                    ? 'bg-[#e5a03c] text-[#0b0e13] font-bold'
                    : 'text-[#8492a6] hover:text-[#d8dee9]'
                }`}
              >
                GROUP BY CATEGORY
              </button>
              <button
                type="button"
                onClick={() =>
                  setState(prev => ({ ...prev, meta: { ...prev.meta, questSort: 'chronological' } }))
                }
                className={`px-2.5 py-1 font-mono text-[11px] cursor-pointer whitespace-nowrap ${
                  sortMode === 'chronological'
                    ? 'bg-[#e5a03c] text-[#0b0e13] font-bold'
                    : 'text-[#8492a6] hover:text-[#d8dee9]'
                }`}
              >
                SORT CHRONOLOGICALLY (DAY 1→28)
              </button>
            </div>

            <button
              type="button"
              onClick={addQuest}
              className="px-3 py-1 bg-[#e5a03c]/15 border border-[#e5a03c] font-mono text-xs font-bold text-[#e5a03c] hover:bg-[#e5a03c] hover:text-[#0b0e13] cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> ADD QUEST
            </button>
          </div>
        </div>

        <div className="space-y-5">{contentHtml}</div>
      </div>
    );
  };

  // ---------- RENDER MODULE 6: CORRIDOR, SECTOR MAP METADATA & QUARTERS MISC ----------
  const renderCorridorTab = () => {
    const visiblePosters = state.corridorPosters
      .map((p, idx) => {
        const status = getPosterStatus(p);
        const blob = `${p.filename} ${p.stage} ${p.hint} ${p.headline} ${p.body} ${p.currentlyInGame || ''} ${p.currentSource || ''}`;
        if (!matchesStatusFilter(status, state.meta.filter) || !matchesSearch(blob)) return null;
        const cardId = `poster_${p.id}`;
        const expanded = isCardExpanded(cardId);

        return (
          <div
            key={cardId}
            data-card-id={cardId}
            className={`border mb-2 transition-colors ${
              expanded ? 'bg-[#151c27] border-[#334155]' : 'bg-[#121720] border-[#222b38] hover:border-[#334155]'
            }`}
          >
            <div
              onClick={() => toggleCard(cardId)}
              className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-[#e5a03c] shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
                )}
                <span className="font-mono text-xs font-bold text-[#d8dee9] truncate">{p.filename}</span>
                <span className="font-mono text-[11px] text-[#64748b] whitespace-nowrap">
                  · {p.stage}
                </span>
                <StatusLabel status={status} />
                <SourceBadge badge={p.sourceBadge} />
              </div>
              <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() =>
                    setState(prev => {
                      const list = [...prev.corridorPosters];
                      list[idx] = { ...list[idx], done: !list[idx].done };
                      return { ...prev, corridorPosters: list };
                    })
                  }
                  className={`px-2 py-0.5 border font-mono text-[10.5px] cursor-pointer whitespace-nowrap ${
                    p.done
                      ? 'bg-[#52b778]/15 border-[#52b778] text-[#52b778] font-bold'
                      : 'bg-[#0b0e13] border-[#263040] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9]'
                  }`}
                >
                  {p.done ? 'DONE ✓' : 'MARK DONE'}
                </button>
              </div>
            </div>

            {expanded && (
              <div className="px-4 pb-4 pt-2.5 border-t border-[#1e2633] space-y-3">
                <p className="text-xs text-[#8492a6]">{p.hint}</p>

                <CurrentlyInGameBox
                  text={p.currentlyInGame}
                  source={p.currentSource}
                  badge={p.sourceBadge}
                />

                <div>
                  <label className="block font-mono text-[11px] text-[#94a3b8] mb-1">
                    Poster Headline (Wall Plaque: 76px · Zoom Modal Header: 400px)
                  </label>
                  <RaylibTextarea
                    value={p.headline}
                    rows={1}
                    raylibPreset="corridor_poster_wall"
                    softLimit={80}
                    limitLabel="Poster Headline"
                    ariaLabel={`Headline for ${p.filename}`}
                    placeholder="e.g. WORK IS TRANSIT"
                    onFocus={el => { lastFocusedTextareaRef.current = el; }}
                    onChange={val =>
                      setState(prev => {
                        const list = [...prev.corridorPosters];
                        list[idx] = { ...list[idx], headline: val };
                        return { ...prev, corridorPosters: list };
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-[#94a3b8] mb-1">
                    Zoom-In Modal Fine Print / Body Copy (400px Box · ~42 chars/line @ +3)
                  </label>
                  <RaylibTextarea
                    value={p.body}
                    rows={3}
                    raylibPreset="corridor_poster_body"
                    softLimit={336}
                    limitLabel="Poster Body"
                    ariaLabel={`Body copy for ${p.filename}`}
                    placeholder="Readable fine print shown when player clicks to zoom in..."
                    onFocus={el => { lastFocusedTextareaRef.current = el; }}
                    onChange={val =>
                      setState(prev => {
                        const list = [...prev.corridorPosters];
                        list[idx] = { ...list[idx], body: val };
                        return { ...prev, corridorPosters: list };
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        );
      })
      .filter(Boolean);

    const visibleBarks = state.corridorBarks
      .map((b, idx) => {
        const status = getBarkStatus(b);
        const filled = b.lines.filter(hasText).length;
        const blob = `${b.label} ${b.stage} ${b.currentlyInGame || ''} ${b.currentSource || ''} ${b.lines.join(' ')}`;
        if (!matchesStatusFilter(status, state.meta.filter) || !matchesSearch(blob)) return null;
        const cardId = `bark_${b.id}`;
        const expanded = isCardExpanded(cardId);

        return (
          <div
            key={cardId}
            data-card-id={cardId}
            className={`border mb-2 transition-colors ${
              expanded ? 'bg-[#151c27] border-[#334155]' : 'bg-[#121720] border-[#222b38] hover:border-[#334155]'
            }`}
          >
            <div
              onClick={() => toggleCard(cardId)}
              className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-[#e5a03c] shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
                )}
                <span className="font-mono text-xs font-bold text-[#d8dee9] truncate">{b.label}</span>
                <span className="font-mono text-[11px] text-[#64748b] whitespace-nowrap">
                  · {b.stage} · {filled}/{b.lines.length} barks
                </span>
                <StatusLabel status={status} />
                <SourceBadge badge={b.sourceBadge} />
              </div>
              <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedCards(prev => ({ ...prev, [cardId]: true }));
                    setState(prev => {
                      const list = [...prev.corridorBarks];
                      list[idx] = { ...list[idx], lines: [...list[idx].lines, ''] };
                      return { ...prev, corridorBarks: list };
                    });
                  }}
                  className="px-2 py-0.5 bg-[#0b0e13] border border-[#263040] font-mono text-[10.5px] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9] cursor-pointer"
                >
                  + BARK
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setState(prev => {
                      const list = [...prev.corridorBarks];
                      list[idx] = { ...list[idx], done: !list[idx].done };
                      return { ...prev, corridorBarks: list };
                    })
                  }
                  className={`px-2 py-0.5 border font-mono text-[10.5px] cursor-pointer whitespace-nowrap ${
                    b.done
                      ? 'bg-[#52b778]/15 border-[#52b778] text-[#52b778] font-bold'
                      : 'bg-[#0b0e13] border-[#263040] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9]'
                  }`}
                >
                  {b.done ? 'DONE ✓' : 'MARK DONE'}
                </button>
              </div>
            </div>

            {expanded && (
              <div className="px-4 pb-4 pt-2.5 border-t border-[#1e2633] space-y-2.5">
                <CurrentlyInGameBox
                  text={b.currentlyInGame}
                  source={b.currentSource}
                  badge={b.sourceBadge}
                />

                {b.lines.map((line, lIdx) => (
                  <div key={lIdx} className="flex items-start gap-2">
                    <span className="font-mono text-[11px] text-[#5a6678] pt-2 w-5 shrink-0 tabular-nums">
                      #{lIdx + 1}
                    </span>
                    <div className="flex-1">
                      <RaylibTextarea
                        value={line}
                        rows={1}
                        raylibPreset="corridor_bark"
                        softLimit={68}
                        limitLabel="Corridor Bark Speech Bubble"
                        ariaLabel={`${b.label} bark ${lIdx + 1}`}
                        placeholder="Short 1-line overhead speech bubble as 884-D walks past..."
                        onFocus={el => { lastFocusedTextareaRef.current = el; }}
                        onChange={val =>
                          setState(prev => {
                            const list = [...prev.corridorBarks];
                            const nextLines = [...list[idx].lines];
                            nextLines[lIdx] = val;
                            list[idx] = { ...list[idx], lines: nextLines };
                            return { ...prev, corridorBarks: list };
                          })
                        }
                      />
                    </div>
                    {b.lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setState(prev => {
                            const list = [...prev.corridorBarks];
                            list[idx] = {
                              ...list[idx],
                              lines: list[idx].lines.filter((_, i) => i !== lIdx)
                            };
                            return { ...prev, corridorBarks: list };
                          })
                        }
                        className="mt-1 px-2 py-1 bg-[#0b0e13] border border-[#263040] text-[#8492a6] hover:border-[#c94a4a] hover:text-[#c94a4a] font-mono text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })
      .filter(Boolean);

    const visibleStarSystems = state.starChart
      .map((s, idx) => {
        const status = getStarChartStatus(s);
        const blob = `${s.name} ${s.faction} ${s.tags} ${s.exports} ${s.currentlyInGame || ''} ${s.currentSource || ''}`;
        if (!matchesStatusFilter(status, state.meta.filter) || !matchesSearch(blob)) return null;
        const cardId = `sc_${s.id}`;

        return (
          <div key={cardId} data-card-id={cardId} className="bg-[#121720] border border-[#222b38] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#1e2633] flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#d8dee9]">{s.name}</span>
                <StatusLabel status={status} />
                <SourceBadge badge={s.sourceBadge} />
              </div>
              <button
                type="button"
                onClick={() =>
                  setState(prev => {
                    const list = [...prev.starChart];
                    list[idx] = { ...list[idx], done: !list[idx].done };
                    return { ...prev, starChart: list };
                  })
                }
                className={`px-2 py-0.5 border font-mono text-[10px] cursor-pointer ${
                  s.done
                    ? 'bg-[#52b778]/15 border-[#52b778] text-[#52b778] font-bold'
                    : 'bg-[#0b0e13] border-[#263040] text-[#8492a6] hover:border-[#e5a03c]'
                }`}
              >
                {s.done ? 'DONE ✓' : 'MARK DONE'}
              </button>
            </div>

            <CurrentlyInGameBox
              text={s.currentlyInGame}
              source={s.currentSource}
              badge={s.sourceBadge}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-mono text-[10px] text-[#8492a6] mb-1">
                  Controlling Faction (LIVE JSON)
                </label>
                <input
                  type="text"
                  value={s.faction}
                  placeholder="e.g. Kordani"
                  onChange={e =>
                    setState(prev => {
                      const list = [...prev.starChart];
                      list[idx] = { ...list[idx], faction: e.target.value };
                      return { ...prev, starChart: list };
                    })
                  }
                  className="w-full bg-[#0b0e13] border border-[#222b38] px-2 py-1 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#8492a6] mb-1">
                  System Tags (NOT WIRED IN C# YET)
                </label>
                <input
                  type="text"
                  value={s.tags}
                  placeholder="e.g. Mining Hub"
                  onChange={e =>
                    setState(prev => {
                      const list = [...prev.starChart];
                      list[idx] = { ...list[idx], tags: e.target.value };
                      return { ...prev, starChart: list };
                    })
                  }
                  className="w-full bg-[#0b0e13] border border-[#222b38] px-2 py-1 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#8492a6] mb-1">
                  Trade Exports (NOT WIRED IN C# YET)
                </label>
                <input
                  type="text"
                  value={s.exports}
                  placeholder="e.g. Refined Ore"
                  onChange={e =>
                    setState(prev => {
                      const list = [...prev.starChart];
                      list[idx] = { ...list[idx], exports: e.target.value };
                      return { ...prev, starChart: list };
                    })
                  }
                  className="w-full bg-[#0b0e13] border border-[#222b38] px-2 py-1 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      })
      .filter(Boolean);

    return (
      <div className="space-y-5">
        <div className="bg-[#121720] border border-[#222b38] px-4 py-3">
          <h2 className="font-mono text-xs font-bold text-[#4cc9c0] tracking-wide">
            6. MORNING CORRIDOR, SECTOR MAP DATA & QUARTERS DISPATCHES
          </h2>
          <p className="text-xs text-[#8492a6] mt-0.5">
            Zoomable morning hallway posters (<code className="text-[#4cc9c0]">corridor_posters.json</code>), overhead NPC barks (<code className="text-[#4cc9c0]">corridor_barks.json</code>), sector map system metadata (<code className="text-[#52b778]">data/sector_map.json</code>), and overnight Kordani audits.
          </p>
        </div>

        {/* Posters */}
        {visiblePosters.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#222b38]">
              <h3 className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider">
                Zoomable Wall Posters (corridor_posters.json — Currently Hardcoded in CorridorScene.cs:310-377)
              </h3>
              <button
                type="button"
                onClick={() => {
                  downloadFile('corridor_posters.json', JSON.stringify(buildCorridorPostersExport(state), null, 2));
                  showToast('Exported corridor_posters.json');
                }}
                className="px-2 py-0.5 bg-[#121720] border border-[#263040] font-mono text-[10.5px] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9] cursor-pointer"
              >
                EXPORT corridor_posters.json
              </button>
            </div>
            {visiblePosters}
          </div>
        )}

        {/* Barks */}
        {visibleBarks.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#222b38]">
              <h3 className="font-mono text-[11px] font-bold text-[#8492a6] uppercase tracking-wider">
                Proximity Overhead NPC Barks (corridor_barks.json — Currently Hardcoded in CorridorScene.cs:111-118)
              </h3>
              <button
                type="button"
                onClick={() => {
                  downloadFile('corridor_barks.json', JSON.stringify(buildCorridorBarksExport(state), null, 2));
                  showToast('Exported corridor_barks.json');
                }}
                className="px-2 py-0.5 bg-[#121720] border border-[#263040] font-mono text-[10.5px] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9] cursor-pointer"
              >
                EXPORT corridor_barks.json
              </button>
            </div>
            {visibleBarks}
          </div>
        )}

        {/* Sector Map Systems */}
        {visibleStarSystems.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#222b38]">
              <h3 className="font-mono text-[11px] font-bold text-[#52b778] uppercase tracking-wider">
                Sector Map Systems Metadata (data/sector_map.json — 1-to-1 C# Schema)
              </h3>
              <button
                type="button"
                onClick={() => {
                  downloadFile('sector_map.json', JSON.stringify(buildSectorMapExport(state), null, 2));
                  showToast('Exported 1-to-1 C# data/sector_map.json');
                }}
                className="px-2 py-0.5 bg-[#52b778]/15 border border-[#52b778] font-mono text-[10.5px] font-bold text-[#52b778] hover:bg-[#52b778] hover:text-[#0b0e13] cursor-pointer"
              >
                EXPORT sector_map.json (1-TO-1 C#)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">{visibleStarSystems}</div>
          </div>
        )}

        {/* Quarters Misc */}
        {renderStructuredCollection('quartersMisc', state.quartersMisc, 240)}
      </div>
    );
  };

  // ---------- RENDER MODULE 7: ENDINGS ----------
  const renderEndingsTab = () => {
    const cards = state.endings
      .map((e, idx) => {
        const status = getEndingStatus(e);
        const blob = `${e.title} ${e.day} ${e.category} ${e.trigger} ${e.text} ${e.currentlyInGame || ''} ${e.currentSource || ''}`;
        if (!matchesStatusFilter(status, state.meta.filter) || !matchesSearch(blob)) return null;
        const cardId = `ending_${e.id}`;
        const expanded = isCardExpanded(cardId);

        return (
          <div
            key={cardId}
            data-card-id={cardId}
            className={`border mb-2 transition-colors ${
              expanded ? 'bg-[#151c27] border-[#334155]' : 'bg-[#121720] border-[#222b38] hover:border-[#334155]'
            }`}
          >
            <div
              onClick={() => toggleCard(cardId)}
              className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-[#e5a03c] shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
                )}
                <span className="font-mono text-xs font-bold text-[#d8dee9] truncate">{e.title}</span>
                <span className="font-mono text-[11px] text-[#e5a03c] whitespace-nowrap">{e.day}</span>
                <span className="font-mono text-[11px] text-[#64748b] whitespace-nowrap hidden sm:inline">
                  · {e.category}
                </span>
                <StatusLabel status={status} />
                <SourceBadge badge={e.sourceBadge} />
              </div>
              <div className="flex items-center gap-2 shrink-0" onClick={ev => ev.stopPropagation()}>
                <button
                  type="button"
                  onClick={() =>
                    setState(prev => {
                      const list = [...prev.endings];
                      list[idx] = { ...list[idx], done: !list[idx].done };
                      return { ...prev, endings: list };
                    })
                  }
                  className={`px-2 py-0.5 border font-mono text-[10.5px] cursor-pointer whitespace-nowrap ${
                    e.done
                      ? 'bg-[#52b778]/15 border-[#52b778] text-[#52b778] font-bold'
                      : 'bg-[#0b0e13] border-[#263040] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9]'
                  }`}
                >
                  {e.done ? 'DONE ✓' : 'MARK DONE'}
                </button>
              </div>
            </div>

            {expanded && (
              <div className="px-4 pb-4 pt-2.5 border-t border-[#1e2633] space-y-2.5">
                <p className="text-xs text-[#8492a6]">Trigger: {e.trigger}</p>

                <CurrentlyInGameBox
                  text={e.currentlyInGame}
                  source={e.currentSource}
                  badge={e.sourceBadge}
                  onCopyToEditor={
                    e.currentlyInGame && !e.currentlyInGame.startsWith('(')
                      ? () =>
                          setState(prev => {
                            const list = [...prev.endings];
                            list[idx] = { ...list[idx], text: e.currentlyInGame! };
                            return { ...prev, endings: list };
                          })
                      : undefined
                  }
                />

                <RaylibTextarea
                  value={e.text}
                  rows={5}
                  raylibPreset={e.raylibPreset || 'victory_ending_card'}
                  ariaLabel={`Epilogue text for ${e.title}`}
                  placeholder="Write epilogue card text (2–4 grounded paragraphs or beats matching the dry tone of the 5-Card Intro)..."
                  onFocus={el => { lastFocusedTextareaRef.current = el; }}
                  onChange={val =>
                    setState(prev => {
                      const list = [...prev.endings];
                      list[idx] = { ...list[idx], text: val };
                      return { ...prev, endings: list };
                    })
                  }
                />
              </div>
            )}
          </div>
        );
      })
      .filter(Boolean);

    return (
      <div className="space-y-4">
        <div className="bg-[#121720] border border-[#222b38] px-4 py-3">
          <h2 className="font-mono text-xs font-bold text-[#4cc9c0] tracking-wide">
            7. ALL 7 CAMPAIGN ENDINGS (data/endings.json — Currently Hardcoded in BoothScene.cs:2049-2090)
          </h2>
          <p className="text-xs text-[#8492a6] mt-0.5">
            Five Main Path endings resolving Day 28 (currently share 1 generic victory screen in <code className="text-[#e5a03c]">BoothScene.cs:2058</code>) plus two Failure endings (Security Detainment, Debt Foreclosure).
          </p>
        </div>
        {cards.length > 0 ? (
          <div>{cards}</div>
        ) : (
          <div className="bg-[#121720] border border-dashed border-[#263040] p-6 text-center font-mono text-xs text-[#8492a6]">
            No endings match the active filter.
          </div>
        )}
      </div>
    );
  };

  if (!authChecking && !authToken && serverSyncStatus !== 'offline') {
    return (
      <div className="min-h-screen bg-[#0b0e13] text-[#d8dee9] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#121720] border border-[#263040] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222b38] pb-3">
            <span className="font-mono text-xs font-bold text-[#e5a03c] tracking-widest border border-[#e5a03c]/60 bg-[#e5a03c]/10 px-2 py-0.5">
              VG-3 // BOOTH 04
            </span>
            <span className="font-mono text-[11px] text-[#4cc9c0] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> ACCESS CONTROL
            </span>
          </div>

          <div>
            <h1 className="font-mono text-sm font-bold text-[#d8dee9]">
              {authConfigured
                ? 'ENTER BOOTH 04 WORKBENCH PASSCODE'
                : 'SET INITIAL BOOTH 04 WORKBENCH PASSCODE'}
            </h1>
            <p className="text-xs text-[#8492a6] mt-1 leading-relaxed">
              {authConfigured
                ? 'Enter your passcode to unlock the writing workbench and sync across your laptop and phone.'
                : 'First-run setup: choose a passcode (min 4 characters) to protect your hosted workbench, or set WORKBENCH_PASSCODE in your Portainer environment variables.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <div>
              <label className="block font-mono text-[11px] text-[#8492a6] mb-1">
                {authConfigured ? 'Passcode' : 'Create Passcode (4+ chars)'}
              </label>
              <input
                type="password"
                autoFocus
                aria-label="Booth 04 Workbench Passcode"
                value={passcodeInput}
                onChange={e => setPasscodeInput(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full bg-[#0b0e13] border border-[#334155] px-3 py-2 font-mono text-xs text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
              />
            </div>

            {authError && (
              <div className="font-mono text-xs text-[#c94a4a] bg-[#c94a4a]/10 border border-[#c94a4a]/40 px-3 py-1.5">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-[#e5a03c] text-[#0b0e13] font-mono text-xs font-bold hover:bg-[#f0ad4e] cursor-pointer"
            >
              {authConfigured ? 'UNLOCK WORKBENCH' : 'CLAIM PASSCODE & UNLOCK'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e13] text-[#d8dee9] flex flex-col font-sans">
      {/* Top Command Header */}
      <header className="bg-[#080a0e] border-b border-[#222b38] px-5 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-bold text-[#e5a03c] tracking-widest border border-[#e5a03c]/60 bg-[#e5a03c]/10 px-2 py-0.5">
            VG-3 // BOOTH 04
          </span>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-wider text-[#d8dee9]">
              SUBSPACE PROTOCOLS — WRITING WORKBENCH
            </h1>
            <div className="font-mono text-[10.5px] text-[#64748b]">
              28-Day Campaign · Contractor #884-D ·{' '}
              <strong className="text-[#94a3b8]">{state.meta.corpName} Mercantile Consortium (BMC-)</strong>
            </div>
          </div>
        </div>

        {/* Single Unified 28-Day Campaign Completion Bar */}
        <div className="flex-1 max-w-sm min-w-[220px]">
          <div className="flex items-center justify-between font-mono text-[10.5px] mb-1">
            <span className="text-[#64748b]">CAMPAIGN PROGRESS</span>
            <span className="tabular-nums">
              <strong className="text-[#52b778]">{stats.allDone} Done</strong>
              <span className="text-[#475569]"> · </span>
              <strong className="text-[#e5a03c]">{stats.allDraft} Draft</strong>
              <span className="text-[#475569]"> · </span>
              <span className="text-[#64748b]">{stats.allTodo} Todo</span>
              <span className="text-[#d8dee9] ml-1.5 font-bold">({overallPct}%)</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#121720] border border-[#222b38] overflow-hidden flex">
            <div
              className="h-full bg-[#52b778] transition-all"
              style={{ width: `${overallPct}%` }}
              title={`Done / Locked: ${stats.allDone}`}
            />
            <div
              className="h-full bg-[#e5a03c] transition-all"
              style={{
                width: `${stats.allTot ? Math.round((stats.allDraft / stats.allTot) * 100) : 0}%`
              }}
              title={`Drafts in progress: ${stats.allDraft}`}
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePickOneForMe}
            title="Jump to a random unfinished (TODO or DRAFT) card and focus its first empty textarea"
            className="px-2.5 py-1 bg-[#e5a03c]/15 border border-[#e5a03c] font-mono text-[11px] font-bold text-[#e5a03c] hover:bg-[#e5a03c] hover:text-[#0b0e13] cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5" /> PICK ONE FOR ME
          </button>

          <button
            type="button"
            onClick={() => setFindReplaceModalOpen(true)}
            className="px-2.5 py-1 bg-[#121720] border border-[#263040] font-mono text-[11px] text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" /> FIND & REPLACE
          </button>

          <button
            type="button"
            onClick={() => {
              setExportModalInitialView('audit');
              setExportModalOpen(true);
            }}
            title="View Section 5 Code vs. Workbench Sync Audit Summary"
            className="px-2.5 py-1 bg-[#121720] border border-[#e5a03c]/60 font-mono text-[11px] font-bold text-[#e5a03c] hover:bg-[#e5a03c] hover:text-[#0b0e13] cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileCheck2 className="w-3.5 h-3.5" /> CODE AUDIT (SEC 5)
          </button>

          <button
            type="button"
            onClick={() => {
              setExportModalInitialView('exports');
              setExportModalOpen(true);
            }}
            className="px-2.5 py-1 bg-[#4cc9c0]/15 border border-[#4cc9c0] font-mono text-[11px] font-bold text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" /> EXPORTS & OFFLINE .HTML
          </button>

          {authToken && (
            <button
              type="button"
              onClick={handleLogout}
              title="Lock Booth 04 Workbench Session"
              className="px-2.5 py-1 bg-[#121720] border border-[#263040] font-mono text-[11px] text-[#8492a6] hover:border-[#c94a4a] hover:text-[#c94a4a] cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              <Lock className="w-3 h-3" /> LOCK
            </button>
          )}
        </div>
      </header>

      {/* Top Horizontal 7-Module Navigation Bar */}
      <nav
        aria-label="Writing Modules"
        className="bg-[#10151d] border-b border-[#222b38] px-4 overflow-x-auto"
      >
        <div className="max-w-[1180px] mx-auto grid grid-cols-7 min-w-[920px] gap-1">
          {NAV_TABS.map(tab => {
            const st = stats.tabs[tab.id] || { total: 0, done: 0, draft: 0, todo: 0 };
            const pct = st.total ? Math.round((st.done / st.total) * 100) : 0;
            const isActive = state.meta.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setState(prev => ({
                    ...prev,
                    meta: { ...prev.meta, activeTab: tab.id }
                  }))
                }
                className={`group relative overflow-hidden px-3 py-2 text-left transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'bg-[#171f2c] border-[#e5a03c]'
                    : 'border-transparent hover:bg-[#151c27]'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span
                    className={`font-mono text-[11.5px] font-bold truncate ${
                      isActive ? 'text-[#e5a03c]' : 'text-[#cbd5e1] group-hover:text-white'
                    }`}
                  >
                    {tab.num} {tab.name}
                  </span>
                  <span
                    className={`font-mono text-[10px] tabular-nums whitespace-nowrap shrink-0 ${
                      pct === 100
                        ? 'text-[#52b778] font-bold'
                        : isActive
                        ? 'text-[#e5a03c]'
                        : 'text-[#64748b]'
                    }`}
                  >
                    {st.done}/{st.total}
                  </span>
                </div>
                <div className="w-full h-0.5 bg-[#0b0e13] mt-1.5 overflow-hidden flex">
                  <div
                    className={`h-full ${pct === 100 ? 'bg-[#52b778]' : 'bg-[#e5a03c]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sticky Compact Filter / Search Toolbar */}
      <div className="sticky top-0 z-20 bg-[#0d1118]/95 backdrop-blur border-b border-[#222b38] px-4 py-1.5">
        <div className="max-w-[1180px] mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* 4 Clean Status Filter Buttons */}
          <div className="flex items-center gap-1 flex-wrap">
            {([
              { id: 'all', label: 'ALL' },
              { id: 'unfinished', label: `UNFINISHED (${stats.allTodo + stats.allDraft})` },
              { id: 'drafts', label: `DRAFTS (${stats.allDraft})` },
              { id: 'done', label: `DONE (${stats.allDone})` }
            ] as const).map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  setState(prev => ({
                    ...prev,
                    meta: { ...prev.meta, filter: f.id }
                  }))
                }
                className={`px-2.5 py-0.5 font-mono text-[11px] border transition-colors cursor-pointer whitespace-nowrap ${
                  state.meta.filter === f.id
                    ? 'bg-[#e5a03c]/15 border-[#e5a03c] text-[#e5a03c] font-bold'
                    : 'bg-[#121720] border-[#222b38] text-[#8492a6] hover:text-[#d8dee9]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search & Collapse / Expand */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              type="text"
              aria-label="Filter cards by keyword, day, or faction"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search keyword, day, faction..."
              className="w-52 sm:w-64 bg-[#0b0e13] border border-[#222b38] px-2.5 py-0.5 font-mono text-[11.5px] text-[#d8dee9] focus:border-[#e5a03c] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setAllExpanded(false)}
              className="px-2 py-0.5 bg-[#121720] border border-[#222b38] font-mono text-[10.5px] text-[#8492a6] hover:text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer whitespace-nowrap"
            >
              COLLAPSE ALL
            </button>
            <button
              type="button"
              onClick={() => setAllExpanded(true)}
              className="px-2 py-0.5 bg-[#121720] border border-[#222b38] font-mono text-[10.5px] text-[#8492a6] hover:text-[#d8dee9] hover:border-[#e5a03c] cursor-pointer whitespace-nowrap"
            >
              EXPAND ALL
            </button>
          </div>
        </div>
      </div>

      {/* Main Centered Writing Workspace (Max-Width 1180px) */}
      <main className="flex-1 w-full max-w-[1180px] mx-auto px-4 py-5 pb-16">
        {state.meta.activeTab === 'factions' && renderFactionsTab()}
        {state.meta.activeTab === 'core' && renderCoreTab()}
        {state.meta.activeTab === 'forum' && renderForumTab()}
        {state.meta.activeTab === 'paths' && renderPathsTab()}
        {state.meta.activeTab === 'quests' && renderQuestsTab()}
        {state.meta.activeTab === 'corridor' && renderCorridorTab()}
        {state.meta.activeTab === 'endings' && renderEndingsTab()}
      </main>

      {/* Clean Bottom Footer / Status Strip */}
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-[#080a0e] border-t border-[#222b38] px-5 py-1.5 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[#64748b]">
        <div className="flex items-center gap-3 flex-wrap tabular-nums">
          <span>
            WORDS: <strong className="text-[#cbd5e1]">{stats.words.toLocaleString()}</strong>
          </span>
          <span>·</span>
          <span>
            DONE: <strong className="text-[#52b778]">{stats.allDone}</strong>
          </span>
          <span>·</span>
          <span>
            DRAFT: <strong className="text-[#e5a03c]">{stats.allDraft}</strong>
          </span>
          <span>·</span>
          <span>
            TODO: <strong className="text-[#cbd5e1]">{stats.allTodo}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`text-[10.5px] ${
              serverSyncStatus === 'synced'
                ? 'text-[#52b778]'
                : serverSyncStatus === 'saving'
                ? 'text-[#e5a03c]'
                : 'text-[#8492a6]'
            }`}
          >
            {serverSyncStatus === 'synced'
              ? `SERVER + LOCAL SYNCED (${saveTime})`
              : serverSyncStatus === 'saving'
              ? 'SYNCING TO SERVER...'
              : `LOCAL AUTO-SAVED (${saveTime})`}
          </span>
          <button
            type="button"
            onClick={() => downloadStandaloneOfflineHtml(state, showToast)}
            className="px-2 py-0.5 bg-[#4cc9c0]/15 border border-[#4cc9c0]/60 text-[10.5px] font-bold text-[#4cc9c0] hover:bg-[#4cc9c0] hover:text-[#0b0e13] cursor-pointer"
          >
            DOWNLOAD OFFLINE .HTML
          </button>
          <button
            type="button"
            onClick={() => {
              downloadFile('subspace_protocols_writing_backup.json', JSON.stringify(state, null, 2));
              showToast('Saved full workbench backup JSON!');
            }}
            className="px-2 py-0.5 bg-[#121720] border border-[#263040] text-[10.5px] text-[#cbd5e1] hover:border-[#e5a03c] cursor-pointer"
          >
            SAVE BACKUP
          </button>
          <button
            type="button"
            onClick={() => importBackupInputRef.current?.click()}
            className="px-2 py-0.5 bg-[#121720] border border-[#263040] text-[10.5px] text-[#cbd5e1] hover:border-[#e5a03c] cursor-pointer"
          >
            RESTORE BACKUP
          </button>
        </div>
      </footer>

      {/* Hidden File Inputs */}
      <input
        ref={importBackupInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleImportBackupFile}
      />
      <input
        ref={importFactionPoolsInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleImportFactionPoolsFile}
      />

      {/* Modals */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        state={state}
        initialView={exportModalInitialView}
        onImportFactionPoolsClick={() => importFactionPoolsInputRef.current?.click()}
        onImportBackupClick={() => importBackupInputRef.current?.click()}
        onResetDefaults={handleResetDefaults}
        onDownloadSelfContainedHtml={() => downloadStandaloneOfflineHtml(state, showToast)}
        onToast={showToast}
      />

      <FindReplaceModal
        open={findReplaceModalOpen}
        onClose={() => setFindReplaceModalOpen(false)}
        state={state}
        onApplyState={next => setState(next)}
        onToast={showToast}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-11 right-5 z-50 bg-[#13221a] border border-[#52b778] text-[#52b778] font-mono text-xs px-4 py-2 shadow-lg"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
