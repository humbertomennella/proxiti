import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=resolve(fileURLToPath(new URL("../",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp"};
const server=createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,"http://localhost").pathname;
  const target=resolve(root,"."+decodeURIComponent(pathname.endsWith("/")?pathname+"index.html":pathname));
  if(!target.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(target);res.writeHead(200,{
    "content-type":mime[extname(target)]||"application/octet-stream",
    "cache-control":"no-store"});res.end(data);
 }catch{res.writeHead(404);res.end("not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
let page;
try{
 const context=await browser.newContext({viewport:{width:390,height:800}});
 await context.addInitScript(()=>{
  const fixture={session:null,callback:null,signups:[],rpcCalls:[],requests:[],quoteDecisions:[],
    account:{display_name:"Cliente de teste",phone:"",city:"Curitiba",preferred_channel:"email"},
    tickets:[],devices:[],schedule:[],preferences:[],ratings:[],partners:[
     {id:"11111111-1111-4111-8111-111111111111",name:"Parceiro autorizado",
      headline:"Suporte técnico",specialties:["Computadores"],regions:["Curitiba"],
      remote:true,on_site:true}],latestToken:"a".repeat(64)};
  const user={id:"22222222-2222-4222-8222-222222222222",
    email:"cliente@example.com",email_confirmed_at:"2026-09-28T12:00:00Z"};
  const emit=(event)=>queueMicrotask(()=>fixture.callback?.(event,fixture.session));
  const ok=data=>Promise.resolve({data,error:null});
  const client={
   auth:{
    onAuthStateChange(callback){fixture.callback=callback;queueMicrotask(()=>callback("INITIAL_SESSION",fixture.session));
      return {data:{subscription:{unsubscribe(){}}}};},
    async signUp(options){fixture.signups.push(options);return {data:{user,session:null},error:null};},
    async signInWithPassword(){fixture.session={user,access_token:"test-signed-jwt"};
      emit("SIGNED_IN");return {data:{user,session:fixture.session},error:null};},
    async getUser(){return {data:{user:fixture.session?user:null},error:null};},
    async getSession(){return {data:{session:fixture.session},error:null};},
    async refreshSession(){return {data:{session:fixture.session},error:null};},
    async signOut(){fixture.session=null;emit("SIGNED_OUT");return {error:null};},
    async resetPasswordForEmail(){return {error:null};},
    async updateUser(){return {error:null};}
   },
   rpc(name,args){
    fixture.rpcCalls.push({name,args});
    if(name==="proxiti_customer_access_status")
      return ok({active:!!fixture.account,can_activate:!fixture.account});
    if(name==="proxiti_customer_activate"){
      if(!args?.p_privacy_accepted)return Promise.resolve({data:null,error:{message:"Consentimento ausente"}});
      fixture.account={display_name:"Cliente de teste",phone:"",city:"",
       preferred_channel:"email"};
      return ok({ok:true});
    }
    if(name==="proxiti_customer_dashboard")return ok({
      account:fixture.account,tickets:fixture.tickets,devices:fixture.devices,
      schedule:fixture.schedule,preferences:fixture.preferences,ratings:fixture.ratings
    });
    if(name==="proxiti_customer_partner_directory")return ok(fixture.partners);
    if(name==="proxiti_customer_save_device"){
      const device={id:args.p_id||"33333333-3333-4333-8333-333333333333",user_id:user.id,
       label:args.p_label,category:args.p_category,brand:args.p_brand,
       model:args.p_model,notes:args.p_notes,archived:args.p_archived};
      fixture.devices=fixture.devices.filter(d=>d.id!==device.id);
      if(!device.archived)fixture.devices.push(device);
      return ok(device.id);
    }
    if(name==="proxiti_customer_schedule"){
      fixture.schedule.push({id:"44444444-4444-4444-8444-444444444444",ticket_id:args.p_ticket,
       preferred_at:args.p_at,modality:args.p_modality,note:args.p_note,status:"pending",
       created_at:new Date().toISOString()});
      return ok(fixture.schedule.at(-1).id);
    }
    if(name==="proxiti_customer_set_partner"){
      fixture.preferences=[{ticket_id:args.p_ticket,partner_id:args.p_partner}];
      return ok(null);
    }
    if(name==="proxiti_customer_link_ticket"){
      fixture.tickets.push({id:args.p_ticket,reference:13,subject:"Conversa antiga",
       status:"triage",description:"Problema antigo",created_at:new Date().toISOString()});
      return ok(null);
    }
    if(name==="proxiti_customer_update"){
      Object.assign(fixture.account,{display_name:args.p_name,phone:args.p_phone,
       city:args.p_city,preferred_channel:args.p_channel});return ok(null);
    }
    return Promise.resolve({data:null,error:{message:"RPC inesperada: "+name}});
   }
  };
  window.__customerFixture=fixture;
  window.supabase={createClient:()=>client};
 });
 page=await context.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 page.on("dialog",dialog=>dialog.accept());
 await page.route("https://cdn.jsdelivr.net/**",route=>route.fulfill({
  status:200,contentType:"application/javascript",body:""}));
 await page.route("https://fonts.googleapis.com/**",route=>route.abort());
 await page.route("https://qbqfbrbbsvpftmtfhfab.supabase.co/functions/v1/proxiti-support",async route=>{
  if(route.request().method()==="OPTIONS")return route.fulfill({status:204,
   headers:{"access-control-allow-origin":base,"access-control-allow-headers":"apikey,content-type,authorization",
    "access-control-allow-methods":"POST,OPTIONS"}});
  const b=route.request().postDataJSON(),fx=await page.evaluate(()=>window.__customerFixture);
  let response={};
  if(b.action==="customer_register"){
   await page.evaluate(input=>window.__customerFixture.signups.push(input),{
     email:b.email,passwordLength:b.password?.length,
     hasDigit:/[0-9]/.test(b.password||""),
     hasSymbol:/[@#$!%&*]/.test(b.password||""),
     consent:b.privacy_accepted
   });
   response={ok:true,login_ready:true};
  }else if(b.action==="account_open"){
   response={ok:true,id:"55555555-5555-4555-8555-555555555555",
    reference:17,status:"new",access_token:"a".repeat(64)};
   await page.evaluate(()=>{window.__customerFixture.tickets.push({
    id:"55555555-5555-4555-8555-555555555555",reference:17,
    subject:"Notebook não inicia",status:"new",description:"Notebook não abre o sistema",
    created_at:new Date().toISOString()})});
  }else if(b.action==="account_conversation"){
   response={ticket:{id:b.ticket_id,reference:17,subject:"Notebook não inicia",status:"triage",
    online:false},messages:[]};
  }else if(b.action==="account_quotes"){
   response={quotes:[{id:"66666666-6666-4666-8666-666666666666",reference:2,
    status:"issued",valid_until:"2099-12-31",total_cents:4000,
    items:[{title:"Suporte remoto",quantity:1,unit_price_cents:4000,
     subtotal_cents:4000,scope:"Diagnóstico remoto orientado."}]}]};
  }else if(b.action==="account_quote_decision"){
   await page.evaluate(input=>window.__customerFixture.quoteDecisions.push(input),{
    ticket_id:b.ticket_id,quote_id:b.quote_id,decision:b.decision,confirmed:b.confirmed});
   response={ok:true,decision:b.decision,reference:2,already_recorded:false};
  }else if(b.action==="account_reply")response={ok:true};
  else return route.fulfill({status:400,contentType:"application/json",
   headers:{"access-control-allow-origin":base},
   body:JSON.stringify({error:"Ação não simulada: "+b.action})});
  await route.fulfill({status:200,contentType:"application/json",
   headers:{"access-control-allow-origin":base},body:JSON.stringify(response)});
 });
 await page.goto(base+"/minha-proxiti/",{waitUntil:"domcontentloaded"});
 await page.waitForSelector("#customer-login-form:not([hidden])");
 assert.equal(await page.locator("#customer-app").isVisible(),false);
 assert.equal(await page.locator('html').getAttribute("data-theme"),"light");
 assert.equal(await page.locator("#customer-theme-label").innerText(),"Tema claro");
 assert.equal(await page.locator(".customer-header .brand-mark").count(),1);
 assert.equal(await page.locator(".customer-header .customer-brand").getAttribute("href"),"/minha-proxiti/");
 assert.equal(await page.locator(".customer-footer .customer-brand").getAttribute("href"),"/minha-proxiti/");
 assert((await page.locator(".customer-header-caption").innerText()).includes("MINHA PROXITI"));
 assert.equal(await page.locator(".customer-explore").getAttribute("href"),"/");
 assert.equal(await page.locator("#customer-auth .auth-foot").count(),0);
 const loginUrl=page.url();
 await page.click("#customer-footer-chat");
 await page.waitForSelector("#customer-support-popover:not([hidden])");
 await page.waitForFunction(()=>document.getElementById("customer-support-popover")
  .getAnimations().every(animation=>animation.playState!=="running"));
 assert.equal(page.url(),loginUrl,"Abrir conversa não deve sair do login");
 assert.equal(await page.locator("#customer-footer-chat").getAttribute("aria-expanded"),"true");
 assert.equal(await page.locator("#customer-chat-overlay").isVisible(),true);
 const popupRect=await page.locator("#customer-support-popover").boundingBox();
 assert(Math.abs(popupRect.x+popupRect.width/2-195)<2 &&
   Math.abs(popupRect.y+popupRect.height/2-400)<2,
   "Chat deve aparecer no centro da tela, inclusive no celular");
 const headerGeometry=()=>page.evaluate(()=>{
  const rect=id=>{const box=document.getElementById(id).getBoundingClientRect();
   return {x:box.x,y:box.y,width:box.width,height:box.height,right:box.right};};
  const panel=document.getElementById("customer-support-popover");
  const actions=document.querySelector(".customer-support-popover-head>.customer-chat-actions");
  const style=getComputedStyle(panel);
  return {min:rect("customer-support-minimize"),close:rect("customer-support-close"),
   panel:rect("customer-support-popover"),display:getComputedStyle(actions).display,
   direction:getComputedStyle(actions).flexDirection,
   radius:parseFloat(style.borderTopLeftRadius),
   edges:[style.borderTopWidth,style.borderRightWidth,
    style.borderBottomWidth,style.borderLeftWidth],
   outline:style.borderLeftColor,lettering:style.fontFamily};
 });
 const mobile=await headerGeometry();
 assert(mobile.display.includes("flex")&&mobile.direction==="row",
  "Controles do chat devem ficar em uma linha");
 assert(Math.abs(mobile.min.y-mobile.close.y)<2&&mobile.min.right+5<=mobile.close.x,
  "Minimizar e fechar devem aparecer lado a lado, sem sobreposição no celular");
 assert(mobile.min.width>=35&&mobile.close.width>=35&&mobile.radius>=16,
  "Controles e janela precisam ter tamanho e cantos acessíveis");
 assert(mobile.edges.every(edge=>parseFloat(edge)>=2),
  "A borda precisa contornar a janela inteira no celular");
 assert(mobile.lettering.includes("Manrope"),"A janela precisa usar a nova tipografia");
 assert.equal(await page.locator(".customer-chat-actions svg").count(),2);
 await page.setViewportSize({width:1280,height:850});
 const desktop=await headerGeometry();
 assert(desktop.panel.width>=950&&desktop.panel.width<=1000,
  "A janela precisa ficar significativamente mais larga no desktop");
 assert(desktop.edges.every(edge=>parseFloat(edge)>=2),
  "As quatro bordas devem estar visíveis no desktop");
 assert(desktop.outline==="rgb(98, 136, 206)",
  "Borda externa precisa ter cor sólida e visível no tema claro");
 assert.equal(await page.locator("#customer-support-title").innerText(),"Converse com a PROXITI");
 assert.equal(await page.locator(".customer-support-popover-head small").innerText(),
  "Seu suporte, com contexto e continuidade.");
 const typography=await page.evaluate(()=>{
  const title=document.getElementById("customer-support-title");
  const accent=title.querySelector("span");
  const subtitle=document.querySelector(".customer-support-popover-head small");
  const heroAccent=document.querySelector("#customer-auth .auth-visual h1 span");
  const heading=getComputedStyle(title);
  return {font:heading.fontFamily,size:parseFloat(heading.fontSize),
   weight:parseInt(heading.fontWeight,10),
   accent:getComputedStyle(accent).color,
   heroAccent:getComputedStyle(heroAccent).color,
   subtitleFont:getComputedStyle(subtitle).fontFamily};
 });
 assert(typography.font.includes("Inter")&&typography.subtitleFont.includes("Inter")&&
  typography.size>=27&&typography.weight>=800,
  "Cabeçalho deve usar a tipografia forte do título da tela de login");
 assert.equal(typography.accent,typography.heroAccent,
  "A marca no chat deve usar o mesmo azul do destaque da tela de login");
 assert.equal(await page.locator("#customer-support-popover").evaluate(
  el=>getComputedStyle(el).borderTopStyle),"solid");
 assert.equal(await page.locator("#customer-support-popover").evaluate(
  el=>getComputedStyle(el).animationName),"customer-chat-open");

 assert(Math.abs(desktop.min.y-desktop.close.y)<2&&desktop.min.right+6<=desktop.close.x,
  "Controles do chat devem permanecer lado a lado no desktop");
 assert(Math.abs(desktop.panel.x+desktop.panel.width/2-640)<2,
  "Janela deve permanecer centralizada no desktop");
 await page.setViewportSize({width:390,height:800});
 const chatUrl=new URL(await page.locator("#customer-support-frame").getAttribute("src"),base);
 assert.equal(chatUrl.pathname,"/atendimento/");
 assert.equal(chatUrl.searchParams.get("embed"),"1");
 assert.equal(chatUrl.searchParams.get("theme"),"light");
 await page.frameLocator("#customer-support-frame").locator("#support-start").waitFor({state:"visible"});
 const firstChatLayout=()=>page.frameLocator("#customer-support-frame").locator("body").evaluate(()=>{
  const box=id=>{const r=document.getElementById(id).getBoundingClientRect();
   return {left:r.left,right:r.right,width:r.width,top:r.top,bottom:r.bottom};};
  const row=getComputedStyle(document.querySelector(".support-start-composer-row"));
  const field=getComputedStyle(document.getElementById("support-description"));
  return {textarea:box("support-description"),send:box("start-submit"),
   privacy:box("support-consent"),viewport:innerWidth,
   rowBorder:row.borderTopWidth,fieldBorder:field.borderRightWidth,
   font:field.fontFamily,bodySize:getComputedStyle(document.body).fontSize};
 });
 let initialChat=await firstChatLayout();
 assert(initialChat.send.left>=initialChat.textarea.right+8&&
  initialChat.send.right<=initialChat.viewport&&initialChat.send.width>=48,
  "No celular, o botão deve ficar fora da borda do campo de texto");
 assert(initialChat.rowBorder==="0px"&&parseFloat(initialChat.fieldBorder)>=1,
  "Somente o campo deve ter borda, não o conjunto campo e botão");
 assert(initialChat.font.includes("Manrope")&&parseFloat(initialChat.bodySize)>=16,
  "Tipografia da conversa precisa ser legível e corresponder à janela");
 assert(initialChat.privacy.bottom<=initialChat.textarea.top,
  "Consentimento deve permanecer disponível antes do envio");
 await page.setViewportSize({width:1280,height:850});
 initialChat=await firstChatLayout();
 assert(initialChat.send.left>=initialChat.textarea.right+12&&
  initialChat.send.right<=initialChat.viewport&&initialChat.send.width>=120,
  "No desktop, Iniciar deve ficar fora do campo, separado por espaço visível");
 await page.setViewportSize({width:390,height:800});
 assert.equal(await page.frameLocator("#customer-support-frame").locator("html").getAttribute("data-theme"),"light");
 assert.equal(await page.frameLocator("#customer-support-frame").locator("#customer-quotes").count(),0);
 assert.equal(await page.frameLocator("#customer-support-frame").locator(".support-account-invite").isVisible(),false);
 await page.click("#customer-support-minimize");
 await page.locator("#customer-support-popover").waitFor({state:"hidden"});
 assert.equal(await page.locator("#customer-chat-overlay").isVisible(),false);
 assert.equal(await page.locator("#customer-chat-minimized").isVisible(),true);
 await page.click("#customer-theme-toggle");
 assert.equal(await page.locator('html').getAttribute("data-theme"),"dark");
 await page.click("#customer-chat-restore");
 await page.waitForSelector("#customer-support-popover:not([hidden])");
 await page.waitForFunction(()=>document.querySelector("#customer-support-frame")?.contentDocument?.documentElement.dataset.theme==="dark");
 assert.equal(await page.frameLocator("#customer-support-frame").locator("html").getAttribute("data-theme"),"dark");
 await page.click("#customer-support-minimize");
 await page.locator("#customer-support-popover").waitFor({state:"hidden"});
 await page.click("#customer-theme-toggle");
 await page.click("#customer-chat-restore");
 await page.waitForFunction(()=>document.querySelector("#customer-support-frame")?.contentDocument?.documentElement.dataset.theme==="light");
 await page.click("#customer-support-close");
 await page.locator("#customer-support-popover").waitFor({state:"hidden"});
 assert.equal(await page.locator("#customer-support-popover").isVisible(),false);
 assert.equal(await page.locator("#customer-chat-minimized").isVisible(),false);
 assert.equal(await page.locator("#customer-footer-chat").getAttribute("aria-expanded"),"false");
 assert.equal(await page.evaluate(()=>document.activeElement?.id),"customer-footer-chat");
 await page.click("#customer-footer-chat");
 await page.keyboard.press("Escape");
 await page.locator("#customer-support-popover").waitFor({state:"hidden"});
 assert.equal(await page.locator("#customer-support-popover").isVisible(),false);
 assert.equal(page.url(),loginUrl);
 await page.click(".customer-header .customer-brand");
 await page.waitForSelector("#customer-login-form:not([hidden])");
 assert.equal(page.url(),loginUrl,"O logo não deve levar para a página institucional");
 await page.waitForFunction(()=>document.querySelector(".customer-portal-art img")?.naturalWidth>0);
 const mobileHero=await page.locator(".customer-auth-hero").boundingBox();
 const mobileCard=await page.locator("#customer-auth .auth-panel").boundingBox();
 assert(mobileCard.y>=mobileHero.y+mobileHero.height-1,
  "No celular, o cartão de acesso deve ficar abaixo do hero");
 await page.setViewportSize({width:1280,height:850});
 const desktopHero=await page.locator(".customer-auth-hero").boundingBox();
 const desktopCard=await page.locator("#customer-auth .auth-panel").boundingBox();
 assert(desktopCard.x>=desktopHero.x+desktopHero.width-1,
  "No desktop, o cartão deve estar ao lado do hero");
 await page.setViewportSize({width:390,height:800});
 await page.click("#customer-theme-toggle");
 assert.equal(await page.locator('html').getAttribute("data-theme"),"dark");
 assert.equal(await page.locator("#customer-theme-label").innerText(),"Tema escuro");
 assert.equal(await page.evaluate(()=>localStorage.getItem("proxiti-theme-v3")),"dark");
 await page.click("#customer-theme-toggle");
 assert.equal(await page.locator('html').getAttribute("data-theme"),"light");
 assert.equal(await page.locator("#customer-theme-label").innerText(),"Tema claro");
 assert.equal(await page.evaluate(()=>localStorage.getItem("proxiti-theme-v3")),"light");
 // Os blocos externos não podem crescer, mudar de posição nem fazer a página pular.
 await page.setViewportSize({width:1280,height:850});
 const geometry=()=>page.evaluate(()=>{
  const get=sel=>{const r=document.querySelector(sel).getBoundingClientRect();
    return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};};
  return {hero:get(".customer-auth-hero"),card:get("#customer-auth .auth-panel"),
   pageHeight:document.documentElement.scrollHeight};
 });
 const initial=await geometry();
 await page.click("#customer-show-signup");
 await page.waitForFunction(()=>new DOMMatrixReadOnly(getComputedStyle(
  document.querySelector(".auth-slider-track")).transform).m41 < -100);
 assert.deepEqual(await geometry(),initial,"O layout externo não pode mudar no cadastro");
 assert.equal(await page.locator("#customer-signup-form h2").innerText(),"Seu espaço começa aqui.");
 assert.equal(await page.locator(".auth-pane-login").getAttribute("aria-hidden"),"true");
 assert.equal(await page.locator(".auth-pane-signup").getAttribute("aria-hidden"),"false");
 assert.equal(await page.locator(".auth-pane-login").evaluate(el=>el.inert),true);
 await page.click("#customer-show-login");
 await page.waitForFunction(()=>Math.abs(new DOMMatrixReadOnly(getComputedStyle(
  document.querySelector(".auth-slider-track")).transform).m41)<1);
 assert.deepEqual(await geometry(),initial,"O layout externo não pode mudar no login");
 await page.click("#customer-show-signup");
 await page.waitForFunction(()=>new DOMMatrixReadOnly(getComputedStyle(
  document.querySelector(".auth-slider-track")).transform).m41 < -100);
 assert.deepEqual(await geometry(),initial);
 await page.setViewportSize({width:390,height:800});
 assert.equal(await page.locator(".customer-auth-card-top").isVisible(),true);
 await page.fill("#customer-signup-name","Cliente de teste");
 await page.fill("#customer-signup-email","cliente@example.com");
 await page.fill("#customer-signup-password","Teste123abc");
 await page.fill("#customer-signup-confirm","Teste123abc");
 assert.equal(await page.locator('[data-password-rule="length"]').getAttribute("class"),"is-met");
 assert.equal(await page.locator('[data-password-rule="number"]').getAttribute("class"),"is-met");
 assert.equal(await page.locator('[data-password-rule="case"]').getAttribute("class"),"is-met");
 assert.equal(await page.locator('[data-password-rule="symbol"]').getAttribute("class"),null);
 await page.check("#customer-signup-privacy");
 await page.click("#customer-signup-form button[type=submit]");
 assert((await page.textContent("#customer-auth-status")).includes("letra, número e símbolo"));
 assert.equal(await page.evaluate(()=>window.__customerFixture.signups.length),0,
   "Senha sem símbolo não deve registrar uma conta");
 await page.fill("#customer-signup-password","Teste123@ab");
 await page.fill("#customer-signup-confirm","Teste123@ab");
 assert.equal(await page.locator('[data-password-rule="symbol"]').getAttribute("class"),"is-met");
 await page.click("#customer-signup-form button[type=submit]");
 await page.waitForFunction(()=>window.__customerFixture.signups.length===1);
 await page.waitForSelector("#customer-app:not([hidden])");
 const signup=await page.evaluate(()=>window.__customerFixture.signups[0]);
 assert.equal(signup.passwordLength,11);
 assert(signup.hasDigit&&signup.hasSymbol&&signup.consent);
 assert.equal(signup.email,"cliente@example.com");
 assert.equal(await page.locator("#customer-verify").isVisible(),false,
   "O novo cadastro não deve depender de confirmação por e-mail");
 assert((await page.textContent("#customer-welcome")).includes("Cliente de teste"));
 assert.equal(await page.locator("#customer-home-first-name").innerText(),"Cliente");
 assert.equal(await page.locator("#customer-metric-tickets").innerText(),"0");
 assert.equal(await page.locator("#customer-metric-open").innerText(),"0");
 assert.equal(await page.locator("#customer-metric-equipment").innerText(),"0");
 assert.equal(await page.locator("#customer-next-status").innerText(),"COMECE POR AQUI");
 assert.equal(await page.locator("#customer-nav").count(),0);
 assert.equal(await page.locator(".customer-nav svg").count(),6);
 assert.equal(await page.locator("#customer-mobile-menu").getAttribute("aria-expanded"),"false");
 assert.equal(await page.locator('[data-customer-view="tickets"]').isVisible(),false,
  "No celular, o menu da conta deve começar recolhido");
 await page.click("#customer-mobile-menu");
 assert.equal(await page.locator("#customer-mobile-menu").getAttribute("aria-expanded"),"true");
 assert.equal(await page.locator('[data-customer-view="tickets"]').isVisible(),true);
 await page.click('[data-customer-view="tickets"]');
 assert.equal(await page.locator("#customer-mobile-menu").getAttribute("aria-expanded"),"false",
  "Navegar deve recolher o menu móvel");
 await page.setViewportSize({width:1280,height:850});
 await page.click("#customer-sidebar-toggle");
 assert.equal(await page.locator("#customer-app").evaluate(e=>e.classList.contains("sidebar-collapsed")),true);
 assert.equal(await page.evaluate(()=>localStorage.getItem("proxiti-customer-sidebar-v1")),"collapsed");
 assert.equal(await page.locator("#customer-sidebar-toggle").getAttribute("aria-label"),"Expandir menu lateral");
 await page.click("#customer-sidebar-toggle");
 assert.equal(await page.locator("#customer-app").evaluate(e=>e.classList.contains("sidebar-collapsed")),false);
 assert.equal(await page.locator("#customer-sidebar-toggle").getAttribute("aria-label"),"Recolher menu lateral");
 await page.click('[data-customer-panel="tickets"] [data-open-customer-request]');
 await page.fill("#customer-request-subject","Notebook não inicia");
 await page.fill("#customer-request-description","O notebook não abre o sistema operacional.");
 await page.check("#customer-request-privacy");
 await page.click("#customer-request-form button[type=submit]");
 await page.waitForFunction(()=>window.__customerFixture.tickets.length===1);
 await page.waitForFunction(()=>document.querySelector("#customer-ticket-detail")?.hidden===false);
 await page.waitForFunction(()=>document.querySelector("#customer-detail-quotes")?.textContent.includes("Suporte remoto"),{timeout:10000});
 assert((await page.textContent("#customer-detail-quotes")).includes("R$ 40,00")||
  (await page.textContent("#customer-detail-quotes")).includes("R$ 40,00"));
 assert((await page.textContent("#customer-detail-quotes")).includes("Propostas deste atendimento"));
 await page.getByRole("button",{name:"Aceitar proposta",exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__customerFixture.quoteDecisions.length),0,
  "O cliente precisa confirmar leitura antes de aceitar na área privada");
 await page.locator("#customer-detail-quotes .customer-quote-check input").check();
 await page.getByRole("button",{name:"Aceitar proposta",exact:true}).click();
 await page.waitForFunction(()=>window.__customerFixture.quoteDecisions.length===1);
 assert.equal(await page.evaluate(()=>window.__customerFixture.quoteDecisions[0].confirmed),true);
 assert.equal(await page.evaluate(()=>window.__customerFixture.quoteDecisions[0].decision),"accepted");
 await page.click('[data-customer-view="home"]');
 assert.equal(await page.locator("#customer-metric-tickets").innerText(),"1");
 assert.equal(await page.locator("#customer-metric-open").innerText(),"1");
 assert.equal(await page.locator("#customer-next-status").innerText(),"CHAMADO REGISTRADO");
 assert((await page.locator("#customer-next-description").innerText()).includes("Chamado #17"));
 assert.equal(await page.locator("#customer-home-action").innerText(),"Ver meus atendimentos ↗");
 await page.click("#customer-next-action");
 await page.waitForFunction(()=>document.querySelector("#customer-ticket-detail")?.hidden===false);
 assert.equal(await page.locator('[data-customer-panel="tickets"]').isVisible(),true);
 await page.click('[data-customer-view="equipment"]');
 await page.fill("#customer-device-label","Meu notebook");
 await page.click("#customer-device-form button[type=submit]");
 await page.waitForFunction(()=>window.__customerFixture.devices.length===1);
 assert((await page.textContent("#customer-device-list")).includes("Meu notebook"));
 await page.click('[data-customer-view="home"]');
 assert.equal(await page.locator("#customer-metric-equipment").innerText(),"1");
 await page.click('[data-customer-shortcut="schedule"]');
 assert.equal(await page.locator('[data-customer-panel="schedule"]').isVisible(),true);
 await page.selectOption("#customer-schedule-ticket","55555555-5555-4555-8555-555555555555");
 const tomorrow=new Date(Date.now()+5*86400000);
 const local=tomorrow.getFullYear()+"-"+String(tomorrow.getMonth()+1).padStart(2,"0")+
  "-"+String(tomorrow.getDate()).padStart(2,"0")+"T15:00";
 await page.fill("#customer-schedule-date",local);
 await page.click("#customer-schedule-form button[type=submit]");
 await page.waitForFunction(()=>window.__customerFixture.schedule.length===1);
 assert((await page.textContent("#customer-schedule-list")).includes("Aguardando confirmação"));
 await page.click('[data-customer-view="professionals"]');
 await page.selectOption("#customer-preference-ticket","55555555-5555-4555-8555-555555555555");
 await page.selectOption("#customer-preference-partner","11111111-1111-4111-8111-111111111111");
 await page.click("#customer-preference-form button[type=submit]");
 await page.waitForFunction(()=>window.__customerFixture.preferences.length===1);
 assert.equal(await page.evaluate(()=>window.__customerFixture.tickets[0].assigned_to),undefined,
  "Preferência não pode designar técnico automaticamente");
 for(const width of [375,430,768,1280]){
  await page.setViewportSize({width,height:850});
  const sizes=await page.evaluate(()=>({viewport:innerWidth,page:document.documentElement.scrollWidth}));
  assert(sizes.page<=sizes.viewport+1,"Rolagem horizontal em "+width+": "+JSON.stringify(sizes));
  if(width<=800){
   assert.equal(await page.locator("#customer-mobile-menu").isVisible(),true);
   await page.click("#customer-mobile-menu");
   assert.equal(await page.locator("#customer-account-navigation").isVisible(),true);
   await page.click("#customer-mobile-menu");
   assert.equal(await page.locator("#customer-account-navigation").isVisible(),false);
  }else assert.equal(await page.locator("#customer-sidebar-toggle").isVisible(),true);
 }
 await page.click("#customer-logout");
 await page.waitForSelector("#customer-auth:not([hidden])");
 assert.equal(await page.locator("#customer-app").isVisible(),false);
 assert.equal(await page.locator("#customer-ticket-list").innerText(),"");
 // Conta previamente usada na Central Técnica pode ativar a área sem criar outro Auth user.
 await page.evaluate(()=>{window.__customerFixture.account=null;});
 await page.fill("#customer-login-email","cliente@example.com");
 await page.fill("#customer-login-password","Teste123@ab");
 await page.click("#customer-login-form button[type=submit]");
 await page.waitForSelector("#customer-activate-form:not([hidden])");
 assert.equal(await page.locator("#customer-app").isVisible(),false);
 assert.equal(await page.locator("#customer-verify-retry").isVisible(),false);
 await page.check("#customer-activate-privacy");
 await page.click("#customer-activate-form button[type=submit]");
 await page.waitForSelector("#customer-app:not([hidden])");
 assert.equal(await page.locator("#customer-verify").isVisible(),false);
 assert((await page.textContent("#customer-welcome")).includes("Cliente de teste"));
 assert.deepEqual(errors,[]);
 await page.close();
 console.log("PASS: cadastro, ativação de conta existente, login, chamado, conversa, proposta, equipamento, agenda e logout sem vazamento.");
}finally{await page?.close().catch(()=>{});await browser.close();
 await new Promise(resolve=>server.close(resolve));}
