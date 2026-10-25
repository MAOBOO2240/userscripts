# MAO BOO 油猴整合包

把常用的油猴腳本整合成一支，每個功能都能在 Tampermonkey 選單裡個別開關，並會自動更新。

**安裝／更新：** <https://raw.githubusercontent.com/MAOBOO2240/userscripts/main/maoboo.user.js>
（裝好 Tampermonkey 後點這個連結，按「安裝」即可）

## 功能

| 功能 | 作用網站 | 說明 |
|---|---|---|
| 影片快轉 | 所有網站 | Ctrl + ← / → 倒退、前進 87 秒（秒數和修飾鍵可改），打字時不會誤觸 |
| YouTube Shorts 自動下一部 | YouTube | 快播完自動跳下一部，背景分頁也會繼續播；只在 Shorts 頁面作用 |
| Threads 音量記憶 | Threads | 記住音量，之後每支影片都用這個音量；Threads 自己的音量條會同步，在那裡或設定面板調都可以 |
| X 音量記憶 | X | 第一次 1%，之後記住你在 X 播放器上調的音量 |
| X 直連影片音量 | video.twimg.com | 直接開影片網址時設成 5%，只設一次 |
| X 影片下載按鈕 | X | 推文旁的下載鈕，用 cobalt.tools 下載 |
| LINE 貼圖下載 | LINE Store | 靜態圖打包 ZIP；動態圖直接在 LINE 頁面轉成去背 GIF 再打包（不需要另開網頁） |
| 網址追蹤參數清除 | 所有網站 | 清掉 utm_、fbclid、gclid 等，以及 YouTube／Spotify 的 si、X 的 s 和 t、Threads 的 xmt |
| 手機版自動轉電腦版 | m. 網址 | m. 開頭的網址自動換成 www.，維基百科的 zh.m. 也會轉 |

## 開關功能

- 點瀏覽器上的 Tampermonkey 圖示，整合包底下每個功能前面會顯示【開】或【關】，點一下就切換，馬上生效。
- 選「開啟設定面板」可以一次看全部功能，也能調秒數、音量等設定。設定會同步到所有分頁。

## 自動更新

- 每次改版都會更新這裡的 `maoboo.user.js` 並提高版本號。
- 整合包每 30 分鐘會檢查一次，有新版本會在網頁下方跳出通知，按「更新」就會打開 Tampermonkey 的更新畫面。
- 也可以在選單按「檢查更新」立即檢查。

## 取代的舊腳本

安裝整合包後，請在 Tampermonkey 管理面板把這些舊腳本關掉或刪除，避免重複執行：

- 快捷鍵+左右跳過 87秒
- YouTube Shorts 自動下一部
- 通用手機版自動轉電腦版 (m. to www.)
- X.com (Twitter) 影片下載器 & 自動 1% 音量
- X (Twitter) 直連影片自動音量控制
- 通用網址追蹤參數清除器
- LINE Store 貼圖下載器

## 更新紀錄

### 1.0.2
- Threads 自己的音量條會跟記住的音量同步，拉的時候不會突然變大聲；在 Threads 音量條上調的音量也會記住

### 1.0.1
- Threads 影片上的音量條改成預設不顯示，音量在設定面板調（面板裡可以再打開）

### 1.0.0
- 第一版：整合 7 支腳本，選單逐項開關＋設定面板
- 新增 Threads 音量記憶；X 改成音量記憶（第一次 1%）
- LINE 動態貼圖改成直接在 LINE 頁面轉 GIF：平行下載、多執行緒轉檔，比舊版快數倍、檔案更小
- X 下載鈕合併處理頁面變動（滑動更順）；Shorts 只在短影片頁偽裝前景；X 直連影片不再延遲蓋掉音量
- 網址清除新增 si、s、t、xmt；手機版轉換支援維基百科

---

GIF 編碼與色彩量化改寫自 [gifenc](https://github.com/mattdesl/gifenc)（MIT License © Matt DesLauriers）。
