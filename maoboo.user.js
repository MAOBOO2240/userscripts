// ==UserScript==
// @name         MAO BOO 油猴整合包
// @namespace    https://github.com/mao-boo/userscripts
// @version      1.0.2
// @description  整合影片快轉、YouTube Shorts 自動下一部、Threads／X 音量記憶、X 影片下載、LINE 貼圖下載、網址追蹤參數清除、手機版轉電腦版；每個功能都能在選單裡個別開關，並會自動更新。
// @author       MAO BOO
// @homepageURL  https://github.com/MAOBOO2240/userscripts
// @supportURL   https://github.com/MAOBOO2240/userscripts/issues
// @updateURL    https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/maoboo.user.js
// @downloadURL  https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/maoboo.user.js
// @icon         https://pic.pngsucai.com/00/02/01/b0695d6af5dec84b.webp
// @match        *://*/*
// @run-at       document-start
// @sandbox      JavaScript
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_info
// @grant        unsafeWindow
// @connect      line-scdn.net
// @connect      raw.githubusercontent.com
// ==/UserScript==

/* ==更新紀錄==
 * 1.0.2  Threads 自己的音量條會跟記住的音量同步，拉的時候不會突然變大聲；在 Threads 音量條上調的音量也會記住
 * 1.0.1Threads 影片上的音量條改成預設不顯示，音量在設定面板調（面板裡可以再打開）
 * 1.0.0第一版：整合 7 支腳本，新增 Threads 音量記憶與 X 音量記憶，LINE 動態貼圖改成直接在 LINE 頁面轉 GIF
 * ==/更新紀錄== */

(function () {
  'use strict';

  /* ======================================================================
   * 基本設定與共用工具
   * ==================================================================== */

  const VERSION = (typeof GM_info !== 'undefined' && GM_info && GM_info.script && GM_info.script.version) || '0.0.0';
  const RAW_URL = 'https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/maoboo.user.js';
  const REPO_URL = 'https://github.com/MAOBOO2240/userscripts';
  // 需要碰到網頁本身的 JavaScript（history、visibilityState）時用 PAGE
  const PAGE = (typeof unsafeWindow !== 'undefined' && unsafeWindow) ? unsafeWindow : window;
  const IS_TOP = (() => { try { return window.top === window.self; } catch (_) { return false; } })();
  const HOST = (location.hostname || '').toLowerCase();
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const toPage = (fn) => (typeof exportFunction === 'function' ? exportFunction(fn, PAGE) : fn); // Firefox 相容
  const clamp01 = (v) => Math.min(1, Math.max(0, Number(v) || 0));
  const pad3 = (n) => String(n).padStart(3, '0');

  const store = {
    get(key, def) {
      try { const v = GM_getValue(key); return v === undefined || v === null ? def : v; } catch (_) { return def; }
    },
    set(key, val) {
      try { GM_setValue(key, val); } catch (e) { console.warn('[MAOBOO] 無法儲存設定', key, e); }
    },
    watch(key, fn) {
      if (typeof GM_addValueChangeListener !== 'function') return;
      try { GM_addValueChangeListener(key, (_k, _old, val, remote) => fn(val, remote)); } catch (_) { /* 舊版管理器不支援 */ }
    },
  };

  /** 建立 DOM（不用 innerHTML，YouTube 的 Trusted Types 也能用） */
  function h(tag, props, ...kids) {
    const isSvg = tag.startsWith('svg:');
    const el = isSvg ? document.createElementNS(SVG_NS, tag.slice(4)) : document.createElement(tag);
    if (props) {
      for (const k of Object.keys(props)) {
        const v = props[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.setAttribute('class', v);
        else if (k === 'text') el.textContent = v;
        else if (k === 'style') Object.assign(el.style, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (!isSvg && (k === 'value' || k === 'checked' || k === 'hidden' || k === 'disabled')) el[k] = v;
        else el.setAttribute(k, v === true ? '' : String(v));
      }
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid === null || kid === undefined || kid === false) continue;
      el.append(typeof kid === 'object' && kid.nodeType ? kid : String(kid));
    }
    return el;
  }

  /** 樣式放進 Shadow DOM：優先用 adoptedStyleSheets（不受網站 CSP 限制） */
  function adoptCss(root, css) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      root.adoptedStyleSheets = [sheet];
      return;
    } catch (_) { /* 改用 <style> */ }
    const style = document.createElement('style');
    style.textContent = css;
    root.appendChild(style);
  }

  /* ======================================================================
   * 介面樣式
   * ==================================================================== */

  const FONT = '"Segoe UI", "Microsoft JhengHei UI", "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", system-ui, sans-serif';

  const UI_CSS = `
:host {
  all: initial;
  --ink: #14212E; --ink-2: #4E5B69; --line: #E2E6EB; --wash: #F3F5F8; --paper: #FFFFFF; --accent: #2457D6;
  --font: ${FONT};
}
* { box-sizing: border-box; }
button, input, select, output { font: inherit; }

/* ---------- 通知 ---------- */
.mb-toasts { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); display: flex; flex-direction: column;
  align-items: center; gap: 8px; width: max-content; max-width: calc(100vw - 32px); pointer-events: none; font-family: var(--font); }
.mb-toast { pointer-events: auto; display: flex; align-items: center; gap: 12px; max-width: 540px; padding: 10px 8px 10px 16px;
  border-radius: 12px; background: var(--ink); color: #FFFFFF; font-size: 13.5px; line-height: 1.45;
  box-shadow: 0 12px 32px rgba(20, 33, 46, .32); animation: mb-in .18s ease-out; }
.mb-toast.is-leaving { opacity: 0; transform: translateY(6px); transition: opacity .16s, transform .16s; }
.mb-toast-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.mb-toast-text strong { font-weight: 700; }
.mb-toast-text span { color: #FFFFFF; }
.mb-toast-text strong + span { color: #D3DAE2; font-size: 12.5px; }
.mb-toast-actions { display: flex; gap: 6px; flex: none; }
.mb-toast-actions button { height: 30px; padding: 0 12px; border: 1px solid rgba(255, 255, 255, .3); border-radius: 8px;
  background: transparent; color: #FFFFFF; font-size: 13px; font-weight: 600; cursor: pointer; }
.mb-toast-actions button.is-primary { border-color: #FFFFFF; background: #FFFFFF; color: var(--ink); }
.mb-toast-x { flex: none; width: 28px; height: 28px; border: 0; border-radius: 8px; background: transparent; color: #AEB9C5;
  font-size: 18px; line-height: 1; cursor: pointer; }
.mb-toast-x:hover, .mb-toast-actions button:hover { background-color: rgba(255, 255, 255, .12); }
.mb-toast-actions button.is-primary:hover { background: #E6EBF1; }
.mb-toast button:focus-visible { outline: 2px solid #9DBAFF; outline-offset: 2px; }

/* ---------- 設定面板 ---------- */
.mb-backdrop { position: fixed; inset: 0; display: flex; align-items: flex-start; justify-content: center;
  padding: max(16px, 6vh) 16px 16px; background: rgba(20, 33, 46, .42); font-family: var(--font); animation: mb-fade .14s ease-out; }
.mb-panel { width: min(468px, 100%); max-height: calc(100vh - max(16px, 6vh) - 16px); display: flex; flex-direction: column;
  overflow: hidden; border-radius: 14px; background: var(--paper); color: var(--ink); font-size: 14px; line-height: 1.5;
  box-shadow: 0 24px 60px rgba(20, 33, 46, .3), 0 0 0 1px rgba(20, 33, 46, .08); animation: mb-in .18s ease-out; outline: none; }
.mb-tail { flex: none; height: 6px; background: repeating-linear-gradient(90deg, var(--ink) 0 24px, #C9D1DA 24px 48px); }
.mb-head { flex: none; display: flex; align-items: center; gap: 12px; padding: 14px 12px 14px 18px; border-bottom: 1px solid var(--line); }
.mb-mark { flex: none; width: 33px; height: 27px; }
.mb-head-text { min-width: 0; }
.mb-title { margin: 0; font-size: 16px; font-weight: 700; line-height: 1.3; }
.mb-sub { margin: 2px 0 0; font-size: 12.5px; color: var(--ink-2); }
.mb-ver { margin-left: auto; font-size: 12px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.mb-close { flex: none; width: 34px; height: 34px; border: 0; border-radius: 9px; background: transparent; color: var(--ink-2);
  font-size: 22px; line-height: 1; cursor: pointer; }
.mb-close:hover { background: var(--wash); color: var(--ink); }
.mb-body { flex: 1; overflow: auto; overscroll-behavior: contain; padding-bottom: 6px; }
.mb-group { margin: 0; padding: 14px 18px 4px; font-size: 12.5px; font-weight: 700; color: var(--ink-2); }
.mb-row { padding: 12px 18px 13px; border-top: 1px solid var(--line); }
.mb-group + .mb-row { border-top: 0; }
.mb-row-top { display: flex; align-items: flex-start; gap: 14px; }
.mb-info { flex: 1; min-width: 0; }
.mb-name { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; font-size: 14.5px; font-weight: 650; }
.mb-site { font-size: 12px; font-weight: 400; color: var(--ink-2); }
.mb-here { align-self: center; padding: 0 7px; border-radius: 999px; background: #E8EEFC; color: var(--accent);
  font-size: 11.5px; font-weight: 600; line-height: 18px; }
.mb-desc { margin: 3px 0 0; font-size: 12.5px; color: var(--ink-2); }
.mb-row.is-off .mb-name > span:first-child { color: var(--ink-2); }
.mb-fields { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 10px; }
.mb-row.is-off .mb-fields, .mb-row.is-off .mb-hint { opacity: .5; }
.mb-field { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--ink-2); }
.mb-field-wide { flex-basis: 100%; }
.mb-field input[type=number], .mb-field input[type=text], .mb-field select { height: 30px; padding: 0 8px; border: 1px solid #CDD4DC;
  border-radius: 7px; background: var(--paper); color: var(--ink); font-size: 13px; }
.mb-field input[type=number] { width: 76px; font-variant-numeric: tabular-nums; }
.mb-field input[type=text] { flex: 1; min-width: 0; }
.mb-field input[type=range] { width: 168px; margin: 0; accent-color: var(--accent); }
.mb-field output { min-width: 40px; color: var(--ink); font-weight: 650; font-variant-numeric: tabular-nums; }
.mb-field input:focus-visible, .mb-field select:focus-visible, .mb-btn:focus-visible, .mb-close:focus-visible,
.mb-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mb-hint { margin: 6px 0 0; font-size: 12px; color: var(--ink-2); }
.mb-switch { position: relative; flex: none; width: 46px; height: 26px; margin-top: 1px; }
.mb-switch input { -webkit-appearance: none; appearance: none; display: block; width: 100%; height: 100%; margin: 0;
  border-radius: 999px; background: #C3CBD4; cursor: pointer; transition: background-color .15s; }
.mb-switch input:checked { background: var(--accent); }
.mb-switch input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mb-knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(20, 33, 46, .35); pointer-events: none; transition: transform .15s; }
.mb-switch input:checked + .mb-knob { transform: translateX(20px); }
.mb-foot { flex: none; display: flex; align-items: center; gap: 12px; padding: 10px 18px; border-top: 1px solid var(--line); background: var(--wash); }
.mb-btn { height: 32px; padding: 0 14px; border: 1px solid #CDD4DC; border-radius: 8px; background: var(--paper); color: var(--ink);
  font-size: 13px; font-weight: 600; cursor: pointer; }
.mb-btn:hover { border-color: var(--ink-2); }
.mb-link { margin-left: auto; color: var(--accent); font-size: 13px; font-weight: 600; text-decoration: none; }
.mb-link:hover { text-decoration: underline; }

/* ---------- 影片音量條（Threads） ---------- */
.mb-vol { position: fixed; top: 0; left: 0; display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px 0 9px;
  border-radius: 17px; background: rgba(15, 22, 30, .76); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  color: #FFFFFF; font-family: var(--font); font-size: 12.5px; font-weight: 650; font-variant-numeric: tabular-nums;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .28); opacity: 0; transition: opacity .14s; user-select: none; -webkit-user-select: none; }
.mb-vol.is-on { opacity: 1; }
.mb-vol[hidden] { display: none; }
.mb-vol svg { flex: none; width: 18px; height: 18px; fill: currentColor; }
.mb-vol.is-muted svg { color: #FFB4A6; }
.mb-vol input { -webkit-appearance: none; appearance: none; width: 108px; height: 20px; margin: 0; background: transparent; cursor: pointer; }
.mb-vol input::-webkit-slider-runnable-track { height: 4px; border-radius: 2px;
  background: linear-gradient(90deg, #FFFFFF var(--p, 0%), rgba(255, 255, 255, .28) var(--p, 0%)); }
.mb-vol input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; margin-top: -5px; border-radius: 50%;
  background: #FFFFFF; box-shadow: 0 1px 4px rgba(0, 0, 0, .45); }
.mb-vol input::-moz-range-track { height: 4px; border-radius: 2px; background: rgba(255, 255, 255, .28); }
.mb-vol input::-moz-range-progress { height: 4px; border-radius: 2px; background: #FFFFFF; }
.mb-vol input::-moz-range-thumb { width: 14px; height: 14px; border: 0; border-radius: 50%; background: #FFFFFF; }
.mb-vol input:focus-visible { outline: 2px solid #9DBAFF; outline-offset: 3px; border-radius: 6px; }
.mb-vol output { min-width: 36px; text-align: right; }

@keyframes mb-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes mb-fade { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .mb-toast, .mb-backdrop, .mb-panel { animation: none !important; }
  .mb-vol, .mb-toast.is-leaving, .mb-knob, .mb-switch input { transition: none !important; }
}
`;

  /* ======================================================================
   * 共用介面：Shadow DOM 容器、鍵盤保護、通知
   * ==================================================================== */

  const ourHosts = new Set();
  let uiRoot = null;

  function ui() {
    if (uiRoot && uiRoot.host.isConnected) return uiRoot;
    const parent = document.documentElement;
    if (!parent) return null;
    if (!uiRoot) {
      const host = document.createElement('maoboo-ui');
      host.style.cssText = 'all:initial !important;position:fixed !important;top:0 !important;left:0 !important;'
        + 'width:0 !important;height:0 !important;z-index:2147483647 !important;display:block !important;';
      const root = host.attachShadow({ mode: 'open' });
      adoptCss(root, UI_CSS);
      uiRoot = { host, root };
      ourHosts.add(host);
    }
    parent.appendChild(uiRoot.host);
    return uiRoot;
  }

  function inOurUi(e) {
    if (!ourHosts.size || typeof e.composedPath !== 'function') return false;
    const path = e.composedPath();
    for (let i = 0; i < path.length; i++) if (ourHosts.has(path[i])) return true;
    return false;
  }

  /** 在我們的面板、音量條裡打字時，不讓網站的快捷鍵（例如 YouTube 的數字鍵跳轉）收到按鍵 */
  function installUiGuard() {
    const guard = (e) => {
      if (!inOurUi(e)) return;
      if (e.type === 'keydown' && e.key === 'Escape' && panel) { panel.close(); e.preventDefault(); }
      e.stopImmediatePropagation();
    };
    for (const type of ['keydown', 'keyup', 'keypress']) PAGE.addEventListener(type, guard, true);
  }

  function toast(message, opts = {}) {
    if (!IS_TOP) return null;
    const r = ui();
    if (!r) { document.addEventListener('DOMContentLoaded', () => toast(message, opts), { once: true }); return null; }
    let stack = r.root.querySelector('.mb-toasts');
    if (!stack) { stack = h('div', { class: 'mb-toasts', role: 'status', 'aria-live': 'polite' }); r.root.append(stack); }
    let timer = 0;
    const close = () => {
      clearTimeout(timer);
      if (!el.isConnected) return;
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 160);
    };
    const el = h('div', { class: 'mb-toast' },
      h('div', { class: 'mb-toast-text' },
        opts.title ? h('strong', { text: opts.title }) : null,
        message ? h('span', { text: message }) : null),
      (opts.actions && opts.actions.length) ? h('div', { class: 'mb-toast-actions' },
        opts.actions.map((a) => h('button', {
          type: 'button', class: a.primary ? 'is-primary' : null, text: a.label,
          onclick: () => { close(); if (a.run) a.run(); },
        }))) : null,
      h('button', {
        type: 'button', class: 'mb-toast-x', 'aria-label': '關閉通知', text: '×',
        onclick: () => { close(); if (opts.onClose) opts.onClose(); },
      }));
    stack.append(el);
    while (stack.children.length > 3) stack.firstElementChild.remove();
    if (!opts.sticky) timer = setTimeout(close, opts.timeout || 3500);
    return { close };
  }

  /* ======================================================================
   * 音量記憶（Threads、X 共用）
   * ==================================================================== */

  const keepers = new Map(); // memKey → 正在執行的音量記憶

  /**
   * 記住一個音量並套用到頁面上每一支影片：
   * - 影片出現、播放時套用記住的音量
   * - 網站自己把音量改回去（例如換片、取消靜音時重設成 100%）→ 改回記住的音量
   * - 使用者在網站自己的音量條上調整（指標按著或剛操作過、且在影片附近）→ 記住新音量
   */
  function startVolumeKeeper(memKey, defVol, afterApply) {
    let vol = clamp01(store.get(memKey, defVol));
    const state = new WeakMap();
    const listeners = new Set();
    const input = { down: false, x: -1e6, y: -1e6, t: 0 };
    let saveTimer = 0;
    let stopped = false;

    const st = (v) => {
      let s = state.get(v);
      if (!s) { s = { muted: v.muted, volume: v.volume, expect: null, fights: [] }; state.set(v, s); }
      return s;
    };
    function setVideo(v, value) {
      const s = st(v);
      if (Math.abs(v.volume - value) >= 0.0005) {
        s.expect = value;
        try { v.volume = value; } catch (_) { /* 有些播放器會鎖住 volume */ }
      }
      s.volume = v.volume;
      s.muted = v.muted;
      // 讓網站自己的播放器也知道這個音量（例如 Threads 的音量條），避免一拉就跳回 100%
      if (afterApply) { try { afterApply(v, value); } catch (_) { /* 網站改版時略過 */ } }
    }
    function applyAll() {
      const list = document.getElementsByTagName('video');
      for (let i = 0; i < list.length; i++) setVideo(list[i], vol);
    }
    function emit() { listeners.forEach((fn) => { try { fn(vol); } catch (_) { /* 介面錯誤不影響音量 */ } }); }
    function persist(now) {
      clearTimeout(saveTimer);
      saveTimer = 0;
      const write = () => { saveTimer = 0; store.set(memKey, Math.round(vol * 1000) / 1000); };
      if (now) write(); else saveTimer = setTimeout(write, 300);
    }
    function set(value, opt = {}) {
      vol = clamp01(value);
      applyAll();
      persist(!!opt.now);
      emit();
    }
    function nearPointer(v) {
      const r = v.getBoundingClientRect();
      const m = 48;
      return input.x >= r.left - m && input.x <= r.right + m && input.y >= r.top - m && input.y <= r.bottom + m;
    }
    function onVolumeChange(e) {
      const v = e.target;
      if (!v || v.tagName !== 'VIDEO') return;
      const s = st(v);
      const now = v.volume;
      if (s.expect !== null && Math.abs(now - s.expect) < 0.0005) { s.expect = null; s.volume = now; s.muted = v.muted; return; }
      s.expect = null;
      const mutedChanged = v.muted !== s.muted;
      const volChanged = Math.abs(now - s.volume) >= 0.0005;
      s.muted = v.muted;
      if (!volChanged) return;
      const recent = input.down || performance.now() - input.t < 700;
      const byUser = !mutedChanged && recent && nearPointer(v) && (input.down || now < 0.999);
      s.volume = now;
      if (byUser) { vol = clamp01(now); persist(false); emit(); return; }
      // 網站自己改的 → 還原；同一支影片 3 秒內改太多次就放棄，避免跟網站互搶
      const t = performance.now();
      s.fights = s.fights.filter((x) => t - x < 3000);
      if (s.fights.length >= 8) return;
      s.fights.push(t);
      setVideo(v, vol);
    }
    const onMedia = (e) => { const v = e.target; if (v && v.tagName === 'VIDEO') setVideo(v, vol); };
    const onDown = (e) => { if (!e.isTrusted) return; input.down = true; input.x = e.clientX; input.y = e.clientY; input.t = performance.now(); };
    const onUp = (e) => { if (!e.isTrusted) return; input.down = false; input.t = performance.now(); };
    const onMove = (e) => { input.x = e.clientX; input.y = e.clientY; if (input.down) input.t = performance.now(); };
    const onTouch = (e) => { if (e.isTrusted) input.t = performance.now(); };

    const docEvents = [['volumechange', onVolumeChange], ['loadedmetadata', onMedia], ['play', onMedia], ['playing', onMedia]];
    const winEvents = [['pointerdown', onDown], ['pointerup', onUp], ['pointercancel', onUp], ['pointermove', onMove], ['wheel', onTouch], ['keydown', onTouch]];
    docEvents.forEach(([t, fn]) => document.addEventListener(t, fn, true));
    winEvents.forEach(([t, fn]) => PAGE.addEventListener(t, fn, { capture: true, passive: true }));
    applyAll();

    const api = {
      get: () => vol,
      set,
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      syncRemote(v) { if (!stopped) { vol = clamp01(v); emit(); } },
      stop() {
        if (stopped) return;
        stopped = true;
        if (saveTimer) persist(true);
        docEvents.forEach(([t, fn]) => document.removeEventListener(t, fn, true));
        winEvents.forEach(([t, fn]) => PAGE.removeEventListener(t, fn, { capture: true }));
        listeners.clear();
        if (keepers.get(memKey) === api) keepers.delete(memKey);
      },
    };
    keepers.set(memKey, api);
    return api;
  }

  /**
   * Threads 的播放器（Meta VideoPlayer）自己記一份音量，音量條顯示的是它，不是影片實際的音量。
   * 從播放器按鈕的 React 資料找到控制器，用它的 setVolume 同步，音量條就會跟記住的音量一致。
   */
  const threadsCtrlCache = new WeakMap(); // video → { c, t }
  const isPlayerCtrl = (v) => v && typeof v === 'object' && typeof v.setVolume === 'function' && typeof v.getCurrentState === 'function';
  function ctrlFromElement(el) {
    const k = Object.keys(el).find((x) => x.startsWith('__reactFiber$'));
    let f = k ? el[k] : null;
    for (let i = 0; f && i < 25; i++, f = f.return) {
      for (let d = f.dependencies && f.dependencies.firstContext; d; d = d.next) {
        if (isPlayerCtrl(d.memoizedValue)) return d.memoizedValue;
      }
    }
    return null;
  }
  function findThreadsController(video) {
    const seen = new Set();
    let box = video.parentElement;
    for (let up = 0; box && up < 10; up++, box = box.parentElement) {
      const cands = box.querySelectorAll('[role="button"], [role="slider"], button');
      for (let i = 0, n = 0; i < cands.length && n < 80; i++) {
        const el = cands[i];
        if (seen.has(el)) continue;
        seen.add(el);
        n++;
        const c = ctrlFromElement(el);
        if (c && typeof c.internal_getVideoElement === 'function' && c.internal_getVideoElement() === video) return c;
      }
    }
    return null;
  }
  function syncThreadsPlayer(video, vol) {
    let hit = threadsCtrlCache.get(video);
    if (!hit || (!hit.c && performance.now() - hit.t > 2000)) {
      hit = { c: findThreadsController(video), t: performance.now() };
      threadsCtrlCache.set(video, hit);
    }
    const c = hit.c;
    if (!c) return;
    const st = c.getCurrentState();
    if (!st || typeof st.volume !== 'number' || Math.abs(st.volume - vol) > 0.004) c.setVolume(vol); // 不會改變靜音狀態
  }

  /** 滑鼠移到影片上時，在左下角顯示音量條（可拖、可用滾輪微調） */
  function createVolumeOverlay(keeper, opts) {
    const r = ui();
    if (!r) return { destroy() {} };
    const ICONS = {
      high: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
      low: 'M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z',
      zero: 'M7 9v6h4l5 5V4l-5 5H7z',
      muted: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
    };
    const path = h('svg:path', { d: ICONS.high });
    const icon = h('svg:svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, path);
    const range = h('input', { type: 'range', min: 0, max: 100, step: 1, 'aria-label': opts.label });
    const out = h('output', {});
    const box = h('div', { class: 'mb-vol', hidden: true, title: opts.title }, icon, range, out);
    r.root.append(box);

    let target = null;
    let dragging = false;
    let hideTimer = 0;
    let fadeTimer = 0;
    let raf = 0;
    let px = -1;
    let py = -1;

    function paint() {
      const v = Math.round(keeper.get() * 100);
      range.value = v;
      range.style.setProperty('--p', v + '%');
      out.textContent = v + '%';
      const muted = !!(target && target.muted);
      box.classList.toggle('is-muted', muted);
      path.setAttribute('d', muted ? ICONS.muted : v === 0 ? ICONS.zero : v < 50 ? ICONS.low : ICONS.high);
      box.title = muted ? opts.mutedTitle : opts.title;
    }
    const usable = (rc) => rc.width >= 140 && rc.height >= 80;
    function sameBox(v, el) {
      let a = v.parentElement;
      for (let i = 0; a && i < 10; i++, a = a.parentElement) {
        if (a === document.body || a === document.documentElement) return false;
        if (a.contains(el)) return true;
      }
      return false;
    }
    function videoAt(x, y, top) {
      if (top.tagName === 'VIDEO') return usable(top.getBoundingClientRect()) ? top : null;
      let best = null;
      let bestArea = Infinity;
      const list = document.getElementsByTagName('video');
      for (let i = 0; i < list.length; i++) {
        const v = list[i];
        const rc = v.getBoundingClientRect();
        if (x < rc.left || x > rc.right || y < rc.top || y > rc.bottom || !usable(rc) || !sameBox(v, top)) continue;
        const area = rc.width * rc.height;
        if (area < bestArea) { bestArea = area; best = v; }
      }
      return best;
    }
    function place() {
      if (!target || !target.isConnected) { hide(); return; }
      const rc = target.getBoundingClientRect();
      const vw = PAGE.innerWidth;
      const vh = PAGE.innerHeight;
      if (rc.bottom < 40 || rc.top > vh - 40 || rc.right < 40 || rc.left > vw - 40) { hide(); return; }
      const bw = box.offsetWidth || 180;
      const bh = box.offsetHeight || 34;
      const x = Math.max(4, Math.min(Math.max(rc.left, 0) + 10, vw - bw - 4));
      const y = Math.max(4, Math.min(Math.min(rc.bottom, vh) - bh - 10, vh - bh - 4));
      box.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    }
    function show(v) {
      cancelHide();
      clearTimeout(fadeTimer);
      if (target !== v) { target = v; paint(); }
      if (box.hidden) {
        box.hidden = false;
        place();
        void box.offsetWidth; // 讓淡入動畫生效
      }
      box.classList.add('is-on');
      place();
    }
    function hide() {
      cancelHide();
      box.classList.remove('is-on');
      target = null;
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => { if (!box.classList.contains('is-on')) box.hidden = true; }, 150);
    }
    function scheduleHide() {
      if (hideTimer || box.hidden) return;
      hideTimer = setTimeout(() => { hideTimer = 0; if (!dragging) hide(); }, 900);
    }
    function cancelHide() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; } }
    function probe() {
      raf = 0;
      if (px < 0) return;
      if (dragging) { place(); return; }
      const top = document.elementFromPoint(px, py);
      if (top === r.host) { cancelHide(); place(); return; }
      const v = top ? videoAt(px, py, top) : null;
      if (v) show(v);
      else if (!box.hidden) { scheduleHide(); place(); }
    }
    const request = () => { if (!raf) raf = requestAnimationFrame(probe); };
    const onMove = (e) => { px = e.clientX; py = e.clientY; request(); };
    const onUp = () => { if (dragging) { dragging = false; request(); } };
    const onVol = (e) => { if (e.target === target) paint(); };
    const onFullscreen = () => {
      const fs = document.fullscreenElement;
      const parent = fs && fs.tagName !== 'VIDEO' ? fs : document.documentElement;
      if (parent && r.host.parentNode !== parent) parent.appendChild(r.host);
    };

    range.addEventListener('input', () => keeper.set(Number(range.value) / 100));
    range.addEventListener('change', () => keeper.set(Number(range.value) / 100, { now: true }));
    range.addEventListener('pointerdown', () => { dragging = true; cancelHide(); });
    box.addEventListener('pointerenter', cancelHide);
    box.addEventListener('pointerleave', () => { if (!dragging) scheduleHide(); });
    box.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cur = Math.round(keeper.get() * 100);
      const up = (e.deltaY || e.deltaX) < 0;
      let next;
      if (up) next = cur < 10 ? cur + 1 : Math.floor(cur / 5) * 5 + 5;
      else next = cur <= 10 ? cur - 1 : Math.ceil(cur / 5) * 5 - 5;
      keeper.set(Math.max(0, Math.min(100, next)) / 100);
    }, { passive: false });

    PAGE.addEventListener('pointermove', onMove, { capture: true, passive: true });
    PAGE.addEventListener('pointerup', onUp, true);
    PAGE.addEventListener('pointercancel', onUp, true);
    PAGE.addEventListener('scroll', request, { capture: true, passive: true });
    PAGE.addEventListener('resize', request, { passive: true });
    document.addEventListener('volumechange', onVol, true);
    document.addEventListener('fullscreenchange', onFullscreen);
    const offChange = keeper.onChange(paint);
    paint();

    return {
      destroy() {
        offChange();
        cancelHide();
        clearTimeout(fadeTimer);
        if (raf) cancelAnimationFrame(raf);
        PAGE.removeEventListener('pointermove', onMove, { capture: true });
        PAGE.removeEventListener('pointerup', onUp, true);
        PAGE.removeEventListener('pointercancel', onUp, true);
        PAGE.removeEventListener('scroll', request, { capture: true });
        PAGE.removeEventListener('resize', request);
        document.removeEventListener('volumechange', onVol, true);
        document.removeEventListener('fullscreenchange', onFullscreen);
        box.remove();
      },
    };
  }

  /* ======================================================================
   * LINE 貼圖：APNG → GIF 轉檔引擎
   * 這個函式完全獨立（不用外部變數），可以直接丟進 Web Worker 執行；
   * 網站不允許 Worker 時就在主執行緒跑同一份程式。
   * GIF 編碼器與色彩量化改寫自 gifenc 1.0.3（MIT License © Matt DesLauriers）。
   * ==================================================================== */

  function lineGifEngine(scope) {
    'use strict';

    const CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      CRC[n] = c >>> 0;
    }
    const crc32 = (b, s, e) => {
      let c = 0xFFFFFFFF;
      for (let i = s; i < e; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8);
      return (c ^ 0xFFFFFFFF) >>> 0;
    };
    const u32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
    const u16 = (b, o) => (b[o] << 8) | b[o + 1];
    const put32 = (b, o, v) => { b[o] = v >>> 24; b[o + 1] = (v >>> 16) & 255; b[o + 2] = (v >>> 8) & 255; b[o + 3] = v & 255; };
    const PNG_SIG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

    function chunk(type, data) {
      const out = new Uint8Array(12 + data.length);
      put32(out, 0, data.length);
      for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
      out.set(data, 8);
      put32(out, 8 + data.length, crc32(out, 4, 8 + data.length));
      return out;
    }

    /** 拆解 APNG（影格時間、dispose 規則與 apng-js 1.1.1 相同）；不是動畫時回傳 null */
    function parseApng(bytes) {
      for (let i = 0; i < 8; i++) if (bytes[i] !== PNG_SIG[i]) throw new Error('不是 PNG 圖檔');
      let off = 8;
      let ihdr = null;
      let animated = false;
      let frame = null;
      const pre = [];
      const frames = [];
      while (off + 12 <= bytes.length) {
        const len = u32(bytes, off);
        const type = String.fromCharCode(bytes[off + 4], bytes[off + 5], bytes[off + 6], bytes[off + 7]);
        const d = off + 8;
        if (d + len + 4 > bytes.length || type === 'IEND') break;
        if (type === 'IHDR') ihdr = bytes.slice(d, d + len);
        else if (type === 'acTL') animated = true;
        else if (type === 'fcTL') {
          if (frame) frames.push(frame);
          const dn = u16(bytes, d + 20);
          let dd = u16(bytes, d + 22);
          if (dd === 0) dd = 100;
          let delay = (1000 * dn) / dd;
          if (delay <= 10) delay = 100;
          frame = {
            width: u32(bytes, d + 4), height: u32(bytes, d + 8), left: u32(bytes, d + 12), top: u32(bytes, d + 16),
            delay, dispose: bytes[d + 24], blend: bytes[d + 25], parts: [],
          };
          if (!frames.length && frame.dispose === 2) frame.dispose = 1;
        } else if (type === 'fdAT') { if (frame) frame.parts.push(bytes.subarray(d + 4, d + len)); }
        else if (type === 'IDAT') { if (frame) frame.parts.push(bytes.subarray(d, d + len)); }
        else pre.push(bytes.subarray(off, d + len + 4));
        off = d + len + 4;
      }
      if (frame) frames.push(frame);
      if (!ihdr) throw new Error('PNG 缺少 IHDR');
      if (!animated || !frames.length) return null;
      const iend = chunk('IEND', new Uint8Array(0));
      for (const f of frames) {
        const hd = ihdr.slice();
        put32(hd, 0, f.width);
        put32(hd, 4, f.height);
        f.blob = new Blob([PNG_SIG, chunk('IHDR', hd), ...pre, ...f.parts.map((p) => chunk('IDAT', p)), iend], { type: 'image/png' });
        f.parts = null;
      }
      return { width: u32(ihdr, 0), height: u32(ihdr, 4), frames };
    }

    /** GIF 延遲以 10ms 為單位，累積誤差避免整體播放時間漂移；低於 20ms 瀏覽器會當成 100ms，所以下限 20 */
    function delayQuantizer() {
      let carry = 0;
      return (raw) => {
        const target = (raw > 0 ? raw : 100) + carry;
        const delay = Math.max(20, Math.round(target / 10) * 10);
        carry = Math.max(-25, Math.min(25, target - delay));
        return delay;
      };
    }

    function makeCanvas(w, hgt) {
      if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(w, hgt);
      const c = document.createElement('canvas');
      c.width = w;
      c.height = hgt;
      return c;
    }

    function sameFrame(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }

    // ---------- 色彩量化（PnnQuant，改寫自 gifenc；輸入改成直方圖的 bin） ----------
    function quantize(list, maxColors) {
      const bincount = list.length;
      const bins = new Array(bincount);
      for (let i = 0; i < bincount; i++) {
        const b = list[i];
        bins[i] = { rc: b.r, gc: b.g, bc: b.b, cnt: b.n, nn: 0, fw: 0, bk: 0, tm: 0, mtm: 0, err: 0 };
      }
      const maxbins = bincount;
      if (!maxbins) return [];
      const useSqrt = (maxColors * maxColors) / maxbins >= 0.022;
      let i = 0;
      for (; i < maxbins - 1; ++i) {
        bins[i].fw = i + 1;
        bins[i + 1].bk = i;
        if (useSqrt) bins[i].cnt = Math.sqrt(bins[i].cnt);
      }
      if (useSqrt) bins[i].cnt = Math.sqrt(bins[i].cnt);
      const sqr = (v) => v * v;
      const findNN = (idx) => {
        let nn = 0;
        let err = 1e100;
        const b1 = bins[idx];
        const n1 = b1.cnt;
        for (let j = b1.fw; j !== 0; j = bins[j].fw) {
          const b = bins[j];
          const n2 = b.cnt;
          const nerr2 = (n1 * n2) / (n1 + n2);
          if (nerr2 >= err) continue;
          let nerr = nerr2 * sqr(b.rc - b1.rc);
          if (nerr >= err) continue;
          nerr += nerr2 * sqr(b.gc - b1.gc);
          if (nerr >= err) continue;
          nerr += nerr2 * sqr(b.bc - b1.bc);
          if (nerr >= err) continue;
          err = nerr;
          nn = j;
        }
        b1.err = err;
        b1.nn = nn;
      };
      const heap = new Uint32Array(bincount + 1);
      let hh, l, l2;
      for (i = 0; i < maxbins; ++i) {
        findNN(i);
        const err = bins[i].err;
        for (l = ++heap[0]; l > 1; l = l2) {
          l2 = l >> 1;
          if (bins[(hh = heap[l2])].err <= err) break;
          heap[l] = hh;
        }
        heap[l] = i;
      }
      const extbins = maxbins - maxColors;
      const last = bincount - 1;
      for (i = 0; i < extbins;) {
        let tb;
        for (;;) {
          let b1 = heap[1];
          tb = bins[b1];
          if (tb.tm >= tb.mtm && bins[tb.nn].mtm <= tb.tm) break;
          if (tb.mtm === last) b1 = heap[1] = heap[heap[0]--];
          else { findNN(b1); tb.tm = i; }
          const err = bins[b1].err;
          for (l = 1; (l2 = l + l) <= heap[0]; l = l2) {
            if (l2 < heap[0] && bins[heap[l2]].err > bins[heap[l2 + 1]].err) l2++;
            if (err <= bins[(hh = heap[l2])].err) break;
            heap[l] = hh;
          }
          heap[l] = b1;
        }
        const nb = bins[tb.nn];
        const n1 = tb.cnt;
        const n2 = nb.cnt;
        const d = 1.0 / (n1 + n2);
        tb.rc = d * (n1 * tb.rc + n2 * nb.rc);
        tb.gc = d * (n1 * tb.gc + n2 * nb.gc);
        tb.bc = d * (n1 * tb.bc + n2 * nb.bc);
        tb.cnt += nb.cnt;
        tb.mtm = ++i;
        bins[nb.bk].fw = nb.fw;
        bins[nb.fw].bk = nb.bk;
        nb.mtm = last;
      }
      const palette = [];
      const seen = new Set();
      for (i = 0; ; ) {
        const r = Math.min(255, Math.max(0, Math.round(bins[i].rc)));
        const g = Math.min(255, Math.max(0, Math.round(bins[i].gc)));
        const b = Math.min(255, Math.max(0, Math.round(bins[i].bc)));
        const key = (r << 16) | (g << 8) | b;
        if (!seen.has(key)) { seen.add(key); palette.push([r, g, b]); }
        if ((i = bins[i].fw) === 0) break;
      }
      return palette;
    }

    // ---------- GIF 編碼（LZW，改寫自 gifenc） ----------
    function createStream(cap) {
      let cursor = 0;
      let contents = new Uint8Array(cap);
      const expand = (need) => {
        const prev = contents.length;
        if (prev >= need) return;
        need = Math.max(need, (prev * (prev < 1048576 ? 2 : 1.125)) >>> 0, 256);
        const old = contents;
        contents = new Uint8Array(need);
        if (cursor > 0) contents.set(old.subarray(0, cursor), 0);
      };
      return {
        writeByte(b) { expand(cursor + 1); contents[cursor++] = b; },
        writeBytesView(data, offset, len) { expand(cursor + len); contents.set(data.subarray(offset, offset + len), cursor); cursor += len; },
        bytes() { return contents.slice(0, cursor); },
      };
    }

    const MASKS = [0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff, 0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff];
    function lzwEncode(pixels, colorDepth, out, accum, htab, codetab) {
      const BITS = 12;
      const hsize = htab.length;
      const initCodeSize = Math.max(2, colorDepth);
      accum.fill(0);
      codetab.fill(0);
      htab.fill(-1);
      let curAccum = 0;
      let curBits = 0;
      const initBits = initCodeSize + 1;
      let clearFlg = false;
      let nBits = initBits;
      let maxcode = (1 << nBits) - 1;
      const ClearCode = 1 << (initBits - 1);
      const EOFCode = ClearCode + 1;
      let freeEnt = ClearCode + 2;
      let aCount = 0;
      let ent = pixels[0];
      let hshift = 0;
      for (let fcode = hsize; fcode < 65536; fcode *= 2) ++hshift;
      hshift = 8 - hshift;
      out.writeByte(initCodeSize);
      const flushPacket = () => { out.writeByte(aCount); out.writeBytesView(accum, 0, aCount); aCount = 0; };
      const output = (code) => {
        curAccum &= MASKS[curBits];
        if (curBits > 0) curAccum |= code << curBits;
        else curAccum = code;
        curBits += nBits;
        while (curBits >= 8) {
          accum[aCount++] = curAccum & 0xff;
          if (aCount >= 254) flushPacket();
          curAccum >>= 8;
          curBits -= 8;
        }
        if (freeEnt > maxcode || clearFlg) {
          if (clearFlg) { nBits = initBits; maxcode = (1 << nBits) - 1; clearFlg = false; }
          else { ++nBits; maxcode = nBits === BITS ? 1 << nBits : (1 << nBits) - 1; }
        }
        if (code === EOFCode) {
          while (curBits > 0) {
            accum[aCount++] = curAccum & 0xff;
            if (aCount >= 254) flushPacket();
            curAccum >>= 8;
            curBits -= 8;
          }
          if (aCount > 0) flushPacket();
        }
      };
      output(ClearCode);
      const length = pixels.length;
      for (let idx = 1; idx < length; idx++) {
        nextBlock: {
          const c = pixels[idx];
          const fcode = (c << BITS) + ent;
          let i = (c << hshift) ^ ent;
          if (htab[i] === fcode) { ent = codetab[i]; break nextBlock; }
          const disp = i === 0 ? 1 : hsize - i;
          while (htab[i] >= 0) {
            i -= disp;
            if (i < 0) i += hsize;
            if (htab[i] === fcode) { ent = codetab[i]; break nextBlock; }
          }
          output(ent);
          ent = c;
          if (freeEnt < 1 << BITS) { codetab[i] = freeEnt++; htab[i] = fcode; }
          else { htab.fill(-1); freeEnt = ClearCode + 2; clearFlg = true; output(ClearCode); }
        }
      }
      output(ent);
      output(EOFCode);
      out.writeByte(0);
    }

    function gifEncoder() {
      const stream = createStream(16384);
      const accum = new Uint8Array(256);
      const htab = new Int32Array(5003);
      const codetab = new Int32Array(5003);
      let started = false;
      const byte = (b) => stream.writeByte(b);
      const u16le = (v) => { byte(v & 255); byte((v >> 8) & 255); };
      const ascii = (s) => { for (let i = 0; i < s.length; i++) byte(s.charCodeAt(i)); };
      const tableBits = (len) => Math.max(Math.ceil(Math.log2(len)), 1);
      const colorTable = (pal) => {
        const n = 1 << tableBits(pal.length);
        for (let i = 0; i < n; i++) { const c = pal[i] || [0, 0, 0]; byte(c[0]); byte(c[1]); byte(c[2]); }
      };
      return {
        writeFrame(index, width, height, o) {
          const first = !started;
          if (first) {
            started = true;
            ascii('GIF89a');
            u16le(width); u16le(height);
            byte(0x80 | (7 << 4) | (tableBits(o.palette.length) - 1)); byte(0); byte(0);
            colorTable(o.palette);
            byte(0x21); byte(0xff); byte(11); ascii('NETSCAPE2.0'); byte(3); byte(1); u16le(0); byte(0); // 無限循環
          }
          byte(0x21); byte(0xf9); byte(4);
          byte(((o.dispose & 7) << 2) | (o.transparent ? 1 : 0));
          u16le(Math.round(o.delay / 10));
          byte(o.transparent ? o.transparentIndex : 0); byte(0);
          byte(0x2c); u16le(0); u16le(0); u16le(width); u16le(height);
          if (!first && o.palette) { byte(0x80 | (tableBits(o.palette.length) - 1)); colorTable(o.palette); }
          else byte(0);
          lzwEncode(index, 8, stream, accum, htab, codetab);
        },
        finish() { byte(0x3b); },
        bytes() { return stream.bytes(); },
      };
    }

    const H_CNT = new Uint32Array(65536);
    const H_R = new Float64Array(65536);
    const H_G = new Float64Array(65536);
    const H_B = new Float64Array(65536);

    /** 從一或多格畫面的不透明像素建立 ≤255 色的色盤，回傳 { palette, lut（RGB565 → 色號）, err（平均平方誤差） } */
    function buildPalette(frames, fast) {
      H_CNT.fill(0); H_R.fill(0); H_G.fill(0); H_B.fill(0);
      for (const px of frames) {
        for (let k = 0; k < px.length; k++) {
          const c = px[k];
          if (c === 0) continue;
          const key = ((c & 0xf8) << 8) | ((c >>> 5) & 0x7e0) | ((c >>> 19) & 0x1f);
          H_CNT[key]++;
          H_R[key] += c & 255;
          H_G[key] += (c >>> 8) & 255;
          H_B[key] += (c >>> 16) & 255;
        }
      }
      const keys = [];
      for (let k = 0; k < 65536; k++) if (H_CNT[k]) keys.push(k);
      const K = keys.length;
      const lut = new Uint8Array(65536);
      if (!K) return { palette: [[0, 0, 0]], lut, err: 0 };
      const kr = new Float64Array(K);
      const kg = new Float64Array(K);
      const kb = new Float64Array(K);
      const kn = new Float64Array(K);
      for (let i = 0; i < K; i++) { const key = keys[i]; const n = H_CNT[key]; kn[i] = n; kr[i] = H_R[key] / n; kg[i] = H_G[key] / n; kb[i] = H_B[key] / n; }

      // 顏色很多時先把相近的顏色併成較粗的格子再跑 PnnQuant（它的時間跟格子數平方成正比），之後交給 k-means 補回精度
      let bins = new Array(K);
      for (let i = 0; i < K; i++) bins[i] = { r: kr[i], g: kg[i], b: kb[i], n: kn[i] };
      const limit = fast ? 1500 : 6000;
      for (let shift = 4; bins.length > limit && shift <= 5; shift++) {
        const m = new Map();
        for (const x of bins) {
          const kk = ((x.r >> shift) << 16) | ((x.g >> shift) << 8) | (x.b >> shift);
          let b = m.get(kk);
          if (!b) { b = { r: 0, g: 0, b: 0, n: 0 }; m.set(kk, b); }
          b.r += x.r * x.n; b.g += x.g * x.n; b.b += x.b * x.n; b.n += x.n;
        }
        bins = Array.from(m.values(), (b) => ({ r: b.r / b.n, g: b.g / b.n, b: b.b / b.n, n: b.n }));
      }
      const q = quantize(bins, 255);
      const P = q.length || 1;
      const pr = new Float64Array(P);
      const pg = new Float64Array(P);
      const pb = new Float64Array(P);
      q.forEach((p, i) => { pr[i] = p[0]; pg[i] = p[1]; pb[i] = p[2]; });
      const assign = new Uint16Array(K);
      const dist2 = new Float64Array(K);
      const nearestAll = () => {
        for (let i = 0; i < K; i++) {
          const r = kr[i];
          const g = kg[i];
          const b = kb[i];
          let best = assign[i];
          let dr = pr[best] - r;
          let dg = pg[best] - g;
          let db = pb[best] - b;
          let bd = dr * dr + dg * dg + db * db;
          for (let j = 0; j < P && bd > 0; j++) {
            dr = pr[j] - r;
            let d = dr * dr;
            if (d >= bd) continue;
            dg = pg[j] - g;
            d += dg * dg;
            if (d >= bd) continue;
            db = pb[j] - b;
            d += db * db;
            if (d < bd) { bd = d; best = j; }
          }
          assign[i] = best;
          dist2[i] = bd;
        }
      };
      if (P > 1) {
        const ar = new Float64Array(P);
        const ag = new Float64Array(P);
        const ab = new Float64Array(P);
        const an = new Float64Array(P);
        for (let iter = 0; iter < 4; iter++) {
          nearestAll();
          ar.fill(0); ag.fill(0); ab.fill(0); an.fill(0);
          for (let i = 0; i < K; i++) {
            const j = assign[i];
            const n = kn[i];
            ar[j] += kr[i] * n; ag[j] += kg[i] * n; ab[j] += kb[i] * n; an[j] += n;
          }
          let moved = 0;
          for (let j = 0; j < P; j++) {
            if (!an[j]) continue;
            const r = ar[j] / an[j];
            const g = ag[j] / an[j];
            const b = ab[j] / an[j];
            moved += Math.abs(r - pr[j]) + Math.abs(g - pg[j]) + Math.abs(b - pb[j]);
            pr[j] = r; pg[j] = g; pb[j] = b;
          }
          if (moved < 0.5 * P) break;
        }
      }
      // 色盤取整數後再對應一次，誤差以實際輸出的顏色計算
      for (let j = 0; j < P; j++) { pr[j] = Math.round(pr[j]); pg[j] = Math.round(pg[j]); pb[j] = Math.round(pb[j]); }
      nearestAll();
      let errSum = 0;
      let nSum = 0;
      for (let i = 0; i < K; i++) { lut[keys[i]] = assign[i]; errSum += dist2[i] * kn[i]; nSum += kn[i]; }
      const palette = new Array(P);
      for (let j = 0; j < P; j++) palette[j] = [pr[j], pg[j], pb[j]];
      return { palette, lut, err: errSum / nSum };
    }

    /** APNG（ArrayBuffer）→ 去背 GIF（Uint8Array） */
    async function convertApngToGif(buffer, opts) {
      const threshold = (opts && opts.alphaThreshold) || 128;
      const bytes = new Uint8Array(buffer);
      const info = parseApng(bytes);
      let w;
      let hgt;
      let frames;
      if (info) {
        w = info.width;
        hgt = info.height;
        frames = info.frames;
        const bitmaps = await Promise.all(frames.map((f) => createImageBitmap(f.blob)));
        frames.forEach((f, i) => { f.bitmap = bitmaps[i]; f.blob = null; });
      } else {
        const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
        w = bmp.width;
        hgt = bmp.height;
        frames = [{ width: w, height: hgt, left: 0, top: 0, delay: 100, dispose: 0, blend: 0, bitmap: bmp }];
      }
      if (!w || !hgt || !frames.length) throw new Error('圖片沒有任何影格');

      // 1. 依 APNG 規則合成每一格，alpha 低於門檻視為透明，其餘不透明
      const canvas = makeCanvas(w, hgt);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const nextDelay = delayQuantizer();
      const shots = [];
      let restore = null;
      for (let i = 0; i < frames.length; i++) {
        const f = frames[i];
        if (i > 0) {
          const p = frames[i - 1];
          if (p.dispose === 1) ctx.clearRect(p.left, p.top, p.width, p.height);
          else if (p.dispose === 2 && restore) ctx.putImageData(restore, 0, 0);
        }
        if (f.dispose === 2) restore = ctx.getImageData(0, 0, w, hgt);
        if (f.blend === 0) ctx.clearRect(f.left, f.top, f.width, f.height);
        ctx.drawImage(f.bitmap, f.left, f.top);
        if (f.bitmap.close) f.bitmap.close();
        const px = new Uint32Array(ctx.getImageData(0, 0, w, hgt).data.buffer);
        for (let k = 0; k < px.length; k++) { const c = px[k]; px[k] = (c >>> 24) < threshold ? 0 : c | 0xff000000; }
        const delay = nextDelay(Number(f.delay) || 0);
        const prev = shots[shots.length - 1];
        if (prev && sameFrame(prev.px, px)) prev.delay += delay; // 連續相同的畫面合併成一格
        else shots.push({ px, delay });
      }

      // 2. 先試「所有影格共用一個色盤」（顏色穩定、檔案小）；
      //    如果各格顏色差很多、共用色盤誤差太大，就改成每格各自的色盤（跟舊版 gif.js 一樣）
      const global = buildPalette(shots.map((s) => s.px));
      const perFrame = global.err > 25;
      const gif = gifEncoder();
      shots.forEach((s, fi) => {
        const pal = perFrame ? buildPalette([s.px], true) : global;
        const tIndex = pal.palette.length;
        const lut = pal.lut;
        const px = s.px;
        const idx = new Uint8Array(px.length);
        for (let k = 0; k < px.length; k++) {
          const c = px[k];
          idx[k] = c === 0 ? tIndex : lut[((c & 0xf8) << 8) | ((c >>> 5) & 0x7e0) | ((c >>> 19) & 0x1f)];
        }
        const palette = (fi === 0 || perFrame) ? pal.palette.concat([[0, 0, 0]]) : null;
        gif.writeFrame(idx, w, hgt, { palette, delay: s.delay, transparent: true, transparentIndex: tIndex, dispose: 2 });
        s.px = null;
      });
      gif.finish();
      return gif.bytes();
    }

    const api = { convertApngToGif };
    if (scope && typeof scope.importScripts === 'function') {
      scope.onmessage = (e) => {
        const m = e.data || {};
        if (m.type === 'ping') { scope.postMessage({ type: 'pong' }); return; }
        if (m.type !== 'convert') return;
        convertApngToGif(m.buffer, m.opts).then(
          (gif) => scope.postMessage({ type: 'done', id: m.id, gif }, [gif.buffer]),
          (err) => scope.postMessage({ type: 'done', id: m.id, error: String((err && err.message) || err) }));
      };
    }
    return api;
  }

  let workersBlocked = false; // 網站不允許 Worker（CSP）時記住，同一頁不再重試

  /** 轉檔工作池：能用 Web Worker 就多執行緒同時轉，不行就退回主執行緒 */
  function createGifPool() {
    const mainPool = () => {
      const engine = lineGifEngine(null);
      let chain = Promise.resolve();
      let closed = false;
      return {
        mode: 'main',
        size: 1,
        convert(buffer) {
          const run = chain.then(async () => {
            if (closed) throw new Error('已取消');
            await new Promise((r) => setTimeout(r, 0)); // 讓頁面有機會更新進度
            return engine.convertApngToGif(buffer);
          });
          chain = run.catch(() => {});
          return run;
        },
        close() { closed = true; },
      };
    };
    return new Promise((resolve) => {
      const size = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));
      let url = null;
      const workers = [];
      let settled = false;
      const fallback = () => {
        if (settled) return;
        settled = true;
        workersBlocked = true;
        workers.forEach((w) => { try { w.terminate(); } catch (_) { /* 已結束 */ } });
        if (url) URL.revokeObjectURL(url);
        resolve(mainPool());
      };
      if (workersBlocked) { settled = true; resolve(mainPool()); return; }
      try {
        url = URL.createObjectURL(new Blob(['(' + lineGifEngine.toString() + ')(self);'], { type: 'text/javascript' }));
        for (let i = 0; i < size; i++) workers.push(new Worker(url));
      } catch (_) { fallback(); return; }
      let ready = 0;
      const timer = setTimeout(fallback, 2500);
      workers.forEach((w) => {
        w.onerror = () => { clearTimeout(timer); fallback(); };
        w.onmessage = (e) => {
          if (settled || !e.data || e.data.type !== 'pong' || ++ready < workers.length) return;
          settled = true;
          clearTimeout(timer);
          resolve(workerPool(workers, url, mainPool));
        };
        w.postMessage({ type: 'ping' });
      });
    });
  }

  function workerPool(workers, url, mainPool) {
    const idle = workers.slice();
    const queue = [];
    const pending = new Map();
    let seq = 0;
    let closed = false;
    let backup = null;
    const pump = () => {
      if (closed) return;
      if (!workers.length) {
        backup = backup || mainPool();
        while (queue.length) { const t = queue.shift(); backup.convert(t.buffer).then(t.resolve, t.reject); }
        return;
      }
      while (idle.length && queue.length) {
        const w = idle.pop();
        const t = queue.shift();
        t.worker = w;
        pending.set(t.id, t);
        const msg = { type: 'convert', id: t.id, buffer: t.buffer };
        try { w.postMessage(msg, [t.buffer]); } catch (_) {
          try { w.postMessage(msg); } catch (e) { pending.delete(t.id); idle.push(w); t.reject(e); continue; }
        }
        t.buffer = null;
      }
    };
    workers.forEach((w) => {
      w.onmessage = (e) => {
        const m = e.data || {};
        if (m.type !== 'done') return;
        const t = pending.get(m.id);
        pending.delete(m.id);
        idle.push(w);
        pump();
        if (t) { if (m.error) t.reject(new Error(m.error)); else t.resolve(m.gif); }
      };
      w.onerror = (ev) => {
        try { ev.preventDefault(); } catch (_) { /* 無法取消預設行為 */ }
        for (const [id, t] of pending) {
          if (t.worker === w) { pending.delete(id); t.reject(new Error(ev.message || '背景轉檔失敗')); }
        }
        const k = workers.indexOf(w);
        if (k >= 0) workers.splice(k, 1);
        const j = idle.indexOf(w);
        if (j >= 0) idle.splice(j, 1);
        try { w.terminate(); } catch (_) { /* 已結束 */ }
        pump();
      };
    });
    return {
      mode: 'worker',
      size: workers.length,
      convert(buffer) {
        return new Promise((resolve, reject) => {
          if (closed) { reject(new Error('已取消')); return; }
          queue.push({ id: ++seq, buffer, resolve, reject });
          pump();
        });
      },
      close() {
        if (closed) return;
        closed = true;
        workers.forEach((w) => { try { w.terminate(); } catch (_) { /* 已結束 */ } });
        URL.revokeObjectURL(url);
        queue.splice(0).forEach((t) => t.reject(new Error('已取消')));
        pending.forEach((t) => t.reject(new Error('已取消')));
        pending.clear();
        if (backup) backup.close();
      },
    };
  }

  /* ---------- LINE 下載用工具 ---------- */

  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(b, s = 0, e = b.length) {
    let c = 0xFFFFFFFF;
    for (let i = s; i < e; i++) c = CRC_TABLE[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  /** 動態貼圖沒有靜態圖時下載 APNG，並把播放次數改成 0（無限循環） */
  function makeApngInfinite(buffer) {
    const b = new Uint8Array(buffer);
    let off = 8;
    while (off + 12 <= b.length) {
      const len = ((b[off] << 24) | (b[off + 1] << 16) | (b[off + 2] << 8) | b[off + 3]) >>> 0;
      const type = String.fromCharCode(b[off + 4], b[off + 5], b[off + 6], b[off + 7]);
      if (type === 'acTL') {
        const p = off + 8 + 4;
        b[p] = 0; b[p + 1] = 0; b[p + 2] = 0; b[p + 3] = 0;
        const c = crc32(b, off + 4, off + 8 + len);
        const q = off + 8 + len;
        b[q] = c >>> 24; b[q + 1] = (c >>> 16) & 255; b[q + 2] = (c >>> 8) & 255; b[q + 3] = c & 255;
        break;
      }
      if (type === 'IDAT' || type === 'IEND') break;
      off += 12 + len;
    }
    return buffer;
  }

  /** 不壓縮的 ZIP（圖片本身已壓縮，打包最快），檔名用 UTF-8 */
  function makeZip(entries) {
    const enc = new TextEncoder();
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const parts = [];
    const central = [];
    let offset = 0;
    for (const { name, data } of entries) {
      const nameBytes = enc.encode(name);
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true);
      lh.setUint16(4, 20, true);
      lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true);
      lh.setUint16(10, dosTime, true);
      lh.setUint16(12, dosDate, true);
      lh.setUint32(14, crc, true);
      lh.setUint32(18, data.length, true);
      lh.setUint32(22, data.length, true);
      lh.setUint16(26, nameBytes.length, true);
      lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), nameBytes, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true);
      ch.setUint16(4, 20, true);
      ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true);
      ch.setUint16(10, 0, true);
      ch.setUint16(12, dosTime, true);
      ch.setUint16(14, dosDate, true);
      ch.setUint32(16, crc, true);
      ch.setUint32(20, data.length, true);
      ch.setUint32(24, data.length, true);
      ch.setUint16(28, nameBytes.length, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), nameBytes);
      offset += 30 + nameBytes.length + data.length;
    }
    const cdSize = central.reduce((s, p) => s + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, cdSize, true);
    end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
  }

  function gmFetch(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET', url, responseType: 'arraybuffer', timeout: 30000,
        onload: (res) => (res.status >= 200 && res.status < 300 && res.response ? resolve(res.response) : reject(new Error(`HTTP ${res.status}`))),
        onerror: () => reject(new Error('網路錯誤')),
        ontimeout: () => reject(new Error('逾時')),
      });
    });
  }

  function limiter(n) {
    let active = 0;
    const queue = [];
    const next = () => {
      if (active >= n || !queue.length) return;
      active++;
      const job = queue.shift();
      Promise.resolve().then(job.fn).then(job.resolve, job.reject).finally(() => { active--; next(); });
    };
    return (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); next(); });
  }

  function saveBlob(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    (document.body || document.documentElement).appendChild(a);
    a.click();
    a.remove();
  }

  const LINE_CSS = `
:host { all: initial; display: block; width: 100%; margin-top: 8px; }
* { box-sizing: border-box; }
.ls { font-family: ${FONT}; color: #1C2733; -webkit-font-smoothing: antialiased; }
.ls-btns { display: flex; gap: 6px; }
.ls-btn { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  height: 56px; padding: 0 10px; border: 0; border-radius: 8px; background: #06C755; color: #FFFFFF; font: inherit; font-size: 15px;
  font-weight: 700; line-height: 1.2; cursor: pointer; transition: filter .15s; }
.ls-btn small { font-size: 11.5px; font-weight: 500; opacity: .92; }
.ls-btn.is-alt { background: #FFFFFF; color: #1C2733; box-shadow: inset 0 0 0 1.5px #C5CDD6; }
.ls-btn:hover:not(:disabled) { filter: brightness(.95); }
.ls-btn:disabled { cursor: progress; opacity: .55; }
.ls-btn:focus-visible { outline: 2px solid #1C2733; outline-offset: 2px; }
.ls-card { margin-top: 8px; padding: 12px 14px; border: 1px solid #DCE2E8; border-radius: 10px; background: #FFFFFF; }
.ls-card[hidden] { display: none; }
.ls-top { display: flex; align-items: baseline; gap: 12px; }
.ls-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 700; }
.ls-count { flex: none; font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.ls-bar { position: relative; height: 8px; margin: 10px 0 9px; overflow: hidden; border-radius: 4px; background: #EDF1F4; }
.ls-bar i { position: absolute; top: 0; bottom: 0; left: 0; width: 0; border-radius: 4px; transition: width .2s ease-out; }
.ls-bar .ls-dl { background: #B8EBCF; }
.ls-bar .ls-cv { background: #06C755; }
.ls-card.is-error .ls-cv { background: #D92D20; }
.ls-meta { display: flex; align-items: center; gap: 12px; min-height: 28px; font-size: 12.5px; color: #4D5A67; font-variant-numeric: tabular-nums; }
.ls-actions { margin-left: auto; display: flex; gap: 6px; }
.ls-actions button { height: 28px; padding: 0 11px; border: 1px solid #C5CDD6; border-radius: 7px; background: #FFFFFF; color: #1C2733;
  font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.ls-actions button:hover { border-color: #4D5A67; }
.ls-actions button.is-primary { border-color: #06C755; background: #06C755; color: #FFFFFF; }
.ls-actions button:focus-visible { outline: 2px solid #1C2733; outline-offset: 2px; }
.ls-err { margin: 8px 0 0; font-size: 12.5px; color: #B42318; }
.ls-err[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) { .ls-bar i, .ls-btn { transition: none; } }
`;

  /* ======================================================================
   * 功能模組
   * 每個模組：start() 啟動並回傳 stop()；設定開關可以即時套用，不用重新整理
   * ==================================================================== */

  const MOD_NAME = { ctrl: 'Ctrl', shift: 'Shift', alt: 'Alt' };
  const WIKI_RE = /^[a-z0-9-]+\.m\.(wikipedia|wiktionary|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|wikimedia|wikidata|mediawiki|wikifunctions)\.org$/;

  const MODULES = [
    /* ---------------- 影片快轉 ---------------- */
    {
      id: 'seek',
      group: 'video',
      name: '影片快轉',
      site: '所有網站',
      desc: '按住修飾鍵再按 ← 或 →，讓影片倒退或前進固定秒數；在輸入框打字時不會誤觸。',
      defaults: { seconds: 87, modifier: 'ctrl' },
      fields: [
        { key: 'seconds', label: '秒數', type: 'number', min: 1, max: 3600, step: 1, unit: '秒' },
        { key: 'modifier', label: '修飾鍵', type: 'select', options: [['ctrl', 'Ctrl'], ['shift', 'Shift'], ['alt', 'Alt']] },
      ],
      menu: (c) => `影片快轉（${MOD_NAME[c.modifier] || 'Ctrl'} + ←/→ ${c.seconds} 秒）`,
      frames: 'all',
      phase: 'start',
      match: () => true,
      start(ctx) {
        const isTyping = (t) => {
          if (!t || !t.tagName) return false;
          const tag = t.tagName.toLowerCase();
          return tag === 'input' || tag === 'textarea' || t.isContentEditable;
        };
        /** 取得最適合操作的 <video>：播放中 > 畫面內 > 面積大 */
        const getActiveVideo = () => {
          const videos = document.querySelectorAll('video');
          if (videos.length === 0) return null;
          if (videos.length === 1) return videos[0];
          const viewW = window.innerWidth;
          const viewH = window.innerHeight;
          let bestVideo = null;
          let bestScore = -1;
          for (const v of videos) {
            let score = 0;
            if (!v.paused) score += 10000;
            const r = v.getBoundingClientRect();
            const isVisible = r.width > 20 && r.height > 20 && r.bottom > 0 && r.right > 0 && r.top < viewH && r.left < viewW;
            if (isVisible) score += 1000;
            score += (v.videoWidth * v.videoHeight) / 10000;
            if (score > bestScore) { bestScore = score; bestVideo = v; }
          }
          return bestVideo;
        };
        const handler = (e) => {
          const c = ctx.cfg();
          const prop = { ctrl: 'ctrlKey', shift: 'shiftKey', alt: 'altKey' }[c.modifier] || 'ctrlKey';
          if (!e[prop] || (e.code !== 'ArrowLeft' && e.code !== 'ArrowRight')) return;
          const target = (typeof e.composedPath === 'function' && e.composedPath()[0]) || e.target;
          if (isTyping(target)) return; // 正在打字時讓瀏覽器做原本的文字跳轉
          const video = getActiveVideo();
          if (!video) return;
          e.preventDefault();
          e.stopImmediatePropagation(); // 確定有影片才攔截，避免 YouTube 搶走
          const dir = e.code === 'ArrowRight' ? 1 : -1;
          const duration = isNaN(video.duration) ? Infinity : video.duration; // 直播的 duration 可能是 NaN
          const secs = Math.max(1, Number(c.seconds) || 87);
          video.currentTime = Math.min(Math.max(video.currentTime + dir * secs, 0), duration);
        };
        PAGE.addEventListener('keydown', handler, true);
        return () => PAGE.removeEventListener('keydown', handler, true);
      },
    },

    /* ---------------- YouTube Shorts 自動下一部 ---------------- */
    {
      id: 'ytShorts',
      group: 'video',
      name: 'YouTube Shorts 自動下一部',
      site: 'YouTube',
      desc: '短影片快播完時自動跳到下一部，切到其他分頁也會繼續播。只在 Shorts 頁面作用。',
      defaults: { remain: 0.3 },
      fields: [{ key: 'remain', label: '剩幾秒時跳', type: 'number', min: 0.1, max: 3, step: 0.1, unit: '秒' }],
      hint: '電腦比較慢、常常沒跳到下一部時，可以把秒數調大一點。',
      frames: 'all',
      phase: 'start',
      match: () => HOST === 'www.youtube.com' && location.protocol === 'https:',
      start(ctx) {
        const doc = PAGE.document;
        const isShortsPage = () => PAGE.location.href.includes('/shorts/');
        const proto = PAGE.Document.prototype;
        const rawVis = Object.getOwnPropertyDescriptor(proto, 'visibilityState');
        const rawHidden = Object.getOwnPropertyDescriptor(proto, 'hidden');
        const isRealBackground = () => (rawVis ? rawVis.get.call(doc) === 'hidden' : false);

        // 第一重：只在 Shorts 頁面偽裝成「分頁一直在前景」，其他 YouTube 頁面照常
        try {
          if (rawVis) Object.defineProperty(doc, 'visibilityState', { configurable: true, get: toPage(function () { return isShortsPage() ? 'visible' : rawVis.get.call(doc); }) });
          if (rawHidden) Object.defineProperty(doc, 'hidden', { configurable: true, get: toPage(function () { return isShortsPage() ? false : rawHidden.get.call(doc); }) });
        } catch (e) { console.error('[YT Shorts Auto] 偽裝 Visibility 失敗', e); }
        const stopIfShorts = (e) => { if (isShortsPage()) e.stopImmediatePropagation(); };
        PAGE.addEventListener('visibilitychange', stopIfShorts, true);
        doc.addEventListener('visibilitychange', stopIfShorts, true);
        PAGE.addEventListener('blur', stopIfShorts, true);

        // 第二重：三軌跳轉
        let lastTriggeredSrc = '';
        let isTransitioning = false;
        const timers = new Set();
        const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
        const KE = PAGE.KeyboardEvent;
        function triggerNextVideo(video) {
          if (isTransitioning) return;
          isTransitioning = true;
          lastTriggeredSrc = video.currentSrc || video.src;
          console.log('[YT Shorts Auto] 偵測到觸發點，啟動三軌跳轉機制...');
          // 軌道一：模擬鍵盤向下鍵
          const keyDownEvent = new KE('keydown', { key: 'ArrowDown', keyCode: 40, code: 'ArrowDown', which: 40, bubbles: true, cancelable: true });
          doc.dispatchEvent(keyDownEvent);
          PAGE.dispatchEvent(keyDownEvent);
          video.dispatchEvent(keyDownEvent);
          // 軌道二：把下一部影片的區塊捲上來
          const activeRenderer = doc.querySelector('ytd-reel-video-renderer[is-active]') || doc.querySelector('ytd-reel-video-renderer');
          let nextRenderer = null;
          if (activeRenderer) {
            nextRenderer = activeRenderer.nextElementSibling;
            if (nextRenderer && nextRenderer.tagName === 'YTD-REEL-VIDEO-RENDERER') {
              console.log('[YT Shorts Auto] 執行物理滾動導航...');
              nextRenderer.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
          }
          // 軌道三：點「下一部」按鈕
          later(() => {
            const selectors = [
              'ytd-reel-video-renderer[is-active] #navigation-button-down button',
              '#navigation-button-down button',
              'button[aria-label="下一部影片"]',
              'button[aria-label="Next video"]',
              '#navigation-button-down tp-yt-paper-button',
              '[id*="navigation-button-down"] button',
            ];
            for (const selector of selectors) {
              const btn = doc.querySelector(selector);
              if (btn) { console.log(`[YT Shorts Auto] 成功偵測到按鈕選取器: ${selector}，執行點擊`); btn.click(); break; }
            }
          }, 50);
          // 補刀：1.2 秒後還在同一部就再試一次
          later(() => {
            const currentSrc = video.currentSrc || video.src;
            if (currentSrc === lastTriggeredSrc && !video.paused) {
              console.warn('[YT Shorts Auto] 雙重驗證卡死！啟動強制補刀...');
              if (nextRenderer) nextRenderer.scrollIntoView({ behavior: 'auto', block: 'start' });
              doc.dispatchEvent(new KE('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true }));
            }
            isTransitioning = false;
          }, 1200);
        }

        // 第三重：事件監聽
        const onTime = (e) => {
          if (!isShortsPage()) return;
          const video = e.target;
          if (!video || video.tagName !== 'VIDEO') return;
          const currentSrc = video.currentSrc || video.src;
          if (currentSrc !== lastTriggeredSrc && video.currentTime < 1) isTransitioning = false;
          const remain = Math.max(0.05, Number(ctx.cfg().remain) || 0.3);
          if (video.duration && video.duration - video.currentTime <= remain && currentSrc !== lastTriggeredSrc && !isTransitioning) {
            console.log('[YT Shorts Auto] 進度達到倒數觸發點。');
            triggerNextVideo(video);
          }
        };
        const onEnded = (e) => {
          if (!isShortsPage()) return;
          const video = e.target;
          if (!video || video.tagName !== 'VIDEO') return;
          const currentSrc = video.currentSrc || video.src;
          if (currentSrc !== lastTriggeredSrc && !isTransitioning) {
            console.log('[YT Shorts Auto] 偵測到 ended 事件，強制保底換片！');
            triggerNextVideo(video);
          }
        };
        const onPause = (e) => {
          if (!isShortsPage()) return;
          const video = e.target;
          if (!video || video.tagName !== 'VIDEO') return;
          if (isRealBackground() && !isTransitioning && video.currentTime < video.duration - 0.6) {
            console.log('[YT Shorts Auto] 背景被動暫停，自動回復播放...');
            video.play().catch(() => {});
          }
        };
        doc.addEventListener('timeupdate', onTime, true);
        doc.addEventListener('ended', onEnded, true);
        doc.addEventListener('pause', onPause, true);
        console.log('[YT Shorts Auto] 全站監聽版已全面載入（Shorts 安全鎖已啟用）。');

        return () => {
          PAGE.removeEventListener('visibilitychange', stopIfShorts, true);
          doc.removeEventListener('visibilitychange', stopIfShorts, true);
          PAGE.removeEventListener('blur', stopIfShorts, true);
          doc.removeEventListener('timeupdate', onTime, true);
          doc.removeEventListener('ended', onEnded, true);
          doc.removeEventListener('pause', onPause, true);
          timers.forEach(clearTimeout);
          try { delete doc.visibilityState; delete doc.hidden; } catch (_) { /* 還原失敗不影響播放 */ }
        };
      },
    },

    /* ---------------- Threads 音量記憶 ---------------- */
    {
      id: 'threadsVolume',
      group: 'video',
      name: 'Threads 音量記憶',
      site: 'Threads',
      desc: '把音量記住並套用到之後每一支影片（Threads 原本每支都是 100%），Threads 自己的音量條也會同步。在 Threads 音量條或這裡調都可以。',
      defaults: { bar: 'hide' },
      fields: [
        { key: 'volume', label: '目前記住的音量', type: 'memory', memKey: 'mem.threadsVolume', def: 0.1 },
        { key: 'bar', label: '影片上的音量條', type: 'select', options: [['hide', '不顯示'], ['show', '顯示']] },
      ],
      frames: 'all',
      phase: 'start',
      match: () => /(^|\.)threads\.(com|net)$/.test(HOST),
      start(ctx) {
        const keeper = startVolumeKeeper('mem.threadsVolume', 0.1, syncThreadsPlayer);
        let overlay = null;
        // 音量條要不要出現由設定決定，切換時立即生效
        const sync = () => {
          if (document.readyState === 'loading') return;
          const want = ctx.cfg().bar === 'show';
          if (want && !overlay) {
            overlay = createVolumeOverlay(keeper, {
              label: 'Threads 影片音量',
              title: 'Threads 影片音量（滾輪可微調），之後的影片都會用這個音量',
              mutedTitle: '影片目前靜音；取消靜音後就會用這個音量',
            });
          } else if (!want && overlay) {
            overlay.destroy();
            overlay = null;
          }
        };
        document.addEventListener('DOMContentLoaded', sync, { once: true });
        sync();
        return {
          onConfig: sync,
          stop() {
            document.removeEventListener('DOMContentLoaded', sync);
            if (overlay) overlay.destroy();
            keeper.stop();
          },
        };
      },
    },

    /* ---------------- X 音量記憶 ---------------- */
    {
      id: 'xVolume',
      group: 'video',
      name: 'X 音量記憶',
      site: 'X',
      desc: '第一次是 1%，之後記住你在 X 播放器上調的音量，下一支影片沿用。',
      fields: [{ key: 'volume', label: '目前記住的音量', type: 'memory', memKey: 'mem.xVolume', def: 0.01 }],
      frames: 'all',
      phase: 'start',
      match: () => HOST === 'x.com' || HOST === 'twitter.com',
      start() {
        const keeper = startVolumeKeeper('mem.xVolume', 0.01);
        return () => keeper.stop();
      },
    },

    /* ---------------- X 直連影片音量 ---------------- */
    {
      id: 'twimgVolume',
      group: 'video',
      name: 'X 直連影片音量',
      site: 'video.twimg.com',
      desc: '直接打開 video.twimg.com 的影片網址時，把音量設成指定大小；只設一次，不會蓋掉你之後調的音量。',
      defaults: { volume: 5 },
      fields: [{ key: 'volume', label: '音量', type: 'percent' }],
      menu: (c) => `X 直連影片音量（${c.volume}%）`,
      frames: 'all',
      phase: 'start',
      match: () => HOST === 'video.twimg.com',
      start(ctx) {
        const seen = new WeakSet();
        const apply = (v) => {
          if (!v || v.tagName !== 'VIDEO' || seen.has(v)) return;
          seen.add(v);
          v.volume = clamp01(Number(ctx.cfg().volume) / 100);
        };
        const scan = () => { const list = document.getElementsByTagName('video'); for (let i = 0; i < list.length; i++) apply(list[i]); };
        const onMedia = (e) => apply(e.target);
        document.addEventListener('loadstart', onMedia, true);
        document.addEventListener('loadedmetadata', onMedia, true);
        const mo = new MutationObserver(scan);
        mo.observe(document, { childList: true, subtree: true });
        scan();
        return () => {
          mo.disconnect();
          document.removeEventListener('loadstart', onMedia, true);
          document.removeEventListener('loadedmetadata', onMedia, true);
        };
      },
    },

    /* ---------------- X 影片下載按鈕 ---------------- */
    {
      id: 'xDownload',
      group: 'download',
      name: 'X 影片下載按鈕',
      site: 'X',
      desc: '在有影片或圖片的推文旁加上下載鈕，點了會用 cobalt.tools 開啟下載頁。',
      frames: 'all',
      phase: 'idle',
      match: () => HOST === 'x.com' || HOST === 'twitter.com',
      start() {
        const downloadSvgPath = 'M12 16.5l4.5-4.5h-3v-7h-3v7h-3l4.5 4.5zm8.5 2.5v-2h-17v2h17z';
        const getTweetUrl = (article) => {
          const t = article.querySelector('time');
          const a = t && t.closest('a');
          return (a && a.href) || null;
        };
        /** 透過 SVG 路徑找「分享」按鈕 */
        const findShareButton = (article) => {
          for (const svg of article.querySelectorAll('svg')) {
            const p = svg.querySelector('path');
            const d = p && p.getAttribute('d');
            if (d && (d.startsWith('M12 2.59') || d.includes('2.59l5.7'))) return svg.closest('div[role="button"]');
          }
          return null;
        };
        function makeButton(targetBtn, targetWrapper, tweetUrl) {
          const dlContainer = document.createElement('div');
          dlContainer.className = 'mao-boo-dl-container ' + targetWrapper.className;
          const dlWrapper = document.createElement('div');
          dlWrapper.className = targetBtn.className;
          dlWrapper.style.cssText = 'display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .2s;color:rgb(113,118,123);';
          const inner = document.createElement('div');
          inner.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;';
          const svg = document.createElementNS(SVG_NS, 'svg');
          const svgClass = targetBtn.querySelector('svg') && targetBtn.querySelector('svg').getAttribute('class');
          if (svgClass) svg.setAttribute('class', svgClass);
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('aria-hidden', 'true');
          svg.style.cssText = 'width:1.25em;height:1.25em;fill:currentColor;';
          const path = document.createElementNS(SVG_NS, 'path');
          path.setAttribute('d', downloadSvgPath);
          svg.appendChild(path);
          inner.appendChild(svg);
          dlWrapper.appendChild(inner);
          dlWrapper.addEventListener('mouseover', () => { dlWrapper.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'; dlWrapper.style.color = 'rgb(29, 155, 240)'; });
          dlWrapper.addEventListener('mouseout', () => { dlWrapper.style.backgroundColor = 'transparent'; dlWrapper.style.color = 'rgb(113, 118, 123)'; });
          dlWrapper.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            PAGE.open(`https://cobalt.tools/?u=${encodeURIComponent(tweetUrl)}`, '_blank');
          });
          dlContainer.appendChild(dlWrapper);
          return dlContainer;
        }
        function injectButtons() {
          const isStatusPage = location.pathname.includes('/status/');
          for (const article of document.querySelectorAll('article')) {
            // 用「區塊內有沒有按鈕」判斷，X 重建畫面時就會自動補回
            if (article.querySelector('.mao-boo-dl-container')) continue;
            if (!article.querySelector('video, [data-testid="videoComponent"], [data-testid="tweetPhoto"]')) continue;
            const tweetUrl = getTweetUrl(article);
            if (!tweetUrl) continue;
            const bookmark = () => article.querySelector('[data-testid="bookmark"], [data-testid="removeBookmark"]');
            // 詳細頁優先放在「分享」旁，其他頁面優先放在「書籤」旁
            const targetBtn = isStatusPage ? (findShareButton(article) || bookmark()) : (bookmark() || findShareButton(article));
            if (!targetBtn) continue;
            const targetWrapper = targetBtn.parentElement;
            if (!targetWrapper || !targetWrapper.parentNode) continue;
            targetWrapper.parentNode.insertBefore(makeButton(targetBtn, targetWrapper, tweetUrl), targetWrapper);
          }
        }
        // 頁面變動很頻繁，合併成最多每 0.2 秒處理一次
        let timer = 0;
        let lastRun = 0;
        let lastUrl = location.href;
        const extra = new Set();
        const run = () => { timer = 0; lastRun = Date.now(); try { injectButtons(); } catch (e) { console.error('[MAOBOO] X 下載按鈕', e); } };
        const schedule = () => { if (!timer) timer = setTimeout(run, Math.max(0, 200 - (Date.now() - lastRun))); };
        const later = (ms) => { const t = setTimeout(() => { extra.delete(t); schedule(); }, ms); extra.add(t); };
        const mo = new MutationObserver(() => {
          if (location.href !== lastUrl) { lastUrl = location.href; later(500); } // 切換頁面後再補抓一次
          schedule();
        });
        mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        schedule();
        later(1500);
        return () => {
          mo.disconnect();
          clearTimeout(timer);
          extra.forEach(clearTimeout);
          document.querySelectorAll('.mao-boo-dl-container').forEach((el) => el.remove());
        };
      },
    },

    /* ---------------- LINE 貼圖下載 ---------------- */
    {
      id: 'lineSticker',
      group: 'download',
      name: 'LINE 貼圖下載',
      site: 'LINE Store',
      desc: '在貼圖、表情貼商品頁加上下載按鈕：靜態圖打包成 ZIP；動態圖直接在頁面上轉成去背 GIF 再打包。',
      frames: 'top',
      phase: 'dom',
      match: () => HOST === 'store.line.me',
      start() {
        const sanitize = (s) => String(s || '').replace(/[\\/:*?"<>|\r\n]/g, '').trim();
        const isProduct = () => /^\/(stickershop|emojishop)\/product\//.test(location.pathname);
        const getTitle = () => {
          const el = document.querySelector('[data-test="sticker-name-title"], [data-test="emoji-name-title"], h1, p.mdCMN38Item01Ttl');
          return sanitize(el && el.textContent) || (location.pathname.startsWith('/emojishop/') ? 'LINE_Emoji' : 'LINE_Stickers');
        };
        /** 只抓清單中的貼圖（排除商品主圖），依 id 去重 */
        const getStickers = () => {
          const seen = new Set();
          const list = [];
          document.querySelectorAll('li.FnStickerPreviewItem[data-preview], li[data-preview], div[data-test="sticker-item"][data-preview]').forEach((el) => {
            try {
              const d = JSON.parse(el.getAttribute('data-preview'));
              if (d && d.id && !seen.has(d.id) && (d.staticUrl || d.animationUrl || d.fallbackStaticUrl)) { seen.add(d.id); list.push(d); }
            } catch (_) { /* 忽略壞掉的 data-preview */ }
          });
          return list;
        };

        let host = null;
        let v = null;
        let job = null;
        let lastZip = null; // { url, name }

        function build() {
          host = document.createElement('maoboo-line');
          ourHosts.add(host);
          const root = host.attachShadow({ mode: 'open' });
          adoptCss(root, LINE_CSS);
          const btnAnim = h('button', { type: 'button', class: 'ls-btn', onclick: () => runJob('animated') },
            '下載動態貼圖', h('small', { text: '轉成去背 GIF，打包 ZIP' }));
          const btnStatic = h('button', { type: 'button', class: 'ls-btn is-alt', onclick: () => runJob('static') },
            '下載靜態貼圖', h('small', { text: 'PNG 原圖，打包 ZIP' }));
          const title = h('div', { class: 'ls-title' });
          const count = h('div', { class: 'ls-count' });
          const barDl = h('i', { class: 'ls-dl' });
          const barCv = h('i', { class: 'ls-cv' });
          const meta = h('span', {});
          const actions = h('div', { class: 'ls-actions' });
          const err = h('p', { class: 'ls-err', hidden: true });
          const card = h('div', { class: 'ls-card', hidden: true, role: 'status', 'aria-live': 'polite' },
            h('div', { class: 'ls-top' }, title, count),
            h('div', { class: 'ls-bar' }, barDl, barCv),
            h('div', { class: 'ls-meta' }, meta, actions),
            err);
          root.append(h('div', { class: 'ls' }, h('div', { class: 'ls-btns' }, btnAnim, btnStatic), card));
          v = { btnAnim, btnStatic, card, title, count, barDl, barCv, meta, actions, err };
        }
        function inject() {
          if (!isProduct()) { if (host && host.isConnected) host.remove(); return; }
          if (host && host.isConnected) return;
          const target = document.querySelector('.mdCMN38Item01, .mdCMN08Odr');
          if (!target) return;
          if (!host) build();
          target.appendChild(host);
        }
        function render(s) {
          v.card.hidden = false;
          v.card.className = 'ls-card' + (s.state ? ' is-' + s.state : '');
          v.title.textContent = s.title || '';
          v.count.textContent = s.count || '';
          v.barDl.style.width = (s.total ? (s.dl / s.total) * 100 : 0) + '%';
          v.barCv.style.width = (s.total ? (s.cv / s.total) * 100 : 0) + '%';
          v.meta.textContent = s.meta || '';
          v.actions.replaceChildren(...(s.actions || []).map((a) => h('button', { type: 'button', class: a.primary ? 'is-primary' : null, text: a.label, onclick: a.run })));
          v.err.hidden = !s.error;
          v.err.textContent = s.error || '';
        }
        const setBusy = (busy) => { v.btnAnim.disabled = busy; v.btnStatic.disabled = busy; };
        const secs = (t0) => ((performance.now() - t0) / 1000).toFixed(1);

        async function runJob(kind, prev) {
          if (job) return;
          const title = prev ? prev.title : getTitle();
          let list = prev ? prev.list : null;
          if (!list) {
            const all = getStickers();
            if (!all.length) { render({ title, meta: '找不到貼圖資料，請等頁面完全載入後再按一次。', state: 'error' }); return; }
            list = kind === 'animated' ? all.filter((s) => s.animationUrl) : all;
            if (!list.length) { render({ title, meta: '這組貼圖沒有動態圖片，可以改按「下載靜態貼圖」。', state: 'error' }); return; }
          }
          const total = list.length;
          const results = prev ? prev.results : new Array(total);
          const todo = [];
          for (let i = 0; i < total; i++) if (!(results[i] instanceof Uint8Array)) todo.push(i);
          let dl = total - todo.length;
          let cv = dl;
          const t0 = performance.now();
          const me = { cancelled: false, pool: null };
          job = me;
          setBusy(true);
          const isAnim = kind === 'animated';
          const tick = () => {
            if (job !== me) return;
            render({
              title, total, dl, cv,
              count: `${cv} / ${total}`,
              meta: isAnim ? `已下載 ${dl}，已轉檔 ${cv}，用時 ${secs(t0)} 秒` : `已下載 ${cv}，用時 ${secs(t0)} 秒`,
              actions: [{ label: '取消', run: () => cancel() }],
            });
          };
          const clock = setInterval(tick, 500);
          const finishJob = () => { clearInterval(clock); if (me.pool) me.pool.close(); if (job === me) job = null; setBusy(false); };
          function cancel() {
            if (me.cancelled) return;
            me.cancelled = true;
            finishJob();
            render({ title, total, dl, cv, count: `${cv} / ${total}`, meta: '已取消。', state: 'error' });
          }
          tick();

          try {
            if (isAnim) {
              me.pool = await createGifPool();
              console.info(`[LINE 貼圖下載] 轉檔方式：${me.pool.mode === 'worker' ? me.pool.size + ' 個背景執行緒' : '主執行緒'}`);
            }
            const limit = limiter(6);
            await Promise.all(todo.map((i) => limit(async () => {
              if (me.cancelled) return null;
              const st = list[i];
              if (isAnim) return gmFetch(st.animationUrl);
              // 動態貼圖若沒有靜態圖，就下載 APNG 並改成無限循環
              const useApng = !st.staticUrl && !!st.animationUrl;
              const buf = await gmFetch(st.staticUrl || st.fallbackStaticUrl || st.animationUrl);
              return useApng ? makeApngInfinite(buf) : buf;
            }).then(async (buf) => {
              if (me.cancelled || !buf) return;
              dl++;
              if (isAnim) {
                tick();
                const gif = await me.pool.convert(buf);
                if (me.cancelled) return;
                results[i] = gif;
              } else results[i] = new Uint8Array(buf);
              cv++;
              tick();
            }).catch((e) => {
              if (me.cancelled) return;
              results[i] = e instanceof Error ? e : new Error(String(e));
              console.error(`[LINE 貼圖下載] 第 ${pad3(i + 1)} 張失敗：`, e);
              tick();
            })));
          } catch (e) {
            if (!me.cancelled) {
              finishJob();
              render({ title, meta: '下載失敗：' + ((e && e.message) || e), state: 'error' });
            }
            return;
          }
          if (me.cancelled) return;
          finishJob();

          const ext = isAnim ? 'gif' : 'png';
          const files = [];
          const failed = [];
          for (let i = 0; i < total; i++) {
            if (results[i] instanceof Uint8Array) files.push({ name: `${title}_${pad3(i + 1)}.${ext}`, data: results[i] });
            else failed.push(i);
          }
          const failText = failed.length
            ? `第 ${failed.slice(0, 12).map((i) => pad3(i + 1)).join('、')}${failed.length > 12 ? ' 等' : ''} 張失敗（${(results[failed[0]] && results[failed[0]].message) || '未知錯誤'}）`
            : '';
          const retry = failed.length ? [{ label: `重試失敗的 ${failed.length} 張`, run: () => runJob(kind, { title, list, results }) }] : [];
          if (!files.length) {
            render({ title, total, dl, cv, count: `0 / ${total}`, meta: '全部失敗，請檢查網路後再試。', error: failText, state: 'error', actions: retry });
            return;
          }
          if (lastZip) URL.revokeObjectURL(lastZip.url);
          const zipName = isAnim ? `${title}_動態(GIF).zip` : `${title}_靜態.zip`;
          lastZip = { url: URL.createObjectURL(makeZip(files)), name: zipName };
          saveBlob(lastZip.url, lastZip.name);
          const zipRef = lastZip;
          render({
            title, total, dl: total, cv: files.length,
            count: `${files.length} / ${total}`,
            meta: `完成，用時 ${secs(t0)} 秒`,
            error: failText,
            state: failed.length ? 'partial' : 'done',
            actions: [...retry, { label: '再次下載 ZIP', primary: !failed.length, run: () => saveBlob(zipRef.url, zipRef.name) }],
          });
        }

        let t = 0;
        const mo = new MutationObserver(() => { if (!t) t = setTimeout(() => { t = 0; inject(); }, 250); });
        mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        inject();
        return () => {
          mo.disconnect();
          clearTimeout(t);
          if (job) { job.cancelled = true; if (job.pool) job.pool.close(); job = null; }
          if (host) { host.remove(); ourHosts.delete(host); }
          if (lastZip) URL.revokeObjectURL(lastZip.url);
        };
      },
    },

    /* ---------------- 網址追蹤參數清除 ---------------- */
    {
      id: 'urlClean',
      group: 'web',
      name: '網址追蹤參數清除',
      site: '所有網站',
      desc: '移除網址列和頁面連結裡的 utm_、fbclid、gclid 等追蹤參數，也會清掉 YouTube／Spotify 的 si、X 的 s 和 t、Threads 的 xmt。',
      frames: 'all',
      phase: 'start',
      match: () => /^https?:$/.test(location.protocol),
      start() {
        // 只收錄跨站通用的廣告／行銷追蹤參數，不含電商平台的商品或聯盟行銷參數
        const EXACT_MATCH = new Set([
          'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid', '_ga', '_gl',
          'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_ref', 'fb_source',
          'msclkid', 'ttclid', 'twclid', 'yclid', 'sc_cid', 'epik',
          'igshid', 'igsh',
          'mc_cid', 'mc_eid', 'hsctatracking', '_hsenc', '_hsmi',
          'mkt_tok', 'vero_id', 'vero_conv', 'oly_enc_id', 'oly_anon_id',
          'sr_share', 'ncid', 'mibextid',
        ]);
        const PREFIX_MATCH = ['utm_', 'pk_', 'piwik_'];
        // 只在各自網站清除的分享追蹤碼（YouTube 的 t 是影片時間，不會動到）
        const SITE_RULES = [
          { re: /(^|\.)(youtube\.com|youtu\.be|spotify\.com)$/, keys: ['si'] },
          { re: /(^|\.)(x\.com|twitter\.com)$/, keys: ['s', 't'] },
          { re: /(^|\.)threads\.(com|net)$/, keys: ['xmt'] },
        ];
        let active = true;
        const isTrackerKey = (key, host) => {
          const lower = key.toLowerCase();
          if (EXACT_MATCH.has(lower) || PREFIX_MATCH.some((p) => lower.startsWith(p))) return true;
          return SITE_RULES.some((r) => r.keys.includes(lower) && r.re.test(host));
        };
        const stripTrackers = (url) => {
          let changed = false;
          const host = url.hostname.toLowerCase();
          for (const key of Array.from(url.searchParams.keys())) {
            if (isTrackerKey(key, host)) { url.searchParams.delete(key); changed = true; }
          }
          return changed;
        };

        // 網址列
        let isRewriting = false;
        const cleanCurrentURL = () => {
          if (!active || isRewriting) return;
          isRewriting = true;
          try {
            const url = new URL(PAGE.location.href);
            if (stripTrackers(url)) PAGE.history.replaceState(PAGE.history.state, document.title, url.toString());
          } catch (e) { console.error('[URL Cleaner] 網址處理錯誤:', e); }
          finally { isRewriting = false; }
        };
        const restores = [];
        const patchHistoryMethod = (name) => {
          const H = PAGE.history;
          const own = Object.prototype.hasOwnProperty.call(H, name);
          const original = H[name];
          const wrapped = toPage(function (...args) {
            const result = original.apply(this, args);
            cleanCurrentURL();
            return result;
          });
          try { H[name] = wrapped; } catch (_) { return; }
          restores.push(() => { if (H[name] === wrapped) { if (own) H[name] = original; else delete H[name]; } });
        };

        // 頁面連結
        const cleanLinksIn = (root) => {
          for (const a of root.querySelectorAll('a[href*="?"]')) {
            try {
              const url = new URL(a.href);
              if (!/^https?:$/i.test(url.protocol)) continue;
              if (stripTrackers(url)) a.href = url.toString();
            } catch (_) { /* 忽略無法解析的連結 */ }
          }
        };
        let linkCleanTimer = null;
        const scheduleLinkClean = () => {
          if (linkCleanTimer) return;
          linkCleanTimer = setTimeout(() => { linkCleanTimer = null; if (active) cleanLinksIn(document); }, 300);
        };
        let observer = null;
        const initLinkWatcher = () => {
          if (!active) return;
          cleanLinksIn(document);
          observer = new MutationObserver(scheduleLinkClean);
          observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
        };

        cleanCurrentURL();
        patchHistoryMethod('pushState');
        patchHistoryMethod('replaceState');
        PAGE.addEventListener('popstate', cleanCurrentURL);
        PAGE.addEventListener('hashchange', cleanCurrentURL);
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLinkWatcher, { once: true });
        else initLinkWatcher();

        return () => {
          active = false;
          restores.forEach((fn) => fn());
          PAGE.removeEventListener('popstate', cleanCurrentURL);
          PAGE.removeEventListener('hashchange', cleanCurrentURL);
          document.removeEventListener('DOMContentLoaded', initLinkWatcher);
          if (observer) observer.disconnect();
          clearTimeout(linkCleanTimer);
        };
      },
    },

    /* ---------------- 手機版自動轉電腦版 ---------------- */
    {
      id: 'm2www',
      group: 'web',
      name: '手機版自動轉電腦版',
      site: 'm. 網址',
      desc: '打開 m. 開頭的手機版網頁時自動換成 www. 電腦版；zh.m.wikipedia.org 這類網址也會轉。',
      defaults: { exclude: ['m.me'] },
      fields: [{ key: 'exclude', label: '不轉換的網域', type: 'list', placeholder: '例如 m.me, m.example.com' }],
      frames: 'top',
      phase: 'start',
      match: () => /^https?:$/.test(location.protocol) && (/^m\./.test(HOST) || WIKI_RE.test(HOST)),
      start(ctx) {
        const url = new URL(location.href);
        const host = url.hostname.toLowerCase();
        const exclude = (ctx.cfg().exclude || []).map((s) => String(s).toLowerCase());
        if (exclude.includes(host)) return;
        let next = null;
        if (/^m\./.test(host) && host.split('.').length > 2) next = host.replace(/^m\./, 'www.'); // 避免 m.com 這種被誤判
        else if (WIKI_RE.test(host)) next = host.replace('.m.', '.');
        if (!next) return;
        // 防止無限迴圈：網站又把你導回手機版時就不再跳
        const storageKey = '_m2www_' + host;
        try {
          if (sessionStorage.getItem(storageKey)) { sessionStorage.removeItem(storageKey); return; }
          sessionStorage.setItem(storageKey, '1');
        } catch (_) { /* 無法使用 sessionStorage 時照常轉換 */ }
        url.hostname = next;
        PAGE.location.replace(url.href); // 用 replace 不在歷史紀錄留下手機版網址
      },
    },
  ];

  /* ======================================================================
   * 模組管理
   * ==================================================================== */

  const running = new Map();
  const pending = new Set();
  const isOn = (m) => store.get('on.' + m.id, true) !== false;
  const getCfg = (m) => Object.assign({}, m.defaults || {}, store.get('cfg.' + m.id, {}) || {});
  const frameOk = (m) => m.frames === 'all' || IS_TOP;
  const matchesHere = (m) => { try { return frameOk(m) && !!m.match(); } catch (_) { return false; } };
  const shouldRun = (m) => isOn(m) && matchesHere(m);

  function whenPhase(phase, fn) {
    if (phase === 'start') { fn(); return; }
    const go = () => (phase === 'idle' ? setTimeout(fn, 0) : fn());
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
    else go();
  }
  function startModule(m) {
    if (running.has(m.id) || pending.has(m.id)) return;
    pending.add(m.id);
    whenPhase(m.phase || 'start', () => {
      pending.delete(m.id);
      if (running.has(m.id) || !shouldRun(m)) return;
      try {
        // start() 可以回傳 stop 函式，或 { stop, onConfig }（設定改變時即時套用）
        const inst = m.start({ cfg: () => getCfg(m) });
        if (typeof inst === 'function') running.set(m.id, { stop: inst });
        else if (inst && typeof inst.stop === 'function') running.set(m.id, inst);
        else running.set(m.id, { stop() {} });
      } catch (e) { console.error(`[MAOBOO] 「${m.name}」啟動失敗`, e); }
    });
  }
  function stopModule(m) {
    pending.delete(m.id);
    const inst = running.get(m.id);
    if (!inst) return;
    running.delete(m.id);
    try { inst.stop(); } catch (e) { console.error(`[MAOBOO] 「${m.name}」停止失敗`, e); }
  }
  const syncModule = (m) => (shouldRun(m) ? startModule(m) : stopModule(m));
  function notifyConfig(m) {
    const inst = running.get(m.id);
    if (inst && typeof inst.onConfig === 'function') {
      try { inst.onConfig(getCfg(m)); } catch (e) { console.error(`[MAOBOO] 「${m.name}」套用設定失敗`, e); }
    }
  }

  /* ======================================================================
   * 油猴選單
   * ==================================================================== */

  const MENU_IN_PLACE = (() => {
    try { return GM_info.scriptHandler === 'Tampermonkey' && parseInt(GM_info.version, 10) >= 5; } catch (_) { return false; }
  })();
  const menuIds = {};

  function renderMenu() {
    if (!IS_TOP || typeof GM_registerMenuCommand !== 'function') return;
    const items = [{ key: '_panel', label: '開啟設定面板', run: () => openPanel(), close: true }];
    for (const m of MODULES) {
      items.push({
        key: m.id,
        label: (isOn(m) ? '【開】' : '【關】') + (m.menu ? m.menu(getCfg(m)) : m.name),
        title: m.desc,
        run: () => toggleFromMenu(m),
        close: false,
      });
    }
    items.push({ key: '_update', label: `檢查更新（目前 ${VERSION}）`, run: () => checkUpdate(true), close: true });
    if (!MENU_IN_PLACE) {
      for (const k of Object.keys(menuIds)) {
        try { GM_unregisterMenuCommand(menuIds[k]); } catch (_) { /* 已移除 */ }
        delete menuIds[k];
      }
    }
    for (const it of items) {
      const opts = { autoClose: it.close };
      if (it.title) opts.title = it.title;
      if (MENU_IN_PLACE && menuIds[it.key] !== undefined) opts.id = menuIds[it.key];
      try { menuIds[it.key] = GM_registerMenuCommand(it.label, it.run, opts); } catch (_) {
        try { menuIds[it.key] = GM_registerMenuCommand(it.label, it.run); } catch (__) { /* 管理器不支援選單 */ }
      }
    }
  }

  function toggleFromMenu(m) {
    const next = !isOn(m);
    store.set('on.' + m.id, next);
    syncModule(m);
    renderMenu();
    if (panel) panel.refresh();
    if (next) toast(`已開啟「${m.name}」` + (matchesHere(m) ? '，本頁已套用' : `，會在 ${m.site} 上作用`));
    else toast(`已關閉「${m.name}」`);
  }

  /* ======================================================================
   * 設定面板
   * ==================================================================== */

  let panel = null;
  const GROUPS = [
    { id: 'video', name: '影片與音量' },
    { id: 'download', name: '下載' },
    { id: 'web', name: '網址' },
  ];

  function raccoonMark() {
    // 小浣熊像素標誌
    const rows = [
      '.DD.....DD.',
      '.DGGGGGGGD.',
      '.GGGGGGGGG.',
      'GLLGGGGGLLG',
      'DDDDLLLDDDD',
      'DEDDLLLDDED',
      'GDDLLLLLDDG',
      '.GLLLNLLLG.',
      '..GLLLLLG..',
    ];
    const colors = { D: '#14212E', G: '#8D98A5', L: '#E8ECF0', E: '#FFFFFF', N: '#14212E' };
    const svg = h('svg:svg', { class: 'mb-mark', viewBox: '0 0 11 9', 'shape-rendering': 'crispEdges', 'aria-hidden': 'true' });
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const fill = colors[row[x]];
        if (fill) svg.append(h('svg:rect', { x, y, width: 1, height: 1, fill }));
      }
    });
    return svg;
  }

  function saveCfg(m, key, value) {
    const cur = Object.assign({}, store.get('cfg.' + m.id, {}) || {});
    cur[key] = value;
    store.set('cfg.' + m.id, cur);
    notifyConfig(m);
    renderMenu();
  }

  function buildField(m, f) {
    const cfgVal = () => getCfg(m)[f.key];
    if (f.type === 'number') {
      const input = h('input', { type: 'number', min: f.min, max: f.max, step: f.step || 1, inputmode: 'decimal' });
      input.value = cfgVal();
      input.addEventListener('change', () => {
        let val = Number(input.value);
        if (!Number.isFinite(val)) val = m.defaults[f.key];
        val = Math.min(f.max, Math.max(f.min, val));
        val = (f.step || 1) < 1 ? Math.round(val * 10) / 10 : Math.round(val);
        input.value = val;
        saveCfg(m, f.key, val);
      });
      return {
        el: h('label', { class: 'mb-field' }, h('span', { text: f.label }), input, f.unit ? h('span', { text: f.unit }) : null),
        refresh: () => { if (!input.matches(':focus')) input.value = cfgVal(); },
      };
    }
    if (f.type === 'select') {
      const sel = h('select', {}, f.options.map(([val, label]) => h('option', { value: val, text: label })));
      sel.value = cfgVal();
      sel.addEventListener('change', () => saveCfg(m, f.key, sel.value));
      return { el: h('label', { class: 'mb-field' }, h('span', { text: f.label }), sel), refresh: () => { sel.value = cfgVal(); } };
    }
    if (f.type === 'list') {
      const input = h('input', { type: 'text', spellcheck: 'false', placeholder: f.placeholder || '' });
      const show = () => { input.value = (cfgVal() || []).join(', '); };
      show();
      input.addEventListener('change', () => {
        const list = input.value.split(/[\s,，、;；]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
        saveCfg(m, f.key, Array.from(new Set(list)));
        show();
      });
      return {
        el: h('label', { class: 'mb-field mb-field-wide' }, h('span', { text: f.label }), input),
        refresh: () => { if (!input.matches(':focus')) show(); },
      };
    }
    // 音量：'percent' 存在設定裡，'memory' 是記住的音量
    const read = () => (f.type === 'memory' ? Math.round(clamp01(store.get(f.memKey, f.def)) * 100) : Number(cfgVal()) || 0);
    const range = h('input', { type: 'range', min: 0, max: 100, step: 1, 'aria-label': `${m.name}：${f.label}` });
    const out = h('output', {});
    let holding = false;
    const show = (val) => { range.value = val; out.textContent = val + '%'; };
    const write = (val, now) => {
      if (f.type === 'memory') {
        const k = keepers.get(f.memKey);
        if (k) k.set(val / 100, { now }); else store.set(f.memKey, val / 100);
      } else if (now) saveCfg(m, f.key, val);
    };
    show(read());
    range.addEventListener('pointerdown', () => { holding = true; });
    range.addEventListener('pointerup', () => { holding = false; });
    range.addEventListener('input', () => { const val = Number(range.value); out.textContent = val + '%'; write(val, false); });
    range.addEventListener('change', () => write(Number(range.value), true));
    return {
      el: h('label', { class: 'mb-field' }, h('span', { text: f.label }), range, out),
      refresh: () => { if (!holding) show(read()); },
    };
  }

  function buildRow(m) {
    const sw = h('input', { type: 'checkbox', role: 'switch', 'aria-label': `${m.name}：開關` });
    sw.checked = isOn(m);
    const fields = (m.fields || []).map((f) => buildField(m, f));
    const el = h('article', { class: 'mb-row' + (sw.checked ? '' : ' is-off') },
      h('div', { class: 'mb-row-top' },
        h('div', { class: 'mb-info' },
          h('div', { class: 'mb-name' },
            h('span', { text: m.name }),
            h('span', { class: 'mb-site', text: m.site }),
            matchesHere(m) ? h('span', { class: 'mb-here', text: '本頁' }) : null),
          h('p', { class: 'mb-desc', text: m.desc })),
        h('label', { class: 'mb-switch' }, sw, h('span', { class: 'mb-knob', 'aria-hidden': 'true' }))),
      fields.length ? h('div', { class: 'mb-fields' }, fields.map((f) => f.el)) : null,
      m.hint ? h('p', { class: 'mb-hint', text: m.hint }) : null);
    sw.addEventListener('change', () => {
      store.set('on.' + m.id, sw.checked);
      syncModule(m);
      renderMenu();
      el.classList.toggle('is-off', !sw.checked);
    });
    return {
      el,
      refresh() {
        sw.checked = isOn(m);
        el.classList.toggle('is-off', !sw.checked);
        fields.forEach((f) => f.refresh());
      },
    };
  }

  function openPanel() {
    if (!IS_TOP) return;
    if (panel) { panel.refresh(); return; }
    const r = ui();
    if (!r) return;
    const rows = [];
    const body = h('div', { class: 'mb-body' });
    for (const g of GROUPS) {
      const mods = MODULES.filter((m) => m.group === g.id);
      if (!mods.length) continue;
      body.append(h('h3', { class: 'mb-group', text: g.name }));
      for (const m of mods) { const row = buildRow(m); rows.push(row); body.append(row.el); }
    }
    const close = () => { backdrop.remove(); panel = null; };
    const closeBtn = h('button', { type: 'button', class: 'mb-close', 'aria-label': '關閉設定', text: '×', onclick: () => close() });
    const backdrop = h('div', { class: 'mb-backdrop', onmousedown: (e) => { if (e.target === backdrop) close(); } },
      h('section', { class: 'mb-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'MAO BOO 油猴整合包設定', tabindex: '-1' },
        h('div', { class: 'mb-tail', 'aria-hidden': 'true' }),
        h('header', { class: 'mb-head' },
          raccoonMark(),
          h('div', { class: 'mb-head-text' },
            h('h2', { class: 'mb-title', text: 'MAO BOO 油猴整合包' }),
            h('p', { class: 'mb-sub', text: '設定自動儲存，所有分頁同步' })),
          h('span', { class: 'mb-ver', text: 'v' + VERSION }),
          closeBtn),
        body,
        h('footer', { class: 'mb-foot' },
          h('button', { type: 'button', class: 'mb-btn', text: '檢查更新', onclick: () => checkUpdate(true) }),
          h('a', { class: 'mb-link', href: REPO_URL, target: '_blank', rel: 'noopener', text: '在 GitHub 查看' }))));
    // 在面板外的灰色區域捲動時，不要捲到後面的網頁
    backdrop.addEventListener('wheel', (e) => { if (e.target === backdrop) e.preventDefault(); }, { passive: false });
    r.root.append(backdrop);
    panel = { close, refresh: () => rows.forEach((row) => row.refresh()) };
    backdrop.querySelector('.mb-panel').focus({ preventScroll: true }); // 讓 Esc、Tab 直接在面板內作用
  }

  /* ======================================================================
   * 自動更新提醒
   * Tampermonkey 本身每天會檢查 @updateURL；這裡再每 30 分鐘看一次，有新版就跳通知
   * ==================================================================== */

  const UPDATE_EVERY = 30 * 60 * 1000;
  const cmpVer = (a, b) => {
    const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
    const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d > 0 ? 1 : -1;
    }
    return 0;
  };
  const readNote = (text, ver) => {
    const m = text.match(new RegExp('^\\s*\\*\\s*' + ver.replace(/\./g, '\\.') + '\\s+(.+)$', 'm'));
    return m ? m[1].trim() : '';
  };
  function openUpdate() {
    try { GM_openInTab(RAW_URL, { active: true, insert: true }); } catch (_) { PAGE.open(RAW_URL, '_blank'); }
  }
  function checkUpdate(manual) {
    if (!IS_TOP || typeof GM_xmlhttpRequest !== 'function') return;
    const now = Date.now();
    if (!manual && now - Number(store.get('upd.last', 0)) < UPDATE_EVERY) return;
    store.set('upd.last', now);
    GM_xmlhttpRequest({
      method: 'GET',
      url: `${RAW_URL}?t=${now}`,
      timeout: 15000,
      headers: { 'Cache-Control': 'no-cache' },
      onload: (res) => {
        if (res.status !== 200) { if (manual) toast(`檢查更新失敗（HTTP ${res.status}），請稍後再試。`); return; }
        const text = res.responseText || '';
        const m = text.match(/@version\s+([0-9][0-9.]*)/);
        if (!m) { if (manual) toast('檢查更新失敗：讀不到版本號，請稍後再試。'); return; }
        const latest = m[1];
        if (cmpVer(latest, VERSION) <= 0) { if (manual) toast(`已是最新版本 ${VERSION}`); return; }
        const snooze = store.get('upd.snooze', null);
        if (!manual && snooze && snooze.v === latest && snooze.until > now) return;
        const later = () => store.set('upd.snooze', { v: latest, until: Date.now() + 6 * 3600 * 1000 });
        toast(readNote(text, latest) || '有新功能或修正。', {
          title: `整合包有新版本 ${latest}（目前 ${VERSION}）`,
          sticky: true,
          actions: [{ label: '更新', primary: true, run: openUpdate }, { label: '稍後', run: later }],
          onClose: later,
        });
      },
      onerror: () => { if (manual) toast('檢查更新失敗：連不到 GitHub，請稍後再試。'); },
      ontimeout: () => { if (manual) toast('檢查更新失敗：連線逾時，請稍後再試。'); },
    });
  }

  /* ======================================================================
   * 啟動
   * ==================================================================== */

  installUiGuard();
  MODULES.forEach(syncModule);
  for (const m of MODULES) {
    store.watch('on.' + m.id, (_v, remote) => {
      syncModule(m);
      if (IS_TOP) { renderMenu(); if (remote && panel) panel.refresh(); }
    });
    store.watch('cfg.' + m.id, (_v, remote) => {
      notifyConfig(m);
      if (IS_TOP) { renderMenu(); if (remote && panel) panel.refresh(); }
    });
  }
  for (const key of ['mem.threadsVolume', 'mem.xVolume']) {
    store.watch(key, (val, remote) => {
      const k = keepers.get(key);
      if (k && remote) k.syncRemote(val);
      if (panel) panel.refresh();
    });
  }
  if (IS_TOP) {
    renderMenu();
    const kick = () => setTimeout(() => checkUpdate(false), 5000);
    if (document.readyState === 'complete') kick();
    else PAGE.addEventListener('load', kick, { once: true });
  }
})();
