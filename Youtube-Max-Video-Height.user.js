// ==UserScript==
// @name        Youtube Max Height
// @namespace   Youtube Max Height
// @match       https://*.youtube.com/*
// @grant       none
// @version     0.4
// @author      popiazaza
// @home-url    https://github.com/popiazaza/Youtube-Max-Video-Height
// @homepageURL https://github.com/popiazaza/Youtube-Max-Video-Height
// @description A userscript to maximize height of youtube media player, so you can enjoy almost fullscreen-like video.
// @grant       GM_addStyle
// @license     MIT
// ==/UserScript==

GM_addStyle(`
ytd-watch-flexy[theater] #player-theater-container.ytd-watch-flexy, ytd-watch-flexy[fullscreen] #player-theater-container.ytd-watch-flexy {
  max-height: calc(100vh);
}
#masthead-container.ytd-app {
  opacity: 0;
}
#page-manager.ytd-app {
  margin-top: 0;
}
`);

let pressEsc = false;
let timeoutMouseout;

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
      timeoutMouseout = setTimeout(toggleHeader, 1500, 2);
    },
    true
  );
  // Todo: fix searchRec
  const searchRec = document.querySelector(".sbdd_a");
  if (!searchRec) {
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
        timeoutMouseout = setTimeout(toggleHeader, 1500, 2);
      },
      true
    );
  }
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
    !pressEsc &&
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
    pressEsc = !pressEsc;
    if (pressEsc) {
      toggleHeader(1);
    } else {
      toggleHeader(2);
    }
  }
}
