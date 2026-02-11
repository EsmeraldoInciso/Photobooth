# 📸 Photo Booth — GitHub Pages + Firebase Auth

A professional web-based photo booth with Firebase authentication, reCAPTCHA protection, device-based signup limits, and standard print layouts.

## Features

- 🔐 **Firebase Auth** — Email/password + Google Sign-In
- 🤖 **reCAPTCHA v3** — Bot protection on login and signup
- 📱 **Device Fingerprinting** — Limits signups to 2 per device per day
- 📷 **Camera** with front/back flip and mirror toggle
- ⏱️ **Timer** — Off, 3s, 5s, 10s countdown
- 📐 **8 standard layouts** — 2×6" and 4×6" at 300 DPI
- 🖼️ **9 frame styles** — White, Black, Cream, Pink, Mint, Lavender, Gold, Film
- 🎨 **8 filters** — B&W, Sepia, Warm, Cool, Vivid, Fade, Noir
- 👁️ **Live preview** — Real-time strip rendering as you capture
- 📧 **Email photos** via EmailJS
- ⬇️ **Download** and 🖨️ **Print** support
- 🏷️ **Event branding** — Custom title and date on prints

## File Structure

```
photo-booth/
├── index.html      # Main page with auth + booth UI
├── style.css       # All styles including auth screen
├── auth.js         # Firebase Auth, reCAPTCHA, device fingerprint
├── script.js       # Photo booth logic (camera, layouts, etc.)
└── README.md       # This file
```

## Setup

### 1. Firebase (already configured)

The app is pre-configured with Firebase project `photobooth-d59e8`. To use your own:

1. Edit `auth.js` and replace `firebaseConfig` with your own
2. Enable **Authentication** → Google + Email/Password
3. Enable **Firestore Database**
4. Set Firestore rules:

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

### 2. reCAPTCHA v3

Pre-configured with site key. To use your own:

1. Go to [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Create reCAPTCHA v3 with your domains
3. Update the site key in `index.html` (script src) and `auth.js` (RECAPTCHA_SITE_KEY)

### 3. Deploy to GitHub Pages

```bash
git add .
git commit -m "Add Firebase auth"
git push origin main
```

Enable Pages in repo Settings → Pages → Source: main branch.

### 4. EmailJS (optional)

Configure in the app's Settings panel with your EmailJS keys.

## How Auth Works

```
User opens site
    ↓
Auth Screen shown
    ↓
Login or Signup
    ↓
reCAPTCHA v3 token generated ← bot protection
    ↓
[Signup only] Device fingerprint checked
    ↓
[Signup only] Firestore: count < 2 today? ← device limit
    ↓
Firebase Auth: create/sign-in
    ↓
[Signup only] Record signup in Firestore + localStorage
    ↓
Auth state listener → show Photo Booth
```

## Device Signup Limit

To prevent abuse, signups are limited to **2 accounts per device per day**:

1. **FingerprintJS** generates a browser-based device ID
2. On signup, checks Firestore collection `device_signups` for today's count
3. If count >= 2, signup is blocked with a message
4. **localStorage** serves as a fallback if Firestore is unreachable
5. Login (existing accounts) is not limited — only new signups

## Technologies

- Firebase Auth (compat SDK v10.12)
- Cloud Firestore
- reCAPTCHA v3
- FingerprintJS v4
- EmailJS
- HTML5 Canvas (300 DPI rendering)
- getUserMedia API

## License

MIT
