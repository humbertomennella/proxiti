(() => {
 "use strict";
 const root=document.documentElement;
 const button=document.getElementById("customer-theme-toggle");
 const key="proxiti-theme-v3";
 const apply=(theme)=>{
  const next=theme==="dark"?"dark":"light";
  root.dataset.theme=next;
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute("content",next==="dark"?"#0b1220":"#f6f7f9");
  button?.setAttribute("aria-label",next==="dark"?"Ativar tema claro":"Ativar tema escuro");
 };
 apply(root.dataset.theme);
 button?.addEventListener("click",()=>{
  const next=root.dataset.theme==="dark"?"light":"dark";
  apply(next);
  try{localStorage.setItem(key,next);}catch{}
 });
 window.addEventListener("storage",(event)=>{
  if(event.key===key)apply(event.newValue);
 });
})();
