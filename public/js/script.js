// Display advanced settings form
let advancedContainer = document.querySelector('.advance-container .title-container');
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

sim_on.addEventListener('change', function() {
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
});

sim_off.addEventListener('change', function() {
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
});


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
});