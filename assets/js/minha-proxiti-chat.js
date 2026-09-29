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
  if(!panel.hidden||hiding)return;
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
 let hiding=false;
 const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
 const finishHide=(mode,animations=[])=>{
  panel.hidden=true;overlay.hidden=true;
  minimized.hidden=mode!=="minimize";
  for(const animation of animations)animation.cancel();
  setBackgroundInert(false);
  opener.setAttribute("aria-expanded","false");
  if(mode==="close"){
   // Minimizar conserva a conversa; fechar descarrega o iframe.
   if(frame.hasAttribute("src"))frame.removeAttribute("src");
   focus(opener);
  }else focus(restoreButton);
  hiding=false;
 };
 const hidePanel=mode=>{
  if(panel.hidden||hiding)return;
  hiding=true;
  if(reduceMotion.matches||typeof panel.animate!=="function"){
   finishHide(mode);return;
  }
  // Encerrar a animação de abertura antes de iniciar a saída.
  for(const animation of panel.getAnimations())
   if(animation.playState==="running")animation.finish();
  const minimizing=mode==="minimize";
  const dx=minimizing?Math.round(window.innerWidth/2-133):0;
  const dy=minimizing?Math.round(window.innerHeight/2-54):9;
  const options={duration:minimizing?260:190,easing:"cubic-bezier(.4,0,1,1)",
   fill:"forwards"};
  const animations=[
   panel.animate([
    {opacity:1,scale:1,translate:"0 0",filter:"blur(0px)"},
    {opacity:0,scale:minimizing?.64:.95,translate:dx+"px "+dy+"px",
     filter:"blur(1px)"}
   ],options),
   overlay.animate([{opacity:1},{opacity:0}],{
    duration:190,easing:"ease-in",fill:"forwards"
   })
  ];
  void Promise.allSettled(animations.map(animation=>animation.finished))
   .then(()=>finishHide(mode,animations));
 };
 const minimize=()=>hidePanel("minimize");
 const close=()=>{
  if(hiding)return;
  if(panel.hidden){
   if(minimized.hidden)return;
   minimized.hidden=true;overlay.hidden=true;
   setBackgroundInert(false);
   opener.setAttribute("aria-expanded","false");
   if(frame.hasAttribute("src"))frame.removeAttribute("src");
   focus(opener);return;
  }
  hidePanel("close");
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
