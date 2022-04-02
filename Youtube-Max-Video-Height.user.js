// ==UserScript==
// @name        Youtube Max Height
// @namespace   Youtube Max Height
// @match       https://*.youtube.com/watch
// @grant       none
// @version     0.1
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
  visibility: hidden;
}
#page-manager.ytd-app {
  margin-top: 0;
}
`);

(function(){
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  mastheadContainer.style.visibility = 'hidden';
  pageManager.style.marginTop = 0;
  document.onkeydown = hotkeys;
})();

function toggleHeader(){
  const mastheadContainer = document.getElementById("masthead-container");
  const pageManager = document.getElementById("page-manager");
  if(mastheadContainer.style.visibility === 'hidden'){
    mastheadContainer.style.visibility = 'unset';
    pageManager.style.marginTop = 'var(--ytd-masthead-height,var(--ytd-toolbar-height))';
    document.querySelector('#search-input input').focus();
  } else {
    mastheadContainer.style.visibility = 'hidden';
    pageManager.style.marginTop = 0;
  }
}

function hotkeys(e){
  console.log(e.code);
  if(e.code === 'Tab'){
    document.getElementById('guide-button').click();
  } else if (e.code === 'Escape'){
    toggleHeader();
  }
}
