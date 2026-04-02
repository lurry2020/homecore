'use strict';
/* ═══════════════════════════════════════════════════════════════════════════════
   topology.js  —  Homelab topology map editor
   Loaded by topology.html alongside app.js
═══════════════════════════════════════════════════════════════════════════════ */

const TROOT  = location.pathname.includes('/pages/') ? '../' : '';
const TICONS = TROOT + 'assets/icons/';
const TAPI   = TROOT + 'api/';

/* ─── State ──────────────────────────────────────────────────────────────────── */
let T = { nodes:{}, connections:{}, texts:{}, nextId:1 };

let tMode       = 'select';   // 'select' | 'connect' | 'text' | 'delete'
let tSelected   = null;       // { type:'node'|'conn'|'text', id }
let tConnSrc    = null;       // node id awaiting second click in connect mode
let tDrag       = null;       // active drag state
let tResize     = null;       // active resize state
let tPan        = null;       // canvas pan state { startX, startY, scrollLeft, scrollTop }
let tZoom       = 1;
let tDirty      = false;
let tIcons      = { apps:[], topo:[] };
let tLibTab     = 'topo';
let tLibQuery   = '';

/* ─── DOM shortcuts ──────────────────────────────────────────────────────────── */
const gel  = id => document.getElementById(id);
const qsa  = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/* ─── Entry point (called from app.js renderTopologyPage) ────────────────────── */
async function initTopologyEditor() {
  gel('page-content').innerHTML = buildEditorHTML();
  bindKeys();
  await Promise.all([loadTopoIcons(), loadTopologyState()]);
  renderLibrary();
  renderAll();
}

/* ─── Keyboard shortcuts ─────────────────────────────────────────────────────── */
function bindKeys() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.key === 'v' || e.key === 'V') setTopoMode('select');
    if (e.key === 'c' || e.key === 'C') setTopoMode('connect');
    if (e.key === 't' || e.key === 'T') setTopoMode('text');
    if (e.key === 'd' || e.key === 'D') setTopoMode('delete');
    if (e.key === 'Escape')  cancelConnect();
    if ((e.key === 'Delete' || e.key === 'Backspace') && tSelected) deleteSelected();
    if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveTopology(); }
  });
}

/* ─── Editor HTML ────────────────────────────────────────────────────────────── */
function buildEditorHTML() {
  return `
    <div id="topo-editor">
      <div id="topo-toolbar">
        <div class="topo-tb-group">
          <button class="topo-tb-btn topo-mode-btn active" id="tb-select"
                  onclick="setTopoMode('select')" title="Select &amp; Move (V)">▸ Select</button>
          <button class="topo-tb-btn topo-mode-btn" id="tb-connect"
                  onclick="setTopoMode('connect')" title="Connect nodes (C)">⚯ Connect</button>
          <button class="topo-tb-btn topo-mode-btn" id="tb-text"
                  onclick="setTopoMode('text')" title="Add text box (T)">T Text</button>
          <button class="topo-tb-btn topo-mode-btn" id="tb-delete"
                  onclick="setTopoMode('delete')" title="Delete item (D)">✕ Delete</button>
        </div>
        <div class="topo-tb-sep"></div>
        <div class="topo-tb-group">
          <button class="topo-tb-btn" onclick="topoZoomBy(-0.15)" title="Zoom out">－</button>
          <span id="topo-zoom-lbl" class="topo-zoom-label">100%</span>
          <button class="topo-tb-btn" onclick="topoZoomBy(0.15)"  title="Zoom in">＋</button>
          <button class="topo-tb-btn" onclick="topoZoomReset()"   title="Fit / reset zoom">⊡</button>
        </div>
        <div class="topo-tb-sep"></div>
        <div class="topo-tb-group">
          <button class="topo-tb-btn" onclick="clearTopology()">↺ Clear</button>
          <button class="topo-tb-btn topo-save-btn" onclick="saveTopology()">✓ Save</button>
        </div>
        <div class="topo-tb-hint" id="topo-mode-hint">Click and drag icons onto the canvas</div>
      </div>

      <div id="topo-workspace">

        <!-- Icon Library -->
        <div id="topo-library">
          <div class="topo-lib-tabs">
            <button class="topo-lib-tab active" id="libtab-topo"
                    onclick="switchLibTab('topo')">Hardware &amp; Infrastructure</button>
            <button class="topo-lib-tab" id="libtab-apps"
                    onclick="switchLibTab('apps')">Apps &amp; Services</button>
          </div>
          <div class="topo-lib-search-row">
            <input type="text" id="topo-lib-search" class="topo-lib-search"
                   placeholder="Search icons…"
                   oninput="tLibQuery=this.value.toLowerCase();renderLibrary()">
          </div>
          <div id="topo-lib-grid" class="topo-lib-grid"></div>
        </div>

        <!-- Canvas -->
        <div id="topo-canvas-wrap">
          <div id="topo-scroll-spacer">
          <div id="topo-canvas"
               ondragover="onTopoDragOver(event)"
               ondrop="onTopoDrop(event)">
            <svg id="topo-svg">
              <defs>
                <marker id="topo-arrow" markerWidth="9" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0,9 3.5,0 7" fill="#484f58"/>
                </marker>
                <marker id="topo-arrow-sel" markerWidth="9" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0,9 3.5,0 7" fill="#58a6ff"/>
                </marker>
                <marker id="topo-arrow-del" markerWidth="9" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0,9 3.5,0 7" fill="#f85149"/>
                </marker>
              </defs>
              <g id="topo-conns-g"></g>
              <line id="topo-temp-line"
                    stroke="#3fb950" stroke-width="2" stroke-dasharray="6 4"
                    x1="0" y1="0" x2="0" y2="0" style="display:none" pointer-events="none"/>
            </svg>
          </div>
          </div><!-- /topo-scroll-spacer -->
        </div>

        <!-- Properties panel -->
        <div id="topo-props" style="display:none">
          <div class="topo-props-header">
            <span id="topo-props-title">Properties</span>
            <button class="topo-props-close" onclick="topoDeselect()">✕</button>
          </div>
          <div id="topo-props-body"></div>
        </div>

      </div>
    </div>`;
}

/* ─── Load icons ─────────────────────────────────────────────────────────────── */
async function loadTopoIcons() {
  try {
    const [appsRes, topoRes] = await Promise.all([
      fetch(TAPI + 'icons.php'),
      fetch(TAPI + 'topology-icons.php'),
    ]);
    tIcons.apps = await appsRes.json();
    tIcons.topo = await topoRes.json();
  } catch { tIcons = { apps:[], topo:[] }; }
}

/* ─── Library rendering ──────────────────────────────────────────────────────── */
function renderLibrary() {
  const list = tLibTab === 'topo' ? tIcons.topo : tIcons.apps;
  const dir  = tLibTab === 'topo' ? 'topology/'  : '';
  const q    = tLibQuery;

  const filtered = q
    ? list.filter(f => f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').toLowerCase().includes(q))
    : list;

  const grid = gel('topo-lib-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="topo-lib-empty">No icons match your search.</div>';
    return;
  }

  grid.innerHTML = filtered.map(f => {
    const label = f.replace(/\.[^.]+$/, '');
    const src   = TICONS + dir + f;
    return `
      <div class="topo-lib-item" draggable="true" title="${label}"
           ondragstart="onLibDragStart(event,'${f}','${tLibTab === 'topo' ? 'topo' : 'apps'}')"
           ondblclick="addNodeAtCenter('${f}','${tLibTab === 'topo' ? 'topo' : 'apps'}')">
        <img src="${src}" loading="lazy" onerror="this.style.opacity='0.2'">
        <span>${label}</span>
      </div>`;
  }).join('');
}

function switchLibTab(tab) {
  tLibTab = tab;
  gel('libtab-topo')?.classList.toggle('active', tab === 'topo');
  gel('libtab-apps')?.classList.toggle('active', tab === 'apps');
  gel('topo-lib-search').value = '';
  tLibQuery = '';
  renderLibrary();
}

/* ─── Drag from library ──────────────────────────────────────────────────────── */
function onLibDragStart(e, filename, dir) {
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('application/x-topo-icon', JSON.stringify({ filename, dir }));
}

function onTopoDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

function onTopoDrop(e) {
  e.preventDefault();
  const raw = e.dataTransfer.getData('application/x-topo-icon');
  if (!raw) return;
  const { filename, dir } = JSON.parse(raw);
  const pt = canvasPt(e.clientX, e.clientY);
  addNode(filename, dir, pt.x - 32, pt.y - 32);
}

/* Double-click lib item → add at canvas center */
function addNodeAtCenter(filename, dir) {
  const wrap = gel('topo-canvas-wrap');
  const x = (wrap.scrollLeft + wrap.clientWidth  / 2) / tZoom - 32;
  const y = (wrap.scrollTop  + wrap.clientHeight / 2) / tZoom - 32;
  addNode(filename, dir, x, y);
}

/* ─── Coordinate helpers ─────────────────────────────────────────────────────── */
function canvasPt(clientX, clientY) {
  // Use scroll-based coords — unaffected by CSS transform scale
  const wrap = gel('topo-canvas-wrap');
  const rect = wrap.getBoundingClientRect();
  return {
    x: (clientX - rect.left + wrap.scrollLeft) / tZoom,
    y: (clientY - rect.top  + wrap.scrollTop)  / tZoom,
  };
}

function nodeCenter(n) {
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

function connEndPoints(c) {
  const a = T.nodes[c.from], b = T.nodes[c.to];
  if (!a || !b) return null;
  const ac = nodeCenter(a), bc = nodeCenter(b);
  const dx = bc.x - ac.x, dy = bc.y - ac.y;
  const len = Math.hypot(dx, dy);
  if (len < 2) return { x1:ac.x, y1:ac.y, x2:bc.x, y2:bc.y };
  const nx = dx / len, ny = dy / len;
  const ra = Math.min(a.w, a.h) / 2 + 4;
  const rb = Math.min(b.w, b.h) / 2 + 4;
  return {
    x1: ac.x + nx * ra, y1: ac.y + ny * ra,
    x2: bc.x - nx * rb, y2: bc.y - ny * rb,
  };
}

/* ─── Node operations ────────────────────────────────────────────────────────── */
function addNode(filename, dir, x, y) {
  const id = 'n' + (T.nextId++);
  T.nodes[id] = {
    id, x: Math.round(x), y: Math.round(y),
    w: 64, h: 64,
    icon: filename, dir,
    label: filename.replace(/\.[^.]+$/, ''),
    labelVis: true,
  };
  tDirty = true;
  renderNode(id);
  renderConnections();
  topoSelect('node', id);
}

function deleteNode(id) {
  // Remove all connections referencing this node
  Object.keys(T.connections).forEach(cid => {
    const c = T.connections[cid];
    if (c.from === id || c.to === id) {
      gel('conn-' + cid)?.remove();
      delete T.connections[cid];
    }
  });
  gel('node-' + id)?.remove();
  delete T.nodes[id];
  tDirty = true;
  renderConnections();
  if (tSelected?.id === id) topoDeselect();
}

/* ─── Connection operations ──────────────────────────────────────────────────── */
function addConnection(fromId, toId) {
  // Prevent duplicates
  const exists = Object.values(T.connections).some(
    c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
  );
  if (exists || fromId === toId) return;
  const id = 'c' + (T.nextId++);
  T.connections[id] = { id, from: fromId, to: toId, label: '', style: 'solid', color: '' };
  tDirty = true;
  renderConnections();
  topoSelect('conn', id);
}

function deleteConnection(id) {
  gel('conn-' + id)?.remove();
  delete T.connections[id];
  tDirty = true;
  if (tSelected?.id === id) topoDeselect();
}

/* ─── Text box operations ────────────────────────────────────────────────────── */
function addText(x, y) {
  const id = 'tx' + (T.nextId++);
  T.texts[id] = { id, x: Math.round(x), y: Math.round(y), text: 'Label', fontSize: 14, color: '' };
  tDirty = true;
  renderText(id);
  topoSelect('text', id);
  // Focus for immediate editing
  setTimeout(() => {
    const el = gel('text-' + id)?.querySelector('.topo-text-content');
    if (el) { el.focus(); selectAllText(el); }
  }, 50);
}

function deleteText(id) {
  gel('text-' + id)?.remove();
  delete T.texts[id];
  tDirty = true;
  if (tSelected?.id === id) topoDeselect();
}

function selectAllText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/* ─── Render: all ────────────────────────────────────────────────────────────── */
function renderAll() {
  Object.keys(T.nodes).forEach(renderNode);
  Object.keys(T.texts).forEach(renderText);
  renderConnections();
}

/* ─── Render: node ───────────────────────────────────────────────────────────── */
function renderNode(id) {
  const n   = T.nodes[id];
  if (!n) return;
  const dir = n.dir === 'topo' ? 'topology/' : '';
  const src = TICONS + dir + n.icon;

  let el = gel('node-' + id);
  if (!el) {
    el = document.createElement('div');
    el.id        = 'node-' + id;
    el.className = 'topo-node';
    el.innerHTML = `
      <img class="topo-node-img" src="${src}" loading="lazy" draggable="false"
           onerror="this.style.opacity='0.3'">
      <div class="topo-node-label" contenteditable="false"
           onblur="onNodeLabelBlur(event,'${id}')"
           onkeydown="onNodeLabelKey(event,'${id}')"></div>
      <div class="topo-node-resize" title="Drag to resize"
           onpointerdown="onResizePointerDown(event,'${id}')"></div>
      <div class="topo-node-port" title="Drag to connect"
           onpointerdown="onPortPointerDown(event,'${id}')"></div>`;
    gel('topo-canvas').appendChild(el);

    // Node pointer events
    el.addEventListener('pointerdown', ev => onNodePointerDown(ev, id));
    el.addEventListener('click',       ev => onNodeClick(ev, id));
    el.addEventListener('dblclick',    ev => onNodeDblClick(ev, id));
  }

  // Update position / size
  el.style.left    = n.x + 'px';
  el.style.top     = n.y + 'px';
  el.style.width   = n.w + 'px';

  const img = el.querySelector('.topo-node-img');
  if (img) { img.style.width = n.w + 'px'; img.style.height = n.h + 'px'; }

  const lbl = el.querySelector('.topo-node-label');
  if (lbl) {
    lbl.textContent = n.label;
    lbl.style.display = n.labelVis ? '' : 'none';
    lbl.style.color = n.labelColor || '';
  }

  // Selection ring
  el.classList.toggle('topo-selected', tSelected?.id === id);
  el.classList.toggle('topo-connect-src', tConnSrc === id);
}

/* ─── Render: text box ───────────────────────────────────────────────────────── */
function renderText(id) {
  const t = T.texts[id];
  if (!t) return;

  let el = gel('text-' + id);
  if (!el) {
    el = document.createElement('div');
    el.id        = 'text-' + id;
    el.className = 'topo-text';
    el.innerHTML = `<div class="topo-text-content" contenteditable="true"
                         onblur="onTextBlur(event,'${id}')"
                         onkeydown="onTextKey(event,'${id}')"></div>
                    <div class="topo-text-resize"
                         onpointerdown="onTextResizePointerDown(event,'${id}')"></div>`;
    gel('topo-canvas').appendChild(el);
    el.addEventListener('pointerdown', ev => onTextPointerDown(ev, id));
    el.addEventListener('click',       ev => onTextClick(ev, id));
  }

  el.style.left     = t.x + 'px';
  el.style.top      = t.y + 'px';
  el.style.fontSize = t.fontSize + 'px';

  const content = el.querySelector('.topo-text-content');
  if (content) {
    content.style.color = t.color || 'var(--text-muted)';
    if (content.textContent !== t.text) content.textContent = t.text;
  }

  el.classList.toggle('topo-selected', tSelected?.id === id);
}

/* ─── Render: connections ────────────────────────────────────────────────────── */
function renderConnections() {
  const g = gel('topo-conns-g');
  if (!g) return;
  g.innerHTML = '';

  Object.values(T.connections).forEach(c => {
    const pts = connEndPoints(c);
    if (!pts) return;
    const isSel  = tSelected?.id === c.id;
    const isDel  = tMode === 'delete';
    const color  = c.color || (isSel ? '#58a6ff' : isDel ? '#f85149' : '#484f58');
    const marker = isSel ? 'topo-arrow-sel' : isDel ? 'topo-arrow-del' : 'topo-arrow';
    const dash   = c.style === 'dashed' ? '8 4' : c.style === 'dotted' ? '2 4' : 'none';

    const g2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g2.id = 'conn-' + c.id;
    g2.style.cursor = 'pointer';

    // Invisible thick hit area
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hit.setAttribute('x1', pts.x1); hit.setAttribute('y1', pts.y1);
    hit.setAttribute('x2', pts.x2); hit.setAttribute('y2', pts.y2);
    hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', '12');
    hit.addEventListener('click', ev => onConnClick(ev, c.id));

    // Visible line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', pts.x1); line.setAttribute('y1', pts.y1);
    line.setAttribute('x2', pts.x2); line.setAttribute('y2', pts.y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', isSel ? '2.5' : '1.5');
    line.setAttribute('stroke-dasharray', dash);
    line.setAttribute('marker-end', `url(#${marker})`);
    line.style.pointerEvents = 'none';

    g2.appendChild(hit);
    g2.appendChild(line);

    // Connection label
    if (c.label) {
      const mx = (pts.x1 + pts.x2) / 2, my = (pts.y1 + pts.y2) / 2;
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', mx); txt.setAttribute('y', my - 5);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', color);
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-family', 'var(--mono)');
      txt.style.pointerEvents = 'none';
      txt.textContent = c.label;
      g2.appendChild(txt);
    }

    g.appendChild(g2);
  });
}

/* ─── Canvas events ──────────────────────────────────────────────────────────── */
(function bindCanvasEvents() {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = gel('topo-canvas');
    if (!canvas) return;

    canvas.addEventListener('pointerdown', onCanvasPointerDown);

    document.addEventListener('pointermove', onGlobalPointerMove);
    document.addEventListener('pointerup',   onGlobalPointerUp);
  });
})();

function onCanvasPointerDown(e) {
  if (e.target !== gel('topo-canvas') && e.target !== gel('topo-svg')) return;
  if (tMode === 'text') {
    const pt = canvasPt(e.clientX, e.clientY);
    addText(pt.x, pt.y);
    return;
  }
  if (tMode === 'connect') { cancelConnect(); return; }
  topoDeselect();

  // Start panning (select mode only, on empty canvas)
  if (tMode === 'select' && e.button === 0) {
    const wrap = gel('topo-canvas-wrap');
    tPan = { startX: e.clientX, startY: e.clientY,
             scrollLeft: wrap.scrollLeft, scrollTop: wrap.scrollTop };
    wrap.style.cursor = 'grabbing';
    e.currentTarget.setPointerCapture(e.pointerId);
  }
}

/* ─── Node events ────────────────────────────────────────────────────────────── */
function onNodePointerDown(e, id) {
  if (e.button !== 0) return;
  // Don't start drag from resize handle or port
  if (e.target.classList.contains('topo-node-resize')) return;
  if (e.target.classList.contains('topo-node-port'))   return;
  if (e.target.classList.contains('topo-node-label') && e.target.isContentEditable &&
      document.activeElement === e.target) return;

  if (tMode === 'delete') return;
  if (tMode === 'connect') return;

  e.stopPropagation();
  const n  = T.nodes[id];
  const pt = canvasPt(e.clientX, e.clientY);
  tDrag = { type:'node', id, startPX: e.clientX, startPY: e.clientY, origX: n.x, origY: n.y };
  gel('node-' + id).setPointerCapture(e.pointerId);
}

function onNodeClick(e, id) {
  e.stopPropagation();
  if (tMode === 'delete') { deleteNode(id); return; }
  if (tMode === 'connect') {
    if (!tConnSrc) {
      tConnSrc = id;
      gel('node-' + id)?.classList.add('topo-connect-src');
      setModeHint('Now click the destination node');
    } else if (tConnSrc !== id) {
      addConnection(tConnSrc, id);
      cancelConnect();
    }
    return;
  }
  topoSelect('node', id);
}

function onNodeDblClick(e, id) {
  e.stopPropagation();
  const lbl = gel('node-' + id)?.querySelector('.topo-node-label');
  if (!lbl) return;
  lbl.setAttribute('contenteditable', 'true');
  lbl.focus();
  selectAllText(lbl);
}

function onNodeLabelBlur(e, id) {
  const lbl = e.target;
  lbl.removeAttribute('contenteditable');
  const n = T.nodes[id];
  if (n) { n.label = lbl.textContent.trim() || n.label; tDirty = true; }
}

function onNodeLabelKey(e, id) {
  if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
  if (e.key === 'Escape') { e.target.blur(); }
}

/* ─── Connection click ───────────────────────────────────────────────────────── */
function onConnClick(e, id) {
  e.stopPropagation();
  if (tMode === 'delete') { deleteConnection(id); return; }
  topoSelect('conn', id);
}

/* ─── Text box events ────────────────────────────────────────────────────────── */
function onTextPointerDown(e, id) {
  if (e.button !== 0) return;
  if (e.target.classList.contains('topo-text-resize')) return;
  if (e.target.classList.contains('topo-text-content')) return;
  if (tMode === 'delete' || tMode === 'connect') return;
  e.stopPropagation();
  const t = T.texts[id];
  tDrag = { type:'text', id, startPX: e.clientX, startPY: e.clientY, origX: t.x, origY: t.y };
  gel('text-' + id).setPointerCapture(e.pointerId);
}

function onTextClick(e, id) {
  e.stopPropagation();
  if (tMode === 'delete') { deleteText(id); return; }
  topoSelect('text', id);
}

function onTextBlur(e, id) {
  const t = T.texts[id];
  if (t) { t.text = e.target.textContent || t.text; tDirty = true; }
}

function onTextKey(e, id) {
  if (e.key === 'Escape') e.target.blur();
}

/* ─── Resize node ────────────────────────────────────────────────────────────── */
function onResizePointerDown(e, id) {
  e.stopPropagation();
  e.preventDefault();
  const n = T.nodes[id];
  tResize = { type:'node', id, startPX: e.clientX, startPY: e.clientY, origW: n.w, origH: n.h };
  e.target.setPointerCapture(e.pointerId);
}

function onTextResizePointerDown(e, id) {
  e.stopPropagation();
  e.preventDefault();
  const t = T.texts[id];
  tResize = { type:'text', id, startPX: e.clientX, startPY: e.clientY, origSize: t.fontSize };
  e.target.setPointerCapture(e.pointerId);
}

/* ─── Connect port drag ──────────────────────────────────────────────────────── */
function onPortPointerDown(e, id) {
  e.stopPropagation();
  e.preventDefault();
  tConnSrc = id;
  gel('node-' + id)?.classList.add('topo-connect-src');
  // Show temp line
  const n = T.nodes[id];
  const c = nodeCenter(n);
  const tl = gel('topo-temp-line');
  tl.setAttribute('x1', c.x); tl.setAttribute('y1', c.y);
  tl.setAttribute('x2', c.x); tl.setAttribute('y2', c.y);
  tl.style.display = '';
  e.target.setPointerCapture(e.pointerId);
  setModeHint('Drag to a destination node, release to connect');
}

/* ─── Global pointer move / up ───────────────────────────────────────────────── */
function onGlobalPointerMove(e) {
  if (tPan) {
    const wrap = gel('topo-canvas-wrap');
    wrap.scrollLeft = tPan.scrollLeft - (e.clientX - tPan.startX);
    wrap.scrollTop  = tPan.scrollTop  - (e.clientY - tPan.startY);
    return;
  }

  if (tDrag) {
    const dx = (e.clientX - tDrag.startPX) / tZoom;
    const dy = (e.clientY - tDrag.startPY) / tZoom;
    if (tDrag.type === 'node') {
      const n = T.nodes[tDrag.id];
      n.x = Math.round(Math.max(0, tDrag.origX + dx));
      n.y = Math.round(Math.max(0, tDrag.origY + dy));
      const el = gel('node-' + tDrag.id);
      if (el) { el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; }
      renderConnections();
    } else if (tDrag.type === 'text') {
      const t = T.texts[tDrag.id];
      t.x = Math.round(Math.max(0, tDrag.origX + dx));
      t.y = Math.round(Math.max(0, tDrag.origY + dy));
      const el = gel('text-' + tDrag.id);
      if (el) { el.style.left = t.x + 'px'; el.style.top = t.y + 'px'; }
    }
    tDirty = true;
  }

  if (tResize) {
    if (tResize.type === 'node') {
      const ddx = (e.clientX - tResize.startPX) / tZoom;
      const ddy = (e.clientY - tResize.startPY) / tZoom;
      const n = T.nodes[tResize.id];
      n.w = Math.round(Math.max(24, Math.min(300, tResize.origW + ddx)));
      n.h = Math.round(Math.max(24, Math.min(300, tResize.origH + ddy)));
      const el = gel('node-' + tResize.id);
      if (el) {
        el.style.width = n.w + 'px';
        const img = el.querySelector('.topo-node-img');
        if (img) { img.style.width = n.w + 'px'; img.style.height = n.h + 'px'; }
      }
      renderConnections();
      tDirty = true;
    } else if (tResize.type === 'text') {
      const ddy = (e.clientY - tResize.startPY) / tZoom;
      const t = T.texts[tResize.id];
      t.fontSize = Math.round(Math.max(8, Math.min(72, tResize.origSize + ddy * 0.3)));
      const el = gel('text-' + tResize.id);
      if (el) el.style.fontSize = t.fontSize + 'px';
      tDirty = true;
    }
  }

  // Temp connection line
  if (tConnSrc) {
    const tl = gel('topo-temp-line');
    if (tl && tl.style.display !== 'none') {
      const n  = T.nodes[tConnSrc];
      if (n) {
        const c  = nodeCenter(n);
        const pt = canvasPt(e.clientX, e.clientY);
        tl.setAttribute('x1', c.x); tl.setAttribute('y1', c.y);
        tl.setAttribute('x2', pt.x); tl.setAttribute('y2', pt.y);
      }
    }
  }
}

function onGlobalPointerUp(e) {
  if (tPan) {
    tPan = null;
    gel('topo-canvas-wrap').style.cursor = '';
  }
  if (tDrag)   { tDrag = null; }
  if (tResize) { tResize = null; renderAll(); }

  // Port-drag connection: check if released over a node
  if (tConnSrc) {
    const tl = gel('topo-temp-line');
    if (tl && tl.style.display !== 'none') {
      const pt = canvasPt(e.clientX, e.clientY);
      // Find node under pointer
      const target = findNodeAt(pt.x, pt.y);
      if (target && target !== tConnSrc) {
        addConnection(tConnSrc, target);
      }
      cancelConnect();
    }
  }
}

function findNodeAt(x, y) {
  return Object.values(T.nodes).find(n =>
    x >= n.x && x <= n.x + n.w && y >= n.y && y <= n.y + n.h
  )?.id || null;
}

/* ─── Mode management ────────────────────────────────────────────────────────── */
function setTopoMode(m) {
  cancelConnect();
  tMode = m;
  qsa('.topo-mode-btn').forEach(b => b.classList.remove('active'));
  gel('tb-' + m)?.classList.add('active');

  const hints = {
    select:  'Click to select · Drag to move · Drag resize handle to resize · Double-click label to edit',
    connect: 'Click a source node, then click a destination node — or drag from the ⊙ port handle',
    text:    'Click anywhere on the canvas to place a text box',
    delete:  'Click any node, connection, or text to delete it',
  };
  setModeHint(hints[m] || '');

  const canvas = gel('topo-canvas');
  if (canvas) {
    canvas.dataset.mode = m;
  }
}

function setModeHint(txt) {
  const h = gel('topo-mode-hint');
  if (h) h.textContent = txt;
}

function cancelConnect() {
  if (tConnSrc) {
    gel('node-' + tConnSrc)?.classList.remove('topo-connect-src');
    tConnSrc = null;
  }
  const tl = gel('topo-temp-line');
  if (tl) tl.style.display = 'none';
}

/* ─── Selection & properties ─────────────────────────────────────────────────── */
function topoSelect(type, id) {
  tSelected = { type, id };
  // Update visual selection on all nodes/texts
  qsa('.topo-node').forEach(el => el.classList.toggle('topo-selected', el.id === 'node-' + id));
  qsa('.topo-text').forEach(el => el.classList.toggle('topo-selected', el.id === 'text-' + id));
  renderConnections();
  renderPropsPanel();
}

function topoDeselect() {
  tSelected = null;
  qsa('.topo-node').forEach(el => el.classList.remove('topo-selected'));
  qsa('.topo-text').forEach(el => el.classList.remove('topo-selected'));
  renderConnections();
  const pp = gel('topo-props');
  if (pp) pp.style.display = 'none';
}

function deleteSelected() {
  if (!tSelected) return;
  if (tSelected.type === 'node') deleteNode(tSelected.id);
  else if (tSelected.type === 'conn') deleteConnection(tSelected.id);
  else if (tSelected.type === 'text') deleteText(tSelected.id);
}

/* ─── Properties panel ───────────────────────────────────────────────────────── */
function renderPropsPanel() {
  const pp = gel('topo-props');
  const pb = gel('topo-props-body');
  const pt = gel('topo-props-title');
  if (!pp || !pb || !tSelected) return;

  pp.style.display = '';
  const { type, id } = tSelected;

  if (type === 'node') {
    const n = T.nodes[id];
    if (!n) return;
    pt.textContent = 'Node';
    const dir = n.dir === 'topo' ? 'topology/' : '';
    pb.innerHTML = `
      <div class="topo-prop-row">
        <div class="topo-prop-preview">
          <img src="${TICONS + dir + n.icon}" style="width:48px;height:48px;object-fit:contain">
        </div>
        <button class="topo-prop-btn" onclick="openTopoIconPicker('${id}')">Change Icon</button>
      </div>
      <div class="topo-prop-group">
        <label class="topo-prop-label">Label</label>
        <input class="topo-prop-input" value="${n.label}"
               oninput="onPropNodeLabel(this,'${id}')">
      </div>
      <div class="topo-prop-group topo-prop-row-inline">
        <label class="topo-prop-label">Show label</label>
        <label class="toggle-switch">
          <input type="checkbox" ${n.labelVis ? 'checked' : ''}
                 onchange="onPropNodeLabelVis(this,'${id}')">
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
        </label>
      </div>
      <div class="topo-prop-group">
        <label class="topo-prop-label">Label color</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" class="topo-prop-color"
                 value="${n.labelColor || '#c9d1d9'}" oninput="onPropNodeLabelColor(this,'${id}')">
          <button class="topo-prop-btn" onclick="onPropNodeLabelColorReset('${id}')">Reset</button>
        </div>
      </div>
      <div class="topo-prop-group">
        <label class="topo-prop-label">Size (px)</label>
        <div style="display:flex;gap:6px">
          <input class="topo-prop-input topo-prop-short" type="number" min="16" max="300"
                 value="${n.w}" placeholder="W" oninput="onPropNodeSize(this,'${id}','w')">
          <input class="topo-prop-input topo-prop-short" type="number" min="16" max="300"
                 value="${n.h}" placeholder="H" oninput="onPropNodeSize(this,'${id}','h')">
        </div>
      </div>
      <div class="topo-prop-group">
        <label class="topo-prop-label">Position</label>
        <div style="display:flex;gap:6px">
          <input class="topo-prop-input topo-prop-short" type="number"
                 value="${n.x}" placeholder="X" oninput="onPropNodePos(this,'${id}','x')">
          <input class="topo-prop-input topo-prop-short" type="number"
                 value="${n.y}" placeholder="Y" oninput="onPropNodePos(this,'${id}','y')">
        </div>
      </div>
      <button class="topo-prop-del-btn" onclick="deleteNode('${id}')">✕ Delete Node</button>`;

  } else if (type === 'conn') {
    const c = T.connections[id];
    if (!c) return;
    pt.textContent = 'Connection';
    pb.innerHTML = `
      <div class="topo-prop-group">
        <label class="topo-prop-label">Label</label>
        <input class="topo-prop-input" placeholder="e.g. 1Gbps"
               value="${c.label}" oninput="onPropConnLabel(this,'${id}')">
      </div>
      <div class="topo-prop-group">
        <label class="topo-prop-label">Line style</label>
        <select class="topo-prop-select" onchange="onPropConnStyle(this,'${id}')">
          <option value="solid"  ${c.style==='solid' ?'selected':''}>Solid</option>
          <option value="dashed" ${c.style==='dashed'?'selected':''}>Dashed</option>
          <option value="dotted" ${c.style==='dotted'?'selected':''}>Dotted</option>
        </select>
      </div>
      <div class="topo-prop-group">
        <label class="topo-prop-label">Color</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" class="topo-prop-color"
                 value="${c.color || '#484f58'}" oninput="onPropConnColor(this,'${id}')">
          <button class="topo-prop-btn" onclick="onPropConnColorReset('${id}')">Reset</button>
        </div>
      </div>
      <button class="topo-prop-del-btn" onclick="deleteConnection('${id}')">✕ Delete Connection</button>`;

  } else if (type === 'text') {
    const t = T.texts[id];
    if (!t) return;
    pt.textContent = 'Text Box';
    pb.innerHTML = `
      <div class="topo-prop-group">
        <label class="topo-prop-label">Text</label>
        <textarea class="topo-prop-textarea" oninput="onPropTextContent(this,'${id}')">${t.text}</textarea>
      </div>
      <div class="topo-prop-group">
        <label class="topo-prop-label">Font size</label>
        <input class="topo-prop-input topo-prop-short" type="number" min="8" max="72"
               value="${t.fontSize}" oninput="onPropTextSize(this,'${id}')">
      </div>
      <div class="topo-prop-group">
        <label class="topo-prop-label">Color</label>
        <input type="color" class="topo-prop-color"
               value="${t.color || '#c9d1d9'}" oninput="onPropTextColor(this,'${id}')">
      </div>
      <button class="topo-prop-del-btn" onclick="deleteText('${id}')">✕ Delete Text</button>`;
  }
}

/* ─── Property change handlers ───────────────────────────────────────────────── */
function onPropNodeLabel(inp, id) {
  const n = T.nodes[id]; if (!n) return;
  n.label = inp.value; tDirty = true;
  const lbl = gel('node-' + id)?.querySelector('.topo-node-label');
  if (lbl) lbl.textContent = n.label;
}
function onPropNodeLabelVis(cb, id) {
  const n = T.nodes[id]; if (!n) return;
  n.labelVis = cb.checked; tDirty = true;
  const lbl = gel('node-' + id)?.querySelector('.topo-node-label');
  if (lbl) lbl.style.display = n.labelVis ? '' : 'none';
}
function onPropNodeLabelColor(inp, id) {
  const n = T.nodes[id]; if (!n) return;
  n.labelColor = inp.value; tDirty = true;
  const lbl = gel('node-' + id)?.querySelector('.topo-node-label');
  if (lbl) lbl.style.color = n.labelColor;
}
function onPropNodeLabelColorReset(id) {
  const n = T.nodes[id]; if (!n) return;
  n.labelColor = ''; tDirty = true;
  const lbl = gel('node-' + id)?.querySelector('.topo-node-label');
  if (lbl) lbl.style.color = '';
  renderPropsPanel();
}
function onPropNodeSize(inp, id, axis) {
  const n = T.nodes[id]; if (!n) return;
  const v = Math.round(Math.max(16, Math.min(300, parseInt(inp.value) || 64)));
  n[axis] = v; tDirty = true;
  const el = gel('node-' + id); if (!el) return;
  el.style.width = n.w + 'px';
  const img = el.querySelector('.topo-node-img');
  if (img) { img.style.width = n.w + 'px'; img.style.height = n.h + 'px'; }
  renderConnections();
}
function onPropNodePos(inp, id, axis) {
  const n = T.nodes[id]; if (!n) return;
  n[axis] = Math.round(Math.max(0, parseInt(inp.value) || 0)); tDirty = true;
  const el = gel('node-' + id); if (!el) return;
  el.style.left = n.x + 'px'; el.style.top = n.y + 'px';
  renderConnections();
}
function onPropConnLabel(inp, id) {
  const c = T.connections[id]; if (!c) return;
  c.label = inp.value; tDirty = true; renderConnections();
}
function onPropConnStyle(sel, id) {
  const c = T.connections[id]; if (!c) return;
  c.style = sel.value; tDirty = true; renderConnections();
}
function onPropConnColor(inp, id) {
  const c = T.connections[id]; if (!c) return;
  c.color = inp.value; tDirty = true; renderConnections();
}
function onPropConnColorReset(id) {
  const c = T.connections[id]; if (!c) return;
  c.color = ''; tDirty = true; renderConnections(); renderPropsPanel();
}
function onPropTextContent(ta, id) {
  const t = T.texts[id]; if (!t) return;
  t.text = ta.value; tDirty = true;
  const el = gel('text-' + id)?.querySelector('.topo-text-content');
  if (el) el.textContent = t.text;
}
function onPropTextSize(inp, id) {
  const t = T.texts[id]; if (!t) return;
  t.fontSize = Math.max(8, Math.min(72, parseInt(inp.value) || 14)); tDirty = true;
  const el = gel('text-' + id); if (el) el.style.fontSize = t.fontSize + 'px';
}
function onPropTextColor(inp, id) {
  const t = T.texts[id]; if (!t) return;
  t.color = inp.value; tDirty = true;
  const content = gel('text-' + id)?.querySelector('.topo-text-content');
  if (content) content.style.color = t.color;
}

/* ─── Icon picker for node property panel ────────────────────────────────────── */
function openTopoIconPicker(nodeId) {
  // Reuse the existing icon picker from app.js but with a custom select callback
  if (typeof _allIcons === 'undefined' || !_allIcons) {
    fetch(TAPI + 'icons.php').then(r => r.json()).then(icons => {
      window._allIcons = icons;
      _openTopoIconPickerModal(nodeId);
    });
  } else {
    _openTopoIconPickerModal(nodeId);
  }
}

function _openTopoIconPickerModal(nodeId) {
  const existing = gel('icon-picker-overlay');
  if (existing) existing.remove();

  const picker = document.createElement('div');
  picker.id        = 'icon-picker-overlay';
  picker.className = 'icon-picker-overlay';

  // Combine both icon sets for the topo picker
  const allForPicker = [
    ...(_allIcons || []).map(f => ({ f, dir:'apps',   path: TICONS + f })),
    ...(tIcons.topo || []).map(f => ({ f, dir:'topo', path: TICONS + 'topology/' + f })),
  ];

  const renderGrid = (q) => {
    const q2 = q.toLowerCase();
    const filtered = q2
      ? allForPicker.filter(i => i.f.replace(/\.[^.]+$/, '').replace(/[-_]/g,' ').toLowerCase().includes(q2))
      : allForPicker;
    if (!filtered.length) return '<div class="icon-picker-empty">No results.</div>';
    return filtered.map(({ f, dir, path }) => {
      const label = f.replace(/\.[^.]+$/, '');
      const dirLabel = dir === 'topo' ? '⬡ ' : '';
      return `<button type="button" class="icon-picker-btn" title="${label}"
                      onclick="selectTopoIcon('${nodeId}','${f}','${dir}')">
                <img src="${path}" loading="lazy" onerror="this.style.opacity='0.2'">
                <span>${dirLabel}${label}</span>
              </button>`;
    }).join('');
  };

  picker.innerHTML = `
    <div class="icon-picker-modal">
      <div class="icon-picker-header">
        <span class="icon-picker-title">Choose Icon</span>
        <button type="button" class="icon-picker-close" onclick="gel('icon-picker-overlay').remove()">✕</button>
      </div>
      <div class="icon-picker-search-row">
        <input type="text" id="topo-icon-search" class="form-input"
               placeholder="Search ${allForPicker.length} icons…"
               oninput="gel('icon-picker-grid').innerHTML=renderTopoIconGrid(this.value,'${nodeId}')"
               autocomplete="off">
      </div>
      <div class="icon-picker-grid" id="icon-picker-grid">
        ${renderGrid('')}
      </div>
    </div>`;
  document.body.appendChild(picker);
  picker.querySelector('#topo-icon-search')?.focus();

  // Store render fn globally for inline oninput
  window.renderTopoIconGrid = renderGrid;
}

function selectTopoIcon(nodeId, filename, dir) {
  const n = T.nodes[nodeId]; if (!n) return;
  n.icon = filename; n.dir = dir; tDirty = true;
  renderNode(nodeId);
  renderPropsPanel();
  gel('icon-picker-overlay')?.remove();
}

/* ─── Zoom ───────────────────────────────────────────────────────────────────── */
const CANVAS_W = 4000, CANVAS_H = 2400;

function minZoom() {
  // Smallest zoom that still fills the wrapper completely (no dark surround)
  const wrap = gel('topo-canvas-wrap');
  if (!wrap) return 0.1;
  return Math.max(
    wrap.clientWidth  / CANVAS_W,
    wrap.clientHeight / CANVAS_H,
    0.1   // absolute floor
  );
}

function topoZoomBy(delta) {
  const wrap = gel('topo-canvas-wrap');
  if (!wrap) return;

  // Canvas point at viewport center before zoom
  const cx = (wrap.scrollLeft + wrap.clientWidth  / 2) / tZoom;
  const cy = (wrap.scrollTop  + wrap.clientHeight / 2) / tZoom;

  const min  = minZoom();
  tZoom = Math.round(Math.max(min, Math.min(3, tZoom + delta)) * 100) / 100;
  applyZoom();

  // Scroll so that same canvas point stays centered
  wrap.scrollLeft = cx * tZoom - wrap.clientWidth  / 2;
  wrap.scrollTop  = cy * tZoom - wrap.clientHeight / 2;
}

function topoZoomReset() {
  tZoom = 1;
  applyZoom();
  centerCanvas();
}

function applyZoom() {
  const canvas = gel('topo-canvas');
  if (canvas) canvas.style.transform = `scale(${tZoom})`;

  // Spacer sets the scroll area to exactly the scaled canvas size
  const spacer = gel('topo-scroll-spacer');
  if (spacer) {
    spacer.style.width  = CANVAS_W * tZoom + 'px';
    spacer.style.height = CANVAS_H * tZoom + 'px';
  }

  const lbl = gel('topo-zoom-lbl');
  if (lbl) lbl.textContent = Math.round(tZoom * 100) + '%';
}

function centerCanvas() {
  const wrap = gel('topo-canvas-wrap');
  if (!wrap) return;
  // Scroll to place the canvas center in the middle of the viewport
  wrap.scrollLeft = (CANVAS_W * tZoom - wrap.clientWidth)  / 2;
  wrap.scrollTop  = (CANVAS_H * tZoom - wrap.clientHeight) / 2;
}

/* ─── Clear ──────────────────────────────────────────────────────────────────── */
function clearTopology() {
  topoModal({
    title:   'Clear Canvas',
    message: 'Are you sure you want to clear the entire canvas? This cannot be undone.',
    confirm: 'Clear',
    danger:  true,
    onConfirm() {
      T = { nodes:{}, connections:{}, texts:{}, nextId:1 };
      qsa('.topo-node, .topo-text', gel('topo-canvas')).forEach(el => el.remove());
      renderConnections();
      topoDeselect();
      tDirty = true;
    },
  });
}

/* ─── Simple confirm modal (topology-local, no dependency on app.js) ─────────── */
function topoModal({ title, message, confirm: confirmLabel = 'Confirm', danger = false, onConfirm }) {
  gel('topo-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id        = 'topo-modal-overlay';
  overlay.className = 'topo-modal-overlay';
  overlay.innerHTML = `
    <div class="topo-modal">
      <div class="topo-modal-header">${title}</div>
      <div class="topo-modal-body">${message}</div>
      <div class="topo-modal-footer">
        <button class="topo-modal-btn topo-modal-cancel"
                onclick="gel('topo-modal-overlay').remove()">Cancel</button>
        <button class="topo-modal-btn topo-modal-confirm${danger ? ' danger' : ''}"
                id="topo-modal-ok">${confirmLabel}</button>
      </div>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  gel('topo-modal-ok').onclick = () => { overlay.remove(); onConfirm(); };
  gel('topo-modal-ok').focus();
}

/* ─── Persistence ────────────────────────────────────────────────────────────── */
async function loadTopologyState() {
  try {
    const res  = await fetch(TAPI + 'topology.php');
    const data = await res.json();
    T = {
      nodes:       data.nodes       || {},
      connections: data.connections || {},
      texts:       data.texts       || {},
      nextId:      data.nextId      || 1,
    };
    tDirty = false;
  } catch { T = { nodes:{}, connections:{}, texts:{}, nextId:1 }; }
}

async function saveTopology() {
  const btn = gel('topo-save-btn');  // find by class since no id
  const saveBtns = qsa('.topo-save-btn');
  saveBtns.forEach(b => { b.disabled = true; b.textContent = '…'; });
  try {
    const res = await fetch(TAPI + 'topology.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(T),
    });
    if (res.ok) {
      tDirty = false;
      saveBtns.forEach(b => { b.textContent = '✓ Saved'; });
      setTimeout(() => saveBtns.forEach(b => { b.disabled = false; b.textContent = '✓ Save'; }), 1500);
      if (typeof toast === 'function') toast('Topology saved');
    } else {
      throw new Error('Save failed');
    }
  } catch {
    saveBtns.forEach(b => { b.disabled = false; b.textContent = '✓ Save'; });
    if (typeof toast === 'function') toast('Save failed', 'err');
  }
}

/* ─── Bind canvas pointer events post-render ─────────────────────────────────── */
// Also re-bind after initTopologyEditor renders the HTML
const _origInit = window.initTopologyEditor;
window.renderTopologyPage = async function() {
  gel('page-content').innerHTML = buildEditorHTML();
  bindKeys();
  // Bind canvas events now that DOM exists
  const canvas = gel('topo-canvas');
  if (canvas) {
    canvas.addEventListener('pointerdown', onCanvasPointerDown);
    document.addEventListener('pointermove', onGlobalPointerMove);
    document.addEventListener('pointerup',   onGlobalPointerUp);
  }
  await Promise.all([loadTopoIcons(), loadTopologyState()]);
  renderLibrary();
  renderAll();
  applyZoom();
  centerCanvas();
};
