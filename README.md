# LED Solutions — Commercial Lighting Savings Landing Page

A purpose-built lead generation landing page for LEDsolutions.com.au. Plain HTML, CSS and
JavaScript — no frameworks, no build step, no npm.

---

## 1. How to open the page

Double-click `index.html`. It opens in any browser and works straight from the folder.

To test on a phone on the same Wi-Fi, run a local server from this folder:

```
python3 -m http.server 8000
```

Then visit `http://YOUR-COMPUTER-IP:8000` on the phone.

---

## 2. Which file does what

| File | What it controls |
|---|---|
| `index.html` | All page content — headlines, copy, testimonials, case study, form fields |
| `style.css` | All visual design — colours, type, spacing, layout, responsive rules |
| `script.js` | Form validation and submission, the before/after slider, analytics events |
| `README.md` | This document |

Everything a non-developer needs to change lives in `index.html`. Each section starts with a
comment banner (for example `SECTION 5 — BEFORE / AFTER`) so it's easy to find.

Integration points are marked in capitals in the code:
`FORM INTEGRATION`, `ANALYTICS INTEGRATION`, `IMAGE REPLACEMENT`, `TESTIMONIAL REPLACEMENT`,
`CASE STUDY REPLACEMENT`, `CTA CONFIGURATION`, `LOGO REPLACEMENT`, `SEO`.

---

## 3. Replace the hero image

The hero currently uses a **run-time diagram** instead of a photo. It makes the sales argument
without needing approved photography, and it loads instantly.

To swap in a real photo, find `<figure class="hero-visual" id="hero-image">` in `index.html` and
replace everything inside it with:

```html
<img src="images/hero.jpg"
     alt="LED Solutions commercial lighting installation in Canberra"
     width="960" height="760" loading="eager">
```

Suggested size: **960 × 760px or larger**, roughly 5:4. Create an `images/` folder next to
`index.html` and put the file in it.

Keep the `id="hero-image"` on the figure — the A/B test targets it.

---

## 4. Replace the before/after images

In `index.html`, look for `SECTION 5 — BEFORE / AFTER`. There are two placeholder blocks:
`ba-placeholder-after` and `ba-placeholder-before`.

Delete the whole `<div class="ba-placeholder …">…</div>` block in each pane and replace it with
the commented-out `<img>` tag directly above it:

```html
<img src="images/after.jpg" alt="Car park after the LED and controls upgrade"
     width="1200" height="900" loading="lazy">
```

**Both images must be the same size and shot from the same position** — otherwise the slider
comparison will not line up. Suggested size: **1200 × 900px (4:3)**.

Desktop shows a draggable slider. Mobile stacks the two images automatically.

---

## 5. Replace the testimonials

In `index.html`, look for `SECTION 6 — TESTIMONIALS`. There are three cards. In each one:

1. Replace the bracketed text inside `<blockquote>` with the approved customer quote.
2. Replace `[CUSTOMER NAME]`, `[ROLE]` and `[COMPANY]`.
3. Delete `is-placeholder` from `<figure class="testimonial is-placeholder">` — this removes
   the dashed "needs replacing" styling.

To add a fourth testimonial, copy a whole `<figure class="testimonial">…</figure>` block.
To use a customer photo, replace `<span class="testimonial-avatar"></span>` with an
`<img>` at roughly **120 × 120px**.

Until real quotes are supplied, the placeholders stay visible on purpose so nobody mistakes
them for real customer statements.

The "5.0 from 27 reviews" figure appears in the hero, the trust bar and the testimonial intro.
Update all three from Google Business if the rating or review count changes.

---

## 6. Update the case study

In `index.html`, look for `SECTION 7 — COMMERCIAL CASE STUDY`.

- **Challenge / Solution / Result** — the three `<div class="case-block">` blocks.
- **Numbers** — the `<div class="metric">` blocks. Each has a big figure in `<strong>` and a
  label in `<span>`.
- The dashed `[VERIFIED kWh / DOLLAR SAVING — CLIENT TO PROVIDE…]` line is a placeholder. Delete
  the whole `<p class="case-pending">` line once an approved saving figure is available, or
  replace it with the figure.

Every number currently on the page came from the supplied handoff files. Nothing was invented.

To add a second case study, copy the entire `<div class="case-grid">…</div>` block. Only do this
when verified information for a second project is available.

---

## 7. Connect the enquiry form

Open `script.js`. At the very top:

```js
var FORM_ENDPOINT = '';
```

Put the production URL between the quotes. It can be a WordPress form handler, a CRM webhook
(HubSpot, Zoho, Pipedrive) or a serverless function that emails the sales team.

- While `FORM_ENDPOINT` is empty the form runs in **demo mode**: it validates properly and shows
  the success message, but **nothing is sent anywhere**. Do not launch in this state.
- The form posts as `multipart/form-data` so the file upload field works. If the endpoint expects
  JSON instead, change `FORM_ENCODING` to `'json'` — note that file uploads are dropped in JSON mode.
- Field names sent: `name`, `company`, `email`, `phone`, `suburb`, `details`, `files`.
- A hidden honeypot field (`website`) catches basic spam bots and is removed before sending.

After connecting, submit a real test enquiry and confirm it reaches the sales inbox/CRM before
going live.

---

## 8. Connect GA4 / Google Tag Manager

In `index.html`, near the bottom of `<head>`, there is a commented-out block marked
`ANALYTICS INTEGRATION`. Uncomment it and replace `GA_MEASUREMENT_ID_HERE` with the real GA4
measurement ID, or paste the GTM container snippet there instead.

The page already pushes these events to `window.dataLayer`:

| Event | When it fires |
|---|---|
| `cta_click` | Any button or phone link is clicked (includes which one, via `cta_id`) |
| `form_start` | The visitor types into the enquiry form for the first time |
| `form_submit` | The form passes validation and is sent |
| `generate_lead` | The submission succeeds — **this is the conversion event** |
| `form_error` | Validation failed or the send failed |

In GTM, create a Custom Event trigger for each name. In GA4, mark `generate_lead` as a key event.
No fake IDs or fake analytics data are included anywhere.

---

## 9. Recreating the layout in Elementor

The HTML maps one-to-one onto Elementor containers. There are no absolute-positioned layouts,
no frameworks and no JavaScript-driven layout.

| Page section | Elementor build |
|---|---|
| Header | Container (flex, row, space-between) → Site Logo / Heading + Button + Text link |
| Hero | Container (flex, row) → left Inner Container: Heading, Text, two Buttons, Icon List; right Inner Container: Image widget (or keep the diagram as an HTML widget) |
| Trust bar | Container → 4 Inner Containers, each Heading + Text |
| LED + controls | Container → Inner Container (grid, 3 columns) → 6 Icon Box / Text widgets |
| The 2am callout | Container with dark background → Heading + Text |
| Before / after | Elementor Pro **Image Comparison** widget, or two Image widgets side by side |
| Testimonials | Container (grid, 3 columns) → 3 Testimonial widgets |
| Case study | Container (2 columns) → left: Headings + Text; right: Inner Container (grid 2×2) of Heading + Text pairs |
| Why LED Solutions | Container (grid, 3 columns) → 6 Icon Box widgets |
| Lead form | Container (2 columns) → left: Heading, Text, Icon List; right: Elementor **Form** widget |
| Footer | Container (flex, row) → Heading + Text |

Notes for the Elementor build:

- Copy the colour values from the `:root` block at the top of `style.css` into
  **Site Settings → Global Colors** so the whole site stays consistent.
- The dark sections are simply a container with background `#1a1815` and light text.
- Container max width: **1180px**. Side gutter: **22px**.
- Section vertical padding: roughly **104px** desktop, **58px** mobile.
- Elementor breakpoints to check: 1024px, 768px, 390px.
- If the before/after slider is wanted exactly as-is, paste the `#before-after` markup into an
  HTML widget and keep `style.css` and `script.js` enqueued.

---

## 10. Sections set up for A/B testing

Each of these has a stable ID so a testing tool (Google Optimize replacement, VWO, Elementor
A/B, etc.) can target it without touching the rest of the page:

| ID | What to test |
|---|---|
| `#hero-headline` | Headline wording — e.g. run-time angle vs a straight savings angle |
| `#hero-image` | The run-time diagram vs a real project photo vs a VSL embed |
| `#primary-cta` | Button wording — "Get a free lighting savings estimate" vs alternatives |
| `#lead` / `#lead-form` | Form placement — move this section higher, or duplicate it into the hero |
| `#trust` | Which proof points appear, and in what order |
| `#before-after` | Keep it, move it above the value proposition, or test it against the case study |
| `#testimonials` | Position relative to the case study |
| `#case-study` | Metric selection and ordering |

Sections are self-contained blocks in `index.html` — moving one is a cut and paste of everything
between its comment banners. Nothing breaks if a section is removed.

---

## 11. What is deliberately still a placeholder

Nothing on this page was invented. These items need approved client content before launch:

- Before and after project photography
- All three customer testimonials (quote, name, role, company)
- The verified kWh or dollar saving for the IRT Kangara Waters case study
- The Open Graph share image
- The LED Solutions logo file (a simple brand mark is used in the meantime)
- A second case study, if one is approved

Verified content already in use: 14 years in Canberra · 57,000+ lights installed ·
5.0 Google rating from 27 reviews · IRT Kangara Waters (5 buildings, 74 lights per building,
43% switched off when vacant, 30% output when dimmed, 30-minute time-down) ·
1300 763 122 · 0415 343 050 · kieran@ledsolutions.com.au

---

## 12. Pre-launch checklist

- [ ] Real before/after photos in place, same dimensions
- [ ] Approved testimonials in, `is-placeholder` removed
- [ ] Case study saving figure added or the placeholder line deleted
- [ ] `FORM_ENDPOINT` set and a live test enquiry received by sales
- [ ] GA4/GTM snippet added and `generate_lead` confirmed firing
- [ ] Google rating and review count current
- [ ] Checked at 1440px, 1280px, 1024px, 768px, 390px and 360px
- [ ] No horizontal scrolling on any width
- [ ] Tab through the page — focus outlines visible on every button, link and field
