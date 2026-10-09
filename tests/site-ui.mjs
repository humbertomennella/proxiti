import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {Script} from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const pages=["404.html","index.html","servicos/index.html","seja-parceiro/index.html","trabalhe-conosco/index.html","atendimento/index.html",
 "privacidade/index.html","termos/index.html","contato-seguranca/index.html"];
for(const page of pages)assert(read(page).includes("/assets/css/proxiti-ui.css"),
  page+" não carrega o framework compartilhado");
for(const path of ["assets/css/style.css","assets/css/proxiti-ui.css","assets/css/site-refine.css",
  "assets/illustrations/hero-operations.svg"])
 assert(existsSync(new URL("../"+path,import.meta.url)),path+" ausente");
const home=read("index.html");
assert(home.includes("/assets/illustrations/hero-operations.svg"));
assert(!home.includes("/assets/illustrations/diagnostico-proxiti.svg"));
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
  "Perto de quem precisa.",
  "Ao lado de quem resolve.",
  "não exigimos CNPJ para receber seu primeiro contato",
  "quem atua como pessoa física",
  "Estou começando em TI. Posso me apresentar?",
  "UNIPROXITI",
  "Projeto pessoal também é experiência",
  "Quem dá suporte também merece suporte.",
  "Consultar é melhor do que chutar",
  "Parceria sem adivinhação",
  "Um atendimento claro para o cliente. Um combinado claro para você.",
  "Vamos conversar?",
  "A PROXITI recebe a solicitação",
  "As condições de cada eventual serviço são definidas antes de começar",
  "O contato não garante credenciamento, remuneração ou oferta de serviços",
  "mailto:contato.proxiti@gmail.com?subject=Quero%20ser%20parceiro%20PROXITI"
])assert(partner.includes(required),"Seja Parceiro: informação ausente: "+required);
assert(!/(?:UniProxiti|uniProxiti)/.test(partner)&&
  !/técnico parceiro PJ|CNPJ ativo|parceria PJ|prestação de serviços entre pessoas jurídicas/i.test(partner),
  "Seja Parceiro: comunicação incorretamente restritiva ou grafia antiga.");
assert(partner.includes('data-proxiti-content="partner.panel.intro.v5"')&&
  !partner.includes('data-proxiti-content="partner.panel.intro.v4"'),
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
for(const page of ["index.html","servicos/index.html","privacidade/index.html",
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
/* Contratos comerciais: o site público é exclusivamente B2B e a captura exige dados da empresa. */
assert(home.includes("Gestão de TI, Suporte e Segurança para Micro e Pequenas Empresas"));
assert(home.includes("A TI da sua empresa sem interrupções, riscos ou custos de equipe interna."));
assert(home.includes("Solicitar Checkup Gratuito de Vulnerabilidade"));
assert(home.includes("Falar com um Especialista no WhatsApp"));
assert(home.includes('id="planos"')&&home.includes("Plano Essencial")===false);
for(const required of ["Essencial","Profissional","Enterprise","R$ 500/mês","Escritórios de Contabilidade e Advocacia","Clínicas de Saúde e Laboratórios","Corretoras de Seguros e Financeiras","Serviços e Comércio Geral","name=\"empresa\"","name=\"cargo\"","1-5","6-15","16-30","30+","Backup/Segurança","Computadores lentos/travando","Sem suporte técnico rápido","Quero organizar minha infraestrutura"])
 assert(home.includes(required),"Página inicial: conteúdo B2B ausente: "+required);
assert(!/Residências|Residencial|uso pessoal|atendimento em domicílio/i.test(home),"Página inicial ainda apresenta oferta B2C/residencial.");
assert(!home.includes("/produtos/"),"Página inicial ainda aponta para produtos B2C.");
assert(!sitemap.includes("/produtos/"),"Sitemap ainda indexa páginas B2C.");
const requests=read("assets/js/site-requests.js");
new Script(requests,{filename:"site-requests.js"});
assert(requests.includes('String(data.get("empresa")||"Não informada")'));
assert(requests.includes('String(data.get("cargo")||"Não informado")'));
assert(requests.includes("Estações de trabalho"));
console.log("PROXITI: temas, scripts, formulário B2B, planos, SEO e remoção de rotas B2C validados.");


/* Checkup B2B: CTA abre modal real e o formulário mantém confirmação honesta de agenda. */
assert(home.includes('data-open-checkup'));
assert(home.includes('<dialog class="checkup-modal" id="checkup-modal"'));
assert(home.includes('id="checkup-modal-content"'));
assert(home.includes('A equipe confirmará o horário pelo WhatsApp') || home.includes('confirmará o horário pelo WhatsApp'));
const checkupScript=read("assets/js/checkup-modal.js");
new Script(checkupScript,{filename:"checkup-modal.js"});
assert(checkupScript.includes("showModal()")&&checkupScript.includes("close()"));
const services=read("servicos/index.html");
assert(services.includes("<h2>Redes e conectividade empresarial</h2>"));
assert(services.includes("<h2>Consultoria, infraestrutura em nuvem e segurança preventiva</h2>"));

/* Limpeza das rotas B2C em páginas institucionais. */
for(const page of ["404.html","privacidade/index.html","termos/index.html","contato-seguranca/index.html","seja-parceiro/index.html"]){
 const html=read(page);
 assert(!html.includes('href="/produtos/"'),page+": link para catálogo B2C removido do site público.");
}
assert(!read("README.md").includes("`/produtos/` — catálogo de produtos digitais."));

/* Os scripts e visuais do antigo produto B2C não devem voltar a ser referenciados. */
assert(!read("assets/js/main.js").includes("data-checkout"));
assert(!read("assets/css/style.css").includes("pc-mini-gallery"));
assert(!home.includes("/assets/products/"));

/* Consistência dos pilares comerciais: títulos e descrições não podem divergir. */
const servicePanels=home.split('<article class="service-panel reveal">').slice(1).map(part=>part.split("</article>")[0]);
assert.equal(servicePanels.length,4,"A home deve apresentar quatro pilares de serviço.");
assert(servicePanels[1].includes("Segurança &amp; Proteção contra Ransomware"));
assert(servicePanels[1].includes("phishing")&&servicePanels[1].includes("autenticação"));
assert(servicePanels[2].includes("Manutenção Preventiva &amp; Monitoramento"));
assert(servicePanels[2].includes("Revisões periódicas")&&servicePanels[2].includes("Rotina preventiva"));
assert(servicePanels[3].includes("Consultoria e Infraestrutura em Nuvem"));
assert(servicePanels[3].includes("servidores")&&servicePanels[3].includes("serviços em nuvem"));
assert(services.includes("<h2>Backup, recuperação e organização de acessos</h2>"));
assert(!read("404.html").includes("catálogo de produtos"));

/* SEO institucional e remoção de textos B2C históricos. */
for(const [page,url] of [
 ["privacidade/index.html","https://proxiti.com.br/privacidade/"],
 ["termos/index.html","https://proxiti.com.br/termos/"],
 ["contato-seguranca/index.html","https://proxiti.com.br/contato-seguranca/"],
 ["servicos/index.html","https://proxiti.com.br/servicos/"]
]){
 const html=read(page);
 assert(html.includes('rel="canonical" href="'+url+'"'),page+": canonical ausente");
 assert(html.includes('property="og:title"')&&html.includes('property="og:description"')&&html.includes('property="og:image"'),page+": metadados sociais incompletos");
 assert(html.includes('name="twitter:card"'),page+": Twitter card ausente");
}
assert(!read("termos/index.html").includes("Produtos digitais"));
assert(!read("404.html").includes("catálogo de produtos"));
assert(read("sitemap.xml").includes("<lastmod>2026-10-09</lastmod>"));
