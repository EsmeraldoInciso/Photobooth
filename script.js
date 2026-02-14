/* ════════════════════════════════════════
   PHOTO BOOTH v3 — Enhanced
   ════════════════════════════════════════ */

'use strict';

const DPI = 300;
const SIZES = {
  '2x6':  { w: 2 * DPI, h: 6 * DPI,  label: '2×6"' },
  '4x6':  { w: 4 * DPI, h: 6 * DPI,  label: '4×6"' },
  '4x6L': { w: 6 * DPI, h: 4 * DPI,  label: '4×6" L' },
};

const LAYOUTS = [
  { id: '2x6_3', name: '2×6 Classic', desc: '3 Photos', size: '2x6', shots: 3, miniCols: 1, miniRows: 3,
    getSlots: function(cw, ch) { var pad=cw*0.05,gap=cw*0.03,slotW=cw-pad*2,top=ch*0.82,slotH=(top-pad-gap*2)/3,s=[]; for(var i=0;i<3;i++) s.push({x:pad,y:pad+i*(slotH+gap),w:slotW,h:slotH}); return s; } },
  { id: '2x6_4', name: '2×6 Strip', desc: '4 Photos', size: '2x6', shots: 4, miniCols: 1, miniRows: 4,
    getSlots: function(cw, ch) { var pad=cw*0.05,gap=cw*0.025,slotW=cw-pad*2,top=ch*0.85,slotH=(top-pad-gap*3)/4,s=[]; for(var i=0;i<4;i++) s.push({x:pad,y:pad+i*(slotH+gap),w:slotW,h:slotH}); return s; } },
  { id: '4x6_single', name: '4×6 Single', desc: '1 Photo', size: '4x6', shots: 1, miniCols: 1, miniRows: 1,
    getSlots: function(cw, ch) { var pad=cw*0.04; return [{x:pad,y:pad,w:cw-pad*2,h:ch*0.88-pad}]; } },
  { id: '4x6_3', name: '4×6 Triple', desc: '3 Photos', size: '4x6', shots: 3, miniCols: 1, miniRows: 3,
    getSlots: function(cw, ch) { var pad=cw*0.04,gap=cw*0.02,slotW=cw-pad*2,top=ch*0.85,slotH=(top-pad-gap*2)/3,s=[]; for(var i=0;i<3;i++) s.push({x:pad,y:pad+i*(slotH+gap),w:slotW,h:slotH}); return s; } },
  { id: '4x6_4grid', name: '4×6 Grid', desc: '4 Photos', size: '4x6', shots: 4, miniCols: 2, miniRows: 2,
    getSlots: function(cw, ch) { var pad=cw*0.04,gap=cw*0.02,slotW=(cw-pad*2-gap)/2,top=ch*0.82,slotH=(top-pad-gap)/2,s=[]; for(var r=0;r<2;r++) for(var c=0;c<2;c++) s.push({x:pad+c*(slotW+gap),y:pad+r*(slotH+gap),w:slotW,h:slotH}); return s; } },
  { id: '4x6_collage', name: '4×6 Collage', desc: '3 Photos', size: '4x6', shots: 3, miniCols: 2, miniRows: 2,
    getSlots: function(cw, ch) { var pad=cw*0.04,gap=cw*0.02,aH=ch*0.82-pad,tH=aH*0.55,bH=aH*0.45-gap,hW=(cw-pad*2-gap)/2; return [{x:pad,y:pad,w:cw-pad*2,h:tH},{x:pad,y:pad+tH+gap,w:hW,h:bH},{x:pad+hW+gap,y:pad+tH+gap,w:hW,h:bH}]; } },
  { id: '4x6L_2up', name: '4×6 Landscape', desc: '2 Photos', size: '4x6L', shots: 2, miniCols: 2, miniRows: 1,
    getSlots: function(cw, ch) { var pad=cw*0.03,gap=cw*0.02,slotW=(cw-pad*2-gap)/2,slotH=ch*0.78-pad; return [{x:pad,y:pad,w:slotW,h:slotH},{x:pad+slotW+gap,y:pad,w:slotW,h:slotH}]; } },
  { id: '4x6_6grid', name: '4×6 Six-Up', desc: '6 Photos', size: '4x6', shots: 6, miniCols: 2, miniRows: 3,
    getSlots: function(cw, ch) { var pad=cw*0.03,gap=cw*0.02,slotW=(cw-pad*2-gap)/2,top=ch*0.85,slotH=(top-pad-gap*2)/3,s=[]; for(var r=0;r<3;r++) for(var c=0;c<2;c++) s.push({x:pad+c*(slotW+gap),y:pad+r*(slotH+gap),w:slotW,h:slotH}); return s; } },
];

var FRAMES = [
  { id: 'none',     name: 'None' },
  { id: 'white',    name: 'White',    bg: '#FFFFFF' },
  { id: 'black',    name: 'Black',    bg: '#1A1A1A' },
  { id: 'cream',    name: 'Cream',    bg: '#FFF8F0' },
  { id: 'pink',     name: 'Pink',     bg: '#FFE0F0' },
  { id: 'mint',     name: 'Mint',     bg: '#E0FFF0' },
  { id: 'lavender', name: 'Lavender', bg: '#F0E0FF' },
  { id: 'gold',     name: 'Gold',     bg: '#FFF5D4', accent: '#D4A843' },
  { id: 'film',     name: 'Film',     bg: '#111111', filmHoles: true },
];

var FILTERS = [
  { id: 'none',  name: 'Normal', css: 'none', color: '#888' },
  { id: 'bw',    name: 'B&W',    css: 'grayscale(100%)', color: '#555' },
  { id: 'sepia', name: 'Sepia',  css: 'sepia(80%)', color: '#8B7355' },
  { id: 'warm',  name: 'Warm',   css: 'saturate(130%) hue-rotate(-10deg)', color: '#D4886B' },
  { id: 'cool',  name: 'Cool',   css: 'saturate(110%) hue-rotate(20deg) brightness(1.05)', color: '#6B8DD4' },
  { id: 'vivid', name: 'Vivid',  css: 'saturate(180%) contrast(110%)', color: '#E84393' },
  { id: 'fade',  name: 'Fade',   css: 'contrast(90%) brightness(110%) saturate(80%)', color: '#B0A8A8' },
  { id: 'noir',  name: 'Noir',   css: 'grayscale(100%) contrast(140%) brightness(90%)', color: '#333' },
];

// ─── State ──────────────────────────────────────────────────────

var state = {
  stream: null, cameraReady: false, facingMode: 'user', timerSeconds: 0,
  selectedLayout: '2x6_3', selectedFrame: 'white', selectedFilter: 'none',
  capturedPhotos: [], isCapturing: false, currentShot: 0, boothComplete: false,
  retakeIndex: -1,
  kioskMode: false, kioskAutoResetMs: 30000, kioskResetTimer: null,
  settings: {
    mirror: true, flash: true, sound: true,
    eventTitle: 'DSnap', eventDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    emailPublicKey: '', emailServiceId: '', emailTemplateId: '',
    showQR: true, saveToGallery: true,
  }
};

// ─── Init ───────────────────────────────────────────────────────

var boothInitialized = false;
function initPhotoBooth() {
  if (boothInitialized) return;
  boothInitialized = true;
  loadSettings();
  renderLayouts(); renderFrames(); renderFilters();
  renderLivePreview(); startCamera();
}

// ─── Camera ─────────────────────────────────────────────────────

function startCamera() {
  if (state.stream) state.stream.getTracks().forEach(function(t) { t.stop(); });
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: state.facingMode, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false
  }).then(function(stream) {
    state.stream = stream;
    var v = document.getElementById('video'); v.srcObject = stream; return v.play();
  }).then(function() {
    state.cameraReady = true;
    document.getElementById('cameraOff').classList.add('hidden');
  }).catch(function(err) {
    console.error('Camera:', err);
    document.getElementById('cameraOff').classList.remove('hidden');
  });
}

function flipCamera() { state.facingMode = state.facingMode === 'user' ? 'environment' : 'user'; startCamera(); }

function cycleTimer() {
  var t = [0, 3, 5, 10], i = t.indexOf(state.timerSeconds);
  state.timerSeconds = t[(i + 1) % t.length];
  document.getElementById('timerBadge').textContent = state.timerSeconds === 0 ? 'OFF' : state.timerSeconds + 's';
}

// ─── Capture ────────────────────────────────────────────────────

function startCapture() {
  if (!state.cameraReady || state.isCapturing) return;
  resetKioskTimer();
  var layout = findById(LAYOUTS, state.selectedLayout);

  // RETAKE: check FIRST before anything else
  if (state.retakeIndex >= 0) {
    var idx = state.retakeIndex;
    state.retakeIndex = -1;
    state.isCapturing = true;
    document.getElementById('btnCapture').disabled = true;
    clearStatus();
    updateShotCounter(idx + 1, layout.shots);

    function doTheRetake() {
      state.capturedPhotos[idx] = captureFrame();
      if (state.settings.flash) triggerFlash();
      if (state.settings.sound) playShutter();
      renderLivePreview();
      state.isCapturing = false;
      document.getElementById('btnCapture').disabled = false;
      document.getElementById('shotCounter').classList.remove('visible');
      document.getElementById('previewActions').style.display = 'flex';
      showReviewScreen();
    }

    if (state.timerSeconds > 0) {
      runCountdown(state.timerSeconds, doTheRetake);
    } else {
      doTheRetake();
    }
    return;
  }

  // Normal capture: reset if previous session complete
  if (state.boothComplete) resetBooth();

  state.isCapturing = true;
  document.getElementById('btnCapture').disabled = true;
  captureSequence(state.capturedPhotos.length, layout.shots);
}

function captureSequence(i, total) {
  if (i >= total) {
    state.isCapturing = false;
    state.boothComplete = true;
    document.getElementById('btnCapture').disabled = false;
    document.getElementById('shotCounter').classList.remove('visible');
    document.getElementById('previewActions').style.display = 'flex';
    showReviewScreen();
    return;
  }
  state.currentShot = i + 1;
  updateShotCounter(i + 1, total);
  var delay = i > 0 ? 600 : 0;
  setTimeout(function() {
    if (state.timerSeconds > 0) {
      runCountdown(state.timerSeconds, function() { doCapture(); setTimeout(function() { captureSequence(i+1, total); }, 200); });
    } else {
      doCapture(); setTimeout(function() { captureSequence(i+1, total); }, 200);
    }
  }, delay);
}

function doCapture() {
  state.capturedPhotos.push(captureFrame());
  if (state.settings.flash) triggerFlash();
  if (state.settings.sound) playShutter();
  renderLivePreview();
}

function captureFrame() {
  var video = document.getElementById('video');
  var c = document.createElement('canvas');
  c.width = video.videoWidth; c.height = video.videoHeight;
  var ctx = c.getContext('2d');
  if (state.settings.mirror) { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
  var f = findById(FILTERS, state.selectedFilter);
  if (f && f.css !== 'none') ctx.filter = f.css;
  ctx.drawImage(video, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none';
  return c.toDataURL('image/png');
}

function updateShotCounter(cur, total) {
  var el = document.getElementById('shotCounter');
  el.textContent = '\uD83D\uDCF8 ' + cur + ' / ' + total;
  el.classList.add('visible');
}

// ═══════════════════════════════════════════════════════════════
// REVIEW SCREEN
// ═══════════════════════════════════════════════════════════════

function showReviewScreen() {
  var grid = document.getElementById('reviewGrid');
  grid.innerHTML = '';
  state.capturedPhotos.forEach(function(photo, i) {
    var div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML =
      '<div class="review-img-wrap"><img src="' + photo + '" alt="Shot ' + (i+1) + '"></div>' +
      '<div class="review-item-controls">' +
        '<span class="review-num">#' + (i+1) + '</span>' +
        '<button class="btn-xs" onclick="initiateRetake(' + i + ')"><span class="material-icons-round">replay</span> Retake</button>' +
      '</div>';
    grid.appendChild(div);
  });
  document.getElementById('reviewModal').classList.add('active');
}

function initiateRetake(idx) {
  state.retakeIndex = idx;
  document.getElementById('reviewModal').classList.remove('active');
  showStatus('Retaking shot #' + (idx + 1) + ' — press capture', 'info');
  var btn = document.getElementById('btnCapture');
  btn.classList.remove('pulse-retake');
  void btn.offsetWidth; // force reflow to restart animation
  btn.classList.add('pulse-retake');
}

function approveAllPhotos() {
  document.getElementById('reviewModal').classList.remove('active');
  document.getElementById('previewActions').style.display = 'flex';
  showStatus('Rendering final photo...', 'info');

  renderLivePreviewAsync(function() {
    if (state.settings.saveToGallery) {
      saveToGallery(function(docId) {
        lastSavedDocId = docId;
        if (state.settings.showQR && docId) {
          drawQRBadge(docId);
          document.getElementById('btnViewQR').style.display = '';
          showStatus('\u2601\uFE0F Saved to cloud with QR!', 'success');
        } else if (state.settings.showQR) {
          drawQRBadge(null);
          showStatus('\uD83D\uDCF1 Saved locally (no QR link)', 'info');
        } else if (docId) {
          showStatus('\u2601\uFE0F Saved to cloud!', 'success');
        } else {
          showStatus('\uD83D\uDCF1 Saved locally', 'info');
        }
        startKioskTimer();
      });
    } else {
      if (state.settings.showQR) drawQRBadge(null);
      showStatus('Photos approved!', 'success');
      startKioskTimer();
    }
  });
}

// ─── Async preview render (waits for all images to load) ────────

function renderLivePreviewAsync(callback) {
  var canvas = document.getElementById('livePreviewCanvas');
  var ctx = canvas.getContext('2d');
  var layout = findById(LAYOUTS, state.selectedLayout);
  var frame = findById(FRAMES, state.selectedFrame);
  var size = SIZES[layout.size];

  canvas.width = size.w; canvas.height = size.h;
  var bgColor = (frame && frame.id !== 'none') ? frame.bg : '#FFFFFF';
  ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (frame && frame.filmHoles) drawFilmHoles(ctx, canvas.width, canvas.height);

  var slots = layout.getSlots(canvas.width, canvas.height);
  var isDark = bgColor === '#1A1A1A' || bgColor === '#111111';

  // Load ALL images first
  var images = [];
  var loaded = 0;
  var toLoad = 0;

  state.capturedPhotos.forEach(function(src, i) { if (src) toLoad++; });

  if (toLoad === 0) {
    drawAllPlaceholders(ctx, slots, isDark);
    drawBranding(ctx, canvas.width, canvas.height, bgColor);
    if (callback) callback();
    return;
  }

  state.capturedPhotos.forEach(function(src, i) {
    if (!src) { images[i] = null; return; }
    var img = new Image();
    img.onload = function() {
      images[i] = img;
      loaded++;
      if (loaded >= toLoad) {
        // All loaded — draw everything
        for (var j = 0; j < slots.length; j++) {
          if (images[j]) drawFittedImage(ctx, images[j], slots[j].x, slots[j].y, slots[j].w, slots[j].h);
          else drawPlaceholder(ctx, slots[j], j, isDark);
        }
        drawBranding(ctx, canvas.width, canvas.height, bgColor);
        if (frame && frame.accent) drawAccent(ctx, canvas.width, canvas.height, frame);
        if (callback) callback();
      }
    };
    img.onerror = function() {
      images[i] = null;
      loaded++;
      if (loaded >= toLoad) {
        for (var j = 0; j < slots.length; j++) {
          if (images[j]) drawFittedImage(ctx, images[j], slots[j].x, slots[j].y, slots[j].w, slots[j].h);
          else drawPlaceholder(ctx, slots[j], j, isDark);
        }
        drawBranding(ctx, canvas.width, canvas.height, bgColor);
        if (callback) callback();
      }
    };
    img.src = src;
  });
}

// ─── QR badge on print ──────────────────────────────────────────

function drawQRBadge(docId) {
  if (typeof qrcode === 'undefined') {
    console.warn('[QR] qrcode library not loaded');
    return;
  }

  var canvas = document.getElementById('livePreviewCanvas');
  var ctx = canvas.getContext('2d');
  var cw = canvas.width, ch = canvas.height;

  // If we have a doc ID, link directly to the public viewer
  // Otherwise fall back to gallery page
  var url;
  if (docId) {
    url = window.location.origin + '/Photobooth/view/?id=' + docId;
  } else {
    url = window.location.origin + '/Photobooth/gallery/';
  }

  try {
    var qr = qrcode(0, 'L');
    qr.addData(url);
    qr.make();

    var modules = qr.getModuleCount();
    var pixelSize = Math.max(2, Math.floor(Math.min(cw, ch) * 0.09 / modules));
    var qrSize = modules * pixelSize;
    var padding = pixelSize * 2;
    var totalW = qrSize + padding * 2;
    var totalH = totalW + pixelSize * 3; // extra for label

    var x = cw - totalW - cw * 0.03;
    var y = ch - totalH - ch * 0.01;

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, totalW, totalH);

    // QR modules
    for (var row = 0; row < modules; row++) {
      for (var col = 0; col < modules; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x + padding + col * pixelSize, y + padding + row * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // Label
    var label = docId ? 'Scan to Save' : 'Gallery';
    ctx.fillStyle = '#555555';
    ctx.font = '600 ' + Math.max(10, pixelSize * 2) + 'px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + totalW / 2, y + padding + qrSize + padding + pixelSize);
  } catch(e) {
    console.warn('[QR] Generation failed:', e);
  }
}

// ═══════════════════════════════════════════════════════════════
// GALLERY SAVE — Max 5 Firebase, overflow to local
// ═══════════════════════════════════════════════════════════════

var MAX_FIREBASE_GALLERY = 5;
var lastSavedDocId = null; // Track last Firebase doc ID for QR

function saveToGallery(callback) {
  var canvas = document.getElementById('livePreviewCanvas');
  var imageData = canvas.toDataURL('image/jpeg', 0.85);
  var user = null;
  try { user = firebase.auth().currentUser; } catch(e) {}

  var entry = {
    userId: user ? user.uid : 'anon',
    userName: user ? (user.displayName || user.email.split('@')[0]) : 'Guest',
    eventTitle: state.settings.eventTitle || 'Photo Booth',
    eventDate: state.settings.eventDate || new Date().toLocaleDateString(),
    layout: state.selectedLayout,
    frame: state.selectedFrame,
    filter: state.selectedFilter,
    imageData: imageData,
    createdAt: null,
    storage: 'local'
  };

  if (typeof db !== 'undefined' && db) {
    db.collection('gallery').get()
      .then(function(snapshot) {
        if (snapshot.size < MAX_FIREBASE_GALLERY) {
          entry.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          entry.storage = 'cloud';
          return db.collection('gallery').add(entry)
            .then(function(doc) {
              console.log('[Gallery] Saved to Firebase:', doc.id);
              if (callback) callback(doc.id);
            });
        } else {
          entry.createdAt = new Date().toISOString();
          entry.storage = 'local';
          saveLocalGallery(entry);
          if (callback) callback(null);
        }
      })
      .catch(function(err) {
        console.warn('[Gallery] Firebase error, saving locally:', err);
        entry.createdAt = new Date().toISOString();
        entry.storage = 'local';
        saveLocalGallery(entry);
        if (callback) callback(null);
      });
  } else {
    entry.createdAt = new Date().toISOString();
    entry.storage = 'local';
    saveLocalGallery(entry);
    if (callback) callback(null);
  }
}

function saveLocalGallery(entry) {
  try {
    var g = JSON.parse(localStorage.getItem('pb_gallery') || '[]');
    g.unshift(entry);
    if (g.length > 50) g = g.slice(0, 50);
    localStorage.setItem('pb_gallery', JSON.stringify(g));
  } catch(e) { console.warn('[Gallery] Local save failed:', e); }
}

// ═══════════════════════════════════════════════════════════════
// KIOSK MODE
// ═══════════════════════════════════════════════════════════════

function toggleKiosk() {
  state.kioskMode = !state.kioskMode;

  if (state.kioskMode) {
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (req) {
      req.call(el).then(function() {
        document.body.classList.add('kiosk-mode');
        showStatus('Kiosk mode ON', 'info');
      }).catch(function(err) {
        console.warn('Fullscreen failed:', err);
        // Still enter kiosk mode visually even if fullscreen fails
        document.body.classList.add('kiosk-mode');
        showStatus('Kiosk mode ON (fullscreen blocked by browser)', 'info');
      });
    } else {
      document.body.classList.add('kiosk-mode');
      showStatus('Kiosk mode ON', 'info');
    }
    startKioskTimer();
  } else {
    var exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (exitFS && document.fullscreenElement) {
      try { exitFS.call(document); } catch(e) {}
    }
    document.body.classList.remove('kiosk-mode');
    clearKioskTimer();
    showStatus('Kiosk mode OFF', 'info');
  }
  updateKioskBtn();
}

function updateKioskBtn() {
  var btn = document.getElementById('btnKiosk');
  if (btn) {
    btn.querySelector('.material-icons-round').textContent = state.kioskMode ? 'fullscreen_exit' : 'fullscreen';
    btn.title = state.kioskMode ? 'Exit Kiosk' : 'Kiosk Mode';
  }
}

function startKioskTimer() {
  if (!state.kioskMode || !state.boothComplete) return;
  clearKioskTimer();
  state.kioskResetTimer = setTimeout(function() {
    resetBooth();
    showStatus('Ready for next guest!', 'info');
  }, state.kioskAutoResetMs);
}

function clearKioskTimer() {
  if (state.kioskResetTimer) { clearTimeout(state.kioskResetTimer); state.kioskResetTimer = null; }
}

function resetKioskTimer() { if (state.kioskMode) clearKioskTimer(); }

document.addEventListener('fullscreenchange', function() {
  if (!document.fullscreenElement && state.kioskMode) {
    state.kioskMode = false;
    document.body.classList.remove('kiosk-mode');
    clearKioskTimer(); updateKioskBtn();
  }
});

// ═══════════════════════════════════════════════════════════════
// LIVE PREVIEW (sync — for during-capture display)
// ═══════════════════════════════════════════════════════════════

function renderLivePreview() {
  var canvas = document.getElementById('livePreviewCanvas');
  var ctx = canvas.getContext('2d');
  var layout = findById(LAYOUTS, state.selectedLayout);
  var frame = findById(FRAMES, state.selectedFrame);
  var size = SIZES[layout.size];

  canvas.width = size.w; canvas.height = size.h;
  var bgColor = (frame && frame.id !== 'none') ? frame.bg : '#FFFFFF';
  var isDark = bgColor === '#1A1A1A' || bgColor === '#111111';
  ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (frame && frame.filmHoles) drawFilmHoles(ctx, canvas.width, canvas.height);

  var slots = layout.getSlots(canvas.width, canvas.height);
  var toLoad = 0, loaded = 0;
  for (var i = 0; i < slots.length; i++) if (state.capturedPhotos[i]) toLoad++;

  if (toLoad === 0) {
    drawAllPlaceholders(ctx, slots, isDark);
    drawBranding(ctx, canvas.width, canvas.height, bgColor);
    if (frame && frame.accent) drawAccent(ctx, canvas.width, canvas.height, frame);
    return;
  }

  for (var j = 0; j < slots.length; j++) {
    (function(idx) {
      if (state.capturedPhotos[idx]) {
        var img = new Image();
        img.onload = function() {
          drawFittedImage(ctx, img, slots[idx].x, slots[idx].y, slots[idx].w, slots[idx].h);
          loaded++;
          if (loaded >= toLoad) {
            for (var k = 0; k < slots.length; k++) {
              if (!state.capturedPhotos[k]) drawPlaceholder(ctx, slots[k], k, isDark);
            }
            drawBranding(ctx, canvas.width, canvas.height, bgColor);
            if (frame && frame.accent) drawAccent(ctx, canvas.width, canvas.height, frame);
          }
        };
        img.src = state.capturedPhotos[idx];
      }
    })(j);
  }
}

// ─── Drawing helpers ────────────────────────────────────────────

function drawAllPlaceholders(ctx, slots, isDark) {
  for (var i = 0; i < slots.length; i++) drawPlaceholder(ctx, slots[i], i, isDark);
}

function drawPlaceholder(ctx, s, idx, isDark) {
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  ctx.font = 'bold ' + (s.h * 0.3) + 'px DM Sans, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(idx + 1), s.x + s.w / 2, s.y + s.h / 2);
}

function drawBranding(ctx, cw, ch, bgColor) {
  var isDark = bgColor === '#1A1A1A' || bgColor === '#111111';
  var textColor = isDark ? '#FFFFFF' : '#333333';
  var mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  var brandY = ch * 0.88, cx = cw / 2;
  if (state.settings.eventTitle) {
    ctx.fillStyle = textColor;
    ctx.font = '600 ' + (cw * 0.045) + 'px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.settings.eventTitle, cx, brandY);
  }
  if (state.settings.eventDate) {
    ctx.fillStyle = mutedColor;
    ctx.font = '400 ' + (cw * 0.03) + 'px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.settings.eventDate, cx, brandY + cw * 0.06);
  }
  if (!state.settings.eventTitle && !state.settings.eventDate) {
    ctx.fillStyle = mutedColor;
    ctx.font = '400 ' + (cw * 0.028) + 'px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\uD83D\uDCF8 Photo Booth', cx, brandY + cw * 0.02);
  }
}

function drawAccent(ctx, cw, ch, frame) {
  ctx.strokeStyle = frame.accent; ctx.lineWidth = 3;
  var p = cw * 0.06; ctx.strokeRect(p, p, cw - p * 2, ch - p * 2);
}

function drawFilmHoles(ctx, w, h) {
  var r = w * 0.025, pad = w * 0.05, gap = r * 4;
  ctx.fillStyle = '#333';
  for (var y = pad; y < h - pad; y += gap) {
    ctx.beginPath(); ctx.arc(pad * 0.6, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w - pad * 0.6, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

// ═══════════════════════════════════════════════════════════════
// UI RENDERERS
// ═══════════════════════════════════════════════════════════════

function renderLayouts() {
  var g = document.getElementById('layoutGrid'), h = '';
  LAYOUTS.forEach(function(l) {
    var sz = SIZES[l.size], v = sz.h > sz.w, mW = v ? 28 : 44, mH = v ? 50 : 30;
    var cW = l.miniCols > 1 ? (mW-4)/l.miniCols : mW-4, cH = l.miniRows > 1 ? (mH-4)/l.miniRows : mH-4;
    var d = ''; for (var i=0; i<Math.min(l.shots,l.miniCols*l.miniRows); i++) d += '<div style="width:'+cW+'px;height:'+cH+'px;"></div>';
    h += '<div class="layout-card'+(l.id===state.selectedLayout?' active':'')+'" onclick="selectLayout(\''+l.id+'\')">' +
      '<div class="layout-mini" style="width:'+mW+'px;height:'+mH+'px;display:grid;grid-template-columns:repeat('+l.miniCols+',1fr);grid-template-rows:repeat('+l.miniRows+',1fr);gap:2px;padding:2px;">' +
      d+'</div><span class="lbl">'+SIZES[l.size].label+'</span><span class="lname">'+l.name+'</span></div>';
  }); g.innerHTML = h;
}

function renderFrames() {
  var g = document.getElementById('frameGrid'), h = '';
  FRAMES.forEach(function(f) {
    var bg = f.bg || 'transparent', inner = f.id === 'none' ? '✕' : '';
    var bs = f.filmHoles ? '2px solid #333' : '2px solid ' + bg;
    h += '<div class="frame-card'+(f.id===state.selectedFrame?' active':'')+'" onclick="selectFrame(\''+f.id+'\')">' +
      '<div style="width:36px;height:28px;background:'+bg+';border:'+bs+';border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#8585A8;">'+inner+'</div>' +
      '<span>'+f.name+'</span></div>';
  }); g.innerHTML = h;
}

function renderFilters() {
  var g = document.getElementById('filterGrid'), h = '';
  FILTERS.forEach(function(f) {
    h += '<div class="filter-card'+(f.id===state.selectedFilter?' active':'')+'" onclick="selectFilter(\''+f.id+'\')">' +
      '<div class="filter-swatch" style="background:'+f.color+';"></div><span class="filter-name">'+f.name+'</span></div>';
  }); g.innerHTML = h;
}

function selectLayout(id) {
  if (state.isCapturing) return;
  var prev = state.selectedLayout; state.selectedLayout = id; renderLayouts();
  if (prev !== id) {
    state.capturedPhotos = []; state.boothComplete = false; state.retakeIndex = -1;
    document.getElementById('previewActions').style.display = 'none'; clearStatus();
  }
  renderLivePreview();
}
function selectFrame(id) { state.selectedFrame = id; renderFrames(); renderLivePreview(); }
function selectFilter(id) {
  state.selectedFilter = id; renderFilters();
  var v = document.getElementById('video'), f = findById(FILTERS, id);
  v.style.filter = (f && f.css !== 'none') ? f.css : 'none';
}

// ─── Actions ────────────────────────────────────────────────────

function resetBooth() {
  state.capturedPhotos = []; state.boothComplete = false;
  state.currentShot = 0; state.retakeIndex = -1;
  lastSavedDocId = null;
  document.getElementById('previewActions').style.display = 'none';
  document.getElementById('btnViewQR').style.display = 'none';
  document.getElementById('shotCounter').classList.remove('visible');
  document.getElementById('reviewModal').classList.remove('active');
  clearStatus(); clearKioskTimer(); renderLivePreview();
}

function downloadPhoto() {
  var canvas = document.getElementById('livePreviewCanvas');
  var layout = findById(LAYOUTS, state.selectedLayout);
  var a = document.createElement('a');
  a.download = 'photobooth_' + layout.size + '_' + Date.now() + '.png';
  a.href = canvas.toDataURL('image/png');
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function printPhoto() {
  var canvas = document.getElementById('livePreviewCanvas');
  var dataUrl = canvas.toDataURL('image/png');
  var layout = findById(LAYOUTS, state.selectedLayout);
  var size = SIZES[layout.size], pw = size.w/DPI, ph = size.h/DPI;
  var pf = document.getElementById('printFrame');
  var doc = pf.contentDocument || pf.contentWindow.document;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><style>@page{size:'+pw+'in '+ph+'in;margin:0}*{margin:0;padding:0}body{width:'+pw+'in;height:'+ph+'in;display:flex;align-items:center;justify-content:center}img{width:'+pw+'in;height:'+ph+'in;object-fit:contain}</style></head><body><img src="'+dataUrl+'" onload="setTimeout(function(){window.print()},300)"></body></html>');
  doc.close();
}

// ─── Email ──────────────────────────────────────────────────────

// ─── QR Modal ───────────────────────────────────────────────────

function showQRModal() {
  if (!lastSavedDocId || typeof qrcode === 'undefined') return;

  var url = window.location.origin + '/Photobooth/view/?id=' + lastSavedDocId;
  var canvas = document.getElementById('qrModalCanvas');
  var ctx = canvas.getContext('2d');

  try {
    var qr = qrcode(0, 'L');
    qr.addData(url);
    qr.make();

    var modules = qr.getModuleCount();
    var size = modules * 8; // 8px per module for crisp display
    canvas.width = size;
    canvas.height = size;

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw modules
    for (var row = 0; row < modules; row++) {
      for (var col = 0; col < modules; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(col * 8, row * 8, 8, 8);
        }
      }
    }
  } catch(e) {
    console.warn('[QR Modal] Failed:', e);
    return;
  }

  document.getElementById('qrModalUrl').textContent = url;
  document.getElementById('qrModal').classList.add('active');
}

function closeQRModal() {
  document.getElementById('qrModal').classList.remove('active');
}

// ─── Email ──────────────────────────────────────────────────────

function openEmailModal() { document.getElementById('emailModal').classList.add('active'); document.getElementById('emailStatus').textContent = ''; }
function closeEmailModal() { document.getElementById('emailModal').classList.remove('active'); }

function sendEmail() {
  var name = document.getElementById('recipientName').value.trim();
  var email = document.getElementById('recipientEmail').value.trim();
  var st = document.getElementById('emailStatus');
  if (!name) { st.textContent = 'Please enter your name.'; st.className = 'email-status err'; return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { st.textContent = 'Please enter a valid email.'; st.className = 'email-status err'; return; }
  var s = state.settings;
  if (!s.emailPublicKey || !s.emailServiceId || !s.emailTemplateId) { st.textContent = 'EmailJS not configured. Go to Settings.'; st.className = 'email-status err'; return; }
  st.textContent = 'Sending...'; st.className = 'email-status sending';
  document.getElementById('btnSendEmail').disabled = true;
  emailjs.init(s.emailPublicKey);
  emailjs.send(s.emailServiceId, s.emailTemplateId, {
    to_name: name, to_email: email, from_name: s.eventTitle || 'DSnap',
    event_name: s.eventTitle || 'DSnap', event_date: s.eventDate || new Date().toLocaleDateString(),
    message: 'Here is your photo!', image: document.getElementById('livePreviewCanvas').toDataURL('image/png')
  }).then(function() {
    st.textContent = '\u2705 Sent to ' + email + '!'; st.className = 'email-status sent';
    document.getElementById('btnSendEmail').disabled = false;
  }).catch(function() {
    st.textContent = '\u274C Failed. Check EmailJS config.'; st.className = 'email-status err';
    document.getElementById('btnSendEmail').disabled = false;
  });
}

// ─── Settings ───────────────────────────────────────────────────

function toggleSettings() { document.getElementById('settingsModal').classList.toggle('active'); }

function updateSettings() {
  state.settings.mirror = document.getElementById('settingMirror').checked;
  state.settings.flash = document.getElementById('settingFlash').checked;
  state.settings.sound = document.getElementById('settingSound').checked;
  state.settings.eventTitle = document.getElementById('settingTitle').value.trim();
  state.settings.eventDate = document.getElementById('settingDate').value.trim();
  state.settings.emailPublicKey = document.getElementById('settingEmailPublicKey').value.trim();
  state.settings.emailServiceId = document.getElementById('settingEmailServiceId').value.trim();
  state.settings.emailTemplateId = document.getElementById('settingEmailTemplateId').value.trim();
  state.settings.showQR = document.getElementById('settingShowQR').checked;
  state.settings.saveToGallery = document.getElementById('settingSaveGallery').checked;
  document.getElementById('video').classList.toggle('no-mirror', !state.settings.mirror);
  saveSettings(); renderLivePreview();
}

function saveSettings() { try { localStorage.setItem('photobooth_settings', JSON.stringify(state.settings)); } catch(e) {} }

function loadSettings() {
  try {
    var saved = localStorage.getItem('photobooth_settings');
    if (saved) { var p = JSON.parse(saved); Object.keys(p).forEach(function(k) { if (state.settings.hasOwnProperty(k)) state.settings[k] = p[k]; }); }
  } catch(e) {}
  var map = {settingMirror:'mirror',settingFlash:'flash',settingSound:'sound',settingTitle:'eventTitle',settingDate:'eventDate',settingEmailPublicKey:'emailPublicKey',settingEmailServiceId:'emailServiceId',settingEmailTemplateId:'emailTemplateId',settingShowQR:'showQR',settingSaveGallery:'saveToGallery'};
  Object.keys(map).forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    var v = state.settings[map[id]];
    if (el.type === 'checkbox') el.checked = v; else el.value = v || '';
  });
}

// ─── Effects ────────────────────────────────────────────────────

function runCountdown(sec, cb) {
  var ov = document.getElementById('countdownOverlay'), num = document.getElementById('countdownNumber');
  ov.classList.add('active'); var c = sec; num.textContent = c;
  var iv = setInterval(function() { c--; if (c <= 0) { clearInterval(iv); ov.classList.remove('active'); cb(); } else num.textContent = c; }, 1000);
}
function triggerFlash() { var f = document.getElementById('flashOverlay'); f.classList.add('flash'); setTimeout(function() { f.classList.remove('flash'); }, 150); }
function playShutter() {
  try {
    var ac = new (window.AudioContext || window.webkitAudioContext)(), osc = ac.createOscillator(), g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.frequency.setValueAtTime(800, ac.currentTime); osc.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.08);
    g.gain.setValueAtTime(0.3, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.08);
    osc.start(); osc.stop(ac.currentTime + 0.1);
  } catch(e) {}
}

// ─── Utilities ──────────────────────────────────────────────────

function findById(a, id) { for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
function drawFittedImage(ctx, img, x, y, w, h) {
  var ir = img.width/img.height, sr = w/h, sx, sy, sw, sh;
  if (ir > sr) { sh = img.height; sw = sh * sr; sx = (img.width - sw) / 2; sy = 0; }
  else { sw = img.width; sh = sw / sr; sx = 0; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
function showStatus(msg, type) { var el = document.getElementById('statusMsg'); el.textContent = msg; el.className = 'status-msg ' + (type || ''); }
function clearStatus() { var el = document.getElementById('statusMsg'); if (el) { el.textContent = ''; el.className = 'status-msg'; } }
