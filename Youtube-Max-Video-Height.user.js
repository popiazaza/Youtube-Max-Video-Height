// ==UserScript==
// @name        Youtube Max Height
// @namespace   Youtube Max Height
// @match       https://*.youtube.com/*
// @version     0.9.3
// @author      popiazaza
// @home-url    https://github.com/popiazaza/Youtube-Max-Video-Height
// @homepageURL https://github.com/popiazaza/Youtube-Max-Video-Height
// @description A userscript to maximize height of youtube media player, so you can enjoy almost fullscreen-like video.
// @grant       GM_addStyle
// @license     MIT
// ==/UserScript==

GM_addStyle(`
ytd-watch-flexy[theater] #player-wide-container.ytd-watch-flexy, ytd-watch-flexy[fullscreen] #player-wide-container.ytd-watch-flexy, ytd-watch-flexy[full-bleed-player] #full-bleed-container.ytd-watch-flexy, ytd-watch-flexy[full-bleed-player] #full-bleed-container.ytd-watch-flexy {
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
let lastMouseY = 0;
const headerHoverZoneMultiplier = 3;

(function () {
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  mastheadContainer.style.transition = "opacity 0.2s";
  mastheadContainer.style.opacity = 0;
  pageManager.style.marginTop = 0;
  document.onkeydown = hotkeys;
  mastheadContainer.addEventListener(
    "mouseover",
    function () {
      clearTimeout(timeoutMouseout);
      timeoutMouseout = undefined;
      toggleHeader(1);
    },
    true
  );
  mastheadContainer.addEventListener(
    "mouseout",
    function (event) {
      lastMouseY = event.clientY;
      scheduleHeaderHide();
    },
    true
  );
  document.addEventListener(
    "mousemove",
    function (event) {
      lastMouseY = event.clientY;
      if (pinnedTopBar || mastheadContainer.style.opacity !== "1") {
        return;
      }
      if (event.clientY <= getHeaderHoverBoundary(mastheadContainer)) {
        clearTimeout(timeoutMouseout);
        timeoutMouseout = undefined;
      } else {
        scheduleHeaderHide();
      }
    },
    true
  );

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

function getHeaderHoverBoundary(mastheadContainer) {
  const mastheadRect = mastheadContainer.getBoundingClientRect();
  return mastheadRect.top + mastheadRect.height * headerHoverZoneMultiplier;
}

function scheduleHeaderHide() {
  clearTimeout(timeoutMouseout);
  timeoutMouseout = setTimeout(function () {
    timeoutMouseout = undefined;
    const mastheadContainer = document.getElementById("masthead-container");
    if (
      !pinnedTopBar &&
      lastMouseY > getHeaderHoverBoundary(mastheadContainer)
    ) {
      toggleHeader(2);
    }
  }, 500);
}

function toggleHeader(mouseover = 0) {
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  if (mouseover === 1 || mastheadContainer.style.opacity === 0) {
    mastheadContainer.style.opacity = 1;
    pageManager.style.marginTop =
      "var(--ytd-masthead-height,var(--ytd-toolbar-height))";
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
