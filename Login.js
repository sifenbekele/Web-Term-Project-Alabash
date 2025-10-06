document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');
    errorMsg.textContent = '';

    try {
        const response = await fetch('../php/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });
        const data = await response.json();
        if (data.success) {
            // Fetch session info to determine role
            const sessionRes = await fetch('../php/session_info.php');
            const sessionData = await sessionRes.json();
            if (sessionData.role === 'admin') {
                window.location.href = 'AD Homepage.html';
            } else {
                window.location.href = 'Shop.html';
            }
        } else {
            errorMsg.textContent = data.message || 'Login failed.';
        }
    } catch (err) {
        errorMsg.textContent = 'An error occurred. Please try again.';
    }
});
