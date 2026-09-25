(() => {
  "use strict";
  const targets=[...document.querySelectorAll("[data-proxiti-content]")];
  if(!targets.length||!window.supabase?.createClient||!window.PROXITI_SUPPORT)return;
  const config=window.PROXITI_SUPPORT;
  const client=window.supabase.createClient(config.url,config.publishableKey,{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });
  const keys=[...new Set(targets.map(t=>t.dataset.proxitiContent))];
  client.from("site_content").select("content_key,value").eq("is_published",true)
    .in("content_key",keys).then(({data,error})=>{
      if(error||!data)return;
      const values=new Map(data.map(row=>[row.content_key,row.value]));
      for(const node of targets)if(values.has(node.dataset.proxitiContent))
        node.textContent=values.get(node.dataset.proxitiContent);
    }).catch(()=>{/* mantém o texto estático se o serviço estiver indisponível */});
})();
