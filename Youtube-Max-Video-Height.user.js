// ==UserScript==
// @name        Youtube Max Height
// @namespace   Youtube Max Height
// @match       https://*.youtube.com/*
// @version     1.0.0
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
let searchTypingBuffer = "";
let searchTypingStartedAt = 0;
let searchTypingTimeout;
let pendingSearchKeys = [];
let searchMode = false;
let emptySearchTimeout;
const searchTypingWindow = 150;
const searchTypingCharacterCount = 2;
const emptySearchTimeoutDuration = 2000;

(function () {
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  mastheadContainer.style.transition = "opacity 0.2s";
  mastheadContainer.style.opacity = 0;
  pageManager.style.marginTop = 0;
  document.onkeydown = hotkeys;
  document.addEventListener("keydown", detectSearchTyping, true);
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
  document.addEventListener(
    "click",
    function (event) {
      const clickedEditable =
        event.target &&
        typeof event.target.closest === "function" &&
        event.target.closest("input, textarea, [contenteditable='true']");
      if (searchMode && !clickedEditable) {
        finishSearchMode();
      }
    },
    true
  );
  document.addEventListener(
    "input",
    function (event) {
      if (searchMode && isSearchInput(event.target)) {
        scheduleEmptySearchExit();
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
      !searchMode &&
      lastMouseY > getHeaderHoverBoundary(mastheadContainer)
    ) {
      toggleHeader(2);
    }
  }, 500);
}

function detectSearchTyping(event) {
  if (!event.isTrusted) {
    return;
  }
  if (searchMode && event.code === "Escape") {
    event.preventDefault();
    event.stopImmediatePropagation();
    finishSearchMode(true);
    return;
  }
  if (searchMode && event.code === "Enter" && isEditableTarget(event.target)) {
    setTimeout(finishSearchMode, 0);
    return;
  }
  if (
    event.isComposing ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    isEditableTarget(event.target) ||
    !isSearchTypingCharacter(event.key)
  ) {
    return;
  }

  if (event.repeat) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  const now = performance.now();
  if (
    !searchTypingStartedAt ||
    now - searchTypingStartedAt > searchTypingWindow
  ) {
    releasePendingSearchKeys();
    searchTypingStartedAt = now;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  pendingSearchKeys.push({
    target: event.target,
    key: event.key,
    code: event.code,
    location: event.location,
    shiftKey: event.shiftKey,
  });
  searchTypingBuffer += event.key;
  clearTimeout(searchTypingTimeout);
  const typingStartedAt = searchTypingStartedAt;
  searchTypingTimeout = setTimeout(function () {
    if (searchTypingStartedAt === typingStartedAt) {
      releasePendingSearchKeys();
    }
  }, searchTypingWindow);

  if (
    searchTypingBuffer.length >= searchTypingCharacterCount &&
    now - searchTypingStartedAt <= searchTypingWindow
  ) {
    const searchText = searchTypingBuffer;
    resetSearchTyping();
    startSearchMode(searchText);
  }
}

function isSearchTypingCharacter(key) {
  return /^\p{L}$/u.test(key);
}

function resetSearchTyping() {
  clearTimeout(searchTypingTimeout);
  searchTypingTimeout = undefined;
  searchTypingBuffer = "";
  searchTypingStartedAt = 0;
  pendingSearchKeys = [];
}

function releasePendingSearchKeys() {
  const keysToRelease = pendingSearchKeys;
  resetSearchTyping();
  for (const key of keysToRelease) {
    const target = key.target || document;
    if (typeof target.dispatchEvent !== "function") {
      continue;
    }
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: key.key,
        code: key.code,
        location: key.location,
        shiftKey: key.shiftKey,
        bubbles: true,
        cancelable: true,
      })
    );
  }
}

function isEditableTarget(target) {
  return (
    target &&
    (target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable)
  );
}

function isSearchInput(target) {
  return (
    target &&
    typeof target.matches === "function" &&
    target.matches(
      "ytd-searchbox input#search, #search-input input, input[name='search_query']"
    )
  );
}

function getSearchInput() {
  return document.querySelector(
    "ytd-searchbox input#search, #search-input input, input[name='search_query']"
  );
}

function scheduleEmptySearchExit() {
  clearTimeout(emptySearchTimeout);
  emptySearchTimeout = undefined;
  const searchInput = getSearchInput();
  if (!searchMode || !searchInput || searchInput.value.trim() !== "") {
    return;
  }
  emptySearchTimeout = setTimeout(function () {
    emptySearchTimeout = undefined;
    const currentSearchInput = getSearchInput();
    if (
      searchMode &&
      currentSearchInput &&
      currentSearchInput.value.trim() === ""
    ) {
      finishSearchMode();
    }
  }, emptySearchTimeoutDuration);
}

function startSearchMode(searchText) {
  searchMode = true;
  clearTimeout(timeoutMouseout);
  timeoutMouseout = undefined;
  toggleHeader(1);

  const searchInput = getSearchInput();
  if (!searchInput) {
    return;
  }
  searchInput.focus();
  searchInput.value = searchText;
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function finishSearchMode(clearInput = false) {
  if (!searchMode) {
    return;
  }
  searchMode = false;
  clearTimeout(timeoutMouseout);
  timeoutMouseout = undefined;
  clearTimeout(emptySearchTimeout);
  emptySearchTimeout = undefined;
  const searchInput = getSearchInput();
  if (searchInput) {
    if (clearInput) {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    searchInput.blur();
  }
  toggleHeader(2);
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
    if (searchMode) {
      finishSearchMode(true);
      return;
    }
    searchMode = false;
    pinnedTopBar = !pinnedTopBar;
    if (pinnedTopBar) {
      toggleHeader(1);
    } else {
      toggleHeader(2);
    }
  }
}
