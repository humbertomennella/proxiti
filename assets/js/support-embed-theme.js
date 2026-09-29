(() => {
 "use strict";
 const root=document.documentElement;
 if(!root.classList.contains("embedded")||window.parent===window)return;
 window.addEventListener("message",event=>{
  if(event.origin!==location.origin||event.source!==window.parent||
    event.data?.type!=="proxiti-chat-theme")return;
  root.dataset.theme=event.data.theme==="dark"?"dark":"light";
 });
})();
