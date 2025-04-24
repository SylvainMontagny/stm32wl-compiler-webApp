import { loadBar } from "./loadBar.js";
import { elements } from "./elements.js";
import { hideLoadBar } from "./loadBar.js";
import { downloadFirmware } from "./compiler.js";
import { showSnackBar } from "./snackBar.js";

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

    socket.on("compile_complete", (data) => {
        hideLoadBar();
        console.log(data)
        if(data.status === 0){
            console.log("Compilation success");
            downloadFirmware(data.id, data.type, data.fileName);
        } else if (data.status === 137) {
            console.log("Compilation cancelled");
        } else if (data.status === 400) {
            console.log("Invalid JSON format sent");
        } else {
            console.log("Error while compiling");
        }
    })
}

export { socket };

