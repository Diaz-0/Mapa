// Configuración de GeoServer - workspace
const aguaConfig = {
    geoserverUrl: 'http://localhost:8080/geoserver/agua_tabasco/wms', 
    workspace: 'agua_tabasco'
};

// Objeto para almacenar las capas de agua
const capasAgua = {
    primavera: null,
    verano: null,
    otono: null,
    invierno: null
};

// Variable para almacenar la referencia al mapa
let mapaReferencia = null;

// Función para buscar el mapa en diferentes ubicaciones posibles
function buscarMapa() {
    // Intentar diferentes nombres de variables globales
    if (typeof map !== 'undefined') return map;
    if (typeof mapa !== 'undefined') return mapa;
    if (typeof window.map !== 'undefined') return window.map;
    if (typeof window.mapa !== 'undefined') return window.mapa;
    
    // Buscar en todas las variables del window
    for (let key in window) {
        if (window[key] && window[key]._leaflet_id) {
            return window[key];
        }
    }
    
    return null;
}

// Crear capas WMS desde GeoServer
function crearCapaAguaWMS(temporada) {
    // Mapeo de nombres exactos como están en GeoServer
    const nombresCapas = {
        'primavera': 'Agua_Primavera_2020-1',
        'verano': 'Agua_Verano_2020-1',
        'otono': 'Agua_Otono_2020-1',
        'invierno': 'Agua_Invierno_2020-1'
    };
    
    const nombreCapa = nombresCapas[temporada];
    
    console.log(`🌊 Creando capa WMS: ${aguaConfig.workspace}:${nombreCapa}`);
    
    return L.tileLayer.wms(aguaConfig.geoserverUrl, {
        layers: `${aguaConfig.workspace}:${nombreCapa}`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: 'Sentinel-1 SAR | GEE & SNAP',
        pane: 'overlayPane',
        zIndex: 1000
    });
}


// Inicializar capas de agua
function inicializarCapasAgua() {
    try {
        // Buscar el mapa
        mapaReferencia = buscarMapa();
        
        if (!mapaReferencia) {
            console.warn('⏳ El mapa aún no está disponible, reintentando en 1 segundo...');
            setTimeout(inicializarCapasAgua, 1000);
            return;
        }

        console.log('✅ Mapa encontrado, creando capas de agua...');

        // Crear capas para cada temporada
        capasAgua.primavera = crearCapaAguaWMS('primavera');
        capasAgua.verano = crearCapaAguaWMS('verano');
        capasAgua.otono = crearCapaAguaWMS('otono');
        capasAgua.invierno = crearCapaAguaWMS('invierno');

        console.log('✅ Todas las capas de agua temporal inicializadas correctamente');
        console.log('📍 Capas disponibles:', Object.keys(capasAgua));
        
        // Mostrar notificación
        if (typeof showNotification === 'function') {
            showNotification('Capas de agua temporal listas');
        }
    } catch (error) {
        console.error('❌ Error al inicializar capas de agua:', error);
    }
}

// Activar/desactivar una capa de agua específica
function toggleAguaLayer(temporada, activar) {
    if (!mapaReferencia) {
        mapaReferencia = buscarMapa();
        if (!mapaReferencia) {
            console.error('❌ No se puede acceder al mapa');
            return;
        }
    }
    
    if (!capasAgua[temporada]) {
        console.error(`❌ Capa de ${temporada} no encontrada`);
        return;
    }

    if (activar) {
        capasAgua[temporada].addTo(mapaReferencia);
        console.log(`✅ Capa de ${temporada} activada`);
        
        // Verificar si la capa se agregó
        console.log(`📊 Número de capas en el mapa:`, Object.keys(mapaReferencia._layers).length);
    } else {
        mapaReferencia.removeLayer(capasAgua[temporada]);
        console.log(`❌ Capa de ${temporada} desactivada`);
    }
}

// Activar todas las capas de agua
function activarTodasLasCapasAgua() {
    console.log('🌊 Activando todas las capas de agua...');
    
    let activadas = 0;
    Object.keys(capasAgua).forEach(temporada => {
        const checkbox = document.getElementById(`agua-${temporada}`);
        if (checkbox) {
            checkbox.checked = true;
            toggleAguaLayer(temporada, true);
            activadas++;
        }
    });
    
    console.log(`✅ ${activadas} capas activadas`);
    
    if (typeof showNotification === 'function') {
        showNotification(`${activadas} capas de agua activadas`);
    }
}

// Desactivar todas las capas de agua
function desactivarTodasLasCapasAgua() {
    console.log('🙈 Desactivando todas las capas de agua...');
    
    let desactivadas = 0;
    Object.keys(capasAgua).forEach(temporada => {
        const checkbox = document.getElementById(`agua-${temporada}`);
        if (checkbox) {
            checkbox.checked = false;
            toggleAguaLayer(temporada, false);
            desactivadas++;
        }
    });
    
    console.log(`✅ ${desactivadas} capas desactivadas`);
    
    if (typeof showNotification === 'function') {
        showNotification('Todas las capas de agua desactivadas');
    }
}

// Exportar funciones para uso global
window.toggleAguaLayer = toggleAguaLayer;
window.activarTodasLasCapasAgua = activarTodasLasCapasAgua;
window.desactivarTodasLasCapasAgua = desactivarTodasLasCapasAgua;

// Inicializar cuando la página esté completamente cargada
console.log('📄 Script de agua temporal cargado');

window.addEventListener('load', function() {
    console.log('🚀 Iniciando módulo de agua temporal...');
    console.log('🔧 Configuración GeoServer:', aguaConfig);
    
    // Esperar 3 segundos para que el mapa se inicialice
    setTimeout(function() {
        console.log('⏰ Iniciando búsqueda del mapa...');
        inicializarCapasAgua();
    }, 3000);
});
