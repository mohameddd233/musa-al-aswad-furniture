// common.js - الملف الرئيسي للوظائف المشتركة

// ========== إدارة المنتجات ==========
function getProducts() {
    const p = localStorage.getItem('musa_products');
    if (!p) {
        const defaultProducts = [
            { id: 1, title: 'كنبة مودرن', price: 3200, desc: 'كنبة مودرن مريحة بتصميم أنيق', img: 'images/sofa1.jpg', qty: 5 },
            { id: 2, title: 'ستائر فاخرة', price: 850, desc: 'ستائر مخملية عازلة للضوء', img: 'images/curtain1.jpg', qty: 8 },
            { id: 3, title: 'كرسي خشبي', price: 650, desc: 'كرسي خشبي متين يناسب غرفة الطعام', img: 'images/chair1.jpg', qty: 12 }
        ];
        localStorage.setItem('musa_products', JSON.stringify(defaultProducts));
        return defaultProducts;
    }
    return JSON.parse(p);
}

function saveProducts(products) {
    localStorage.setItem('musa_products', JSON.stringify(products));
}

// ========== إدارة السلة ==========
function getCart() {
    return JSON.parse(localStorage.getItem('musa_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('musa_cart', JSON.stringify(cart));
}

// تحديث عداد السلة
function updateCartCount() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalQty);
}

// إضافة منتج إلى السلة
function addToCart(productId, qty = 1) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.qty < qty) {
        showNotification(`عذراً، الكمية المتبقية هي ${product.qty} فقط.`, 'error');
        return;
    }

    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        if (existing.qty + qty > product.qty) {
            showNotification(`لا يمكن إضافة هذه الكمية. المتاح ${product.qty} و لديك ${existing.qty} في السلة.`, 'error');
            return;
        }
        existing.qty += qty;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            qty: qty,
            img: product.img
        });
    }
    
    saveCart(cart);
    updateCartCount();
    showNotification('✅ تمت الإضافة إلى السلة', 'success');
}

// إزالة منتج من السلة
function removeFromCart(productId) {
    let cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    showNotification('🗑️ تم حذف المنتج من السلة', 'info');
}

// تحديث كمية منتج في السلة
function updateCartItemQuantity(productId, newQty) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    if (newQty < 1) {
        removeFromCart(productId);
        return true;
    }

    if (newQty > product.qty) {
        showNotification(`الكمية المتاحة هي ${product.qty} فقط`, 'error');
        return false;
    }

    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty = newQty;
        saveCart(cart);
        updateCartCount();
        return true;
    }
    return false;
}

// ========== نظام الإشعارات ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3',
        warning: '#ff9800'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        direction: rtl;
        font-family: 'Cairo', sans-serif;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// إضافة أنماط للرسوم المتحركة
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// ========== تحميل الهيدر ==========
function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        // هيدر الموقع بالعربية
        headerPlaceholder.innerHTML = `
            <header>
                <div class="header-inner container">
                    <div class="logo">
                        <a href="index.html">
                            <img src="images/logo.jpg" alt="موسى الأسود للأثاث" style="height: 70px;">
                        </a>
                    </div>
                    <nav>
                        <ul>
                            <li><a href="index.html" class="${window.location.pathname.endsWith('index.html') || window.location.pathname === '/' ? 'active' : ''}">الرئيسية</a></li>
                            <li><a href="products.html" class="${window.location.pathname.includes('products') ? 'active' : ''}">المتجر</a></li>
                            <li><a href="gallery.html" class="${window.location.pathname.includes('gallery') ? 'active' : ''}">معرض الصور</a></li>
                            <li><a href="about.html" class="${window.location.pathname.includes('about') ? 'active' : ''}">من نحن</a></li>
                            <li><a href="contact.html" class="${window.location.pathname.includes('contact') ? 'active' : ''}">اتصل بنا</a></li>
                            <li><a href="cart.html" class="${window.location.pathname.includes('cart') ? 'active' : ''}">
                                🛒 السلة (<span class="cart-count">0</span>)
                            </a></li>
                            <li><a href="admin.html" class="${window.location.pathname.includes('admin') ? 'active' : ''}">الإدارة</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
        `;
        updateCartCount();
    }
}

// ========== تهيئة الصفحة ==========
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    updateCartCount();
});