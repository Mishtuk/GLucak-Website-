from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
F='V:/GLucakWebsite/prototype/fonts/'
f=TTFont(F+'big-shoulders-display-900.woff2'); f.flavor=None; f.save('fonts/bsd900.ttf')
for w in (400,700):
    v=TTFont(F+'atkinson-hyperlegible-next-wght.woff2'); v.flavor=None
    instancer.instantiateVariableFont(v,{'wght':w}).save(f'fonts/ahn{w}.ttf')
print('ok')
