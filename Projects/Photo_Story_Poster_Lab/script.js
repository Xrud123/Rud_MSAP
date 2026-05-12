const imageInput = document.getElementById("imageInput");
const canvas = document.getElementById("posterCanvas");
const ctx = canvas.getContext("2d");

const posterStyleInput = document.getElementById("posterStyle");
const titleInput = document.getElementById("titleInput");
const subtitleInput = document.getElementById("subtitleInput");
const yearInput = document.getElementById("yearInput");
const extraInput = document.getElementById("extraInput");
const accentColorInput = document.getElementById("accentColor");
const exportFormatInput = document.getElementById("exportFormat");

const randomStyleBtn = document.getElementById("randomStyleBtn");
const addTextBtn = document.getElementById("addTextBtn");
const addStampBtn = document.getElementById("addStampBtn");
const clearExtrasBtn = document.getElementById("clearExtrasBtn");
const downloadBtn = document.getElementById("downloadBtn");

let uploadedImage = null;

let overlays = [];
let selectedOverlayIndex = -1;
let draggingOverlay = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

canvas.width = 1000;
canvas.height = 1400;

drawEmptyPoster();

imageInput.addEventListener("change", loadImage);

posterStyleInput.addEventListener("change", drawCurrentPoster);
titleInput.addEventListener("input", drawCurrentPoster);
subtitleInput.addEventListener("input", drawCurrentPoster);
yearInput.addEventListener("input", drawCurrentPoster);
extraInput.addEventListener("input", drawCurrentPoster);
accentColorInput.addEventListener("input", drawCurrentPoster);

randomStyleBtn.addEventListener("click", randomizeStyle);
addTextBtn.addEventListener("click", addTextOverlay);
addStampBtn.addEventListener("click", addStampOverlay);
clearExtrasBtn.addEventListener("click", clearExtras);
downloadBtn.addEventListener("click", downloadPoster);

canvas.addEventListener("mousedown", handleCanvasMouseDown);
canvas.addEventListener("mousemove", handleCanvasMouseMove);
canvas.addEventListener("mouseup", stopOverlayDrag);
canvas.addEventListener("mouseleave", stopOverlayDrag);
canvas.addEventListener("dblclick", handleCanvasDoubleClick);

document.addEventListener("keydown", handleKeyboard);

function loadImage(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
            uploadedImage = img;
            drawCurrentPoster();
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function randomizeStyle() {
    const styles = [
        "movie",
        "detective",
        "cyberpunk",
        "postcard",
        "magazine",
        "wanted",
        "album",
        "news"
    ];

    const palette = [
        "#ff7a59",
        "#00e5ff",
        "#facc15",
        "#22c55e",
        "#ef4444",
        "#a855f7",
        "#f97316",
        "#14b8a6"
    ];

    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomAccent = palette[Math.floor(Math.random() * palette.length)];

    posterStyleInput.value = randomStyle;
    accentColorInput.value = randomAccent;

    drawCurrentPoster();
}

function addTextOverlay() {
    const text = prompt("Zadaj text, ktorý chceš pridať:", "NOVÝ TEXT");

    if (!text || !text.trim()) {
        return;
    }

    overlays.push({
        type: "text",
        text: text.trim(),
        x: canvas.width * 0.5,
        y: canvas.height * 0.18,
        color: accentColorInput.value,
        fontSize: 44,
        fontFamily: "Arial"
    });

    selectedOverlayIndex = overlays.length - 1;
    drawCurrentPoster();
}

function addStampOverlay() {
    const style = posterStyleInput.value;

    let stampText = "SPECIAL";

    if (style === "movie") stampText = "NOW SHOWING";
    if (style === "detective") stampText = "CLASSIFIED";
    if (style === "cyberpunk") stampText = "ID VERIFIED";
    if (style === "postcard") stampText = "GREETINGS";
    if (style === "magazine") stampText = "EXCLUSIVE";
    if (style === "wanted") stampText = "WANTED";
    if (style === "album") stampText = "LIMITED EDITION";
    if (style === "news") stampText = "BREAKING NEWS";

    overlays.push({
        type: "stamp",
        text: stampText,
        x: canvas.width * 0.75,
        y: canvas.height * 0.18,
        color: accentColorInput.value,
        fontSize: 30,
        rotation: -0.1
    });

    selectedOverlayIndex = overlays.length - 1;
    drawCurrentPoster();
}

function clearExtras() {
    overlays = [];
    selectedOverlayIndex = -1;
    drawCurrentPoster();
}

function handleCanvasMouseDown(event) {
    const pos = getMousePosition(event);
    selectedOverlayIndex = findOverlayAtPosition(pos.x, pos.y);

    if (selectedOverlayIndex !== -1) {
        draggingOverlay = true;
        dragOffsetX = pos.x - overlays[selectedOverlayIndex].x;
        dragOffsetY = pos.y - overlays[selectedOverlayIndex].y;
        drawCurrentPoster();
    } else {
        drawCurrentPoster();
    }
}

function handleCanvasMouseMove(event) {
    const pos = getMousePosition(event);

    if (draggingOverlay && selectedOverlayIndex !== -1) {
        overlays[selectedOverlayIndex].x = pos.x - dragOffsetX;
        overlays[selectedOverlayIndex].y = pos.y - dragOffsetY;
        drawCurrentPoster();
        canvas.style.cursor = "grabbing";
        return;
    }

    const hoverIndex = findOverlayAtPosition(pos.x, pos.y);

    if (hoverIndex !== -1) {
        canvas.style.cursor = "grab";
    } else {
        canvas.style.cursor = "default";
    }
}

function stopOverlayDrag() {
    draggingOverlay = false;
    canvas.style.cursor = "default";
}

function handleCanvasDoubleClick(event) {
    const pos = getMousePosition(event);
    const overlayIndex = findOverlayAtPosition(pos.x, pos.y);

    if (overlayIndex === -1) {
        return;
    }

    const overlay = overlays[overlayIndex];
    const newText = prompt("Uprav text:", overlay.text);

    if (newText && newText.trim()) {
        overlay.text = newText.trim();
        drawCurrentPoster();
    }
}

function handleKeyboard(event) {
    if (event.key === "Delete" && selectedOverlayIndex !== -1) {
        overlays.splice(selectedOverlayIndex, 1);
        selectedOverlayIndex = -1;
        drawCurrentPoster();
    }
}

function drawCurrentPoster() {
    if (!uploadedImage) {
        drawEmptyPoster();
        drawOverlays();
        return;
    }

    const style = posterStyleInput.value;

    canvas.width = 1000;
    canvas.height = 1400;

    if (style === "movie") drawMoviePoster();
    if (style === "detective") drawDetectivePoster();
    if (style === "cyberpunk") drawCyberpunkPoster();
    if (style === "postcard") drawPostcardPoster();
    if (style === "magazine") drawMagazinePoster();
    if (style === "wanted") drawWantedPoster();
    if (style === "album") drawAlbumPoster();
    if (style === "news") drawNewsPoster();

    drawOverlays();
}

function getUserText() {
    return {
        title: titleInput.value.trim() || "UNTITLED STORY",
        subtitle: subtitleInput.value.trim() || "Generated from your photo",
        year: yearInput.value.trim() || "2026",
        extra: extraInput.value.trim() || "Creative multimedia visual generated in browser",
        accent: accentColorInput.value || "#ff7a59"
    };
}

function drawEmptyPoster() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#111827");
    gradient.addColorStop(1, "#030712");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 4;
    ctx.strokeRect(70, 90, canvas.width - 140, canvas.height - 180);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 54px Arial";
    ctx.fillText("Photo Story Poster Lab", canvas.width / 2, 520);

    ctx.font = "24px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText("Nahraj fotografiu a vytvor vlastný vizuál", canvas.width / 2, 575);

    ctx.font = "19px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText("Movie • Detective • Cyberpunk • Postcard • Magazine • Wanted • Album • News", canvas.width / 2, 625);
}

function drawMoviePoster() {
    const text = getUserText();

    drawImageCover();

    const darkGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    darkGradient.addColorStop(0, "rgba(0,0,0,0.12)");
    darkGradient.addColorStop(0.5, "rgba(0,0,0,0.25)");
    darkGradient.addColorStop(1, "rgba(0,0,0,0.9)");
    ctx.fillStyle = darkGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawVignette();

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.textAlign = "center";
    ctx.font = "bold 26px Arial";
    ctx.fillText(text.year, canvas.width / 2, 90);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 82px Arial";
    wrapText(text.title.toUpperCase(), canvas.width / 2, 960, 820, 86, "center");

    ctx.fillStyle = text.accent;
    ctx.font = "bold 24px Arial";
    wrapText(text.subtitle.toUpperCase(), canvas.width / 2, 1090, 760, 34, "center");

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "20px Arial";
    wrapText(text.extra, canvas.width / 2, 1160, 760, 28, "center");

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "12px Arial";
    ctx.fillText("PHOTO STORY POSTER LAB • MULTIMEDIA WEB PROJECT", canvas.width / 2, 1360);
}

function drawDetectivePoster() {
    const text = getUserText();

    ctx.fillStyle = "#e8dcc4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    addPaperNoise();

    ctx.strokeStyle = "#2b2118";
    ctx.lineWidth = 6;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    ctx.fillStyle = "#2b2118";
    ctx.textAlign = "left";
    ctx.font = "bold 58px Arial";
    ctx.fillText("CASE FILE", 80, 125);

    ctx.font = "24px Arial";
    ctx.fillText(`DATE: ${text.year}`, 82, 170);
    ctx.fillText("STATUS: CLASSIFIED", 82, 205);

    drawImageInBox(90, 250, 720, 570);

    ctx.strokeStyle = "#2b2118";
    ctx.lineWidth = 4;
    ctx.strokeRect(90, 250, 720, 570);

    ctx.fillStyle = "rgba(120, 0, 0, 0.88)";
    ctx.font = "bold 56px Arial";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(670, 790);
    ctx.rotate(-0.18);
    ctx.strokeStyle = "rgba(120,0,0,0.9)";
    ctx.lineWidth = 4;
    ctx.strokeRect(-175, -45, 350, 85);
    ctx.fillText("EVIDENCE", 0, 15);
    ctx.restore();

    ctx.fillStyle = "#2b2118";
    ctx.textAlign = "left";
    ctx.font = "bold 44px Arial";
    wrapText(text.title.toUpperCase(), 90, 905, 760, 50, "left");

    ctx.fillStyle = "#4a3727";
    ctx.font = "24px Arial";
    wrapText(text.subtitle, 90, 1015, 760, 34, "left");

    ctx.fillStyle = "#5c4938";
    ctx.font = "20px Arial";
    wrapText(text.extra, 90, 1095, 760, 30, "left");

    drawRedStringBoard(text.accent);
}

function drawCyberpunkPoster() {
    const text = getUserText();

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#050816");
    gradient.addColorStop(0.55, "#111827");
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCyberGrid(text.accent);

    ctx.strokeStyle = text.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(70, 130, 380, 540);

    drawImageInBox(95, 155, 330, 470);

    ctx.strokeStyle = text.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(95, 155, 330, 470);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "bold 52px Arial";
    ctx.fillText("CYBER ID", 500, 135);

    ctx.fillStyle = text.accent;
    ctx.font = "bold 26px Arial";
    ctx.fillText("VISUAL IDENTITY CARD", 500, 180);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px Arial";
    wrapText(text.title.toUpperCase(), 500, 285, 400, 62, "left");

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "24px Arial";
    wrapText(text.subtitle, 500, 405, 400, 34, "left");

    ctx.fillStyle = text.accent;
    ctx.font = "bold 24px Arial";
    ctx.fillText(`YEAR: ${text.year}`, 500, 520);

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "20px Arial";
    wrapText(text.extra, 500, 580, 400, 30, "left");

    drawFakeBarcode(500, 710, 360, 40);
    drawScanLines();
}

function drawPostcardPoster() {
    const text = getUserText();

    ctx.fillStyle = "#f4e2bd";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    addPaperNoise();

    ctx.strokeStyle = "#8c6f47";
    ctx.lineWidth = 6;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

    drawImageInBox(90, 110, 820, 630);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 14;
    ctx.strokeRect(90, 110, 820, 630);

    ctx.fillStyle = text.accent;
    ctx.textAlign = "center";
    ctx.font = "bold 68px Georgia";
    wrapText(text.title, canvas.width / 2, 845, 780, 72, "center");

    ctx.fillStyle = "#4b3826";
    ctx.font = "28px Georgia";
    wrapText(text.subtitle, canvas.width / 2, 960, 780, 38, "center");

    ctx.fillStyle = "#7b5d3c";
    ctx.font = "24px Georgia";
    ctx.fillText(text.year, canvas.width / 2, 1070);

    ctx.font = "22px Georgia";
    wrapText(text.extra, canvas.width / 2, 1130, 760, 30, "center");

    drawPostStamp(text.accent);
}

function drawMagazinePoster() {
    const text = getUserText();

    drawImageCover();

    const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
    overlay.addColorStop(0, "rgba(0,0,0,0.15)");
    overlay.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 96px Arial";
    ctx.fillText("VIBE", canvas.width / 2, 110);

    ctx.fillStyle = text.accent;
    ctx.font = "bold 22px Arial";
    ctx.fillText("SPECIAL ISSUE", canvas.width / 2, 150);

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px Arial";
    wrapText("THE NEW FACE OF CREATIVE VISUALS", 65, 280, 250, 40, "left");

    wrapText("POSTER LAB EDITION", 65, 410, 250, 40, "left");

    ctx.textAlign = "right";
    wrapText("STYLE, STORY & DIGITAL EXPERIMENTS", 935, 280, 250, 40, "right");

    wrapText("FROM PHOTO TO DESIGN", 935, 410, 250, 40, "right");

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 78px Arial";
    wrapText(text.title.toUpperCase(), canvas.width / 2, 1030, 840, 82, "center");

    ctx.fillStyle = text.accent;
    ctx.font = "bold 24px Arial";
    wrapText(text.subtitle.toUpperCase(), canvas.width / 2, 1160, 760, 34, "center");

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "22px Arial";
    ctx.fillText(text.year, canvas.width / 2, 1260);
}

function drawWantedPoster() {
    const text = getUserText();

    ctx.fillStyle = "#d7c29a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    addPaperNoise();

    ctx.strokeStyle = "#5b4324";
    ctx.lineWidth = 8;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    ctx.textAlign = "center";
    ctx.fillStyle = "#3f2b16";
    ctx.font = "bold 108px Georgia";
    ctx.fillText("WANTED", canvas.width / 2, 165);

    ctx.font = "bold 30px Georgia";
    ctx.fillText(`REWARD • ${text.year}`, canvas.width / 2, 220);

    drawImageInBox(180, 280, 640, 560);

    ctx.strokeStyle = "#5b4324";
    ctx.lineWidth = 4;
    ctx.strokeRect(180, 280, 640, 560);

    ctx.fillStyle = "#3f2b16";
    ctx.font = "bold 68px Georgia";
    wrapText(text.title.toUpperCase(), canvas.width / 2, 940, 760, 72, "center");

    ctx.font = "28px Georgia";
    wrapText(text.subtitle, canvas.width / 2, 1050, 760, 38, "center");

    ctx.font = "22px Georgia";
    wrapText(text.extra, canvas.width / 2, 1140, 760, 32, "center");

    ctx.font = "bold 26px Georgia";
    ctx.fillText("CONTACT THE SHERIFF IMMEDIATELY", canvas.width / 2, 1290);
}

function drawAlbumPoster() {
    const text = getUserText();

    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const squareX = 120;
    const squareY = 180;
    const squareSize = 760;

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(squareX - 30, squareY - 30, squareSize + 60, squareSize + 60);

    drawImageInBox(squareX, squareY, squareSize, squareSize);

    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.fillRect(squareX, squareY, squareSize, squareSize);

    ctx.strokeStyle = text.accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(squareX, squareY, squareSize, squareSize);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "bold 24px Arial";
    ctx.fillText(text.year, canvas.width / 2, 95);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 76px Arial";
    wrapText(text.title.toUpperCase(), canvas.width / 2, 1085, 820, 80, "center");

    ctx.fillStyle = text.accent;
    ctx.font = "bold 28px Arial";
    wrapText(text.subtitle.toUpperCase(), canvas.width / 2, 1195, 760, 36, "center");

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "20px Arial";
    wrapText(text.extra, canvas.width / 2, 1275, 780, 30, "center");
}

function drawNewsPoster() {
    const text = getUserText();

    ctx.fillStyle = "#f3f1eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.font = "bold 82px Georgia";
    ctx.fillText("THE DAILY POST", canvas.width / 2, 105);

    ctx.font = "24px Georgia";
    ctx.fillText(text.year, canvas.width / 2, 145);

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 170);
    ctx.lineTo(930, 170);
    ctx.stroke();

    drawImageInBox(90, 220, 820, 500);

    ctx.fillStyle = "#111111";
    ctx.textAlign = "left";
    ctx.font = "bold 60px Georgia";
    wrapText(text.title, 90, 810, 820, 66, "left");

    ctx.font = "italic 26px Georgia";
    wrapText(text.subtitle, 90, 940, 820, 34, "left");

    ctx.font = "18px Georgia";
    ctx.fillStyle = "#333333";
    drawNewsColumns(text.extra);
}

function drawNewsColumns(extraText) {
    const startY = 1020;
    const colWidth = 250;
    const gap = 35;

    const text1 = extraText + " " + generateFillerText();
    const text2 = generateFillerText();
    const text3 = generateFillerText();

    ctx.textAlign = "left";
    wrapText(text1, 90, startY, colWidth, 24, "left");
    wrapText(text2, 375, startY, colWidth, 24, "left");
    wrapText(text3, 660, startY, colWidth, 24, "left");
}

function generateFillerText() {
    return "This visual front page was generated from an uploaded image in the browser. The layout combines typography, image framing and thematic styling into one multimedia output.";
}

function drawOverlays() {
    overlays.forEach((overlay, index) => {
        if (overlay.type === "text") {
            drawTextOverlay(overlay, index === selectedOverlayIndex);
        }

        if (overlay.type === "stamp") {
            drawStampOverlay(overlay, index === selectedOverlayIndex);
        }
    });
}

function drawTextOverlay(overlay, isSelected) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold ${overlay.fontSize}px ${overlay.fontFamily}`;
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.strokeText(overlay.text, overlay.x, overlay.y);
    ctx.fillStyle = overlay.color;
    ctx.fillText(overlay.text, overlay.x, overlay.y);

    const bounds = getOverlayBounds(overlay);

    if (isSelected) {
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    ctx.restore();
}

function drawStampOverlay(overlay, isSelected) {
    const paddingX = 24;
    const paddingY = 18;

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold ${overlay.fontSize}px Arial`;

    const textWidth = ctx.measureText(overlay.text).width;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = overlay.fontSize + paddingY * 2;

    ctx.translate(overlay.x, overlay.y);
    ctx.rotate(overlay.rotation || 0);

    ctx.strokeStyle = overlay.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);

    ctx.fillStyle = overlay.color;
    ctx.fillText(overlay.text, 0, overlay.fontSize * 0.32);

    if (isSelected) {
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 2;
        ctx.strokeRect(-boxWidth / 2 - 6, -boxHeight / 2 - 6, boxWidth + 12, boxHeight + 12);
    }

    ctx.restore();
}

function findOverlayAtPosition(x, y) {
    for (let i = overlays.length - 1; i >= 0; i--) {
        const bounds = getOverlayBounds(overlays[i]);

        if (
            x >= bounds.x &&
            x <= bounds.x + bounds.width &&
            y >= bounds.y &&
            y <= bounds.y + bounds.height
        ) {
            return i;
        }
    }

    return -1;
}

function getOverlayBounds(overlay) {
    if (overlay.type === "text") {
        ctx.save();
        ctx.font = `bold ${overlay.fontSize}px ${overlay.fontFamily}`;
        const width = ctx.measureText(overlay.text).width;
        ctx.restore();

        return {
            x: overlay.x - width / 2 - 12,
            y: overlay.y - overlay.fontSize,
            width: width + 24,
            height: overlay.fontSize + 22
        };
    }

    if (overlay.type === "stamp") {
        ctx.save();
        ctx.font = `bold ${overlay.fontSize}px Arial`;
        const textWidth = ctx.measureText(overlay.text).width;
        ctx.restore();

        const width = textWidth + 60;
        const height = overlay.fontSize + 42;

        return {
            x: overlay.x - width / 2,
            y: overlay.y - height / 2,
            width: width,
            height: height
        };
    }

    return { x: 0, y: 0, width: 0, height: 0 };
}

function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function drawImageCover() {
    const imageRatio = uploadedImage.width / uploadedImage.height;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth;
    let drawHeight;
    let offsetX;
    let offsetY;

    if (imageRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(uploadedImage, offsetX, offsetY, drawWidth, drawHeight);
}

function drawImageInBox(x, y, width, height) {
    const imageRatio = uploadedImage.width / uploadedImage.height;
    const boxRatio = width / height;

    let drawWidth;
    let drawHeight;
    let offsetX;
    let offsetY;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    if (imageRatio > boxRatio) {
        drawHeight = height;
        drawWidth = drawHeight * imageRatio;
        offsetX = x + (width - drawWidth) / 2;
        offsetY = y;
    } else {
        drawWidth = width;
        drawHeight = drawWidth / imageRatio;
        offsetX = x;
        offsetY = y + (height - drawHeight) / 2;
    }

    ctx.drawImage(uploadedImage, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
}

function drawVignette() {
    const radial = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        100,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.75
    );

    radial.addColorStop(0, "rgba(0,0,0,0)");
    radial.addColorStop(1, "rgba(0,0,0,0.65)");

    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function addPaperNoise() {
    const count = 9000;

    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const alpha = Math.random() * 0.08;

        ctx.fillStyle = `rgba(50, 35, 20, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

function drawRedStringBoard(accent) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(110, 850);
    ctx.lineTo(760, 260);
    ctx.moveTo(220, 845);
    ctx.lineTo(820, 530);
    ctx.moveTo(120, 1100);
    ctx.lineTo(780, 805);
    ctx.stroke();

    ctx.fillStyle = accent;
    drawPin(110, 850);
    drawPin(760, 260);
    drawPin(220, 845);
    drawPin(820, 530);
    drawPin(120, 1100);
    drawPin(780, 805);
}

function drawPin(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
}

function drawCyberGrid(accent) {
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
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
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;

    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

function drawScanLines() {
    ctx.fillStyle = "rgba(255,255,255,0.04)";

    for (let y = 0; y < canvas.height; y += 6) {
        ctx.fillRect(0, y, canvas.width, 2);
    }
}

function drawFakeBarcode(x, y, width, height) {
    ctx.fillStyle = "#ffffff";

    let currentX = x;

    while (currentX < x + width) {
        const barWidth = Math.random() * 7 + 2;
        const barHeight = height * (0.55 + Math.random() * 0.45);

        ctx.fillRect(currentX, y, barWidth, barHeight);
        currentX += barWidth + Math.random() * 8 + 3;
    }
}

function drawPostStamp(accent) {
    ctx.save();
    ctx.translate(835, 1120);
    ctx.rotate(0.08);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(-80, -50, 150, 100);

    ctx.fillStyle = accent;
    ctx.textAlign = "center";
    ctx.font = "bold 22px Georgia";
    ctx.fillText("POST", -5, -10);
    ctx.font = "18px Georgia";
    ctx.fillText("CARD", -5, 20);

    ctx.restore();
}

function wrapText(text, x, y, maxWidth, lineHeight, align = "center") {
    const words = text.split(" ");
    let line = "";

    ctx.textAlign = align;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }

    ctx.fillText(line, x, y);
}

function downloadPoster() {
    let mimeType = "image/png";
    let fileExtension = "png";
    let quality = 1.0;

    if (exportFormatInput.value === "jpeg") {
        mimeType = "image/jpeg";
        fileExtension = "jpg";
        quality = 0.92;
    }

    if (exportFormatInput.value === "webp") {
        mimeType = "image/webp";
        fileExtension = "webp";
        quality = 0.92;
    }

    const link = document.createElement("a");
    link.download = `photo_story_poster.${fileExtension}`;
    link.href = canvas.toDataURL(mimeType, quality);
    link.click();
}