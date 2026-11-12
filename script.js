let products = [];
let currentPage = 1;
let itemsPerPage = 6;

let productsContainer = document.getElementById("products-container");
let prevBtn = document.getElementById("prev-btn");
let nextBtn = document.getElementById("next-btn");
let pageNumber = document.getElementById("page-number");
let categories = [];

fetch("https://fakestoreapi.com/products")
  .then((res) => res.json())
  .then((data) => {
    products = data;
    displayProducts();

    categories = [...new Set(products.map((p) => p.category))];
    let category = document.getElementById("category");

    categories.forEach((c) => {
      category.innerHTML += `<option value="${c}">${c}</option>`;
    });
  })
  .catch((err) => console.log(err));

function displayProducts(productsToDisplay = products) {
  productsContainer.innerHTML = "";

  let start = (currentPage - 1) * itemsPerPage;
  let end = start + itemsPerPage;

  let currentProducts = productsToDisplay.slice(start, end);

  currentProducts.forEach((product) => {
    productsContainer.innerHTML += `
            <div class="product-card">

                <img src="${product.image}" alt="${product.title}">

                <h3>${product.title}</h3>

                <p>${product.description.substring(0, 100)}...</p>

                <div class="price">
                    $${product.price}
                </div>

                <div class="price">
                    Rate : ${product.rating.rate}
                </div>

                <div class="buttons">
                    <button class="view-btn"
                        onclick="viewDetails(${product.id})">
                        View Details
                    </button>

                    <button class="add-btn"
                        onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>

            </div>
        `;
  });

  prevBtn.disabled = currentPage === 1;

  nextBtn.disabled = end >= productsToDisplay.length;
  displayPagination();
}

let modal = document.getElementById("modal");
let modalDetails = document.getElementById("modal-details");
let closeModal = document.getElementById("close-modal");

function viewDetails(id) {
  let product = products.find((p) => p.id === id);

  modalDetails.innerHTML = `
        <div class="modal-product">

            <img src="${product.image}" alt="${product.title}">

            <h2>${product.title}</h2>

            <p>${product.description}</p>

            <div class="modal-price">
                $${product.price}
            </div>

            <div class="modal-category">
                Category: ${product.category}
            </div>

            <button class="add-btn" onclick="addToCart(${product.id})">
                Add to Cart
            </button>

        </div>
    `;

  modal.classList.add("show");
}

closeModal.addEventListener("click", () => {
  modal.classList.remove("show");
});

let cart = [];

let cartItems = document.getElementById("cart-items");

let total = document.getElementById("total");
total.innerHTML = cart.length;

let totalPrice = 0;
let price = document.getElementById("price");

function addToCart(id) {
  let product = products.find((p) => p.id === id);

  let existingItem = cart.find((p) => p.id === id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  updateCart();
}

function deleteItem(id) {
  let index = products.indexOf((p) => p.id === id);
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";

  cart.forEach((item) => {
    cartItems.innerHTML += `
            <li>
                <pre>${item.title.trim().substring(0, 80)} , Price: $${item.price} , Quantity: ${item.quantity} , Subtotal: $${(item.price * item.quantity).toFixed(2)} <button onclick=deleteItem(${item.id})>remove</button>
                </pre>
            </li>
        `;
  });

  total.innerHTML = cart.reduce((sum, item) => sum + item.quantity, 0);

  let totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  price.innerHTML = totalPrice.toFixed(2);
}

let pageNumbers = document.getElementById("page-numbers");

function displayPagination(productsToDisplay = products) {
  pageNumbers.innerHTML = "";

  let totalPages = Math.ceil(productsToDisplay.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    let button = document.createElement("button");

    button.innerText = i;

    if (i === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentPage = i;
      displayProducts();
    });

    pageNumbers.appendChild(button);
  }
}

nextBtn.addEventListener("click", () => {
  if (currentPage * itemsPerPage < products.length) {
    currentPage++;
    displayProducts();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayProducts();
  }
});

let applyFilterBtn = document.getElementById("apply-filters");
applyFilterBtn.addEventListener("click", sort);

let sortPrice = document.getElementById("sort-price");
sortPrice.addEventListener("change", sort);

function sort() {
  let searchName = document.getElementById("search").value;
  let minPrice = document.getElementById("min-price").value;
  let maxPrice = document.getElementById("max-price").value;
  let selectedOption = document.getElementById("category").value;
  let filteredProducts = [...products];
  if (searchName !== "") {
    filteredProducts = filteredProducts.filter((p) =>
      p.title.toLowerCase().includes(searchName),
    );
  }
  if (minPrice !== "") {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= Number(minPrice),
    );
  }

  if (maxPrice !== "") {
    filteredProducts = filteredProducts.filter(
      (p) => p.price <= Number(maxPrice),
    );
  }

  if (selectedOption !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === selectedOption,
    );
  }

  if (sortPrice.value === "lth") {
    filteredProducts.sort((a, b) => a.price - b.price);
    products = [...filteredProducts];
  } else if (sortPrice.value === "htl") {
    filteredProducts.sort((a, b) => b.price - a.price);
    products = [...filteredProducts];
  }
  currentPage = 1;
  displayProducts(filteredProducts);
}