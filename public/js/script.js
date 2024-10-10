// Display advanced settings form
let advancedContainer = document.querySelector('.advance-container .title-container');
advancedContainer.addEventListener('click', function() {
    let advancedForm = document.querySelector('.advanced-settings-form');
    let restore = document.querySelector('.advance-container .title-container .restore');
    let closed = document.querySelector('.closed-advance-container p');

    if (advancedForm.style.display === '' || advancedForm.style.display === 'none') {
        advancedForm.style.display = 'grid'; 
        restore.style.display = 'block';     
        closed.style.display = 'none';       
    } else {
        advancedForm.style.display = 'none'; 
        restore.style.display = 'none';      
        closed.style.display = 'block';     
    }
});
