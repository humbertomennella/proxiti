import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=resolve(fileURLToPath(new URL("../",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,"http://localhost").pathname;
  const target=resolve(root,"."+decodeURIComponent(pathname.endsWith("/")?pathname+"index.html":pathname));
  if(!target.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(target);
  res.writeHead(200,{"content-type":mime[extname(target)]||"application/octet-stream",
    "cache-control":"no-store"});res.end(data);
 }catch{res.writeHead(404);res.end("not found");}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const base="http://127.0.0.1:"+server.address().port;
const ticket="00000000-0000-4000-8000-000000000123";
const quoteId="00000000-0000-4000-8000-000000000456";
const token="a".repeat(64),wrong="b".repeat(64);
let page;
const calls=[],errors=[];
let quoteStatus="issued";
const issuedQuote=()=>({id:quoteId,reference:27,parent_reference:null,
 status:quoteStatus,issued_at:"2026-09-27T15:00:00Z",accepted_at:null,
 valid_until:"2099-12-31",client_notes:"O diagnóstico não inclui troca de peças.",
 total_cents:15000,items:[{title:"Diagnóstico técnico",scope:"Verificação de inicialização",
 unit:"serviço",quantity:1,unit_price_cents:15000,subtotal_cents:15000}]});
try{
 const context=await browser.newContext({viewport:{width:375,height:800}});
 await context.addInitScript(({ticket,token})=>{
   localStorage.setItem("proxiti_ticket_"+ticket,JSON.stringify({token,savedAt:Date.now()}));
 },{ticket,token});
 page=await context.newPage();
 page.on("pageerror",error=>errors.push(error.message));
 page.on("dialog",dialog=>dialog.accept());
 await page.route("https://qbqfbrbbsvpftmtfhfab.supabase.co/functions/v1/proxiti-support",async route=>{
   if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers:{
     "access-control-allow-origin":base,
     "access-control-allow-methods":"POST,OPTIONS",
     "access-control-allow-headers":"apikey,content-type"}});
   const b=route.request().postDataJSON();calls.push(b.action);
   let status=200,result={};
   if(b.action==="online")result={online:0};
   else if(b.ticket_id!==ticket||b.access_token!==token){
     status=404;result={error:"Acesso não confirmado"};
   }else if(b.action==="conversation")result={ticket:{reference:12,subject:"Notebook não inicia",
       status:"triage",online:false},messages:[]};
   else if(b.action==="quotes")result={quotes:[issuedQuote()]};
   else if(b.action==="quote_decision"){
     if(!b.confirmed||b.quote_id!==quoteId||b.decision!=="accepted"){
       status=400;result={error:"Decisão inválida"};
     }else if(quoteStatus==="accepted"){
       result={ok:true,decision:"accepted",reference:27,already_recorded:true};
     }else{
       quoteStatus="accepted";
       result={ok:true,decision:"accepted",reference:27,already_recorded:false};
     }
   }else{status=400;result={error:"Operação não prevista no teste"};}
   await route.fulfill({status,contentType:"application/json",
     headers:{"access-control-allow-origin":base},body:JSON.stringify(result)});
 });
 await page.goto(base+"/atendimento/?ticket="+ticket,{waitUntil:"load"});
 await page.waitForSelector("#customer-quotes-list .customer-quote-card",{timeout:10000})
   .catch(async error=>{
     console.log("DIAGNÓSTICO PORTAL:",JSON.stringify({
       calls,errors,
       state:await page.evaluate(()=>({
         setup:document.getElementById("support-conversation")?.hidden,
         quoteHidden:document.getElementById("customer-quotes")?.hidden,
         feedback:document.getElementById("support-feedback")?.textContent,
         quoteFeedback:document.getElementById("customer-quotes-feedback")?.textContent,
         scripts:[...document.scripts].map(x=>x.src)
       }))
     }));throw error;
   });
 assert((await page.textContent("#customer-quotes-list")).includes("150,00"));
 assert((await page.textContent("#customer-quotes-list")).includes("Diagnóstico técnico"));
 assert(!(await page.textContent("#customer-quotes-list")).includes("Custo interno"));
 assert(!(await page.textContent("#customer-quotes-list")).includes("Repasse"));
 await page.getByRole("button",{name:"Aceitar esta proposta"}).click();
 assert((await page.textContent("#customer-quotes-feedback")).includes("Marque a confirmação"));
 assert(!calls.includes("quote_decision"),"Não registrar aceite sem declaração explícita");
 await page.locator(".customer-quote-ack input").check();
 await page.getByRole("button",{name:"Aceitar esta proposta"}).click();
 await page.waitForFunction(()=>document.getElementById("customer-quotes-list").textContent.includes("Aceito"));
 assert.equal(calls.filter(x=>x==="quote_decision").length,1);
 assert.equal(quoteStatus,"accepted");
 assert.equal(await page.getByRole("button",{name:"Aceitar esta proposta"}).count(),0);
 for(const width of [375,430,768,1280]){
   await page.setViewportSize({width,height:850});
   const sizes=await page.evaluate(()=>({
     viewport:innerWidth,page:document.documentElement.scrollWidth,
     quote:document.querySelector(".customer-quote-card").getBoundingClientRect().right
   }));
   assert(sizes.page<=sizes.viewport+1,JSON.stringify(sizes));
   assert(sizes.quote<=sizes.viewport+1,JSON.stringify(sizes));
 }
 await page.getByRole("button",{name:"Esquecer acesso"}).click();
 assert.equal(await page.locator("#customer-quotes").isVisible(),false);
 assert.equal(await page.locator("#customer-quotes-list").innerText(),"");
 assert.equal(await page.evaluate(id=>localStorage.getItem("proxiti_ticket_"+id),ticket),null);
 assert.deepEqual(errors,[]);
 await page.close();
 const other=await browser.newContext({viewport:{width:390,height:850}});
 await other.addInitScript(({ticket,token})=>{
   localStorage.setItem("proxiti_ticket_"+ticket,JSON.stringify({token,savedAt:Date.now()}));
 },{ticket,token:wrong});
 const otherPage=await other.newPage();
 await otherPage.route("https://qbqfbrbbsvpftmtfhfab.supabase.co/functions/v1/proxiti-support",route=>{
   if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers:{
      "access-control-allow-origin":base,"access-control-allow-methods":"POST,OPTIONS",
      "access-control-allow-headers":"apikey,content-type"}});
   const action=route.request().postDataJSON().action;
   return route.fulfill({status:action==="online"?200:404,contentType:"application/json",
     headers:{"access-control-allow-origin":base},
     body:JSON.stringify(action==="online"?{online:0}:{error:"Acesso não confirmado"})});
 });
 await otherPage.goto(base+"/atendimento/?ticket="+ticket,{waitUntil:"load"});
 await otherPage.waitForFunction(()=>document.getElementById("support-feedback").textContent.includes("Acesso não confirmado"));
 assert.equal(await otherPage.locator("#customer-quotes").isVisible(),false);
 await other.close();
 console.log("PASS: cliente visualiza somente a proposta do chamado, confirma leitura, registra decisão uma vez e perde acesso ao esquecer chave.");
}finally{await page?.close().catch(()=>{});await browser.close();await new Promise(done=>server.close(done));}
