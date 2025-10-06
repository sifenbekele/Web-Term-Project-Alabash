// Product data - Rock Vintage themed
const products = [
    {
      id: 1,
      name: "Vintage Led Zeppelin Tour Tee",
      price: 89.99,
      originalPrice: 120.0,
      category: "vintage-tees",
      image: "../assets/ledzep1280.jpg",
      rating: 4.9,
      reviews: 87,
      description: "Authentic 1977 Led Zeppelin tour t-shirt in excellent condition",
    },
    {
      id: 2,
      name: "Speedster Biker Leather Jacket",
      price: 299.99,
      category: "leather-jackets",
      image: "../assets/sppedster.jpg",
      rating: 4.8,
      reviews: 156,
      description: "Classic 80s leather jacket with authentic patina and character",
    },
    {
      id: 3,
      name: "Vintage Ramones Band Tee",
      price: 75.99,
      originalPrice: 95.0,
      category: "vintage-tees",
      image: "../assets/ramones.jpg",
      rating: 4.7,
      reviews: 203,
      description: "Original Ramones concert tee from CBGB era",
    },
    {
      id: 4,
      name: "Distressed Denim Jacket",
      price: 159.99,
      category: "denim",
      image: "../assets/Urban Edge Jacket.jpg",
      rating: 4.6,
      reviews: 124,
      description: "Perfectly worn vintage denim with authentic distressing",
    },
    {
      id: 5,
      name: "AC/DC Highway to Hell Tee",
      price: 95.99,
      category: "vintage-tees",
      image: "../assets/acdc1.jpg",
      rating: 4.8,
      reviews: 178,
      description: "Rare vintage AC/DC tour merchandise from 1979",
    },
    {
      id: 6,
      name: "Vintage Band Pin Collection",
      price: 45.99,
      category: "accessories",
      image: "../assets/band_pin.jpg",
      rating: 4.5,
      reviews: 92,
      description: "Curated collection of authentic vintage band pins",
    },
    {
      id: 7,
      name: "Pink Floyd Dark Side Tee",
      price: 110.99,
      category: "vintage-tees",
      image: "../assets/pinkfloyd1.jpg",
      rating: 4.9,
      reviews: 234,
      description: "Iconic Pink Floyd Dark Side of the Moon vintage tee",
    },
    {
      id: 8,
      name: "Vintage Studded Belt",
      price: 65.99,
      category: "accessories",
      image: "../assets/studded_belt.jpeg",
      rating: 4.4,
      reviews: 67,
      description: "Authentic punk rock studded leather belt",
    },
    {
      id: 9,
      name: "The Doors Morrison Hotel Tee",
      price: 85.99,
      category: "vintage-tees",
      image: "../assets/morrison.png",
      rating: 4.7,
      reviews: 145,
      description: "Vintage The Doors band tee in pristine condition",
    },
         {
      id: 10,
      name: "Oromo Borena Traditional Full Sleeve Tee",
      price: 254.99,
      category: "habesha-style",
      image: "../assets/orot3.jpg",
      rating: 5.0,
      reviews: 46,
      description: "Traditionaly hand made full sleeve oromo cultural top wear (Borena Zone)",
    },
             {
      id: 10,
      name: "Habesha Kemis",
      price: 119.99,
      category: "habesha-style",
      image: "../assets/habeshad7.jpg",
      rating: 3.9,
      reviews: 46,
      description: "Traditionaly hand made habesha [kemis] (Ethiopian)",
    },
             {
      id: 10,
      name: "Habesha Kemis",
      price: 109.99,
      category: "habesha-style",
      image: "../assets/habeshad8.jpg",
      rating: 4.0,
      reviews: 46,
      description: "Traditionaly hand made habesha [kemis] (Ethiopian)",
    },
             {
      id: 10,
      name: "Oromo Borena Traditional Full Sleeve Tee",
      price: 104.99,
      category: "habesha-style",
      image: "../assets/habeshad9.jpg",
      rating: 5.0,
      reviews: 46,
      description: "Traditionaly hand made habesha [kemis] (Ethiopian)",
    },

 
    {
      id: 11,
      name: "Black Sabbath Paranoid Tee",
      price: 99.99,
      category: "vintage-tees",
      image: "../assets/sabbath.png",
      rating: 4.6,
      reviews: 167,
      description: "Rare Black Sabbath Paranoid album tour shirt",
    },
    {
      id: 12,
      name: "Vintage Rock Band Patches",
      price: 35.99,
      category: "accessories",
      image: "../assets/patches.jpg",
      rating: 4.3,
      reviews: 89,
      description: "Set of authentic vintage rock band patches",
    },

        {
      id: 13,
      name: "Oromo Bale Traditional Full Sleeve Tee",
      price: 234.99,
      category: "habesha-style",
      image: "../assets/orot2.jpg",
      rating: 5.0,
      reviews: 132,
      description: "Traditionaly hand made full sleeve oromo cultural top wear",
    },
       {
      id: 14,
      name: "Vintage Levi's 501 Jeans",
      price: 189.99,
      category: "denim",
      image: "../assets/Classic Denim Jeans.jpg",
      rating: 4.8,
      reviews: 198,
      description: "Classic vintage Levi's 501s with perfect fade",
    },
  
     {
      id: 15,
      name: "Habesha Kemis",
      price: 189.99,
      category: "habesha-style",
      image: "../assets/habeshad3.jpg",
      rating: 4.8,
      reviews: 76,
      description: "Traditionaly hand made habesha [kemis] (Ethiopian)",
    },
         {
      id: 16,
      name: "Habesha Kemis",
      price: 221.99,
      category: "habesha-style",
      image: "../assets/habeshad5.jpg",
      rating: 4.6,
      reviews: 98,
      description: " Full cotton Traditionaly hand made habesha [kemis] (Ethiopian)",
    },
  ];
  
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    const cartCount = document.getElementById("cart-count");
    if (cartCount) cartCount.textContent = count;
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    if (document.getElementById("products-grid")) {
      loadAllProducts();
    }
  });
  
  function loadAllProducts() {
    const container = document.getElementById("products-grid");
    if (!container) return;
    container.innerHTML = products.map((product) => createProductCard(product)).join("");
  }

  function formatCurrency(amount, currency = 'ETB', locale = 'en-ET') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

  
function createProductCard(product) {
  const salePrice = product.originalPrice
    ? `<span class='original-price' style='text-decoration: line-through; color: #999; margin-left: 8px;'>${formatCurrency(product.originalPrice)}</span>`
    : "";

  return `
    <div class="product-card" data-category="${product.category}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-rating">
          <span class="stars">${"★".repeat(Math.floor(product.rating))}${"☆".repeat(5 - Math.floor(product.rating))}</span>
          <span>${product.rating} (${product.reviews})</span>
        </div>
        <div class="product-price">
          ${formatCurrency(product.price)} ${salePrice}
        </div>
        <button class="add-to-cart" onclick="addToCart(${product.id})">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

  
  function addToCart(productId) {
    window.location.href = 'Login.html';
  }
  
  function filterProducts(category) {
    const btns = document.querySelectorAll(".filter-btn");
    btns.forEach((btn) => btn.classList.remove("active"));
    const activeBtn = Array.from(btns).find((btn) => btn.textContent.toLowerCase().includes(category.replace('-', ' ')) || (category === 'all' && btn.textContent === 'All'));
    if (activeBtn) activeBtn.classList.add("active");
    const filtered = category === "all" ? products : products.filter((p) => p.category === category);
    const container = document.getElementById("products-grid");
    if (container) container.innerHTML = filtered.map((product) => createProductCard(product)).join("");
  }
  
  function sortProducts() {
    const sort = document.getElementById("sort-select").value;
    let sorted = [...products];
    if (sort === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    // 'featured' is default order
    const container = document.getElementById("products-grid");
    if (container) container.innerHTML = sorted.map((product) => createProductCard(product)).join("");
  } 