/**
 * Módulo de Efectos Visuales y UI Futurista
 * Maneja partículas, radar, notificaciones y paneles laterales.
 */

// --- SISTEMA DE PARTÍCULAS ---
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return; // Salir si no hay canvas
    
    const ctx = canvas.getContext('2d');
    
    // Ajustar al tamaño de ventana
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const particles = [];
    const particleCount = 100; // Ajustar según rendimiento deseado
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `hsl(${Math.random() * 60 + 180}, 100%, 70%)`;
            this.life = Math.random() * 100;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Rebotar en bordes
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Conexiones (Efecto Constelación)
            particles.forEach(p => {
                const dx = this.x - p.x;
                const dy = this.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 255, 231, ${0.15 * (1 - distance/100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                }
            });
        }
    }
    
    // Inicializar partículas
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}

// --- NOTIFICACIONES ---
function showNotification(message) {
    const notification = document.getElementById('notification'); // Asegúrate de tener este ID en HTML o crea uno dinámico
    
    // Si no existe el contenedor, crearlo dinámicamente
    if (!notification) {
        const div = document.createElement('div');
        div.id = 'notification';
        div.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(5, 10, 25, 0.9); border: 1px solid #00ffe7;
            color: #00ffe7; padding: 10px 20px; border-radius: 5px;
            z-index: 9999; font-family: 'Orbitron', sans-serif; font-size: 14px;
            box-shadow: 0 0 15px rgba(0, 255, 231, 0.4); pointer-events: none;
            transition: opacity 0.5s ease;
        `;
        div.textContent = message;
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 500);
        }, 3000);
        return;
    }

    // Si ya existe (lógica original)
    const text = document.getElementById('notificationText');
    if (text) text.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// --- RADAR ---
function updateRadarDots() {
    const radarScreen = document.querySelector('.radar-screen');
    if (!radarScreen) return;
    
    // Limpiar puntos viejos
    const oldDots = document.querySelectorAll('.radar-dot');
    oldDots.forEach(dot => dot.remove());
    
    // Generar nuevos objetivos simulados
    const numObjects = 2 + Math.floor(Math.random() * 4); // 2 a 5 puntos
    
    for (let i = 0; i < numObjects; i++) {
        const dot = document.createElement('div');
        dot.className = 'radar-dot';
        
        // Posición aleatoria dentro del círculo (aprox)
        const top = Math.floor(Math.random() * 80) + 10;
        const left = Math.floor(Math.random() * 80) + 10;
        
        dot.style.top = `${top}%`;
        dot.style.left = `${left}%`;
        
        // Estilos dinámicos
        const size = 4 + Math.floor(Math.random() * 3);
        const hue = Math.floor(Math.random() * 60); // Tonos rojizos/naranjas
        
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        // Usar variables CSS o colores fijos si se prefiere
        dot.style.backgroundColor = `hsl(${hue}, 100%, 60%)`; 
        dot.style.boxShadow = `0 0 ${size*2}px hsl(${hue}, 100%, 60%)`;
        
        radarScreen.appendChild(dot);
    }
    
    // Actualizar textos del panel radar
    const objectsElement = document.getElementById('radar-objects');
    if (objectsElement) objectsElement.textContent = numObjects;
    
    const timeElement = document.getElementById('radar-time');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('es-MX', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });
    }
}

// --- TRACKING DE COORDENADAS ---
function initCoordinateTracking() {
    // Usar un intervalo para buscar el mapa en lugar de un timeout fijo
    // Esto evita condiciones de carrera si el mapa tarda en cargar
    const checkForMap = setInterval(() => {
        const mapa = window.mapa || window.map;
        
        if (mapa) {
            clearInterval(checkForMap); // Mapa encontrado, detener búsqueda
            console.log('✅ Tracking de coordenadas activado');
            
            mapa.on('mousemove', function(e) {
                const latElement = document.getElementById('currentLat');
                const lngElement = document.getElementById('currentLng');
                
                if (latElement && lngElement) {
                    latElement.textContent = e.latlng.lat.toFixed(5);
                    lngElement.textContent = e.latlng.lng.toFixed(5);
                }
            });
        }
    }, 500); // Revisar cada medio segundo
}

// --- INTERFAZ DE USUARIO (SIDEBARS & PANELES) ---

// Alternar panel de estadísticas
function toggleStatsPanel() {
    const content = document.getElementById('stats-content');
    const toggle = document.getElementById('stats-toggle');
    if (!content || !toggle) return;
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        toggle.innerHTML = '▼';
    } else {
        content.classList.add('hidden');
        toggle.innerHTML = '▲';
    }
}

// Alternar secciones generales del sidebar
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggleIcon = document.getElementById(sectionId.replace('-section', '-toggle'));
    
    if (section) {
        section.classList.toggle('show');
        if (toggleIcon) {
            toggleIcon.textContent = section.classList.contains('show') ? '▼' : '▶';
        }
    }
}

// Alternar sección específica del radar
function toggleRadarSection() {
    toggleSection('radar-section');
}

// --- INICIALIZACIÓN PRINCIPAL ---
function initializeAllFuturisticEffects() {
    console.log('🚀 Inicializando efectos futuristas...');
    
    // 1. Partículas (Si existe el canvas)
    initParticles();
    
    // 2. Radar (Ciclo de actualización)
    updateRadarDots(); // Primera ejecución
    setInterval(updateRadarDots, 4000); // Repetir cada 4s
    
    // 3. Coordenadas del mouse
    initCoordinateTracking();
    
    // 4. Notificación de bienvenida
    setTimeout(() => {
        showNotification('Sistema de monitoreo de Tabasco: EN LÍNEA');
    }, 1500);
}

// --- EXPORTAR A WINDOW (Para que el HTML los vea) ---
window.initParticles = initParticles;
window.showNotification = showNotification;
window.updateRadarDots = updateRadarDots;
window.initCoordinateTracking = initCoordinateTracking;
window.initializeAllFuturisticEffects = initializeAllFuturisticEffects;
window.toggleStatsPanel = toggleStatsPanel;
window.toggleSection = toggleSection;
window.toggleRadarSection = toggleRadarSection;