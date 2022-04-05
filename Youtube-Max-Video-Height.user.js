// ==UserScript==
// @name        Youtube Max Height
// @namespace   Youtube Max Height
// @match       https://*.youtube.com/*
// @grant       none
// @version     0.2
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

(function(){
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  const playerContainer = document.getElementById("player-container");
  const header = document.querySelector('#masthead-container #container');
  mastheadContainer.style.opacity = 0;
  pageManager.style.marginTop = 0;
  document.onkeydown = hotkeys;  
  mastheadContainer.addEventListener('mouseover', function(){toggleHeader(1);}, true);
  mastheadContainer.addEventListener('mouseout', function(){toggleHeader(2);}, true);
})();

function toggleHeader(mouseover = 0){
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  if(mouseover === 1 || mastheadContainer.style.opacity === 0){
    mastheadContainer.style.opacity = 1;
    pageManager.style.marginTop = 'var(--ytd-masthead-height,var(--ytd-toolbar-height))';
    document.querySelector('#search-input input').focus();
  } else if (mouseover === 2 || mastheadContainer.style.opacity === 1) {
    mastheadContainer.style.opacity = 0;
    pageManager.style.marginTop = 0;
  }
}

function hotkeys(e){
  if(e.code === 'Tab'){
    document.getElementById('guide-button').click();
  } else if (e.code === 'Escape'){
    toggleHeader();
  }
}
