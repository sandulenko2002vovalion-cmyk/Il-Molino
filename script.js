
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
    } else {
        header.style.boxShadow = 'none';
    }
});

document.querySelectorAll('.main-nav li').forEach((item, index) => {
    item.addEventListener('click', () => {
        const sections = document.querySelectorAll('.products');
        if (sections[index]) {
            sections[index].scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
document.querySelectorAll('.show-more').forEach(button => {
    button.addEventListener('click', function() {
        this.textContent = 'Завантаження...';
        this.style.opacity = '0.7';
        
        setTimeout(() => {
            this.textContent = 'Більше немає страв';
            this.style.backgroundColor = '#555';
            this.style.color = '#fff';
        }, 1500);
    });
});
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

function getJsonStorage(key) {
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

function setJsonStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function removeJsonStorage(key) {
    localStorage.removeItem(key);
}

// ========== Глобальні змінні ==========
let products = []; // Масив всіх товарів
let cart = []; // Масив товарів у кошику
let currentCategory = 'all'; // Поточна категорія фільтра

// ========== DOM елементи ==========
const productsGrid = document.querySelector('#productsGrid');
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const cartContainer = document.querySelector('#cartItems');
const checkoutForm = document.querySelector('#checkoutForm');


function setupGsapAnimations() {
    if (typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const heroTitle = document.querySelector('#heroTitle');
    const heroText = document.querySelector('#heroText');
    const heroButton = document.querySelector('.hero-section .btn');

    if (heroTitle && heroText && heroButton) {
        gsap.from([heroTitle, heroText, heroButton], {
            y: 36,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.14
        });
    }

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.utils.toArray('.section-title, #categoryFilters, #cartItems, #checkoutCard, footer .col-md-4, footer .col-md-6').forEach((el) => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%'
                },
                y: 28,
                opacity: 0,
                duration: 0.7,
                ease: 'power2.out'
            });
        });
    }
}

function animateProductCardsOnRender() {
    if (typeof gsap === 'undefined') return;

    const cards = gsap.utils.toArray('#productsGrid .card');
    if (!cards.length) return;

    if (typeof ScrollTrigger !== 'undefined') {
        cards.forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 92%'
                },
                y: 24,
                opacity: 0,
                duration: 0.45,
                ease: 'power2.out',
                delay: index * 0.03
            });
        });
        return;
    }

    gsap.fromTo(cards, { y: 24, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: 'power2.out',
        stagger: 0.07,
        overwrite: true
    });
}

// ========== Ініціалізація при завантаженні сторінки ==========
document.addEventListener('DOMContentLoaded', function () {
    setupGsapAnimations();
    loadCart(); // Завантажуємо кошик з LocalStorage
    fetchProducts(); // Отримуємо товари з JSON

    searchInput?.addEventListener('input', function () {
        const text = searchInput.value.toLowerCase(); // Що ввів юзер

        // Фільтруємо
        const filtered = products.filter(product => product.title.toLowerCase().includes(text));

        // Перемальовуємо сторінку новими даними!
        displayProducts(filtered);
    });

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Дякуємо за замовлення! Ми зв\'яжемося з вами найближчим часом для підтвердження деталей замовлення.');
            location.assign('index.html'); // Повертаємо користувача на головну сторінку після оформлення замовлення
            cart = []; // Очищаємо кошик після оформлення замовлення
            setJsonStorage('cart', cart); // Оновлюємо localStorage після очищення кошика
            displayCart(); // Оновлюємо відображення кошика
            checkoutForm.reset();
        })
    }
});

// ========== Отримання товарів з JSON ==========
async function fetchProducts() {
    const response = await fetch('store_db.json');
    const data = await response.json();
    products = data; // Оновлюємо глобальний масив для роботи addToCart
    if (productsGrid) {
        displayProducts(data);
    }
}

// ========== Відображення товарів ==========
function displayProducts(products) {
    productsGrid.innerHTML = ''; // Очищаємо блок товарів

    products?.forEach(product => {
        const card = createProductCard(product);
        productsGrid.innerHTML += card;
    });

    animateProductCardsOnRender();
}

// ========== Створення картки товару ==========
function createProductCard(product) {
    return `<div class="card" style="width: 18rem;">
        <img src="${product.image}" class="card-img-top" alt="${product.title}">
        <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text text-primary fw-bold">${product.price} грн </p>
            <button onclick="addToCart(${product.id})"  class="btn btn-warning add-to-cart-btn"> <i class="bi bi-cart-plus"></i> В кошик</button>
        </div>
    </div>`;
}

// ========== Робота з кошиком ==========

// Додавання товару до кошика
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += 1; // Якщо товар вже в кошику, збільшуємо кількість
    } else {
        cart.push({ ...product, quantity: 1 }); // Додаємо новий товар до кошика
    }
    setJsonStorage('cart', cart); // Зберігаємо кошик у localStorage
}


// Завантаження кошика з localStorage
function loadCart() {
    const savedCart = getJsonStorage('cart');
    if (savedCart !== null) {
        cart = savedCart;
        displayCart(); // Відображаємо кошик після завантаження
    }
}


function displayCart() {
    if (!cartContainer) return; // Якщо елемент для відображення кошика не знайдено, зупиняємо функцію

    // Очищаємо контейнер перед виведенням
    cartContainer.innerHTML = '';
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="m-3">Ваш кошик порожній 🛒</p>';
        return; // Зупиняємо функцію, далі йти не треба
    }
    let total = 0;
    cart.forEach((product) => {
        total += product.price * product.quantity; // Підрахунок загальної суми

        cartContainer.innerHTML += `
      <div class="card border-0 border-bottom rounded-0">
        <div class="card-body d-flex align-items-center gap-3 p-3">
          <img src="${product.image}" height="80" >
          <div class="flex-grow-1">
              <h5 class="card-title mb-1">${product.title}</h5>
              <p class="card-text text-muted mb-1">Кількість: ${product.quantity}</p>
              <p class="card-text text-primary fw-bold mb-0">Ціна: ${product.price} грн</p>
          </div>
        </div>
      </div>
    `;
    });
    document.querySelector('#totalPrice').textContent = `${total} грн`; // Виводимо загальну суму

}

// ========== АВТОМАТИЧНЕ ЗБЕРЕЖЕННЯ ДАНИХ В LOCALSTORAGE ==========

// Автоматично зберегти дані користувача при завантаженні сторінки
window.addEventListener('load', () => {
    // Перевіряємо, чи є вже збережені дані
    let user = getJsonStorage('user');
    
    // Якщо нема даних - створюємо нові
    if (!user) {
        user = {
            name: 'Гість',
            email: 'guest@ilmolino.com',
            phone: '+380665652890',
            joinDate: new Date().toLocaleDateString('uk-UA')
        };
        setJsonStorage('user', user);
        console.log('✅ Нові дані користувача збережені!');
    }
    
    // Показуємо збережені дані в консолі
    console.log('👤 Дані користувача:', getJsonStorage('user'));
    
    // Автоматично зберегти улюблені страви
    if (!getJsonStorage('favorites')) {
        const favorites = [
            { id: 1, name: 'Маргарита', price: 150 },
            { id: 2, name: 'Пепероні', price: 180 }
        ];
        setJsonStorage('favorites', favorites);
        console.log('❤️ Улюблені страви збережені!');
    }
    
    console.log('🍕 Улюблені страви:', getJsonStorage('favorites'));
    
    // Показуємо кошик
    console.log('🛒 Кошик:', getJsonStorage('cart'));
});

// Функція для оновлення даних користувача
function updateUserData(name, email, phone) {
    const user = {
        name: name,
        email: email,
        phone: phone,
        joinDate: getJsonStorage('user')?.joinDate || new Date().toLocaleDateString('uk-UA')
    };
    setJsonStorage('user', user);
    console.log('✅ Дані оновлені:', user);
}

// Функція для додавання страви в улюблені
function addToFavorites(id, name, price) {
    let favorites = getJsonStorage('favorites') || [];
    favorites.push({ id, name, price });
    setJsonStorage('favorites', favorites);
    console.log('❤️ Добавлено в улюблені:', { id, name, price });
}

// Функція для очищення всіх даних
function clearAllData() {
    removeJsonStorage('user');
    removeJsonStorage('favorites');
    removeJsonStorage('cart');
    console.log('🗑️ Всі дані видалені!');
}