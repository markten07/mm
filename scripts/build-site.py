#!/usr/bin/env python3
"""Package only public game files; keep tests and work notes out of the website."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / '_site'
PAGES = ['index.html', '1.html', '2.html', '3.html', '4.html', 'character-book-sample.html']
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
for name in PAGES:
    shutil.copy2(ROOT / name, OUT / name)
shutil.copytree(ROOT / 'assets', OUT / 'assets')
shutil.copy2(ROOT / '.nojekyll', OUT / '.nojekyll')
files = [p for p in OUT.rglob('*') if p.is_file()]
print(f'Packaged {len(files)} files ({sum(p.stat().st_size for p in files) / 1024 / 1024:.1f} MiB) into _site/')
