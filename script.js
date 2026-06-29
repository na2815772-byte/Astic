// ================= Supabase ইনিশিয়েলাইজেশন =================
const SUPABASE_URL = "https://mbxkickfugdkgsabizrr.supabase.co";
const SUPABASE_KEY = "sb_publishable_ButTVVb8ZxL7QeaL919qJg_gZ2HDjfb";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= প্রোডাক্ট ও কার্ট লজিক =================

// জাভাস্ক্রিপ্ট দিয়ে আজকের বর্তমান তারিখ স্বয়ংক্রিয়ভাবে বের করার ফাংশন
function getFormattedDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const currentDate = getFormattedDate(); // আজকের রিয়েল তারিখ

let products = []; 
let cart = [];
let isAdminLoggedIn = true; // অ্যাডমিন লগইন চেক

// Supabase থেকে সব প্রোডাক্ট নিয়ে আসার ফাংশন
async function fetchProducts(filterToday = true) {
    try {
        let { data, error } = await supabase
            .from('products') 
            .select('*');

        if (error) throw error;

        products = data || [];

        if (filterToday) {
            showTodayProducts();
        } else {
            showAllProducts();
        }
    } catch (error) {
        console.error("প্রোডাক্ট লোড করতে সমস্যা হয়েছে:", error.message);
        renderProducts([]);
    }
}

// প্রোডাক্ট রেন্ডার করার মেইন ফাংশন
function renderProducts(productsToShow = products, isTodayFilter = false) {
    const grid = document.getElementById('productGrid') || document.getElementById('myProductList');
    if (!grid) return;
    grid.innerHTML = '';
    
    // ================= 🌟 আপনার কথামতো চলমান ভিজ্যুয়াল ইফেক্ট ও ওয়ার্নিং লজিক 🌟 =================
    if (productsToShow.length === 0) {
        if (!document.getElementById('premium-animated-styles')) {
            const style = document.createElement('style');
            style.id = 'premium-animated-styles';
            style.innerHTML = `
                /* কার্ড ও গ্লো অ্যানিমেশন */
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 8px 32px 0 rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.2); }
                    50% { box-shadow: 0 8px 32px 0 rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 0.6); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                /* 🎯 টেক্সটের ভেতর দিয়ে আলোর রেখা এপার-ওপার যাওয়ার চলমান ইফেক্ট */
                @keyframes textShimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .shimmer-animated-text {
                    text-transform: uppercase;
                    font-family: 'Poppins', sans-serif;
                    font-size: 22px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                    
                    /* চলমান আলোর কালার সেটআপ */
                    background: linear-gradient(to right, #ef4444 20%, #fca5a5 40%, #ffffff 50%, #fca5a5 60%, #ef4444 80%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: textShimmer 3s linear infinite;
                }
                .warning-badge {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    margin-bottom: 15px;
                    display: inline-block;
                }
            `;
            document.head.appendChild(style);
        }

        // আজকের দিনে কোনো প্রোডাক্ট না থাকলে এই চলমান প্রিমিয়াম নোটিফিকেশনটি শো করবে
        grid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                width: 100%; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                padding: 50px 0;
            ">
                <div style="
                    background: rgba(17, 24, 39, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 480px;
                    width: 100%;
                    text-align: center;
                    animation: fadeInUp 0.5s ease-out forwards, pulseGlow 3s infinite ease-in-out;
                ">
                    <div class="warning-badge">⚠️ NOTICE</div>
                    
                    <div class="shimmer-animated-text">NO PRODUCTS UPLOADED TODAY</div>
                    
                    <p style="color: #9ca3af; font-size: 14px; margin: 0; font-family: sans-serif;">
                        আজকের জন্য কোনো প্রোডাক্ট আপলোড করা হয়নি। দয়া করে পরে আবার চেষ্টা করুন।
                    </p>
                </div>
            </div>`;
        return;
    }
    
    // 📦 প্রোডাক্ট থাকলে ছবিসহ সুন্দর গ্রিড লেআউট তৈরি হবে
    productsToShow.forEach((p) => {
        const card = document.createElement('div');
        card.className = `product-card ${p.category || ''}`;
        card.style.position = 'relative'; 
        
        // 📷 প্রোডাক্টের ইমেজ/ছবি দেখানোর পারফেক্ট লজিক
        const productImage = p.image ? `<img src="${p.image}" alt="${p.name}">` : `<div style="width:100%; height:180px; background:#374151; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#9ca3af; margin-bottom:12px;">No Image Available</div>`;
        
        card.innerHTML = `
            ${productImage}
            <h3>${p.name}</h3>
            <p style="margin-top: 5px;">
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice} টাকা</span>` : ''}
                <span class="price">${p.price} টাকা</span>
            </p>
            <button class="order-btn" onclick="addToCart('${p.name}', ${p.price})">Add to Cart</button>
            <button class="delete-btn" id="delete-${p.id}" style="display: none; position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; padding: 4px 10px; cursor: pointer; border-radius: 5px; font-size: 12px; font-weight:600;" onclick="deleteProduct(${p.id})">Delete</button>
        `;
        
        if (isAdminLoggedIn) {
            let pressTimer;
            const startPress = () => {
                pressTimer = window.setTimeout(() => {
                    const deleteBtn = card.querySelector('.delete-btn');
                    if (deleteBtn) deleteBtn.style.display = 'block';
                }, 1000); 
            };
            const cancelPress = () => clearTimeout(pressTimer);

            card.addEventListener('mousedown', startPress);
            card.addEventListener('mouseup', cancelPress);
            card.addEventListener('mouseleave', cancelPress);
            card.addEventListener('touchstart', startPress);
            card.addEventListener('touchend', cancelPress);
            card.addEventListener('touchcancel', cancelPress);
        }

        grid.appendChild(card);
    });
}

// আজকের নতুন প্রোডাক্ট ফিল্টার করার ফাংশন
function showTodayProducts() {
    const formattedToday = getFormattedDate(); 
    const todayProducts = products.filter(product => {
        const productDate = product.date ? product.date.substring(0, 10) : "";
        return productDate === formattedToday;
    });
    renderProducts(todayProducts, true);
}

// সমস্ত প্রোডাক্ট একসাথে দেখার জন্য ফাংশন
function showAllProducts() {
    renderProducts(products, false);
}

// ================= Supabase ছবি আপলোড লজিক =================
async function uploadProductImage(file) {
    if (!file) return null;
    
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

    if (error) {
        console.error("ছবি আপলোড করতে সমস্যা হয়েছে:", error.message);
        return null;
    }

    const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

// নতুন প্রোডাক্ট আপলোড ফাংশন
async function adminUploadProduct(name, price, oldPrice, category, imageFile) {
    let imageUrl = "";
    if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
    }

    const newProduct = {
        name: name,
        price: Number(price),
        oldPrice: oldPrice ? String(oldPrice) : null,
        category: category,
        date: getFormattedDate(),
        image: imageUrl
    };

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([newProduct]);

        if (error) throw error;

        alert("প্রোডাক্ট সফলভাবে আপলোড হয়েছে!");
        fetchProducts(true);
    } catch (error) {
        console.error("প্রোডাক্ট ডাটাবেজে সেভ করতে সমস্যা হয়েছে:", error.message);
        alert("প্রোডাক্ট আপলোড ব্যর্থ হয়েছে।");
    }
}

// প্রোডাক্ট ডিলিট করার ফাংশন
async function deleteProduct(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?")) {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert("প্রোডাক্টটি ডিলিট করা হয়েছে।");
            fetchProducts(true);
        } catch (error) {
            console.error("প্রোডাক্ট ডিলিট করতে সমস্যা হয়েছে:", error.message);
        }
    }
}

// ================= কার্ট ফাংশনসমূহ =================
function addToCart(name, price) {
    cart.push({ name, price });
    alert(name + " কার্টে যোগ করা হয়েছে!");
    displayCart(); 
}

function displayCart() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('totalPrice');
    
    if (!cartContainer || !totalContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = `<p style="color: red; text-align: center; font-weight: bold;">আপনার কার্ট খালি।</p>`;
        totalContainer.innerText = "০ টাকা";
        return;
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">${item.price} টাকা</span>
        `;
        cartContainer.appendChild(itemElement);
        total += item.price;
    });

    totalContainer.innerText = total + " টাকা";
}

// চেকআউট ফাংশন
function checkout() {
    if (cart.length === 0) {
        alert("আপনার কার্ট খালি! দয়া করে প্রথমে প্রোডাক্ট কার্টে যোগ করুন।");
        return;
    }
    
    const totalBill = document.getElementById('totalPrice') ? document.getElementById('totalPrice').innerText : "0 টাকা";
    localStorage.setItem('orderTotal', totalBill);
    
    window.location.href = "checkout.html";
}

// অ্যাপ চালুর মেইন মেথড
fetchProducts(true);
