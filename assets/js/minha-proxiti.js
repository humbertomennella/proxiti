(()=>{
"use strict";
const el=id=>document.getElementById(id),cfg=window.PROXITI_SUPPORT;
const safe=(x,n=300)=>String(x??"").slice(0,n);
const make=(tag,value,cls)=>{const n=document.createElement(tag);
 if(value!==undefined&&value!==null)n.textContent=String(value);
 if(cls)n.className=cls;return n;};
const statuses={new:"Novo",triage:"Em triagem",in_progress:"Em atendimento",
 waiting_customer:"Aguardando sua resposta",resolved:"Resolvido",closed:"Encerrado",
 pending:"Aguardando confirmação",reviewed:"Em análise",declined:"Não confirmado",
 cancelled:"Cancelado",issued:"Aguardando sua resposta",accepted:"Aceito"};
const fmt=value=>value?new Date(value).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}):"A confirmar";
const money=value=>Number.isSafeInteger(Number(value))&&Number(value)>=0?
 new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value)/100):"Valor não informado";
const read=async promise=>{const {data,error}=await promise;if(error)throw error;return data;};
const validCustomerPassword=value=>typeof value==="string"&&value.length>=10&&value.length<=72&&
 /\p{L}/u.test(value)&&/[0-9]/.test(value)&&/[^\p{L}\p{N}\s]/u.test(value);
const err=error=>safe(error?.message||"Não foi possível concluir a operação.",220);
let db=null,user=null,dashboard=null,partners=[],view="home",activeTicket=null,
 refreshId=0,busy=false,recovery=false,quotesAt=new Map(),ticketPolling=null;
const authenticated=()=>!!user&&!!dashboard&&!!db;
function notify(message,error=false,target="customer-app-status"){
 const n=el(target);n.textContent=message;n.className="status"+(error?" error":message?" success":"");
}
function formMode(mode){
 const nodes={login:"customer-login-form",signup:"customer-signup-form",
  forgot:"customer-recovery-form",reset:"customer-reset-form"};
 for(const [key,id] of Object.entries(nodes))el(id).hidden=key!==mode;
 for(const [key,id] of [["login","customer-show-login"],["signup","customer-show-signup"]]){
  el(id).classList.toggle("active",key===mode);
  el(id).setAttribute("aria-pressed",String(key===mode));
 }
 notify(" ",false,"customer-auth-status");
}
function showArea(area){
 el("customer-auth").hidden=area!=="auth";
 el("customer-verify").hidden=area!=="verify";
 el("customer-app").hidden=area!=="app";
}
function stopPolling(){if(ticketPolling)clearInterval(ticketPolling);ticketPolling=null;}
function resetPrivate(){
 refreshId++;user=null;dashboard=null;partners=[];activeTicket=null;quotesAt.clear();stopPolling();
 for(const id of ["customer-ticket-list","customer-home-tickets","customer-device-list",
 "customer-schedule-list","customer-partner-directory","customer-thread","customer-detail-quotes"])
  el(id).replaceChildren();
 el("customer-ticket-detail").hidden=true;notify("");
 showArea("auth");
}
function showView(next){
 if(!authenticated()||!["home","tickets","equipment","schedule","professionals","profile"].includes(next))return;
 view=next;
 for(const panel of document.querySelectorAll("[data-customer-panel]"))
  panel.hidden=panel.dataset.customerPanel!==next;
 for(const button of document.querySelectorAll("[data-customer-view]")){
  const selected=button.dataset.customerView===next;
  button.classList.toggle("active",selected);
  if(selected)button.setAttribute("aria-current","page");else button.removeAttribute("aria-current");
 }
 if(next!=="tickets")stopPolling();
 else if(activeTicket)startPolling();
 window.scrollTo({top:0,behavior:"instant"});
}
function card(title,description){
 const n=make("article",undefined,"customer-record");
 n.append(make("strong",title),make("p",description));return n;
}
function badge(text,good=false){return make("span",text,"status-pill"+(good?" good":""));}
function button(label,callback,kind="secondary"){
 const n=make("button",label,kind);n.type="button";n.addEventListener("click",callback);return n;
}
function empty(host,message){host.replaceChildren(make("p",message,"customer-empty"));}
function setOptions(id,rows,prompt,value,label){
 const n=el(id),old=n.value;n.replaceChildren();
 const first=make("option",prompt);first.value="";n.append(first);
 for(const row of rows){const opt=make("option",label(row));opt.value=value(row);n.append(opt);}
 if(rows.some(x=>value(x)===old))n.value=old;
}
function tickets(){return dashboard?.tickets||[];}
function openTickets(){return tickets().filter(t=>!["closed","resolved"].includes(t.status));}
function formRequest(){
 if(!authenticated())return;
 showView("tickets");el("customer-request-dialog").hidden=false;
 el("customer-request-dialog").scrollIntoView({behavior:"smooth",block:"start"});
 el("customer-request-subject").focus();
}
function render(){
 if(!authenticated())return;
 const account=dashboard.account||{};
 el("customer-welcome").textContent=account.display_name||"Cliente PROXITI";
 el("customer-email").textContent=user.email||"";
 el("customer-profile-name").value=account.display_name||"";
 el("customer-profile-email").value=user.email||"";
 el("customer-profile-phone").value=account.phone||"";
 el("customer-profile-city").value=account.city||"";
 el("customer-profile-channel").value=account.preferred_channel||"email";
 const total=tickets().length,open=openTickets().length,devices=(dashboard.devices||[]).length;
 const metrics=el("customer-home-metrics");metrics.replaceChildren();
 for(const [label,value] of [["Atendimentos",total],["Em andamento",open],["Equipamentos",devices]]){
  const item=make("article");item.append(make("span",label),make("strong",String(value)));metrics.append(item);
 }
 const home=el("customer-home-tickets");home.replaceChildren();
 for(const t of tickets().slice(0,3))home.append(ticketCard(t,true));
 if(!tickets().length)empty(home,"Seus chamados aparecerão aqui. Você pode começar pelo chat ou pedir suporte na sua conta.");
 const list=el("customer-ticket-list");list.replaceChildren();
 for(const t of tickets())list.append(ticketCard(t,false));
 if(!tickets().length)empty(list,"Nenhum atendimento vinculado por enquanto.");
 const active=activeTicket&&tickets().find(t=>t.id===activeTicket);
 if(!active){activeTicket=null;stopPolling();el("customer-ticket-detail").hidden=true;}
 else el("customer-ticket-detail-title").textContent="Chamado #"+active.reference+" · "+active.subject;
 renderDevices();renderSchedules();renderPartners();renderLinkChoices();
}
function ticketCard(t,compact=false){
 const item=card("#"+t.reference+" · "+t.subject,fmt(t.created_at));
 item.append(badge(statuses[t.status]||t.status,["resolved","closed"].includes(t.status)));
 if(t.assigned_name)item.append(make("small","Profissional responsável: "+t.assigned_name));
 const actions=make("div",undefined,"record-actions");
 actions.append(button("Abrir atendimento",()=>void openTicket(t.id)));
 item.append(actions);if(compact)item.classList.add("compact");return item;
}
function renderDevices(){
 const host=el("customer-device-list");host.replaceChildren();
 const records=dashboard.devices||[];
 for(const device of records){
  const item=card(device.label,[device.category,device.brand,device.model].filter(Boolean).join(" · "));
  if(device.notes)item.append(make("small",device.notes));
  const actions=make("div",undefined,"record-actions");
  actions.append(button("Editar",()=>{
   el("customer-device-id").value=device.id;
   for(const field of ["label","category","brand","model","notes"])
    el("customer-device-"+field).value=device[field]||"";
   showView("equipment");el("customer-device-label").focus();
  }));
  actions.append(button("Arquivar",()=>void archiveDevice(device)));
  item.append(actions);host.append(item);
 }
 if(!records.length)empty(host,"Cadastre seu primeiro equipamento para lembrar os detalhes no próximo atendimento.");
}
async function cancelSchedule(request){
 if(!authenticated()||request.status!=="pending"||
   !window.confirm("Cancelar o pedido de horário para "+fmt(request.preferred_at)+"?"))return;
 try{
  await read(db.rpc("proxiti_customer_cancel_schedule",{p_id:request.id}));
  await reload("Pedido de horário cancelado.");showView("schedule");
 }catch(e){notify(err(e),true);}
}
async function archiveDevice(device){
 if(!window.confirm("Arquivar "+device.label+"? O equipamento não será apagado permanentemente."))return;
 try{
  await read(db.rpc("proxiti_customer_save_device",{p_id:device.id,p_label:device.label,
   p_category:device.category,p_brand:device.brand,p_model:device.model,p_notes:device.notes,
   p_archived:true}));
  await reload("Equipamento arquivado.");
 }catch(e){notify(err(e),true);}
}
function renderSchedules(){
 const host=el("customer-schedule-list");host.replaceChildren();
 for(const request of dashboard.schedule||[]){
  const t=tickets().find(x=>x.id===request.ticket_id);
  const item=card("Chamado #"+(t?.reference??"—")+" · "+fmt(request.preferred_at),
    request.modality==="remote"?"Atendimento remoto":"Atendimento presencial");
  item.append(badge(statuses[request.status]||request.status));
  if(request.note)item.append(make("small",request.note));
  if(request.status==="pending")item.append(button("Cancelar pedido de horário",()=>void cancelSchedule(request)));
  host.append(item);
 }
 if(!(dashboard.schedule||[]).length)empty(host,"Nenhum horário solicitado. A confirmação depende da equipe.");
 for(const appointment of dashboard.appointments||[]){
  const t=tickets().find(x=>x.id===appointment.ticket_id);
  const item=card("Agendamento confirmado · chamado #"+(t?.reference??"—"),
    appointment.title+" · "+fmt(appointment.starts_at)+" · "+
    (appointment.modality==="remote"?"Remoto":"Presencial"));
  item.append(badge(appointment.status==="confirmed"?"Confirmado":
    appointment.status==="done"?"Realizado":"Cancelado",appointment.status==="confirmed"));
  host.prepend(item);
 }
 setOptions("customer-schedule-ticket",openTickets(),"Escolha o chamado",t=>t.id,
  t=>"#"+t.reference+" · "+t.subject);
}
function renderPartners(){
 const dir=el("customer-partner-directory");dir.replaceChildren();
 for(const person of partners){
  const item=card(person.name,person.headline||"Profissional parceiro da PROXITI");
  const specialties=Array.isArray(person.specialties)?person.specialties.join(" · "):"";
  if(specialties)item.append(make("small",specialties));
  item.append(badge([person.remote?"Remoto":null,person.on_site?"Presencial":null].filter(Boolean).join(" e ")));
  dir.append(item);
 }
 if(!partners.length)empty(dir,"Os profissionais habilitados aparecerão aqui quando estiverem disponíveis para esta etapa.");
 setOptions("customer-preference-ticket",openTickets(),"Escolha um chamado",t=>t.id,
  t=>"#"+t.reference+" · "+t.subject);
 setOptions("customer-preference-partner",partners,"Sem preferência · a equipe escolhe",p=>p.id,p=>p.name+
  (p.headline?" · "+p.headline:""));
 const rated=new Set((dashboard.ratings||[]).map(x=>x.ticket_id));
 setOptions("customer-rating-ticket",tickets().filter(t=>["resolved","closed"].includes(t.status)
   &&t.assigned_name&&!rated.has(t.id)),"Escolha um atendimento concluído",t=>t.id,
  t=>"#"+t.reference+" · "+t.subject);
}
function renderLinkChoices(){
 const rows=[];
 for(const storage of [window.localStorage,window.sessionStorage]){
  try{for(let i=0;i<storage.length;i++){const key=storage.key(i);
   if(!key?.startsWith("proxiti_ticket_"))continue;
   const id=key.slice("proxiti_ticket_".length),record=JSON.parse(storage.getItem(key)||"null");
   if(/^[0-9a-f-]{36}$/i.test(id)&&/^[a-f0-9]{64}$/i.test(record?.token||"")&&
     !tickets().some(t=>t.id===id)&&!rows.some(r=>r.id===id))
     rows.push({id,record});}}catch{}
 }
 setOptions("customer-link-ticket",rows,"Selecione uma conversa salva",r=>r.id,
  r=>"Conversa do navegador · "+r.id.slice(0,8)+"…");
}
async function api(action,payload={}){
 if(!db||!user)throw new Error("Entre na sua conta novamente.");
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token||session.user.id!==user.id)
  throw new Error("Sua sessão expirou. Entre novamente.");
 const response=await fetch(cfg.url+"/functions/v1/proxiti-support",{
  method:"POST",headers:{"content-type":"application/json",apikey:cfg.publishableKey,
   Authorization:"Bearer "+session.access_token},
  body:JSON.stringify({action,...payload})
 });
 let body;try{body=await response.json();}catch{throw new Error("O servidor não respondeu corretamente.");}
 if(!response.ok)throw new Error(body.error||"Não foi possível concluir a solicitação.");
 return body;
}
async function reload(message=""){
 if(!db||!user)return;const id=++refreshId,uid=user.id;
 notify("Atualizando seu espaço…");
 try{
  const [a,b]=await Promise.all([read(db.rpc("proxiti_customer_dashboard")),
   read(db.rpc("proxiti_customer_partner_directory"))]);
  if(id!==refreshId||uid!==user?.id)return;
  dashboard=a;partners=Array.isArray(b)?b:[];render();
  notify(message||"Dados atualizados.");
 }catch(e){
  if(id!==refreshId)return;
  dashboard=null;el("customer-app").hidden=true;el("customer-verify").hidden=false;
  notify("Não foi possível acessar sua conta. Confirme o e-mail cadastrado e tente novamente.",true);
 }
}
async function authorize(session){
 const uid=session?.user?.id;
 if(!uid){resetPrivate();return;}
 const id=++refreshId;
 const {data,error}=await db.auth.getUser();
 if(id!==refreshId)return;
 if(error||!data.user){resetPrivate();return;}
 user=data.user;
 if(!user.email_confirmed_at){showArea("verify");return;}
 showArea("app");await reload();
 showView(view);
}
function bubble(m){
 const item=make("div",undefined,"customer-bubble"+(m.sender_kind==="customer"?" mine":""));
 item.append(make("small",(m.sender_kind==="customer"?"Você":"Equipe PROXITI")+" · "+fmt(m.created_at)),
  make("div",m.body));return item;
}
async function loadConversation(){
 const id=activeTicket,uid=user?.id;if(!id||!uid||view!=="tickets"||document.hidden)return;
 try{
  const result=await api("account_conversation",{ticket_id:id});
  if(activeTicket!==id||user?.id!==uid)return;
  const host=el("customer-thread");host.replaceChildren(...(result.messages||[]).map(bubble));
  host.scrollTop=host.scrollHeight;
  el("customer-message-form").hidden=result.ticket?.status==="closed";
  notify("Histórico atualizado.",false,"customer-thread-status");
 }catch(e){if(activeTicket===id)notify(err(e),true,"customer-thread-status");}
}
function startPolling(){stopPolling();ticketPolling=setInterval(()=>void loadConversation(),12000);}
async function openTicket(id){
 const t=tickets().find(x=>x.id===id);if(!t||!authenticated())return;
 activeTicket=id;showView("tickets");
 el("customer-ticket-detail").hidden=false;
 el("customer-ticket-detail-title").textContent="Chamado #"+t.reference+" · "+t.subject;
 el("customer-thread").replaceChildren(make("p","Consultando a conversa…","customer-empty"));
 el("customer-detail-quotes").replaceChildren();
 el("customer-ticket-detail").scrollIntoView({behavior:"smooth",block:"start"});
 await Promise.all([loadConversation(),loadQuotes(true)]);startPolling();
}
async function loadQuotes(force=false){
 const id=activeTicket,uid=user?.id;if(!id||!uid)return;
 if(!force&&Date.now()-(quotesAt.get(id)||0)<180000)return;
 quotesAt.set(id,Date.now());
 try{
  const result=await api("account_quotes",{ticket_id:id});
  if(activeTicket!==id||user?.id!==uid)return;
  renderQuotes(result.quotes||[]);
 }catch(e){
  if(activeTicket===id)empty(el("customer-detail-quotes"),
    "Não conseguimos atualizar as propostas: "+err(e));
 }
}
function renderQuotes(quotes){
 const host=el("customer-detail-quotes");host.replaceChildren();
 host.append(make("h2","Propostas deste atendimento"));
 if(!quotes.length){host.append(make("p",
  "Nenhuma proposta emitida. Você pode continuar a conversa sem contratar nada agora.",
  "customer-empty"));return;}
 for(const q of quotes){
  const expired=q.status==="issued"&&q.valid_until<new Date().toISOString().slice(0,10);
  const item=card("Proposta #"+q.reference,"Validade: "+(q.valid_until?
   new Date(q.valid_until+"T12:00:00").toLocaleDateString("pt-BR"):"A confirmar"));
  item.append(badge(expired?"Prazo encerrado":statuses[q.status]||q.status,q.status==="accepted"));
  const list=make("ul",undefined,"customer-quote-items");
  for(const entry of q.items||[]){
   const line=make("li");line.append(make("strong",entry.title),
    make("span",entry.quantity+" × "+money(entry.unit_price_cents)+
      " · Subtotal: "+money(entry.subtotal_cents)));
   if(entry.scope)line.append(make("p",entry.scope));list.append(line);
  }
  item.append(list,make("strong","Total: "+money(q.total_cents),"customer-quote-total"));
  if(q.client_notes)item.append(make("p",q.client_notes));
  if(expired)item.append(make("p","Peça à equipe uma proposta atualizada antes de aceitar."));
  if(q.status==="issued"&&!expired){
   const label=make("label",undefined,"customer-quote-check"),check=make("input");
   check.type="checkbox";label.append(check,make("span",
    "Li o escopo, o preço e as condições desta proposta e confirmo minha decisão."));
   const actions=make("div",undefined,"record-actions");
   actions.append(button("Aceitar proposta",()=>void decide(q,"accepted",check)),
    button("Recusar proposta",()=>void decide(q,"declined",check)));
   item.append(label,actions);
  }
  host.append(item);
 }
}
async function decide(q,decision,check){
 if(!authenticated()||!activeTicket)return;
 if(!check.checked){notify("Confirme que leu a proposta antes de responder.",true);check.focus();return;}
 if(!window.confirm((decision==="accepted"?"Aceitar":"Recusar")+" a proposta #"+q.reference+
  " de "+money(q.total_cents)+"? A resposta será registrada, sem efetuar pagamento."))return;
 const ticket=activeTicket;
 try{
  await api("account_quote_decision",{ticket_id:ticket,quote_id:q.id,decision,confirmed:true});
  if(activeTicket===ticket){quotesAt.delete(ticket);await loadQuotes(true);}
  notify("Sua decisão foi registrada. A equipe poderá acompanhar pelo chamado.");
 }catch(e){quotesAt.delete(ticket);notify(err(e),true);await loadQuotes(true);}
}
async function useSession(event,session){
 if(event==="PASSWORD_RECOVERY"){recovery=true;showArea("auth");formMode("reset");return;}
 if(event==="SIGNED_OUT"){resetPrivate();return;}
 if(event==="TOKEN_REFRESHED"&&user?.id===session?.user?.id)return;
 if(session?.user)await authorize(session);else resetPrivate();
}
function setBusy(value){busy=value;for(const node of document.querySelectorAll(".customer-form button[type=submit]"))node.disabled=value;}
el("customer-show-login").addEventListener("click",()=>formMode("login"));
el("customer-show-signup").addEventListener("click",()=>formMode("signup"));
el("customer-forgot").addEventListener("click",()=>formMode("forgot"));
document.querySelector("[data-customer-back]").addEventListener("click",()=>formMode("login"));
el("customer-login-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!db||!event.currentTarget.reportValidity())return;
 setBusy(true);
 try{
  const {error}=await db.auth.signInWithPassword({email:el("customer-login-email").value.trim(),
    password:el("customer-login-password").value});
  if(error)throw error;
  el("customer-login-password").value="";
 }catch(e){notify("Não foi possível entrar. Confira seus dados ou recupere a senha.",true,"customer-auth-status");}
 finally{setBusy(false);}
});
el("customer-signup-form").addEventListener("submit",async event=>{
 event.preventDefault();const form=event.currentTarget;
 if(busy||!db||!form.reportValidity())return;
 const password=el("customer-signup-password").value;
 if(!validCustomerPassword(password)||password!==el("customer-signup-confirm").value){
  notify("A senha deve ter de 10 a 72 caracteres, com letra, número e símbolo, e as duas senhas precisam coincidir.",
   true,"customer-auth-status");return;
 }
 setBusy(true);
 const email=el("customer-signup-email").value.trim().toLowerCase();
 try{
  const response=await fetch(cfg.url+"/functions/v1/proxiti-support",{
   method:"POST",headers:{"content-type":"application/json",apikey:cfg.publishableKey},
   body:JSON.stringify({action:"customer_register",name:el("customer-signup-name").value.trim(),
    email,password,privacy_accepted:el("customer-signup-privacy").checked,
    company_website:el("customer-signup-company-website").value})
  });
  let result;try{result=await response.json();}
  catch{throw new Error("O servidor não respondeu corretamente.");}
  if(!response.ok||!result?.ok||!result.login_ready)
   throw new Error(result?.error||"Cadastro não confirmado. Tente novamente.");
  const {data:login,error:loginError}=await db.auth.signInWithPassword({email,password});
  el("customer-signup-password").value="";
  el("customer-signup-confirm").value="";
  if(loginError||!login?.session){
   formMode("login");el("customer-login-email").value=email;
   notify("Conta criada. Entre com o e-mail e a senha que acabou de escolher.",
     false,"customer-auth-status");return;
  }
  form.reset();
  await authorize(login.session);
  notify("Sua conta está pronta! Você já pode pedir suporte e organizar seus equipamentos.");
 }catch(error){
  notify("Não foi possível criar sua conta: "+err(error),true,"customer-auth-status");
 }finally{setBusy(false);}
});
el("customer-recovery-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!db||!event.currentTarget.reportValidity())return;
 setBusy(true);
 try{
  const {error}=await db.auth.resetPasswordForEmail(
   el("customer-recovery-email").value.trim(),
   {redirectTo:location.origin+"/minha-proxiti/"});
  if(error)throw error;
  notify("Se houver uma conta para este e-mail, as instruções serão enviadas.",
   false,"customer-auth-status");
 }catch{notify("Não foi possível solicitar recuperação agora.",true,"customer-auth-status");}
 finally{setBusy(false);}
});
el("customer-reset-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!db||!recovery||!event.currentTarget.reportValidity())return;
 const password=el("customer-reset-password").value;
 if(!validCustomerPassword(password)||password!==el("customer-reset-confirm").value){
  notify("Use entre 10 e 72 caracteres com letra, número e símbolo, e confirme a mesma senha.",true,"customer-auth-status");return;}
 setBusy(true);
 try{
  const {error}=await db.auth.updateUser({password});if(error)throw error;
  recovery=false;await db.auth.signOut();formMode("login");
  notify("Senha alterada. Entre com sua nova senha.",false,"customer-auth-status");
  history.replaceState(null,"",location.pathname);
 }catch(e){notify(err(e),true,"customer-auth-status");}
 finally{setBusy(false);}
});
el("customer-verify-retry").addEventListener("click",async()=>{
 const {data:{session}}=await db.auth.refreshSession();await authorize(session);
});
for(const id of ["customer-logout","customer-verify-logout"])
 el(id).addEventListener("click",async()=>{await db?.auth.signOut();resetPrivate();formMode("login");});
for(const button of document.querySelectorAll("[data-customer-view]"))
 button.addEventListener("click",()=>showView(button.dataset.customerView));
for(const button of document.querySelectorAll("[data-open-customer-request]"))
 button.addEventListener("click",formRequest);
el("customer-refresh").addEventListener("click",()=>void reload());
el("customer-close-ticket").addEventListener("click",()=>{
 activeTicket=null;stopPolling();el("customer-ticket-detail").hidden=true;
 el("customer-thread").replaceChildren();el("customer-detail-quotes").replaceChildren();
});
el("customer-link-ticket-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!authenticated()||!event.currentTarget.reportValidity())return;
 const id=el("customer-link-ticket").value;let token=null;
 for(const store of [window.localStorage,window.sessionStorage]){
  try{token=JSON.parse(store.getItem("proxiti_ticket_"+id)||"null")?.token||token;}catch{}
 }
 if(!/^[a-f0-9]{64}$/i.test(token||"")){notify("A chave da conversa não está neste navegador.",true);return;}
 setBusy(true);
 try{
  await read(db.rpc("proxiti_customer_link_ticket",{p_ticket:id,p_access_token:token}));
  await reload("Conversa vinculada à sua conta.");showView("tickets");
 }catch(e){notify(err(e),true);}finally{setBusy(false);}
});
el("customer-device-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!authenticated()||!event.currentTarget.reportValidity())return;
 setBusy(true);
 try{
  await read(db.rpc("proxiti_customer_save_device",{
   p_id:el("customer-device-id").value||null,
   p_label:el("customer-device-label").value,p_category:el("customer-device-category").value,
   p_brand:el("customer-device-brand").value,p_model:el("customer-device-model").value,
   p_notes:el("customer-device-notes").value,p_archived:false}));
  event.currentTarget.reset();el("customer-device-id").value="";
  await reload("Equipamento salvo.");showView("equipment");
 }catch(e){notify(err(e),true);}finally{setBusy(false);}
});
el("customer-device-clear").addEventListener("click",()=>{
 el("customer-device-form").reset();el("customer-device-id").value="";
});
el("customer-schedule-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!authenticated()||!event.currentTarget.reportValidity())return;
 const at=new Date(el("customer-schedule-date").value);
 if(Number.isNaN(at.getTime())){notify("Confira o horário solicitado.",true);return;}
 setBusy(true);
 try{
  await read(db.rpc("proxiti_customer_schedule",{
   p_ticket:el("customer-schedule-ticket").value,p_at:at.toISOString(),
   p_modality:el("customer-schedule-modality").value,p_note:el("customer-schedule-note").value}));
  event.currentTarget.reset();await reload("Horário solicitado. A equipe precisa confirmar.");
  showView("schedule");
 }catch(e){notify(err(e),true);}finally{setBusy(false);}
});
el("customer-preference-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!authenticated()||!event.currentTarget.reportValidity())return;
 setBusy(true);
 try{
  await read(db.rpc("proxiti_customer_set_partner",{
   p_ticket:el("customer-preference-ticket").value,
   p_partner:el("customer-preference-partner").value||null}));
  await reload("Preferência registrada. O profissional ainda precisa confirmar disponibilidade.");
  showView("professionals");
 }catch(e){notify(err(e),true);}finally{setBusy(false);}
});
el("customer-rating-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!authenticated()||!event.currentTarget.reportValidity())return;
 setBusy(true);
 try{
  await read(db.rpc("proxiti_customer_rate",{
   p_ticket:el("customer-rating-ticket").value,
   p_stars:Number(el("customer-rating-stars").value),
   p_comment:el("customer-rating-comment").value}));
  event.currentTarget.reset();await reload("Avaliação registrada. Obrigado por ajudar a melhorar o atendimento.");
  showView("professionals");
 }catch(e){notify(err(e),true);}finally{setBusy(false);}
});
el("customer-profile-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!authenticated()||!event.currentTarget.reportValidity())return;
 setBusy(true);
 try{
  await read(db.rpc("proxiti_customer_update",{
   p_name:el("customer-profile-name").value,p_phone:el("customer-profile-phone").value,
   p_city:el("customer-profile-city").value,p_channel:el("customer-profile-channel").value}));
  await reload("Seu perfil foi atualizado.");showView("profile");
 }catch(e){notify(err(e),true);}finally{setBusy(false);}
});
el("customer-profile-password").addEventListener("click",async()=>{
 if(!user?.email)return;
 try{
  const {error}=await db.auth.resetPasswordForEmail(user.email,
   {redirectTo:location.origin+"/minha-proxiti/"});
  if(error)throw error;notify("Confira seu e-mail para alterar a senha.");
 }catch(e){notify("Não foi possível enviar o link de recuperação.",true);}
});
el("customer-message-form").addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!authenticated()||!activeTicket||!event.currentTarget.reportValidity())return;
 const ticket=activeTicket,msg=el("customer-message").value.trim();if(!msg)return;
 setBusy(true);
 try{
  await api("account_reply",{ticket_id:ticket,message:msg});
  el("customer-message").value="";await loadConversation();
  notify("Mensagem enviada.");
 }catch(e){notify(err(e),true);}finally{setBusy(false);}
});
const requestForm=document.createElement("form");
requestForm.id="customer-request-form";requestForm.className="customer-form";
requestForm.innerHTML='<h2>Vamos entender o que aconteceu.</h2><p>Você pode pedir suporte remoto ou presencial. A equipe avalia o contexto antes de propor qualquer serviço pago.</p><label>Como podemos ajudar?<input id="customer-request-subject" minlength="4" maxlength="160" required placeholder="Ex.: Notebook não inicia"></label><label>Modalidade<select id="customer-request-modality"><option value="remote">Suporte remoto</option><option value="on_site">Atendimento presencial</option></select></label><label>Conte o problema<textarea id="customer-request-description" minlength="8" maxlength="2000" rows="5" required placeholder="O que aconteceu e quando começou? Não informe senhas."></textarea></label><label class="check"><input id="customer-request-privacy" type="checkbox" required><span>Li a Política de Privacidade e autorizo o uso dos dados para este chamado.</span></label><div class="record-actions"><button class="primary" type="submit">Enviar solicitação</button><button class="secondary" id="customer-request-cancel" type="button">Cancelar</button></div>';
const requestSection=make("section",undefined,"customer-card");requestSection.id="customer-request-dialog";
requestSection.hidden=true;requestSection.append(requestForm);
el("customer-ticket-list").before(requestSection);
el("customer-request-cancel").addEventListener("click",()=>{requestSection.hidden=true;requestForm.reset();});
requestForm.addEventListener("submit",async event=>{
 event.preventDefault();if(busy||!authenticated()||!requestForm.reportValidity())return;
 setBusy(true);
 try{
  const r=await api("account_open",{
   subject:el("customer-request-subject").value,
   description:el("customer-request-description").value,
   modality:el("customer-request-modality").value,
   privacy_accepted:el("customer-request-privacy").checked});
  if(!r.id||!/^[a-f0-9]{64}$/i.test(r.access_token||""))
    throw new Error("O servidor não confirmou a criação do chamado.");
  try{localStorage.setItem("proxiti_ticket_"+r.id,JSON.stringify({
    token:r.access_token,savedAt:Date.now()}));}catch{}
  requestForm.reset();requestSection.hidden=true;
  await reload("Chamado #"+r.reference+" registrado. A equipe já pode fazer a triagem.");
  showView("tickets");void openTicket(r.id);
 }catch(e){notify(err(e),true);}finally{setBusy(false);}
});
if(!cfg?.url||!cfg?.publishableKey||!window.supabase?.createClient){
 formMode("login");notify("Área do cliente indisponível no momento. O chat sem login continua aberto.",true,"customer-auth-status");
 return;
}
try{db=window.supabase.createClient(cfg.url,cfg.publishableKey,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,
  storageKey:"proxiti-customer-session"}});
}catch{
 formMode("login");notify("Não foi possível iniciar o acesso. Use o chat sem login.",true,"customer-auth-status");return;
}
db.auth.onAuthStateChange((event,session)=>queueMicrotask(()=>void useSession(event,session)));
formMode("login");
})();