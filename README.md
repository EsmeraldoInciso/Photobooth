# 📸 Photo Booth — GitHub Pages

A professional web-based photo booth that runs entirely on GitHub Pages. Features standard photo booth layouts, live preview, email delivery via EmailJS, and direct download/print.

## [Live Demo →](#) <!-- Replace with your GitHub Pages URL -->

![Photo Booth Screenshot](screenshot.png)

---

## Features

- 📷 **Camera access** with front/back flip and mirror toggle
- ⏱️ **Timer** — Off, 3s, 5s, 10s countdown with animated overlay
- 📐 **8 standard layouts** — 2×6" strips and 4×6" prints at 300 DPI
- 🖼️ **9 frame styles** — White, Black, Cream, Pink, Mint, Lavender, Gold, Film Strip
- 🎨 **8 filters** — B&W, Sepia, Warm, Cool, Vivid, Fade, Noir
- 👁️ **Live preview** — See photos populate the strip in real-time as you capture
- 📧 **Email photos** — Send via EmailJS (free: 200 emails/month)
- ⬇️ **Download** — Save as PNG directly to device
- 🖨️ **Print** — Correct `@page` sizing for accurate prints
- 🏷️ **Event branding** — Custom title and date on every print
- 💾 **Settings persist** — Saved to localStorage between sessions
- 📱 **Responsive** — Works on desktop, tablet, and mobile

## Layouts

| Layout | Size | Photos | Best For |
|--------|------|--------|----------|
| 2×6 Classic | 2×6" | 3 | Traditional photo booth strip |
| 2×6 Strip | 2×6" | 4 | Classic 4-photo strip |
| 4×6 Single | 4×6" | 1 | Large portrait, headshot |
| 4×6 Triple | 4×6" | 3 | Three stacked photos |
| 4×6 Grid | 4×6" | 4 | 2×2 grid layout |
| 4×6 Collage | 4×6" | 3 | One large + two small |
| 4×6 Landscape | 6×4" | 2 | Side-by-side photos |
| 4×6 Six-Up | 4×6" | 6 | 2×3 grid of six photos |

All rendered at **300 DPI** for print-quality output.

---

## Quick Start

### 1. Deploy to GitHub Pages

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/photo-booth.git
cd photo-booth

# Push to GitHub
git remote set-url origin https://github.com/YOUR_USERNAME/photo-booth.git
git push origin main
```

Then go to **Settings → Pages → Source: main branch** → Save.

Your photo booth will be live at: `https://YOUR_USERNAME.github.io/photo-booth/`

### 2. Or just open locally

Simply open `index.html` in any modern browser. The camera and all features work locally — no server required.

---

## EmailJS Setup (Optional)

EmailJS lets users email their photos to themselves. Free tier gives you 200 emails/month.

### Step 1: Create an EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com/) and sign up (free)
2. Add an **Email Service** (Gmail, Outlook, etc.)
3. Note your **Service ID** (e.g., `service_abc1234`)

### Step 2: Create an Email Template

1. Go to **Email Templates** → **Create New Template**
2. Set up the template like this:

**Subject:**
```
📸 Your Photo Booth Photo — {{event_name}}
```

**Body (HTML):**
```html
<h2>Hi {{to_name}}!</h2>
<p>{{message}}</p>
<p><strong>Event:</strong> {{event_name}}<br>
<strong>Date:</strong> {{event_date}}</p>
<p>Your photo is attached below!</p>
```

3. Click **Add Attachment** → Select **Variable Attachment**
   - **Parameter Name:** `image`
   - **Filename:** `photobooth.png`
4. Under **To Email**, enter: `{{to_email}}`
5. **Save** the template
6. Note your **Template ID** (e.g., `template_xyz5678`)

### Step 3: Get Your Public Key

1. Go to **Account** → find your **Public Key**
2. Note it (e.g., `user_ABCdef123456`)

### Step 4: Configure in the App

1. Open the photo booth
2. Click the **⚙️ Settings** icon
3. Enter your **Public Key**, **Service ID**, and **Template ID**
4. These are saved to localStorage — you only need to do this once

---

## File Structure

```
photo-booth/
├── index.html      # Main HTML page
├── style.css       # All styles
├── script.js       # All JavaScript logic
└── README.md       # This file
```

No build tools, no dependencies, no frameworks. Just 3 files.

---

## How It Works

```
┌── Browser ──────────────────────────────────────────┐
│                                                      │
│  getUserMedia() → <video> → <canvas> capture         │
│       ↓                                              │
│  Apply filter (CSS filter on canvas)                 │
│       ↓                                              │
│  Render layout (slots at 300 DPI)                    │
│       ↓                                              │
│  Live preview updates after each shot                │
│       ↓                                              │
│  ┌─────────┐  ┌──────────┐  ┌──────────────┐       │
│  │Download │  │  Print   │  │ Email (EmailJS)│       │
│  │ .png    │  │ iframe   │  │ base64 attach  │       │
│  └─────────┘  └──────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────┘
```

---

## Customization

### Add more layouts
Edit the `LAYOUTS` array in `script.js`. Each layout needs:
- `id`, `name`, `desc` — identifiers
- `size` — key from `SIZES` ('2x6', '4x6', '4x6L')
- `shots` — number of photos needed
- `miniCols`, `miniRows` — for the layout card thumbnail
- `getSlots(cw, ch)` — function returning `{x, y, w, h}` for each slot

### Add more frames
Edit the `FRAMES` array. Set `bg` for background color, `accent` for a border line, `filmHoles: true` for sprocket holes.

### Add more filters
Edit the `FILTERS` array. Uses standard [CSS filter](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) syntax.

### Customize branding
In Settings, set your **Event Title** and **Event Date** to appear on every print.

---

## Browser Support

- Chrome 53+ ✅
- Firefox 36+ ✅
- Safari 11+ ✅
- Edge 12+ ✅
- Mobile browsers ✅ (iOS Safari, Chrome for Android)

Requires HTTPS for camera access (GitHub Pages provides this automatically).

---

## License

MIT — Use freely for personal or commercial events.
