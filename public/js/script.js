// Display advanced settings form
let advancedContainer = document.querySelector('.advance-container .title-container .closed-advance-container');
let svg_arrow = document.querySelector('.advance-container .title-container .closed-advance-container .svg');
advancedContainer.addEventListener('click', function() {
    let advancedForm = document.querySelector('.advanced-settings-form');
    let restore = document.querySelector('.advance-container .title-container .restore');

    if (advancedForm.style.display === '' || advancedForm.style.display === 'none') {
        advancedForm.style.display = 'grid'; 
        restore.style.display = 'block';      
        svg_arrow.style.transform = 'rotate(90deg)'; 
    } else {
        advancedForm.style.display = 'none'; 
        restore.style.display = 'none';  
        svg_arrow.style.transform = 'rotate(0deg)';
    }
});


// Display OTAA ABP
let activation_mode = document.getElementById('activation-mode');
activation_mode.addEventListener('change', function() {
    if(activation_mode.value === 'otaa') {
        document.querySelector('.otaa-container').style.display = 'block';
        document.querySelector('.abp-container').style.display = 'none';
    } else {
        document.querySelector('.otaa-container').style.display = 'none';
        document.querySelector('.abp-container').style.display = 'block';
    }
});

// Payload Hello error
let hello = document.getElementById('hello');
let hello_label = document.querySelector('label[for="hello"]');
let temperature = document.getElementById('temperature');
let temperature_label = document.querySelector('label[for="temperature"]');
let humidity = document.getElementById('humidity');
let humidity_label = document.querySelector('label[for="humidity"]');
let cayenne_1 = document.getElementById('cayenne-lpp-enabled');
let cayenne_1_label = document.querySelector('label[for="cayenne-lpp-enabled"]');
let cayenne_2 = document.getElementById('cayenne-lpp-disabled');
let cayenne_2_label = document.querySelector('label[for="cayenne-lpp-disabled"]'); 

function helloError() {
    if(hello.checked) { 
        temperature.disabled = true;
        humidity.disabled = true;
        cayenne_1.disabled = true;
        cayenne_2.disabled = true;
        cayenne_1_label.style.color = '#D1D1D1';
        cayenne_2_label.style.color = '#D1D1D1';
        temperature_label.style.color = '#D1D1D1';
        humidity_label.style.color = '#D1D1D1';
    } else {
        temperature.disabled = false;
        humidity.disabled = false;
        cayenne_1.disabled = false;
        cayenne_2.disabled = false;
        cayenne_1_label.style.color = '#000';
        cayenne_2_label.style.color = '#000';
        temperature_label.style.color = '#000';
        humidity_label.style.color = '#000';
    }
}

hello.addEventListener('change', helloError);

// Payload Temperature error, Humidity error, Cayenne error

function humidityError() {
    if(humidity.checked) {
        hello.disabled = true;
        hello_label.style.color = '#D1D1D1';
    } else if(!temperature.checked && !cayenne_1.checked) {
        hello.disabled = false;
        hello_label.style.color = '#000';
    }
}

humidity.addEventListener('change', humidityError);


function temperatureError() {
    if(temperature.checked) {
        hello.disabled = true;
        hello_label.style.color = '#D1D1D1';
    } else if(!humidity.checked && !cayenne_1.checked) {
        hello.disabled = false;
        hello_label.style.color = '#000';
    }
}

temperature.addEventListener('change', temperatureError);


function cayenne1Error() {
    if(cayenne_1.checked) {
        hello.disabled = true;
        hello_label.style.color = '#D1D1D1';
    } 
}

cayenne_1.addEventListener('change', cayenne1Error);


function cayenne2Error() {
    if(cayenne_2.checked && !humidity.checked && !temperature.checked) {
        hello.disabled = false;
        hello_label.style.color = '#000';
    }
}

cayenne_2.addEventListener('change', cayenne2Error);


// MRL003 Simulation error
let sim_on = document.getElementById('mrl003-sim-on');
let sim_off = document.getElementById('mrl003-sim-off');

function sim_onError() {
    hello.disabled = true;
    hello_label.style.color = '#D1D1D1';
    temperature.disabled = true;
    humidity.disabled = true;
    cayenne_1.disabled = true;
    cayenne_2.disabled = true;
    cayenne_1_label.style.color = '#D1D1D1';
    cayenne_2_label.style.color = '#D1D1D1';
    temperature_label.style.color = '#D1D1D1';
    humidity_label.style.color = '#D1D1D1';
    hello.checked = false;
    temperature.checked = false;
    humidity.checked = false;
    cayenne_1.checked = false;
    cayenne_2.checked = true;
}

sim_on.addEventListener('change', sim_onError);


function sim_offError() {
    hello.disabled = false;
    hello_label.style.color = '#000';
    temperature.disabled = false;
    humidity.disabled = false;
    cayenne_1.disabled = false;
    cayenne_2.disabled = false;
    cayenne_1_label.style.color = '#000';
    cayenne_2_label.style.color = '#000';
    temperature_label.style.color = '#000';
    humidity_label.style.color = '#000';
}

sim_off.addEventListener('change', sim_offError);


// Restore default settings

// restore LoRaWAN settings
let r_lorawan = document.getElementById('restore-lorawan');
r_lorawan.addEventListener('click', function() {
    document.getElementById('activation-mode').value = 'otaa';
    document.getElementById('class').value = 'class-a';
    document.getElementById('spreading-factor').value = 'sf7';
    document.getElementById('adaptative-dr-off').checked = true;
    document.getElementById('confirmation-off').checked = true;
    document.getElementById('app_port').value = '15';
    // change the value in the local storage
    saveFormData();
});

// restore application settings
let r_app = document.getElementById('restore-app');
r_app.addEventListener('click', function() {
    document.getElementById('send-every-frame-delay').checked = true;
    document.getElementById('frame-delay').value = '10';
    document.getElementById('temperature').checked = false;
    document.getElementById('humidity').checked = false;
    document.getElementById('cayenne-lpp-disabled').checked = true;
    document.getElementById('hello').checked = true;
    document.getElementById('low-power-disabled').checked = true;
    // change the value in the local storage
    saveFormData();
});

// restore advance settings
let r_advance = document.getElementById('restore-adv');
r_advance.addEventListener('click', function() {
    document.getElementById('admin-sensor-disabled').checked = true;
    document.getElementById('mrl003-app-port').value = '30';
    document.getElementById('mrl003-sim-off').checked = true;
    sim_offError();
    // change the value in the local storage
    saveFormData();
});



// generate random credentials
const genRandomKey = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
let generate_deveui = document.getElementById('generate-dev-eui');
let generate_appKey = document.getElementById('generate-appkey');
let generate_appEUI = document.getElementById('generate-appeui');
let generate_devAddr = document.getElementById('generate-devaddr');
let generate_nwkskey = document.getElementById('generate-nwkskey');
let generate_appskey = document.getElementById('generate-appskey');
let generate_adminAppKey = document.getElementById('generate-admin-gen-app-key');

// generate random DevEUI
document.getElementById('dev-eui').value = genRandomKey(16);
generate_deveui.addEventListener('click', function() {
    document.getElementById('dev-eui').value = genRandomKey(16);
    // change the value in the local storage
    saveFormData();
});

// generate random appKey
document.getElementById('appkey').value = genRandomKey(32);
generate_appKey.addEventListener('click', function() {
    document.getElementById('appkey').value = genRandomKey(32);
    // change the value in the local storage
    saveFormData();
});

// generate random appEUI
document.getElementById('appeui').value = genRandomKey(16);
generate_appEUI.addEventListener('click', function() {
    document.getElementById('appeui').value = genRandomKey(16);
    // change the value in the local storage
    saveFormData();
});

// generate random devAddr
document.getElementById('devaddr').value = genRandomKey(8);
generate_devAddr.addEventListener('click', function() {
    document.getElementById('devaddr').value = genRandomKey(8);
    // change the value in the local storage
    saveFormData();
});

// generate random NwkSKey
document.getElementById('nwkskey').value = genRandomKey(32);
generate_nwkskey.addEventListener('click', function() {
    document.getElementById('nwkskey').value = genRandomKey(32);
    // change the value in the local storage
    saveFormData();
});

// generate random AppSKey
document.getElementById('appskey').value = genRandomKey(32);
generate_appskey.addEventListener('click', function() {
    document.getElementById('appskey').value = genRandomKey(32);
    // change the value in the local storage
    saveFormData();
});

// generate random adminAppKey
document.getElementById('admin-gen-app-key').value = genRandomKey(32);
generate_adminAppKey.addEventListener('click', function() {
    document.getElementById('admin-gen-app-key').value = genRandomKey(32);
    // change the value in the local storage
    saveFormData();
});


// Sauvegarder les données dans localStorage
function saveFormData() {
    const formData = {
        activationMode: document.getElementById('activation-mode').value,
        class: document.getElementById('class').value,
        spreadingFactor: document.getElementById('spreading-factor').value,
        adaptativeDr: document.querySelector('input[name="adaptative-dr"]:checked').value,
        confirmation: document.querySelector('input[name="confirmation"]:checked').value,
        appPort: document.getElementById('app_port').value,
        sendMode: document.querySelector('input[name="send-mode"]:checked').value,
        frameDelay: document.getElementById('frame-delay').value,
        hello: document.getElementById('hello').checked,
        temperature: document.getElementById('temperature').checked,
        humidity: document.getElementById('humidity').checked,
        lowPower: document.querySelector('input[name="low-power"]:checked').value,
        cayenneLpp: document.querySelector('input[name="cayenne-lpp"]:checked').value,
        devEui: document.getElementById('dev-eui').value,
        appKey: document.getElementById('appkey').value,
        appEui: document.getElementById('appeui').value,
        devAddr: document.getElementById('devaddr').value,
        nwkSKey: document.getElementById('nwkskey').value,
        appSKey: document.getElementById('appskey').value,
        adminAppKey: document.getElementById('admin-gen-app-key').value,
        mrlSim: document.querySelector('input[name="mrl003-sim"]:checked').value,
        mrlAppPort: document.getElementById('mrl003-app-port').value,
    };
    localStorage.setItem('formData', JSON.stringify(formData)); // Sauvegarder les données sous forme de JSON
}

// Restaurer les données depuis localStorage
function restoreFormData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        const formData = JSON.parse(savedData);

        document.getElementById('activation-mode').value = formData.activationMode || 'otaa';
        document.getElementById('class').value = formData.class || 'class-a';
        document.getElementById('spreading-factor').value = formData.spreadingFactor || 'sf7';
        document.querySelector(`input[name="adaptative-dr"][value="${formData.adaptativeDr || 'off'}"]`).checked = true;
        document.querySelector(`input[name="confirmation"][value="${formData.confirmation || 'off'}"]`).checked = true;
        document.getElementById('app_port').value = formData.appPort || '15';
        document.querySelector(`input[name="send-mode"][value="${formData.sendMode || 'every-frame-delay'}"]`).checked = true;
        document.getElementById('frame-delay').value = formData.frameDelay || '10';
        document.getElementById('hello').checked = formData.hello || false;
        document.getElementById('temperature').checked = formData.temperature || false;
        document.getElementById('humidity').checked = formData.humidity || false;
        document.querySelector(`input[name="low-power"][value="${formData.lowPower || 'disabled'}"]`).checked = true;
        document.querySelector(`input[name="cayenne-lpp"][value="${formData.cayenneLpp || 'disabled'}"]`).checked = true;
        document.getElementById('dev-eui').value = formData.devEui;
        document.getElementById('appkey').value = formData.appKey;
        document.getElementById('appeui').value = formData.appEui;
        document.getElementById('devaddr').value = formData.devAddr;
        document.getElementById('nwkskey').value = formData.nwkSKey;
        document.getElementById('appskey').value = formData.appSKey;
        document.getElementById('admin-gen-app-key').value = formData.adminAppKey;
        document.querySelector(`input[name="mrl003-sim"][value="${formData.mrlSim || 'off'}"]`).checked = true;
        document.getElementById('mrl003-app-port').value = formData.mrlAppPort || '30';
    }
}

// Attacher l'événement 'input' pour sauvegarder automatiquement lorsque les champs changent
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', saveFormData);
});

// Restaurer les données au chargement de la page
window.addEventListener('load', restoreFormData);

function getFormJsonString(){
    let formData = {
        activationMode: document.getElementById('activation-mode').value,
        class: document.getElementById('class').value,
        spreadingFactor: document.getElementById('spreading-factor').value,
        adaptativeDr: document.querySelector('input[name="adaptative-dr"]:checked').value,
        confirmation: document.querySelector('input[name="confirmation"]:checked').value,
        appPort: document.getElementById('app_port').value,
        sendMode: document.querySelector('input[name="send-mode"]:checked').value,
        frameDelay: document.getElementById('frame-delay').value,
        hello: document.getElementById('hello').checked,
        temperature: document.getElementById('temperature').checked,
        humidity: document.getElementById('humidity').checked,
        lowPower: document.querySelector('input[name="low-power"]:checked').value,
        cayenneLpp: document.querySelector('input[name="cayenne-lpp"]:checked').value,
        devEui: document.getElementById('dev-eui').value,
        appKey: document.getElementById('appkey').value,
        appEui: document.getElementById('appeui').value,
        devAddr: document.getElementById('devaddr').value,
        nwkSKey: document.getElementById('nwkskey').value,
        appSKey: document.getElementById('appskey').value,
        adminAppKey: document.getElementById('admin-gen-app-key').value,
        mrlSim: document.querySelector('input[name="mrl003-sim"]:checked').value,
        mrlAppPort: document.getElementById('mrl003-app-port').value,
    };

    return JSON.stringify(formData, null, 2);
}

// Button to compile
document.getElementById('generate-firmware').addEventListener('click', function() {
    let jsonString = getFormJsonString();
    compileFirmware(jsonString);
} );

// function compile firmware from jsonString of all form data
function compileFirmware(jsonString){
    console.log(jsonString);
    fetch('/compile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonString
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Erreur lors du téléchargement du fichier.');
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'STM32WL-standalone.bin';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url); 
    })
    .catch(error => {
        console.error('Erreur:', error);
    });
}
