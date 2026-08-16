// ==UserScript==
// @name         Selective YouTube Ad Skipper
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==


const LIST_URL = "https://github.com/bebop-cow/adplugin/blob/main/plugin.js";

function getChannelId() {
  // Grab the whole page's HTML as one big string
  const html = document.documentElement.innerHTML;

  // Look for the channel ID pattern: "UC" followed by 22 more characters
  const match = html.match(/(UC[A-Za-z0-9_-]{22})/);

  // match[0] is the full hit; match[1] is the part in the capture group
  return match ? match[1] : null;
}

async function isIndie(channelId) {
  const response = await fetch(LIST_URL);
  const list = await response.json();
  return list.includes(channelId);
}

function skipAd() {
  const video = document.querySelector("video");
  if (video) video.currentTime = video.duration;

  const skipBtn = document.querySelector(".ytp-skip-ad-button, .ytp-ad-skip-button");
  if (skipBtn) skipBtn.click();   // only clicks if the button actually exists
}

async function checkAndBlock() {
  const player = document.querySelector(".html5-video-player");
  if (!player || !player.classList.contains("ad-showing")) return;  // no ad, nothing to do

  const channelId = getChannelId();
  if (channelId && await isIndie(channelId)) return;  // indie → let it run

  skipAd();  // everyone else → skip
}

window.addEventListener("yt-navigate-finish", checkAndBlock);

const observer = new MutationObserver(checkAndBlock);
observer.observe(document.body, { subtree: true, attributes: true });