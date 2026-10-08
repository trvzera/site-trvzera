"""Rebuild the Latin WOFF2 files, preserving SF Pro outlines and license metadata.

Install fonttools[woff] in a Python virtual environment before running this file.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

unicodes = "U+0020-00FF,U+0300-036F,U+2000-206F,U+20AC,U+2190-21FF"
for weight in ("regular", "bold"):
    source = Path(f"fonts/SFPRODISPLAY{weight.upper()}.OTF")
    target = Path(f"fonts/sf-pro-display-{weight}.woff2")
    subset.main([
        str(source), f"--unicodes={unicodes}", "--flavor=woff2", f"--output-file={target}",
        "--layout-features=kern,liga,clig,calt", "--name-IDs=0,1,2,3,4,5,6,8,9,11,13,14",
        "--name-languages=*", "--notdef-glyph", "--notdef-outline", "--recommended-glyphs",
    ])
    text = Path("index.html").read_text() + "".join(p.read_text() for p in Path("js").glob("*.js"))
    missing = set(map(ord, text)) & set(TTFont(source).getBestCmap()) - set(TTFont(target).getBestCmap())
    if missing:
        raise ValueError(f"Extend the subset to preserve these characters: {sorted(missing)}")
    print(f"{target}: {target.stat().st_size:,} bytes; used characters preserved")
