document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('orderTableBody');
    searchInput.addEventListener('input', function() {
        const filter = this.value.toLowerCase();
        Array.from(tableBody.rows).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    });

    // Fetch and render orders
    async function loadOrders() {
        try {
            const res = await fetch('../php/get_orders.php');
            const data = await res.json();
            if (data.success) {
                tableBody.innerHTML = '';
                data.orders.forEach(order => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${order.user_email}</td>
                        <td>$${parseFloat(order.quantity * (order.price || 0)).toFixed(2)}</td>
                        <td>
                            <select class="status-dropdown">
                                <option value="ordered" ${order.status === 'ordered' ? 'selected' : ''}>Ordered</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                            <button class="delete-btn">Delete</button>
                        </td>
                    `;
                    // Status update
                    tr.querySelector('.status-dropdown').addEventListener('change', async function() {
                        const newStatus = this.value;
                        try {
                            const res = await fetch('../php/update_order.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `order_id=${order.id}&status=${encodeURIComponent(newStatus)}`
                            });
                            const data = await res.json();
                            if (!data.success) alert(data.message || 'Failed to update status.');
                        } catch (err) {
                            alert('An error occurred.');
                        }
                    });
                    // Delete order
                    tr.querySelector('.delete-btn').addEventListener('click', async function() {
                        if (!confirm('Delete this order?')) return;
                        try {
                            const res = await fetch('../php/delete_order.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `order_id=${order.id}`
                            });
                            const data = await res.json();
                            if (data.success) {
                                tr.remove();
                            } else {
                                alert(data.message || 'Failed to delete order.');
                            }
                        } catch (err) {
                            alert('An error occurred.');
                        }
                    });
                    tableBody.appendChild(tr);
                });
            }
        } catch (err) {
            tableBody.innerHTML = '<tr><td colspan="4">Failed to load orders.</td></tr>';
        }
    }
    loadOrders();
});
