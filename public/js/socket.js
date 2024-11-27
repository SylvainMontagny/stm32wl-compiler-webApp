import { loadBar } from "./loadBar.js";

// Initialize Socket.io connection and handle events
const logContainer = document.getElementById("log-container");

function randomId() {
    let min = 10 ** 14;
    let max = 10 ** 15;
    let id_random = Math.floor(Math.random() * (max - min)) + min;
    return id_random.toString(36);
}

let clientId;

export function initializeSocket() {
    const socket = io.connect(window.location.href);
    clientId = randomId();

    socket.emit("create_id", clientId);

    socket.on("compilation_log", (data) => {
        loadBar(data.message);

        const p = document.createElement("p");
        p.textContent = data.message;
        logContainer.appendChild(p);
        logContainer.scrollTop = logContainer.scrollHeight;
    });
}

export { clientId };