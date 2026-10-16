import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const code=readFileSync(new URL('../assets/js/site-requests.js',import.meta.url),'utf8');
const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function scenario({valid=true,privacy='on',honeypot='',fail=false,noForm=false}={}){
 let handler,redirect,prevented=false;
 const status={textContent:''},button={disabled:false};
 const values={privacidade:privacy,company_website:honeypot,empresa:'Teste & Filhos',nome:'Pessoa Fictícia',cargo:'Gestão',equipamento:'1-5',area:'Backup/Segurança',impacto:'Baixo: sem interrupção atual',email:'nao-incluir@example.invalid',telefone:'nao-incluir',sintoma:'conteúdo sigiloso não incluir'};
 const form={reportValidity:()=>valid,querySelector:()=>button,addEventListener:(event,fn)=>{assert.equal(event,'submit');handler=fn;}};
 runInNewContext(code,{
 document:{querySelector:selector=>selector==='#pre-diagnostico-form'?(noForm?null:form):status},
 FormData:class{get(key){return values[key];}},
 window:{location:{assign(url){if(fail)throw Error('blocked');redirect=url;}},get localStorage(){throw Error('storage forbidden');},get sessionStorage(){throw Error('storage forbidden');}},
 fetch(){throw Error('network forbidden');}
 });
 if(handler)handler({preventDefault(){prevented=true;}});
 return {redirect,status,button,prevented,handler};
}
const success=scenario();
assert(success.prevented);
const target=new URL(success.redirect);
assert.equal(target.origin,'https://wa.me');assert.equal(target.pathname,'/554188235598');
const message=target.searchParams.get('text');
assert(message.includes('Empresa: Teste & Filhos'));assert(message.includes('Pessoa Fictícia'));
assert(!message.includes('nao-incluir'));assert(!message.includes('sigiloso'));
assert(!message.includes('Referência'));assert(success.status.textContent.includes('Nenhum chamado foi registrado'));
assert.equal(success.button.disabled,false);
for(const options of [{valid:false},{privacy:null},{honeypot:'bot'}])assert.equal(scenario(options).redirect,undefined);
const failure=scenario({fail:true});assert(failure.status.textContent.includes('link direto'));assert.equal(failure.button.disabled,false);
assert.equal(scenario({noForm:true}).handler,undefined);
assert(!/fetch\(|localStorage|sessionStorage|PROXITI_SUPPORT/.test(code));
assert(home.includes('id="temporary-contact-notice"'));assert(home.includes('Continuar no WhatsApp'));
assert(home.includes('Abrir WhatsApp sem preencher'));assert(home.includes('<noscript>'));
assert(!home.includes('name="email"'));assert(!home.includes('name="telefone"'));assert(!home.includes('name="sintoma"'));
assert(!home.includes('A solicitação será registrada'));
console.log('PASS: fluxo válido, validação, consentimento, honeypot, falha de navegação, ausência de formulário, minimização, links alternativos e ausência de rede/armazenamento.');
