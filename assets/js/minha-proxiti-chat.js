(() => {
 "use strict";
 const opener=document.getElementById("customer-footer-chat");
 const panel=document.getElementById("customer-support-popover");
 const overlay=document.getElementById("customer-chat-overlay");
 const minimized=document.getElementById("customer-chat-minimized");
 const minimizeButton=document.getElementById("customer-support-minimize");
 const closeButton=document.getElementById("customer-support-close");
 const restoreButton=document.getElementById("customer-chat-restore");
 const dismissButton=document.getElementById("customer-chat-dismiss");
 const frame=document.getElementById("customer-support-frame");
 if([opener,panel,overlay,minimized,minimizeButton,closeButton,
     restoreButton,dismissButton,frame].some(node=>!node))return;
 const background=[document.querySelector(".customer-header"),
  document.querySelector("main"),document.querySelector(".customer-footer")].filter(Boolean);
 const theme=()=>document.documentElement.dataset.theme==="dark"?"dark":"light";
 const focus=(element)=>{try{element.focus({preventScroll:true})}catch{element.focus()}};
 const setBackgroundInert=(active)=>{
  for(const node of background)node.inert=active;
 };
 const sendTheme=()=>{
  if(!frame.hasAttribute("src"))return;
  try{frame.contentWindow?.postMessage(
   {type:"proxiti-chat-theme",theme:theme()},location.origin)}catch{}
 };
 const open=()=>{
  if(!panel.hidden)return;
  minimized.hidden=true;
  panel.hidden=false;overlay.hidden=false;
  setBackgroundInert(true);
  opener.setAttribute("aria-expanded","true");
  if(!frame.hasAttribute("src")){
   const url=new URL(frame.dataset.src,location.origin);
   if(url.origin!==location.origin)return;
   url.searchParams.set("theme",theme());
   frame.src=url.pathname+url.search;
  }else sendTheme();
  focus(closeButton);
 };
 const minimize=()=>{
  if(panel.hidden)return;
  panel.hidden=true;overlay.hidden=true;minimized.hidden=false;
  setBackgroundInert(false);
  opener.setAttribute("aria-expanded","false");
  focus(restoreButton);
 };
 const close=()=>{
  if(panel.hidden&&minimized.hidden)return;
  panel.hidden=true;overlay.hidden=true;minimized.hidden=true;
  setBackgroundInert(false);
  opener.setAttribute("aria-expanded","false");
  // A conversa segue guardada no navegador, mas deixa de fazer consultas
  // em segundo plano quando a janela está completamente fechada.
  if(frame.hasAttribute("src"))frame.removeAttribute("src");
  focus(opener);
 };
 opener.addEventListener("click",()=>panel.hidden?open():minimize());
 minimizeButton.addEventListener("click",minimize);
 closeButton.addEventListener("click",close);
 restoreButton.addEventListener("click",open);
 dismissButton.addEventListener("click",close);
 overlay.addEventListener("click",close);
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!panel.hidden){event.preventDefault();close();}
 });
 frame.addEventListener("load",()=>{
  if(!panel.hidden)sendTheme();
  try{
   frame.contentDocument?.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!panel.hidden){event.preventDefault();close();}
   });
  }catch{}
 });
 new MutationObserver(sendTheme).observe(document.documentElement,{
  attributes:true,attributeFilter:["data-theme"]
 });
})();
