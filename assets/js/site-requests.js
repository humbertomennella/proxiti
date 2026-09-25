(() => {
  "use strict";
  const form=document.querySelector("#pre-diagnostico-form");
  if(!form)return;
  const status=document.querySelector("#triage-status");
  const cfg=window.PROXITI_SUPPORT;
  const endpoint=cfg?.url+"/functions/v1/proxiti-support";
  const tell=(msg)=>{if(status)status.textContent=msg;};
  function storage(){
    for(const item of [localStorage,sessionStorage]){
      try{item.setItem("__proxiti_storage_check","1");item.removeItem("__proxiti_storage_check");return item;}
      catch{/* tenta armazenamento de sessão */}
    }
    return null;
  }
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const stash=storage();
    if(!stash){tell("Ative o armazenamento do navegador para acompanhar o chamado ou utilize o contato direto por e-mail.");return;}
    const data=new FormData(form),send=form.querySelector('button[type="submit"]');
    if(!cfg?.url||!cfg?.publishableKey){tell("Sistema temporariamente indisponível. Entre em contato por e-mail.");return;}
    const body={
      action:"create",source:"form",
      name:String(data.get("nome")||"").trim(),email:String(data.get("email")||"").trim(),
      phone:String(data.get("telefone")||"").trim(),company_website:String(data.get("company_website")||""),
      customer_type:String(data.get("perfil")||""),service_type:String(data.get("area")||""),
      impact:String(data.get("impacto")||""),subject:"Solicitação: "+String(data.get("area")||"Atendimento"),
      description:"Perfil: "+String(data.get("perfil")||"")+"\nEquipamento ou ambiente: "+
        String(data.get("equipamento")||"Não informado")+"\nImpacto: "+String(data.get("impacto")||"")+
        "\n\nContexto:\n"+String(data.get("sintoma")||"").trim(),
      privacy_accepted:data.get("privacidade")==="on"
    };
    send.disabled=true;tell("Registrando sua solicitação com segurança…");
    try{
      const response=await fetch(endpoint,{
        method:"POST",headers:{"content-type":"application/json",apikey:cfg.publishableKey},
        body:JSON.stringify(body)
      });
      const result=await response.json();
      if(!response.ok||!result.id||!result.access_token)
        throw new Error(result.error||"Não foi possível registrar o atendimento.");
      stash.setItem("proxiti_ticket_"+result.id,
        JSON.stringify({token:result.access_token,savedAt:Date.now()}));
      tell("Chamado #"+result.reference+" registrado. Abrindo sua conversa…");
      window.location.assign("/atendimento/?ticket="+encodeURIComponent(result.id));
    }catch(error){
      tell((error.message||"Falha de conexão.")+
        " Se necessário, utilize o e-mail de contato exibido no rodapé.");
    }finally{send.disabled=false;}
  });
})();
