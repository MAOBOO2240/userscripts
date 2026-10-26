// ==UserScript==
// @name         MAO BOO 油猴整合包
// @namespace    https://github.com/mao-boo/userscripts
// @version      1.4.0
// @description  整合影片快轉、YouTube Shorts 自動下一部、Threads／X 音量記憶、漫畫翻譯、X 影片下載、LINE 貼圖下載、網址追蹤參數清除、手機版轉電腦版；每個功能都能在選單裡個別開關，並會自動更新。
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
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_info
// @grant        unsafeWindow
// @connect      line-scdn.net
// @connect      raw.githubusercontent.com
// @connect      generativelanguage.googleapis.com
// @connect      translate.googleapis.com
// @connect      cdn.jsdelivr.net
// @connect      unpkg.com
// @connect      huggingface.co
// @connect      hf.co
// @connect      media.githubusercontent.com
// @connect      kingofshojo.com
// @connect      ezmanga.org
// @connect      pstatic.net
// @connect      kakaocdn.net
// @connect      webtoons.com
// @connect      nhentai.net
// @connect      *
// ==/UserScript==

/* ==更新紀錄==
 * 1.4.0  漫畫翻譯的免費認字改用 PaddleOCR（PP-OCRv6），英文、日文直排、韓文都認得準很多；
 *        辨識模型第一次下載後存在瀏覽器裡，之後不用再下載；載入失敗時自動改用原本的 Tesseract
 * 1.3.0  漫畫翻譯預設改成快速模式：瀏覽器認字＋Google 翻譯馬上顯示，Gemini 只收文字幫忙修正（很多張合成一次，很省次數）；
 *        加上進度條：狀態列顯示翻到第幾張、正在做什麼，圖上也標出進度；太久沒有進度會提示，可以按「重試」。Gemini 看圖翻譯改成設定裡的「精準」
 * 1.2.0  漫畫翻譯：深色底、沒有白底的字也會翻；Gemini 同時用多個模型、邊翻邊顯示，快很多；整頁翻譯會先下載後面的圖先翻好（翻頁式也是）；
 *        狀態列縮小並避開網站按鈕；字壓在格線上不會再被切開翻錯，譯文不會互相蓋住；混進簡體字會自動轉繁體
 * 1.1.0  新增漫畫翻譯：英文、日文、韓文漫畫翻成繁體中文並用白底蓋住原文；滑到圖片上按「翻譯」，或按 Alt+T 翻譯整頁
 * 1.0.2  Threads 自己的音量條會跟記住的音量同步，拉的時候不會突然變大聲；在 Threads 音量條上調的音量也會記住
 * 1.0.1  Threads 影片上的音量條改成預設不顯示，音量在設定面板調（面板裡可以再打開）
 * 1.0.0  第一版：整合 7 支腳本，新增 Threads 音量記憶與 X 音量記憶，LINE 動態貼圖改成直接在 LINE 頁面轉 GIF
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
.mb-field input.is-masked { -webkit-text-security: disc; text-security: disc; }
.mb-secret { flex-wrap: wrap; }
.mb-secret-in { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
.mb-secret-foot { flex-basis: 100%; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; }
.mb-mini { flex: none; height: 30px; padding: 0 10px; border: 1px solid #CDD4DC; border-radius: 7px; background: var(--paper);
  color: var(--ink); font-size: 12.5px; font-weight: 600; cursor: pointer; }
.mb-mini:hover { border-color: var(--ink-2); }
.mb-mini:disabled { cursor: progress; opacity: .6; }
.mb-mini:focus-visible, .mb-mini-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mb-mini-link { color: var(--accent); font-size: 12.5px; font-weight: 600; text-decoration: none; }
.mb-mini-link:hover { text-decoration: underline; }
.mb-note { font-size: 12px; color: var(--ink-2); }
.mb-note.is-ok { color: #1D7A3E; }
.mb-note.is-bad { color: #B42318; }
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

/* ---------- 漫畫翻譯 ---------- */
.mt-hover { position: fixed; top: 0; left: 0; display: flex; height: 32px; overflow: hidden; border-radius: 16px;
  background: rgba(15, 22, 30, .86); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); color: #FFFFFF;
  font-family: var(--font); font-size: 13px; font-weight: 650; box-shadow: 0 6px 18px rgba(0, 0, 0, .3);
  opacity: 0; pointer-events: none; transition: opacity .12s; }
.mt-hover.is-on { opacity: 1; pointer-events: auto; }
.mt-hover button { height: 32px; padding: 0 13px; border: 0; background: transparent; color: inherit; font: inherit;
  white-space: nowrap; font-variant-numeric: tabular-nums; cursor: pointer; }
.mt-hover button + button { border-left: 1px solid rgba(255, 255, 255, .22); }
.mt-hover button:hover { background: rgba(255, 255, 255, .14); }
.mt-hover button[hidden] { display: none; }
.mt-hover button.is-busy { cursor: progress; }
.mt-hover button:focus-visible { outline: 2px solid #9DBAFF; outline-offset: -2px; border-radius: 16px; }
.mt-chip { position: fixed; left: 16px; bottom: 16px; display: flex; align-items: center; gap: 4px; max-width: calc(100vw - 32px);
  height: 32px; padding: 0 3px 0 12px; box-sizing: border-box; border-radius: 16px; background: rgba(15, 22, 30, .86);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); color: #FFFFFF; font-family: var(--font); font-size: 12.5px;
  font-weight: 600; line-height: 1; box-shadow: 0 6px 18px rgba(0, 0, 0, .28); opacity: 0; pointer-events: none;
  transform: translateY(6px); transition: opacity .18s, transform .18s; }
.mt-chip.is-on { opacity: 1; pointer-events: auto; transform: none; }
.mt-chip-text { overflow: hidden; min-width: 0; max-width: 460px; margin-right: 4px; white-space: nowrap; text-overflow: ellipsis;
  font-variant-numeric: tabular-nums; }
.mt-chip button { flex: none; height: 26px; padding: 0 10px; border: 0; border-radius: 13px; background: rgba(255, 255, 255, .14);
  color: #FFFFFF; font: inherit; cursor: pointer; }
.mt-chip button:hover { background: rgba(255, 255, 255, .24); }
.mt-chip button.mt-x { width: 26px; padding: 0; background: transparent; color: #AEB9C5; font-size: 16px; }
.mt-chip button.mt-x:hover { background: rgba(255, 255, 255, .14); color: #FFFFFF; }
.mt-chip button.mt-retry { background: #F2C94C; color: #1E1B12; }
.mt-chip button.mt-retry:hover { background: #F7D97A; }
.mt-chip button[hidden] { display: none; }
.mt-bar { position: absolute; left: 12px; right: 12px; bottom: 3px; height: 3px; overflow: hidden; border-radius: 2px;
  background: rgba(255, 255, 255, .16); pointer-events: none; }
.mt-bar i { display: block; width: 0; height: 100%; border-radius: 2px; background: #8DB8FF; transition: width .4s; }
.mt-chip.is-done .mt-bar i { background: #6FCF97; }
.mt-chip.is-stuck .mt-bar i { background: #F2C94C; }
.mt-chip button:focus-visible, .mt-fab:focus-visible { outline: 2px solid #9DBAFF; outline-offset: 2px; }
.mt-fab { position: fixed; right: 16px; bottom: 16px; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: rgba(15, 22, 30, .82); color: #FFFFFF; font-family: var(--font); font-size: 16px; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .3); }
@media (max-width: 640px) { .mb-toasts { bottom: 78px; } }

@keyframes mb-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes mb-fade { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .mb-toast, .mb-backdrop, .mb-panel { animation: none !important; }
  .mb-vol, .mb-toast.is-leaving, .mb-knob, .mb-switch input, .mt-hover, .mt-chip { transition: none !important; }
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
   * 漫畫翻譯：共用工具
   * 圖片 → 切成適合辨識的片段 → Gemini（每個模型的免費額度用完就換下一個，全部用完改用免費模式）
   * → 白底蓋在原文上
   * ==================================================================== */

  const MT_SITES = ['kingofshojo.com', 'ezmanga.org', 'comix.to', 'telltome.net', 'g-mh.org', 'baozimh.org', 'bzmh.org', 'baozimh.com',
    'comic.naver.com', 'webtoon.kakao.com', 'page.kakao.com', 'webtoons.com', 'lezhin.com', 'toptoon.com', 'bomtoon.com', 'nhentai.net'];
  const MT_FONT = '"Microsoft JhengHei", "PingFang TC", "Noto Sans TC", "Noto Sans CJK TC", "Source Han Sans TC", "Heiti TC", sans-serif';
  const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';
  // 拿不到模型清單時用這份；順序就是優先順序
  const GEMINI_DEFAULT_CHAIN = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
  const GEMINI_KEY_URL = 'https://aistudio.google.com/apikey';
  const TESS_JS = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
  const TESS_WORKER = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/worker.min.js';
  const TESS_CORE = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0';
  const MTC_MAX = 400; // 最多記住幾張圖的翻譯
  // 免費模式同時開幾個文字辨識程式（看電腦有幾個核心，最多 3 個）
  const MT_TESS_N = Math.max(1, Math.min((() => { try { return matchMedia('(hover: none)').matches; } catch (_) { return false; } })() ? 2 : 3,
    Math.floor(((typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 2) / 2)));
  // 免費模式的認字：PaddleOCR（PP-OCRv6）模型用 ONNX Runtime 在背景執行緒跑，比 Tesseract 準很多；載入失敗時才改用 Tesseract
  const MT_NPM = ['https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/'];
  const MT_PD_HF = 'https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main/';
  const MT_PD_GH = 'https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main/';
  const MT_PD_RAW = 'https://raw.githubusercontent.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main/';
  const mtNpm = (p, sha) => MT_NPM.map((b) => [b + p, sha]);
  const MT_ORT = 'onnxruntime-web@1.30.0/dist/';
  const MT_PD_TINY = '@arcships/light-ocr-model-ppocrv6-tiny@0.1.0/bundle/';
  const MT_PD_SMALL = '@arcships/light-ocr-model-ppocrv6-small@0.3.4/bundle/';
  /** 每個檔案：大小（進度條用）、下載來源和 SHA-256（依序試，下載後核對內容） */
  const MT_PD = {
    ort: { size: 73054, src: mtNpm(MT_ORT + 'ort.wasm.bundle.min.mjs', '11e64bd8ffe11bd1a2a2f0d6275fdfbbba7262f0b76b99b53d228a8a22ef3d90') },
    wasm: { size: 14239897, src: mtNpm(MT_ORT + 'ort-wasm-simd-threaded.wasm', '3398c10d07d229bd91b364548e130e0e51a8e5704b88c7c083ebbeb78842dee2') },
    det: {
      size: 1780590,
      src: [...mtNpm(MT_PD_TINY + 'det/inference.onnx', '193bab7a04fca699a6c82e6abb5b81bdb28177f0abd4062552b04908dafb19f8'),
        [MT_PD_HF + 'detection/PP-OCRv6_tiny_det.onnx', '193bab7a04fca699a6c82e6abb5b81bdb28177f0abd4062552b04908dafb19f8'],
        [MT_PD_GH + 'detection/PP-OCRv6_tiny_det.onnx', '193bab7a04fca699a6c82e6abb5b81bdb28177f0abd4062552b04908dafb19f8']],
    },
    // 英文（和其他拉丁字母）：PP-OCRv6 tiny，小又快
    eng: {
      size: 4462639,
      src: [...mtNpm(MT_PD_TINY + 'rec/inference.onnx', '9ef676d6ed3c88256a2d92c640c44f25b0c40947e111b14b8be8f594091563e6'),
        [MT_PD_HF + 'recognition/PP-OCRv6_tiny_rec.onnx', '9ef676d6ed3c88256a2d92c640c44f25b0c40947e111b14b8be8f594091563e6'],
        [MT_PD_GH + 'recognition/PP-OCRv6_tiny_rec.onnx', '9ef676d6ed3c88256a2d92c640c44f25b0c40947e111b14b8be8f594091563e6']],
      dict: {
        size: 41009,
        src: [...mtNpm(MT_PD_TINY + 'rec/dictionary.json', '7db82ee59f535f27cedd9f5893e24bf5ed141ef51f5cb076d88053968102c1d1'),
          [MT_PD_RAW + 'recognition/ppocrv6_tiny_dict.txt', '2f3717bbd530b681b6db3be35cc485e8a41a932b9558b833986bf0894eb21f2d']],
      },
    },
    // 日文：PP-OCRv6 small（tiny 沒有假名）
    jpn: {
      size: 21159378,
      src: [...mtNpm(MT_PD_SMALL + 'rec/inference.onnx', '5435fd747c9e0efe15a96d0b378d5bd157e9492ed8fd80edf08f30d02fa24634'),
        [MT_PD_HF + 'recognition/PP-OCRv6_small_rec.onnx', '5435fd747c9e0efe15a96d0b378d5bd157e9492ed8fd80edf08f30d02fa24634'],
        [MT_PD_GH + 'recognition/PP-OCRv6_small_rec.onnx', '5435fd747c9e0efe15a96d0b378d5bd157e9492ed8fd80edf08f30d02fa24634']],
      dict: {
        size: 112408,
        src: [...mtNpm(MT_PD_SMALL + 'rec/dictionary.json', '6e93cc028ff774c8bef0801ad08391f8284f7ef897013a9aeb9cbd515db3276d'),
          [MT_PD_RAW + 'recognition/ppocrv6_dict.txt', '41557512862dfe31970cf22407742b629725461dd84c0d8771bde9c87c2202c8']],
      },
    },
    // 韓文：PP-OCRv5 韓文模型（v6 沒有韓文）
    kor: {
      size: 13443278,
      src: [[MT_PD_HF + 'recognition/multi/korean/v5/korean_PP-OCRv5_mobile_rec_infer.onnx', 'ee0dfde503d787c91fd0455daae2eb85311b4b5bdcddf85a54d8c1e0adc157de'],
        [MT_PD_GH + 'recognition/multi/korean/v5/korean_PP-OCRv5_mobile_rec_infer.onnx', 'ee0dfde503d787c91fd0455daae2eb85311b4b5bdcddf85a54d8c1e0adc157de']],
      dict: {
        size: 47452,
        src: [[MT_PD_HF + 'recognition/multi/korean/v5/ppocrv5_korean_dict.txt', 'a3792cbb41215a43e555e16ff4a7f7b18db5dd80cd058637098f0d872f2dd9d6'],
          [MT_PD_RAW + 'recognition/multi/korean/v5/ppocrv5_korean_dict.txt', 'a3792cbb41215a43e555e16ff4a7f7b18db5dd80cd058637098f0d872f2dd9d6']],
      },
    },
  };
  // PaddleOCR 同時開幾個（手機一個就好，比較省記憶體）
  const MT_PD_N = (() => { try { return matchMedia('(hover: none)').matches; } catch (_) { return false; } })() ? 1 : Math.min(2, MT_TESS_N);
  const MT_LANG = { eng: 'en', kor: 'ko', jpn: 'ja' };
  const MT_CJK = /[⺀-鿿豈-﫿＀-￯　-〿]/;
  const MT_NO_START = /^[，。、．！？；：」』）》〉】〕｝…—～·,.!?;:)\]}%’”]+$/u; // 不放在行首的標點
  const MT_NO_END = /^[「『（《〈【〔｛‘“([{]+$/u; // 不放在行尾的標點

  function strHash(s) {
    let h1 = 0x811c9dc5;
    let h2 = 5381;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 0x01000193);
      h2 = (Math.imul(h2, 33) + c) | 0;
    }
    return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
  }
  const mtKeyHash = (key) => strHash('key:' + String(key || '').trim());

  function modelLabel(id) {
    let s = String(id || '');
    const pre = /-preview$/.test(s);
    s = s.replace(/-preview$/, '').replace(/^gemini-/, 'Gemini ').replace(/-flash-lite$/, ' Flash-Lite').replace(/-flash$/, ' Flash');
    return pre ? s + ' Preview' : s;
  }

  /** 從模型清單挑出 Flash 和 Flash-Lite，新的、非 Lite 的排前面 */
  function mtChainFrom(names) {
    const out = [];
    for (const n of names) {
      const m = /^gemini-(\d+)(?:\.(\d+))?-flash(-lite)?$/.exec(n);
      if (!m) continue;
      const ver = Number(m[1]) + Number(m[2] || 0) / 100;
      if (ver < 2.05) continue;
      out.push({ n, s: ver - (m[3] ? 0.75 : 0) });
    }
    out.sort((a, b) => b.s - a.s);
    return out.slice(0, 8).map((x) => x.n);
  }

  /** 太平洋時間的下一個午夜（Gemini 每日額度在這時候重置） */
  function mtNextReset(now = Date.now()) {
    try {
      const parts = {};
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric' })
        .formatToParts(new Date(now)).forEach((p) => { parts[p.type] = p.value; });
      const secs = (Number(parts.hour) % 24) * 3600 + Number(parts.minute) * 60 + Number(parts.second);
      return now + (86400 - secs) * 1000 + 60000;
    } catch (_) { return now + 6 * 3600 * 1000; }
  }
  function mtWhen(ts) {
    const d = new Date(ts);
    const t = d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    const today = new Date();
    return d.toDateString() === today.toDateString() ? `今天 ${t}` : `明天 ${t}`;
  }

  /* ---------- 模型額度（所有分頁共用） ---------- */

  function mtChain(kh) {
    const c = store.get('mt.chain', null);
    return c && c.k === kh && Array.isArray(c.list) && c.list.length ? c.list : GEMINI_DEFAULT_CHAIN;
  }
  function mtBlocks(kh) {
    const b = store.get('mt.block', null);
    return b && b.k === kh && b.m ? b.m : {};
  }
  function mtSetBlock(kh, model, until, why) {
    const cur = Object.assign({}, mtBlocks(kh));
    const now = Date.now();
    for (const k of Object.keys(cur)) if (!cur[k] || cur[k].until <= now) delete cur[k];
    cur[model] = { until, why };
    store.set('mt.block', { k: kh, m: cur });
  }
  /** 目前可以用的模型：沒被擋的第一個；全部只是每分鐘次數用完 → 等一下；全部今天用完 → 沒有 */
  function mtPick(kh) {
    const blocks = mtBlocks(kh);
    const now = Date.now();
    let soonest = Infinity;
    let rate = null;
    for (const m of mtChain(kh)) {
      const b = blocks[m];
      if (!b || b.until <= now) return { model: m };
      if (b.why === 'rate') { if (!rate || b.until < rate.until) rate = { model: m, until: b.until }; continue; }
      soonest = Math.min(soonest, b.until);
    }
    if (rate) return { wait: rate.until - now, model: rate.model };
    return { none: true, until: soonest };
  }
  function mtEngineState(c) {
    const key = String(c.apiKey || '').trim();
    if (!key) return { kind: 'nokey' };
    const kh = mtKeyHash(key);
    if (store.get('mt.badkey', '') === kh) return { kind: 'badkey' };
    const p = mtPick(kh);
    if (p.none) return { kind: 'quota', until: p.until };
    return { kind: 'gemini', model: p.model, wait: p.wait || 0 };
  }
  function mtHint(c) {
    const s = mtEngineState(c);
    const fast = c.mode !== 'accurate';
    if (s.kind === 'nokey') {
      return fast ? '還沒填金鑰：目前只用瀏覽器辨識文字＋Google 翻譯。填了 Gemini 金鑰（可以免費申請）會再幫忙修正認錯的字、翻得不順的地方，只送文字、很省次數；免費額度用完也不會收費。'
        : '還沒填金鑰，目前用免費模式（瀏覽器辨識文字＋Google 翻譯，品質較普通）。Gemini 金鑰可以免費申請；免費額度用完只會改回免費模式，不會收費。';
    }
    if (s.kind === 'badkey') return '金鑰無效或沒有權限，目前只用免費模式。請重新貼上金鑰再按「測試」。';
    if (s.kind === 'quota') return `Gemini 今天的免費額度都用完了，目前只用免費模式；${mtWhen(s.until)} 後自動恢復。`;
    if (fast) return `快速模式：瀏覽器辨識文字＋Google 翻譯，畫面上很快就有譯文；再用 Gemini（例如 ${modelLabel(s.model)}）依前後文修正，只送文字、很多張合成一次，很省次數。免費額度用完不會收費。`;
    return `精準模式：Gemini 直接看圖翻譯（同時用你帳號裡所有免費的模型，例如 ${modelLabel(s.model)}），每張圖都會用到次數。額度用完會自動換模型，全部用完就改用免費模式，不會收費。`;
  }

  /* ---------- Gemini 連線 ---------- */

  // 進行中的 Gemini 請求：卡住時可以全部中斷重來
  const mtLiveReqs = new Set();
  function mtAbortAll() {
    for (const r of [...mtLiveReqs]) { try { r.abort(); } catch (_) { /* 已結束 */ } }
  }

  function mtRequest(method, url, key, body, timeout) {
    return new Promise((resolve) => {
      let req = null;
      const done = (v) => { mtLiveReqs.delete(req); resolve(v); };
      req = GM_xmlhttpRequest({
        method,
        url,
        timeout,
        headers: Object.assign({ 'x-goog-api-key': key }, body ? { 'Content-Type': 'application/json' } : {}),
        data: body ? JSON.stringify(body) : undefined,
        onload: (res) => done({ status: res.status, text: res.responseText || '' }),
        onerror: () => done({ status: 0, text: '' }),
        ontimeout: () => done({ status: -1, text: '' }),
        onabort: () => done({ status: -1, text: '' }),
      });
      if (req) mtLiveReqs.add(req);
    });
  }

  /**
   * 送出請求；有 onRaw 時用串流（Gemini 邊產生邊回傳），每收到一段就把目前收到的全部文字交給 onRaw。
   * 不支援串流的管理器會在最後一次給完整回應。idle 毫秒內都沒收到資料就中斷（避免一直卡著）。
   */
  function mtPost(url, key, body, timeout, onRaw, idle) {
    return new Promise((resolve) => {
      let raw = '';
      let status = 0;
      let streamed = false;
      let finished = false;
      let cut = false;
      let req = null;
      let lastData = Date.now();
      const finish = (st) => {
        if (finished) return;
        finished = true;
        clearInterval(dog);
        mtLiveReqs.delete(req);
        resolve({ status: st, text: raw, cut });
      };
      const feed = () => { if (onRaw) { try { onRaw(raw); } catch (e) { console.warn('[MAOBOO] 串流處理', e); } } };
      const readStream = async (stream) => {
        streamed = true;
        const reader = stream.getReader();
        const dec = new TextDecoder();
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            lastData = Date.now();
            raw += typeof value === 'string' ? value : dec.decode(value, { stream: true });
            feed();
          }
        } catch (_) { cut = true; } // 連線中斷：用已收到的部分
        finish(status || 200);
      };
      const isStream = (x) => !!x && typeof x.getReader === 'function';
      const dog = setInterval(() => {
        if (idle && Date.now() - lastData > idle && req) { cut = true; try { req.abort(); } catch (_) { /* 已結束 */ } finish(status || -1); }
      }, 2000);
      req = GM_xmlhttpRequest({
        method: 'POST',
        url,
        timeout,
        headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
        data: JSON.stringify(body),
        responseType: onRaw ? 'stream' : undefined,
        onloadstart: onRaw ? (r) => {
          if (r && r.status) status = r.status;
          if (!streamed && isStream(r && r.response)) readStream(r.response);
        } : undefined,
        onload: (r) => {
          if (r && r.status) status = r.status;
          if (streamed) return;
          if (isStream(r && r.response)) { readStream(r.response); return; } // 有些管理器到最後才給串流
          raw = (r && (r.responseText || (typeof r.response === 'string' ? r.response : ''))) || '';
          feed();
          finish(status);
        },
        onerror: () => finish(0),
        ontimeout: () => finish(-1),
        onabort: () => finish(-1),
      });
      if (req) mtLiveReqs.add(req);
    });
  }

  function mtErr(kind, msg, extra) {
    const e = new Error(msg || kind);
    e.kind = kind;
    return Object.assign(e, extra || {});
  }

  /** 把 Gemini 的錯誤分類：金鑰問題、額度（每分鐘／每天）、模型不存在、暫時忙碌… */
  function mtClassify(status, text) {
    if (status === 0) return mtErr('net', '連不到 Gemini');
    if (status === -1) return mtErr('net', 'Gemini 回應逾時');
    let err = null;
    try { err = JSON.parse(text).error; } catch (_) { /* 不是 JSON */ }
    const msg = String((err && err.message) || `HTTP ${status}`);
    const details = (err && Array.isArray(err.details)) ? err.details : [];
    const reasons = details.map((d) => d && d.reason).filter(Boolean).join(' ');
    if (/API_KEY_INVALID|API_KEY_EXPIRED|API key (not valid|expired)/i.test(reasons + ' ' + msg)) return mtErr('key', msg);
    if (status === 401 || status === 403) return mtErr('key', msg);
    if (status === 404) return mtErr('model', msg);
    if (status === 429) {
      const qf = details.find((d) => /QuotaFailure/.test((d && d['@type']) || ''));
      const vio = (qf && Array.isArray(qf.violations)) ? qf.violations : [];
      const ids = vio.map((v) => `${v.quotaId || ''} ${v.quotaMetric || ''}`).join(' ');
      const ri = details.find((d) => /RetryInfo/.test((d && d['@type']) || ''));
      const sec = ri && /([\d.]+)s/.exec(String(ri.retryDelay || ''));
      const delay = sec ? Math.ceil(parseFloat(sec[1]) * 1000) : 0;
      if (/limit:\s*0\b/.test(msg) || vio.some((v) => String(v.quotaValue) === '0')) return mtErr('daily', msg, { nofree: true });
      if (/PerDay/i.test(ids) || /per day/i.test(msg)) return mtErr('daily', msg);
      return mtErr('rate', msg, { delay: delay || 30000 });
    }
    if (status === 400 && /location is not supported/i.test(msg)) return mtErr('region', msg);
    if (status === 400) return mtErr('bad', msg);
    if (status >= 500) return mtErr('busy', msg);
    return mtErr('other', msg);
  }

  async function mtListModels(key) {
    const res = await mtRequest('GET', `${GEMINI_API}/models?pageSize=200`, key, null, 15000);
    if (res.status !== 200) throw mtClassify(res.status, res.text);
    let json = null;
    try { json = JSON.parse(res.text); } catch (_) { throw mtErr('parse', '模型清單無法讀取'); }
    return (json.models || []).map((m) => String((m && m.name) || '').replace(/^models\//, '')).filter(Boolean);
  }

  /** 讀出 Interactions API（或舊版 generateContent）回應裡的文字 */
  function mtOutputText(json) {
    if (!json || typeof json !== 'object') return '';
    if (typeof json.output_text === 'string' && json.output_text) return json.output_text;
    const parts = [];
    for (const s of json.steps || []) {
      if (!s || s.type !== 'model_output') continue;
      for (const c of s.content || []) if (c && c.type === 'text' && c.text) parts.push(c.text);
    }
    if (!parts.length) for (const o of json.outputs || []) if (o && o.type === 'text' && o.text) parts.push(o.text);
    if (!parts.length) {
      for (const c of json.candidates || []) {
        for (const p of (c && c.content && c.content.parts) || []) if (p && p.text && !p.thought) parts.push(p.text);
      }
    }
    return parts.join('');
  }
  function mtParseItems(text) {
    let t = String(text || '').trim();
    if (!t) return null;
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    let v = null;
    try { v = JSON.parse(t); } catch (_) {
      const a = t.indexOf('{');
      const b = t.lastIndexOf('}');
      if (a >= 0 && b > a) { try { v = JSON.parse(t.slice(a, b + 1)); } catch (__) { /* 放棄 */ } }
    }
    if (Array.isArray(v)) return v;
    if (v && Array.isArray(v.items)) return v.items;
    if (v && Array.isArray(v.blocks)) return v.blocks;
    return v && typeof v === 'object' ? [] : null;
  }

  const MT_SCHEMA = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            image: { type: 'integer', description: 'Image number N from the "Image N" label' },
            box_2d: { type: 'array', items: { type: 'integer' }, minItems: 4, maxItems: 4, description: '[ymin, xmin, ymax, xmax] normalized to 0-1000, tightly around the text' },
            lang: { type: 'string', enum: ['en', 'ja', 'ko', 'zh', 'other'] },
            vertical: { type: 'boolean' },
            zh: { type: 'string', description: 'Traditional Chinese (Taiwan) translation' },
          },
          required: ['image', 'box_2d', 'lang', 'zh'],
        },
      },
    },
    required: ['items'],
  };

  function mtSystemPrompt(sfx) {
    return [
      'You are an expert comic translator and letterer. Translate comics (manga, manhwa/webtoons, manhua) into Traditional Chinese as used in Taiwan (繁體中文，台灣用語).',
      'You receive one or more images, each preceded by a label "Image N". They are consecutive parts of the same comic in reading order; a tall webtoon strip may be split across several images.',
      'Find EVERY piece of text a reader needs, wherever it is and whatever is behind it:',
      '- speech and thought bubbles of any shape or color, including dark, colored, gradient, jagged or transparent ones;',
      '- narration and caption boxes of any color, and narration or thoughts written directly on the artwork without any box;',
      '- white or colored text with outlines or shadows over the artwork;',
      '- system or status windows, phone and computer screens, letters, notes, books, signs and labels;',
      '- small translations of sound effects that scanlators added next to the artwork.',
      'Never skip text just because its background is not white.',
      sfx ? 'Also include large decorative sound effects drawn into the artwork, translated into natural Chinese onomatopoeia.'
        : 'Leave out only large decorative sound effects that are drawn into the artwork itself.',
      'Ignore watermarks, website names, URLs, scanlator or translator credits, page numbers and logos. Skip text that is already Chinese.',
      'Return one item per text block; all lines inside one bubble or box form one block. Output the items in reading order, image by image.',
      '- image: the image number N.',
      '- box_2d: [ymin, xmin, ymax, xmax] of the block\'s text in that image, normalized to 0-1000. Enclose all of the block\'s characters tightly, including punctuation; do not include the bubble outline or empty space around the text.',
      '- lang: the language of the original text (en, ja, ko, zh or other).',
      '- vertical: true if the original text is written vertically.',
      '- zh: a natural, fluent Traditional Chinese translation that fits the scene, the speaker and the tone. Keep names and terms consistent. Use Taiwanese wording and full-width punctuation. No notes or explanations.',
      'Write every translation in Traditional Chinese characters (正體字) only; never use Simplified Chinese characters.',
      'If a block is cut off at the top or bottom edge of an image, still include its visible part.',
      'If an image has no text, return no items for it.',
    ].join('\n');
  }

  const MT_FIX_SCHEMA = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'The line number' },
            zh: { type: 'string', description: 'Traditional Chinese (Taiwan) translation, or empty when the line is not story text' },
          },
          required: ['id', 'zh'],
        },
      },
    },
    required: ['items'],
  };

  /** 只送文字的修正：瀏覽器認出來的字可能有錯，請 Gemini 依前後文猜出原文再翻譯 */
  function mtFixPrompt(sfx) {
    return [
      'You are an expert comic translator. You receive numbered lines of comic text (speech bubbles, narration, captions, signs) in reading order. They were read from the comic images by OCR software and may contain recognition errors: missing or extra spaces, wrong or missing letters, words split across lines, stray symbols, or pure noise.',
      'For every line, work out what the original text most likely says from the surrounding lines and the story, then translate it into natural, fluent Traditional Chinese as used in Taiwan (繁體中文，台灣用語) that fits the speaker and the tone.',
      'Use full-width punctuation and Taiwanese wording. Keep names and terms consistent with the recent translations. Write Traditional Chinese characters only, never Simplified Chinese.',
      sfx ? 'Translate sound effects too, as natural Chinese onomatopoeia.' : 'Return an empty zh for lines that are only a sound effect (like BAM, THUD, ドン, 쾅).',
      'Return an empty zh for lines that are not story text (OCR noise, watermarks, website names, scanlator or translator credits, page numbers) or that cannot be made sense of.',
      'Answer with JSON only: {"items":[{"id":1,"zh":"..."}]}, exactly one item per input line, using the same id.',
    ].join('\n');
  }

  /** 從還沒傳完的 JSON 文字裡，取出已經完整的每一個項目（串流時邊收邊顯示） */
  function mtItemScanner() {
    let pos = 0;
    const stack = [];
    let inStr = false;
    let esc = false;
    let start = -1;
    let startDepth = 0;
    return (text) => {
      const out = [];
      for (; pos < text.length; pos++) {
        const ch = text[pos];
        if (inStr) {
          if (esc) esc = false;
          else if (ch === '\\') esc = true;
          else if (ch === '"') inStr = false;
          continue;
        }
        if (ch === '"') { inStr = true; continue; }
        if (ch === '{' || ch === '[') {
          if (ch === '{' && start < 0 && stack[stack.length - 1] === '[') { start = pos; startDepth = stack.length; }
          stack.push(ch);
        } else if (ch === '}' || ch === ']') {
          stack.pop();
          if (ch === '}' && start >= 0 && stack.length === startDepth) {
            try { out.push(JSON.parse(text.slice(start, pos + 1))); } catch (_) { /* 不完整，略過 */ }
            start = -1;
          }
        }
      }
      return out;
    };
  }

  /* ---------- 圖片擷取與切片 ---------- */

  const MT_LAZY_ATTRS = ['data-src', 'data-original', 'data-lazy-src', 'data-lazy', 'data-url', 'data-img', 'data-image', 'data-echo', 'data-cfsrc', 'data-pagespeed-lazy-src'];
  const mtAbs = (u) => { try { return new URL(u, location.href).href; } catch (_) { return ''; } };
  const mtPlaceholder = (u) => !u || /^(about|javascript):/i.test(u) || (/^data:/i.test(u) && u.length < 1000);
  function mtSrcsetBest(ss) {
    let best = '';
    let bw = -1;
    for (const part of String(ss).split(/,\s+/)) {
      const [u, d] = part.trim().split(/\s+/);
      if (!u) continue;
      const n = parseFloat(d) || 1;
      if (n > bw) { bw = n; best = u; }
    }
    return best;
  }
  /** 圖片真正的網址：已載入就用目前顯示的；延遲載入的圖從 data-src 這類屬性找，才能先下載先翻譯 */
  function mtRealUrl(img) {
    const cur = img.currentSrc || '';
    if (img.complete && img.naturalWidth >= 50 && cur && !mtPlaceholder(cur)) return mtAbs(cur);
    for (const a of MT_LAZY_ATTRS) {
      const v = (img.getAttribute(a) || '').trim();
      if (v && !mtPlaceholder(v)) return mtAbs(v);
    }
    const ss = img.getAttribute('data-srcset') || img.getAttribute('data-lazy-srcset') || img.getAttribute('srcset');
    if (ss) {
      const u = mtSrcsetBest(ss);
      if (u && !mtPlaceholder(u)) return mtAbs(u);
    }
    const src = (img.getAttribute('src') || '').trim();
    return src && !mtPlaceholder(src) ? mtAbs(src) : '';
  }
  /** 同一張圖的代號：去掉網址裡每次都會變的簽章、時間參數，換網域的圖庫也認得出是同一張 */
  function mtUrlKey(url) {
    let u;
    try { u = new URL(url); } catch (_) { return String(url); }
    if (u.protocol === 'data:') return 'd:' + strHash(url);
    if (u.protocol === 'blob:') return url;
    const keep = [];
    u.searchParams.forEach((v, k) => {
      if (v.length > 24 || /^(token|sig|signature|expires?|exp|st|e|t|ts|v|ver|hash|h|key|policy|auth|_|x-amz-.*|key-pair-id)$/i.test(k)) return;
      keep.push(k + '=' + v);
    });
    keep.sort();
    return u.pathname + (keep.length ? '?' + keep.join('&') : '');
  }
  /** 圖片所在的資料夾（含網域；i1、i2 這種分流編號視為同一個），用來認出同一話的其他圖 */
  const mtDirOf = (url) => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^([a-z]+)\d+\./i, '$1.') + u.pathname.replace(/[^/]*$/, '');
    } catch (_) { return ''; }
  };
  const mtCanvas = (w, h) => {
    if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(w, h);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };
  const mtToBlob = (c, type, q) => (typeof c.convertToBlob === 'function'
    ? c.convertToBlob({ type, quality: q })
    : new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('圖片轉檔失敗'))), type, q)));
  function mtBase64(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => { const s = String(fr.result || ''); resolve(s.slice(s.indexOf(',') + 1)); };
      fr.onerror = () => reject(fr.error || new Error('讀取圖片失敗'));
      fr.readAsDataURL(blob);
    });
  }
  function mtGmBlob(url, referer) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: referer ? { Referer: referer } : {},
        onload: (res) => (res.status >= 200 && res.status < 300 && res.response
          ? resolve(new Blob([res.response]))
          : reject(new Error(`圖片下載失敗（HTTP ${res.status}）`))),
        onerror: () => reject(new Error('圖片下載失敗（網路錯誤或沒有允許連線）')),
        ontimeout: () => reject(new Error('圖片下載逾時')),
      });
    });
  }
  function mtGmText(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        timeout: 30000,
        onload: (res) => (res.status === 200 ? resolve(res.responseText || '') : reject(new Error(`HTTP ${res.status}`))),
        onerror: () => reject(new Error('網路錯誤')),
        ontimeout: () => reject(new Error('逾時')),
      });
    });
  }

  /**
   * 取得圖片像素：畫面上已載入、同網域的直接讀；其他先用一般下載（可用瀏覽器快取），
   * 圖庫不允許跨站讀取時改用油猴下載。還沒顯示的圖（延遲載入、下一頁）也能先下載。
   */
  async function mtCaptureUrl(url, img, noRef) {
    if (!url) throw new Error('找不到圖片網址');
    let u;
    try { u = new URL(url); } catch (_) { throw new Error('圖片網址無法辨識'); }
    const inline = u.protocol === 'data:' || u.protocol === 'blob:';
    const same = inline || u.origin === location.origin;
    if (img && (same || img.crossOrigin) && img.complete && img.naturalWidth && mtAbs(img.currentSrc) === url) {
      try { return await createImageBitmap(img); } catch (_) { /* 改用下載 */ }
    }
    let blob = null;
    const ac = typeof AbortController === 'function' ? new AbortController() : null;
    const to = ac ? setTimeout(() => ac.abort(), 30000) : 0;
    try {
      const res = await fetch(url, Object.assign(inline ? {} : { mode: 'cors', credentials: same ? 'include' : 'omit', cache: 'force-cache' }, ac ? { signal: ac.signal } : {}));
      if (res.ok) blob = await res.blob();
    } catch (_) { /* 圖庫不允許跨站讀取，改用油猴下載 */ } finally { clearTimeout(to); }
    if ((!blob || !blob.size) && !inline) blob = await mtGmBlob(url, noRef ? '' : location.href);
    if (!blob) throw new Error('讀不到圖片');
    try { return await createImageBitmap(blob); } catch (_) { throw new Error('圖片格式無法讀取'); }
  }

  /**
   * 每一列的狀態，用來決定切在哪裡：
   * uni = 整列同一個顏色（格子之間的空白）；busy = 和這一列主要顏色差很多的點有幾個
   * （只有幾條細格線穿過的空白，busy 很小；有字、有圖的列，busy 很大）
   */
  function mtRowStats(bmp) {
    const A = Math.max(1, Math.min(160, bmp.width));
    const Ha = Math.max(1, Math.round(bmp.height * A / bmp.width));
    const c = mtCanvas(A, Ha);
    const g = c.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingQuality = 'high';
    g.drawImage(bmp, 0, 0, A, Ha);
    const d = g.getImageData(0, 0, A, Ha).data;
    const uni = new Uint8Array(Ha);
    const busy = new Uint16Array(Ha);
    const lum = new Uint8Array(A);
    const hist = new Uint16Array(32);
    for (let y = 0; y < Ha; y++) {
      let i = y * A * 4;
      let r0 = 255; let r1 = 0; let g0 = 255; let g1 = 0; let b0 = 255; let b1 = 0;
      hist.fill(0);
      for (let x = 0; x < A; x++, i += 4) {
        const r = d[i]; const gg = d[i + 1]; const b = d[i + 2];
        if (r < r0) r0 = r; if (r > r1) r1 = r;
        if (gg < g0) g0 = gg; if (gg > g1) g1 = gg;
        if (b < b0) b0 = b; if (b > b1) b1 = b;
        const l = (r * 299 + gg * 587 + b * 114) / 1000;
        lum[x] = l;
        hist[l >> 3]++;
      }
      uni[y] = r1 - r0 <= 14 && g1 - g0 <= 14 && b1 - b0 <= 14 ? 1 : 0;
      let mode = 0;
      for (let k = 1; k < 32; k++) if (hist[k] > hist[mode]) mode = k;
      const mc = mode * 8 + 4;
      let n = 0;
      for (let x = 0; x < A; x++) if (Math.abs(lum[x] - mc) > 26) n++;
      busy[y] = n;
    }
    return { uni, busy, A, Ha };
  }

  /**
   * 長條漫畫切成約 1.7 倍寬的片段。切在格子間的空白；有格線穿過的空白也可以；
   * 都找不到時切在字最少的地方，並和下一片重疊一大段，讓每段文字都能在其中一片裡完整看到。
   */
  function mtPlanSlices(bmp) {
    const W0 = bmp.width;
    const H0 = bmp.height;
    const W = Math.min(W0, 1000);
    const k = W / W0;
    const H = Math.max(1, Math.round(H0 * k));
    const maxH = Math.round(W * 2.4);
    const cuts = [];
    let pos = 0;
    if (H > maxH) {
      const rows = mtRowStats(bmp);
      const toA = (y) => Math.max(0, Math.min(rows.Ha - 1, Math.round(y / H * rows.Ha)));
      const fromA = (ya) => ya / rows.Ha * H;
      const minRun = Math.max(14, W * 0.025);
      const quiet = Math.max(2, Math.round(rows.A * 0.05));
      /** 目標附近最好的一段連續空白列 */
      const findRun = (a0, a1, ok, target) => {
        let best = null;
        let start = -1;
        for (let ya = a0; ya <= a1 + 1; ya++) {
          const u = ya <= a1 && ok(ya);
          if (u && start < 0) start = ya;
          if (!u && start >= 0) {
            const len = fromA(ya - start);
            const center = fromA((start + ya) / 2);
            const score = len - Math.abs(center - target) * 0.08;
            if (len >= minRun && (!best || score > best.score)) best = { score, center };
            start = -1;
          }
        }
        return best;
      };
      while (H - pos > maxH) {
        const target = pos + W * 1.7;
        const a0 = toA(pos + W * 1.2);
        const a1 = toA(pos + W * 2.1);
        const best = findRun(a0, a1, (ya) => rows.uni[ya] === 1, target)
          || findRun(a0, a1, (ya) => rows.busy[ya] <= quiet, target);
        if (best) {
          const c = Math.round(best.center);
          cuts.push([pos, c]);
          pos = c;
          continue;
        }
        // 找不到空白：切在附近幾列加起來最空的地方（避開字）；下一片從上面一段距離、同樣最空的地方開始，
        // 被切到的那段字在下一片裡就是完整的，之後再去掉切到一半的那份
        const quietest = (y0, y1, aim) => {
          let pick = toA(aim);
          let low = Infinity;
          for (let ya = toA(y0); ya <= toA(y1); ya++) {
            let v = 0;
            for (let j = -2; j <= 2; j++) v += rows.busy[Math.max(0, Math.min(rows.Ha - 1, ya + j))];
            v += Math.abs(fromA(ya) - aim) / W * 6; // 差不多空時，選靠近目標的
            if (v < low) { low = v; pick = ya; }
          }
          return Math.round(fromA(pick));
        };
        const c = quietest(pos + W * 1.4, pos + W * 2, target);
        cuts.push([pos, c]);
        pos = Math.max(pos + 1, quietest(c - W * 0.55, c - W * 0.2, c - W * 0.35));
      }
    }
    cuts.push([pos, H]);
    return { W0, H0, W, H, k, cuts };
  }

  async function mtSliceImage(bmp, plan, i, lossless) {
    const [y0, y1] = plan.cuts[i];
    const hh = Math.max(1, y1 - y0);
    const c = mtCanvas(plan.W, hh);
    const g = c.getContext('2d');
    g.fillStyle = '#FFFFFF'; // 透明的地方補白底
    g.fillRect(0, 0, plan.W, hh);
    g.imageSmoothingQuality = 'high';
    g.drawImage(bmp, 0, y0 / plan.k, plan.W0, hh / plan.k, 0, 0, plan.W, hh);
    // 只留壓縮過的圖：整話先下載時不會吃掉太多記憶體。免費模式要辨識文字，用不失真的 PNG
    const blob = await mtToBlob(c, lossless ? 'image/png' : 'image/jpeg', 0.82);
    return { i, y0, y1, blob };
  }

  /* ---------- 譯文排版：找出最大、放得進方框的字級，並平均每行長度 ---------- */

  let mtCtx = null;
  function mtMeasureCtx() {
    if (!mtCtx) mtCtx = mtCanvas(4, 4).getContext('2d');
    return mtCtx;
  }
  /* ---------- 簡體字轉繁體（翻譯偶爾混進簡體字時） ---------- */
  // 前 1001 個是只有簡體才用的字（看到才轉換），後面是簡體、繁體都有的字（確定是簡體文字時才一起轉）
  const MT_S2T_N = 1001;
  const MT_S2T_S = '国为这个来会时学说们发对长过业经门动进区开产军还现机体与当两实么关从内没将员东头间无见战点场数样问并级应资务气汉总电声设义统处马儿领队计别权话报给变书华议称决张'
    + '导术结师达题条规县风运组听济论强黄选记却职号类传带农边联质阳难历专认车举线团备争众连调转该尔让较际亲单红约亚则属积图装许参观鱼办复远构随势热网语铁断爱纪况证编满'
    + '觉双乐标织项飞节龙响药轻击请离显罗营视护创兴虽费试宝识维宫环乡责严桥仅杀围态杨负层须续状银终钱赛独细冲获习医尽脸弹楼艺陆协镇检写苏验紧劳户优财养陈卫伤绝阶刘刚亿'
    + '闻审压监敌兰温园树词岛预继执谁惊画辑剑谈礼乱讲临挥欧简担岁荆贵辖帮块额错剧欢够孙阵销坚练脚读测吴宁换异顾顺鲜败货矿归买险评吗遗笔输渐顶训录毕献爷纳钟脑饭扩齐赶诉'
    + '诗础届静盘卖湾减灵杂泽侧庆妈馆补旧轮妇载怀软枪墙恶顿稳诸绿荣针宽库罢谢页拥圣戏奖币圆烧讨烟误疗闭脱寻岗丽横驻纸夺灯坏丝径购阴择宪鲁庙舰课奥虚隐粮络摇潜庄厅赵访韦'
    + '吨扬纵纷贸汇灭仪缓盖迹释润岭虑钢码坛锛损税综伦韩竞乌铺脉纯谋剂谓频壮骑鸡绍铜摆签缩废订绩盐萨贴触莲抢闹纺讯誉梦峡残闪贼倾贫诺麦泪辈镜贡缘贝骂饮奋跃赞启阁劲晋沟锋'
    + '胆凭闯汤迁叹储贯彻凤赏辽询毁净弃亩伟览龄绕浓绪蓝荡阅鸿惯鸟辞穷键递隶厉闲袭灾涨湿郑译邓肠诏册锅阔趋锦颜悬诚晓蒋摄罚辆腾绘扑颁违贷饰滚迟辅烦盗凉冈驾肃抚炼纲忧扫暂'
    + '渔宾寿猪邻劝践顷赋莱拟贤愤轰陕犹辉颇浅丧惨驱牵详纤档岂绣吓赖卢颗邮凯帅锁帐胶壳脏弯挡筹肿债贾谱夹尘钻丛贺扰锡炉纹亏鉴齿兽碍辩拨恒励鸣偿拦胁纽烂尝艰乔轴喷轨畅雾丢'
    + '窝洁飘肤砖赢挤狮诊篮唤侠枢栏纠链恋惧笼弥叙剥骗猎俩缝携滩祸驰狱纬踪浑绳颈遥忆阀逻恼贪疯侦鹰驶斩鹤赐闷轿辐伪抛侨饱吕玛碱冯仓钦庞祯舱坝艳聪瑶谦卧猫衔苍浆铸惩迈锐颤'
    + '滨饿缠怜撑肾胀谨鹅镑兑贞诞禀饼狭杩赔绵诱顽摊账鸭挣芦睁纱冻轩蛮晕郧鹏栖叠舆斋萧皱蚀钉阐逊铭硕赌饶沪雇掷厌渊氢溃颠铅禅韵婴悦肴凑兹烛歼钧渗窑谐厦谊壶赚谭勋饲裤畴耻'
    + '牺贩竖晒伞鳞龟泼屡瞒厮钩谅霉阙坟宠鳍讼虾涛巩洒枣滞哑焕娱捞婶娇厨嘱禄赠铃虏饥缔蕴鸦锻骤捣茎厢匀灏驼缚垄旷绸缴贱躯颂帜绑仑镖钠刹妆驴铝闸滥酱啸骚窃凿垫钙哟锥懒盏庐'
    + '谕屿酿诈锌沦卤凛蕲蚕搅哗呜搁骇鹃阎浏诵萝颊灿琼骄凄钊驳谏缅锤觅拢胪诀坠贿钓沧耸垒谜缁贬窜葱颖诡腻彦痒赣粤贮绮讽衬烫昼闽钾敛垱寝毙荫涡桩锣缮揽铲尴恳秃搂挠呐驿诧绒'
    + '鞑谎讳泻苇谣蚁潇粪诛栋谴衮堕鲟浇绞窦鲍钞讶琐滤锰绅窍鸽捡驯骡澜洼鳌镶挟邹俭缆聂芜着后里于种万几党据广价准极划确余占采斗胜范适云愿筑叶厂丰挂虫尸杰涌腊涂咸荐郁夸仆'
    + '丑朴柜佣蜡帘淀游';
  const MT_S2T_T = '國為這個來會時學說們發對長過業經門動進區開產軍還現機體與當兩實麼關從內沒將員東頭間無見戰點場數樣問並級應資務氣漢總電聲設義統處馬兒領隊計別權話報給變書華議稱決張'
    + '導術結師達題條規縣風運組聽濟論強黃選記卻職號類傳帶農邊聯質陽難歷專認車舉線團備爭眾連調轉該爾讓較際親單紅約亞則屬積圖裝許參觀魚辦復遠構隨勢熱網語鐵斷愛紀況證編滿'
    + '覺雙樂標織項飛節龍響藥輕擊請離顯羅營視護創興雖費試寶識維宮環鄉責嚴橋僅殺圍態楊負層須續狀銀終錢賽獨細衝獲習醫盡臉彈樓藝陸協鎮檢寫蘇驗緊勞戶優財養陳衛傷絕階劉剛億'
    + '聞審壓監敵蘭溫園樹詞島預繼執誰驚畫輯劍談禮亂講臨揮歐簡擔歲荊貴轄幫塊額錯劇歡夠孫陣銷堅練腳讀測吳寧換異顧順鮮敗貨礦歸買險評嗎遺筆輸漸頂訓錄畢獻爺納鐘腦飯擴齊趕訴'
    + '詩礎屆靜盤賣灣減靈雜澤側慶媽館補舊輪婦載懷軟槍牆惡頓穩諸綠榮針寬庫罷謝頁擁聖戲獎幣圓燒討煙誤療閉脫尋崗麗橫駐紙奪燈壞絲徑購陰擇憲魯廟艦課奧虛隱糧絡搖潛莊廳趙訪韋'
    + '噸揚縱紛貿匯滅儀緩蓋跡釋潤嶺慮鋼碼壇錛損稅綜倫韓競烏鋪脈純謀劑謂頻壯騎雞紹銅擺簽縮廢訂績鹽薩貼觸蓮搶鬧紡訊譽夢峽殘閃賊傾貧諾麥淚輩鏡貢緣貝罵飲奮躍讚啟閣勁晉溝鋒'
    + '膽憑闖湯遷嘆儲貫徹鳳賞遼詢毀淨棄畝偉覽齡繞濃緒藍蕩閱鴻慣鳥辭窮鍵遞隸厲閒襲災漲溼鄭譯鄧腸詔冊鍋闊趨錦顏懸誠曉蔣攝罰輛騰繪撲頒違貸飾滾遲輔煩盜涼岡駕肅撫煉綱憂掃暫'
    + '漁賓壽豬鄰勸踐頃賦萊擬賢憤轟陝猶輝頗淺喪慘驅牽詳纖檔豈繡嚇賴盧顆郵凱帥鎖帳膠殼髒彎擋籌腫債賈譜夾塵鑽叢賀擾錫爐紋虧鑑齒獸礙辯撥恆勵鳴償攔脅紐爛嘗艱喬軸噴軌暢霧丟'
    + '窩潔飄膚磚贏擠獅診籃喚俠樞欄糾鏈戀懼籠彌敘剝騙獵倆縫攜灘禍馳獄緯蹤渾繩頸遙憶閥邏惱貪瘋偵鷹駛斬鶴賜悶轎輻偽拋僑飽呂瑪鹼馮倉欽龐禎艙壩豔聰瑤謙臥貓銜蒼漿鑄懲邁銳顫'
    + '濱餓纏憐撐腎脹謹鵝鎊兌貞誕稟餅狹榪賠綿誘頑攤賬鴨掙蘆睜紗凍軒蠻暈鄖鵬棲疊輿齋蕭皺蝕釘闡遜銘碩賭饒滬僱擲厭淵氫潰顛鉛禪韻嬰悅餚湊茲燭殲鈞滲窯諧廈誼壺賺譚勳飼褲疇恥'
    + '犧販豎曬傘鱗龜潑屢瞞廝鉤諒黴闕墳寵鰭訟蝦濤鞏灑棗滯啞煥娛撈嬸嬌廚囑祿贈鈴虜飢締蘊鴉鍛驟搗莖廂勻灝駝縛壟曠綢繳賤軀頌幟綁侖鏢鈉剎妝驢鋁閘濫醬嘯騷竊鑿墊鈣喲錐懶盞廬'
    + '諭嶼釀詐鋅淪滷凜蘄蠶攪譁嗚擱駭鵑閻瀏誦蘿頰燦瓊驕悽釗駁諫緬錘覓攏臚訣墜賄釣滄聳壘謎緇貶竄蔥穎詭膩彥癢贛粵貯綺諷襯燙晝閩鉀斂壋寢斃蔭渦樁鑼繕攬鏟尷懇禿摟撓吶驛詫絨'
    + '韃謊諱瀉葦謠蟻瀟糞誅棟譴袞墮鱘澆絞竇鮑鈔訝瑣濾錳紳竅鴿撿馴騾瀾窪鰲鑲挾鄒儉纜聶蕪著後裡於種萬幾黨據廣價準極劃確餘佔採鬥勝範適雲願築葉廠豐掛蟲屍傑湧臘塗鹹薦鬱誇僕'
    + '醜樸櫃傭蠟簾澱遊';
  const MT_S2T_P = '头发 頭髮,理发 理髮,白发 白髮,金发 金髮,黑发 黑髮,银发 銀髮,长发 長髮,短发 短髮,秀发 秀髮,发型 髮型,发丝 髮絲,日历 日曆,农历 農曆,复杂 複雜,重复 重複,复制 複製,复习 複習,复印 複印,回复 回覆,答复 答覆,反复 反覆,胡须 鬍鬚,胡子 鬍子,冲洗 沖洗,冲澡 沖澡,冲泡 沖泡,收获 收穫,尽管 儘管,尽量 儘量,尽快 儘快,苏醒 甦醒,钟情 鍾情,钟爱 鍾愛,恶心 噁心,抽烟 抽菸,香烟 香菸,词汇 詞彙,标签 標籤,抽签 抽籤,书签 書籤,赞成 贊成,赞同 贊同,赞助 贊助,心脏 心臟,内脏 內臟,肝脏 肝臟,干什么 幹什麼,干嘛 幹嘛,干吗 幹嘛,干掉 幹掉,干活 幹活,能干 能幹,干得 幹得,干净 乾淨,干杯 乾杯,干脆 乾脆,干燥 乾燥,饼干 餅乾,皇后 皇后,王后 王后,太后 太后,公里 公里,千里 千里,万里 萬里,里程 里程,邻里 鄰里,故里 故里,英里 英里,不准 不准,批准 批准,准许 准許,占卜 占卜,风采 風采,神采 神采,文采 文采,北斗 北斗,漏斗 漏斗,斗篷 斗篷,小丑 小丑,佣金 佣金,拜托 拜託,委托 委託,托付 託付,家伙 傢伙,伙伴 夥伴,同伙 同夥,游泳 游泳,上游 上游,下游 下游,划船 划船,一只 一隻,两只 兩隻,几只 幾隻,这只 這隻,那只 那隻,每只 每隻,面条 麵條,拉面 拉麵,泡面 泡麵,关系 關係,没关系 沒關係,联系 聯繫,特征 特徵,象征 象徵,征求 徵求,凶手 兇手,凶狠 兇狠,凶残 兇殘';
  let mtS2TData = null;
  function mtS2T(t) {
    if (!mtS2TData) {
      const chars = new Map();
      const uniq = new Set();
      for (let i = 0; i < MT_S2T_S.length; i++) {
        chars.set(MT_S2T_S[i], MT_S2T_T[i]);
        if (i < MT_S2T_N) uniq.add(MT_S2T_S[i]);
      }
      const phrases = new Map();
      let maxP = 0;
      for (const pair of MT_S2T_P.split(',')) {
        const [a, b] = pair.split(' ');
        phrases.set(a, b);
        maxP = Math.max(maxP, a.length);
      }
      mtS2TData = { chars, uniq, phrases, maxP };
    }
    const { chars, uniq, phrases, maxP } = mtS2TData;
    let simp = false;
    for (const ch of t) if (uniq.has(ch)) { simp = true; break; }
    if (!simp) return t; // 已經是繁體：不動（「皇后」「公里」這類詞才不會被改錯）
    let out = '';
    for (let i = 0; i < t.length;) {
      let hit = '';
      let len = 0;
      for (let L = Math.min(maxP, t.length - i); L >= 2 && !hit; L--) {
        const v = phrases.get(t.substr(i, L));
        if (v !== undefined) { hit = v; len = L; }
      }
      if (hit) { out += hit; i += len; continue; }
      const ch = t[i];
      out += chars.get(ch) || ch;
      i++;
    }
    return out;
  }

  function mtCleanZh(t) {
    return mtS2T(String(t || '').replace(/\r/g, '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ')
      .replace(/([⺀-鿿＀-￯　-〿])\s+(?=[⺀-鿿＀-￯　-〿])/g, '$1')
      .trim());
  }

  /**
   * 回傳 { s: 字級, lines: [每一行文字], vertical, overflow }
   * 橫排時 lines 是一行一行；直排時是一列一列（由右到左）
   */
  function mtLayout(text, boxW, boxH, opt) {
    const vertical = !!opt.vertical;
    const LH = 1.18;
    const minFont = 7;
    const ctx = mtMeasureCtx();
    ctx.font = `600 100px ${MT_FONT}`;
    const toks = String(text).match(/[A-Za-z0-9À-ɏ'’.\-]+|\s+|[\s\S]/gu) || [];
    if (!toks.length || boxW < 4 || boxH < 4) return null;
    const meas = (s) => (vertical && [...s].length === 1 && MT_CJK.test(s) ? 100 : ctx.measureText(s).width);
    const items = toks.map((s) => ({ s, sp: /^\s+$/.test(s), w: meas(s) }));
    const along = vertical ? boxH : boxW; // 每行的長度方向
    const across = vertical ? boxW : boxH; // 行數堆疊的方向

    const wrap = (L) => {
      const lines = [];
      let cur = [];
      let curW = 0;
      const flush = () => {
        while (cur.length && cur[cur.length - 1].sp) curW -= cur.pop().w;
        if (cur.length) lines.push({ items: cur, w: curW });
        cur = [];
        curW = 0;
      };
      const queue = items.slice();
      while (queue.length) {
        const it = queue.shift();
        if (it.sp && !cur.length) continue;
        if (!it.sp && it.w > L && [...it.s].length > 1) {
          // 太長的英文字拆成單一字母
          queue.unshift(...[...it.s].map((ch) => ({ s: ch, sp: false, w: meas(ch) })));
          continue;
        }
        if (curW + it.w > L && cur.length) {
          if (MT_NO_START.test(it.s)) {
            // 避頭：標點不放在行首，把前一個字一起帶到下一行；前面只有一個字時才讓標點留在行尾
            const last = cur[cur.length - 1];
            if (cur.length >= 2 && !last.sp && !MT_NO_START.test(last.s)) {
              cur.pop();
              curW -= last.w;
              flush();
              cur.push(last, it);
              curW = last.w + it.w;
            } else { cur.push(it); curW += it.w; }
            continue;
          }
          const carry = [];
          while (cur.length > 1 && MT_NO_END.test(cur[cur.length - 1].s)) { const x = cur.pop(); curW -= x.w; carry.unshift(x); }
          flush();
          if (it.sp) continue;
          for (const x of carry) { cur.push(x); curW += x.w; }
        }
        cur.push(it);
        curW += it.w;
      }
      flush();
      return lines;
    };
    const tryFont = (s) => {
      const L = along / s * 100;
      const lines = wrap(L);
      const ok = lines.length * s * LH <= across + 0.5 && lines.every((ln) => ln.w <= L + 0.5);
      return ok ? lines : null;
    };

    const cap = Math.max(minFont, Math.min(opt.maxFont || 64, across / LH));
    let best = tryFont(cap);
    let size = cap;
    if (!best) {
      let lo = minFont;
      let hi = cap;
      for (let n = 0; n < 11 && hi - lo > 0.2; n++) {
        const mid = (lo + hi) / 2;
        const r = tryFont(mid);
        if (r) { best = r; size = mid; lo = mid; } else hi = mid;
      }
      if (!best) {
        const r = tryFont(minFont);
        if (r) { best = r; size = minFont; }
      }
    }
    let overflow = false;
    if (!best) { overflow = true; size = minFont; best = wrap(along / minFont * 100); }
    // 平衡：行數不變，盡量讓每一行一樣長（看起來像對話框裡的排字）
    if (best.length > 1 && !overflow) {
      const n = best.length;
      let lo = Math.max(...best.map((l) => l.w)) / n;
      let hi = along / size * 100;
      let pick = best;
      for (let k = 0; k < 8 && hi - lo > 1; k++) {
        const mid = (lo + hi) / 2;
        const r = wrap(mid);
        if (r.length <= n && r.every((ln) => ln.w <= mid + 0.5)) { pick = r; hi = mid; } else lo = mid;
      }
      best = pick;
    }
    return {
      s: Math.floor(size * 10) / 10,
      lines: best.map((ln) => ln.items.map((x) => x.s).join('')),
      vertical,
      overflow,
    };
  }

  /** 計算圖片實際顯示內容在畫面上的位置（處理 object-fit、邊框、內距） */
  function mtContentRect(img) {
    const r = img.getBoundingClientRect();
    let cs = null;
    try { cs = getComputedStyle(img); } catch (_) { /* 已移除 */ }
    if (!cs) return { box: r, content: r };
    const n = (v) => parseFloat(v) || 0;
    const left = r.left + n(cs.borderLeftWidth) + n(cs.paddingLeft);
    const top = r.top + n(cs.borderTopWidth) + n(cs.paddingTop);
    const width = Math.max(0, r.width - n(cs.borderLeftWidth) - n(cs.borderRightWidth) - n(cs.paddingLeft) - n(cs.paddingRight));
    const height = Math.max(0, r.height - n(cs.borderTopWidth) - n(cs.borderBottomWidth) - n(cs.paddingTop) - n(cs.paddingBottom));
    const box = { left, top, width, height };
    const fit = cs.objectFit;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!fit || fit === 'fill' || !nw || !nh || !width || !height) return { box, content: box };
    let s = 1;
    if (fit === 'contain') s = Math.min(width / nw, height / nh);
    else if (fit === 'cover') s = Math.max(width / nw, height / nh);
    else if (fit === 'scale-down') s = Math.min(1, width / nw, height / nh);
    const dw = nw * s;
    const dh = nh * s;
    const [px, py] = String(cs.objectPosition || '50% 50%').split(/\s+/);
    const pos = (v, free) => (v && v.endsWith('%') ? free * parseFloat(v) / 100 : v && v.endsWith('px') ? parseFloat(v) : free / 2);
    return { box, content: { left: left + pos(px, width - dw), top: top + pos(py, height - dh), width: dw, height: dh } };
  }

  const MT_CSS = `
:host { all: initial; }
.mt-clip { position: absolute; inset: 0; overflow: hidden; }
.mt-layer { position: absolute; left: 0; top: 0; }
.mt-layer[hidden] { display: none; }
.b { position: absolute; display: flex; align-items: center; justify-content: center; box-sizing: border-box;
  background: #FFFFFF; overflow: hidden; }
.t { color: #141414; font-family: ${MT_FONT}; font-weight: 600; line-height: 1.18; text-align: center; white-space: pre;
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.t > div { display: block; }
.t.v { writing-mode: vertical-rl; text-orientation: mixed; }
.mt-badge { position: absolute; left: 0; top: 0; display: flex; flex-direction: column; gap: 5px; padding: 6px 10px 7px;
  border-radius: 10px; background: rgba(15, 22, 30, .84); color: #FFFFFF; font-family: ${MT_FONT}; font-size: 12px; font-weight: 600;
  line-height: 1.2; white-space: nowrap; box-shadow: 0 4px 14px rgba(0, 0, 0, .3); pointer-events: none; }
.mt-badge[hidden] { display: none; }
.mt-badge.is-soft { background: rgba(15, 22, 30, .62); }
.mt-badge i { display: block; min-width: 110px; height: 3px; overflow: hidden; border-radius: 2px; background: rgba(255, 255, 255, .25); }
.mt-badge i[hidden] { display: none; }
.mt-badge b { display: block; width: 0; height: 100%; border-radius: 2px; background: #8DB8FF; transition: width .3s; }
`;

  /**
   * 蓋在一張圖片上的譯文層。放在圖片旁邊（同一個父層），跟著網頁一起捲動，不會延遲或抖動；
   * 版面變動時由 align() 校正位置。
   */
  function mtOverlay(img) {
    const host = document.createElement('maoboo-mt');
    host.style.cssText = 'all:initial !important;position:absolute !important;display:block !important;left:0 !important;top:0 !important;'
      + 'width:0 !important;height:0 !important;margin:0 !important;padding:0 !important;border:0 !important;pointer-events:none !important;';
    const css = (k, v) => host.style.setProperty(k, v, 'important');
    const root = host.attachShadow({ mode: 'open' });
    adoptCss(root, MT_CSS);
    const layer = h('div', { class: 'mt-layer' });
    const badgeText = h('span');
    const badgeFill = h('b');
    const badgeBar = h('i', {}, badgeFill);
    const badge = h('div', { class: 'mt-badge', hidden: true }, badgeText, badgeBar);
    root.append(h('div', { class: 'mt-clip' }, layer, badge));
    const anchor = () => (img.parentElement && img.parentElement.tagName === 'PICTURE' ? img.parentElement : img);
    let L = 0;
    let T = 0;
    let W = 0;
    let Hh = 0;
    let cw = 0; // 內容（圖片本體）大小，排版用
    let ch = 0;
    let blocks = [];
    let shown = true;
    let laidW = -1;
    let laidH = -1;
    let dead = false;

    function place() {
      const a = anchor();
      if (!a.parentNode) return false;
      if (host.previousSibling !== a || host.parentNode !== a.parentNode) a.after(host);
      let z = 1;
      try {
        const cs = getComputedStyle(img);
        if (cs.position !== 'static') z = (parseInt(cs.zIndex, 10) || 0) + 1;
      } catch (_) { /* 用預設 */ }
      css('z-index', String(z));
      return true;
    }

    function align() {
      if (dead) return false;
      if (!img.isConnected) { destroy(); return false; }
      if (!host.isConnected || host.previousSibling !== anchor()) { if (!place()) return false; }
      const { box, content } = mtContentRect(img);
      if (box.width < 2 || box.height < 2) { css('display', 'none'); return true; }
      css('display', 'block');
      let hr = host.getBoundingClientRect();
      // 祖先有縮放時，位移量要換算成本地座標
      const sx = W > 0 && hr.width > 0 ? hr.width / W : 1;
      const sy = Hh > 0 && hr.height > 0 ? hr.height / Hh : 1;
      const nextW = box.width / (sx || 1);
      const nextH = box.height / (sy || 1);
      if (Math.abs(nextW - W) > 0.5 || Math.abs(nextH - Hh) > 0.5) {
        W = nextW;
        Hh = nextH;
        css('width', W + 'px');
        css('height', Hh + 'px');
        hr = host.getBoundingClientRect();
      }
      const dx = box.left - hr.left;
      const dy = box.top - hr.top;
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        L += dx / (sx || 1);
        T += dy / (sy || 1);
        css('left', L + 'px');
        css('top', T + 'px');
      }
      const k = sx || 1;
      const ncw = content.width / k;
      const nch = content.height / (sy || 1);
      layer.style.left = (content.left - box.left) / k + 'px';
      layer.style.top = (content.top - box.top) / (sy || 1) + 'px';
      layer.style.width = ncw + 'px';
      layer.style.height = nch + 'px';
      if (!badge.hidden) {
        // 進度標籤放在圖片「看得到的部分」的左上角，長條圖捲到中間也看得到
        const seen = Math.max(0, -content.top) / (sy || 1);
        const y = (content.top - box.top) / (sy || 1) + Math.max(8, Math.min(seen + 8, nch - 48));
        badge.style.transform = `translate(${Math.round((content.left - box.left) / k + 8)}px, ${Math.round(y)}px)`;
      }
      cw = ncw;
      ch = nch;
      if (Math.abs(cw - laidW) > 1 || Math.abs(ch - laidH) > 1) layout();
      return true;
    }

    /**
     * 譯文框的位置（圖片內容座標）。同一段字被拆成好幾塊、框互相重疊時合併成一個框；
     * 只有邊緣碰到的，從重疊處的中間分開。譯文框不會蓋住別的譯文。
     */
    function arrange() {
      const rs = blocks.map((b) => ({ x0: b.x0 * cw, y0: b.y0 * ch, x1: b.x1 * cw, y1: b.y1 * ch, zh: b.zh, vertical: !!b.vertical }));
      const ov = (a, c) => [Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0), Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0)];
      const area = (a) => (a.x1 - a.x0) * (a.y1 - a.y0);
      for (let again = true; again;) {
        again = false;
        for (let i = 0; i < rs.length && !again; i++) {
          for (let j = i + 1; j < rs.length; j++) {
            const [ix, iy] = ov(rs[i], rs[j]);
            if (ix <= 0 || iy <= 0 || ix * iy < Math.min(area(rs[i]), area(rs[j])) * 0.12) continue;
            rs[i] = mergeRect(rs[i], rs[j]);
            rs.splice(j, 1);
            again = true;
            break;
          }
        }
      }
      for (let i = 0; i < rs.length; i++) {
        for (let j = i + 1; j < rs.length; j++) {
          const a = rs[i];
          const c = rs[j];
          const [ix, iy] = ov(a, c);
          if (ix <= 0 || iy <= 0) continue;
          if (iy <= ix) {
            const [top, bot] = a.y0 + a.y1 <= c.y0 + c.y1 ? [a, c] : [c, a];
            const mid = (bot.y0 + top.y1) / 2;
            top.y1 = mid;
            bot.y0 = mid;
          } else {
            const [lf, rt] = a.x0 + a.x1 <= c.x0 + c.x1 ? [a, c] : [c, a];
            const mid = (rt.x0 + lf.x1) / 2;
            lf.x1 = mid;
            rt.x0 = mid;
          }
        }
      }
      return rs;
    }
    /** 合併兩塊譯文：依閱讀順序接起來（直排由右到左，橫排由上到下、同一排由左到右） */
    function mergeRect(a, c) {
      const vertical = a.vertical && c.vertical;
      let first = a;
      let second = c;
      if (vertical) {
        const ox = Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0);
        if (ox > Math.min(a.x1 - a.x0, c.x1 - c.x0) * 0.5 ? c.y0 < a.y0 : c.x1 > a.x1) [first, second] = [c, a];
      } else {
        const oy = Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0);
        if (oy > Math.min(a.y1 - a.y0, c.y1 - c.y0) * 0.5 ? c.x0 < a.x0 : c.y0 < a.y0) [first, second] = [c, a];
      }
      let zh;
      if (second.zh.includes(first.zh)) zh = second.zh;
      else if (first.zh.includes(second.zh)) zh = first.zh;
      else zh = first.zh + (/[A-Za-z0-9]$/.test(first.zh) && /^[A-Za-z0-9]/.test(second.zh) ? ' ' : '') + second.zh;
      return { x0: Math.min(a.x0, c.x0), y0: Math.min(a.y0, c.y0), x1: Math.max(a.x1, c.x1), y1: Math.max(a.y1, c.y1), zh, vertical };
    }

    function boxEl(r, all, placed) {
      const pad = Math.max(3, cw * 0.012);
      /** 方框可以往外放大，但不能蓋到別的原文，也不能和已經放好的譯文框重疊 */
      const clamp = (x0, y0, x1, y1) => {
        for (const o of all.concat(placed)) {
          if (o === r || Math.min(x1, o.x1) <= Math.max(x0, o.x0) || Math.min(y1, o.y1) <= Math.max(y0, o.y0)) continue;
          const gaps = [o.x0 - r.x1, r.x0 - o.x1, o.y0 - r.y1, r.y0 - o.y1];
          const side = gaps.indexOf(Math.max(...gaps));
          if (side === 0) x1 = Math.max(r.x1, Math.min(x1, o.x0));
          else if (side === 1) x0 = Math.min(r.x0, Math.max(x0, o.x1));
          else if (side === 2) y1 = Math.max(r.y1, Math.min(y1, o.y0));
          else y0 = Math.min(r.y0, Math.max(y0, o.y1));
        }
        return [Math.max(0, x0), Math.max(0, y0), Math.min(cw, x1), Math.min(ch, y1)];
      };
      let [x0, y0, x1, y1] = clamp(r.x0 - pad, r.y0 - pad, r.x1 + pad, r.y1 + pad);
      const maxFont = Math.max(13, cw * 0.055);
      const fit = (w, hh) => {
        const inset = Math.max(2, Math.min(10, Math.min(w, hh) * 0.07));
        let lay = mtLayout(r.zh, w - inset * 2, hh - inset * 2, { maxFont });
        // 原文直排（日文漫畫）時，台灣的中文版也是直排：只要字不會小太多就用直排
        if (r.vertical && hh > w) {
          const v = mtLayout(r.zh, w - inset * 2, hh - inset * 2, { maxFont, vertical: true });
          if (v && (!lay || (!v.overflow && (lay.overflow || v.s >= lay.s * 0.75)))) lay = v;
        }
        return lay;
      };
      let lay = fit(x1 - x0, y1 - y0);
      // 譯文比原文長、字會太小：在不蓋到其他譯文的範圍內，把方框一步步放大
      for (const [fx, fy] of [[0.25, 0.15], [0.5, 0.35], [0.9, 0.6]]) {
        if (!lay || (!lay.overflow && lay.s >= 10)) break;
        const gx = (r.x1 - r.x0 + pad * 2) * fx;
        const gy = (r.y1 - r.y0 + pad * 2) * fy;
        const e = clamp(r.x0 - pad - gx, r.y0 - pad - gy, r.x1 + pad + gx, r.y1 + pad + gy);
        const big = fit(e[2] - e[0], e[3] - e[1]);
        if (big && (!big.overflow || lay.overflow) && big.s > lay.s) { lay = big; [x0, y0, x1, y1] = e; }
      }
      if (!lay) return null;
      placed.push({ x0, y0, x1, y1 });
      const w = x1 - x0;
      const hh = y1 - y0;
      return h('div', {
        class: 'b',
        // 圓角不超過留白的 3 倍：角落的原文一定蓋得到，又比較不會切到對話框的外框
        style: { left: x0 + 'px', top: y0 + 'px', width: w + 'px', height: hh + 'px', borderRadius: Math.min(pad * 3, Math.min(w, hh) * 0.3) + 'px' },
      }, h('div', { class: 't' + (lay.vertical ? ' v' : ''), style: { fontSize: lay.s + 'px' } }, lay.lines.map((t) => h('div', { text: t }))));
    }

    function layout() {
      laidW = cw;
      laidH = ch;
      if (!cw || !ch) { layer.replaceChildren(); return; }
      let rs = [];
      try { rs = arrange(); } catch (e) { console.warn('[MAOBOO] 漫畫翻譯排版失敗', e); }
      const els = [];
      const placed = [];
      for (const r of rs) {
        try { const el = boxEl(r, rs, placed); if (el) els.push(el); } catch (e) { console.warn('[MAOBOO] 漫畫翻譯排版失敗', e); }
      }
      layer.replaceChildren(...els);
    }

    function destroy() {
      if (dead) return;
      dead = true;
      host.remove();
    }

    place();
    return {
      host,
      align,
      setBlocks(list) { blocks = list.slice(); laidW = -1; align(); },
      show(v) { shown = !!v; layer.hidden = !shown; },
      /** 這張圖的進度（text 為空就不顯示）；frac 是 0～1 的進度條，soft 用淡一點的底色 */
      setBadge(text, frac, soft) {
        if (!text) { if (!badge.hidden) badge.hidden = true; return; }
        const was = badge.hidden;
        badge.hidden = false;
        badge.classList.toggle('is-soft', !!soft);
        if (badgeText.textContent !== text) badgeText.textContent = text;
        badgeBar.hidden = frac == null;
        if (frac != null) badgeFill.style.width = Math.round(Math.max(0.04, Math.min(1, frac)) * 100) + '%';
        if (was) align();
      },
      get shown() { return shown; },
      alive: () => !dead,
      destroy,
    };
  }

  /* ---------- 免費模式的認字：PaddleOCR（模型下載、快取、背景執行緒） ---------- */

  /** 下載過的模型存在這個網站的 IndexedDB（用內容的 SHA-256 當名字），下次直接用，不用再下載 */
  let mtIdbP = null;
  function mtIdb() {
    if (mtIdbP) return mtIdbP;
    mtIdbP = new Promise((resolve) => {
      let req = null;
      try { req = indexedDB.open('maoboo-ocr', 1); } catch (_) { resolve(null); return; }
      const t = setTimeout(() => resolve(null), 5000);
      const done = (db) => { clearTimeout(t); resolve(db); };
      req.onupgradeneeded = () => { try { req.result.createObjectStore('files'); } catch (_) { /* 已經有了 */ } };
      req.onsuccess = () => done(req.result);
      req.onerror = () => done(null);
      req.onblocked = () => done(null);
    });
    return mtIdbP;
  }
  function mtIdbDo(mode, fn) {
    return mtIdb().then((db) => new Promise((resolve) => {
      if (!db) { resolve(null); return; }
      try {
        const r = fn(db.transaction('files', mode).objectStore('files'));
        r.onsuccess = () => resolve(r.result === undefined ? null : r.result);
        r.onerror = () => resolve(null);
      } catch (_) { resolve(null); }
    }));
  }
  const mtIdbGet = (k) => mtIdbDo('readonly', (st) => st.get(k));
  const mtPdAll = () => ['ort', 'wasm', 'det', 'eng', 'jpn', 'kor'].flatMap((k) => [MT_PD[k], MT_PD[k].dict].filter(Boolean));
  /** 換了模型版本後，舊的用不到了：刪掉 */
  async function mtIdbPrune() {
    const keep = new Set(mtPdAll().flatMap((a) => a.src.map((s) => s[1])));
    const keys = (await mtIdbDo('readonly', (st) => st.getAllKeys())) || [];
    for (const k of keys) if (!keep.has(k)) mtIdbDo('readwrite', (st) => st.delete(k));
  }
  async function mtSha256(buf) {
    if (typeof crypto === 'undefined' || !crypto.subtle) return '';
    const d = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
    let s = '';
    for (const b of d) s += (b < 16 ? '0' : '') + b.toString(16);
    return s;
  }
  /** 下載一個檔案（先用一般下載，網站不允許時改用油猴下載），邊下載邊回報進度（0～1） */
  async function mtDownload(url, size, onProg) {
    const ac = typeof AbortController === 'function' ? new AbortController() : null;
    let idle = 0;
    const poke = () => { clearTimeout(idle); if (ac) idle = setTimeout(() => ac.abort(), 30000); }; // 30 秒沒有收到資料就放棄
    let res = null;
    try {
      poke();
      res = await fetch(url, Object.assign({ mode: 'cors', credentials: 'omit' }, ac ? { signal: ac.signal } : {}));
    } catch (_) { res = null; } // 網站不允許連到外面（或連不上）：下面改用油猴下載
    try {
      if (res && !res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { http: true }); // 檔案不在：換下一個來源
      if (!res) throw new Error('fetch');
      if (!res.body || typeof res.body.getReader !== 'function') return await res.arrayBuffer();
      const rd = res.body.getReader();
      const parts = [];
      let got = 0;
      for (;;) {
        poke();
        const { done, value } = await rd.read();
        if (done) break;
        parts.push(value);
        got += value.length;
        if (onProg) onProg(got / size);
      }
      const all = new Uint8Array(got);
      let o = 0;
      for (const p of parts) { all.set(p, o); o += p.length; }
      return all.buffer;
    } catch (e) {
      if (e && e.http) throw e;
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url,
          responseType: 'arraybuffer',
          timeout: 300000,
          onprogress: (ev) => { if (onProg && ev && ev.loaded) onProg(ev.loaded / size); },
          onload: (r) => (r.status >= 200 && r.status < 300 && r.response ? resolve(r.response) : reject(new Error(`HTTP ${r.status}`))),
          onerror: () => reject(new Error('網路錯誤')),
          ontimeout: () => reject(new Error('逾時')),
        });
      });
    } finally { clearTimeout(idle); }
  }
  const mtPdLoading = new Map(); // 同一個檔案同時只下載一次
  /** 取得一個模型檔：先找 IndexedDB，沒有再依序試每個來源下載，核對 SHA-256 後存起來 */
  function mtPdAsset(a, onProg) {
    const key = a.src[0][1];
    if (mtPdLoading.has(key)) return mtPdLoading.get(key);
    const p = (async () => {
      for (const [url, sha] of a.src) {
        const hit = await mtIdbGet(sha);
        if (hit && hit.byteLength) return { buf: hit, url };
      }
      let last = null;
      for (const [url, sha] of a.src) {
        try {
          const buf = await mtDownload(url, a.size, onProg);
          const got = await mtSha256(buf);
          if (got && got !== sha) throw new Error('下載的檔案內容不對');
          mtIdbDo('readwrite', (st) => st.put(buf, sha)).then(() => mtIdbPrune());
          return { buf, url };
        } catch (e) { last = e; }
      }
      throw last || new Error('下載失敗');
    })();
    mtPdLoading.set(key, p);
    p.then(() => mtPdLoading.delete(key), () => mtPdLoading.delete(key));
    return p;
  }

  /** ONNX Runtime 的模組版改成一般的程式碼（放進背景執行緒；裡面已經包含 WebAssembly 的載入程式，不用再下載別的） */
  function mtOrtClassic(src) {
    const m = /export\s*\{([^}]*)\};?\s*(\/\/# sourceMappingURL=[^\n]*)?\s*$/.exec(src);
    if (!m) throw new Error('ONNX Runtime 的格式不符');
    const names = m[1].split(',').map((x) => x.trim()).filter(Boolean).map((x) => {
      const [a, b] = x.split(/\s+as\s+/);
      return JSON.stringify(b || a) + ':' + a;
    });
    const me = JSON.stringify(MT_NPM[0] + MT_ORT + 'ort.wasm.bundle.min.mjs');
    return "(function(){'use strict';" + src.slice(0, m.index).replace(/import\.meta\.url/g, me) + ';self.ort={' + names.join(',') + '};})();';
  }

  /**
   * 免費模式的認字程式（在背景執行緒跑，不會讓網頁卡住）：PaddleOCR 的找字（DB）＋認字（CTC）模型，用 ONNX Runtime 執行。
   * 這個函式會被轉成文字放進 Worker，不能用到外面的變數。
   */
  function mtPaddleWorker() {
    /* global ort */
    const S = { det: null, rec: {}, labels: {} };
    const post = (m) => self.postMessage(m);
    const canvas = (w, h) => new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));

    /** 字典對齊模型的類別數：0 是 CTC 的空白，最後一個是空格 */
    function makeLabels(list, classes) {
      let L = list.slice();
      while (L.length && L[L.length - 1] === '') L.pop();
      if (L.length === classes && L[0] === '') return L;
      if (L[0] === '') L = L.slice(1);
      L = [''].concat(L);
      if (L.length === classes - 1) L.push(' ');
      while (L.length < classes) L.push('');
      return L;
    }

    async function load(key, bytes, dict) {
      const sess = await ort.InferenceSession.create(new Uint8Array(bytes), { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
      if (key === 'det') { S.det = sess; return; }
      // 用一次很小的輸入問出模型有幾個字，對齊字典
      const feeds = {};
      feeds[sess.inputNames[0]] = new ort.Tensor('float32', new Float32Array(3 * 48 * 64), [1, 3, 48, 64]);
      const out = await sess.run(feeds);
      const C = out[sess.outputNames[0]].dims[2];
      const list = Array.isArray(dict) ? dict : String(dict || '').replace(/\r/g, '').split('\n');
      S.rec[key] = sess;
      S.labels[key] = makeLabels(list, C);
    }

    /* ---------- 找字：機率圖 → 一塊一塊的字框 ---------- */
    async function detect(bmp, o) {
      const W = bmp.width;
      const H = bmp.height;
      // 像素太多就縮小（找字的時間跟像素數成正比）；太小就放大
      let r = Math.min(1, Math.sqrt((o.maxPixels || 1300000) / (W * H)));
      if (Math.min(W, H) * r < 64) r = 64 / Math.min(W, H);
      const w = Math.max(32, Math.round((W * r) / 32) * 32);
      const h = Math.max(32, Math.round((H * r) / 32) * 32);
      const c = canvas(w, h);
      const g = c.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#FFFFFF';
      g.fillRect(0, 0, w, h);
      g.imageSmoothingQuality = 'high';
      g.drawImage(bmp, 0, 0, w, h);
      const px = g.getImageData(0, 0, w, h).data;
      const n = w * h;
      const t = new Float32Array(3 * n);
      // PaddleOCR 用 BGR 的順序、減平均除標準差
      for (let i = 0, j = 0; i < n; i++, j += 4) {
        t[i] = (px[j + 2] / 255 - 0.485) / 0.229;
        t[n + i] = (px[j + 1] / 255 - 0.456) / 0.224;
        t[2 * n + i] = (px[j] / 255 - 0.406) / 0.225;
      }
      const feeds = {};
      feeds[S.det.inputNames[0]] = new ort.Tensor('float32', t, [1, 3, h, w]);
      const out = await S.det.run(feeds);
      return boxesOf(out[S.det.outputNames[0]].data, w, h, w / W, h / H, W, H, o);
    }

    function boxesOf(P, w, h, rx, ry, W, H, o) {
      const thr = o.thresh || 0.2;
      const boxThr = o.boxThresh || 0.45;
      const unclip = o.unclip || 1.4;
      const n = w * h;
      const lab = new Uint8Array(n);
      const stack = new Int32Array(n);
      const boxes = [];
      for (let p = 0; p < n && boxes.length < 600; p++) {
        if (lab[p] || P[p] <= thr) continue;
        let sp = 0;
        stack[sp++] = p;
        lab[p] = 1;
        let x0 = w; let y0 = h; let x1 = 0; let y1 = 0; let sum = 0; let cnt = 0;
        while (sp) {
          const q = stack[--sp];
          const x = q % w;
          const y = (q - x) / w;
          sum += P[q];
          cnt++;
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
          for (let dy = -1; dy <= 1; dy++) {
            const yy = y + dy;
            if (yy < 0 || yy >= h) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const xx = x + dx;
              if (xx < 0 || xx >= w) continue;
              const r2 = yy * w + xx;
              if (!lab[r2] && P[r2] > thr) { lab[r2] = 1; stack[sp++] = r2; }
            }
          }
        }
        const bw = x1 - x0 + 1;
        const bh = y1 - y0 + 1;
        if (Math.min(bw, bh) < 3 || sum / cnt < boxThr) continue;
        // 模型找到的是縮小過的字心，往外擴回字的大小
        const d = (bw * bh * unclip) / (2 * (bw + bh));
        const b = {
          x0: Math.max(0, (x0 - d) / rx),
          y0: Math.max(0, (y0 - d) / ry),
          x1: Math.min(W, (x1 + 1 + d) / rx),
          y1: Math.min(H, (y1 + 1 + d) / ry),
          score: sum / cnt,
        };
        if (Math.min(b.x1 - b.x0, b.y1 - b.y0) >= 5) boxes.push(b);
      }
      return boxes;
    }

    /* ---------- 認字：每個字框裁下來、高度縮放成 48，CTC 解碼 ---------- */
    async function recognize(bmp, boxes, key, onPart, o) {
      const sess = S.rec[key];
      const labels = S.labels[key];
      const HH = 48;
      const items = boxes.map((b, i) => {
        const cw = Math.max(1, b.x1 - b.x0);
        const ch = Math.max(1, b.y1 - b.y0);
        const rot = ch / cw >= 1.5; // 直排：逆時針轉 90 度再認
        const tw = Math.max(8, Math.min(3200, Math.ceil(HH * (rot ? ch / cw : cw / ch))));
        return { i, b, cw, ch, rot, tw };
      });
      items.sort((a, b) => a.tw - b.tw);
      const res = new Array(boxes.length);
      for (let k = 0; k < items.length;) {
        // 寬度差不多的一起認（補邊比較少）
        const grp = [];
        while (k < items.length && grp.length < 8 && (!grp.length || items[k].tw <= grp[0].tw * 2.5)) grp.push(items[k++]);
        const BW = Math.max(160, grp[grp.length - 1].tw);
        const N = grp.length;
        const plane = HH * BW;
        const t = new Float32Array(N * 3 * plane); // 補邊的地方是 0（灰色）
        grp.forEach((it, n) => {
          const c = canvas(it.tw, HH);
          const g = c.getContext('2d', { willReadFrequently: true });
          g.imageSmoothingQuality = 'high';
          if (it.rot) g.setTransform(0, -HH / it.cw, it.tw / it.ch, 0, 0, HH);
          else g.setTransform(it.tw / it.cw, 0, 0, HH / it.ch, 0, 0);
          g.drawImage(bmp, it.b.x0, it.b.y0, it.cw, it.ch, 0, 0, it.cw, it.ch);
          const px = g.getImageData(0, 0, it.tw, HH).data;
          const base = n * 3 * plane;
          for (let y = 0; y < HH; y++) {
            for (let x = 0; x < it.tw; x++) {
              const j = (y * it.tw + x) * 4;
              const q = base + y * BW + x;
              t[q] = px[j + 2] / 127.5 - 1;
              t[q + plane] = px[j + 1] / 127.5 - 1;
              t[q + 2 * plane] = px[j] / 127.5 - 1;
            }
          }
        });
        const feeds = {};
        feeds[sess.inputNames[0]] = new ort.Tensor('float32', t, [N, 3, HH, BW]);
        const out = await sess.run(feeds);
        const Y = out[sess.outputNames[0]];
        const T = Y.dims[1];
        const C = Y.dims[2];
        const D = Y.data;
        grp.forEach((it, n) => {
          const tMax = Math.min(T, Math.ceil((it.tw / BW) * T) + 1);
          const chars = [];
          const sp = labels.length - 1; // 最後一個是空格
          let last = 0;
          let sum = 0;
          let cnt = 0;
          let gapSp = 0; // 上一個字之後，空格出現過的最大機率
          for (let tt = 0; tt < tMax; tt++) {
            const off = (n * T + tt) * C;
            let best = 0;
            let bv = D[off];
            for (let cc = 1; cc < C; cc++) { const v = D[off + cc]; if (v > bv) { bv = v; best = cc; } }
            if (best !== sp && D[off + sp] > gapSp) gapSp = D[off + sp];
            if (best !== 0 && best !== last && labels[best]) {
              // 模型差一點就認成空格的地方：補回空格（認字模型常常漏掉字中間的空格）
              if (best !== sp && chars.length && chars[chars.length - 1] !== ' ' && gapSp > (o.spaceProb || 0.05)) chars.push(' ');
              chars.push(labels[best]);
              sum += bv;
              cnt++;
              gapSp = 0;
            }
            last = best;
          }
          res[it.i] = { text: chars.join('').replace(/\s+/g, ' ').trim(), conf: cnt ? sum / cnt : 0, vertical: it.rot };
        });
        if (onPart) onPart(k / items.length);
      }
      return res;
    }

    self.onmessage = async (e) => {
      const m = e.data || {};
      try {
        if (m.type === 'init') {
          ort.env.wasm.numThreads = 1;
          ort.env.wasm.wasmBinary = m.wasm;
          ort.env.logLevel = 'error';
          post({ type: 'ok', id: m.id });
        } else if (m.type === 'model') {
          await load(m.key, m.bytes, m.dict);
          post({ type: 'ok', id: m.id });
        } else if (m.type === 'ocr') {
          const bmp = await createImageBitmap(m.blob);
          try {
            const boxes = m.boxes || await detect(bmp, m.opts || {});
            post({ type: 'progress', id: m.id, frac: 0.4 });
            const lines = boxes.length ? await recognize(bmp, boxes, m.rec, (f) => post({ type: 'progress', id: m.id, frac: 0.4 + 0.6 * f }), m.opts || {}) : [];
            post({ type: 'ok', id: m.id, boxes, lines: boxes.map((b, i) => Object.assign({}, b, lines[i])) });
          } finally { if (bmp.close) bmp.close(); }
        }
      } catch (err) {
        post({ type: 'error', id: m.id, message: String((err && err.message) || err) });
      }
    };
  }

  /** 英文、韓文、日文的字有沒有對（沒有的多半是圖上的雜訊） */
  function mtPaddleScript(text, lang) {
    const s = text.replace(/[\s\d\p{P}\p{S}]/gu, '');
    if (!s.length) return false;
    const re = lang === 'kor' ? /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/ : lang === 'jpn' ? /[\u3040-\u30FF\u3400-\u9FFF\u3005\u3006\u30FC]/ : /[A-Za-z]/;
    let n = 0;
    for (const ch of s) if (re.test(ch)) n++;
    if (lang === 'eng' && (n < 2 || !/[aeiouyAEIOUY]/.test(s))) return false;
    return n / s.length >= 0.7;
  }

  /** 英文的常見認錯：重音符號（Í → I）、字中間的 0／1（AG0 → AGO）、混進來的中日文、全大寫字裡的小寫 */
  function mtPaddleEnFix(t) {
    t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    t = t.replace(/[^\x20-\x7E\u00A0-\u024F\u2010-\u2027]/g, ' ').replace(/\s+/g, ' ').trim();
    return t.replace(/[A-Za-z0-9']+/g, (w) => {
      if ((w.match(/[A-Za-z]/g) || []).length < 2) return w;
      let x = w.replace(/0(?=[A-Za-z])|(?<=[A-Za-z])0/g, 'O').replace(/1(?=[A-Za-z]{2})|(?<=[A-Za-z]{2})1/g, 'I');
      if (/^[A-Z0-9']*[a-z][A-Z0-9']*$/.test(x) && x.replace(/[^A-Z]/g, '').length >= 2) x = x.toUpperCase(); // YOu → YOU
      return x;
    });
  }

  /** PaddleOCR 認出來的一行一行 → 一個個對話框（同一框的行合併，照閱讀順序接起來） */
  function mtPaddleGroups(raw, lang) {
    const cjk = lang === 'jpn';
    const lines = [];
    for (const l of raw || []) {
      let text = String(l.text || '').replace(/\s+/g, ' ').trim();
      if (lang === 'eng') text = mtPaddleEnFix(text);
      if (!text) continue;
      if (l.conf < 0.6 || !mtPaddleScript(text, lang)) continue;
      const letters = text.replace(/[^\p{L}]/gu, '').length;
      const w = l.x1 - l.x0;
      const h = l.y1 - l.y0;
      // 很短又不太確定的（例如兩個字母）：單獨出現時多半是圖上的雜訊，跟別的行在一起才算
      const shaky = (lang === 'eng' ? letters <= 2 : letters <= 1) && l.conf < 0.85;
      lines.push({ x0: l.x0, y0: l.y0, x1: l.x1, y1: l.y1, w, h, text, shaky, vertical: h >= w * 1.5, square: Math.max(w, h) < Math.min(w, h) * 1.5 });
    }
    // 日文旁邊的小字（假名注音）：緊貼著一行粗很多的直排字，拿掉
    if (cjk) {
      for (let i = lines.length - 1; i >= 0; i--) {
        const a = lines[i];
        if (!a.vertical) continue;
        const ruby = lines.some((b) => b !== a && b.vertical && b.w >= a.w * 1.6
          && Math.max(b.x0 - a.x1, a.x0 - b.x1) <= a.w * 0.8
          && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) >= a.h * 0.5);
        if (ruby) lines.splice(i, 1);
      }
    }
    const n = lines.length;
    const parent = lines.map((_, i) => i);
    const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const vert = (l) => l.vertical || (cjk && l.square);
    const horiz = (l) => !l.vertical || l.square;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = lines[i];
        const b = lines[j];
        const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0); // 左右重疊多少（負的是間隔）
        const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0); // 上下重疊多少
        let join = false;
        if (cjk && vert(a) && vert(b) && (a.vertical || b.vertical)) {
          // 直排：相鄰的兩行（左右挨著、上下有重疊），或同一行被切成兩段
          const t = Math.max(a.w, b.w);
          if (Math.min(a.w, b.w) / t >= 0.55) {
            if (-ox <= t * 0.8 && oy > 0) join = true;
            else if (ox >= Math.min(a.w, b.w) * 0.5 && -oy <= t * 0.8) join = true;
          }
        } else if (horiz(a) && horiz(b) && !(a.vertical && b.vertical)) {
          const hm = Math.max(a.h, b.h);
          if (Math.min(a.h, b.h) / hm >= 0.55) {
            // 同一行被切成兩段：中間只隔一個空格左右（隔比較遠的多半是旁邊另一個對話框）
            if (oy >= Math.min(a.h, b.h) * 0.5) join = -ox <= hm * 0.5;
            else if (-oy <= hm * 0.7) {
              // 上下兩行：左右要對得上（置中、靠左或大半重疊）
              const cxa = (a.x0 + a.x1) / 2;
              const cxb = (b.x0 + b.x1) / 2;
              join = ox >= Math.min(a.w, b.w) * 0.3 || Math.abs(cxa - cxb) < Math.max(a.w, b.w) * 0.25 || Math.abs(a.x0 - b.x0) < hm * 0.5;
            }
          }
        }
        if (join) parent[find(i)] = find(j);
      }
    }
    const groups = new Map();
    lines.forEach((l, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(l); });
    const out = [];
    for (const g of groups.values()) {
      if (g.length === 1 && g[0].shaky) continue;
      const vertical = cjk && g.filter((l) => l.vertical).length * 2 > g.length;
      /** 依閱讀順序排：直排由右到左、每行由上到下；橫排由上到下、每行由左到右 */
      const order = (list, along, across) => {
        const rows = [];
        for (const l of list.slice().sort((p, q) => across(p) - across(q))) {
          const r = rows.find((row) => row.some((m) => along(m, l)));
          if (r) r.push(l); else rows.push([l]);
        }
        return rows;
      };
      let parts;
      if (vertical) {
        const cols = order(g, (m, l) => Math.min(m.x1, l.x1) - Math.max(m.x0, l.x0) >= Math.min(m.w, l.w) * 0.5, (l) => -(l.x0 + l.x1));
        parts = cols.map((c) => c.sort((p, q) => p.y0 - q.y0).map((l) => l.text).join(''));
      } else {
        const rows = order(g, (m, l) => Math.min(m.y1, l.y1) - Math.max(m.y0, l.y0) >= Math.min(m.h, l.h) * 0.5, (l) => l.y0 + l.y1);
        parts = rows.map((r) => r.sort((p, q) => p.x0 - q.x0).map((l) => l.text).join(' '));
      }
      let text = '';
      for (const p of parts) {
        if (!text) text = p;
        else if (cjk) text += p;
        else if (/[A-Za-z]-$/.test(text) && /^[a-z]/i.test(p)) text = text.slice(0, -1) + p; // 行尾斷字
        else text += ' ' + p;
      }
      if (cjk) {
        text = text.replace(/\s+/g, '');
        if (!/[\u3040-\u30FF]/.test(text)) continue; // 只有漢字、沒有假名的多半是中文，不用翻
      }
      if (lang === 'eng') {
        text = text.replace(/(^|[\s.!?"])[1|](?=[\s-]+[A-Za-z]{2,})/g, '$1I');
        if (!mtPaddleScript(text, 'eng')) continue;
        text = mtSentenceCase(text);
      }
      const t = g.reduce((m, l) => m + Math.min(l.w, l.h), 0) / g.length;
      out.push({
        x0: Math.min(...g.map((l) => l.x0)) - t * 0.1,
        y0: Math.min(...g.map((l) => l.y0)) - t * 0.1,
        x1: Math.max(...g.map((l) => l.x1)) + t * 0.1,
        y1: Math.max(...g.map((l) => l.y1)) + t * 0.1,
        text,
        vertical,
      });
    }
    return out;
  }

  /* ---------- 免費模式：瀏覽器辨識文字（Tesseract.js）＋ 免費翻譯 ---------- */

  let mtTessPromise = null;
  function mtLoadTesseract() {
    if (mtTessPromise) return mtTessPromise;
    mtTessPromise = (async () => {
      const ready = () => (PAGE.Tesseract && typeof PAGE.Tesseract.createWorker === 'function' ? PAGE.Tesseract : null);
      if (ready()) return ready();
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = TESS_JS;
          s.async = true;
          s.onload = resolve;
          s.onerror = () => reject(new Error('blocked'));
          (document.head || document.documentElement).appendChild(s);
          setTimeout(() => reject(new Error('timeout')), 20000);
        });
        if (ready()) return ready();
      } catch (_) { /* 網站不允許外部程式，改用油猴下載 */ }
      const src = await mtGmText(TESS_JS);
      const mod = { exports: {} };
      new Function('module', 'exports', src)(mod, mod.exports); // eslint-disable-line no-new-func
      if (mod.exports && typeof mod.exports.createWorker === 'function') return mod.exports;
      if (ready()) return ready();
      throw new Error('無法載入文字辨識');
    })();
    mtTessPromise.catch(() => { mtTessPromise = null; });
    return mtTessPromise;
  }

  /**
   * 免費模式辨識前的清理：轉成黑白，並擦掉對話框外框、格線、大塊的圖。
   * Tesseract 看到字被一個大外框圍住時常常整段略過，只留「字大小」的黑色塊就讀得到。
   */
  function mtOcrClean(src, w0, h0, scale, invert) {
    const w = Math.max(1, Math.round(w0 * scale));
    const hh = Math.max(1, Math.round(h0 * scale));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = hh;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, 0, 0, w, hh);
    const img = g.getImageData(0, 0, w, hh);
    const d = img.data;
    const n = w * hh;
    const dark = new Uint8Array(n);
    let darkCount = 0;
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      const lum = d[j] * 299 + d[j + 1] * 587 + d[j + 2] * 114;
      if (lum < 128000) darkCount++;
      // 反過來時找的是亮的字（深色底的白字、有外框的白字）
      dark[i] = invert ? (lum > 165000 ? 1 : 0) : (lum < 128000 ? 1 : 0);
    }
    const stack = new Int32Array(n);
    /** 從 p 開始把 inMask 為真的相連點標成 id，回傳外框、點數、有沒有碰到 near 為真的點 */
    const flood = (p, id, lab, inMask, near) => {
      let sp = 0;
      stack[sp++] = p;
      lab[p] = id;
      let x0 = w;
      let y0 = hh;
      let x1 = 0;
      let y1 = 0;
      let count = 0;
      let touch = false;
      const visit = (r) => {
        if (near && !touch && near(r)) touch = true;
        if (!lab[r] && inMask(r)) { lab[r] = id; stack[sp++] = r; }
      };
      while (sp) {
        const q = stack[--sp];
        const x = q % w;
        const y = (q - x) / w;
        count++;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0) visit(q - 1);
        if (x < w - 1) visit(q + 1);
        if (y > 0) visit(q - w);
        if (y < hh - 1) visit(q + w);
      }
      return { x0, y0, x1, y1, bw: x1 - x0 + 1, bh: y1 - y0 + 1, count, touch };
    };
    // 1) 連在一起的一塊一塊：太大的（對話框外框、格線、大塊的圖）整塊擦掉，只留字大小的
    const maxD = Math.max(60 * scale, w * 0.11);
    const label = new Int32Array(n);
    const keep = [0];
    const kept = []; // 留下來的（字大小的）每一塊的外框
    const isDark = (q) => dark[q] === 1;
    let cur = 0;
    for (let p = 0; p < n; p++) {
      if (!dark[p] || label[p]) continue;
      const r = flood(p, ++cur, label, isDark, null);
      keep[cur] = r.bw - 1 <= maxD && r.bh - 1 <= maxD ? 1 : 0;
      if (keep[cur]) kept.push(r);
    }
    // 2) 字壓在直的格線上時，字和格線連成一大塊，跟著被擦掉了：拿掉格線後，把碰到格線、字大小的碎塊放回來
    const LONG = Math.max(90 * scale, Math.min(w, hh) * 0.12);
    const THIN = Math.max(6, Math.round(6 * scale));
    const gone = (q) => dark[q] === 1 && !keep[label[q]];
    const hrun = new Uint16Array(n);
    const vrun = new Uint16Array(n);
    for (let y = 0; y < hh; y++) {
      const row = y * w;
      for (let x = 0; x < w;) {
        if (!dark[row + x]) { x++; continue; }
        let e = x;
        while (e < w && dark[row + e]) e++;
        for (let k = x; k < e; k++) hrun[row + k] = Math.min(65535, e - x);
        x = e;
      }
    }
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < hh;) {
        if (!dark[y * w + x]) { y++; continue; }
        let e = y;
        while (e < hh && dark[e * w + x]) e++;
        for (let k = y; k < e; k++) vrun[k * w + x] = Math.min(65535, e - y);
        y = e;
      }
    }
    const line = new Uint8Array(n);
    let lines = 0;
    for (let i = 0; i < n; i++) {
      if (gone(i) && ((vrun[i] >= LONG && hrun[i] <= THIN) || (hrun[i] >= LONG && vrun[i] <= THIN))) { line[i] = 1; lines++; }
    }
    const sub = new Int32Array(n);
    const rescue = [0];
    if (lines && !invert) { // 反過來（找亮的字）時不需要：格線是深色的
      const G = maxD * 0.7;
      const inSub = (q) => gone(q) && !line[q];
      const onLine = (q) => line[q] === 1;
      const cand = [];
      let id = 0;
      for (let p = 0; p < n; p++) {
        if (sub[p] || !inSub(p)) continue;
        const r = flood(p, ++id, sub, inSub, onLine);
        rescue[id] = 0;
        const fill = r.count / (r.bw * r.bh);
        if (r.touch && r.bw <= G && r.bh <= G && fill >= 0.06 && fill <= 0.85) cand.push(Object.assign(r, { id }));
      }
      /** 旁邊（同一行或同一列）有差不多大的字：真的是字，不是圖裡的線段 */
      const nearText = (b, list) => list.some((k) => {
        if (k === b) return false;
        const oy = Math.min(b.y1, k.y1) - Math.max(b.y0, k.y0);
        if (oy >= Math.min(b.bh, k.bh) * 0.5 && k.bh >= b.bh * 0.4 && k.bh <= b.bh * 2.5
          && Math.max(k.x0 - b.x1, b.x0 - k.x1) <= Math.max(b.bh, k.bh) * 1.2) return true;
        const ox = Math.min(b.x1, k.x1) - Math.max(b.x0, k.x0);
        return ox >= Math.min(b.bw, k.bw) * 0.5 && k.bw >= b.bw * 0.4 && k.bw <= b.bw * 2.5
          && Math.max(k.y0 - b.y1, b.y0 - k.y1) <= Math.max(b.bw, k.bw) * 1.2;
      });
      // 兩輪：第二輪也算第一輪救回來的（格線兩邊的字都碰到格線時）
      const ok = [];
      for (let round = 0; round < 2; round++) {
        for (const b of cand) if (!rescue[b.id] && nearText(b, kept.concat(ok))) { rescue[b.id] = 1; ok.push(b); }
      }
    }
    let keptN = kept.length;
    for (let k = 1; k < rescue.length; k++) keptN += rescue[k];
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      const v = (label[i] && keep[label[i]]) || (sub[i] && rescue[sub[i]]) ? 0 : 255;
      d[j] = v;
      d[j + 1] = v;
      d[j + 2] = v;
      d[j + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    c.darkRatio = darkCount / n;
    c.kept = keptN;
    return c;
  }

  /** 合併兩次辨識（一般、反白）的結果；重疊的只留字比較多的那個 */
  function mtMergeGroups(a, b) {
    const out = a.slice();
    const letters = (g) => g.text.replace(/[^\p{L}]/gu, '').length;
    for (const g of b) {
      let dup = -1;
      for (let i = 0; i < out.length; i++) {
        const o = out[i];
        const ix = Math.min(g.x1, o.x1) - Math.max(g.x0, o.x0);
        const iy = Math.min(g.y1, o.y1) - Math.max(g.y0, o.y0);
        if (ix <= 0 || iy <= 0) continue;
        const small = Math.min((g.x1 - g.x0) * (g.y1 - g.y0), (o.x1 - o.x0) * (o.y1 - o.y0));
        if ((ix * iy) / small >= 0.3) { dup = i; break; }
      }
      if (dup < 0) out.push(g);
      else if (letters(g) > letters(out[dup])) out[dup] = g;
    }
    return out;
  }

  function mtScriptOk(text, lang) {
    const s = text.replace(/[\s\d\p{P}\p{S}]/gu, '');
    if (!s.length) return false;
    const re = lang === 'kor' ? /[가-힯ᄀ-ᇿ㄰-㆏]/ : lang === 'jpn' ? /[぀-ヿ一-鿿]/ : /[A-Za-z]/;
    let n = 0;
    for (const ch of s) if (re.test(ch)) n++;
    if (lang === 'eng' && (n < 2 || !/[aeiouyAEIOUY]/.test(s))) return false;
    if (lang === 'jpn' && !/[\u3040-\u30FF]/.test(s)) return false; // 只有漢字、沒有假名的多半是中文，不用翻
    return n / s.length >= 0.7;
  }

  /** 把辨識出的行依距離合併成一個個對話框 */
  function mtOcrGroups(data, lang, scale) {
    const lines = [];
    for (const b of (data && data.blocks) || []) {
      for (const p of b.paragraphs || []) {
        for (const l of p.lines || []) {
          const text = String(l.text || '').replace(/\s+/g, ' ').trim();
          if (!text || !l.bbox) continue;
          const letters = text.replace(/[^\p{L}]/gu, '').length;
          const short = lang === 'eng' ? letters <= 3 : letters <= 1; // 很短的辨識結果常常是圖上的雜訊
          if (l.confidence < (short ? 85 : 55)) continue;
          if (!mtScriptOk(text, lang)) continue;
          const bb = l.bbox;
          lines.push({ x0: bb.x0 / scale, y0: bb.y0 / scale, x1: bb.x1 / scale, y1: bb.y1 / scale, text });
        }
      }
    }
    // 高度不到一般行一半的通常是雜訊（網點、線條）
    if (lines.length >= 3) {
      const hs = lines.map((l) => Math.min(l.y1 - l.y0, l.x1 - l.x0)).sort((a, b) => a - b);
      const med = hs[hs.length >> 1];
      for (let i = lines.length - 1; i >= 0; i--) if (Math.min(lines[i].y1 - lines[i].y0, lines[i].x1 - lines[i].x0) < med * 0.5) lines.splice(i, 1);
    }
    const n = lines.length;
    const parent = lines.map((_, i) => i);
    const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = lines[i];
        const b = lines[j];
        const ha = a.y1 - a.y0;
        const hb = b.y1 - b.y0;
        const hm = Math.max(ha, hb);
        if (Math.min(ha, hb) / hm < 0.5) continue;
        const vgap = Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1);
        if (vgap > hm * 0.9) continue;
        const cxa = (a.x0 + a.x1) / 2;
        const cxb = (b.x0 + b.x1) / 2;
        const hov = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
        if (hov < -hm * 0.6 && Math.abs(cxa - cxb) > Math.max(a.x1 - a.x0, b.x1 - b.x0) * 0.6) continue;
        parent[find(i)] = find(j);
      }
    }
    const groups = new Map();
    lines.forEach((l, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(l); });
    const out = [];
    for (const g of groups.values()) {
      const vertical = g.filter((l) => l.y1 - l.y0 > (l.x1 - l.x0) * 1.5).length * 2 > g.length;
      if (vertical) g.sort((a, b) => b.x1 - a.x1); // 直排：由右到左
      else g.sort((a, b) => a.y0 - b.y0);
      const joiner = (lang === 'jpn' || (lang === 'kor' && vertical)) ? '' : ' ';
      let text = g.map((l) => l.text).join(joiner).replace(/(\w)- (\w)/g, '$1$2').trim();
      if (lang === 'jpn') text = text.replace(/\s+/g, '');
      if (lang === 'eng') text = mtSentenceCase(text.replace(/(^|[\s.!?])[1|](?=\s+[A-Za-z]{2,})/g, '$1I'));
      // 辨識框不含分開的標點（句點、驚嘆號常常是獨立的小點），往行尾多留一點
      const t = g.reduce((n, l) => n + Math.min(l.x1 - l.x0, l.y1 - l.y0), 0) / g.length;
      out.push({
        x0: Math.min(...g.map((l) => l.x0)) - t * 0.2,
        y0: Math.min(...g.map((l) => l.y0)) - t * 0.15,
        x1: Math.max(...g.map((l) => l.x1)) + t * (vertical ? 0.2 : 0.6),
        y1: Math.max(...g.map((l) => l.y1)) + t * (vertical ? 0.6 : 0.15),
        text,
        vertical,
      });
    }
    return out;
  }

  /** 漫畫常用全大寫英文，翻譯前改成一般大小寫比較準 */
  function mtSentenceCase(t) {
    const letters = t.replace(/[^A-Za-z]/g, '');
    if (letters.length < 4 || letters.replace(/[^A-Z]/g, '').length / letters.length < 0.8) return t;
    return t.toLowerCase()
      .replace(/(^|[.!?…]\s+|["“(]\s*)([a-z])/g, (_m, a, b) => a + b.toUpperCase())
      .replace(/\bi\b/g, 'I').replace(/\bi'(m|ll|ve|d)\b/g, "I'$1");
  }

  const mtChromeTr = {}; // 來源語言 → 已經可以用的翻譯器（或 null）
  const mtChromeDl = {}; // 正在背景下載的語言
  const mtTimeout = (p, ms) => Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
  /**
   * Chrome 內建翻譯（在電腦上離線翻譯）。只在語言包已經裝好時使用，絕不等待下載；
   * 還沒裝好時，如果使用者剛按過按鈕，就在背景開始下載，下次就能用。
   */
  async function mtChromeTranslator(src) {
    const T = PAGE.Translator;
    if (!T || typeof T.create !== 'function' || typeof T.availability !== 'function') return null;
    if (mtChromeTr[src]) return mtChromeTr[src];
    const opts = { sourceLanguage: src, targetLanguage: 'zh-Hant' };
    let avail = 'unavailable';
    try { avail = await mtTimeout(T.availability(opts), 2500); } catch (_) { return null; }
    if (avail === 'available') {
      try { mtChromeTr[src] = await mtTimeout(T.create(opts), 8000); } catch (_) { return null; }
      return mtChromeTr[src];
    }
    if ((avail === 'downloadable' || avail === 'downloading') && !mtChromeDl[src]
      && navigator.userActivation && navigator.userActivation.isActive) {
      mtChromeDl[src] = true;
      T.create(opts).then((tr) => { mtChromeTr[src] = tr; }).catch(() => { mtChromeDl[src] = false; });
    }
    return null;
  }

  function mtGtxOnce(q, sl) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=zh-TW&dt=t&q=${encodeURIComponent(q)}`,
        timeout: 20000,
        onload: (res) => {
          if (res.status !== 200) { reject(new Error(`免費翻譯失敗（HTTP ${res.status}）`)); return; }
          try {
            const j = JSON.parse(res.responseText);
            resolve((j[0] || []).map((seg) => (seg && seg[0]) || '').join(''));
          } catch (_) { reject(new Error('免費翻譯的回應無法讀取')); }
        },
        onerror: () => reject(new Error('免費翻譯連線失敗')),
        ontimeout: () => reject(new Error('免費翻譯逾時')),
      });
    });
  }
  /** Google 翻譯網頁版（免費）：多段文字用換行接在一起，一次翻完 */
  async function mtGtx(texts, sl) {
    const out = new Array(texts.length).fill('');
    const run = async (idx) => {
      const joined = idx.map((i) => texts[i].replace(/\n/g, ' ')).join('\n');
      // 一下子翻太多次被暫時擋下時，等一下再試一次
      const res = await mtGtxOnce(joined, sl).catch(() => new Promise((r) => setTimeout(r, 1500)).then(() => mtGtxOnce(joined, sl)));
      const parts = res.split('\n');
      if (parts.length === idx.length) idx.forEach((i, k) => { out[i] = parts[k].trim(); });
      else for (const i of idx) out[i] = (await mtGtxOnce(texts[i], sl)).trim();
    };
    let batch = [];
    let len = 0;
    for (let i = 0; i < texts.length; i++) {
      const enc = encodeURIComponent(texts[i]).length + 3;
      if (batch.length && len + enc > 1800) { await run(batch); batch = []; len = 0; }
      batch.push(i);
      len += enc;
    }
    if (batch.length) await run(batch);
    return out;
  }
  let mtGtxFailed = false;
  /** 免費翻譯：Google 翻譯（跟 Chrome 右鍵「翻譯成中文」同一套）；連不上時改用 Chrome 的離線翻譯 */
  async function mtFreeTranslate(texts, lang) {
    const src = MT_LANG[lang] || 'en';
    try {
      return await mtGtx(texts, src);
    } catch (e) {
      mtGtxFailed = true;
      console.warn('[MAOBOO] Google 翻譯失敗，改用 Chrome 離線翻譯', e);
      const tr = await mtChromeTranslator(src);
      if (!tr) throw e;
      return mtTimeout(Promise.all(texts.map((t) => tr.translate(t))), 20000);
    }
  }
  /** 依網站猜漫畫原文（免費模式的文字辨識要先指定語言） */
  function mtHostLang() {
    if (/(^|\.)(naver\.com|kakao\.com|lezhin\.com|toptoon\.com|bomtoon\.com|kakaopage\.com)$|\.kr$|newtoki|toonkor|manatoki/.test(HOST)) return 'kor';
    if (/\.jp$|(^|\.)(pixiv\.net|comic-walker\.com|nicovideo\.jp|shonenjumpplus\.com|cmoa\.jp|rawkuma\.com)$|mangaraw|rawlazy/.test(HOST)) return 'jpn';
    return '';
  }

  const mtEscRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  /** 這個網站在不在「顯示翻譯按鈕」清單裡，回傳符合的那一項 */
  function mtSiteMatch(list) {
    for (const raw of list || []) {
      const e = String(raw || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '');
      if (!e) continue;
      if (e === '*') return raw;
      if (e.includes('*')) {
        if (new RegExp('^' + e.split('*').map(mtEscRe).join('.*') + '$').test(HOST)) return raw;
        continue;
      }
      if (HOST === e || HOST.endsWith('.' + e)) return raw;
    }
    return '';
  }
  function mtTyping(e) {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target];
    for (const t of path) {
      if (!t || !t.tagName) continue;
      const tag = t.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable) return true;
    }
    return false;
  }
  function mtErrText(e) {
    if (!e) return '翻譯失敗';
    if (e.kind === 'local') return e.message;
    return String(e.message || e).slice(0, 120);
  }

  /** 漫畫翻譯（每個分頁一份） */
  function createMangaTranslator(ctx) {
    const cfg = () => ctx.cfg();
    const key = () => String(cfg().apiKey || '').trim();
    const kh = () => mtKeyHash(key());
    const siteOn = () => !!mtSiteMatch(cfg().sites);
    const isTouch = (() => { try { return matchMedia('(hover: none)').matches; } catch (_) { return false; } })();
    let stopped = false;
    const offs = [];
    const listen = (t, type, fn, opts) => { t.addEventListener(type, fn, opts); offs.push(() => t.removeEventListener(type, fn, opts)); };
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (!stopped) fn(); }, ms);
      timers.add(id);
      return id;
    };
    const unlater = (id) => { if (id) { clearTimeout(id); timers.delete(id); } };
    const told = new Set();
    const tell = (id, msg, opts) => { if (told.has(id)) return; told.add(id); toast(msg, Object.assign({ timeout: 6000 }, opts)); };
    const keyAction = { label: '設定金鑰', primary: true, run: () => openPanel() };
    // 進度：任何一點進展都記下時間；太久沒有進展就提示「好像卡住了」
    let lastProgress = Date.now();
    const bump = () => { lastProgress = Date.now(); };
    function step(P, text) {
      if (P) P.step = text;
      bump();
      setStatus();
    }

    /* ---------- 漫畫頁（以圖片網址為準）與畫面上顯示它的 <img> ---------- */
    const pages = new Map(); // 網址代號 → 這張圖的翻譯
    const views = new Map(); // <img> → { img, P, overlay }
    let order = 0;

    function getPage(url) {
      const k = mtUrlKey(url);
      let P = pages.get(k);
      if (!P) {
        P = {
          key: k, url, els: new Set(), gen: 0, state: 'idle', blocks: [], done: 0, total: 0, note: '', error: '', step: '', fix: '', lang: '', w0: 0, h0: 0,
          engines: new Set(), shown: true, order: order++, noRef: false, langP: null, started: 0, queued: false, guess: false, userCancel: false,
        };
        pages.set(k, P);
      } else if (P.state !== 'busy') P.url = url; // 有簽章的網址會更新
      return P;
    }
    function bindImg(img) {
      const url = mtRealUrl(img);
      let V = views.get(img);
      if (!url) { if (V) unbind(V); return null; }
      const P = getPage(url);
      if (V && V.P === P) return V;
      if (V) unbind(V);
      V = { img, P, overlay: null };
      views.set(img, V);
      P.els.add(img);
      if (img.referrerPolicy === 'no-referrer') P.noRef = true;
      watchPage();
      if (P.blocks.length) render(P);
      return V;
    }
    function unbind(V) {
      V.P.els.delete(V.img);
      if (V.overlay) { V.overlay.destroy(); V.overlay = null; }
      views.delete(V.img);
      visibleOv.delete(V);
    }
    const shouldShow = (P) => P.shown && !(pg.on && pg.hidden);
    /** 圖片現在顯示的就是翻好的那張（延遲載入的圖還是預留的空白圖時，先不蓋譯文） */
    const ready = (img, P) => img.complete && img.naturalWidth > 1 && !mtPlaceholder(img.currentSrc || '')
      && mtUrlKey(mtAbs(img.currentSrc || img.getAttribute('src') || '')) === P.key;
    function render(P) {
      for (const img of P.els) {
        const V = views.get(img);
        if (!V) continue;
        if (!P.blocks.length) { if (V.overlay) V.overlay.setBlocks([]); continue; }
        ensureOverlay(V);
        V.overlay.setBlocks(P.blocks);
        V.overlay.show(shouldShow(P) && ready(img, P));
      }
    }
    function ensureOverlay(V) {
      if (V.overlay && V.overlay.alive()) return V.overlay;
      V.overlay = mtOverlay(V.img);
      ovIO.observe(V.img);
      ro.observe(V.img);
      return V.overlay;
    }
    function dropOverlay(V) {
      if (V.overlay) V.overlay.destroy();
      V.overlay = null;
      visibleOv.delete(V);
    }
    function showAll() {
      for (const V of views.values()) if (V.overlay) V.overlay.show(shouldShow(V.P) && ready(V.img, V.P));
    }
    function resetPage(P) {
      P.gen++;
      Object.assign(P, { state: 'idle', blocks: [], done: 0, total: 0, note: '', error: '', step: '', fix: '', shown: true, langP: null, queued: false });
      render(P);
      setStatus();
    }
    /**
     * 加入新的文字框：和已有的重疊一半以上視為同一段字，保留完整、較大的那個；
     * 被切片切到一半的（edge），另一片已經有完整的就丟掉
     */
    function addBlocks(P, list) {
      const area = (r) => Math.max(1e-9, (r.x1 - r.x0) * (r.y1 - r.y0));
      for (const b of list) {
        let skip = false;
        for (let i = 0; i < P.blocks.length && !skip; i++) {
          const o = P.blocks[i];
          const ix = Math.min(b.x1, o.x1) - Math.max(b.x0, o.x0);
          const iy = Math.min(b.y1, o.y1) - Math.max(b.y0, o.y0);
          if (ix <= 0 || iy <= 0) continue;
          const ov = ix * iy;
          const aB = area(b);
          const aO = area(o);
          if (ov / Math.min(aB, aO) >= 0.5) {
            if ((o.edge && !b.edge) || (o.edge === b.edge && aB > aO)) P.blocks[i] = b;
            skip = true;
          } else if (b.edge && !o.edge && ov / aB >= 0.25) skip = true;
          else if (o.edge && !b.edge && ov / aO >= 0.25) { P.blocks.splice(i, 1); i--; }
        }
        if (!skip) P.blocks.push(b);
      }
      render(P);
    }

    /**
     * 優先順序（數字越小越先）：畫面上的 → 下面還沒看到的（越近越先）→ 隱藏中的其他頁 → 預先載入的 → 已經看過的
     */
    let curAt = 0;
    let curOrder = 0;
    /** 目前畫面上第一張圖的順序（翻頁式閱讀器：隱藏的頁裡，這一頁之後的先翻） */
    function currentOrder() {
      if (Date.now() - curAt < 300) return curOrder;
      curAt = Date.now();
      const vh = innerHeight || 800;
      let best = Infinity;
      for (const V of views.values()) {
        if (V.P.order >= best || !V.img.isConnected) continue;
        const r = V.img.getBoundingClientRect();
        if ((r.width || r.height) && r.bottom > 0 && r.top < vh) best = V.P.order;
      }
      if (best !== Infinity) curOrder = best;
      return curOrder;
    }
    function prioOf(P) {
      const vh = innerHeight || 800;
      let best = Infinity;
      for (const img of P.els) {
        if (!img.isConnected) continue;
        const r = img.getBoundingClientRect();
        let p;
        if (!r.width && !r.height) {
          const cur = currentOrder();
          p = P.order >= cur ? 20 + (P.order - cur) / 1e3 : 25 + (cur - P.order) / 1e3;
        }
        else if (r.bottom > 0 && r.top < vh) p = Math.max(0, r.top) / 1e6;
        else if (r.top >= vh) p = 1 + (r.top - vh) / vh;
        else p = 40 + -r.bottom / vh;
        if (p < best) best = p;
      }
      return best === Infinity ? 30 + P.order / 1e4 : best;
    }
    /** 依優先順序執行的工作佇列；gate 回傳 false 時先不開始新的（避免一次準備太多張吃記憶體） */
    function prioQueue(n, gate) {
      const wait = [];
      const running = new Set();
      const next = () => {
        while (running.size < n && wait.length) {
          let bi = 0;
          let bp = Infinity;
          for (let i = 0; i < wait.length; i++) {
            const p = prioOf(wait[i].P);
            if (p < bp) { bp = p; bi = i; }
          }
          if (gate && !gate(bp)) break;
          const t = wait.splice(bi, 1)[0];
          running.add(t);
          Promise.resolve().then(t.fn).then(t.resolve, t.reject).finally(() => { running.delete(t); next(); if (q.after) q.after(); });
        }
      };
      const q = (P, fn) => new Promise((resolve, reject) => { wait.push({ P, fn, resolve, reject }); next(); });
      q.kick = next;
      q.pending = () => wait.length + running.size;
      /** 畫面上的圖還在準備中 */
      q.urgent = () => wait.some((t) => prioOf(t.P) < 1) || [...running].some((t) => prioOf(t.P) < 1);
      return q;
    }
    // 畫面上的圖直接準備；後面的圖等 Gemini 或免費模式消化得差不多再準備，才不會一次佔用太多記憶體
    const prepQ = prioQueue(3, (p) => p < 1 || (gq.jobs.length < 24 && ocrQ.pending() < 8));
    const ocrQ = prioQueue(MT_TESS_N);
    ocrQ.after = () => prepQ.kick();

    /* ---------- 狀態更新（合併成每一格畫面最多一次） ---------- */
    let statusRaf = 0;
    function setStatus() {
      if (statusRaf || stopped) return;
      statusRaf = requestAnimationFrame(() => {
        statusRaf = 0;
        chip();
        badges();
        if (hv && hv.img) paintHover();
        if (panel) panel.refresh();
      });
    }

    /* ---------- 快取：翻過的圖不再花額度 ---------- */
    const cacheKeyOf = (P) => 'mtc.' + strHash([location.host, P.key, cfg().sfx, 'v2'].join('|'));
    function cacheGet(P) {
      const v = store.get(cacheKeyOf(P), null);
      if (!v || v.v !== 2 || !Array.isArray(v.b)) return null;
      // 同一個網址換成了別張圖（長寬比不同）就不能用
      for (const img of P.els) {
        if (img.complete && img.naturalWidth && v.w && v.h && Math.abs(img.naturalWidth / img.naturalHeight - v.w / v.h) > 0.02) return null;
      }
      return {
        m: v.m || '', t: v.t || 0, blk: !!v.blk, fx: !!v.fx, w: v.w || 0, h: v.h || 0,
        blocks: v.b.map((a) => ({ x0: a[0], y0: a[1], x1: a[2], y1: a[3], zh: String(a[4] || ''), vertical: !!a[5], lang: a[6] || '', src: a[7] || '', edge: false })),
      };
    }
    function cachePut(P, model, w, h, blk, fx) {
      const k = cacheKeyOf(P);
      const r4 = (n) => Math.round(n * 10000) / 10000;
      store.set(k, { v: 2, t: Date.now(), m: model, w, h, blk: blk ? 1 : 0, fx: fx ? 1 : 0,
        b: P.blocks.map((b) => [r4(b.x0), r4(b.y0), r4(b.x1), r4(b.y1), b.zh, b.vertical ? 1 : 0, b.lang, b.src || '']) });
      let idx = store.get('mtc.idx', []);
      if (!Array.isArray(idx)) idx = [];
      idx = idx.filter((x) => x !== k);
      idx.push(k);
      if (idx.length > MTC_MAX) {
        for (const old of idx.splice(0, idx.length - MTC_MAX + 40)) { try { GM_deleteValue(old); } catch (_) { /* 舊版管理器 */ } }
      }
      store.set('mtc.idx', idx);
    }

    /* ---------- Gemini：模型清單 ---------- */
    let chainP = null;
    let chainFail = 0;
    function ensureChain() {
      const c = store.get('mt.chain', null);
      if ((c && c.k === kh() && Date.now() - c.t < 24 * 3600 * 1000) || Date.now() - chainFail < 10 * 60 * 1000) return Promise.resolve();
      if (chainP) return chainP;
      const k = key();
      const h = kh();
      chainP = mtListModels(k).then((names) => {
        const list = mtChainFrom(names);
        store.set('mt.chain', { k: h, t: Date.now(), list: list.length ? list : GEMINI_DEFAULT_CHAIN });
        if (store.get('mt.badkey', '') === h) store.set('mt.badkey', '');
      }).catch((e) => {
        chainFail = Date.now();
        if (e && (e.kind === 'key' || e.kind === 'region')) markBad(h, e);
      }).finally(() => { chainP = null; });
      return chainP;
    }
    function markBad(h, e) {
      store.set('mt.badkey', h);
      const msg = e.kind === 'region' ? '你所在的地區不能使用 Gemini API，先用免費模式翻譯。' : 'Gemini 金鑰無效或沒有權限，先用免費模式翻譯。';
      tell('bad:' + h, msg, { actions: [keyAction] });
      console.warn('[MAOBOO] Gemini 金鑰無法使用：', e.message);
    }
    function onFallback(st) {
      const fast = cfg().mode !== 'accurate';
      if (st.kind === 'nokey') {
        tell('nokey', fast ? '還沒設定 Gemini 金鑰：先只用 Google 翻譯（認錯的字不會修正）。' : '還沒設定 Gemini 金鑰，先用免費模式翻譯（品質較普通）。',
          { title: '漫畫翻譯', actions: [keyAction] });
      } else if (st.kind === 'quota') {
        tell('quota:' + new Date().toDateString(), fast
          ? `Gemini 今天的次數用完了，先只用 Google 翻譯；${mtWhen(st.until)} 後自動恢復修正。`
          : `Gemini 今天的免費額度都用完了，改用免費模式（品質較普通）；${mtWhen(st.until)} 後自動換回 Gemini。`, { title: '漫畫翻譯' });
      }
    }

    /* ---------- Gemini：多個模型同時翻譯 ---------- */
    // 每個模型有自己的每分鐘、每天額度：同時使用帳號裡所有免費的模型，畫面上的圖先送、小批送，越快看到越好
    const gq = { jobs: [], active: 0, wake: 0, soon: 0, pumping: false, again: false, waitUntil: 0 };
    const MAX_ACTIVE = 6;
    const mstate = {};
    const ms = (m) => mstate[m] || (mstate[m] = { active: 0, times: [], lat: /-lite$/.test(m) ? 1500 : 2800, ok: 0 });
    function rpmOf(m) {
      const r = store.get('mt.rpm', null);
      const v = r && r.k === kh() && r.m ? r.m[m] : 0;
      return v || (/-lite$/.test(m) ? 12 : 8);
    }
    function setRpm(m, v) {
      const r = store.get('mt.rpm', null);
      const cur = r && r.k === kh() && r.m ? Object.assign({}, r.m) : {};
      cur[m] = Math.max(2, Math.min(40, Math.round(v * 10) / 10));
      store.set('mt.rpm', { k: kh(), m: cur });
    }
    /** 挑模型：畫面上的圖挑目前最快的；預先翻譯的照品質順序 */
    function pickModel(hp) {
      const h = kh();
      const blocks = mtBlocks(h);
      const now = Date.now();
      let soonest = Infinity;
      const avail = [];
      for (const m of mtChain(h)) {
        const b = blocks[m];
        if (b && b.until > now) { if (b.why === 'rate') soonest = Math.min(soonest, b.until - now); continue; }
        const s = ms(m);
        if (s.active >= 2) { soonest = Math.min(soonest, 800); continue; }
        // 每分鐘次數：最近一分鐘內送出的請求數
        while (s.times.length && now - s.times[0] > 60000) s.times.shift();
        if (s.times.length >= rpmOf(m)) { soonest = Math.min(soonest, s.times[0] + 60000 - now); continue; }
        avail.push(m);
      }
      if (!avail.length) return { wait: soonest === Infinity ? 1000 : soonest };
      // 先分給閒著的模型（同時用越多個越快）；畫面上的圖再挑最快的，預先翻譯的照品質順序
      const rank = new Map(avail.map((m, i) => [m, i]));
      avail.sort((a, b) => (ms(a).active - ms(b).active) || (hp < 1 ? ms(a).lat - ms(b).lat : rank.get(a) - rank.get(b)));
      return { model: avail[0] };
    }
    function gEnqueueAll(P, slices, onPartial) {
      const now = Date.now();
      const out = slices.map((slice) => {
        const j = { P, gen: P.gen, slice, items: [], cursor: 0, tries: 0, t: now };
        j.notify = () => {
          const fresh = j.items.slice(j.cursor);
          j.cursor = j.items.length;
          if (fresh.length) onPartial(slice, fresh);
        };
        j.promise = new Promise((resolve, reject) => { j.resolve = resolve; j.reject = reject; });
        gq.jobs.push(j);
        return j;
      });
      pumpSoon(0);
      return out;
    }
    function pumpSoon(ms2) {
      if (gq.soon) return;
      gq.soon = later(() => { gq.soon = 0; pump(); }, ms2);
    }
    function rejectAll(err) { gq.jobs.splice(0).forEach((j) => j.reject(err)); prepQ.kick(); }
    async function pump() {
      if (stopped) return;
      if (gq.pumping) { gq.again = true; return; }
      gq.pumping = true;
      try {
        await ensureChain();
        while (!stopped && gq.jobs.length && gq.active < MAX_ACTIVE) {
          gq.jobs = gq.jobs.filter((j) => {
            if (j.gen === j.P.gen) return true;
            j.reject(mtErr('cancel'));
            return false;
          });
          if (!gq.jobs.length) break;
          const st = mtEngineState(cfg());
          if (st.kind !== 'gemini') { rejectAll(mtErr(st.kind, '改用免費模式')); onFallback(st); break; }
          const pr = new Map();
          const pOf = (P) => { if (!pr.has(P)) pr.set(P, prioOf(P)); return pr.get(P); };
          gq.jobs.sort((a, b) => (pOf(a.P) - pOf(b.P)) || (a.P.order - b.P.order) || (a.slice.i - b.slice.i));
          const hp = pOf(gq.jobs[0].P);
          const limit = hp < 1 ? 2 : hp < 4 ? 4 : 6;
          const oldest = Math.min(...gq.jobs.map((j) => j.t));
          // 畫面上的圖還在下載、切片：先等它（最多 4 秒），讓它先送
          if (hp >= 1 && prepQ.urgent() && Date.now() - oldest < 4000) { pumpSoon(200); break; }
          // 很後面的預先翻譯：還有圖在準備時稍等一下，湊多一點再送，省每天的次數
          if (hp >= 4 && gq.jobs.length < limit && prepQ.pending() > 0) {
            const waited = Date.now() - oldest;
            if (waited < 1200) { pumpSoon(Math.min(400, 1200 - waited)); break; }
          }
          const pick = pickModel(hp);
          if (!pick.model) {
            gq.waitUntil = Date.now() + pick.wait;
            unlater(gq.wake);
            gq.wake = later(() => { gq.wake = 0; pump(); }, Math.min(Math.max(pick.wait, 200) + 50, 90000));
            setStatus();
            break;
          }
          gq.waitUntil = 0;
          const batch = gq.jobs.splice(0, limit);
          const s = ms(pick.model);
          s.active++;
          s.times.push(Date.now());
          gq.active++;
          prepQ.kick();
          runBatch(pick.model, batch).catch((e) => console.error('[MAOBOO] 漫畫翻譯', e)).finally(() => { gq.active--; s.active--; pump(); });
        }
      } finally {
        gq.pumping = false;
        if (gq.again) { gq.again = false; pumpSoon(0); }
      }
    }

    const recent = [];
    function remember(items) {
      for (const it of items || []) {
        if (!it || !it.zh || it.lang === 'zh') continue;
        const z = mtCleanZh(it.zh).slice(0, 60);
        if (z && !recent.includes(z)) recent.push(z);
      }
      if (recent.length > 30) recent.splice(0, recent.length - 30);
    }
    function contextText() {
      const out = [];
      const title = String(document.title || '').trim().slice(0, 120);
      if (title) out.push(`Comic page title: ${title}`);
      if (recent.length) out.push('Recent translations on this page (keep names and terms consistent with them):', ...recent);
      return out.join('\n');
    }

    const flags = {};
    /**
     * 呼叫 Gemini；串流時每翻好一個就交給 onItems，馬上顯示。
     * opts.system／opts.schema：看圖翻譯（預設）或只送文字的修正
     */
    async function geminiCall(model, input, onItems, opts = {}) {
      const f = flags[model] || (flags[model] = {});
      const body = {
        model,
        input,
        system_instruction: opts.system || (mtSystemPrompt(cfg().sfx === 'translate')
          + '\nAnswer with JSON only, in the form {"items":[{"image":1,"box_2d":[ymin,xmin,ymax,xmax],"lang":"en","vertical":false,"zh":"..."}]}.'),
        store: false,
      };
      if (!f.noThink) body.generation_config = { thinking_level: f.think || (/-lite$/.test(model) ? 'minimal' : 'low') };
      if (!f.noSchema) body.response_format = { type: 'text', mime_type: 'application/json', schema: opts.schema || MT_SCHEMA };
      const streaming = !f.noStream;
      if (streaming) body.stream = true;

      let modelText = '';
      let completed = null;
      let evErr = null;
      let sawSse = false;
      const stepType = {};
      const scan = mtItemScanner();
      let buf = '';
      let seen = 0;
      const onRaw = (raw) => {
        buf += raw.slice(seen).replace(/\r/g, '');
        seen = raw.length;
        let idx;
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const data = block.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n');
          if (!data || data === '[DONE]') continue;
          sawSse = true;
          let ev = null;
          try { ev = JSON.parse(data); } catch (_) { continue; }
          const t = String(ev.event_type || ev.type || '');
          const it = ev.interaction;
          if (/start/.test(t) && (ev.step || ev.step_type)) stepType[ev.index] = (ev.step && ev.step.type) || ev.step_type;
          const dl = ev.delta;
          bump(); // 有收到東西：沒有卡住
          // 只收模型輸出的文字，不收思考過程
          if (dl && typeof dl.text === 'string' && !/thought|reason/i.test(String(dl.type || '')) && !/thought|reason/i.test(String(stepType[ev.index] || ''))) {
            modelText += dl.text;
            const got = scan(modelText);
            if (got.length && onItems) onItems(got);
          }
          if (it && /^(completed|failed|cancelled|incomplete)$/.test(String(it.status || ''))) completed = it;
          else if (/^interaction\.(complete|done|end)/.test(t)) completed = it || ev;
          if (ev.error) evErr = ev.error;
        }
      };
      // 串流：請求內容加上 "stream": true，回應是 SSE（event: step.delta / data: {...}）；60 秒都沒有資料就中斷重試
      const res = await mtPost(`${GEMINI_API}/interactions`, key(), body, opts.timeout || 180000, streaming ? onRaw : null, streaming ? 60000 : 0);
      if (streaming && buf.trim()) onRaw(res.text + '\n\n'); // 最後一個事件沒有空白行結尾
      const text = String(res.text || '').trim();
      let json = null;
      if (!sawSse && text.startsWith('{')) { try { json = JSON.parse(text); } catch (_) { /* 不是 JSON */ } }
      const retry = (e) => {
        // 這個模型不支援某些參數：拿掉後再試
        if (e.kind !== 'bad') return null;
        if (!f.noStream && /stream|alt=sse|\balt\b/i.test(e.message)) { f.noStream = true; return geminiCall(model, input, onItems, opts); }
        if (!f.noThink && /thinking/i.test(e.message)) {
          if (f.think !== 'low' && /-lite$/.test(model)) f.think = 'low'; else f.noThink = true;
          return geminiCall(model, input, onItems, opts);
        }
        if (!f.noSchema && /response_format|schema|mime/i.test(e.message)) { f.noSchema = true; return geminiCall(model, input, onItems, opts); }
        return null;
      };
      if (json && json.error) {
        const e = mtClassify(Number(json.error.code) || (res.status > 299 ? res.status : 400), text);
        const again = retry(e);
        if (again) return again;
        throw e;
      }
      if (!sawSse && res.status !== 200) {
        const e = mtClassify(res.status, text);
        const again = retry(e);
        if (again) return again;
        throw e;
      }
      if (evErr) throw mtClassify(Number(evErr.code) || 500, JSON.stringify({ error: evErr }));
      let items = modelText ? mtParseItems(modelText) : null;
      if (!items && completed) items = mtParseItems(mtOutputText(completed));
      if (!items && json) items = mtParseItems(mtOutputText(json));
      if (items) return items;
      const partial = modelText ? mtItemScanner()(modelText) : [];
      const st = (completed && completed.status) || (json && json.status);
      if (partial.length && (completed || json)) return partial; // 回應完整、只是字太多被截斷：用已經翻好的部分
      if (st && st !== 'completed' && !partial.length) throw mtErr('blocked', `Gemini 沒有完成（${st}）`);
      if (res.status === 0 || res.status === -1) throw mtClassify(res.status, '');
      if (sawSse && !modelText && !completed && !f.noStream && !res.cut) {
        // 收到串流卻讀不出任何文字（格式和預期的不同）：這個模型改用一般請求，馬上重送
        f.noStream = true;
        return geminiCall(model, input, onItems, opts);
      }
      if (sawSse && !completed) throw mtErr('net', 'Gemini 連線中斷'); // 已經顯示的保留，這一片重試
      if (streaming && !sawSse && !json) f.noStream = true; // 看不懂串流的格式：之後改用一般請求
      throw mtErr('parse', 'Gemini 沒有回傳結果');
    }
    async function runBatch(model, batch) {
      const t0 = Date.now();
      const input = [];
      const c = contextText();
      if (c) input.push({ type: 'text', text: c });
      batch.forEach((j, i) => {
        input.push({ type: 'text', text: `Image ${i + 1}` });
        input.push({ type: 'image', mime_type: 'image/jpeg', data: j.slice.b64 });
      });
      input.push({ type: 'text', text: batch.length > 1 ? `Find and translate all text in the ${batch.length} images above.` : 'Find and translate all text in the image above.' });
      const jobOf = (it) => {
        const n = Math.round(Number(it && it.image));
        return n >= 1 && n <= batch.length ? batch[n - 1] : batch.length === 1 ? batch[0] : null;
      };
      let items;
      try {
        items = await geminiCall(model, input, (got) => {
          const touched = new Set();
          for (const it of got) { const j = jobOf(it); if (j) { j.items.push(it); touched.add(j); } }
          touched.forEach((j) => j.notify());
        });
      } catch (e) { onBatchError(model, batch, e); return; }
      const per = batch.map(() => []);
      for (const it of items) { const j = jobOf(it); if (j) per[batch.indexOf(j)].push(it); }
      batch.forEach((j, i) => {
        if (per[i].length > j.items.length) j.items = per[i];
        j.resolve({ model });
      });
      remember(items);
      const s = ms(model);
      s.lat = s.lat * 0.6 + ((Date.now() - t0) / batch.length) * 0.4;
      if (++s.ok % 4 === 0) setRpm(model, rpmOf(model) + 1); // 一直沒被限制：慢慢放寬
      setStatus();
    }
    function onBatchError(model, batch, e) {
      const now = Date.now();
      const h = kh();
      const back = (list) => { gq.jobs.unshift(...list); };
      if (e.kind === 'rate') {
        mtSetBlock(h, model, now + Math.max(4000, e.delay || 30000), 'rate');
        setRpm(model, rpmOf(model) * 0.7);
        ms(model).ok = 0;
        back(batch);
      } else if (e.kind === 'daily') {
        mtSetBlock(h, model, e.nofree ? now + 3 * 86400000 : mtNextReset(now), e.nofree ? 'nofree' : 'daily');
        back(batch);
        const next = mtPick(h);
        if (next.model && !e.nofree) tell('switch:' + model, `${modelLabel(model)} 今天的免費額度用完了，其他模型會接著翻。`, { title: '漫畫翻譯' });
      } else if (e.kind === 'model') {
        mtSetBlock(h, model, now + 3 * 86400000, 'missing');
        back(batch);
      } else if (e.kind === 'key' || e.kind === 'region') {
        markBad(h, e);
        back(batch);
      } else {
        // 忙碌、網路問題：重試 2 次；讀不懂回應：重試 1 次；請求本身有問題或內容被擋：直接交給免費模式（重試只會浪費額度）
        const limit = e.kind === 'busy' || e.kind === 'net' ? 2 : e.kind === 'parse' ? 1 : 0;
        const keep = [];
        for (const j of batch) { j.tries++; if (j.tries <= limit) keep.push(j); else j.reject(e); }
        if (keep.length) { back(keep); mtSetBlock(h, model, now + 3000 * keep[0].tries, 'rate'); }
        console.warn('[MAOBOO] Gemini 錯誤', model, e.kind, e.message);
      }
      setStatus();
    }
    function mapGemini(items, s, plan) {
      const sh = s.y1 - s.y0;
      const out = [];
      for (const it of items || []) {
        if (!it || !Array.isArray(it.box_2d) || it.box_2d.length < 4) continue;
        const lang = String(it.lang || '').toLowerCase();
        const zh = mtCleanZh(it.zh);
        if (!zh || lang === 'zh') continue;
        let [ymin, xmin, ymax, xmax] = it.box_2d.slice(0, 4).map((v) => Math.min(1000, Math.max(0, Number(v))));
        if (![ymin, xmin, ymax, xmax].every(Number.isFinite)) continue;
        if (ymin > ymax) [ymin, ymax] = [ymax, ymin];
        if (xmin > xmax) [xmin, xmax] = [xmax, xmin];
        if (xmax - xmin < 4 || ymax - ymin < 2) continue;
        if (xmax - xmin > 990 && ymax - ymin > 990) continue; // 整張圖都框起來的通常是誤判
        out.push({
          x0: xmin / 1000,
          x1: xmax / 1000,
          y0: (s.y0 + ymin / 1000 * sh) / plan.H,
          y1: (s.y0 + ymax / 1000 * sh) / plan.H,
          zh,
          lang,
          vertical: !!it.vertical,
          edge: (s.y0 > 0 && ymin < 12) || (s.y1 < plan.H && ymax > 988),
        });
      }
      return out;
    }

    /* ---------- 免費模式：瀏覽器辨識文字（同時開幾個辨識程式，速度比較快） ---------- */
    const loc = { workers: [], making: null, failed: '', failedAt: 0, status: '', prog: 0, gen: 0, cancel: null };
    /** 按「重試」時，所有還在等辨識程式的工作立刻放棄（不然卡住的會一直佔著位子） */
    function cancelSignal() {
      if (!loc.cancel) {
        let rej = null;
        const p = new Promise((_, r) => { rej = r; });
        p.catch(() => null);
        loc.cancel = { p, rej };
      }
      return loc.cancel.p;
    }
    const orCancel = (p) => Promise.race([p, cancelSignal()]);
    const TESS_TEXT = {
      'loading tesseract core': '下載文字辨識程式',
      'loading language traineddata': '下載文字辨識資料',
      'initializing tesseract': '準備文字辨識',
      'initializing api': '準備文字辨識',
    };
    function tessLog(wk, m) {
      if (!m || !m.status) return;
      bump();
      if (m.status === 'recognizing text') { wk.prog = Number(m.progress) || 0; return; }
      const t = TESS_TEXT[String(m.status).replace(/\s*\(.*\)$/, '')];
      if (t) { loc.status = t; loc.prog = Number(m.progress) || 0; setStatus(); }
    }
    function dropWorker(wk) {
      const i = loc.workers.indexOf(wk);
      if (i >= 0) loc.workers.splice(i, 1);
      try { if (wk.w) wk.w.terminate(); } catch (_) { /* 已結束 */ }
    }
    /** 全部辨識程式關掉重開（卡住時「重試」用） */
    function resetWorkers() {
      loc.workers.slice().forEach(dropWorker);
      if (loc.cancel) loc.cancel.rej(mtErr('cancel'));
      Object.assign(loc, { making: null, failed: '', failedAt: 0, status: '', prog: 0, gen: loc.gen + 1, cancel: null });
      pdReset();
    }
    /** 拿一個閒著的辨識程式（語言不同就切換）；還沒開滿就再開一個 */
    async function takeWorker(lang, P) {
      if (loc.failed && Date.now() - loc.failedAt < 60000) throw mtErr('local', loc.failed);
      const langs = lang === 'jpn' ? 'jpn_vert' : lang; // 日文漫畫幾乎都是直排
      const idle = () => loc.workers.find((w) => !w.busy && w.lang === lang) || loc.workers.find((w) => !w.busy);
      const gen0 = loc.gen;
      let wk = idle();
      try {
        if (!wk) {
          // 一次只開一個：第一個下載好語言資料後，後面開的直接用瀏覽器快取
          while (loc.making) await orCancel(loc.making.catch(() => null));
          wk = idle();
        }
        if (wk) wk.busy = true;
        else {
          if (P) step(P, '準備文字辨識');
          Object.assign(loc, { status: '準備文字辨識', prog: 0 });
          const made = { w: null, lang: '', busy: true, prog: 0 };
          const mk = (async () => {
            const T = await mtLoadTesseract();
            made.w = await mtTimeout(T.createWorker(langs, 1, { workerPath: TESS_WORKER, corePath: TESS_CORE, logger: (m) => tessLog(made, m) }), 120000);
            made.init = langs;
          })();
          loc.making = mk;
          // 按過「重試」之後才載入好的，用不到了：關掉
          mk.then(() => { if (gen0 !== loc.gen && made.w) { try { made.w.terminate(); } catch (_) { /* 已結束 */ } } }, () => null);
          try { await orCancel(mk); } finally { if (loc.making === mk) { loc.making = null; loc.status = ''; } }
          if (gen0 !== loc.gen) { try { made.w.terminate(); } catch (_) { /* 已結束 */ } throw mtErr('cancel'); } // 按過「重試」：這個作廢
          wk = made;
          loc.workers.push(wk);
        }
        if (wk.lang !== lang) {
          if (wk.init !== langs) { if (P) step(P, '切換辨識語言'); await orCancel(wk.w.reinitialize(langs, 1)); wk.init = langs; }
          // 橫排用「零散文字」模式；直排用「直排文字」模式，否則不同對話框的直行會被接在一起
          await orCancel(wk.w.setParameters({ tessedit_pageseg_mode: lang === 'jpn' ? '5' : '11', preserve_interword_spaces: '1', user_defined_dpi: '300' }));
          wk.lang = lang;
        }
        wk.prog = 0;
        return wk;
      } catch (e) {
        if (wk) dropWorker(wk);
        if ((e && e.kind === 'cancel') || gen0 !== loc.gen) throw mtErr('cancel');
        console.warn('[MAOBOO] 免費模式（Tesseract）載入失敗', e);
        loc.failed = '文字辨識載入失敗（這個網站可能不允許，或網路有問題）';
        loc.failedAt = Date.now();
        tell('local-failed', '免費模式的文字辨識載入失敗：這個網站可能不允許，或網路有問題。可以按狀態列的「重試」，或在設定改用 Gemini 看圖翻譯。', { title: '漫畫翻譯' });
        throw mtErr('local', loc.failed);
      }
    }
    function releaseWorker(wk) { wk.busy = false; wk.prog = 0; wk.page = null; }
    /** 這張圖正在辨識的那一段做了多少（0～1） */
    const ocrPart = (P) => Math.min(0.99, loc.workers.concat(pd.workers).reduce((n, w) => n + (w.busy && w.page === P ? w.prog : 0), 0));

    /* ---------- 免費模式的認字：PaddleOCR（背景執行緒，同時開幾個；載入失敗才用 Tesseract） ---------- */
    const pd = { workers: [], ready: null, ok: false, langP: {}, langOk: {}, failed: '', gen: 0, queue: [] };
    /** 開一個背景執行緒（網站不允許時改用網頁自己的 Worker） */
    function pdWorker(code) {
      let w = null;
      try { w = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))); } catch (_) {
        w = new PAGE.Worker(PAGE.URL.createObjectURL(new PAGE.Blob([code], { type: 'text/javascript' })));
      }
      const wk = { w, busy: false, page: null, prog: 0, waits: new Map(), next: 1, dead: null };
      wk.die = (err) => {
        if (wk.dead) return;
        wk.dead = err;
        for (const cb of wk.waits.values()) cb.reject(err);
        wk.waits.clear();
        try { w.terminate(); } catch (_) { /* 已結束 */ }
      };
      w.onmessage = (e) => {
        const m = e.data || {};
        const cb = wk.waits.get(m.id);
        if (!cb) return;
        if (m.type === 'progress') { if (cb.prog) cb.prog(m.frac); return; }
        wk.waits.delete(m.id);
        if (m.type === 'error') cb.reject(new Error(m.message || '文字辨識失敗')); else cb.resolve(m);
      };
      w.onerror = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        wk.die(new Error('文字辨識程式無法執行' + (e && e.message ? `（${e.message}）` : '')));
      };
      /** 送出一件工作；太久沒回應就當作壞掉 */
      wk.call = (msg, prog, ms) => new Promise((resolve, reject) => {
        if (wk.dead) { reject(wk.dead); return; }
        const id = wk.next++;
        const t = setTimeout(() => wk.die(new Error('文字辨識程式沒有回應')), ms || 120000);
        const end = (fn) => (v) => { clearTimeout(t); fn(v); };
        wk.waits.set(id, { resolve: end(resolve), reject: end(reject), prog });
        w.postMessage(Object.assign({ id }, msg));
      });
      return wk;
    }
    /** 認字程式和這個語言的模型準備好（第一次要下載，之後從 IndexedDB 讀；要下載的檔案一起下載） */
    function pdReady(lang, P) {
      if (pd.ok && pd.langOk[lang]) return Promise.resolve();
      const gen = pd.gen;
      const a = MT_PD[lang];
      const need = [];
      if (!pd.ready) need.push(MT_PD.ort, MT_PD.wasm, MT_PD.det);
      if (!pd.langP[lang]) need.push(a, a.dict);
      if (need.length) {
        Object.assign(loc, { status: '準備文字辨識', prog: 0 });
        // 進度：幾個檔案合起來算
        const got = need.map(() => 0);
        const total = need.reduce((n, x) => n + x.size, 0);
        const get = (x) => mtPdAsset(x, (f) => {
          if (gen !== pd.gen) return;
          got[need.indexOf(x)] = Math.min(1, f) * x.size;
          Object.assign(loc, { status: '下載文字辨識模型', prog: Math.min(0.99, got.reduce((n, v) => n + v, 0) / total) });
          bump();
          setStatus();
        });
        const preparing = () => { if (gen === pd.gen) { Object.assign(loc, { status: '準備文字辨識', prog: 0 }); setStatus(); } };
        if (!pd.ready) {
          const files = Promise.all([get(MT_PD.ort), get(MT_PD.wasm), get(MT_PD.det)]);
          pd.ready = (async () => {
            const [ort, wasm, det] = await files;
            if (gen !== pd.gen) throw mtErr('cancel');
            preparing();
            const code = mtOrtClassic(new TextDecoder().decode(ort.buf)) + '\n;(' + mtPaddleWorker.toString() + ')();\n';
            const list = [];
            try {
              for (let i = 0; i < MT_PD_N; i++) list.push(pdWorker(code));
              await Promise.all(list.map(async (wk) => {
                await wk.call({ type: 'init', wasm: wasm.buf }, null, 60000);
                await wk.call({ type: 'model', key: 'det', bytes: det.buf }, null, 60000);
              }));
            } catch (e) { list.forEach((wk) => wk.die(e)); throw e; }
            if (gen !== pd.gen) { list.forEach((wk) => wk.die(mtErr('cancel'))); throw mtErr('cancel'); }
            pd.workers = list;
          })();
          pd.ready.then(() => { if (gen === pd.gen) pd.ok = true; }, () => { if (gen === pd.gen) pd.ready = null; });
        }
        if (!pd.langP[lang]) {
          const files = Promise.all([get(a), get(a.dict)]);
          pd.langP[lang] = (async () => {
            const [m, d] = await files;
            await pd.ready;
            if (gen !== pd.gen) throw mtErr('cancel');
            preparing();
            const txt = new TextDecoder().decode(d.buf);
            const dict = /\.json$/.test(d.url) ? JSON.parse(txt).characters : txt;
            await Promise.all(pd.workers.map((wk) => wk.call({ type: 'model', key: lang, bytes: m.buf, dict }, null, 60000)));
          })();
          pd.langP[lang].then(() => { if (gen === pd.gen) pd.langOk[lang] = true; }, () => { if (gen === pd.gen) delete pd.langP[lang]; });
        }
      }
      const p = Promise.all([pd.ready, pd.langP[lang]]);
      // 下載、準備中：狀態列和圖上顯示進度
      if (P) step(P, '準備文字辨識');
      if (!loc.making) {
        loc.making = p;
        const clear = () => { if (loc.making === p) { Object.assign(loc, { making: null, status: '', prog: 0 }); setStatus(); } };
        p.then(clear, clear);
      }
      return p;
    }
    /** 拿一個閒著的認字程式（都在忙就排隊） */
    async function pdTake() {
      for (;;) {
        pd.workers = pd.workers.filter((w) => !w.dead);
        if (!pd.workers.length) throw Object.assign(new Error('文字辨識程式停止了'), { setup: true });
        const wk = pd.workers.find((w) => !w.busy);
        if (wk) { Object.assign(wk, { busy: true, prog: 0 }); return wk; }
        await orCancel(new Promise((r) => pd.queue.push(r)));
      }
    }
    function pdRelease(wk) {
      Object.assign(wk, { busy: false, page: null, prog: 0 });
      const r = pd.queue.shift();
      if (r) r();
    }
    /** 一段圖：找字＋認字（同一段圖換語言再認時，不用重新找字） */
    async function pdRun(s, lang, P) {
      const prev = P && P.step;
      try {
        await orCancel(pdReady(lang, P));
      } catch (e) {
        if (e && e.kind === 'cancel') throw e;
        throw Object.assign(e instanceof Error ? e : new Error(String(e)), { setup: true });
      }
      if (P && prev && P.step === '準備文字辨識') step(P, prev);
      const wk = await pdTake();
      wk.page = P;
      try {
        const r = await orCancel(wk.call({ type: 'ocr', blob: s.blob, rec: lang, boxes: s.boxes || null, opts: {} }, (f) => { wk.prog = f; bump(); }));
        s.boxes = r.boxes;
        return mtPaddleGroups(r.lines, lang);
      } finally { pdRelease(wk); }
    }
    /** PaddleOCR 不能用（網站擋住、下載不到）：改用 Tesseract；按「重試」時會再試一次 */
    function pdFail(e) {
      if (pd.failed) return;
      pd.failed = String((e && e.message) || e || '');
      console.warn('[MAOBOO] PaddleOCR 載入失敗，改用 Tesseract', e);
      pd.workers.forEach((wk) => wk.die(new Error('停止')));
      pd.workers = [];
      tell('pd-failed', '新的文字辨識（PaddleOCR）在這個網站載入失敗，先改用舊的辨識方式，準確度會差一些。可以按狀態列的「重試」再試一次。', { title: '漫畫翻譯' });
    }
    function pdReset() {
      pd.gen++;
      mtPdLoading.clear(); // 卡住的下載不要再等，重新下載
      pd.workers.forEach((wk) => wk.die(mtErr('cancel')));
      Object.assign(pd, { workers: [], ready: null, ok: false, langP: {}, langOk: {}, failed: '' });
      pd.queue.splice(0).forEach((r) => r());
    }

    async function ocrRun(s, lang, plan, P) {
      s.ocr = s.ocr || {};
      if (s.ocr[lang]) return s.ocr[lang]; // 判斷語言時已經辨識過
      // 先用 PaddleOCR；網站不允許、下載不到時才用 Tesseract
      if (!pd.failed && s.blob) {
        try {
          const groups = await pdRun(s, lang, P);
          s.ocr[lang] = groups;
          bump();
          return groups;
        } catch (e) {
          if (e && e.kind === 'cancel') throw e;
          if (e && e.setup) pdFail(e); else console.warn('[MAOBOO] PaddleOCR 這一段失敗，改用 Tesseract', e);
        }
      }
      const scale = plan.W < 800 ? 1.5 : 1;
      if (!s.clean) {
        const bmp = await createImageBitmap(s.blob);
        try {
          s.clean = mtOcrClean(bmp, plan.W, s.y1 - s.y0, scale, false);
          // 深色底的白字（旁白框、黑色對話框、有外框的白字）：反過來再辨識一次（用原本大小，比較快）
          if (s.clean.darkRatio > 0.06) {
            const inv = mtOcrClean(bmp, plan.W, s.y1 - s.y0, 1, true);
            if (inv.kept >= 8) s.cleanInv = inv;
          }
        } finally { if (typeof bmp.close === 'function') bmp.close(); }
      }
      const wk = await takeWorker(lang, P);
      wk.page = P;
      try {
        const { data } = await orCancel(wk.w.recognize(s.clean, {}, { blocks: true, text: false }));
        let groups = mtOcrGroups(data, lang, scale);
        if (s.cleanInv) {
          const r2 = await orCancel(wk.w.recognize(s.cleanInv, {}, { blocks: true, text: false }));
          groups = mtMergeGroups(groups, mtOcrGroups(r2.data, lang, 1));
        }
        s.ocr[lang] = groups;
        bump();
        return groups;
      } finally { releaseWorker(wk); }
    }
    /**
     * 免費模式要先知道原文語言：設定 > 網站 > 這個網站之前測到的 > 實際試試看。
     * 實際測試時一片一片試（第一片常常是翻譯組的說明或沒有字），測到有把握才記住；
     * 整張圖都測不出來就當作沒有字，不硬翻出亂碼。
     */
    let hostLang = null; // 正在判斷這部漫畫語言的那一張
    // 同一個網站可能有不同語言的漫畫（例如 nhentai）：語言記在「網站＋前兩層路徑」（同一部作品）
    const seriesKey = () => HOST + '/' + location.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
    function imageLang(P, slices, plan) {
      const set = cfg().ocrLang;
      if (set && set !== 'auto') return Promise.resolve(set);
      const known = mtHostLang() || (store.get('mt.lang', {}) || {})[seriesKey()];
      if (known) return Promise.resolve(known);
      if (P.langP) return P.langP;
      // 同一個網站一次只判斷一張，其他張等它的結果（那張沒有字才自己判斷）
      if (hostLang && hostLang.P !== P) {
        P.langP = hostLang.p.then((l) => l || detectLang(P, slices, plan), () => detectLang(P, slices, plan));
        return P.langP;
      }
      P.langP = detectLang(P, slices, plan);
      const mine = { P, p: P.langP };
      hostLang = mine;
      const clear = () => { if (hostLang === mine) hostLang = null; };
      P.langP.then((l) => { if (!l) clear(); }, clear);
      return P.langP;
    }
    function detectLang(P, slices, plan) {
      return ocrQ(P, async () => {
        step(P, '判斷原文語言');
        let best = null;
        let bestScore = 0;
        // 先試這個網站上次的語言：猜對的話，這次辨識的結果直接拿來用，不多花時間
        const last = (store.get('mt.lang', {}) || {})[HOST];
        const order = [...new Set([last, 'eng', 'kor', 'jpn'].filter((l) => MT_LANG[l]))];
        for (const s of slices) {
          for (let k = 0; k < order.length; k++) {
            const lang = order[k];
            let groups = [];
            try { groups = await ocrRun(s, lang, plan, P); } catch (e) { if (lang === 'eng') throw e; continue; }
            // 找到的字框大多是直的（多半是日文漫畫）：接下來先試日文
            const bx = s.boxes || [];
            if (k === 0 && bx.length >= 2 && bx.filter((b) => b.y1 - b.y0 >= (b.x1 - b.x0) * 1.5).length * 2 >= bx.length && order.indexOf('jpn') > 1) {
              order.splice(order.indexOf('jpn'), 1);
              order.splice(1, 0, 'jpn');
            }
            const score = groups.reduce((n, g) => n + g.text.replace(/\s/g, '').length, 0) * (lang === 'eng' ? 1 : 2);
            if (score > bestScore) { best = lang; bestScore = score; }
            if (score >= 16) break; // 這個語言辨識得很順，就不用再試其他語言
          }
          if (bestScore >= 16) break;
        }
        if (bestScore >= 8) {
          const map = Object.assign({}, store.get('mt.lang', {}) || {});
          const sk = seriesKey();
          delete map[sk];
          map[sk] = best;
          map[HOST] = best;
          const keys = Object.keys(map);
          if (keys.length > 300) keys.slice(0, keys.length - 300).forEach((k) => { if (k !== HOST) delete map[k]; });
          store.set('mt.lang', map);
        }
        return bestScore >= 4 ? best : null;
      });
    }
    /** 一段圖：辨識文字，再用 Google 翻譯（馬上就能顯示） */
    async function localSlice(P, s, plan, alive, slices) {
      const lang = await imageLang(P, slices, plan);
      if (!lang) return [];
      P.lang = lang;
      return ocrQ(P, async () => {
        if (!alive()) throw mtErr('cancel');
        step(P, `辨識文字 ${Math.min(P.done + 1, P.total)}/${P.total} 段`);
        const groups = await ocrRun(s, lang, plan, P);
        if (!groups.length) return [];
        const zh = await mtFreeTranslate(groups.map((g) => g.text), lang);
        const sh = s.y1 - s.y0;
        P.engines.add('free');
        return groups.map((g, i) => ({
          x0: g.x0 / plan.W,
          x1: g.x1 / plan.W,
          y0: (s.y0 + g.y0) / plan.H,
          y1: (s.y0 + g.y1) / plan.H,
          zh: mtCleanZh(zh[i]),
          src: g.text,
          lang: MT_LANG[lang],
          vertical: g.vertical,
          edge: (s.y0 > 0 && g.y0 < 6) || (s.y1 < plan.H && g.y1 > sh - 6),
        })).filter((b, i) => b.zh && b.zh !== groups[i].text);
      });
    }
    /** 使用者剛按過按鈕：Google 翻譯連不上時，趁這時候準備 Chrome 離線翻譯（第一次要下載語言，必須由使用者操作觸發） */
    function warmLocal() {
      if (!mtGtxFailed) return;
      const set = cfg().ocrLang;
      const lang = (set && set !== 'auto' ? set : '') || mtHostLang() || (store.get('mt.lang', {}) || {})[HOST] || 'eng';
      mtChromeTranslator(MT_LANG[lang] || 'en');
    }

    /* ---------- Gemini 修正：只送認出來的文字（不送圖片），很多張圖合成一次，省次數 ---------- */
    const fq = { jobs: [], active: 0, soon: 0, wake: 0, waitUntil: 0, pumping: false, again: false };
    const FIX_LINES = 60; // 一次最多幾行
    const FIX_CHARS = 5000;
    const fixLines = (P) => P.blocks.filter((b) => b.src);
    function fixEnqueue(P) {
      if (!fixLines(P).length || fq.jobs.some((j) => j.P === P)) return;
      P.fix = 'wait';
      fq.jobs.push({ P, gen: P.gen, t: Date.now(), tries: 0 });
      fixSoon(0);
      setStatus();
    }
    function fixSoon(ms2) {
      if (fq.soon) return;
      fq.soon = later(() => { fq.soon = 0; fixPump(); }, ms2);
    }
    async function fixPump() {
      if (stopped) return;
      if (fq.pumping) { fq.again = true; return; }
      fq.pumping = true;
      try {
        await ensureChain();
        while (!stopped && fq.jobs.length && fq.active < 2) {
          fq.jobs = fq.jobs.filter((j) => {
            if (j.gen === j.P.gen) return true;
            if (j.P.fix === 'wait') j.P.fix = '';
            return false;
          });
          if (!fq.jobs.length) break;
          const st = mtEngineState(cfg());
          if (st.kind !== 'gemini') {
            for (const j of fq.jobs.splice(0)) j.P.fix = '';
            onFallback(st);
            setStatus();
            break;
          }
          const pr = new Map();
          const pOf = (P) => { if (!pr.has(P)) pr.set(P, prioOf(P)); return pr.get(P); };
          fq.jobs.sort((a, b) => (pOf(a.P) - pOf(b.P)) || (a.P.order - b.P.order));
          const hp = pOf(fq.jobs[0].P);
          const lines = fq.jobs.reduce((n, j) => n + fixLines(j.P).length, 0);
          const oldest = Math.min(...fq.jobs.map((j) => j.t));
          // 不是畫面上的圖：等後面幾張也認完字，湊成一次送（省每天的次數）
          if (hp >= 1 && lines < FIX_LINES * 0.6 && (prepQ.pending() || ocrQ.pending()) && Date.now() - oldest < 8000) { fixSoon(700); break; }
          const pick = pickModel(hp);
          if (!pick.model) {
            fq.waitUntil = Date.now() + pick.wait;
            unlater(fq.wake);
            fq.wake = later(() => { fq.wake = 0; fixPump(); }, Math.min(Math.max(pick.wait, 200) + 50, 90000));
            setStatus();
            break;
          }
          fq.waitUntil = 0;
          const batch = [];
          let n = 0;
          let chars = 0;
          while (fq.jobs.length) {
            const ls = fixLines(fq.jobs[0].P);
            const c = ls.reduce((k, b) => k + b.src.length, 0);
            if (batch.length && (n + ls.length > FIX_LINES || chars + c > FIX_CHARS)) break;
            batch.push(fq.jobs.shift());
            n += ls.length;
            chars += c;
          }
          batch.forEach((j) => { j.P.fix = 'busy'; });
          const s = ms(pick.model);
          s.active++;
          s.times.push(Date.now());
          fq.active++;
          setStatus();
          runFix(pick.model, batch).catch((e) => console.error('[MAOBOO] 漫畫翻譯（修正）', e)).finally(() => { fq.active--; s.active--; fixPump(); });
        }
      } finally {
        fq.pumping = false;
        if (fq.again) { fq.again = false; fixSoon(0); }
      }
    }
    async function runFix(model, batch) {
      const t0 = Date.now();
      const lines = [];
      for (const j of batch) {
        const ls = fixLines(j.P).slice().sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));
        for (const b of ls) lines.push({ j, b });
      }
      const LN = { en: 'English', ja: 'Japanese', ko: 'Korean' };
      const langs = [...new Set(lines.map((l) => LN[l.b.lang]).filter(Boolean))];
      const text = [
        contextText(),
        langs.length ? `Original language: ${langs.join(', ')}` : '',
        'Lines:',
        ...lines.map((l, i) => `${i + 1}. ${l.b.src.replace(/\s+/g, ' ')}`),
      ].filter(Boolean).join('\n');
      const applied = new Set();
      const touched = new Set();
      const apply = (got) => {
        for (const it of got) {
          const i = Math.round(Number(it && it.id)) - 1;
          const l = lines[i];
          if (!l || applied.has(i) || l.j.gen !== l.j.P.gen) continue;
          applied.add(i);
          const zh = mtCleanZh(it.zh);
          if (zh) { l.b.zh = zh; l.b.fixed = true; } else l.j.P.blocks = l.j.P.blocks.filter((b) => b !== l.b); // 不是對話（雜訊、浮水印）：拿掉
          touched.add(l.j.P);
        }
        touched.forEach((P) => render(P));
        touched.clear();
        bump();
        setStatus();
      };
      let items;
      try {
        items = await geminiCall(model, [{ type: 'text', text }], apply, { system: mtFixPrompt(cfg().sfx === 'translate'), schema: MT_FIX_SCHEMA, timeout: 90000 });
      } catch (e) { onFixError(model, batch, e); return; }
      apply(items);
      remember(items);
      for (const j of batch) {
        if (j.gen !== j.P.gen) continue;
        j.P.fix = 'done';
        j.P.engines.add('fix');
        if (j.P.w0) cachePut(j.P, 'free', j.P.w0, j.P.h0, false, true);
      }
      const s = ms(model);
      s.lat = s.lat * 0.6 + (Date.now() - t0) * 0.4;
      setStatus();
    }
    function onFixError(model, batch, e) {
      const now = Date.now();
      const h = kh();
      const back = () => { batch.forEach((j) => { j.P.fix = 'wait'; }); fq.jobs.unshift(...batch); };
      if (e.kind === 'rate') {
        mtSetBlock(h, model, now + Math.max(4000, e.delay || 30000), 'rate');
        setRpm(model, rpmOf(model) * 0.7);
        back();
      } else if (e.kind === 'daily') {
        mtSetBlock(h, model, e.nofree ? now + 3 * 86400000 : mtNextReset(now), e.nofree ? 'nofree' : 'daily');
        back();
      } else if (e.kind === 'model') {
        mtSetBlock(h, model, now + 3 * 86400000, 'missing');
        back();
      } else if (e.kind === 'key' || e.kind === 'region') {
        markBad(h, e);
        batch.forEach((j) => { j.P.fix = ''; });
      } else {
        // 網路、忙碌、讀不懂：再試一次；內容被擋就不再試。都先留著 Google 的翻譯
        const keep = e.kind === 'blocked' ? [] : batch.filter((j) => ++j.tries <= 1);
        batch.filter((j) => !keep.includes(j)).forEach((j) => { j.P.fix = 'fail'; });
        if (keep.length) { keep.forEach((j) => { j.P.fix = 'wait'; }); fq.jobs.unshift(...keep); mtSetBlock(h, model, now + 3000, 'rate'); }
        console.warn('[MAOBOO] Gemini 修正失敗', model, e.kind, e.message);
      }
      setStatus();
    }

    /* ---------- 翻譯一張圖 ---------- */
    const mode = () => (cfg().mode === 'accurate' ? 'accurate' : 'fast');
    async function translateP(P) {
      if (stopped || P.state === 'busy') return;
      const gen = ++P.gen;
      Object.assign(P, { state: 'busy', blocks: [], done: 0, total: 0, error: '', note: '', step: '排隊中', fix: '', engines: new Set(), started: Date.now(), langP: null, queued: true });
      render(P);
      bump();
      setStatus();
      const alive = () => !stopped && P.gen === gen;
      try {
        const st0 = mtEngineState(cfg());
        const fast = mode() === 'fast';
        const hit = cacheGet(P);
        // 快速模式：有翻過就用；精準模式：免費模式翻的只在 Gemini 不能用（或 Gemini 拒絕這張圖）時沿用
        if (hit && (fast || hit.m !== 'free' || hit.blk || st0.kind !== 'gemini')) {
          if (hit.m) P.engines.add(hit.m);
          if (hit.fx) P.engines.add('fix');
          Object.assign(P, { blocks: hit.blocks, state: 'done', done: 1, total: 1, step: '', w0: hit.w, h0: hit.h, fix: hit.fx ? 'done' : '' });
          render(P);
          if (fast && hit.m === 'free' && !hit.fx && st0.kind === 'gemini') fixEnqueue(P); // 上次還沒修正完
          setStatus();
          return;
        }
        const useImage = !fast && st0.kind === 'gemini';
        const job = await prepQ(P, async () => {
          if (!alive()) return null;
          step(P, '讀取圖片');
          const img = [...P.els].find((i) => i.isConnected && i.complete && i.naturalWidth && mtAbs(i.currentSrc) === P.url) || null;
          const bmp = await mtCaptureUrl(P.url, img, P.noRef || pg.noRefDirs.has(mtDirOf(P.url)));
          try {
            if (bmp.width < 200 || bmp.height < 200) return { small: true };
            if (!P.els.size && pg.minW && bmp.width < pg.minW * 0.5) return { small: true }; // 背景找到的縮圖
            const plan = mtPlanSlices(bmp);
            const slices = [];
            for (let i = 0; i < plan.cuts.length; i++) slices.push(await mtSliceImage(bmp, plan, i, !useImage));
            // 要送 Gemini 的話，先轉好編碼（準備完才算準備好，畫面上的圖才會排在最前面送出）
            if (useImage) await Promise.all(slices.map(async (sl) => { sl.b64 = await mtBase64(sl.blob); }));
            return { plan, slices };
          } finally { if (typeof bmp.close === 'function') bmp.close(); }
        });
        if (!alive()) return;
        if (!job || job.small) { Object.assign(P, { state: 'skip', note: '', step: '' }); setStatus(); return; } // 不是漫畫頁（太小）
        const { plan, slices } = job;
        P.w0 = plan.W0;
        P.h0 = plan.H0;
        const st = mtEngineState(cfg());
        const useGemini = useImage && st.kind === 'gemini';
        if (!useGemini && (!fast || st.kind !== 'gemini')) onFallback(st);
        P.total = slices.length;
        step(P, useGemini ? `Gemini 翻譯 0/${P.total} 段` : `辨識文字 0/${P.total} 段`);
        let allGemini = useGemini;
        let refused = false;
        let failed = 0;
        let lastErr = null;
        let jobs = null;
        if (useGemini) {
          await Promise.all(slices.map(async (s) => { if (!s.b64) s.b64 = await mtBase64(s.blob); }));
          if (!alive()) return;
          jobs = gEnqueueAll(P, slices, (s, got) => { if (alive()) { addBlocks(P, mapGemini(got, s, plan)); bump(); setStatus(); } });
        }
        await Promise.all(slices.map(async (s, idx) => {
          let blocks = null;
          try {
            if (jobs) {
              try {
                const r = await jobs[idx].promise;
                blocks = mapGemini(jobs[idx].items, s, plan);
                P.engines.add(r.model);
              } catch (e) {
                if (e && e.kind === 'cancel') return;
                if (e && e.kind === 'blocked') refused = true;
                allGemini = false;
                blocks = await localSlice(P, s, plan, alive, slices);
              }
            } else blocks = await localSlice(P, s, plan, alive, slices);
          } catch (e) {
            if (e && e.kind === 'cancel') return;
            failed++;
            lastErr = e;
            allGemini = false;
          }
          // 這一段處理完：放掉圖片資料，整話先翻時才不會佔太多記憶體
          s.blob = null;
          s.b64 = null;
          s.clean = null;
          s.cleanInv = null;
          if (!alive()) return;
          if (blocks && blocks.length) addBlocks(P, blocks);
          P.done++;
          step(P, `${useGemini ? 'Gemini 翻譯' : '辨識文字'} ${P.done}/${P.total} 段`);
        }));
        if (!alive()) return;
        if (failed === slices.length) throw lastErr || new Error('翻譯失敗');
        P.state = 'done';
        P.step = '';
        P.error = failed ? mtErrText(lastErr) : '';
        if (!failed) cachePut(P, allGemini ? ([...P.engines].find((m) => m !== 'free') || 'gemini') : 'free', plan.W0, plan.H0, refused, false);
        // 快速模式：Google 的譯文已經顯示了，再請 Gemini 依前後文修正（只送文字）
        if (fast && !allGemini && mtEngineState(cfg()).kind === 'gemini') fixEnqueue(P);
      } catch (e) {
        if (!alive() || (e && e.kind === 'cancel')) return;
        if (P.guess) { Object.assign(P, { state: 'skip', note: '', step: '' }); setStatus(); return; } // 猜的下一頁網址不存在
        P.state = 'error';
        P.step = '';
        P.error = mtErrText(e);
        console.warn('[MAOBOO] 漫畫翻譯失敗', e);
      }
      P.note = '';
      bump();
      render(P);
      setStatus();
    }

    /* ---------- 譯文位置校正 ---------- */
    const visibleOv = new Set();
    const ovIO = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const V = views.get(en.target);
        if (!V) continue;
        if (en.isIntersecting && V.overlay) { visibleOv.add(V); V.overlay.align(); } else visibleOv.delete(V);
      }
    }, { rootMargin: '50% 0px 50% 0px' });
    const ro = new ResizeObserver((entries) => {
      for (const en of entries) { const V = views.get(en.target); if (V && V.overlay) V.overlay.align(); }
    });
    let alignRaf = 0;
    function alignSoon() {
      if (alignRaf || stopped) return;
      alignRaf = requestAnimationFrame(() => {
        alignRaf = 0;
        visibleOv.forEach((V) => { if (!V.overlay || !V.overlay.align()) visibleOv.delete(V); });
        if (hoverImg) placeHover();
      });
    }
    // 圖片換了（換頁式閱讀器、延遲載入換上真的網址）：重新對應到正確的翻譯
    const srcMo = new MutationObserver((muts) => {
      const seen = new Set();
      for (const m of muts) {
        const img = m.target;
        if (seen.has(img) || img.tagName !== 'IMG') continue;
        seen.add(img);
        if (!views.has(img) && !pg.on) continue;
        const V = bindImg(img);
        if (V && pg.on) queueP(V.P);
      }
    });
    let pruneAt = 0;
    let alignTimer = 0;
    let watching = false;
    /** 這一頁第一次開始翻譯時才監看捲動、版面和圖片變化，平常瀏覽其他網站不佔資源 */
    function watchPage() {
      if (watching || stopped) return;
      watching = true;
      listen(document, 'scroll', alignSoon, { capture: true, passive: true });
      listen(PAGE, 'resize', alignSoon, { passive: true });
      alignTimer = setInterval(() => {
        if (visibleOv.size) alignSoon();
        if (Date.now() - pruneAt > 5000) {
          pruneAt = Date.now();
          for (const V of [...views.values()]) if (!V.img.isConnected) unbind(V);
        }
      }, 700);
      srcMo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['src', 'srcset', 'data-src', 'data-srcset', 'data-original', 'data-lazy-src'] });
      listen(document, 'load', (e) => {
        const img = e.target;
        if (!img || img.tagName !== 'IMG') return;
        if (views.has(img) || pg.on) {
          const V = bindImg(img);
          if (V && V.P.blocks.length) render(V.P); // 延遲載入的圖剛載入：馬上蓋上先翻好的譯文
        }
        if (pg.on && !pg.scanT) pg.scanT = later(() => { pg.scanT = 0; pageScan(); }, 300);
      }, true);
    }

    /* ---------- 滑到圖片上出現的按鈕 ---------- */
    let hv = null;
    let hoverImg = null;
    let pt = null;
    let hoverRaf = 0;
    let hideT = 0;
    const stopEv = (e) => e.stopPropagation();
    function hoverEl() {
      if (hv) return hv;
      const r = ui();
      if (!r) return null;
      const main = h('button', { type: 'button', class: 'mt-main', onclick: (e) => { e.stopPropagation(); onMainClick(); } });
      const pageBtn = h('button', {
        type: 'button', text: '整頁', title: '翻譯這一話所有的圖（Alt+T），下面還沒看到的也會先翻好',
        onclick: (e) => { e.stopPropagation(); warmLocal(); pageToggle(true); },
      });
      const el = h('div', { class: 'mt-hover', role: 'group', 'aria-label': '漫畫翻譯' }, main, pageBtn);
      ['pointerdown', 'mousedown', 'mouseup', 'pointerup', 'dblclick'].forEach((t) => el.addEventListener(t, stopEv));
      r.root.append(el);
      hv = { el, main, pageBtn, img: null };
      return hv;
    }
    function eligible(img) {
      if (!img || img.tagName !== 'IMG' || !img.isConnected || !img.complete) return false;
      if (img.naturalWidth < 200 || img.naturalHeight < 200) return false;
      const r = img.getBoundingClientRect();
      return r.width >= 160 && r.height >= 160;
    }
    function imgAt(x, y) {
      let list = [];
      try { list = document.elementsFromPoint(x, y); } catch (_) { return null; }
      for (let i = 0; i < list.length && i < 8; i++) {
        if (ourHosts.has(list[i])) return null; // 被我們自己的面板、通知蓋住
        if (list[i].tagName === 'IMG') return eligible(list[i]) ? list[i] : null;
      }
      return null;
    }
    function onMove(e) {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      pt = { x: e.clientX, y: e.clientY, onBtn: !!hv && path.includes(hv.el), ours: inOurUi(e) };
      if (!hoverRaf) hoverRaf = requestAnimationFrame(checkHover);
    }
    function checkHover() {
      hoverRaf = 0;
      if (!pt || stopped) return;
      if (pt.onBtn && hoverImg) { unlater(hideT); hideT = 0; return; }
      const img = siteOn() && !pt.ours ? imgAt(pt.x, pt.y) : null;
      if (img) {
        unlater(hideT);
        hideT = 0;
        hoverImg = img;
        placeHover();
      } else if (hoverImg && !hideT) {
        hideT = later(() => { hideT = 0; hoverImg = null; placeHover(); }, 450);
      }
    }
    function placeHover() {
      if (!hoverImg && !hv) return;
      const v = hoverEl();
      if (!v) return;
      const img = hoverImg;
      if (!img || !img.isConnected || !siteOn()) { v.el.classList.remove('is-on'); v.img = null; return; }
      v.img = img;
      paintHover();
      const r = img.getBoundingClientRect();
      const vw = document.documentElement.clientWidth || innerWidth;
      const top = Math.max(r.top, 0) + 10;
      if (Math.min(r.bottom, innerHeight) - top < 44) { v.el.classList.remove('is-on'); return; }
      const w = v.el.offsetWidth || 120;
      const x = Math.max(Math.max(r.left, 0) + 8, Math.min(r.right, vw) - w - 10);
      v.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(top)}px)`;
      v.el.classList.add('is-on');
    }
    function paintHover() {
      if (!hv) return;
      const V = hv.img ? views.get(hv.img) : null;
      const P = V ? V.P : null;
      const st = P ? P.state : 'idle';
      let label = '翻譯';
      let title = '把這張圖裡的英文、日文、韓文翻成中文';
      if (st === 'busy') {
        label = loc.making && loc.status && /文字辨識/.test(P.step || '') ? `${loc.status}…` : (P.step || '翻譯中');
        title = '翻譯中，按一下取消';
      } else if (st === 'done') {
        label = shouldShow(P) ? '原文' : '譯文';
        title = shouldShow(P) ? '暫時顯示原文' : '顯示譯文';
        if (P.error) title += `（部分失敗：${P.error}）`;
      } else if (st === 'error') {
        label = '重試';
        title = P.error || '翻譯失敗，按一下重試';
      }
      hv.main.textContent = label;
      hv.main.title = title;
      hv.main.classList.toggle('is-busy', st === 'busy');
      hv.pageBtn.hidden = pg.on;
    }
    function onMainClick() {
      const img = hv && hv.img;
      if (!img) return;
      warmLocal();
      const V = views.get(img) || bindImg(img);
      if (!V) return;
      const P = V.P;
      if (P.state === 'busy') {
        if (Date.now() - P.started > 700) { P.userCancel = true; resetPage(P); } // 剛按下去的連點不算取消
      } else if (P.state === 'done') {
        if (pg.on && pg.hidden) { P.shown = true; pageShow(true); } else P.shown = !P.shown;
        render(P);
      } else {
        P.userCancel = false;
        translateP(P);
      }
      paintHover();
      placeHover();
    }

    /* ---------- 整頁翻譯：整話先下載、先翻好 ---------- */
    const pg = { on: false, hidden: false, mo: null, scanT: 0, perf: null, dirs: new Set(), noRefDirs: new Set(), scriptsAt: 0, liveT: 0, minW: 0 };
    const LIVE_MS = 30 * 60 * 1000;
    const liveAt = () => ((store.get('mt.live', {}) || {})[HOST] || 0);
    function liveSet(on) {
      const m = Object.assign({}, store.get('mt.live', {}) || {});
      const now = Date.now();
      for (const k of Object.keys(m)) if (now - m[k] > LIVE_MS) delete m[k];
      if (on) m[HOST] = now; else delete m[HOST];
      store.set('mt.live', m);
    }
    function queueP(P) {
      if (pg.on && !pg.hidden && P.state === 'idle' && !P.userCancel) translateP(P);
    }
    function eligibleLoaded(img) {
      if (!img.isConnected || !img.complete || img.naturalWidth < 200 || img.naturalHeight < 200) return false;
      const r = img.getBoundingClientRect();
      return r.width >= 160 && r.height >= 160;
    }
    /** 找出閱讀器裡的圖：和已經顯示的漫畫圖在同一個區塊裡的，包含還沒載入、隱藏中的 */
    function readerImages() {
      const all = [...document.images];
      const anchors = new Set(all.filter(eligibleLoaded));
      const box = new Set();
      for (const a of anchors) {
        let p = a.parentElement;
        for (let up = 0; p && up < 2; up++, p = p.parentElement) {
          if (p === document.body || p === document.documentElement) break;
          box.add(p);
        }
      }
      const inBox = (img) => {
        let p = img.parentElement;
        for (let up = 0; p && up < 2; up++, p = p.parentElement) if (box.has(p)) return true;
        return false;
      };
      let maxW = 0;
      for (const a of anchors) maxW = Math.max(maxW, a.getBoundingClientRect().width);
      // 已經顯示、但比最寬的漫畫圖窄很多的（旁邊的廣告、按鈕圖示）不算
      const narrow = (img) => {
        if (!img.complete || !img.naturalWidth) return false;
        const w = img.getBoundingClientRect().width;
        return w > 0 && w < maxW * 0.45; // 隱藏中的頁（寬度 0）不算
      };
      return all.filter((img) => (anchors.has(img) || inBox(img)) && !narrow(img));
    }
    function pageScan() {
      if (!pg.on || stopped) return;
      const list = readerImages();
      const bigs = [];
      for (const img of list) {
        const V = bindImg(img);
        if (!V) continue;
        if (eligibleLoaded(img)) {
          const d = mtDirOf(V.P.url);
          if (d) { pg.dirs.add(d); if (img.referrerPolicy === 'no-referrer') pg.noRefDirs.add(d); }
          const r = img.getBoundingClientRect();
          if (r.width >= 300 && r.height >= 300) bigs.push(img);
          pg.minW = pg.minW ? Math.min(pg.minW, img.naturalWidth) : img.naturalWidth;
        }
        queueP(V.P);
      }
      if (bigs.length === 1) guessNext(bigs[0]); // 一次只顯示一張圖的閱讀器
      scanScripts();
      setStatus();
    }
    /** 圖庫裡同一個資料夾的其他圖（閱讀器預先載入的下一頁、頁面程式裡的圖片清單）也先翻 */
    function considerUrl(u, guess) {
      if (!pg.on || !u || !/^https?:/i.test(u)) return;
      const d = mtDirOf(u);
      if (!d || !pg.dirs.has(d) || !/\.(jpe?g|png|webp|avif|gif|bmp)(?:[?#]|$)/i.test(u)) return;
      const k = mtUrlKey(u);
      let P = pages.get(k);
      if (!P) { P = getPage(u); P.guess = !!guess; }
      queueP(P);
    }
    function watchResources() {
      if (pg.perf || typeof PerformanceObserver !== 'function') return;
      try {
        pg.perf = new PerformanceObserver((list) => { for (const e of list.getEntries()) considerUrl(e.name, false); });
        pg.perf.observe({ type: 'resource', buffered: true });
      } catch (_) { pg.perf = null; }
    }
    function scanScripts() {
      if (!pg.dirs.size || Date.now() - pg.scriptsAt < 3000) return;
      pg.scriptsAt = Date.now();
      let budget = 3e6;
      for (const sc of document.scripts) {
        if (sc.src) continue;
        const t = sc.textContent || '';
        if (!t) continue;
        budget -= t.length;
        if (budget < 0) break;
        const re = /https?:(?:\\?\/){2}[^"'\s<>()]+?\.(?:jpe?g|png|webp|avif)(?:\?[^"'\s<>()]*)?/gi;
        let m;
        while ((m = re.exec(t))) considerUrl(m[0].replace(/\\\//g, '/'), false);
      }
    }
    /** 一頁一張圖、檔名是流水號（例如 2.webp）的翻頁式閱讀器：先翻後面幾頁 */
    function guessNext(img) {
      const V = views.get(img);
      if (!V || !eligibleLoaded(img)) return;
      const m = /^(.*\/)(\d+)(\.(?:jpe?g|png|webp|avif|gif))(\?.*)?$/i.exec(V.P.url);
      if (!m) return;
      const n = parseInt(m[2], 10);
      for (let k = 1; k <= 3; k++) considerUrl(m[1] + String(n + k).padStart(m[2].length, '0') + m[3] + (m[4] || ''), true);
    }
    function pageStart() {
      if (pg.on) return;
      pg.on = true;
      pg.hidden = false;
      watchPage();
      pageScan();
      pg.mo = new MutationObserver(() => { if (!pg.scanT) pg.scanT = later(() => { pg.scanT = 0; pageScan(); }, 500); });
      pg.mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
      watchResources();
      if (!nearOn) { nearOn = true; listen(PAGE, 'pointermove', onNear, { passive: true }); }
      liveSet(true);
      pg.liveT = setInterval(() => { if (!stopped) liveSet(true); }, 120000);
      showAll();
      afterPageChange();
    }
    function pageShow(show) {
      pg.hidden = !show;
      showAll();
      if (show) for (const P of pages.values()) queueP(P);
      afterPageChange();
    }
    function pageStop() {
      pg.on = false;
      pg.hidden = false;
      if (pg.mo) pg.mo.disconnect();
      if (pg.perf) { try { pg.perf.disconnect(); } catch (_) { /* 已停止 */ } }
      clearInterval(pg.liveT);
      unlater(pg.scanT);
      Object.assign(pg, { mo: null, perf: null, scanT: 0, liveT: 0 });
      liveSet(false);
      for (const P of pages.values()) resetPage(P);
      for (const V of views.values()) dropOverlay(V);
      afterPageChange();
    }
    function pageToggle(force) {
      if (!pg.on) pageStart();
      else if (force === true) { if (pg.hidden) pageShow(true); }
      else pageShow(pg.hidden);
    }
    function afterPageChange() {
      chip(true);
      fabSync();
      renderMenu();
      placeHover();
    }

    /* ---------- 自動開始：設定成自動，或這個網站剛開過整頁翻譯（換頁會重新載入的網站） ---------- */
    let autoT = 0;
    function autoWanted() {
      return (cfg().auto === 'on' && siteOn()) || Date.now() - liveAt() < LIVE_MS;
    }
    function autoCheck() {
      if (pg.on || stopped || !autoWanted()) return true;
      const big = [...document.images].filter((i) => eligibleLoaded(i) && i.getBoundingClientRect().width >= 300);
      // 要看起來像閱讀頁（很寬的圖，或好幾張長圖）才開始，首頁、列表頁的封面不翻
      const reader = big.some((i) => i.getBoundingClientRect().width >= Math.min(560, innerWidth * 0.4)) || big.filter((i) => i.naturalHeight >= 600).length >= 2;
      if (reader) { pageStart(); return true; }
      return false;
    }
    function autoWatch() {
      unlater(autoT);
      if (!autoWanted()) return;
      const until = Date.now() + 60000;
      const tick = () => { if (!autoCheck() && Date.now() < until) autoT = later(tick, 1000); };
      tick();
    }

    /* ---------- 狀態列：有工作時才出現、閒置後收起，並避開網站自己的按鈕 ---------- */
    let chipEl = null;
    let chipHideT = 0;
    let placeAt = 0;
    function fixedUi(el) {
      let clickable = false;
      for (let e = el, up = 0; e && e !== document.body && up < 8; e = e.parentElement, up++) {
        if (up < 4 && /^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL)$/.test(e.tagName)) clickable = true;
        if (up < 4 && /^(button|link|tab|menuitem|slider)$/.test(e.getAttribute && e.getAttribute('role'))) clickable = true;
        let cs = null;
        try { cs = getComputedStyle(e); } catch (_) { return false; }
        if (cs.position === 'fixed' || cs.position === 'sticky') {
          const r = e.getBoundingClientRect();
          // 佔滿畫面的閱讀器容器本身不算，裡面的按鈕、連結才算
          return !(r.width > innerWidth * 0.6 && r.height > innerHeight * 0.6) || clickable;
        }
      }
      return false;
    }
    function siteUiAt(x, y, w, hh) {
      const pts = [[x + 6, y + 6], [x + w - 6, y + 6], [x + 6, y + hh - 6], [x + w - 6, y + hh - 6], [x + w / 2, y + hh / 2]];
      for (const [px, py] of pts) {
        let list = [];
        try { list = document.elementsFromPoint(px, py); } catch (_) { continue; }
        for (const el of list) {
          if (ourHosts.has(el) || el.tagName === 'MAOBOO-MT') continue;
          if (el === document.body || el === document.documentElement) break;
          if (fixedUi(el)) return true;
        }
      }
      return false;
    }
    /** 依序試左下、右下、右上、左上，放在沒有網站按鈕的角落 */
    function placeCorner(el, force) {
      if (!el || (!force && Date.now() - placeAt < 1500)) return;
      placeAt = Date.now();
      const w = el.offsetWidth || 260;
      const hh = el.offsetHeight || 40;
      const corners = [['left', 'bottom'], ['right', 'bottom'], ['right', 'top'], ['left', 'top']];
      let pick = corners[0];
      for (const c of corners) {
        const x = c[0] === 'left' ? 16 : innerWidth - 16 - w;
        const y = c[1] === 'bottom' ? innerHeight - 16 - hh : 16;
        if (!siteUiAt(x, y, w, hh)) { pick = c; break; }
      }
      el.style.left = pick[0] === 'left' ? '16px' : 'auto';
      el.style.right = pick[0] === 'right' ? '16px' : 'auto';
      el.style.top = pick[1] === 'top' ? '16px' : 'auto';
      el.style.bottom = pick[1] === 'bottom' ? '16px' : 'auto';
    }
    function counts() {
      const c = { done: 0, busy: 0, total: 0, err: 0, frac: 0, free: false, gem: false, fixWait: 0, fixBusy: 0, fixDone: 0 };
      for (const P of pages.values()) {
        if (!P.queued || P.state === 'skip' || P.state === 'idle') continue;
        c.total++;
        if (P.state === 'done') { c.done++; c.frac += 1; } else if (P.state === 'error') { c.err++; c.frac += 1; } else if (P.state === 'busy') {
          c.busy++;
          c.frac += P.total ? Math.min(1, (P.done + ocrPart(P)) / P.total) * 0.97 : 0.02;
        }
        if (P.fix === 'wait') c.fixWait++; else if (P.fix === 'busy') c.fixBusy++; else if (P.fix === 'done') c.fixDone++;
        for (const m of P.engines) { if (m === 'free') c.free = true; else if (m !== 'fix') c.gem = true; }
      }
      return c;
    }
    /** 第幾張（照網頁上的順序） */
    function pageNo(P) {
      let n = 1;
      for (const Q of pages.values()) if (Q.queued && Q.state !== 'skip' && Q.order < P.order) n++;
      return n;
    }
    const secs = (t) => Math.max(1, Math.ceil((t - Date.now()) / 1000));
    /** 現在在做什麼：畫面上的圖優先 */
    function activity(c) {
      if (loc.making && loc.status) return loc.status + (loc.prog > 0 && loc.prog < 1 ? ` ${Math.round(loc.prog * 100)}%` : '…');
      let cur = null;
      let cp = Infinity;
      for (const P of pages.values()) {
        if (P.state !== 'busy') continue;
        const p = prioOf(P);
        if (p < cp) { cp = p; cur = P; }
      }
      if (cur) {
        let t = `第 ${pageNo(cur)} 張：${cur.step || '翻譯中'}`;
        if (gq.waitUntil > Date.now() && /Gemini/.test(cur.step || '')) t += `（等 Gemini ${secs(gq.waitUntil)} 秒）`;
        return t;
      }
      if (c.fixBusy || c.fixWait) {
        if (fq.waitUntil > Date.now() && !c.fixBusy) return `等 Gemini 修正（${secs(fq.waitUntil)} 秒）`;
        return `Gemini 修正中 ${c.fixDone}/${c.fixDone + c.fixBusy + c.fixWait} 張`;
      }
      return '';
    }
    let tick = 0;
    function chip(force) {
      if (!pg.on) {
        if (chipEl) { chipEl.remove(); chipEl = null; }
        unlater(chipHideT);
        chipHideT = 0;
        clearInterval(tick);
        tick = 0;
        return;
      }
      const r = ui();
      if (!r) return;
      if (!chipEl) {
        const fill = h('i');
        const bar = h('span', { class: 'mt-bar', 'aria-hidden': 'true' }, fill);
        const textEl = h('span', { class: 'mt-chip-text' });
        const retry = h('button', { type: 'button', class: 'mt-retry', text: '重試', hidden: true, title: '重新開始卡住或失敗的圖', onclick: () => retryAll() });
        const toggle = h('button', { type: 'button', onclick: () => pageShow(pg.hidden) });
        const close = h('button', { type: 'button', class: 'mt-x', 'aria-label': '關閉漫畫翻譯', title: '關閉漫畫翻譯，恢復原文', text: '×', onclick: () => pageStop() });
        chipEl = h('div', { class: 'mt-chip', role: 'status' }, bar, textEl, retry, toggle, close);
        ['pointerdown', 'mousedown', 'click'].forEach((t) => chipEl.addEventListener(t, stopEv));
        r.root.append(chipEl);
        chipEl.v = { textEl, toggle, retry, fill };
      }
      const c = counts();
      const now = Date.now();
      // 有圖在翻、但超過 30 秒完全沒有進展（也不是在等 Gemini 的每分鐘次數）：好像卡住了
      const waiting = Math.max(gq.waitUntil, fq.waitUntil) > now;
      const stuck = c.busy > 0 && !waiting && now - lastProgress > 30000;
      const fixing = c.fixBusy + c.fixWait;
      const act = activity(c);
      let text;
      if (pg.hidden) text = '顯示原文中';
      else if (c.busy) text = `${c.done}/${c.total} 張 · ${stuck ? `好像卡住了（${act}）` : act}`;
      else if (c.err) text = `已翻譯 ${c.done} 張，${c.err} 張失敗`;
      else if (fixing) text = `已翻譯 ${c.done} 張 · ${act}`;
      else {
        const how = c.gem && !c.free ? 'Gemini' : c.fixDone ? 'Google 翻譯＋Gemini 修正' : c.gem ? 'Gemini＋Google 翻譯' : 'Google 翻譯';
        text = `已翻譯 ${c.done} 張 · ${how}`;
      }
      chipEl.v.textEl.textContent = `漫畫翻譯　${text}`;
      chipEl.title = `漫畫翻譯　${text}`;
      chipEl.v.toggle.textContent = pg.hidden ? '顯示譯文' : '顯示原文';
      chipEl.v.retry.hidden = !(stuck || (c.err && !c.busy));
      chipEl.classList.toggle('is-stuck', stuck);
      const pct = c.total ? c.frac / c.total : 0;
      chipEl.v.fill.style.width = `${Math.round(Math.max(c.busy ? 0.03 : 0, pct) * 1000) / 10}%`;
      chipEl.classList.toggle('is-done', !c.busy);
      const active = c.busy || fixing || stuck || c.err;
      if (active || pg.hidden || force) {
        unlater(chipHideT);
        chipHideT = 0;
        chipEl.classList.add('is-on');
        if (fab) fabSync();
      }
      if (!active && !pg.hidden && chipEl.classList.contains('is-on')) hideChipLater(4000);
      if (chipEl.classList.contains('is-on')) placeCorner(chipEl, force);
      // 翻譯中每秒更新一次（倒數、卡住偵測）
      if (active && !tick) tick = setInterval(() => { if (!stopped) setStatus(); }, 1000);
      else if (!active && tick) { clearInterval(tick); tick = 0; }
    }
    /** 沒在翻譯時收起狀態列；滑鼠停在上面時先不收 */
    function hideChipLater(ms) {
      if (chipHideT) return;
      chipHideT = later(() => {
        chipHideT = 0;
        if (!chipEl) return;
        let hover = false;
        try { hover = chipEl.matches(':hover'); } catch (_) { /* 舊瀏覽器 */ }
        const c = counts();
        if (hover || pg.hidden || c.busy || c.fixBusy || c.fixWait || c.err) { hideChipLater(1500); return; }
        chipEl.classList.remove('is-on');
        fabSync();
      }, ms);
    }
    // 收起後，滑鼠移到那個角落附近會再出現
    let nearRaf = 0;
    let nearOn = false;
    function onNear(e) {
      if (nearRaf || !chipEl || !pg.on) return;
      const x = e.clientX;
      const y = e.clientY;
      nearRaf = requestAnimationFrame(() => {
        nearRaf = 0;
        if (!chipEl) return;
        const r = chipEl.getBoundingClientRect();
        if (x > r.left - 40 && x < r.right + 40 && y > r.top - 40 && y < r.bottom + 40) {
          unlater(chipHideT);
          chipHideT = 0;
          chipEl.classList.add('is-on');
        } else if (chipEl.classList.contains('is-on')) hideChipLater(1500);
      });
    }

    /** 每張正在翻的圖，在圖上標出進度（只標畫面附近的） */
    function badges() {
      const vh = innerHeight || 800;
      for (const V of views.values()) {
        const P = V.P;
        const busy = P.state === 'busy';
        let want = busy || P.fix === 'busy' || P.fix === 'wait';
        if (want) {
          const r = V.img.getBoundingClientRect();
          if (!(r.width || r.height) || r.bottom < -vh || r.top > vh * 2) want = false;
        }
        if (!want) {
          if (V.overlay) { V.overlay.setBadge(null); if (!P.blocks.length) dropOverlay(V); }
          continue;
        }
        const fresh = !V.overlay || !V.overlay.alive();
        const ov = ensureOverlay(V);
        if (fresh && P.blocks.length) { ov.setBlocks(P.blocks); ov.show(shouldShow(P) && ready(V.img, P)); }
        if (busy) {
          const t = loc.making && loc.status && /文字辨識/.test(P.step || '') ? `${loc.status}${loc.prog > 0 && loc.prog < 1 ? ` ${Math.round(loc.prog * 100)}%` : '…'}` : (P.step || '翻譯中');
          ov.setBadge(t, P.total ? (P.done + ocrPart(P)) / P.total : 0.03, false);
        } else ov.setBadge(P.fix === 'busy' ? 'Gemini 修正中…' : '等 Gemini 修正', null, true);
      }
    }
    /** 卡住或失敗時重來：中斷進行中的請求、重開文字辨識，沒翻完的圖重新排隊 */
    function retryAll() {
      mtAbortAll();
      if (loc.making || loc.failed || Date.now() - lastProgress > 30000) resetWorkers();
      loc.failed = '';
      for (const P of pages.values()) {
        if (P.state === 'busy' || P.state === 'error') {
          resetPage(P);
          P.userCancel = false;
          if (pg.on) queueP(P); else translateP(P);
        } else if (P.fix === 'fail') fixEnqueue(P);
      }
      bump();
      setStatus();
    }

    /* ---------- 觸控裝置：「譯」按鈕 ---------- */
    let fab = null;
    let fabT = 0;
    /** 手機沒有滑鼠：還沒開始時按「譯」開始翻譯；翻譯中狀態列收起後，按「譯」把狀態列叫出來 */
    function fabSync() {
      const chipHidden = pg.on && (!chipEl || !chipEl.classList.contains('is-on'));
      const want = isTouch && (pg.on ? chipHidden : siteOn() && [...document.images].some((img) => img.naturalWidth >= 200 && img.naturalHeight >= 200));
      if (want && !fab) {
        const r = ui();
        if (!r) return;
        fab = h('button', {
          type: 'button', class: 'mt-fab', text: '譯', 'aria-label': '漫畫翻譯',
          onclick: (e) => {
            e.stopPropagation();
            if (pg.on) { chip(true); fabSync(); } else { warmLocal(); pageToggle(true); }
          },
        });
        r.root.append(fab);
        placeCorner(fab, true);
      } else if (!want && fab) { fab.remove(); fab = null; }
    }
    function fabWatch() {
      if (!isTouch || !siteOn()) return;
      unlater(fabT);
      const until = Date.now() + 60000;
      const tick = () => { fabSync(); if (!fab && Date.now() < until) fabT = later(tick, 2000); };
      fabT = later(tick, 800);
    }

    /* ---------- 鍵盤、滑鼠 ---------- */
    const onOut = (e) => {
      if (e.relatedTarget || !hoverImg || hideT) return; // 滑鼠離開視窗
      hideT = later(() => { hideT = 0; hoverImg = null; placeHover(); }, 450);
    };
    let hoverOn = false;
    /** 只在清單裡的網站追蹤滑鼠 */
    function syncHover() {
      const want = !stopped && siteOn();
      if (want === hoverOn) return;
      hoverOn = want;
      if (want) {
        PAGE.addEventListener('pointermove', onMove, { capture: true, passive: true });
        document.addEventListener('mouseout', onOut, true);
      } else {
        PAGE.removeEventListener('pointermove', onMove, { capture: true });
        document.removeEventListener('mouseout', onOut, true);
        hoverImg = null;
        placeHover();
      }
    }
    listen(PAGE, 'keydown', (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat || e.code !== 'KeyT') return;
      if (mtTyping(e) || inOurUi(e)) return;
      e.preventDefault();
      e.stopPropagation();
      warmLocal();
      pageToggle();
    }, true);
    // 網站的浮動按鈕常常捲動後才出現：捲動時偶爾重新選位置
    listen(PAGE, 'scroll', () => { if (chipEl && chipEl.classList.contains('is-on')) placeCorner(chipEl, false); if (fab) placeCorner(fab, false); }, { capture: true, passive: true });

    function toggleSite() {
      const list = (cfg().sites || []).slice();
      const hit = mtSiteMatch(list);
      if (hit && String(hit).trim() === '*') return;
      if (hit) {
        ctx.save('sites', list.filter((x) => x !== hit));
        toast('這個網站不再顯示翻譯按鈕；按 Alt+T 還是可以翻譯整話。');
      } else {
        ctx.save('sites', list.concat([HOST.replace(/^www\./, '')]));
        toast(`已在 ${HOST} 顯示翻譯按鈕。`);
      }
      placeHover();
      fabSync();
    }

    syncHover();
    fabWatch();
    autoWatch();

    return {
      onConfig() {
        syncHover();
        placeHover();
        fabSync();
        fabWatch();
        autoWatch();
        setStatus();
        chainFail = 0;
        if (gq.jobs.length) pumpSoon(0);
      },
      menuItems() {
        const items = [{
          key: 'mt.page',
          label: '　' + (!pg.on ? '翻譯這一話的漫畫（Alt+T）' : pg.hidden ? '顯示漫畫譯文（Alt+T）' : '暫時顯示漫畫原文（Alt+T）'),
          run: () => { warmLocal(); pageToggle(); },
          close: true,
        }];
        if (pg.on) items.push({ key: 'mt.stop', label: '　關閉漫畫翻譯（恢復原文）', run: () => pageStop(), close: true });
        const hit = mtSiteMatch(cfg().sites);
        if (String(hit).trim() !== '*') {
          items.push({ key: 'mt.site', label: hit ? '　這個網站不要顯示翻譯按鈕' : '　在這個網站顯示翻譯按鈕', run: () => toggleSite(), close: true });
        }
        return items;
      },
      stop() {
        stopped = true;
        offs.forEach((f) => f());
        timers.forEach(clearTimeout);
        timers.clear();
        clearInterval(alignTimer);
        clearInterval(pg.liveT);
        hoverOn = true;
        syncHover();
        cancelAnimationFrame(hoverRaf);
        cancelAnimationFrame(alignRaf);
        cancelAnimationFrame(statusRaf);
        cancelAnimationFrame(nearRaf);
        clearInterval(tick);
        srcMo.disconnect();
        ovIO.disconnect();
        ro.disconnect();
        if (pg.mo) pg.mo.disconnect();
        if (pg.perf) { try { pg.perf.disconnect(); } catch (_) { /* 已停止 */ } }
        rejectAll(mtErr('cancel'));
        for (const P of pages.values()) P.gen++;
        for (const V of views.values()) if (V.overlay) V.overlay.destroy();
        views.clear();
        pages.clear();
        if (hv) hv.el.remove();
        if (chipEl) chipEl.remove();
        if (fab) fab.remove();
        resetWorkers();
      },
    };
  }

  async function mtTestKey(key) {
    key = String(key || '').trim();
    if (!key) return { ok: false, text: '請先貼上金鑰' };
    const h = mtKeyHash(key);
    try {
      const names = await mtListModels(key);
      const list = mtChainFrom(names);
      store.set('mt.chain', { k: h, t: Date.now(), list: list.length ? list : GEMINI_DEFAULT_CHAIN });
      if (store.get('mt.badkey', '') === h) store.set('mt.badkey', '');
      const use = list.length ? list : GEMINI_DEFAULT_CHAIN;
      return { ok: true, text: use.length > 1 ? `金鑰可以用，會同時用 ${use.length} 個免費模型（${modelLabel(use[0])} 等）` : `金鑰可以用，會用 ${modelLabel(use[0])}` };
    } catch (e) {
      if (e && e.kind === 'key') { store.set('mt.badkey', h); return { ok: false, text: '金鑰無效，請確認有完整複製' }; }
      if (e && e.kind === 'region') return { ok: false, text: '你所在的地區不能使用 Gemini API' };
      return { ok: false, text: `連不到 Gemini（${(e && e.message) || '未知錯誤'}），請稍後再試` };
    }
  }

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

    /* ---------------- 漫畫翻譯 ---------------- */
    {
      id: 'mangaTranslate',
      group: 'translate',
      name: '漫畫翻譯',
      site: '漫畫網站',
      desc: '把漫畫圖片裡的英文、日文、韓文翻成繁體中文，用白底蓋住原文。在下面列出的網站，滑到圖片上會出現「翻譯」按鈕；任何網站都可以按 Alt+T 翻譯整頁。',
      defaults: { apiKey: '', mode: 'fast', sites: MT_SITES, auto: 'off', sfx: 'skip', ocrLang: 'auto' },
      fields: [
        { key: 'apiKey', label: 'Gemini 金鑰', type: 'secret', placeholder: '貼上 AIza 開頭的金鑰', link: { href: GEMINI_KEY_URL, text: '免費申請金鑰' }, test: (k) => mtTestKey(k) },
        { key: 'mode', label: '翻譯方式', type: 'select', options: [['fast', '快速：Google 翻譯＋Gemini 修正（省次數）'], ['accurate', '精準：Gemini 看圖翻譯（很耗次數）']] },
        { key: 'sites', label: '顯示翻譯按鈕的網站', type: 'list', placeholder: '用逗號分隔；* 代表所有網站' },
        { key: 'auto', label: '在這些網站', type: 'select', options: [['off', '按了才翻譯'], ['on', '打開漫畫就自動翻譯整話']] },
        { key: 'sfx', label: '狀聲詞', type: 'select', options: [['skip', '不翻'], ['translate', '也翻']] },
        { key: 'ocrLang', label: '漫畫原文（辨識文字用）', type: 'select', options: [['auto', '自動判斷'], ['eng', '英文'], ['kor', '韓文'], ['jpn', '日文']] },
      ],
      hint: (c) => mtHint(c),
      here: (c) => !!mtSiteMatch(c.sites), // 面板上的「本頁」只在漫畫網站顯示（Alt+T 在哪裡都能用）
      menuExtra: true,
      frames: 'top',
      phase: 'dom',
      match: () => /^https?:$/.test(location.protocol),
      start(ctx) {
        return createMangaTranslator(ctx);
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
        // start() 可以回傳 stop 函式，或 { stop, onConfig, menuItems }（設定改變時即時套用、選單裡的額外項目）
        const inst = m.start({ cfg: () => getCfg(m), save: (k, v) => saveCfg(m, k, v) });
        if (typeof inst === 'function') running.set(m.id, { stop: inst });
        else if (inst && typeof inst.stop === 'function') running.set(m.id, inst);
        else running.set(m.id, { stop() {} });
        if (m.menuExtra) renderMenu();
      } catch (e) { console.error(`[MAOBOO] 「${m.name}」啟動失敗`, e); }
    });
  }
  function stopModule(m) {
    pending.delete(m.id);
    const inst = running.get(m.id);
    if (!inst) return;
    running.delete(m.id);
    try { inst.stop(); } catch (e) { console.error(`[MAOBOO] 「${m.name}」停止失敗`, e); }
    if (m.menuExtra) renderMenu();
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
  let menuKeys = '';

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
      const inst = m.menuExtra && running.get(m.id);
      if (inst && typeof inst.menuItems === 'function') {
        try { items.push(...inst.menuItems()); } catch (e) { console.error(`[MAOBOO] 「${m.name}」選單項目`, e); }
      }
    }
    items.push({ key: '_update', label: `檢查更新（目前 ${VERSION}）`, run: () => checkUpdate(true), close: true });
    // 項目有增減時要全部重新登記，順序才會對
    const keys = items.map((it) => it.key).join('|');
    if (!MENU_IN_PLACE || keys !== menuKeys) {
      for (const k of Object.keys(menuIds)) {
        try { GM_unregisterMenuCommand(menuIds[k]); } catch (_) { /* 已移除 */ }
        delete menuIds[k];
      }
      menuKeys = keys;
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
    { id: 'translate', name: '翻譯' },
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
    if (f.type === 'secret') {
      // 金鑰：用遮罩文字框，不用密碼欄位，避免瀏覽器跳出「儲存密碼」
      const input = h('input', {
        type: 'text', class: 'is-masked', autocomplete: 'off', spellcheck: 'false', placeholder: f.placeholder || '',
        'aria-label': `${m.name}：${f.label}`, 'data-lpignore': 'true', 'data-1p-ignore': 'true',
      });
      input.value = cfgVal() || '';
      const note = h('span', { class: 'mb-note', 'aria-live': 'polite' });
      const save = () => {
        const val = input.value.trim();
        input.value = val;
        if (val === String(cfgVal() || '')) return;
        note.textContent = '';
        note.className = 'mb-note';
        saveCfg(m, f.key, val);
      };
      input.addEventListener('change', save);
      const eye = h('button', {
        type: 'button', class: 'mb-mini', text: '顯示',
        onclick: () => { const masked = input.classList.toggle('is-masked'); eye.textContent = masked ? '顯示' : '隱藏'; },
      });
      const test = f.test ? h('button', {
        type: 'button', class: 'mb-mini', text: '測試',
        onclick: async () => {
          save();
          note.className = 'mb-note';
          note.textContent = '測試中…';
          test.disabled = true;
          try {
            const r = await f.test(input.value.trim());
            note.textContent = r.text;
            note.className = 'mb-note ' + (r.ok ? 'is-ok' : 'is-bad');
          } finally {
            test.disabled = false;
            if (panel) panel.refresh();
          }
        },
      }) : null;
      return {
        el: h('div', { class: 'mb-field mb-field-wide mb-secret' },
          h('label', { class: 'mb-secret-in' }, h('span', { text: f.label }), input),
          eye, test,
          h('div', { class: 'mb-secret-foot' },
            f.link ? h('a', { class: 'mb-mini-link', href: f.link.href, target: '_blank', rel: 'noopener noreferrer', text: f.link.text }) : null,
            note)),
        refresh: () => { if (!input.matches(':focus')) input.value = cfgVal() || ''; },
      };
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
    const hintText = () => (typeof m.hint === 'function' ? m.hint(getCfg(m)) : m.hint);
    const hint = m.hint ? h('p', { class: 'mb-hint', text: hintText() }) : null;
    const el = h('article', { class: 'mb-row' + (sw.checked ? '' : ' is-off') },
      h('div', { class: 'mb-row-top' },
        h('div', { class: 'mb-info' },
          h('div', { class: 'mb-name' },
            h('span', { text: m.name }),
            h('span', { class: 'mb-site', text: m.site }),
            (matchesHere(m) && (!m.here || m.here(getCfg(m)))) ? h('span', { class: 'mb-here', text: '本頁' }) : null),
          h('p', { class: 'mb-desc', text: m.desc })),
        h('label', { class: 'mb-switch' }, sw, h('span', { class: 'mb-knob', 'aria-hidden': 'true' }))),
      fields.length ? h('div', { class: 'mb-fields' }, fields.map((f) => f.el)) : null,
      hint);
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
        if (hint) hint.textContent = hintText();
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
