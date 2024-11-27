import { loadBar } from "./loadBar.js";

// Initialize Socket.io connection and handle events
const logContainer = document.getElementById("log-container");

let socket;

export function initializeSocket() {
    socket = io.connect(window.location.href);

    socket.on("compilation_log", (data) => {
        loadBar(data.message);

        const p = document.createElement("p");
        p.textContent = data.message;
        id = data.message.match(/\[([^\]]+)\]/)[1];
        p.setAttribute("id", id);
        logContainer.appendChild(p);
        logContainer.scrollTop = logContainer.scrollHeight;
    });
}

export { socket };