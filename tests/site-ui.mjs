import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {Script} from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const pages=["404.html","index.html","servicos/index.html","produtos/index.html",
 "produtos/pc-seguro/index.html","trabalhe-conosco/index.html","atendimento/index.html",
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

/* Contratos editoriais: recrutamento PJ sem prometer vagas ou condições ainda indefinidas. */
const partner=read("trabalhe-conosco/index.html");
for(const required of [
  "Sua experiência técnica,",
  "técnico parceiro PJ (MEI ou ME)",
  "O parceiro presta serviços à PROXITI",
  "A PROXITI cuida da contratação.",
  "Aceita ou recusa",
  "certificação interna UniProxiti",
  "não um anúncio de vaga de emprego",
  "O contato não garante credenciamento, faturamento ou quantidade de chamados",
  "mailto:contato.proxiti@gmail.com?subject=Parceria%20t%C3%A9cnica%20PJ%20-%20PROXITI"
])assert(partner.includes(required),"Parcerias: informação obrigatória ausente: "+required);
assert(partner.includes('data-proxiti-content="partner.panel.intro.v2"')&&
  !partner.includes('data-proxiti-content="partner.panel.intro"'),
  "O CMS anterior poderia substituir o posicionamento atualizado da parceria.");
for(const match of partner.matchAll(/href="#([a-z][a-z0-9-]+)"/g))
 assert(partner.includes('id="'+match[1]+'"'),"Parcerias: âncora sem destino: "+match[1]);
for(const match of partner.matchAll(/src="\/(assets\/illustrations\/[^"]+)"/g))
 assert(existsSync(new URL("../"+match[1],import.meta.url)),
   "Parcerias: arte referenciada não existe: "+match[1]);
for(const required of ["modelo-de-parceria","apoio-ao-tecnico","painel-de-atendimento",
  "ingresso-parceiros","duvidas-parceria","contato-profissional"])
 assert(partner.includes('id="'+required+'"'),"Parcerias: seção ausente: "+required);
assert.equal((partner.match(/<main\b/g)||[]).length,(partner.match(/<\/main>/g)||[]).length,
  "Parcerias: elemento principal incompleto");
assert.equal((partner.match(/<details\b/g)||[]).length,(partner.match(/<\/details>/g)||[]).length,
  "Parcerias: respostas frequentes incompletas");
assert(read("assets/css/style.css").includes('[data-theme="dark"]'));
assert(read("assets/js/main.js").includes("proxiti-theme-v3"));
for(const name of ["main.js","chat-widget.js","site-requests.js","support-thread.js"])
 new Script(read("assets/js/"+name),{filename:name});
for(const cssPath of ["assets/css/proxiti-ui.css","assets/css/site-refine.css"]){
 const css=read(cssPath);
 assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,cssPath+" possui CSS incompleto");
}
console.log("PROXITI: framework compartilhado, temas, arte de diagnóstico e scripts validados.");
