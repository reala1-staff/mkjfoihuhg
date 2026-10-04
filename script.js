const randomString = (length = 18) => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);

    return Array.from(bytes, b => chars[b % chars.length]).join("");
};

const sessionName = randomString();

document.title = sessionName;
document.getElementById("randomName").textContent = sessionName;

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const status = document.getElementById("status");

let recorder;
let stream;
let chunks = [];

startButton.addEventListener("click", async () => {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                displaySurface: "monitor"
            },
            audio: true
        });

        chunks = [];

        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = event => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, {
                type: recorder.mimeType
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `${randomString(24)}.webm`;
            a.click();

            URL.revokeObjectURL(url);

            status.textContent = "Captura finalizada";
            startButton.disabled = false;
            stopButton.disabled = true;
        };

        recorder.start(1000);

        status.textContent = "Captura activa";
        startButton.disabled = true;
        stopButton.disabled = false;

        // Si el usuario detiene la compartición desde el navegador.
        stream.getVideoTracks()[0].addEventListener("ended", () => {
            if (recorder && recorder.state !== "inactive") {
                recorder.stop();
            }
        });

    } catch (error) {
        console.error(error);
        status.textContent = "No se inició la captura";
    }
});

stopButton.addEventListener("click", () => {
    if (recorder && recorder.state !== "inactive") {
        recorder.stop();
    }

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
