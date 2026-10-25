# Saqy Website

Precision agriculture drone services — Brunei & Southeast Asia.

Built with plain HTML, CSS, and JavaScript. Hosted on GitHub Pages.

## Project Structure

```
saqy-website/
├── index.html          ← Home page
├── 404.html            ← Custom 404 page
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← Nav, form, interactions
├── images/             ← Place your logo and photos here
└── services/
    └── index.html      ← Services detail page
```

## To Activate the Contact Form

1. Sign up at [formspree.io](https://formspree.io) (free — 50 submissions/month)
2. Create a new form and copy the endpoint (e.g. `https://formspree.io/f/xabc1234`)
3. Open `js/main.js` and paste it into `const FORM_ENDPOINT = ''`
4. Remove the "not yet configured" notice from `index.html`

## GitHub Pages Deployment

See the full guide in `DEPLOY.md`.
