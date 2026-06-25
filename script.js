// ১. আপনার আগের প্রোডাক্ট লিস্ট
let products = [
    { name: "টি-শার্ট", price: 400, oldPrice: "৫০০ টাকা", category: "tshirt" },
    { name: "ঘড়ি", price: 1500, oldPrice: "", category: "watch" }
];

let cart = [];

// ফেইক অ্যাডমিন লগইন চেক (পরীক্ষা করার জন্য এটিকে true করে দেখতে পারেন)
// আপনার আসল লগইন লজিক যদি localStorage ব্যবহার করে, তবে নিচে সেটি বসিয়ে দেবেন।
let isAdminLoggedIn = true; 

// ২. প্রোডাক্ট রেন্ডার করার মেইন ফাংশন
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    products.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = `product-card ${p.category}`;
        card.style.position = 'relative'; // ডিলিট বাটনটি কর্নারে পজিশন করার জন্য
        
        card.innerHTML = `
            <h3>${p.name}</h3>
            <p>
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ''}
                <span class="price">${p.price} টাকা</span>
            </p>
            <button class="order-btn" onclick="addToCart('${p.name}', ${p.price})">কার্টে যোগ করুন</button>
            
            <button class="delete-btn" id="delete-${index}" style="display: none; position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; padding: 2px 6px; cursor: pointer; border-radius: 3px; font-size: 12px;" onclick="deleteProduct(${index})">ডিলিট করুন</button>
        `;
        
        // ৩. শুধুমাত্র অ্যাডমিন লগইন থাকলে লং প্রেস (Click & Hold) লজিক কাজ করবে
        if (isAdminLoggedIn) {
            let pressTimer;

            // মাউস বা টাচ চেপে ধরলে টাইমার শুরু হবে (১ সেকেন্ড বা ১০০০ মিলিসেকেন্ড)
            const startPress = () => {
                pressTimer = window.setTimeout(() => {
                    // ১ সেকেন্ড পার হলে ডিলিট বাটনটি দৃশ্যমান হবে
                    const deleteBtn = card.querySelector('.delete-btn');
                    if (deleteBtn) deleteBtn.style.display = 'block';
                }, 1000); 
            };

            // মাউস বা টাচ ছেড়ে দিলে বা সরিয়ে নিলে টাইমার বন্ধ হয়ে যাবে
            const cancelPress = () => {
                clearTimeout(pressTimer);
            };

            // কম্পিউটার মাউসের জন্য ইভেন্ট
            card.addEventListener('mousedown', startPress);
            card.addEventListener('mouseup', cancelPress);
            card.addEventListener('mouseleave', cancelPress);

            // মোবাইল বা টাচ স্ক্রিনের জন্য ইভেন্ট
            card.addEventListener('touchstart', startPress);
            card.addEventListener('touchend', cancelPress);
            card.addEventListener('touchcancel', cancelPress);
        }

        grid.appendChild(card);
    });
}

// ৪. প্রোডাক্ট ডিলিট করার ফাংশন
function deleteProduct(index) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?")) {
        products.splice(index, 1); // অ্যারে থেকে প্রোডাক্টটি বাদ দেওয়া হলো
        renderProducts(); // স্ক্রিনটি নতুন করে আপডেট করা হলো
    }
}

// ৫. কার্ট এবং অন্যান্য আগের ফাংশনসমূহ (অপরিবর্তিত)
function addToCart(name, price) {
    cart.push({ name, price });
    alert(name + " কার্টে যোগ করা হয়েছে!");
}

function displayCart() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('totalPrice');
    if (!cartContainer || !totalContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;

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

function checkout() {
    if (cart.length === 0) {
        alert("আপনার কার্ট খালি!");
        return;
    }
    alert("আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! মোট বিল: " + document.getElementById('totalPrice').innerText);
    cart = [];
    displayCart();
}

// অ্যাপ রান করার জন্য প্রথম কল
renderProducts();
