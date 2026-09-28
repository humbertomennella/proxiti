(() => {
  "use strict";
  const el=id=>document.getElementById(id),cfg=window.PROXITI_SUPPORT;
  const endpoint=cfg?.url+"/functions/v1/proxiti-support";
  const params=new URLSearchParams(location.search);
  let ticketId=params.get("ticket"),token=null,seen="",timer=null;
  let soundOn=true,audio=null,seenStaff=null;
  let quotesBusy=false,lastQuotesCheck=0,quoteSignature="",quoteEpoch=0;
  const soundPreference="proxiti-customer-alerts-v2";
  try{soundOn=localStorage.getItem(soundPreference)!=="false"}catch{}
  function soundLabel(){const b=el("customer-sound-toggle");if(b){b.textContent=soundOn?"♫ Alertas ativados":"♪ Alertas desativados";b.setAttribute("aria-pressed",String(soundOn));b.setAttribute("aria-label",soundOn?"Desativar alertas":"Ativar alertas");b.title=soundOn?"Desativar alertas":"Ativar alertas"}}
  async function enableSound(){
    if(!soundOn)return;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      audio=audio||new Audio();await audio.resume();soundOn=audio.state==="running";soundLabel();
    }catch{soundOn=false;soundLabel()}
  }
  function sound(){
    if(!soundOn||!audio||audio.state!=="running")return;
    const t=audio.currentTime;
    for(let i=0;i<2;i++){
      const oscillator=audio.createOscillator(),gain=audio.createGain(),start=t+i*.15;
      oscillator.type="sine";oscillator.frequency.setValueAtTime(i?820:1050,start);
      gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.052,start+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,start+.13);
      oscillator.connect(gain);gain.connect(audio.destination);
      oscillator.start(start);oscillator.stop(start+.15);
    }
  }
  function restoreMostRecent(){
    let latest=null;
    for(const getStorage of [()=>window.localStorage,()=>window.sessionStorage]){
      try{const store=getStorage();
        for(let i=0;i<store.length;i++){
          const key=store.key(i);if(!key?.startsWith("proxiti_ticket_"))continue;
          const id=key.slice("proxiti_ticket_".length),record=JSON.parse(store.getItem(key)||"null");
          if(/^[0-9a-f-]{36}$/i.test(id)&&record?.token&&Number(record.savedAt)>Number(latest?.time||0))
            latest={id,time:Number(record.savedAt)};
        }
      }catch{}
    }
    return latest?.id||null;
  }
  if(!ticketId&&params.get("embed")==="1")ticketId=restoreMostRecent();
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
  const make=(tag,text,cls)=>{
    const node=document.createElement(tag);
    if(text!==undefined)node.textContent=String(text);
    if(cls)node.className=cls;
    return node;
  };
  const money=value=>{
    const cents=Number(value);
    return Number.isSafeInteger(cents)&&cents>=0?
      new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100):
      "Valor indisponível";
  };
  const date=value=>/^\d{4}-\d\d-\d\d$/.test(String(value||""))?
    new Date(value+"T12:00:00").toLocaleDateString("pt-BR"):"Não informada";
  function quoteFeedback(message,error=false){
    const node=el("customer-quotes-feedback");
    node.textContent=message;node.classList.toggle("error",error);
  }
  function renderQuotes(quotes){
    const host=el("customer-quotes-list");host.replaceChildren();
    if(!quotes.length){
      host.append(make("p","Nenhuma proposta emitida para este chamado. Quando a PROXITI enviar um orçamento, ele aparecerá aqui.","customer-quote-empty"));
      return;
    }
    for(const [index,q] of quotes.entries()){
      const card=make("article",undefined,"customer-quote-card");
      const today=new Date().toISOString().slice(0,10);
      const expired=q.status==="issued"&&q.valid_until<today;
      const names={issued:"Aguardando sua resposta",accepted:"Aceito",declined:"Recusado",cancelled:"Cancelado"};
      const title=make("div",undefined,"customer-quote-heading");
      title.append(make("strong","Proposta #"+q.reference),
        make("span",expired?"Prazo encerrado":names[q.status]||"Situação a confirmar"));
      card.append(title);
      if(q.parent_reference)card.append(make("small","Aditivo da proposta #"+q.parent_reference));
      card.append(make("p","Validade: "+date(q.valid_until)));
      const items=make("ul",undefined,"customer-quote-items");
      for(const item of q.items||[]){
        const li=make("li");
        li.append(make("strong",item.title),
          make("span",item.quantity+" × "+money(item.unit_price_cents)+
            " / "+item.unit+" · Subtotal: "+money(item.subtotal_cents)));
        if(item.scope)li.append(make("p",item.scope));
        items.append(li);
      }
      card.append(items,make("div","Total da proposta: "+money(q.total_cents),"customer-quote-total"));
      if(q.client_notes)card.append(make("p",q.client_notes,"customer-quote-notes"));
      if(expired)card.append(make("p",
        "Esta proposta venceu. Solicite uma versão atualizada antes de autorizar o serviço.",
        "customer-quote-warning"));
      if(q.status==="issued"&&!expired){
        const ack=make("label",undefined,"customer-quote-ack");
        const check=make("input");check.type="checkbox";
        ack.append(check,make("span",
          "Li os serviços, os valores e as condições acima e confirmo minha decisão para esta proposta."));
        const actions=make("div",undefined,"customer-quote-actions");
        const accept=make("button","Aceitar esta proposta","support-primary");
        const decline=make("button","Recusar proposta","support-plain");
        accept.type="button";decline.type="button";
        accept.addEventListener("click",()=>void decideQuote(q,"accepted",check,[accept,decline]));
        decline.addEventListener("click",()=>void decideQuote(q,"declined",check,[accept,decline]));
        actions.append(accept,decline);card.append(ack,actions);
      }
      host.append(card);
    }
  }
  async function loadQuotes(force=false){
    if(!ticketId||!token||quotesBusy||document.hidden)return;
    if(!force&&Date.now()-lastQuotesCheck<180000)return;
    quotesBusy=true;lastQuotesCheck=Date.now();
    const id=ticketId,key=token,epoch=quoteEpoch;
    try{
      const result=await call("quotes",{ticket_id:id,access_token:key});
      if(epoch!==quoteEpoch||id!==ticketId||key!==token)return;
      if(!Array.isArray(result.quotes))throw new Error("Lista de propostas indisponível.");
      const signature=JSON.stringify(result.quotes);
      el("customer-quotes").hidden=false;
      if(signature!==quoteSignature){quoteSignature=signature;renderQuotes(result.quotes);}
      quoteFeedback(result.quotes.length?
        "Propostas consultadas no servidor. A resposta não realiza pagamentos.":
        "Nenhuma proposta emitida para este chamado.");
    }catch(error){
      if(epoch===quoteEpoch&&id===ticketId){
        el("customer-quotes").hidden=false;
        quoteFeedback("Não foi possível atualizar as propostas. "+error.message,true);
      }
    }finally{if(epoch===quoteEpoch)quotesBusy=false;}
  }
  async function decideQuote(quote,decision,check,buttons){
    if(!ticketId||!token||quotesBusy)return;
    if(!check.checked){
      quoteFeedback("Marque a confirmação de leitura antes de responder à proposta.",true);
      check.focus();return;
    }
    const action=decision==="accepted"?"ACEITAR":"RECUSAR";
    if(!window.confirm(action+" a proposta #"+quote.reference+" no valor total de "+
      money(quote.total_cents)+"? Sua resposta será registrada no chamado e não movimentará dinheiro."))return;
    const id=ticketId,key=token,epoch=quoteEpoch;
    for(const button of buttons)button.disabled=true;
    quoteFeedback("Enviando sua decisão para registro…");
    try{
      const result=await call("quote_decision",{ticket_id:id,access_token:key,
        quote_id:quote.id,decision,confirmed:true});
      if(epoch!==quoteEpoch||id!==ticketId||key!==token)return;
      if(!result.ok||result.decision!==decision)throw new Error("Resposta não confirmada pelo servidor.");
      quoteFeedback("Sua decisão foi registrada. Atualizando o estado da proposta…");
      quoteSignature="";lastQuotesCheck=0;
      await loadQuotes(true);
    }catch(error){
      if(epoch===quoteEpoch&&id===ticketId){
        quoteFeedback("Não foi possível confirmar a resposta. Atualize a proposta antes de tentar novamente. "+error.message,true);
        lastQuotesCheck=0;void loadQuotes(true);
      }
    }finally{for(const button of buttons)if(button.isConnected)button.disabled=false;}
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
      const currentStaff=new Set(data.messages.filter(m=>m.sender_kind==="staff").map(m=>m.id));
      if(seenStaff&&data.messages.some(m=>m.sender_kind==="staff"&&!seenStaff.has(m.id)))sound();
      seenStaff=currentStaff;
      const signature=JSON.stringify(data.messages.map(m=>[m.id,m.created_at]));
      if(signature!==seen){
        seen=signature;const box=el("customer-messages"),wasBottom=box.scrollHeight-box.scrollTop-box.clientHeight<100;
        box.replaceChildren(...data.messages.map(m=>bubble(m.sender_kind,m.body,m.created_at)));
        if(wasBottom)box.scrollTop=box.scrollHeight;
      }
      note("");
      if(Date.now()-lastQuotesCheck>=180000)void loadQuotes();
    }catch(error){note(error.message,true);}
  }
  function showLost(){
    quoteEpoch++;quoteSignature="";el("customer-quotes").hidden=true;
    el("support-start").hidden=true;el("support-conversation").hidden=true;
    el("support-lost").hidden=false;
  }
  async function open(){
    if(!ticketId||!/^[\da-f-]{36}$/i.test(ticketId)){showLost();return;}
    token=findKey(ticketId);
    if(!token){showLost();return;}
    if(!new URLSearchParams(location.search).has("ticket"))history.replaceState(null,"","/atendimento/?ticket="+encodeURIComponent(ticketId)+(document.documentElement.classList.contains("embedded")?"&embed=1":""));
    quoteEpoch++;quotesBusy=false;quoteSignature="";lastQuotesCheck=0;
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
    void enableSound();
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
      history.replaceState(null,"","/atendimento/?ticket="+encodeURIComponent(ticketId)+(document.documentElement.classList.contains("embedded")?"&embed=1":""));
      seen="";seenStaff=null;await open();
    }catch(error){note(error.message,true);}
    finally{send.disabled=false;}
  });
  el("customer-reply").addEventListener("submit",async event=>{
    event.preventDefault();if(!ticketId||!token)return;
    const field=el("customer-reply-text"),msg=field.value.trim(),send=el("reply-submit");
    if(!msg)return;void enableSound();send.disabled=true;
    try{
      await call("reply",{ticket_id:ticketId,access_token:token,message:msg});
      field.value="";await refresh();
    }catch(error){note(error.message,true);}
    finally{send.disabled=false;}
  });
  el("forget-ticket").addEventListener("click",()=>{
    if(!window.confirm("Apagar a chave de acesso a esta conversa deste navegador? Você poderá perder o acesso ao histórico."))return;
    for(const getStorage of [()=>window.localStorage,()=>window.sessionStorage])try{getStorage().removeItem("proxiti_ticket_"+ticketId);}catch{}
    quoteEpoch++;quoteSignature="";quotesBusy=false;lastQuotesCheck=0;
    el("customer-quotes").hidden=true;el("customer-quotes-list").replaceChildren();
    token=null;ticketId=null;if(timer)clearInterval(timer);
    history.replaceState(null,"",document.documentElement.classList.contains("embedded")?"/atendimento/?embed=1":"/atendimento/");
    el("support-conversation").hidden=true;el("support-start").hidden=false;
    seen="";seenStaff=null;note("O acesso a esta conversa foi apagado deste navegador.");
  });
  el("customer-quotes-refresh").addEventListener("click",()=>void loadQuotes(true));
  el("customer-sound-toggle").addEventListener("click",()=>{
    soundOn=!soundOn;
    try{localStorage.setItem(soundPreference,String(soundOn))}catch{}
    soundLabel();
    if(soundOn)void enableSound();
  });
  document.addEventListener("pointerdown",()=>{if(soundOn&&audio?.state!=="running")void enableSound()},{capture:true});
  document.addEventListener("keydown",()=>{if(soundOn&&audio?.state!=="running")void enableSound()},{capture:true});
  soundLabel();
  window.addEventListener("message",event=>{if(event.origin===location.origin&&event.data?.type==="proxiti-chat-resume")void refresh()});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&ticketId&&token)void refresh();});
  void online();setInterval(()=>{if(!document.hidden)void online();},20000);
  if(ticketId)void open();
})();
