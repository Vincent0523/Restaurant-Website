// main.js - Core functionality for the website

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the application
    initApp();
});

// Function to initialize the application
function initApp() {
    // Mobile menu toggle
    initMobileMenu();

    // Branch selection
    initBranchSelection();

    // Menu filters
    initMenuFilters();

    // Cart functionality
    initCart();

    // Checkout process
    initCheckout();

    // Load menu items based on selected branch
    loadMenuItems();
}

// Function to initialize mobile menu
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }
}

// Function to initialize branch selection
function initBranchSelection() {
    const branchSelect = document.getElementById('branch-select');
    const confirmBranchBtn = document.getElementById('confirm-branch');
    const branchBtns = document.querySelectorAll('.branch-btn');

    // Check if branch is already selected in localStorage
    const selectedBranch = localStorage.getItem('selectedBranch');
    if (selectedBranch) {
        branchSelect.value = selectedBranch;
        document.querySelector('.location-selector').style.display = 'none';
        loadMenuItems(selectedBranch);
    }

    // Branch selection from dropdown
    if (confirmBranchBtn) {
        confirmBranchBtn.addEventListener('click', function () {
            const branch = branchSelect.value;
            if (branch) {
                localStorage.setItem('selectedBranch', branch);
                document.querySelector('.location-selector').style.display = 'none';
                loadMenuItems(branch);
                showNotification(`You are now ordering from our ${branch.charAt(0).toUpperCase() + branch.slice(1)} branch.`, 'success');
            } else {
                showNotification('Please select a branch to continue.', 'error');
            }
        });
    }

    // Branch selection from location section
    if (branchBtns.length > 0) {
        branchBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const branch = this.dataset.branch;
                if (branch) {
                    localStorage.setItem('selectedBranch', branch);
                    branchSelect.value = branch;
                    document.querySelector('.location-selector').style.display = 'none';
                    loadMenuItems(branch);
                    showNotification(`You are now ordering from our ${branch.charAt(0).toUpperCase() + branch.slice(1)} branch.`, 'success');
                    window.scrollTo({
                        top: document.getElementById('menu').offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Function to initialize menu filters
function initMenuFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons
                filterBtns.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Filter menu items
                const filter = this.dataset.filter;
                filterMenuItems(filter);
            });
        });
    }
}

// Function to filter menu items
function filterMenuItems(filter) {
    const menuItems = document.querySelectorAll('.menu-item');

    if (menuItems.length > 0) {
        menuItems.forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// Function to initialize cart functionality
function initCart() {
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.querySelector('.close-cart');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Open cart modal
    if (cartIcon) {
        cartIcon.addEventListener('click', function (e) {
            e.preventDefault();
            cartModal.classList.add('active');
            // Close mobile menu if open
            document.querySelector('.nav-menu').classList.remove('active');
        });
    }

    // Close cart modal
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function () {
            cartModal.classList.remove('active');
        });
    }

    // Close cart when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });

    // Clear cart
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function () {
            clearCart();
        });
    }

    // Proceed to checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            const cartItems = getCartItems();
            if (cartItems.length === 0) {
                showNotification('Your cart is empty. Add some items before checkout.', 'error');
                return;
            }

            cartModal.classList.remove('active');
            document.getElementById('menu').style.display = 'none';
            document.getElementById('locations').style.display = 'none';
            document.getElementById('about').style.display = 'none';
            document.getElementById('contact').style.display = 'none';
            document.getElementById('checkout-section').classList.add('active');

            // Update order summary in checkout
            updateOrderSummary();

            // Scroll to checkout section
            window.scrollTo({
                top: document.getElementById('checkout-section').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    }
}

// Function to initialize checkout process
function initCheckout() {
    const placeOrderBtn = document.getElementById('place-order-btn');
    const continueShopping = document.getElementById('continue-shopping-btn');

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function () {
            // Validate delivery form
            const deliveryForm = document.getElementById('delivery-form');
            const paymentForm = document.getElementById('payment-form');

            if (!validateForm(deliveryForm) || !validateForm(paymentForm)) {
                showNotification('Please fill all required fields correctly.', 'error');
                return;
            }

            // Process order
            processOrder();
        });
    }

    if (continueShopping) {
        continueShopping.addEventListener('click', function () {
            hideOrderConfirmation();
            resetForms();

            document.getElementById('checkout-section').classList.remove('active');
            document.getElementById('menu').style.display = 'block';
            document.getElementById('locations').style.display = 'block';
            document.getElementById('about').style.display = 'block';
            document.getElementById('contact').style.display = 'block';

            // Scroll to menu section
            window.scrollTo({
                top: document.getElementById('menu').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    }
}

// Function to validate form
function validateForm(form) {
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    // Validate phone number format
    const phoneInput = document.getElementById('phone');
    if (phoneInput && phoneInput.value.trim()) {
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phoneInput.value.replace(/\D/g, ''))) {
            phoneInput.classList.add('error');
            isValid = false;
        }
    }

    // Validate email format
    const emailInput = document.getElementById('email');
    if (emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.classList.add('error');
            isValid = false;
        }
    }

    // Validate credit card number format
    const cardInput = document.getElementById('cardNumber');
    if (cardInput && cardInput.value.trim()) {
        const cardRegex = /^\d{16}$/;
        if (!cardRegex.test(cardInput.value.replace(/\D/g, ''))) {
            cardInput.classList.add('error');
            isValid = false;
        }
    }

    // Validate expiry date format
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput && expiryInput.value.trim()) {
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(expiryInput.value)) {
            expiryInput.classList.add('error');
            isValid = false;
        }
    }

    // Validate CVV format
    const cvvInput = document.getElementById('cvv');
    if (cvvInput && cvvInput.value.trim()) {
        const cvvRegex = /^\d{3,4}$/;
        if (!cvvRegex.test(cvvInput.value)) {
            cvvInput.classList.add('error');
            isValid = false;
        }
    }

    return isValid;
}

// Function to process order
function processOrder() {
    // Get order data
    const orderData = {
        customer: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value,
            instructions: document.getElementById('deliveryInstructions').value
        },
        payment: {
            cardNumber: document.getElementById('cardNumber').value.replace(/\D/g, '').slice(-4),
            cardHolder: document.getElementById('nameOnCard').value
        },
        items: getCartItems(),
        branch: localStorage.getItem('selectedBranch'),
        subtotal: calculateSubtotal(),
        deliveryFee: calculateDeliveryFee(),
        tax: calculateTax(),
        total: calculateTotal(),
        orderDate: new Date(),
        status: 'confirmed'
    };

    // Generate verification code
    const verificationCode = generateVerificationCode();
    orderData.verificationCode = verificationCode;

    // Generate order number
    const orderNumber = generateOrderNumber();
    orderData.orderNumber = orderNumber;

    // Save order to localStorage (in real app, send to server/MongoDB)
    saveOrder(orderData);

    // Send SMS with verification code (simulated)
    sendVerificationSMS(orderData.customer.phone, verificationCode);

    // Show order confirmation
    showOrderConfirmation(orderData);

    // Clear cart
    clearCart();
}

// Function to generate verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to generate order number
function generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    return `FF${timestamp}${random}`;
}

// Function to save order to localStorage (in real app, send to MongoDB)
function saveOrder(orderData) {
    // Get existing orders from localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Add new order
    orders.push(orderData);

    // Save back to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Function to simulate sending SMS with verification code
function sendVerificationSMS(phone, code) {
    console.log(`SMS sent to ${phone} with verification code: ${code}`);

    // In a real application, you would use an SMS API service like Twilio, Nexmo, etc.
    // Example with Twilio (server-side code):
    /*
    const accountSid = 'YOUR_ACCOUNT_SID';
    const authToken = 'YOUR_AUTH_TOKEN';
    const client = require('twilio')(accountSid, authToken);
    
    client.messages
        .create({
            body: `Your FoodFast verification code is: ${code}. Show this to our delivery person to receive your order.`,
            from: 'YOUR_TWILIO_PHONE_NUMBER',
            to: phone
        })
        .then(message => console.log(`SMS sent with ID: ${message.sid}`))
        .catch(err => console.error('Error sending SMS:', err));
    */
}

// Function to show order confirmation
function showOrderConfirmation(orderData) {
    // Display confirmation section
    const confirmationSection = document.getElementById('order-confirmation');
    confirmationSection.classList.add('active');

    // Set order details
    document.getElementById('order-number').textContent = orderData.orderNumber;
    document.getElementById('order-date').textContent = new Date(orderData.orderDate).toLocaleString();
    document.getElementById('order-total').textContent = formatCurrency(orderData.total);
    document.getElementById('verification-code').textContent = orderData.verificationCode;

    // Hide checkout section
    document.getElementById('checkout-section').classList.remove('active');
}

// Function to hide order confirmation
function hideOrderConfirmation() {
    const confirmationSection = document.getElementById('order-confirmation');
    confirmationSection.classList.remove('active');
}

// Function to reset forms
function resetForms() {
    document.getElementById('delivery-form').reset();
    document.getElementById('payment-form').reset();
}

// Function to load menu items based on selected branch
function loadMenuItems(branch = null) {
    const menuContainer = document.getElementById('menu-items-container');
    if (!menuContainer) return;

    // If no branch is selected, use the one from localStorage
    if (!branch) {
        branch = localStorage.getItem('selectedBranch');
    }

    // If still no branch, show message to select one
    if (!branch) {
        menuContainer.innerHTML = `
            <div class="branch-selection-message">
                <i class="fas fa-map-marker-alt"></i>
                <p>Please select a branch location to view our menu</p>
            </div>
        `;
        return;
    }

    // Show loading spinner
    menuContainer.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading menu items...</p>
        </div>
    `;

    // In a real application, fetch menu items from MongoDB based on branch
    // For demonstration, we'll use sample data
    fetchMenuItems(branch)
        .then(menuItems => {
            // Clear loading spinner
            menuContainer.innerHTML = '';

            // Create and append menu items
            menuItems.forEach(item => {
                const menuItem = createMenuItemElement(item);
                menuContainer.appendChild(menuItem);
            });

            // Add event listeners to Add to Cart buttons
            addToCartListeners();
        })
        .catch(error => {
            console.error('Error loading menu items:', error);
            menuContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load menu items. Please try again later.</p>
                </div>
            `;
        });
}

// Function to create menu item element
function createMenuItemElement(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.dataset.id = item._id;
    menuItem.dataset.category = item.category;

    menuItem.innerHTML = `
        <div class="menu-item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="menu-item-content">
            <div class="menu-item-header">
                <h3 class="menu-item-title">${item.name}</h3>
                <div class="menu-item-price">${formatCurrency(item.price)}</div>
            </div>
            <p class="menu-item-description">${item.description}</p>
            <div class="menu-item-actions">
                <div class="menu-item-quantity">
                    <button class="quantity-btn minus">-</button>
                    <input type="text" class="quantity-input" value="1" readonly>
                    <button class="quantity-btn plus">+</button>
                </div>
                <button class="btn btn-primary add-to-cart-btn" data-id="${item._id}">Add to Cart</button>
            </div>
        </div>
    `;

    return menuItem;
}

// Function to add event listeners to Add to Cart buttons
function addToCartListeners() {
    // Quantity buttons
    const minusBtns = document.querySelectorAll('.quantity-btn.minus');
    const plusBtns = document.querySelectorAll('.quantity-btn.plus');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    minusBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.nextElementSibling;
            let value = parseInt(input.value);
            if (value > 1) {
                input.value = value - 1;
            }
        });
    });

    plusBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            let value = parseInt(input.value);
            input.value = value + 1;
        });
    });

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const itemId = this.dataset.id;
            const menuItem = document.querySelector(`.menu-item[data-id="${itemId}"]`);
            const quantity = parseInt(menuItem.querySelector('.quantity-input').value);

            addToCart(itemId, quantity);
        });
    });
}

// Function to add item to cart
function addToCart(itemId, quantity) {
    // Get menu item details
    const menuItem = document.querySelector(`.menu-item[data-id="${itemId}"]`);
    const name = menuItem.querySelector('.menu-item-title').textContent;
    const price = parseFloat(menuItem.querySelector('.menu-item-price').textContent.replace(/[^0-9.-]+/g, ''));
    const image = menuItem.querySelector('.menu-item-image img').src;

    // Get current cart items from localStorage
    let cartItems = getCartItems();

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === itemId);

    if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cartItems.push({
            id: itemId,
            name: name,
            price: price,
            image: image,
            quantity: quantity
        });
    }

    // Save cart items to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Update cart count
    updateCartCount();

    // Update cart items display
    updateCartItems();

    // Show notification
    showNotification(`${quantity} ${name} added to cart`, 'success');
}

// Function to get cart items from localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
}

// Function to update cart count
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const cartItems = getCartItems();

    // Calculate total quantity
    const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

    cartCountElement.textContent = totalQuantity;
}

// Function to update cart items display
function updateCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItems = getCartItems();

    if (cartItemsContainer) {
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = '';

            cartItems.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.dataset.id = item.id;

                cartItemElement.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.name}</h3>
                        <div class="cart-item-price">${formatCurrency(item.price)}</div>
                        <div class="cart-item-actions">
                            <div class="cart-item-quantity">
                                <button class="quantity-btn cart-minus" data-id="${item.id}">-</button>
                                <span class="quantity-value">${item.quantity}</span>
                                <button class="quantity-btn cart-plus" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-item-btn" data-id="${item.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;

                cartItemsContainer.appendChild(cartItemElement);
            });

            // Add event listeners for cart item buttons
            addCartItemListeners();
        }

        // Update cart summary
        updateCartSummary();
    }
}

// Function to add event listeners to cart item buttons
function addCartItemListeners() {
    const minusBtns = document.querySelectorAll('.cart-minus');
    const plusBtns = document.querySelectorAll('.cart-plus');
    const removeBtns = document.querySelectorAll('.remove-item-btn');

    minusBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const itemId = this.dataset.id;
            updateItemQuantity(itemId, -1);
        });
    });

    plusBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const itemId = this.dataset.id;
            updateItemQuantity(itemId, 1);
        });
    });

    removeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const itemId = this.dataset.id;
            removeFromCart(itemId);
        });
    });
}

// Function to update item quantity in cart
function updateItemQuantity(itemId, change) {
    // Get current cart items
    let cartItems = getCartItems();

    // Find the item in the cart
    const itemIndex = cartItems.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
        // Update quantity
        cartItems[itemIndex].quantity += change;

        // Remove item if quantity is 0 or less
        if (cartItems[itemIndex].quantity <= 0) {
            cartItems.splice(itemIndex, 1);
        }

        // Save updated cart
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        // Update UI
        updateCartCount();
        updateCartItems();
    }
}

// Function to remove item from cart
function removeFromCart(itemId) {
    // Get current cart items
    let cartItems = getCartItems();

    // Remove the item
    cartItems = cartItems.filter(item => item.id !== itemId);

    // Save updated cart
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Update UI
    updateCartCount();
    updateCartItems();

    // Show notification
    showNotification('Item removed from cart', 'info');
}

// Function to clear the entire cart
function clearCart() {
    // Clear cart items in localStorage
    localStorage.removeItem('cartItems');

    // Update UI
    updateCartCount();
    updateCartItems();

    // Show notification
    showNotification('Cart cleared', 'info');
}

// Function to update cart summary
function updateCartSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');

    // Calculate values
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, deliveryFee, tax);

    // Update UI
    subtotalElement.textContent = formatCurrency(subtotal);
    deliveryFeeElement.textContent = formatCurrency(deliveryFee);
    taxElement.textContent = formatCurrency(tax);
    totalElement.textContent = formatCurrency(total);
}

// Function to update order summary in checkout
function updateOrderSummary() {
    const summaryItemsContainer = document.getElementById('summary-items-container');
    const subtotalElement = document.getElementById('summary-subtotal');
    const deliveryFeeElement = document.getElementById('summary-delivery-fee');
    const taxElement = document.getElementById('summary-tax');
    const totalElement = document.getElementById('summary-total');

    const cartItems = getCartItems();

    // Update summary items
    if (summaryItemsContainer) {
        summaryItemsContainer.innerHTML = '';

        cartItems.forEach(item => {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <div class="summary-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="summary-item-details">
                    <h4 class="summary-item-title">${item.name}</h4>
                    <div class="summary-item-price">
                        <span>${item.quantity} x ${formatCurrency(item.price)}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                </div>
            `;

            summaryItemsContainer.appendChild(summaryItem);
        });
    }

    // Calculate values
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, deliveryFee, tax);

    // Update UI
    subtotalElement.textContent = formatCurrency(subtotal);
    deliveryFeeElement.textContent = formatCurrency(deliveryFee);
    taxElement.textContent = formatCurrency(tax);
    totalElement.textContent = formatCurrency(total);
}

// Function to calculate subtotal
function calculateSubtotal() {
    const cartItems = getCartItems();
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Function to calculate delivery fee
function calculateDeliveryFee() {
    const subtotal = calculateSubtotal();
    // Free delivery for orders over $35
    return subtotal >= 35 ? 0 : 4.99;
}

// Function to calculate tax
function calculateTax(subtotal = null) {
    if (subtotal === null) {
        subtotal = calculateSubtotal();
    }
    // Tax rate of 8.5%
    return subtotal * 0.085;
}

// Function to calculate total
function calculateTotal(subtotal = null, deliveryFee = null, tax = null) {
    if (subtotal === null) {
        subtotal = calculateSubtotal();
    }
    if (deliveryFee === null) {
        deliveryFee = calculateDeliveryFee();
    }
    if (tax === null) {
        tax = calculateTax(subtotal);
    }

    return subtotal + deliveryFee + tax;
}

// Function to format currency
function formatCurrency(amount) {
    return '' + amount.toFixed(2);
}

// Function to show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', function () {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Initialize cart count on page load
updateCartCount();