# stdin: JSON list of {font, text, size, ls(em)} -> stdout JSON list of {d, w}. Baseline at y=0. No kerning (GPOS ignored).
import sys, json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
cache={}
out=[]
for r in json.loads(sys.stdin.buffer.read().decode("utf-8")):
    f=cache.setdefault(r['font'], TTFont(r['font']))
    gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm; s=r['size']/upm
    pen=SVGPathPen(gs, ntos=lambda v: ('%.1f'%v).rstrip('0').rstrip('.')); x=0
    for ch in r['text']:
        g=cmap.get(ord(ch)) or '.notdef'
        gs[g].draw(TransformPen(pen,(s,0,0,-s,x,0)))
        x+=gs[g].width*s + r.get('ls',0)*r['size']
    out.append({'d':pen.getCommands(),'w':x - r.get('ls',0)*r['size']})
json.dump(out,sys.stdout)
