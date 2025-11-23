
const comparadorConfig = {
    geoserverUrl: 'http://localhost:8080/geoserver/agua_tabasco/wms',
    workspace: 'agua_tabasco',
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    seasons: ['Primavera', 'Verano', 'Otono', 'Invierno']
};

// Variables globales del comparador
let comparadorActivo = false;
let sideBySideControl = null;
let capaIzquierda = null;
let capaDerecha = null;
let mapaComparador = null;

// Variables globales del comparador sidebar dedicado
let comparadorBarraActivo = false;
let sideBySideControlBarra = null;
let capaIzquierdaBarra = null;
let capaDerechaBarra = null;
let mapaComparadorBarra = null;

// Variables para gráficas
let chartLeft = null;
let chartRight = null;
let datosCSVCargados = false;

// Alerta ligera sobre el mapa (se autodestruye)
function mostrarAlertaEnMapa(mensaje, duracionMs = 3500) {
    try {
        const mapRef = window.mapa || window.map || mapaComparadorBarra;
        if (!mapRef) { alert(mensaje); return; }
        const container = mapRef.getContainer ? mapRef.getContainer() : document.body;
        const div = document.createElement('div');
        div.className = 'map-alert';
        div.style.position = 'absolute';
        div.style.top = '50%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.zIndex = '10000';
        div.style.padding = '12px 16px';
        div.style.border = '1px solid rgba(0, 212, 255, 0.7)';
        div.style.borderRadius = '10px';
        div.style.background = 'rgba(5,10,25,0.92)';
        div.style.color = '#00eaff';
        div.style.fontFamily = 'Orbitron, sans-serif';
        div.style.fontSize = '13px';
        div.style.boxShadow = '0 10px 28px rgba(0,0,0,0.45), 0 0 14px rgba(0,255,231,0.24)';
        div.style.pointerEvents = 'none';
        div.textContent = mensaje;
        container.appendChild(div);
        setTimeout(() => { try { container.removeChild(div); } catch(_){} }, duracionMs);
    } catch (_) { try { alert(mensaje); } catch(__) {} }
}

// Función para crear una capa WMS específica (mejorada con validación)
async function crearCapaComparacion(year, season) {
    const layerName = `Agua_${season}_${year}-1`;
    console.log(`🌊 Creando capa de comparación: ${comparadorConfig.workspace}:${layerName}`);
    // Usar el módulo mejorado; si no valida/existe, devolver null para que el flujo lo maneje
    if (window.wmsEnhancer) {
        const capa = await window.wmsEnhancer.crearCapaComparacion(year, season);
        return capa || null;
    }
    // Si no existe el módulo, usa el método simple (comportamiento anterior)
    return L.tileLayer.wms(comparadorConfig.geoserverUrl, {
        layers: `${comparadorConfig.workspace}:${layerName}`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: `Agua ${season} ${year} | Sentinel-1 SAR`,
        pane: 'overlayPane',
        zIndex: 1000,
        opacity: 1,
        keepBuffer: 2,
        updateWhenIdle: true,
        updateWhenZooming: false,
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    });
}

// Inicializar el comparador
function inicializarComparador() {
    // Buscar el mapa
    mapaComparador = window.mapa || window.map;
    
    if (!mapaComparador) {
        console.error('❌ No se puede acceder al mapa para el comparador');
        return;
    }
    
    console.log('✅ Comparador de agua temporal inicializado');
}

function inicializarComparadorBarra() {
    mapaComparadorBarra  = window.mapa || window.map;
    if (!mapaComparadorBarra ) {
        console.error('❌ No se puede acceder al mapa para el comparador barra');
        return;
    }
    console.log('✅ Comparador barra inicializado');
}

// Activar el modo comparador
async function activarComparador() {
    if (comparadorActivo) {
        console.warn('⚠️ El comparador ya está activo');
        return;
    }
    
    // Obtener valores seleccionados
    const yearLeft = document.getElementById('year-left').value;
    const seasonLeft = document.getElementById('season-left').value;
    const yearRight = document.getElementById('year-right').value;
    const seasonRight = document.getElementById('season-right').value;
    
    console.log(`🔄 Activando comparador: ${seasonLeft} ${yearLeft} vs ${seasonRight} ${yearRight}`);
    
    try {
        // Crear capas (ahora async)
        capaIzquierda = await crearCapaComparacion(yearLeft, seasonLeft);
        capaDerecha = await crearCapaComparacion(yearRight, seasonRight);
        
        if (!capaIzquierda || !capaDerecha) {
            console.error('❌ No se pudieron crear las capas');
            if (typeof showNotification === 'function') {
                showNotification('Error: No se pudieron cargar las capas', 'error');
            }
            return;
        }
        
        // Agregar capas al mapa
        capaIzquierda.addTo(mapaComparador);
        capaDerecha.addTo(mapaComparador);
    } catch (error) {
        console.error('❌ Error al crear capas:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error al crear capas: ' + error.message, 'error');
        }
        return;
    }
    
    // Crear control side-by-side
    sideBySideControl = L.control.sideBySide(capaIzquierda, capaDerecha, {
        thumbSize: 42,
        padding: 0
    });
    
    sideBySideControl.addTo(mapaComparador);
    
    // IMPORTANTE: Configurar eventos para el control del divisor
    setTimeout(function() {
        const rangeInput = document.querySelector('.leaflet-sbs-range');
        if (rangeInput) {
            // Deshabilitar arrastre del mapa mientras se usa el divisor
            rangeInput.addEventListener('mousedown', function(e) {
                mapaComparador.dragging.disable();
                e.stopPropagation();
            });
            
            rangeInput.addEventListener('mouseup', function() {
                mapaComparador.dragging.enable();
            });
            
            // Para dispositivos táctiles
            rangeInput.addEventListener('touchstart', function(e) {
                mapaComparador.dragging.disable();
                e.stopPropagation();
            });
            
            rangeInput.addEventListener('touchend', function() {
                mapaComparador.dragging.enable();
            });
            
            console.log('✅ Eventos del divisor configurados correctamente');
        } else {
            console.error('❌ No se encontró el input range del divisor');
        }
    }, 500);
    
    comparadorActivo = true;
    
    // Actualizar UI
    document.getElementById('btn-activar-comparador').style.display = 'none';
    document.getElementById('btn-desactivar-comparador').style.display = 'inline-block';
    document.getElementById('btn-actualizar-comparador').style.display = 'inline-block';
    
    // Agregar clase activo al panel
    const panel = document.getElementById('comparador-panel');
    if (panel) {
        panel.classList.add('activo');
    }
    
    // Deshabilitar controles mientras está activo
    deshabilitarControles(false);
    
    console.log('✅ Comparador activado exitosamente');
    
    if (typeof showNotification === 'function') {
        showNotification(`Comparando: ${seasonLeft} ${yearLeft} vs ${seasonRight} ${yearRight}`);
    }
}


// Desactivar el modo comparador
function desactivarComparador() {
    if (!comparadorActivo) {
        console.warn('⚠️ El comparador no está activo');
        return;
    }
    
    console.log('🔄 Desactivando comparador...');
    
    // Remover control side-by-side
    if (sideBySideControl) {
        sideBySideControl.remove();
        sideBySideControl = null;
    }
    
    // Remover capas
    if (capaIzquierda) {
        mapaComparador.removeLayer(capaIzquierda);
        capaIzquierda = null;
    }
    
    if (capaDerecha) {
        mapaComparador.removeLayer(capaDerecha);
        capaDerecha = null;
    }
    
    comparadorActivo = false;
    
    // Actualizar UI
    document.getElementById('btn-activar-comparador').style.display = 'inline-block';
    document.getElementById('btn-desactivar-comparador').style.display = 'none';
    document.getElementById('btn-actualizar-comparador').style.display = 'none';
    
    // Habilitar controles
    deshabilitarControles(true);
    
    console.log('✅ Comparador desactivado exitosamente');
    
    if (typeof showNotification === 'function') {
        showNotification('Comparador desactivado');
    }
}

// Actualizar capas del comparador sin desactivarlo
async function actualizarComparador() {
    if (!comparadorActivo) {
        console.warn('⚠️ El comparador no está activo, activándolo...');
        await activarComparador();
        return;
    }
    
    console.log('🔄 Actualizando capas del comparador...');
    
    // Remover capas antiguas
    if (capaIzquierda) {
        mapaComparador.removeLayer(capaIzquierda);
    }
    if (capaDerecha) {
        mapaComparador.removeLayer(capaDerecha);
    }
    
    // Remover control antiguo
    if (sideBySideControl) {
        sideBySideControl.remove();
    }
    
    // Obtener nuevos valores
    const yearLeft = document.getElementById('year-left').value;
    const seasonLeft = document.getElementById('season-left').value;
    const yearRight = document.getElementById('year-right').value;
    const seasonRight = document.getElementById('season-right').value;
    
    console.log(`🔄 Nueva comparación: ${seasonLeft} ${yearLeft} vs ${seasonRight} ${yearRight}`);
    
    try {
        // Crear nuevas capas (ahora async)
        capaIzquierda = await crearCapaComparacion(yearLeft, seasonLeft);
        capaDerecha = await crearCapaComparacion(yearRight, seasonRight);
        
        if (!capaIzquierda || !capaDerecha) {
            console.error('❌ No se pudieron actualizar las capas');
            if (typeof showNotification === 'function') {
                showNotification('Error: No se pudieron actualizar las capas', 'error');
            }
            return;
        }
        
        // Agregar al mapa
        capaIzquierda.addTo(mapaComparador);
        capaDerecha.addTo(mapaComparador);
    } catch (error) {
        console.error('❌ Error al actualizar capas:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error al actualizar capas: ' + error.message, 'error');
        }
        return;
    }
    
    // Recrear control
    sideBySideControl = L.control.sideBySide(capaIzquierda, capaDerecha, {
        thumbSize: 42,
        padding: 0
    });
    
    sideBySideControl.addTo(mapaComparador);
    
    console.log('✅ Comparador actualizado exitosamente');
    
    if (typeof showNotification === 'function') {
        showNotification(`Actualizado: ${seasonLeft} ${yearLeft} vs ${seasonRight} ${yearRight}`);
    }
}



// Habilitar/deshabilitar controles
function deshabilitarControles(habilitar) {
    const controles = [
        'year-left', 'season-left',
        'year-right', 'season-right'
    ];
    
    controles.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.disabled = !habilitar;
        }
    });
}

// Sincronizar años (opcional - para comparar misma temporada en diferentes años)
function sincronizarTemporadas() {
    const seasonLeft = document.getElementById('season-left').value;
    document.getElementById('season-right').value = seasonLeft;
    
    console.log(`🔗 Temporadas sincronizadas: ${seasonLeft}`);
}

// Variable para el modo actual
let modoComparador = 'swipe'; // 'swipe' o 'animate'

// Cambiar entre modo swipe y animate
function cambiarModoComparador(modo) {
    modoComparador = modo;
    
    // Actualizar botones
    const btnSwipe = document.getElementById('btn-mode-swipe');
    const btnAnimate = document.getElementById('btn-mode-animate');
    
    if (btnSwipe && btnAnimate) {
        if (modo === 'swipe') {
            btnSwipe.classList.add('active');
            btnAnimate.classList.remove('active');
        } else {
            btnSwipe.classList.remove('active');
            btnAnimate.classList.add('active');
        }
    }
    
    console.log(`🔄 Modo cambiado a: ${modo}`);
    
    // Si el comparador está activo, reactivarlo con el nuevo modo
    if (comparadorActivo) {
        desactivarComparador();
        setTimeout(() => {
            activarComparador();
        }, 500);
    }
}



function cambiarModoComparadorBarra(modo) {
    const btnSwipe = document.getElementById('comparador-barra-btn-mode-swipe') || document.getElementById('comparador-barra-btn-mode-swipe');
    const btnAnimate = document.getElementById('comparador-barra-btn-mode-animate') || document.getElementById('comparador-barra-btn-mode-animate');

    if (btnSwipe && btnAnimate) {
        btnSwipe.classList.toggle('active', modo === 'swipe');
        btnAnimate.classList.toggle('active', modo === 'animate');
    }

    // Aquí añade lógica para activar/desactivar animación o swipe si usas control animado
}


// Función para cargar datos CSV
async function cargarDatosCSV() {
    if (datosCSVCargados) return true;
    
    if (!window.datosAgua) {
        console.warn('⚠️ Módulo datosAgua no disponible');
        return false;
    }
    
    try {
        await window.datosAgua.cargarDesdeCSV('/Data/agua_tabasco_datos.csv');
        datosCSVCargados = true;
        console.log('✅ Datos CSV cargados para gráficas');
        return true;
    } catch (error) {
        console.error('❌ Error al cargar datos CSV:', error);
        return false;
    }
}

// Función para crear/actualizar gráfica
function crearGrafica(canvasId, year, tipoGrafica) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`⚠️ Canvas ${canvasId} no encontrado`);
        return null;
    }
    
    // Destruir gráfica anterior si existe
    const chartInstance = canvasId === 'chart-left' ? chartLeft : chartRight;
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    if (!window.datosAgua || !datosCSVCargados) {
        console.warn('⚠️ Datos CSV no cargados');
        return null;
    }
    
    let labels = [];
    let datosOrdenados = [];
    let titulo = '';
    
    if (tipoGrafica === 'inundacion') {
        // Gráfica "Antes, Durante, Después"
        const datos = window.datosAgua.obtenerAntesDuranteDespues(year);
        labels = ['Antes', 'Durante', 'Después'];
        datosOrdenados = [
            datos.antes ? datos.antes.area_km2 : 0,
            datos.durante ? datos.durante.area_km2 : 0,
            datos.despues ? datos.despues.area_km2 : 0
        ];
        titulo = `Inundación (km²) - ${year}`;
    } else {
        // Gráfica de temporadas específicas
        const temporadas = window.datosAgua.obtenerTemporadasPorAnio(year);
        
        if (temporadas.length === 0) {
            console.warn(`⚠️ No hay datos para el año ${year}`);
            return null;
        }
        
        // Ordenar temporadas: Primavera, Verano, Otoño, Invierno
        const ordenTemporadas = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
        labels = ordenTemporadas;
        datosOrdenados = ordenTemporadas.map(temp => {
            const dato = temporadas.find(t => t.season === temp);
            // Usar directamente area_km2 del CSV (ya está en km²)
            return dato ? (dato.area_km2 || 0) : 0;
        });
        titulo = `Área (km²) - ${year}`;
    }
    
    // Configuración de Chart.js
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: titulo,
                data: datosOrdenados,
                backgroundColor: 'rgba(0, 212, 255, 0.6)',
                borderColor: 'rgba(0, 212, 255, 1)',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(5, 10, 25, 0.95)',
                    titleColor: '#00d4ff',
                    bodyColor: '#a8dadc',
                    borderColor: 'rgba(0, 212, 255, 0.6)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Área: ${context.parsed.y.toFixed(2)} km²`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#a8dadc',
                        font: {
                            size: 9,
                            family: 'Montserrat'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#a8dadc',
                        font: {
                            size: 9,
                            family: 'Montserrat'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    };
    
    const chart = new Chart(canvas, config);
    
    // Guardar referencia
    if (canvasId === 'chart-left') {
        chartLeft = chart;
    } else {
        chartRight = chart;
    }
    
    return chart;
}

// Función para actualizar ambas gráficas (usa selectores propios del panel)
async function actualizarGraficas() {
    // Cargar datos CSV si no están cargados
    await cargarDatosCSV();
    
    // Usar selectores del panel de gráficas (no del comparador)
    const yearLeftEl = document.getElementById('graficas-year-left');
    const yearRightEl = document.getElementById('graficas-year-right');
    const tipoGraficaEl = document.getElementById('graficas-type-select');
    
    const yearLeft = yearLeftEl ? yearLeftEl.value : null;
    const yearRight = yearRightEl ? yearRightEl.value : null;
    const tipoGrafica = tipoGraficaEl ? tipoGraficaEl.value : 'temporadas';
    
    // Crear gráficas con el tipo seleccionado
    if (yearLeft && yearRight) {
        crearGrafica('chart-left', yearLeft, tipoGrafica);
        crearGrafica('chart-right', yearRight, tipoGrafica);
        
        // Actualizar las etiquetas visuales con el año
        const labelLeft = document.querySelector('.grafica-item:first-child label');
        const labelRight = document.querySelector('.grafica-item:last-child label');
        if (labelLeft) labelLeft.textContent = yearLeft;
        if (labelRight) labelRight.textContent = yearRight;
    }
}

async function activarComparadorBarra() {
    if (comparadorBarraActivo) {
        console.warn('⚠️ Comparador barra ya activo');
        return;
    }
    
    // Leer valores from barra HTML selects
    const yearLeft = document.getElementById('comparador-barra-year-left').value;
    const seasonLeft = document.getElementById('comparador-barra-season-left').value;
    const yearRight = document.getElementById('comparador-barra-year-right').value;
    const seasonRight = document.getElementById('comparador-barra-season-right').value;

    try {
        capaIzquierdaBarra = await crearCapaComparacion(yearLeft, seasonLeft);
        capaDerechaBarra = await crearCapaComparacion(yearRight, seasonRight);

        if (!capaIzquierdaBarra || !capaDerechaBarra) {
            console.error('❌ No se pudieron crear las capas del comparador barra');
            const faltante = !capaIzquierdaBarra && !capaDerechaBarra
                ? `${seasonLeft} ${yearLeft} y ${seasonRight} ${yearRight}`
                : (!capaIzquierdaBarra ? `${seasonLeft} ${yearLeft}` : `${seasonRight} ${yearRight}`);
            mostrarAlertaEnMapa(`No hay imagen WMS para ${faltante}. Comparador cancelado.`);
            if (typeof showNotification === 'function') {
                showNotification('No hay imagen disponible para la selección', 'warning');
            }
            return; // no activar barra
        }

        capaIzquierdaBarra.addTo(mapaComparadorBarra);
        capaDerechaBarra.addTo(mapaComparadorBarra);
    } catch (error) {
        console.error('❌ Error al crear capas del comparador barra:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error al crear capas: ' + error.message, 'error');
        }
        return;
    }

    sideBySideControlBarra = L.control.sideBySide(capaIzquierdaBarra, capaDerechaBarra, {
        thumbSize: 42,
        padding: 0
    });
    sideBySideControlBarra.addTo(mapaComparadorBarra);

    // Actualizar gráficas
    await actualizarGraficas();

        // Agregar clase activo al panel
        const panel = document.getElementById('comparador-barra');
        if (panel) {
            panel.classList.add('activo');
        }
    
        // Deshabilitar controles
        deshabilitarControlesBarra(false);
    
        console.log('✅ Comparador barra activado');
    
        // Toggle botones de la cabecera (activar/desactivar)
        try {
            const btnTopActivate = document.getElementById('comparador-activar-top');
            const btnTopDeactivate = document.getElementById('comparador-desactivar-top');
            if (btnTopActivate) btnTopActivate.style.display = 'none';
            if (btnTopDeactivate) btnTopDeactivate.style.display = 'inline-flex';
        } catch (_) {}

        if (typeof showNotification === 'function') {
            showNotification(`Comparando: ${seasonLeft} ${yearLeft} vs ${seasonRight} ${yearRight}`);
        }
    
    // Configurar eventos para el divisor
    setTimeout(() => {
        const rangeInput = document.querySelector('.leaflet-sbs-range');
        if (rangeInput) {
            // Deshabilitar arrastre del mapa mientras se usa el divisor
            rangeInput.addEventListener('mousedown', function(e) {
                mapaComparadorBarra.dragging.disable();
                e.stopPropagation();
            });
            
            rangeInput.addEventListener('mouseup', function() {
                mapaComparadorBarra.dragging.enable();
            });
            
            // Para dispositivos táctiles
            rangeInput.addEventListener('touchstart', function(e) {
                mapaComparadorBarra.dragging.disable();
                e.stopPropagation();
            });
            
            rangeInput.addEventListener('touchend', function() {
                mapaComparadorBarra.dragging.enable();
            });
            
            console.log('✅ Eventos del divisor configurados correctamente');
        } else {
            console.error('❌ No se encontró el input range del divisor');
        }
    }, 500);
    
    comparadorBarraActivo = true;
    
    // Actualiza UI (botones) si existen en el DOM
    var btnAct = document.getElementById('comparador-barra-btn-activar');
    var btnUpd = document.getElementById('comparador-barra-btn-actualizar');
    var btnDes = document.getElementById('comparador-barra-btn-desactivar');
    if (btnAct) btnAct.style.display = 'none';
    if (btnUpd) btnUpd.style.display = 'inline-block';
    if (btnDes) btnDes.style.display = 'inline-block';
}




function desactivarComparadorBarra() {
    if (!comparadorBarraActivo) {
        console.warn('⚠️ Comparador barra no activo');
        return;
    }
    
    if (sideBySideControlBarra) {
        sideBySideControlBarra.remove();
        sideBySideControlBarra = null;
    }
    if (capaIzquierdaBarra) {
        mapaComparadorBarra.removeLayer(capaIzquierdaBarra);
        capaIzquierdaBarra = null;
    }
    if (capaDerechaBarra) {
        mapaComparadorBarra.removeLayer(capaDerechaBarra);
        capaDerechaBarra = null;
    }
    
    comparadorBarraActivo = false;

    // Actualiza UI si existen
    var btnAct2 = document.getElementById('comparador-barra-btn-activar');
    var btnDes2 = document.getElementById('comparador-barra-btn-desactivar');
    var btnUpd2 = document.getElementById('comparador-barra-btn-actualizar');
    if (btnAct2) btnAct2.style.display = 'inline-block';
    if (btnDes2) btnDes2.style.display = 'none';
    if (btnUpd2) btnUpd2.style.display = 'none';

    deshabilitarControlesBarra(true);

    console.log('✅ Comparador barra desactivado');

    // Toggle botones cabecera
    try {
        const btnTopActivate = document.getElementById('comparador-activar-top');
        const btnTopDeactivate = document.getElementById('comparador-desactivar-top');
        if (btnTopActivate) btnTopActivate.style.display = 'inline-flex';
        if (btnTopDeactivate) btnTopDeactivate.style.display = 'none';
    } catch (_) {}

    if (typeof showNotification === 'function') {
        showNotification('Comparador desactivado');
    }
}

async function actualizarComparadorBarra() {
    if (!comparadorBarraActivo) {
        console.warn('⚠️ Comparador barra no activo, activando...');
        await activarComparadorBarra();
        return;
    }
    console.log('🔄 Actualizando comparador barra...');
    if (capaIzquierdaBarra) mapaComparadorBarra.removeLayer(capaIzquierdaBarra);
    if (capaDerechaBarra) mapaComparadorBarra.removeLayer(capaDerechaBarra);
    if (sideBySideControlBarra) {
        sideBySideControlBarra.remove();
    }
    const yearLeft = document.getElementById('comparador-barra-year-left').value;
    const seasonLeft = document.getElementById('comparador-barra-season-left').value;
    const yearRight = document.getElementById('comparador-barra-year-right').value;
    const seasonRight = document.getElementById('comparador-barra-season-right').value;
    console.log(`🔄 Nueva comparación: ${seasonLeft} ${yearLeft} vs ${seasonRight} ${yearRight}`);

    try {
        capaIzquierdaBarra = await crearCapaComparacion(yearLeft, seasonLeft);
        capaDerechaBarra = await crearCapaComparacion(yearRight, seasonRight);
        
        if (!capaIzquierdaBarra || !capaDerechaBarra) {
            console.error('❌ No se pudieron actualizar las capas del comparador barra');
            const faltante = !capaIzquierdaBarra && !capaDerechaBarra
                ? `${seasonLeft} ${yearLeft} y ${seasonRight} ${yearRight}`
                : (!capaIzquierdaBarra ? `${seasonLeft} ${yearLeft}` : `${seasonRight} ${yearRight}`);
            mostrarAlertaEnMapa(`No hay imagen WMS para ${faltante}. Comparador desactivado.`);
            if (typeof showNotification === 'function') {
                showNotification('No hay imagen disponible para la nueva selección', 'warning');
            }
            desactivarComparadorBarra();
            return;
        }
        
        capaIzquierdaBarra.addTo(mapaComparadorBarra);
        capaDerechaBarra.addTo(mapaComparadorBarra);
    } catch (error) {
        console.error('❌ Error al actualizar capas del comparador barra:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error al actualizar capas: ' + error.message, 'error');
        }
        return;
    }
    sideBySideControlBarra = L.control.sideBySide(capaIzquierdaBarra, capaDerechaBarra, {
        thumbSize: 42,
        padding: 0
    });
    sideBySideControlBarra.addTo(mapaComparadorBarra);
    
    // Actualizar gráficas
    await actualizarGraficas();
    
    console.log('✅ Comparador barra actualizado');

    if (typeof showNotification === 'function') {
        showNotification(`Actualizado: ${seasonLeft} ${yearLeft} vs ${seasonRight} ${yearRight}`);
    }
}

// Control des/habilitar controles barra
function deshabilitarControlesBarra(habilitar) {
    const controles = [
        'comparador-barra-year-left', 'comparador-barra-season-left',
        'comparador-barra-year-right', 'comparador-barra-season-right'
    ];
    controles.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.disabled = !habilitar;
        }
    });
}

// Sincronizar años (opcional - para comparar misma temporada en diferentes años)
function sincronizarTemporadasBarra() {
    const seasonLeft = document.getElementById('comparador-barra-season-left').value;
    document.getElementById('comparador-barra-season-right').value = seasonLeft;
    
    console.log(`🔗 Temporadas sincronizadas: ${seasonLeft}`);
}

// Exportar funciones globales
window.activarComparador = activarComparador;
window.desactivarComparador = desactivarComparador;
window.actualizarComparador = actualizarComparador;
window.sincronizarTemporadas = sincronizarTemporadas;
window.cambiarModoComparador = cambiarModoComparador;

// Exportar funciones
window.activarComparadorBarra = activarComparadorBarra;
window.desactivarComparadorBarra = desactivarComparadorBarra;
window.actualizarComparadorBarra = actualizarComparadorBarra;
window.sincronizarTemporadasBarra = sincronizarTemporadasBarra;
window.cambiarModoComparadorBarra = cambiarModoComparadorBarra;

// Inicializar cuando la página esté lista
console.log('📄 Módulo comparador de agua cargado');

window.addEventListener('load', function() {
    console.log('🚀 Iniciando módulo comparador...');
    
    setTimeout(function() {
        inicializarComparador();
        inicializarComparadorBarra();
        console.log('✅ Comparador listo para usar');
    }, 3000);
});

// --- UI: Ocultar/mostrar barra inferior y sincronizar zona segura ---
(function setupComparadorBarraUI() {
    let uiBound = false;

    function setBottomSafe(px) {
        try {
            document.documentElement.style.setProperty('--bottom-safe', px);
        } catch (e) {
            console.warn('No se pudo actualizar --bottom-safe', e);
        }
    }

    function showBar() {
        const bar = document.getElementById('comparador-barra');
        const showBtn = document.getElementById('comparador-barra-show');
        if (bar) bar.classList.remove('hidden');
        if (showBtn) showBtn.style.display = 'none';
        setBottomSafe('120px');
    }

    function hideBar() {
        const bar = document.getElementById('comparador-barra');
        const showBtn = document.getElementById('comparador-barra-show');
        if (bar) bar.classList.add('hidden');
        if (showBtn) showBtn.style.display = 'inline-flex';
        setBottomSafe('0px');
    }

    // Exponer por si se requiere desde consola
    window.showComparadorBarra = showBar;
    window.hideComparadorBarra = hideBar;

    function attachListenersWithRetry(retryMs = 600) {
        if (uiBound) return;
        const bar = document.getElementById('comparador-barra');
        const closeBtn = document.getElementById('comparador-barra-close');
        const showBtn = document.getElementById('comparador-barra-show');
        if (!bar || !closeBtn || !showBtn) {
            setTimeout(() => attachListenersWithRetry(retryMs), retryMs);
            return;
        }
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hideBar();
        });
        
        // Las gráficas ahora tienen sus propios selectores en el panel flotante
        showBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showBar();
        });
        uiBound = true;
    }

    // Exponer para poder llamarlo después de cargar HTML dinámico
    window.attachComparadorBarraUI = attachListenersWithRetry;

    window.addEventListener('load', function() {
        // Intentar de inmediato y reintentar hasta que el HTML diferido esté disponible
        attachListenersWithRetry(700);
        setTimeout(function(){
            const btnTopActivate = document.getElementById('comparador-activar-top');
            const btnTopDeactivate = document.getElementById('comparador-desactivar-top');
            if (btnTopActivate) {
                btnTopActivate.addEventListener('click', function(e){ e.stopPropagation(); activarComparadorBarra(); });
            }
            if (btnTopDeactivate) {
                btnTopDeactivate.addEventListener('click', function(e){ e.stopPropagation(); desactivarComparadorBarra(); });
            }
        }, 800);
    });
})();

// --- FUNCIONES PARA EL PANEL FLOTANTE DE GRÁFICAS ---
// Variables para estado del panel
let graficasPanelMaximized = false;
let graficasPanelOriginalSize = { width: '', height: '', top: '', left: '', right: '' };

function initializeGraficasPanel() {
    const panel = document.getElementById('graficas-panel');
    const toggleBtn = document.getElementById('toggle-graficas-btn');
    const header = document.getElementById('graficas-header');
    
    if (!panel || !toggleBtn || !header) {
        console.warn('⚠️ Panel de gráficas no encontrado');
        return;
    }
    
    // Función para mostrar/ocultar el panel
    function togglePanel() {
        const isVisible = panel.classList.contains('visible');
        
        if (isVisible) {
            panel.classList.remove('visible');
            toggleBtn.classList.remove('active');
        } else {
            panel.classList.add('visible');
            toggleBtn.classList.add('active');
            // Cargar y actualizar gráficas cuando se muestra el panel
            setTimeout(() => {
                actualizarGraficas();
            }, 100);
        }
    }
    
    // Agregar evento al botón
    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePanel();
    });
    
    // Funcionalidad de arrastre
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    // Obtener posición inicial del panel
    const rect = panel.getBoundingClientRect();
    xOffset = rect.left;
    yOffset = rect.top;
    
    header.addEventListener('mousedown', function(e) {
        // No arrastrar si se hace clic en los botones de control
        if (e.target.closest('.graficas-window-controls') || 
            e.target.closest('.graficas-control-btn')) {
            return;
        }
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === header || header.contains(e.target)) {
            isDragging = true;
            header.classList.add('dragging');
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            xOffset = currentX;
            yOffset = currentY;
            
            // Mantener el panel dentro de los límites de la ventana
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            
            xOffset = Math.max(0, Math.min(xOffset, maxX));
            yOffset = Math.max(0, Math.min(yOffset, maxY));
            
            setTranslate(xOffset, yOffset, panel);
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            header.classList.remove('dragging');
        }
    });
    
    function setTranslate(xPos, yPos, el) {
        el.style.left = xPos + 'px';
        el.style.top = yPos + 'px';
        el.style.right = 'auto';
    }
    
    // Aplicar posición inicial
    setTranslate(xOffset, yOffset, panel);
    
    // Guardar tamaño original del panel
    graficasPanelOriginalSize = {
        width: panel.style.width || getComputedStyle(panel).width,
        height: panel.style.height || getComputedStyle(panel).height,
        top: panel.style.top || getComputedStyle(panel).top,
        left: panel.style.left || getComputedStyle(panel).left,
        right: panel.style.right || getComputedStyle(panel).right
    };
    
    // Funciones para los controles de ventana
    const maximizeBtn = document.getElementById('graficas-maximize');
    const closeBtn = document.getElementById('graficas-close');
    
    // Maximizar/Restaurar: alternar tamaño
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (graficasPanelMaximized) {
                // Restaurar tamaño original
                panel.style.width = graficasPanelOriginalSize.width || '500px';
                panel.style.height = graficasPanelOriginalSize.height || '';
                panel.style.maxWidth = 'calc(100vw - 32px)';
                panel.style.maxHeight = '';
                maximizeBtn.querySelector('.control-icon').className = 'control-icon maximize-icon';
                maximizeBtn.title = 'Maximizar';
                graficasPanelMaximized = false;
            } else {
                // Maximizar
                graficasPanelOriginalSize = {
                    width: panel.style.width || getComputedStyle(panel).width,
                    height: panel.style.height || getComputedStyle(panel).height,
                    top: panel.style.top || getComputedStyle(panel).top,
                    left: panel.style.left || getComputedStyle(panel).left,
                    right: panel.style.right || getComputedStyle(panel).right
                };
                panel.style.width = 'calc(100vw - 32px)';
                panel.style.height = 'calc(100vh - 32px)';
                panel.style.maxWidth = 'calc(100vw - 32px)';
                panel.style.maxHeight = 'calc(100vh - 32px)';
                panel.style.top = '16px';
                panel.style.left = '16px';
                panel.style.right = 'auto';
                xOffset = 16;
                yOffset = 16;
                maximizeBtn.querySelector('.control-icon').className = 'control-icon restore-icon';
                maximizeBtn.title = 'Restaurar';
                graficasPanelMaximized = true;
            }
        });
    }
    
    // Cerrar: ocultar panel
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            panel.classList.remove('visible');
            toggleBtn.classList.remove('active');
        });
    }
    
    // Agregar listeners a los selectores de año y tipo de gráfica
    const yearLeftSelect = document.getElementById('graficas-year-left');
    const yearRightSelect = document.getElementById('graficas-year-right');
    const tipoGraficaSelect = document.getElementById('graficas-type-select');
    
    if (yearLeftSelect) {
        yearLeftSelect.addEventListener('change', function() {
            actualizarGraficas();
        });
    }
    
    if (yearRightSelect) {
        yearRightSelect.addEventListener('change', function() {
            actualizarGraficas();
        });
    }
    
    if (tipoGraficaSelect) {
        tipoGraficaSelect.addEventListener('change', function() {
            actualizarGraficas();
        });
    }
    
    // Cargar datos CSV y mostrar gráficas iniciales
    setTimeout(() => {
        cargarDatosCSV().then(() => {
            actualizarGraficas();
        });
    }, 500);
    
    console.log('✅ Panel de gráficas inicializado');
}

// Exportar función para uso global
window.initializeGraficasPanel = initializeGraficasPanel;
