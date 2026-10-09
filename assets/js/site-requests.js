(() => {
  "use strict";
  const form=document.querySelector("#pre-diagnostico-form");
  if(!form)return;
  const status=document.querySelector("#triage-status");
  const cfg=window.PROXITI_SUPPORT;
  const endpoint=cfg?.url+"/functions/v1/proxiti-support";
  const tell=(msg)=>{if(status)status.textContent=msg;};
  function storage(){
    for(const getStorage of [()=>window.localStorage,()=>window.sessionStorage]){
      try{const item=getStorage();item.setItem("__proxiti_storage_check","1");item.removeItem("__proxiti_storage_check");return item;}
      catch{/* tenta armazenamento de sessão */}
    }
    return null;
  }
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const stash=storage();
    const data=new FormData(form),send=form.querySelector('button[type="submit"]');
    if(!cfg?.url||!cfg?.publishableKey){tell("Sistema temporariamente indisponível. Entre em contato por e-mail.");return;}
    const body={
      action:"create",source:"form",
      name:String(data.get("nome")||"").trim(),email:String(data.get("email")||"").trim(),
      phone:String(data.get("telefone")||"").trim(),company_website:String(data.get("company_website")||""),
      customer_type:"Micro ou pequeno negócio",service_type:String(data.get("area")||""),
      impact:String(data.get("impacto")||""),subject:"Checkup B2B: "+String(data.get("empresa")||"Empresa")+" — "+String(data.get("area")||"Gestão de TI"),
      description:"Perfil: Micro ou pequeno negócio\nEmpresa: "+String(data.get("empresa")||"Não informada")+"\nCargo: "+String(data.get("cargo")||"Não informado")+"\nEstações de trabalho: "+String(data.get("equipamento")||"Não informado")+"\nImpacto: "+String(data.get("impacto")||"")+"\n\nContexto:\n"+String(data.get("sintoma")||"").trim(),
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
      if(stash){
        try{stash.setItem("proxiti_ticket_"+result.id,JSON.stringify({token:result.access_token,savedAt:Date.now()}));}
        catch{ /* O registro remoto não deve falhar por restrições de armazenamento local. */ }
      }
      tell("Solicitação comercial #"+result.reference+" registrada. Abrindo o WhatsApp para combinar a avaliação inicial…");
      const commercialMessage=[
        "Olá! Solicitei uma avaliação inicial gratuita de TI da Proxiti.",
        "Empresa: "+String(data.get("empresa")||""),
        "Responsável: "+String(data.get("nome")||"")+" ("+String(data.get("cargo")||"")+")",
        "Estações: "+String(data.get("equipamento")||""),
        "Principal necessidade: "+String(data.get("area")||""),
        "Referência da solicitação: "+String(result.reference||"")
      ].join("\n");
      window.location.assign("https://wa.me/554188235598?text="+encodeURIComponent(commercialMessage));
    }catch(error){
      tell((error.message||"Falha de conexão.")+
        " Se necessário, utilize o e-mail de contato exibido no rodapé.");
    }finally{send.disabled=false;}
  });
})();
