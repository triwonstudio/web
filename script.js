document.addEventListener('DOMContentLoaded', () => {
    // Fade-in on scroll animation using IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in, .service-card, .project-card');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Form submission (AJAX)
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Sayfa yenilenmesini engeller
            
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Gönderiliyor...';
            btn.disabled = true;

            const formData = new FormData(form);

            fetch('https://formsubmit.co/ajax/triwon.studio@gmail.com', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                btn.textContent = 'Gönderildi!';
                btn.style.background = '#10b981'; // Başarılı yeşili
                btn.style.color = '#fff';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.disabled = false;
                    form.reset();
                }, 3000);
            })
            .catch(error => {
                btn.textContent = 'Hata Oluştu';
                btn.style.background = '#ef4444'; // Hata kırmızısı
                btn.style.color = '#fff';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.disabled = false;
                }, 3000);
            });
        });
    }
});
