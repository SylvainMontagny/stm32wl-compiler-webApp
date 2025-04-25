import { saveFormData } from "./storage.js";

export const randomKey = (size) => {
    return [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
};

// Generate random credentials
export const genRandomKey = (size, element) => {
    const key = randomKey(size);
    element.value = key;
    saveFormData(); // saveFormData() after generating a new key
    return key;
};

export const randomEUI = () => {
    const prefix = "ecdb86fffd";

    const randomSuffix = [...Array(6)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");

    const key = prefix + randomSuffix;
    return key;
}


export const genRandomEUI = (element) => {
    const key = randomEUI();
    element.value = key;
    saveFormData();
    return key;
};