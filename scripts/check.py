"""Verificações estáticas do site; não substituem validação HTML/CSS por W3C."""
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter
from urllib.parse import urlsplit, unquote
import json
import re
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

class Audit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.nodes, self.headings = [], [], []
    def handle_starttag(self, tag, attrs):
        assert len(attrs) == len(dict(attrs)), ('duplicate attributes', self.getpos())
        if tag not in VOID:
            self.stack.append(tag)
        self.nodes.append((tag, dict(attrs)))
        if re.fullmatch('h[1-6]', tag): self.headings.append(int(tag[1]))
    def handle_endtag(self, tag):
        assert self.stack and self.stack[-1] == tag, ('invalid nesting', tag, self.getpos(), self.stack[-3:])
        self.stack.pop()
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)

source = (ROOT / 'index.html').read_text()
parser = Audit()
parser.feed(source)
assert not parser.stack
assert parser.headings.count(1) == 1
assert all(b <= a + 1 for a, b in zip(parser.headings, parser.headings[1:]))
ids = [a['id'] for _, a in parser.nodes if 'id' in a]
assert len(ids) == len(set(ids)), 'duplicate IDs'
links = []
for tag, attrs in parser.nodes:
    for key in ['aria-labelledby', 'aria-describedby', 'aria-controls']:
        for target in attrs.get(key, '').split(): assert target in ids, (key, target)
    for key in ['href', 'src']:
        value = attrs.get(key, '')
        if not value: continue
        parsed = urlsplit(value)
        if value.startswith('#'): assert unquote(value[1:]) in ids, value
        elif value.startswith('/') and not value.startswith('//'): assert (ROOT / parsed.path.lstrip('/')).is_file(), value
        if parsed.scheme == 'tel': assert value == 'tel:+5541998235598', value
        if parsed.netloc == 'wa.me': assert parsed.path == '/5541998235598', value
        if parsed.scheme == 'mailto': assert parsed.path == 'contato.proxiti@gmail.com', value
        links.append(value)
    if tag == 'a': assert 'href' in attrs
schema = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', source, re.S)[1])
assert schema['@context'] == 'https://schema.org'
assert schema['@type'] == 'LocalBusiness'
assert schema['telephone'] == schema['contactPoint']['telephone'] == '+55 41 99823-5598'
assert schema['email'] == schema['contactPoint']['email'] == 'contato.proxiti@gmail.com'
assert schema['areaServed']['name'] == 'Curitiba'
assert schema['url'] == 'https://proxiti.com.br/'
assert not {'openingHours', 'openingHoursSpecification', 'priceRange', 'aggregateRating'} & schema.keys()
assert not re.search(r'\[(?:DEFINIR|INFORMAR|PRAZO|NOME|CNPJ)', source)
assert 'placeholder' not in source
assert '08:00' not in source and '18:30' not in source
assert source.count('class="process-step reveal"') == 5
for p in [ROOT / 'index.html', *ROOT.glob('*.md'), *ROOT.glob('assets/**/*.js')]:
    for match in re.finditer(r'(?<!\d)(?:\+?55\s*)?(?:\(41\)|41)\s*[\d -]{8,15}5598', p.read_text()):
        assert re.sub(r'\D', '', match[0]) in {'41998235598', '5541998235598'}, (p, match[0])
manifest = json.loads((ROOT / 'site.webmanifest').read_text())
for icon in manifest['icons']: assert (ROOT / icon['src'].lstrip('/')).is_file()
assert manifest['theme_color'] == manifest['background_color'] == '#0d1117'
assert (ROOT / 'CNAME').read_text().strip() == 'proxiti.com.br'
assert (ROOT / 'googleb36ec770e136b0a0.html').read_text().strip() == 'google-site-verification: googleb36ec770e136b0a0.html'
tree = ET.parse(ROOT / 'sitemap.xml')
urls = tree.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
assert [u.text for u in urls] == ['https://proxiti.com.br/']
assert 'Sitemap: https://proxiti.com.br/sitemap.xml' in (ROOT / 'robots.txt').read_text()
subprocess.run(['node', '--check', str(ROOT / 'assets/js/main.js')], check=True)
subprocess.run(['node', '--check', str(ROOT / 'scripts/preview.mjs')], check=True)
print(json.dumps({'result': 'PASS', 'h1': 1, 'unique_ids': len(ids), 'links_checked': len(links), 'whatsapp_links': sum('wa.me/' in s for s in links), 'telephone_links': sum(s.startswith('tel:') for s in links), 'email_links': sum(s.startswith('mailto:') for s in links), 'public_placeholders': 0, 'schema': 'JSON parse + contact/type/area consistency', 'html': 'balanced tags, duplicate attributes, IDs and headings', 'javascript': 'node --check', 'sitemap': 'XML parse + canonical URL'}, indent=2))
