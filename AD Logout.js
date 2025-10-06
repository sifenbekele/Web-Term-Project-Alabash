document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const logoutBtn = document.getElementById('confirmLogout');
    logoutBtn.addEventListener('click', async function() {
        try {
            await fetch('../php/logout.php');
        } catch (err) {}
        window.location.href = '../index.html';
    });
});
