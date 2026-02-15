/* ════════════════════════════════════════
   AUTH.JS — Firebase Auth + Routing
   ════════════════════════════════════════ */

'use strict';

console.log('[Auth] Loading...');

// ─── Config ─────────────────────────────────────────────────────

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
var BASE_PATH = '/dsnap/';

function appUrl(page) { return BASE_PATH + page; }

// ─── Firebase Init ──────────────────────────────────────────────

var auth = null;
var db = null;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  console.log('[Auth] Firebase OK');
} catch (e) {
  console.error('[Auth] Firebase FAILED:', e);
}

// ─── Page Helpers ───────────────────────────────────────────────

function hideSplash() {
  var s = document.getElementById('splashScreen');
  if (s) {
    s.style.transition = 'opacity 0.35s ease';
    s.style.opacity = '0';
    s.style.pointerEvents = 'none';
    setTimeout(function() { s.style.display = 'none'; }, 400);
  }
}

function showPage() {
  var el = document.getElementById('pageContent');
  if (el) el.style.display = 'block';
  hideSplash();
  console.log('[Auth] Page revealed');
}

// ─── Auth Routing ───────────────────────────────────────────────

var PAGE_TYPE = window.PAGE_TYPE || 'private';
var authResolved = false;

console.log('[Auth] PAGE_TYPE=' + PAGE_TYPE);

if (auth) {
  auth.onAuthStateChanged(function(user) {
    authResolved = true;
    console.log('[Auth] User:', user ? user.email : 'none');

    if (user) {
      var isGoogle = user.providerData.length > 0 && user.providerData[0].providerId === 'google.com';

      if (PAGE_TYPE === 'public') {
        // If unverified email user arrives at ?verify=1, stay on this page
        if (!isGoogle && !user.emailVerified && window.location.search.indexOf('verify=1') !== -1) {
          showPage();
          if (typeof onAuthReady === 'function') onAuthReady(user);
          return;
        }
        window.location.replace(appUrl(''));
        return;
      }

      // Private page: block unverified email users
      if (!isGoogle && !user.emailVerified) {
        window.location.replace(appUrl('login/?verify=1'));
        return;
      }

      showPage();
      if (typeof onAuthReady === 'function') onAuthReady(user);
    } else {
      if (PAGE_TYPE === 'private') {
        window.location.replace(appUrl('login/'));
        return;
      }
      showPage();
      if (typeof onAuthReady === 'function') onAuthReady(null);
    }
  });
} else {
  showPage();
}

setTimeout(function() {
  if (!authResolved) {
    console.warn('[Auth] Timeout — forcing show');
    showPage();
  }
}, 5000);

// ─── Fingerprint ────────────────────────────────────────────────

var deviceFingerprint = null;

function initFingerprint() {
  if (typeof FingerprintJS === 'undefined') {
    deviceFingerprint = makeFallbackFP();
    return Promise.resolve(deviceFingerprint);
  }
  return FingerprintJS.load()
    .then(function(fp) { return fp.get(); })
    .then(function(r) { deviceFingerprint = r.visitorId; return deviceFingerprint; })
    .catch(function() { deviceFingerprint = makeFallbackFP(); return deviceFingerprint; });
}

function makeFallbackFP() {
  var s = [screen.width, screen.height, screen.colorDepth,
    navigator.language, new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0, navigator.platform].join('|');
  var h = 0;
  for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return 'fp_' + Math.abs(h).toString(36);
}

// ─── reCAPTCHA ──────────────────────────────────────────────────

function getRecaptchaToken(action) {
  return new Promise(function(resolve) {
    if (typeof grecaptcha === 'undefined') { resolve('skip'); return; }
    try {
      grecaptcha.ready(function() {
        grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: action })
          .then(resolve).catch(function() { resolve('skip'); });
      });
    } catch (e) { resolve('skip'); }
  });
}

// ─── Device Limits ──────────────────────────────────────────────

function getTodayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function checkDeviceSignupLimit() {
  if (!deviceFingerprint || !db) return Promise.resolve({ allowed: true, count: 0 });
  var docId = deviceFingerprint + '_' + getTodayKey();
  return db.collection('device_signups').doc(docId).get()
    .then(function(doc) {
      if (doc.exists) { var c = doc.data().count || 0; return { allowed: c < MAX_SIGNUPS_PER_DEVICE, count: c }; }
      return { allowed: true, count: 0 };
    })
    .catch(function() {
      try {
        var data = JSON.parse(localStorage.getItem('pb_signups') || '{}');
        var c = data[getTodayKey()] || 0;
        return { allowed: c < MAX_SIGNUPS_PER_DEVICE, count: c };
      } catch(e) { return { allowed: true, count: 0 }; }
    });
}

function recordDeviceSignup() {
  try {
    var k = getTodayKey();
    var data = JSON.parse(localStorage.getItem('pb_signups') || '{}');
    data[k] = (data[k] || 0) + 1;
    localStorage.setItem('pb_signups', JSON.stringify(data));
  } catch(e) {}
  if (!deviceFingerprint || !db) return Promise.resolve();
  var docId = deviceFingerprint + '_' + getTodayKey();
  return db.collection('device_signups').doc(docId).set({
    fingerprint: deviceFingerprint, date: getTodayKey(),
    count: firebase.firestore.FieldValue.increment(1),
    lastSignup: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch(function() {});
}

// ─── Auth Actions ───────────────────────────────────────────────

function handleLogin(email, password) {
  return getRecaptchaToken('login').then(function() {
    return auth.signInWithEmailAndPassword(email, password);
  });
}

function handleSignup(name, email, password) {
  return checkDeviceSignupLimit().then(function(r) {
    if (!r.allowed) throw { code: 'device-limit', message: 'Signup limit reached (max ' + MAX_SIGNUPS_PER_DEVICE + '/day). Try tomorrow.' };
    return getRecaptchaToken('signup');
  }).then(function() {
    return auth.createUserWithEmailAndPassword(email, password);
  }).then(function(cred) {
    return cred.user.updateProfile({ displayName: name }).then(function() { return cred; });
  }).then(function(cred) {
    return recordDeviceSignup().then(function() { return cred; });
  }).then(function(cred) {
    return cred.user.sendEmailVerification().then(function() { return cred; });
  });
}

function handleGoogleLogin() {
  return getRecaptchaToken('google_login').then(function() {
    return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }).then(function(result) {
    if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
      return recordDeviceSignup().then(function() { return result; });
    }
    return result;
  });
}

function handleResendVerification() {
  var user = auth.currentUser;
  if (!user) return Promise.reject({ message: 'Not signed in.' });
  return user.sendEmailVerification();
}

function handleLogout() { return auth.signOut(); }

// ─── Error Messages ─────────────────────────────────────────────

function friendlyAuthError(err) {
  var m = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'Account disabled.',
    'auth/user-not-found': 'No account with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/email-already-in-use': 'Email already in use.',
    'auth/weak-password': 'Password must be 6+ characters.',
    'auth/too-many-requests': 'Too many attempts. Wait and retry.',
    'auth/network-request-failed': 'Network error.',
    'auth/popup-blocked': 'Popup blocked. Allow popups.',
    'auth/popup-closed-by-user': '',
    'device-limit': err.message || 'Device limit reached.'
  };
  return m[err.code || ''] || err.message || 'An error occurred.';
}

// ─── Init fingerprint on DOM ready ──────────────────────────────

document.addEventListener('DOMContentLoaded', function() { initFingerprint(); });
