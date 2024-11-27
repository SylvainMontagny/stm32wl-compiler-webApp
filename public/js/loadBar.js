import { numberOfFirmware } from './compiler.js';

// Global variables
let currentProgress = 0;
let currentProgressMultiple = 0;
let currentFirmware = 1;

export function loadBar(message) {
    const progressBar = document.querySelector(".load-bar-progress");
    const p = document.querySelector(".load-bar-container p");

    const regex = /\[CC\]\s+(\w+)/;
    let progressPercentage = currentProgress

    if (regex.test(message)) {
        const match = message.match(regex);
        if (match) {
            const step = match[1];
            if (step === 'Startup') {
                progressPercentage = 0 / numberOfFirmware + currentProgressMultiple;
                p.textContent = '0/5 Creating files' + ' (' + currentFirmware + '/' + numberOfFirmware + ')';
            } else if (step === 'Core') {
                progressPercentage = 20 / numberOfFirmware + currentProgressMultiple;
                p.textContent = '1/5 Compiling Core files' + ' (' + currentFirmware + '/' + numberOfFirmware + ')';
            } else if (step === 'Drivers') {
                progressPercentage = 40 / numberOfFirmware + currentProgressMultiple;
                p.textContent = '2/5 Compiling Drivers' + ' (' + currentFirmware + '/' + numberOfFirmware + ')';
            } else if (step === 'LoRaWAN') {
                progressPercentage = 60 / numberOfFirmware + currentProgressMultiple;
                p.textContent = '3/5 Compiling LoRaWAN files' + ' (' + currentFirmware + '/' + numberOfFirmware + ')';
            } else if (step === 'Middlewares') {
                progressPercentage = 80 / numberOfFirmware + currentProgressMultiple;
                p.textContent = '4/5 Compiling Middlewares' + ' (' + currentFirmware + '/' + numberOfFirmware + ')';
            }
        }
    } else if (message.includes('Finished building')) {
        progressPercentage = 100 / numberOfFirmware + currentProgressMultiple;
        p.textContent = '5/5 Finished' + ' (' + currentFirmware + '/' + numberOfFirmware + ')';
        currentProgressMultiple += 100 / numberOfFirmware;
        currentFirmware++;
    }
    currentProgress = progressPercentage;

    progressBar.style.transition = 'width 1s ease';
    progressBar.style.width = `${progressPercentage}%`;
}

export function resetProgressBar() {
    const progressBar = document.querySelector(".load-bar-progress");
    const p = document.querySelector(".load-bar-container p");
    progressBar.style.width = "0%";
    p.textContent = '0/5 Creating files';
    currentProgress = 0;
    currentProgressMultiple = 0;
    currentFirmware = 1;
}

export function showLoadBar() {
    resetProgressBar();
    const compileButton = document.getElementById('generate-firmware');
    const loadBarContainer = document.querySelector('.load-bar-container');

    compileButton.style.display = 'none';
    loadBarContainer.style.display = 'flex';
}

export function hideLoadBar() {
    const compileButton = document.getElementById('generate-firmware');
    const loadBarContainer = document.querySelector('.load-bar-container');

    setTimeout(() => {
        loadBarContainer.style.display = 'none';
        compileButton.style.display = 'flex';
    }, 2000);
}