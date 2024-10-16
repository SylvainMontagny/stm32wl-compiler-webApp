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