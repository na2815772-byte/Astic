let products = [
    { name: "টি-শার্ট", price: 400, oldPrice: "৫০০ টাকা", category: "tshirt" },
    { name: "ঘড়ি", price: 1500, oldPrice: "", category: "accessory" }
];

let cart = [];

function renderProducts(filter = "") {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    products.forEach(p => {
        if (p.name.includes(filter) || filter === "") {
            const card = document.createElement('div');
            card.className = `product-card ${p.category}`;
            card.innerHTML = `
                <h3>${p.name}</h3>
                <p>${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ''} <span class="price">${p.price} টাকা</span></p>
                <button class="order-btn" onclick="addToCart('${p.name}', ${p.price})">অর্ডার করুন</button>
            `;
            grid.appendChild(card);
        }
    });
}

function addToCart(name, price) {
    cart.push({ name, price });
    alert(name + " কার্টে যোগ করা হয়েছে!");
}

function displayCart() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;
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
    const totalContainer = document.getElementById('totalPrice');
    if (totalContainer) {
        totalContainer.innerText = total + " টাকা";
    }
}

function checkout() {
    if (cart.length === 0) {
        alert("আপনার কার্ট খালি!");
        return;
    }
    alert("আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! মোট বিল: " + document.getElementById('totalPrice').innerText);
    cart = [];
    displayCart();
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(e.target.value);
        });
    }
});
