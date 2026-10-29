"""Optional non-browser renderer for the four HTML/CSS source screenshots.

Requires WeasyPrint 70 and Poppler's pdftoppm. Browser screenshots should still
use render-samples.mjs / shot.mjs. Runtime app has no Python dependency.
On Homebrew macOS: DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib python render-samples.py
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import math
import subprocess
from weasyprint import HTML, CSS

root = Path(__file__).resolve().parent
manifest = []
with TemporaryDirectory(prefix='shape-samples-') as tmp:
    for n in range(1, 5):
        document = HTML(filename=str(root / 'samples' / f'message-{n}.html')).render(
            stylesheets=[CSS(string='@page {size:760px 520px; margin:0} body {width:760px;height:520px}')]
        )
        if len(document.pages) != 1:
            raise ValueError(f'Sample {n} must fit on one page')
        pdf = Path(tmp) / f'message-{n}.pdf'
        document.write_pdf(pdf)
        subprocess.run(['pdftoppm', '-png', '-singlefile', '-r', '96', str(pdf),
                        str(root / 'samples' / f'message-{n}')], check=True)
        boxes, seen = [], set()
        # WeasyPrint layout boxes supply the exact positions for this renderer.
        # The Playwright renderer independently refreshes them for Chromium.
        for box in document.pages[0]._page_box.descendants():
            element = box.element
            kind = element.get('data-personal') if element is not None else None
            if not kind or kind in seen:
                continue
            seen.add(kind)
            x, y = box.border_box_x(), box.border_box_y()
            right, bottom = x + box.border_width(), y + box.border_height()
            boxes.append(dict(type=kind, x=math.floor(x), y=math.floor(y),
                              width=math.ceil(right)-math.floor(x), height=math.ceil(bottom)-math.floor(y)))
        manifest.append(dict(scene=n, file=f'samples/message-{n}.png', width=760,
                             height=520, personalDetails=boxes, fictional=True))
(root / 'samples.json').write_text(json.dumps(manifest, indent=2) + '\n')
data_file = root / 'data.js'
data = data_file.read_text().split('\nwindow.SHAPE_SAMPLES = ')[0]
data_file.write_text(data + '\nwindow.SHAPE_SAMPLES = ' + json.dumps(manifest, indent=2) + ';\n')
print('Rendered 4 HTML/CSS PNGs and synchronized privacy coordinates.')
