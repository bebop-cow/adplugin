// ==UserScript==
// @name         Selective YouTube Ad Skipper
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==


const LIST_URL = "https://raw.githubusercontent.com/bebop-cow/adplugin/main/indie.json";

let cachedList = null;   // outside isIndie — what should it start as?

async function isIndie(channelId) {
  if (cachedList === null) {                                   // when should we fetch?
   try{
      const response = await fetch(LIST_URL);
      cachedList = await response.json();          // fill the cache
    } catch (error) {
      console.log("[adskip] list unreachable, skipping ad");
      return false;
    }
  }
  return cachedList.includes(channelId);
}
function getChannelId() {
  // Grab the whole page's HTML as one big string
  const html = document.documentElement.innerHTML;

  // TEMP diagnostic: how many distinct UC ids are on this page, and which is first?
  const all = html.match(/UC[A-Za-z0-9_-]{22}/g);   // note the /g — finds ALL, not just first
  console.log("[adskip] total UC ids on page:", all ? all.length : 0);
  console.log("[adskip] first one:", all ? all[0] : null);

  // Look for the channel ID pattern: "UC" followed by 22 more characters
  const match = html.match(/(UC[A-Za-z0-9_-]{22})/);

  // match[0] is the full hit; match[1] is the part in the capture group
  return match ? match[1] : null;
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