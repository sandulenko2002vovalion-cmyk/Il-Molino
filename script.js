
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
