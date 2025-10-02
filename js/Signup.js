document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name') ? document.getElementById('signup-name').value.trim() : '';
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMsg = document.getElementById('signup-error');
    errorMsg.textContent = '';

    if (!name) {
        errorMsg.style.color = '#e53935';
        errorMsg.textContent = 'Name is required.';
        return;
    }
    if (password !== confirmPassword) {
        errorMsg.style.color = '#e53935';
        errorMsg.textContent = 'Passwords do not match.';
        return;
    }

    try {
        const response = await fetch('../php/signup.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });
        const data = await response.json();
        if (data.success) {
            errorMsg.style.color = '#43a047';
            errorMsg.textContent = data.message || 'Signup successful! You can now log in.';
            setTimeout(() => {
                window.location.href = 'Login.html';
            }, 1500);
        } else {
            errorMsg.style.color = '#e53935';
            errorMsg.textContent = data.message || 'Signup failed.';
        }
    } catch (err) {
        errorMsg.style.color = '#e53935';
        errorMsg.textContent = 'An error occurred. Please try again.';
    }
});
