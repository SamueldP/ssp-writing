import { WorkbenchState, FACTIONS, EXCUSE_KEYS } from './workbenchLogic';
import { downloadFile } from '../components/Modals';

/**
 * Generates and downloads a single self-contained offline .html file
 * containing the user's current state embedded directly as initial defaults,
 * zero external CDN dependencies, interactive 7-tab browsing & editing,
 * localStorage auto-save, and direct JSON/Markdown/Backup exports.
 */
export function downloadStandaloneOfflineHtml(currentState: WorkbenchState, onToast: (msg: string) => void) {
  const embeddedJson = JSON.stringify(currentState).replace(/</g, '\\u003c');
  const factionsJson = JSON.stringify(FACTIONS).replace(/</g, '\\u003c');
  const excusesJson = JSON.stringify(EXCUSE_KEYS).replace(/</g, '\\u003c');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VOID GATE 3 // Subspace Protocols Writing Workbench (Offline Single-File)</title>
<style>
  :root {
    --bg-deep: #0b0e13;
    --bg-panel: #121720;
    --bg-card: #151c27;
    --border: #222b38;
    --text-main: #d8dee9;
    --text-dim: #8492a6;
    --amber: #e5a03c;
    --cyan: #4cc9c0;
    --crimson: #c94a4a;
    --green: #52b778;
    --font-mono: 'Consolas', 'Cascadia Mono', 'Courier New', monospace;
    --font-sans: 'Segoe UI', system-ui, -apple-system, sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg-deep); color: var(--text-main); font-family: var(--font-sans); font-size: 14px; padding-bottom: 56px; }
  header { background: #080a0e; border-bottom: 1px solid var(--border); padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  nav { background: #10151d; border-bottom: 1px solid var(--border); padding: 0 20px; display: flex; gap: 4px; overflow-x: auto; }
  .tab-btn { background: transparent; color: var(--text-dim); border: none; border-bottom: 2px solid transparent; padding: 10px 14px; font-family: var(--font-mono); font-size: 12px; cursor: pointer; white-space: nowrap; }
  .tab-btn.active { color: var(--amber); border-bottom-color: var(--amber); background: #171f2c; font-weight: bold; }
  .container { max-width: 1180px; margin: 0 auto; padding: 18px; }
  .split { display: grid; grid-template-columns: 250px 1fr; gap: 18px; align-items: start; }
  @media (max-width: 860px) { .split { grid-template-columns: 1fr; } }
  .sidebar { background: var(--bg-panel); border: 1px solid var(--border); }
  .reg-btn { width: 100%; text-align: left; padding: 8px 12px; background: transparent; border: none; border-bottom: 1px solid #1a222d; color: var(--text-main); font-family: var(--font-mono); font-size: 12px; cursor: pointer; display: flex; justify-content: space-between; }
  .reg-btn.active { background: #1a2332; border-left: 2px solid var(--amber); color: var(--amber); font-weight: bold; }
  .card { background: var(--bg-panel); border: 1px solid var(--border); margin-bottom: 8px; }
  .card.open { background: var(--bg-card); border-color: #334155; }
  .card-hdr { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; gap: 10px; }
  .card-body { padding: 12px 14px; border-top: 1px solid #1e2633; }
  .badge { font-family: var(--font-mono); font-size: 10px; padding: 2px 6px; border: 1px solid var(--border); background: var(--bg-deep); color: var(--amber); }
  textarea, input, select { width: 100%; background: var(--bg-deep); color: var(--text-main); border: 1px solid var(--border); padding: 8px; font-family: var(--font-mono); font-size: 12.5px; margin-top: 4px; }
  label { display: block; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); margin-top: 8px; }
  button.btn { background: var(--bg-panel); color: var(--text-main); border: 1px solid var(--border); padding: 5px 10px; font-family: var(--font-mono); font-size: 11px; cursor: pointer; }
  button.btn:hover { border-color: var(--amber); color: var(--amber); }
  footer { position: fixed; bottom: 0; left: 0; right: 0; background: #080a0e; border-top: 1px solid var(--border); padding: 8px 20px; display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }
</style>
</head>
<body>
<header>
  <div>
    <div style="font-family:var(--font-mono);font-weight:bold;color:#fff;">SUBSPACE PROTOCOLS — WRITING WORKBENCH (OFFLINE SINGLE-FILE)</div>
    <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);">VOID GATE 3 // BOOTH 04 · 28-DAY UNIFIED CAMPAIGN</div>
  </div>
  <div style="display:flex;gap:8px;align-items:center;">
    <button class="btn" onclick="exportFactionPools()">EXPORT faction_pools.json</button>
    <button class="btn" onclick="downloadBackup()">SAVE BACKUP JSON</button>
  </div>
</header>
<nav id="tabs"></nav>
<div class="container" id="workspace"></div>
<footer>
  <span id="status-left">VOID GATE 3 // OFFLINE WORKBENCH</span>
  <span id="status-right" style="color:var(--green);">AUTO-SAVED TO LOCALSTORAGE (v2)</span>
</footer>
<script>
  const STORAGE_KEY = 'subspace_protocols_writing_workbench_v2';
  const FACTIONS = ${factionsJson};
  const EXCUSE_KEYS = ${excusesJson};
  let state = ${embeddedJson};
  let openCards = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = JSON.parse(saved);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}

  const TABS = [
    { id: 'factions', label: '1. Faction Pools' },
    { id: 'core', label: '2. Hails & Systems' },
    { id: 'forum', label: '3. FORUM' },
    { id: 'paths', label: '4. Main Paths' },
    { id: 'quests', label: '5. Faces & Quests' },
    { id: 'corridor', label: '6. Corridor & Map' },
    { id: 'endings', label: '7. Endings' }
  ];
  let activeTab = (state.meta && state.meta.activeTab) ? state.meta.activeTab : 'factions';

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      document.getElementById('status-right').textContent = 'AUTO-SAVED (' + new Date().toLocaleTimeString() + ')';
    } catch (e) {}
  }

  function downloadBlob(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }

  function downloadBackup() { downloadBlob('subspace_protocols_writing_backup.json', state); }
  function exportFactionPools() { downloadBlob('faction_pools.json', state.factionPools); }

  function renderTabs() {
    const nav = document.getElementById('tabs');
    nav.innerHTML = '';
    TABS.forEach(t => {
      const b = document.createElement('button');
      b.className = 'tab-btn' + (activeTab === t.id ? ' active' : '');
      b.textContent = t.label;
      b.onclick = () => { activeTab = t.id; state.meta.activeTab = t.id; save(); renderTabs(); renderWorkspace(); };
      nav.appendChild(b);
    });
  }

  function renderStructuredList(list, prefix) {
    const ws = document.getElementById('workspace');
    ws.innerHTML = '';
    list.forEach(item => {
      const cid = prefix + '_' + item.id;
      const isOpen = !!openCards[cid];
      const card = document.createElement('div');
      card.className = 'card' + (isOpen ? ' open' : '');
      const hdr = document.createElement('div');
      hdr.className = 'card-hdr';
      hdr.innerHTML = '<div><strong>' + (isOpen ? '▾ ' : '▸ ') + item.title + '</strong> <span class="badge">' + (item.day || item.stage || item.category || '') + '</span></div>';
      hdr.onclick = () => { openCards[cid] = !openCards[cid]; renderWorkspace(); };
      const chk = document.createElement('button');
      chk.className = 'btn';
      chk.textContent = item.done ? 'DONE ✓' : 'MARK DONE';
      chk.style.color = item.done ? 'var(--green)' : 'var(--text-dim)';
      chk.onclick = (e) => { e.stopPropagation(); item.done = !item.done; save(); renderWorkspace(); };
      hdr.appendChild(chk);
      card.appendChild(hdr);

      if (isOpen) {
        const body = document.createElement('div');
        body.className = 'card-body';
        if (item.fields) {
          item.fields.forEach(f => {
            const lbl = document.createElement('label');
            lbl.textContent = f.label;
            const ta = document.createElement('textarea');
            ta.rows = 3;
            ta.value = f.value || '';
            ta.oninput = (e) => { f.value = e.target.value; save(); };
            body.appendChild(lbl);
            body.appendChild(ta);
          });
        } else {
          const ta = document.createElement('textarea');
          ta.rows = 5;
          ta.value = item.body !== undefined ? item.body : (item.text || '');
          ta.oninput = (e) => {
            if (item.body !== undefined) item.body = e.target.value;
            else item.text = e.target.value;
            save();
          };
          body.appendChild(ta);
        }
        card.appendChild(body);
      }
      ws.appendChild(card);
    });
  }

  function renderFactions() {
    const ws = document.getElementById('workspace');
    ws.innerHTML = '';
    const activeCode = (state.meta && state.meta.activeFaction) || 'FTV-';
    const split = document.createElement('div');
    split.className = 'split';

    const side = document.createElement('div');
    side.className = 'sidebar';
    FACTIONS.forEach(f => {
      const b = document.createElement('button');
      b.className = 'reg-btn' + (f.code === activeCode ? ' active' : '');
      b.innerHTML = '<span>' + f.code + '</span><span style="color:var(--text-dim);font-size:11px;">' + f.name.split(' ')[0] + '</span>';
      b.onclick = () => { state.meta.activeFaction = f.code; save(); renderFactions(); };
      side.appendChild(b);
    });

    const main = document.createElement('div');
    const pool = state.factionPools[activeCode];
    const addPoolCard = (key, title, arr) => {
      const cid = 'fp_' + activeCode + '_' + key;
      const isOpen = !!openCards[cid];
      const card = document.createElement('div');
      card.className = 'card' + (isOpen ? ' open' : '');
      const hdr = document.createElement('div');
      hdr.className = 'card-hdr';
      hdr.innerHTML = '<div><strong>' + (isOpen ? '▾ ' : '▸ ') + title + '</strong> <span class="badge">' + arr.filter(x => x && x.trim()).length + '/' + arr.length + '</span></div>';
      hdr.onclick = () => { openCards[cid] = !openCards[cid]; renderFactions(); };
      card.appendChild(hdr);
      if (isOpen) {
        const body = document.createElement('div');
        body.className = 'card-body';
        arr.forEach((val, idx) => {
          const ta = document.createElement('textarea');
          ta.rows = 2;
          ta.value = val || '';
          ta.placeholder = activeCode + ' variation #' + (idx + 1);
          ta.oninput = (e) => { arr[idx] = e.target.value; save(); };
          body.appendChild(ta);
        });
        card.appendChild(body);
      }
      main.appendChild(card);
    };

    addPoolCard('greetings', activeCode + ' Neutral Arrival Greetings', pool.greetings);
    addPoolCard('greetingsHostile', activeCode + ' Hostile Greetings (rep <= -5)', pool.greetingsHostile);
    addPoolCard('greetingsWarm', activeCode + ' Warm Greetings (rep >= +6)', pool.greetingsWarm);
    EXCUSE_KEYS.forEach(ek => addPoolCard('exc_' + ek.key, ek.label + ' (' + ek.day + ')', pool.excuses[ek.key]));
    addPoolCard('detention', activeCode + ' Detention Clamp Reactions', pool.detentionReactions);

    split.appendChild(side);
    split.appendChild(main);
    ws.appendChild(split);
  }

  function renderWorkspace() {
    if (activeTab === 'factions') return renderFactions();
    if (activeTab === 'core') return renderStructuredList(state.coreItems || [], 'core');
    if (activeTab === 'forum') return renderStructuredList(state.forumThreads || [], 'forum');
    if (activeTab === 'paths') return renderStructuredList(state.mainPaths || [], 'paths');
    if (activeTab === 'quests') return renderStructuredList(state.quests || [], 'quests');
    if (activeTab === 'endings') return renderStructuredList(state.endings || [], 'endings');
    return renderStructuredList(state.quartersMisc || [], 'corridor');
  }

  renderTabs();
  renderWorkspace();
</script>
</body>
</html>`;

  downloadFile('subspace_protocols_writing_workbench.html', html, 'text/html');
  onToast('Downloaded standalone subspace_protocols_writing_workbench.html');
}
