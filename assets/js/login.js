// Check for error parameter in URL
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDiv = document.getElementById('errorMessage');

    if (error && errorDiv) {
        let errorMessage = '';

        switch(error) {
            case 'invalid':
                errorMessage = '❌ Invalid username or password';
                break;
            case 'empty':
                errorMessage = '❌ Please fill in all fields';
                break;
            default:
                errorMessage = '❌ An error occurred. Please try again.';
        }

        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';

        // Auto-hide error after 5 seconds
        setTimeout(function() {
            errorDiv.style.display = 'none';
            // Clean URL without reloading
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 5000);
    }
});

// Optional: Add form validation
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');

    if (!username || !password) {
        e.preventDefault();
        errorDiv.textContent = '❌ Please fill in all fields';
        errorDiv.style.display = 'block';

        setTimeout(function() {
            errorDiv.style.display = 'none';
        }, 3000);
    }
});