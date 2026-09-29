(() => {
 "use strict";
 const opener=document.getElementById("customer-footer-chat");
 const panel=document.getElementById("customer-support-popover");
 const closeButton=document.getElementById("customer-support-close");
 const frame=document.getElementById("customer-support-frame");
 if(!opener||!panel||!closeButton||!frame)return;
 const closeChat=()=>{
  if(panel.hidden)return;
  panel.hidden=true;
  opener.setAttribute("aria-expanded","false");
  opener.focus();
 };
 const openChat=()=>{
  if(!panel.hidden){closeChat();return;}
  panel.hidden=false;
  opener.setAttribute("aria-expanded","true");
  if(!frame.hasAttribute("src"))frame.src=frame.dataset.src;
  else{
   try{frame.contentWindow?.postMessage({type:"proxiti-chat-resume"},location.origin)}catch{}
  }
  closeButton.focus();
 };
 opener.addEventListener("click",openChat);
 closeButton.addEventListener("click",closeChat);
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!panel.hidden){event.preventDefault();closeChat();}
 });
 frame.addEventListener("load",()=>{
  try{
   frame.contentWindow?.postMessage({type:"proxiti-chat-resume"},location.origin);
   // Permite fechar com Escape também quando o foco está no chat integrado.
   frame.contentDocument?.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!panel.hidden){event.preventDefault();closeChat();}
   });
  }catch{}
 });
})();
