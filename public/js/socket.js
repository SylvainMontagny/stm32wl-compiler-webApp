import { loadBar } from "./loadBar.js";
import { elements } from "./elements.js";

const logContainer = elements.console;

let socket;

export function initializeSocket() {
    socket = io(window.location.location, { path:  window.location.pathname+`socket.io` });

    socket.on("compilation_log", (data) => {
        loadBar(data.message);

        const match = data.message.match(/\[([^\]]+)\]/);
        let displayText = data.message;

        if (match && match[1]) {
            logContainer.setAttribute("data-firmware-id", match[1]);
            displayText = data.message.replace(/\[[^\]]+\]\s*/, "");
        }

        const p = document.createElement("p");
        p.textContent = displayText;
        logContainer.appendChild(p);
        logContainer.scrollTop = logContainer.scrollHeight;
    });
}

export { socket };

