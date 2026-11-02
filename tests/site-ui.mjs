import assert from "node:assert/strict";
import {readFileSync,existsSync,readdirSync,statSync} from "node:fs";
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
assert(home.includes("Mais controle sobre a TI da sua empresa, com escopo claro e prevenção de falhas."));
assert(!home.includes("sem interrupções, riscos ou custos de equipe interna"));
assert(home.includes("Solicitar avaliação inicial de TI"));
assert(home.includes("Falar com um Especialista no WhatsApp"));
assert(!/20\s*minutos?|gratuita de 20/i.test(home), "A avaliação não pode prometer duração fixa ou gratuidade não aprovada.");
assert(!home.includes("Solicitar avaliação inicial gratuita"), "O CTA não pode anunciar gratuidade sem aprovação comercial.");
assert(home.includes('<h2 id="checkup-modal-title">Solicite uma avaliação inicial para sua empresa</h2>'),
  "O modal deve refletir a avaliação empresarial sem gratuidade ou duração fixa.");
assert(home.includes('<button class="button button-accent" type="submit">Preparar mensagem no WhatsApp</button>'),
  "O formulário deve usar o CTA temporário de contato pelo WhatsApp.");
assert(home.includes('id="temporary-contact-notice"'));
assert(home.includes('mailto:contato.proxiti@gmail.com'));
assert(!home.includes("Solicitar avaliação inicial gratuita (20 min)"));
const requests = read("assets/js/site-requests.js");
assert(!/avaliação inicial gratuita|20\s*minutos?/i.test(requests), "A mensagem de WhatsApp não pode prometer gratuidade ou duração não aprovada.");
assert(requests.includes('window.location.assign("https://wa.me/554188235598?text="+encodeURIComponent(message))'));
assert(requests.includes('value("empresa",160)')&&requests.includes('value("equipamento",20)')&&requests.includes('value("area",100)'));
assert(!/fetch\s*\(|localStorage|sessionStorage|PROXITI_SUPPORT/.test(requests),
  "O fluxo temporário não pode acessar backend ou armazenamento local.");
assert(home.includes('href="/atendimento/?chat=1" data-open-chat'), "O botão de chat precisa ter um destino funcional sem JavaScript.");
assert(home.includes('id="planos"')&&home.includes("Plano Essencial")===false);
for(const required of ['Essencial','Profissional','Enterprise','Planos e valores são definidos após avaliação do ambiente','Escritórios de Contabilidade e Advocacia','Clínicas de Saúde e Laboratórios','Corretoras de Seguros e Financeiras','Serviços e Comércio Geral','name="empresa"','name="cargo"','1-5','6-15','16-30','30+','Backup/Segurança','Computadores lentos/travando','Sem suporte técnico rápido','Quero organizar minha infraestrutura'])
 assert(home.includes(required),"Página inicial: conteúdo B2B ausente: "+required);
assert(!/Residências|Residencial|uso pessoal|atendimento em domicílio/i.test(home),"Página inicial ainda apresenta oferta B2C/residencial.");
assert(!home.includes("/produtos/"),"Página inicial ainda aponta para produtos B2C.");
assert(!sitemap.includes("/produtos/"),"Sitemap ainda indexa páginas B2C.");
new Script(requests,{filename:"site-requests.js"});
assert(requests.includes('value("empresa",160)'));
assert(requests.includes('value("cargo",100)'));
assert(requests.includes('"Estações: "+value("equipamento",20)'));
/* Varredura editorial de todas as páginas HTML publicáveis. */
function htmlFiles(dir="."){
  return readdirSync(new URL("../"+dir+"/",import.meta.url))
    .flatMap(name=>{
      const path=(dir==="."?"":dir+"/")+name;
      const full=new URL("../"+path,import.meta.url);
      if(statSync(full).isDirectory())return name.startsWith(".")||name==="node_modules"?[]:htmlFiles(path);
      return path.endsWith(".html")?[path]:[];
    });
}
for(const page of htmlFiles()){
  const html=read(page);
  assert(!/suporte\s+ilimitado|preço\s+fixo\s+sem\s+escopo|avaliação\s+inicial\s+gratuita|gratuita\s+de\s+20|20\s*minutos?/i.test(html),
    page+": promessa comercial antiga ou não aprovada.");
}
console.log("PROXITI: temas, scripts, formulário B2B, planos, SEO e remoção de rotas B2C validados.");


/* Checkup B2B: CTA abre modal real e o formulário mantém confirmação honesta de agenda. */
assert(home.includes('data-open-checkup'));
assert(home.includes('<dialog class="checkup-modal" id="checkup-modal"'));
assert(home.includes('id="checkup-modal-content"'));
assert(home.includes('a equipe combinará o horário pelo WhatsApp') || home.includes('combinará o horário pelo WhatsApp'));
assert(home.includes('não é uma varredura automatizada, pentest ou laudo de segurança'));
const checkupScript=read("assets/js/checkup-modal.js");
new Script(checkupScript,{filename:"checkup-modal.js"});
assert(!/fetch\s*\(|localStorage|sessionStorage|PROXITI_SUPPORT/.test(requests),
  "A contingência WhatsApp não pode criar tickets, chamar Supabase ou armazenar dados.");
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
const card=read("cartao/index.html");
assert(card.includes("Gestão de TI para pequenas empresas"));
assert(card.includes("Atendimento para micro e pequenas empresas."));
assert(!/residências|em casa ou no seu negócio|atendimento para residências/i.test(card), "Cartão público ainda comunica oferta B2C.");

/* Os scripts e visuais do antigo produto B2C não devem voltar a ser referenciados. */
assert(!read("assets/js/main.js").includes("data-checkout"));
assert(!read("assets/css/style.css").includes("pc-mini-gallery"));
assert(!home.includes("/assets/products/"));

/* Consistência dos pilares comerciais: títulos e descrições não podem divergir. */
const servicePanels=home.split('<article class="service-panel reveal">').slice(1).map(part=>part.split("</article>")[0]);
assert.equal(servicePanels.length,4,"A home deve apresentar quatro pilares de serviço.");
assert(servicePanels[1].includes("Segurança &amp; Proteção contra Ransomware"));
assert(home.includes("Monitoramento não está incluído por padrão."));
assert(!home.includes("Backup gerenciado e rotina de recuperação."));
assert(!home.includes("R$ 500/mês"));
assert(servicePanels[1].includes("phishing")&&servicePanels[1].includes("autenticação"));
assert(servicePanels[2].includes("Manutenção Preventiva e Revisões conforme Escopo"));
assert(servicePanels[2].includes("Revisões preventivas conforme o contrato")&&servicePanels[2].includes("Monitoramento não está incluído por padrão."));
assert(servicePanels[3].includes("Consultoria e Infraestrutura em Nuvem"));
assert(servicePanels[3].includes("servidores")&&servicePanels[3].includes("serviços em nuvem"));
assert(services.includes("<h2>Backup, recuperação e organização de acessos</h2>"));
assert(services.includes("Avaliação e organização de cópias de segurança, possibilidades de recuperação e acessos essenciais"));
assert(!services.includes("<li>Quedas de conexão, lentidão ou cobertura inadequada no ambiente empresarial.</li><li>Quedas, oscilação ou dispositivos que perdem conexão.</li>"));
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
assert(sitemap.includes("<loc>https://proxiti.com.br/</loc><lastmod>2026-11-01</lastmod>"),"Sitemap: data da home deve refletir a revisão comercial de 01/11/2026.");
assert(sitemap.includes("<loc>https://proxiti.com.br/servicos/</loc><lastmod>2026-11-01</lastmod>"),"Sitemap: data da página de serviços deve refletir a revisão comercial de 01/11/2026.");
assert(!services.includes("R$ 500/mês"),"Serviços ainda publica preço mensal não aprovado.");
assert(!services.includes("suporte remoto e presencial ágil"),"Serviços ainda promete agilidade sem prazo ou capacidade aprovados.");
assert(!services.includes("backup gerenciado"),"Serviços ainda promete backup gerenciado sem escopo aprovado.");


/* Regression checks for the November 2026 premium visual redesign. */
const visualCss=read("assets/css/visual-consistency.css");
assert(home.includes('href="/assets/css/visual-consistency.css"'),
  "Homepage must load the premium visual stylesheet.");
assert(home.includes('fonts.googleapis.com/css2?family=Inter')&&home.includes('family=Manrope'),
  "Homepage must load the new Inter + Manrope typography.");
assert.equal((visualCss.match(/{/g)||[]).length,(visualCss.match(/}/g)||[]).length,
  "Premium visual stylesheet has unbalanced CSS blocks.");
for(const required of [
  '--px-font-display:"Manrope"',
  '.site-header{height:82px',
  '.hero{padding-top:calc(var(--header-h) + clamp(76px',
  '.scenario-card{grid-template-columns:minmax(0,1fr) minmax(0,.92fr)',
  '.entry-card:hover{transform:translateY(-6px)',
  '@media(max-width:1120px)',
  '@media(max-width:860px)',
  '@media(max-width:660px)',
  'prefers-reduced-motion:reduce'
]) assert(visualCss.includes(required),
  "Premium visual stylesheet is missing a required design/responsive rule: "+required);
for(const [path,alt] of [
  ["assets/illustrations/scenario-performance.svg","Diagnóstico de estações de trabalho"],
  ["assets/illustrations/scenario-network.svg","Infraestrutura de rede empresarial"],
  ["assets/illustrations/scenario-security.svg","Proteção de dados, backup e acessos"]
]){
  const art=read(path);
  assert(art.includes('<svg')&&art.includes('<title')&&art.includes(alt),
    path+" must be a detailed, accessible SVG illustration.");
  assert(art.includes('viewBox="0 0 920 620"'),
    path+" must use the updated carousel artwork dimensions.");
}
