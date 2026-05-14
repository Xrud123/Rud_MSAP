/* ══════════════════════════════════════════════
   Photo Story Poster Lab — script.js
   Pure client-side · No backend required
   Features: 10 styles · image filters · local text
            generation · touch support · inline
            overlay editor · PNG/JPEG/WEBP export
   ══════════════════════════════════════════════ */

// ── DOM refs ────────────────────────────────────
const imageInput        = document.getElementById('imageInput');
const canvas            = document.getElementById('posterCanvas');
const ctx               = canvas.getContext('2d');
const titleInput        = document.getElementById('titleInput');
const subtitleInput     = document.getElementById('subtitleInput');
const yearInput         = document.getElementById('yearInput');
const extraInput        = document.getElementById('extraInput');
const accentColorInput  = document.getElementById('accentColor');
const filterSelect      = document.getElementById('filterSelect');
const brightnessSlider  = document.getElementById('brightness');
const contrastSlider    = document.getElementById('contrast');
const satSlider         = document.getElementById('saturation');
const brightVal         = document.getElementById('brightVal');
const contrastVal       = document.getElementById('contrastVal');
const satVal            = document.getElementById('satVal');
const exportFormatInput = document.getElementById('exportFormat');
const randomStyleBtn    = document.getElementById('randomStyleBtn');
const addTextBtn        = document.getElementById('addTextBtn');
const addStampBtn       = document.getElementById('addStampBtn');
const clearExtrasBtn    = document.getElementById('clearExtrasBtn');
const downloadBtn       = document.getElementById('downloadBtn');
const aiGenerateBtn     = document.getElementById('aiGenerateBtn');
const aiStatus          = document.getElementById('aiStatus');
const overlayEditor     = document.getElementById('overlayEditor');
const overlayTextInput  = document.getElementById('overlayTextInput');
const overlayColorInput = document.getElementById('overlayColorInput');
const overlaySizeInput  = document.getElementById('overlaySizeInput');
const overlaySizeVal    = document.getElementById('overlaySizeVal');
const deleteOverlayBtn  = document.getElementById('deleteOverlayBtn');

// ── State ───────────────────────────────────────
let uploadedImage       = null;
let currentStyle        = 'movie';
let overlays            = [];
let selectedIdx         = -1;
let dragging            = false;
let dragOffX            = 0;
let dragOffY            = 0;

// ── Canvas init ─────────────────────────────────
canvas.width  = 1000;
canvas.height = 1400;
drawEmptyPoster();

// ── Style chip clicks ────────────────────────────
document.querySelectorAll('.style-chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.style-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStyle = btn.dataset.style;
        drawCurrentPoster();
    });
});

// ── Image upload ─────────────────────────────────
imageInput.addEventListener('change', e => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = ev => {
        const img = new Image();

        img.onload = () => {
            uploadedImage = img;

            document.getElementById('uploadLabel').classList.add('has-image');

            document.getElementById('uploadText').textContent = file.name.length > 22
                ? file.name.slice(0, 20) + '…'
                : file.name;

            drawCurrentPoster();
        };

        img.src = ev.target.result;
    };

    reader.readAsDataURL(file);
});

// ── Live controls ────────────────────────────────
[titleInput, subtitleInput, yearInput, extraInput].forEach(el =>
    el.addEventListener('input', drawCurrentPoster)
);

accentColorInput.addEventListener('input', drawCurrentPoster);
filterSelect.addEventListener('change', drawCurrentPoster);

brightnessSlider.addEventListener('input', () => {
    brightVal.textContent = brightnessSlider.value;
    drawCurrentPoster();
});

contrastSlider.addEventListener('input', () => {
    contrastVal.textContent = contrastSlider.value;
    drawCurrentPoster();
});

satSlider.addEventListener('input', () => {
    satVal.textContent = satSlider.value;
    drawCurrentPoster();
});

// ── Buttons ──────────────────────────────────────
randomStyleBtn.addEventListener('click', () => {
    const styles = [
        'movie',
        'detective',
        'cyberpunk',
        'postcard',
        'magazine',
        'wanted',
        'album',
        'news',
        'horror',
        'scifi'
    ];

    const palette = [
        '#ff7a59',
        '#00e5ff',
        '#facc15',
        '#22c55e',
        '#ef4444',
        '#a855f7',
        '#f97316',
        '#14b8a6',
        '#ff3366',
        '#39ff14'
    ];

    const s = styles[Math.floor(Math.random() * styles.length)];
    const c = palette[Math.floor(Math.random() * palette.length)];

    document.querySelectorAll('.style-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.style === s);
    });

    currentStyle = s;
    accentColorInput.value = c;

    drawCurrentPoster();
});

addTextBtn.addEventListener('click', () => {
    overlays.push({
        type: 'text',
        text: 'NOVÝ TEXT',
        x: canvas.width * 0.5,
        y: canvas.height * 0.18,
        color: accentColorInput.value,
        fontSize: 44,
        fontFamily: 'DM Sans, Arial'
    });

    selectedIdx = overlays.length - 1;
    syncOverlayEditor();
    drawCurrentPoster();
});

addStampBtn.addEventListener('click', () => {
    const stampMap = {
        movie: 'NOW SHOWING',
        detective: 'CLASSIFIED',
        cyberpunk: 'VERIFIED',
        postcard: 'GREETINGS',
        magazine: 'EXCLUSIVE',
        wanted: 'WANTED',
        album: 'LIMITED ED',
        news: 'BREAKING',
        horror: 'CONDEMNED',
        scifi: 'CLASSIFIED'
    };

    overlays.push({
        type: 'stamp',
        text: stampMap[currentStyle] || 'SPECIAL',
        x: canvas.width * 0.75,
        y: canvas.height * 0.18,
        color: accentColorInput.value,
        fontSize: 30,
        rotation: -0.1
    });

    selectedIdx = overlays.length - 1;
    syncOverlayEditor();
    drawCurrentPoster();
});

clearExtrasBtn.addEventListener('click', () => {
    overlays = [];
    selectedIdx = -1;
    overlayEditor.style.display = 'none';
    drawCurrentPoster();
});

downloadBtn.addEventListener('click', downloadPoster);

// ── Overlay editor live sync ──────────────────────
overlayTextInput.addEventListener('input', () => {
    if (selectedIdx < 0) {
        return;
    }

    overlays[selectedIdx].text = overlayTextInput.value;
    drawCurrentPoster();
});

overlayColorInput.addEventListener('input', () => {
    if (selectedIdx < 0) {
        return;
    }

    overlays[selectedIdx].color = overlayColorInput.value;
    drawCurrentPoster();
});

overlaySizeInput.addEventListener('input', () => {
    if (selectedIdx < 0) {
        return;
    }

    overlays[selectedIdx].fontSize = parseInt(overlaySizeInput.value);
    overlaySizeVal.textContent = overlaySizeInput.value;

    drawCurrentPoster();
});

deleteOverlayBtn.addEventListener('click', () => {
    if (selectedIdx < 0) {
        return;
    }

    overlays.splice(selectedIdx, 1);
    selectedIdx = -1;
    overlayEditor.style.display = 'none';

    drawCurrentPoster();
});

function syncOverlayEditor() {
    if (selectedIdx < 0) {
        overlayEditor.style.display = 'none';
        return;
    }

    const ov = overlays[selectedIdx];

    overlayEditor.style.display = 'flex';
    overlayTextInput.value  = ov.text;
    overlayColorInput.value = ov.color;
    overlaySizeInput.value  = ov.fontSize;
    overlaySizeVal.textContent = ov.fontSize;
}

// ── Keyboard ─────────────────────────────────────
document.addEventListener('keydown', e => {
    if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedIdx !== -1 &&
        document.activeElement.tagName !== 'INPUT'
    ) {
        overlays.splice(selectedIdx, 1);
        selectedIdx = -1;
        overlayEditor.style.display = 'none';
        drawCurrentPoster();
    }

    if (e.key === 'Escape') {
        selectedIdx = -1;
        overlayEditor.style.display = 'none';
        drawCurrentPoster();
    }
});

// ── Mouse events ─────────────────────────────────
canvas.addEventListener('mousedown', e => handlePointerDown(e, getMousePos(e)));
canvas.addEventListener('mousemove', e => handlePointerMove(e, getMousePos(e)));
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mouseleave', stopDrag);

canvas.addEventListener('dblclick', e => {
    const pos = getMousePos(e);
    const i = findOverlay(pos.x, pos.y);

    if (i === -1) {
        return;
    }

    selectedIdx = i;
    syncOverlayEditor();
    overlayTextInput.focus();
    overlayTextInput.select();
});

// ── Touch events ─────────────────────────────────
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    handlePointerDown(e, getTouchPos(e));
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    handlePointerMove(e, getTouchPos(e));
}, { passive: false });

canvas.addEventListener('touchend', stopDrag);

function handlePointerDown(e, pos) {
    const i = findOverlay(pos.x, pos.y);

    selectedIdx = i;
    syncOverlayEditor();

    if (i !== -1) {
        dragging = true;
        dragOffX = pos.x - overlays[i].x;
        dragOffY = pos.y - overlays[i].y;
    }

    drawCurrentPoster();
}

function handlePointerMove(e, pos) {
    if (dragging && selectedIdx !== -1) {
        overlays[selectedIdx].x = pos.x - dragOffX;
        overlays[selectedIdx].y = pos.y - dragOffY;

        drawCurrentPoster();

        canvas.style.cursor = 'grabbing';
        return;
    }

    canvas.style.cursor = findOverlay(pos.x, pos.y) !== -1 ? 'grab' : 'default';
}

function stopDrag() {
    dragging = false;
    canvas.style.cursor = 'default';
}

function getMousePos(e) {
    const r = canvas.getBoundingClientRect();

    return {
        x: (e.clientX - r.left) * (canvas.width / r.width),
        y: (e.clientY - r.top) * (canvas.height / r.height)
    };
}

function getTouchPos(e) {
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0] || e.changedTouches[0];

    return {
        x: (t.clientX - r.left) * (canvas.width / r.width),
        y: (t.clientY - r.top) * (canvas.height / r.height)
    };
}

// ── Local text generation, no external API ─────────
aiGenerateBtn.addEventListener('click', () => {
    const presets = {
        movie: [
            ['LOST SIGNAL', 'A story from another city', '2026', 'One photo. One secret. No way back.'],
            ['NIGHT RUN', 'Everything changes after midnight', '2026', 'A cinematic poster generated in browser.'],
            ['LAST FRAME', 'The moment before everything disappeared', '2026', 'Created from a user image with Canvas API.']
        ],
        detective: [
            ['CASE 404', 'Evidence recovered from the scene', '2026', 'Status classified. Subject under visual analysis.'],
            ['UNKNOWN FILE', 'The archive was never supposed to open', '2026', 'A detective-style case file from your photo.'],
            ['RED THREAD', 'Every detail leads somewhere', '2026', 'Generated locally without backend server.']
        ],
        cyberpunk: [
            ['NEON ID', 'Identity verified by the grid', '2077', 'Digital citizen record generated from image data.'],
            ['DATA GHOST', 'Memory scan in progress', '2099', 'A cyberpunk visual card rendered in browser.'],
            ['CITY NODE', 'Access level unknown', '2049', 'User image converted into a futuristic ID.']
        ],
        postcard: [
            ['GREETINGS', 'From a place between memory and light', '2026', 'A retro postcard generated from your photograph.'],
            ['OLD SUMMER', 'Wish you were here', '2026', 'A nostalgic visual story from one image.'],
            ['POSTCARD', 'Captured, styled and sent from the browser', '2026', 'No backend. No database. Just Canvas.']
        ],
        magazine: [
            ['NEW VISION', 'The future of visual storytelling', '2026', 'Exclusive creative cover generated from your photo.'],
            ['STYLE ISSUE', 'Design, image and digital mood', '2026', 'A magazine cover made directly in browser.'],
            ['PHOTO CULTURE', 'One image becomes a full cover', '2026', 'Canvas-based multimedia output.']
        ],
        wanted: [
            ['MOST WANTED', 'Reward for visual identification', '1889', 'Last seen inside a generated poster layout.'],
            ['THE SUSPECT', 'Known for suspicious design choices', '1889', 'A western-style poster from your uploaded photo.'],
            ['WANTED', 'Dead or designed', '1889', 'Generated locally using HTML Canvas.']
        ],
        album: [
            ['STATIC DREAMS', 'A browser-made album cover', '2026', 'Visual sound, silent image, digital mood.'],
            ['LOW LIGHT', 'An imaginary record from your photo', '2026', 'Album artwork generated without external APIs.'],
            ['PIXEL NOIR', 'Limited poster lab edition', '2026', 'From uploaded image to cover art.']
        ],
        news: [
            ['BREAKING IMAGE', 'A photo becomes front page news', '2026', 'Generated by a client-side multimedia web app.'],
            ['DAILY POST', 'Visual story shocks the browser', '2026', 'No server needed for this front page.'],
            ['HEADLINE MODE', 'Canvas transforms user image', '2026', 'A newspaper layout created from one photo.']
        ],
        horror: [
            ['DO NOT LOOK', 'The image remembers you', '2026', 'A horror poster generated from your uploaded photo.'],
            ['THE ROOM', 'Something stayed inside the frame', '2026', 'Dark visual style rendered with Canvas.'],
            ['LAST WARNING', 'You have been seen', '2026', 'Client-side horror poster generation.']
        ],
        scifi: [
            ['STAR RECORD', 'Classified visual transmission', '3026', 'A sci-fi poster generated from image data.'],
            ['ORBITAL FILE', 'Recovered from deep space', '3026', 'The photo was converted into a space archive.'],
            ['SIGNAL FOUND', 'Human visual data detected', '3026', 'Generated in browser without backend.']
        ]
    };

    const variants = presets[currentStyle] || presets.movie;
    const picked = variants[Math.floor(Math.random() * variants.length)];

    titleInput.value = picked[0];
    subtitleInput.value = picked[1];
    yearInput.value = picked[2];
    extraInput.value = picked[3];

    drawCurrentPoster();
    showAiStatus('✓ Texty vygenerované lokálne.', false);
});

function showAiStatus(msg, isError) {
    aiStatus.style.display = 'block';
    aiStatus.textContent = msg;
    aiStatus.className = 'ai-status' + (isError ? ' error' : '');

    if (!isError) {
        setTimeout(() => {
            aiStatus.style.display = 'none';
        }, 2500);
    }
}

// ── Draw dispatcher ───────────────────────────────
function drawCurrentPoster() {
    canvas.width = 1000;
    canvas.height = 1400;

    if (!uploadedImage) {
        drawEmptyPoster();
        drawOverlays();
        return;
    }

    const drawFn = {
        movie: drawMoviePoster,
        detective: drawDetectivePoster,
        cyberpunk: drawCyberpunkPoster,
        postcard: drawPostcardPoster,
        magazine: drawMagazinePoster,
        wanted: drawWantedPoster,
        album: drawAlbumPoster,
        news: drawNewsPoster,
        horror: drawHorrorPoster,
        scifi: drawScifiPoster
    }[currentStyle];

    if (drawFn) {
        drawFn();
    }

    drawOverlays();
}

function getUserText() {
    return {
        title: titleInput.value.trim() || 'UNTITLED STORY',
        subtitle: subtitleInput.value.trim() || 'Generated from your photo',
        year: yearInput.value.trim() || '2026',
        extra: extraInput.value.trim() || 'A visual story created in the browser',
        accent: accentColorInput.value || '#ff7a59'
    };
}

// ── Image drawing helpers ─────────────────────────
function drawImageCover() {
    const ir = uploadedImage.width / uploadedImage.height;
    const cr = canvas.width / canvas.height;

    let dw;
    let dh;
    let ox;
    let oy;

    if (ir > cr) {
        dh = canvas.height;
        dw = dh * ir;
        ox = (canvas.width - dw) / 2;
        oy = 0;
    } else {
        dw = canvas.width;
        dh = dw / ir;
        ox = 0;
        oy = (canvas.height - dh) / 2;
    }

    ctx.drawImage(uploadedImage, ox, oy, dw, dh);
    applyImageFilter();
}

function drawImageInBox(x, y, w, h) {
    const ir = uploadedImage.width / uploadedImage.height;
    const br = w / h;

    let dw;
    let dh;
    let ox;
    let oy;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    if (ir > br) {
        dh = h;
        dw = dh * ir;
        ox = x + (w - dw) / 2;
        oy = y;
    } else {
        dw = w;
        dh = dw / ir;
        ox = x;
        oy = y + (h - dh) / 2;
    }

    ctx.drawImage(uploadedImage, ox, oy, dw, dh);
    applyImageFilterInBox(x, y, w, h);

    ctx.restore();
}

// ── Image filters ─────────────────────────────────
function applyImageFilter() {
    applyImageFilterInBox(0, 0, canvas.width, canvas.height);
}

function applyImageFilterInBox(x, y, w, h) {
    const filter = filterSelect.value;
    const brightness = parseInt(brightnessSlider.value);
    const contrast = parseInt(contrastSlider.value);
    const sat = parseInt(satSlider.value);

    if (filter === 'none' && brightness === 0 && contrast === 0 && sat === 0) {
        return;
    }

    const imageData = ctx.getImageData(x, y, w, h);
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];

        switch (filter) {
            case 'bw': {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = gray;
                g = gray;
                b = gray;
                break;
            }

            case 'sepia': {
                const sr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                const sg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                const sb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);

                r = sr;
                g = sg;
                b = sb;
                break;
            }

            case 'vivid': {
                const gv = 0.299 * r + 0.587 * g + 0.114 * b;
                r = clamp(gv + (r - gv) * 2.2);
                g = clamp(gv + (g - gv) * 2.2);
                b = clamp(gv + (b - gv) * 2.2);
                break;
            }

            case 'cool': {
                r = clamp(r * 0.88);
                g = clamp(g * 0.95);
                b = clamp(b * 1.15);
                break;
            }

            case 'warm': {
                r = clamp(r * 1.15);
                g = clamp(g * 0.97);
                b = clamp(b * 0.82);
                break;
            }

            case 'fade': {
                r = clamp(r * 0.8 + 40);
                g = clamp(g * 0.8 + 35);
                b = clamp(b * 0.8 + 30);
                break;
            }

            case 'noir': {
                const gn = 0.299 * r + 0.587 * g + 0.114 * b;
                const n = clamp((gn - 128) * 1.6 + 128);
                r = n;
                g = n;
                b = n;
                break;
            }
        }

        if (brightness !== 0) {
            r = clamp(r + brightness);
            g = clamp(g + brightness);
            b = clamp(b + brightness);
        }

        if (contrast !== 0) {
            const f = (259 * (contrast + 255)) / (255 * (259 - contrast));

            r = clamp(f * (r - 128) + 128);
            g = clamp(f * (g - 128) + 128);
            b = clamp(f * (b - 128) + 128);
        }

        if (sat !== 0) {
            const gs = 0.299 * r + 0.587 * g + 0.114 * b;
            const sf = 1 + sat / 100;

            r = clamp(gs + (r - gs) * sf);
            g = clamp(gs + (g - gs) * sf);
            b = clamp(gs + (b - gs) * sf);
        }

        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
    }

    ctx.putImageData(imageData, x, y);
}

function clamp(v) {
    return Math.max(0, Math.min(255, Math.round(v)));
}

// ── Utility draw helpers ──────────────────────────
function drawVignette() {
    const rg = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        80,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.75
    );

    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(1, 'rgba(0,0,0,0.7)');

    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function addPaperNoise() {
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        ctx.fillStyle = `rgba(50,35,20,${Math.random() * 0.07})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

function wrapText(text, x, y, maxW, lineH, align = 'center') {
    ctx.textAlign = align;

    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const test = line + words[n] + ' ';

        if (ctx.measureText(test).width > maxW && n > 0) {
            ctx.fillText(line.trim(), x, y);
            line = words[n] + ' ';
            y += lineH;
        } else {
            line = test;
        }
    }

    ctx.fillText(line.trim(), x, y);
}

function drawFakeBarcode(x, y, w, h) {
    ctx.fillStyle = '#ffffff';

    let cx = x;

    while (cx < x + w) {
        const bw = Math.random() * 7 + 2;
        const bh = h * (0.55 + Math.random() * 0.45);

        ctx.fillRect(cx, y, bw, bh);

        cx += bw + Math.random() * 8 + 3;
    }
}

function drawScanLines() {
    ctx.fillStyle = 'rgba(255,255,255,0.035)';

    for (let y = 0; y < canvas.height; y += 6) {
        ctx.fillRect(0, y, canvas.width, 2);
    }
}

function drawCyberGrid(accent) {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;

    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

function drawRedStringBoard(accent) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;

    const pts = [
        [110, 850],
        [760, 260],
        [220, 845],
        [820, 530],
        [120, 1100],
        [780, 805]
    ];

    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.moveTo(pts[2][0], pts[2][1]);
    ctx.lineTo(pts[3][0], pts[3][1]);
    ctx.moveTo(pts[4][0], pts[4][1]);
    ctx.lineTo(pts[5][0], pts[5][1]);
    ctx.stroke();

    ctx.fillStyle = accent;

    pts.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPostStamp(accent) {
    ctx.save();
    ctx.translate(835, 1120);
    ctx.rotate(0.08);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(-80, -50, 150, 100);

    ctx.fillStyle = accent;
    ctx.textAlign = 'center';

    ctx.font = 'bold 22px Georgia';
    ctx.fillText('POST', -5, -10);

    ctx.font = '18px Georgia';
    ctx.fillText('CARD', -5, 20);

    ctx.restore();
}

function generateFillerText() {
    return 'This visual front page was generated from an uploaded image in the browser. The layout combines typography, image framing and thematic styling into one multimedia output.';
}

function drawNewsColumns(extraText) {
    const startY = 1020;
    const colW = 250;

    const texts = [
        extraText + ' ' + generateFillerText(),
        generateFillerText(),
        generateFillerText()
    ];

    ctx.textAlign = 'left';
    ctx.font = '18px Georgia';
    ctx.fillStyle = '#333';

    wrapText(texts[0], 90, startY, colW, 24, 'left');
    wrapText(texts[1], 375, startY, colW, 24, 'left');
    wrapText(texts[2], 660, startY, colW, 24, 'left');
}

// ══════════════════════════════════════════════════
//  POSTER STYLES
// ══════════════════════════════════════════════════

function drawEmptyPoster() {
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

    g.addColorStop(0, '#111827');
    g.addColorStop(1, '#030712');

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 80, canvas.width - 120, canvas.height - 160);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    ctx.font = 'bold 54px Bebas Neue, Arial';
    ctx.fillText('PHOTO STORY POSTER LAB', canvas.width / 2, 520);

    ctx.font = '24px DM Sans, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('Nahraj fotografiu a vytvor vlastný vizuál', canvas.width / 2, 575);

    ctx.font = '18px DM Sans, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(
        'Movie · Detective · Cyberpunk · Postcard · Magazine · Wanted · Album · News · Horror · Sci-Fi',
        canvas.width / 2,
        630
    );
}

// 1. Movie Poster
function drawMoviePoster() {
    const t = getUserText();

    drawImageCover();

    const dg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    dg.addColorStop(0, 'rgba(0,0,0,0.1)');
    dg.addColorStop(0.5, 'rgba(0,0,0,0.25)');
    dg.addColorStop(1, 'rgba(0,0,0,0.92)');

    ctx.fillStyle = dg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawVignette();

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px DM Sans, Arial';
    ctx.fillText(t.year, canvas.width / 2, 90);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 88px Bebas Neue, Arial';
    wrapText(t.title.toUpperCase(), canvas.width / 2, 960, 820, 90, 'center');

    ctx.fillStyle = t.accent;
    ctx.font = 'bold 26px DM Sans, Arial';
    wrapText(t.subtitle.toUpperCase(), canvas.width / 2, 1095, 760, 36, 'center');

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '20px DM Sans, Arial';
    wrapText(t.extra, canvas.width / 2, 1165, 760, 28, 'center');

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '11px DM Sans, Arial';
    ctx.fillText('PHOTO STORY POSTER LAB · MULTIMEDIA WEB PROJECT', canvas.width / 2, 1365);
}

// 2. Detective Case File
function drawDetectivePoster() {
    const t = getUserText();

    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    addPaperNoise();

    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 6;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    ctx.fillStyle = '#2b2118';
    ctx.textAlign = 'left';

    ctx.font = 'bold 58px Bebas Neue, Arial';
    ctx.fillText('CASE FILE', 80, 125);

    ctx.font = '24px DM Sans, Arial';
    ctx.fillText(`DATE: ${t.year}`, 82, 170);
    ctx.fillText('STATUS: CLASSIFIED', 82, 205);

    drawImageInBox(90, 250, 720, 570);

    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 4;
    ctx.strokeRect(90, 250, 720, 570);

    ctx.save();
    ctx.translate(670, 790);
    ctx.rotate(-0.18);

    ctx.strokeStyle = 'rgba(120,0,0,0.9)';
    ctx.lineWidth = 4;
    ctx.strokeRect(-175, -45, 350, 85);

    ctx.fillStyle = 'rgba(120,0,0,0.9)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 56px Bebas Neue, Arial';
    ctx.fillText('EVIDENCE', 0, 15);

    ctx.restore();

    ctx.fillStyle = '#2b2118';
    ctx.textAlign = 'left';
    ctx.font = 'bold 46px Bebas Neue, Arial';
    wrapText(t.title.toUpperCase(), 90, 910, 760, 52, 'left');

    ctx.fillStyle = '#4a3727';
    ctx.font = '24px DM Sans, Arial';
    wrapText(t.subtitle, 90, 1020, 760, 34, 'left');

    ctx.fillStyle = '#5c4938';
    ctx.font = '20px DM Sans, Arial';
    wrapText(t.extra, 90, 1100, 760, 30, 'left');

    drawRedStringBoard(t.accent);
}

// 3. Cyberpunk ID
function drawCyberpunkPoster() {
    const t = getUserText();

    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, '#050816');
    g.addColorStop(0.55, '#111827');
    g.addColorStop(1, '#020617');

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCyberGrid(t.accent);

    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(70, 130, 380, 540);

    drawImageInBox(95, 155, 330, 470);

    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(95, 155, 330, 470);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';

    ctx.font = 'bold 52px Bebas Neue, Arial';
    ctx.fillText('CYBER ID', 500, 135);

    ctx.fillStyle = t.accent;
    ctx.font = 'bold 26px DM Mono, monospace';
    ctx.fillText('VISUAL IDENTITY CARD', 500, 180);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 62px Bebas Neue, Arial';
    wrapText(t.title.toUpperCase(), 500, 290, 400, 64, 'left');

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '24px DM Sans, Arial';
    wrapText(t.subtitle, 500, 415, 400, 34, 'left');

    ctx.fillStyle = t.accent;
    ctx.font = 'bold 24px DM Mono, monospace';
    ctx.fillText(`YEAR: ${t.year}`, 500, 525);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '20px DM Sans, Arial';
    wrapText(t.extra, 500, 585, 400, 30, 'left');

    drawFakeBarcode(500, 715, 360, 40);
    drawScanLines();
}

// 4. Retro Postcard
function drawPostcardPoster() {
    const t = getUserText();

    ctx.fillStyle = '#f4e2bd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    addPaperNoise();

    ctx.strokeStyle = '#8c6f47';
    ctx.lineWidth = 6;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

    drawImageInBox(90, 110, 820, 630);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 14;
    ctx.strokeRect(90, 110, 820, 630);

    ctx.fillStyle = t.accent;
    ctx.textAlign = 'center';
    ctx.font = 'bold 70px Playfair Display, Georgia';
    wrapText(t.title, canvas.width / 2, 848, 780, 74, 'center');

    ctx.fillStyle = '#4b3826';
    ctx.font = '28px Playfair Display, Georgia';
    wrapText(t.subtitle, canvas.width / 2, 965, 780, 38, 'center');

    ctx.fillStyle = '#7b5d3c';
    ctx.font = '24px Georgia';
    ctx.fillText(t.year, canvas.width / 2, 1070);

    wrapText(t.extra, canvas.width / 2, 1130, 760, 30, 'center');

    drawPostStamp(t.accent);
}

// 5. Magazine Cover
function drawMagazinePoster() {
    const t = getUserText();

    drawImageCover();

    const ov = ctx.createLinearGradient(0, 0, 0, canvas.height);
    ov.addColorStop(0, 'rgba(0,0,0,0.18)');
    ov.addColorStop(1, 'rgba(0,0,0,0.55)');

    ctx.fillStyle = ov;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 98px Bebas Neue, Arial';
    ctx.fillText('VIBE', canvas.width / 2, 110);

    ctx.fillStyle = t.accent;
    ctx.font = 'bold 22px DM Mono, monospace';
    ctx.fillText('SPECIAL ISSUE · ' + t.year, canvas.width / 2, 150);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px DM Sans, Arial';
    wrapText('THE NEW FACE OF CREATIVE VISUALS', 65, 280, 250, 40, 'left');
    wrapText('POSTER LAB EDITION', 65, 410, 250, 40, 'left');

    ctx.textAlign = 'right';
    wrapText('STYLE, STORY & DIGITAL EXPERIMENTS', 935, 280, 250, 40, 'right');
    wrapText('FROM PHOTO TO DESIGN', 935, 410, 250, 40, 'right');

    ctx.textAlign = 'center';
    ctx.font = 'bold 80px Bebas Neue, Arial';
    wrapText(t.title.toUpperCase(), canvas.width / 2, 1035, 840, 84, 'center');

    ctx.fillStyle = t.accent;
    ctx.font = 'bold 24px DM Sans, Arial';
    wrapText(t.subtitle.toUpperCase(), canvas.width / 2, 1165, 760, 34, 'center');

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '22px DM Sans, Arial';
    wrapText(t.extra, canvas.width / 2, 1270, 760, 30, 'center');
}

// 6. Wanted Poster
function drawWantedPoster() {
    const t = getUserText();

    ctx.fillStyle = '#d7c29a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    addPaperNoise();

    ctx.strokeStyle = '#5b4324';
    ctx.lineWidth = 8;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#3f2b16';

    ctx.font = 'bold 112px Bebas Neue, Arial';
    ctx.fillText('WANTED', canvas.width / 2, 165);

    ctx.font = 'bold 30px Playfair Display, Georgia';
    ctx.fillText(`REWARD · ${t.year}`, canvas.width / 2, 220);

    drawImageInBox(180, 280, 640, 560);

    ctx.strokeStyle = '#5b4324';
    ctx.lineWidth = 4;
    ctx.strokeRect(180, 280, 640, 560);

    ctx.fillStyle = '#3f2b16';
    ctx.font = 'bold 68px Bebas Neue, Arial';
    wrapText(t.title.toUpperCase(), canvas.width / 2, 945, 760, 72, 'center');

    ctx.font = '28px Playfair Display, Georgia';
    wrapText(t.subtitle, canvas.width / 2, 1055, 760, 38, 'center');

    ctx.font = '22px Georgia';
    wrapText(t.extra, canvas.width / 2, 1145, 760, 32, 'center');

    ctx.font = 'bold 26px Playfair Display, Georgia';
    ctx.fillText('CONTACT THE SHERIFF IMMEDIATELY', canvas.width / 2, 1295);
}

// 7. Album Cover
function drawAlbumPoster() {
    const t = getUserText();

    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sqX = 120;
    const sqY = 180;
    const sqS = 760;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(sqX - 30, sqY - 30, sqS + 60, sqS + 60);

    drawImageInBox(sqX, sqY, sqS, sqS);

    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(sqX, sqY, sqS, sqS);

    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(sqX, sqY, sqS, sqS);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = 'bold 24px DM Mono, monospace';
    ctx.fillText(t.year, canvas.width / 2, 95);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 78px Bebas Neue, Arial';
    wrapText(t.title.toUpperCase(), canvas.width / 2, 1090, 820, 82, 'center');

    ctx.fillStyle = t.accent;
    ctx.font = 'bold 28px DM Sans, Arial';
    wrapText(t.subtitle.toUpperCase(), canvas.width / 2, 1200, 760, 36, 'center');

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '20px DM Sans, Arial';
    wrapText(t.extra, canvas.width / 2, 1280, 780, 30, 'center');
}

// 8. News Front Page
function drawNewsPoster() {
    const t = getUserText();

    ctx.fillStyle = '#f3f1eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';

    ctx.font = 'bold 84px Bebas Neue, Arial';
    ctx.fillText('THE DAILY POST', canvas.width / 2, 108);

    ctx.font = '24px DM Mono, monospace';
    ctx.fillText(t.year, canvas.width / 2, 148);

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 172);
    ctx.lineTo(930, 172);
    ctx.stroke();

    drawImageInBox(90, 220, 820, 500);

    ctx.fillStyle = '#111';
    ctx.textAlign = 'left';

    ctx.font = 'bold 60px Bebas Neue, Arial';
    wrapText(t.title, 90, 815, 820, 66, 'left');

    ctx.font = 'italic 26px Playfair Display, Georgia';
    wrapText(t.subtitle, 90, 945, 820, 34, 'left');

    drawNewsColumns(t.extra);
}

// 9. Horror Poster
function drawHorrorPoster() {
    const t = getUserText();

    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#0a0000');
    g.addColorStop(0.6, '#1a0000');
    g.addColorStop(1, '#000000');

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = t.accent;

    for (let i = 0; i < 12; i++) {
        const x = 60 + i * 80 + Math.random() * 30;
        const h = 40 + Math.random() * 120;
        const w = 8 + Math.random() * 14;

        ctx.beginPath();
        ctx.rect(x, 0, w, h - 20);
        ctx.ellipse(x + w / 2, h - 20, w / 2, 20, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawImageInBox(60, 160, canvas.width - 120, 700);

    const imgOv = ctx.createLinearGradient(0, 160, 0, 860);
    imgOv.addColorStop(0, 'rgba(10,0,0,0.7)');
    imgOv.addColorStop(0.2, 'rgba(0,0,0,0.1)');
    imgOv.addColorStop(0.8, 'rgba(0,0,0,0.1)');
    imgOv.addColorStop(1, 'rgba(10,0,0,0.8)');

    ctx.fillStyle = imgOv;
    ctx.fillRect(60, 160, canvas.width - 120, 700);

    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 160, canvas.width - 120, 700);

    ctx.fillStyle = 'rgba(255,0,0,0.06)';

    for (let i = 0; i < 6; i++) {
        const y = 160 + Math.random() * 700;
        ctx.fillRect(0, y, canvas.width, 2 + Math.random() * 3);
    }

    ctx.textAlign = 'center';
    ctx.font = 'bold 100px Bebas Neue, Arial';

    ctx.fillStyle = 'rgba(180,0,0,0.5)';
    ctx.fillText(t.title.toUpperCase(), canvas.width / 2 + 3, 1000);

    ctx.fillStyle = '#fff';
    ctx.fillText(t.title.toUpperCase(), canvas.width / 2, 996);

    ctx.fillStyle = t.accent;
    ctx.font = 'bold 30px DM Mono, monospace';
    wrapText(t.subtitle.toUpperCase(), canvas.width / 2, 1060, 760, 36, 'center');

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '22px DM Sans, Arial';
    wrapText(t.extra, canvas.width / 2, 1140, 760, 32, 'center');

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '18px DM Mono, monospace';
    ctx.fillText(t.year, canvas.width / 2, 1220);

    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 1340, canvas.width, 60);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 30px Bebas Neue, Arial';
    ctx.fillText('YOU HAVE BEEN WARNED', canvas.width / 2, 1378);
}

// 10. Sci-Fi Poster
function drawScifiPoster() {
    const t = getUserText();

    ctx.fillStyle = '#000510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.5;

        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const accent = t.accent;

    const glow = ctx.createRadialGradient(
        canvas.width / 2,
        580,
        50,
        canvas.width / 2,
        580,
        400
    );

    glow.addColorStop(0, accent + '55');
    glow.addColorStop(0.5, accent + '22');
    glow.addColorStop(1, 'transparent');

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = 580;
    const rad = 340;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.clip();

    const ir = uploadedImage.width / uploadedImage.height;
    const diam = rad * 2;

    let dw;
    let dh;
    let ox;
    let oy;

    if (ir > 1) {
        dh = diam;
        dw = dh * ir;
        ox = cx - dw / 2;
        oy = cy - rad;
    } else {
        dw = diam;
        dh = dw / ir;
        ox = cx - rad;
        oy = cy - dh / 2;
    }

    ctx.drawImage(uploadedImage, ox, oy, dw, dh);
    applyImageFilterInBox(cx - rad, cy - rad, diam, diam);

    const imgR = ctx.createRadialGradient(cx, cy, rad * 0.4, cx, cy, rad);
    imgR.addColorStop(0, 'rgba(0,0,0,0)');
    imgR.addColorStop(1, 'rgba(0,5,20,0.7)');

    ctx.fillStyle = imgR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(cx, cy, rad + 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, rad + 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;

    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;

    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.lineTo(canvas.width, 240);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 920);
    ctx.lineTo(canvas.width, 920);
    ctx.stroke();

    ctx.globalAlpha = 1;

    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, canvas.width, 50);

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px DM Mono, monospace';
    ctx.fillText('⦿ CLASSIFIED VISUAL RECORD ⦿', canvas.width / 2, 34);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 90px Bebas Neue, Arial';
    wrapText(t.title.toUpperCase(), canvas.width / 2, 1030, 820, 92, 'center');

    ctx.fillStyle = accent;
    ctx.font = 'bold 26px DM Mono, monospace';
    wrapText(t.subtitle.toUpperCase(), canvas.width / 2, 1150, 760, 34, 'center');

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '20px DM Sans, Arial';
    wrapText(t.extra, canvas.width / 2, 1225, 760, 30, 'center');

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '18px DM Mono, monospace';
    ctx.fillText(`STARDATE: ${t.year}`, canvas.width / 2, 1295);

    ctx.fillStyle = accent;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 26px Bebas Neue, Arial';
    ctx.fillText('PHOTO STORY POSTER LAB · MULTIMEDIA WEB PROJECT', canvas.width / 2, canvas.height - 18);
}

// ══════════════════════════════════════════════════
//  OVERLAY SYSTEM
// ══════════════════════════════════════════════════

function drawOverlays() {
    overlays.forEach((ov, i) => {
        if (ov.type === 'text') {
            drawTextOverlay(ov, i === selectedIdx);
        }

        if (ov.type === 'stamp') {
            drawStampOverlay(ov, i === selectedIdx);
        }
    });
}

function drawTextOverlay(ov, sel) {
    ctx.save();

    ctx.textAlign = 'center';
    ctx.font = `bold ${ov.fontSize}px ${ov.fontFamily || 'DM Sans, Arial'}`;
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.strokeText(ov.text, ov.x, ov.y);

    ctx.fillStyle = ov.color;
    ctx.fillText(ov.text, ov.x, ov.y);

    if (sel) {
        const b = getOverlayBounds(ov);

        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.setLineDash([7, 5]);
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.setLineDash([]);
    }

    ctx.restore();
}

function drawStampOverlay(ov, sel) {
    ctx.save();

    ctx.textAlign = 'center';
    ctx.font = `bold ${ov.fontSize}px DM Sans, Arial`;

    const tw = ctx.measureText(ov.text).width;
    const bw = tw + 48;
    const bh = ov.fontSize + 36;

    ctx.translate(ov.x, ov.y);
    ctx.rotate(ov.rotation || 0);

    ctx.strokeStyle = ov.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

    ctx.fillStyle = ov.color;
    ctx.fillText(ov.text, 0, ov.fontSize * 0.33);

    if (sel) {
        ctx.setLineDash([7, 5]);
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-bw / 2 - 7, -bh / 2 - 7, bw + 14, bh + 14);
        ctx.setLineDash([]);
    }

    ctx.restore();
}

function getOverlayBounds(ov) {
    if (ov.type === 'text') {
        ctx.save();
        ctx.font = `bold ${ov.fontSize}px ${ov.fontFamily || 'DM Sans, Arial'}`;

        const w = ctx.measureText(ov.text).width;

        ctx.restore();

        return {
            x: ov.x - w / 2 - 12,
            y: ov.y - ov.fontSize,
            w: w + 24,
            h: ov.fontSize + 22
        };
    }

    if (ov.type === 'stamp') {
        ctx.save();
        ctx.font = `bold ${ov.fontSize}px DM Sans, Arial`;

        const tw = ctx.measureText(ov.text).width;

        ctx.restore();

        const bw = tw + 48;
        const bh = ov.fontSize + 36;

        return {
            x: ov.x - bw / 2,
            y: ov.y - bh / 2,
            w: bw,
            h: bh
        };
    }

    return {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    };
}

function findOverlay(x, y) {
    for (let i = overlays.length - 1; i >= 0; i--) {
        const b = getOverlayBounds(overlays[i]);

        if (
            x >= b.x &&
            x <= b.x + b.w &&
            y >= b.y &&
            y <= b.y + b.h
        ) {
            return i;
        }
    }

    return -1;
}

// ── Download ─────────────────────────────────────
function downloadPoster() {
    const fmt = exportFormatInput.value;
    const mime = fmt === 'jpeg'
        ? 'image/jpeg'
        : fmt === 'webp'
            ? 'image/webp'
            : 'image/png';

    const ext = fmt === 'jpeg' ? 'jpg' : fmt;

    const link = document.createElement('a');
    link.download = `photo_story_poster.${ext}`;
    link.href = canvas.toDataURL(mime, 0.92);
    link.click();
}