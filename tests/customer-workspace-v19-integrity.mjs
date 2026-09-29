import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {Script} from "node:vm";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(resolve(root,p),"utf8");
const html=read("minha-proxiti/index.html"),js=read("assets/js/minha-proxiti.js"),
 css=read("assets/css/minha-proxiti.css"),
 redesign=read("assets/css/minha-proxiti-redesign.css"),
 centralLogin=read("assets/css/minha-proxiti-central-login.css"),
 portal=read("assets/css/minha-proxiti-portal.css"),
 theme=read("assets/js/minha-proxiti-theme.js"),home=read("index.html"),
 chat=read("atendimento/index.html"),chatJs=read("assets/js/support-thread.js");
new Script(js,{filename:"minha-proxiti.js"});new Script(chatJs,{filename:"support-thread.js"});
new Script(theme,{filename:"minha-proxiti-theme.js"});
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
assert(js.includes('action:"customer_register"')&&js.includes('validCustomerPassword')&&
 js.includes('proxiti_customer_access_status')&&js.includes('proxiti_customer_activate')&&
 html.includes('id="customer-activate-privacy"')&&
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
assert(html.includes('id="customer-signup-password" type="password" minlength="10"')&&
 html.includes('id="customer-reset-password" type="password" minlength="10"')&&
 html.includes('id="customer-password-rules"')&&
 html.includes('id="customer-theme-toggle"')&&
 html.includes('class="auth-visual customer-auth-hero"')&&
 html.includes('class="customer-portal-art"')&&
 html.includes('id="customer-auth-panel" data-auth-mode="login"')&&
 html.includes('id="customer-auth-viewport" class="auth-slider-viewport"')&&
 html.includes('class="auth-pane auth-pane-signup"')&&
 html.includes("IDENTIFICAÇÃO SEGURA")&&
 html.includes('id="customer-theme-label"')&&
 existsSync(resolve(root,"assets/illustrations/customer-portal-access.svg"))&&
 !html.includes('class="customer-auth-photo"')&&
 !html.includes('class="auth-preview"')&&
 html.includes('>Entrar</button>')&&
 !html.includes("Não pedimos CPF")&&
 !html.includes("pelo menos 12 caracteres"),
 "Registro e recuperação devem aceitar senha segura de 11 caracteres e não exigir e-mail.");
assert(js.includes('db.auth.signInWithPassword({email,password})')&&
 !js.includes("db.auth.signUp("), "O cadastro facilitado deve entrar pela função protegida.");
assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
assert.equal((redesign.match(/{/g)||[]).length,(redesign.match(/}/g)||[]).length);
assert.equal((centralLogin.match(/{/g)||[]).length,(centralLogin.match(/}/g)||[]).length);
assert.equal((portal.match(/{/g)||[]).length,(portal.match(/}/g)||[]).length);
assert(portal.includes("auth-slider-track")&&portal.includes("height:690px")&&
 portal.includes("prefers-reduced-motion")&&
 js.includes('pane.inert=key!==mode')&&js.includes('viewport.hidden=!sliding'),
 "A tela deve ter layout estático, slide acessível e movimento reduzido");
const illustration=read("assets/illustrations/customer-portal-access.svg");
assert(illustration.startsWith("<svg ")&&illustration.includes("</svg>")&&
 illustration.includes("ACESSO")&&illustration.includes("ATENDIMENTO"),
 "A ilustração original deve representar acesso ao portal e histórico do cliente");
assert(home.includes('class="header-account"')&&home.includes("Entrar ou criar conta"),
 "O site precisa destacar o acesso do cliente no cabeçalho");
assert(html.includes('class="brand-mark"')&&chat.includes('class="brand-mark"'),
 "O site, a Minha PROXITI e o atendimento devem compartilhar o logotipo oficial");
assert(theme.includes("proxiti-theme-v3")&&redesign.includes('html[data-theme="dark"]'),
 "O tema claro e escuro precisa acompanhar a preferência do site");
console.log("PASS: Minha PROXITI V19, login separado, seis páginas, chat sem login e rotas protegidas.");
