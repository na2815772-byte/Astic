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
    
    if (productsToShow.length === 0) {
        grid.innerHTML = `
            <div style="text-align:center; width:100%; color:#e74c3c; font-weight:bold; padding: 20px;">
                আপনার কোন প্রোডাক্ট নেই অথবা আজকে কোন প্রোডাক্ট আপলোড হয়নি।
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
