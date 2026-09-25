(() => {
  "use strict";
  const el=id=>document.getElementById(id),cfg=window.PROXITI_SUPPORT;
  const endpoint=cfg?.url+"/functions/v1/proxiti-support";
  const params=new URLSearchParams(location.search);
  let ticketId=params.get("ticket"),token=null,seen="",timer=null;
  function note(message,fail=false){
    const area=el("support-feedback");area.textContent=message;area.hidden=!message;
    area.className="support-feedback"+(fail?" error":"");
  }
  function store(){
    for(const getStorage of [()=>window.localStorage,()=>window.sessionStorage]){
      try{const item=getStorage();item.setItem("__proxiti_test","yes");item.removeItem("__proxiti_test");return item;}catch{}
    }
    return null;
  }
  function findKey(id){
    for(const getStorage of [()=>window.localStorage,()=>window.sessionStorage]){
      try{const val=JSON.parse(getStorage().getItem("proxiti_ticket_"+id)||"null");if(val?.token)return val.token;}catch{}
    }
    return null;
  }
  async function call(action,detail={}){
    if(!cfg?.url||!cfg?.publishableKey)throw new Error("Atendimento indisponível no momento.");
    const resp=await fetch(endpoint,{method:"POST",
      headers:{"content-type":"application/json",apikey:cfg.publishableKey},
      body:JSON.stringify({action,...detail})});
    let data;try{data=await resp.json();}catch{throw new Error("O servidor não respondeu corretamente.");}
    if(!resp.ok)throw new Error(data.error||"Não foi possível concluir a solicitação.");
    return data;
  }
  function bubble(kind,body,created){
    const item=document.createElement("div");
    item.className="bubble"+(kind==="customer"?" mine":"");
    const meta=document.createElement("small");
    meta.textContent=(kind==="customer"?"Você":"Equipe PROXITI")+" · "+
      new Date(created).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});
    const text=document.createElement("div");text.textContent=body;
    item.append(meta,text);return item;
  }
  async function online(){
    try{
      const result=await call("online"),n=Number(result.online)||0;
      el("online-status").classList.toggle("available",n>0);
      el("online-status").textContent=n>0?"Equipe disponível no chat agora":
        "Nenhum técnico online no momento · Sua solicitação ficará na fila";
    }catch{el("online-status").textContent="Disponibilidade não confirmada · Sua solicitação será registrada";}
  }
  async function refresh(){
    if(!ticketId||!token||document.hidden)return;
    try{
      const data=await call("conversation",{ticket_id:ticketId,access_token:token});
      el("support-conversation").hidden=false;el("support-start").hidden=true;
      el("support-lost").hidden=true;
      el("conversation-ref").textContent="CHAMADO #"+data.ticket.reference;
      el("conversation-heading").textContent=data.ticket.subject;
      const statusNames={new:"Novo",triage:"Em triagem",in_progress:"Em atendimento",
        waiting_customer:"Aguardando cliente",resolved:"Resolvido",closed:"Encerrado"};
      el("conversation-status").textContent="Situação: "+(statusNames[data.ticket.status]||data.ticket.status)+
        (data.ticket.online?" · Técnico designado":" · Aguardando técnico");
      el("customer-reply").hidden=data.ticket.status==="closed";
      const signature=JSON.stringify(data.messages.map(m=>[m.id,m.created_at]));
      if(signature!==seen){
        seen=signature;const box=el("customer-messages"),wasBottom=box.scrollHeight-box.scrollTop-box.clientHeight<100;
        box.replaceChildren(...data.messages.map(m=>bubble(m.sender_kind,m.body,m.created_at)));
        if(wasBottom)box.scrollTop=box.scrollHeight;
      }
      note("");
    }catch(error){note(error.message,true);}
  }
  function showLost(){
    el("support-start").hidden=true;el("support-conversation").hidden=true;
    el("support-lost").hidden=false;
  }
  async function open(){
    if(!ticketId||!/^[\da-f-]{36}$/i.test(ticketId)){showLost();return;}
    token=findKey(ticketId);
    if(!token){showLost();return;}
    el("support-start").hidden=true;el("support-lost").hidden=true;
    el("support-conversation").hidden=false;
    await refresh();
    if(timer)clearInterval(timer);
    timer=setInterval(()=>void refresh(),4000);
  }
  el("support-start").addEventListener("submit",async event=>{
    event.preventDefault();const form=event.currentTarget;
    if(!form.reportValidity())return;
    const stash=store();
    if(!stash){note("Ative o armazenamento do navegador para manter acesso à conversa ou utilize o e-mail de contato.",true);return;}
    const send=el("start-submit");send.disabled=true;note("Registrando sua mensagem…");
    try{
      const result=await call("create",{
        source:"chat",name:el("support-name").value.trim(),email:el("support-email").value.trim(),
        subject:el("support-subject").value.trim(),description:el("support-description").value.trim(),
        company_website:el("support-company").value,privacy_accepted:el("support-consent").checked
      });
      if(!result.id||!result.access_token)throw new Error("Não foi possível abrir a conversa.");
      ticketId=result.id;token=result.access_token;
      stash.setItem("proxiti_ticket_"+ticketId,JSON.stringify({token,savedAt:Date.now()}));
      history.replaceState(null,"","/atendimento/?ticket="+encodeURIComponent(ticketId));
      seen="";await open();
    }catch(error){note(error.message,true);}
    finally{send.disabled=false;}
  });
  el("customer-reply").addEventListener("submit",async event=>{
    event.preventDefault();if(!ticketId||!token)return;
    const field=el("customer-reply-text"),msg=field.value.trim(),send=el("reply-submit");
    if(!msg)return;send.disabled=true;
    try{
      await call("reply",{ticket_id:ticketId,access_token:token,message:msg});
      field.value="";await refresh();
    }catch(error){note(error.message,true);}
    finally{send.disabled=false;}
  });
  el("forget-ticket").addEventListener("click",()=>{
    if(!window.confirm("Apagar a chave de acesso a esta conversa deste navegador? Você poderá perder o acesso ao histórico."))return;
    for(const getStorage of [()=>window.localStorage,()=>window.sessionStorage])try{getStorage().removeItem("proxiti_ticket_"+ticketId);}catch{}
    token=null;ticketId=null;if(timer)clearInterval(timer);
    history.replaceState(null,"","/atendimento/");
    el("support-conversation").hidden=true;el("support-start").hidden=false;
    seen="";note("O acesso a esta conversa foi apagado deste navegador.");
  });
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&ticketId&&token)void refresh();});
  void online();setInterval(()=>{if(!document.hidden)void online();},20000);
  if(ticketId)void open();
})();
