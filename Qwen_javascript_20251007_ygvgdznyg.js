let handModel;
let video, canvas, ctx;

// Қол қимылын тану
async function initHandDetection() {
  video = document.getElementById('video');
  canvas = document.getElementById('output');
  ctx = canvas.getContext('2d');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
    video.style.display = 'none';

    handModel = await handpose.load();
    detectHand();
  } catch (err) {
    alert("Камераға рұқсат беріңіз!");
  }
}

async function detectHand() {
  const predictions = await handModel.estimateHands(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (predictions.length > 0) {
    const hand = predictions[0];
    const wristY = hand.landmarks[0][1]; // қолдың Y координатасы

    if (wristY < 150) {
      turnOnDevice();
    } else if (wristY > 300) {
      turnOffDevice();
    }

    // Қолдың нүктелерін салу (опционал)
    for (let keypoint of hand.landmarks) {
      ctx.beginPath();
      ctx.arc(keypoint[0], keypoint[1], 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
  }
  requestAnimationFrame(detectHand);
}

// Дауыс тану
function startVoiceControl() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Браузеріңіз дауыс тануды қолдамайды!");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'kk-KZ';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("Сіз айттыңыз:", transcript);
    
    if (transcript.includes("жарықты қос")) {
      turnOnDevice();
    } else if (transcript.includes("жарықты сөндір")) {
      turnOffDevice();
    }
  };

  recognition.onerror = (event) => {
    console.error("Дауыс қатесі:", event.error);
  };
}

// Құрылғыны басқару
function turnOnDevice() {
  document.getElementById('led').classList.add('on');
  document.getElementById('servo').style.transform = 'rotate(90deg)';
}

function turnOffDevice() {
  document.getElementById('led').classList.remove('on');
  document.getElementById('servo').style.transform = 'rotate(0deg)';
}

// Батырмалар
document.getElementById('startCamera').onclick = initHandDetection;
document.getElementById('startMic').onclick = startVoiceControl;