// Fetch and display user profile info
async function loadProfile() {
    try {
        const res = await fetch('../php/get_profile.php');
        const data = await res.json();
        if (data.success) {
            document.querySelector('.profile-info .email').textContent = data.email;
            // Always show avatar or fallback
            const avatarPath = data.avatar ? ('../' + data.avatar) : '../assets/Vagabond.jpg';
            document.getElementById('profileAvatar').src = avatarPath;
        }
    } catch (err) {
        // Optionally handle error
    }
}

// Fetch and display user order history
async function loadOrderHistory() {
    try {
        const res = await fetch('../php/get_user_orders.php');
        const data = await res.json();
        if (data.success) {
            const tbody = document.querySelector('.order-history tbody');
            tbody.innerHTML = '';
            data.orders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${order.id}</td>
                    <td>${order.created_at}</td>
                    <td>$${parseFloat(order.quantity * (order.price || 0)).toFixed(2)}</td>
                    <td><span class="status ordered">${order.status}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        // Optionally handle error
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadOrderHistory();

    const profileForm = document.getElementById('profileForm');
    const logoutBtn = document.getElementById('logoutBtn');

    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newEmail = document.getElementById('newEmail').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword && newPassword !== confirmPassword) {
            alert('New password and confirmation do not match.');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('currentPassword', currentPassword);
            formData.append('newEmail', newEmail);
            formData.append('newPassword', newPassword);
            formData.append('confirmPassword', confirmPassword);
            const res = await fetch('../php/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (data.success) {
                alert('Profile updated successfully!');
                loadProfile();
            } else {
                alert(data.message || 'Failed to update profile.');
            }
        } catch (err) {
            alert('An error occurred. Please try again.');
        }
    });

    logoutBtn.addEventListener('click', async function() {
        try {
            await fetch('../php/logout.php');
        } catch (err) {}
        window.location.href = '../index.html';
    });

    // Avatar upload with backend
    const avatarInput = document.getElementById('avatarInput');
    const profileAvatar = document.getElementById('profileAvatar');
    avatarInput.addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const res = await fetch('../php/upload_avatar.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    // Save avatar path in DB
                    const updateRes = await fetch('../php/update_avatar.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'avatar=' + encodeURIComponent(data.path)
                    });
                    const updateData = await updateRes.json();
                    if (updateData.success) {
                        profileAvatar.src = '../' + data.path;
                        alert('Avatar updated successfully!');
                    } else {
                        alert(updateData.message || 'Failed to update avatar in profile.');
                    }
                } else {
                    alert(data.message || 'Failed to upload avatar.');
                }
            } catch (err) {
                alert('An error occurred during avatar upload.');
            }
        }
    });
});
