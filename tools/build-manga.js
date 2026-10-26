#!/usr/bin/env node
/**
 * 從整合包（maoboo.user.js）產生「手機版漫畫翻譯」（manga-mobile.user.js）。
 * 程式碼完全一樣，只換掉腳本資訊（名稱、更新網址），並把 EDITION 改成 'manga'（只啟動漫畫翻譯）。
 * 用法：node tools/build-manga.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'maoboo.user.js');
const OUT = path.join(ROOT, 'manga-mobile.user.js');
const RAW = 'https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/manga-mobile.user.js';

const src = fs.readFileSync(SRC, 'utf8');
const end = src.indexOf('// ==/UserScript==');
if (!src.startsWith('// ==UserScript==') || end < 0) throw new Error('找不到腳本資訊');
const head = src.slice(0, end).split('\n');
const body = src.slice(end + '// ==/UserScript=='.length);
const meta = (key) => head.filter((l) => new RegExp(`^// @${key}\\s`).test(l));

const version = (meta('version')[0] || '').replace(/^\/\/ @version\s+/, '').trim();
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('版本號不對：' + version);
// 漫畫翻譯用不到 LINE 貼圖的網域，其他權限照整合包
const connects = meta('connect').filter((l) => !/line-scdn\.net/.test(l));

const header = [
  '// ==UserScript==',
  '// @name         MAO BOO 漫畫翻譯（手機版）',
  '// @namespace    https://github.com/mao-boo/userscripts/manga',
  `// @version      ${version}`,
  '// @description  把漫畫圖片裡的英文、日文、韓文翻成繁體中文，用白底蓋住原文；手機上點角落的「譯」就能翻譯整話。這是 MAO BOO 油猴整合包裡的漫畫翻譯單獨拿出來的版本，給手機用。',
  '// @author       MAO BOO',
  ...meta('homepageURL'),
  ...meta('supportURL'),
  `// @updateURL    ${RAW}`,
  `// @downloadURL  ${RAW}`,
  ...meta('icon'),
  ...meta('match'),
  ...meta('run-at'),
  ...meta('sandbox'),
  ...meta('grant'),
  ...connects,
  '// ==/UserScript==',
].join('\n');

const marker = "  const EDITION = 'full';";
if (body.split(marker).length !== 2) throw new Error('找不到 EDITION');
const out = header + body.replace(marker, "  const EDITION = 'manga';");
fs.writeFileSync(OUT, out);
console.log(`manga-mobile.user.js ${version}（${Math.round(out.length / 1024)} KB）`);
