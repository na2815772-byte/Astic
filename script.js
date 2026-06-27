// ১. আপনার প্রোডাক্ট লিস্ট (এখানে 'date' প্রোপার্টি যুক্ত করা হয়েছে YYYY-MM-DD ফরম্যাটে)
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
    { name: "টি-শার্ট", price: 400, oldPrice: "৫০০ টাকা", category: "tshirt", date: currentDate }, // এটি আজকের প্রোডাক্ট
    { name: "ঘড়ি", price: 1500, oldPrice: "", category: "watch", date: "2026-06-25" } // এটি আগের দিনের (পুরাতন)
];

let cart = [];

// ফেইক অ্যাডমিন লগইন চেক
let isAdminLoggedIn = true; 

// ২. প্রোডাক্ট রেন্ডার করার মেইন ফাংশน
function renderProducts(productsToShow = products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // লজিক: যদি কোনো প্রোডাক্ট না থাকে তবে সুন্দর করে মেসেজ দেখাবে
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
        
        card.innerHTML = `
            <h3>${p.name}</h3>
            <p>
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ''}
                <span class="price">${p.price} টাকা</span>
            </p>
            <button class="order-btn" onclick="addToCart('${p.name}', ${p.price})">কার্টে যোগ করুন</button>
            
            <button class="delete-btn" id="delete-${index}" style="display: none; position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; padding: 2px 6px; cursor: pointer; border-radius: 3px; font-size: 12px;" onclick="deleteProduct(${index})">ডিলিট করুন</button>
        `;
        
        // ৩. শুধুমাত্র অ্যাডমিন লগইন থাকলে লং প্রেস লজিক
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

// ================= মেইন লজিক: আজকের নতুন প্রোডাক্ট ফিল্টার করার ফাংশন =================
function showTodayProducts() {
    const formattedToday = getFormattedDate(); 
    
    // লজিক: শুধু সেই প্রোডাক্টগুলো ফিল্টার হবে যেগুলোর তারিখ আজকের তারিখের সমান
    const todayProducts = products.filter(product => product.date === formattedToday);
    
    // স্ক্রিনে শুধু আজকের প্রোডাক্টগুলো দেখাবে
    renderProducts(todayProducts);
}

// সমস্ত প্রোডাক্ট একসাথে দেখার জন্য ফাংশন
function showAllProducts() {
    renderProducts(products);
}

// অ্যাডমিন প্যানেল থেকে নতুন প্রোডাক্ট আপলোড করার কাল্পনিক ফাংশন (লজিক সুরক্ষার জন্য)
function adminUploadProduct(name, price, oldPrice, category) {
    const newProduct = {
        name: name,
        price: price,
        oldPrice: oldPrice,
        category: category,
        date: getFormattedDate() // আপলোড করার সাথে সাথে আজকের ডেট অটোমেটিক বসে যাবে
    };
    products.push(newProduct);
    renderProducts();
}
// ============================================================================

// ৪. প্রোডাক্ট ডিলিট করার ফাংশন
function deleteProduct(index) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?")) {
        products.splice(index, 1); 
        renderProducts(); 
    }
}

// ৫. কার্ট ফাংশনসমূহ
function addToCart(name, price) {
    cart.push({ name, price });
    alert(name + " কার্টে যোগ করা হয়েছে!");
    displayCart(); 
}

function displayCart() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('totalPrice');
    
    // যদি কার্ট পেজে সরাসরি আজকের আপলোড করা প্রোডাক্টের ডাটা দেখাতে চান:
    if (!cartContainer || !totalContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;

    // কার্ট পেজেও শুধু আজকের দিনের যুক্ত করা প্রোডাক্ট ভ্যালিডেশন লজিক
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

// ৬. চেকআউট ফাংশন
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
// লজিক: গ্রাহক যখনই পেজে আসবে, সে শুরুতেই শুধু আজকের আপলোড করা প্রোডাক্টগুলো দেখতে পাবে।
showTodayProducts();
