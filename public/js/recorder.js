let mediaRecorder;
let audioChunks = [];

// Voice Recording
async function startRecording() {
  const micBtn = document.getElementById("micBtn");
  micBtn.classList.add("recording");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    micBtn.classList.remove("recording");

    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "question.wav");

    document.getElementById("status").innerText = "Transcribing...";
    document.getElementById("aiResponse").innerText = "";
    document.getElementById("loader").classList.remove("hidden");

    try {
      const res = await fetch("/voice-question", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      document.getElementById("loader").classList.add("hidden");

      if (data.message) {
        document.getElementById("aiResponse").innerText = data.message;
        document.getElementById("status").innerText = "Musahem has Answered";
      } else {
        throw new Error("No message received.");
      }
    } catch (error) {
      document.getElementById("loader").classList.add("hidden");
      document.getElementById("status").innerText = " Something went wrong. Please try again.";
      document.getElementById("aiResponse").innerText = "";
      console.error("Voice error:", error);
    }
  };

  mediaRecorder.start();
  document.getElementById("status").innerText = " Recording...";
}

function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
}

// Typed Question Handler
async function sendTypedQuestion() {
  const input = document.getElementById("typedQuestion").value.trim();
  if (!input) return;

  document.getElementById("status").innerText = "Thinking...";
  document.getElementById("loader").classList.remove("hidden");
  document.getElementById("aiResponse").innerText = "";

  try {
    const res = await fetch("/text-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });

    const data = await res.json();
    document.getElementById("loader").classList.add("hidden");

    if (data.message) {
      document.getElementById("aiResponse").innerText = data.message;
      document.getElementById("status").innerText = "Answer ready";
    } else {
      throw new Error("No message received.");
    }
  } catch (error) {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("status").innerText = " Error answering your question.";
    console.error("Typed question error:", error);
  }
}
function copyAnswer() {
    const answerText = document.getElementById("aiResponse").innerText;
    navigator.clipboard.writeText(answerText).then(() => {
      const copyBtn = document.getElementById("copyBtn");
      copyBtn.innerText = "Copied!";
      setTimeout(() => (copyBtn.innerText = "Copy Answer"), 1500);
    });
  }
  