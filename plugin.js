// ==UserScript==
// @name         Selective YouTube Ad Skipper
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

const LIST_URL = "https://raw.githubusercontent.com/bebop-cow/adplugin/main/indie.json";
let cachedList = null;

// ---- the DECISION loop: runs on every ad, decides skip vs allow ----
async function checkAndBlock() {
  if (!location.pathname.startsWith("/watch")) return;      // watch pages only

  const player = document.querySelector(".html5-video-player");
  if (!player || !player.classList.contains("ad-showing")) return;  // no ad → stop

  const channelId = getChannelId();
  if (channelId && await isIndie(channelId)) return;        // indie → let it run

  skipAd();                                                 // everyone else → skip
}

async function isIndie(channelId) {
  if (cachedList === null) {
    try {
      const response = await fetch(LIST_URL);
      cachedList = await response.json();
    } catch (error) {
      console.log("[adskip] list unreachable — defaulting to block:", error);
      return false;
    }
  }
  return cachedList.includes(channelId);
}

function getChannelId() {
  const html = document.documentElement.innerHTML;
  const match = html.match(/(UC[A-Za-z0-9_-]{22})/);
  return match ? match[1] : null;
}

function skipAd() {
  const video = document.querySelector("video");
  if (video) video.currentTime = video.duration;
  const skipBtn = document.querySelector(".ytp-skip-ad-button, .ytp-ad-skip-button");
  if (skipBtn) skipBtn.click();
}

// ---- SETUP: runs ONCE when the script loads ----
window.addEventListener("yt-navigate-finish", checkAndBlock);

const player = document.querySelector(".html5-video-player");
if (player) {
  const observer = new MutationObserver(checkAndBlock);
  observer.observe(player, { attributes: true, attributeFilter: ["class"] });
}