// Flash message utility
function showFlashMessage(message, type = 'success') {
    // Remove existing flash messages
    const existingMessages = document.querySelectorAll('.flash-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new flash message
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    flashMessage.textContent = message;
    flashMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(flashMessage);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (flashMessage.parentNode) {
            flashMessage.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => flashMessage.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Function to refresh navigation menu
async function refreshNavigationMenu() {
    try {
        const response = await fetch('/inv/api/classifications');
        const result = await response.json();
        
        if (result.success) {
            // Find and update navigation menu
            const navContainers = [
                document.querySelector('.classification-nav'),
                document.querySelector('.nav-classifications'),
                document.querySelector('[data-classification-nav]'),
                document.querySelector('#classificationList')
            ];
            
            navContainers.forEach(container => {
                if (container) {
                    container.innerHTML = result.classifications.map(classification => 
                        `<li><a href="/inv/type/${classification.classification_id}" class="nav-link">${classification.classification_name}</a></li>`
                    ).join('');
                }
            });
            
            // Update classification dropdown in add inventory form
            const classificationSelect = document.querySelector('select[name="classification_id"]');
            if (classificationSelect) {
                const currentValue = classificationSelect.value;
                classificationSelect.innerHTML = '<option value="">Choose a Classification</option>' +
                    result.classifications.map(classification => 
                        `<option value="${classification.classification_id}" ${classification.classification_id == currentValue ? 'selected' : ''}>${classification.classification_name}</option>`
                    ).join('');
            }
            
            console.log('✅ Navigation menu updated successfully');
        }
    } catch (error) {
        console.error('❌ Error refreshing navigation:', error);
    }
}

// Handle classification form submission with AJAX
async function handleClassificationSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Adding...';

        const response = await fetch('/inv/add-classification-ajax', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const result = await response.json();

        if (result.success) {
            // Update navigation menu immediately
            await refreshNavigationMenu();
            
            // Show success message
            showFlashMessage('Classification added successfully!', 'success');
            
            // Reset form
            form.reset();
        } else {
            showFlashMessage(result.message || 'Failed to add classification', 'error');
        }

    } catch (error) {
        console.error('Error adding classification:', error);
        showFlashMessage('Network error. Please try again.', 'error');
    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add AJAX handler to classification form
    const classificationForm = document.querySelector('#addClassificationForm, form[action*="classification"]');
    if (classificationForm) {
        classificationForm.addEventListener('submit', handleClassificationSubmit);
        console.log('✅ AJAX classification form handler attached');
    }
    
    // Test: Refresh navigation on page load to ensure it's current
    refreshNavigationMenu();
});

// Make functions available globally
window.refreshNavigationMenu = refreshNavigationMenu;
window.showFlashMessage = showFlashMessage;