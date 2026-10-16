(() => {
  "use strict";
  const form=document.querySelector("#pre-diagnostico-form");
  if(!form)return;
  const status=document.querySelector("#triage-status");
  const tell=message=>{if(status)status.textContent=message;};
  // Mitigação temporária: não chama o Supabase, não armazena dados nem cria chamado.
  const send=form.querySelector('button[type="submit"]');
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const data=new FormData(form);
    if(String(data.get("company_website")||"").trim())return;
    if(data.get("privacidade")!=="on"){
      tell("Leia a Política de Privacidade e confirme sua autorização antes de continuar.");
      return;
    }
    const value=(name,limit)=>String(data.get(name)||"").trim().slice(0,limit);
    const message=[
      "Olá! Quero conversar sobre uma avaliação inicial de TI da PROXITI.",
      "Empresa: "+value("empresa",160),
      "Responsável: "+value("nome",120)+" ("+value("cargo",100)+")",
      "Estações: "+value("equipamento",20),
      "Principal necessidade: "+value("area",100),
      "Impacto: "+value("impacto",100),
      "Gostaria de combinar um horário com a equipe."
    ].join("\n");
    if(send)send.disabled=true;
    tell("Abrindo o WhatsApp com um resumo para você revisar e enviar. Nenhum chamado foi registrado; o horário depende de confirmação da equipe.");
    try{
      window.location.assign("https://wa.me/554188235598?text="+encodeURIComponent(message));
    }catch{
      tell("Não foi possível abrir o WhatsApp. Use o link direto abaixo ou o e-mail de contato. Nenhum chamado foi registrado.");
    }finally{if(send)send.disabled=false;}
  });
})();
