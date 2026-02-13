/* ════════════════════════════════════════
   PHOTO BOOTH — GitHub Pages Edition
   Camera, layouts, live preview, email
   ════════════════════════════════════════ */

'use strict';

// ─── Standard Print Sizes at 300 DPI ────────────────────────────

const DPI = 300;
const SIZES = {
  '2x6':  { w: 2 * DPI, h: 6 * DPI,  label: '2×6"' },
  '4x6':  { w: 4 * DPI, h: 6 * DPI,  label: '4×6"' },
  '4x6L': { w: 6 * DPI, h: 4 * DPI,  label: '4×6" L' },
};

// ─── Layout Definitions ─────────────────────────────────────────

const LAYOUTS = [
  {
    id: '2x6_3', name: '2×6 Classic', desc: '3 Photos', size: '2x6',
    shots: 3, miniCols: 1, miniRows: 3,
    getSlots: function(cw, ch) {
      var pad = cw * 0.05, gap = cw * 0.03;
      var slotW = cw - pad * 2;
      var top = ch * 0.82;
      var slotH = (top - pad - gap * 2) / 3;
      var slots = [];
      for (var i = 0; i < 3; i++) {
        slots.push({ x: pad, y: pad + i * (slotH + gap), w: slotW, h: slotH });
      }
      return slots;
    }
  },
  {
    id: '2x6_4', name: '2×6 Strip', desc: '4 Photos', size: '2x6',
    shots: 4, miniCols: 1, miniRows: 4,
    getSlots: function(cw, ch) {
      var pad = cw * 0.05, gap = cw * 0.025;
      var slotW = cw - pad * 2;
      var top = ch * 0.85;
      var slotH = (top - pad - gap * 3) / 4;
      var slots = [];
      for (var i = 0; i < 4; i++) {
        slots.push({ x: pad, y: pad + i * (slotH + gap), w: slotW, h: slotH });
      }
      return slots;
    }
  },
  {
    id: '4x6_single', name: '4×6 Single', desc: '1 Photo', size: '4x6',
    shots: 1, miniCols: 1, miniRows: 1,
    getSlots: function(cw, ch) {
      var pad = cw * 0.04;
      return [{ x: pad, y: pad, w: cw - pad * 2, h: ch * 0.88 - pad }];
    }
  },
  {
    id: '4x6_3', name: '4×6 Triple', desc: '3 Photos', size: '4x6',
    shots: 3, miniCols: 1, miniRows: 3,
    getSlots: function(cw, ch) {
      var pad = cw * 0.04, gap = cw * 0.02;
      var slotW = cw - pad * 2;
      var top = ch * 0.85;
      var slotH = (top - pad - gap * 2) / 3;
      var slots = [];
      for (var i = 0; i < 3; i++) {
        slots.push({ x: pad, y: pad + i * (slotH + gap), w: slotW, h: slotH });
      }
      return slots;
    }
  },
  {
    id: '4x6_4grid', name: '4×6 Grid', desc: '4 Photos', size: '4x6',
    shots: 4, miniCols: 2, miniRows: 2,
    getSlots: function(cw, ch) {
      var pad = cw * 0.04, gap = cw * 0.02;
      var slotW = (cw - pad * 2 - gap) / 2;
      var top = ch * 0.82;
      var slotH = (top - pad - gap) / 2;
      var slots = [];
      for (var r = 0; r < 2; r++) {
        for (var c = 0; c < 2; c++) {
          slots.push({
            x: pad + c * (slotW + gap),
            y: pad + r * (slotH + gap),
            w: slotW, h: slotH
          });
        }
      }
      return slots;
    }
  },
  {
    id: '4x6_collage', name: '4×6 Collage', desc: '3 Photos', size: '4x6',
    shots: 3, miniCols: 2, miniRows: 2,
    getSlots: function(cw, ch) {
      var pad = cw * 0.04, gap = cw * 0.02;
      var areaH = ch * 0.82 - pad;
      var topH = areaH * 0.55;
      var botH = areaH * 0.45 - gap;
      var halfW = (cw - pad * 2 - gap) / 2;
      return [
        { x: pad, y: pad, w: cw - pad * 2, h: topH },
        { x: pad, y: pad + topH + gap, w: halfW, h: botH },
        { x: pad + halfW + gap, y: pad + topH + gap, w: halfW, h: botH }
      ];
    }
  },
  {
    id: '4x6L_2up', name: '4×6 Landscape', desc: '2 Photos', size: '4x6L',
    shots: 2, miniCols: 2, miniRows: 1,
    getSlots: function(cw, ch) {
      var pad = cw * 0.03, gap = cw * 0.02;
      var slotW = (cw - pad * 2 - gap) / 2;
      var slotH = ch * 0.78 - pad;
      return [
        { x: pad, y: pad, w: slotW, h: slotH },
        { x: pad + slotW + gap, y: pad, w: slotW, h: slotH }
      ];
    }
  },
  {
    id: '4x6_6grid', name: '4×6 Six-Up', desc: '6 Photos', size: '4x6',
    shots: 6, miniCols: 2, miniRows: 3,
    getSlots: function(cw, ch) {
      var pad = cw * 0.03, gap = cw * 0.02;
      var slotW = (cw - pad * 2 - gap) / 2;
      var top = ch * 0.85;
      var slotH = (top - pad - gap * 2) / 3;
      var slots = [];
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 2; c++) {
          slots.push({
            x: pad + c * (slotW + gap),
            y: pad + r * (slotH + gap),
            w: slotW, h: slotH
          });
        }
      }
      return slots;
    }
  },
];

// ─── Frame Definitions ──────────────────────────────────────────

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

// ─── Filter Definitions ─────────────────────────────────────────

var FILTERS = [
  { id: 'none',  name: 'Normal', css: 'none',                                              color: '#888' },
  { id: 'bw',    name: 'B&W',    css: 'grayscale(100%)',                                   color: '#555' },
  { id: 'sepia', name: 'Sepia',  css: 'sepia(80%)',                                        color: '#8B7355' },
  { id: 'warm',  name: 'Warm',   css: 'saturate(130%) hue-rotate(-10deg)',                 color: '#D4886B' },
  { id: 'cool',  name: 'Cool',   css: 'saturate(110%) hue-rotate(20deg) brightness(1.05)', color: '#6B8DD4' },
  { id: 'vivid', name: 'Vivid',  css: 'saturate(180%) contrast(110%)',                     color: '#E84393' },
  { id: 'fade',  name: 'Fade',   css: 'contrast(90%) brightness(110%) saturate(80%)',      color: '#B0A8A8' },
  { id: 'noir',  name: 'Noir',   css: 'grayscale(100%) contrast(140%) brightness(90%)',    color: '#333' },
];

// ─── App State ──────────────────────────────────────────────────

var state = {
  stream: null,
  cameraReady: false,
  facingMode: 'user',
  timerSeconds: 0,
  selectedLayout: '2x6_3',
  selectedFrame: 'white',
  selectedFilter: 'none',
  capturedPhotos: [],
  isCapturing: false,
  currentShot: 0,
  boothComplete: false,
  settings: {
    mirror: true,
    flash: true,
    sound: true,
    eventTitle: '',
    eventDate: '',
    emailPublicKey: '',
    emailServiceId: '',
    emailTemplateId: ''
  }
};

// ─── Initialize ─────────────────────────────────────────────────

// Called by onAuthReady() after login confirmed
var boothInitialized = false;
function initPhotoBooth() {
  if (boothInitialized) return;
  boothInitialized = true;
  loadSettings();
  renderLayouts();
  renderFrames();
  renderFilters();
  renderLivePreview();
  startCamera();
}

// ─── Camera ─────────────────────────────────────────────────────

function startCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach(function(t) { t.stop(); });
  }

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: state.facingMode,
      width: { ideal: 1280 },
      height: { ideal: 960 }
    },
    audio: false
  })
  .then(function(stream) {
    state.stream = stream;
    var video = document.getElementById('video');
    video.srcObject = stream;
    return video.play();
  })
  .then(function() {
    state.cameraReady = true;
    document.getElementById('cameraOff').classList.add('hidden');
  })
  .catch(function(err) {
    console.error('Camera error:', err);
    document.getElementById('cameraOff').classList.remove('hidden');
  });
}

function flipCamera() {
  state.facingMode = state.facingMode === 'user' ? 'environment' : 'user';
  startCamera();
}

function cycleTimer() {
  var timers = [0, 3, 5, 10];
  var idx = timers.indexOf(state.timerSeconds);
  state.timerSeconds = timers[(idx + 1) % timers.length];
  document.getElementById('timerBadge').textContent = state.timerSeconds === 0 ? 'OFF' : state.timerSeconds + 's';
}

// ─── Capture Flow ───────────────────────────────────────────────

function startCapture() {
  if (!state.cameraReady || state.isCapturing) return;

  var layout = findById(LAYOUTS, state.selectedLayout);

  if (state.boothComplete) {
    resetBooth();
  }

  state.isCapturing = true;
  document.getElementById('btnCapture').disabled = true;

  var totalShots = layout.shots;
  var shotIndex = state.capturedPhotos.length;

  captureSequence(shotIndex, totalShots);
}

function captureSequence(i, total) {
  if (i >= total) {
    state.isCapturing = false;
    state.boothComplete = true;
    document.getElementById('btnCapture').disabled = false;
    document.getElementById('shotCounter').classList.remove('visible');
    document.getElementById('previewActions').style.display = 'flex';
    return;
  }

  state.currentShot = i + 1;
  updateShotCounter(state.currentShot, total);

  var delay = i > state.capturedPhotos.length - 1 && i > 0 ? 600 : 0;

  setTimeout(function() {
    if (state.timerSeconds > 0) {
      runCountdown(state.timerSeconds, function() {
        doCapture();
        setTimeout(function() { captureSequence(i + 1, total); }, 200);
      });
    } else {
      doCapture();
      setTimeout(function() { captureSequence(i + 1, total); }, 200);
    }
  }, delay);
}

function doCapture() {
  var photoData = captureFrame();
  state.capturedPhotos.push(photoData);

  if (state.settings.flash) triggerFlash();
  if (state.settings.sound) playShutter();

  renderLivePreview();
}

function captureFrame() {
  var video = document.getElementById('video');
  var canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  var ctx = canvas.getContext('2d');

  if (state.settings.mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  var filter = findById(FILTERS, state.selectedFilter);
  if (filter && filter.css !== 'none') {
    ctx.filter = filter.css;
  }

  ctx.drawImage(video, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = 'none';

  return canvas.toDataURL('image/png');
}

function updateShotCounter(current, total) {
  var el = document.getElementById('shotCounter');
  el.textContent = '\uD83D\uDCF8 ' + current + ' / ' + total;
  el.classList.add('visible');
}

// ─── Live Preview Renderer ──────────────────────────────────────

function renderLivePreview() {
  var canvas = document.getElementById('livePreviewCanvas');
  var ctx = canvas.getContext('2d');
  var layout = findById(LAYOUTS, state.selectedLayout);
  var frame = findById(FRAMES, state.selectedFrame);
  var size = SIZES[layout.size];

  canvas.width = size.w;
  canvas.height = size.h;

  // Background
  var bgColor = (frame && frame.id !== 'none') ? frame.bg : '#FFFFFF';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Film holes
  if (frame && frame.filmHoles) {
    drawFilmHoles(ctx, canvas.width, canvas.height);
  }

  var slots = layout.getSlots(canvas.width, canvas.height);
  var photosLoaded = 0;
  var totalToLoad = 0;

  // Count photos that need loading
  for (var i = 0; i < slots.length; i++) {
    if (state.capturedPhotos[i]) totalToLoad++;
  }

  if (totalToLoad === 0) {
    // No photos yet, just draw placeholders
    drawPlaceholders(ctx, slots, bgColor);
    drawBranding(ctx, canvas.width, canvas.height, bgColor);
    if (frame && frame.accent) drawAccent(ctx, canvas.width, canvas.height, frame);
    return;
  }

  // Load and draw photos
  for (var j = 0; j < slots.length; j++) {
    (function(idx) {
      var slot = slots[idx];
      if (state.capturedPhotos[idx]) {
        var img = new Image();
        img.onload = function() {
          drawFittedImage(ctx, img, slot.x, slot.y, slot.w, slot.h);
          photosLoaded++;
          if (photosLoaded >= totalToLoad) {
            // All loaded — draw remaining placeholders, branding, accents
            drawRemainingPlaceholders(ctx, slots, bgColor);
            drawBranding(ctx, canvas.width, canvas.height, bgColor);
            if (frame && frame.accent) drawAccent(ctx, canvas.width, canvas.height, frame);
          }
        };
        img.src = state.capturedPhotos[idx];
      }
    })(j);
  }
}

function drawPlaceholders(ctx, slots, bgColor) {
  var isDark = bgColor === '#1A1A1A' || bgColor === '#111111';
  for (var i = 0; i < slots.length; i++) {
    var s = slots[i];
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
    ctx.font = 'bold ' + (s.h * 0.3) + 'px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), s.x + s.w / 2, s.y + s.h / 2);
  }
}

function drawRemainingPlaceholders(ctx, slots, bgColor) {
  var isDark = bgColor === '#1A1A1A' || bgColor === '#111111';
  for (var i = 0; i < slots.length; i++) {
    if (!state.capturedPhotos[i]) {
      var s = slots[i];
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
      ctx.font = 'bold ' + (s.h * 0.3) + 'px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), s.x + s.w / 2, s.y + s.h / 2);
    }
  }
}

function drawBranding(ctx, cw, ch, bgColor) {
  var isDark = bgColor === '#1A1A1A' || bgColor === '#111111';
  var textColor = isDark ? '#FFFFFF' : '#333333';
  var mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  var brandY = ch * 0.88;
  var centerX = cw / 2;

  if (state.settings.eventTitle) {
    ctx.fillStyle = textColor;
    ctx.font = '600 ' + (cw * 0.045) + 'px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.settings.eventTitle, centerX, brandY);
  }

  if (state.settings.eventDate) {
    ctx.fillStyle = mutedColor;
    ctx.font = '400 ' + (cw * 0.03) + 'px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.settings.eventDate, centerX, brandY + cw * 0.06);
  }

  if (!state.settings.eventTitle && !state.settings.eventDate) {
    ctx.fillStyle = mutedColor;
    ctx.font = '400 ' + (cw * 0.028) + 'px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\uD83D\uDCF8 Photo Booth', centerX, brandY + cw * 0.02);
  }
}

function drawAccent(ctx, cw, ch, frame) {
  ctx.strokeStyle = frame.accent;
  ctx.lineWidth = 3;
  var pad = cw * 0.06;
  ctx.strokeRect(pad, pad, cw - pad * 2, ch - pad * 2);
}

function drawFilmHoles(ctx, w, h) {
  var holeR = w * 0.025;
  var pad = w * 0.05;
  var gap = holeR * 4;
  ctx.fillStyle = '#333';
  for (var y = pad; y < h - pad; y += gap) {
    ctx.beginPath();
    ctx.arc(pad * 0.6, y, holeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - pad * 0.6, y, holeR, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── UI Renderers ───────────────────────────────────────────────

function renderLayouts() {
  var grid = document.getElementById('layoutGrid');
  var html = '';

  LAYOUTS.forEach(function(l) {
    var size = SIZES[l.size];
    var isVert = size.h > size.w;
    var miniW = isVert ? 28 : 44;
    var miniH = isVert ? 50 : 30;
    var cellW = l.miniCols > 1 ? (miniW - 4) / l.miniCols : miniW - 4;
    var cellH = l.miniRows > 1 ? (miniH - 4) / l.miniRows : miniH - 4;
    var divs = '';
    var count = Math.min(l.shots, l.miniCols * l.miniRows);
    for (var i = 0; i < count; i++) {
      divs += '<div style="width:' + cellW + 'px;height:' + cellH + 'px;"></div>';
    }

    html += '<div class="layout-card' + (l.id === state.selectedLayout ? ' active' : '') + '" onclick="selectLayout(\'' + l.id + '\')">' +
      '<div class="layout-mini" style="width:' + miniW + 'px;height:' + miniH + 'px;display:grid;grid-template-columns:repeat(' + l.miniCols + ',1fr);grid-template-rows:repeat(' + l.miniRows + ',1fr);gap:2px;padding:2px;">' +
      divs + '</div>' +
      '<span class="lbl">' + SIZES[l.size].label + '</span>' +
      '<span class="lname">' + l.name + '</span></div>';
  });

  grid.innerHTML = html;
}

function renderFrames() {
  var grid = document.getElementById('frameGrid');
  var html = '';

  FRAMES.forEach(function(f) {
    var bg = f.bg || 'transparent';
    var inner = f.id === 'none' ? '✕' : '';
    var borderStyle = f.filmHoles ? '2px solid #333' : '2px solid ' + bg;
    html += '<div class="frame-card' + (f.id === state.selectedFrame ? ' active' : '') + '" onclick="selectFrame(\'' + f.id + '\')">' +
      '<div style="width:36px;height:28px;background:' + bg + ';border:' + borderStyle + ';border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#8585A8;">' + inner + '</div>' +
      '<span>' + f.name + '</span></div>';
  });

  grid.innerHTML = html;
}

function renderFilters() {
  var grid = document.getElementById('filterGrid');
  var html = '';

  FILTERS.forEach(function(f) {
    html += '<div class="filter-card' + (f.id === state.selectedFilter ? ' active' : '') + '" onclick="selectFilter(\'' + f.id + '\')">' +
      '<div class="filter-swatch" style="background:' + f.color + ';"></div>' +
      '<span class="filter-name">' + f.name + '</span></div>';
  });

  grid.innerHTML = html;
}

// ─── Selection Handlers ─────────────────────────────────────────

function selectLayout(id) {
  if (state.isCapturing) return;
  var prev = state.selectedLayout;
  state.selectedLayout = id;
  renderLayouts();
  if (prev !== id) {
    state.capturedPhotos = [];
    state.boothComplete = false;
    document.getElementById('previewActions').style.display = 'none';
    clearStatus();
  }
  renderLivePreview();
}

function selectFrame(id) {
  state.selectedFrame = id;
  renderFrames();
  renderLivePreview();
}

function selectFilter(id) {
  state.selectedFilter = id;
  renderFilters();
  var video = document.getElementById('video');
  var filter = findById(FILTERS, id);
  video.style.filter = (filter && filter.css !== 'none') ? filter.css : 'none';
}

// ─── Actions ────────────────────────────────────────────────────

function resetBooth() {
  state.capturedPhotos = [];
  state.boothComplete = false;
  state.currentShot = 0;
  document.getElementById('previewActions').style.display = 'none';
  document.getElementById('shotCounter').classList.remove('visible');
  clearStatus();
  renderLivePreview();
}

function downloadPhoto() {
  var canvas = document.getElementById('livePreviewCanvas');
  var layout = findById(LAYOUTS, state.selectedLayout);
  var link = document.createElement('a');
  link.download = 'photobooth_' + layout.size + '_' + Date.now() + '.png';
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printPhoto() {
  var canvas = document.getElementById('livePreviewCanvas');
  var dataUrl = canvas.toDataURL('image/png');
  var layout = findById(LAYOUTS, state.selectedLayout);
  var size = SIZES[layout.size];
  var printW = size.w / DPI;
  var printH = size.h / DPI;

  var printFrame = document.getElementById('printFrame');
  var doc = printFrame.contentDocument || printFrame.contentWindow.document;

  doc.open();
  doc.write(
    '<!DOCTYPE html><html><head><style>' +
    '@page { size: ' + printW + 'in ' + printH + 'in; margin: 0; }' +
    '* { margin: 0; padding: 0; }' +
    'body { width: ' + printW + 'in; height: ' + printH + 'in; display: flex; align-items: center; justify-content: center; }' +
    'img { width: ' + printW + 'in; height: ' + printH + 'in; object-fit: contain; }' +
    '</style></head><body>' +
    '<img src="' + dataUrl + '" onload="setTimeout(function(){window.print();},300);">' +
    '</body></html>'
  );
  doc.close();
}

// ─── Email ──────────────────────────────────────────────────────

function openEmailModal() {
  document.getElementById('emailModal').classList.add('active');
  document.getElementById('emailStatus').textContent = '';
  document.getElementById('emailStatus').className = 'email-status';
}

function closeEmailModal() {
  document.getElementById('emailModal').classList.remove('active');
}

function sendEmail() {
  var name = document.getElementById('recipientName').value.trim();
  var email = document.getElementById('recipientEmail').value.trim();
  var statusEl = document.getElementById('emailStatus');

  // Validate
  if (!name) {
    statusEl.textContent = 'Please enter your name.';
    statusEl.className = 'email-status err';
    return;
  }
  if (!email || !isValidEmail(email)) {
    statusEl.textContent = 'Please enter a valid email address.';
    statusEl.className = 'email-status err';
    return;
  }

  var s = state.settings;
  if (!s.emailPublicKey || !s.emailServiceId || !s.emailTemplateId) {
    statusEl.textContent = 'EmailJS is not configured. Go to Settings to add your keys.';
    statusEl.className = 'email-status err';
    return;
  }

  statusEl.textContent = 'Sending...';
  statusEl.className = 'email-status sending';
  document.getElementById('btnSendEmail').disabled = true;

  var canvas = document.getElementById('livePreviewCanvas');
  var imageData = canvas.toDataURL('image/png');

  // Initialize EmailJS
  emailjs.init(s.emailPublicKey);

  emailjs.send(s.emailServiceId, s.emailTemplateId, {
    to_name: name,
    to_email: email,
    from_name: s.eventTitle || 'Photo Booth',
    event_name: s.eventTitle || 'Photo Booth',
    event_date: s.eventDate || new Date().toLocaleDateString(),
    message: 'Here is your photo from ' + (s.eventTitle || 'the Photo Booth') + '! Thanks for joining us.',
    image: imageData
  })
  .then(function() {
    statusEl.textContent = '✅ Photo sent to ' + email + '!';
    statusEl.className = 'email-status sent';
    document.getElementById('btnSendEmail').disabled = false;
  })
  .catch(function(err) {
    console.error('EmailJS error:', err);
    statusEl.textContent = '❌ Failed to send. Check your EmailJS config.';
    statusEl.className = 'email-status err';
    document.getElementById('btnSendEmail').disabled = false;
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Settings ───────────────────────────────────────────────────

function toggleSettings() {
  document.getElementById('settingsModal').classList.toggle('active');
}

function updateSettings() {
  state.settings.mirror = document.getElementById('settingMirror').checked;
  state.settings.flash = document.getElementById('settingFlash').checked;
  state.settings.sound = document.getElementById('settingSound').checked;
  state.settings.eventTitle = document.getElementById('settingTitle').value.trim();
  state.settings.eventDate = document.getElementById('settingDate').value.trim();
  state.settings.emailPublicKey = document.getElementById('settingEmailPublicKey').value.trim();
  state.settings.emailServiceId = document.getElementById('settingEmailServiceId').value.trim();
  state.settings.emailTemplateId = document.getElementById('settingEmailTemplateId').value.trim();

  var video = document.getElementById('video');
  if (state.settings.mirror) {
    video.classList.remove('no-mirror');
  } else {
    video.classList.add('no-mirror');
  }

  saveSettings();
  renderLivePreview();
}

function saveSettings() {
  try {
    localStorage.setItem('photobooth_settings', JSON.stringify(state.settings));
  } catch (e) {
    // localStorage not available
  }
}

function loadSettings() {
  try {
    var saved = localStorage.getItem('photobooth_settings');
    if (saved) {
      var parsed = JSON.parse(saved);
      Object.keys(parsed).forEach(function(key) {
        if (state.settings.hasOwnProperty(key)) {
          state.settings[key] = parsed[key];
        }
      });

      // Sync UI
      document.getElementById('settingMirror').checked = state.settings.mirror;
      document.getElementById('settingFlash').checked = state.settings.flash;
      document.getElementById('settingSound').checked = state.settings.sound;
      document.getElementById('settingTitle').value = state.settings.eventTitle;
      document.getElementById('settingDate').value = state.settings.eventDate;
      document.getElementById('settingEmailPublicKey').value = state.settings.emailPublicKey;
      document.getElementById('settingEmailServiceId').value = state.settings.emailServiceId;
      document.getElementById('settingEmailTemplateId').value = state.settings.emailTemplateId;
    }
  } catch (e) {
    // localStorage not available
  }
}

// ─── Countdown & Effects ────────────────────────────────────────

function runCountdown(seconds, callback) {
  var overlay = document.getElementById('countdownOverlay');
  var number = document.getElementById('countdownNumber');
  overlay.classList.add('active');
  var count = seconds;
  number.textContent = count;

  var interval = setInterval(function() {
    count--;
    if (count <= 0) {
      clearInterval(interval);
      overlay.classList.remove('active');
      callback();
    } else {
      number.textContent = count;
    }
  }, 1000);
}

function triggerFlash() {
  var flash = document.getElementById('flashOverlay');
  flash.classList.add('flash');
  setTimeout(function() { flash.classList.remove('flash'); }, 150);
}

function playShutter() {
  try {
    var ac = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.setValueAtTime(800, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.08);
    osc.start();
    osc.stop(ac.currentTime + 0.1);
  } catch (e) {
    // Audio not critical
  }
}

// ─── Utilities ──────────────────────────────────────────────────

function findById(arr, id) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return arr[i];
  }
  return null;
}

function drawFittedImage(ctx, img, x, y, w, h) {
  var imgR = img.width / img.height;
  var slotR = w / h;
  var sx, sy, sw, sh;
  if (imgR > slotR) {
    sh = img.height;
    sw = sh * slotR;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / slotR;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function clearStatus() {
  var el = document.getElementById('statusMsg');
  el.textContent = '';
  el.className = 'status-msg';
}
