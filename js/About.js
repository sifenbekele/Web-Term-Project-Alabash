document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});


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

document.addEventListener('DOMContentLoaded', function() {
  // Dynamic header avatar and logout
  fetch('../php/get_profile.php')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.avatar) {
        const userIcon = document.querySelector('.user-icon');
        if (userIcon) {
          userIcon.src = '../' + data.avatar;
        }
        // Add logout button if not present
        let navActions = document.querySelector('.nav-actions');
        if (navActions && !document.getElementById('logoutBtnHeader')) {
          const logoutBtn = document.createElement('button');
          logoutBtn.textContent = 'Logout';
          logoutBtn.id = 'logoutBtnHeader';
          logoutBtn.className = 'logout-btn-header';
          logoutBtn.style.marginLeft = '12px';
          navActions.appendChild(logoutBtn);
          logoutBtn.addEventListener('click', async function() {
            await fetch('../php/logout.php');
            window.location.reload();
          });
        }
      }
    });
});
