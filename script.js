// ================= Supabase ইনিশিয়েলাইজেশন =================
const SUPABASE_URL = "https://mbxkickfugdkgsabizrr.supabase.co";
const SUPABASE_KEY = "sb_publishable_ButTVVb8ZxL7QeaL919qJg_gZ2HDjfb";

// CDN ব্যবহার করে ইনডেক্স ফাইলে Supabase লোড করা থাকলে এটি কাজ করবে
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

const currentDate = getFormattedDate(); // আজকের রিয়েল তারিখ ডাইনামিকালি নেবে

let products = []; // এখন প্রোডাক্টগুলো ডাটাবেজ থেকে এসে এখানে জমা হবে
let cart = [];
let isAdminLoggedIn = true; // ফেইক অ্যাডমিন লগইন চেক (প্রয়োজন অনুযায়ী false করতে পারেন)

// Supabase থেকে সব প্রোডাক্ট নিয়ে আসার ফাংশন
async function fetchProducts(filterToday = true) {
    try {
        let { data, error } = await supabase
            .from('products') // Supabase-এ টেবিল এর নাম অবশ্যই 'products' হতে হবে
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
        // ডাটাবেজ কানেক্ট না হলে লোকাল ব্ল্যাংক স্ক্রিন দেখাবে
        renderProducts([]);
    }
}

// প্রোডাক্ট রেন্ডার করার মেইন ফাংশন
function renderProducts(productsToShow = products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // ================= প্রিমিয়াম 'No Products' ভিজুয়াল ইফেক্ট লজিক =================
    if (productsToShow.length === 0) {
        // অ্যানিমেশনের জন্য স্টাইল ট্যাগ ডাইনামিকালি যোগ করা
        if (!document.getElementById('premium-error-styles')) {
            const style = document.createElement('style');
            style.id = 'premium-error-styles';
            style.innerHTML = `
                @keyframes pulseGlow {
                    0% { box-shadow: 0 8px 32px 0 rgba(231, 76, 60, 0.2); }
                    50% { box-shadow: 0 8px 32px 0 rgba(231, 76, 60, 0.5); }
                    100% { box-shadow: 0 8px 32px 0 rgba(231, 76, 60, 0.2); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        // প্রিমিয়াম ডিজাইনের মেইন কন্টেইনার
        grid.innerHTML = `
            <div style="
                width: 100%; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                padding: 40px 20px;
                box-sizing: border-box;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(231, 76, 60, 0.3);
                    border-radius: 16px;
                    padding: 40px 30px;
                    max-width: 450px;
                    width: 100%;
                    text-align: center;
                    animation: fadeInUp 0.6s ease-out forwards, pulseGlow 3s infinite ease-in-out;
                    box-sizing: border-box;
                ">
                    <div style="
                        width: 70px;
                        height: 70px;
                        background: rgba(231, 76, 60, 0.1);
                        border: 2px dashed #e74c3c;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin: 0 auto 20px auto;
                    ">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    
                    <h2 style="
                        color: #e74c3c;
                        font-family: 'Poppins', 'Segoe UI', sans-serif;
                        font-size: 22px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        margin: 0 0 10px 0;
                        text-transform: uppercase;
                    ">
                        No Products Uploaded Today
                    </h2>
                    
                    <p style="
                        color: #7f8c8d;
                        font-size: 14px;
                        margin: 0;
                        font-family: sans-serif;
                    ">
                        Please check back later or explore other categories.
                    </p>
                </div>
            </div>`;
        return;
    }
    
    productsToShow.forEach((p) => {
        const card = document.createElement('div');
        card.className = `product-card ${p.category}`;
        card.style.position = 'relative'; 
        
        // ছবি থাকলে তা দেখানোর লজিক
        const productImage = p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%; max-height:200px; object-fit:cover; border-radius:5px;">` : '';
        
        card.innerHTML = `
            ${productImage}
            <h3>${p.name}</h3>
            <p>
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice} টাকা</span>` : ''}
                <span class="price">${p.price} টাকা</span>
            </p>
            <button class="order-btn" onclick="addToCart('${p.name}', ${p.price})">কার্টে যোগ করুন</button>
            
            <button class="delete-btn" id="delete-${p.id}" style="display: none; position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; padding: 2px 6px; cursor: pointer; border-radius: 3px; font-size: 12px;" onclick="deleteProduct(${p.id})">ডিলিট করুন</button>
        `;
        
        // শুধুমাত্র অ্যাডমিন লগইন থাকলে লং প্রেস লজিক
        if (isAdminLoggedIn) {
            let pressTimer;

            const startPress = () => {
                pressTimer = window.setTimeout(() => {
                    const deleteBtn = card.querySelector('.delete-btn');
                    if (deleteBtn) deleteBtn.style.display = 'block';
                }, 1000); 
            };

            const cancelPress = () => {
                clearTimeout(pressTimer);
            };

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
    const todayProducts = products.filter(product => product.date === formattedToday);
    renderProducts(todayProducts);
}

// সমস্ত প্রোডাক্ট একসাথে দেখার জন্য ফাংশন
function showAllProducts() {
    renderProducts(products);
}

// ================= Supabase ছবি আপলোড লজিক =================
async function uploadProductImage(file) {
    if (!file) return null;
    
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
        .from('products') // Supabase Storage Bucket এর নাম 'products'
        .upload(fileName, file);

    if (error) {
        console.error("ছবি আপলোড করতে সমস্যা হয়েছে:", error.message);
        return null;
    }

    // ছবির পাবলিক ইউআরএল তৈরি
    const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

// অ্যাডমিন প্যানেল থেকে নতুন প্রোডাক্ট আপলোড করার ফাংশন (সরাসরি Supabase-এ সেভ হবে)
async function adminUploadProduct(name, price, oldPrice, category, imageFile) {
    let imageUrl = "";
    if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
    }

    const newProduct = {
        name: name,
        price: Number(price), // নাম্বার ফরম্যাটে সেভ করার জন্য
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
        fetchProducts(true); // আপলোড শেষে আবার আজকের প্রোডাক্ট রিফ্রেশ করবে
    } catch (error) {
        console.error("প্রোডাক্ট ডাটাবেজে সেভ করতে সমস্যা হয়েছে:", error.message);
        alert("প্রোডাক্ট আপলোড ব্যর্থ হয়েছে।");
    }
}

// প্রোডাক্ট ডিলিট করার ফাংশন (Supabase থেকে ডিলিট হবে)
async function deleteProduct(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?")) {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert("প্রোডাক্টটি ডিলিট করা হয়েছে।");
            fetchProducts(true); // ডিলিট শেষে ডাটা আপডেট করবে
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
        cartContainer.innerHTML = `
            <p style="color: red; text-align: center; font-weight: bold;">
                আপনার কার্ট খালি।
            </p>`;
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

// অ্যাপ রান করার জন্য প্রথম কল (ডাটাবেজ থেকে ডাটা আনবে)
fetchProducts(true);
