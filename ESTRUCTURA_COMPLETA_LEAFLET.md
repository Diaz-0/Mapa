# Estructura Completa del Proyecto Leaflet - Mapa Coroplético de Tabasco

Documentación exhaustiva de todos los archivos del proyecto. Sin resúmenes ni cortes.

> **Última actualización:** Documento sincronizado con el código actual. Incluye: layer.js (attributionControl: false), lef.html, mapa-agua.html, sidebar.html, comparador-sidebar.html, efectos-futuristas.html, graficas-panel.html, mapa-agua.js, index.js, wms-enhancer.js, comparador-agua.js (Zonas no aptas, gráficas, --bottom-safe, rutas CSV, panel minimizable), datos-agua-loader.js (procesarCSV con area_ha opcional), mapa.css (leaflet-bottom.leaflet-right), sidebar.css (layers-container), efectos-futuristas.css (graficas-panel.minimized, minimize-icon), comparador-sidebar.css, Dibujo_mnmapa.js, efectos-futuristas.js, Puntos.js, mapa-agua.css, server.js, package.json, .htaccess. Nota: lef.css y compara-agua.css ya no existen; se usa comparador-sidebar.css.

---

## Leaflet

### --Layers

#### ---layer.js

```javascript
var mapa = L.map("contenedor-del-mapa", { 
    zoomControl: false,
    attributionControl: false  // para ocultar toda la caja
}).setView([17.75, -91.45], 9);



var baseLayers = {
    // Capas de mapa base
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: "© OpenStreetMap contributors" 
    }),
    
    // Capas satelitales
    "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 20
    }),
    
    "Google Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 20
    }),
    
    "Esri Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    }),
    
    "Stadia Satellite": L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg'
    }),

    // Capas de terreno
    "Google Terrain": L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 20
    }),
    
    "Thunderforest Outdoors": L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey={apikey}', { 
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', 
        apikey: '9dfc94b6bdec40fa8e8ae0aa0b28bb7c'
    }),
    
    "Thunderforest Landscape": L.tileLayer('https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}{r}.png?apikey={apikey}', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '9dfc94b6bdec40fa8e8ae0aa0b28bb7c',
        maxZoom: 22
    }),

    // Capas adicionales
    "Thunderforest Spinal Map": L.tileLayer('https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}{r}.png?apikey={apikey}', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '9dfc94b6bdec40fa8e8ae0aa0b28bb7c',
        maxZoom: 22
    }),
    
    "CartoDB Positron": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }),
    
    "CartoDB Dark Matter": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    })
};

// Capas meteorológicas de OpenWeatherMap
const apiKey = 'b77edd34bef263b17302d7c260abcec6';

// Configuración común para las capas meteorológicas
const weatherLayerOptions = {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.8,
    // Configuraciones para mejorar la estabilidad
    keepBuffer: 2,
    updateWhenIdle: true,
    updateWhenZooming: false,
    // Manejo de errores
    errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
};

var weatherLayers = {
    clouds: L.tileLayer(`https://tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid=${apiKey}`, weatherLayerOptions),
    
    precipitation: L.tileLayer(`https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=${apiKey}`, weatherLayerOptions),
    
    temperature: L.tileLayer(`https://tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?appid=${apiKey}`, weatherLayerOptions),
    
    pressure: L.tileLayer(`https://tile.openweathermap.org/map/pressure/{z}/{x}/{y}.png?appid=${apiKey}`, weatherLayerOptions),
    
    wind: L.tileLayer(`https://tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?appid=${apiKey}`, weatherLayerOptions)
};

// Capas de overlay (superposición) - Las capas meteorológicas se manejan desde el sidebar
var overlayLayers = {
    // Aquí se pueden agregar otras capas de overlay si es necesario
};

// Usar mapa base oscuro para el tema futurista
baseLayers["CartoDB Dark Matter"].addTo(mapa);
window.capasControl = L.control.layers(baseLayers, overlayLayers, {
    position: 'topright',
    collapsed: false
}).addTo(mapa);

// Capa de prueba para verificar que el sistema funciona
var testLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    opacity: 0.3,
    attribution: 'Test layer'
});

// Capa de prueba meteorológica más visible
var testWeatherLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    opacity: 0.4,
    attribution: 'Test Weather Layer'
});

// Hacer las capas meteorológicas disponibles globalmente
window.weatherLayers = weatherLayers;
window.testLayer = testLayer;
window.testWeatherLayer = testWeatherLayer;
console.log('Capas meteorológicas creadas:', Object.keys(weatherLayers));
console.log('Capa de nubes:', weatherLayers.clouds);
console.log('Capa de prueba creada:', testLayer);
console.log('Capa de prueba meteorológica creada:', testWeatherLayer);
```

---

### --Html

#### ---lef.html

```html
<!DOCTYPE html>
<html lang="es">
    <head>
        <!-- Meta tags -->
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mapa Coroplético Interactivo de Tabasco</title>
        
        <!-- Fuentes futuristas -->
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        
        <!-- Estilos CSS modulares -->
        <link rel="stylesheet" href="/./Css/base.css">
        <link rel="stylesheet" href="/./Css/mapa.css">
        <link rel="stylesheet" href="/./Css/sidebar.css">
        <link rel="stylesheet" href="/./Css/efectos-futuristas.css">
        <link rel="stylesheet" href="/./Css/radar.css">
        <link rel="stylesheet" href="/./Css/meteoblue.css">
        <link rel="stylesheet" href="/./Css/comparador-sidebar.css">
        
        <!-- Leaflet Core -->
        <link rel="stylesheet" href="/./Plugins/leaflet.css" />
        <script src="/./Plugins/leaflet.js"></script>
        
        <!-- Leaflet Side-by-Side Plugin - USAR ESTA VERSIÓN -->
        <script src="https://lab.digital-democracy.org/leaflet-side-by-side/leaflet-side-by-side.js"></script>
        
        <!-- Leaflet Draw - Herramientas de dibujo -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"/>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>
        
        <!-- Leaflet MiniMap -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet-minimap/3.6.1/Control.MiniMap.min.css"/>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-minimap/3.6.1/Control.MiniMap.min.js"></script>
        
        <!-- Chart.js para gráficas -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    </head>
    

<body>

    <!-- Botón para mostrar el sidebar cuando está oculto (desktop) -->
    <button class="sidebar-toggle-btn" id="sidebar-toggle-btn" title="Mostrar menú" aria-label="Mostrar menú">
        <i class="fas fa-bars"></i>
    </button>

    <main class="main-container">
        <div id="contenedor-del-mapa"></div>
        
        <div id="meteoblue-overlay" aria-hidden="false">
            <iframe src="https://www.meteoblue.com/es/tiempo/mapas/widget?windAnimation=1&gust=1&satellite=1&cloudsAndPrecipitation=1&temperature=1&sunshine=1&extremeForecastIndex=1&geoloc=fixed&tempunit=C&windunit=km%252Fh&lengthunit=metric&zoom=6&autowidth=auto" 
            scrolling="no" allowtransparency="true" 
            sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
            <div id="meteoblue-attrib"><a href="https://www.meteoblue.com/es/tiempo/mapas/index" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline">meteoblue</a></div>
        </div>
        
        <button id="toggle-meteoblue-btn" type="button" aria-pressed="true" class="active">
            <i class="fa-solid fa-cloud"></i>
            <span>Meteoblue</span>
        </button>
        
        <button id="reset-zoom-btn" type="button" title="Restaurar zoom original">
            <i class="fas fa-home"></i>
        </button>

        <button id="toggle-graficas-btn" type="button" title="Mostrar/Ocultar Gráficas">
            <i class="fas fa-chart-bar"></i>
            <span>Gráficas</span>
        </button>

        <button id="comparador-barra-show" class="comparador-barra-show" title="Mostrar comparador" style="display: none;">
            <i class="fas fa-columns"></i>
            <span>Comparar</span>
        </button>
    </main>

    <!-- Popup flotante para mensajes -->
    <div id="popup-flotante" class="popup-flotante" style="display:none;">
        <div id="popup-contenido"></div>
    </div>

    <!-- Contenedor para cargar los efectos futuristas -->
    <div id="efectos-container"></div>

    <!-- Contenedor para cargar la barra lateral -->
    <div id="sidebar-container"></div>

    <!-- Contenedor para cargar el sidebar del comparador -->
    <div id="comparador-sidebar-container"></div>
    
    <!-- Contenedor para cargar el panel de gráficas -->
    <div id="graficas-container"></div>

    <script src="/./Layers/layer.js"></script>
    <script src="/./Js/wms-enhancer.js"></script> <script src="/./Js/datos-agua-loader.js"></script>
    <script src="/./Js/index.js"></script>
    <script src="/./Js/Dibujo_mnmapa.js"></script>
    <script src="/./Js/Puntos.js"></script>
    <script src="/./Js/mapa-agua.js"></script>
    <script src="/./Js/efectos-futuristas.js"></script>
    <script src="/./Js/comparador-agua.js"></script>

    <script>
        function loadExternalComponents() {
            // 1. Efectos
            fetch('/Html/efectos-futuristas.html')
                .then(res => res.text())
                .then(html => {
                    document.getElementById('efectos-container').innerHTML = html;
                    if(window.initializeAllFuturisticEffects) window.initializeAllFuturisticEffects();
                });

            // 2. Gráficas
            fetch('/Html/graficas-panel.html')
                .then(res => res.text())
                .then(html => {
                    document.getElementById('graficas-container').innerHTML = html;
                    if(window.initializeGraficasPanel) window.initializeGraficasPanel();
                });

            // 3. Sidebar Principal
            fetch('/Html/sidebar.html')
                .then(res => res.text())
                .then(html => {
                    document.getElementById('sidebar-container').innerHTML = html;
                    setTimeout(() => {
                        const layersControl = document.querySelector('.leaflet-control-layers');
                        const layersContainer = document.getElementById('layers-container');
                        if (layersControl && layersContainer) {
                            layersContainer.appendChild(layersControl);
                            layersControl.classList.remove('leaflet-control-layers-collapsed');
                        }
                        if(window.setupSidebarToggle) setupSidebarToggle();
                        if(window.configurarEventosPaneles) window.configurarEventosPaneles();
                        const sidebar = document.querySelector('.sidebar');
                        if(sidebar) {
                            sidebar.classList.remove('hidden');
                            document.body.classList.add('sidebar-open');
                        }
                    }, 500);
                });

            // 4. Comparador (Barra Inferior)
            fetch('/Html/comparador-sidebar.html')
                .then(res => res.text())
                .then(html => {
                    document.getElementById('comparador-sidebar-container').innerHTML = html;
                });
        }

        function setupSidebarToggle() {
            const sidebar = document.querySelector('.sidebar');
            const toggleBtn = document.getElementById('sidebar-toggle-btn');
            const closeBtn = document.getElementById('sidebar-close-btn');

            if (!sidebar) return;

            function toggleSidebar(show) {
                if (show) {
                    sidebar.classList.remove('hidden');
                    document.body.classList.add('sidebar-open');
                    if(toggleBtn) toggleBtn.style.display = 'none';
                } else {
                    sidebar.classList.add('hidden');
                    document.body.classList.remove('sidebar-open');
                    if(toggleBtn) toggleBtn.style.display = 'flex';
                }
            }

            if(toggleBtn) toggleBtn.onclick = (e) => { e.stopPropagation(); toggleSidebar(true); };
            if(closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); toggleSidebar(false); };
        }

        function setupMeteoblue() {
            const btn = document.getElementById('toggle-meteoblue-btn');
            const overlay = document.getElementById('meteoblue-overlay');
            if(btn && overlay) {
                let active = true;
                btn.onclick = () => {
                    active = !active;
                    overlay.style.display = active ? 'block' : 'none';
                    btn.classList.toggle('active', active);
                    const stats = document.querySelector('.stats-panel');
                    if(stats) stats.style.display = active ? 'none' : 'block';
                };
            }
        }

        function setupResetZoom() {
            const btn = document.getElementById('reset-zoom-btn');
            if(btn && window.mapa) {
                btn.onclick = () => window.mapa.setView([17.668, -91.539], 9);
            }
        }

        window.addEventListener('load', function() {
            loadExternalComponents();
            setTimeout(setupMeteoblue, 1000);
            setTimeout(setupResetZoom, 1000);
        });
    </script>
</body>
</html>
```

---

#### ---mapa-agua.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapa de Agua Temporal - Tabasco 2020</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="../Css/base.css">
  <link rel="stylesheet" href="../Css/mapa-agua.css">
</head>
<body>
  <header>
    <h1>Monitoreo de Agua Temporal - Tabasco 2020</h1>
    <p>Análisis de inundaciones y cuerpos de agua estacionales usando Sentinel-1 SAR</p>
  </header>

  <main class="contenedor-mapa">
    <div id="mapa-agua"></div>
    
    <button id="reset-zoom-btn" type="button" title="Restaurar zoom original">
        <i class="fas fa-home"></i>
    </button>
    
    <aside id="panel-info">
      <h3>Temporadas:</h3>
      <ul>
        <li><strong>Invierno:</strong> Enero - Marzo</li>
        <li><strong>Primavera:</strong> Marzo - Junio</li>
        <li><strong>Verano:</strong> Junio - Septiembre</li>
        <li><strong>Otoño:</strong> Septiembre - Diciembre</li>
      </ul>
      <h3>Metodología:</h3>
      <ul>
        <li>Datos: Sentinel-1 SAR (banda VV)</li>
        <li>Procesamiento: Google Earth Engine</li>
        <li>Filtrado: SNAP Desktop (Opening 3x5)</li>
        <li>Servidor: GeoServer</li>
        <li>Visualización: Leaflet</li>
      </ul>
    </aside>
  </main>

  <footer>
    <p>© 2025 - Proyecto de análisis hidrológico | Datos: Copernicus Sentinel-1</p>
  </footer>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  
  <script src="../Js/wms-enhancer.js"></script>
  
  <script>
    (function() {
      var mapa = L.map('mapa-agua', { zoomControl: true }).setView([17.725, -91.457], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapa);
      window.mapa = mapa;
      window.map = mapa;
    })();
  </script>
  
  <script src="../Js/mapa-agua.js"></script>
  
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        var resetZoomBtn = document.getElementById('reset-zoom-btn');
        if (resetZoomBtn) {
          resetZoomBtn.addEventListener('click', function() {
            var mapInstance = window.mapa || window.map;
            if (mapInstance && typeof mapInstance.setView === 'function') {
              mapInstance.setView([17.725, -91.457], 10);
            } else {
              console.error('No se pudo encontrar el mapa para resetear el zoom');
            }
          });
        }
      }, 1000);
    });
  </script>
</body>
</html>
```

---

#### ---sidebar.html

```html
<aside id="sidebar" class="sidebar">
    
    <div class="sidebar-topbar">
        <div class="sidebar-topbar-title">MENÚ PRINCIPAL</div>
        <button id="sidebar-close-btn" class="sidebar-close-btn" title="Cerrar menú" aria-label="Cerrar menú">
            <i class="fas fa-times"></i>
        </button>
    </div>
    
    <section class="sidebar-section">
        <div class="section-header" onclick="toggleSection('drawing-section')">
            <span class="section-icon">✏️</span>
            <span class="section-title">Herramientas de Dibujo</span>
            <span class="section-toggle" id="drawing-toggle">▼</span>
        </div>
        
        <div class="section-content" id="drawing-section">
            <div class="tools-group">
                <h4>Dibujar</h4>
                <div class="tools-grid">
                    <button class="tool-btn" onclick="activateDrawTool('marker')" title="Marcador">📍 Marcador</button>
                    <button class="tool-btn" onclick="activateDrawTool('polyline')" title="Línea">📏 Línea</button>
                    <button class="tool-btn" onclick="activateDrawTool('rectangle')" title="Rectángulo">🔲 Rectángulo</button>
                    <button class="tool-btn" onclick="activateDrawTool('circle')" title="Círculo">⭕ Círculo</button>
                    <button class="tool-btn" onclick="activateDrawTool('polygon')" title="Polígono">🔺 Polígono</button>
                </div>
            </div>
            <div class="tools-group">
                <h4>Editar</h4>
                <div class="actions-grid">
                    <button class="tool-btn edit-btn" onclick="toggleEditMode()" title="Editar dibujos">✏️ Editar</button>
                    <button class="tool-btn delete-btn" onclick="clearAllDrawings()" title="Eliminar todos los dibujos">🗑️ Limpiar</button>
                </div>
            </div>

            <div class="tools-group">
                <h4>Exportar</h4>
                <button id="export" class="export-btn">📥 Exportar Dibujos (0)</button>
            </div>
        </div>
    </section>

    <section class="sidebar-section">
        <div class="section-header" onclick="toggleSection('layers-section')">
            <span class="section-icon">🗺️</span>
            <span class="section-title">Capas del Mapa</span>
            <span class="section-toggle" id="layers-toggle">▼</span>
        </div>
        
        <div class="section-content" id="layers-section">
            <div class="layers-container" id="layers-container">
                </div>
        </div>
    </section>

    <section class="sidebar-section">
        <div class="section-header" onclick="toggleSection('agua-temporal-section')">
            <span class="section-icon">💧</span>
            <span class="section-title">Agua Temporal 2020</span>
            <span class="section-toggle" id="agua-temporal-toggle">▼</span>
        </div>
        <div class="section-content" id="agua-temporal-section">
            <div class="tools-group">
                <h4>Temporadas Detectadas</h4>
                <p class="section-description">Cuerpos de agua detectados con Sentinel-1 SAR</p>
                <div class="agua-temporal-controls">
                    <label class="agua-layer-item">
                        <input type="checkbox" id="agua-invierno" onchange="toggleAguaLayer('invierno', this.checked)">
                        <span class="layer-color" style="background: #06b6d4;"></span>
                        <span>Invierno</span>
                    </label>
                    <label class="agua-layer-item">
                        <input type="checkbox" id="agua-primavera" onchange="toggleAguaLayer('primavera', this.checked)">
                        <span class="layer-color" style="background: #3b82f6;"></span>
                        <span>Primavera</span>
                    </label>
                    <label class="agua-layer-item">
                        <input type="checkbox" id="agua-verano" onchange="toggleAguaLayer('verano', this.checked)">
                        <span class="layer-color" style="background: #eab308;"></span>
                        <span>Verano</span>
                    </label>
                    <label class="agua-layer-item">
                        <input type="checkbox" id="agua-otono" onchange="toggleAguaLayer('otono', this.checked)">
                        <span class="layer-color" style="background: #f97316;"></span>
                        <span>Otoño</span>
                    </label>
                </div>
                <div class="agua-actions" style="margin-top: 15px;">
                    <button class="tool-btn" onclick="activarTodasLasCapasAgua()" title="Mostrar todas">Mostrar Todas</button>
                    <button class="tool-btn delete-btn" onclick="desactivarTodasLasCapasAgua()" title="Ocultar todas">Ocultar Todas</button>
                </div>
                <div class="agua-info" style="margin-top: 15px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 5px;">
                    <p style="margin: 0; font-size: 0.85em; color: #64748b;">
                        <strong>Fuente:</strong> Sentinel-1 GRD<br>
                        <strong>Procesamiento:</strong> GEE & SNAP<br>
                        <strong>Servidor:</strong> GeoServer
                    </p>
                </div>
            </div>
        </div>
    </section>
    <section class="sidebar-section">
        <div class="section-header radar-header" onclick="toggleRadarSection()">
            <span class="section-icon">📡</span>
            <span class="section-title">Sistema Radar</span>
            <span class="section-toggle" id="radar-toggle">▼</span>
        </div>
        <div class="section-content show" id="radar-section">
            <div class="radar-container">
                <div class="radar-screen">
                    <div class="radar-grid"></div>
                    <div class="radar-sweep"></div>
                    </div>
                <div class="radar-label">
                    <i class="fas fa-radar"></i> Monitoreo Activo
                </div>
                <div class="radar-stats">
                    <div class="radar-stat-item">
                        <span>Objetos detectados:</span>
                        <span class="radar-stat-value" id="radar-objects">0</span>
                    </div>
                    <div class="radar-stat-item">
                        <span>Última actualización:</span>
                        <span class="radar-stat-value" id="radar-time">--:--</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</aside>
```

---

#### ---comparador-sidebar.html

```html
<div id="comparador-barra" class="comparador-barra-inferior">
  <div class="comparador-barra-content comp-grid">
    
    <section class="comp-sec comp-sec-close">
      <button id="comparador-barra-close" class="comparador-barra-close" title="Ocultar comparador" aria-label="Ocultar comparador">✕</button>
    </section>

    <section class="comp-sec comp-sec-1">
      <div class="comp-modes">
        <button class="mode-btn" id="comparador-barra-btn-mode-animate" onclick="cambiarModoComparadorBarra('animate')" title="Modo Animación">
          <i class="fas fa-play-circle"></i> ANIMAR
        </button>
        <button class="mode-btn active" id="comparador-barra-btn-mode-swipe" onclick="cambiarModoComparadorBarra('swipe')" title="Modo Barrido">
          <i class="fas fa-grip-lines-vertical"></i> BARRIDO
        </button>
      </div>
    </section>
    
    <section class="comp-sec comp-sec-2">
      <div class="comp-date-header">
        <div class="date-actions">
          <button class="link-btn" title="Descargar GeoTIFF"><i class="fas fa-download"></i><span>GeoTIFF</span></button>
          
          <button id="comparador-activar-top" class="link-btn link-activate" title="Cargar Capas" onclick="activarComparadorBarra()">
            <i class="fas fa-play"></i><span>ACTIVAR</span>
          </button>
          
          <button id="comparador-desactivar-top" class="link-btn link-deactivate" title="Limpiar Mapa" style="display:none;" onclick="desactivarComparadorBarra()">
            <i class="fas fa-stop"></i><span>DETENER</span>
          </button>

          <button class="link-btn" onclick="actualizarComparadorBarra()" title="Refrescar visualización">
            <i class="fas fa-sync"></i>
          </button>
        </div>
      </div>

      <div class="date-centered"><span>Comparar períodos</span></div>

      <div class="comparador-barra-selectores">
        <div class="comparador-barra-col">
          <label class="comp-col-title">Izquierda</label>
          <div class="select-pair">
            <select id="comparador-barra-year-left" class="comparador-select">
              </select>
            <select id="comparador-barra-season-left" class="comparador-select small">
              <option value="Invierno">Invierno</option>
              <option value="Primavera">Primavera</option>
              <option value="Verano">Verano</option>
              <option value="Otonio">Otoño</option>
            </select>
          </div>
        </div>

        <div style="width: 1px; background: rgba(0,212,255,0.3); margin: 0 10px; height: 30px; align-self: center;"></div>

        <div class="comparador-barra-col">
          <label class="comp-col-title">Derecha</label>
          <div class="select-pair">
            <select id="comparador-barra-year-right" class="comparador-select">
              </select>
            <select id="comparador-barra-season-right" class="comparador-select small">
              <option value="Invierno">Invierno</option>
              <option value="Primavera">Primavera</option>
              <option value="Verano" selected>Verano</option>
              <option value="Otonio">Otoño</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="comp-sec comp-sec-3">
      <div class="water-summary" style="align-items: center; width: 100%;">
        <span class="ws-title" style="margin-bottom: 8px;">ANÁLISIS DE RIESGO</span>
        
        <button id="btn-riesgo-barra" 
                onclick="toggleRiesgoBarra()" 
                class="mode-btn" 
                style="width: 100%; justify-content: center; border-color: #ff4444; color: #ffaaaa;">
          <i class="fas fa-exclamation-triangle"></i> ZONAS NO APTAS
        </button>
      </div>
    </section>

  </div>
</div>

<button id="comparador-barra-show" class="comparador-barra-show" title="Mostrar comparador" aria-label="Mostrar comparador" style="display:none;">
  <i class="fas fa-columns"></i>
  <span>Comparar</span>
</button>
```

---

#### ---efectos-futuristas.html

```html
<canvas id="particles"></canvas>

<div class="title-header">
    <i class="fas fa-satellite"></i> SISTEMA DE MONITOREO - TABASCO
</div>

<div class="stats-panel">
    <div class="stats-header" onclick="toggleStatsPanel()">
        <h3 style="margin: 0; font-size: 14px; text-transform: uppercase; text-align: center; letter-spacing: 1px; text-shadow: 0 0 10px #00ffe7; color: #00ffe7; font-weight: bold; flex: 1;">
            <i class="fas fa-chart-line"></i> Estadísticas
        </h3>
        <span class="stats-toggle" id="stats-toggle">▼</span>
    </div>
    
    <div class="stats-content" id="stats-content">
        <div class="stats-item">
            <span>Municipios:</span>
            <span class="stats-value">17</span>
        </div>
        
        <div class="stats-item">
            <span>Latitud:</span>
            <span class="stats-value" id="currentLat">--</span>
        </div>
        <div class="stats-item">
            <span>Longitud:</span>
            <span class="stats-value" id="currentLng">--</span>
        </div>

        <div class="stats-item">
            <span>Estado del Sistema:</span>
            <span class="stats-value" style="color: #00ff00;">
                <i class="fas fa-circle" style="font-size: 8px; animation: pulse 1.5s infinite;"></i> ACTIVO
            </span>
        </div>
    </div>
</div>
```

---

#### ---graficas-panel.html

```html
<div class="graficas-panel" id="graficas-panel">
    <div class="graficas-header" id="graficas-header">
        <h3 style="margin: 0; font-size: 14px; text-transform: uppercase; text-align: center; letter-spacing: 1px; text-shadow: 0 0 10px #00ffe7; color: #00ffe7; font-weight: bold; flex: 1; cursor: move;">
            <i class="fas fa-chart-bar"></i> Gráficas de Cobertura
        </h3>
        <div class="graficas-window-controls">
            <button class="graficas-control-btn graficas-maximize" id="graficas-maximize" title="Maximizar" aria-label="Maximizar">
                <span class="control-icon maximize-icon"></span>
            </button>
            <button class="graficas-control-btn graficas-minimize" id="graficas-minimize" title="Minimizar" aria-label="Minimizar">
                <span class="control-icon minimize-icon"></span>
            </button>
        </div>
    </div>
    
    <div class="graficas-content" id="graficas-content">
        <div class="graficas-type-selector">
            <label>Tipo de gráfica:</label>
            <select id="graficas-type-select" class="graficas-select">
                <option value="temporadas" selected>Temporadas (Invierno, Primavera, Verano, Otoño) - km²</option>
                <option value="inundacion">Inundación (Antes, Durante, Después) - km²</option>
            </select>
        </div>
        
        <div class="graficas-selectors">
            <div class="grafica-selector-group">
                <label>Izquierda:</label>
                <select id="graficas-year-left" class="graficas-select">
                    </select>
            </div>
            <div class="grafica-selector-group">
                <label>Derecha:</label>
                <select id="graficas-year-right" class="graficas-select">
                    </select>
            </div>
        </div>
        
        <div class="graficas-container">
            <div class="grafica-item">
                <label>IZQUIERDA</label>
                <canvas id="chart-left"></canvas>
            </div>
            <div class="grafica-item">
                <label>DERECHA</label>
                <canvas id="chart-right"></canvas>
            </div>
        </div>
    </div>
</div>

<button id="toggle-graficas-btn" type="button" title="Mostrar/Ocultar Gráficas" aria-label="Mostrar/Ocultar Gráficas">
    <i class="fas fa-chart-bar"></i>
    <span>Gráficas</span>
</button>
```

---

---

### --Js

#### ---mapa-agua.js

```javascript
/**
 * Lógica para el modo de mapa simple (sin comparador)
 */

// Estado interno
const estadoMapa = {
    mapa: null,
    capaActual: null,
    leyenda: null
};

function buscarMapa() {
    return window.mapa || window.map || null;
}

// Inicializar y mostrar una capa específica
async function cambiarCapaPrincipal(temporada) {
    const mapa = buscarMapa();
    if (!mapa) return;

    const year = 2020; 

    // Limpiar capa anterior
    if (estadoMapa.capaActual) {
        mapa.removeLayer(estadoMapa.capaActual);
    }

    console.log(`🌊 Cargando capa principal: ${temporada} ${year}`);

    // Usar el Enhancer para crear la capa correctamente
    const capa = await window.wmsEnhancer.crearCapaComparacion(year, temporada);
    
    if (capa) {
        capa.addTo(mapa);
        estadoMapa.capaActual = capa;
    } else {
        alert("No se pudo cargar la capa para esta temporada/año.");
    }
}

function inicializarLeyenda() {
    const mapa = buscarMapa();
    if (!mapa || estadoMapa.leyenda) return;

    const leyenda = L.control({ position: 'bottomright' });
    leyenda.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend leyenda-agua');
        div.innerHTML = 
            '<h4>Clasificación Sentinel-1</h4>' +
            '<i style="background:#003366"></i> Agua Permanente<br>' +
            '<i style="background:#66CCFF"></i> Inundación Temporal';
        return div;
    };
    leyenda.addTo(mapa);
    estadoMapa.leyenda = leyenda;
}

// Función global para los checkboxes del sidebar.html
window.toggleAguaLayer = function(temporada, activo) {
    if (activo) {
        cambiarCapaPrincipal(temporada);
    } else {
        if (estadoMapa.capaActual) {
            buscarMapa().removeLayer(estadoMapa.capaActual);
            estadoMapa.capaActual = null;
        }
    }
};

window.activarTodasLasCapasAgua = function() {
    alert("Función no recomendada: Superponer 4 capas WMS saturará la vista. Seleccione una temporada.");
};

window.desactivarTodasLasCapasAgua = function() {
    const mapa = buscarMapa();
    if (estadoMapa.capaActual && mapa) {
        mapa.removeLayer(estadoMapa.capaActual);
        estadoMapa.capaActual = null;
    }
    document.querySelectorAll('.agua-layer-item input').forEach(el => el.checked = false);
};

window.addEventListener('load', function() {
    setTimeout(() => {
        inicializarLeyenda();
    }, 2000);
});
```

---

#### ---index.js

```javascript
var tabascoLayer;
var municipioLayers = {};
var todasLasZonas;

// Configuración de subregiones con sus municipios
const configuracionSubregiones = {
  'Centro': { municipios: ['Centro', 'Jalpa de Méndez', 'Nacajuca'] },
  'Chontalpa': { municipios: ['Cárdenas', 'Comalcalco', 'Cunduacán', 'Huimanguillo', 'Paraíso'] },
  'Sierra': { municipios: ['Jalapa', 'Tacotalpa', 'Teapa'] },
  'Pantanos': { municipios: ['Centla', 'Jonuta', 'Macuspana'] },
  'Ríos': { municipios: ['Balancán', 'Emiliano Zapata', 'Tenosique'] }
};

// --- FUNCIONES DE UTILIDAD GEOMÉTRICA (Optimizadas y extraídas) ---
function isPointInPolygon(point, latlngs) {
  let inside = false;
  for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
    const xi = latlngs[i].lng, yi = latlngs[i].lat;
    const xj = latlngs[j].lng, yj = latlngs[j].lat;
    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function findCandidatePositions(bounds, polygonLatLngs) {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const candidatePoints = [];
  const gridSize = 5;
  const latStep = (ne.lat - sw.lat) / gridSize;
  const lngStep = (ne.lng - sw.lng) / gridSize;
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const lat = sw.lat + (latStep * i);
      const lng = sw.lng + (lngStep * j);
      const point = L.latLng(lat, lng);
      if (isPointInPolygon(point, polygonLatLngs)) candidatePoints.push(point);
    }
  }
  const center = bounds.getCenter();
  if (isPointInPolygon(center, polygonLatLngs)) candidatePoints.unshift(center);
  return candidatePoints.slice(0, 20);
}

// --- LÓGICA PRINCIPAL ---
fetch("/GeoJSON/Tabasco.json")
  .then(response => response.json())
  .then(data => {
    const mapa = window.mapa || window.map;
    const municipios = data;
    const municipiosUnicos = {};

    municipios.forEach(municipio => {
      const nombre = municipio.mun_name[0];
      if (!municipiosUnicos[nombre]) municipiosUnicos[nombre] = municipio;
    });

    function getColor(subregion) {
      const colorMap = {
        'Centro': '#FF8000', 'Chontalpa': '#33FF57',
        'Sierra': '#FFD700', 'Pantanos': '#FF5733', 'Ríos': '#3357FF'
      };
      return colorMap[subregion] || '#FFEDA0';
    }

    function obtenerSubregionMunicipio(nombreMunicipio) {
      for (const [subregion, config] of Object.entries(configuracionSubregiones)) {
        if (config.municipios.includes(nombreMunicipio)) return subregion;
      }
      return 'No definida';
    }

    function style(feature) {
      const subregion = obtenerSubregionMunicipio(feature.properties.name);
      
      return {
        fillColor: getColor(subregion),
        weight: 5,
        opacity: 0.25,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.4
      };
    }

    function gestionarEtiquetaInteligente(layer) {
      const nombreMunicipio = layer.feature.properties.name;
      const bounds = layer.getBounds();
      if (layer._municipioLabel) {
        if(mapa.hasLayer(layer._municipioLabel)) mapa.removeLayer(layer._municipioLabel);
        layer._municipioLabel = null;
      }
      let center = bounds.getCenter();
      try { if (layer.getCenter) center = layer.getCenter(); } catch (e) {}
      const pointNE = mapa.latLngToContainerPoint(bounds.getNorthEast());
      const pointSW = mapa.latLngToContainerPoint(bounds.getSouthWest());
      const minSize = Math.min(Math.abs(pointNE.x - pointSW.x), Math.abs(pointNE.y - pointSW.y));
      let fontSize = Math.max(8, Math.min(12, Math.floor(minSize / 25)));
      if (nombreMunicipio.length > 20) fontSize = Math.max(8, fontSize - 2);
      else if (nombreMunicipio.length > 15) fontSize = Math.max(8, fontSize - 1);
      layer._municipioLabel = L.marker(center, {
        icon: L.divIcon({
          className: 'municipio-label',
          html: `<div class="municipio-label-content" style="font-size: ${fontSize}px;">${nombreMunicipio}</div>`,
          iconSize: [null, null],
          iconAnchor: [0, 0]
        }),
        interactive: false,
        zIndexOffset: 500
      }).addTo(mapa);
      setTimeout(() => {
        if (!layer._municipioLabel) return;
        const content = layer._municipioLabel.getElement()?.querySelector('.municipio-label-content');
        if (content) content.style.transform = 'translate(-50%, -50%)';
      }, 20);
    }

    function highlightFeature(e) {
      const layer = e.target;
      layer.setStyle({ weight: 5, color: '#666', dashArray: '', fillOpacity: 0.3 });
      if (!layer._municipioLabel) gestionarEtiquetaInteligente(layer);
      if (window.infoControl) window.infoControl.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      const layer = e.target;
      if (layer._municipioLabel) {
        mapa.removeLayer(layer._municipioLabel);
        layer._municipioLabel = null;
      }
      if (window.geojson) window.geojson.resetStyle(layer);
      if (window.infoControl) window.infoControl.update({});
    }

    function zoomToFeature(e) {
      mapa.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
      layer.on({ mouseover: highlightFeature, mouseout: resetHighlight, click: zoomToFeature });
    }

    const municipiosGeoJSON = {
      type: "FeatureCollection",
      features: Object.values(municipiosUnicos).map(m => ({
        type: "Feature",
        geometry: m.geo_shape.geometry,
        properties: {
          name: m.mun_name[0],
          code: m.mun_code[0],
          subregion: obtenerSubregionMunicipio(m.mun_name[0])
        }
      }))
    };

    window.geojson = L.geoJSON(municipiosGeoJSON, {
      style: style,
      onEachFeature: onEachFeature
    });

    const capasMunicipiosIndividuales = {};
    Object.values(municipiosUnicos).forEach((m) => {
      const nombre = m.mun_name[0];
      const feat = {
        type: "Feature", geometry: m.geo_shape.geometry,
        properties: { name: nombre, code: m.mun_code[0], subregion: obtenerSubregionMunicipio(nombre) }
      };
      capasMunicipiosIndividuales[nombre] = L.geoJSON(feat, { style: style, onEachFeature: onEachFeature });
    });

    todasLasZonas = L.layerGroup(Object.values(capasMunicipiosIndividuales));
    todasLasZonas.addTo(mapa);

    const gruposSubregiones = {};
    Object.entries(configuracionSubregiones).forEach(([nombreSub, config]) => {
      const layers = config.municipios
        .filter(n => capasMunicipiosIndividuales[n])
        .map(n => capasMunicipiosIndividuales[n]);
      gruposSubregiones[nombreSub] = L.layerGroup(layers);
    });

    window.infoControl = L.control({position: 'bottomright'});
    window.infoControl.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    window.infoControl.update = function (props) {
      const nombre = props && props.name ? props.name : '—';
      const codigo = props && props.code ? props.code : '—';
      const subregion = props && props.subregion ? props.subregion : '—';
      this._div.innerHTML = (props && props.name) ?
        `<h4>MUNICIPIO</h4><b>${nombre}</b><br/>Código: ${codigo}<br/>Subregión: ${subregion}` :
        '<h4>MUNICIPIO</h4>Pase el cursor sobre un municipio';
    };
    window.infoControl.addTo(mapa);

    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML += '<h4>Subregiones</h4>';
      Object.keys(configuracionSubregiones).forEach(sub => {
        div.innerHTML += `<i style="background:${getColor(sub)}"></i> ${sub}<br>`;
      });
      return div;
    };
    legend.addTo(mapa);

    if (window.capasControl) {
      window.capasControl.addOverlay(todasLasZonas, "🗺️ Todas las Zonas");
      window.capasControl.addOverlay(gruposSubregiones['Ríos'], "🌊 Ríos");
      window.capasControl.addOverlay(gruposSubregiones['Centro'], "🏛️ Centro");
      window.capasControl.addOverlay(gruposSubregiones['Sierra'], "🏔️ Sierra");
      window.capasControl.addOverlay(gruposSubregiones['Pantanos'], "🌿 Pantanos");
      window.capasControl.addOverlay(gruposSubregiones['Chontalpa'], "🌴 Chontalpa");
    }

    const updateVisibleLabels = () => {
      if (!window.geojson) return;
      const mapBounds = mapa.getBounds();
      window.geojson.eachLayer((layer) => {
        if (layer.feature && mapa.hasLayer(layer)) {
          const bounds = layer.getBounds();
          if (bounds.intersects(mapBounds)) {
            if (mapa.getZoom() > 8) {
              if (!layer._municipioLabel) gestionarEtiquetaInteligente(layer);
            } else {
              if (layer._municipioLabel) {
                mapa.removeLayer(layer._municipioLabel);
                layer._municipioLabel = null;
              }
            }
          }
        }
      });
    };

    mapa.on('zoomend moveend', updateVisibleLabels);
    
    console.log(`✅ Cargados ${Object.keys(municipiosUnicos).length} municipios de Tabasco`);
  })
  .catch(err => console.error("Error cargando GeoJSON:", err));
```

---

#### ---comparador-agua.js

```javascript
// Configuración básica
const comparadorConfig = {
    minYear: 2017,
    maxYear: 2026,
    defaultSeason: 'Verano'
};

// Variables globales del comparador barra lateral
let comparadorBarraActivo = false;
let sideBySideControlBarra = null;
let capaIzquierdaBarra = null;
let capaDerechaBarra = null;
let mapaComparadorBarra = null;

// Variable para la capa de riesgo (Zonas No Aptas)
let capaRiesgoBarra = null;

// Referencias a gráficas
let chartLeft = null;
let chartRight = null;
let datosCSVCargados = false;

// --- FUNCIONES UTILITARIAS ---

function mostrarAlertaEnMapa(mensaje, duracionMs = 3500) {
    try {
        const container = document.body;
        const div = document.createElement('div');
        div.className = 'map-alert';
        Object.assign(div.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: '10000', padding: '15px 20px', border: '1px solid #00ffe7',
            borderRadius: '8px', background: 'rgba(5,10,25,0.95)', color: '#00ffe7',
            fontFamily: 'Orbitron, sans-serif', fontSize: '14px', pointerEvents: 'none',
            boxShadow: '0 0 20px rgba(0,255,231,0.3)'
        });
        div.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${mensaje}`;
        container.appendChild(div);
        setTimeout(() => div.remove(), duracionMs);
    } catch (e) { alert(mensaje); }
}

function inicializarComparadorBarra() {
    mapaComparadorBarra = window.mapa || window.map;
    if (!mapaComparadorBarra) {
        console.warn('⚠️ Esperando mapa para el comparador...');
        setTimeout(inicializarComparadorBarra, 1000);
        return;
    }
    
    // Llenar selectores de años dinámicamente
    llenarSelectoresAnios();
    
    // Al cambiar año o temporada en el comparador, actualizar las capas del mapa
    const yearLeftEl = document.getElementById('comparador-barra-year-left');
    const yearRightEl = document.getElementById('comparador-barra-year-right');
    const seasonLeftEl = document.getElementById('comparador-barra-season-left');
    const seasonRightEl = document.getElementById('comparador-barra-season-right');
    [yearLeftEl, yearRightEl, seasonLeftEl, seasonRightEl].forEach(el => {
        if (el) el.addEventListener('change', () => {
            if (comparadorBarraActivo) actualizarComparadorBarra();
        });
    });
    
    // Iniciar lógica de botones (Mostrar/Ocultar barra)
    iniciarLogicaUI();
    
    console.log('✅ Comparador barra inicializado');
}

function llenarSelectoresAnios() {
    const selectsIds = ['comparador-barra-year-left', 'comparador-barra-year-right'];
    let htmlOptions = '';
    
    for (let y = comparadorConfig.minYear; y <= comparadorConfig.maxYear; y++) {
        htmlOptions += `<option value="${y}">${y}</option>`;
    }
    
    selectsIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const val = el.value;
            el.innerHTML = htmlOptions;
            if(val && val >= comparadorConfig.minYear) el.value = val;
            else {
                if(id.includes('left')) el.value = "2020";
                if(id.includes('right')) el.value = "2024";
            }
        }
    });
}

// --- LÓGICA DE INTERFAZ (UI) ---

function iniciarLogicaUI() {
    const bar = document.getElementById('comparador-barra');
    const closeBtn = document.getElementById('comparador-barra-close');
    const showBtn = document.getElementById('comparador-barra-show');

    if (!bar || !showBtn) return;

    if(closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); ocultarBarra(); };
    if(showBtn) showBtn.onclick = (e) => { e.stopPropagation(); mostrarBarra(); };

    // Estado inicial
    if (!bar.classList.contains('hidden')) {
        showBtn.style.display = 'none';
        document.documentElement.style.setProperty('--bottom-safe', '120px');
    }
}

function ocultarBarra() {
    document.getElementById('comparador-barra').classList.add('hidden');
    document.getElementById('comparador-barra-show').style.display = 'inline-flex';
    document.documentElement.style.setProperty('--bottom-safe', '0');
}

function mostrarBarra() {
    document.getElementById('comparador-barra').classList.remove('hidden');
    document.getElementById('comparador-barra-show').style.display = 'none';
    document.documentElement.style.setProperty('--bottom-safe', '120px');
}

// --- CONTROL DE ZONAS NO APTAS (RIESGO) + GRÁFICAS ---

function toggleRiesgoBarra() {
    const btn = document.getElementById('btn-riesgo-barra');
    if (!btn) return;

    const estaActivo = btn.classList.contains('active');

    if (!estaActivo) {
        mostrarAlertaEnMapa("⚠️ Mostrando Zonas de Alto Riesgo (>30% Frecuencia)");
        
        if (!capaRiesgoBarra) {
            capaRiesgoBarra = L.tileLayer.wms("http://localhost:8080/geoserver/agua_subregion_rios/wms", {
                layers: 'agua_subregion_rios:riesgo_inundacion_permanente',
                format: 'image/png',
                transparent: true,
                version: '1.1.0',
                styles: 'estilo_riesgo_inundacion', 
                opacity: 0.9,
                zIndex: 2000
            });
        }
        capaRiesgoBarra.addTo(mapaComparadorBarra);
        
        btn.classList.add('active');
        btn.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        btn.style.borderColor = '#ff0000';
        btn.style.color = '#ffaaaa';
        btn.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.4)';

        if (typeof window.actualizarGraficas === 'function') {
            window.actualizarGraficas();
        }

        const panelGraficas = document.querySelector('.graficas-panel');
        const btnGraficasFloat = document.getElementById('toggle-graficas-btn');

        if (panelGraficas && !panelGraficas.classList.contains('visible')) {
            panelGraficas.classList.add('visible');
            if (btnGraficasFloat) btnGraficasFloat.classList.add('active');
        }
        
    } else {
        if (capaRiesgoBarra) {
            mapaComparadorBarra.removeLayer(capaRiesgoBarra);
        }
        
        btn.classList.remove('active');
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.style.boxShadow = '';

        const panelGraficas = document.getElementById('graficas-panel');
        const btnGraficasFloat = document.getElementById('toggle-graficas-btn');
        if (panelGraficas) {
            panelGraficas.classList.remove('visible');
            panelGraficas.classList.remove('minimized');
        }
        if (btnGraficasFloat) btnGraficasFloat.classList.remove('active');
    }
}

// --- LÓGICA PRINCIPAL DEL COMPARADOR ---

async function activarComparadorBarra() {
    if (comparadorBarraActivo) return;

    // Obtener valores
    const yearLeft = document.getElementById('comparador-barra-year-left').value;
    const seasonLeft = document.getElementById('comparador-barra-season-left').value;
    const yearRight = document.getElementById('comparador-barra-year-right').value;
    const seasonRight = document.getElementById('comparador-barra-season-right').value;

    mostrarAlertaEnMapa("Cargando capas satelitales...", 1500);

    try {
        // Usar wmsEnhancer
        capaIzquierdaBarra = await window.wmsEnhancer.crearCapaComparacion(yearLeft, seasonLeft);
        capaDerechaBarra = await window.wmsEnhancer.crearCapaComparacion(yearRight, seasonRight);

        if(capaIzquierdaBarra) capaIzquierdaBarra.addTo(mapaComparadorBarra);
        if(capaDerechaBarra) capaDerechaBarra.addTo(mapaComparadorBarra);

        // Crear control SideBySide si ambas capas existen
        if (capaIzquierdaBarra && capaDerechaBarra) {
            sideBySideControlBarra = L.control.sideBySide(capaIzquierdaBarra, capaDerechaBarra);
            sideBySideControlBarra.addTo(mapaComparadorBarra);
            setupDivisorEvents();
        } else {
            mostrarAlertaEnMapa("Advertencia: Faltan datos para una de las fechas.");
        }

        // Actualizar gráficas
        if(window.actualizarGraficas) await window.actualizarGraficas();

        // UI Updates
        comparadorBarraActivo = true;
        document.getElementById('comparador-barra').classList.add('activo');
        toggleBotonesControl(true);

        console.log(`✅ Comparando: ${yearLeft} (${seasonLeft}) vs ${yearRight} (${seasonRight})`);

    } catch (error) {
        console.error("Error activando comparador:", error);
        mostrarAlertaEnMapa("Error crítico al cargar capas.");
    }
}

function desactivarComparadorBarra() {
    if (!comparadorBarraActivo) return;

    if (sideBySideControlBarra) {
        sideBySideControlBarra.remove();
        sideBySideControlBarra = null;
    }
    if (capaIzquierdaBarra) mapaComparadorBarra.removeLayer(capaIzquierdaBarra);
    if (capaDerechaBarra) mapaComparadorBarra.removeLayer(capaDerechaBarra);

    capaIzquierdaBarra = null;
    capaDerechaBarra = null;
    comparadorBarraActivo = false;

    document.getElementById('comparador-barra').classList.remove('activo');
    toggleBotonesControl(false);
    console.log('✅ Comparador desactivado');
}

// Función para el botón de Refrescar (Actualizar)
async function actualizarComparadorBarra() {
    if (comparadorBarraActivo) {
        // Limpiar capas anteriores
        if (capaIzquierdaBarra) mapaComparadorBarra.removeLayer(capaIzquierdaBarra);
        if (capaDerechaBarra) mapaComparadorBarra.removeLayer(capaDerechaBarra);
        if (sideBySideControlBarra) sideBySideControlBarra.remove();
        comparadorBarraActivo = false;
    }
    // Volver a activar con los nuevos valores
    await activarComparadorBarra();
}

// --- UTILIDADES UI ---

function toggleBotonesControl(activo) {
    const btnActivate = document.getElementById('comparador-activar-top');
    const btnDeactivate = document.getElementById('comparador-desactivar-top');
    
    if(btnActivate) btnActivate.style.display = activo ? 'none' : 'inline-flex';
    if(btnDeactivate) btnDeactivate.style.display = activo ? 'inline-flex' : 'none';
}

function setupDivisorEvents() {
    setTimeout(() => {
        const rangeInput = document.querySelector('.leaflet-sbs-range');
        if (rangeInput) {
            ['mousedown', 'touchstart'].forEach(evt => 
                rangeInput.addEventListener(evt, (e) => {
                    mapaComparadorBarra.dragging.disable();
                    e.stopPropagation();
                })
            );
            ['mouseup', 'touchend'].forEach(evt => 
                rangeInput.addEventListener(evt, () => mapaComparadorBarra.dragging.enable())
            );
        }
    }, 500);
}

function cambiarModoComparadorBarra(modo) {
    const btns = document.querySelectorAll('.mode-btn');
    btns.forEach(b => b.classList.remove('active'));
    
    const btn = document.getElementById(`comparador-barra-btn-mode-${modo}`);
    if(btn) btn.classList.add('active');
    
    console.log("Modo cambiado a:", modo);
}

// --- GRÁFICAS (Chart.js) ---

async function cargarDatosCSV() {
    if (datosCSVCargados) return true;
    if (!window.datosAgua) {
        console.warn('datosAgua no cargado');
        return false;
    }
    const rutas = ['/Datos/agua_tabasco_datos.csv', '/./Datos/agua_tabasco_datos.csv', 'Datos/agua_tabasco_datos.csv'];
    for (const url of rutas) {
        try {
            await window.datosAgua.cargarDesdeCSV(url);
            if (window.datosAgua.datos && window.datosAgua.datos.length > 0) {
                datosCSVCargados = true;
                return true;
            }
        } catch (e) {
            console.warn('CSV no encontrado en', url, e.message);
        }
    }
    console.error('No se pudo cargar el CSV en ninguna ruta');
    return false;
}

function crearGrafica(canvasId, year, tipo) {
    const panel = document.getElementById('graficas-panel');
    const canvas = panel ? panel.querySelector('#' + canvasId) : document.getElementById(canvasId);
    if (!canvas) return;

    if (canvasId === 'chart-left' && chartLeft) {
        chartLeft.destroy();
        chartLeft = null;
    }
    if (canvasId === 'chart-right' && chartRight) {
        chartRight.destroy();
        chartRight = null;
    }

    if (!window.datosAgua || !window.datosAgua.datos || window.datosAgua.datos.length === 0) return;
    const datos = window.datosAgua.obtenerTemporadasPorAnio(String(year));
    if (!datos || datos.length === 0) return;

    const orden = ['Invierno', 'Primavera', 'Verano', 'Otoño'];
    const valores = orden.map(temp => {
        const d = datos.find(x => x.season === temp);
        return d ? parseFloat(d.area_km2) : 0;
    });

    const config = {
        type: 'bar',
        data: {
            labels: orden,
            datasets: [{
                label: `Área ${year} (×10⁻⁸ km²)`,
                data: valores,
                backgroundColor: 'rgba(0, 212, 255, 0.6)',
                borderColor: '#00ffe7',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a8dadc' } },
                x: { grid: { display: false }, ticks: { color: '#a8dadc' } }
            },
            plugins: { legend: { display: false } }
        }
    };

    const chart = new Chart(canvas, config);
    if (canvasId === 'chart-left') chartLeft = chart;
    else chartRight = chart;
}

async function actualizarGraficas() {
    await cargarDatosCSV();
    const panel = document.getElementById('graficas-panel');
    const yearLeftEl = panel ? panel.querySelector('#graficas-year-left') : document.getElementById('graficas-year-left');
    const yearRightEl = panel ? panel.querySelector('#graficas-year-right') : document.getElementById('graficas-year-right');
    const yearLeft = (yearLeftEl && yearLeftEl.value) ? yearLeftEl.value : '2020';
    const yearRight = (yearRightEl && yearRightEl.value) ? yearRightEl.value : '2024';
    
    const typeSelect = panel ? panel.querySelector('#graficas-type-select') : document.getElementById('graficas-type-select');
    const tipo = (typeSelect && typeSelect.value) ? typeSelect.value : 'temporadas';
    
    crearGrafica('chart-left', yearLeft, tipo);
    crearGrafica('chart-right', yearRight, tipo);
}

// Inicializar el panel de gráficas
function initializeGraficasPanel() {
    const panel = document.getElementById('graficas-panel');
    const header = document.getElementById('graficas-header');
    const toggleBtn = document.getElementById('toggle-graficas-btn');
    const minimizeBtn = document.getElementById('graficas-minimize');
    const yearLeftSelect = document.getElementById('graficas-year-left');
    const yearRightSelect = document.getElementById('graficas-year-right');
    const typeSelect = document.getElementById('graficas-type-select');
    
    if (!panel) return;
    if (!yearLeftSelect || !yearRightSelect) return;
    
    if (header) {
        let dragStartX = 0, dragStartY = 0, panelStartLeft = 0, panelStartTop = 0;
        header.addEventListener('mousedown', function(e) {
            if (e.target.closest('.graficas-control-btn')) return;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            const rect = panel.getBoundingClientRect();
            panelStartLeft = rect.left;
            panelStartTop = rect.top;
            panel.style.left = panelStartLeft + 'px';
            panel.style.top = panelStartTop + 'px';
            panel.style.right = 'auto';
            function onMove(ev) {
                const dx = ev.clientX - dragStartX;
                const dy = ev.clientY - dragStartY;
                panel.style.left = (panelStartLeft + dx) + 'px';
                panel.style.top = (panelStartTop + dy) + 'px';
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }
    
    for (let year = comparadorConfig.minYear; year <= comparadorConfig.maxYear; year++) {
        const optLeft = document.createElement('option');
        optLeft.value = year;
        optLeft.textContent = year;
        if (year === 2020) optLeft.selected = true;
        yearLeftSelect.appendChild(optLeft);
        
        const optRight = document.createElement('option');
        optRight.value = year;
        optRight.textContent = year;
        if (year === 2024) optRight.selected = true;
        yearRightSelect.appendChild(optRight);
    }
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isVisible = panel.classList.contains('visible');
            if (isVisible) {
                panel.classList.remove('visible');
                toggleBtn.classList.remove('active');
            } else {
                panel.classList.add('visible');
                toggleBtn.classList.add('active');
                setTimeout(() => actualizarGraficas(), 300);
            }
        });
    }
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('minimized');
            const isMinimized = panel.classList.contains('minimized');
            minimizeBtn.title = isMinimized ? 'Restaurar' : 'Minimizar';
            minimizeBtn.setAttribute('aria-label', isMinimized ? 'Restaurar' : 'Minimizar');
        });
    }
    
    yearLeftSelect.addEventListener('change', actualizarGraficas);
    yearRightSelect.addEventListener('change', actualizarGraficas);
    if (typeSelect) typeSelect.addEventListener('change', actualizarGraficas);
    
    setTimeout(() => actualizarGraficas(), 500);
    
    console.log('✅ Panel de gráficas inicializado');
}

// Inicialización
window.addEventListener('load', function() {
    setTimeout(inicializarComparadorBarra, 1500);
    if(window.initializeGraficasPanel) window.initializeGraficasPanel();
});

// Exportaciones globales
window.activarComparadorBarra = activarComparadorBarra;
window.desactivarComparadorBarra = desactivarComparadorBarra;
window.actualizarComparadorBarra = actualizarComparadorBarra;
window.cambiarModoComparadorBarra = cambiarModoComparadorBarra;
window.actualizarGraficas = actualizarGraficas;
window.ocultarBarra = ocultarBarra;
window.mostrarBarra = mostrarBarra;
window.initializeGraficasPanel = initializeGraficasPanel;
window.toggleRiesgoBarra = toggleRiesgoBarra;
```

---

#### ---datos-agua-loader.js

```javascript
/**
 * Módulo para cargar y gestionar datos estadísticos del agua (CSV)
 * Optimizado para Google Earth Engine exports.
 */

const datosAgua = {
    datos: [],
    cargado: false, // Bandera para evitar recargas innecesarias

    // Cargar datos desde CSV
    async cargarDesdeCSV(url) {
        // Si ya tenemos datos, no volver a pedir el archivo
        if (this.cargado && this.datos.length > 0) {
            return this.datos;
        }

        try {
            console.log("📥 Descargando datos CSV...");
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const texto = await response.text();
            this.procesarCSV(texto);
            
            this.cargado = true;
            console.log(`✅ Datos CSV procesados: ${this.datos.length} registros.`);
            return this.datos;
        } catch (error) {
            console.error('❌ Error al cargar CSV:', error);
            return [];
        }
    },

    // Procesar texto CSV crudo
    procesarCSV(texto) {
        // Dividir por líneas (compatible con Windows/Linux)
        const lineas = texto.split(/\r?\n/);
        if (lineas.length < 2) return;

        // Limpiar encabezados
        const encabezados = lineas[0].split(',').map(h => h.trim());
        
        // Mapear índices
        const idx = {
            year: encabezados.indexOf('year'),
            season: encabezados.indexOf('season'),
            area_km2: encabezados.indexOf('area_km2'),
            area_ha: encabezados.indexOf('area_ha')
        };

        this.datos = [];

        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;

            const valores = this.parsearLineaCSV(linea);

            const minCols = Math.max(idx.year, idx.season, idx.area_km2 >= 0 ? idx.area_km2 : 0) + 1;
            if (valores.length >= minCols) {
                const year = valores[idx.year] ? String(valores[idx.year]).trim() : '';
                let season = valores[idx.season] ? String(valores[idx.season]).trim() : '';

                // Normalización de temporada (Otoño / Otonio / codificación rota)
                if (season.includes('Oto') || season.includes('Ã±') || season === 'Otonio') {
                    season = 'Otoño';
                }

                const area_km2 = idx.area_km2 >= 0 ? (parseFloat(valores[idx.area_km2]) || 0) : 0;
                const area_ha = idx.area_ha >= 0 ? (parseFloat(valores[idx.area_ha]) || 0) : 0;

                if (year && season) {
                    this.datos.push({ year, season, area_km2, area_ha });
                }
            }
        }
    },

    // Parser robusto para líneas CSV con comillas
    parsearLineaCSV(linea) {
        const valores = [];
        let valorActual = '';
        let dentroComillas = false;

        for (let i = 0; i < linea.length; i++) {
            const char = linea[i];
            
            if (char === '"') {
                dentroComillas = !dentroComillas;
            } else if (char === ',' && !dentroComillas) {
                valores.push(valorActual);
                valorActual = '';
            } else {
                valorActual += char;
            }
        }
        valores.push(valorActual);
        return valores;
    },

    // --- MÉTODOS DE CONSULTA ---

    obtenerDatos(year, season) {
        return this.datos.find(d => d.year === String(year) && d.season === season);
    },

    // Devuelve las temporadas ordenadas cronológicamente (clave para las gráficas)
    obtenerTemporadasPorAnio(year) {
        const orden = ['Invierno', 'Primavera', 'Verano', 'Otoño'];
        
        return this.datos
            .filter(d => d.year === String(year) && orden.includes(d.season))
            .sort((a, b) => orden.indexOf(a.season) - orden.indexOf(b.season));
    },

    obtenerAntesDuranteDespues(year) {
        return {
            antes: this.obtenerDatos(year, 'Antes'),
            durante: this.obtenerDatos(year, 'Durante'),
            despues: this.obtenerDatos(year, 'Después')
        };
    },

    obtenerPermanenteTemporal(year) {
        return {
            permanente: this.obtenerDatos(year, 'Permanente'),
            temporal: this.obtenerDatos(year, 'Temporal')
        };
    }
};

// Exportar globalmente
window.datosAgua = datosAgua;
console.log('✅ Módulo de Datos CSV cargado');
```

---

#### ---Dibujo_mnmapa.js

```javascript
/**
 * Módulo de Minimapa y Herramientas de Dibujo
 * Se encarga de la navegación secundaria y la creación de geometrías.
 */

// --- CONFIGURACIÓN DEL MINIMAPA ---

// Mapeo de capas base para el minimap (Reutiliza las URLs del mapa principal)
var miniMapLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 0, maxZoom: 13, attribution: '© OpenStreetMap'
    }),
    "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        minZoom: 0, maxZoom: 13, attribution: '© Google'
    }),
    "CartoDB Dark Matter": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        minZoom: 0, maxZoom: 13, attribution: '© CARTO', subdomains: 'abcd'
    })
};

// Inicializar Minimap
var initialMiniMapLayer = miniMapLayers["CartoDB Dark Matter"];

var miniMap = new L.Control.MiniMap(initialMiniMapLayer, { 
    toggleDisplay: true,
    position: 'bottomleft',
    width: 200,
    height: 150,
    zoomAnimation: true,
    zoomAnimationThreshold: 4,
    showRectangle: true
}).addTo(mapa);

// Configurar textos de accesibilidad para el botón del minimap
setTimeout(function() {
    var toggleButton = document.querySelector('.leaflet-control-minimap .leaflet-control-minimap-toggle-display');
    if (toggleButton) {
        toggleButton.setAttribute('title', 'Ocultar minimapa');
        
        toggleButton.addEventListener('click', function() {
            setTimeout(function() {
                var isMinimized = miniMap._container.classList.contains('minimized');
                toggleButton.setAttribute('title', isMinimized ? 'Mostrar minimapa' : 'Ocultar minimapa');
            }, 100);
        });
    }
}, 500);

// Sincronizar capa base del minimapa con el mapa principal
mapa.on('baselayerchange', function(e) {
    var layerName = e.name;
    // Mapeo simple: si la capa existe en el minimap, úsala. Si no, usa Satélite por defecto.
    var newMiniMapLayer = miniMapLayers[layerName] || miniMapLayers["Google Satellite"];
    
    if (newMiniMapLayer && miniMap._miniMap) {
        miniMap.changeLayer(newMiniMapLayer);
    }
});

// --- FLECHA DE ORIENTACIÓN DEL MINIMAPA ---

function addOrientationArrow() {
    if (!miniMap._miniMap) return false;
    
    // Función para actualizar posición
    function updateOrientationArrow() {
        try {
            var center = miniMap._miniMap.getCenter();
            
            if (!miniMap._orientationMarker) {
                var icon = L.divIcon({
                    className: 'minimap-orientation-marker',
                    html: '<div class="orientation-person"><i class="fas fa-location-arrow" style="transform: rotate(-45deg);"></i></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                
                miniMap._orientationMarker = L.marker(center, {
                    icon: icon, interactive: false, zIndexOffset: 1000
                }).addTo(miniMap._miniMap);
            } else {
                miniMap._orientationMarker.setLatLng(center);
            }
        } catch (e) { console.error(e); }
    }
    
    updateOrientationArrow();
    mapa.on('moveend zoomend', updateOrientationArrow);
    return true;
}

// Intentar agregar la flecha cuando el minimapa esté listo
setTimeout(addOrientationArrow, 1000);


// --- HERRAMIENTAS DE DIBUJO (LEAFLET DRAW) ---

var drawnItems = new L.featureGroup();
mapa.addLayer(drawnItems);

// Configuración del control de dibujo (Oculto visualmente, controlado por botones personalizados)
var drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
        circle: true,
        circlemarker: true,
        marker: true,
        rectangle: true,
        polyline: true,
        polygon: true
    },
    edit: {
        featureGroup: drawnItems
    }
}); 

mapa.addControl(drawControl);

// Ocultar la barra de herramientas nativa de Leaflet Draw
// (Usamos los botones del sidebar)
var styleDraw = document.createElement('style');
styleDraw.innerHTML = '.leaflet-draw { display: none !important; }';
document.head.appendChild(styleDraw);

// --- LÓGICA DE DIBUJO ---

// Evento: Dibujo creado
mapa.on('draw:created', function (e) {
    var layer = e.layer;
    var type = e.layerType;
    
    // Añadir propiedades básicas GeoJSON
    layer.feature = layer.feature || {};
    layer.feature.type = "Feature";
    layer.feature.properties = {
        tipo: type,
        fecha: new Date().toISOString(),
        autor: "Usuario"
    };
    
    drawnItems.addLayer(layer);
    actualizarContadorDibujos();
    console.log('✏️ Elemento dibujado:', type);
});

// Evento: Dibujo eliminado
mapa.on('draw:deleted', function () {
    actualizarContadorDibujos();
});

function actualizarContadorDibujos() {
    var count = drawnItems.getLayers().length;
    var exportBtn = document.getElementById('export');
    if (exportBtn) {
        exportBtn.innerHTML = '📥 Exportar Dibujos (' + count + ')';
    }
}

// --- FUNCIONES GLOBALES PARA EL SIDEBAR ---

// Activar herramienta de dibujo específica
window.activateDrawTool = function(tool) {
    // Desactivar botones anteriores visualmente
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    
    // Encontrar el handler de dibujo correspondiente en el control interno
    // Leaflet Draw usa handlers internos accesibles vía el control draw
    // Mapeo de string a handler
    var handlers = {
        'marker': drawControl._toolbars.draw._modes.marker.handler,
        'circle': drawControl._toolbars.draw._modes.circle.handler,
        'rectangle': drawControl._toolbars.draw._modes.rectangle.handler,
        'polyline': drawControl._toolbars.draw._modes.polyline.handler,
        'polygon': drawControl._toolbars.draw._modes.polygon.handler,
        'circlemarker': drawControl._toolbars.draw._modes.circlemarker.handler
    };

    var handler = handlers[tool];
    if (handler) {
        handler.enable();
        // Feedback visual en el botón presionado
        if (event && event.target) event.target.classList.add('active');
    } else {
        console.error("Herramienta no encontrada:", tool);
    }
};

// Alternar modo de edición
window.editHandler = null; // Referencia global para toggle
window.toggleEditMode = function() {
    if (!window.editHandler) {
        // Crear handler si no existe (usando la toolbar de edición)
        window.editHandler = new L.EditToolbar.Edit(mapa, {
            featureGroup: drawnItems,
            selectedPathOptions: drawControl.options.edit.selectedPathOptions
        });
    }

    var btn = document.querySelector('.edit-btn');
    
    if (window.editHandler.enabled()) {
        window.editHandler.disable();
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '✏️ Editar';
        }
    } else {
        window.editHandler.enable();
        if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '💾 Guardar';
        }
    }
};

// Limpiar todo
window.clearAllDrawings = function() {
    if (drawnItems.getLayers().length === 0) return;
    
    if (confirm('¿Eliminar todos los dibujos del mapa?')) {
        drawnItems.clearLayers();
        actualizarContadorDibujos();
    }
};

// Exportar GeoJSON
function configurarExportacion() {
    var exportBtn = document.getElementById('export');
    if (!exportBtn) return;

    exportBtn.onclick = function(e) {
        e.preventDefault();
        var data = drawnItems.toGeoJSON();
        
        if (data.features.length === 0) {
            alert('No hay dibujos para exportar.');
            return;
        }
        
        var jsonString = JSON.stringify(data, null, 2);
        var blob = new Blob([jsonString], { type: 'application/json' });
        var url = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        
        link.href = url;
        link.download = 'dibujos_tabasco_' + new Date().toISOString().split('T')[0] + '.geojson';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

// Inicialización de eventos al cargar
window.configurarEventosPaneles = function() {
    configurarExportacion();
    actualizarContadorDibujos();
};

console.log('✅ Módulo de Dibujo y Minimapa cargado');
```

---

#### ---efectos-futuristas.js

```javascript
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
```

---

#### ---Puntos.js

```javascript


var puntosDeInteresGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          -91.53529405031605,
          17.80180845982987
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          -91.42542963696859,
          17.475272527776383
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          -91.76479051704675,
          17.741362939102842
        ],
        "type": "Point"
      }
    }
  ]
}

L.geoJSON(puntosDeInteresGeoJSON, {}).addTo(mapa)
```

---

#### ---wms-enhancer.js

```javascript
/**
 * Módulo mejorado para manejo de capas WMS de GeoServer
 * Optimizado para la convención: S1_[Año]_[Temporada]_clasificado_filtrado
 * CORRECCIÓN: Validación relajada para evitar bloqueos por CORS o prefijos.
 */

const wmsEnhancer = {
    geoserverUrl: 'http://localhost:8080/geoserver/agua_subregion_rios/wms',
    workspace: 'agua_subregion_rios',
    version: '1.1.1', 
    format: 'image/png',
    
    // Cache de capas validadas
    capasValidadas: new Map(),
    
    // --- CAMBIO IMPORTANTE: Desactivar bloqueo estricto ---
    // Si es true, detiene la carga si no encuentra el nombre en GetCapabilities.
    // Si es false, intenta cargar la imagen de todas formas (recomendado si hay problemas de CORS).
    validarCapas: false, 
    
    /**
     * Validar que una capa WMS existe en GeoServer
     */
    async validarCapa(layerName) {
        // Si la validación está desactivada, "hacemos como que existe" (return true)
        if (!this.validarCapas) return true;

        if (this.capasValidadas.has(layerName)) return this.capasValidadas.get(layerName);
        
        try {
            const url = `${this.geoserverUrl}?service=WMS&version=${this.version}&request=GetCapabilities`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`⚠️ Validación fallida (Red/Status): ${response.status}`);
                // En caso de error de red, asumimos true para intentar cargarla igual
                return true; 
            }
            
            const text = await response.text();
            // Buscamos el nombre de la capa de forma laxa
            const exists = text.includes(layerName);
            
            this.capasValidadas.set(layerName, exists);
            
            if (exists) {
                console.log(`✅ Capa confirmada en servidor: ${layerName}`);
            } else {
                console.warn(`⚠️ Nombre '${layerName}' no encontrado en GetCapabilities. Es posible que el prefijo del workspace sea diferente.`);
                // AUNQUE NO ESTÉ, devolvemos true para que Leaflet intente pintarla (puede ser un error de parsing)
                return true; 
            }
            
            return exists;
        } catch (error) {
            console.warn(`⚠️ Error de validación (CORS o Red): ${error.message}. Se intentará cargar la capa de todas formas.`);
            // Si falla el fetch (ej. CORS), permitimos la carga
            return true;
        }
    },
    
    /**
     * Crear una capa WMS optimizada con configuración estándar
     */
    async crearCapaWMSOptimizada(layerName, options = {}) {
        // La validación ahora es solo informativa, no bloqueante
        await this.validarCapa(layerName);
        
        const configuracion = {
            layers: `${this.workspace}:${layerName}`,
            format: this.format,
            transparent: true,
            version: this.version,
            attribution: options.attribution || `Sentinel-1 | ${layerName}`,
            pane: 'overlayPane',
            zIndex: 1000,
            opacity: options.opacity || 1,
            styles: 'agua_azul', 
            // Optimizaciones
            keepBuffer: 2,
            updateWhenIdle: true,
            updateWhenZooming: false,
            // Manejo de errores visual (pixel transparente si falla)
            errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            ...options
        };
        
        const capa = L.tileLayer.wms(this.geoserverUrl, configuracion);
        capa._wmsLayerName = layerName;
        return capa;
    },

    /**
     * Generar nombre de capa según la convención del usuario:
     * S1_[Año]_[Temporada]_clasificado_filtrado
     */
    obtenerNombreCapa(year, season) {
        // Normalización crítica: "Otoño" -> "otonio"
        let seasonNorm = season.toLowerCase().trim();
        if (seasonNorm.includes('oto') || seasonNorm.includes('ño')) {
            seasonNorm = 'otonio';
        }
        return `S1_${year}_${seasonNorm}_clasificado_filtrado`;
    },

    /**
     * Crear capa para el comparador usando la convención estricta
     */
    async crearCapaComparacion(year, season) {
        const nombreCapa = this.obtenerNombreCapa(year, season);
        console.log(`🌊 Generando capa comparador: ${nombreCapa}`);

        return await this.crearCapaWMSOptimizada(nombreCapa, {
            attribution: `Agua ${season} ${year} | Sentinel-1`,
            opacity: 1
        });
    },

    /**
     * Función para obtener información del punto (GetFeatureInfo)
     */
    async obtenerDatosPunto(layerName, latlng, map) {
        try {
            const point = map.latLngToContainerPoint(latlng);
            const size = map.getSize();
            const bounds = map.getBounds();
            
            const params = {
                request: 'GetFeatureInfo',
                service: 'WMS',
                srs: 'EPSG:4326',
                styles: 'agua_azul',
                transparent: true,
                version: this.version,
                format: this.format,
                bbox: bounds.toBBoxString(),
                height: size.y,
                width: size.x,
                layers: `${this.workspace}:${layerName}`,
                query_layers: `${this.workspace}:${layerName}`,
                info_format: 'application/json'
            };

            params[params.version === '1.3.0' ? 'i' : 'x'] = Math.round(point.x);
            params[params.version === '1.3.0' ? 'j' : 'y'] = Math.round(point.y);

            const url = this.geoserverUrl + L.Util.getParamString(params, this.geoserverUrl, true);
            
            const res = await fetch(url);
            if (!res.ok) throw new Error('Error red');
            return await res.json();
        } catch (e) {
            console.error("Error GetFeatureInfo:", e);
            return null;
        }
    }
};

// Exportar globalmente
window.wmsEnhancer = wmsEnhancer;
console.log('✅ Módulo WMS Enhancer (Modo Permisivo) cargado');
```

---

### --Css

#### ---base.css

```css
/* Resetear márgenes y padding del body y html */
html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    font-family: 'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #0d1b2a 0%, #1e3a8a 50%, #0d1b2a 100%);
    color: #00ffe7;
    position: relative;
}
:root { --bottom-safe: 120px; }
.main-container {
    height: 100vh; width: 100vw; position: fixed; top: 0; left: 0px;
    z-index: 1; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: transparent; border: none; margin: 0; padding: 0;
}
.main-container.sidebar-hidden { width: 100vw; left: 0; }
.main-container.comparador-active { width: calc(100vw - 250px - 380px); }
#contenedor-del-mapa {
    height: 100%; width: 100%; filter: brightness(1.1) contrast(1.2) saturate(1.3);
    z-index: 10; position: relative; margin: 0; padding: 0; border: none; background: transparent;
}
.leaflet-bottom { bottom: var(--bottom-safe) !important; }
h1, p { display: none; }
.leaflet-interactive:focus { outline: none; }
.sidebar-toggle-btn {
    display: none; position: fixed; top: 25%; left: 0; transform: translateY(-50%);
    z-index: 2000; width: 44px; height: 44px;
    background: rgba(5, 10, 25, 0.85); border: 1px solid rgba(0, 212, 255, 0.45);
    border-radius: 0 10px 10px 0; color: #00ffe7; font-size: 18px; cursor: pointer;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.35), 0 0 12px rgba(0, 255, 231, 0.18);
    transition: all 0.3s ease; backdrop-filter: blur(6px); align-items: center; justify-content: center;
}
.main-container.sidebar-hidden ~ .sidebar-toggle-btn { display: flex; }
.sidebar-toggle-btn:hover {
    transform: translateY(-1px) scale(1.05);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45), 0 0 16px rgba(0, 255, 231, 0.28);
    border-color: rgba(0, 255, 231, 0.6); background: rgba(5, 10, 25, 0.9);
}
.sidebar-toggle-btn:active { transform: translateY(0) scale(0.97); }
.sidebar-overlay {
    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5); z-index: 1500; backdrop-filter: blur(5px);
}
#reset-zoom-btn {
    position: absolute; bottom: 733px; left: 160px; z-index: 1300;
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px;
    border: 1px solid rgba(0, 212, 255, 0.45); border-radius: 10px; cursor: pointer;
    background: rgba(5, 10, 25, 0.7); backdrop-filter: blur(6px); color: #00ffe7; font-weight: 600;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.35), 0 0 12px rgba(0, 255, 231, 0.18);
    transition: transform 0.2s ease, box-shadow 0.3s ease; max-width: 140px; white-space: nowrap;
    font-size: 13px; font-family: 'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
#reset-zoom-btn:hover {
    transform: translateY(-1px) scale(1.03);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45), 0 0 16px rgba(0, 255, 231, 0.28);
    border-color: rgba(0, 255, 231, 0.6); background: rgba(5, 10, 25, 0.78);
}
#reset-zoom-btn:active { transform: translateY(0) scale(0.97); }
#reset-zoom-btn i { font-size: 14px; filter: drop-shadow(0 0 6px rgba(0,255,231,0.35)); }
```

#### ---mapa.css

```css
/* =========================================
   ESTILOS DE MAPA Y CONTROLES LEAFLET
   ========================================= */

/* Posicionar MUNICIPIO, SUBREGIONES, CLASIFICACIÓN debajo del panel Estadísticas */
.leaflet-bottom.leaflet-right {
    top: 160px;
    bottom: auto !important;
}


/* --- CONTROL DE INFORMACIÓN (INFO) --- */
.info {
    padding: 8px 12px;
    font-family: 'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11px;
    line-height: 1.4;
    background: rgba(13, 27, 42, 0.9);
    border: 1px solid rgba(0, 212, 255, 0.4);
    border-radius: 6px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 212, 255, 0.1);
    backdrop-filter: blur(4px);
    color: #00d4ff;
    text-shadow: 0 0 4px rgba(0, 212, 255, 0.5);
    max-width: 200px;
    pointer-events: none; /* No bloquear clics */
}

.info h4 {
    margin: 0 0 6px 0;
    color: #00eaff;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-bottom: 5px;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
}

/* --- LEYENDA (LEGEND) --- */
.legend {
    padding: 8px 12px;
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: #00d4ff;
    background: rgba(13, 27, 42, 0.9);
    border: 1px solid rgba(0, 212, 255, 0.4);
    border-radius: 6px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.legend h4 {
    margin: 0 0 8px 0;
    color: #00eaff;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    padding-bottom: 4px;
}

.legend i {
    width: 14px;
    height: 14px;
    float: left;
    margin-right: 8px;
    margin-top: 2px;
    border-radius: 2px;
    box-shadow: 0 0 4px rgba(0, 212, 255, 0.4);
    opacity: 0.9;
}

/* Leyenda de clasificación agua (más compacta) */
.leyenda-agua {
    padding: 6px 10px !important;
    font-size: 9px !important;
    line-height: 1.3 !important;
    max-width: 140px !important;
}
.leyenda-agua h4 {
    font-size: 9px !important;
    margin: 0 0 4px 0 !important;
    padding-bottom: 3px !important;
}
.leyenda-agua i {
    width: 10px !important;
    height: 10px !important;
    margin-right: 5px !important;
}

/* --- ETIQUETAS SOBRE EL MAPA --- */
.municipio-label {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.municipio-label-content {
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    color: #00d4ff;
    font-family: 'Orbitron', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 0 0 4px #000, 0 0 8px #000; /* Sombra fuerte para legibilidad */
    white-space: nowrap;
    pointer-events: none;
    text-align: center;
    transition: transform 0.2s ease, font-size 0.2s ease;
}

/* --- MINIMAPA (DISEÑO FUTURISTA) --- */
.leaflet-control-minimap {
    border: 2px solid rgba(0, 212, 255, 0.6);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(0, 212, 255, 0.2);
    background: #0d1b2a;
    transition: all 0.3s ease;
}

.leaflet-control-minimap:hover {
    border-color: #00ffe7;
    box-shadow: 0 0 25px rgba(0, 255, 231, 0.4);
}

/* Botón Toggle del Minimapa */
.leaflet-control-minimap .leaflet-control-minimap-toggle-display {
    background: rgba(13, 27, 42, 0.9);
    border: 1px solid #00d4ff;
    border-radius: 4px;
    color: #00ffe7;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Flecha de orientación en minimapa */
.minimap-orientation-marker .orientation-person i {
    color: #00ffe7 !important;
    font-size: 16px !important;
    filter: drop-shadow(0 0 5px #00ffe7);
    animation: pulse-arrow 2s infinite;
}

@keyframes pulse-arrow {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
}

/* --- POPUP FLOTANTE (MENSAJES) --- */
.popup-flotante {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(5, 10, 25, 0.95);
    color: #00ffe7;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #00ffe7;
    box-shadow: 0 0 30px rgba(0, 255, 231, 0.3);
    z-index: 10000; /* Siempre encima */
    max-width: 320px;
    font-family: 'Orbitron', monospace;
    font-size: 14px;
    text-align: center;
    pointer-events: none; /* Permitir ver a través */
    opacity: 0;
    transition: opacity 0.3s ease;
}

.popup-flotante.visible {
    opacity: 1;
}

/* --- ALERTAS EN MAPA (TOASTS) --- */
.map-alert {
    animation: fadeInOut 3s forwards;
    background: rgba(13, 27, 42, 0.9);
    border: 1px solid #ff4757;
    color: #ff4757;
    padding: 10px 20px;
    border-radius: 6px;
    font-family: 'Orbitron', sans-serif;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -40%); }
    10% { opacity: 1; transform: translate(-50%, -50%); }
    90% { opacity: 1; transform: translate(-50%, -50%); }
    100% { opacity: 0; transform: translate(-50%, -60%); }
}
```

---

#### ---sidebar.css

```css
/* =========================================
   ESTILOS DE LA BARRA LATERAL IZQUIERDA (SIDEBAR)
   ========================================= */

/* --- CONTENEDOR PRINCIPAL --- */
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 245px;
    /* Altura dinámica respetando la barra inferior */
    height: 100vh;
    background: linear-gradient(180deg, #0d1b2a 0%, #1a1a2e 50%, #16213e 100%);
    border-right: 3px solid #00d4ff;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5), inset -1px 0 0 rgba(0, 212, 255, 0.1);
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 2000; /* Por encima del mapa, debajo de popups */
    font-family: 'Orbitron', sans-serif;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Estado oculto (clase controlada por JS) */
.sidebar.hidden {
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
}

/* Efecto Glow al pasar el mouse */
.sidebar:hover {
    box-shadow: 4px 0 30px rgba(0, 255, 231, 0.4), inset 0 0 30px rgba(0, 255, 231, 0.1);
}

/* --- SCROLLBAR PERSONALIZADO --- */
.sidebar::-webkit-scrollbar {
    width: 6px;
}
.sidebar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
}
.sidebar::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.4);
    border-radius: 3px;
}
.sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.6);
}

/* --- BARRA SUPERIOR (TOPBAR) --- */
.sidebar-topbar {
    position: sticky;
    top: 0;
    left: 0;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: rgba(13, 27, 42, 0.98);
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    backdrop-filter: blur(8px);
    z-index: 10;
}

.sidebar-topbar-title {
    font-size: 12px;
    color: #00d4ff;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
}

/* Botón cerrar sidebar (X) */
.sidebar-close-btn {
    width: 28px;
    height: 28px;
    background: rgba(5, 10, 25, 0.5);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 6px;
    color: #e6ffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.sidebar-close-btn:hover {
    background: rgba(0, 212, 255, 0.2);
    border-color: #00ffe7;
    transform: scale(1.05);
}

/* --- SECCIONES (ACORDEÓN) --- */
.sidebar-section {
    border-bottom: 1px solid rgba(0, 212, 255, 0.15);
    background: rgba(0, 0, 0, 0.05);
}

.section-header {
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.1) 0%, transparent 100%);
    color: #00d4ff;
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
}

.section-header:hover {
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.2) 0%, transparent 100%);
    border-left-color: #00d4ff;
    padding-left: 20px;
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
}

.section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.section-toggle {
    font-size: 10px;
    transition: transform 0.3s;
}

.section-content {
    display: none;
    padding: 15px;
    background: rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.3s ease;
}

.section-content.show {
    display: block;
}

/* Estilo específico para header Radar */
.radar-header {
    background: linear-gradient(90deg, rgba(255, 7, 58, 0.15) 0%, transparent 100%);
    color: #ff4757;
    text-shadow: 0 0 10px rgba(255, 7, 58, 0.8);
    border-left: 3px solid #ff4757;
    border-bottom: 1px solid rgba(255, 7, 58, 0.3);
}

.radar-header:hover {
    border-left-color: #ff4757;
    background: linear-gradient(90deg, rgba(255, 7, 58, 0.25) 0%, transparent 100%);
}

/* --- HERRAMIENTAS DE DIBUJO --- */
.tools-group h4 {
    margin: 0 0 10px 0;
    font-size: 10px;
    color: #94a3b8;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 5px;
}

.tools-grid, .actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 15px;
}

.tool-btn {
    background: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
    font-size: 10px;
    color: #00d4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
    font-family: 'Orbitron', sans-serif;
}

.tool-btn:hover, .tool-btn.active {
    background: rgba(0, 212, 255, 0.25);
    border-color: #00ffe7;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
    transform: translateY(-1px);
}

.edit-btn { border-color: #ffc107; color: #ffc107; background: rgba(255, 193, 7, 0.1); }
.edit-btn:hover { background: rgba(255, 193, 7, 0.2); }

.delete-btn { border-color: #ff4757; color: #ff4757; background: rgba(255, 71, 87, 0.1); }
.delete-btn:hover { background: rgba(255, 71, 87, 0.2); }

.export-btn {
    width: 100%;
    background: rgba(23, 162, 184, 0.15);
    color: #17a2b8;
    border: 1px solid rgba(23, 162, 184, 0.4);
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    transition: all 0.3s;
}
.export-btn:hover {
    background: rgba(23, 162, 184, 0.3);
    border-color: #00eaff;
    color: #fff;
}

/* --- CAPAS DEL MAPA (Diseño compacto y legible) --- */
.layers-container .leaflet-control-layers {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    width: 100% !important;
}

/* Títulos de las secciones - más compactos */
.layers-container .leaflet-control-layers-base::before,
.layers-container .leaflet-control-layers-overlays::before {
    display: block;
    font-family: 'Montserrat', sans-serif;
    font-size: 10px !important;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 10px 0 4px 0;
    padding-bottom: 3px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.3);
}

/* Cada opción - lista simple y compacta */
.layers-container label {
    display: flex !important;
    align-items: center !important;
    padding: 6px 8px !important;
    margin: 2px 0 !important;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s;
    min-height: auto;
}

.layers-container label:hover {
    background: rgba(148, 163, 184, 0.12);
}

/* Texto de la capa - legible sin recargar */
.layers-container label span {
    font-family: 'Montserrat', sans-serif !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    color: #cbd5e1 !important;
    text-transform: none;
    letter-spacing: 0.3px;
    line-height: 1.3 !important;
    display: inline-block;
}

/* Estado seleccionado - indicador claro pero sobrio */
.layers-container label input:checked + span {
    color: #38bdf8 !important;
    font-weight: 600 !important;
}

/* Radio y Checkbox - estilo estándar simplificado */
.layers-container input[type="radio"],
.layers-container input[type="checkbox"] {
    margin: 0 8px 0 0 !important;
    appearance: none;
    -webkit-appearance: none;
    width: 12px !important;
    height: 12px !important;
    border: 1.5px solid #64748b;
    background: rgba(15, 23, 42, 0.6);
    cursor: pointer;
    flex-shrink: 0;
    position: relative;
}

/* Radio (base maps) */
.layers-container input[type="radio"] {
    border-radius: 50%;
}
.layers-container input[type="radio"]:checked {
    border-color: #38bdf8;
    background: #38bdf8;
}

/* Checkbox (overlays) */
.layers-container input[type="checkbox"] {
    border-radius: 2px;
}
.layers-container input[type="checkbox"]:checked {
    border-color: #38bdf8;
    background: #38bdf8;
}

/* --- AGUA TEMPORAL --- */
.agua-layer-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 6px;
    margin-bottom: 6px;
    font-size: 11px;
    cursor: pointer;
}
.agua-layer-item:hover { border-color: #00d4ff; }
.layer-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 5px currentColor;
}

.agua-info {
    font-size: 10px;
    color: #94a3b8;
    background: rgba(0,0,0,0.3);
    padding: 8px;
    border-radius: 4px;
    border-left: 2px solid #3b82f6;
}

/* --- AJUSTE DINÁMICO DE CONTROLES LEAFLET --- */
body.sidebar-open .leaflet-left {
    transform: translateX(245px); /* Mueve controles */
    transition: transform 0.3s ease;
}

body:not(.sidebar-open) .leaflet-left {
    transform: translateX(0);
    transition: transform 0.3s ease;
}

/* Ajuste específico para botones flotantes */
body.sidebar-open #toggle-meteoblue-btn {
    left: 315px !important;
    transition: left 0.3s ease;
}

body:not(.sidebar-open) #toggle-meteoblue-btn {
    left: 70px !important;
    transition: left 0.3s ease;
}

body.sidebar-open #reset-zoom-btn {
    left: 265px !important;
    transition: left 0.3s ease;
}

body:not(.sidebar-open) #reset-zoom-btn {
    left: 20px !important;
    transition: left 0.3s ease;
}

/* Animaciones */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
```

---

#### ---efectos-futuristas.css

```css
.section-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.section-header:hover::before {
    left: 100%;
}

.section-header:hover {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.15) 100%);
    border-left-color: #00d4ff;
    transform: translateX(2px);
    box-shadow: inset 3px 0 8px rgba(0, 212, 255, 0.3);
    color: #00eaff;
}

.section-icon {
    font-size: 18px;
    margin-right: 10px;
    filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.6));
    transition: transform 0.3s ease;
}

.section-header:hover .section-icon {
    transform: scale(1.1);
}

.section-title {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
}

.section-toggle {
    font-size: 10px;
    transition: transform 0.3s ease;
    opacity: 0.7;
    color: #00d4ff;
}

.section-header:hover .section-toggle {
    opacity: 1;
    transform: scale(1.1);
}

.section-content {
    display: none;
    padding: 16px;
    background: rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.3s ease;
}

.section-content.show {
    display: block;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Estilos para grupos de herramientas */
.tools-group {
    margin-bottom: 24px;
}

.tools-group:last-child {
    margin-bottom: 0;
}

.tools-group h4 {
    margin: 0 0 12px 0;
    font-size: 11px;
    font-weight: 600;
    color: #00d4ff;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    text-shadow: 0 0 6px rgba(0, 212, 255, 0.4);
    padding-bottom: 5px;
}

.tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 15px;
}

.actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 15px;
}

.tool-btn {
    background: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 6px;
    padding: 8px 10px;
    cursor: pointer;
    font-size: 10px;
    color: #00d4ff;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 60px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.2;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    text-shadow: 0 0 4px rgba(0, 212, 255, 0.5);
}

.tool-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 231, 0.3), transparent);
    transition: left 0.5s;
}

.tool-btn:hover::before {
    left: 100%;
}

.tool-btn:hover {
    background: rgba(0, 212, 255, 0.2);
    border-color: #00d4ff;
    color: #00eaff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4), 0 0 8px rgba(0, 212, 255, 0.3);
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.8);
}

.tool-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 255, 231, 0.3);
}

.edit-btn {
    background: rgba(255, 193, 7, 0.1);
    border-color: rgba(255, 193, 7, 0.3);
    color: #ffc107;
}

.edit-btn:hover {
    background: rgba(255, 193, 7, 0.2);
    border-color: #ffc107;
    color: #ffd700;
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4), 0 0 8px rgba(255, 193, 7, 0.3);
}

.delete-btn {
    background: rgba(220, 53, 69, 0.1);
    border-color: rgba(220, 53, 69, 0.3);
    color: #dc3545;
}

.delete-btn:hover {
    background: rgba(220, 53, 69, 0.2);
    border-color: #dc3545;
    color: #ff4757;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4), 0 0 8px rgba(220, 53, 69, 0.3);
}

.analysis-btn:hover {
    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    border-color: #17a2b8;
    color: #fff;
}

.config-btn:hover {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    border-color: #6c757d;
    color: #fff;
}

.export-btn {
    width: 100%;
    background: rgba(23, 162, 184, 0.15);
    color: #17a2b8;
    border: 1px solid rgba(23, 162, 184, 0.4);
    border-radius: 6px;
    padding: 10px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    text-shadow: 0 0 6px rgba(23, 162, 184, 0.6);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.export-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
}

.export-btn:hover::before {
    left: 100%;
}

.export-btn:hover {
    background: rgba(23, 162, 184, 0.25);
    border-color: #17a2b8;
    color: #00eaff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(23, 162, 184, 0.4), 0 0 8px rgba(23, 162, 184, 0.3);
    text-shadow: 0 0 8px rgba(23, 162, 184, 0.8);
}

.export-btn:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(23, 162, 184, 0.4);
}

/* Radar minimal táctico */
.radar-container {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 10px;
    align-items: center;
}

.radar-screen {
    position: relative;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: radial-gradient( circle at 50% 50%, rgba(0,212,255,0.12), rgba(0,212,255,0.06) 40%, transparent 60% );
    box-shadow: inset 0 0 20px rgba(0,212,255,0.2);
    overflow: hidden;
}

.radar-grid::before,
.radar-grid::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: 50%;
    box-shadow:
        0 0 0 1px rgba(0,212,255,0.25),
        inset 0 0 0 1px rgba(0,212,255,0.12);
}

.radar-grid::after {
    box-shadow:
        0 0 0 1px rgba(0,212,255,0.25),
        0 0 0 22px rgba(0,212,255,0.12),
        0 0 0 44px rgba(0,212,255,0.08),
        0 0 0 66px rgba(0,212,255,0.06);
}

.radar-sweep {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient( from 0deg, rgba(0,212,255,0.35), rgba(0,212,255,0.0) 35% );
    filter: blur(2px);
    animation: sweep 2.4s linear infinite;
}

@keyframes sweep {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.radar-dot {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00eaff;
    box-shadow: 0 0 8px #00eaff;
    opacity: 0.9;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.4); opacity: 0.6; }
    100% { transform: scale(1); opacity: 0.9; }
}

.radar-label {
    color: #a8dadc;
    font-size: 11px;
    font-family: 'Montserrat', sans-serif;
}

.radar-stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
}

.radar-stat-item {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #a8dadc;
    border-bottom: 1px dashed rgba(0,212,255,0.2);
    padding-bottom: 4px;
}
.radar-stat-value { color: #00eaff; font-family: 'Orbitron', sans-serif; }

/* Estilos para el control de capas dentro de la sidebar */
.layers-container {
    padding: 0;
}

.layers-container .leaflet-control-layers {
    position: static !important;
    margin: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    border: none !important;
    width: 100% !important;
}

.layers-container .leaflet-control-layers-toggle {
    display: none !important;
}

.layers-container .leaflet-control-layers-base,
.layers-container .leaflet-control-layers-overlays {
    margin: 0 0 20px 0;
}

.layers-container .leaflet-control-layers-base label,
.layers-container .leaflet-control-layers-overlays label {
    display: block;
    padding: 6px 10px;
    margin: 2px 0;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
    font-weight: 500;
}

.layers-container .leaflet-control-layers-base label:hover,
.layers-container .leaflet-control-layers-overlays label:hover {
    background: #e9ecef;
    border-color: #007cba;
    transform: translateX(5px);
}

.layers-container .leaflet-control-layers-base label input[type="radio"]:checked + span,
.layers-container .leaflet-control-layers-overlays label input[type="checkbox"]:checked + span {
    color: #007cba;
    font-weight: bold;
}

.layers-container .leaflet-control-layers-base label input[type="radio"],
.layers-container .leaflet-control-layers-overlays label input[type="checkbox"] {
    margin-right: 8px;
    accent-color: #007cba;
}

/* Títulos de sección de capas */
.layers-container .leaflet-control-layers-base::before {
    content: "🗺️ Capas Base";
    display: block;
    font-size: 12px;
    font-weight: bold;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 2px solid #007cba;
}

.layers-container .leaflet-control-layers-overlays::before {
    content: "🏛️ Subregiones de Tabasco";
    display: block;
    font-size: 12px;
    font-weight: bold;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 2px solid #28a745;
}

/* Mejorar el estilo de los checkboxes y radio buttons */
.layers-container input[type="radio"],
.layers-container input[type="checkbox"] {
    width: 10px;
    height: 10px;
    margin-right: 10px;
    cursor: pointer;
}

/* Efectos especiales para las capas */
.layers-container label {
    position: relative;
    overflow: hidden;
}

.layers-container label::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 123, 186, 0.1), transparent);
    transition: left 0.5s ease;
}

.layers-container label:hover::before {
    left: 100%;
}



@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}


/* Estilos para el panel de Agua Temporal */
.agua-temporal-controls {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.agua-layer-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px;
    background: rgba(15, 23, 42, 0.3);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(59, 130, 246, 0.2);
    font-size: 0.75em;
}

.agua-layer-item:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: translateX(5px);
    border-color: rgba(59, 130, 246, 0.5);
}

.agua-layer-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #3b82f6;
}

.layer-color {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.agua-layer-item span:last-child {
    flex: 1;
    font-weight: 500;
}

.agua-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.section-description {
    font-size: 0.85em;
    color: #94a3b8;
    margin-bottom: 15px;
    font-style: italic;
}

.agua-info {
    margin-top: 15px;
    padding: 10px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 5px;
    border-left: 3px solid #3b82f6;
}

.agua-info p {
    margin: 0;
    font-size: 0.85em;
    color: #cbd5e1;
    line-height: 1.6;
}

/* ========================================
   ESTILOS DEL COMPARADOR DE AGUA TEMPORAL
   ======================================== */

/* Panel principal del comparador dentro de la sidebar */
.comparador-panel {
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
    border: 2px solid rgba(0, 212, 255, 0.4);
    border-radius: 10px;
    padding: 15px;
    margin: 0;
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
}

/* Título del comparador */
.comparador-panel h3 {
    color: #00d4ff;
    text-align: center;
    margin: 0 0 15px 0;
    font-size: 0.95em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
}

/* Contenedor de los dos lados */
.comparador-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
}

/* Panel de cada lado (izquierda/derecha) */
.comparador-lado {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    padding: 12px;
    transition: all 0.3s ease;
}

.comparador-lado:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 212, 255, 0.6);
    box-shadow: 0 2px 10px rgba(0, 212, 255, 0.15);
}

/* Títulos de cada lado */
.comparador-lado h4 {
    color: #00d4ff;
    font-size: 0.85em;
    margin: 0 0 10px 0;
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Grupos de selección */
.select-group {
    margin-bottom: 10px;
}

.select-group label {
    display: block;
    color: #a8dadc;
    font-size: 0.75em;
    margin-bottom: 5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

/* Estilos de los selectores */
.select-group select {
    width: 100%;
    padding: 8px 10px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(0, 212, 255, 0.4);
    border-radius: 6px;
    color: #ffffff;
    font-size: 0.8em;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none;
}

.select-group select:hover {
    border-color: #00d4ff;
    background: rgba(0, 0, 0, 0.6);
}

.select-group select:focus {
    border-color: #00ff88;
    box-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
    background: rgba(0, 0, 0, 0.7);
}

.select-group select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Opciones del select */
.select-group select option {
    background: #1a1a2e;
    color: #ffffff;
    padding: 8px;
}

/* Contenedor de botones */
.comparador-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 15px;
}

/* Botones del comparador */
.btn-comparador {
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    width: 100%;
}

/* Botón activar */
.btn-activar {
    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
    color: #ffffff;
}

.btn-activar:hover {
    background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
    transform: translateY(-2px);
}

/* Botón desactivar */
.btn-desactivar {
    background: linear-gradient(135deg, #ff4757 0%, #cc3644 100%);
    color: #ffffff;
}

.btn-desactivar:hover {
    background: linear-gradient(135deg, #ff6b81 0%, #ee5a6f 100%);
    box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
    transform: translateY(-2px);
}

/* Botón actualizar */
.btn-actualizar {
    background: linear-gradient(135deg, #ffa502 0%, #ff7f00 100%);
    color: #ffffff;
}

.btn-actualizar:hover {
    background: linear-gradient(135deg, #ffb732 0%, #ff9f1a 100%);
    box-shadow: 0 4px 15px rgba(255, 165, 2, 0.4);
    transform: translateY(-2px);
}

/* Información adicional */
.comparador-info {
    background: rgba(0, 212, 255, 0.1);
    border-left: 3px solid #00d4ff;
    padding: 8px 10px;
    margin-top: 12px;
    border-radius: 4px;
    font-size: 0.7em;
    color: #a8dadc;
    font-family: 'Montserrat', sans-serif;
    line-height: 1.4;
}

.comparador-info i {
    color: #00d4ff;
    margin-right: 6px;
}

.comparador-info strong {
    color: #00ff88;
}

/* Estilo del control side-by-side cuando está activo */
.leaflet-sbs {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 800;
}

/* Input range para el control del divisor */
.leaflet-sbs-range {
    position: absolute;
    top: 50%;
    width: 100%;
    z-index: 999;
    pointer-events: auto !important;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    opacity: 0;
    margin: 0;
    padding: 0 !important;
    cursor: ew-resize !important;
    height: 100vh;
    transform: translateY(-50%);
}

/* Estilos del input range para diferentes navegadores */
.leaflet-sbs-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 40px;
    height: 100vh;
    cursor: ew-resize;
}

.leaflet-sbs-range::-moz-range-thumb {
    width: 40px;
    height: 100vh;
    cursor: ew-resize;
    border: none;
    background: transparent;
}

.leaflet-sbs-range::-ms-thumb {
    width: 40px;
    height: 100vh;
    cursor: ew-resize;
}

/* Barra divisora vertical */
.leaflet-sbs-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    margin-left: -2px;
    width: 4px;
    background-color: #00d4ff !important;
    pointer-events: none;
    z-index: 999;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.8) !important;
}

/* Círculo central del divisor */
.leaflet-sbs-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 42px;
    height: 42px;
    background: #00d4ff;
    border: 3px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.8),
                0 0 40px rgba(0, 212, 255, 0.6),
                inset 0 0 10px rgba(255, 255, 255, 0.3);
    pointer-events: none;
    z-index: 1000;
}

/* Flechas indicadoras en el círculo */
.leaflet-sbs-divider::after {
    content: '⇄';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ffffff;
    font-size: 20px;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    z-index: 1001;
}


/* Asegurar que el mapa no se arrastre cuando se usa el comparador */
.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom {
    -ms-touch-action: pan-x pan-y;
    touch-action: pan-x pan-y;
}

/* Deshabilitar el arrastre del mapa en la zona del divisor */
.leaflet-sbs-range:hover ~ .leaflet-container {
    cursor: ew-resize !important;
}

/* Animación de pulso para el divisor */
@keyframes pulse-divider {
    0%, 100% {
        box-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
    }
    50% {
        box-shadow: 0 0 25px rgba(0, 212, 255, 1),
                    0 0 40px rgba(0, 212, 255, 0.8);
    }
}

.leaflet-sbs-divider {
    animation: pulse-divider 2s ease-in-out infinite;
}

/* Estilo cuando está activo (siendo arrastrado) */
.leaflet-sbs-range:active {
    cursor: grabbing !important;
}

.leaflet-sbs-range:active ~ .leaflet-sbs-divider::before {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 0 30px rgba(0, 212, 255, 1),
                0 0 50px rgba(0, 212, 255, 0.8),
                inset 0 0 15px rgba(255, 255, 255, 0.5);
}   

/* Indicador del comparador activo */
.comparador-panel.activo {
    border-color: #00ff88;
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
}

.comparador-panel.activo h3 {
    color: #00ff88;
    text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}


/* Animación de carga */
@keyframes pulse-comparador {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.comparador-panel.cargando {
    animation: pulse-comparador 2s infinite;
}

/* Ajustar controles de Leaflet cuando el sidebar está visible */
/* Cuando el sidebar está abierto (body tiene clase sidebar-open), los controles de la izquierda se mueven a la derecha */
body.sidebar-open .leaflet-left {
    left: 245px !important; /* Ancho del sidebar */
    transition: left 0.3s ease;
}

/* Asegurar que los controles superiores izquierdos (botones de zoom) también se muevan */
body.sidebar-open .leaflet-top.leaflet-left {
    left: 245px !important;
    transition: left 0.3s ease;
}

/* Asegurar que los controles inferiores izquierdos (minimap) también se muevan */
body.sidebar-open .leaflet-bottom.leaflet-left {
    left: 245px !important;
    transition: left 0.3s ease;
}

/* Mover el botón de MeteoBlue cuando el sidebar está abierto */
body.sidebar-open #toggle-meteoblue-btn {
    left: calc(20px + 245px) !important;
    transition: left 0.3s ease;
}

/* Mover el botón de reset zoom cuando el sidebar está abierto */
body.sidebar-open #reset-zoom-btn {
    left: calc(160px + 245px) !important;
    transition: left 0.3s ease;
}

/* Cuando el sidebar está oculto, los controles vuelven a su posición original */
body:not(.sidebar-open) .leaflet-left {
    left: 0 !important;
    transition: left 0.3s ease;
}

body:not(.sidebar-open) .leaflet-top.leaflet-left {
    left: 0 !important;
    transition: left 0.3s ease;
}

body:not(.sidebar-open) .leaflet-bottom.leaflet-left {
    left: 0 !important;
    transition: left 0.3s ease;
}

body:not(.sidebar-open) #toggle-meteoblue-btn {
    left: 20px !important;
    transition: left 0.3s ease;
}

body:not(.sidebar-open) #reset-zoom-btn {
    left: 160px !important;
    transition: left 0.3s ease;
}
```

---

#### ---efectos-futuristas.css

```css
/* Fondo de partículas - oculto por defecto */
#particles {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	pointer-events: none;
	z-index: 500;
	display: none; /* Oculto por defecto para no estorbar al cargar */
}

/* Título futurista superior */
.title-header {
	position: fixed;
	top: 12px;
	left: 50%;
	transform: translateX(-50%);
	padding: 12px 18px;
	border: 1px solid rgba(0, 212, 255, 0.45);
	border-radius: 8px;
	background: rgba(5, 10, 25, 0.6);
	backdrop-filter: blur(4px);
	box-shadow: 0 0 12px rgba(0, 255, 231, 0.25), inset 0 0 8px rgba(0, 212, 255, 0.2);
	color: #00d4ff;
	font-family: 'Orbitron', sans-serif;
	font-size: 24px;
	letter-spacing: 1px;
	text-shadow: 0 0 8px rgba(0, 255, 231, 0.35);
	z-index: 3000;
	user-select: none;
}

/* Panel de estadísticas flotante */
.stats-panel {
	position: fixed;
	right: 16px;
	top: 16px;
	width: 280px;
	max-width: calc(100vw - 32px);
	border: 1px solid rgba(0, 212, 255, 0.4);
	border-radius: 12px;
	background: rgba(5, 10, 25, 0.7);
	backdrop-filter: blur(6px);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 16px rgba(0, 255, 231, 0.2);
	color: #dff9ff;
	z-index: 3000;
	overflow: hidden;
}

.stats-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 10px 12px;
	background: linear-gradient(180deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0));
	border-bottom: 1px solid rgba(0, 212, 255, 0.25);
	cursor: pointer;
	user-select: none;
}

#stats-toggle {
	color: #00ffe7;
	font-family: 'Orbitron', sans-serif;
	font-size: 12px;
}

.stats-content {
	padding: 10px 12px 12px;
	display: block; /* visible por defecto, el JS alterna display */
}

/* Estado oculto del contenido de estadísticas */
.stats-content.hidden {
	display: none;
}

.stats-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 6px 0;
	border-bottom: 1px dashed rgba(0, 212, 255, 0.18);
	font-family: 'Montserrat', sans-serif;
	font-size: 12px;
}

.stats-item:last-child {
	border-bottom: none;
}

.stats-value {
	color: #00ffe7;
	font-weight: 600;
	text-shadow: 0 0 8px rgba(0, 255, 231, 0.35);
}

/* Panel flotante de gráficas */
.graficas-panel {
	position: fixed;
	right: 16px;
	top: 80px; /* Debajo del panel de estadísticas */
	width: 500px;
	max-width: calc(100vw - 32px);
	border: 1px solid rgba(0, 212, 255, 0.4);
	border-radius: 12px;
	background: rgba(5, 10, 25, 0.85);
	backdrop-filter: blur(6px);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 16px rgba(0, 255, 231, 0.2);
	color: #dff9ff;
	z-index: 10000; /* Siempre encima de todo */
	overflow: hidden;
	display: none; /* Oculto por defecto */
	user-select: none;
}

.graficas-panel.visible {
	display: block;
}

.graficas-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 10px 12px;
	background: linear-gradient(180deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0));
	border-bottom: 1px solid rgba(0, 212, 255, 0.25);
	cursor: move;
	user-select: none;
	transition: background 0.3s ease;
}

.graficas-header.dragging {
	cursor: grabbing;
	background: linear-gradient(180deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05));
}

.graficas-header:hover {
	background: linear-gradient(180deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05));
}

/* Controles de ventana del panel */
.graficas-window-controls {
	display: flex;
	gap: 4px;
	align-items: center;
}

.graficas-control-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	color: #a8dadc;
	cursor: pointer;
	border-radius: 4px;
	transition: all 0.2s ease;
	padding: 0;
	font-size: 14px;
	line-height: 1;
}

.graficas-control-btn:hover {
	background: rgba(255, 255, 255, 0.1);
}

.graficas-control-btn .control-icon {
	display: block;
	width: 100%;
	height: 100%;
	position: relative;
	user-select: none;
}

/* Icono de minimizar (línea horizontal) */
.minimize-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 10px;
	height: 1px;
	background: currentColor;
}

/* Icono de maximizar (dos cuadrados) */
.maximize-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 9px;
	height: 9px;
	border: 1px solid currentColor;
	background: transparent;
}

.maximize-icon::after {
	content: '';
	position: absolute;
	top: 35%;
	left: 60%;
	width: 7px;
	height: 7px;
	border: 1px solid currentColor;
	border-top: none;
	border-left: none;
	background: transparent;
}

/* Icono de restaurar (dos cuadrados superpuestos) */
.restore-icon::before {
	content: '';
	position: absolute;
	top: 45%;
	left: 45%;
	transform: translate(-50%, -50%);
	width: 7px;
	height: 7px;
	border: 1px solid currentColor;
	border-top: none;
	border-left: none;
	background: transparent;
}

.restore-icon::after {
	content: '';
	position: absolute;
	top: 55%;
	left: 55%;
	transform: translate(-50%, -50%);
	width: 7px;
	height: 7px;
	border: 1px solid currentColor;
	border-bottom: none;
	border-right: none;
	background: transparent;
}

/* Icono de cerrar (X) */
.close-icon::before,
.close-icon::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	width: 10px;
	height: 1px;
	background: currentColor;
}

.close-icon::before {
	transform: translate(-50%, -50%) rotate(45deg);
}

.close-icon::after {
	transform: translate(-50%, -50%) rotate(-45deg);
}

.graficas-minimize:hover {
	background: rgba(255, 255, 255, 0.15);
}

.graficas-maximize:hover {
	background: rgba(255, 255, 255, 0.15);
}

.graficas-close:hover {
	background: rgba(255, 77, 77, 0.3);
	color: #ff4d4d;
}

.graficas-close:hover .control-icon {
	color: #ff4d4d;
}

.graficas-content {
	padding: 12px;
	display: block;
}

/* Selector de tipo de gráfica */
.graficas-type-selector {
	margin-bottom: 12px;
	padding-bottom: 12px;
	border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.graficas-type-selector label {
	color: #a8dadc;
	font-family: 'Montserrat', sans-serif;
	font-size: 11px;
	font-weight: 600;
	display: block;
	margin-bottom: 6px;
}

/* Selectores de año para las gráficas */
.graficas-selectors {
	display: flex;
	gap: 12px;
	margin-bottom: 12px;
	padding-bottom: 12px;
	border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.grafica-selector-group {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.grafica-selector-group label {
	color: #a8dadc;
	font-family: 'Montserrat', sans-serif;
	font-size: 11px;
	font-weight: 600;
}

.graficas-select {
	padding: 6px 10px;
	border: 1px solid rgba(0, 212, 255, 0.4);
	border-radius: 6px;
	background: rgba(5, 10, 25, 0.8);
	color: #00d4ff;
	font-family: 'Orbitron', sans-serif;
	font-size: 11px;
	cursor: pointer;
	transition: all 0.3s ease;
	outline: none;
}

.graficas-select:hover {
	border-color: rgba(0, 212, 255, 0.7);
	background: rgba(0, 212, 255, 0.1);
	box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
}

.graficas-select:focus {
	border-color: rgba(0, 212, 255, 1);
	background: rgba(0, 212, 255, 0.15);
	box-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
}

.graficas-select option {
	background: rgba(5, 10, 25, 0.95);
	color: #00d4ff;
}

.graficas-content.hidden {
	display: none;
}

.graficas-container {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.grafica-item {
	flex: 1;
}

.grafica-item label {
	display: block;
	color: #00d4ff;
	font-family: 'Orbitron', sans-serif;
	font-size: 11px;
	margin-bottom: 8px;
	text-align: center;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 1px;
}

.grafica-item canvas {
	max-width: 100%;
	height: auto !important;
	max-height: 200px;
}

/* Botón flotante para gráficas */
#toggle-graficas-btn {
	position: absolute;
	top: 55px;
	left: 272px; /* Posición cuando el sidebar está abierto */
	z-index: 1301; /* Encima del botón de Meteoblue */
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 10px 14px;
	border: 2px solid #00d4ff;
	border-radius: 8px;
	cursor: pointer;
	background: linear-gradient(180deg, #0d1b2a 0%, #1a1a2e 50%, #16213e 100%);
	backdrop-filter: blur(8px);
	color: #00d4ff;
	box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 212, 255, 0.3), inset 0 0 6px rgba(0, 212, 255, 0.1);
	transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease, left 0.3s ease;
	max-width: 140px;
	white-space: nowrap;
	font-size: 13px;
	font-family: 'Orbitron', 'Montserrat', Arial, sans-serif;
	text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
}

/* Mover el botón de gráficas cuando el sidebar está abierto */
body.sidebar-open #toggle-graficas-btn {
	left: 272px !important;
	transition: left 0.3s ease;
}

/* Mover el botón de gráficas cuando el sidebar está cerrado */
body:not(.sidebar-open) #toggle-graficas-btn {
	left: calc(272px - 245px) !important; /* 27px cuando el sidebar está cerrado */
	transition: left 0.3s ease;
}

#toggle-graficas-btn i {
	font-size: 14px;
	filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.6));
	color: #00d4ff;
}

#toggle-graficas-btn:hover {
	transform: translateY(-1px) scale(1.03);
	box-shadow: 4px 6px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 212, 255, 0.5), inset 0 0 8px rgba(0, 212, 255, 0.15);
	border-color: #00d4ff;
	background: linear-gradient(180deg, #0f1f32 0%, #1e2a42 50%, #182542 100%);
	text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

#toggle-graficas-btn:active {
	transform: translateY(0) scale(0.97);
}

#toggle-graficas-btn:focus-visible {
	outline: none;
	box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 212, 255, 0.7), 0 0 0 3px rgba(0, 212, 255, 0.5);
}

#toggle-graficas-btn.active {
	background: linear-gradient(180deg, rgba(13, 27, 42, 0.95) 0%, rgba(26, 26, 46, 0.9) 100%);
	border-color: #00d4ff;
	border-width: 2px;
	top: 8px;
	transform: scale(0.95);
	opacity: 1;
	max-width: 135px;
	padding: 12px 14px;
	box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.5), 0 0 12px rgba(0, 212, 255, 0.4), inset 0 0 6px rgba(0, 212, 255, 0.1);
}
```

---

#### ---radar.css

```css
/* Panel de radar integrado en la sidebar */
.radar-container { display: flex; flex-direction: column; align-items: center; padding: 10px; }
.radar-panel { position: absolute; bottom: 20px; right: 20px; background: linear-gradient(135deg, rgba(0, 255, 231, 0.15) 0%, rgba(0, 255, 231, 0.05) 100%); border: 2px solid #00ffe7; border-radius: 16px; padding: 20px; z-index: 1000; backdrop-filter: blur(12px); box-shadow: 0 0 40px rgba(0, 255, 231, 0.4); width: 200px; height: 180px; display: none; }
.radar-screen { width: 100px; height: 100px; border: 2px solid #00ffe7; border-radius: 50%; position: relative; margin: 0 auto 10px auto; background: radial-gradient(circle, rgba(0, 255, 231, 0.1) 0%, transparent 70%); box-shadow: inset 0 0 30px rgba(0, 255, 231, 0.3); overflow: hidden; }
.radar-grid { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(circle, transparent 65%, rgba(0, 255, 231, 0.05) 65%), linear-gradient(0deg, transparent 49%, rgba(0, 255, 231, 0.05) 49%, rgba(0, 255, 231, 0.05) 51%, transparent 51%), linear-gradient(90deg, transparent 49%, rgba(0, 255, 231, 0.05) 49%, rgba(0, 255, 231, 0.05) 51%, transparent 51%); }
.radar-sweep { width: 2px; height: 50px; background: linear-gradient(to top, transparent, #00ffe7); position: absolute; top: 50%; left: 50%; transform-origin: bottom center; animation: sweep 3s linear infinite; filter: drop-shadow(0 0 5px #00ffe7); }
@keyframes sweep { 0% { transform: translate(-50%, -100%) rotate(0deg); } 100% { transform: translate(-50%, -100%) rotate(360deg); } }
.radar-dot { width: 6px; height: 6px; background: #ff073a; border-radius: 50%; position: absolute; box-shadow: 0 0 12px #ff073a; animation: pulse 1.5s ease-in-out infinite; transform: translate(-50%, -50%); }
@keyframes pulse { 0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.5); } }
.radar-label { text-align: center; margin-bottom: 10px; font-size: 11px; font-weight: 700; color: #00ffe7; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px #00ffe7; }
.radar-stats { width: 100%; margin-top: 10px; }
.radar-stat-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 10px; color: #ffffff; padding: 4px 0; border-bottom: 1px solid rgba(0, 255, 231, 0.2); }
.radar-stat-value { color: #00ffe7; text-shadow: 0 0 5px #00ffe7; font-weight: 700; font-size: 11px; }
```

#### ---meteoblue.css

```css

        /* Overlay de Meteoblue sobre el mapa */
        #meteoblue-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: var(--bottom-safe); /* no invadir la barra inferior */
            display: block; /* Iniciar activado por defecto */
            z-index: 1200; /* por encima del mapa y controles */
            background: transparent;
            transition: left 0.3s ease;
        }
        
        /* Mover el overlay de Meteoblue cuando el sidebar está abierto */
        body.sidebar-open #meteoblue-overlay {
            left: 245px;
            right: 0;
        }
        
        body:not(.sidebar-open) #meteoblue-overlay {
            left: 0;
            right: 0;
        }
        #meteoblue-overlay iframe {
            width: 100%;
            height: 100%;
            border: 0;
        }
        #meteoblue-attrib {
            position: absolute;
            right: 8px;
            bottom: 8px;
            background: rgba(0,0,0,0.5);
            color: #fff;
            padding: 4px 8px;
            border-radius: 6px;
            font: 12px/1.2 Montserrat, Arial, sans-serif;
            transition: right 0.3s ease;
        }
        /* Botón flotante para activar/desactivar el overlay */
        #toggle-meteoblue-btn {
            position: absolute;
            top: 11.5px;
            left: 20px;
            z-index: 1300;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            border: 2px solid #00d4ff;
            border-radius: 8px;
            cursor: pointer;
            background: linear-gradient(180deg, #0d1b2a 0%, #1a1a2e 50%, #16213e 100%);
            backdrop-filter: blur(8px);
            color: #00d4ff;
            box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 212, 255, 0.3), inset 0 0 6px rgba(0, 212, 255, 0.1);
            transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease;
            max-width: 140px;
            white-space: nowrap;
            font-size: 13px;
            font-family: 'Orbitron', 'Montserrat', Arial, sans-serif;
            text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
        }
        #toggle-meteoblue-btn i {
            font-size: 14px;
            filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.6));
            color: #00d4ff;
        }
        #toggle-meteoblue-btn:hover {
            transform: translateY(-1px) scale(1.03);
            box-shadow: 4px 6px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 212, 255, 0.5), inset 0 0 8px rgba(0, 212, 255, 0.15);
            border-color: #00d4ff;
            background: linear-gradient(180deg, #0f1f32 0%, #1e2a42 50%, #182542 100%);
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
        }
        #toggle-meteoblue-btn:active {
            transform: translateY(0) scale(0.97);
        }
        #toggle-meteoblue-btn:focus-visible {
            outline: none;
            box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 212, 255, 0.7), 0 0 0 3px rgba(0, 212, 255, 0.5);
        }
        #toggle-meteoblue-btn.active {
            background: linear-gradient(180deg, rgba(13, 27, 42, 0.95) 0%, rgba(26, 26, 46, 0.9) 100%);
            border-color: #00d4ff;
            border-width: 2px;
            /* Cuando está activo, mover el botón hacia la derecha para despejar la UI del widget */
            top: 8px;
            bottom: content-box;
            right: 20px;
            z-index: 1201; /* Justo por encima del overlay pero no tanto */
            transform: scale(0.95);
            opacity: 1;
            max-width: 135px;
            padding: 12px 14px;
            box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.5), 0 0 12px rgba(0, 212, 255, 0.4), inset 0 0 6px rgba(0, 212, 255, 0.1);
        }
```

---

#### ---comparador-sidebar.css

```css
/* ========================================
   ESTILOS DE LA BARRA INFERIOR (COMPARADOR)
   ======================================== */

/* Contenedor principal de la barra inferior */
.comparador-barra-inferior {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
  border-top: 3px solid #00d4ff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.6);
  padding: 0;
  height: 120px; /* Altura fija para consistencia */
  transition: transform 0.3s ease-in-out;
}

/* Estado oculto (deslizar hacia abajo) */
.comparador-barra-inferior.hidden {
  transform: translateY(100%);
  display: block !important; /* Mantener en el DOM para animación */
}

.comparador-barra-content {
  padding: 8px 16px;
  height: 100%;
  box-sizing: border-box;
}

/* Grid layout de 4 secciones */
.comp-grid {
  display: grid;
  /* Estructura: Cerrar | Modos | Fechas/Controles | Leyenda | (Espacio extra) */
  grid-template-columns: auto 160px 1fr 200px;
  gap: 20px;
  align-items: center;
  height: 100%;
}

/* Secciones genéricas */
.comp-sec {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

/* --- SECCIÓN 0: BOTÓN CERRAR --- */
.comp-sec-close {
  border-right: 1px solid rgba(0, 212, 255, 0.2);
  padding-right: 15px;
}

.comparador-barra-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(0, 212, 255, 0.4);
  background: rgba(5, 10, 25, 0.6);
  color: #00ffe7;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.comparador-barra-close:hover {
  background: rgba(0, 212, 255, 0.2);
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 255, 231, 0.4);
}

/* --- SECCIÓN 1: MODOS (SWIPE / ANIMATE) --- */
.comp-modes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-btn {
  padding: 6px 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  color: #a8dadc;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.mode-btn:hover {
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}

.mode-btn.active {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: #000;
  border-color: #00d4ff;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
}

/* --- SECCIÓN 2: FECHAS Y CONTROLES CENTRALES --- */
.comp-sec-2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
}

/* Header con botones de acción (Activar, Refrescar) */
.comp-date-header {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 5px;
  position: relative;
}

.date-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Botones de acción superiores */
.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid transparent;
  background: transparent;
  color: #a8dadc;
  font-size: 11px;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.link-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.link-btn i { font-size: 12px; }

/* Botón Activar (Verde/Azul) */
.link-activate {
  border-color: #00ff88;
  color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
}
.link-activate:hover {
  background: rgba(0, 255, 136, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
}

/* Botón Detener (Rojo) */
.link-deactivate {
  border-color: #ff4757;
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}
.link-deactivate:hover {
  background: rgba(255, 71, 87, 0.2);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.2);
}

/* Texto central */
.date-centered {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  color: #64748b;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 5px;
}

/* Contenedor de Selectores (Izquierda vs Derecha) */
.comparador-barra-selectores {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 15px;
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.comparador-barra-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.comp-col-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  color: #00d4ff;
  text-transform: uppercase;
  font-weight: 700;
}

.select-pair {
  display: flex;
  gap: 6px;
}

.comparador-select {
  background: rgba(13, 27, 42, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.comparador-select:hover {
  border-color: #00ffe7;
}

/* Selector pequeño para temporada */
.comparador-select.small {
  width: 100px;
}

/* --- SECCIÓN 3: LEYENDA RÁPIDA --- */
.comp-sec-3 {
  border-left: 1px solid rgba(0, 212, 255, 0.2);
  padding-left: 15px;
  align-items: flex-start;
}

.water-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ws-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  color: #a8dadc;
  text-transform: uppercase;
}

.ws-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ws-badge::before {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}

.ws-perm {
  background: rgba(0, 51, 102, 0.3);
  color: #66CCFF;
  border: 1px solid #003366;
}
.ws-perm::before { background: #003366; }

.ws-temp {
  background: rgba(102, 204, 255, 0.15);
  color: #a8dadc;
  border: 1px solid #66CCFF;
}
.ws-temp::before { background: #66CCFF; }

/* --- BOTÓN FLOTANTE (ABRIR BARRA) --- */
.comparador-barra-show {
  position: fixed;
  bottom: 8px;
  left: 95.5%;
  transform: translateX(-50%);
  z-index: 2900;
  background: linear-gradient(135deg, #0d1b2a 0%, #1e3a8a 100%);
  border: 2px solid #00d4ff;
  padding: 10px 20px;
  border-radius: 30px;
  color: #00ffe7;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 255, 231, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.comparador-barra-show:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 255, 231, 0.6);
}

/* Mover el botón cuando el sidebar está abierto */
body.sidebar-open .comparador-barra-show {
  left: calc(50% + 10px); /* Centrar en el área visible (mitad del ancho del sidebar) */
}

body.sidebar-open .comparador-barra-show:hover {
  transform: translateX(-50%) scale(1.05);
}

/* --- ESTILO DEL DIVISOR (LEAFLET SIDE-BY-SIDE) --- */
.leaflet-sbs-divider {
  background-color: #00d4ff !important;
  width: 3px !important;
  box-shadow: 0 0 10px rgba(0, 255, 231, 0.8) !important;
}

/* Círculo central del slider */
.leaflet-sbs-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, #00d4ff 30%, transparent 31%),
              radial-gradient(circle, rgba(0,0,0,0.5) 60%, #00d4ff 61%);
  border-radius: 50%;
  cursor: ew-resize;
  box-shadow: 0 0 15px rgba(0, 255, 231, 0.8);
  margin-top: -20px; /* Centrar verticalmente */
  position: relative;
  z-index: 9999;
}

/* --- CORRECCIÓN VISUAL DE SELECTORES (Cross-Browser) --- */
select.comparador-select {
  background-color: rgba(5, 10, 25, 0.95) !important;
  color: #00ffe7 !important;
  border: 1px solid #00ffe7 !important;
  appearance: none; 
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300ffe7%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right .7em top 50%;
  background-size: .65em auto;
  padding-right: 25px !important;
}

select.comparador-select option {
  background-color: #0d1b2a !important;
  color: #ffffff !important;
  padding: 10px;
}


.comparador-barra-inferior {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3000;
    background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
    border-top: 3px solid #00d4ff;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.4);
    padding: 0;
  }

/* Estado oculto */
.comparador-barra-inferior.hidden {
    display: none;
}
  
  .comparador-barra-content { padding: 6px 16px; }

  /* Grid 4 secciones */
  .comp-grid {
    display: grid;
    grid-template-columns: auto 0.8fr 2.3fr 0.9fr 1.7fr; /* close | modos (un poco a la derecha) | fechas (ligeramente más corta) | cuerpos de agua (más a la izquierda) | gráfica (más ancha) */
    gap: 8px;
    align-items: start;
  }
  .comp-sec { min-width: 0; }
  .comp-sec-1 { justify-self: end; } /* Mover ANIMAR/BARRIDO más a la derecha */
  .comp-sec-3 { justify-self: start; } /* Cuerpos de agua un poco más a la izquierda */
  .comp-sec-4 { justify-self: stretch; }

  /* Tabs LAND COVER / IMAGERY */
  .comp-tabs { display: flex; gap: 10px; margin-bottom: 10px; }
  .comp-tab {
    padding: 8px 14px;
    border: 1px solid #00d4ff80;
    border-radius: 8px;
    background: rgba(0,0,0,0.35);
    color: #a8dadc;
    font-family: 'Orbitron', sans-serif;
    font-size: .9em;
    cursor: pointer;
  }
  .comp-tab.active { background: linear-gradient(135deg,#00d4ff 0,#0099cc 100%); color:#000; }

  /* Modos */
  .comp-modes { display:flex; flex-direction: column; align-items: flex-start; gap:10px; }

/* Botón de cerrar barra */
.comparador-barra-close {
  position: static;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.45);
  background: rgba(5, 10, 25, 0.7);
  color: #00ffe7;
  cursor: pointer;
  transition: all 0.2s ease;
}
.comparador-barra-close:hover {
  transform: translateY(-1px) scale(1.05);
}

/* Botón para mostrar la barra cuando está oculta */
.comparador-barra-show {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 2px; /* más pegado al borde inferior */
  z-index: 3001;
  display: none; /* visible solo cuando la barra está oculta */
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid rgba(0, 212, 255, 0.45);
  border-radius: 10px;
  background: rgba(5, 10, 25, 0.8);
  color: #00ffe7;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  transition: all 0.2s ease;
}
.comparador-barra-show:hover {
  transform: translateX(-50%) translateY(-1px) scale(1.03);
}

/* Sección de close dedicada */
.comp-sec-close { display:flex; align-items:flex-start; }
  
  .comparador-barra-titulo {
    color: #00d4ff;
    font-family: 'Orbitron', sans-serif;
    font-size: 1em;
    display: flex;
    align-items: center;
    gap: 10px;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
  }
  
  .comparador-barra-modos {
    display: flex;
    gap: 10px;
  }
  .mode-btn {
    padding: 8px 12px;
    background: rgba(0,0,0,0.35);
    border: 2px solid #00d4ff80;
    border-radius: 8px;
    color: #a8dadc;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.9em;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
    text-transform: uppercase;
  }
  .mode-btn.active {
    background: linear-gradient(135deg, #00d4ff 0, #0099cc 100%);
    color: #000;
    border: 2px solid #00d4ff;
    box-shadow: 0 0 15px rgba(0,212,255,0.5);
  }
  .mode-btn i { margin-right: 6px; }
  
  .comp-date-header { display:flex; align-items:center; justify-content: center; gap:12px; margin-bottom: 2px; }
  .date-title { display:none; }
  .date-title span { display:none; }
  .date-centered { text-align:center; color:#a8dadc; font-family:'Orbitron',sans-serif; font-size:12px; margin-bottom: 2px; }
  .date-actions { display:flex; gap:8px; align-items:center; }
  .link-btn { display:inline-flex; gap:8px; align-items:center; color:#a8dadc; background:transparent; border:0; cursor:pointer; font-family:'Montserrat',sans-serif; font-size:12px; }
  .link-btn i { color:#00d4ff; }
  .link-activate { color:#00eaff; border:1px solid rgba(0,212,255,0.6); padding:6px 10px; border-radius:16px; background:rgba(0,212,255,0.12); box-shadow:0 0 10px rgba(0,212,255,0.2) inset; }
  .link-deactivate { color:#ff8b8b; border:1px solid rgba(255,80,80,0.6); padding:6px 10px; border-radius:16px; background:rgba(255,80,80,0.12); box-shadow:0 0 10px rgba(255,80,80,0.2) inset; }

  .comparador-barra-selectores {
    display: flex;
    gap: 10px; /* separación entre Izquierda y Derecha */
    align-items: flex-start;
    justify-content: center; /* acercar al centro del bloque */
    flex-wrap: nowrap;
  }
  .comp-col-title { color:#00d4ff; font-family:'Orbitron',sans-serif; font-size: .8em; margin-bottom:4px; display:block; }
  .years-row { display:none; }
  .seasons-row { display:none; }
  .select-pair { display:flex; gap:6px; align-items:center; }
  .comparador-select.small { padding: 6px 8px; font-size: 12px; }
  .comparador-barra-col {
    display: flex;
    flex-direction: column;
    align-items: center; /* centrar títulos y selects */
    row-gap: 6px;
  }
  .comparador-barra-col label {
    color: #00d4ff;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.9em;
  }
  .comparador-select {
    padding: 6px 12px;
    background: rgba(0,0,0,0.35);
    border: 2px solid #00d4ff60;
    border-radius: 6px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.88em;
    color: #fff;
    min-width: 100px;
  }
  .comparador-barra-acciones {
    display: flex;
    gap: 8px;
    margin-top: 6px;
    justify-content: center;
  }
  .btn-comparador-action {
    border-radius: 20px;
    padding: 6px 16px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
    border: none;
  }

  /* Sección 3: resumen de inundación */
  /* Resumen de cuerpos de agua - super compacto */
  .water-summary { display:flex; flex-direction: column; align-items:flex-start; gap:6px; }
  .ws-title { color:#a8dadc; font-family:'Montserrat',sans-serif; font-size:12px; }
  .ws-badge { font-family:'Orbitron',sans-serif; font-size:12px; padding:2px 8px; border-radius:12px; border:1px solid; display:inline-block; }
  .ws-perm { color:#00eaff; border-color:#00d4ff; background:rgba(0,212,255,0.12); }
  .ws-temp { color:#ffd166; border-color:#ffd166; background:rgba(255,209,102,0.12); }

  /* Sección 4: gráficas */
  .comp-charts-container {
    display: flex;
    gap: 12px;
    width: 100%;
  }
  
  .comp-chart {
    flex: 1;
    min-width: 0;
  }
  
  .comp-chart label {
    display: block;
    color: #00d4ff;
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    margin-bottom: 8px;
    text-align: center;
    font-weight: 600;
  }
  
  .comp-chart canvas {
    max-width: 100%;
    height: auto !important;
    max-height: 120px;
  }

  .btn-activar {
    background: rgba(0, 212, 255, 0.15);
    color: #00eaff;
    border: 1px solid rgba(0, 212, 255, 0.6);
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.25), inset 0 0 8px rgba(0, 212, 255, 0.15);
  }
  .btn-actualizar { background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); color: #000; }
  .btn-desactivar { background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); color: #fff; }
  .comparador-barra-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-left: 18px;
    font-size: 12px;
    color: #a8dadc;
  }
  .comparador-barra-info i {
    color: #00d4ff;
    margin-right: 5px;
  }
```

---

#### ---mapa-agua.css

```css
/* =========================================
   ESTILOS PARA EL MAPA DE AGUA (PÁGINA SECUNDARIA)
   ========================================= */

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f0f4f8;
  color: #1e293b;
}

header {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

header h1 {
  margin: 0 0 5px 0;
  font-size: 1.8em;
  font-weight: 700;
}

header p {
  margin: 0;
  font-size: 0.95em;
  opacity: 0.9;
}

.contenedor-mapa {
  display: flex;
  margin: 20px;
  gap: 20px;
  height: calc(100vh - 160px);
}

#mapa-agua {
  flex: 3;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  z-index: 1;
  border: 1px solid #e2e8f0;
}

#panel-info {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  overflow-y: auto;
  max-width: 320px;
  border: 1px solid #e2e8f0;
}

#panel-info h3 {
  color: #0f766e;
  margin-top: 20px;
  margin-bottom: 12px;
  font-size: 1.1em;
  border-bottom: 2px solid #ccfbf1;
  padding-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

#panel-info h3:first-child {
  margin-top: 0;
}

#panel-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

#panel-info li {
  margin: 8px 0;
  padding: 10px 14px;
  background: #f8fafc;
  border-left: 4px solid #94a3b8;
  border-radius: 4px;
  font-size: 0.9em;
  transition: all 0.2s ease;
}

#panel-info li:hover {
  transform: translateX(3px);
  background: #f0f9ff;
  border-left-color: #0ea5e9;
}

#panel-info li strong {
  color: #334155;
  display: block;
  margin-bottom: 2px;
}

footer {
  background: #0f766e;
  color: white;
  text-align: center;
  padding: 10px;
  margin-top: 0;
  font-size: 0.85em;
}

.leyenda-agua {
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 10px;
  line-height: 1.4;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.leyenda-agua h4 {
  margin: 0 0 5px 0;
  font-size: 10px;
  font-weight: 700;
  color: #0f766e;
  text-transform: uppercase;
}

.leyenda-agua i {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 5px;
  vertical-align: middle;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 2px;
}

#reset-zoom-btn {
  position: absolute;
  top: 80px;
  left: 10px;
  z-index: 1000;
  background: white;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 4px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.2s;
}

#reset-zoom-btn:hover {
  background: #f1f5f9;
  color: #0f766e;
}
```

#### ---lef.css

*(Archivo no presente en la estructura actual del proyecto.)*

---

#### ---compara-agua.css

*(Archivo no presente en la estructura actual. El comparador utiliza `comparador-sidebar.css`.)*

---

#### ---compara-agua.css (contenido histórico, no cargado)

```css
/* ========================================
   ESTILOS COMPACTOS PARA COMPARADOR EN SIDEBAR
   ======================================== */

/* Panel principal del comparador - Versión compacta */
.comparador-panel {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #00d4ff;
    border-radius: 10px;
    padding: 15px;
    margin: 10px 0;
    box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3);
    font-family: 'Orbitron', sans-serif;
}

/* Título del comparador - Más pequeño */
.comparador-panel h3 {
    color: #00d4ff;
    text-align: center;
    margin: 0 0 15px 0;
    font-size: 1em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

/* Contenedor de los dos lados - Compacto */
.comparador-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 15px;
}

/* Panel de cada lado - Compacto */
.comparador-lado {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    padding: 10px;
    transition: all 0.3s ease;
}

.comparador-lado:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 212, 255, 0.6);
}

/* Títulos de cada lado - Más pequeños */
.comparador-lado h4 {
    color: #00d4ff;
    font-size: 0.9em;
    margin: 0 0 10px 0;
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Grupos de selección - Compactos */
.select-group {
    margin-bottom: 10px;
}

.select-group label {
    display: block;
    color: #a8dadc;
    font-size: 0.75em;
    margin-bottom: 5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Estilos de los selectores - Más pequeños */
.select-group select {
    width: 100%;
    padding: 8px 10px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(0, 212, 255, 0.4);
    border-radius: 6px;
    color: #ffffff;
    font-size: 0.85em;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none;
}

.select-group select:hover {
    border-color: #00d4ff;
    background: rgba(0, 0, 0, 0.6);
}

.select-group select:focus {
    border-color: #00ff88;
    box-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
    background: rgba(0, 0, 0, 0.7);
}

/* Opciones del select */
.select-group select option {
    background: #1a1a2e;
    color: #ffffff;
    padding: 8px;
}

/* Contenedor de botones - Vertical */
.comparador-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 15px;
}

/* Botones del comparador - Más pequeños */
.btn-comparador {
    width: 100%;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.8em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Botón activar */
.btn-activar {
    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
    color: #ffffff;
}

.btn-activar:hover {
    background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);
    transform: translateY(-1px);
}

/* Botón desactivar */
.btn-desactivar {
    background: linear-gradient(135deg, #ff4757 0%, #cc3644 100%);
    color: #ffffff;
}

.btn-desactivar:hover {
    background: linear-gradient(135deg, #ff6b81 0%, #ee5a6f 100%);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
    transform: translateY(-1px);
}

/* Botón actualizar */
.btn-actualizar {
    background: linear-gradient(135deg, #ffa502 0%, #ff7f00 100%);
    color: #ffffff;
}

.btn-actualizar:hover {
    background: linear-gradient(135deg, #ffb732 0%, #ff9f1a 100%);
    box-shadow: 0 4px 12px rgba(255, 165, 2, 0.4);
    transform: translateY(-1px);
}

/* Información - Más compacta */
.comparador-info {
    background: rgba(0, 212, 255, 0.1);
    border-left: 3px solid #00d4ff;
    padding: 8px 10px;
    margin-top: 10px;
    border-radius: 4px;
    font-size: 0.7em;
    color: #a8dadc;
    font-family: 'Montserrat', sans-serif;
    line-height: 1.4;
}

.comparador-info i {
    color: #00d4ff;
    margin-right: 5px;
}

/* Estilo del control side-by-side */
.leaflet-sbs-divider {
    background-color: #00d4ff !important;
    width: 4px !important;
    cursor: ew-resize !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.6) !important;
}
```

---

#### ---README.md (Css)

*(Documentación de estructura modular CSS: base, mapa, sidebar, efectos-futuristas, radar, orden de carga, tema futurista)*

---

### --GeoServer

#### ---agua_3clases.sld (agua_azul)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld">
  <NamedLayer>
    <Name>agua_azul</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <ColorMap>
              <ColorMapEntry color="#000000" opacity="0" quantity="0" label="Sin agua"/>
              <ColorMapEntry color="#003366" quantity="1" label="Agua permanente"/>
              <ColorMapEntry color="#66CCFF" quantity="2" label="Agua temporal"/>
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
```

---

### --Data

#### ---agua_tabasco_datos.csv

Estructura: `system:index, area_ha, area_km2, season, year, .geo`  
Temporadas: Primavera, Verano, Otoño, Invierno, Antes, Durante, Después, Permanente, Temporal

---

### --Raíz

#### ---server.js

```javascript
/**
 * Servidor Express para Mapa Coroplético Interactivo de Tabasco
 * 
 * Este servidor sirve los archivos estáticos de la aplicación web
 * y maneja las rutas principales.
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos desde la raíz
app.use(express.static(__dirname));

// Middleware para parsear JSON (por si se necesitan APIs en el futuro)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'lef.html'));
});

app.get('/lef', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'lef.html'));
});

app.get('/mapa-agua', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'mapa-agua.html'));
});

app.get('/comparador', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'comparador-sidebar.html'));
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'Html', 'lef.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🗺️  Mapa Coroplético Interactivo de Tabasco');
    console.log('='.repeat(60));
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Directorio raíz: ${__dirname}`);
    console.log(`🌐 Página principal: http://localhost:${PORT}/Html/lef.html`);
    console.log('='.repeat(60));
    console.log('⚠️  Asegúrate de que GeoServer esté ejecutándose en http://localhost:8080');
    console.log('='.repeat(60));
});

// Manejo de errores del servidor
process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
});
```

---

#### ---package.json

```json
{
  "name": "mapa-tabasco",
  "version": "1.0.0",
  "description": "Mapa Coroplético Interactivo de Tabasco - Aplicación web para visualización de mapas interactivos con análisis espacial",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "leaflet",
    "mapas",
    "geoserver",
    "tabasco",
    "gis",
    "web-mapping"
  ],
  "author": "Diaz-0",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Diaz-0/Mapa.git"
  }
}
```

---

#### ---.htaccess

```apache
# Configuración de Permissions-Policy para evitar errores
<IfModule mod_headers.c>
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
</IfModule>
```

---

### --GeoServer (README_estilo_3clases.md)

Ver `GeoServer/README_estilo_3clases.md` para instrucciones de importación del estilo SLD en GeoServer.

---

**Documento generado.** Sincronizado con el código actual del proyecto.
