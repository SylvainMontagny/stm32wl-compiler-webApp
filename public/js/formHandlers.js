import { elements } from "./elements.js";

// Display OTAA ABP
export function otaaAbp() {
  if (elements.activationMode.value === "otaa") {
    elements.otaaContainer.style.display = "block";
    elements.abpContainer.style.display = "none";
  } else {
    elements.otaaContainer.style.display = "none";
    elements.abpContainer.style.display = "block";
  }
}

// Payload Cayenne LPP error
export function cayenne1Error() {
  if (elements.cayenne1.checked) {
    elements.hello.disabled = true;
    elements.helloLabel.style.color = "#D1D1D1";
  }
}

// Payload Cayenne LPP error
export function cayenne2Error() {
  if (
    elements.cayenne2.checked &&
    !elements.humidity.checked &&
    !elements.temperature.checked
  ) {
    elements.hello.disabled = false;
    elements.helloLabel.style.color = "#000";
  }
}

// Payload Configuration
export function updatePayloadConfiguration() {
  elements.payloadRadioButtons.forEach((radio) => {
    const isChecked = radio.checked;

    if (radio.id === "simulated-temp-humidity") {
      // Activer/Désactiver les options de température et d'humidité
      elements.simulatedOptionsGroup.style.pointerEvents = isChecked
        ? "auto"
        : "none";
      elements.simulatedOptionsGroup.style.opacity = isChecked ? "1" : "0.5";

      // Décocher les cases si le bouton radio n'est pas sélectionné
      if (!isChecked) {
        document
          .querySelectorAll('input[name="simulated-options"]')
          .forEach((checkbox) => {
            checkbox.checked = false;
          });
      }
    } else if (radio.id === "read-iks01a3-sensors") {
      // Activer/Désactiver les options des capteurs IKS01A3
      elements.iks01a3OptionsGroup.style.pointerEvents = isChecked
        ? "auto"
        : "none";
      elements.iks01a3OptionsGroup.style.opacity = isChecked ? "1" : "0.5";

      // Décocher les cases si le bouton radio n'est pas sélectionné
      if (!isChecked) {
        document
          .querySelectorAll('input[name="iks01a3-options"]')
          .forEach((checkbox) => {
            checkbox.checked = false;
          });
      }
    } else if (radio.id === "simulated-lorawan-devices") {
      // Activer/Désactiver les options des appareils LoRaWAN simulés
      const lorawanRadioItems = document.querySelectorAll(
        '.checkbox-group input[name="device-option"]'
      );
      lorawanRadioItems.forEach((input) => {
        input.disabled = !isChecked;
        if (!isChecked) {
          input.checked = false; // Décocher les boutons radio non concernés
        }
      });

      const lorawanLabels = document.querySelectorAll(
        '.checkbox-group label[for^="usmb-valve"], .checkbox-group label[for^="atim-thaq"], .checkbox-group label[for^="watteco-tempo"], .checkbox-group label[for^="tct-egreen"]'
      );
      lorawanLabels.forEach((label) => {
        label.style.color = isChecked ? "#000" : "#D1D1D1";
      });
    }
  });
}
