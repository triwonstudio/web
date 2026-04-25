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
    const googleBtn = document.getElementById('google-login');
    const emailBtn = document.getElementById('email-login');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutItem = document.getElementById('logout-item');
    const skipBtn = document.getElementById('skip-login');
    
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    
    let isAuthenticated = false;

    const updateUI = (user) => {
        if (user) {
            isAuthenticated = true;
            authModal.classList.add('hidden');
            if (logoutItem) logoutItem.classList.remove('hidden');
            
            if (nameInput) {
                nameInput.value = user.displayName || "";
                nameInput.readOnly = true;
                nameInput.style.backgroundColor = "#1e293b";
                nameInput.style.opacity = "0.7";
            }
            if (emailInput) {
                emailInput.value = user.email || "";
                emailInput.readOnly = true;
                emailInput.style.backgroundColor = "#1e293b";
                emailInput.style.opacity = "0.7";
            }
        } else {
            isAuthenticated = false;
            authModal.classList.remove('hidden');
            if (logoutItem) logoutItem.classList.add('hidden');
            
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

    // Google Login - FORCE POPUP
    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Google Login Triggered...");
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(() => showFormMessage('Giriş Başarılı! [GERÇEK SİSTEM]', 'success'))
                .catch((error) => showFormMessage('Hata: ' + error.message, 'error'));
        });
    }

    // Skip Login
    if (skipBtn) {
        skipBtn.addEventListener('click', () => authModal.classList.add('hidden'));
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut();
        });
    }

    // Navbar Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // Form Submission
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            if (!isAuthenticated) {
                e.preventDefault();
                showFormMessage('⚠️ Önce giriş yapmalısınız!', 'error');
                authModal.classList.remove('hidden');
                return;
            }
            
            const btn = form.querySelector('button');
            btn.textContent = 'Gönderiliyor...';
            btn.disabled = true;

            // EmailJS
            emailjs.init('TcMW7Wq2EWBGMZQCR');
            emailjs.sendForm('service_xllhe3c', 'template_s79342s', form)
                .then(() => {
                    showFormMessage('Mesajınız İletildi!', 'success');
                    form.reset();
                    btn.textContent = 'Gönderildi!';
                    setTimeout(() => {
                        btn.textContent = 'Gönder';
                        btn.disabled = false;
                        if (firebase.auth().currentUser) updateUI(firebase.auth().currentUser);
                    }, 3000);
                })
                .catch(() => {
                    // Fallback to FormSubmit if EmailJS fails
                    form.submit();
                });
        });
    }

    // Aurora Background Logic (Simplified & Fixed)
    function initAurora() {
        const container = document.getElementById('aurora-container');
        if (!container || !window.OGL) return;
        
        const { Renderer, Program, Mesh, Plane } = window.OGL;
        const renderer = new Renderer({ alpha: true });
        const gl = renderer.gl;
        container.appendChild(gl.canvas);
        const geometry = new Plane(gl);
        
        const vertex = `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 0, 1); }`;
        const fragment = `precision highp float; uniform float uTime; varying vec2 vUv; void main() { vec3 col = 0.5 + 0.5*cos(uTime+vUv.xyx+vec3(0,2,4)); gl_FragColor = vec4(col * 0.2, 0.5); }`;
        
        const program = new Program(gl, { vertex, fragment, uniforms: { uTime: { value: 0 } } });
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
