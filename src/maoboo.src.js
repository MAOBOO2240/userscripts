// ==UserScript==
// @name         MAO BOO 油猴整合包
// @namespace    https://github.com/mao-boo/userscripts
// @version      1.5.6
// @description  整合影片快轉、短影片（YouTube Shorts、IG／FB Reels）自動下一部、影片音量記憶（Threads／X／IG／FB）、漫畫翻譯、簡體轉繁體、X 影片下載、LINE 貼圖下載、隱藏 FB／Threads 推薦內容、網址追蹤參數清除、手機版轉電腦版；每個功能都能在選單裡個別開關，並會自動更新。
// @author       MAO BOO
// @homepageURL  https://github.com/MAOBOO2240/userscripts
// @supportURL   https://github.com/MAOBOO2240/userscripts/issues
// @updateURL    https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/maoboo.user.js
// @downloadURL  https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/maoboo.user.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwBAMAAAA0zul4AAAAElBMVEUzMzP////Z2dlmZmYAAAAAAAASXfmKAAAABnRSTlP/////AP8NmbZAAAABXklEQVR42t2Y0Y3DIBBEn09pYFugBVpwC67SLaQFWqAFWrgPMAZDEukUnTLZLwyyxNOwO7DLyhFGBBwJns7l+OGP8f8/3lqaBMSGaDanzHhGxNXRJ231PYw2YbOvYTTCheualdfTqqpj1u+gOb4gTSjVGLOKETBWdhwQyzhWSrCGUlHHrNo6jKmUfX0VYlxWjFBcMIeHLjvPNd9QKuro8IWs5fME3NRD9Bhdx9Vz9quHklqMqSgY8FVHX5Z7TaOmjss68cdZtISOJJmP4wntT28Uz0crBCOn7+52bfXRYrRm56FmIkNu9nVH+d0RPnar73xbjTFTU5ExXHxw5NxUveMGCcf+gm58MSv64+tctO7mo/rusElv6lE/QLfmPKK0y/11F2RM1d9nlPYl3tFSPo9coTTParr0HN3Q6TkJdfMxYdVFNhL3urLVeVf6IHreMebekZX3SpljL50eIcZfgJVnT1QZFQ0AAAAASUVORK5CYII=
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
// @connect      edge.microsoft.com
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
 * 1.5.6  漫畫翻譯：網站換頁、重畫版面時錯過時機，譯文會自己補回圖上（手機上「已翻譯」但圖上還是原文的問題）；手機上「譯」和狀態列
 *        會避開網站的換頁列和小按鈕；翻譯中的選單多了「複製診斷資訊」，譯文沒出來時可以複製這一頁的狀況回報
 * 1.5.5  新增「手機版漫畫翻譯」（manga-mobile.user.js）：整合包裡的漫畫翻譯單獨拿出來給手機用；手機上的介面：設定面板從下方滑上來、
 *        開關和按鈕加大、輸入框 16px（iPhone 點了不會放大畫面），「譯」加大，狀態列多「設定」、寬度固定（按鈕不會跟著進度文字移動）；
 *        沒有手機版排版的網站整頁縮小顯示時，介面放大回正常大小；整合包和手機版同時裝時只有一個在翻譯
 * 1.5.4  隱藏推薦內容：Facebook 一放進廣告、推薦貼文就馬上收起來（在畫面畫出來之前），不會再先閃一下才消失
 * 1.5.3  Facebook 的音量條會顯示記住的音量（之前音量條是 100%、實際聲音是 10%）；設定面板的音量可以直接打數字，
 *        也可以把滑鼠移到拉桿或數字上用滾輪調；預設音量：Threads、Instagram、Facebook 10%，X 1%，X 影片網址 5%
 * 1.5.2  圖示換成新的小浣熊：Tampermonkey 裡的腳本圖示和設定面板左上角都換了（圖示直接放在腳本裡，不用連外部網站）
 * 1.5.1  油猴選單只留「漫畫翻譯」（放在最上面）、「短影片自動下一部」和「開啟設定面板」，其他功能的開關和檢查更新都在設定面板裡；
 *        拿掉「滑過圖片看大圖」和「解除複製限制」；隱藏推薦內容預設改成完全隱藏，不再留「已收起」那一行
 * 1.5.0  新功能：簡體轉繁體（簡體網頁自動轉成繁體）、解除複製限制（選單按一下，這個網站就能選取、複製、按右鍵）、
 *        滑過圖片看大圖（X、Threads、IG）、隱藏推薦內容（FB、Threads 動態裡的贊助、推薦貼文、你可能認識的朋友、為你推薦的帳號收成一行）；
 *        音量記憶多了 Instagram、Facebook，跟 Threads、X 合成一張「影片音量記憶」卡片；IG、FB 的 Reels 切到其他分頁也會繼續播
 * 1.4.6  「YouTube Shorts 自動下一部」改成「短影片自動下一部」：Instagram、Facebook 的 Reels 也會自動跳下一部；
 *        改成播完才跳：播到最後一格就換下一部，不會先聽到同一部重播的開頭（想提早跳可以調「提早幾秒跳」）
 * 1.4.5  漫畫翻譯：兩個連在一起、中間沒有外框的對話框（8 字形）分開翻，各自橫排，框裡沒認出來的字（像 Y—?）也一起蓋白底；
 *        結巴的字（H-HOW、I-I'M）翻成「你、你…」，不會再出現「H-你…」，話說到一半的破折號改成「——」；
 *        MM-HMM、HMM、SHH 這種沒有母音的語氣詞不會再被當成雜訊丟掉（之前會露出半行原文）
 * 1.4.4  漫畫翻譯：狀聲詞「不翻」判斷加強：DUN、TILT、NOD 這類效果字、動作字（NODS、GRABBED、THUMP THUMP 也算）不翻也不蓋白底，
 *        白底上的大狀聲詞被當成對話框時也會跳過；一行字剛好被切在兩張圖的接縫上時，把接縫附近拼起來重新認字，
 *        整句翻成一段、跨兩張圖畫成一個框（不會再露出半行原文、翻出怪字）；外面有一圈光線的對話框也認得出來，白底不會超出框外
 * 1.4.3  漫畫翻譯：會找出對話框，同一個框裡的字合成一段翻、用同一個字級，白底照對話框的形狀蓋滿，原文不會漏出來；
 *        又高又窄的對話框改成直排（由上到下）；譯文的字不會比原文大太多；淺色的框用原本的底色；
 *        長條漫畫被網站切成好幾張圖時，剛好被切在兩張圖中間的一句話會接起來翻（譯文放一邊、另一邊只蓋白底）
 *        Gemini 修正變快：畫面上的圖單獨先送、思考程度調到最低，一張修好就馬上換上，不用等同一批的其他張
 * 1.4.2  X：按住 S 點圖片時不會再跳出分享選單（只擋掉 X 自己的 S 快捷鍵，打字和其他程式不受影響）
 * 1.4.1  設定面板：「X 音量記憶」和「X 直連影片音量」合成一個「X 影片音量」，兩條音量在同一張卡片裡（之前設的音量會保留）
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
  /**
   * 'full'：整合包（這個檔案）；'manga'：手機版漫畫翻譯（只有漫畫翻譯）。
   * 手機版是用 tools/build-manga.js 從這個檔案產生的，只換掉腳本資訊和這一行，其他程式碼完全一樣
   */
  const EDITION = 'full';
  const APP = EDITION === 'manga'
    ? { name: 'MAO BOO 漫畫翻譯', short: '漫畫翻譯', file: 'manga-mobile.user.js' }
    : { name: 'MAO BOO 油猴整合包', short: '整合包', file: 'maoboo.user.js' };
  const RAW_URL = `https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/${APP.file}`;
  /** 整合包和手機版都裝了的時候，網頁上記下是哪一個在翻譯漫畫（每次載入都不一樣，同一支腳本重複載入也分得出來） */
  const MT_TOKEN = `${EDITION}-${Math.random().toString(36).slice(2, 8)}`;
  /** 觸控裝置（手機、平板）：沒有「滑鼠移上去」這件事 */
  const TOUCH = (() => { try { return matchMedia('(hover: none)').matches; } catch (_) { return false; } })();
  /** 最近的錯誤（「複製診斷資訊」會一起附上；手機上看不到主控台） */
  const DIAG_ERRS = [];
  function mtWarn(msg, ...args) {
    const last = args[args.length - 1];
    DIAG_ERRS.push(`${new Date().toTimeString().slice(0, 8)} ${msg}${args.length ? '：' + String((last && last.message) || last).slice(0, 160) : ''}`);
    if (DIAG_ERRS.length > 12) DIAG_ERRS.shift();
    console.warn('[MAOBOO] ' + msg, ...args);
  }
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

  /** 手機（或很窄的視窗）：設定面板從下面滑上來、按鈕加大、輸入框的字 16px（iPhone 點了才不會把畫面放大）；p 加在每個選擇器前面 */
  const NARROW_CSS = (p) => `
${p}.mb-toasts { bottom: 78px; }
${p}.mb-backdrop { align-items: flex-end; padding: 0; }
${p}.mb-panel { width: 100%; max-height: 92vh; max-height: 92dvh; border-radius: 16px 16px 0 0; padding-bottom: env(safe-area-inset-bottom, 0px); }
${p}.mb-head { padding: 12px 6px 12px 16px; }
${p}.mb-close { width: 44px; height: 44px; font-size: 26px; }
${p}.mb-group { padding: 14px 16px 4px; }
${p}.mb-row { padding: 14px 16px; }
${p}.mb-field { max-width: 100%; font-size: 14px; }
${p}.mb-field > span:first-child { flex: none; white-space: nowrap; }
${p}.mb-field input[type=number], ${p}.mb-field input[type=text], ${p}.mb-field select { height: 40px; font-size: 16px; }
${p}.mb-field select { min-width: 0; max-width: 100%; }
${p}.mb-field input[type=range] { width: auto; flex: 1; min-width: 0; }
${p}.mb-field-range > span:first-child { min-width: 5em; }
${p}.mb-mini, ${p}.mb-btn { height: 40px; font-size: 14px; }
${p}.mb-foot { padding: 10px 16px; }
`;

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
.mb-mark { flex: none; width: 32px; height: 32px; }
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
.mb-field-range { flex-basis: 100%; }
.mb-field-range > span:first-child { min-width: 5.6em; }
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
.mb-field input.mb-pct { width: 60px; padding: 0 4px 0 8px; font-weight: 650; text-align: right; }
.mb-pct-unit { margin-left: -4px; color: var(--ink); font-weight: 650; }
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

/* ---------- 手機：手指好按、字不會太小 ---------- */
@media (hover: none) and (pointer: coarse) {
  /* 狀態列固定寬度：進度文字變長變短時，右邊的按鈕不會跟著移動，不會按錯 */
  .mt-chip { width: min(calc(100% - 32px), 520px); height: 40px; padding: 0 4px 0 14px; border-radius: 20px; font-size: 14px; }
  .mt-chip-text { flex: 1; max-width: none; }
  .mt-chip button { height: 32px; padding: 0 12px; border-radius: 16px; }
  .mt-chip button.mt-x { width: 32px; font-size: 18px; }
  .mt-bar { bottom: 4px; }
  .mt-fab { width: 52px; height: 52px; font-size: 20px; }
  .mb-toast { font-size: 14px; }
  .mb-toast-actions button { height: 36px; padding: 0 14px; font-size: 14px; }
  .mb-toast-x { width: 36px; height: 36px; }
  .mb-switch { width: 52px; height: 30px; }
  .mb-knob { width: 24px; height: 24px; }
  .mb-switch input:checked + .mb-knob { transform: translateX(22px); }
}
@media (max-width: 600px) {${NARROW_CSS('  ')}}
${NARROW_CSS(':host([data-narrow]) ')}
/* 網頁沒有手機版排版、整頁縮小顯示時（--mb-z 是縮小的倍數）：按鈕、狀態列、通知、設定面板放大回正常大小；
   放大時 vw、vh 也會跟著放大，改用百分比 */
:host([data-z]) .mt-fab, :host([data-z]) .mt-chip, :host([data-z]) .mb-toasts, :host([data-z]) .mb-backdrop { zoom: var(--mb-z, 1); }
:host([data-z]) .mt-chip, :host([data-z]) .mb-toasts { max-width: calc(100% - 32px); }
:host([data-z]) .mb-backdrop { padding: 16px; }
:host([data-z]) .mb-panel { max-height: 100%; }
:host([data-z][data-narrow]) .mb-backdrop { padding: 0; }
:host([data-z][data-narrow]) .mb-panel { max-height: 92%; }

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
      const vv = window.visualViewport;
      if (TOUCH && vv) {
        let raf = 0;
        vv.addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; syncUiZoom(); }); });
      }
      syncUiZoom();
    }
    parent.appendChild(uiRoot.host);
    return uiRoot;
  }

  /**
   * 手機上，網頁沒有手機版排版時整頁會縮小顯示（例如電腦版網頁縮成 0.4 倍），我們的按鈕、字也跟著變很小：
   * 這時把介面放大同樣的倍數，看起來和一般網頁一樣大。使用者自己用兩指放大縮小時也跟著調整
   */
  let uiZ = 1;
  let uiNarrow = false;
  function syncUiZoom() {
    if (!uiRoot || !TOUCH) return;
    const vv = window.visualViewport;
    const s = vv ? vv.scale : 1;
    const z = s > 0 && s < 0.9 ? Math.round(Math.min(3, 1 / s) * 100) / 100 : 1;
    const narrow = z > 1 && innerWidth / z <= 600;
    if (z === uiZ && narrow === uiNarrow) return; // 捲動時網址列伸縮也會觸發，沒變就不動
    // 正在面板裡打字時先不要變：iPhone 點輸入框時可能會自己放大畫面
    const a = uiRoot.root.activeElement;
    if (z !== uiZ && a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) return;
    uiZ = z;
    uiNarrow = narrow;
    const host = uiRoot.host;
    if (z > 1) { host.setAttribute('data-z', ''); host.style.setProperty('--mb-z', String(z)); } else { host.removeAttribute('data-z'); host.style.removeProperty('--mb-z'); }
    if (narrow) host.setAttribute('data-narrow', ''); else host.removeAttribute('data-narrow');
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
   * 隱藏推薦內容（Facebook、Threads 的動態）
   * ==================================================================== */
  const FEED_SPONSOR = ['贊助', '赞助', 'Sponsored', '廣告', '广告', '広告'];
  const FEED_FOLLOW = ['追蹤', '追踪', '關注', '关注', 'Follow', '加入', 'Join', '加入社團', '加入小组', 'Join group'];
  /** 推薦區塊裡一排一排的按鈕（加朋友、加入社團、追蹤） */
  const FEED_ADD = FEED_FOLLOW.concat(['加朋友', '加為朋友', '加好友', 'Add friend', 'Add Friend']);
  /** Facebook 動態裡推薦區塊的標題 */
  const FEED_FB_BLOCKS = ['你可能認識的朋友', '你可能認識的人', '你可能认识的朋友', '你可能认识的人', 'People you may know',
    '為你推薦', '为你推荐', 'Suggested for you', '推薦社團', '推荐小组', 'Suggested groups', '推薦粉絲專頁', '推荐公共主页', 'Suggested Pages'];
  const FEED_FB_REELS = ['Reel', 'Reels', 'Reels 和短片', 'Reels 和短影片', 'Reels and short videos'];
  /** Threads 動態裡推薦帳號區塊的標題 */
  const FEED_TH_BLOCKS = ['為你推薦', '为你推荐', 'Suggested for you', '建議追蹤', '建议关注', 'Suggested accounts'];

  /**
   * 把動態裡的贊助、推薦收起來：只在一則貼文的外框加上記號、用樣式藏起來，不改網站自己的內容
   * - Facebook：一則一個 [aria-posinset]。贊助貼文的「贊助」是用 aria-labelledby 指到另一個元素（停下來看一下才出現，有的畫成圖），
   *   還有「了解詳情」這類廣告按鈕、標題下沒有發文時間；推薦貼文的標題（h4）裡有「追蹤」或「加入」按鈕；你可能認識的朋友、Reels 是 h3 標題
   * - Threads：一則一個 [data-virtualized]。推薦帳號是「為你推薦」加上一排「追蹤」按鈕；贊助貼文沒有發文時間、標著「贊助」
   */
  function startFeedClean(ctx) {
    const doc = document;
    const fb = /(^|\.)facebook\.com$/.test(HOST);
    const TAG = '[隱藏推薦內容]';
    const FOLD = 'data-maoboo-fold'; // 收起來（值是那一行要顯示的字）
    const OPEN = 'data-maoboo-open'; // 點開了
    const RUN = 'data-maoboo-run'; // 緊接在另一則收起來的後面：併進前面那一行
    const SUM = 'data-maoboo-sum'; // 好幾則連在一起時，第一則顯示的總結
    const UNIT = fb ? '[aria-posinset]' : '[data-virtualized]';
    const SPONSOR_SEL = FEED_SPONSOR.map((s) => `a[aria-label="${s}"]`).join(',');
    const norm = (t) => String(t || '').replace(/\s+/g, ' ').trim();
    const isIn = (list, t) => list.includes(norm(t));
    const mode = () => (fb ? ctx.cfg().fb : ctx.cfg().threads) || 'all';
    // Facebook 只整理首頁的動態（社團、個人頁面裡的貼文不動）
    const active = () => mode() !== 'off' && (!fb || /^\/(home\.php)?$/.test(PAGE.location.pathname));

    let style = null;
    const hideAll = () => ctx.cfg().style === 'hide';
    const css = () => {
      if (hideAll()) return `[${FOLD}]:not([${OPEN}]) { display: none !important; }`;
      const color = fb ? 'var(--secondary-text, #65676B)' : 'var(--text-secondary, #999999)';
      // 網站捲遠了會把貼文整個拿掉（外框變空的）：那一行也不用留
      return `[${FOLD}]:not([${OPEN}]) > *, [${FOLD}][${RUN}]:not([${OPEN}]), [${FOLD}]:empty { display: none !important; }
[${FOLD}]:not([${OPEN}])::before { content: attr(${FOLD}); display: block; box-sizing: border-box; padding: 8px 16px;
  ${fb ? 'margin: 0 0 12px;' : 'border-bottom: 1px solid rgba(128, 128, 128, .2);'} color: ${color}; font: 13px/1.5 ${FONT};
  text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
[${FOLD}][${SUM}]:not([${OPEN}])::before { content: attr(${SUM}); }
[${FOLD}]:not([${OPEN}]):hover::before { text-decoration: underline; }`;
    };
    const addStyle = () => {
      if (style && style.isConnected) return;
      const parent = doc.head || doc.documentElement;
      if (!parent) return;
      if (!style) { style = doc.createElement('style'); style.id = 'maoboo-feed-clean'; style.textContent = css(); }
      parent.appendChild(style);
    };

    let state = new WeakMap(); // 貼文 → { sig, reason, text, box }
    const folded = new Set(); // 收起來的外框（關掉時還原）
    /** 一則貼文的外框：往上找只包著這則貼文的那幾層，取最外面、跟其他貼文並排的那層；只載入一則時先收貼文本身 */
    const boxOf = (u) => {
      let el = u;
      for (let i = 0; i < 12; i++) {
        const p = el.parentElement;
        if (!p || p === doc.body || p.childElementCount !== 1) break;
        el = p;
      }
      const p = el.parentElement;
      if (p) for (const c of p.children) if (c !== el && (c.matches(UNIT) || c.querySelector(UNIT))) return el;
      return u;
    };
    /** 這則是什麼貼文（換成別則時要重新判斷）；空的 = 還沒載入，或捲遠了內容被拿掉 */
    const sigOf = (u) => {
      if (!fb) return norm(u.textContent).slice(0, 80);
      const hd = u.querySelector('h4, h3, h2');
      return hd ? norm(hd.textContent).slice(0, 80) : '';
    };
    const nameOf = (u) => {
      const a = fb ? u.querySelector('h4 a') : u.querySelector('a[href^="/@"]');
      return a ? norm(a.textContent).slice(0, 30) : '';
    };
    const fbReason = (u, m) => {
      const labels = [...u.querySelectorAll('[aria-labelledby]')].map((a) => {
        let t = '';
        for (const id of a.getAttribute('aria-labelledby').split(/\s+/)) {
          const e = id ? doc.getElementById(id) : null;
          if (e) t += e.textContent;
        }
        return norm(t);
      });
      if (labels.some((t) => isIn(FEED_SPONSOR, t)) || u.querySelector(SPONSOR_SEL)) return '贊助';
      // 「贊助」字樣常常要停下來看一下才出現，有的還畫成圖：有「了解詳情」這類廣告按鈕、標題下又沒有發文時間的也算
      if (!labels[0] && u.querySelector('[data-ad-rendering-role^="cta"]')) return '贊助';
      if (m === 'ads') return '';
      for (const hd of u.querySelectorAll('h2, h3')) {
        if (isIn(FEED_FB_BLOCKS, hd.textContent)) return norm(hd.textContent);
        if (m === 'reels' && isIn(FEED_FB_REELS, hd.textContent)) return 'Reels';
      }
      const h4 = u.querySelector('h4');
      if (h4) {
        for (const b of h4.querySelectorAll('[role="button"]')) if (isIn(FEED_FOLLOW, b.textContent)) return '推薦貼文';
        return '';
      }
      // 其他推薦區塊（推薦社團、粉絲專頁…）：不是誰發的貼文，有一排「加朋友／加入／追蹤」按鈕
      const hd = u.querySelector('h3, h2');
      let n = 0;
      if (hd) for (const b of u.querySelectorAll('[role="button"]')) if (isIn(FEED_ADD, b.textContent) && ++n >= 2) return norm(hd.textContent).slice(0, 20) || '推薦';
      return '';
    };
    const thReason = (u, m) => {
      if (u.querySelector('[data-pressable-container]')) {
        if (u.querySelector('time')) return '';
        for (const s of u.querySelectorAll('span')) if (!s.childElementCount && isIn(FEED_SPONSOR, s.textContent)) return '贊助';
        return '';
      }
      if (m === 'ads') return '';
      // 推薦帳號：不是貼文，有一排「追蹤」按鈕（標題通常是「為你推薦」）
      let follows = 0;
      for (const b of u.querySelectorAll('[role="button"]')) if (isIn(FEED_FOLLOW, b.textContent)) follows++;
      if (follows >= 2) return '為你推薦的帳號';
      if (follows) for (const s of u.querySelectorAll('span')) if (!s.childElementCount && isIn(FEED_TH_BLOCKS, s.textContent)) return '為你推薦的帳號';
      return '';
    };
    const boxReason = new WeakMap(); // 外框 → 收起來的原因（算總結用）
    const clearBox = (box) => {
      if (!box) return;
      [FOLD, OPEN, RUN, SUM].forEach((a) => box.removeAttribute(a));
      folded.delete(box);
    };
    /** 收起來（或從貼文本身換到外框）；已經點開的維持打開 */
    const setBox = (st, box) => {
      if (st.box === box) return;
      const open = !!st.box && st.box.hasAttribute(OPEN);
      clearBox(st.box);
      st.box = box;
      box.setAttribute(FOLD, st.text);
      if (open) box.setAttribute(OPEN, '');
      boxReason.set(box, st.reason);
      folded.add(box);
    };
    /** 前一個／後一個有內容的兄弟元素（跳過網站留的空 div、被網站整個拿掉的貼文） */
    const sib = (el, dir) => {
      for (let s = el[dir]; s; s = s[dir]) if (s.firstElementChild) return s;
      return null;
    };
    const isFolded = (el) => !!el && el.hasAttribute(FOLD) && !el.hasAttribute(OPEN);
    /** 一則接一則收起來的：併成一行「已收起 N 則：…」，點一下全部打開 */
    const runOf = (head) => {
      const list = [];
      for (let x = head; isFolded(x); x = sib(x, 'nextElementSibling')) list.push(x);
      return list;
    };
    const tidyRuns = () => {
      for (const b of folded) {
        if (!isFolded(b) || !b.firstElementChild) { b.removeAttribute(RUN); b.removeAttribute(SUM); continue; }
        const tail = isFolded(sib(b, 'previousElementSibling'));
        b.toggleAttribute(RUN, tail);
        const list = tail ? [] : runOf(b);
        if (list.length < 2) { b.removeAttribute(SUM); continue; }
        const counts = new Map();
        list.forEach((x) => { const r = boxReason.get(x) || ''; counts.set(r, (counts.get(r) || 0) + 1); });
        const parts = [...counts].sort((p, q) => q[1] - p[1]).map(([r, k]) => `${r} ${k}`).join('、');
        const text = `已收起 ${list.length} 則：${parts}（點一下全部打開）`;
        if (b.getAttribute(SUM) !== text) b.setAttribute(SUM, text);
      }
    };
    /** 判斷一則貼文要不要收起來 */
    const check = (u, m) => {
      const sig = sigOf(u);
      if (!sig) return; // 還沒載入、或捲遠了內容被拿掉：維持原狀
      let st = state.get(u);
      if (st && st.sig === sig) {
        // 收起來的一直收著（Facebook 的「贊助」字樣捲遠了會被拿掉）
        if (st.reason) { if (st.box === u) setBox(st, boxOf(u)); return; }
        if (!fb) return; // Threads：內容沒變就不用再看；Facebook 的「贊助」字樣可能晚一點才出現
      } else if (st && st.reason) clearBox(st.box); // 換成別則貼文：重新判斷
      const reason = fb ? fbReason(u, m) : thReason(u, m);
      const name = reason === '贊助' || reason === '推薦貼文' ? nameOf(u) : '';
      st = { sig, reason, text: `已收起「${reason}」${name ? '：' + name : ''}（點一下打開）`, box: null };
      state.set(u, st);
      if (reason) setBox(st, boxOf(u));
    };
    const scan = () => {
      if (!active()) return;
      addStyle();
      const m = mode();
      for (const u of doc.querySelectorAll(UNIT)) check(u, m);
      for (const b of folded) if (!b.isConnected) folded.delete(b);
      if (!hideAll()) tidyRuns();
    };
    // 新出現、內容有變的貼文：網站一放進來就馬上判斷（在畫面更新之前，不會先露出來再被收掉）
    const touched = new Set();
    const onMutations = (records) => {
      if (active()) {
        for (const r of records) {
          const t = r.target;
          const u = t.nodeType === 1 ? t.closest(UNIT) : null;
          if (u) { touched.add(u); continue; }
          for (const n of r.addedNodes) {
            if (n.nodeType !== 1) continue;
            if (n.matches(UNIT)) touched.add(n);
            else if (n.firstElementChild) for (const x of n.querySelectorAll(UNIT)) touched.add(x);
          }
        }
        if (touched.size) {
          addStyle();
          const m = mode();
          try { touched.forEach((u) => check(u, m)); } catch (e) { console.error(TAG, e); }
          touched.clear();
          if (!hideAll()) tidyRuns();
        }
      }
      schedule();
    };
    // 其他的變化（例如「贊助」字樣是另外放在別處的）：最多每 0.1 秒整個看一次
    let raf = 0;
    let timer = 0;
    let lastRun = 0;
    const run = () => {
      raf = 0;
      lastRun = Date.now();
      try { scan(); } catch (e) { console.error(TAG, e); }
    };
    const schedule = () => {
      if (raf || timer) return;
      const wait = 100 - (Date.now() - lastRun);
      if (wait > 0) timer = setTimeout(() => { timer = 0; raf = requestAnimationFrame(run); }, wait);
      else raf = requestAnimationFrame(run);
    };
    const mo = new MutationObserver(onMutations);
    mo.observe(doc, { childList: true, subtree: true });
    // 點一下收起來的那一行：打開這則（併在一起的全部打開）
    const onClick = (e) => {
      const el = e.target;
      if (!el || el.nodeType !== 1 || !isFolded(el)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      (el.hasAttribute(SUM) ? runOf(el) : [el]).forEach((x) => x.setAttribute(OPEN, ''));
    };
    PAGE.addEventListener('click', onClick, true);
    schedule();
    const clearAll = () => { [...folded].forEach(clearBox); state = new WeakMap(); };
    return {
      onConfig() {
        clearAll();
        if (style) style.textContent = css();
        schedule();
      },
      stop() {
        mo.disconnect();
        if (raf) cancelAnimationFrame(raf);
        clearTimeout(timer);
        PAGE.removeEventListener('click', onClick, true);
        clearAll();
        if (style) style.remove();
        style = null;
      },
    };
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
      syncRemote(v) { if (!stopped) { vol = clamp01(v); applyAll(); emit(); } }, // 在別的分頁改的音量：這一頁的影片也馬上換
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
   * Threads、Instagram 的播放器（Meta VideoPlayer）自己記一份音量，音量條顯示的是它，不是影片實際的音量。
   * 從播放器按鈕的 React 資料找到控制器，用它的 setVolume 同步，音量條就會跟記住的音量一致。
   */
  const metaCtrlCache = new WeakMap(); // video → { c, t }
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
  function findMetaController(video) {
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
  /**
   * Facebook 的網頁元素上沒有 React 的資料，從 React 的根節點把整棵樹走一遍（1～2 萬個節點，幾毫秒）：
   * 找出每支影片的播放器控制器，和 Facebook 自己記的音量 { volume, setVolume }——音量條顯示的是它，
   * 換片、取消靜音時也會套用它，所以要一起改，音量條才會跟實際的音量一樣。結果留 1 秒，不會一直重找
   */
  let fbPlayers = { t: -1e9, ctrls: new Map(), vols: [], done: new Map() };
  function scanFbPlayers(force) {
    if (!force && performance.now() - fbPlayers.t < 1000) return fbPlayers;
    const ctrls = new Map();
    const vols = new Set();
    for (const el of document.body ? document.body.children : []) {
      const k = Object.keys(el).find((x) => x.startsWith('__reactContainer$'));
      let f = k ? el[k] : null;
      if (f && f.stateNode && f.stateNode.current) f = f.stateNode.current;
      const stack = f ? [f] : [];
      for (let n = 0; stack.length && n < 300000; n++) {
        const x = stack.pop();
        let ctrl = null;
        let vol = null;
        for (let d = x.dependencies && x.dependencies.firstContext; d; d = d.next) {
          const val = d.memoizedValue;
          if (!val || typeof val !== 'object') continue;
          if (isPlayerCtrl(val)) {
            ctrl = val;
            if (typeof val.internal_getVideoElement === 'function') {
              try { const v = val.internal_getVideoElement(); if (v) ctrls.set(v, val); } catch (_) { /* 換片中 */ }
            }
          } else if (typeof val.setVolume === 'function' && typeof val.volume === 'number') vol = val;
        }
        // 只動播放器的音量條用的那一份（跟播放器控制器一起用的），不碰網站其他的音量（例如通話鈴聲）
        if (ctrl && vol) vols.add(vol);
        if (x.sibling) stack.push(x.sibling);
        if (x.child) stack.push(x.child);
      }
    }
    fbPlayers = { t: performance.now(), ctrls, vols: [...vols], done: new Map() };
    return fbPlayers;
  }
  function syncFbPlayer(video, vol) {
    const off = (st) => !st || typeof st.volume !== 'number' || Math.abs(st.volume - vol) > 0.004;
    let s = scanFbPlayers();
    let c = s.ctrls.get(video);
    // 播放器的音量跟記住的不一樣（網站自己改回去了），或還沒找到 Facebook 的音量資料：馬上重新找
    if ((c ? off(c.getCurrentState()) : !s.vols.length) && performance.now() - s.t > 50) { s = scanFbPlayers(true); c = s.ctrls.get(video); }
    for (const x of s.vols) {
      // 同一次找到的資料還沒更新（網站重畫之前）：同一個值不重複設
      if (Math.abs(x.volume - vol) <= 0.004 || s.done.get(x.setVolume) === vol) continue;
      s.done.set(x.setVolume, vol);
      x.setVolume(vol); // 不會改變靜音狀態
    }
    if (c && off(c.getCurrentState())) c.setVolume(vol);
  }
  function syncMetaPlayer(video, vol) {
    let hit = metaCtrlCache.get(video);
    if (!hit || (!hit.c && performance.now() - hit.t > 2000)) {
      hit = { c: findMetaController(video), t: performance.now() };
      metaCtrlCache.set(video, hit);
    }
    const c = hit.c;
    if (!c) return;
    const st = c.getCurrentState();
    if (!st || typeof st.volume !== 'number' || Math.abs(st.volume - vol) > 0.004) c.setVolume(vol); // 不會改變靜音狀態
  }

  /** 滾輪調音量的下一格：10% 以下一次 1%，以上一次 5%（對齊 5 的倍數） */
  function volStep(cur, up) {
    const next = up ? (cur < 10 ? cur + 1 : Math.floor(cur / 5) * 5 + 5) : (cur <= 10 ? cur - 1 : Math.ceil(cur / 5) * 5 - 5);
    return Math.max(0, Math.min(100, next));
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
      keeper.set(volStep(Math.round(keeper.get() * 100), (e.deltaY || e.deltaX) < 0) / 100);
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
      const feed = () => { if (onRaw) { try { onRaw(raw); } catch (e) { mtWarn('串流處理', e); } } };
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
    if (/Prohibited Use|Input blocked|prompt could not be submitted/i.test(msg)) return mtErr('blocked', msg);
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
      'Each line is one text block, usually a whole speech bubble. Translate every line on its own: never move words from one line to another, and never leave a line empty just because its sentence continues in another line.',
      'Use full-width punctuation and Taiwanese wording. Keep names and terms consistent with the recent translations. Write Traditional Chinese characters only, never Simplified Chinese.',
      sfx ? 'Translate sound effects too, as natural Chinese onomatopoeia.'
        : 'Return an empty zh for lines that are only a sound effect, or an action word lettered as a sound effect (like BAM, THUD, DUN, TILT, NOD, GRAB, STARE, GASP, ドン, 쾅), even when it is a real English word. Lines marked [outside bubbles] are not inside any speech bubble; a very short one of those is usually a sound effect.',
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
        onload: (res) => {
          if (!(res.status >= 200 && res.status < 300 && res.response)) { reject(new Error(`圖片下載失敗（HTTP ${res.status}）`)); return; }
          // 標上圖片格式（有些瀏覽器解碼沒有格式的資料時比較挑）：先看伺服器說的，沒有就看副檔名
          const ext = ((/\.([a-z0-9]+)(?:[?#]|$)/i.exec(url) || [])[1] || '').toLowerCase();
          const ct = (/^content-type:\s*(image\/[\w.+-]+)/im.exec(res.responseHeaders || '') || [])[1]
            || { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', bmp: 'image/bmp' }[ext] || '';
          resolve(new Blob([res.response], ct ? { type: ct } : {}));
        },
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

  /**
   * 畫圖片的其中一塊：來源範圍超出圖片一點點（例如縮放後的小數）時，Safari 會整塊都不畫（Chrome 會自動裁掉），
   * iPhone 上切出來的圖就變成一片空白、認不到字。先把來源範圍裁在圖片裡，畫的位置照比例跟著裁
   */
  function mtDrawClip(g, src, sx, sy, sw, sh, dx, dy, dw, dh) {
    const W = src.naturalWidth || src.videoWidth || src.width;
    const H = src.naturalHeight || src.videoHeight || src.height;
    const x0 = Math.max(0, sx);
    const y0 = Math.max(0, sy);
    const x1 = Math.min(W, sx + sw);
    const y1 = Math.min(H, sy + sh);
    if (!(sw > 0 && sh > 0 && x1 > x0 && y1 > y0)) return;
    const kx = dw / sw;
    const ky = dh / sh;
    g.drawImage(src, x0, y0, x1 - x0, y1 - y0, dx + (x0 - sx) * kx, dy + (y0 - sy) * ky, (x1 - x0) * kx, (y1 - y0) * ky);
  }

  async function mtSliceImage(bmp, plan, i, lossless) {
    const [y0, y1] = plan.cuts[i];
    const hh = Math.max(1, y1 - y0);
    const c = mtCanvas(plan.W, hh);
    const g = c.getContext('2d');
    g.fillStyle = '#FFFFFF'; // 透明的地方補白底
    g.fillRect(0, 0, plan.W, hh);
    g.imageSmoothingQuality = 'high';
    mtDrawClip(g, bmp, 0, y0 / plan.k, plan.W0, hh / plan.k, 0, 0, plan.W, hh);
    // 只留壓縮過的圖：整話先下載時不會吃掉太多記憶體。免費模式要辨識文字，用不失真的 PNG
    const blob = await mtToBlob(c, lossless ? 'image/png' : 'image/jpeg', 0.82);
    return { i, y0, y1, blob };
  }

  /** 白底黑字的測試圖（HELLO WORLD / THIS IS A TEST）：檢查認字程式在這個瀏覽器算得對不對 */
  async function mtTestBlob() {
    const c = mtCanvas(560, 150);
    const g = c.getContext('2d');
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, 560, 150);
    g.fillStyle = '#000000';
    g.textBaseline = 'middle';
    g.font = 'bold 46px Arial, Helvetica, sans-serif';
    g.fillText('HELLO WORLD', 28, 52);
    g.font = 'bold 32px Arial, Helvetica, sans-serif';
    g.fillText('THIS IS A TEST', 28, 112);
    return mtToBlob(c, 'image/png');
  }

  /* ---------- 譯文排版：找出最大、放得進方框的字級，並平均每行長度 ---------- */

  let mtCtx = null;
  function mtMeasureCtx() {
    if (!mtCtx) mtCtx = mtCanvas(4, 4).getContext('2d');
    return mtCtx;
  }
  /* ---------- 簡體字轉繁體（翻譯偶爾混進簡體字時） ---------- */
  // 前 2001 個是只有簡體才用的字（看到才轉換），後面是簡體、繁體都有的字（確定是簡體文字時才一起轉）
  const MT_S2T_N = 2001;
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
    + '鞑谎讳泻苇谣蚁潇粪诛栋谴衮堕鲟浇绞窦鲍钞讶琐滤锰绅窍鸽捡驯骡澜洼鳌镶挟邹俭缆聂芜骆呕羡厕窥铮矶晖瞩缀浊缉焖绽谬垦诰驹羁嚣辫蝇汹惭娴韧缕涩缎饷濒鳙筛椭鸪矫诲钥饵桨'
    + '樱鹧笃侣咏翘鲤拣骞鳄栅绰鸠锯莹脓闺颐钛溅绢烁瘫疮蓦攒铀荤鲨诬镍槛鸳赎玺蝉馈删韬祷鸯烩锭胧坞轧觑绉毡慑鲢聋炖嫔瘾钝姹讥馒鲸镁颌颅讧锜绷赂蚂瓮辇陇辕狈袜栈筝铬糍涝驸'
    + '椁惮绥荧枭殡尧桦呛赃挚搀袄岚侥箫砾睐秽诣拧砚橱馔锈诫榄惫龚谍沥掳萤鹊炽羟嘘辍涤贻缰崭阄衅堑烃绎驷谟颓谌绊镂涧钨珑鬓枫雏踌笺绾茧阉辙姗屉驮噜陨钵钳蓟镐咙钴栎锄跷骏'
    + '讹鳖笋馋馏叽闵纨铖跄钗馍鳔饺矾掺莺庑痪娲渎谒锺棂谛涟酝喽锏绗辗癫稣鳃锚跻绛篱诘缭鳇珰鱿赘蹿钡饪轶殴铿鸾钒绚焘疡邺赈玮麽悯袅赁驭泾谥渍啧纶鳝娆昙巅嬷秆鲇迩镀绐缙斓'
    + '鹘鳅蔼帧俨镏蜕嗳痉亸绯槟躏挛雳撵讪锂铐镰纭蔷讷藓绶骁恻绫镯阖挝匮颍椤绌祎谚鸱柠谙抠蹑谩怂钯虱涣哝肮峦锢绔缪钼怅龋镞谑馅诠迳鲵钮浒哒飕唠狞闩泸谝饬浃亵纣郸铂赡荪辏'
    + '抡赍疟铢恺诃饴铣邬瓒垩馐贰鹄螨剐鲥谄缨榈骋谶鹦辄娄蜗篓晔绠蛊骈锑鸥埙龛缈崄砺惬滦觐骅莼牍擞鳜谤飚缄兖忏涞诅炀啰谀岘诙阑犊钑鲛龅缢辔纰帻龈鳊闾闫鞯鳗昵桧讫铎缤飙闰'
    + '钰岖诽虬峣绦鲶铳毂嘤荚隽恸铠髅鲌轼銮脐绱誊荟烬饯颚谆涢琏鹗猬忾橹鲩飒戯獭胫鹉呗缥硚殓锵纫缂罂铵猕鳎疱萦牦缇莅锹瓯绻诳铡栉狰镌睑镉浐镣瘪狲妫鹫氲鹞荞颉箩俪飓偻啮掸'
    + '骥崂闳桢囱颏辘潍轭嗫鸵涚缱籁啬辂鲈缫暧郓阈镗腼霭痈鹭碛趸缃铰谗妩裆癞馁痫鸩佥诩刍娅馄镫饨辎渌阂玑诤纾幂钤绁鹑撸铆诨铏诿摈阊饽荥咛缒颔砻魇泞诟硷诂腭娈鸨犷镕跸鲫缜'
    + '诓绺铩谧唢赊缟龇沣锟觊鹪蛰苎癣贲弑觎钺锆撺绀鼋匦锨褴赟奁苋俣锉骊伫怆龌锗龊彨鸬孪谪厩梾欤靓鲑颧骢龃咝崃铨厍鳕怼愠钽飨绲懑桠逦椟谔蹒珐瑷珲馀绋纥骠钏谡褛饩浔垭诌龉'
    + '镳浉蛎皑铛缌讵馊挞缡谯钍铤谲嵘苁闱殚痨铌廪镭刽桡锶诜诮蛏苌镦掼讴鲧铋瘿颦穑脍筜蒀赝鲎扪叆靥鲂雠镓钚韪铄傩婵缬帼铍氩鹜殒沤馕茏镬霁峥绂钹诒缛荨谠阗瘘赀阋锾馑郏阆鲆'
    + '鹳镠鲱陉徕骛诋咤鹌眬谖鼍龀阕锷薮殁黾揿凫囵戗鸢诖蘖铯颞蝼铱钪蔺钿侬怄骧傥纡觯钎锲阇鹬眦荦轲顼芗颛箧呓赅讣錾籴赜狯砀闿龆觞诔箓缗缧荩鸮俦钜喾鸷鲷镢鞒谘奂碜荠阒栾饧'
    + '潴炝铉铙齑辊炜讦镅麸厣旸鹁哕蛴粜虮蛲钖骜粝裢镊鸹魉饫韫锞铔铧缣锃闶聩蚬钋锝髋樯籼栀恽鲋砗篑趱妪锒榉蹰桤蛳邝镟鹆诹闼渑绡舻鲡镒侪膑跹锕阌镔氇溆轸垅颢抟莸彟驽轫铷殇'
    + '钇缯砜撷阏糁缏缦锊濑埚垯诎栊烨偬呒赉鳟涠铟馓襕谇郦帏懔罴跶铊峤颀鹚鹕锓谵钌哔鲠鳏贽琎笕锇鲖硗峄锖鲀鸺箪鹂绨莴秾虿蝾锸镧鲅鲽鸶阍餍茔渖锩饣鲳呖钫鹇鞲蓥愦硖骓谳柽祢'
    + '着后里于种万几党据广价准极划确余占采斗胜范适云愿筑叶厂丰挂虫尸杰涌腊涂咸荐郁夸仆丑朴柜佣蜡帘淀游';
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
    + '韃謊諱瀉葦謠蟻瀟糞誅棟譴袞墮鱘澆絞竇鮑鈔訝瑣濾錳紳竅鴿撿馴騾瀾窪鰲鑲挾鄒儉纜聶蕪駱嘔羨廁窺錚磯暉矚綴濁緝燜綻謬墾誥駒羈囂辮蠅洶慚嫻韌縷澀緞餉瀕鱅篩橢鴣矯誨鑰餌槳'
    + '櫻鷓篤侶詠翹鯉揀騫鱷柵綽鳩鋸瑩膿閨頤鈦濺絹爍癱瘡驀攢鈾葷鯊誣鎳檻鴛贖璽蟬饋刪韜禱鴦燴錠朧塢軋覷縐氈懾鰱聾燉嬪癮鈍奼譏饅鯨鎂頜顱訌錡繃賂螞甕輦隴轅狽襪棧箏鉻餈澇駙'
    + '槨憚綏熒梟殯堯樺嗆贓摯攙襖嵐僥簫礫睞穢詣擰硯櫥饌鏽誡欖憊龔諜瀝擄螢鵲熾羥噓輟滌貽韁嶄鬮釁塹烴繹駟謨頹諶絆鏤澗鎢瓏鬢楓雛躊箋綰繭閹轍姍屜馱嚕隕缽鉗薊鎬嚨鈷櫟鋤蹺駿'
    + '訛鱉筍饞餾嘰閔紈鋮蹌釵饃鰾餃礬摻鶯廡瘓媧瀆謁鍾欞諦漣醞嘍鐧絎輾癲穌鰓錨躋絳籬詰繚鰉璫魷贅躥鋇飪軼毆鏗鸞釩絢燾瘍鄴賑瑋麼憫嫋賃馭涇諡漬嘖綸鱔嬈曇巔嬤稈鯰邇鍍紿縉斕'
    + '鶻鰍藹幀儼鎦蛻噯痙嚲緋檳躪攣靂攆訕鋰銬鐮紜薔訥蘚綬驍惻綾鐲闔撾匱潁欏絀禕諺鴟檸諳摳躡謾慫鈀蝨渙噥骯巒錮絝繆鉬悵齲鏃謔餡詮逕鯢鈕滸噠颼嘮獰閂瀘諞飭浹褻紂鄲鉑贍蓀輳'
    + '掄齎瘧銖愷訶飴銑鄔瓚堊饈貳鵠蟎剮鰣諂纓櫚騁讖鸚輒婁蝸簍曄綆蠱駢銻鷗壎龕緲嶮礪愜灤覲驊蓴牘擻鱖謗飈緘兗懺淶詛煬囉諛峴詼闌犢鈒鮫齙縊轡紕幘齦鯿閭閆韉鰻暱檜訖鐸繽飆閏'
    + '鈺嶇誹虯嶢絛鯰銃轂嚶莢雋慟鎧髏鮊軾鑾臍鞝謄薈燼餞顎諄溳璉鶚蝟愾櫓鯇颯戱獺脛鵡唄縹礄殮鏘紉緙罌銨獼鰨皰縈犛緹蒞鍬甌綣誑鍘櫛猙鐫瞼鎘滻鐐癟猻媯鷲氳鷂蕎頡籮儷颶僂齧撣'
    + '驥嶗閎楨囪頦轆濰軛囁鴕涗繾籟嗇輅鱸繅曖鄆閾鏜靦靄癰鷺磧躉緗鉸讒嫵襠癩餒癇鴆僉詡芻婭餛鐙飩輜淥閡璣諍紓冪鈐紲鶉擼鉚諢鉶諉擯閶餑滎嚀縋頷礱魘濘詬礆詁顎孌鴇獷鎔蹕鯽縝'
    + '誆綹鎩謐嗩賒縞齜灃錕覬鷦蟄苧癬賁弒覦鉞鋯攛紺黿匭鍁襤贇奩莧俁銼驪佇愴齷鍺齪彲鸕孿謫廄棶歟靚鮭顴驄齟噝崍銓厙鱈懟慍鉭饗緄懣椏邐櫝諤蹣琺璦琿餘紼紇驃釧謖褸餼潯埡謅齬'
    + '鑣溮蠣皚鐺緦詎餿撻縭譙釷鋌譎嶸蓯闈殫癆鈮廩鐳劊橈鍶詵誚蟶萇鐓摜謳鯀鉍癭顰穡膾簹蒕贗鱟捫靉靨魴讎鎵鈈韙鑠儺嬋纈幗鈹氬鶩殞漚饢蘢鑊霽崢紱鈸詒縟蕁讜闐瘻貲鬩鍰饉郟閬鮃'
    + '鸛鏐鯡陘徠騖詆吒鵪矓諼鼉齔闋鍔藪歿黽撳鳧圇戧鳶詿櫱銫顳螻銥鈧藺鈿儂慪驤儻紆觶釺鍥闍鷸眥犖軻頊薌顓篋囈賅訃鏨糴賾獪碭闓齠觴誄籙緡縲藎鴞儔鉅嚳鷙鯛钁鞽諮奐磣薺闃欒餳'
    + '瀦熗鉉鐃齏輥煒訐鎇麩厴暘鵓噦蠐糶蟣蟯鍚驁糲褳鑷鴰魎飫韞錁錏鏵縑鋥閌聵蜆釙鍀髖檣秈梔惲鮒硨簣趲嫗鋃櫸躕榿螄鄺鏇鵒諏闥澠綃艫鱺鎰儕臏躚錒閿鑌氌漵軫壠顥摶蕕彠駑軔銣殤'
    + '釔繒碸擷閼糝緶縵鋝瀨堝墶詘櫳燁傯嘸賚鱒潿銦饊襴誶酈幃懍羆躂鉈嶠頎鷀鶘鋟譫釕嗶鯁鰥贄璡筧鋨鮦磽嶧錆魨鵂簞鸝綈萵穠蠆蠑鍤鑭鮁鰈鷥閽饜塋瀋錈飠鯧嚦鈁鷳韝鎣憒硤騅讞檉禰'
    + '著後裡於種萬幾黨據廣價準極劃確餘佔採鬥勝範適雲願築葉廠豐掛蟲屍傑湧臘塗鹹薦鬱誇僕醜樸櫃傭蠟簾澱遊';
  const MT_S2T_P = '头发 頭髮,理发 理髮,白发 白髮,金发 金髮,黑发 黑髮,银发 銀髮,长发 長髮,短发 短髮,秀发 秀髮,发型 髮型,发丝 髮絲,日历 日曆,农历 農曆,复杂 複雜,重复 重複,复制 複製,复习 複習,复印 複印,回复 回覆,答复 答覆,反复 反覆,胡须 鬍鬚,胡子 鬍子,冲洗 沖洗,冲澡 沖澡,冲泡 沖泡,收获 收穫,尽管 儘管,尽量 儘量,尽快 儘快,苏醒 甦醒,钟情 鍾情,钟爱 鍾愛,恶心 噁心,抽烟 抽菸,香烟 香菸,词汇 詞彙,标签 標籤,抽签 抽籤,书签 書籤,赞成 贊成,赞同 贊同,赞助 贊助,心脏 心臟,内脏 內臟,肝脏 肝臟,干什么 幹什麼,干嘛 幹嘛,干吗 幹嘛,干掉 幹掉,干活 幹活,能干 能幹,干得 幹得,干净 乾淨,干杯 乾杯,干脆 乾脆,干燥 乾燥,饼干 餅乾,皇后 皇后,王后 王后,太后 太后,公里 公里,千里 千里,万里 萬里,里程 里程,邻里 鄰里,故里 故里,英里 英里,不准 不准,批准 批准,准许 准許,占卜 占卜,风采 風采,神采 神采,文采 文采,北斗 北斗,漏斗 漏斗,斗篷 斗篷,小丑 小丑,佣金 佣金,拜托 拜託,委托 委託,托付 託付,家伙 傢伙,伙伴 夥伴,同伙 同夥,游泳 游泳,上游 上游,下游 下游,划船 划船,一只 一隻,两只 兩隻,几只 幾隻,这只 這隻,那只 那隻,每只 每隻,面条 麵條,拉面 拉麵,泡面 泡麵,关系 關係,没关系 沒關係,联系 聯繫,特征 特徵,象征 象徵,征求 徵求,凶手 兇手,凶狠 兇狠,凶残 兇殘,制作 製作,制造 製造,制品 製品,印制 印製,绘制 繪製,录制 錄製,定制 訂製,放松 放鬆,轻松 輕鬆,松开 鬆開,松了 鬆了,宽松 寬鬆,舍不得 捨不得,舍弃 捨棄,施舍 施捨,精致 精緻,细致 細緻,别致 別緻,借口 藉口,防御 防禦,抵御 抵禦,注册 註冊,注释 註釋,注销 註銷,咨询 諮詢,周末 週末,周年 週年,周一 週一,周二 週二,周三 週三,周四 週四,周五 週五,周六 週六,周日 週日,一周 一週,上周 上週,下周 下週,本周 本週,每周 每週,手表 手錶,钟表 鐘錶,刮风 颳風';
  let mtS2TData = null;
  function mtS2TLoad() {
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
    return mtS2TData;
  }
  function mtS2T(t) {
    const { chars, uniq, phrases, maxP } = mtS2TLoad();
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

  /* ======================================================================
   * 簡體網頁轉繁體：看出是簡體中文的網頁才轉（日文網頁不轉），之後載入的內容也會轉
   * ==================================================================== */
  let s2tOn = false; // 這一頁（最上層）正在轉成繁體：設定面板顯示「本頁」
  function startPageS2T() {
    const doc = document;
    const SKIP = 'script,style,noscript,template,textarea,code,pre,kbd,samp,var';
    const ATTRS = ['title', 'placeholder', 'alt', 'aria-label'];
    const KANA = /[\u3040-\u30FF]/;
    const CJK = /[\u4E00-\u9FFF]/;
    const { uniq } = mtS2TLoad();
    const lang = () => (doc.documentElement && doc.documentElement.lang) || '';
    /** 這段文字是不是簡體中文：有夠多只有簡體才用的字，而且幾乎沒有假名（日文） */
    const isSimp = (t) => {
      let cjk = 0;
      let simp = 0;
      let kana = 0;
      for (const ch of t) {
        const c = ch.charCodeAt(0);
        if (c >= 0x3040 && c <= 0x30FF) kana++;
        else if (c >= 0x4E00 && c <= 0x9FFF) { cjk++; if (uniq.has(ch)) simp++; }
      }
      return simp >= 3 && simp >= cjk * 0.03 && kana < (cjk + kana) * 0.15; // 日文的假名通常佔三成以上
    };
    const origText = new WeakMap(); // 文字節點 → 原文（關掉時還原）
    const origAttr = new WeakMap(); // 元素 → { 屬性: 原文 }
    const skip = (el) => !el || !!el.closest(SKIP) || el.isContentEditable;
    const convText = (n) => {
      const t = n.nodeValue;
      if (!t || !CJK.test(t) || KANA.test(t) || skip(n.parentElement)) return;
      const z = mtS2T(t);
      if (z === t) return;
      if (!origText.has(n)) origText.set(n, t);
      n.nodeValue = z;
    };
    const convAttrs = (el) => {
      for (const a of ATTRS) {
        const v = el.getAttribute(a);
        if (!v || !CJK.test(v) || KANA.test(v)) continue;
        const z = mtS2T(v);
        if (z === v) continue;
        let o = origAttr.get(el);
        if (!o) { o = {}; origAttr.set(el, o); }
        if (!(a in o)) o[a] = v;
        el.setAttribute(a, z);
      }
    };
    const walk = (root) => {
      if (!root) return;
      if (root.nodeType === 3) { convText(root); return; }
      if (root.nodeType !== 1) return;
      if (root.hasAttributes()) convAttrs(root);
      const tw = doc.createTreeWalker(root, 5); // 元素＋文字
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (n.nodeType === 3) convText(n);
        else if (n.hasAttributes()) convAttrs(n);
      }
    };
    let conv = null;
    let active = false;
    function activate() {
      if (active) return;
      active = true;
      if (IS_TOP) s2tOn = true;
      if (sniff) sniff.disconnect();
      walk(doc.documentElement);
      conv = new MutationObserver((ms) => {
        for (const m of ms) {
          if (m.type === 'childList') m.addedNodes.forEach(walk);
          else if (m.type === 'characterData') convText(m.target);
          else if (m.type === 'attributes') convAttrs(m.target);
        }
      });
      conv.observe(doc, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }
    // 還沒確定是簡體網頁：收集新出現的中文字來判斷（網頁一邊載入一邊看，確定了馬上轉，不會先閃一下簡體字）
    let buf = '';
    let checkedAt = 0;
    const check = () => {
      if (active || /^ja/i.test(lang())) return;
      if (isSimp(buf)) activate();
      else if (buf.length > 6000) { buf = buf.slice(-3000); checkedAt = buf.length; }
    };
    const feed = (t) => {
      if (active || !t || !/[\u3040-\u9FFF]/.test(t)) return;
      buf += t;
      if (buf.length - checkedAt < (checkedAt ? 200 : 40)) return;
      checkedAt = buf.length;
      check();
    };
    const sample = (node) => {
      if (node.nodeType === 3) { if (!skip(node.parentElement)) feed(node.nodeValue); return; }
      if (node.nodeType !== 1 || node.closest(SKIP)) return;
      const tw = doc.createTreeWalker(node, 4);
      let got = 0;
      for (let n = tw.nextNode(); n && got < 3000; n = tw.nextNode()) {
        if (n.parentElement && n.parentElement.closest(SKIP)) continue;
        got += n.nodeValue.length;
        feed(n.nodeValue);
        if (active) return;
      }
    };
    const sniff = new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === 'childList') { for (const n of m.addedNodes) { sample(n); if (active) return; } } else sample(m.target);
      }
    });
    // 從網頁一開始就看（還沒有 <html> 時也可以看整份文件）
    sniff.observe(doc, { childList: true, subtree: true, characterData: true });
    if (doc.documentElement) sample(doc.documentElement);
    // 字比較少的網頁：載入完再判斷一次
    doc.addEventListener('DOMContentLoaded', check, { once: true });
    return () => {
      doc.removeEventListener('DOMContentLoaded', check);
      sniff.disconnect();
      if (conv) conv.disconnect();
      if (IS_TOP) s2tOn = false;
      // 還原成原文
      if (!active) return;
      const tw = doc.createTreeWalker(doc.documentElement, 5);
      for (let n = tw.currentNode; n; n = tw.nextNode()) {
        if (n.nodeType === 3) { const o = origText.get(n); if (o !== undefined && n.nodeValue === mtS2T(o)) n.nodeValue = o; } else {
          const o = origAttr.get(n);
          if (o) for (const a of Object.keys(o)) n.setAttribute(a, o[a]);
        }
      }
    };
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
.mt-badge { position: absolute; left: 0; top: 0; transform-origin: 0 0; display: flex; flex-direction: column; gap: 5px; padding: 6px 10px 7px;
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
        // 進度標籤放在圖片「看得到的部分」的左上角，長條圖捲到中間也看得到；手機上網頁整頁縮小顯示時跟著介面放大
        const bz = uiZ;
        const seen = Math.max(0, -content.top) / (sy || 1);
        const y = (content.top - box.top) / (sy || 1) + Math.max(8 * bz, Math.min(seen + 8 * bz, nch - 48 * bz));
        badge.style.transform = `translate(${Math.round((content.left - box.left) / k + 8 * bz)}px, ${Math.round(y)}px)${bz > 1 ? ` scale(${bz})` : ''}`;
      }
      cw = ncw;
      ch = nch;
      if (Math.abs(cw - laidW) > 1 || Math.abs(ch - laidH) > 1) layout();
      return true;
    }

    /**
     * 譯文框的位置（圖片內容座標）。同一段字被拆成好幾塊、框互相重疊時合併成一個框；
     * 只有邊緣碰到的，從重疊處的中間分開。譯文框不會蓋住別的譯文。
     * 對話框（bub）的範圍是找出來的對話框內部：不會被分開或撐大，大半在裡面的其他字框併進來
     */
    function arrange() {
      const rs = blocks.map((b) => ({ x0: b.x0 * cw, y0: b.y0 * ch, x1: b.x1 * cw, y1: b.y1 * ch, zh: b.zh, vertical: !!b.vertical,
        bub: !!b.bub, bg: b.bg || '', shape: b.bub ? b.shape || '' : '', rows: b.bub ? b.rows || null : null, lh: b.lh > 0 ? b.lh * cw : 0, blank: !!b.blank, seam: !!b.seam }));
      const ov = (a, c) => [Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0), Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0)];
      const area = (a) => (a.x1 - a.x0) * (a.y1 - a.y0);
      /** 方框 o 有多少在對話框 B 的形狀裡（抽樣） */
      const inFrac = (o, B) => {
        let n = 0;
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 6; j++) if (mtInShape(B, o.x0 + ((o.x1 - o.x0) * (i + 0.5)) / 6, o.y0 + ((o.y1 - o.y0) * (j + 0.5)) / 6)) n++;
        }
        return n / 36;
      };
      for (let again = true; again;) {
        again = false;
        for (let i = 0; i < rs.length && !again; i++) {
          for (let j = i + 1; j < rs.length; j++) {
            const a = rs[i];
            const c = rs[j];
            const [ix, iy] = ov(a, c);
            if (ix <= 0 || iy <= 0 || (a.bub && c.bub) || a.seam || c.seam) continue; // 接縫上的框兩張圖要一模一樣：不合併
            if (a.bub || c.bub) {
              const [B, o] = a.bub ? [a, c] : [c, a];
              if (inFrac(o, B) < 0.5) continue;
              rs[i] = Object.assign(mergeRect(a, c), { x0: B.x0, y0: B.y0, x1: B.x1, y1: B.y1, vertical: B.vertical, bub: true, bg: B.bg, shape: B.shape, rows: B.rows });
            } else {
              if (ix * iy < Math.min(area(a), area(c)) * 0.12) continue;
              rs[i] = mergeRect(a, c);
            }
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
          const lock = (r) => r.bub || r.seam; // 對話框、接縫上的框不動
          if (ix <= 0 || iy <= 0 || (lock(a) && lock(c))) continue;
          if ((a.bub && inFrac(c, a) < 0.03) || (c.bub && inFrac(a, c) < 0.03)) continue; // 只碰到對話框方框的角落（橢圓外面）
          // 對話框不動，另一個框退開；都不是對話框就從中間分開
          const moveA = !lock(a);
          const moveC = !lock(c);
          if (iy <= ix) {
            const [top, bot] = a.y0 + a.y1 <= c.y0 + c.y1 ? [a, c] : [c, a];
            const mid = moveA && moveC ? (bot.y0 + top.y1) / 2 : lock(top) ? top.y1 : bot.y0;
            if (!lock(top)) top.y1 = mid;
            if (!lock(bot)) bot.y0 = mid;
          } else {
            const [lf, rt] = a.x0 + a.x1 <= c.x0 + c.x1 ? [a, c] : [c, a];
            const mid = moveA && moveC ? (rt.x0 + lf.x1) / 2 : lock(lf) ? lf.x1 : rt.x0;
            if (!lock(lf)) lf.x1 = mid;
            if (!lock(rt)) rt.x0 = mid;
          }
        }
      }
      return rs.filter((r) => r.x1 - r.x0 > 2 && r.y1 - r.y0 > 2);
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
      return { x0: Math.min(a.x0, c.x0), y0: Math.min(a.y0, c.y0), x1: Math.max(a.x1, c.x1), y1: Math.max(a.y1, c.y1), zh, vertical,
        lh: Math.max(a.lh || 0, c.lh || 0), bub: false, bg: '', shape: '', rows: null, blank: !!(a.blank && c.blank) };
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
      // 字級上限：整頁看起來一致，不比原文的字大太多
      let maxFont = Math.max(13, cw * 0.055);
      if (r.lh > 0) maxFont = Math.min(maxFont, Math.max(13, r.lh * 1.05));
      const fit = (w, hh) => {
        const inset = Math.max(2, Math.min(10, Math.min(w, hh) * 0.07));
        const iw = w - inset * 2;
        const ih = hh - inset * 2;
        let lay = mtLayout(r.zh, iw, ih, { maxFont });
        // 直排：原文是直排（日文漫畫），或對話框又高又窄。高窄的框橫排時一行只放得下兩三個字，直排比較好讀
        const tall = ih / Math.max(1, iw);
        if ((r.vertical && hh > w) || tall >= 1.3) {
          const v = mtLayout(r.zh, iw, ih, { maxFont, vertical: true });
          const need = r.vertical ? 0.75 : tall >= 1.8 ? 0.8 : 1.1;
          if (v && (!lay || (!v.overflow && (lay.overflow || v.s >= lay.s * need)))) lay = v;
        }
        return lay;
      };
      let x0;
      let y0;
      let x1;
      let y1;
      let lay;
      let area = null; // 譯文放在方框裡的哪一塊（0～1）：對話框不是方的時候，避開剪掉的角
      const better = (l) => l && (!lay || (!l.overflow && (lay.overflow || l.s > lay.s + 0.5)));
      // 被切在兩張圖中間的一句話，譯文放在另一張圖：這裡只蓋白底
      const blank = r.blank || !String(r.zh || '').trim();
      if (blank) {
        [x0, y0, x1, y1] = r.bub ? [Math.max(0, r.x0), Math.max(0, r.y0), Math.min(cw, r.x1), Math.min(ch, r.y1)] : clamp(r.x0 - pad, r.y0 - pad, r.x1 + pad, r.y1 + pad);
      } else if (r.bub) {
        // 對話框：範圍就是對話框裡面，直接用（接縫上的框會超出這張圖的上緣或下緣，超出的部分畫在另一張圖上）
        [x0, y0, x1, y1] = [Math.max(0, r.x0), r.seam ? r.y0 : Math.max(0, r.y0), Math.min(cw, r.x1), r.seam ? r.y1 : Math.min(ch, r.y1)];
        if (r.shape === 'ellipse') {
          // 橢圓形：白底蓋滿整個對話框，譯文排在裡面的方框（試幾種寬高，挑字最大的）
          for (const t of [0.707, 0.6, 0.8, 0.5, 0.88]) {
            const l = fit((x1 - x0) * t, (y1 - y0) * Math.sqrt(1 - t * t));
            if (better(l)) lay = l;
          }
        } else if (Array.isArray(r.rows) && r.rows.length >= 2) {
          // 其他形狀：方框的角超出對話框的部分會剪掉，譯文排在中間不會被剪到的地方
          for (const k of [1, 0.88, 0.76, 0.64]) {
            const a = 0.5 - k / 2;
            const z = 0.5 + k / 2;
            const sel = r.rows.filter((q) => q[0] >= a - 0.001 && q[0] <= z + 0.001);
            if (!sel.length) continue;
            const L = Math.max(...sel.map((q) => q[1]));
            const R = Math.min(...sel.map((q) => q[2]));
            if (R - L < 0.15) continue;
            const l = fit((x1 - x0) * (R - L), (y1 - y0) * k);
            if (better(l)) { lay = l; area = [L, a, R, z]; }
          }
          if (!lay) lay = fit(x1 - x0, y1 - y0);
        } else lay = fit(x1 - x0, y1 - y0);
      } else if (r.seam) {
        // 接縫上的字（不在對話框裡）：兩張圖要畫得一模一樣，不放大、不避開別的框
        [x0, y0, x1, y1] = [Math.max(0, r.x0 - pad), r.y0 - pad, Math.min(cw, r.x1 + pad), r.y1 + pad];
        lay = fit(x1 - x0, y1 - y0);
      } else {
        [x0, y0, x1, y1] = clamp(r.x0 - pad, r.y0 - pad, r.x1 + pad, r.y1 + pad);
        lay = fit(x1 - x0, y1 - y0);
        // 譯文比原文長、字會太小：在不蓋到其他譯文的範圍內，把方框一步步放大
        for (const [fx, fy] of [[0.25, 0.15], [0.5, 0.35], [0.9, 0.6]]) {
          if (!lay || (!lay.overflow && lay.s >= 10)) break;
          const gx = (r.x1 - r.x0 + pad * 2) * fx;
          const gy = (r.y1 - r.y0 + pad * 2) * fy;
          const e = clamp(r.x0 - pad - gx, r.y0 - pad - gy, r.x1 + pad + gx, r.y1 + pad + gy);
          const big = fit(e[2] - e[0], e[3] - e[1]);
          if (big && (!big.overflow || lay.overflow) && big.s > lay.s) { lay = big; [x0, y0, x1, y1] = e; }
        }
      }
      if (!lay && !blank) return null;
      placed.push({ x0, y0, x1, y1 });
      const w = x1 - x0;
      const hh = y1 - y0;
      const style = { left: x0 + 'px', top: y0 + 'px', width: w + 'px', height: hh + 'px' };
      // 圓角不超過留白的 3 倍：角落的原文一定蓋得到，又比較不會切到對話框的外框；對話框裡用對話框的底色
      style.borderRadius = r.shape === 'ellipse' ? '50%' : (r.shape === 'rect' ? 2 : r.bub ? Math.min(w, hh) * 0.2 : Math.min(pad * 3, Math.min(w, hh) * 0.3)) + 'px';
      if (r.bub && /^#[0-9a-f]{6}$/i.test(r.bg)) style.backgroundColor = r.bg;
      if (r.bub && !r.shape && Array.isArray(r.rows) && r.rows.length >= 2) {
        const pct = (v) => Math.round(v * 1000) / 10 + '%';
        style.borderRadius = '0';
        style.clipPath = 'polygon(' + r.rows.map((q) => `${pct(q[1])} ${pct(q[0])}`)
          .concat(r.rows.slice().reverse().map((q) => `${pct(q[2])} ${pct(q[0])}`)).join(', ') + ')';
      }
      if (area) {
        style.paddingLeft = area[0] * w + 'px';
        style.paddingTop = area[1] * hh + 'px';
        style.paddingRight = (1 - area[2]) * w + 'px';
        style.paddingBottom = (1 - area[3]) * hh + 'px';
      }
      if (blank) return h('div', { class: 'b' + (r.bub ? ' bub' : ''), style });
      return h('div', { class: 'b' + (r.bub ? ' bub' : ''), style },
        h('div', { class: 't' + (lay.vertical ? ' v' : ''), style: { fontSize: lay.s + 'px' } }, lay.lines.map((t) => h('div', { text: t }))));
    }

    function layout() {
      laidW = cw;
      laidH = ch;
      if (!cw || !ch) { layer.replaceChildren(); return; }
      let rs = [];
      try { rs = arrange(); } catch (e) { mtWarn('漫畫翻譯排版失敗', e); }
      const els = [];
      const placed = [];
      for (const r of rs) {
        try { const el = boxEl(r, rs, placed); if (el) els.push(el); } catch (e) { mtWarn('漫畫翻譯排版失敗', e); }
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
    /** 來源範圍超出圖片時 Safari 整塊不畫：先裁在圖片裡，畫的位置照比例跟著裁 */
    const drawClip = (g, src, sx, sy, sw, sh, dx, dy, dw, dh) => {
      const x0 = Math.max(0, sx);
      const y0 = Math.max(0, sy);
      const x1 = Math.min(src.width, sx + sw);
      const y1 = Math.min(src.height, sy + sh);
      if (!(sw > 0 && sh > 0 && x1 > x0 && y1 > y0)) return;
      const kx = dw / sw;
      const ky = dh / sh;
      g.drawImage(src, x0, y0, x1 - x0, y1 - y0, dx + (x0 - sx) * kx, dy + (y0 - sy) * ky, (x1 - x0) * kx, (y1 - y0) * ky);
    };

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
      const D = out[S.det.outputNames[0]].data;
      // 診斷用：送進模型的圖平均亮度、模型輸出的最大值、超過門檻的點數、壞掉的數字（NaN）有幾個
      if (o.stats) {
        let lum = 0;
        let k = 0;
        for (let j = 0; j < px.length; j += 4 * 7, k++) lum += (px[j] + px[j + 1] + px[j + 2]) / 3;
        let mx = -Infinity;
        let above = 0;
        let nan = 0;
        for (let i = 0; i < D.length; i++) {
          const v = D[i];
          if (Number.isNaN(v)) { nan++; continue; }
          if (v > mx) mx = v;
          if (v > (o.thresh || 0.2)) above++;
        }
        o.stats = { in: [w, h], src: [W, H], lum: Math.round(lum / Math.max(1, k)), max: Math.round(mx * 1000) / 1000, above, nan, n: D.length };
      }
      return boxesOf(D, w, h, w / W, h / H, W, H, o);
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

    /* ---------- 找對話框：字的四周是一整塊被外框圍起來的白色（或很淺的顏色） ---------- */
    /**
     * 回傳每個對話框裡可以放字的最大方框（x0～y1）、對話框的範圍（bx0～by1）和底色；每個字框加上 bub（第幾個對話框，-1 是不在對話框裡）。
     * 沒有圍起來（連到圖片邊緣）、比裡面的字大太多、形狀太奇怪的白色區域不算。
     */
    function bubbles(bmp, boxes, extra) {
      const out = [];
      boxes.forEach((b) => { b.bub = -1; });
      if (!boxes.length) return out;
      const W = bmp.width;
      const H = bmp.height;
      const f = Math.max(1, Math.round(Math.sqrt((W * H) / 500000))); // 縮小成每格 f×f 個像素
      const gw = Math.ceil(W / f);
      const gh = Math.ceil(H / f);
      const n = gw * gh;
      const c = canvas(W, H);
      const g = c.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#FFFFFF';
      g.fillRect(0, 0, W, H);
      g.drawImage(bmp, 0, 0);
      const px = g.getImageData(0, 0, W, H).data;
      // 每格取最暗的像素：細的外框縮小後也不會不見
      const lum = new Uint8Array(n).fill(255);
      for (let y = 0, j = 0; y < H; y++) {
        const row = ((y / f) | 0) * gw;
        for (let x = 0; x < W; x++, j += 4) {
          const v = (px[j] * 77 + px[j + 1] * 150 + px[j + 2] * 29) >> 8;
          const q = row + ((x / f) | 0);
          if (v < lum[q]) lum[q] = v;
        }
      }
      // 白色的格子：周圍一格內都夠亮（外框上的小缺口順便補起來）
      const tmp = new Uint8Array(n);
      for (let y = 0; y < gh; y++) {
        const o = y * gw;
        for (let x = 0; x < gw; x++) {
          let v = lum[o + x];
          if (x > 0 && lum[o + x - 1] < v) v = lum[o + x - 1];
          if (x < gw - 1 && lum[o + x + 1] < v) v = lum[o + x + 1];
          tmp[o + x] = v;
        }
      }
      const white = new Uint8Array(n);
      for (let q = 0; q < n; q++) {
        let v = tmp[q];
        if (q >= gw && tmp[q - gw] < v) v = tmp[q - gw];
        if (q + gw < n && tmp[q + gw] < v) v = tmp[q + gw];
        white[q] = v >= 200 ? 1 : 0;
      }
      // 連在一起的白色區域（上下左右相連）：用到才找
      const lab = new Int32Array(n);
      const comps = [null];
      const stack = new Int32Array(n);
      const fill = (seed) => {
        const id = comps.length;
        const s = { area: 0, x0: gw, y0: gh, x1: -1, y1: -1, e: [0, 0, 0, 0] }; // e：碰到上、下、左、右邊緣的格數
        comps.push(s);
        let sp = 0;
        stack[sp++] = seed;
        lab[seed] = id;
        while (sp) {
          const q = stack[--sp];
          const x = q % gw;
          const y = (q - x) / gw;
          s.area++;
          if (x < s.x0) s.x0 = x;
          if (x > s.x1) s.x1 = x;
          if (y < s.y0) s.y0 = y;
          if (y > s.y1) s.y1 = y;
          if (y === 0) s.e[0]++;
          if (y === gh - 1) s.e[1]++;
          if (x === 0) s.e[2]++;
          if (x === gw - 1) s.e[3]++;
          if (x > 0 && white[q - 1] && !lab[q - 1]) { lab[q - 1] = id; stack[sp++] = q - 1; }
          if (x < gw - 1 && white[q + 1] && !lab[q + 1]) { lab[q + 1] = id; stack[sp++] = q + 1; }
          if (y > 0 && white[q - gw] && !lab[q - gw]) { lab[q - gw] = id; stack[sp++] = q - gw; }
          if (y < gh - 1 && white[q + gw] && !lab[q + gw]) { lab[q + gw] = id; stack[sp++] = q + gw; }
        }
        return id;
      };
      const cellsOf = (b) => [Math.max(0, Math.floor(b.x0 / f)), Math.max(0, Math.floor(b.y0 / f)),
        Math.min(gw - 1, Math.ceil(b.x1 / f) - 1), Math.min(gh - 1, Math.ceil(b.y1 / f) - 1)];
      // 每個字框屬於哪一塊白色：字框裡（字的四周留有一點空白）的白色格子，大多屬於的那一塊（字母裡的小洞不算）
      const compOf = (b) => {
        const [x0, y0, x1, y1] = cellsOf(b);
        const cnt = new Map();
        let tot = 0;
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const q = y * gw + x;
            if (!white[q]) continue;
            const id = lab[q] || fill(q);
            const s = comps[id];
            if (s.x0 >= x0 && s.x1 <= x1 && s.y0 >= y0 && s.y1 <= y1) continue;
            cnt.set(id, (cnt.get(id) || 0) + 1);
            tot++;
          }
        }
        let best = 0;
        let bn = 0;
        for (const [id, k] of cnt) if (k > bn) { bn = k; best = id; }
        return best && bn >= tot * 0.6 ? best : 0;
      };
      const byComp = new Map();
      boxes.forEach((b, i) => {
        const id = compOf(b);
        if (!id) return;
        if (!byComp.has(id)) byComp.set(id, []);
        byComp.get(id).push(i);
      });
      // 認不太出來的字框（Y—?、單一個字母）：不拿來找對話框，但在找到的對話框裡面的話一起算（一起蓋白底）
      const extraBy = new Map();
      for (const b of extra || []) {
        b.bub = -1;
        const id = compOf(b);
        if (!id || !byComp.has(id)) continue;
        if (!extraBy.has(id)) extraBy.set(id, []);
        extraBy.get(id).push(b);
      }
      for (const [id, list] of byComp) {
        const s = comps[id];
        // 碰到圖片邊緣的：只接受被一個邊切掉一段的對話框（接在上一張圖的對話框常常這樣）；碰到兩邊以上、貼著邊緣一大段的是背景
        const sides = s.e.filter((v) => v > 0).length;
        const cut = sides === 1;
        if (sides > 1 || (cut && (s.e.some((v, i) => v > (i < 2 ? gw : gh) * 0.6)
          || (s.e[0] || s.e[1] ? s.x1 - s.x0 + 1 > gw * 0.85 : s.y1 - s.y0 + 1 > gh * 0.85)))) continue;
        /** 字的範圍（往內縮一點，大約是字本身）：字太靠近外框時，字和外框會連在一起，所以字本身直接算在對話框裡 */
        const coreOf = (b) => {
          const e = Math.min(b.x1 - b.x0, b.y1 - b.y0) * 0.18;
          return [Math.max(0, Math.floor((b.x0 + e) / f)), Math.max(0, Math.floor((b.y0 + e) / f)),
            Math.min(gw - 1, Math.ceil((b.x1 - e) / f) - 1), Math.min(gh - 1, Math.ceil((b.y1 - e) / f) - 1)];
        };
        const core = list.map((i) => coreOf(boxes[i]));
        // 範圍：白色區域加上整個字框（字框可能超出對話框一點）
        const full = list.map((i) => cellsOf(boxes[i]));
        const X0 = Math.min(s.x0, ...full.map((c) => c[0]));
        const Y0 = Math.min(s.y0, ...full.map((c) => c[1]));
        const bw = Math.max(s.x1, ...full.map((c) => c[2])) - X0 + 1;
        const bh = Math.max(s.y1, ...full.map((c) => c[3])) - Y0 + 1;
        if (bw < 4 || bh < 4) continue;
        // 裡面的洞（字、小圖案）也算對話框的一部分：從範圍邊緣走不到的地方都在裡面
        const m = new Uint8Array(bw * bh); // 1：白色區域，2：外面，3：字
        let rs = 0; let gs = 0; let bs = 0; let cs = 0;
        for (let y = 0; y < bh; y++) {
          const o = (y + Y0) * gw + X0;
          for (let x = 0; x < bw; x++) {
            if (lab[o + x] !== id) continue;
            m[y * bw + x] = 1;
            if ((x + y) % 3) continue; // 底色：抽樣平均
            const j = ((Math.min(H - 1, (y + Y0) * f + (f >> 1)) * W) + Math.min(W - 1, (x + X0) * f + (f >> 1))) * 4;
            rs += px[j]; gs += px[j + 1]; bs += px[j + 2]; cs++;
          }
        }
        for (const c of core) {
          for (let y = c[1] - Y0; y <= c[3] - Y0; y++) for (let x = c[0] - X0; x <= c[2] - X0; x++) m[y * bw + x] = m[y * bw + x] || 3;
        }
        let sp = 0;
        const outside = (k) => { if (!m[k]) { m[k] = 2; stack[sp++] = k; } };
        for (let x = 0; x < bw; x++) { outside(x); outside((bh - 1) * bw + x); }
        for (let y = 0; y < bh; y++) { outside(y * bw); outside(y * bw + bw - 1); }
        while (sp) {
          const k = stack[--sp];
          const x = k % bw;
          if (x > 0) outside(k - 1);
          if (x < bw - 1) outside(k + 1);
          if (k >= bw) outside(k - bw);
          if (k + bw < bw * bh) outside(k + bw);
        }
        let inside = 0;
        for (let k = 0; k < m.length; k++) if (m[k] !== 2) inside++;
        const isIn = (x, y) => x >= 0 && y >= 0 && x < bw && y < bh && m[y * bw + x] !== 2;
        let text = 0;
        for (const i of list) { const b = boxes[i]; text += ((b.x1 - b.x0) * (b.y1 - b.y0)) / (f * f); }
        // 對話框大多是圓的、方的：範圍裡大半是對話框；也不會比裡面的字大太多（大片空白的背景不算；大喊的大框裡常常只有幾個字）
        if (inside < bw * bh * (cut ? 0.65 : 0.5) || inside > text * (cut ? 15 : 60)) continue;
        // 這個對話框裡的所有字框：認得出的字，加上大部分在對話框裡面的其他字框
        const all = list.map((i) => boxes[i]);
        const extraSet = new Set();
        for (const b of extraBy.get(id) || []) {
          const [x0, y0, x1, y1] = cellsOf(b);
          let tin = 0;
          let tot = 0;
          for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { tot++; if (isIn(x - X0, y - Y0)) tin++; }
          if (tot && tin >= tot * 0.85) { all.push(b); extraSet.add(b); }
        }
        const hex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
        const bg = cs ? '#' + hex(rs / cs) + hex(gs / cs) + hex(bs / cs) : '#ffffff';
        /** 一個對話框（mask 是它的範圍；8 字形切開的話是其中一塊）：找形狀、放譯文的地方，輸出 */
        const emit = (L, pm, et, eb) => {
          const inP = (x, y) => x >= 0 && y >= 0 && x < bw && y < bh && pm[y * bw + x] !== 2;
          let pin = 0;
          let qx0 = bw; let qy0 = bh; let qx1 = -1; let qy1 = -1; // 白色區域的範圍
          for (let y = 0; y < bh; y++) {
            for (let x = 0; x < bw; x++) {
              const v = pm[y * bw + x];
              if (v === 2) continue;
              pin++;
              if (v !== 1) continue;
              if (x < qx0) qx0 = x;
              if (x > qx1) qx1 = x;
              if (y < qy0) qy0 = y;
              if (y > qy1) qy1 = y;
            }
          }
          if (qx1 < 0) return;
          // 兩個對話框連在一起時（外框中間有缺口）分開：字和字之間隔著外框的，是不同的對話框
          const real = L.filter((b) => !extraSet.has(b));
          if (!real.length) return;
          const ctrOf = (b) => [(b.x0 + b.x1) / 2 / f - X0, (b.y0 + b.y1) / 2 / f - Y0];
          const seen = (p, q) => {
            const steps = Math.max(2, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1])));
            let bad = 0;
            for (let t = 0; t <= steps; t++) if (!inP(Math.round(p[0] + ((q[0] - p[0]) * t) / steps), Math.round(p[1] + ((q[1] - p[1]) * t) / steps))) bad++;
            return bad <= (steps + 1) * 0.04;
          };
          const ctr = real.map(ctrOf);
          const par = real.map((_, k) => k);
          const root = (k) => { while (par[k] !== k) { par[k] = par[par[k]]; k = par[k]; } return k; };
          for (let a = 0; a < real.length; a++) {
            for (let z = a + 1; z < real.length; z++) if (root(a) !== root(z) && seen(ctr[a], ctr[z])) par[root(a)] = root(z);
          }
          const parts = new Map();
          real.forEach((b, k) => { const r = root(k); if (!parts.has(r)) parts.set(r, []); parts.get(r).push(b); });
          // 認不太出來的字框：跟看得到的那一段字放一起（看不到的就不管）
          for (const b of L) {
            if (!extraSet.has(b)) continue;
            const c = ctrOf(b);
            const k = real.findIndex((_, j) => seen(c, ctr[j]));
            if (k >= 0) parts.get(root(k)).push(b);
          }
          // 可以蓋白底的地方：對話框的白色、字和字框；對話框裡其他的洞（小圖案）不要蓋掉
          const fr = new Uint8Array(bw * bh);
          for (let k = 0; k < pm.length; k++) fr[k] = pm[k] === 1 || pm[k] === 3 ? 1 : 0;
          for (const b of L) {
            for (let y = Math.max(0, Math.floor(b.y0 / f) - Y0); y <= Math.min(bh - 1, Math.ceil(b.y1 / f) - 1 - Y0); y++) {
              for (let x = Math.max(0, Math.floor(b.x0 / f) - X0); x <= Math.min(bw - 1, Math.ceil(b.x1 / f) - 1 - X0); x++) if (pm[y * bw + x] !== 2) fr[y * bw + x] = 1;
            }
          }
          let dirty = 0;
          for (let k = 0; k < pm.length; k++) if (pm[k] !== 2 && !fr[k]) dirty++;
          // 形狀：大多數對話框是橢圓形或方形，這時白底直接蓋滿整個對話框，譯文排在正中間
          let shape = null;
          if (parts.size === 1 && !cut && dirty <= pin * 0.02) {
            let rin = 0;
            for (let y = qy0; y <= qy1; y++) for (let x = qx0; x <= qx1; x++) if (pm[y * bw + x] !== 2) rin++;
            if (rin >= (qx1 - qx0 + 1) * (qy1 - qy0 + 1) * 0.96) shape = { kind: 'rect', x0: qx0, y0: qy0, x1: qx1 + 1, y1: qy1 + 1 };
            else {
              // 橢圓：用面積的分布（平均、變異數）估出中心和半徑
              let n0 = 0; let mx = 0; let my = 0; let vx = 0; let vy = 0;
              for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (pm[y * bw + x] !== 2) { n0++; mx += x; my += y; vx += x * x; vy += y * y; }
              mx /= n0;
              my /= n0;
              const ra = 2 * Math.sqrt(Math.max(0, vx / n0 - mx * mx));
              const rb = 2 * Math.sqrt(Math.max(0, vy / n0 - my * my));
              const inE = (x, y, ka, kb) => ((x - mx) / ka) ** 2 + ((y - my) / kb) ** 2 <= 1;
              const cores = L.map(coreOf);
              // 估出來的橢圓可能比對話框大一點（形狀不是正橢圓）：縮小到整個橢圓都在對話框裡（不會蓋到外框）
              for (let t = 1; t >= 0.83 && !shape; t -= 0.03) {
                const ka = ra * t;
                const kb = rb * t;
                if (ka < 3 || kb < 3) break;
                let ein = 0;
                let etot = 0;
                for (let y = Math.floor(my - kb); y <= Math.ceil(my + kb); y++) {
                  for (let x = Math.floor(mx - ka); x <= Math.ceil(mx + ka); x++) {
                    if (!inE(x, y, ka, kb)) continue;
                    etot++;
                    if (inP(x, y)) ein++;
                  }
                }
                if (!etot || ein < etot * 0.995) continue;
                // 字（往內縮過的範圍）都要在橢圓裡，白底才蓋得到
                const coreIn = cores.every((c) => [[c[0], c[1]], [c[2] + 1, c[1]], [c[0], c[3] + 1], [c[2] + 1, c[3] + 1]]
                  .every(([x, y]) => inE(x - X0, y - Y0, ka * 1.04, kb * 1.04)));
                if (coreIn) shape = { kind: 'ellipse', x0: mx - ka + 0.5, y0: my - kb + 0.5, x1: mx + ka + 0.5, y1: my + kb + 0.5 };
                break;
              }
            }
          }
          for (const part of parts.values()) {
            let rx0 = bw; let ry0 = bh; let rx1 = -1; let ry1 = -1;
            for (const b of part) {
              rx0 = Math.min(rx0, Math.max(0, Math.floor(b.x0 / f) - X0));
              ry0 = Math.min(ry0, Math.max(0, Math.floor(b.y0 / f) - Y0));
              rx1 = Math.max(rx1, Math.min(bw - 1, Math.ceil(b.x1 / f) - 1 - X0));
              ry1 = Math.max(ry1, Math.min(bh - 1, Math.ceil(b.y1 / f) - 1 - Y0));
            }
            // 字的範圍大部分要在對話框裡
            let inU = 0;
            for (let y = ry0; y <= ry1; y++) for (let x = rx0; x <= rx1; x++) if (pm[y * bw + x] !== 2) inU++;
            if (inU < (rx1 - rx0 + 1) * (ry1 - ry0 + 1) * 0.75) continue;
            let box;
            if (shape) box = shape;
            else {
              // 從字的範圍往外擴，直到碰到對話框的邊：這就是可以放譯文的地方（最多擴到字的範圍的一半，不會蓋到太多圖）
              const gx = Math.max(2, Math.round((rx1 - rx0 + 1) * 0.5));
              const gy = Math.max(2, Math.round((ry1 - ry0 + 1) * 0.5));
              const lim = [ry0 - gy, ry1 + gy, rx0 - gx, rx1 + gx];
              const rowOk = (y, a, z) => {
                if (y < 0 || y >= bh || y < lim[0] || y > lim[1]) return false;
                let bad = 0;
                const most = (z - a + 1) * 0.02;
                for (let x = a; x <= z; x++) if (!fr[y * bw + x] && ++bad > most) return false;
                return true;
              };
              const colOk = (x, a, z) => {
                if (x < 0 || x >= bw || x < lim[2] || x > lim[3]) return false;
                let bad = 0;
                const most = (z - a + 1) * 0.02;
                for (let y = a; y <= z; y++) if (!fr[y * bw + x] && ++bad > most) return false;
                return true;
              };
              for (let grow = true; grow;) {
                grow = false;
                if (rowOk(ry0 - 1, rx0, rx1)) { ry0--; grow = true; }
                if (rowOk(ry1 + 1, rx0, rx1)) { ry1++; grow = true; }
                if (colOk(rx0 - 1, ry0, ry1)) { rx0--; grow = true; }
                if (colOk(rx1 + 1, ry0, ry1)) { rx1++; grow = true; }
              }
              box = { kind: '', x0: rx0, y0: ry0, x1: rx1 + 1, y1: ry1 + 1 };
              // 方框超出對話框的地方（例如橢圓的四個角）：記下每一列在對話框裡的左右範圍，白底照這個形狀剪掉
              const rows = [];
              const n2 = Math.min(24, ry1 - ry0 + 1);
              const ww = rx1 - rx0 + 1;
              const hh = ry1 - ry0 + 1;
              // 字框裡一定要蓋（字太靠近外框時，字的邊緣會被當成外面）
              const pb = part.map((b) => cellsOf(b).map((v, j) => v - (j % 2 ? Y0 : X0)));
              const keep = (x, y) => pm[y * bw + x] !== 2 || pb.some((c) => x >= c[0] && x <= c[2] && y >= c[1] && y <= c[3]);
              let cut2 = false;
              for (let k = 0; k < n2; k++) {
                const y = ry0 + Math.round((k * (hh - 1)) / Math.max(1, n2 - 1));
                let xl = rx0;
                let xr = rx1;
                while (xl < xr && !keep(xl, y)) xl++;
                while (xr > xl && !keep(xr, y)) xr--;
                if (xl > rx0 || xr < rx1) cut2 = true;
                const r3 = (v) => Math.round(v * 1000) / 1000;
                rows.push([r3((y - ry0 + (k === 0 ? 0 : k === n2 - 1 ? 1 : 0.5)) / hh), r3((xl - rx0) / ww), r3((xr + 1 - rx0) / ww)]);
              }
              if (cut2) box.rows = rows;
            }
            const k = out.length;
            out.push({
              x0: Math.max(0, (X0 + box.x0) * f),
              y0: Math.max(0, (Y0 + box.y0) * f),
              x1: Math.min(W, (X0 + box.x1) * f),
              y1: Math.min(H, (Y0 + box.y1) * f),
              shape: box.kind,
              rows: box.rows || null,
              et: et ? 1 : 0, // 對話框碰到這一段圖的上緣／下緣（被切開的對話框）
              eb: eb ? 1 : 0,
              bx0: (X0 + qx0) * f,
              by0: (Y0 + qy0) * f,
              bx1: Math.min(W, (X0 + qx1 + 1) * f),
              by1: Math.min(H, (Y0 + qy1 + 1) * f),
              bg,
            });
            for (const b of part) b.bub = k;
          }
        };
        // 兩個對話框連在一起、中間沒有外框（8 字形）：字分成上下兩群，兩群中間的對話框明顯變窄（腰）的地方切開，各算一個
        const cuts = [];
        if (list.length >= 2) {
          const span = new Int32Array(bh);
          for (let y = 0; y < bh; y++) {
            let a = -1;
            let z = -1;
            for (let x = 0; x < bw; x++) if (m[y * bw + x] !== 2) { if (a < 0) a = x; z = x; }
            span[y] = a < 0 ? 0 : z - a + 1;
          }
          const ls = list.map((i) => [boxes[i].y0 / f - Y0, boxes[i].y1 / f - Y0]).sort((p, q) => p[0] - q[0]);
          const hs = ls.map((p) => p[1] - p[0]).sort((p, q) => p - q);
          const lh = hs[hs.length >> 1];
          const runs = [];
          for (const p of ls) {
            const last = runs[runs.length - 1];
            if (last && p[0] - last[1] < lh) last[1] = Math.max(last[1], p[1]);
            else runs.push([p[0], p[1]]);
          }
          const widest = (a, z) => { let v = 0; for (let y = Math.max(0, Math.floor(a)); y <= Math.min(bh - 1, Math.ceil(z)); y++) v = Math.max(v, span[y]); return v; };
          for (let k = 0; k + 1 < runs.length; k++) {
            let best = -1;
            let bv = Infinity;
            for (let y = Math.ceil(runs[k][1]); y <= Math.floor(runs[k + 1][0]); y++) if (span[y] < bv) { bv = span[y]; best = y; }
            if (best >= 0 && bv <= Math.min(widest(...runs[k]), widest(...runs[k + 1])) * 0.75) cuts.push(best);
          }
        }
        if (!cuts.length) { emit(all, m, s.e[0] > 0, s.e[1] > 0); continue; }
        const bounds = [0, ...cuts, bh];
        for (let p = 0; p + 1 < bounds.length; p++) {
          const pa = bounds[p];
          const pz = bounds[p + 1];
          const pm = m.map((v, k) => ((k / bw) | 0) >= pa && ((k / bw) | 0) < pz ? v : 2);
          const L = all.filter((b) => { const cy = (b.y0 + b.y1) / 2 / f - Y0; return cy >= pa && cy < pz; });
          if (L.length) emit(L, pm, p === 0 && s.e[0] > 0, p === bounds.length - 2 && s.e[1] > 0);
        }
      }
      return out;
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
          drawClip(g, bmp, it.b.x0, it.b.y0, it.cw, it.ch, 0, 0, it.cw, it.ch);
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
            if (m.opts && m.opts.detOnly) { post({ type: 'ok', id: m.id, boxes, stats: typeof m.opts.stats === 'object' ? m.opts.stats : undefined }); return; }
            post({ type: 'progress', id: m.id, frac: 0.4 });
            const lines = boxes.length ? await recognize(bmp, boxes, m.rec, (f) => post({ type: 'progress', id: m.id, frac: 0.4 + 0.6 * f }), m.opts || {}) : [];
            // 對話框：只用認得出字的字框來找（放射狀的光線、花紋被當成字框時，常認成 TTT、lll 這種字，不算）
            const real = (t) => {
              const c = String(t || '').replace(/[\s\p{P}\p{S}]/gu, '');
              if (!c || /^(.)\1+$/u.test(c)) return false;
              // 英文：至少兩個字母、有母音（沒有母音的只認 HMM、SHH、TSK 這種常見的）
              return m.rec !== 'eng' || (c.replace(/[^A-Za-z]/g, '').length >= 2 && (/[aeiouy]/i.test(c) || /^(?:m+h*m+|h+m+(?:p+h+)?|s+h+|t+s+k+|t+c+h+|p+f+t*|p+s+t+|g+r+|b+r+|z{2,}|n{2,})+$/i.test(c)));
            };
            boxes.forEach((b) => { b.bub = -1; });
            const sure = (i) => lines[i] && lines[i].conf >= 0.5 && real(lines[i].text);
            // 其他有認出東西的字框（Y—?、單一個字母）：在對話框裡面的話一起蓋白底
            const bubs = bubbles(bmp, boxes.filter((b, i) => sure(i)), boxes.filter((b, i) => !sure(i) && lines[i] && lines[i].conf >= 0.3 && /[\p{L}\p{N}]/u.test(lines[i].text || '')));
            const stats = m.opts && typeof m.opts.stats === 'object' ? m.opts.stats : undefined;
            post({ type: 'ok', id: m.id, boxes, bubbles: bubs, lines: boxes.map((b, i) => Object.assign({}, b, lines[i])), stats });
          } finally { if (bmp.close) bmp.close(); }
        }
      } catch (err) {
        post({ type: 'error', id: m.id, message: String((err && err.message) || err) });
      }
    };
  }

  /** 英文、韓文、日文的字有沒有對（沒有的多半是圖上的雜訊） */
  // 沒有母音的英文，只認常見的語氣詞（MM-HMM、HMM、SHH、TSK、PSST、GRR）
  const MT_EN_NOVOWEL = /^(?:m+h*m+|h+m+(?:p+h+)?|s+h+|t+s+k+|t+c+h+|p+f+t*|p+s+t+|g+r+|b+r+|z{2,}|n{2,})+$/i;
  function mtPaddleScript(text, lang) {
    const s = text.replace(/[\s\d\p{P}\p{S}]/gu, '');
    if (!s.length) return false;
    const re = lang === 'kor' ? /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/ : lang === 'jpn' ? /[\u3040-\u30FF\u3400-\u9FFF\u3005\u3006\u30FC]/ : /[A-Za-z]/;
    let n = 0;
    for (const ch of s) if (re.test(ch)) n++;
    if (lang === 'eng' && (n < 2 || !(/[aeiouy]/i.test(s) || MT_EN_NOVOWEL.test(s)))) return false;
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

  /** 一個點在不在對話框裡（橢圓形的看橢圓；其他的看方框，有記下每一列範圍的看那一列） */
  function mtInShape(b, x, y) {
    if (!(x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1)) return false;
    const fx = (x - b.x0) / (b.x1 - b.x0);
    const fy = (y - b.y0) / (b.y1 - b.y0);
    if (b.shape === 'ellipse') return (fx - 0.5) ** 2 + (fy - 0.5) ** 2 <= 0.25;
    if (Array.isArray(b.rows) && b.rows.length >= 2) {
      let k = 0;
      while (k < b.rows.length - 2 && b.rows[k + 1][0] < fy) k++;
      const [ya, la, ra] = b.rows[k];
      const [yb, lb, rb] = b.rows[k + 1];
      const t = yb > ya ? Math.max(0, Math.min(1, (fy - ya) / (yb - ya))) : 0;
      return fx >= la + (lb - la) * t && fx <= ra + (rb - ra) * t;
    }
    return true;
  }

  /**
   * PaddleOCR 認出來的一行一行 → 一個個對話框（同一框的行合併，照閱讀順序接起來）。
   * 有找到對話框時：同一個對話框裡的行一定合在一起、不同對話框的一定分開，譯文框用對話框裡面的整個空間
   */
  function mtPaddleGroups(raw, lang, bubbles) {
    const cjk = lang === 'jpn';
    const B = Array.isArray(bubbles) ? bubbles : [];
    const lines = [];
    for (const l of raw || []) {
      let text = String(l.text || '').replace(/\s+/g, ' ').trim();
      if (lang === 'eng') text = mtPaddleEnFix(text);
      if (!text) continue;
      const w = l.x1 - l.x0;
      const h = l.y1 - l.y0;
      let bub = Number.isInteger(l.bub) && B[l.bub] ? l.bub : -1;
      if (bub < 0) {
        // 沒分到對話框、但中心在某個對話框裡的行（例如字框超出外框一點）：算那一個
        bub = B.findIndex((b) => mtInShape(b, (l.x0 + l.x1) / 2, (l.y0 + l.y1) / 2));
      }
      // 對話框裡的字幾乎都是台詞：認字信心稍低也收
      if (l.conf < (bub >= 0 ? 0.5 : 0.6) || !mtPaddleScript(text, lang)) continue;
      const letters = text.replace(/[^\p{L}]/gu, '').length;
      // 很短又不太確定的（例如兩個字母）：單獨出現時多半是圖上的雜訊，跟別的行在一起才算
      const shaky = bub < 0 && (lang === 'eng' ? letters <= 2 : letters <= 1) && l.conf < 0.85;
      lines.push({ x0: l.x0, y0: l.y0, x1: l.x1, y1: l.y1, w, h, text, shaky, bub, vertical: h >= w * 1.5, square: Math.max(w, h) < Math.min(w, h) * 1.5 });
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
        if (a.bub >= 0 || b.bub >= 0) {
          if (a.bub === b.bub) parent[find(i)] = find(j);
          continue;
        }
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
      if (g.length === 1 && g[0].shaky) continue; // 對話框裡的行不會是 shaky
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
      const o = {
        x0: Math.min(...g.map((l) => l.x0)) - t * 0.1,
        y0: Math.min(...g.map((l) => l.y0)) - t * 0.1,
        x1: Math.max(...g.map((l) => l.x1)) + t * 0.1,
        y1: Math.max(...g.map((l) => l.y1)) + t * 0.1,
        text,
        vertical,
        lh: t, // 原文一行的粗細：譯文的字不要比它大太多
      };
      const b = g[0].bub >= 0 ? B[g[0].bub] : null;
      if (b) {
        // 對話框：白底蓋滿對話框裡面（沒認出來的字也一起蓋掉），譯文用整個空間排
        // 橢圓、方形的對話框：白底就是對話框的形狀；其他形狀用找到的方框（一定包住所有的字）
        const exact = b.shape === 'ellipse' || b.shape === 'rect';
        // 字都在找到的方框裡：方框就是對話框的方框，剪裁的形狀（rows）才對得上
        const inside = o.x0 + t * 0.1 >= b.x0 - 1 && o.x1 - t * 0.1 <= b.x1 + 1 && o.y0 + t * 0.1 >= b.y0 - 1 && o.y1 - t * 0.1 <= b.y1 + 1;
        Object.assign(o, {
          x0: exact ? b.x0 : Math.min(b.x0, o.x0 + t * 0.1), y0: exact ? b.y0 : Math.min(b.y0, o.y0 + t * 0.1),
          x1: exact ? b.x1 : Math.max(b.x1, o.x1 - t * 0.1), y1: exact ? b.y1 : Math.max(b.y1, o.y1 - t * 0.1),
          bub: true, bg: b.bg || '', shape: b.shape || '', rows: !exact && inside && Array.isArray(b.rows) ? b.rows : null,
          et: !!b.et, eb: !!b.eb,
        });
      }
      out.push(o);
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
    if (lang === 'eng' && (n < 2 || !(/[aeiouy]/i.test(s) || MT_EN_NOVOWEL.test(s)))) return false;
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

  /* ---------- 狀聲詞：設定「不翻」時，認字後就先跳過（原圖保持原樣，不蓋白底） ---------- */
  // 常見的狀聲詞，和翻譯組當成效果字的動作字（比對時連續重複的字母只算一個：BOOOM → bom）
  const mtSfxNorm = (w) => w.replace(/'/g, '').replace(/(.)\1+/g, '$1'); // DUNNN → dun
  const MT_SFX_WORDS = new Set(('bam bang boom thud thump thunk dun dum dudun badump bump wham whack thwack smack slap pow punch kick '
    + 'crash clang clank clink click clack creak crack snap pop poof puff plop drip drop splash splish swish swoosh whoosh woosh fwoosh whish whip '
    + 'zip zoom vroom rumble growl roar hiss buzz beep ring ding dong knock tap tok tick tock thwip shing ching sling slash stab '
    + 'tilt nod shake grab grip clench clutch stare glare glance gaze peek blink flinch twitch jolt shudder shiver tremble quiver startle '
    + 'gasp sigh huff pant gulp sniff sob sniffle wince grin smirk blush sweat flutter flap swing sway spin stomp shuffle rustle '
    + 'squeeze tug pull push pat rub stroke hug flick fling toss grasp drag dash rush fwip pff tsk tch ba dump doki thump '
    + 'shock stun flash glow sparkle twinkle glint gleam shine throb pulse pound pierce slice rip shatter smash squish squeak squeal splat thwap '
    + 'boing ting ping clap clatter rattle scratch scrape screech skid slam slurp munch chomp crunch nom sip chew lick smooch poke pinch tickle '
    + 'nudge bonk bop wobble jiggle bounce hop leap flop slump stumble tiptoe twirl whirl step peer squint frown pout sulk smile laugh giggle '
    + 'chuckle snicker snort cough sneeze yawn hiccup wheeze groan moan whimper wail scream shriek snarl purr meow woof bark chirp tweet crackle '
    + 'sizzle fizz gurgle trickle swirl lash zap zing whiz thrum hum brr grr grumble mumble mutter shf fsh sha').split(' ').map(mtSfxNorm));
  /** 常見的狀聲詞、動作字（也認 NODS、NODDING、GRABBED 這種變化） */
  const mtSfxWord = (w) => MT_SFX_WORDS.has(w) || [w.replace(/e?s$/, ''), w.replace(/s$/, ''), w.replace(/ing$/, ''), w.replace(/ing$/, 'e'), w.replace(/e?d$/, ''), w.replace(/d$/, '')]
    .some((x) => x.length >= 2 && x !== w && MT_SFX_WORDS.has(x));
  /**
   * 這一段字是不是狀聲詞：只有一兩個字（重複的不算，THUMP THUMP 是一個字），而且字比對話大很多、是常見的狀聲詞，或是拉長音（AAAH、ZZZ）。
   * 對話框裡的字幾乎都是台詞：只有字比台詞大很多、又是常見狀聲詞的才算（白底上的大狀聲詞常被當成對話框）。
   * 日文、韓文：不在對話框裡、很短又很大；日文全是片假名的短字（ドン、ゴゴゴ）
   */
  function mtIsSfx(g, all, lang, W) {
    if (!g) return false;
    const t = String(g.text || '').trim();
    const refs = (all || []).filter((o) => o !== g && o.bub && o.lh > 0).map((o) => o.lh).sort((a, b) => a - b);
    const ref = refs.length ? refs[refs.length >> 1] : 0;
    const big = g.lh > 0 && (ref ? g.lh >= ref * 1.8 && g.lh >= W * 0.04 : g.lh >= W * 0.07);
    if (lang !== 'jpn' && lang !== 'kor') {
      const raw = t.toLowerCase().match(/[a-z']+/g) || [];
      const words = [...new Set(raw.map(mtSfxNorm))].filter(Boolean);
      if (!words.length || words.length > 2 || words.join('').length > 16) return false;
      const known = words.every(mtSfxWord);
      if (g.bub) return big && known;
      return big || known || raw.some((w) => /(.)\1\1/.test(w)); // AAAH、HMMM、ZZZ
    }
    const core = t.replace(/[\s\p{P}\p{S}]/gu, '');
    const n = [...core].length;
    if (!n || n > 6) return false;
    const kata = lang === 'jpn' && n <= 4 && /^[\u30A0-\u30FF]+$/.test(core);
    if (g.bub) return big && kata;
    return big || kata;
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
          if (res.status !== 200) { reject(Object.assign(new Error(`免費翻譯失敗（HTTP ${res.status}）`), { status: res.status })); return; }
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
      // 偶爾失敗時等一下再試一次；被擋下（429）的話再送也沒用，直接改用微軟翻譯
      const res = await mtGtxOnce(joined, sl).catch((e) => (e && e.status === 429 ? Promise.reject(e)
        : new Promise((r) => setTimeout(r, 1500)).then(() => mtGtxOnce(joined, sl))));
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
  /**
   * Google 免費翻譯回「HTTP 429」：同一個網路短時間翻太多次被暫時擋下（手機網路常常很多人共用同一個 IP，特別容易遇到）。
   * 擋下後這段時間先改用微軟翻譯，不再一直去敲 Google
   */
  let mtGtxPauseUntil = 0;
  const MT_GTX_PAUSE = 10 * 60 * 1000;
  /**
   * 微軟翻譯（Microsoft Edge 內建翻譯用的同一套）。2026 年舊的通行證網址（translate/auth）已經停用（回 404），
   * 改用不需要通行證的 translate/translatetext：送一串文字，回傳每一段的譯文
   */
  function mtMsOnce(texts, src) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: `https://edge.microsoft.com/translate/translatetext?isEnterpriseClient=false${src ? '&from=' + src : ''}&to=zh-Hant`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(texts),
        timeout: 20000,
        onload: (res) => {
          if (res.status !== 200) { reject(Object.assign(new Error(`微軟翻譯失敗（HTTP ${res.status}）`), { status: res.status })); return; }
          try {
            let j = JSON.parse(res.responseText);
            if (typeof j === 'string') j = JSON.parse(j); // 有時整個回應包成一個 JSON 字串
            if (!Array.isArray(j)) throw new Error('格式不對');
            resolve(texts.map((_, i) => {
              const tr = j[i] && j[i].translations;
              return Array.isArray(tr) ? tr.map((t) => (t && t.text) || '').join(' ') : '';
            }));
          } catch (_) { reject(new Error('微軟翻譯的回應無法讀取')); }
        },
        onerror: () => reject(new Error('微軟翻譯連線失敗')),
        ontimeout: () => reject(new Error('微軟翻譯逾時')),
      });
    });
  }
  async function mtMsTranslate(texts, src) {
    const out = [];
    for (let i = 0; i < texts.length; i += 50) {
      const part = texts.slice(i, i + 50);
      let r;
      try { r = await mtMsOnce(part, src); } catch (e) {
        if (!e || e.status !== 400 || !src) throw e;
        r = await mtMsOnce(part, ''); // 不接受這個原文語言：讓微軟自己判斷再試一次
      }
      out.push(...r.map((z) => z.trim()));
    }
    return out;
  }
  /**
   * 英文的結巴（H-HOW、I-I'M、W-W-WHAT）：翻譯前拿掉（不然 Google 會把「H-」留在譯文裡）；
   * 結巴在句子開頭的話（lead），翻好後把中文的第一個字重複一次（你、你過得…）
   */
  function mtStutter(t) {
    let lead = false;
    let text = String(t || '').replace(/\b([A-Za-z]{1,3})-(?=\1([A-Za-z']*))/gi, (m0, a, rest, at, all) => {
      // 不是結巴：HA-HA、SO-SO 這種重複的字，RE-READ 這種字首
      if (a.length > 1 && (!rest || /^(re|co|de|pre|pro|non|sub|mid)$/i.test(a))) return m0;
      if (!/[A-Za-z]/.test(all.slice(0, at))) lead = true;
      return '';
    });
    if (lead) text = text.replace(/^([^A-Za-z]*)([a-z])/, (_m, a, b) => a + b.toUpperCase());
    return { text, lead };
  }
  /** 譯文：開頭的字重複一次（結巴）；話說到一半的破折號（了-？）改成中文的「——」 */
  function mtZhFix(zh, lead) {
    let t = String(zh || '').replace(/([\u3400-\u9FFF])\s*(?:-{1,2}|[\u2010-\u2015]{1,2})\s*(?=[？！?!。」』]|$)/g, '$1——');
    if (lead) t = t.replace(/^([\s「『"“(（]*)([\u3400-\u9FFF])(?!、)/, '$1$2、$2');
    return t;
  }
  /**
   * 免費翻譯：Google 翻譯（跟 Chrome 右鍵「翻譯成中文」同一套）；Google 不能用時改用微軟翻譯（Edge 內建翻譯那一套），
   * 再不行才用 Chrome 的離線翻譯（只有電腦版 Chrome 有）
   */
  async function mtFreeTranslate(texts, lang) {
    const src = MT_LANG[lang] || 'en';
    const prep = texts.map((t) => (src === 'en' ? mtStutter(t) : { text: t, lead: false }));
    const send = prep.map((p) => p.text);
    let out = null;
    let err = null;
    let by = 'google';
    if (Date.now() >= mtGtxPauseUntil) {
      try {
        out = await mtGtx(send, src);
      } catch (e) {
        err = e;
        mtGtxFailed = true;
        if (e && e.status === 429) mtGtxPauseUntil = Date.now() + MT_GTX_PAUSE;
        mtWarn('Google 翻譯失敗，改用微軟翻譯', e);
      }
    }
    if (!out) {
      try {
        out = await mtMsTranslate(send, src);
        by = 'microsoft';
      } catch (e) {
        mtWarn('微軟翻譯也失敗，改用 Chrome 離線翻譯', e);
        const tr = await mtChromeTranslator(src);
        if (!tr) throw err || e;
        out = await mtTimeout(Promise.all(send.map((t) => tr.translate(t))), 20000);
        by = 'chrome';
      }
    }
    const res = out.map((z, i) => (src === 'en' && z ? mtZhFix(z, prep[i].lead) : z));
    res.by = by; // 誰翻的（狀態列顯示用）
    return res;
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
    const isTouch = TOUCH;
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
      // 同一張圖之前已經在監看時，再 observe 一次不會收到通知（新的譯文層就不會跟著校正位置）：先取消再重新監看
      ovIO.unobserve(V.img);
      ovIO.observe(V.img);
      ro.unobserve(V.img);
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
      if (P.fixHold) { unlater(P.fixHold); P.fixHold = 0; }
      Object.assign(P, { state: 'idle', blocks: [], done: 0, total: 0, note: '', error: '', step: '', fix: '', shown: true, langP: null, queued: false, cutT: false, cutB: false, seamExt: null });
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

    /* ---------- 被網站切在兩張圖中間的字：兩半接起來翻成一整句 ---------- */
    const MT_OCR_OF = { en: 'eng', ja: 'jpn', ko: 'kor' };
    /** 網頁上緊接在這張圖上面（d = -1）或下面（d = 1）、一樣寬的那張圖 */
    function stacked(P, d) {
      for (const a of P.els) {
        if (!a.isConnected) continue;
        const ra = a.getBoundingClientRect();
        if (!ra.width || !ra.height) continue;
        const tol = Math.max(2, ra.width * 0.02);
        for (const V of views.values()) {
          if (V.P === P || !V.img.isConnected) continue;
          const rb = V.img.getBoundingClientRect();
          if (!rb.height || Math.abs(ra.width - rb.width) > tol || Math.abs(ra.left - rb.left) > tol) continue;
          const gap = d > 0 ? rb.top - ra.bottom : ra.top - rb.bottom;
          if (gap >= -2 && gap <= Math.max(24, ra.width * 0.04)) return V.P;
        }
      }
      return null;
    }
    /** 上面那張圖最底下的字和下面那張圖最上面的字（左右位置對得上）接起來翻：譯文放在比較大的那一半，另一半只蓋白底 */
    async function stitch(U, L) {
      if (U === L || U.state !== 'done' || L.state !== 'done') return false;
      const gu = U.gen;
      const gl = L.gen;
      let changed = false;
      const xo = (a, b) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) >= Math.min(a.x1 - a.x0, b.x1 - b.x0) * 0.5;
      for (const a of U.blocks.slice()) {
        if (!a.cb || !a.src || a.vertical) continue; // 直排的字被橫著切開時，上下兩半要一行一行交錯才接得起來：先不處理
        const b = L.blocks.find((t) => t.ct && t.src && !t.vertical && t.lang === a.lang && !(t.xs && a.xs) && xo(a, t));
        if (!b) continue;
        const lang = MT_OCR_OF[a.lang] || 'eng';
        let tail = b.src;
        if (lang === 'eng' && !/[.!?…]["”'’)]*$/.test(a.src)) tail = tail.replace(/^([A-Z])(?=[a-z])/, (c) => c.toLowerCase()); // 句子還沒結束：下一半開頭不用大寫
        const src = lang === 'jpn' ? a.src + tail : /[A-Za-z]-$/.test(a.src) && /^[a-z]/i.test(tail) ? a.src.slice(0, -1) + tail : a.src + ' ' + tail;
        const area = (x, P) => (x.x1 - x.x0) * (x.y1 - x.y0) * ((P.h0 || 1) / (P.w0 || 1));
        const [keep, gone] = area(a, U) >= area(b, L) ? [a, b] : [b, a];
        a.xs = true;
        b.xs = true;
        let zh = '';
        try { zh = mtCleanZh((await mtFreeTranslate([src], lang))[0]); } catch (e) { mtWarn('漫畫翻譯（接起來的句子）', e); }
        if (U.gen !== gu || L.gen !== gl) return false;
        if (!zh) { a.xs = false; b.xs = false; continue; }
        Object.assign(keep, { msrc: src, zh, fixed: false, blank: false });
        Object.assign(gone, { msrc: '', zh: '', blank: true, fixed: true });
        changed = true;
      }
      if (changed) {
        for (const P of [U, L]) { render(P); if (P.w0) cachePut(P, 'free', P.w0, P.h0, false, !fixLines(P).length); }
      }
      return changed;
    }
    /**
     * 圖的最上面（top）或最下面被切到的字、對話框往圖裡面延伸多遠（整張圖高度的比例）：
     * 接縫拼起來重新認字時，只要拼這一段（越小越快）
     */
    function seamExtent(P, s, plan, top) {
      const sh = s.y1 - s.y0;
      let e = 0;
      for (const b of s.bubbles || []) {
        if (top ? b.et : b.eb) e = Math.max(e, top ? (b.by1 || b.y1) : sh - (b.by0 || b.y0));
      }
      for (const b of s.boxes || []) {
        const lh = b.y1 - b.y0;
        if (top ? b.y0 <= 3 : b.y1 >= sh - 3) e = Math.max(e, top ? b.y1 + lh * 2 : sh - b.y0 + lh * 2);
      }
      // 已經合成一段的字（整段旁白、整個對話框）碰到或很靠近邊緣的：整段都要
      for (const b of P.blocks) {
        const near = Math.max(6, (b.lh || 0.03) * plan.W * 2);
        if (top ? b.y0 * plan.H < near : b.y1 * plan.H > plan.H - near) e = Math.max(e, top ? b.y1 * plan.H : plan.H - b.y0 * plan.H);
      }
      return Math.min(1, e / plan.H);
    }
    /** 接縫拼圖時，一張圖要拿幾列（寬 W、高 H 的圖；e 是上面算的比例，不知道時用 1） */
    const seamRows = (W, H, e) => Math.max(1, Math.round(Math.min(H, W * 1.1, Math.max(W * 0.3, e * H + W * 0.06))));
    // 翻譯時留下來的圖片上下緣（被切到的那一邊）：接縫重新認字時不用再下載一次整張圖
    const strips = new Map(); // P.key|T 或 |B → { blob, h, W, gen }
    function stripPut(P, side, v) {
      const k = P.key + '|' + side;
      strips.delete(k);
      strips.set(k, v);
      while (strips.size > 40) strips.delete(strips.keys().next().value);
    }
    function stripTake(P, side) {
      const k = P.key + '|' + side;
      const v = strips.get(k);
      strips.delete(k);
      return v && v.gen === P.gen ? v : null;
    }
    /** 翻譯完一張圖：被切到的上緣、下緣從切片裡拼出來留著（切片本來就是不失真的 PNG） */
    async function keepStrips(P, slices, plan, gen) {
      for (const top of [true, false]) {
        if (!(top ? P.cutT : P.cutB)) continue;
        const rows = seamRows(plan.W, plan.H, P.seamExt[top ? 0 : 1]);
        const y0 = top ? 0 : plan.H - rows;
        const y1 = top ? rows : plan.H;
        const parts = slices.filter((s) => s.blob && s.y1 > y0 && s.y0 < y1).sort((a, b) => a.y0 - b.y0);
        let at = y0;
        for (const s of parts) { if (s.y0 > at) break; at = Math.max(at, s.y1); }
        if (at < y1) continue; // 中間有缺：之後重新下載整張圖
        const c = mtCanvas(plan.W, rows);
        const g = c.getContext('2d');
        g.fillStyle = '#FFFFFF';
        g.fillRect(0, 0, plan.W, rows);
        for (const s of parts) {
          const bm = await createImageBitmap(s.blob);
          try { g.drawImage(bm, 0, s.y0 - y0); } finally { if (typeof bm.close === 'function') bm.close(); }
        }
        stripPut(P, top ? 'T' : 'B', { blob: await mtToBlob(c, 'image/png'), h: rows, W: plan.W, gen });
      }
    }
    let seamRun = 0; // 正在重新認接縫的字（狀態列顯示用）
    /** 兩張圖在網頁上是不是緊緊貼在一起（中間沒有空隙）：接縫上的譯文才能跨兩張圖接著畫 */
    function touching(U, L) {
      for (const a of U.els) {
        if (!a.isConnected) continue;
        const ra = a.getBoundingClientRect();
        for (const b of L.els) {
          if (!b.isConnected) continue;
          const rb = b.getBoundingClientRect();
          if (ra.width && rb.width && Math.abs(ra.width - rb.width) <= 1.5 && Math.abs(rb.top - ra.bottom) <= 3) return true;
        }
      }
      return false;
    }
    /**
     * 上下兩張圖接縫附近拼成一張再認一次：被切成上下兩半的字是完整的，對話框也是完整的。
     * 接縫上的字換成一段完整的譯文，兩張圖各畫一份（位置對齊接縫），看起來就像一個框
     */
    function seamOcr(U, L) {
      // 同一對圖（同一次翻譯）只做一次；正在做的話等它做完
      const ver = U.key + '>' + L.key + ':' + U.gen + ':' + L.gen;
      if (U.seamVer !== ver) { U.seamVer = ver; U.seamP = seamTry(U, L); }
      return U.seamP;
    }
    async function seamTry(U, L) {
      if (pd.failed || !(U.cutB || L.cutT) || !touching(U, L)) return false;
      // 之前（快取裡）已經處理過這個接縫：重新連上兩份譯文
      const prim = U.blocks.filter((b) => b.seam && !b.mirror);
      const mir = L.blocks.filter((b) => b.seam && b.mirror);
      if (prim.length && mir.length) {
        for (const b of prim) { const m = mir.find((x) => x.src === b.src); if (m) { b.twin = m; b.twinP = L; } }
        return true;
      }
      const code = MT_OCR_OF[(U.blocks.concat(L.blocks).find((b) => b.lang) || {}).lang] || U.lang || L.lang;
      if (!code || !MT_LANG[code]) return false;
      seamRun++;
      setStatus();
      try { return await seamRead(U, L, code); } finally { seamRun--; setStatus(); }
    }
    async function seamRead(U, L, code) {
      const gu = U.gen;
      const gl = L.gen;
      const imgOf = (P) => [...P.els].find((i) => i.isConnected && i.complete && i.naturalWidth && mtAbs(i.currentSrc) === P.url) || null;
      const ext = (P, i) => (P.seamExt ? P.seamExt[i] : 1);
      const su = stripTake(U, 'B');
      const sl = stripTake(L, 'T');
      let bu = null;
      let bl = null;
      let blob = null;
      let W = 0;
      let A = 0;
      let HU = 0;
      let HL = 0;
      try {
        // 翻譯時留下來的上下緣（沒有的話重新下載整張圖）；寬度以上面那張圖為準（最寬 1000）
        bu = su ? await createImageBitmap(su.blob) : await mtCaptureUrl(U.url, imgOf(U), U.noRef || pg.noRefDirs.has(mtDirOf(U.url)));
        bl = sl ? await createImageBitmap(sl.blob) : await mtCaptureUrl(L.url, imgOf(L), L.noRef || pg.noRefDirs.has(mtDirOf(L.url)));
        const uw = U.w0 || bu.width;
        const lw = L.w0 || bl.width;
        W = su ? su.W : Math.min(bu.width, 1000);
        HU = (U.h0 || bu.height) * (W / uw);
        HL = (L.h0 || bl.height) * (W / lw);
        A = su ? su.h : seamRows(W, HU, ext(U, 1));
        const B = sl ? Math.max(1, Math.round(sl.h * (W / sl.W))) : seamRows(W, HL, ext(L, 0));
        const c = mtCanvas(W, A + B);
        const g = c.getContext('2d');
        g.fillStyle = '#FFFFFF';
        g.fillRect(0, 0, W, A + B);
        g.imageSmoothingQuality = 'high';
        if (su) g.drawImage(bu, 0, 0, bu.width, bu.height, 0, 0, W, A);
        else { const ku = W / bu.width; mtDrawClip(g, bu, 0, (HU - A) / ku, bu.width, A / ku, 0, 0, W, A); }
        if (sl) g.drawImage(bl, 0, 0, bl.width, bl.height, 0, A, W, B);
        else { const kl = W / bl.width; mtDrawClip(g, bl, 0, 0, bl.width, B / kl, 0, A, W, B); }
        blob = await mtToBlob(c, 'image/png');
      } finally {
        for (const b of [bu, bl]) if (b && typeof b.close === 'function') b.close();
      }
      if (U.gen !== gu || L.gen !== gl) return false;
      await orCancel(pdReady(code, null));
      const wk = await pdTake();
      let r = null;
      try { r = await orCancel(wk.call({ type: 'ocr', blob, rec: code, boxes: null, opts: {} })); } finally { pdRelease(wk); }
      if (U.gen !== gu || L.gen !== gl) return false;
      let groups = mtPaddleGroups(r.lines, code, r.bubbles || []);
      if (cfg().sfx !== 'translate') groups = groups.filter((x) => !mtIsSfx(x, groups, code, W));
      // 接縫上的字：範圍跨過接縫、或貼著接縫的（對話框的話看整個框）
      const seam = groups.filter((x) => x.y0 < A + 3 && x.y1 > A - 3);
      if (!seam.length) return false;
      const zh = await mtFreeTranslate(seam.map((x) => x.text), code);
      if (U.gen !== gu || L.gen !== gl) return false;
      const inU = (x) => ({ x0: x.x0 / W, x1: x.x1 / W, y0: (HU - A + x.y0) / HU, y1: (HU - A + x.y1) / HU });
      const inL = (x) => ({ x0: x.x0 / W, x1: x.x1 / W, y0: (x.y0 - A) / HL, y1: (x.y1 - A) / HL });
      // 原本被切開的那些字框（中心在新的範圍裡，或大半在裡面）拿掉
      const covered = (b, q) => {
        const cx = (b.x0 + b.x1) / 2;
        const cy = (b.y0 + b.y1) / 2;
        if (cx > q.x0 && cx < q.x1 && cy > q.y0 && cy < q.y1) return true;
        const ix = Math.min(b.x1, q.x1) - Math.max(b.x0, q.x0);
        const iy = Math.min(b.y1, q.y1) - Math.max(b.y0, q.y0);
        return ix > 0 && iy > 0 && ix * iy >= (b.x1 - b.x0) * (b.y1 - b.y0) * 0.5;
      };
      let n = 0;
      seam.forEach((x, i) => {
        const z = mtCleanZh(zh[i]);
        if (!z || z === x.text) return;
        const qu = inU(x);
        const ql = inL(x);
        U.blocks = U.blocks.filter((b) => !covered(b, qu));
        L.blocks = L.blocks.filter((b) => !covered(b, ql));
        const base = { zh: z, src: x.text, lang: MT_LANG[code], vertical: !!x.vertical, bub: !!x.bub, bg: x.bg || '', shape: x.shape || '',
          rows: x.rows || null, lh: x.lh > 0 ? x.lh / W : 0, seam: true, edge: false };
        const pu = Object.assign({}, base, qu);
        const pl = Object.assign({}, base, ql, { mirror: true, fixed: true });
        pu.twin = pl;
        pu.twinP = L;
        U.blocks.push(pu);
        L.blocks.push(pl);
        n++;
      });
      if (!n) return false;
      for (const P of [U, L]) { render(P); if (P.w0) cachePut(P, 'free', P.w0, P.h0, false, !fixLines(P).length); }
      return true;
    }
    /** 這張圖翻好了：跟上下相鄰、也翻好的圖接起被切開的字；等著接的那張圖可以送修正了 */
    async function stitchAround(P) {
      const fixOn = () => mode() === 'fast' && mtEngineState(cfg()).kind === 'gemini';
      for (const [U, L] of [[stacked(P, -1), P], [P, stacked(P, 1)]]) {
        if (!U || !L) continue;
        let changed = false;
        if (U.state === 'done' && L.state === 'done') {
          try { changed = await seamOcr(U, L); } catch (e) { if (!e || e.kind !== 'cancel') mtWarn('漫畫翻譯（接縫）', e); }
          if (!changed) { try { changed = await stitch(U, L); } catch (e) { mtWarn('漫畫翻譯（接起來的句子）', e); } }
        }
        for (const Q of [U, L]) {
          if (Q === P) continue;
          if (Q.fixHold) {
            unlater(Q.fixHold);
            Q.fixHold = 0;
            if (fixOn()) fixEnqueue(Q);
          } else if (changed && Q.fix && fixOn()) fixEnqueue(Q); // 已經修正過：再送接起來的那一句
        }
        if (changed && U !== P && !U.fixHold && fixOn()) fixEnqueue(U);
      }
    }
    /** 快速模式送 Gemini 修正：圖的上下緣有被切開的字、相鄰的圖還在翻時，先等它翻好接成一句（最多等 15 秒） */
    function fixWhenReady(P) {
      const waits = (d, flag, cut) => (cut || P.blocks.some((b) => b[flag] && !b.xs)) && (stacked(P, d) || {}).state === 'busy';
      if (!waits(-1, 'ct', P.cutT) && !waits(1, 'cb', P.cutB)) { fixEnqueue(P); return; }
      if (P.fixHold) return;
      P.fix = 'wait';
      setStatus();
      P.fixHold = later(() => { P.fixHold = 0; fixEnqueue(P); }, 15000);
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
    // v5：免費模式的對話框（8 字形分開）、結巴、語氣詞改過了（舊版免費模式翻的重新翻一次；Gemini 看圖翻的沿用）
    const MTC_VER = 5;
    const cacheKeyOf = (P, ver = 'v' + MTC_VER) => 'mtc.' + strHash([location.host, P.key, cfg().sfx, ver].join('|'));
    function cacheGet(P) {
      let v = store.get(cacheKeyOf(P), null);
      for (let ver = MTC_VER - 1; ver >= 2 && !v; ver--) {
        const old = store.get(cacheKeyOf(P, 'v' + ver), null);
        if (old && old.v === ver && old.m && old.m !== 'free') v = old;
      }
      if (!v || !(v.v >= 2 && v.v <= MTC_VER) || !Array.isArray(v.b)) return null;
      // 同一個網址換成了別張圖（長寬比不同）就不能用
      for (const img of P.els) {
        if (img.complete && img.naturalWidth && v.w && v.h && Math.abs(img.naturalWidth / img.naturalHeight - v.w / v.h) > 0.02) return null;
      }
      return {
        m: v.m || '', t: v.t || 0, blk: !!v.blk, fx: !!v.fx, w: v.w || 0, h: v.h || 0, ct: !!v.ct, cb: !!v.cb,
        ex: Array.isArray(v.ex) && v.ex.length === 2 ? v.ex.map((x) => Math.min(1, Math.max(0, Number(x) || 0))) : null,
        blocks: v.b.map((a) => ({ x0: a[0], y0: a[1], x1: a[2], y1: a[3], zh: String(a[4] || ''), vertical: !!a[5], lang: a[6] || '', src: a[7] || '',
          bub: !!a[8], lh: Number(a[9]) || 0, bg: typeof a[10] === 'string' ? a[10] : '', shape: typeof a[11] === 'string' ? a[11] : '', rows: Array.isArray(a[12]) ? a[12] : null,
          ct: !!(a[13] & 1), cb: !!(a[13] & 2), blank: !!(a[13] & 4), xs: !!(a[13] & 8), fixed: !!(a[13] & 16), seam: !!(a[13] & 32), mirror: !!(a[13] & 64), msrc: typeof a[14] === 'string' ? a[14] : '', edge: false })),
      };
    }
    function cachePut(P, model, w, h, blk, fx) {
      const k = cacheKeyOf(P);
      const r4 = (n) => Math.round(n * 10000) / 10000;
      store.set(k, { v: MTC_VER, t: Date.now(), m: model, w, h, blk: blk ? 1 : 0, fx: fx ? 1 : 0, ct: P.cutT ? 1 : 0, cb: P.cutB ? 1 : 0, ex: P.seamExt ? P.seamExt.map(r4) : 0,
        b: P.blocks.map((b) => [r4(b.x0), r4(b.y0), r4(b.x1), r4(b.y1), b.zh, b.vertical ? 1 : 0, b.lang, b.src || '', b.bub ? 1 : 0, r4(b.lh || 0), b.bg || '', b.shape || '', b.rows || 0,
          (b.ct ? 1 : 0) | (b.cb ? 2 : 0) | (b.blank ? 4 : 0) | (b.xs ? 8 : 0) | (b.fixed ? 16 : 0) | (b.seam ? 32 : 0) | (b.mirror ? 64 : 0), b.msrc || '']) });
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
      mtWarn('Gemini 金鑰無法使用：', e.message);
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
      // 思考的程度：看圖翻譯用 low（Lite 用 minimal）；只送文字的修正用 minimal，快很多。模型不支援 minimal 時改用 low
      const want = opts.think || (/-lite$/.test(model) ? 'minimal' : 'low');
      const level = want === 'minimal' && f.noMinimal ? 'low' : want;
      if (!f.noThink) body.generation_config = { thinking_level: level };
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
          if (level === 'minimal') f.noMinimal = true; else f.noThink = true;
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
        mtWarn('Gemini 錯誤', model, e.kind, e.message);
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
        mtWarn('免費模式（Tesseract）載入失敗', e);
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
    const pd = { workers: [], ready: null, ok: false, langP: {}, langOk: {}, failed: '', gen: 0, queue: [], checked: {} };
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
        await orCancel(pdSelfCheck(lang));
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
        s.bubbles = r.bubbles || [];
        return mtPaddleGroups(r.lines, lang, s.bubbles);
      } finally { pdRelease(wk); }
    }
    /**
     * PaddleOCR 載入後，先認一張白底黑字的測試圖：找不到字、算出壞掉的數字、英文認錯（某些瀏覽器上模型算出來的數字不對），
     * 就當作 PaddleOCR 不能用，改用 Tesseract，不會整話翻完卻一個字都沒有
     */
    function pdSelfCheck(lang) {
      const want = lang === 'eng' ? 'eng' : 'det';
      if (pd.checked[want]) return pd.checked[want];
      const gen = pd.gen;
      const p = (async () => {
        const blob = await mtTestBlob();
        const wk = await pdTake();
        let r;
        try {
          r = await wk.call({ type: 'ocr', blob, rec: lang, boxes: null, opts: { stats: true, detOnly: want === 'det' } }, null, 60000);
        } finally { pdRelease(wk); }
        const st = r.stats || {};
        const text = (r.lines || []).map((l) => l.text || '').join(' ');
        if (r.boxes.length < 2 || st.nan > 0 || !(st.max > 0.5) || (want === 'eng' && !/HELLO|WORLD|TEST/i.test(text))) {
          throw Object.assign(new Error(`PaddleOCR 自我檢查沒通過（字框 ${r.boxes.length}、最大值 ${st.max}、NaN ${st.nan}${want === 'eng' ? '、認出「' + text.slice(0, 30) + '」' : ''}）`), { setup: true });
        }
      })();
      pd.checked[want] = p;
      p.catch(() => { if (gen === pd.gen && pd.checked[want] === p) delete pd.checked[want]; });
      return p;
    }
    /** PaddleOCR 不能用（網站擋住、下載不到）：改用 Tesseract；按「重試」時會再試一次 */
    function pdFail(e) {
      if (pd.failed) return;
      pd.failed = String((e && e.message) || e || '');
      mtWarn('PaddleOCR 載入失敗，改用 Tesseract', e);
      pd.workers.forEach((wk) => wk.die(new Error('停止')));
      pd.workers = [];
      tell('pd-failed', /自我檢查/.test(pd.failed)
        ? '新的文字辨識（PaddleOCR）在這個瀏覽器認不出測試用的字，先改用舊的辨識方式，準確度會差一些。'
        : '新的文字辨識（PaddleOCR）在這個網站載入失敗，先改用舊的辨識方式，準確度會差一些。可以按狀態列的「重試」再試一次。', { title: '漫畫翻譯' });
    }
    function pdReset() {
      pd.gen++;
      mtPdLoading.clear(); // 卡住的下載不要再等，重新下載
      pd.workers.forEach((wk) => wk.die(mtErr('cancel')));
      Object.assign(pd, { workers: [], ready: null, ok: false, langP: {}, langOk: {}, failed: '', checked: {} });
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
          if (e && e.setup) pdFail(e); else mtWarn('PaddleOCR 這一段失敗，改用 Tesseract', e);
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
        let groups = await ocrRun(s, lang, plan, P);
        // 狀聲詞設定「不翻」：狀聲詞直接跳過（原圖保持原樣）
        if (cfg().sfx !== 'translate') groups = groups.filter((g) => !mtIsSfx(g, groups, lang, plan.W));
        if (!groups.length) return [];
        const zh = await mtFreeTranslate(groups.map((g) => g.text), lang);
        const sh = s.y1 - s.y0;
        P.engines.add(zh.by === 'microsoft' ? 'ms' : 'free');
        return groups.map((g, i) => ({
          x0: g.x0 / plan.W,
          x1: g.x1 / plan.W,
          y0: (s.y0 + g.y0) / plan.H,
          y1: (s.y0 + g.y1) / plan.H,
          zh: mtCleanZh(zh[i]),
          src: g.text,
          lang: MT_LANG[lang],
          vertical: g.vertical,
          bub: !!g.bub,
          bg: g.bg || '',
          shape: g.shape || '',
          rows: g.rows || null,
          lh: g.lh > 0 ? g.lh / plan.W : 0,
          edge: (s.y0 > 0 && g.y0 < 6) || (s.y1 < plan.H && g.y1 > sh - 6),
          // 字（或它的對話框）碰到整張圖的上緣、下緣：可能是被切在兩張圖中間的一句話
          ct: s.y0 === 0 && (g.et || g.y0 < Math.max(6, (g.lh || 20) * 0.5)),
          cb: s.y1 >= plan.H && (g.eb || g.y1 > sh - Math.max(6, (g.lh || 20) * 0.5)),
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

    /* ---------- Gemini 修正：只送認出來的文字（不送圖片），後面的圖很多張合成一次，省次數 ---------- */
    const fq = { jobs: [], active: 0, soon: 0, wake: 0, waitUntil: 0, pumping: false, again: false };
    const FIX_LINES = 40; // 一次最多幾行（預先翻好的圖）
    const FIX_NOW_LINES = 24; // 畫面上的圖：只送畫面上的，小批送出、馬上回來
    const FIX_CHARS = 4000;
    // 要送修正的行：已經修正過的、只蓋白底的不送；接起來的一句話送整句
    const fixLines = (P) => P.blocks.filter((b) => (b.msrc || b.src) && !b.blank && !b.fixed);
    function fixEnqueue(P) {
      if (fq.jobs.some((j) => j.P === P)) return;
      if (!fixLines(P).length) {
        // 沒有要修正的行（例如都接到別張圖去了）：不要一直顯示「等 Gemini 修正」
        if (P.fix === 'wait') { P.fix = P.engines.has('fix') ? 'done' : ''; setStatus(); }
        return;
      }
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
        for (;;) {
          if (stopped || !fq.jobs.length) break;
          fq.jobs = fq.jobs.filter((j) => {
            if (j.gen === j.P.gen) return true;
            if (j.P.fix === 'wait') j.P.fix = '';
            return false;
          });
          if (!fq.jobs.length) break;
          const pr = new Map();
          const pOf = (P) => { if (!pr.has(P)) pr.set(P, prioOf(P)); return pr.get(P); };
          fq.jobs.sort((a, b) => (pOf(a.P) - pOf(b.P)) || (a.P.order - b.P.order));
          const hp = pOf(fq.jobs[0].P);
          // 同時送出的修正：畫面上的圖最多 4 個（分給不同模型，一起跑），預先翻好的圖 2 個
          if (fq.active >= (hp < 1 ? 4 : 2)) break;
          const st = mtEngineState(cfg());
          if (st.kind !== 'gemini') {
            for (const j of fq.jobs.splice(0)) j.P.fix = '';
            onFallback(st);
            setStatus();
            break;
          }
          const lines = fq.jobs.reduce((n, j) => n + fixLines(j.P).length, 0);
          const oldest = Math.min(...fq.jobs.map((j) => j.t));
          // 不是畫面上的圖：等後面幾張也認完字，湊成一次送（省每天的次數）
          if (hp >= 1 && lines < FIX_LINES * 0.6 && (prepQ.pending() || ocrQ.pending()) && Date.now() - oldest < 6000) { fixSoon(700); break; }
          const pick = pickModel(hp);
          if (!pick.model) {
            fq.waitUntil = Date.now() + pick.wait;
            unlater(fq.wake);
            fq.wake = later(() => { fq.wake = 0; fixPump(); }, Math.min(Math.max(pick.wait, 200) + 50, 90000));
            setStatus();
            break;
          }
          fq.waitUntil = 0;
          // 畫面上的圖只跟畫面上的一起送（少少幾行，很快就回來）；後面的圖湊多一點
          const now = hp < 1;
          const maxLines = now ? FIX_NOW_LINES : FIX_LINES;
          const batch = [];
          let n = 0;
          let chars = 0;
          while (fq.jobs.length) {
            if (now && batch.length && pOf(fq.jobs[0].P) >= 1) break;
            const ls = fixLines(fq.jobs[0].P);
            const c = ls.reduce((k, b) => k + (b.msrc || b.src).length, 0);
            if (batch.length && (n + ls.length > maxLines || chars + c > FIX_CHARS)) break;
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
        for (const b of ls) lines.push({ j, b, src: b.msrc || b.src });
      }
      const LN = { en: 'English', ja: 'Japanese', ko: 'Korean' };
      const langs = [...new Set(lines.map((l) => LN[l.b.lang]).filter(Boolean))];
      const sfxOn = cfg().sfx === 'translate';
      const text = [
        contextText(),
        langs.length ? `Original language: ${langs.join(', ')}` : '',
        'Lines:',
        ...lines.map((l, i) => `${i + 1}. ${!sfxOn && !l.b.bub ? '[outside bubbles] ' : ''}${l.src.replace(/\s+/g, ' ')}`),
      ].filter(Boolean).join('\n');
      const applied = new Set();
      const touched = new Set();
      // 每張圖還沒修正的行數：一張圖的行都修好了就馬上算完成（不用等同一批的其他圖）
      const left = new Map(batch.map((j) => [j, 0]));
      for (const l of lines) left.set(l.j, left.get(l.j) + 1);
      const finished = new Set();
      const finish = (j) => {
        if (finished.has(j)) return;
        finished.add(j);
        if (j.gen !== j.P.gen) return;
        j.P.fix = fq.jobs.some((q) => q.P === j.P) ? 'wait' : 'done'; // 這張圖又排了一次修正（接上別張圖的字）
        j.P.engines.add('fix');
        if (j.P.w0) cachePut(j.P, 'free', j.P.w0, j.P.h0, false, !fixLines(j.P).length);
      };
      const apply = (got) => {
        for (const it of got) {
          const i = Math.round(Number(it && it.id)) - 1;
          const l = lines[i];
          if (!l || applied.has(i)) continue;
          applied.add(i);
          left.set(l.j, left.get(l.j) - 1);
          if (l.j.gen !== l.j.P.gen || l.b.blank || (l.b.msrc || l.b.src) !== l.src) continue; // 送出後這一行又被接上別張圖的字：等下一次修正
          const zh = mtCleanZh(it.zh);
          if (zh) {
            l.b.zh = zh;
            // 接縫上的字：另一張圖上的那一份也換成修正後的譯文
            const tw = l.b.twin;
            if (tw && l.b.twinP && l.b.twinP.blocks.includes(tw)) {
              tw.zh = zh;
              touched.add(l.b.twinP);
              if (l.b.twinP.w0) cachePut(l.b.twinP, 'free', l.b.twinP.w0, l.b.twinP.h0, false, !fixLines(l.b.twinP).length);
            }
          } else if (!l.b.bub && !l.b.seam) l.j.P.blocks = l.j.P.blocks.filter((b) => b !== l.b); // 不是對話（雜訊、浮水印）：拿掉；對話框裡的一定是對話，留著原本的翻譯
          l.b.fixed = true;
          touched.add(l.j.P);
          if (left.get(l.j) <= 0) finish(l.j);
        }
        touched.forEach((P) => render(P));
        touched.clear();
        bump();
        setStatus();
      };
      let items;
      try {
        items = await geminiCall(model, [{ type: 'text', text }], apply, { system: mtFixPrompt(cfg().sfx === 'translate'), schema: MT_FIX_SCHEMA, timeout: 90000, think: 'minimal' });
      } catch (e) { onFixError(model, batch.filter((j) => !finished.has(j)), e); return; }
      apply(items);
      remember(items);
      batch.forEach(finish);
      setStatus();
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
        mtWarn('Gemini 修正失敗', model, e.kind, e.message);
      }
      setStatus();
    }

    /* ---------- 翻譯一張圖 ---------- */
    const mode = () => (cfg().mode === 'accurate' ? 'accurate' : 'fast');
    async function translateP(P) {
      if (stopped || P.state === 'busy') return;
      const gen = ++P.gen;
      Object.assign(P, { state: 'busy', blocks: [], done: 0, total: 0, error: '', note: '', step: '排隊中', fix: '', engines: new Set(), started: Date.now(), langP: null, queued: true, cutT: false, cutB: false, seamExt: null });
      render(P);
      bump();
      setStatus();
      const alive = () => !stopped && P.gen === gen;
      try {
        const st0 = mtEngineState(cfg());
        const fast = mode() === 'fast';
        let hit = cacheGet(P);
        // 免費模式一個字都沒認到的舊結果不沿用（可能是那時候認字出了問題），重新辨識一次
        if (hit && hit.m === 'free' && !hit.blocks.length) hit = null;
        // 快速模式：有翻過就用；精準模式：免費模式翻的只在 Gemini 不能用（或 Gemini 拒絕這張圖）時沿用
        if (hit && (fast || hit.m !== 'free' || hit.blk || st0.kind !== 'gemini')) {
          if (hit.m) P.engines.add(hit.m);
          if (hit.fx) P.engines.add('fix');
          Object.assign(P, { blocks: hit.blocks, state: 'done', done: 1, total: 1, step: '', w0: hit.w, h0: hit.h, fix: hit.fx ? 'done' : '', cutT: hit.ct, cutB: hit.cb, seamExt: hit.ex });
          render(P);
          const fixIt = fast && hit.m === 'free' && !hit.fx && st0.kind === 'gemini'; // 上次還沒修正完
          stitchAround(P).finally(() => { if (fixIt && P.gen === gen) fixWhenReady(P); });
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
          // 這一段處理完：放掉圖片資料，整話先翻時才不會佔太多記憶體（最上面、最下面的先留著，接縫重新認字可能會用到）
          const keepTo = Math.min(plan.H, plan.W * 1.1);
          if (useImage || (s.y0 >= keepTo && s.y1 <= plan.H - keepTo)) s.blob = null;
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
        // 圖的最上面、最下面有字（或對話框）被切到：跟上下相鄰的圖拼起來再認一次
        const s0 = slices[0];
        const sN = slices[slices.length - 1];
        P.cutT = !!((s0.boxes || []).some((b) => b.y0 <= 3) || (s0.bubbles || []).some((b) => b.et));
        P.cutB = !!((sN.boxes || []).some((b) => b.y1 >= sN.y1 - sN.y0 - 3) || (sN.bubbles || []).some((b) => b.eb));
        P.seamExt = [seamExtent(P, s0, plan, true), seamExtent(P, sN, plan, false)];
        try { await keepStrips(P, slices, plan, gen); } catch (e) { mtWarn('漫畫翻譯（留下接縫）', e); }
        for (const s of slices) s.blob = null;
        if (!alive()) return;
        P.state = 'done';
        P.step = '';
        P.error = failed ? mtErrText(lastErr) : '';
        // 免費模式一個字都沒認到的結果不記住：下次打開會再認一次（真的沒有字的頁也只是多花一點時間）
        if (!failed && (allGemini || P.blocks.length)) cachePut(P, allGemini ? ([...P.engines].find((m) => m !== 'free' && m !== 'ms' && m !== 'fix') || 'gemini') : 'free', plan.W0, plan.H0, refused, false);
        // 被切在上下兩張圖中間的字接起來；快速模式再請 Gemini 依前後文修正（只送文字）
        const fixIt = fast && !allGemini && mtEngineState(cfg()).kind === 'gemini';
        stitchAround(P).finally(() => { if (fixIt && P.gen === gen) fixWhenReady(P); });
      } catch (e) {
        if (!alive() || (e && e.kind === 'cancel')) return;
        if (P.guess) { Object.assign(P, { state: 'skip', note: '', step: '' }); setStatus(); return; } // 猜的下一頁網址不存在
        P.state = 'error';
        P.step = '';
        P.error = mtErrText(e);
        mtWarn('漫畫翻譯失敗', e);
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
    /**
     * 保險：畫面附近已經翻好的圖，確認譯文層還在、位置對、該顯示就顯示。
     * 網站換掉圖片、重畫版面時，偶爾會錯過通知（例如手機的 Safari），最晚不到一秒也會補上
     */
    function heal() {
      if (stopped) return;
      const vh = innerHeight || 800;
      for (const V of views.values()) {
        const P = V.P;
        if (!P.blocks.length || !V.img.isConnected) continue;
        const r = V.img.getBoundingClientRect();
        if (!(r.width > 1 && r.height > 1) || r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue;
        const fresh = !V.overlay || !V.overlay.alive();
        const ov = ensureOverlay(V);
        if (fresh) ov.setBlocks(P.blocks); else ov.align();
        const want = shouldShow(P) && ready(V.img, P);
        if (ov.shown !== want) ov.show(want);
        visibleOv.add(V);
      }
    }
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
        heal();
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
    /**
     * 手機上，網頁本身（不是浮動的）小小的按鈕、連結也要避開，例如閱讀器上下的換頁列（＜ 2 / 62 ＞）捲到畫面底部時；
     * 包著整張漫畫圖的大連結不算
     */
    function smallControl(el) {
      for (let e = el, up = 0; e && e !== document.body && up < 4; e = e.parentElement, up++) {
        const role = (e.getAttribute && e.getAttribute('role')) || '';
        if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY)$/.test(e.tagName) && !/^(button|link|tab|menuitem|slider)$/.test(role)) continue;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.width <= 260 && r.height <= 90;
      }
      return false;
    }
    function siteUiAt(x, y, w, hh) {
      const pts = [[x + 6, y + 6], [x + w - 6, y + 6], [x + 6, y + hh - 6], [x + w - 6, y + hh - 6], [x + w / 2, y + hh / 2]];
      // 很寬的狀態列：中間那一排多看幾個點
      for (let px = x + 30; w > 150 && px < x + w - 20; px += 48) pts.push([px, y + hh / 2]);
      const hits = (b) => b.width > 0 && b.height > 0 && Math.min(x + w, b.right) > Math.max(x, b.left) && Math.min(y + hh, b.bottom) > Math.max(y, b.top);
      const bars = new Set();
      for (const [px, py] of pts) {
        let list = [];
        try { list = document.elementsFromPoint(px, py); } catch (_) { continue; }
        for (const el of list) {
          if (ourHosts.has(el) || el.tagName === 'MAOBOO-MT') continue;
          if (el === document.body || el === document.documentElement) break;
          if (fixedUi(el)) return true;
          if (!isTouch) continue;
          if (smallControl(el)) return true;
          // 一整排的按鈕列（像換頁列）：按鈕常常只有字那麼小，點不一定剛好點到，直接看列裡的按鈕有沒有被蓋到
          if (bars.has(el)) continue;
          bars.add(el);
          const r = el.getBoundingClientRect();
          if (r.height > 160 || r.width < 100) continue;
          const ctl = el.querySelectorAll('a[href], button, [role="button"], input, select');
          for (let i = 0; i < ctl.length && i < 60; i++) {
            const b = ctl[i].getBoundingClientRect();
            if (b.width <= 260 && b.height <= 90 && hits(b)) return true;
          }
        }
      }
      return false;
    }
    /** 依序試左下、右下、右上、左上，放在沒有網站按鈕的角落 */
    function placeCorner(el, force) {
      if (!el || (!force && Date.now() - placeAt < 1500)) return;
      placeAt = Date.now();
      // 介面放大時（網頁整頁縮小顯示），大小和離邊緣的距離都跟著放大
      const z = uiZ;
      const w = (el.offsetWidth || 260) * z;
      const hh = (el.offsetHeight || 40) * z;
      const m = 16 * z;
      const corners = [['left', 'bottom'], ['right', 'bottom'], ['right', 'top'], ['left', 'top']];
      let pick = corners[0];
      for (const c of corners) {
        const x = c[0] === 'left' ? m : innerWidth - m - w;
        const y = c[1] === 'bottom' ? innerHeight - m - hh : m;
        if (!siteUiAt(x, y, w, hh)) { pick = c; break; }
      }
      el.style.left = pick[0] === 'left' ? '16px' : 'auto';
      el.style.right = pick[0] === 'right' ? '16px' : 'auto';
      el.style.top = pick[1] === 'top' ? (TOUCH ? 'calc(16px + env(safe-area-inset-top, 0px))' : '16px') : 'auto';
      el.style.bottom = pick[1] === 'bottom' ? (TOUCH ? 'calc(16px + env(safe-area-inset-bottom, 0px))' : '16px') : 'auto';
    }
    function counts() {
      const c = { done: 0, busy: 0, total: 0, err: 0, frac: 0, free: false, gtx: false, ms: false, gem: false, fixWait: 0, fixBusy: 0, fixDone: 0, seam: seamRun };
      for (const P of pages.values()) {
        if (!P.queued || P.state === 'skip' || P.state === 'idle') continue;
        c.total++;
        if (P.state === 'done') { c.done++; c.frac += 1; } else if (P.state === 'error') { c.err++; c.frac += 1; } else if (P.state === 'busy') {
          c.busy++;
          c.frac += P.total ? Math.min(1, (P.done + ocrPart(P)) / P.total) * 0.97 : 0.02;
        }
        if (P.fix === 'wait') c.fixWait++; else if (P.fix === 'busy') c.fixBusy++; else if (P.fix === 'done') c.fixDone++;
        for (const m of P.engines) {
          if (m === 'free') { c.free = true; c.gtx = true; } else if (m === 'ms') { c.free = true; c.ms = true; } else if (m !== 'fix') c.gem = true;
        }
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
      if (c.seam) return '接起切在兩張圖中間的字';
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
        const settings = isTouch ? h('button', { type: 'button', class: 'mt-set', text: '設定', onclick: () => openPanel() }) : null;
        chipEl = h('div', { class: 'mt-chip', role: 'status' }, bar, textEl, retry, toggle, settings, close);
        ['pointerdown', 'mousedown', 'click'].forEach((t) => chipEl.addEventListener(t, stopEv));
        r.root.append(chipEl);
        chipEl.v = { textEl, toggle, retry, fill };
      }
      const c = counts();
      const now = Date.now();
      // 有圖在翻、但超過 30 秒完全沒有進展（也不是在等 Gemini 的每分鐘次數）：好像卡住了
      const waiting = Math.max(gq.waitUntil, fq.waitUntil) > now;
      const stuck = c.busy > 0 && !waiting && now - lastProgress > 30000;
      const fixing = c.fixBusy + c.fixWait + c.seam;
      const act = activity(c);
      let text;
      if (pg.hidden) text = '顯示原文中';
      else if (c.busy) text = `${c.done}/${c.total} 張 · ${stuck ? `好像卡住了（${act}）` : act}`;
      else if (c.err) text = `已翻譯 ${c.done} 張，${c.err} 張失敗`;
      else if (fixing) text = `已翻譯 ${c.done} 張 · ${act}`;
      else {
        const tr = c.ms ? (c.gtx ? 'Google／微軟翻譯' : '微軟翻譯') : 'Google 翻譯';
        const how = c.gem && !c.free ? 'Gemini' : c.fixDone ? `${tr}＋Gemini 修正` : c.gem ? `Gemini＋${tr}` : tr;
        text = `已翻譯 ${c.done} 張 · ${how}`;
      }
      // 手機畫面窄：不寫「漫畫翻譯」，留位置給進度
      chipEl.v.textEl.textContent = isTouch ? text : `漫畫翻譯　${text}`;
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
        if (hover || pg.hidden || c.busy || c.fixBusy || c.fixWait || c.seam || c.err) { hideChipLater(1500); return; }
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

    /* ---------- 回報問題：這一頁的翻譯狀況整理成一段文字（手機上看不到主控台，複製起來貼給開發者） ---------- */
    function diagText(test) {
      // 只留網域（數字換成 #）和檔名，不放完整網址
      const name = (u) => { try { const x = new URL(u, location.href); return `${x.hostname.replace(/\d+/g, '#')}/…/${x.pathname.split('/').pop()}`; } catch (_) { return String(u || '').slice(0, 40); } };
      const R = (r) => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
      const desc = (e) => (e && e.tagName ? e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')
        + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') : '').slice(0, 60);
      const sty = (e) => {
        try {
          const c = getComputedStyle(e);
          return [c.display, c.position, c.zIndex === 'auto' ? '' : 'z' + c.zIndex, c.overflow === 'visible' ? '' : c.overflow, c.transform === 'none' ? '' : 'tf',
            c.visibility === 'visible' ? '' : c.visibility, c.opacity === '1' ? '' : 'op' + c.opacity].filter(Boolean).join(' ');
        } catch (_) { return ''; }
      };
      const imgs = [...document.images].filter((i) => views.has(i) || i.naturalWidth >= 200).slice(0, 8).map((img) => {
        const V = views.get(img);
        const r = img.getBoundingClientRect();
        const o = { f: name(img.currentSrc || img.src), r: R(r), n: [img.naturalWidth, img.naturalHeight], ok: img.complete, s: sty(img) };
        const src = img.getAttribute('src') || '';
        if (src && img.currentSrc && mtAbs(src) !== img.currentSrc) o.src = name(src);
        // 圖片看得到的部分中間，最上層是什麼（有沒有被別的東西蓋住）
        if (r.bottom > 0 && r.top < innerHeight && r.width > 0) {
          const cx = Math.min(innerWidth - 2, Math.max(1, r.left + r.width / 2));
          const cy = Math.min(innerHeight - 2, Math.max(1, (Math.max(r.top, 0) + Math.min(r.bottom, innerHeight)) / 2));
          try { o.top = document.elementsFromPoint(cx, cy).slice(0, 4).map(desc); } catch (_) { /* 舊瀏覽器 */ }
        }
        o.up = [];
        for (let e = img.parentElement, k = 0; e && k < 4 && e !== document.body; e = e.parentElement, k++) o.up.push(desc(e) + ' ' + sty(e));
        if (V) {
          const P = V.P;
          o.P = { st: P.state, b: P.blocks.length, shown: P.shown, guess: P.guess, keyOk: mtUrlKey(mtAbs(img.currentSrc || src)) === P.key, ready: ready(img, P), err: P.error || undefined };
          const ov = V.overlay;
          if (ov) {
            const hs = ov.host;
            const sr = hs.shadowRoot;
            const layer = sr && sr.querySelector('.mt-layer');
            const b0 = sr && sr.querySelector('.b');
            o.ov = { alive: ov.alive(), conn: hs.isConnected, next: hs.previousSibling === img || hs.previousSibling === img.parentElement, r: R(hs.getBoundingClientRect()), s: sty(hs),
              hid: !!(layer && layer.hidden), n: layer ? layer.childElementCount : -1, b0: b0 ? R(b0.getBoundingClientRect()) : null };
            // 譯文看起來多大（手機螢幕上的點）、有幾個框塞不下、幾個是照對話框的形狀蓋的
            if (sr) {
              const vs = window.visualViewport ? visualViewport.scale : 1;
              const bs = [...sr.querySelectorAll('.b')];
              o.ov.fonts = bs.map((b) => b.querySelector('.t')).filter(Boolean).map((t) => Math.round(parseFloat(t.style.fontSize || getComputedStyle(t).fontSize) * vs * 10) / 10).sort((a, b) => a - b).slice(0, 24);
              o.ov.ovf = bs.filter((b) => { const t = b.querySelector('.t'); return t && (t.scrollHeight > b.clientHeight + 2 || t.scrollWidth > b.clientWidth + 2); }).length;
              o.ov.bub = bs.filter((b) => b.classList.contains('bub')).length;
              o.ov.sizes = bs.slice(0, 24).map((b) => { const r = b.getBoundingClientRect(); return Math.round(r.width * vs) + 'x' + Math.round(r.height * vs); });
            }
          }
        }
        return o;
      });
      const vv = window.visualViewport;
      return JSON.stringify({
        v: VERSION, ed: EDITION, ua: navigator.userAgent.replace(/^Mozilla\/5\.0 /, '').slice(0, 160), site: HOST, path: location.pathname.replace(/\d+/g, '#'),
        scr: [innerWidth, innerHeight, window.devicePixelRatio, vv ? Math.round(vv.scale * 100) / 100 : null, uiZ],
        pg: { on: pg.on, hidden: pg.hidden, dirs: pg.dirs ? pg.dirs.size : 0 }, c: counts(), views: views.size,
        pages: [...pages.values()].filter((P) => P.queued || P.blocks.length).slice(0, 12).map((P) => `${name(P.url)} ${P.state} b${P.blocks.length} e${P.els.size}${P.guess ? ' g' : ''}`),
        imgs, test: test || undefined, err: DIAG_ERRS.slice(),
      });
    }
    /** 一張圖縮小後的平均亮度、亮度差異、透明度（全黑、全透明代表讀到的是空白圖） */
    function lumStats(src) {
      const c = mtCanvas(48, 48);
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(src, 0, 0, 48, 48);
      const d = g.getImageData(0, 0, 48, 48).data;
      let sum = 0;
      let sq = 0;
      let a = 0;
      const n = d.length / 4;
      for (let i = 0; i < d.length; i += 4) {
        const l = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
        sum += l;
        sq += l * l;
        a += d[i + 3];
      }
      const m = sum / n;
      return { lum: Math.round(m), sd: Math.round(Math.sqrt(Math.max(0, sq / n - m * m))), alpha: Math.round(a / n) };
    }
    /** 認出來的字像不像英文（只回報數量和比例，不放漫畫裡的文字） */
    function lineQuality(lines) {
      const words = lines.flatMap((l) => String(l.text || '').split(/\s+/)).filter(Boolean);
      const good = words.filter((w) => /^[A-Za-z][A-Za-z'’.,!?…-]*$/.test(w) && /[aeiouy]/i.test(w) && w.replace(/[^A-Za-z]/g, '').length >= 2);
      const conf = lines.length ? lines.reduce((t, l) => t + (l.conf || 0), 0) / lines.length : 0;
      return { lines: lines.length, words: words.length, good: good.length, conf: Math.round(conf * 100) };
    }
    /** 診斷用：直接跑一次 PaddleOCR，拿原始結果（字框、認出的字、模型的統計） */
    async function pdProbe(blob, lang) {
      await pdReady(lang, null);
      const wk = await pdTake();
      try { return await wk.call({ type: 'ocr', blob, rec: lang, boxes: null, opts: { stats: true } }, null, 90000); } finally { pdRelease(wk); }
    }
    /**
     * 實際測一次：合成的測試圖認不認得出字、Google 翻譯通不通、畫面上這一頁的圖讀不讀得到、認不認得出字。
     * 手機上看不到主控台，問題出在哪一步，從這裡看得出來
     */
    async function diagOcr() {
      const ms = (t) => Date.now() - t;
      const errOf = (e) => String((e && e.message) || e).slice(0, 160);
      const langs = store.get('mt.lang', {}) || {};
      const out = {
        env: { coi: !!self.crossOriginIsolated, oc: typeof OffscreenCanvas === 'function', cores: navigator.hardwareConcurrency || 0 },
        pd: { ok: pd.ok, failed: pd.failed || '', langs: Object.keys(pd.langOk || {}), workers: pd.workers.length, checked: Object.keys(pd.checked || {}) },
        lang: { set: cfg().ocrLang || '', guess: mtHostLang(), series: langs[seriesKey()] || '', site: langs[HOST] || '' },
        gtxFailed: mtGtxFailed,
        gtxPause: mtGtxPauseUntil > Date.now() ? Math.round((mtGtxPauseUntil - Date.now()) / 1000) : 0,
      };
      // 1) 合成的測試圖：白底黑字的 HELLO WORLD
      let t0 = Date.now();
      try {
        const blob = await mtTestBlob();
        out.self = { png: blob.size };
        if (!pd.failed) {
          const r = await mtTimeout(pdProbe(blob, 'eng'), 120000);
          out.self.pd = { ms: ms(t0), boxes: r.boxes.length, lines: (r.lines || []).slice(0, 4).map((l) => `${l.text}|${Math.round((l.conf || 0) * 100)}`), stats: r.stats };
        }
        t0 = Date.now();
        const groups = await mtTimeout(ocrRun({ blob, y0: 0, y1: 150 }, 'eng', { W: 560, H: 150, W0: 560, H0: 150, k: 1, cuts: [[0, 150]] }, null), 120000);
        out.self.ocr = { ms: ms(t0), by: pd.failed ? 'tesseract' : 'paddle', n: groups.length, text: groups.map((x) => x.text).join(' / ').slice(0, 80) };
      } catch (e) { out.self = Object.assign(out.self || {}, { err: errOf(e), ms: ms(t0) }); }
      // 2) Google 翻譯、微軟翻譯（分開測，看哪一個能用）
      t0 = Date.now();
      try {
        const z = await mtTimeout(mtGtx(['HELLO WORLD'], 'en'), 30000);
        out.gtx = { ms: ms(t0), zh: String(z[0] || '').slice(0, 20) };
      } catch (e) {
        out.gtx = { err: errOf(e), ms: ms(t0) };
        if (e && e.status === 429) mtGtxPauseUntil = Date.now() + MT_GTX_PAUSE;
      }
      t0 = Date.now();
      try {
        const z = await mtTimeout(mtMsTranslate(['HELLO WORLD'], 'en'), 30000);
        out.ms = { ms: ms(t0), zh: String(z[0] || '').slice(0, 20) };
      } catch (e) { out.ms = { err: errOf(e), ms: ms(t0) }; }
      // 3) 畫面上這一頁的圖
      const V = [...views.values()].find((v) => { const r = v.img.getBoundingClientRect(); return v.img.isConnected && r.width > 100 && r.bottom > 0 && r.top < innerHeight; });
      if (V) {
        t0 = Date.now();
        try {
          const bmp = await mtTimeout(mtCaptureUrl(V.P.url, V.img, V.P.noRef || pg.noRefDirs.has(mtDirOf(V.P.url))), 30000);
          try {
            out.page = { cap: Object.assign({ w: bmp.width, h: bmp.height, ms: ms(t0) }, lumStats(bmp)) };
            const plan = mtPlanSlices(bmp);
            const sl = await mtSliceImage(bmp, plan, 0, true);
            out.page.slices = plan.cuts.length;
            out.page.s0 = { size: sl.blob.size, type: sl.blob.type };
            const sb = await createImageBitmap(sl.blob);
            try { Object.assign(out.page.s0, lumStats(sb)); } finally { if (sb.close) sb.close(); }
            if (!pd.failed) {
              t0 = Date.now();
              const r = await mtTimeout(pdProbe(sl.blob, 'eng'), 120000);
              const groups = mtPaddleGroups(r.lines || [], 'eng', r.bubbles || []);
              const kept = cfg().sfx !== 'translate' ? groups.filter((x) => !mtIsSfx(x, groups, 'eng', plan.W)) : groups;
              out.page.pd = Object.assign({ ms: ms(t0), boxes: r.boxes.length, stats: r.stats, groups: groups.length, kept: kept.length }, lineQuality(r.lines || []));
              // 翻譯這一步：有幾段翻出來是空的、跟原文一樣（這兩種都會被丟掉）
              const k2 = kept.slice(0, 12);
              if (k2.length) {
                try {
                  const zh = await mtTimeout(mtFreeTranslate(k2.map((x) => x.text), 'eng'), 30000);
                  out.page.pd.tr = { n: k2.length, empty: zh.filter((z) => !mtCleanZh(z)).length, same: zh.filter((z, i) => mtCleanZh(z) === k2[i].text).length };
                } catch (e) { out.page.pd.tr = { err: errOf(e) }; }
              }
            }
          } finally { if (bmp.close) bmp.close(); }
        } catch (e) { out.page = Object.assign(out.page || {}, { err: errOf(e), ms: ms(t0) }); }
      }
      return out;
    }
    async function copyText(text) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* 改用舊方法 */ }
      try {
        const r = ui();
        const ta = h('textarea', { readonly: true, style: { position: 'fixed', top: '0', left: '0', width: '2px', height: '2px', opacity: '0' } });
        ta.value = text;
        r.root.append(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, text.length);
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (_) { return false; }
    }
    let diagBusy = false;
    async function diag() {
      if (diagBusy) return;
      diagBusy = true;
      const wait = toast('會實際認一次字、翻一次譯，大約 10～40 秒，請先不要離開這一頁。', { title: '正在檢查文字辨識和翻譯…', sticky: true });
      let test = null;
      try { test = await diagOcr(); } catch (e) { test = { err: String((e && e.message) || e) }; }
      if (wait) wait.close();
      diagBusy = false;
      let text = '';
      try { text = diagText(test); } catch (e) { text = JSON.stringify({ v: VERSION, ed: EDITION, site: HOST, diagErr: String((e && e.message) || e), test, err: DIAG_ERRS.slice() }); }
      console.log('[MAOBOO] 診斷資訊', text);
      toast('按「複製」後貼上回報就可以了（只有網頁和圖片的狀態，不含金鑰）。', {
        title: '診斷資訊準備好了',
        sticky: true,
        actions: [{ label: '複製', primary: true, run: () => { copyText(text).then((ok) => toast(ok ? '已複製診斷資訊。' : '沒辦法複製，請再按一次「複製診斷資訊」。')); } }],
      });
    }

    function toggleSite() {
      const list = (cfg().sites || []).slice();
      const hit = mtSiteMatch(list);
      if (hit && String(hit).trim() === '*') return;
      if (hit) {
        ctx.save('sites', list.filter((x) => x !== hit));
        toast(isTouch ? '這個網站不再顯示「譯」；在 Tampermonkey 選單按「翻譯這一話的漫畫」還是可以翻譯。' : '這個網站不再顯示翻譯按鈕；按 Alt+T 還是可以翻譯整話。');
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
          label: '　' + (!pg.on ? '翻譯這一話的漫畫' : pg.hidden ? '顯示漫畫譯文' : '暫時顯示漫畫原文') + (isTouch ? '' : '（Alt+T）'),
          run: () => { warmLocal(); pageToggle(); },
          close: true,
        }];
        if (pg.on) items.push({ key: 'mt.stop', label: '　關閉漫畫翻譯（恢復原文）', run: () => pageStop(), close: true });
        const hit = mtSiteMatch(cfg().sites);
        if (String(hit).trim() !== '*') {
          items.push({ key: 'mt.site', label: hit ? '　這個網站不要顯示翻譯按鈕' : '　在這個網站顯示翻譯按鈕', run: () => toggleSite(), close: true });
        }
        if (pg.on) items.push({ key: 'mt.diag', label: '　複製診斷資訊（回報問題用）', run: () => diag(), close: true });
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

    /* ---------------- 短影片自動下一部（YouTube Shorts、Instagram Reels、Facebook Reels） ---------------- */
    {
      id: 'ytShorts',
      group: 'video',
      name: '短影片自動下一部',
      site: 'YouTube／IG／FB',
      desc: 'YouTube Shorts、Instagram 和 Facebook 的 Reels 播完馬上跳到下一部，不會先重播開頭；切到其他分頁也會繼續播。',
      defaults: { early: 0 },
      fields: [{ key: 'early', label: '提早幾秒跳', type: 'number', min: 0, max: 3, step: 0.1, unit: '秒' }],
      hint: '0 是播完才跳（預設）；想略過片尾的話可以調大一點。',
      frames: 'all',
      phase: 'start',
      match: () => location.protocol === 'https:' && (HOST === 'www.youtube.com' || /(^|\.)instagram\.com$/.test(HOST) || /(^|\.)facebook\.com$/.test(HOST)),
      start(ctx) {
        const doc = PAGE.document;
        const site = HOST === 'www.youtube.com' ? 'yt' : /instagram\.com$/.test(HOST) ? 'ig' : 'fb';
        const TAG = '[短影片自動下一部]';
        /** 在短影片頁面：YouTube /shorts/、Instagram /reels/、Facebook /reel/ */
        const onShorts = () => {
          const p = PAGE.location.pathname;
          return site === 'yt' ? p.startsWith('/shorts/') : site === 'ig' ? p.startsWith('/reels/') : /^\/reels?\//.test(p);
        };
        const offs = [];
        const on = (t, type, fn) => { t.addEventListener(type, fn, true); offs.push(() => t.removeEventListener(type, fn, true)); };

        // 只在短影片頁面偽裝成「分頁一直在前景」（切到其他分頁也繼續播），其他頁面照常
        const proto = PAGE.Document.prototype;
        const rawVis = Object.getOwnPropertyDescriptor(proto, 'visibilityState');
        const rawHidden = Object.getOwnPropertyDescriptor(proto, 'hidden');
        const isRealBackground = () => (rawVis ? rawVis.get.call(doc) === 'hidden' : false);
        try {
          if (rawVis) Object.defineProperty(doc, 'visibilityState', { configurable: true, get: toPage(function () { return onShorts() ? 'visible' : rawVis.get.call(doc); }) });
          if (rawHidden) Object.defineProperty(doc, 'hidden', { configurable: true, get: toPage(function () { return onShorts() ? false : rawHidden.get.call(doc); }) });
        } catch (e) { console.error(TAG, '偽裝 Visibility 失敗', e); }
        const stopIfShorts = (e) => { if (onShorts()) e.stopImmediatePropagation(); };
        on(PAGE, 'visibilitychange', stopIfShorts);
        on(doc, 'visibilitychange', stopIfShorts);
        on(PAGE, 'blur', stopIfShorts);
        offs.push(() => { try { delete doc.visibilityState; delete doc.hidden; } catch (_) { /* 還原失敗不影響播放 */ } });

        const timers = new Set();
        const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
        const early = () => Math.min(3, Math.max(0, Number(ctx.cfg().early) || 0));
        /** 正在看的那一部：畫面正中間、夠大的影片 */
        const isMain = (v) => {
          const r = v.getBoundingClientRect();
          const vh = PAGE.innerHeight || 800;
          return r.height >= vh * 0.35 && r.top < vh * 0.5 && r.bottom > vh * 0.5;
        };
        /** 往下捲動一部的捲動區（短影片一部一格、會自動對齊） */
        const scroller = (v) => {
          for (let p = v.parentElement; p && p !== doc.documentElement; p = p.parentElement) {
            const cs = PAGE.getComputedStyle(p);
            if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 10) return p;
          }
          return null;
        };
        const nextButton = () => {
          if (site === 'yt') return doc.querySelector('#navigation-button-down button') || doc.querySelector('button[aria-label="下一部影片"], button[aria-label="Next video"]');
          const re = site === 'ig' ? /下一段|下一個|next/i : /下一張|下一個|next/i;
          return [...doc.querySelectorAll('[role="button"][aria-label], button[aria-label]')].find((b) => re.test(b.getAttribute('aria-label')) && b.getBoundingClientRect().width > 0) || null;
        };
        /**
         * 背景分頁裡網站「看不到」捲動（畫面不會更新）：直接捲一格，自己播下一部已經載好的影片。
         * 回到這個分頁時，網站會照目前的位置接著播
         */
        const direct = (v) => {
          const sc = scroller(v);
          if (!sc) return false;
          sc.scrollTop += sc.clientHeight;
          const nx = [...doc.getElementsByTagName('video')].find((x) => x !== v && isMain(x));
          if (!nx || !(nx.currentSrc || nx.src) || nx.readyState < 2) return false;
          if (!v.paused) v.pause();
          if (nx.ended) nx.currentTime = 0;
          nx.play().catch(() => {});
          return true;
        };
        /** 換到下一部的方法（一個沒用再換下一個）：YouTube 先按「下一部」按鈕；IG、FB 先往下捲一格（不管介面是什麼語言都可以） */
        const ways = (v) => {
          const click = () => { const b = nextButton(); if (!b) return false; b.click(); return true; };
          const scroll = () => { const sc = scroller(v); if (!sc) return false; sc.scrollBy({ top: sc.clientHeight, behavior: 'smooth' }); return true; };
          const key = () => { doc.dispatchEvent(new PAGE.KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40, bubbles: true, cancelable: true })); return true; };
          if (site === 'yt') return [click, scroll, key];
          return isRealBackground() ? [() => direct(v), click] : [scroll, click, key];
        };
        let busy = null; // 正在換下一部：{ v }
        /** 換到下一部。hold：先暫停這一部（會自己重播的影片，暫停了就不會先聽到開頭） */
        function goNext(v, hold) {
          if (busy) return;
          if (hold && !v.paused) v.pause();
          const url = PAGE.location.href;
          const src = v.currentSrc;
          busy = { v };
          const list = ways(v);
          let i = 0;
          let since = 0;
          // 換成功：網址換了、影片換了，或另一部影片已經在畫面中間播放
          const moved = () => PAGE.location.href !== url || v.currentSrc !== src || !v.isConnected
            || [...doc.getElementsByTagName('video')].some((x) => x !== v && !x.paused && isMain(x));
          const tryOne = () => { while (i < list.length) if (list[i++]()) { since = Date.now(); return true; } return false; };
          const giveUp = () => {
            // 換不了（例如已經是最後一部）：照原本的樣子從頭播
            busy = null;
            console.warn(TAG, '換不到下一部，從頭播放');
            if (v.paused && v.isConnected) { if (v.ended) v.currentTime = 0; v.play().catch(() => {}); }
          };
          // 一次只用一種方法：等它 1.5 秒（捲動動畫比較慢），換成功就停，免得一次跳過兩部
          const check = () => {
            if (moved()) { busy = null; return; }
            if (Date.now() - since < 1500) { later(check, 200); return; }
            if (tryOne()) later(check, 200); else giveUp();
          };
          if (tryOne()) later(check, 200); else giveUp();
        }
        // 快播完時：算好剩下的時間準時處理（timeupdate 大約 0.25 秒才一次，不夠準）
        let endTimer = 0;
        const arm = (v) => {
          clearTimeout(endTimer);
          const d = v.duration;
          if (!d || !Number.isFinite(d) || v.paused) return;
          // 會自己重播的影片（YouTube）在最後一刻先暫停；IG、FB 的影片會停在最後，等播完再換
          const lead = Math.max(early(), v.loop ? 0.06 : 0);
          if (!lead) return;
          const left = (d - v.currentTime) / (v.playbackRate || 1);
          if (left - lead > 0.7) return;
          endTimer = later(() => {
            if (v.paused || busy || !onShorts() || !isMain(v)) return;
            const now = (v.duration - v.currentTime) / (v.playbackRate || 1);
            if (now - lead > 0.03) { arm(v); return; } // 中間卡了一下：重新算
            goNext(v, v.loop);
          }, Math.max(0, (left - lead) * 1000));
        };
        const last = new WeakMap(); // 影片 → 上一次的播放時間和網址（看有沒有繞回開頭；YouTube 換下一部時是同一個影片換網址）
        const wrapped = (v, prev) => v.loop && !!prev && prev.src === v.currentSrc && v.duration > 1 && prev.t > v.duration - 0.8 && v.currentTime < 0.5;
        const isVideo = (v) => v && v.tagName === 'VIDEO';
        on(PAGE, 'timeupdate', (e) => {
          const v = e.target;
          if (!isVideo(v) || !onShorts()) return;
          const prev = last.get(v);
          last.set(v, { t: v.currentTime, src: v.currentSrc });
          if (busy || !isMain(v)) return;
          if (wrapped(v, prev)) { goNext(v, true); return; } // 已經繞回開頭：馬上暫停、換下一部
          arm(v);
        });
        on(PAGE, 'seeking', (e) => {
          const v = e.target;
          if (!isVideo(v) || !onShorts() || busy || !isMain(v)) return;
          if (wrapped(v, last.get(v))) goNext(v, true);
        });
        on(PAGE, 'ended', (e) => {
          const v = e.target;
          if (!isVideo(v) || !onShorts() || !(isMain(v) || (busy && busy.v === v))) return;
          e.stopImmediatePropagation(); // 不讓網站把這一部從頭再播一次
          goNext(v, false);
        });
        // 切到背景時被網站暫停的話，自動繼續播
        on(PAGE, 'pause', (e) => {
          const v = e.target;
          if (!isVideo(v) || !onShorts() || busy || !isMain(v)) return;
          if (isRealBackground() && v.currentTime < v.duration - 0.6) v.play().catch(() => {});
        });
        return () => {
          offs.forEach((f) => f());
          timers.forEach(clearTimeout);
        };
      },
    },

    /* ---------------- 影片音量記憶（Threads、X、Instagram、Facebook） ---------------- */
    {
      id: 'videoVolume',
      group: 'video',
      name: '影片音量記憶',
      site: 'Threads／X／IG／FB',
      desc: '每個網站各記住一個音量，之後每一支影片都用這個音量，不會突然 100%。在網站自己的音量條上調、或在這裡調都可以；直接打開 X 的影片網址（video.twimg.com）時用下面設定的音量。',
      defaults: { direct: 5, bar: 'hide' },
      fields: [
        { key: 'threads', label: 'Threads', type: 'memory', memKey: 'mem.threadsVolume', def: 0.1 },
        { key: 'x', label: 'X', type: 'memory', memKey: 'mem.xVolume', def: 0.01 },
        { key: 'ig', label: 'Instagram', type: 'memory', memKey: 'mem.igVolume', def: 0.1 },
        { key: 'fb', label: 'Facebook', type: 'memory', memKey: 'mem.fbVolume', def: 0.1 },
        { key: 'direct', label: 'X 影片網址', type: 'percent' },
        { key: 'bar', label: 'Threads 影片上的音量條', type: 'select', options: [['hide', '不顯示'], ['show', '顯示']] },
      ],
      frames: 'all',
      phase: 'start',
      match: () => /(^|\.)threads\.(com|net)$/.test(HOST) || HOST === 'x.com' || HOST === 'twitter.com' || HOST === 'video.twimg.com'
        || /(^|\.)instagram\.com$/.test(HOST) || /(^|\.)facebook\.com$/.test(HOST),
      start(ctx) {
        if (HOST === 'video.twimg.com') {
          // 直接打開影片網址：每支影片只設一次，不會蓋掉之後自己調的音量
          const seen = new WeakSet();
          const apply = (v) => {
            if (!v || v.tagName !== 'VIDEO' || seen.has(v)) return;
            seen.add(v);
            v.volume = clamp01(Number(ctx.cfg().direct) / 100);
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
        }
        if (HOST === 'x.com' || HOST === 'twitter.com') {
          const keeper = startVolumeKeeper('mem.xVolume', 0.01);
          return () => keeper.stop();
        }
        if (/instagram\.com$/.test(HOST)) {
          const keeper = startVolumeKeeper('mem.igVolume', 0.1, syncMetaPlayer);
          return () => keeper.stop();
        }
        if (/facebook\.com$/.test(HOST)) {
          const keeper = startVolumeKeeper('mem.fbVolume', 0.1, syncFbPlayer);
          return () => keeper.stop();
        }
        // Threads：自己的音量條要不要出現由設定決定，切換時立即生效
        const keeper = startVolumeKeeper('mem.threadsVolume', 0.1, syncMetaPlayer);
        let overlay = null;
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

    /* ---------------- X 影片下載按鈕 ---------------- */
    {
      id: 'xDownload',
      group: 'download',
      name: 'X 影片下載按鈕',
      site: 'X',
      desc: '在有影片或圖片的推文旁加上下載鈕，點了會用 cobalt.tools 開啟下載頁。按住 S 點圖片時，也不會再跳出 X 的分享選單。',
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
        // X 把 S 當成「分享」的快捷鍵：按住 S 點圖片（例如用別的工具存圖）時會跳出分享選單。
        // 只標記成「已處理」讓 X 不理它，其他程式照樣收得到這個按鍵；打字、Ctrl＋S 等組合鍵不受影響
        const noShareKey = (e) => {
          if ((e.key !== 's' && e.key !== 'S') || e.ctrlKey || e.metaKey || e.altKey || mtTyping(e)) return;
          e.preventDefault();
        };
        PAGE.addEventListener('keydown', noShareKey, true);
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
          PAGE.removeEventListener('keydown', noShareKey, true);
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
      desc: TOUCH
        ? '把漫畫圖片裡的英文、日文、韓文翻成繁體中文，用白底蓋住原文。在下面列出的網站，點角落的「譯」就會翻譯這一話；其他網站可以在 Tampermonkey 選單按「翻譯這一話的漫畫」，或「在這個網站顯示翻譯按鈕」。'
        : '把漫畫圖片裡的英文、日文、韓文翻成繁體中文，用白底蓋住原文。在下面列出的網站，滑到圖片上會出現「翻譯」按鈕；任何網站都可以按 Alt+T 翻譯整頁。',
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
        // 同一台裝置同時裝了整合包和手機版漫畫翻譯：只讓先啟動的那一個翻譯（不會有兩個「譯」、翻兩次）
        const root = document.documentElement;
        const other = root.getAttribute('data-maoboo-mt');
        if (other && other !== MT_TOKEN) return undefined;
        root.setAttribute('data-maoboo-mt', MT_TOKEN);
        const mt = createMangaTranslator(ctx);
        const stop = mt.stop;
        mt.stop = () => {
          stop();
          if (root.getAttribute('data-maoboo-mt') === MT_TOKEN) root.removeAttribute('data-maoboo-mt');
        };
        return mt;
      },
    },

    /* ---------------- 簡體轉繁體 ---------------- */
    {
      id: 's2t',
      group: 'translate',
      name: '簡體轉繁體',
      site: '簡體網頁',
      desc: '打開簡體中文的網頁（小說、B 站、知乎等）時，自動把文字轉成繁體，之後載入的內容也會轉。輸入框裡的字、程式碼不會動，日文網頁也不會被誤轉。',
      defaults: { exclude: [] },
      fields: [{ key: 'exclude', label: '不轉換的網站', type: 'list', placeholder: '例如 example.com' }],
      frames: 'all',
      phase: 'start',
      match: () => /^https?:$/.test(location.protocol),
      here: () => s2tOn,
      start(ctx) {
        const ex = (ctx.cfg().exclude || []).some((e) => { const d = String(e).trim().toLowerCase(); return d && (HOST === d || HOST.endsWith('.' + d)); });
        if (ex) return undefined;
        return startPageS2T();
      },
    },

    /* ---------------- 隱藏推薦內容 ---------------- */
    {
      id: 'feedClean',
      group: 'social',
      name: '隱藏推薦內容',
      site: 'FB／Threads',
      desc: '把動態裡的「贊助」廣告、還沒追蹤的粉專和社團的推薦貼文、「你可能認識的朋友」和「為你推薦」的帳號直接隱藏。想知道收了哪些，可以改成留一行字（點一下就能打開）。',
      defaults: { fb: 'all', threads: 'all', style: 'hide' },
      fields: [
        { key: 'fb', label: 'Facebook', type: 'select', options: [['all', '收贊助和推薦'], ['reels', '收贊助、推薦和 Reels'], ['ads', '只收贊助'], ['off', '不收']] },
        { key: 'threads', label: 'Threads', type: 'select', options: [['all', '收贊助和推薦帳號'], ['ads', '只收贊助'], ['off', '不收']] },
        { key: 'style', label: '收起來的樣子', type: 'select', options: [['hide', '完全隱藏'], ['line', '留一行字，點一下打開']] },
      ],
      frames: 'top',
      phase: 'start',
      match: () => /(^|\.)facebook\.com$/.test(HOST) || /(^|\.)threads\.(com|net)$/.test(HOST),
      here: () => !/(^|\.)facebook\.com$/.test(HOST) || /^\/(home\.php)?$/.test(location.pathname),
      start(ctx) {
        return startFeedClean(ctx);
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
  ].filter((m) => EDITION !== 'manga' || m.id === 'mangaTranslate');

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
  /** 選單只放這幾個常用的（照這個順序），其他功能和檢查更新都在設定面板裡 */
  const MENU_MODULES = ['mangaTranslate', 'ytShorts'];

  function renderMenu() {
    if (!IS_TOP || typeof GM_registerMenuCommand !== 'function') return;
    const items = [];
    for (const id of MENU_MODULES) {
      const m = MODULES.find((x) => x.id === id);
      if (!m) continue;
      items.push({ key: m.id, label: (isOn(m) ? '【開】' : '【關】') + m.name, title: m.desc, run: () => toggleFromMenu(m), close: false });
      const inst = m.menuExtra && running.get(m.id);
      if (inst && typeof inst.menuItems === 'function') {
        try { items.push(...inst.menuItems()); } catch (e) { console.error(`[MAOBOO] 「${m.name}」選單項目`, e); }
      }
    }
    items.push({ key: '_panel', label: '開啟設定面板', run: () => openPanel(), close: true });
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
    { id: 'social', name: '社群網站' },
    { id: 'web', name: '網頁' },
  ];

  function raccoonMark() {
    // 小浣熊像素圖（28×28）：K 黑框、D 深灰、G 灰、L 淺灰、W 眼睛的亮點
    const rows = [
      '.....KGGK......KGGK.........',
      '....KGLLGK....KGLLGK........',
      '....KGLLGGKKKKGGLLGK........',
      '....KGGGGGGGGGGGGGGK........',
      '...KLLLLLLGGLLLLLLGGK.......',
      '...KLLDDDLLLLDDDLLLGGK......',
      '..KLLDDWKDLLDWKDDLLLGKK.....',
      '..KLDDDKKDDDDKKDDDLLLKGK....',
      '.KLDDLLLLKKLLLLLLDDLLLKGK...',
      '.KLDLKLLLLLLLLLKLLDLLLKGK...',
      '.KLLLKLLLKKLLLLKLLLLLLKGGK..',
      '..KLLLKKKLLKKKKLLLLLLKGGGK..',
      '...KLLLLLLLLLLLLLLLLKGGGGGK.',
      '...KKKLLLLLLLLLLLLKKGGGGGGK.',
      '..KGGGKKLLLLLLLKKKGGGGKGGGK.',
      '.KGGGGKLKKKKKKKLLKGGGGKGGGGK',
      '.KGGGGKLLLLLLLLLLKGGGGKGGGGK',
      '.KGGGGKLLLLLLLLLLKDDGGKGGGGK',
      '.KGGDDKLLLLLLLLLLKDDDKGGGGGK',
      '..KDDDKLLLLLLLLLLLKKKGGGGGGK',
      '...KKKLLLLLLLLLLLLLLLGGGGGGK',
      '...KGGGLLLLLLLLLLLLLGGGGGGGK',
      '...KGGGGLLLLLLLLLLLGGGGGGGKD',
      '....KGGGGLLLLLLLLLGGGGGGGGKD',
      '.....KGGGGGGGGGGGGGGGGGGGKDD',
      '......KKKKGGGKKKKKKGGGGGKDDD',
      '.......KDDDDK.DDDDDKDDDDKDD.',
      '........KKKK....DDDDKKKKDD..',
    ];
    const colors = { K: '#000000', D: '#333333', G: '#666666', L: '#D9D9D9', W: '#FFFFFF' };
    const svg = h('svg:svg', { class: 'mb-mark', viewBox: '0 0 28 28', 'shape-rendering': 'crispEdges', 'aria-hidden': 'true' });
    // 每種顏色畫成一條 path：同一列連在一起的同色格子併成一段
    const d = {};
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        const c = row[x];
        let w = 1;
        while (row[x + w] === c) w++;
        if (colors[c]) d[c] = (d[c] || '') + `M${x} ${y}h${w}v1h-${w}z`;
        x += w;
      }
    });
    for (const c of Object.keys(d)) svg.append(h('svg:path', { d: d[c], fill: colors[c] }));
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
    // 音量：'percent' 存在設定裡，'memory' 是記住的音量。數字可以直接改；滑鼠在拉桿或數字上滾動也可以調
    const read = () => (f.type === 'memory' ? Math.round(clamp01(store.get(f.memKey, f.def)) * 100) : Number(cfgVal()) || 0);
    const range = h('input', { type: 'range', min: 0, max: 100, step: 1, 'aria-label': `${m.name}：${f.label}` });
    const num = h('input', { type: 'number', class: 'mb-pct', min: 0, max: 100, step: 1, inputmode: 'numeric', 'aria-label': `${m.name}：${f.label}（%）` });
    let holding = false;
    const show = (val) => { range.value = val; if (!num.matches(':focus')) num.value = val; };
    const write = (val, now) => {
      if (f.type === 'memory') {
        const k = keepers.get(f.memKey);
        if (k) k.set(val / 100, { now }); else store.set(f.memKey, val / 100);
      } else if (now) saveCfg(m, f.key, val);
    };
    const setTo = (val) => {
      val = Math.min(100, Math.max(0, Math.round(val)));
      range.value = val;
      num.value = val;
      write(val, true);
    };
    show(read());
    range.addEventListener('pointerdown', () => { holding = true; });
    range.addEventListener('pointerup', () => { holding = false; });
    range.addEventListener('input', () => { const val = Number(range.value); num.value = val; write(val, false); });
    range.addEventListener('change', () => write(Number(range.value), true));
    const commit = () => { const val = Number(num.value); setTo(num.value !== '' && Number.isFinite(val) ? val : read()); };
    num.addEventListener('change', commit);
    num.addEventListener('keydown', (e) => { if (e.key === 'Enter') { commit(); num.blur(); } });
    // 滾輪：往上大聲、往下小聲（10% 以下一次 1%，以上一次 5%）；觸控板的小幅捲動先累積，不會一下跳很多
    let acc = 0;
    const onWheel = (e) => {
      if (!e.deltaY) return;
      e.preventDefault();
      acc += e.deltaMode ? e.deltaY * 50 : e.deltaY;
      if (Math.abs(acc) < 50) return;
      const up = acc < 0;
      acc = 0;
      setTo(volStep(Number(range.value), up));
    };
    range.addEventListener('wheel', onWheel, { passive: false });
    num.addEventListener('wheel', onWheel, { passive: false });
    return {
      el: h('label', { class: 'mb-field mb-field-range' }, h('span', { text: f.label }), range, num, h('span', { class: 'mb-pct-unit', text: '%' })),
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
      h('section', { class: 'mb-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': `${APP.name}設定`, tabindex: '-1' },
        h('div', { class: 'mb-tail', 'aria-hidden': 'true' }),
        h('header', { class: 'mb-head' },
          raccoonMark(),
          h('div', { class: 'mb-head-text' },
            h('h2', { class: 'mb-title', text: APP.name }),
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
        const note = readNote(text, latest);
        const snooze = store.get('upd.snooze', null);
        if (!manual && snooze && snooze.v === latest && snooze.until > now) return;
        const later = () => store.set('upd.snooze', { v: latest, until: Date.now() + 6 * 3600 * 1000 });
        toast(note || '有新功能或修正。', {
          title: `${APP.short}有新版本 ${latest}（目前 ${VERSION}）`,
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

  // 1.4.1：「X 直連影片音量」併進「X 影片音量」，之前設過的音量搬過來
  (() => {
    const old = store.get('cfg.twimgVolume', null);
    const cur = store.get('cfg.xVolume', {}) || {};
    if (old && Number.isFinite(Number(old.volume)) && cur.direct === undefined) store.set('cfg.xVolume', Object.assign({}, cur, { direct: Number(old.volume) }));
  })();
  // 1.5.1：拿掉「滑過圖片看大圖」和「解除複製限制」，清掉它們留下的開關和設定
  (() => {
    for (const k of ['on.hoverZoom', 'cfg.hoverZoom', 'on.copyUnlock', 'cfg.copyUnlock']) {
      try { if (GM_getValue(k) !== undefined) GM_deleteValue(k); } catch (_) { /* 管理器不支援就留著，不影響使用 */ }
    }
  })();
  // 1.5.0：「Threads 音量記憶」和「X 影片音量」合成「影片音量記憶」，原本的開關和設定搬過來（記住的音量不變）
  (() => {
    if (store.get('on.videoVolume', null) === null && store.get('on.threadsVolume', true) === false && store.get('on.xVolume', true) === false) store.set('on.videoVolume', false);
    if (store.get('cfg.videoVolume', null) !== null) return;
    const t = store.get('cfg.threadsVolume', {}) || {};
    const x = store.get('cfg.xVolume', {}) || {};
    const merged = {};
    if (t.bar) merged.bar = t.bar;
    if (x.direct !== undefined) merged.direct = x.direct;
    if (Object.keys(merged).length) store.set('cfg.videoVolume', merged);
  })();
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
  for (const key of ['mem.threadsVolume', 'mem.xVolume', 'mem.igVolume', 'mem.fbVolume']) {
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
