/* ════════════════════════════════════════
   AUTH.JS — Shared across all pages
   Firebase Auth, reCAPTCHA, Fingerprint, Routing
   ════════════════════════════════════════ */

'use strict';

// ─── Firebase Config ────────────────────────────────────────────

var firebaseConfig = {
  apiKey: "AIzaSyApUPTByzZeBUG38F-Y5QzwufrLNM-im7Q",
  authDomain: "photobooth-d59e8.firebaseapp.com",
  projectId: "photobooth-d59e8",
  storageBucket: "photobooth-d59e8.firebasestorage.app",
  messagingSenderId: "321489454003",
  appId: "1:321489454003:web:69241db345461cd2c6c1c6",
  measurementId: "G-W4QB8S6BH9"
};

var RECAPTCHA_SITE_KEY = '6Ld0RWgsAAAAABRdIcHVQcVkgAswfd_wb4mluzfY';
var MAX_SIGNUPS_PER_DEVICE = 2;

// ─── Detect base path (works with or without trailing slash) ────

var BASE_PATH = (function() {
  var path = window.location.pathname;
  // Find the repo root — look for /Photobooth/ in path
  var match = path.match(/^(\/[^/]+\/)/);
  return match ? match[1] : '/';
})();

function appUrl(page) {
  // page: '' for root, 'login/', 'profile/'
  return BASE_PATH + page;
}

// ─── Initialize Firebase ────────────────────────────────────────

firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();

// ─── Splash Screen ─────────────────────────────────────────────

function showSplash() {
  var existing = document.getElementById('splashScreen');
  if (existing) return;

  var splash = document.createElement('div');
  splash.id = 'splashScreen';
  splash.innerHTML =
    '<div class="splash-inner">' +
      '<span class="material-icons-round splash-icon">photo_camera</span>' +
      '<h1 class="splash-title">Photo Booth</h1>' +
      '<div class="splash-spinner"></div>' +
    '</div>';
  document.body.prepend(splash);
}

function hideSplash() {
  var splash = document.getElementById('splashScreen');
  if (splash) {
    splash.classList.add('splash-fade');
    setTimeout(function() {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 400);
  }
}

// Show splash immediately on every page
showSplash();

// ─── Auth State + Routing ───────────────────────────────────────

// Each page sets this to declare what kind of page it is
// 'public' = login/signup page (redirect away if logged in)
// 'private' = requires auth (redirect to login if not logged in)
var PAGE_TYPE = window.PAGE_TYPE || 'private';

var authResolved = false;

auth.onAuthStateChanged(function(user) {
  authResolved = true;

  if (user) {
    // User is logged in
    if (PAGE_TYPE === 'public') {
      // On login page but already logged in — go to booth
      window.location.replace(appUrl(''));
      return;
    }
    // Private page — show content
    hideSplash();
    showPageContent();
    if (typeof onAuthReady === 'function') {
      onAuthReady(user);
    }
  } else {
    // Not logged in
    if (PAGE_TYPE === 'private') {
      // On private page without auth — go to login
      window.location.replace(appUrl('login/'));
      return;
    }
    // Public page (login) — show content
    hideSplash();
    showPageContent();
    if (typeof onAuthReady === 'function') {
      onAuthReady(null);
    }
  }
});

// Timeout: if auth doesn't resolve in 4s, show page anyway
setTimeout(function() {
  if (!authResolved) {
    console.warn('Auth timeout — showing page');
    hideSplash();
    showPageContent();
  }
}, 4000);

function showPageContent() {
  var content = document.getElementById('pageContent');
  if (content) content.style.display = 'block';
}

// ─── Device Fingerprint ─────────────────────────────────────────

var deviceFingerprint = null;

function initFingerprint() {
  return FingerprintJS.load()
    .then(function(fp) { return fp.get(); })
    .then(function(result) {
      deviceFingerprint = result.visitorId;
      return deviceFingerprint;
    })
    .catch(function(err) {
      console.warn('Fingerprint fallback:', err);
      var fallback = [
        screen.width, screen.height, screen.colorDepth,
        navigator.language, new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0, navigator.platform
      ].join('|');
      deviceFingerprint = simpleHash(fallback);
      return deviceFingerprint;
    });
}

function simpleHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'fp_' + Math.abs(hash).toString(36);
}

// ─── reCAPTCHA v3 ───────────────────────────────────────────────

function getRecaptchaToken(action) {
  return new Promise(function(resolve, reject) {
    try {
      grecaptcha.ready(function() {
        grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: action })
          .then(resolve).catch(reject);
      });
    } catch (e) { reject(e); }
  });
}

// ─── Device Signup Limits ───────────────────────────────────────

function getTodayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function checkDeviceSignupLimit() {
  if (!deviceFingerprint) return Promise.resolve({ allowed: true, count: 0 });
  var docId = deviceFingerprint + '_' + getTodayKey();

  return db.collection('device_signups').doc(docId).get()
    .then(function(doc) {
      if (doc.exists) {
        var count = doc.data().count || 0;
        return { allowed: count < MAX_SIGNUPS_PER_DEVICE, count: count };
      }
      return { allowed: true, count: 0 };
    })
    .catch(function() { return checkLocalLimit(); });
}

function recordDeviceSignup() {
  if (!deviceFingerprint) return Promise.resolve();
  var docId = deviceFingerprint + '_' + getTodayKey();

  var p = db.collection('device_signups').doc(docId).set({
    fingerprint: deviceFingerprint,
    date: getTodayKey(),
    count: firebase.firestore.FieldValue.increment(1),
    lastSignup: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch(function(err) { console.warn('Firestore write failed:', err); });

  recordLocalSignup();
  return p;
}

function checkLocalLimit() {
  try {
    var data = JSON.parse(localStorage.getItem('pb_signups') || '{}');
    var count = data[getTodayKey()] || 0;
    return { allowed: count < MAX_SIGNUPS_PER_DEVICE, count: count };
  } catch (e) { return { allowed: true, count: 0 }; }
}

function recordLocalSignup() {
  try {
    var key = getTodayKey();
    var data = JSON.parse(localStorage.getItem('pb_signups') || '{}');
    data[key] = (data[key] || 0) + 1;
    var keys = Object.keys(data);
    if (keys.length > 7) { keys.sort(); while (keys.length > 7) delete data[keys.shift()]; }
    localStorage.setItem('pb_signups', JSON.stringify(data));
  } catch (e) {}
}

// ─── Auth Action Helpers ────────────────────────────────────────

function handleLogin(email, password) {
  return getRecaptchaToken('login')
    .then(function() {
      return auth.signInWithEmailAndPassword(email, password);
    });
}

function handleSignup(name, email, password) {
  return checkDeviceSignupLimit()
    .then(function(result) {
      if (!result.allowed) {
        throw { code: 'device-limit', message: 'Signup limit reached for this device today (' + MAX_SIGNUPS_PER_DEVICE + ' per day). Try again tomorrow.' };
      }
      return getRecaptchaToken('signup');
    })
    .then(function() {
      return auth.createUserWithEmailAndPassword(email, password);
    })
    .then(function(cred) {
      return cred.user.updateProfile({ displayName: name }).then(function() { return cred; });
    })
    .then(function(cred) {
      return recordDeviceSignup().then(function() { return cred; });
    });
}

function handleGoogleLogin() {
  return getRecaptchaToken('google_login')
    .then(function() {
      var provider = new firebase.auth.GoogleAuthProvider();
      return auth.signInWithPopup(provider);
    })
    .then(function(result) {
      if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
        return recordDeviceSignup().then(function() { return result; });
      }
      return result;
    });
}

function handleLogout() {
  return auth.signOut();
}

// ─── Friendly Errors ────────────────────────────────────────────

function friendlyAuthError(err) {
  switch (err.code || '') {
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed': return 'Network error. Check your connection.';
    case 'auth/popup-blocked': return 'Popup blocked. Allow popups for this site.';
    case 'auth/popup-closed-by-user': return '';
    case 'device-limit': return err.message;
    default: return err.message || 'An error occurred.';
  }
}

// ─── Init Fingerprint on Load ───────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  initFingerprint();
});
