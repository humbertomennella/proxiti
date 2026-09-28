import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {Script} from "node:vm";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(resolve(root,p),"utf8");
const html=read("minha-proxiti/index.html"),js=read("assets/js/minha-proxiti.js"),
 css=read("assets/css/minha-proxiti.css"),home=read("index.html"),
 chat=read("atendimento/index.html"),chatJs=read("assets/js/support-thread.js");
new Script(js,{filename:"minha-proxiti.js"});new Script(chatJs,{filename:"support-thread.js"});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(new Set(ids).size,ids.length,"ID duplicado na área do cliente");
const dynamic=new Set(["customer-request-dialog","customer-request-form","customer-request-subject",
 "customer-request-description","customer-request-modality","customer-request-privacy",
 "customer-request-cancel"]);
for(const match of js.matchAll(/\bel\(["']([^"']+)["']\)/g))
 assert(ids.includes(match[1])||dynamic.has(match[1]),
  "ID referenciado no JS mas ausente na página: "+match[1]);
for(const id of ["customer-auth","customer-signup-form","customer-login-form","customer-verify",
 "customer-app","customer-ticket-list","customer-device-form","customer-schedule-form",
 "customer-preference-form","customer-rating-form","customer-link-ticket-form",
 "customer-detail-quotes","customer-logout"])
 assert(html.includes('id="'+id+'"'));
assert(html.includes("supabase.js")&&html.includes("support-config.js")&&
 html.includes("minha-proxiti.js")&&existsSync(resolve(root,"assets/css/minha-proxiti.css")));
for(const view of ["home","tickets","equipment","schedule","professionals","profile"])
 assert(html.includes('data-customer-panel="'+view+'"')&&
 html.includes('data-customer-view="'+view+'"'));
assert(home.includes('href="/minha-proxiti/"')&&
 chat.includes('href="/minha-proxiti/"')&&
 chat.includes('id="support-start"')&&chatJs.includes('call("create"'),
 "A conta é opcional e o chat anônimo continua funcionando");
assert(js.includes('proxiti_account_type:"customer"')&&
 js.includes('storageKey:"proxiti-customer-session"')&&
 js.includes("proxiti_customer_link_ticket")&&js.includes("proxiti_customer_dashboard"),
 "Auth e vínculo real ao chamado precisam usar conta separada");
assert(js.includes("api(\"account_open\"")&&js.includes("api(\"account_conversation\"")&&
 js.includes("api(\"account_quotes\"")&&js.includes("api(\"account_quote_decision\""));
assert(js.includes('getSession()')&&js.includes('Authorization:"Bearer "+session.access_token'),
 "Chamados da conta exigem JWT e não token público de outro cliente");
assert(js.includes("Li o escopo, o preço e as condições")&&
 js.includes("confirmo minha decisão")&&
 !js.includes("service_role")&&!js.includes("SUPABASE_SERVICE_ROLE_KEY"),
 "Não incluir credenciais privadas, valores automáticos ou aceite implícito");
assert(!/pix[_-]key|charge_card|checkout_session|payment_intent/.test(js),
 "Conta gratuita não pode ativar cobrança não configurada");
assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
console.log("PASS: Minha PROXITI V19, login separado, seis páginas, chat sem login e rotas protegidas.");
