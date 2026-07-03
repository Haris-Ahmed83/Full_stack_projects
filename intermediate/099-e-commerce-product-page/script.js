document.addEventListener('DOMContentLoaded', () => {
    // --- Product Data --- //
    const product = {
        id: "prod001",
        name: "Premium Wireless Headphones",
        price: 199.99,
        description: "Experience immersive sound with these premium wireless headphones. Featuring active noise-cancellation, long-lasting battery life (up to 30 hours), and superior comfort with memory foam earcups for all-day listening. Comes with a sleek carrying case and a 3.5mm audio cable for wired use. Perfect for travel, work, or just enjoying your favorite tunes.",
        images: [
            { src: "https://via.placeholder.com/600x400/6366f1/ffffff?text=Headphones+Front", alt: "Headphones Front View" },
            { src: "https://via.placeholder.com/600x400/a78bfa/ffffff?text=Headphones+Side", alt: "Headphones Side View" },
            { src: "https://via.placeholder.com/600x400/fcd34d/ffffff?text=Headphones+Case", alt: "Headphones in Case" },
            { src: "https://via.placeholder.com/600x400/94a3b8/ffffff?text=Headphones+Detail", alt: "Headphones Detail Shot" },
            { src: "https://via.placeholder.com/600x400/4f46e5/ffffff?text=Headphones+Comfort", alt: "Headphones Comfort" }
        ]
    };

    // --- Review Data --- //
    const reviews = [
        { author: "Alice Wonderland", rating: 5, text: "Absolutely love these headphones! The sound quality is phenomenal, and the noise cancellation is a game-changer for my commute. Highly recommend!" },
        { author: "Bob The Builder", rating: 4, text: "Great headphones for the price. Comfortable for long sessions. Only minor issue is the touch controls can be a bit finicky sometimes." },
        { author: "Charlie Chaplin", rating: 5, text: "Best headphones I've ever owned. Battery life is incredible, and they look super stylish. Worth every penny!" },
        { author: "Diana Prince", rating: 3, text: "Decent sound, but they feel a bit tight on my head after a few hours. Good for short listening periods." },
        { author: "Eve Harrington", rating: 5, text: "These headphones exceeded my expectations. The audio is crisp, and the build quality is premium. A fantastic purchase!" }
    ];

    // --- DOM Elements --- //
    const mainProductImage = document.getElementById('main-product-image');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    const productTitle = document.getElementById('product-title');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const qtyInput = document.getElementById('qty-input');
    const qtyDecrementBtn = document.getElementById('qty-decrement');
    const qtyIncrementBtn = document.getElementById('qty-increment');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const addToCartMessage = document.getElementById('add-to-cart-message');
    const cartCountSpan = document.getElementById('cart-count');
    const reviewsList = document.getElementById('reviews-list');

    // --- State Management --- //
    let currentQuantity = parseInt(qtyInput.value); // Current quantity selected by user
    let cartItemCount = 0; // Simple counter for items in cart

    // --- Functions --- //

    /**
     * Renders the main product details on the page.
     */
    function renderProductDetails() {
        productTitle.textContent = product.name;
        productPrice.textContent = `$${product.price.toFixed(2)}`;
        productDescription.textContent = product.description;

        // Set initial main image
        if (product.images.length > 0) {
            mainProductImage.src = product.images[0].src;
            mainProductImage.alt = product.images[0].alt;
        }
    }

    /**
     * Renders the thumbnail gallery and sets up click listeners.
     */
    function renderThumbnailGallery() {
        thumbnailGallery.innerHTML = ''; // Clear existing thumbnails
        product.images.forEach((image, index) => {
            const img = document.createElement('img');
            img.src = image.src.replace('600x400', '100x70'); // Use smaller version for thumbnail
            img.alt = image.alt;
            img.classList.add('thumbnail');
            // Store full size image source in a data attribute
            img.dataset.fullSrc = image.src;

            // Set the first thumbnail as active initially
            if (index === 0) {
                img.classList.add('active');
            }

            // Event listener for thumbnail clicks
            img.addEventListener('click', () => {
                // Update main image source
                mainProductImage.src = img.dataset.fullSrc;
                mainProductImage.alt = img.alt;

                // Remove 'active' class from previously active thumbnail
                const currentActive = thumbnailGallery.querySelector('.thumbnail.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                // Add 'active' class to the clicked thumbnail
                img.classList.add('active');
            });
            thumbnailGallery.appendChild(img);
        });
    }

    /**
     * Updates the displayed quantity and internal state.
     * @param {number} newQuantity - The quantity to set.
     */
    function updateQuantity(newQuantity) {
        // Ensure quantity is at least 1
        currentQuantity = Math.max(1, newQuantity);
        qtyInput.value = currentQuantity;
    }

    /**
     * Renders the customer reviews on the page.
     */
    function renderReviews() {
        reviewsList.innerHTML = ''; // Clear existing reviews
        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('review-item');

            // Generate star rating string
            const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

            reviewItem.innerHTML = `
                <p class="review-author">${review.author}</p>
                <p class="review-rating" aria-label="${review.rating} out of 5 stars">${stars}</p>
                <p class="review-text">${review.text}</p>
            `;
            reviewsList.appendChild(reviewItem);
        });
    }

    /**
     * Displays a temporary message to the user.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' or 'error' (not fully implemented type styling here).
     */
    function showMessage(message, type = 'success') {
        addToCartMessage.textContent = message;
        addToCartMessage.classList.add('show');
        // Hide message after a few seconds
        setTimeout(() => {
            addToCartMessage.classList.remove('show');
        }, 3000);
    }

    // --- Event Listeners --- //

    // Quantity decrement button
    qtyDecrementBtn.addEventListener('click', () => {
        updateQuantity(currentQuantity - 1);
    });

    // Quantity increment button
    qtyIncrementBtn.addEventListener('click', () => {
        updateQuantity(currentQuantity + 1);
    });

    // Add to Cart button
    addToCartBtn.addEventListener('click', () => {
        if (currentQuantity > 0) {
            cartItemCount += currentQuantity; // Add selected quantity to cart counter
            cartCountSpan.textContent = cartItemCount; // Update cart count display
            showMessage(`${currentQuantity} item(s) added to cart!`);
            updateQuantity(1); // Reset quantity selector to 1 after adding to cart
        } else {
            showMessage("Please select a quantity.", 'error');
        }
    });

    // --- Initialization --- //
    renderProductDetails();
    renderThumbnailGallery();
    renderReviews();
});
