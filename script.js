// **IMPORTANT**: Replace 'YOUR_SCRIPT_URL' with your actual Google Apps Script web app URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmPGUdxslj_lsOYCvLwkWK5tVTawVQKbA-Kjxp4cBexDUgSCl85lLyrTUBYB3WYv6o/exec';

document.getElementById('cleaningForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = document.querySelector('.submit-button');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    // Disable submit button and show loading
    submitButton.disabled = true;
    loadingSpinner.style.display = 'block';
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    // Collect form data
    const formData = new FormData(this);
    const data = {
        timestamp: new Date().toISOString(),
    };
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        if (value === 'yes') {
            data[key] = 'YES';
        } else {
            data[key] = value || '';
        }
    }
    
    // Add checkboxes that weren't checked (they won't be in FormData)
    const allCheckboxes = this.querySelectorAll('input[type="checkbox"]:not(.master-checkbox)');
    allCheckboxes.forEach(checkbox => {
        if (!formData.has(checkbox.name)) {
            data[checkbox.name] = 'NO';
        }
    });
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Since we're using no-cors, we can't read the response
        // But if we got here without error, assume success
        loadingSpinner.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Optionally reset form
        // this.reset();
        
    } catch (error) {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        errorMessage.style.display = 'block';
        submitButton.disabled = false;
    }
});

// Master checkbox functionality
document.querySelectorAll('.master-checkbox').forEach(masterCheckbox => {
    masterCheckbox.addEventListener('change', function() {
        const sectionId = this.dataset.section;
        const section = this.closest('.section');
        const checkboxes = section.querySelectorAll('input[type="checkbox"]:not(.master-checkbox)');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
});

// Update master checkbox state when individual checkboxes change
document.querySelectorAll('.section').forEach(section => {
    const masterCheckbox = section.querySelector('.master-checkbox');
    if (masterCheckbox) {
        const individualCheckboxes = section.querySelectorAll('input[type="checkbox"]:not(.master-checkbox)');
        
        individualCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const allChecked = Array.from(individualCheckboxes).every(cb => cb.checked);
                const someChecked = Array.from(individualCheckboxes).some(cb => cb.checked);
                
                masterCheckbox.checked = allChecked;
                masterCheckbox.indeterminate = someChecked && !allChecked;
            });
        });
    }
});

// Auto-fill today's date
window.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.querySelector('input[name="cleaning_date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
});