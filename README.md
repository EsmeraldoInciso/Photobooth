# 📸 Photo Booth — GitHub Pages + Firebase Auth

Web-based photo booth with Firebase authentication, reCAPTCHA, device-based signup limits, and standard print layouts. Hosted on GitHub Pages.

## Features

- 🔐 **Firebase Auth** — Email/password + Google Sign-In
- 🤖 **reCAPTCHA v3** — Invisible bot protection
- 📱 **Device Fingerprinting** — Max 2 signups per device per day
- 🚀 **Splash Screen** — No login flash on reload
- 👤 **Profile Page** — View account info, update name, delete account
- 📷 **Camera** with flip, mirror, timer (3/5/10s)
- 📐 **8 Layouts** — 2×6" and 4×6" at 300 DPI
- 🖼️ **9 Frames** + **8 Filters**
- 👁️ **Live Preview** — Real-time strip rendering
- 📧 **Email** via EmailJS | ⬇️ **Download** | 🖨️ **Print**

## File Structure

```
Photobooth/
├── index.html          ← / (main booth — requires login)
├── style.css           ← shared styles
├── auth.js             ← shared auth + splash + routing
├── script.js           ← photo booth logic
├── login/
│   └── index.html      ← /login/ (sign in/up — public)
├── profile/
│   └── index.html      ← /profile/ (account info — requires login)
└── README.md
```

## How Routing Works

Every page includes `auth.js` which:

1. Shows a **splash screen** immediately (logo + spinner)
2. Waits for Firebase to resolve auth state
3. Redirects based on page type:

| Page | Type | Logged In | Not Logged In |
|------|------|-----------|---------------|
| `/` | private | ✅ Show booth | → `/login/` |
| `/login/` | public | → `/` | ✅ Show login |
| `/profile/` | private | ✅ Show profile | → `/login/` |

No login flash ever — the splash covers the transition.

## Setup

### Firebase (pre-configured)

Config is in `auth.js`. To use your own project:

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google + Email/Password
3. Enable **Firestore** with rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /device_signups/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Register a Web app and update config in `auth.js`

### reCAPTCHA v3

1. Go to [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Create v3 key with your domains
3. Update site key in `auth.js` and all HTML files

### Deploy

```bash
git add .
git commit -m "Photo booth with auth"
git push origin main
```

Enable Pages: repo **Settings → Pages → Source: main**

### EmailJS (optional)

Configure in the app's ⚙️ Settings panel.

## License

MIT
