import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {Script} from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const pages=["404.html","index.html","servicos/index.html","produtos/index.html",
 "produtos/pc-seguro/index.html","seja-parceiro/index.html","trabalhe-conosco/index.html","atendimento/index.html",
 "privacidade/index.html","termos/index.html","contato-seguranca/index.html"];
for(const page of pages)assert(read(page).includes("/assets/css/proxiti-ui.css"),
  page+" não carrega o framework compartilhado");
for(const path of ["assets/css/style.css","assets/css/proxiti-ui.css","assets/css/site-refine.css",
  "assets/illustrations/diagnostico-proxiti.svg"])
 assert(existsSync(new URL("../"+path,import.meta.url)),path+" ausente");
const home=read("index.html");
assert(home.includes("/assets/illustrations/diagnostico-proxiti.svg"));
assert(!home.includes("/assets/illustrations/hero-operations.svg"));
assert(!home.includes('class="hero-note"'));
assert.equal((home.match(/class="entry-card reveal px-card"/g)||[]).length,3);
assert(home.includes('class="hero-actions px-cluster"'));
for(const name of ["parcerias-rede.svg","parcerias-modelo.svg","parcerias-capacitacao.svg","parcerias-ingresso.svg"]){
 const art=read("assets/illustrations/"+name);
 assert(!art.includes("M0 110H1100M0 220H1100"),name+" ainda tem grade decorativa");
}

/* Contratos editoriais: ingresso inclusivo, marca UNIPROXITI e transparência de etapas. */
const partner=read("seja-parceiro/index.html");
const legacy=read("trabalhe-conosco/index.html");
const sitemap=read("sitemap.xml");
for(const required of [
  "Seja Parceiro",
  "Sua história com tecnologia",
  "Quem começa ou já atua em TI",
  "Ter CNPJ não é requisito para enviar sua apresentação",
  "ainda atua como pessoa física",
  "Estou começando em TI. Posso participar?",
  "UNIPROXITI",
  "Seu laboratório também conta uma história",
  "Vamos nos conhecer?",
  "Nós organizamos a solicitação",
  "Cada possível serviço é conversado e combinado antes do início",
  "não garante credenciamento, renda ou chamados",
  "mailto:contato.proxiti@gmail.com?subject=Quero%20ser%20parceiro%20PROXITI"
])assert(partner.includes(required),"Seja Parceiro: informação ausente: "+required);
assert(!/(?:UniProxiti|uniProxiti)/.test(partner)&&
  !/técnico parceiro PJ|CNPJ ativo|parceria PJ|prestação de serviços entre pessoas jurídicas/i.test(partner),
  "Seja Parceiro: comunicação incorretamente restritiva ou grafia antiga.");
assert(partner.includes('data-proxiti-content="partner.panel.intro.v4"')&&
  !partner.includes('data-proxiti-content="partner.panel.intro.v3"'),
  "Conteúdo antigo do CMS poderia substituir a redação inclusiva.");
assert(partner.includes('href="https://proxiti.com.br/seja-parceiro/"')&&
  partner.includes('content="https://proxiti.com.br/seja-parceiro/"'),
  "Seja Parceiro: URLs canônicas ou sociais inconsistentes.");
assert(legacy.includes('http-equiv="refresh" content="0; url=/seja-parceiro/"')&&
  legacy.includes('content="noindex, follow"')&&
  legacy.includes('href="/seja-parceiro/"'),
  "Rota anterior não direciona para Seja Parceiro.");
assert(sitemap.includes("https://proxiti.com.br/seja-parceiro/")&&
  !sitemap.includes("https://proxiti.com.br/trabalhe-conosco/"),
  "Sitemap não acompanha a nova rota.");
for(const page of ["index.html","servicos/index.html","produtos/index.html",
  "produtos/pc-seguro/index.html","privacidade/index.html",
  "termos/index.html","contato-seguranca/index.html","seja-parceiro/index.html"]){
  const html=read(page);
  assert(html.includes('href="/seja-parceiro/"')&&
    !html.includes('href="/trabalhe-conosco/"')&&
    !html.includes("Trabalhe Conosco"),
    page+": rodapé ainda contém a rota ou o rótulo anterior.");
}
for(const match of partner.matchAll(/href="#([a-z][a-z0-9-]+)"/g))
 assert(partner.includes('id="'+match[1]+'"'),
   "Seja Parceiro: âncora sem destino: "+match[1]);
for(const match of partner.matchAll(/src="\/(assets\/illustrations\/[^"]+)"/g))
 assert(existsSync(new URL("../"+match[1],import.meta.url)),
   "Seja Parceiro: ilustração inexistente: "+match[1]);
for(const required of ["modelo-de-parceria","apoio-ao-tecnico","painel-de-atendimento",
  "ingresso-parceiros","duvidas-parceria","contato-profissional"])
 assert(partner.includes('id="'+required+'"'),
   "Seja Parceiro: seção ausente: "+required);
for(const tag of ["main","section","article","details"]){
 assert.equal((partner.match(new RegExp("<"+tag+"\\b","g"))||[]).length,
  (partner.match(new RegExp("</"+tag+">","g"))||[]).length,
  "Seja Parceiro: elementos incompletos: "+tag);
}
assert(read("assets/css/style.css").includes('[data-theme="dark"]'));
assert(read("assets/js/main.js").includes("proxiti-theme-v3"));
for(const name of ["main.js","chat-widget.js","site-requests.js","support-thread.js"])
 new Script(read("assets/js/"+name),{filename:name});
for(const cssPath of ["assets/css/proxiti-ui.css","assets/css/site-refine.css"]){
 const css=read(cssPath);
 assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,cssPath+" possui CSS incompleto");
}
console.log("PROXITI: framework compartilhado, temas, arte de diagnóstico e scripts validados.");
