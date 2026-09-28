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
  const fixture={session:null,callback:null,signups:[],rpcCalls:[],requests:[],
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
  if(b.action==="account_open"){
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
 await page.click("#customer-show-signup");
 await page.fill("#customer-signup-name","Cliente de teste");
 await page.fill("#customer-signup-email","cliente@example.com");
 await page.fill("#customer-signup-password","uma-senha-com-12-ou-mais");
 await page.fill("#customer-signup-confirm","uma-senha-com-12-ou-mais");
 await page.check("#customer-signup-privacy");
 await page.click("#customer-signup-form button[type=submit]");
 await page.waitForFunction(()=>window.__customerFixture.signups.length===1);
 const signup=await page.evaluate(()=>window.__customerFixture.signups[0]);
 assert.equal(signup.options.data.proxiti_account_type,"customer");
 assert(signup.options.emailRedirectTo.endsWith("/minha-proxiti/"));
 await page.click("#customer-show-login");
 await page.fill("#customer-login-email","cliente@example.com");
 await page.fill("#customer-login-password","uma-senha-com-12-ou-mais");
 await page.click("#customer-login-form button[type=submit]");
 await page.waitForSelector("#customer-app:not([hidden])");
 assert((await page.textContent("#customer-welcome")).includes("Cliente de teste"));
 assert.equal(await page.locator("#customer-nav").count(),0);
 await page.click('[data-customer-view="tickets"]');
 await page.click('[data-customer-panel="tickets"] [data-open-customer-request]');
 await page.fill("#customer-request-subject","Notebook não inicia");
 await page.fill("#customer-request-description","O notebook não abre o sistema operacional.");
 await page.check("#customer-request-privacy");
 await page.click("#customer-request-form button[type=submit]");
 await page.waitForFunction(()=>window.__customerFixture.tickets.length===1);
 await page.waitForFunction(()=>document.querySelector("#customer-ticket-detail")?.hidden===false);
 assert((await page.textContent("#customer-detail-quotes")).includes("Suporte remoto"));
 assert((await page.textContent("#customer-detail-quotes")).includes("R$ 40,00")||
  (await page.textContent("#customer-detail-quotes")).includes("R$ 40,00"));
 await page.click('[data-customer-view="equipment"]');
 await page.fill("#customer-device-label","Meu notebook");
 await page.click("#customer-device-form button[type=submit]");
 await page.waitForFunction(()=>window.__customerFixture.devices.length===1);
 assert((await page.textContent("#customer-device-list")).includes("Meu notebook"));
 await page.click('[data-customer-view="schedule"]');
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
 }
 await page.click("#customer-logout");
 await page.waitForSelector("#customer-auth:not([hidden])");
 assert.equal(await page.locator("#customer-app").isVisible(),false);
 assert.equal(await page.locator("#customer-ticket-list").innerText(),"");
 assert.deepEqual(errors,[]);
 await page.close();
 console.log("PASS: cadastro separado, login, chamado real simulado, conversa, proposta, equipamento, agenda, preferência e logout sem vazamento.");
}finally{await page?.close().catch(()=>{});await browser.close();
 await new Promise(resolve=>server.close(resolve));}
