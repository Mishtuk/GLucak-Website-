# Photo art direction: making Gabe's real photos look designed, not basic, not AI (Desktop designer, 2026-11-05)

Owner: "make the images you're using a little bit more visually appealing and rather not just basic, but don't make it
look like it was AI generated. Do research on art, production." Output: options in `docs/review/photo-treatments/`
(`sheet.png` shows all of them), made by `tools/photo/run.mjs`. Not yet in `DESIGN.md` or `prototype/`: the designer of
record (Laptop) and the owner pick first.

## 1. How the standouts treat live photos (rap, rock, EDM, faith-based)
| Move | What the good ones do | Source |
|---|---|---|
| **Crop and scale** | One big image, hard-cropped to the person; energy from scale, not filters. Rap campaigns crop tight and print huge; rock keeps the blur of the moment. Peterson's Sub Pop work: flash + long shutter, wide lens, close in, and "if it's all blur it just becomes meaningless". | [Billboard on Peterson](https://www.billboard.com/music/music-news/charles-petersons-iconic-grunge-photos-a-guided-tour-467441), [uDiscover interview](https://www.udiscovermusic.com/stories/charles-peterson-soundgarden-photos-interview), our `genre-and-standouts.md` |
| **Grading** | One controlled colour world per era, built from the existing light, not painted over it. Spotify's 2015 duotone system (Collins) drew its pairs from the album art and artist photos, then later moved away from one uniform photo style so each artist fits. | [Design Week](https://www.designweek.co.uk/spotify-undergoes-colourful-brand-refresh/), [Fast Company](https://www.fastcompany.com/3043547/spotifys-new-look-signals-its-identity-shift), [Eye on Design](https://eyeondesign.aiga.org/inside-the-world-of-a-spotify-brand-designer/) |
| **Duotone / tritone** | Works for heavy genres when it's one saturated colour + black (Inherited, our `standouts-visual.md`). A third stop (tritone) gives shadow depth that a flat two-stop map loses. | `standouts-visual.md` |
| **Halftone / Ben-Day** | Halftone = dots of varying size for continuous tone; Ben-Day = equal dots for flat tints. Screen prints run coarse (about 45-65 lpi), so the dot is visible and part of the look. Lichtenstein painted his own dots through a perforated screen, on an offset diagonal grid. | [Wikipedia: Halftone](https://en.wikipedia.org/wiki/Halftone), [Public Delivery](https://publicdelivery.org/what-is/ben-day-dots), [Menil](https://Menil.org/collection/objects/40082-steak), [Elegant Themes](https://elegantthemes.com/blog/design/retro-comic-book-art-using-ben-day-dots-in-web-design) |
| **Riso / screen print, misregistration** | Riso colours "miss by 1-2mm, unavoidably"; registration "will never be perfect". Designers plan for it: keep big solids under ~70%, bold type survives, thin white text doesn't; one greyscale master per ink. Over 80% of the 6000 posters sent in for *Show Posters* were screen printed: cheap, fast, the DIY default. | [Oxford Greenprint](https://oxfordgreenprint.com/home/design-for-riso/), [CCS Imaging Center](https://campus.collegeforcreativestudies.edu/imaging-center/2021/06/22/registration-trapping/), [Parka Blogs review](https://www.parkablogs.com/index.php/content/book-review-show-posters-art-and-practice-of-making-gig-posters), [Anatol](https://anatol.com/blog/the-art-of-screen-printing-gig-posters) |
| **White ink on black stock** | Single light ink on black paper is a classic band print (the current *Unknown Pleasures* screen print is white on black GF Smith stock; the 1979 sleeve was textured stock). Suits a dark site. | [Red Cross shop listing](https://giftshop.redcross.org.uk/products/joy-division-unknown-pleasures-album-sound-wave-screen-print), [Dezeen](https://www.dezeen.com/2013/09/20/design-by-peter-saville/) |
| **Film grain** | Real grain depends on the image: clusters of silver, more visible in some tones than others, mostly luminance and little colour. Uniform per-pixel noise reads as a filter. Good fakes blur noise into clumps and weight it by tone. | [RedShark News](https://www.redsharknews.com/recreating-vintage-looks-via-digital-methods-grain), [Vindral docs](https://composer.docs.vindral.com/docs/film-grain), [Albumentations](https://explore.albumentations.ai/transform/FilmGrain/docs) |
| **Xerox / punk collage** | The punk kit: collage, hand and ransom-note lettering, stencils, black-and-white Xerox, silkscreen, offset (Poynor via Print). Pettibon's Black Flag flyers set the look; many were really offset-printed. | [Print Magazine](https://www.printmag.com/post/punk-aesthetic-graphic-design), [Harvard Art Museums](https://hvrd.art/o/317817), [It's Nice That](https://itsnicethat.com/articles/black-flag-raymond-pettibon) |
| **Torn paper / tape** | Real collage edges come from tearing and scanning. Digital fakes (brush edges, tiling tape) are what make collages look templated. | [True Grit tutorial](https://truegrittexturesupply.com/blogs/news/tutorial-get-analog-digital-with-kludge), [Clip Studio tips](https://tips.clip-studio.com/en-us/articles/2065?org=1) |
| **Contact sheets** | The photographer's first look, a frame sequence with grease-pencil picks; *Contact High* tells hip-hop history through them. They read as process and honesty. | [Highsnobiety / Mannion](https://highsnobiety.com/p/jonathan-mannion-album-cover-interview), [LensCulture](https://www.lensculture.com/books/18128-contact-high-a-visual-history-of-hip-hop) |
| **Type interlocking with photos** | Name split across the photo (Inherited), photo set into the name (Kalkbrenner): our hero A / B already. Treatments must leave clean ground where type sits. | `standouts-visual.md` |
| **Faith-based lane** | NF's *HOPE* moved him into all white on the cover, a story told by wardrobe and light, not effects. Restraint again. | [Project 887](https://www.project887.com/?p=5900), [Rapzilla](https://rapzilla.com/2023-02-nf-reveals-title-release-date-artwork-tracklist-hope/) |

**Takeaway:** the strong ones commit to one process per use (a grade, *or* a print, *or* a contact sheet), they keep the
real photo's light and motion, and the imperfection comes from how that process really behaves (dot gain, misregistration,
tone-dependent grain), not from an overlay.

## 2. What makes images look AI-made, and how we avoid it
| Tell | Why it reads fake | Our rule |
|---|---|---|
| Over-smoothed, poreless skin; waxy fabric | Models erase the micro-variation cameras capture; sharp lashes beside smooth skin look pasted ([Skylum](https://blog.skylum.com/how-to-tell-if-a-photo-is-ai-generated), [Truepic](https://www.truepic.com/blog/how-to-tell-if-an-image-is-ai-generated)) | No denoise, no skin smoothing, no "enhance". The softness that's there is real motion blur and stays. |
| Fake bokeh, generic glow | A glow added everywhere, depth that doesn't match the lens | No added blur or bloom on photos. The site's one glow stays a CSS token, never baked into a photo. |
| Plastic HDR | Local tone-mapping flattens light into an even sheen | Global curves only (one curve per channel per image), so the stage light keeps its direction. |
| Symmetric, perfect textures | A tiled grain or a perfect dot grid repeats, and the eye finds the repeat | Grain is fresh noise at each file's own pixel size, clumped and tone-weighted, never tiled or resized. Halftone dots get rough edges, uneven inking, ink skips and real misregistration. |
| Upscaler hallucination | Upscalers invent detail from learned patterns, sharpen JPEG artefacts, "beautify" faces ([Let's Enhance](https://letsenhance.io/blog/all/ai-upscaling-makes-images-worse/), [Replicate](https://replicate.com/docs/guides/run/upscale-images-with-ai-models), [AI Weirdness](https://aiweirdness.com/depixellation-or-hallucination-20-06-26)) | **No AI upscaling, ever.** `load()` refuses any output larger than its source crop. The two video stills ship at native size or smaller. |
| Generative fill | Invented crowd, extended canvas, removed people | No generative fill. Crops only: if something can't be in the frame, we crop it out. |

**Ours:** real photos only. Every pixel traces to Gabe's files through a script anyone can re-run (seeded, so it's the same
pixels every time). No metadata (sharp writes none; checked, none of the 34 webps carry EXIF, ICC or XMP).

## 3. Phones and the hard rule
- **Static only.** Every treatment is a still file: no animated grain, no glitch, no shifting registration, nothing that flashes
  (Hard rule 1). The "misregistration" is fixed in the pixels.
- **Halftone and downscaling:** browsers shrinking a halftone cause moiré ([UMD notebook](https://cases.umd.edu/github/cases-umd/Photomechanical-Simulation/blob/main/halftone.ipynb), [Guigar](https://bradguigar.substack.com/p/how-to-avoid-a-moire-pattern-in-a)). So each halftone size is **screened at its own size** (the pitch is set in that file's pixels), and `sizes` must make the browser pick the file nearest the slot. Never scale a halftone below ~0.6x in CSS. Grain is also rendered per size, so it isn't resized into mush.
- **Binary plates:** the halftone files are real 1-bit plates (ink or no ink per plate), saved as lossless WebP: 3-80 KB instead of 330 KB lossy, and crisp.
- **Phones get their own crops** (A 4:5 portrait, D a tighter band, E two strips of two), not the desktop file squeezed.

## 4. People in frame (Kealey's photo)
Crops centre Gabe, the stage, the cross, the kit. **The child sits under the cross at about x 3060-3300, y 2780-3120.** Every
crop here excludes him: D stops at y 2440 (also above the profile and sunglasses of the fan front-left); E's HANDS frame stops
at x 3020. **Finding:** the current site uses the whole frame (hero A from 700px, and Push Past Fear at `40% 82%`, the raised
hands), and those raised hands sit right next to him, so he is in frame in the prototype (whole-frame hero A for certain, the Push band very likely). D or E would fix that.

## 5. The options (sheet: `docs/review/photo-treatments/sheet.png`)
| | Option | Files (KB) | What it is | Honest notes |
|---|---|---|---|---|
| A | **Era grade** (IDENTITY blue in a blue era) | `a-era-grade-1600` 66, `-800` 18, `-phone-800` 29, `-clear-1200` 59 | A colourist's grade on a tight crop of Gabe singing: percentile black/white points, an S-curve, per-channel curves steered by the era accent, blacks sunk into tinted bg, soft shoulder, tone-weighted grain. Then *printed down* (one exposure step in linear light) until the 95th-percentile pixel keeps 3.3:1 against `text`. `-clear` is unprinted, for slots with no text. | Reads as a real graded live photo; his face, glasses, mic and the orange cross on his shirt all hold, unlike the plain duotone. The era changes it only a little (the stage light dominates), which is right for a photo. The check is the 95th percentile, not the brightest pixel: keep hero A's scrims. |
| B | **Two-colour riso** | `b-riso-1000` 80, `-600` 31 | Accent plate carries the full tone at 75°, black plate only the deep shadows at 45°; the accent drum lands off-register by w/320 px with a slight skew; uneven inking changes dot size; flat paper with recycled-paper flecks. | The most "printed, by hand" of the set. At thumbnail size the dots turn to texture, which suits hero B's small slot. |
| C | **Gig-poster cut** | `c-poster-1000` 55, `-600` 22 (alpha) | One ink, coarse 45° screen, contrast pushed so the wall falls to paper; bottom edge torn (random walk, fibres, a white rim, a soft lift shadow), transparent below the tear. | Strong as a poster graphic. **His face doesn't resolve:** the head prints as a silhouette with the mic (motion-soft original, blue light). Fine for a poster, not a portrait. |
| D | **The crowd, tritone panorama** | `d-crowd-1600` 47, `-800` 15, `-phone-800` 22 | Gabe left, the pallet cross centre, the crowd as backs of heads; ink to an accent-tinted mid to warm paper; darkroom burn on the edges; grain. 4.5-4.9:1 at p95. | Moody and real. **No raised hands:** the only raised hands are beside the child, so they're cropped out; hands live in E frame 3 instead. In the red placeholder era it's dark; better in blue. |
| E | **Contact strip** | `e-contact-1600` 49, `-phone-800` 53 | Four crops of the one frame (GABE, CROSS, HANDS, KIT) as a B&W strip: rebate, sprocket holes, edge print carrying the real credit ("DSC 0832 · PHOTO ALEXANDER KEALEY"), a grease-pencil loop in the accent on frame 1. | Honest about being one frame: no fake film brand, the edge print says DSC 0832. It's B&W, so it breaks DESIGN 3b's "every live photo gets the duotone": a reviewed change. Frames are small on a phone (~190 CSS px). |
| F | **Video stills as screen prints** | `f-mccc-478` 19, `-240` 5, `f-paslier-440` 18, `-300` 9 | Two opaque inks on black stock (accent for mid-tones, paper-white for highlights, the white screen off-register), coarse dots, native size or smaller. Paslier is cropped to the stage (no fan faces). | MCCC works well: his white shirt and arm pop out of the black curtain. Paslier is busy (smoke and lights) and only works small. |

`tools/photo/eras/test-blue.json` is a stand-in blue era (marked "NOT an era") to preview the swap; its renders sit in
`photo-treatments/test-blue/`. The real era files were not touched.

## 6. Recommended pick per slot
| Slot | Pick | Why |
|---|---|---|
| **Hero A** | **A**, `a-era-grade-1600/800` + `-phone-800` | The biggest upgrade over "basic": a real photograph, graded, his face readable, under-text contrast measured. |
| **Hero B slot** | **B** riso (`b-riso-1000/600`) from 900px; **F** `f-mccc-240/478` under 900px | The small slot needs a strong graphic, not detail; riso and the MCCC print are the same family (dots, inks). |
| **Live It Loud poster** | **C** `c-poster-600/1000` | It *is* a gig poster; the torn edge sits on the poster's paper colour. |
| **Push Past Fear band** | **D** `d-crowd-1600/800` + `-phone-800` (replaces the whole-frame `40% 82%` crop) | Gabe + the cross + a crowd facing them, and it fixes the child in frame. |
| **About** | **E** contact strip, plus `a-era-grade-clear-1200` as the big photo | Shows the shoot and credits the photographer in the picture itself. |
One process per slot, so the page doesn't become a filter sampler; A and D read as photos, B, C, E and F as prints.

## 7. Upkeep per new release
- **Era colour swap = one command:** `node tools/photo/run.mjs --era src/eras/<era>.json` (also `--era=`), about 30 s;
  output lands in `photo-treatments/<era-name>/`. Every colour comes from the era file (grade tint, tritone, both inks, paper,
  grease pencil). Then copy the picked files into the build's media folder. No hand work.
- **New photo:** add its crop rectangle(s) to the option's function (5 minutes with a coordinate grid), re-run, look at the
  output. Rule: crop out any face that isn't Gabe's or a bandmate's; never a child.
- The script exits non-zero if a text-bearing image (A, D) drops under 3:1, so it can run as a check.

## 8. What would make this better (nothing installed)
| Tool / connection | Worth it? | What it needs |
|---|---|---|
| **Gabe's original video files** (MCCC, Paslier, any show footage) | **Yes, the biggest win, free.** ffmpeg (installed) pulls full-res frames at the peak moment: sharper hero B, more stills, frames for a muted hero clip later (with a flash check). | Owner asks Gabe for the files (Hard rule 4). |
| **A real photo shoot** for IDENTITY | Yes, for the era launch: press portraits and a lit live set (flash + slow shutter, the Peterson look) beat any treatment of a soft photo. | Money and a photographer: the owner's call. |
| **Real paper and print scans** | Yes, cheap: scan the paper, or riso-print A/B at a local riso studio and scan the prints for real misregistration and ink. | A flatbed or a phone scan app; a riso studio is about $20-50. |
| ImageMagick | No. sharp + ffmpeg + hand SVG did everything here. | - |
| Background removal (rembg, remove.bg) | Not now. It's ML segmentation; on a motion-blurred blue-lit photo the edges would halo or invent hair. A hand-drawn SVG mask is better for one cutout. | Revisit with sharp shoot photos. |
| AI upscaling | **Never** (section 2). | - |
