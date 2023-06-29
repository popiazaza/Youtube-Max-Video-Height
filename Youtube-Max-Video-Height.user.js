// ==UserScript==
// @name        Youtube Max Height
// @namespace   Youtube Max Height
// @match       https://*.youtube.com/*
// @grant       none
// @version     0.7
// @author      popiazaza
// @home-url    https://github.com/popiazaza/Youtube-Max-Video-Height
// @homepageURL https://github.com/popiazaza/Youtube-Max-Video-Height
// @description A userscript to maximize height of youtube media player, so you can enjoy almost fullscreen-like video.
// @grant       GM_addStyle
// @license     MIT
// ==/UserScript==

GM_addStyle(`
ytd-watch-flexy[theater] #player-wide-container.ytd-watch-flexy, ytd-watch-flexy[fullscreen] #player-wide-container.ytd-watch-flexy {
  max-height: calc(100vh);
}
#masthead-container.ytd-app {
  opacity: 0;
}
#page-manager.ytd-app {
  margin-top: 0;
}
`);

let pinnedTopBar = false;
let timeoutMouseout;
// let searchRecRetry = 0;

(function () {
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  mastheadContainer.style.transition = "opacity 0.5s";
  mastheadContainer.style.opacity = 0;
  pageManager.style.marginTop = 0;
  document.onkeydown = hotkeys;
  mastheadContainer.addEventListener(
    "mouseover",
    function () {
      clearTimeout(timeoutMouseout);
      toggleHeader(1);
    },
    true
  );
  mastheadContainer.addEventListener(
    "mouseout",
    function () {
      timeoutMouseout = setTimeout(toggleHeader, 1000, 2);
    },
    true
  );
  findSearchRec();

  let previousUrl;

  const observer = new MutationObserver(() => {
    if (window.location.href !== previousUrl) {
      if (window.location.pathname.startsWith("/watch")) {
        pinnedTopBar = false;
        toggleHeader(2);
      } else {
        pinnedTopBar = true;
        toggleHeader(1);
      }
      previousUrl = window.location.href;
    }
  });

  const config = { subtree: true, childList: true };

  observer.observe(document, config);
})();

function toggleHeader(mouseover = 0) {
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  if (mouseover === 1 || mastheadContainer.style.opacity === 0) {
    mastheadContainer.style.opacity = 1;
    pageManager.style.marginTop =
      "var(--ytd-masthead-height,var(--ytd-toolbar-height))";
    document.querySelector("#search-input input").focus();
  } else if (
    !pinnedTopBar &&
    (mouseover === 2 || mastheadContainer.style.opacity === 1)
  ) {
    mastheadContainer.style.opacity = 0;
    pageManager.style.marginTop = 0;
    for (let element of Array.from(document.querySelectorAll(".gstl_50"))) {
      element.style.display = "none";
    }
  }
}

function hotkeys(e) {
  if (e.code === "Tab") {
    document.getElementById("guide-button").click();
  } else if (e.code === "Escape") {
    pinnedTopBar = !pinnedTopBar;
    if (pinnedTopBar) {
      toggleHeader(1);
    } else {
      toggleHeader(2);
    }
  }
}

function findSearchRec() {
  const searchRec = document.querySelector(".sbdd_a");
  if (searchRec) {
    searchRec.addEventListener(
      "mouseover",
      function () {
        clearTimeout(timeoutMouseout);
        toggleHeader(1);
      },
      true
    );
    searchRec.addEventListener(
      "mouseout",
      function () {
        timeoutMouseout = setTimeout(toggleHeader, 1000, 2);
      },
      true
    );
  } else {
    // searchRecRetry++;
    // if (searchRecRetry < 1000) {
      setTimeout(findSearchRec, 1000);
    // }
  }
}
