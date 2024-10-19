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
        elements.temperature.disabled = true;
        elements.humidity.disabled = true;
        elements.cayenne1.disabled = true;
        elements.cayenne2.disabled = true;
        elements.cayenne1Label.style.color = '#D1D1D1';
        elements.cayenne2Label.style.color = '#D1D1D1';
        elements.temperatureLabel.style.color = '#D1D1D1';
        elements.humidityLabel.style.color = '#D1D1D1';
    } else {
        elements.temperature.disabled = false;
        elements.humidity.disabled = false;
        elements.cayenne1.disabled = false;
        elements.cayenne2.disabled = false;
        elements.cayenne1Label.style.color = '#000';
        elements.cayenne2Label.style.color = '#000';
        elements.temperatureLabel.style.color = '#000';
        elements.humidityLabel.style.color = '#000';
    }
}

elements.hello.addEventListener('change', helloError);

// Payload Temperature error, Humidity error, Cayenne error
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

function cayenne1Error() {
    if (elements.cayenne1.checked) {
        elements.hello.disabled = true;
        elements.helloLabel.style.color = '#D1D1D1';
    } 
}

elements.cayenne1.addEventListener('change', cayenne1Error);

function cayenne2Error() {
    if (elements.cayenne2.checked && !elements.humidity.checked && !elements.temperature.checked) {
        elements.hello.disabled = false;
        elements.helloLabel.style.color = '#000';
    }
}

elements.cayenne2.addEventListener('change', cayenne2Error);

// MRL003 Simulation error
function simOnError() {
    elements.hello.disabled = true;
    elements.helloLabel.style.color = '#D1D1D1';
    elements.temperature.disabled = true;
    elements.humidity.disabled = true;
    elements.cayenne1.disabled = true;
    elements.cayenne2.disabled = true;
    elements.cayenne1Label.style.color = '#D1D1D1';
    elements.cayenne2Label.style.color = '#D1D1D1';
    elements.temperatureLabel.style.color = '#D1D1D1';
    elements.humidityLabel.style.color = '#D1D1D1';
    elements.hello.checked = false;
    elements.temperature.checked = false;
    elements.humidity.checked = false;
    elements.cayenne1.checked = false;
    elements.cayenne2.checked = true;
}

elements.simOn.addEventListener('change', simOnError);

function simOffError() {
    elements.hello.disabled = false;
    elements.helloLabel.style.color = '#000';
    elements.temperature.disabled = false;
    elements.humidity.disabled = false;
    elements.cayenne1.disabled = false;
    elements.cayenne2.disabled = false;
    elements.cayenne1Label.style.color = '#000';
    elements.cayenne2Label.style.color = '#000';
    elements.temperatureLabel.style.color = '#000';
    elements.humidityLabel.style.color = '#000';
}

elements.simOff.addEventListener('change', simOffError);

// Restore default settings
elements.rLorawan.addEventListener('click', function() {
    elements.activationMode.value = 'otaa';
    document.getElementById('class').value = 'class_a';
    document.getElementById('spreading-factor').value = '7';
    document.getElementById('adaptative-dr-off').checked = true;
    document.getElementById('confirmation-off').checked = true;
    document.getElementById('app_port').value = '15';
    otaaAbp();
    saveFormData();
});

elements.rApp.addEventListener('click', function() {
    document.getElementById('send-every-frame-delay').checked = true;
    document.getElementById('frame-delay').value = '10';
    elements.temperature.checked = false;
    elements.humidity.checked = false;
    elements.cayenne2.checked = true;
    elements.hello.checked = true;
    document.getElementById('low-power-disabled').checked = true;
    saveFormData();
});

elements.rAdvance.addEventListener('click', function() {
    document.getElementById('admin-sensor-disabled').checked = true;
    elements.mrlAppPort.value = '30';
    elements.simOff.checked = true;
    simOffError();
    saveFormData();
});

// Generate random credentials
const genRandomKey = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

window.onload = function() {
    // Générer des clés aléatoires au chargement initial de la page
    elements.devEui.value = genRandomKey(16);
    elements.appKey.value = genRandomKey(32);
    elements.appEui.value = genRandomKey(16);
    elements.devAddr.value = genRandomKey(8);
    elements.nwksKey.value = genRandomKey(32);
    elements.appsKey.value = genRandomKey(32);
    elements.adminAppKey.value = genRandomKey(32);

    // Attacher les événements de clic pour générer de nouvelles clés
    elements.generateDevEui.addEventListener('click', function() {
        elements.devEui.value = genRandomKey(16);
        saveFormData();
    });

    elements.generateAppKey.addEventListener('click', function() {
        elements.appKey.value = genRandomKey(32);
        saveFormData();
    });

    elements.generateAppEUI.addEventListener('click', function() {
        elements.appEui.value = genRandomKey(16);
        saveFormData();
    });

    elements.generateDevAddr.addEventListener('click', function() {
        elements.devAddr.value = genRandomKey(8);
        saveFormData();
    });

    elements.generateNwkskey.addEventListener('click', function() {
        elements.nwksKey.value = genRandomKey(32);
        saveFormData();
    });

    elements.generateAppskey.addEventListener('click', function() {
        elements.appsKey.value = genRandomKey(32);
        saveFormData();
    });

    elements.generateAdminAppKey.addEventListener('click', function() {
        elements.adminAppKey.value = genRandomKey(32);
        saveFormData();
    });
};


// Save form data to localStorage
function saveFormData() {
    const formData = {
        activationMode: elements.activationMode.value,
        class: document.getElementById('class').value,
        spreadingFactor: document.getElementById('spreading-factor').value,
        adaptativeDr: document.querySelector('input[name="adaptative-dr"]:checked').value,
        confirmation: document.querySelector('input[name="confirmation"]:checked').value,
        appPort: document.getElementById('app_port').value,
        sendMode: document.querySelector('input[name="send-mode"]:checked').value,
        frameDelay: document.getElementById('frame-delay').value,
        hello: elements.hello.checked,
        temperature: elements.temperature.checked,
        humidity: elements.humidity.checked,
        lowPower: document.querySelector('input[name="low-power"]:checked').value,
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
        document.getElementById('class').value = formData.class || 'class-a';
        document.getElementById('spreading-factor').value = formData.spreadingFactor || 'sf7';
        document.querySelector(`input[name="adaptative-dr"][value="${formData.adaptativeDr || 'off'}"]`).checked = true;
        document.querySelector(`input[name="confirmation"][value="${formData.confirmation || 'off'}"]`).checked = true;
        document.getElementById('app_port').value = formData.appPort || '15';
        document.querySelector(`input[name="send-mode"][value="${formData.sendMode || 'every-frame-delay'}"]`).checked = true;
        document.getElementById('frame-delay').value = formData.frameDelay || '10';
        elements.hello.checked = formData.hello || false;
        elements.temperature.checked = formData.temperature || false;
        elements.humidity.checked = formData.humidity || false;
        document.querySelector(`input[name="low-power"][value="${formData.lowPower || 'disabled'}"]`).checked = true;
        document.querySelector(`input[name="cayenne-lpp"][value="${formData.cayenneLpp || 'disabled'}"]`).checked = true;
        elements.devEui.value = formData.devEui;
        elements.appKey.value = formData.appKey;
        elements.appEui.value = formData.appEui;
        elements.devAddr.value = formData.devAddr;
        elements.nwksKey.value = formData.nwkSKey;
        elements.appsKey.value = formData.appSKey;
        elements.adminAppKey.value = formData.adminAppKey;
        document.querySelector(`input[name="mrl003-sim"][value="${formData.mrlSim || 'off'}"]`).checked = true;
        elements.mrlAppPort.value = formData.mrlAppPort || '30';
    }
    otaaAbp();
}

document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', saveFormData);
});

// Restore data on page load
window.addEventListener('load', restoreFormData);

function formatEUI(str){
    return `0x${str.match(/.{1,2}/g).join(', 0x')}`
}

function formatAddr(str){
    return "0x"+str;
}

function formatKey(str){
    return str.match(/.{1,2}/g).join(',');
}

function getFormJsonString() {
    let formData = {
        ACTIVATION_MODE: elements.activationMode.value.toUpperCase(),
        CLASS: document.getElementById('class').value.toUpperCase(),
        SPREADING_FACTOR: document.getElementById('spreading-factor').value.toUpperCase(),
        ADAPTIVE_DR: (document.querySelector('input[name="adaptative-dr"]:checked').value == 'on').toString(),
        CONFIRMED: (document.querySelector('input[name="confirmation"]:checked').value.toString() == 'on').toString(),
        APP_PORT: document.getElementById('app_port').value,
        SEND_BY_PUSH_BUTTON: (document.querySelector('input[name="send-mode"]:checked').value == 'push-button').toString(),
        FRAME_DELAY: document.getElementById('frame-delay').value,
        PAYLOAD_HELLO: elements.hello.checked.toString(),
        PAYLOAD_TEMPERATURE: elements.temperature.checked.toString(),
        PAYLOAD_HUMIDITY: elements.humidity.checked.toString(),
        LOW_POWER: (document.querySelector('input[name="low-power"]:checked').value == 'enabled').toString(),
        CAYENNE_LPP: (document.querySelector('input[name="cayenne-lpp"]:checked').value == 'enabled').toString(),
        devEUI: formatEUI(elements.devEui.value),
        appKey: formatKey(elements.appKey.value.toUpperCase()),
        appEUI: formatEUI(elements.appEui.value),
        devAddr: formatAddr(elements.devAddr.value),
        nwkSKey: formatKey(elements.nwksKey.value),
        appSKey: formatKey(elements.appsKey.value),
        ADMIN_SENSOR_ENABLED: (document.querySelector('input[name="admin-sensor"]:checked').value == 'enabled').toString(),
        MLR003_SIMU: (document.querySelector('input[name="mrl003-sim"]:checked').value == 'on').toString(),
        MLR003_APP_PORT: elements.mrlAppPort.value,
        ADMIN_GEN_APP_KEY: formatKey(elements.adminAppKey.value),
    };

    return JSON.stringify(formData, null, 2);
}

// Button to compile
document.getElementById('generate-firmware').addEventListener('click', function() {
    let jsonString = getFormJsonString();
    console.log(jsonString);
    compileFirmware(jsonString);
} );

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
