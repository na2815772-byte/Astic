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

let products = [
    { name: "টি-শার্ট", price: 400, oldPrice: "৫০০ টাকা", category: "tshirt", date: currentDate, image: "" }, // এটি আজকের প্রোডাক্ট
    { name: "ঘড়ি", price: 1500, oldPrice: "", category: "watch", date: "2026-06-25", image: "" } // এটি আগের দিনের (পুরাতন)
];

let cart = [];
let isAdminLoggedIn = true; // ফেইক অ্যাডমিন লগইন চেক

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
    
    productsToShow.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = `product-card ${p.category}`;
        card.style.position = 'relative'; 
        
        // ছবি থাকলে তা দেখানোর লজিক
        const productImage = p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%; max-height:200px; object-fit:cover; border-radius:5px;">` : '';
        
        card.innerHTML = `
            ${productImage}
            <h3>${p.name}</h3>
            <p>
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ''}
                <span class="price">${p.price} টাকা</span>
            </p>
            <button class="order-btn" onclick="addToCart('${p.name}', ${p.price})">কার্টে যোগ করুন</button>
            
            <button class="delete-btn" id="delete-${index}" style="display: none; position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; padding: 2px 6px; cursor: pointer; border-radius: 3px; font-size: 12px;" onclick="deleteProduct(${index})">ডিলিট করুন</button>
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
// অন্য ডিভাইস থেকে ছবি দেখতে চাইলে প্রথমে Supabase ড্যাশবোর্ডে গিয়ে 'products' নামে একটি পাবলিক Storage Bucket তৈরি করে নিতে হবে।
async function uploadProductImage(file) {
    if (!file) return null;
    
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
        .from('products') // আপনার তৈরি করা বাকেটের নাম
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

// অ্যাডমিন প্যানেল থেকে নতুন প্রোডাক্ট আপলোড করার ফাংশন (ছবিসহ)
async function adminUploadProduct(name, price, oldPrice, category, imageFile) {
    let imageUrl = "";
    if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
    }

    const newProduct = {
        name: name,
        price: price,
        oldPrice: oldPrice,
        category: category,
        date: getFormattedDate(),
        image: imageUrl // ডাটাবেজ বা লোকাল লিস্টে ছবির ইউআরএল সেভ হবে
    };

    products.push(newProduct);
    renderProducts();
}

// প্রোডাক্ট ডিলিট করার ফাংশন
function deleteProduct(index) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?")) {
        products.splice(index, 1); 
        renderProducts(); 
    }
}

// কার্ট ফাংশনসমূহ
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
                আপনার কোন প্রোডাক্ট নেই অথবা আজকে কোন প্রোডাক্ট আপলোড হয়নি।
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

// অ্যাপ রান করার জন্য প্রথম কল
showTodayProducts();
