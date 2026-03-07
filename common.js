const BIN_ID = '69ab3db043b1c97be9bb4b6e';
const API_KEY = 'PUT_YOUR_API_KEY_HERE';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ================= نظام التحميل =================
function showLoading() {
    document.body.style.cursor = "wait";
}

function hideLoading() {
    document.body.style.cursor = "default";
}

// ================= جلب المنتجات =================
async function getProducts() {

    const cache = localStorage.getItem('musa_products');

    if (cache) {
        return JSON.parse(cache);
    }

    try {

        showLoading();

        const response = await fetch(API_URL, {
            headers: {
                'X-Master-Key': API_KEY,
                'X-Bin-Meta': false
            }
        });

        if (!response.ok) {
            throw new Error('فشل في جلب المنتجات');
        }

        const data = await response.json();
        const products = data.record || [];

        localStorage.setItem('musa_products', JSON.stringify(products));

        return products;

    } catch (error) {

        console.error('خطأ:', error);

        const localData = localStorage.getItem('musa_products');

        if (localData) {
            showNotification('⚠️ تم استخدام البيانات المحلية', 'warning');
            return JSON.parse(localData);
        }

        const defaultProducts = [
            {
                id: 1,
                title: 'كنبة مودرن',
                price: 3200,
                desc: 'كنبة مودرن بتصميم أنيق',
                img: 'images/sofa1.jpg',
                qty: 5
            },
            {
                id: 2,
                title: 'ستائر فاخرة',
                price: 850,
                desc: 'ستائر مخملية عازلة للضوء',
                img: 'images/curtain1.jpg',
                qty: 8
            },
            {
                id: 3,
                title: 'كرسي خشبي',
                price: 650,
                desc: 'كرسي خشبي متين',
                img: 'images/chair1.jpg',
                qty: 12
            }
        ];

        localStorage.setItem('musa_products', JSON.stringify(defaultProducts));

        return defaultProducts;

    } finally {

        hideLoading();

    }
}

// ================= حفظ المنتجات =================
async function saveProducts(products) {

    try {

        localStorage.setItem('musa_products', JSON.stringify(products));

        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(products)
        });

        if (!response.ok) {
            throw new Error('فشل الحفظ');
        }

        return true;

    } catch (error) {

        console.error(error);

        showNotification('⚠️ تم الحفظ محلياً فقط', 'warning');

        return false;
    }
}

// ================= إدارة السلة =================
function getCart() {

    return JSON.parse(localStorage.getItem('musa_cart') || '[]');

}

function saveCart(cart) {

    localStorage.setItem('musa_cart', JSON.stringify(cart));
    updateCartCount();

}

// ================= تحديث عداد السلة =================
function updateCartCount() {

    const cart = getCart();

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    document.querySelectorAll('.cart-count').forEach(el => {

        el.textContent = totalQty;

    });

}

// ================= إضافة للسلة =================
async function addToCart(productId, qty = 1) {

    const products = await getProducts();

    const product = products.find(p => p.id === productId);

    if (!product) return;

    if (product.qty < qty) {

        showNotification(`الكمية المتبقية ${product.qty} فقط`, 'error');

        return;

    }

    const cart = getCart();

    const existing = cart.find(i => i.id === productId);

    if (existing) {

        if (existing.qty + qty > product.qty) {

            showNotification(`المتاح ${product.qty}`, 'error');

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

    showNotification('✅ تمت الإضافة للسلة', 'success');

}

// ================= حذف من السلة =================
function removeFromCart(productId) {

    let cart = getCart().filter(item => item.id !== productId);

    saveCart(cart);

    showNotification('🗑️ تم حذف المنتج', 'info');

}

// ================= تحديث الكمية =================
async function updateCartItemQuantity(productId, newQty) {

    const products = await getProducts();

    const product = products.find(p => p.id === productId);

    if (!product) return false;

    if (newQty < 1) {

        removeFromCart(productId);

        return true;

    }

    if (newQty > product.qty) {

        showNotification(`المتاح ${product.qty}`, 'error');

        return false;

    }

    let cart = getCart();

    const item = cart.find(i => i.id === productId);

    if (item) {

        item.qty = newQty;

        saveCart(cart);

        return true;

    }

    return false;

}

// ================= الإشعارات =================
function showNotification(message, type = 'info') {

    const notification = document.createElement('div');

    const colors = {

        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3',
        warning: '#ff9800'

    };

    notification.innerText = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background:${colors[type]};
        color:white;
        padding:15px 25px;
        border-radius:50px;
        z-index:9999;
        font-weight:bold;
        box-shadow:0 4px 15px rgba(0,0,0,0.2);
        direction:rtl;
        font-family:Cairo;
        animation:slideDown .3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.style.animation = "fadeOut .3s ease";

        setTimeout(() => notification.remove(), 300);

    }, 2500);

}

// ================= الأنيميشن =================
const style = document.createElement('style');

style.textContent = `

@keyframes slideDown{
from{transform:translate(-50%,-100%);opacity:0}
to{transform:translate(-50%,0);opacity:1}
}

@keyframes fadeOut{
from{opacity:1}
to{opacity:0}
}

`;

document.head.appendChild(style);

// ================= تحميل الهيدر =================
function loadHeader() {

    const header = document.getElementById('header-placeholder');

    if (!header) return;

    header.innerHTML = `
<header>

<div class="header-inner container">

<div class="logo">

<a href="index.html">

<img src="images/logo.jpg" style="height:70px">

</a>

</div>

<nav>

<ul>

<li><a href="index.html">الرئيسية</a></li>

<li><a href="products.html">المتجر</a></li>

<li><a href="about.html">من نحن</a></li>

<li><a href="contact.html">اتصل بنا</a></li>

<li><a href="gallery.html">المعرض</a></li>

<li>
<a href="cart.html">

🛒 السلة (<span class="cart-count">0</span>)

</a>
</li>

</ul>

</nav>

</div>

</header>
`;

updateCartCount();

}

// ================= تشغيل الصفحة =================
document.addEventListener("DOMContentLoaded", () => {

loadHeader();

updateCartCount();

});
