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