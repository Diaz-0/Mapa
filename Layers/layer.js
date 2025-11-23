var mapa = L.map("contenedor-del-mapa", { zoomControl: false }).setView([17.668149360093285,-91.53945922851564], 9)



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