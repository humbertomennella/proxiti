(() => {
"use strict";
const toggle=document.getElementById("support-widget-toggle");
const panel=document.getElementById("support-widget");
const close=document.getElementById("support-widget-close");
const frame=document.getElementById("support-widget-frame");
if(!toggle||!panel||!close||!frame)return;
function open(){
  panel.hidden=false;toggle.setAttribute("aria-expanded","true");
  if(!frame.src)frame.src=frame.dataset.src;
  close.focus();
}
function hide(){
  panel.hidden=true;toggle.setAttribute("aria-expanded","false");
  toggle.focus();
}
toggle.addEventListener("click",()=>panel.hidden?open():hide());
close.addEventListener("click",hide);
document.querySelectorAll("[data-open-chat]").forEach(link=>link.addEventListener("click",event=>{
  event.preventDefault();open();
}));
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!panel.hidden)hide();
});
})();