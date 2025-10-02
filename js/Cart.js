let cart = JSON.parse(localStorage.getItem('cart')) || [];

const products = [
    { name: 'Classic White T-Shirt', price: 35 },
    { name: 'Blue Denim Jeans', price: 60 },
    { name: 'Black Leather Boots', price: 70 }
];

const quantities = [1, 1, 1];

const productImages = [
    'https://i.imgur.com/1GrakTl.jpg',
    'https://i.imgur.com/7qO6FQ2.jpg',
    'https://i.imgur.com/QlRphfQ.jpg'
];
const productSizes = ['Size M', 'Size 8', 'Size 7'];

function renderCart() {
    const cartItemsDiv = document.querySelector('.cart-items');
    cartItemsDiv.innerHTML = '';
    let malformed = false;
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        if (!item || !item.img || !item.title || typeof item.qty !== 'number' || typeof item.price !== 'number') {
            malformed = true;
            continue;
        }
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.img}" alt="${item.title}">
            <div class="item-details">
                <div class="item-title">${item.title}</div>
            </div>
            <div class="item-quantity">
                <button class="qty-btn" onclick="updateQuantity(${i}, -1)">-</button>
                <span class="qty-value" id="qty-${i}">${item.qty}</span>
                <button class="qty-btn" onclick="updateQuantity(${i}, 1)">+</button>
                <button class="remove-btn" onclick="removeItem(${i})">\u00d7</button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);
    }
    if (malformed) {
        const warn = document.createElement('div');
        warn.className = 'cart-warning';
        warn.style.color = 'red';
        warn.style.margin = '10px 0';
        warn.textContent = 'Some cart items could not be displayed due to missing data.';
        cartItemsDiv.appendChild(warn);
    }
    updateTotal();
}

function updateQuantity(index, change) {
    if (cart[index].qty + change < 1) return;
    cart[index].qty += change;
    saveCart();
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    document.querySelector('.checkout-btn').addEventListener('click', checkout);
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

function updateTotal() {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].qty;
    }
    document.getElementById('total-price').textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

async function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    // Prepare cart data for backend (product_id, quantity)
    // For demo, we use title as identifier, but you should use product_id in real app
    // Here, we assume Shop.js stores product_id in item.product_id
    const cartForBackend = cart.map(item => ({
        product_id: item.product_id || 1, // fallback to 1 if not present
        quantity: item.qty
    }));
    try {
        const res = await fetch('../php/create_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cartForBackend })
        });
        const data = await res.json();
        if (data.success) {
            alert('Order placed successfully!');
            cart = [];
            saveCart();
            renderCart();
        } else {
            alert(data.message || 'Failed to place order.');
        }
    } catch (err) {
        alert('An error occurred. Please try again.');
    }
}
