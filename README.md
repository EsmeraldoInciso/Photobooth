# 📸 Photo Booth v3

Web-based photo booth with Firebase auth, review/retake, QR codes, gallery, and kiosk mode.

## New Features in v3

- **Retake Individual Shots** — Review screen after capture, tap Retake on any photo
- **QR Code on Prints** — Gallery link QR badge on every print (toggle in Settings)
- **Gallery Page** — `/gallery/` shows all event photos from Firestore + local fallback
- **Kiosk Mode** — Fullscreen, auto-reset after 30s, hides non-essential UI

## File Structure

```
Photobooth/
├── index.html          ← Booth (private)
├── style.css           ← All styles
├── auth.js             ← Auth + routing
├── script.js           ← Booth logic + retake + QR + gallery save + kiosk
├── login/index.html    ← Sign in/up (public)
├── profile/index.html  ← Account (private)
├── gallery/index.html  ← Photo gallery (private)
└── README.md
```

## Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /device_signups/{docId} {
      allow read, write: if request.auth != null;
    }
    match /gallery/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## How It Works

### Retake Flow
1. Capture all shots → Review modal opens
2. Tap **Retake** on any shot → modal closes, capture button pulses
3. Press capture → only that slot is replaced
4. Review again → **Approve All** to finalize

### Gallery
- Photos auto-save to Firestore `gallery` collection on approve
- Falls back to localStorage if Firestore unavailable
- Gallery page loads from Firestore, merges local entries
- Lightbox view with download

### Kiosk Mode
- Click fullscreen icon in header
- Hides navigation, settings, layout selectors
- Auto-resets booth after 30 seconds of inactivity
- Perfect for events — just leave it running

## License
MIT
