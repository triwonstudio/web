// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuhM6wcs8n4ZfzIWx1XsYpCm-3DU3WxkY",
    authDomain: "triwon-studio.firebaseapp.com",
    projectId: "triwon-studio",
    storageBucket: "triwon-studio.firebasestorage.app",
    messagingSenderId: "92518972663",
    appId: "1:92518972663:web:99393b6323a6e3c68ea7f2",
    measurementId: "G-LZETPENRLE"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', () => {
    // Custom Notification System
    const formMessage = document.getElementById('form-message');
    const showFormMessage = (message, type = 'info') => {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.className = `form-message visible ${type}`;
        setTimeout(() => formMessage.classList.remove('visible'), 5000);
    };

    // Auth State Management
    const authModal = document.getElementById('auth-modal');
    const googleBtn = document.getElementById('google-login-btn');
    const emailBtn = document.getElementById('email-login-btn');
    const authNavBtn = document.getElementById('auth-nav-btn');
    const skipBtn = document.getElementById('skip-login-btn');
    
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    
    let isAuthenticated = false;

    const updateUI = (user) => {
        if (user) {
            isAuthenticated = true;
            if (authModal) authModal.classList.add('hidden');
            if (authNavBtn) authNavBtn.textContent = "Çıkış Yap";
            
            if (nameInput) {
                nameInput.value = user.displayName || "";
                nameInput.readOnly = true;
                nameInput.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
                nameInput.style.opacity = "0.8";
            }
            if (emailInput) {
                emailInput.value = user.email || "";
                emailInput.readOnly = true;
                emailInput.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
                emailInput.style.opacity = "0.8";
            }
        } else {
            isAuthenticated = false;
            // Modal'ı sadece sayfa yüklendiğinde otomatik açması için burada zorlamıyoruz
            if (authNavBtn) authNavBtn.textContent = "Giriş Yap";
            
            if (nameInput) {
                nameInput.value = "";
                nameInput.readOnly = false;
                nameInput.style.backgroundColor = "";
                nameInput.style.opacity = "1";
            }
            if (emailInput) {
                emailInput.value = "";
                emailInput.readOnly = false;
                emailInput.style.backgroundColor = "";
                emailInput.style.opacity = "1";
            }
        }
    };

    // Firebase Auth Listener
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(updateUI);
    }

    // Google Login
    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(() => showFormMessage('Giriş Başarılı! ✨', 'success'))
                .catch((error) => showFormMessage('Hata: ' + error.message, 'error'));
        });
    }

    // Email Login Placeholder
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Email Login Clicked");
            showFormMessage('E-posta girişi yakında aktif olacak. Şimdilik Google kullanabilirsiniz. ✨', 'info');
        });
    }

    // Skip Login
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            if (authModal) authModal.classList.add('hidden');
        });
    }

    // Auth Nav Button Click
    if (authNavBtn) {
        authNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Toggle active state for auth button too if clicked
            document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
            authNavBtn.classList.add('active');

            if (isAuthenticated) {
                firebase.auth().signOut().then(() => {
                    showFormMessage('Çıkış yapıldı.', 'info');
                });
            } else {
                if (authModal) authModal.classList.remove('hidden');
            }
        });
    }

    // Dynamic Active State for all Nav Links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // --- RE-ADDING CONTENT LOGIC ---
    
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // Fade-in animations (Intersection Observer)
    const fadeObservers = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => fadeObservers.observe(el));

    // Form Submission Logic
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            if (!isAuthenticated) {
                e.preventDefault();
                showFormMessage('⚠️ Önce giriş yapmalısınız!', 'error');
                if (authModal) authModal.classList.remove('hidden');
                return;
            }
            
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Gönderiliyor...';
            btn.disabled = true;

            // EmailJS
            emailjs.init('TcMW7Wq2EWBGMZQCR');
            emailjs.sendForm('service_xllhe3c', 'template_s79342s', form)
                .then(() => {
                    showFormMessage('Mesajınız başarıyla iletildi!', 'success');
                    form.reset();
                    btn.textContent = 'Gönderildi!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                        if (firebase.auth().currentUser) updateUI(firebase.auth().currentUser);
                    }, 3000);
                })
                .catch(() => {
                    // Fallback to FormSubmit
                    const formData = new FormData(form);
                    fetch(form.action, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    }).finally(() => {
                        showFormMessage('Mesajınız başarıyla iletildi! (Yedek Kanal)', 'success');
                        form.reset();
                        btn.textContent = 'Gönderildi!';
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.disabled = false;
                            if (firebase.auth().currentUser) updateUI(firebase.auth().currentUser);
                        }, 3000);
                    });
                });
        });
    }

    // --- AURORA BACKGROUND (PREMIUM VERSION) ---
    function initAurora() {
        const container = document.getElementById('aurora-container');
        if (!container || !window.OGL) return;
        
        const { Renderer, Program, Mesh, Plane } = window.OGL;
        const renderer = new Renderer({ alpha: true });
        const gl = renderer.gl;
        container.appendChild(gl.canvas);
        const geometry = new Plane(gl);
        
        const vertex = `
            attribute vec2 uv;
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0, 1);
            }
        `;

        const fragment = `
            precision highp float;
            uniform float uTime;
            varying vec2 vUv;
            void main() {
                float time = uTime * 0.5;
                vec2 uv = vUv;
                vec3 color1 = vec3(0.145, 0.423, 0.952); // Blue
                vec3 color2 = vec3(0.000, 0.862, 1.000); // Cyan
                float noise = sin(uv.x * 3.0 + time) * cos(uv.y * 2.0 - time) * 0.5 + 0.5;
                vec3 finalColor = mix(color1, color2, noise);
                gl_FragColor = vec4(finalColor * 0.15, 0.6);
            }
        `;
        
        const program = new Program(gl, { 
            vertex, 
            fragment, 
            uniforms: { uTime: { value: 0 } } 
        });
        const mesh = new Mesh(gl, { geometry, program });

        function update(t) {
            requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene: mesh });
        }
        
        function resize() {
            renderer.setSize(container.offsetWidth, container.offsetHeight);
        }
        window.addEventListener('resize', resize, false);
        resize();
        requestAnimationFrame(update);
    }
    initAurora();
});
