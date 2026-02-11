/* ════════════════════════════════════════
   AUTH.JS — Firebase Auth + reCAPTCHA + Device Fingerprint
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

// ─── Constants ──────────────────────────────────────────────────

var RECAPTCHA_SITE_KEY = '6Ld0RWgsAAAAABRdIcHVQcVkgAswfd_wb4mluzfY';
var MAX_SIGNUPS_PER_DEVICE = 2;

// ─── Initialize Firebase ────────────────────────────────────────

firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();

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
      console.warn('Fingerprint failed, using fallback:', err);
      // Fallback: combine screen + timezone + language
      var fallback = [
        screen.width, screen.height, screen.colorDepth,
        navigator.language, new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0,
        navigator.platform
      ].join('|');
      deviceFingerprint = simpleHash(fallback);
      return deviceFingerprint;
    });
}

function simpleHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
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
          .then(function(token) { resolve(token); })
          .catch(function(err) { reject(err); });
      });
    } catch (e) {
      reject(e);
    }
  });
}

// ─── Device Signup Limit Check ──────────────────────────────────

function getTodayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function checkDeviceSignupLimit() {
  if (!deviceFingerprint) {
    return Promise.resolve({ allowed: true, count: 0 });
  }

  var todayKey = getTodayKey();
  var docId = deviceFingerprint + '_' + todayKey;

  return db.collection('device_signups').doc(docId).get()
    .then(function(doc) {
      if (doc.exists) {
        var data = doc.data();
        var count = data.count || 0;
        return { allowed: count < MAX_SIGNUPS_PER_DEVICE, count: count };
      }
      return { allowed: true, count: 0 };
    })
    .catch(function(err) {
      console.warn('Firestore check failed:', err);
      // If Firestore fails, check localStorage fallback
      return checkLocalLimit();
    });
}

function recordDeviceSignup() {
  if (!deviceFingerprint) return Promise.resolve();

  var todayKey = getTodayKey();
  var docId = deviceFingerprint + '_' + todayKey;

  // Record in Firestore
  var firestorePromise = db.collection('device_signups').doc(docId).set({
    fingerprint: deviceFingerprint,
    date: todayKey,
    count: firebase.firestore.FieldValue.increment(1),
    lastSignup: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch(function(err) {
    console.warn('Firestore write failed:', err);
  });

  // Also record in localStorage as fallback
  recordLocalSignup();

  return firestorePromise;
}

// ─── localStorage Fallback for Limit ────────────────────────────

function checkLocalLimit() {
  try {
    var todayKey = getTodayKey();
    var data = JSON.parse(localStorage.getItem('pb_signups') || '{}');
    var todayCount = (data[todayKey] || 0);
    return { allowed: todayCount < MAX_SIGNUPS_PER_DEVICE, count: todayCount };
  } catch (e) {
    return { allowed: true, count: 0 };
  }
}

function recordLocalSignup() {
  try {
    var todayKey = getTodayKey();
    var data = JSON.parse(localStorage.getItem('pb_signups') || '{}');
    data[todayKey] = (data[todayKey] || 0) + 1;
    // Clean old entries
    var keys = Object.keys(data);
    if (keys.length > 7) {
      keys.sort();
      while (keys.length > 7) {
        delete data[keys.shift()];
      }
    }
    localStorage.setItem('pb_signups', JSON.stringify(data));
  } catch (e) {
    // localStorage not available
  }
}

// ─── Auth UI Helpers ────────────────────────────────────────────

function showAuthStatus(msg, isError) {
  var el = document.getElementById('authStatus');
  el.textContent = msg;
  el.className = 'auth-status' + (isError ? ' error' : ' success');
  if (!isError) {
    setTimeout(function() { el.textContent = ''; }, 4000);
  }
}

function clearAuthStatus() {
  var el = document.getElementById('authStatus');
  el.textContent = '';
  el.className = 'auth-status';
}

function setAuthLoading(loading) {
  var buttons = document.querySelectorAll('.auth-form .btn, .btn-google');
  buttons.forEach(function(btn) {
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.6' : '1';
  });
}

function switchAuthTab(tab) {
  var tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(function(t) { t.classList.remove('active'); });

  if (tab === 'login') {
    tabs[0].classList.add('active');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
  } else {
    tabs[1].classList.add('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
  }
  clearAuthStatus();
}

// ─── Auth Handlers ──────────────────────────────────────────────

function handleLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAuthStatus('Please enter email and password.', true);
    return;
  }

  setAuthLoading(true);
  clearAuthStatus();

  // reCAPTCHA check
  getRecaptchaToken('login')
    .then(function(token) {
      // Token obtained — proceed with Firebase login
      return auth.signInWithEmailAndPassword(email, password);
    })
    .then(function(cred) {
      showAuthStatus('Signed in!', false);
      // Auth state listener handles the rest
    })
    .catch(function(err) {
      var msg = friendlyAuthError(err);
      showAuthStatus(msg, true);
      setAuthLoading(false);
    });
}

function handleSignup() {
  var name = document.getElementById('signupName').value.trim();
  var email = document.getElementById('signupEmail').value.trim();
  var password = document.getElementById('signupPassword').value;
  var confirm = document.getElementById('signupConfirm').value;

  if (!name) { showAuthStatus('Please enter your name.', true); return; }
  if (!email) { showAuthStatus('Please enter your email.', true); return; }
  if (password.length < 6) { showAuthStatus('Password must be at least 6 characters.', true); return; }
  if (password !== confirm) { showAuthStatus('Passwords do not match.', true); return; }

  setAuthLoading(true);
  clearAuthStatus();

  // Check device signup limit first
  checkDeviceSignupLimit()
    .then(function(result) {
      if (!result.allowed) {
        throw { code: 'device-limit', message: 'Signup limit reached for this device today (' + MAX_SIGNUPS_PER_DEVICE + ' accounts max per day). Try again tomorrow.' };
      }
      // reCAPTCHA check
      return getRecaptchaToken('signup');
    })
    .then(function(token) {
      // Create account
      return auth.createUserWithEmailAndPassword(email, password);
    })
    .then(function(cred) {
      // Set display name
      return cred.user.updateProfile({ displayName: name });
    })
    .then(function() {
      // Record signup for device limit
      return recordDeviceSignup();
    })
    .then(function() {
      showAuthStatus('Account created!', false);
    })
    .catch(function(err) {
      var msg = err.code === 'device-limit' ? err.message : friendlyAuthError(err);
      showAuthStatus(msg, true);
      setAuthLoading(false);
    });
}

function handleGoogleLogin() {
  setAuthLoading(true);
  clearAuthStatus();

  getRecaptchaToken('google_login')
    .then(function(token) {
      var provider = new firebase.auth.GoogleAuthProvider();
      return auth.signInWithPopup(provider);
    })
    .then(function(result) {
      // Check if this is a new user (first sign-in)
      if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
        return recordDeviceSignup();
      }
    })
    .then(function() {
      showAuthStatus('Signed in with Google!', false);
    })
    .catch(function(err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup, not an error
        setAuthLoading(false);
        return;
      }
      showAuthStatus(friendlyAuthError(err), true);
      setAuthLoading(false);
    });
}

function handleLogout() {
  auth.signOut().then(function() {
    // Auth state listener handles UI
  }).catch(function(err) {
    console.error('Logout error:', err);
  });
}

// ─── Auth State Listener ────────────────────────────────────────

auth.onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in — show app
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';

    // Update user info in header
    var displayName = user.displayName || user.email.split('@')[0];
    document.getElementById('userName').textContent = displayName;

    var avatar = document.getElementById('userAvatar');
    if (user.photoURL) {
      avatar.src = user.photoURL;
      avatar.style.display = 'block';
    } else {
      avatar.style.display = 'none';
    }

    // Initialize photo booth
    if (typeof initPhotoBooth === 'function') {
      initPhotoBooth();
    }
  } else {
    // User is signed out — show auth
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
    setAuthLoading(false);
  }
});

// ─── Friendly Error Messages ────────────────────────────────────

function friendlyAuthError(err) {
  var code = err.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.';
    default:
      return err.message || 'An error occurred. Please try again.';
  }
}

// ─── Initialize Fingerprint on Load ─────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  initFingerprint().then(function(fp) {
    console.log('Device fingerprint ready');
  });

  // Allow Enter key to submit forms
  document.getElementById('loginPassword').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('signupConfirm').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleSignup();
  });
});
