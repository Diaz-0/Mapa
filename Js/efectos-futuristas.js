// Sistema de partículas para el fondo
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `hsl(${Math.random() * 60 + 180}, 100%, 70%)`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Conexiones entre partículas
            particles.forEach(p => {
                const dx = this.x - p.x;
                const dy = this.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 255, 231, ${0.2 * (1 - distance/100)})`;
                    ctx.lineWidth = 0.3;
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                }
            });
        }
    }
    
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
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Función para mostrar notificaciones
function showNotification(message) {
    var notification = document.getElementById('notification');
    var text = document.getElementById('notificationText');
    
    if (!notification || !text) return;
    
    text.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Actualizar puntos de radar dinámicamente
function updateRadarDots() {
    var radarScreen = document.querySelector('.radar-screen');
    
    if (!radarScreen) return; // Si no existe el radar, salir
    
    // Eliminar puntos existentes
    document.querySelectorAll('.radar-dot').forEach(dot => dot.remove());
    
    // Crear nuevos puntos
    const numObjects = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numObjects; i++) {
        const dot = document.createElement('div');
        dot.className = 'radar-dot';
        
        // Posición aleatoria
        const top = Math.floor(Math.random() * 80) + 10;
        const left = Math.floor(Math.random() * 80) + 10;
        
        dot.style.top = `${top}%`;
        dot.style.left = `${left}%`;
        
        // Tamaño y color aleatorios
        const size = 3 + Math.floor(Math.random() * 3);
        const hue = Math.floor(Math.random() * 60);
        
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.backgroundColor = `hsl(${hue}, 100%, 60%)`;
        dot.style.boxShadow = `0 0 ${size*2}px hsl(${hue}, 100%, 60%)`;
        
        radarScreen.appendChild(dot);
    }
    
    // Actualizar estadísticas del radar
    const objectsElement = document.getElementById('radar-objects');
    const timeElement = document.getElementById('radar-time');
    
    if (objectsElement) {
        objectsElement.textContent = numObjects;
    }
    
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Inicializar efectos futuristas
function initFuturisticEffects() {
    // Actualizar radar cada 5 segundos
    setInterval(updateRadarDots, 5000);
}

// Actualizar coordenadas al mover el mouse en el mapa
function initCoordinateTracking() {
    // Esperar a que el mapa esté listo
    setTimeout(() => {
        if (window.mapa) {
            window.mapa.on('mousemove', function(e) {
                const latElement = document.getElementById('currentLat');
                const lngElement = document.getElementById('currentLng');
                
                if (latElement && lngElement) {
                    latElement.textContent = e.latlng.lat.toFixed(4);
                    lngElement.textContent = e.latlng.lng.toFixed(4);
                }
            });
        }
    }, 2000);
}

// Función principal para inicializar todos los efectos
function initializeAllFuturisticEffects() {
    console.log('Inicializando efectos futuristas...');
    
    // Inicializar partículas - DESACTIVADO (oculto por defecto)
    // initParticles();
    
    // Inicializar radar
    updateRadarDots();
    
    // Inicializar efectos generales
    initFuturisticEffects();
    
    // Inicializar seguimiento de coordenadas
    initCoordinateTracking();
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        showNotification('Sistema de monitoreo de Tabasco activado');
    }, 1000);
    
    console.log('Efectos futuristas inicializados correctamente');
}

// Función para alternar el panel de estadísticas
function toggleStatsPanel() {
    const content = document.getElementById('stats-content');
    const toggle = document.getElementById('stats-toggle');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        toggle.innerHTML = '▼';
    } else {
        content.classList.add('hidden');
        toggle.innerHTML = '▲';
    }
}

// Función para alternar secciones del sidebar
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggleIcon = document.getElementById(sectionId.replace('-section', '-toggle'));
    
    if (section && toggleIcon) {
        // Alternar la clase 'show' en la sección
        section.classList.toggle('show');
        
        // Cambiar el icono
        if (section.classList.contains('show')) {
            toggleIcon.textContent = '▼';
        } else {
            toggleIcon.textContent = '▶';
        }
    }
}

// Función específica para el radar (si necesitas lógica adicional)
function toggleRadarSection() {
    toggleSection('radar-section');
}

// Exportar las funciones
window.toggleSection = toggleSection;
window.toggleRadarSection = toggleRadarSection;


// Exportar funciones para uso global
window.initParticles = initParticles;
window.showNotification = showNotification;
window.updateRadarDots = updateRadarDots;
window.initFuturisticEffects = initFuturisticEffects;
window.initCoordinateTracking = initCoordinateTracking;
window.initializeAllFuturisticEffects = initializeAllFuturisticEffects;
window.toggleStatsPanel = toggleStatsPanel;
