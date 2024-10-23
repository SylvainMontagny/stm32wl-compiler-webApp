// Elements from the form
const elements = {
    advancedContainer: document.querySelector('.advance-container .title-container .closed-advance-container'),
    svgArrow: document.querySelector('.advance-container .title-container .closed-advance-container .svg'),
    advancedForm: document.querySelector('.advanced-settings-form'),
    restore: document.querySelector('.advance-container .title-container .restore'),
    activationMode: document.getElementById('activation-mode'),
    otaaContainer: document.querySelector('.otaa-container'),
    abpContainer: document.querySelector('.abp-container'),
    hello: document.getElementById('hello'),
    helloLabel: document.querySelector('label[for="hello"]'),
    temperature: document.getElementById('temperature'),
    temperatureLabel: document.querySelector('label[for="temperature"]'),
    humidity: document.getElementById('humidity'),
    humidityLabel: document.querySelector('label[for="humidity"]'),
    cayenne1: document.getElementById('cayenne-lpp-enabled'),
    cayenne1Label: document.querySelector('label[for="cayenne-lpp-enabled"]'),
    cayenne2: document.getElementById('cayenne-lpp-disabled'),
    cayenne2Label: document.querySelector('label[for="cayenne-lpp-disabled"]'),
    simOn: document.getElementById('mrl003-sim-on'),
    simOff: document.getElementById('mrl003-sim-off'),
    rLorawan: document.getElementById('restore-lorawan'),
    rApp: document.getElementById('restore-app'),
    rAdvance: document.getElementById('restore-adv'),
    generateDevEui: document.getElementById('generate-dev-eui'),
    generateAppKey: document.getElementById('generate-appkey'),
    generateAppEUI: document.getElementById('generate-appeui'),
    generateDevAddr: document.getElementById('generate-devaddr'),
    generateNwkskey: document.getElementById('generate-nwkskey'),
    generateAppskey: document.getElementById('generate-appskey'),
    generateAdminAppKey: document.getElementById('generate-admin-gen-app-key'),
    devEui: document.getElementById('dev-eui'),
    appKey: document.getElementById('appkey'),
    appEui: document.getElementById('appeui'),
    devAddr: document.getElementById('devaddr'),
    nwksKey: document.getElementById('nwkskey'),
    appsKey: document.getElementById('appskey'),
    adminAppKey: document.getElementById('admin-gen-app-key'),
    mrlAppPort: document.getElementById('mrl003-app-port'),
    generateFirmware: document.getElementById('generate-firmware'),
    class : document.getElementById('class'),
    spreadingFactor : document.getElementById('spreading-factor'),
    appPort : document.getElementById('app_port'),
};

// Display advanced settings form
elements.advancedContainer.addEventListener('click', function() {
    if (elements.advancedForm.style.display === '' || elements.advancedForm.style.display === 'none') {
        elements.advancedForm.style.display = 'grid'; 
        elements.restore.style.display = 'block';      
        elements.svgArrow.style.transform = 'rotate(90deg)'; 
    } else {
        elements.advancedForm.style.display = 'none'; 
        elements.restore.style.display = 'none';  
        elements.svgArrow.style.transform = 'rotate(0deg)';
    }
});

// Display OTAA ABP
function otaaAbp() {
    if (elements.activationMode.value === 'otaa') {
        elements.otaaContainer.style.display = 'block';
        elements.abpContainer.style.display = 'none';
    } else {
        elements.otaaContainer.style.display = 'none';
        elements.abpContainer.style.display = 'block';
    }
}
elements.activationMode.addEventListener('change', otaaAbp);

// Payload Hello error
function helloError() {
    if (elements.hello.checked) {

        [elements.temperature, elements.humidity, elements.cayenne1, elements.cayenne2].forEach(element => {
            element.disabled = true;
        });

        [elements.temperatureLabel, elements.humidityLabel, elements.cayenne1Label, elements.cayenne2Label].forEach(label => {
            label.style.color = '#D1D1D1';
        });

    } else {

        [elements.temperature, elements.humidity, elements.cayenne1, elements.cayenne2].forEach(element => {
            element.disabled = false;
        });

        [elements.temperatureLabel, elements.humidityLabel, elements.cayenne1Label, elements.cayenne2Label].forEach(label => {
            label.style.color = '#000';
        });

    }
}

elements.hello.addEventListener('change', helloError);

// Payload Humidity error
function humidityError() {
    if (elements.humidity.checked) {
        elements.hello.disabled = true;
        elements.helloLabel.style.color = '#D1D1D1';
    } else if (!elements.temperature.checked && !elements.cayenne1.checked) {
        elements.hello.disabled = false;
        elements.helloLabel.style.color = '#000';
    }
}
elements.humidity.addEventListener('change', humidityError);

// Payload Temperature error
function temperatureError() {
    if (elements.temperature.checked) {
        elements.hello.disabled = true;
        elements.helloLabel.style.color = '#D1D1D1';
    } else if (!elements.humidity.checked && !elements.cayenne1.checked) {
        elements.hello.disabled = false;
        elements.helloLabel.style.color = '#000';
    }
}
elements.temperature.addEventListener('change', temperatureError);

// Payload Cayenne LPP error
function cayenne1Error() {
    if (elements.cayenne1.checked) {
        elements.hello.disabled = true;
        elements.helloLabel.style.color = '#D1D1D1';
    } 
}
elements.cayenne1.addEventListener('change', cayenne1Error);

// Payload Cayenne LPP error
function cayenne2Error() {
    if (elements.cayenne2.checked && !elements.humidity.checked && !elements.temperature.checked) {
        elements.hello.disabled = false;
        elements.helloLabel.style.color = '#000';
    }
}
elements.cayenne2.addEventListener('change', cayenne2Error);

// MRL003 Simulation error
function simOnError() {
    if(elements.simOn.checked) {

        [elements.hello, elements.temperature, elements.humidity, elements.cayenne1, elements.cayenne2].forEach(element => {
            element.disabled = true;
        });

        [elements.helloLabel, elements.temperatureLabel, elements.humidityLabel, elements.cayenne1Label, elements.cayenne2Label].forEach(label => {
            label.style.color = '#D1D1D1';
        });

        [elements.hello, elements.temperature, elements.humidity, elements.cayenne1].forEach(element => {
            element.checked = false;
        });

        elements.cayenne2.checked = true;

        saveFormData();
    }
}
elements.simOn.addEventListener('change', simOnError);

// MRL003 Simulation error
function simOffError() {
    if(elements.simOff.checked) {

        [elements.hello, elements.temperature, elements.humidity, elements.cayenne1, elements.cayenne2].forEach(element => {
            element.disabled = false;
        });

        [elements.helloLabel, elements.temperatureLabel, elements.humidityLabel, elements.cayenne1Label, elements.cayenne2Label].forEach(label => {
            label.style.color = '#000';
        });

        elements.hello.checked = true;
        helloError();
        saveFormData();
    }
}
elements.simOff.addEventListener('change', simOffError);

// Restore default settings for LoRaWAN
elements.rLorawan.addEventListener('click', function() {
    elements.activationMode.value = 'otaa';
    elements.class.value = 'class_a';
    elements.spreadingFactor.value = '7';
    document.getElementById('adaptative-dr-off').checked = true;
    document.getElementById('confirmation-off').checked = true;
    elements.appPort.value = '15';
    otaaAbp();
    saveFormData();
});


// Restore default settings for Application
elements.rApp.addEventListener('click', function() {
    document.getElementById('send-every-frame-delay').checked = true;
    document.getElementById('frame-delay').value = '10';
    if(!elements.simOn.checked) {
        elements.temperature.checked = false;
        elements.humidity.checked = false;
        elements.cayenne2.checked = true;
        elements.hello.disabled = false;
        elements.helloLabel.style.color = '#000';
        elements.hello.checked = true;
        helloError();
    }
    saveFormData();
});

// Restore default settings for Advanced
elements.rAdvance.addEventListener('click', function() {
    document.getElementById('admin-sensor-disabled').checked = true;
    elements.mrlAppPort.value = '30';
    if(elements.simOn.checked) {
        elements.simOff.checked = true;
        simOffError();
    }
    saveFormData();
});

// Generate random credentials
const genRandomKey = (size, element) => {
    const key = [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    element.value = key;
    saveFormData(); // saveFormData() after generating a new key
    return key;
};

elements.generateDevEui.addEventListener('click', function() {
    genRandomKey(16, elements.devEui);
});

elements.generateAppKey.addEventListener('click', function() {
    genRandomKey(32, elements.appKey);
});

elements.generateAppEUI.addEventListener('click', function() {
    genRandomKey(16, elements.appEui);
});

elements.generateDevAddr.addEventListener('click', function() {
    genRandomKey(8, elements.devAddr);
});

elements.generateNwkskey.addEventListener('click', function() {
    genRandomKey(32, elements.nwksKey);
});

elements.generateAppskey.addEventListener('click', function() {
    genRandomKey(32, elements.appsKey);
});

elements.generateAdminAppKey.addEventListener('click', function() {
    genRandomKey(32, elements.adminAppKey);
});


// Copy to clipboard
const copyIcons = document.querySelectorAll('.copy-icon');

// Add event listener to all copy icons
copyIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        // Select the input field and copy the text
        const input = this.previousElementSibling;
        input.select();
        input.setSelectionRange(0, 99999); // For smaller devices
        navigator.clipboard.writeText(input.value);
    });
});


// Save form data to localStorage
function saveFormData() {
    const formData = {
        activationMode: elements.activationMode.value,
        class: elements.class.value,
        spreadingFactor: elements.spreadingFactor.value,
        adaptativeDr: document.querySelector('input[name="adaptative-dr"]:checked').value,
        confirmation: document.querySelector('input[name="confirmation"]:checked').value,
        appPort: elements.appPort.value,
        sendMode: document.querySelector('input[name="send-mode"]:checked').value,
        frameDelay: document.getElementById('frame-delay').value,
        hello: elements.hello.checked,
        temperature: elements.temperature.checked,
        humidity: elements.humidity.checked,
        cayenneLpp: document.querySelector('input[name="cayenne-lpp"]:checked').value,
        devEui: elements.devEui.value,
        appKey: elements.appKey.value,
        appEui: elements.appEui.value,
        devAddr: elements.devAddr.value,
        nwkSKey: elements.nwksKey.value,
        appSKey: elements.appsKey.value,
        adminAppKey: elements.adminAppKey.value,
        mrlSim: document.querySelector('input[name="mrl003-sim"]:checked').value,
        mrlAppPort: elements.mrlAppPort.value,
    };
    localStorage.setItem('formData', JSON.stringify(formData));
}

// Restore form data from localStorage
function restoreFormData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        const formData = JSON.parse(savedData);

        elements.activationMode.value = formData.activationMode || 'otaa';
        elements.class.value = formData.class || 'class_a';
        elements.spreadingFactor.value = formData.spreadingFactor || '7';
        document.querySelector(`input[name="adaptative-dr"][value="${formData.adaptativeDr || 'off'}"]`).checked = true;
        document.querySelector(`input[name="confirmation"][value="${formData.confirmation || 'off'}"]`).checked = true;
        elements.appPort.value = formData.appPort || '15';
        document.querySelector(`input[name="send-mode"][value="${formData.sendMode || 'every-frame-delay'}"]`).checked = true;
        document.getElementById('frame-delay').value = formData.frameDelay || '10';
        elements.hello.checked = formData.hello || false;
        elements.temperature.checked = formData.temperature || false;
        elements.humidity.checked = formData.humidity || false;
        document.querySelector(`input[name="cayenne-lpp"][value="${formData.cayenneLpp || 'disabled'}"]`).checked = true;
        elements.devEui.value = formData.devEui || genRandomKey(16, elements.devEui);
        elements.appKey.value = formData.appKey || genRandomKey(32, elements.appKey);
        elements.appEui.value = formData.appEui || genRandomKey(16, elements.appEui);
        elements.devAddr.value = formData.devAddr || genRandomKey(8, elements.devAddr);
        elements.nwksKey.value = formData.nwkSKey || genRandomKey(32, elements.nwksKey);
        elements.appsKey.value = formData.appSKey || genRandomKey(32, elements.appsKey);
        elements.adminAppKey.value = formData.adminAppKey || genRandomKey(32, elements.adminAppKey);
        document.querySelector(`input[name="mrl003-sim"][value="${formData.mrlSim || 'off'}"]`).checked = true;
        elements.mrlAppPort.value = formData.mrlAppPort || '30';
    }
    otaaAbp();
}

// Save form data on input change
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', saveFormData);
});

// Restore data on page load
window.addEventListener('load', restoreFormData);

window.addEventListener('load', function() {
    // Transmission mode onload
    helloError();
    humidityError();
    temperatureError();
    cayenne1Error();
    cayenne2Error();
    simOnError();

    // gen keys
    if (!localStorage.getItem('formData')) {
        genRandomKey(16, elements.devEui);
        genRandomKey(32, elements.appKey);
        genRandomKey(16, elements.appEui);
        genRandomKey(8, elements.devAddr);
        genRandomKey(32, elements.nwksKey);
        genRandomKey(32, elements.appsKey);
        genRandomKey(32, elements.adminAppKey);
        saveFormData();
    }
});

// Format functions
function formatEUI(str){
    return `0x${str.match(/.{1,2}/g).join(', 0x')}`
}

function formatAddr(str){
    return "0x"+str;
}

function formatKey(str){
    return str.match(/.{1,2}/g).join(',');
}

// Get form data as JSON string
function getFormJsonString() {
    let formData = {
        ACTIVATION_MODE: elements.activationMode.value.toUpperCase(),
        CLASS: elements.class.value.toUpperCase(),
        SPREADING_FACTOR: elements.spreadingFactor.value.toUpperCase(),
        ADAPTIVE_DR: (document.querySelector('input[name="adaptative-dr"]:checked').value == 'on').toString(),
        CONFIRMED: (document.querySelector('input[name="confirmation"]:checked').value.toString() == 'on').toString(),
        APP_PORT: elements.appPort.value,
        SEND_BY_PUSH_BUTTON: (document.querySelector('input[name="send-mode"]:checked').value == 'push-button').toString(),
        FRAME_DELAY: document.getElementById('frame-delay').value * 1000,
        PAYLOAD_HELLO: elements.hello.checked.toString(),
        PAYLOAD_TEMPERATURE: elements.temperature.checked.toString(),
        PAYLOAD_HUMIDITY: elements.humidity.checked.toString(),
        LOW_POWER: "false",
        CAYENNE_LPP_: (document.querySelector('input[name="cayenne-lpp"]:checked').value == 'enabled').toString(),
        devEUI_: formatEUI(elements.devEui.value),
        appKey_: formatKey(elements.appKey.value.toUpperCase()),
        appEUI_: formatEUI(elements.appEui.value),
        devAddr_: formatAddr(elements.devAddr.value),
        nwkSKey_: formatKey(elements.nwksKey.value),
        appSKey_: formatKey(elements.appsKey.value),
        ADMIN_SENSOR_ENABLED: (document.querySelector('input[name="admin-sensor"]:checked').value == 'enabled').toString(),
        MLR003_SIMU: (document.querySelector('input[name="mrl003-sim"]:checked').value == 'on').toString(),
        MLR003_APP_PORT: elements.mrlAppPort.value,
        ADMIN_GEN_APP_KEY: formatKey(elements.adminAppKey.value),
    };

    return JSON.stringify(formData, null, 2);
}

// Validate form data
function validateForm() {
    let isValid = true;
    const inputs = [
        { element: elements.appPort, min: 1, max: 255, name: 'App Port' },
        { element: document.getElementById('frame-delay'), min: 8, max: 100, name: 'Frame Delay' },
        { element: elements.mrlAppPort, min: 1, max: 255, name: 'MRL003 App Port' }
    ];

    inputs.forEach(input => {
        const value = parseInt(input.element.value);
        if (isNaN(value) || value < input.min || value > input.max) {
            isValid = false;
            alert(`${input.name} must be a number between ${input.min} and ${input.max}`);
        }
    });

    return isValid;
}


// Button to compile
document.getElementById('generate-firmware').addEventListener('click', function() {
    if (validateForm()) {
        let jsonString = getFormJsonString();
        console.log(jsonString);
        compileFirmware(jsonString); 
    } else {
        alert('Please fix the errors in the form before compiling the firmware');
    }
});


// function compile firmware from jsonString of all form data
async function compileFirmware(jsonString){
    try {
        const response = await fetch('/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonString,
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'STM32WL-standalone.bin';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            const errorText = await response.text();
            alert('Error: ' + errorText);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while compiling the code');
    }
}
