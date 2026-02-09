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

    // Obtener año seleccionado (podrías añadir un selector de año en el HTML principal si quisieras)
    // Por defecto usaremos 2020 como pediste originalmente, o el año actual
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

        const riesgos = [
            { label: 'Riesgo Bajo (1-20%)', color: '#FFF3B0', glow: 'rgba(255,243,176,0.6)' },
            { label: 'Riesgo Medio (21-40%)', color: '#FF9800', glow: 'rgba(255,152,0,0.6)' },
            { label: 'Riesgo Alto (41-60%)', color: '#FF3B30', glow: 'rgba(255,59,48,0.6)' },   
            { label: 'Zona Crítica (>60%)', color: '#7F0000', glow: 'rgba(127,0,0,0.7)' }
        ];

        div.innerHTML = `
            <h4>Clasificación Sentinel-1</h4>
            <div class="legend-group">
                <div class="legend-item">
                    <span class="legend-swatch" style="background:#003366;"></span>
                    <span>Agua Permanente</span>
                </div>
                <div class="legend-item">
                    <span class="legend-swatch" style="background:#66CCFF;"></span>
                    <span>Agua Temporal</span>
                </div>
            </div>

            <h4>Riesgo de Inundación</h4>
            <div class="legend-group">
                ${riesgos.map(r => `
                    <div class="legend-item">
                        <span class="legend-swatch" style="background:${r.color}; box-shadow:0 0 6px ${r.glow};"></span>
                        <span>${r.label}</span>
                    </div>
                `).join('')}
            </div>

            <div class="legend-gradient">
                <span class="legend-gradient-label">Seguro</span>
                <div class="legend-gradient-bar"></div>
                <span class="legend-gradient-label">Crítico</span>
            </div>
            <small class="legend-note">Frecuencia (%) acumulada 2017-2026</small>
        `;

        return div;
    };
    leyenda.addTo(mapa);
    estadoMapa.leyenda = leyenda;
}

// Función global para los checkboxes del sidebar.html
window.toggleAguaLayer = function(temporada, activo) {
    if (activo) {
        // En este diseño de mapa simple, al activar uno desactivamos los otros visualmente
        // para evitar superposiciones confusas, o podrías permitir múltiples.
        // Aquí asumimos comportamiento "Radio Button" visual aunque sean Checkboxes
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
    // Desmarcar checkboxes visualmente
    document.querySelectorAll('.agua-layer-item input').forEach(el => el.checked = false);
};

window.addEventListener('load', function() {
    setTimeout(() => {
        inicializarLeyenda();
        // Cargar invierno por defecto si se desea
        // cambiarCapaPrincipal('Invierno'); 
    }, 2000);
});