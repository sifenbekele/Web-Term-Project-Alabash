document.addEventListener('DOMContentLoaded', function() {
    // CONTACT FORM SUBMISSION (AJAX)
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        try {
            const res = await fetch('../php/contact.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}`
            });
            const data = await res.json();
            if (data.success) {
                alert('Message sent successfully!');
                form.reset();
            } else {
                alert(data.message || 'Failed to send message.');
            }
        } catch (err) {
            alert('An error occurred. Please try again.');
        }
    });

    // MODAL LOGIC (login/signup)
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginBtn = document.getElementById('loginSignupBtn');
    const loginClose = document.getElementById('login-modal-close');
    const signupClose = document.getElementById('signup-modal-close');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    function openModal(modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    function closeModal(modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    if (loginBtn) loginBtn.addEventListener('click', e => {
      e.preventDefault();
      openModal(loginModal);
    });
    if (loginClose) loginClose.addEventListener('click', () => closeModal(loginModal));
    if (signupClose) signupClose.addEventListener('click', () => closeModal(signupModal));
    if (loginModal) loginModal.addEventListener('click', e => { if (e.target === loginModal) closeModal(loginModal); });
    if (signupModal) signupModal.addEventListener('click', e => { if (e.target === signupModal) closeModal(signupModal); });
    if (showSignup) showSignup.addEventListener('click', e => {
      e.preventDefault();
      closeModal(loginModal);
      openModal(signupModal);
    });
    if (showLogin) showLogin.addEventListener('click', e => {
      e.preventDefault();
      closeModal(signupModal);
      openModal(loginModal);
    });
    ['loginForm','signupForm'].forEach(id => {
      const form = document.getElementById(id);
      if(form) form.addEventListener('submit', e => e.preventDefault());
    });

    // LOGIN FORM SUBMISSION (AJAX)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error') || (() => {
          const err = document.createElement('div');
          err.id = 'login-error';
          err.style.color = '#e53935';
          err.style.marginTop = '10px';
          err.style.textAlign = 'center';
          loginForm.appendChild(err);
          return err;
        })();
        errorMsg.textContent = '';
        try {
          const response = await fetch('../php/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
          });
          const data = await response.json();
          if (data.success) {
            // Get user role from session_info.php
            const sessionRes = await fetch('../php/session_info.php');
            const sessionData = await sessionRes.json();
            if (sessionData.role === 'admin') {
              window.location.href = 'AD Homepage.html';
            } else {
              window.location.href = 'Shop.html';
            }
          } else {
            errorMsg.textContent = data.message || 'Invalid email or password.';
          }
        } catch (err) {
          errorMsg.textContent = 'An error occurred. Please try again.';
        }
      });
    }

    // SIGNUP FORM SUBMISSION (AJAX)
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirmPassword').value;
        const errorMsg = document.getElementById('signup-error') || (() => {
          const err = document.createElement('div');
          err.id = 'signup-error';
          err.style.color = '#e53935';
          err.style.marginTop = '10px';
          err.style.textAlign = 'center';
          signupForm.appendChild(err);
          return err;
        })();
        errorMsg.textContent = '';
        if (password !== confirmPassword) {
          errorMsg.textContent = 'Passwords do not match.';
          return;
        }
        try {
          const response = await fetch('../php/signup.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
          });
          const data = await response.json();
          if (data.success) {
            errorMsg.style.color = '#43a047';
            errorMsg.textContent = data.message || 'Signup successful! You can now log in.';
            setTimeout(() => {
              errorMsg.textContent = '';
              errorMsg.style.color = '#e53935';
              closeModal(signupModal);
              openModal(loginModal);
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
    }
});
