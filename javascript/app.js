// ============================================
// PEODAGER E-COMMERCE APPLICATION
// ============================================

// ---------- PRODUCT DATABASE ----------
let products = [
    { id: 1, name: "Sony WH-1000XM5", category: "electronics", price: 399.99, description: "Premium noise-cancelling headphones with 30hr battery life", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Headphones" },
    { id: 2, name: "Leather Bomber Jacket", category: "fashion", price: 189.99, description: "Classic leather jacket, genuine material, timeless style", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Jacket" },
    { id: 3, name: "Smart LED Desk Lamp", category: "home", price: 49.99, description: "Adjustable brightness, color temperature control", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Lamp" },
    { id: 4, name: "Apple AirPods Pro", category: "electronics", price: 249.99, description: "Active noise cancellation, spatial audio", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=AirPods" },
    { id: 5, name: "Minimalist Watch", category: "accessories", price: 89.99, description: "Elegant stainless steel watch, water resistant", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Watch" },
    { id: 6, name: "Cotton Linen Shirt", category: "fashion", price: 59.99, description: "Breathable fabric, perfect for summer", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Shirt" },
    { id: 7, name: "Ceramic Plant Pot", category: "home", price: 29.99, description: "Handcrafted ceramic, modern design", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Pot" },
    { id: 8, name: "Wireless Charger", category: "electronics", price: 34.99, description: "Fast charging for all Qi-enabled devices", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Charger" },
    { id: 9, name: "Leather Wallet", category: "accessories", price: 45.99, description: "Genuine leather, RFID blocking", image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Wallet" }
];

// ---------- STATE MANAGEMENT ----------
let cart = [];
let currentFilters = {
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'default'
};

let searchDebounceTimer = null;
let fuse = null;

// Initialize Fuse.js for fuzzy search
function initFuse() {
    fuse = new Fuse(products, {
        keys: ['name', 'description', 'category'],
        threshold: 0.3,
        includeScore: true
    });
}

// ---------- LOCALSTORAGE ----------
function loadCart() {
    const saved = localStorage.getItem('peodager_cart');
    if (saved) cart = JSON.parse(saved);
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('peodager_cart', JSON.stringify(cart));
    updateCartUI();
}

// ---------- CART FUNCTIONS ----------
function addToCart(product, quantity = 1) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    saveCart();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateCartItemQuantity(productId, newQuantity) {
    const item = cart.find(i => i.id === productId);
    if (item && newQuantity > 0) {
        item.quantity = newQuantity;
    } else if (item && newQuantity <= 0) {
        removeFromCart(productId);
    }
    saveCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartUI() {
    document.getElementById('cartCount').innerText = getCartCount();
    document.getElementById('cartTotal').innerText = getCartTotal().toFixed(2);
    renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cartItemsList');
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Your cart is empty 🛒</div>';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img class="cart-item-img" src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <strong>${item.name}</strong>
                <div>$${item.price}</div>
                <div class="cart-item-quantity">
                    <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart(${item.id})" style="color:red;">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- TOAST NOTIFICATION ----------
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 2000;
        animation: fadeInOut 2s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ---------- PRODUCT RENDERING WITH FILTERS ----------
function getFilteredProducts() {
    let filtered = [...products];
    
    // Fuzzy search
    if (currentFilters.search && fuse) {
        const results = fuse.search(currentFilters.search);
        filtered = results.map(r => r.item);
    }
    
    // Category filter
    if (currentFilters.category !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilters.category);
    }
    
    // Price range
    if (currentFilters.minPrice) {
        filtered = filtered.filter(p => p.price >= parseFloat(currentFilters.minPrice));
    }
    if (currentFilters.maxPrice) {
        filtered = filtered.filter(p => p.price <= parseFloat(currentFilters.maxPrice));
    }
    
    // Sorting
    switch (currentFilters.sort) {
        case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name_asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    return filtered;
}

function renderProducts() {
    const filtered = getFilteredProducts();
    const grid = document.getElementById('productGrid');
    const countSpan = document.getElementById('productCount');
    const noResultsDiv = document.getElementById('noResultsMsg');
    
    countSpan.innerText = `${filtered.length} products`;
    
    if (filtered.length === 0) {
        grid.style.display = 'none';
        noResultsDiv.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    noResultsDiv.style.display = 'none';
    
    grid.innerHTML = filtered.map(product => `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <img class="product-img" src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-title">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, 1)">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// ---------- LIVE SEARCH WITH DEBOUNCE & SUGGESTIONS ----------
function handleSearchInput(e) {
    clearTimeout(searchDebounceTimer);
    const value = e.target.value;
    
    // Show live suggestions
    if (value.length > 1 && fuse) {
        const suggestions = fuse.search(value, { limit: 3 });
        showSuggestions(suggestions.map(s => s.item));
    } else {
        document.getElementById('suggestionsDropdown').classList.remove('active');
    }
    
    searchDebounceTimer = setTimeout(() => {
        currentFilters.search = value;
        renderProducts();
    }, 300);
}

function showSuggestions(suggestions) {
    const dropdown = document.getElementById('suggestionsDropdown');
    if (suggestions.length === 0) {
        dropdown.classList.remove('active');
        return;
    }
    
    dropdown.innerHTML = suggestions.map(s => `
        <div class="suggestion-item" onclick="selectSuggestion('${s.name}')">
            <strong>${s.name}</strong> - $${s.price}
        </div>
    `).join('');
    dropdown.classList.add('active');
}

function selectSuggestion(productName) {
    document.getElementById('searchInput').value = productName;
    currentFilters.search = productName;
    renderProducts();
    document.getElementById('suggestionsDropdown').classList.remove('active');
}

// ---------- FILTER EVENT HANDLERS ----------
function applyFilters() {
    currentFilters.category = document.getElementById('categoryFilter').value;
    currentFilters.minPrice = document.getElementById('minPrice').value;
    currentFilters.maxPrice = document.getElementById('maxPrice').value;
    currentFilters.sort = document.getElementById('sortBy').value;
    renderProducts();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortBy').value = 'default';
    
    currentFilters = {
        search: '',
        category: 'all',
        minPrice: '',
        maxPrice: '',
        sort: 'default'
    };
    renderProducts();
    document.getElementById('suggestionsDropdown').classList.remove('active');
}

// ---------- PRODUCT DETAIL ----------
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>${product.name}</h2>
            <img src="${product.image}" style="width:100%; border-radius:1rem; margin:1rem 0;">
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
            <p>${product.description}</p>
            <div style="margin-top:1rem;">
                <label>Quantity: </label>
                <input type="number" id="detailQty" value="1" min="1" style="width:80px;">
                <button class="btn-primary" onclick="addToCart(products.find(p=>p.id===${product.id}), parseInt(document.getElementById('detailQty').value)); this.closest('.modal').remove();">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ---------- ADMIN DASHBOARD ----------
function renderAdminProducts() {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="${product.image}" width="40" height="40" style="object-fit:cover; border-radius:0.5rem;"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <button onclick="editProduct(${product.id})" class="btn-secondary" style="width:auto; padding:0.3rem 0.8rem;">✏️ Edit</button>
                <button onclick="deleteProduct(${product.id})" style="background:#fee2e2; color:#dc2626; border:none; padding:0.3rem 0.8rem; border-radius:0.5rem; cursor:pointer;">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('productModalTitle').innerText = 'Edit Product';
    document.getElementById('editProductId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImage').value = product.image;
    
    document.getElementById('productModal').classList.add('active');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        renderAdminProducts();
        renderProducts();
        initFuse(); // Reinitialize fuzzy search
        showToast('Product deleted');
    }
}

function saveProduct(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editProductId').value);
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value || 'https://placehold.co/400x400/eef2ff/4f46e5?text=Product'
    };
    
    if (id) {
        // Edit existing
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        // Add new
        const newId = Math.max(...products.map(p => p.id)) + 1;
        products.push({ id: newId, ...productData });
    }
    
    renderAdminProducts();
    renderProducts();
    initFuse();
    closeProductModal();
    showToast('Product saved successfully');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productModalTitle').innerText = 'Add Product';
}

// Mock orders for admin
const mockOrders = [
    { id: 'ORD-001', customer: 'John Doe', items: 2, total: 129.98, status: 'Pending' },
    { id: 'ORD-002', customer: 'Jane Smith', items: 1, total: 399.99, status: 'Processing' },
    { id: 'ORD-003', customer: 'Mike Johnson', items: 3, total: 89.97, status: 'Completed' },
    { id: 'ORD-004', customer: 'Sarah Wilson', items: 2, total: 279.98, status: 'Pending' },
    { id: 'ORD-005', customer: 'David Brown', items: 1, total: 49.99, status: 'Completed' }
];

function renderMockOrders() {
    const tbody = document.getElementById('mockOrdersTable');
    tbody.innerHTML = mockOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.items} items</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span style="padding:0.2rem 0.6rem; border-radius:1rem; background:${order.status === 'Completed' ? '#d1fae5' : order.status === 'Pending' ? '#fed7aa' : '#e0e7ff'}">${order.status}</span></td>
            <td><button class="btn-secondary" style="width:auto; padding:0.2rem 0.6rem;">Update</button></td>
        </tr>
    `).join('');
    
    document.getElementById('pendingOrders').innerText = mockOrders.filter(o => o.status === 'Pending').length;
    document.getElementById('processingOrders').innerText = mockOrders.filter(o => o.status === 'Processing').length;
    document.getElementById('completedOrders').innerText = mockOrders.filter(o => o.status === 'Completed').length;
}

// ---------- CHECKOUT & WHATSAPP INTEGRATION ----------
function openCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    const summary = document.getElementById('checkoutSummary');
    summary.innerHTML = `
        <h4>Order Summary</h4>
        ${cart.map(item => `<p>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>`).join('')}
        <strong>Total: $${getCartTotal().toFixed(2)}</strong>
    `;
    
    document.getElementById('checkoutModal').classList.add('active');
}

function sendWhatsAppOrder(e) {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('deliveryAddress').value;
    
    if (!name || !phone || !address) {
        showToast('Please fill all fields');
        return;
    }
    
    const itemsList = cart.map(item => `${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join('%0A');
    const message = `🛍️ *NEW ORDER - PEODAGER*%0A%0A👤 *Customer:* ${name}%0A📞 *Phone:* ${phone}%0A🏠 *Address:* ${address}%0A%0A📦 *Items:*%0A${itemsList}%0A%0A💰 *Total:* $${getCartTotal().toFixed(2)}%0A%0A🙏 Thank you!`;
    
    let phoneNum = phone.replace(/\D/g, '');
    if (!phoneNum.startsWith('234')) phoneNum = '234' + phoneNum;
    
    window.open(`https://wa.me/${phoneNum}?text=${message}`, '_blank');
    showToast('Opening WhatsApp...');
    
    // Clear cart after order
    cart = [];
    saveCart();
    closeCheckoutModal();
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('checkoutForm').reset();
}

// ---------- PAGE NAVIGATION ----------
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');
    
    if (page === 'admin') {
        renderAdminProducts();
        renderMockOrders();
    }
}

// ---------- INITIALIZATION ----------
function init() {
    loadCart();
    initFuse();
    renderProducts();
    
    // Event Listeners
    document.getElementById('searchInput').addEventListener('input', handleSearchInput);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('minPrice').addEventListener('input', applyFilters);
    document.getElementById('maxPrice').addEventListener('input', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
    document.getElementById('clearSearchBtn').addEventListener('click', resetFilters);
    
    // Cart UI
    document.getElementById('cartIconBtn').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.add('open');
        document.getElementById('cartOverlay').classList.add('active');
    });
    
    document.getElementById('closeCartBtn').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('active');
    });
    
    document.getElementById('cartOverlay').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('active');
    });
    
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('active');
        openCheckout();
    });
    
    // Admin
    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('productModalTitle').innerText = 'Add Product';
        document.getElementById('editProductId').value = '';
        document.getElementById('productForm').reset();
        document.getElementById('productModal').classList.add('active');
    });
    
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    document.querySelectorAll('.modal-close, .product-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('productModal').classList.remove('active');
            document.getElementById('checkoutModal').classList.remove('active');
        });
    });
    
    document.getElementById('checkoutForm').addEventListener('submit', sendWhatsAppOrder);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
    
    // Close modals on outside click
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    };
}

(function() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('.newsletter-input');
            const email = emailInput.value.trim();
            if (email) {
                alert(`Thank you for subscribing with: ${email}\nYou'll receive our latest updates!`);
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
})(); 

// Make functions global for onclick handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.showProductDetail = showProductDetail;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.selectSuggestion = selectSuggestion;
window.products = products;

// Start the app
document.addEventListener('DOMContentLoaded', init);