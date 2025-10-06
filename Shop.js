let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');

// Fetch and render products dynamically
async function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    try {
        const res = await fetch('../php/get_products.php');
        const data = await res.json();
        if (data.success) {
            productsGrid.innerHTML = '';
            data.products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                let imgSrc = '../assets/Logo.png';
                if (product.image) {
                    if (product.image.startsWith('../') || product.image.startsWith('/')) {
                        imgSrc = product.image;
                    } else if (product.image.startsWith('assets/')) {
                        imgSrc = '../' + product.image;
                    } else {
                        imgSrc = '../assets/' + product.image;
                    }
                }
                card.innerHTML = `
                    <img src="${imgSrc}" alt="${product.name}" style="width:100%;height:160px;object-fit:cover;border-radius:8px 8px 0 0;">
                    <div class="product-info">
                        <div class="product-title">${product.name}</div>
                        <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                        <button class="add-to-cart" data-id="${product.id}" data-title="${product.name}" data-img="${imgSrc}" data-price="${product.price}">Add to Cart</button>
                    </div>
                `;
                productsGrid.appendChild(card);
            });
            attachAddToCartEvents();
        }
    } catch (err) {
        productsGrid.innerHTML = '<div>Failed to load products.</div>';
    }
}

function attachAddToCartEvents() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const product_id = btn.getAttribute('data-id');
            const title = btn.getAttribute('data-title');
            const img = btn.getAttribute('data-img');
            const price = parseFloat(btn.getAttribute('data-price'));
            addToCart(product_id, title, img, price);
        });
    });
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = count;
    if (count > 0) {
        cartCount.classList.add('visible');
    } else {
        cartCount.classList.remove('visible');
    }
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.title}">
            <div class="item-details">
                <div class="item-title">${item.title}</div>
            </div>
            <div class="item-quantity">
                <button class="qty-btn" data-idx="${idx}" data-delta="-1">-</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" data-idx="${idx}" data-delta="1">+</button>
                <button class="remove-btn" data-idx="${idx}">×</button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
        total += item.qty * item.price;
    });
    totalPriceEl.textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product_id, title, img, price) {
    const idx = cart.findIndex(item => item.product_id === product_id);
    if (idx > -1) {
        cart[idx].qty += 1;
    } else {
        cart.push({ product_id, title, img, price, qty: 1 });
    }
    saveCart();
    updateCartCount();
    renderCart();
}

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();

    // Fetch and set user avatar in header
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

document.getElementById('cart-btn').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('cart-modal').style.display = 'flex';
    renderCart();
});
document.getElementById('cart-modal-close').addEventListener('click', function() {
    document.getElementById('cart-modal').style.display = 'none';
});
document.getElementById('cart-modal').addEventListener('click', function(e) {
    if (e.target === document.getElementById('cart-modal')) {
        document.getElementById('cart-modal').style.display = 'none';
    }
});

cartItemsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('qty-btn')) {
        const idx = +e.target.getAttribute('data-idx');
        const delta = +e.target.getAttribute('data-delta');
        cart[idx].qty += delta;
        if (cart[idx].qty < 1) cart[idx].qty = 1;
        saveCart();
        updateCartCount();
        renderCart();
    } else if (e.target.classList.contains('remove-btn')) {
        const idx = +e.target.getAttribute('data-idx');
        cart.splice(idx, 1);
        saveCart();
        updateCartCount();
        renderCart();
    }
});

document.querySelector('.checkout-btn').addEventListener('click', async function() {
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    try {
        const response = await fetch('../php/create_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cart.map(item => ({ product_id: item.product_id, quantity: item.qty })) })
        });
        const data = await response.json();
        if (data.success) {
            alert('Order placed successfully!');
            cart = [];
            saveCart();
            updateCartCount();
            renderCart();
            document.getElementById('cart-modal').style.display = 'none';
        } else {
            alert(data.message || 'Failed to place order.');
        }
    } catch (err) {
        alert('An error occurred during checkout.');
    }
});

const pages = document.querySelectorAll('.pagination-page');
pages.forEach(page => {
    page.addEventListener('click', function() {
        pages.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
    });
});

const leftArrow = document.querySelector('.pagination-arrow[disabled], .pagination-arrow:first-child');
const rightArrow = document.querySelector('.pagination-arrow:last-child');
if (leftArrow && rightArrow) {
    leftArrow.addEventListener('click', () => {});
    rightArrow.addEventListener('click', () => {});
}
