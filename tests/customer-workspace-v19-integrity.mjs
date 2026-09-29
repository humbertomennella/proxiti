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
 customerChatCss=read("assets/css/minha-proxiti-chat.css"),
 customerChatJs=read("assets/js/minha-proxiti-chat.js"),
 embedCss=read("assets/css/support-embed-theme.css"),
 composerCss=read("assets/css/support-composer.css"),
 embedJs=read("assets/js/support-embed-theme.js"),
 theme=read("assets/js/minha-proxiti-theme.js"),home=read("index.html"),
 chat=read("atendimento/index.html"),chatJs=read("assets/js/support-thread.js");
new Script(js,{filename:"minha-proxiti.js"});new Script(chatJs,{filename:"support-thread.js"});
new Script(theme,{filename:"minha-proxiti-theme.js"});
new Script(customerChatJs,{filename:"minha-proxiti-chat.js"});
new Script(embedJs,{filename:"support-embed-theme.js"});
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
assert.equal((customerChatCss.match(/{/g)||[]).length,(customerChatCss.match(/}/g)||[]).length);
assert.equal((embedCss.match(/{/g)||[]).length,(embedCss.match(/}/g)||[]).length);
assert.equal((composerCss.match(/{/g)||[]).length,(composerCss.match(/}/g)||[]).length);
assert(html.includes('<title>MINHA PROXITI')&&html.includes('>MINHA PROXITI <span class="customer-header-caption-secondary">'),
 "A grafia da marca no título e cabeçalho deve ser consistente");
assert.equal((html.match(/class="customer-brand brand" href="\/minha-proxiti\/"/g)||[]).length,2,
 "Logo do cabeçalho e rodapé deve permanecer na Minha PROXITI");
assert(html.includes('class="customer-back customer-explore"')&&
 html.includes('class="customer-explore-label">Voltar</span>'),
 "Botão Voltar permanece no cabeçalho");
assert(!html.includes('<p class="auth-foot">Precisa de suporte agora?')&&
 html.includes('id="customer-footer-chat"')&&
 html.includes('id="customer-support-popover"')&&
 html.includes('data-src="/atendimento/?chat=1&amp;embed=1"')&&
 html.includes('minha-proxiti-chat.js?v=20260929-3')&&
 html.includes('minha-proxiti-chat.css?v=20260929-4')&&
 html.includes('class="customer-chat-actions" role="group"')&&
 (html.match(/class="customer-chat-control"/g)||[]).length===2&&
 html.includes('id="customer-chat-overlay"')&&
 html.includes('id="customer-chat-minimized"')&&
 html.includes('id="customer-support-minimize"')&&
 customerChatJs.includes('type:"proxiti-chat-theme"')&&
 customerChatJs.includes('new MutationObserver(sendTheme)')&&
 customerChatCss.includes('left:50%;top:50%;transform:translate(-50%,-50%)')&&
 embedCss.includes('html.embedded[data-theme="light"]')&&
 embedCss.includes('html.embedded[data-theme="dark"]')&&
 embedJs.includes('event.data?.type!=="proxiti-chat-theme"'),
 "O rodapé deve abrir uma janela central, minimizável e com tema sincronizado");
assert(customerChatCss.includes('width:min(620px,calc(100vw - 32px))')&&
 customerChatCss.includes('.customer-support-popover-head>.customer-chat-actions')&&
 customerChatCss.includes('flex-direction:row')&&
 customerChatCss.includes('@keyframes customer-chat-reveal')&&
 customerChatCss.includes('@media(prefers-reduced-motion:reduce)'),
 "Janela do chat precisa ser mais larga, premium, acessível e ter controles horizontais");
assert(customerChatCss.includes('width:min(760px,calc(100vw - 28px))')&&
 customerChatCss.includes('@keyframes customer-chat-open')&&
 customerChatCss.includes('@keyframes customer-chat-pill-open')&&
 customerChatJs.includes('panel.animate([')&&customerChatJs.includes('reduceMotion.matches')&&
 customerChatJs.includes('Promise.allSettled(animations.map'),
 "O modal precisa abrir e minimizar com efeitos acessíveis e ter largura até 760 px");
assert(chat.includes('class="support-start-composer-row"')&&
 chat.includes('id="start-submit" aria-label="Iniciar conversa"')&&
 chat.includes('id="support-consent" type="checkbox" required')&&
 composerCss.includes('#support-start .support-start-composer-row #start-submit')&&
 chatJs.includes('send.dataset.sending="true"')&&
 chatJs.includes('if(send.disabled||!form.reportValidity())return'),
 "Primeira tela deve ter botão Iniciar ao lado da descrição e manter privacidade e envio único");
assert(chat.includes('class="reply-composer-row"')&&
 chat.includes('id="reply-submit" class="support-primary reply-send"')&&
 chat.includes('support-composer.css?v=20260929-2')&&
 chat.includes('support-thread.js?v=20260929-3')&&
 composerCss.includes('#customer-reply .reply-composer-row #reply-submit')&&
 chatJs.includes('replyField.addEventListener("keydown"')&&
 chatJs.includes('event.shiftKey')&&chatJs.includes('sendingReply=true'),
 "O envio da conversa deve ficar ao lado do texto com Enter, quebra de linha e proteção contra duplo envio");
assert(portal.includes("auth-slider-track")&&portal.includes("height:690px")&&
 portal.includes("prefers-reduced-motion")&&
 js.includes('pane.inert=key!==mode')&&js.includes('viewport.hidden=!sliding'),
 "A tela deve ter layout estático, slide acessível e movimento reduzido");
const illustration=read("assets/illustrations/customer-portal-access.svg");
assert(illustration.startsWith("<svg ")&&illustration.includes("</svg>")&&
 illustration.includes("ACESSO")&&illustration.includes("ATENDIMENTO"),
 "A ilustração original deve representar acesso ao portal e histórico do cliente");
assert(!chat.includes('id="customer-quotes"')&&
 !chatJs.includes('call("quotes"')&&!chatJs.includes('call("quote_decision"')&&
 js.includes('api("account_quotes"')&&js.includes('api("account_quote_decision"'),
 "Propostas e decisões não pertencem ao chat público, somente ao cliente autenticado");
assert(home.includes('class="header-account"')&&home.includes("Entrar ou criar conta"),
 "O site precisa destacar o acesso do cliente no cabeçalho");
assert(html.includes('class="brand-mark"')&&chat.includes('class="brand-mark"'),
 "O site, a Minha PROXITI e o atendimento devem compartilhar o logotipo oficial");
assert(theme.includes("proxiti-theme-v3")&&redesign.includes('html[data-theme="dark"]'),
 "O tema claro e escuro precisa acompanhar a preferência do site");
console.log("PASS: Minha PROXITI V19, login separado, seis páginas, chat sem login e rotas protegidas.");
