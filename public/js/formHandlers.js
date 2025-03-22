import { elements } from "./elements.js";
import { saveFormData } from "./storage.js";

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
