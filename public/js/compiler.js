import { elements } from "./elements.js";
import { showLoadBar } from "./loadBar.js";
import { socket } from "./socket.js";
import { store } from "./store.js";
import { showSnackBar, hideSnackBar } from "./snackBar.js";
import { genRandomEUI, genRandomKey } from "./generators.js";


let numberOfFirmware = 1; // Number of firmware for loadbar

function formatEUI(str) {
  return `0x${str.match(/.{1,2}/g).join(", 0x")}`;
}

function formatAddr(str) {
  return "0x" + str;
}

function formatKey(str) {
  return str.match(/.{1,2}/g).join(",");
}

export function getFormJson() {
  let formData = {
    ACTIVATION_MODE: elements.activationMode.value.toUpperCase(),
    CLASS: elements.class.value.toUpperCase(),
    SPREADING_FACTOR: elements.spreadingFactor.value.toUpperCase(),
    ADAPTIVE_DR: (
      document.querySelector('input[name="adaptative-dr"]:checked').value ==
      "on"
    ).toString(),
    CONFIRMED: (
      document
        .querySelector('input[name="confirmation"]:checked')
        .value.toString() == "on"
    ).toString(),
    APP_PORT: elements.appPort.value,
    SEND_BY_PUSH_BUTTON: (
      document.querySelector('input[name="send-mode"]:checked').value ==
      "push-button"
    ).toString(),
    FRAME_DELAY: elements.frameDelay.value * 1000,
    PAYLOAD_1234: elements.hello.checked.toString(),
    ADMIN_SENSOR_ENABLED: elements.ikssensor.checked.toString(),
    PAYLOAD_TEMPERATURE:
      elements.temperature.checked || elements.ikstemperature.checked
        ? "true"
        : "false",
    PAYLOAD_HUMIDITY:
      elements.humidity.checked || elements.ikshumidity.checked
        ? "true"
        : "false",
    USMB_VALVE: elements.usmbValve.checked.toString(),
    ATIM_THAQ: elements.atimThaq.checked.toString(),
    WATTECO_TEMPO: elements.wattecoTempo.checked.toString(),
    TCT_EGREEN: elements.tctEgreen.checked.toString(),
    LOW_POWER: "false",
    CAYENNE_LPP_: (
      document.querySelector('input[name="cayenne-lpp"]:checked').value ==
      "enabled"
    ).toString(),
    devEUI_: formatEUI(elements.devEui.value),
    appKey_: formatKey(elements.appKey.value.toUpperCase()),
    appEUI_: formatEUI(elements.appEui.value),
    devAddr_: formatAddr(elements.devAddr.value),
    nwkSKey_: formatKey(elements.nwksKey.value),
    appSKey_: formatKey(elements.appsKey.value),
    ADMIN_GEN_APP_KEY: formatKey(elements.adminAppKey.value),
  };
  return formData;
}

// Get multiple firmware data as JSON
export function getMultipleFormJson(nbFirmware) {
  let firmwareData = [];
  for (let i = 0; i < nbFirmware; i++) {
    let formData = {
      name: elements.firmwareNameInput.value + "-" + (i + 1),
      ACTIVATION_MODE: elements.activationMode.value.toUpperCase(),
      CLASS: elements.class.value.toUpperCase(),
      SPREADING_FACTOR: elements.spreadingFactor.value.toUpperCase(),
      ADAPTIVE_DR: (
        document.querySelector('input[name="adaptative-dr"]:checked').value ==
        "on"
      ).toString(),
      CONFIRMED: (
        document
          .querySelector('input[name="confirmation"]:checked')
          .value.toString() == "on"
      ).toString(),
      APP_PORT: elements.appPort.value,
      SEND_BY_PUSH_BUTTON: (
        document.querySelector('input[name="send-mode"]:checked').value ==
        "push-button"
      ).toString(),
      FRAME_DELAY: elements.frameDelay.value * 1000,
      PAYLOAD_1234: elements.hello.checked.toString(),
      ADMIN_SENSOR_ENABLED: elements.ikssensor.checked.toString(),
      PAYLOAD_TEMPERATURE:
        elements.temperature.checked || elements.ikstemperature.checked
          ? "true"
          : "false",
      PAYLOAD_HUMIDITY:
        elements.humidity.checked || elements.ikshumidity.checked
          ? "true"
          : "false",
      USMB_VALVE: elements.usmbValve.checked.toString(),
      ATIM_THAQ: elements.atimThaq.checked.toString(),
      WATTECO_TEMPO: elements.wattecoTempo.checked.toString(),
      TCT_EGREEN: elements.tctEgreen.checked.toString(),
      LOW_POWER: "false",
      CAYENNE_LPP_: (
        document.querySelector('input[name="cayenne-lpp"]:checked').value ==
        "enabled"
      ).toString(),
      devEUI_: formatEUI(elements.devEui.value),
      appKey_: formatKey(elements.appKey.value.toUpperCase()),
      appEUI_: formatEUI(elements.appEui.value),
      devAddr_: formatAddr(elements.devAddr.value),
      nwkSKey_: formatKey(elements.nwksKey.value),
      appSKey_: formatKey(elements.appsKey.value),
      ADMIN_GEN_APP_KEY: formatKey(elements.adminAppKey.value),
    };
    firmwareData.push(formData);
    genRandomEUI(elements.devEui);
    genRandomKey(32, elements.appKey);
    genRandomKey(16, elements.appEui);
    genRandomKey(8, elements.devAddr);
    genRandomKey(32, elements.nwksKey);
    genRandomKey(32, elements.appsKey);
    genRandomKey(32, elements.adminAppKey);
  }
  return firmwareData;
}

// Compile firmware from jsonString of all form data
export async function compileFirmware(jsonConfig) {
  numberOfFirmware = 1;
  showLoadBar();
  elements.console.innerHTML = "";
  try {
    const requestData = {
      clientId: socket.id,
      formData: jsonConfig,
    };

    fetch(`./compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData, null, 2),
    });
  } catch (error) {
    console.error("Error:", error);
    showSnackBar("An error occurred while compiling the code");
  }
}

export async function downloadFirmware(compileId, type, fileName) {
  try {
    const response = await fetch(`./download?id=${compileId}&type=${type}&filename=${fileName}`, {
      method: "GET"
  });

    if (response.ok) {
      const blob = await response.blob();
      const fileName = response.headers.get("X-File-Name");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      store.compiledFile = blob;
      store.compiledFileName = fileName;
      if(type === "single" && elements.usbAutoSend.checked) {
        showSnackBar(
          "Program device ?",
          (confirm) => {
            if (confirm) {
              sendToUSBDevice(
                store.compiledFileName,
                store.compiledFile,
                store.usbPathHandle
              );
            }
          },
          false
        );
      }
    } else {
      const errorText = await response.json();
      console.log(errorText);
    }
  } catch (error) {
    console.error("Error:", error);
    showSnackBar("An error occurred while downloading the firmware");
  }
}

// Send compiled firmware to USB device
export async function sendToUSBDevice(fileName, blob, usbPathHandle) {
  if (!usbPathHandle) {
    console.error("No USB path selected");
    return;
  }

  try {
    showSnackBar("Programming device...", null, false);
    const fileHandle = await usbPathHandle.getFileHandle(fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    hideSnackBar();
    showSnackBar("Programming completed", null);
  } catch (error) {
    console.error("Error transferring file to device:", error);
  }
}

// function compile multiple firmware from jsonString of all form data
export async function compileMultipleFirmware(jsonConfig) {
  showLoadBar();
  elements.console.innerHTML = "";
  numberOfFirmware = jsonConfig.length;
  try {
    const requestData = {
      clientId: socket.id,
      formData: jsonConfig,
    };

    fetch(`./compile-multiple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData, null, 2),
    });
  } catch (error) {
    console.error("Error:", error);
    showSnackBar("An error occurred while compiling the code");
  }
}

export { numberOfFirmware };
