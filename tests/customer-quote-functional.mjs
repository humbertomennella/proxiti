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
const token="a".repeat(64),wrong="b".repeat(64);
const clientSource=await readFile(resolve(root,"assets/js/support-thread.js"),"utf8");
const publicHtml=await readFile(resolve(root,"atendimento/index.html"),"utf8");
const privateJs=await readFile(resolve(root,"assets/js/minha-proxiti.js"),"utf8");
assert(!publicHtml.includes('id="customer-quotes"')&&
 !clientSource.includes('call("quotes"')&&!clientSource.includes('call("quote_decision"'),
 "Chat público não deve exibir, consultar ou aprovar propostas");
assert(privateJs.includes('api("account_quotes"')&&
 privateJs.includes('api("account_quote_decision"'),
 "Consulta e aprovação de propostas continuam na conta autenticada");
let page;
const calls=[],messages=[],errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:800}});
 await context.addInitScript(({ticket,token})=>{
  localStorage.setItem("proxiti_ticket_"+ticket,JSON.stringify({token,savedAt:Date.now()}));
 },{ticket,token});
 page=await context.newPage();
 page.on("pageerror",error=>errors.push(error.message));
 page.on("dialog",dialog=>dialog.accept());
 await page.route("https://qbqfbrbbsvpftmtfhfab.supabase.co/functions/v1/proxiti-support",async route=>{
  if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers:{
   "access-control-allow-origin":base,"access-control-allow-methods":"POST,OPTIONS",
   "access-control-allow-headers":"apikey,content-type"}});
  const b=route.request().postDataJSON();calls.push(b.action);
  let status=200,result={};
  if(b.action==="online")result={online:0};
  else if(b.ticket_id!==ticket||b.access_token!==token){
   status=404;result={error:"Acesso não confirmado"};
  }else if(b.action==="conversation")result={ticket:{
   reference:12,subject:"Notebook não inicia",status:"triage",online:false},
   messages:[{id:"m1",sender_kind:"staff",body:"Vamos verificar o problema.",
    created_at:"2026-09-29T00:00:00Z"}]};
  else if(b.action==="reply"){messages.push(b.message);result={ok:true};}
  else{status=400;result={error:"Ação desativada no chat público"};}
  await route.fulfill({status,contentType:"application/json",
   headers:{"access-control-allow-origin":base},body:JSON.stringify(result)});
 });
 await page.goto(base+"/atendimento/?ticket="+ticket,{waitUntil:"domcontentloaded"});
 await page.waitForSelector("#support-conversation:not([hidden])");
 assert((await page.locator("#conversation-heading").innerText()).includes("Notebook"));
 assert((await page.locator("#customer-messages").innerText()).includes("Vamos verificar"));
 assert.equal(await page.locator("#customer-quotes").count(),0);
 assert(!calls.includes("quotes")&&!calls.includes("quote_decision"));

 assert.equal(await page.locator("#reply-submit").isDisabled(),true);
 await page.fill("#customer-reply-text","Meu computador apresenta o erro ao iniciar.");
 assert.equal(await page.locator("#reply-submit").isEnabled(),true);
 await page.locator("#customer-reply-text").press("Shift+Enter");
 await page.locator("#customer-reply-text").type("O erro aparece após reiniciar.");
 assert((await page.locator("#customer-reply-text").inputValue()).includes("\n"),
  "Shift+Enter precisa inserir uma quebra de linha");
 const positions=await page.evaluate(()=>{
  const field=document.getElementById("customer-reply-text").getBoundingClientRect();
  const send=document.getElementById("reply-submit").getBoundingClientRect();
  return {field:{right:field.right,y:field.y,height:field.height},
   send:{left:send.left,y:send.y,height:send.height},page:document.documentElement.scrollWidth};
 });
 assert(positions.field.right+3<positions.send.left&&positions.send.height>=40,
  "Botão enviar deve ficar ao lado do campo de texto, inclusive no celular");
 await page.locator("#customer-reply-text").press("Enter");
 await page.waitForFunction(()=>document.querySelector("#customer-reply-text")?.value==="");
 assert.equal(messages.length,1,"Enter deve enviar uma única mensagem");
 assert(messages[0].includes("\nO erro aparece após reiniciar."));
 assert.equal(await page.locator("#reply-submit").isDisabled(),true);
 await page.fill("#customer-reply-text","Envio pelo botão lateral.");
 await page.click("#reply-submit");
 await page.waitForFunction(()=>document.querySelector("#customer-reply-text")?.value==="");
 assert.equal(messages.length,2,"O botão lateral deve enviar exatamente uma mensagem");
 assert.equal(messages[1],"Envio pelo botão lateral.");
 assert(calls.includes("reply"),"Responder deve continuar funcionando");
 await page.goto(base+"/atendimento/?embed=1&theme=light",{waitUntil:"domcontentloaded"});
 await page.waitForSelector("#support-conversation:not([hidden])");
 assert.equal(await page.locator("html").getAttribute("data-theme"),"light");
 assert.equal(await page.locator("#customer-quotes").count(),0);
 assert.equal(await page.locator(".support-account-invite").isVisible(),false);
 await page.waitForFunction(()=>
  getComputedStyle(document.querySelector(".support-card")).backgroundColor==="rgb(255, 255, 255)");
 for(const width of [375,430,768,1280]){
  await page.setViewportSize({width,height:850});
  const sizes=await page.evaluate(()=>{
   const area=document.getElementById("customer-reply-text").getBoundingClientRect();
   const button=document.getElementById("reply-submit").getBoundingClientRect();
   return {viewport:innerWidth,page:document.documentElement.scrollWidth,
    textRight:area.right,buttonLeft:button.left,buttonRight:button.right};
  });
  assert(sizes.page<=sizes.viewport+1,"Rolagem horizontal: "+JSON.stringify(sizes));
  assert(sizes.textRight+3<sizes.buttonLeft&&sizes.buttonRight<=sizes.viewport,
   "Campo e botão lateral devem caber no chat: "+JSON.stringify(sizes));
 }
 await page.getByRole("button",{name:"Esquecer acesso"}).click();
 assert.equal(await page.evaluate(id=>localStorage.getItem("proxiti_ticket_"+id),ticket),null);
 assert.equal(await page.locator("#support-start").isVisible(),true);
 assert(!calls.includes("quotes")&&!calls.includes("quote_decision"),
  "Propostas não podem ser consultadas ao abrir o chat público");
 await page.close();
 const other=await browser.newContext({viewport:{width:390,height:850}});
 await other.addInitScript(({ticket,token})=>{
  localStorage.setItem("proxiti_ticket_"+ticket,JSON.stringify({token,savedAt:Date.now()}));
 },{ticket,token:wrong});
 const otherPage=await other.newPage();
 otherPage.on("pageerror",error=>errors.push(error.message));
 await otherPage.route("https://qbqfbrbbsvpftmtfhfab.supabase.co/functions/v1/proxiti-support",route=>{
  if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers:{
   "access-control-allow-origin":base,"access-control-allow-methods":"POST,OPTIONS",
   "access-control-allow-headers":"apikey,content-type"}});
  const action=route.request().postDataJSON().action;
  return route.fulfill({status:action==="online"?200:404,contentType:"application/json",
   headers:{"access-control-allow-origin":base},
   body:JSON.stringify(action==="online"?{online:0}:{error:"Acesso não confirmado"})});
 });
 await otherPage.goto(base+"/atendimento/?ticket="+ticket,{waitUntil:"domcontentloaded"});
 await otherPage.waitForFunction(()=>document.getElementById("support-feedback")?.textContent.includes("Acesso não confirmado"));
 assert.equal(await otherPage.locator("#customer-quotes").count(),0);
 await other.close();
 assert.deepEqual(errors,[]);
 console.log("PASS: chat público sem propostas, conversa preservada, tema claro incorporado e chave privada verificada.");
}finally{
 await page?.close().catch(()=>{});await browser.close();
 await new Promise(done=>server.close(done));
}
