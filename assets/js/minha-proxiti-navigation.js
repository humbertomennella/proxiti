(() => {
 "use strict";
 const app=document.getElementById("customer-app");
 const collapse=document.getElementById("customer-sidebar-toggle");
 const mobileToggle=document.getElementById("customer-mobile-menu");
 const navigation=document.getElementById("customer-account-navigation");
 if(!app||!collapse||!mobileToggle||!navigation)return;
 const storageKey="proxiti-customer-sidebar-v2";
 const save=value=>{try{localStorage.setItem(storageKey,value?"collapsed":"expanded")}catch{}};
 const read=()=>{try{return localStorage.getItem(storageKey)==="collapsed"}catch{return false}};
 const updateCollapse=collapsed=>{
  app.classList.toggle("sidebar-collapsed",collapsed);
  const title=collapsed?"Expandir menu lateral":"Recolher menu lateral";
  collapse.setAttribute("aria-label",title);
  collapse.title=title;
  collapse.setAttribute("aria-expanded",String(!collapsed));
 };
 const closeMobile=()=>{
  app.classList.remove("sidebar-mobile-open");
  mobileToggle.setAttribute("aria-expanded","false");
  mobileToggle.setAttribute("aria-label","Abrir menu da conta");
 };
 updateCollapse(read());
 collapse.addEventListener("click",()=>{
  const next=!app.classList.contains("sidebar-collapsed");
  updateCollapse(next);save(next);
 });
 mobileToggle.addEventListener("click",()=>{
  const open=!app.classList.contains("sidebar-mobile-open");
  app.classList.toggle("sidebar-mobile-open",open);
  mobileToggle.setAttribute("aria-expanded",String(open));
  mobileToggle.setAttribute("aria-label",open?"Fechar menu da conta":"Abrir menu da conta");
 });
 const account=document.getElementById("customer-sidebar-account");
 account?.addEventListener("click",()=>{
  document.querySelector('[data-customer-view="profile"]')?.click();
  closeMobile();
 });
 navigation.querySelectorAll("[data-customer-view],[data-open-customer-request],#customer-logout")
  .forEach(control=>control.addEventListener("click",closeMobile));
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&app.classList.contains("sidebar-mobile-open")){
   closeMobile();mobileToggle.focus();
  }
 });
 const desktop=window.matchMedia("(min-width: 961px)");
 const widthChanged=()=>{if(desktop.matches)closeMobile()};
 desktop.addEventListener?.("change",widthChanged);
})();
