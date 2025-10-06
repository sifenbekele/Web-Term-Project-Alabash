document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const uploadArea = document.getElementById('uploadArea');
    const browseBtn = document.getElementById('browseBtn');
    const fileInput = document.getElementById('productImage');

    uploadArea.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.background = '#f0f4f8';
    });
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.background = '';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileInput.files = e.dataTransfer.files;
        uploadArea.style.background = '';
    });

    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('productTableBody');
    searchInput.addEventListener('input', function() {
        const filter = this.value.toLowerCase();
        Array.from(tableBody.rows).forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            row.style.display = name.includes(filter) ? '' : 'none';
        });
    });

    // Modal for editing product
    let editModal = document.getElementById('editProductModal');
    if (!editModal) {
        editModal = document.createElement('div');
        editModal.id = 'editProductModal';
        editModal.style.display = 'none';
        editModal.style.position = 'fixed';
        editModal.style.top = '0';
        editModal.style.left = '0';
        editModal.style.width = '100vw';
        editModal.style.height = '100vh';
        editModal.style.background = 'rgba(0,0,0,0.4)';
        editModal.style.zIndex = '1000';
        editModal.innerHTML = `
            <div style="background:#fff;max-width:400px;margin:60px auto;padding:24px;position:relative;border-radius:8px;">
                <button id="closeEditModal" style="position:absolute;top:8px;right:8px;font-size:20px;">&times;</button>
                <h2>Edit Product</h2>
                <form id="editProductForm">
                    <input type="hidden" id="editProductId">
                    <label for="editProductName">Product Name</label>
                    <input type="text" id="editProductName" required>
                    <label for="editProductPrice">Price</label>
                    <input type="text" id="editProductPrice" required>
                    <label for="editProductDesc">Description</label>
                    <textarea id="editProductDesc"></textarea>
                    <label for="editProductImage">Image</label>
                    <input type="file" id="editProductImage" accept="image/*">
                    <img id="editProductPreview" src="" alt="Preview" style="max-width:100px;display:block;margin:8px 0;">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        `;
        document.body.appendChild(editModal);
    }
    function openEditModal(product) {
        editModal.style.display = 'block';
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductDesc').value = product.description || '';
        document.getElementById('editProductPreview').src = product.image ? ('../' + product.image) : '';
        document.getElementById('editProductImage').value = '';
    }
    document.getElementById('closeEditModal').onclick = () => { editModal.style.display = 'none'; };
    editModal.onclick = (e) => { if (e.target === editModal) editModal.style.display = 'none'; };

    // Fetch and render products
    async function loadProducts() {
        try {
            const res = await fetch('../php/get_products.php');
            const data = await res.json();
            if (data.success) {
                tableBody.innerHTML = '';
                data.products.forEach(product => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${product.name}</td>
                        <td>$${parseFloat(product.price).toFixed(2)}</td>
                        <td>
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn">Delete</button>
                        </td>
                    `;
                    // Edit product
                    tr.querySelector('.edit-btn').addEventListener('click', function() {
                        openEditModal(product);
                    });
                    // Delete product
                    tr.querySelector('.delete-btn').addEventListener('click', async function() {
                        if (!confirm('Delete this product?')) return;
                        try {
                            const res = await fetch('../php/delete_product.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `id=${product.id}`
                            });
                            const data = await res.json();
                            if (data.success) {
                                tr.remove();
                            } else {
                                alert(data.message || 'Failed to delete product.');
                            }
                        } catch (err) {
                            alert('An error occurred.');
                        }
                    });
                    tableBody.appendChild(tr);
                });
            }
        } catch (err) {
            tableBody.innerHTML = '<tr><td colspan="3">Failed to load products.</td></tr>';
        }
    }
    loadProducts();

    // Handle edit product form submit
    document.getElementById('editProductForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('editProductId').value;
        const name = document.getElementById('editProductName').value.trim();
        const price = document.getElementById('editProductPrice').value;
        const description = document.getElementById('editProductDesc').value.trim();
        let image = document.getElementById('editProductPreview').src.replace(window.location.origin + '/', '');
        const fileInput = document.getElementById('editProductImage');
        if (!name || !price) {
            alert('Product name and price are required.');
            return;
        }
        // If a new image is selected, upload it first
        if (fileInput.files && fileInput.files[0]) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            try {
                const res = await fetch('../php/upload_product_image.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    image = data.path;
                } else {
                    alert(data.message || 'Failed to upload image.');
                    return;
                }
            } catch (err) {
                alert('An error occurred during image upload.');
                return;
            }
        }
        try {
            const formData = new URLSearchParams();
            formData.append('id', id);
            formData.append('name', name);
            formData.append('price', price);
            formData.append('description', description);
            formData.append('image', image);
            const res = await fetch('../php/edit_product.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (data.success) {
                alert('Product updated successfully!');
                editModal.style.display = 'none';
                loadProducts();
            } else {
                alert(data.message || 'Failed to update product.');
            }
        } catch (err) {
            alert('An error occurred. Please try again.');
        }
    });

    const productForm = document.getElementById('productForm');
    const addProductPreview = document.getElementById('addProductPreview');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    let uploadedImagePath = '';

    // Show preview when an image is selected and upload immediately
    fileInput.addEventListener('change', async function() {
        if (fileInput.files && fileInput.files[0]) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            try {
                const res = await fetch('../php/upload_product_image.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    uploadedImagePath = data.path;
                    addProductPreview.src = '../' + data.path;
                    addProductPreview.style.display = 'block';
                    if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
                } else {
                    alert(data.message || 'Failed to upload image.');
                    addProductPreview.style.display = 'none';
                    uploadedImagePath = '';
                    if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
                }
            } catch (err) {
                alert('An error occurred during image upload.');
                addProductPreview.style.display = 'none';
                uploadedImagePath = '';
                if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
            }
        } else {
            addProductPreview.style.display = 'none';
            uploadedImagePath = '';
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
        }
    });

    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('productName').value.trim();
        const price = document.getElementById('productPrice').value;
        const description = document.getElementById('productDesc').value.trim();
        let image = uploadedImagePath;
        if (!name || !price) {
            alert('Product name and price are required.');
            return;
        }
        try {
            const formData = new URLSearchParams();
            formData.append('name', name);
            formData.append('price', price);
            formData.append('description', description);
            formData.append('image', image);
            const res = await fetch('../php/add_product.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (data.success) {
                alert('Product added successfully!');
                productForm.reset();
                addProductPreview.style.display = 'none';
                addProductPreview.src = '';
                uploadedImagePath = '';
                if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
                loadProducts();
            } else {
                alert(data.message || 'Failed to add product.');
            }
        } catch (err) {
            alert('An error occurred. Please try again.');
        }
    });
});
