import { elements } from "./elements.js";
import {
  otaaAbp,
  cayenne1Error,
  cayenne2Error,
  updatePayloadConfiguration,
} from "./formHandlers.js";
import { saveFormData, restoreFormData } from "./storage.js";
import {
  compileFirmware,
  compileMultipleFirmware,
  getFormJson,
  getMultipleFormJson,
} from "./compiler.js";
import { genRandomEUI, genRandomKey } from "./generators.js";
import { socket } from "./socket.js";
import { store } from "./store.js";
import { showSnackBar } from "./snackBar.js";

export function initializeEventListeners() {
  // Display advanced settings form
  elements.advancedContainer.addEventListener("click", function () {
    if (
      elements.advancedForm.style.display === "" ||
      elements.advancedForm.style.display === "none"
    ) {
      elements.advancedForm.style.display = "grid";
      elements.svgArrow.style.transform = "rotate(90deg)";
    } else {
      elements.advancedForm.style.display = "none";
      elements.svgArrow.style.transform = "rotate(0deg)";
    }
  });

  elements.activationMode.addEventListener("change", otaaAbp);

  elements.cayenne1.addEventListener("change", cayenne1Error);

  elements.cayenne2.addEventListener("change", cayenne2Error);

  // Restore default settings for LoRaWAN
  elements.rLorawan.addEventListener("click", function () {
    elements.activationMode.value = "otaa";
    elements.class.value = "class_a";
    elements.spreadingFactor.value = "7";
    document.getElementById("adaptative-dr-off").checked = true;
    document.getElementById("confirmation-off").checked = true;
    elements.appPort.value = "15";
    otaaAbp();
    saveFormData();
  });

  // Restore default settings for Application
  elements.rApp.addEventListener("click", function () {
    document.getElementById("send-every-frame-delay").checked = true;
    elements.frameDelay.value = "10";

    elements.hello.checked = true;
    elements.usmbValve.checked = true;

    updatePayloadConfiguration();

    saveFormData();
  });

  elements.generateDevEui.addEventListener("click", function () {
    genRandomEUI(elements.devEui);
  });

  elements.generateAppKey.addEventListener("click", function () {
    genRandomKey(32, elements.appKey);
  });

  elements.generateAppEUI.addEventListener("click", function () {
    genRandomKey(16, elements.appEui);
  });

  elements.generateDevAddr.addEventListener("click", function () {
    genRandomKey(8, elements.devAddr);
  });

  elements.generateNwkskey.addEventListener("click", function () {
    genRandomKey(32, elements.nwksKey);
  });

  elements.generateAppskey.addEventListener("click", function () {
    genRandomKey(32, elements.appsKey);
  });

  elements.generateAdminAppKey.addEventListener("click", function () {
    genRandomKey(32, elements.adminAppKey);
  });

  // Copy to clipboard
  const copyIcons = document.querySelectorAll(".copy-icon");

  // Add event listener to all copy icons
  copyIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      // Select the input field and copy the text
      const input = this.previousElementSibling;
      input.select();
      input.setSelectionRange(0, 99999); // For smaller devices
      navigator.clipboard.writeText(input.value);
    });
  });

  // Disable credentials
  function disableCredentials() {
    [
      elements.appEui,
      elements.devAddr,
      elements.nwksKey,
      elements.appsKey,
      elements.devEui,
      elements.appKey,
      elements.adminAppKey,
    ].forEach((element) => {
      element.style.color = "#D1D1D1";
      element.disabled = true;
    });
    document.querySelectorAll(".input-icon i").forEach((icon) => {
      icon.style.color = "#D1D1D1";
      icon.style.cursor = "not-allowed";
    });
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.style.display = "none";
    });
  }

  // Enable credentials
  function enableCredentials() {
    [
      elements.appEui,
      elements.devAddr,
      elements.nwksKey,
      elements.appsKey,
      elements.devEui,
      elements.appKey,
      elements.adminAppKey,
    ].forEach((element) => {
      element.style.color = "#000";
      element.disabled = false;
    });
    document.querySelectorAll(".input-icon i").forEach((icon) => {
      icon.style.color = "#666";
      icon.style.cursor = "pointer";
    });
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.style.display = "flex";
    });
  }

  // Disable auto send
  function disableAutoSend() {
    elements.usbAutoSend.checked = false;
    elements.usbAutoSend.disabled = true;
    elements.usbAutoSendLabel.style.color = "#D1D1D1";
    elements.usbAutoSend.style.cursor = "not-allowed";
    elements.usbAutoSendLabel.style.cursor = "not-allowed";
  }

  // Enable auto send
  function enableAutoSend() {
    elements.usbAutoSend.disabled = false;
    elements.usbAutoSendLabel.style.color = "#000";
    elements.usbAutoSend.style.cursor = "pointer";
    elements.usbAutoSendLabel.style.cursor = "pointer";
  }

  // Multiple firmware
  elements.multipleFirmware.addEventListener("change", function () {
    let firmwareNumber = document.querySelector(".firmware-number");
    if (elements.multipleFirmware.checked) {
      firmwareNumber.style.color = "#000";
      elements.firmwareNumber.style.color = "#000";
      elements.firmwareNumber.disabled = false;
      elements.firmwareNameInput.style.color = "#000";
      elements.firmwareNameInput.disabled = false;
      disableAutoSend();
      disableCredentials();
    } else {
      firmwareNumber.style.color = "#D1D1D1";
      elements.firmwareNumber.style.color = "#D1D1D1";
      elements.firmwareNumber.disabled = true;
      elements.firmwareNameInput.style.color = "#D1D1D1";
      elements.firmwareNameInput.disabled = true;
      enableAutoSend();
      enableCredentials();
    }
  });

  // Save form data on input change
  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", saveFormData);
  });

  // Restore data on page load
  window.addEventListener("load", restoreFormData);

  window.addEventListener("load", function () {
    // Transmission mode onload
    cayenne1Error();
    cayenne2Error();
    updatePayloadConfiguration();

    // gen keys
    if (!localStorage.getItem("formData")) {
      genRandomEUI(elements.devEui);
      genRandomKey(32, elements.appKey);
      genRandomKey(16, elements.appEui);
      genRandomKey(8, elements.devAddr);
      genRandomKey(32, elements.nwksKey);
      genRandomKey(32, elements.appsKey);
      genRandomKey(32, elements.adminAppKey);
      saveFormData();
    }
  });

  //Min and max input number values
  function mixMaxRange(inputElement) {
    inputElement.addEventListener("input", () => {
      let value = parseInt(inputElement.value, 10);
      if (inputElement.min && value < inputElement.min) {
        inputElement.value = inputElement.min; // Reset to min if below
      } else if (inputElement.max && value > inputElement.max) {
        inputElement.value = inputElement.max; // Reset to max if above
      }
    });
  }

  mixMaxRange(elements.appPort);
  mixMaxRange(elements.frameDelay);

  // Check if USB path is selected before enabling auto send
  elements.usbAutoSend.addEventListener("change", async function () {
    if (this.checked) {
      try {
        store.usbPathHandle = await window.showDirectoryPicker();
        console.log("USB path selected:", store.usbPathHandle);
      } catch (error) {
        console.error("Error selecting USB path:", error);
        showSnackBar("You need to select a USB path to enable auto send.");
        this.checked = false;
        return;
      }
    } else {
      console.log("Auto send disabled.");
    }
  });

  document
    .getElementById("generate-firmware")
    .addEventListener("click", async function () {
      if (elements.multipleFirmware.checked) {
        let nbFirmware = document.getElementById("firmware-nb").value;
        let jsonConfig = getMultipleFormJson(nbFirmware);
        compileMultipleFirmware(jsonConfig)
        console.log("jsonConfig : ");

        console.log(jsonConfig);
      } else {
        let jsonConfig = getFormJson();
        compileFirmware(jsonConfig)
      }
      const compilerContainer = document.querySelector(".compiler-container");
      const pageContainer = document.querySelector(".page-container");
      const toggleCompiler = document.querySelector(".toggle-compiler");
      const chevron = document.querySelector(".fa-chevron-right");

      if (compilerContainer.style.right === "-35%") {
        compilerContainer.style.right = "0px";
        pageContainer.style.width = "65%";
        toggleCompiler.style.right = "35%";
        chevron.style.transform = "rotate(0deg)";
      }
    });

  const compilerContainer = document.querySelector(".compiler-container");
  const pageContainer = document.querySelector(".page-container");

  // Fermer le panneau par défaut
  if (compilerContainer.style.right !== "0px") {
    compilerContainer.style.right = "-35%";
    pageContainer.style.width = "100%";
  }

  document
    .getElementById("toggle-compiler")
    .addEventListener("click", function () {
      const compilerContainer = document.querySelector(".compiler-container");
      const pageContainer = document.querySelector(".page-container");
      const toggleCompiler = document.querySelector(".toggle-compiler");
      const chevron = document.querySelector(".fa-chevron-right");

      if (
        compilerContainer.style.right === "0px" ||
        !compilerContainer.style.right
      ) {
        compilerContainer.style.right = "-35%";
        pageContainer.style.width = "100%";
        toggleCompiler.style.right = "0%";
        chevron.style.transform = "rotate(180deg)";
      } else {
        compilerContainer.style.right = "0px";
        pageContainer.style.width = "65%";
        toggleCompiler.style.right = "35%";
        chevron.style.transform = "rotate(0deg)";
      }
    });

  async function getJsonFile(file) {
    const response = await fetch(file);
    const data = await response.json();
    return data;
  }

  getJsonFile("js/captions.json").then((data) => {
    document
      .querySelectorAll(".fa-regular.fa-circle-question")
      .forEach((icon) => {
        icon.addEventListener("mouseover", function () {
          let caption = this.parentElement.textContent;
          caption = caption.replace(/\s/g, "");
          let text = data[caption];

          const tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.innerHTML = text;
          document.querySelector(".form-container").appendChild(tooltip);

          const rect = this.getBoundingClientRect();
          tooltip.style.left = `${rect.left + window.scrollX - 15}px`;
          tooltip.style.top = `${
            rect.top + window.scrollY - tooltip.offsetHeight - 6
          }px`;

          const removeTooltip = () => {
            setTimeout(() => {
              if (!tooltip.matches(":hover") && !icon.matches(":hover")) {
                tooltip.remove();
              }
            }, 200);
          };

          this.addEventListener("mouseout", removeTooltip);
          tooltip.addEventListener("mouseout", removeTooltip);
        });
      });
  });

  elements.cancel.addEventListener("click", function () {
    const firmwareLog = document.getElementById("log-container");
    const firmwareId = firmwareLog.getAttribute("data-firmware-id");
    socket.emit("cancel_compilation", { id: firmwareId });
  });

  elements.frameDelay.addEventListener("change", function () {
    let value = parseInt(elements.frameDelay.value, 10);
    if (value < 8) {
      elements.frameDelay.value = 8;
    }
  });

  // firmware number negative value
  elements.firmwareNumber.addEventListener("change", function () {
    let value = parseFloat(elements.firmwareNumber.value);
    if (isNaN(value) || value < 1 || !Number.isInteger(value)) {
      elements.firmwareNumber.value = 2;
    }
  });

  elements.payloadRadioButtons.forEach((radio) => {
    radio.addEventListener("change", updatePayloadConfiguration);
  });
}
