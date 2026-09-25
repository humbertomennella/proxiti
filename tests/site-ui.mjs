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

assert(read("assets/css/style.css").includes('[data-theme="dark"]'));
assert(read("assets/js/main.js").includes("proxiti-theme-v3"));
for(const name of ["main.js","chat-widget.js","site-requests.js","support-thread.js"])
 new Script(read("assets/js/"+name),{filename:name});
for(const cssPath of ["assets/css/proxiti-ui.css","assets/css/site-refine.css"]){
 const css=read(cssPath);
 assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,cssPath+" possui CSS incompleto");
}
console.log("PROXITI: framework compartilhado, temas, arte de diagnóstico e scripts validados.");
