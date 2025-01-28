export function showSnackBar(message, callback, autoClose = true) {
    const snackbar = document.getElementById("snackbar");
    snackbar.innerHTML = message;

    if (callback) {
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Confirm";
        confirmButton.onclick = () => {
            callback(true);
            snackbar.className = snackbar.className.replace("show", "");
        };

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.onclick = () => {
            callback(false);
            snackbar.className = snackbar.className.replace("show", "");
        };

        snackbar.appendChild(confirmButton);
        snackbar.appendChild(cancelButton);
    } else {
        setTimeout(() => {
            snackbar.className = snackbar.className.replace("auto-close", "");
        }, 3000);
    }

    if (autoClose) {
        snackbar.classList.add("auto-close");
    } else {
        snackbar.classList.add("show");
    }
}