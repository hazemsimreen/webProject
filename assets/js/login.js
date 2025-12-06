document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === 'admin' && password === 'ahmad') {
        alert('Login Successful! Redirecting to Admin Dashboard...');
        window.location.href = 'admin.html';
    } else {
        alert('❌ Invalid Username or Password!\nTry: admin / ahmad');
    }
});
