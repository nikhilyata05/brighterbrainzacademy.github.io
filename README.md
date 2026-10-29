# Brighter Brainz Academy website

A static website (HTML, CSS and JavaScript only, no build step). It works on GitHub Pages as-is.

## Project structure

```
index.html              Page content and structure
css/styles.css          All styling (colour and font tokens at the top)
js/config.js            Settings: WhatsApp number, Instagram strip, YouTube videos
js/gallery-data.js      The photo gallery list (one line per photo)
js/main.js              Interactions and animations
assets/img/             Logo, team portraits, gallery photos
tools/add_photo.py      Optional helper that resizes a photo for the gallery
.nojekyll               Tells GitHub Pages to serve files exactly as they are
```

## Run it locally

```bash
cd brighter-brainz-academy
python3 -m http.server 8000     # then visit http://localhost:8000
```

## Deploy on GitHub Pages

1. Create a repository (for example `brighter-brainz-academy`) and upload everything in this folder to its root, so `index.html` is at the top level.
2. **Settings → Pages → Build and deployment**: choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
3. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.
4. In `index.html`, replace `YOUR-USERNAME` and `YOUR-REPO` in the `canonical` and `og:image` lines so link previews (WhatsApp, Facebook, X) show the share image.

All paths are relative, so it works inside a repository sub-folder.

## Add photos to the gallery

1. Run `python3 tools/add_photo.py my-photo.jpg my-photo-id` (or resize by hand: about 1600 px wide as `assets/img/gallery/my-photo-id.jpg`, and about 640 px wide as `my-photo-id-sm.jpg`).
2. Paste the line it prints into `js/gallery-data.js`. Give it a `category` (Celebrations, Classroom, Competitions, Batches, or a new name, which becomes a new filter button), a short `caption` (this is the text overlaid on the photo) and an `alt` description.

The filter buttons, the overlay captions and the full-screen viewer update by themselves.

## Instagram strip and YouTube videos

- **Instagram strip** (the sliding cards in "Follow along"): edit `instagramHighlights` in `js/config.js`. Each card needs an `image` and a `caption`. Add a `url` (a reel or post link) to send visitors straight to it; without one the card opens the profile. To feature a real reel, save its cover image in `assets/img/` and add it.
- **YouTube previews**: add entries to `youtubeVideos` in `js/config.js`, for example `{ id: "AbCdEfGhIjK", title: "Demo class: Class 8 Maths" }`. The 11-character id is the part after `v=` in the video link. A thumbnail grid appears automatically; leave the list empty to show only the channel card.

## Things to verify before publishing

- **Instagram strip.** Instagram cannot be read automatically, so the strip currently shows photos and posters from your gallery, linking to `@brighter_brainz`. Replace them with real reel covers and links when you can.
- **YouTube videos.** The channel link (`@brighterbrainzz`) came from your QR poster, but no video IDs were available, so only the channel card shows. Send me links or add the IDs in `js/config.js`.
- **Fonts.** Fraunces and Plus Jakarta Sans load from Google Fonts. They could not be checked visually where this was built, so look at the live page once.
- **Batch photos.** The 2024-25 and 2025-26 batch photos are presented as your Class 10 batches. Confirm that is right.
- **Rishitha and Krupa.** Their descriptions are general. Edit them in `index.html` (section `#team`) to say what each actually teaches.
- **Student privacy.** Several photos show students, and the handprint and signed-board photos show first names. Confirm parents are comfortable with this being public.
- **Google Maps link, phone and email** are used as supplied.
- **"No projectors"** comes from the original site and matches the photos.
- **Not shown on purpose**: fees, timings, subjects, admission dates, testimonials and portals. The site sends parents to WhatsApp for these.

## Editing tips

- Colours and fonts: the variables at the top of `css/styles.css`.
- The enquiry form opens WhatsApp with the message filled in; it stores nothing.
- The motion respects the visitor's "reduce motion" setting.
