let products = [
    { name: "টি-শার্ট", price: "৪০০ টাকা", oldPrice: "৫০০ টাকা", category: "tshirt" },
    { name: "ঘড়ি", price: "১৫০০ টাকা", oldPrice: "", category: "watch" }
];

function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = `product-card ${p.category}`;
        card.innerHTML = `
            <h3>${p.name}</h3>
            <p>
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ''}
                <span class="price">${p.price}</span>
            </p>
            <button class="order-btn">অর্ডার করুন</button>
        `;
        grid.appendChild(card);
    });
}

function addProduct() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const oldPrice = document.getElementById('pOldPrice').value;
    const category = document.getElementById('pCategory').value;
    
    if (name && price) {
        products.push({ name, price: price + " টাকা", oldPrice: oldPrice ? oldPrice + " টাকা" : "", category });
        renderProducts();
    }
}

function filterCategory(category) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function showSection(section) {
    alert(section + " সেকশনটি পরবর্তীতে কার্যকর করা হবে।");
}

renderProducts();
