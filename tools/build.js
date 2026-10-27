#!/usr/bin/env node
/**
 * 從 src/maoboo.src.js 產生要給大家安裝的檔案。兩個檔案各自有版本號，各自發布，互不影響：
 *
 *   node tools/build.js full    整合包 maoboo.user.js（版本號、更新紀錄寫在 src/maoboo.src.js 的開頭）
 *   node tools/build.js manga   手機版漫畫翻譯 manga-mobile.user.js（版本號、更新紀錄在 src/manga.json）
 *   node tools/build.js all     兩個都產生
 *
 * 只發布其中一個時，只產生那一個；另一個檔案不動，用那個版本的人就不會收到更新。
 * 加上 --out 資料夾 可以產生到別的地方（測試用）。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'maoboo.src.js');
const MANGA = path.join(ROOT, 'src', 'manga.json');
const RAW = 'https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/';

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--'));
const outAt = args.indexOf('--out');
const OUT = outAt >= 0 ? path.resolve(args[outAt + 1]) : ROOT;
if (!['full', 'manga', 'all'].includes(target)) {
  console.error('用法：node tools/build.js full|manga|all [--out 資料夾]');
  process.exit(1);
}

const src = fs.readFileSync(SRC, 'utf8');
const end = src.indexOf('// ==/UserScript==');
if (!src.startsWith('// ==UserScript==') || end < 0) throw new Error('找不到腳本資訊');
const head = src.slice(0, end).split('\n');
const body = src.slice(end + '// ==/UserScript=='.length);
const meta = (key) => head.filter((l) => new RegExp(`^// @${key}\\s`).test(l));
const isVer = (v) => /^\d+\.\d+\.\d+$/.test(v);
const marker = "  const EDITION = 'full';";
if (body.split(marker).length !== 2) throw new Error('找不到 EDITION');

/** 已經發布（git 最後一次 commit）的那份檔案；沒有 git 時用資料夾裡現有的 */
function released(name) {
  try {
    return require('child_process').execFileSync('git', ['show', `HEAD:${name}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (_) {
    const file = path.join(ROOT, name);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  }
}

function write(name, text, version) {
  const file = path.join(OUT, name);
  // 發布用的檔案：跟已經發布的那份內容不同、版本號卻一樣，裝了的人不會收到更新（同一個版本號卻是不同的程式），不讓它產生
  if (OUT === ROOT) {
    const old = released(name);
    const oldVer = ((/@version\s+([0-9.]+)/.exec(old) || [])[1] || '');
    if (old && old !== text && oldVer === version) throw new Error(`${name} 的內容變了，但版本號還是 ${version}：請先提高版本號`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(file, text);
  console.log(`${name} ${version}（${Math.round(text.length / 1024)} KB）`);
}

/** 整合包：原始碼本身就是整合包 */
function buildFull() {
  const version = (meta('version')[0] || '').replace(/^\/\/ @version\s+/, '').trim();
  if (!isVer(version)) throw new Error('整合包版本號不對：' + version);
  write('maoboo.user.js', src, version);
}

/** 手機版：只換腳本資訊、更新紀錄，並把 EDITION 改成 'manga'（只啟動漫畫翻譯），其他程式碼一樣 */
function buildManga() {
  const info = JSON.parse(fs.readFileSync(MANGA, 'utf8'));
  const version = String(info.version || '');
  if (!isVer(version)) throw new Error('手機版版本號不對：' + version);
  if (!info.changelog.length || info.changelog[0][0] !== version) throw new Error('手機版更新紀錄的第一筆要是 ' + version);
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
    `// @updateURL    ${RAW}manga-mobile.user.js`,
    `// @downloadURL  ${RAW}manga-mobile.user.js`,
    ...meta('icon'),
    ...meta('match'),
    ...meta('run-at'),
    ...meta('sandbox'),
    ...meta('grant'),
    ...connects,
    '// ==/UserScript==',
  ].join('\n');
  // 更新紀錄換成手機版自己的（更新通知會讀這裡）
  const log = ['/* ==更新紀錄==', ...info.changelog.flatMap(([v, ...lines]) => lines.map((t, i) => ` * ${i ? ' '.repeat(v.length) : v}  ${t}`)), ' * ==/更新紀錄== */'].join('\n');
  const logRe = /\/\* ==更新紀錄==[\s\S]*?==\/更新紀錄== \*\//;
  if (!logRe.test(body)) throw new Error('找不到更新紀錄');
  const out = header + body.replace(logRe, () => log).replace(marker, "  const EDITION = 'manga';");
  write('manga-mobile.user.js', out, version);
}

try {
  if (target === 'full' || target === 'all') buildFull();
  if (target === 'manga' || target === 'all') buildManga();
} catch (e) {
  console.error('沒有產生：' + e.message);
  process.exit(1);
}
