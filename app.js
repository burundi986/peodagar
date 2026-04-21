// ============================================
// PEODAGER E-COMMERCE - COMPLETE APPLICATION LOGIC
// Modular, Flask-ready, with localStorage persistence
// ============================================

// ============================================
// 1. PRODUCT SERVICE CLASS (Data Layer)
// ============================================
class ProductService {
    constructor() {
        // Initialize with 3 dummy products
        this.products = [
            {
                id: 1,
                name: "Wireless Headphones",
                category: "electronics",
                price: 79.99,
                description: "Premium noise-cancelling headphones with 30hr battery life",
                image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Headphones"
            },
            {
                id: 2,
                name: "Leather Jacket",
                category: "fashion",
                price: 189.99,
                description: "Classic leather jacket, genuine material, timeless style",
                image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Jacket"
            },
            {
                id: 3,
                name: "Smart Desk Lamp",
                category: "home",
                price: 49.99,
                description: "Adjustable brightness, color temperature control",
                image: "https://placehold.co/400x400/eef2ff/4f46e5?text=Lamp"
            }
        ];
        this.nextId = 4;
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }

    // Add new product
    addProduct(product) {
        const newProduct = {
            ...product,
            id: this.nextId++,
            image: product.image || "https://placehold.co/400x400/eef2ff/4f46e5?text=Product"
        };
        this.products.push(newProduct);
        return newProduct;
    }

    // Delete product by ID
    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.products.splice(index, 1);
            return true;
        }
        return false;
    }

    // Edit existing product
    editProduct(product) {
        const index = this.products.findIndex(p => p.id === parseInt(product.id));
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...product };
            return true;
        }
        return false;
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(p => p.id === parseInt(id));
    }

    // FLASK INTEGRATION READY:
    // To connect to Flask backend, replace the methods above with:
    /*
    async getAllProducts() {
        const response = await fetch('/api/products');
        return await response.json();
    }
    
    async addProduct(product) {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return await response.json();
    }
    
    async deleteProduct(id) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
    }
    
    async editProduct(product) {
        const response = await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return await response.json();
    }
    */
}

// ============================================
// 2. CART SERVICE (localStorage Management)
// ============================================
class CartService {
    constructor() {
        this.cart = [];
        this.loadCart();
    }

    loadCart() {
        const saved = localStorage.getItem('peodager_cart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
        this.updateCartUI();
    }

    saveCart() {
        localStorage.setItem('peodager_cart', JSON.stringify(this.cart));
        this.updateCartUI();
    }

    addToCart(product, quantity = 1) {
        const existing = this.cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({ ...product, quantity });
        }
        this.saveCart();
        this.showToast(`${product.name} added to cart!`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(i => i.id === productId);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
        } else if (item && newQuantity <= 0) {
            this.removeFromCart(productId);
        }
        this.saveCart();
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    getCartItems() {
        return this.cart;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    updateCartUI() {
        const countSpan = document.getElementById('cartCount');
        const totalSpan = document.getElementById('cartTotal');
        
        if (countSpan) countSpan.innerText = this.getCartCount();
        if (totalSpan) totalSpan.innerText = this.getCartTotal().toFixed(2);
        
        this.renderCartItems();
    }

    renderCartItems() {
        const container = document.getElementById('cartItemsList');
        if (!container) return;
        
        if (this.cart.length === 0) {
            container.innerHTML = '<div class="empty-cart" style="text-align:center; padding:2rem;">Your cart is empty 🛒</div>';
            return;
        }
        
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <strong>${item.name}</strong>
                    <div>$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="cartService.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="cartService.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-btn" onclick="cartService.removeFromCart(${item.id})" style="color:#ef4444;">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showToast(message) {
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
            font-size: 14px;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

// ============================================
// 3. UI RENDERER (Dynamic Product Grid)
// ============================================
class UIRenderer {
    constructor(productService, cartService) {
        this.productService = productService;
        this.cartService = cartService;
        this.currentFilters = {
            search: '',
            category: 'all',
            minPrice: '',
            maxPrice: '',
            sort: 'default'
        };
        this.fuse = null;
        this.initFuse();
    }

    initFuse() {
        this.fuse = new Fuse(this.productService.getAllProducts(), {
            keys: ['name', 'description', 'category'],
            threshold: 0.3,
            includeScore: true
        });
    }

    getFilteredProducts() {
        let filtered = [...this.productService.getAllProducts()];
        
        // Fuzzy search
        if (this.currentFilters.search && this.fuse) {
            const results = this.fuse.search(this.currentFilters.search);
            filtered = results.map(r => r.item);
        }
        
        // Category filter
        if (this.currentFilters.category !== 'all') {
            filtered = filtered.filter(p => p.category === this.currentFilters.category);
        }
        
        // Price range
        if (this.currentFilters.minPrice) {
            filtered = filtered.filter(p => p.price >= parseFloat(this.currentFilters.minPrice));
        }
        if (this.currentFilters.maxPrice) {
            filtered = filtered.filter(p => p.price <= parseFloat(this.currentFilters.maxPrice));
        }
        
        // Sorting
        switch (this.currentFilters.sort) {
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

    renderProductGrid() {
        const filtered = this.getFilteredProducts();
        const grid = document.getElementById('productGrid');
        const countSpan = document.getElementById('productCount');
        const noResultsDiv = document.getElementById('noResultsMsg');
        
        if (!grid) return;
        
        if (countSpan) countSpan.innerText = `${filtered.length} products`;
        
        if (filtered.length === 0) {
            if (grid) grid.style.display = 'none';
            if (noResultsDiv) noResultsDiv.style.display = 'block';
            return;
        }
        
        if (grid) grid.style.display = 'grid';
        if (noResultsDiv) noResultsDiv.style.display = 'none';
        
        grid.innerHTML = filtered.map(product => `
            <div class="product-card" onclick="uiRenderer.showProductDetail(${product.id})">
                <img class="product-img" src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="btn-add-cart" onclick="event.stopPropagation(); cartService.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, 1)">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }

    showProductDetail(productId) {
        const product = this.productService.getProductById(productId);
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
                    <input type="number" id="detailQty" value="1" min="1" style="width:80px; padding:5px;">
                    <button class="btn-primary" onclick="cartService.addToCart(productService.getProductById(${product.id}), parseInt(document.getElementById('detailQty').value)); this.closest('.modal').remove();">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    renderAdminProducts() {
        const tbody = document.getElementById('productTableBody');
        if (!tbody) return;
        
        const products = this.productService.getAllProducts();
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" width="40" height="40" style="object-fit:cover; border-radius:0.5rem;"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <button onclick="adminController.editProduct(${product.id})" class="btn-secondary" style="width:auto; padding:0.3rem 0.8rem;">✏️ Edit</button>
                    <button onclick="adminController.deleteProduct(${product.id})" style="background:#fee2e2; color:#dc2626; border:none; padding:0.3rem 0.8rem; border-radius:0.5rem; cursor:pointer;">🗑️ Delete</button>
                </td>
            </tr>
        `).join('');
    }

    renderMockOrders() {
        const tbody = document.getElementById('mockOrdersTable');
        if (!tbody) return;
        
        const mockOrders = [
            { id: 'ORD-001', customer: 'John Doe', items: 2, total: 129.98, status: 'Pending' },
            { id: 'ORD-002', customer: 'Jane Smith', items: 1, total: 399.99, status: 'Processing' },
            { id: 'ORD-003', customer: 'Mike Johnson', items: 3, total: 89.97, status: 'Completed' },
            { id: 'ORD-004', customer: 'Sarah Wilson', items: 2, total: 279.98, status: 'Pending' },
            { id: 'ORD-005', customer: 'David Brown', items: 1, total: 49.99, status: 'Completed' }
        ];
        
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
}

// ============================================
// 4. ADMIN CONTROLLER
// ============================================
class AdminController {
    constructor(productService, uiRenderer) {
        this.productService = productService;
        this.uiRenderer = uiRenderer;
    }

    openProductModal(editMode = false, product = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');
        
        if (editMode && product) {
            title.innerText = 'Edit Product';
            document.getElementById('editProductId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productImage').value = product.image;
        } else {
            title.innerText = 'Add Product';
            form.reset();
            document.getElementById('editProductId').value = '';
        }
        
        modal.classList.add('active');
    }

    closeProductModal() {
        const modal = document.getElementById('productModal');
        modal.classList.remove('active');
        document.getElementById('productForm').reset();
    }

    saveProduct(event) {
        event.preventDefault();
        
        const id = document.getElementById('editProductId').value;
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value || "https://placehold.co/400x400/eef2ff/4f46e5?text=Product"
        };
        
        if (id) {
            // Edit existing product
            productData.id = parseInt(id);
            this.productService.editProduct(productData);
            this.uiRenderer.showToast('Product updated successfully!');
        } else {
            // Add new product
            this.productService.addProduct(productData);
            this.uiRenderer.showToast('Product added successfully!');
        }
        
        // Update UI
        this.uiRenderer.renderProductGrid();
        this.uiRenderer.renderAdminProducts();
        this.uiRenderer.initFuse(); // Reinitialize fuzzy search
        
        this.closeProductModal();
    }

    editProduct(id) {
        const product = this.productService.getProductById(id);
        if (product) {
            this.openProductModal(true, product);
        }
    }

    deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.productService.deleteProduct(id);
            this.uiRenderer.renderProductGrid();
            this.uiRenderer.renderAdminProducts();
            this.uiRenderer.initFuse();
            this.uiRenderer.showToast('Product deleted successfully!');
        }
    }
}

// ============================================
// 5. CHECKOUT CONTROLLER (WhatsApp Integration)
// ============================================
class CheckoutController {
    constructor(cartService) {
        this.cartService = cartService;
    }

    openCheckout() {
        if (this.cartService.getCartCount() === 0) {
            this.cartService.showToast('Your cart is empty!');
            return;
        }
        
        const summary = document.getElementById('checkoutSummary');
        const cartItems = this.cartService.getCartItems();
        
        summary.innerHTML = `
            <h4>Order Summary</h4>
            ${cartItems.map(item => `<p>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>`).join('')}
            <strong>Total: $${this.cartService.getCartTotal().toFixed(2)}</strong>
        `;
        
        document.getElementById('checkoutModal').classList.add('active');
    }

    closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('active');
        document.getElementById('checkoutForm').reset();
    }

    sendWhatsAppOrder(event) {
        event.preventDefault();
        
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const address = document.getElementById('deliveryAddress').value.trim();
        
        if (!name || !phone || !address) {
            this.cartService.showToast('Please fill all fields');
            return;
        }
        
        const cartItems = this.cartService.getCartItems();
        if (cartItems.length === 0) {
            this.cartService.showToast('Your cart is empty!');
            return;
        }
        
        // Format order message
        const itemsList = cartItems.map(item => 
            `${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
        ).join('%0A');
        
        const total = this.cartService.getCartTotal().toFixed(2);
        const message = `🛍️ *NEW ORDER - PEODAGER*%0A%0A` +
                       `👤 *Customer:* ${name}%0A` +
                       `📞 *Phone:* ${phone}%0A` +
                       `🏠 *Address:* ${address}%0A%0A` +
                       `📦 *Items:*%0A${itemsList}%0A%0A` +
                       `💰 *Total:* $${total}%0A%0A` +
                       `🙏 Thank you for shopping with Peodager!`;
        
        // Clean phone number
        let phoneNum = phone.replace(/\D/g, '');
        if (!phoneNum.startsWith('234')) phoneNum = '234' + phoneNum;
        
        // Open WhatsApp
        window.open(`https://wa.me/${phoneNum}?text=${message}`, '_blank');
        
        // Clear cart after order
        this.cartService.clearCart();
        this.closeCheckout();
        this.cartService.showToast('Order sent! Cart has been cleared.');
    }
}

// ============================================
// 6. NAVIGATION CONTROLLER
// ============================================
class NavigationController {
    constructor() {
        this.pages = ['shop', 'admin'];
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${pageId}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.page === pageId) {
                btn.style.color = '#4f46e5';
                btn.style.fontWeight = '600';
            } else {
                btn.style.color = '';
                btn.style.fontWeight = '';
            }
        });
    }
}

// ============================================
// 7. INITIALIZATION & GLOBAL EXPORTS
// ============================================
// Initialize services
const productService = new ProductService();
const cartService = new CartService();
const uiRenderer = new UIRenderer(productService, cartService);
const adminController = new AdminController(productService, uiRenderer);
const checkoutController = new CheckoutController(cartService);
const navigationController = new NavigationController();

// Make services globally accessible for inline event handlers
window.productService = productService;
window.cartService = cartService;
window.uiRenderer = uiRenderer;
window.adminController = adminController;
window.checkoutController = checkoutController;
window.navigationController = navigationController;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Render initial views
    uiRenderer.renderProductGrid();
    uiRenderer.renderAdminProducts();
    uiRenderer.renderMockOrders();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show shop page by default
    navigationController.showPage('shop');
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigationController.showPage(btn.dataset.page);
        });
    });
    
    // Cart sidebar
    const cartIcon = document.getElementById('cartIconBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
        });
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            checkoutController.openCheckout();
        });
    }
    
    // Admin buttons
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            adminController.openProductModal(false);
        });
    }
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => adminController.saveProduct(e));
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => checkoutController.sendWhatsAppOrder(e));
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .product-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('productModal')?.classList.remove('active');
            document.getElementById('checkoutModal')?.classList.remove('active');
        });
    });
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Search and filters (if elements exist on shop page)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                uiRenderer.currentFilters.search = e.target.value;
                uiRenderer.renderProductGrid();
            }, 300);
        });
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            uiRenderer.currentFilters.category = e.target.value;
            uiRenderer.renderProductGrid();
        });
    }
    
    const minPrice = document.getElementById('minPrice');
    if (minPrice) {
        minPrice.addEventListener('input', (e) => {
            uiRenderer.currentFilters.minPrice = e.target.value;
            uiRenderer.renderProductGrid();
        });
    }
    
    const maxPrice = document.getElementById('maxPrice');
    if (maxPrice) {
        maxPrice.addEventListener('input', (e) => {
            uiRenderer.currentFilters.maxPrice = e.target.value;
            uiRenderer.renderProductGrid();
        });
    }
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', (e) => {
            uiRenderer.currentFilters.sort = e.target.value;
            uiRenderer.renderProductGrid();
        });
    }
    
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            uiRenderer.currentFilters = {
                search: '',
                category: 'all',
                minPrice: '',
                maxPrice: '',
                sort: 'default'
            };
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = 'all';
            if (minPrice) minPrice.value = '';
            if (maxPrice) maxPrice.value = '';
            if (sortBy) sortBy.value = 'default';
            uiRenderer.renderProductGrid();
        });
    }
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
        85% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    
    .cart-item-quantity {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 8px;
    }
    
    .qty-btn, .remove-btn {
        background: #f3f4f6;
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
    }
    
    .qty-btn:hover {
        background: #e5e7eb;
    }
    
    .remove-btn {
        background: #fee2e2;
    }
    
    .remove-btn:hover {
        background: #fecaca;
    }
`;
document.head.appendChild(style);