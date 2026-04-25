    // Custom Notification System (Form Specific)
    const formMessage = document.getElementById('form-message');

    const showFormMessage = (message, type = 'info') => {
        if (!formMessage) return;
        
        formMessage.textContent = message;
        formMessage.className = `form-message visible ${type}`;

        // Clear after 5 seconds
        setTimeout(() => {
            formMessage.classList.remove('visible');
        }, 5000);
    };

    // Auth State Management
    const authModal = document.getElementById('auth-modal');
    const skipBtn = document.getElementById('skip-login');
    const googleBtn = document.getElementById('google-login');
    const emailBtn = document.getElementById('email-login');
    
    let isAuthenticated = sessionStorage.getItem('triwon_auth') === 'true';

    if (isAuthenticated) {
        authModal.classList.add('hidden');
    }

    const handleLogin = (method) => {
        console.log(`Logging in with ${method}...`);
        // Simulate login success
        sessionStorage.setItem('triwon_auth', 'true');
        isAuthenticated = true;
        authModal.classList.add('hidden');
        showFormMessage(`${method} ile giriş başarılı!`, 'success');
    };

    skipBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });

    googleBtn.addEventListener('click', () => handleLogin('Google'));
    emailBtn.addEventListener('click', () => handleLogin('E-posta'));

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Soft Aurora Effect (Vanilla JS Port) ---
    function initAurora() {
        const container = document.getElementById('aurora-container');
        if (!container || !window.OGL) {
            // If OGL is not ready, retry in a bit
            setTimeout(initAurora, 100);
            return;
        }

        const { Renderer, Program, Mesh, Triangle } = window.OGL;

        const hexToVec3 = (hex) => {
            const h = hex.replace('#', '');
            return [
                parseInt(h.slice(0, 2), 16) / 255,
                parseInt(h.slice(2, 4), 16) / 255,
                parseInt(h.slice(4, 6), 16) / 255
            ];
        };

        const vertexShader = `
            attribute vec2 uv;
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0, 1);
            }
        `;

        const fragmentShader = `
            precision highp float;
            uniform float uTime;
            uniform vec3 uResolution;
            uniform float uSpeed;
            uniform float uScale;
            uniform float uBrightness;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform float uNoiseFreq;
            uniform float uNoiseAmp;
            uniform float uBandHeight;
            uniform float uBandSpread;
            uniform float uOctaveDecay;
            uniform float uLayerOffset;
            uniform float uColorSpeed;
            uniform vec2 uMouse;
            uniform float uMouseInfluence;
            uniform bool uEnableMouse;

            #define TAU 6.28318

            vec3 gradientHash(vec3 p) {
                p = vec3(
                    dot(p, vec3(127.1, 311.7, 234.6)),
                    dot(p, vec3(269.5, 183.3, 198.3)),
                    dot(p, vec3(169.5, 283.3, 156.9))
                );
                vec3 h = fract(sin(p) * 43758.5453123);
                float phi = acos(2.0 * h.x - 1.0);
                float theta = TAU * h.y;
                return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
            }

            float quinticSmooth(float t) {
                float t2 = t * t;
                float t3 = t * t2;
                return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
            }

            float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
                float x = px * frequency;
                float y = py * frequency;
                float fx = floor(x); float fy = floor(y); float fz = floor(pz);
                float cx = ceil(x);  float cy = ceil(y);  float cz = ceil(pz);
                vec3 g000 = gradientHash(vec3(fx, fy, fz));
                vec3 g100 = gradientHash(vec3(cx, fy, fz));
                vec3 g010 = gradientHash(vec3(fx, cy, fz));
                vec3 g110 = gradientHash(vec3(cx, cy, fz));
                vec3 g001 = gradientHash(vec3(fx, fy, fz + 1.0));
                vec3 g101 = gradientHash(vec3(cx, fy, fz + 1.0));
                vec3 g011 = gradientHash(vec3(fx, cy, fz + 1.0));
                vec3 g111 = gradientHash(vec3(cx, cy, fz + 1.0));
                float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
                float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
                float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
                float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
                float d001 = dot(g001, vec3(x - fx, y - fy, pz - (fz + 1.0)));
                float d101 = dot(g101, vec3(x - cx, y - fy, pz - (fz + 1.0)));
                float d011 = dot(g011, vec3(x - fx, y - cy, pz - (fz + 1.0)));
                float d111 = dot(g111, vec3(x - cx, y - cy, pz - (fz + 1.0)));
                float sx = quinticSmooth(x - fx);
                float sy = quinticSmooth(y - fy);
                float sz = quinticSmooth(pz - fz);
                float lx00 = mix(d000, d100, sx);
                float lx10 = mix(d010, d110, sx);
                float lx01 = mix(d001, d101, sx);
                float lx11 = mix(d011, d111, sx);
                float ly0 = mix(lx00, lx10, sy);
                float ly1 = mix(lx01, lx11, sy);
                return amplitude * mix(ly0, ly1, sz);
            }

            float auroraGlow(float t, vec2 shift, vec2 uv_coord) {
                vec2 uv = uv_coord;
                uv += shift;
                float noiseVal = 0.0;
                float freq = uNoiseFreq;
                float amp = uNoiseAmp;
                vec2 samplePos = uv * uScale;
                for (float i = 0.0; i < 3.0; i += 1.0) {
                    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
                    amp *= uOctaveDecay;
                    freq *= 2.0;
                }
                float yBand = uv.y * 10.0 - uBandHeight * 10.0;
                return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
            }

            vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
                return a + b * cos(TAU * (c * t + d));
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / uResolution.xy;
                vec2 uv_y = gl_FragCoord.xy / uResolution.y;
                float t = uSpeed * 0.4 * uTime;
                vec2 shift = vec2(0.0);
                if (uEnableMouse) { shift = (uMouse - 0.5) * uMouseInfluence; }
                vec3 col = vec3(0.0);
                col += 0.99 * auroraGlow(t, shift, uv_y) * cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)) * uColor1;
                col += 0.99 * auroraGlow(t + uLayerOffset, shift, uv_y) * cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)) * uColor2;
                col *= uBrightness;
                float alpha = clamp(length(col), 0.0, 1.0);
                gl_FragColor = vec4(col, alpha);
            }
        `;

        const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
        const gl = renderer.gl;
        container.appendChild(gl.canvas);

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
                uSpeed: { value: 1.1 },
                uScale: { value: 0.1 },
                uBrightness: { value: 1.0 },
                uColor1: { value: hexToVec3('#266cf3') },
                uColor2: { value: hexToVec3('#00dcff') },
                uNoiseFreq: { value: 10 },
                uNoiseAmp: { value: 0.5 },
                uBandHeight: { value: 0.9 },
                uBandSpread: { value: 0.7 },
                uOctaveDecay: { value: 0.49 },
                uLayerOffset: { value: 1 },
                uColorSpeed: { value: 0.6 },
                uMouse: { value: [0.5, 0.5] },
                uMouseInfluence: { value: 0.75 },
                uEnableMouse: { value: true }
            }
        });

        const mesh = new Mesh(gl, { geometry, program });

        let targetMouse = [0.5, 0.5];
        let currentMouse = [0.5, 0.5];
        window.addEventListener('mousemove', (e) => {
            targetMouse = [e.clientX / window.innerWidth, 1.0 - (e.clientY / window.innerHeight)];
        });

        function resize() {
            const w = container.offsetWidth;
            const h = container.offsetHeight;
            renderer.setSize(w, h);
            program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
        }
        window.addEventListener('resize', resize);
        resize();

        function update(time) {
            requestAnimationFrame(update);
            program.uniforms.uTime.value = time * 0.001;
            currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.05;
            currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.05;
            program.uniforms.uMouse.value = currentMouse;
            renderer.render({ scene: mesh });
        }
        requestAnimationFrame(update);
    }
    initAurora();

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
            e.preventDefault(); 

            if (!isAuthenticated) {
                showFormMessage('⚠️ Mesaj göndermek için önce giriş yapmalısınız!', 'error');
                authModal.classList.remove('hidden');
                return;
            }

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
                showFormMessage('Mesajınız başarıyla gönderildi!', 'success');
                btn.textContent = 'Gönderildi!';
                btn.style.background = '#10b981'; 
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
                showFormMessage('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
                btn.textContent = 'Hata Oluştu';
                btn.style.background = '#ef4444'; 
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
