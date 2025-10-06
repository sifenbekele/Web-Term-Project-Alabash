document.addEventListener('DOMContentLoaded', function () {
  const shopNowBtn = document.getElementById('shopNowBtn');
  const newArrivalsSection = document.querySelector('.new-arrivals');

  if (shopNowBtn && newArrivalsSection) {
    shopNowBtn.addEventListener('click', function () {
      newArrivalsSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // DYNAMIC NEW ARRIVALS
  const productsContainer = document.querySelector('.new-arrivals .products');
  if (productsContainer) {
    fetch('php/get_products.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          productsContainer.innerHTML = '';
          data.products.slice(0, 5).forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
              <img src="${product.image || 'assets/Logo.png'}" alt="${product.name}">
              <div class="product-info">
                <span>${product.name}</span>
                <span>ETB${parseFloat(product.price).toFixed(2)}</span>
              </div>
            `;
            card.style.cursor = 'pointer';
            card.addEventListener('click', function () {
              openModal(loginModal);
            });
            productsContainer.appendChild(card);
          });
        }
      });
  }
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
['loginForm', 'signupForm'].forEach(id => {
  const form = document.getElementById(id);
  if (form) form.addEventListener('submit', e => e.preventDefault());
});

// LOGIN FORM SUBMISSION (AJAX, with role-based redirect)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    errorMsg.textContent = '';

    try {
      const response = await fetch('php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });
      const data = await response.json();
      if (data.success) {
        // Fetch session info to determine role
        const sessionRes = await fetch('php/session_info.php');
        const sessionData = await sessionRes.json();
        if (sessionData.role === 'admin') {
          window.location.href = 'pages/AD Homepage.html';
        } else {
          window.location.href = 'pages/Shop.html';
        }
      } else {
        errorMsg.textContent = data.message || 'Login failed.';
      }
    } catch (err) {
      errorMsg.textContent = 'An error occurred. Please try again.';
    }
  });
}

// SIGNUP FORM SUBMISSION (AJAX, with feedback)
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirmPassword').value;
    const errorMsg = document.getElementById('signup-error');
    errorMsg.textContent = '';

    if (!name) {
      errorMsg.textContent = 'Name is required.';
      return;
    }
    if (password !== confirmPassword) {
      errorMsg.textContent = 'Passwords do not match.';
      return;
    }

    try {
      const response = await fetch('php/signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (_) {
        throw new Error(raw || `Signup failed with status ${response.status}`);
      }
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
      errorMsg.textContent = (err && err.message) ? err.message : 'An error occurred. Please try again.';
    }
  });
}
