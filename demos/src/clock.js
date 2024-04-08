// docker run --rm -p 8080:80 -v ./src/:/usr/share/nginx/html:ro nginx
// http://localhost:8080/clock.html?showVideo=1&showStats=1&setBackend=wasm

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const setBackend = urlParams.get('setBackend');
const expectedScore = parseFloat(urlParams.get('expectedScore')) || 0.80;
const showStats = urlParams.get('showStats');
const showVideo = urlParams.get('showVideo');

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");
/**
 * @type {HTMLDivElement}
 */
const canvasDiv = document.getElementById('canvasDiv');
/**
 * @type {HTMLVideoElement}
 */
const video = document.getElementById('video');
/**
 * @type {HTMLDivElement}
 */
const resultDiv = document.getElementById('result');

if (showStats) {
    resultDiv.style.visibility = 'visible';
}
if (showVideo) {
    video.style.visibility = 'visible';
}

let currentRotate = 0;
let brightness = 1;

const ctx = canvas.getContext("2d");
const clockRadius = canvas.height / 2;
ctx.translate(clockRadius, clockRadius);

drawClock(ctx, clockRadius * 0.90);
setInterval(() => {
    drawClock(ctx, clockRadius * 0.90);
}, 1000);

async function start() {
    if (setBackend) { // webgl, wasm, cpu
        if (setBackend === 'wasm') {
            tf.wasm.setWasmPaths('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.2.0/dist/'); // tfjs-backend-wasm-simd.wasm
        }
        tf.setBackend(setBackend); 
    }
    await tf.ready();
    resultDiv.innerText = 'Backend: ' + tf.getBackend();

    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, {
        runtime: 'tfjs',
        modelType: 'lite'
    });
    const sample = async () => {
        try {
            const poses = await detector.estimatePoses(video);
            console.log('score:', poses[0]);
            const eyes = poses.filter(p => p.score > expectedScore).map(
                p => p.keypoints.filter(
                    k => k.score > expectedScore && ['left_eye', 'right_eye'].some(eye => eye === k.name)
                )
            );
            setRotateByEyes(eyes);
        } catch (err) {
            console.error(err);
            resultDiv.innerText = 'err: ' + err.message;
        }
        setTimeout(sample, 200);
    };

    video.onloadeddata = () => {
        sample().catch(() => {});
    }
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = mediaStream;
}

start().catch(err => {
    console.error(err);
    resultDiv.innerText = 'start err: ' + err.message;
});

const fullScreenButton = document.getElementById("fullScreen");
fullScreenButton.onclick = () => {
    canvasDiv.requestFullscreen({
        navigationUI: 'hide'
    });
};

function setRotateByEyes(eyes) {
    const [firstEyes] = eyes;
    if (firstEyes?.length === 2) {
        let [leftEye, rightEye] = firstEyes;
        if (leftEye.name === 'right_eye') {
            const tmp = leftEye;
            leftEye = rightEye;
            rightEye = tmp;
        }
        console.log(leftEye, rightEye);
        const xDist = leftEye.x - rightEye.x;
        const yDist = leftEye.y - rightEye.y;
        const newRotate = Math.round(50.0 * -Math.atan2(yDist, xDist)) / 50.0;
        resultDiv.innerText = `brightness: ${brightness.toFixed(2)}, currentRotate: ${currentRotate}, newRotate: ${newRotate}, xDist: ${Math.round(1000.0 * xDist) / 1000.0}, yDist: ${Math.round(1000.0 * yDist) / 1000.0}`; // + ', eyes: ' + JSON.stringify(eyes);
        if (Math.abs(currentRotate - newRotate) >= 0.1 && xDist * xDist + yDist * yDist >= 16) {
            currentRotate = newRotate;
        }
        canvas.style.transitionDelay = '0ms';
        canvas.style.transform = 'translate(-50%, -50%) rotate(' + currentRotate + 'rad)';
    } else {
        console.log('no eyes found:', eyes);
        currentRotate = 0;
        canvas.style.transitionDelay = '2s';
        canvas.style.transform = 'translate(-50%, -50%) rotate(' + currentRotate + 'rad)';
        resultDiv.innerText = `brightness: ${brightness.toFixed(2)}, currentRotate: ${currentRotate}`;
    }
}

function drawClock(ctx, radius) {
    const distanceToNoon = Math.abs(12 - new Date().getHours());
    const noonHourPlusSomeExtra = 12.0 + 1.0;
    brightness = currentRotate !== 0 ? 1.0 : Math.max(6, noonHourPlusSomeExtra - distanceToNoon) / noonHourPlusSomeExtra; 
    drawFace(ctx, radius, brightness);
    const color = (5 + Math.ceil(brightness * 10.0)).toString(16).toUpperCase();
    ctx.strokeStyle = "#" + color + color + color;
    ctx.fillStyle = '#' + color + color + color;
    drawNumbers(ctx, radius);
    drawTime(ctx, radius);
}

function drawFace(ctx, radius, brightness) {
    var grad;
    ctx.beginPath();
    ctx.fillStyle = 'black';
    grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    const colorHigh = 5 + Math.ceil(3.0 * brightness);
    const colorLow = colorHigh - 3.0;
    grad.addColorStop(0, '#' + colorLow + colorLow + colorLow);
    grad.addColorStop(0.5, '#' + colorHigh + colorHigh + colorHigh);
    grad.addColorStop(1, '#' + colorLow + colorLow + colorLow);
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.1;
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fill();
}
function drawNumbers(ctx, radius) {
    var ang;
    var n;
    ctx.font = radius * 0.15 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (n = 1; n < 13; n++) {
        ang = n * Math.PI / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.85);
        ctx.rotate(-ang);
        ctx.fillText(n.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.85);
        ctx.rotate(-ang);
    }
}
function drawTime(ctx, radius) {
    const now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    //hour
    hour = hour % 12;
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    drawHand(ctx, hour, radius * 0.5, radius * 0.07);
    //minute
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minute, radius * 0.8, radius * 0.07);
    // second
    second = (second * Math.PI / 30);
    drawHand(ctx, second, radius * 0.9, radius * 0.02);
}

function drawHand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}
