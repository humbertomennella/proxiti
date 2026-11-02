import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const code=readFileSync(new URL('../assets/js/site-requests.js',import.meta.url),'utf8');
const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function scenario({valid=true,privacy='on',honeypot='',noForm=false}={}){
 let handler,redirect,prevented=false;
 const status={textContent:''},button={disabled:false};
 const values={privacidade:privacy,company_website:honeypot,empresa:'Empresa de Teste',nome:'Pessoa de Teste',cargo:'Gestão',equipamento:'1-5',area:'Backup/Segurança',impacto:'Baixo: sem interrupção atual',email:'nao-incluir@example.invalid',telefone:'nao-incluir',sintoma:'não incluir'};
 const form={reportValidity:()=>valid,querySelector:()=>button,addEventListener:(name,fn)=>{assert.equal(name,'submit');handler=fn;}};
 runInNewContext(code,{document:{querySelector:sel=>sel==='#pre-diagnostico-form'?(noForm?null:form):status},FormData:class{get(name){return values[name];}},window:{location:{assign(url){redirect=url;}}},fetch(){throw Error('network forbidden');}});
 if(handler)handler({preventDefault(){prevented=true;}});
 return {redirect,status,button,prevented,handler};
}
const ok=scenario();assert(ok.prevented);
const url=new URL(ok.redirect);assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/554188235598');
const msg=url.searchParams.get('text');assert(msg.includes('Empresa: Empresa de Teste'));assert(msg.includes('Pessoa de Teste'));assert(!msg.includes('nao-incluir'));assert(!msg.includes('não incluir'));
assert(ok.status.textContent.includes('Nenhum chamado foi registrado'));
for(const opts of [{valid:false},{privacy:null},{honeypot:'bot'}])assert.equal(scenario(opts).redirect,undefined);
assert.equal(scenario({noForm:true}).handler,undefined);
assert(!/fetch\s*\(|localStorage|sessionStorage|PROXITI_SUPPORT/.test(code));
assert(home.includes('id="temporary-contact-notice"'));assert(home.includes('Preparar mensagem no WhatsApp'));
assert(home.includes('https://wa.me/554188235598'));assert(home.includes('mailto:contato.proxiti@gmail.com'));
assert(!home.includes('name="email"'));assert(!home.includes('name="telefone"'));assert(!home.includes('name="sintoma"'));
console.log('PASS: WhatsApp, validação, consentimento, honeypot, minimização e ausência de backend/armazenamento.');
