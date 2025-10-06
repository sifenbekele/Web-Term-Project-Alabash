document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Fetch and display admin profile info
    async function loadProfile() {
        try {
            const res = await fetch('../php/get_profile.php');
            const data = await res.json();
            if (data.success) {
                document.querySelector('.settings-value').textContent = data.email;
                // Optionally show role somewhere if needed
            }
        } catch (err) {
            // Optionally handle error
        }
    }
    loadProfile();

    const profileForm = document.getElementById('profileForm');
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
});
