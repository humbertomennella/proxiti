from pathlib import Path
import hashlib,subprocess
root=Path(__file__).resolve().parents[1]
page=root/'index.html'
old=page.read_bytes()
expected='aae9624729777a90936982623bfbdac6990f24d2514a48b68d73a1c6512d4134'
if hashlib.sha256(old).hexdigest()==expected:
 print('Already validated')
else:
 if old.strip()!=b'@work/proxiti/index.html':raise SystemExit('Unexpected content; no overwrite')
 backup=root/'index.html.before-temporary-repair'
 if backup.exists():raise SystemExit('Backup exists; no overwrite')
 backup.write_bytes(old)
 try:
  page.write_bytes(subprocess.check_output(['git','show','bf1bf50ce6a83ef19cc6be2bfdfc9e659d11bf25:index.html'],cwd=root))
  subprocess.run(['git','apply','--check','patches/temporary-whatsapp-index.patch'],cwd=root,check=True)
  subprocess.run(['git','apply','patches/temporary-whatsapp-index.patch'],cwd=root,check=True)
  assert hashlib.sha256(page.read_bytes()).hexdigest()==expected
 except BaseException:
  page.write_bytes(old)
  raise
 print('Validated homepage reconstructed; original backed up. No commit, push or deploy.')
