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

// Modo comparador: 'swipe' (barrido) | 'animate' (animar por años)
let modoComparadorBarra = 'swipe';
// Animación temporal (modo ANIMAR)
let animacionTemporalInterval = null;
let animacionTemporalTimeout = null;
let capaAnimacionActual = null;
const TEMPORADAS_ORDEN = ['Invierno', 'Primavera', 'Verano', 'Otoño'];
const INTERVALO_ANIMACION_MS = 1100;
const DURACION_CROSSFADE_MS = 2000;

// --- FUNCIONES UTILITARIAS ---

function mostrarAlertaEnMapa(mensaje, duracionMs = 1500) {
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

function normalizarNombreArchivo(texto) {
    return String(texto || '')
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w\-]+/g, '')
        .replace(/ñ/g, 'n')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

async function descargarGeoTIFF(year, season, ladoLabel) {
    const mapa = mapaComparadorBarra || window.mapa || window.map;
    if (!mapa || !window.wmsEnhancer) return;

    const layerName = window.wmsEnhancer.obtenerNombreCapa(year, season);
    const bounds = mapa.getBounds();
    const size = mapa.getSize();

    const params = {
        service: 'WMS',
        request: 'GetMap',
        version: window.wmsEnhancer.version || '1.1.1',
        layers: `${window.wmsEnhancer.workspace}:${layerName}`,
        styles: 'agua_azul',
        format: 'image/geotiff',
        transparent: true,
        srs: 'EPSG:4326',
        bbox: bounds.toBBoxString(),
        width: size.x,
        height: size.y
    };

    const url = window.wmsEnhancer.geoserverUrl + L.Util.getParamString(params, window.wmsEnhancer.geoserverUrl, true);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GeoTIFF ${ladoLabel} HTTP ${res.status}`);

    const blob = await res.blob();
    const nombre = `GeoTIFF_${normalizarNombreArchivo(ladoLabel)}_${year}_${normalizarNombreArchivo(season)}.tif`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
}

async function descargarGeoTIFFComparador() {
    const yearLeft = document.getElementById('comparador-barra-year-left')?.value;
    const seasonLeft = document.getElementById('comparador-barra-season-left')?.value;
    const yearRight = document.getElementById('comparador-barra-year-right')?.value;
    const seasonRight = document.getElementById('comparador-barra-season-right')?.value;

    if (!yearLeft || !seasonLeft || !yearRight || !seasonRight) {
        mostrarAlertaEnMapa('Selecciona año y temporada antes de descargar.');
        return;
    }

    try {
        mostrarAlertaEnMapa('Descargando GeoTIFF (Izquierda/Derecha)...', 2500);
        await descargarGeoTIFF(yearLeft, seasonLeft, 'Izquierda');
        await descargarGeoTIFF(yearRight, seasonRight, 'Derecha');
    } catch (e) {
        console.error('Error GeoTIFF:', e);
        mostrarAlertaEnMapa('No se pudo descargar GeoTIFF. Revisa GeoServer.');
    }
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
    
    // Al cambiar año o temporada en el comparador, actualizar las capas del mapa y el radar
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
    const selectsIds = ['comparador-barra-year-left', 'comparador-barra-year-right', 'comparador-animate-year-inicio', 'comparador-animate-year-fin'];
    let htmlOptions = '';
    
    for (let y = comparadorConfig.minYear; y <= comparadorConfig.maxYear; y++) {
        htmlOptions += `<option value="${y}">${y}</option>`;
    }
    
    selectsIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const val = el.value;
            el.innerHTML = htmlOptions;
            if (val && Number(val) >= comparadorConfig.minYear) el.value = val;
            else {
                if (id.includes('left')) el.value = '2020';
                if (id.includes('right')) el.value = '2024';
                if (id.includes('inicio')) el.value = String(comparadorConfig.minYear);
                if (id.includes('fin')) el.value = '2024';
            }
        }
    });
}

// --- LÓGICA DE INTERFAZ (UI) ---

function iniciarLogicaUI() {
    const bar = document.getElementById('comparador-barra');
    const closeBtn = document.getElementById('comparador-barra-close');
    const showBtn = document.getElementById('comparador-barra-show');
    const geotiffBtn = document.getElementById('comparador-geotiff-btn');

    if (!bar || !showBtn) return;

    if(closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); ocultarBarra(); };
    if(showBtn) showBtn.onclick = (e) => { e.stopPropagation(); mostrarBarra(); };
    if(geotiffBtn) geotiffBtn.onclick = (e) => { e.stopPropagation(); descargarGeoTIFFComparador(); };

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

// --- NUEVO: CONTROL DE ZONAS NO APTAS (RIESGO) ---

// --- CONTROL DE ZONAS NO APTAS (RIESGO) + GRÁFICAS ---

function toggleRiesgoBarra() {
    const btn = document.getElementById('btn-riesgo-barra');
    if (!btn) return;

    const estaActivo = btn.classList.contains('active');

    if (!estaActivo) {
        // ==========================================
        // 1. ACTIVAR CAPA ROJA (MAPA)
        // ==========================================
        mostrarAlertaEnMapa("⚠️ Mostrando Zonas de Alto Riesgo (>30% Frecuencia)");
        
        if (!capaRiesgoBarra) {
            capaRiesgoBarra = L.tileLayer.wms("http://localhost:8080/geoserver/agua_subregion_rios/wms", {
                layers: 'agua_subregion_rios:riesgo_inundacion_permanente',
                format: 'image/png',
                transparent: true,
                version: '1.1.1',
                styles: 'estilo_riesgo_inundacion', 
                opacity: 0.9,
                zIndex: 2000
            });
        }
        capaRiesgoBarra.addTo(mapaComparadorBarra);
        
        // Estilo visual del botón activo
        btn.classList.add('active');
        btn.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        btn.style.borderColor = '#ff0000';
        btn.style.color = '#ffaaaa';
        btn.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.4)';

        // ==========================================
        // 2. ACTIVAR GRÁFICAS AUTOMÁTICAMENTE
        // ==========================================
        
        // A) Recargar los datos de las gráficas
        if (typeof window.actualizarGraficas === 'function') {
            window.actualizarGraficas();
        }

        // B) Abrir el panel flotante si está cerrado
        const panelGraficas = document.querySelector('.graficas-panel');
        const btnGraficasFloat = document.getElementById('toggle-graficas-btn');

        if (panelGraficas && !panelGraficas.classList.contains('visible')) {
            panelGraficas.classList.add('visible'); // Hace visible el panel
            
            // Sincronizar el botón flotante de arriba para que se vea activo también
            if (btnGraficasFloat) btnGraficasFloat.classList.add('active');
            
            console.log("📊 Panel de gráficas desplegado por alerta de riesgo.");
        }
        
    } else {
        // ==========================================
        // DESACTIVAR
        // ==========================================
        if (capaRiesgoBarra) {
            mapaComparadorBarra.removeLayer(capaRiesgoBarra);
        }
        
        // Restaurar estilo del botón
        btn.classList.remove('active');
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.style.boxShadow = '';

        // Ocultar el panel de gráficas al desactivar zonas no aptas
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
    actualizarBotonesActivarDetener();
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
    const btns = document.querySelectorAll('.comp-sec-1 .mode-btn');
    btns.forEach(b => b.classList.remove('active'));
    
    const btn = document.getElementById(`comparador-barra-btn-mode-${modo}`);
    if (btn) btn.classList.add('active');

    modoComparadorBarra = modo === 'animate' ? 'animate' : 'swipe';

    const swipeBlock = document.getElementById('comparador-selectores-swipe');
    const animateBlock = document.getElementById('comparador-selectores-animate');
    const dateLabel = document.getElementById('comparador-date-label');

    const geotiffBtn = document.getElementById('comparador-geotiff-btn');
    const refreshBtn = document.getElementById('comparador-refresh-btn');

    if (modoComparadorBarra === 'animate') {
        if (swipeBlock) swipeBlock.style.display = 'none';
        if (animateBlock) animateBlock.style.display = 'flex';
        if (dateLabel) dateLabel.innerHTML = '<span>Animación en el tiempo (año inicio → año fin)</span>';
        if (geotiffBtn) geotiffBtn.style.display = 'none';
        if (refreshBtn) refreshBtn.style.display = 'none';
        detenerAnimacionTemporal();
        if (comparadorBarraActivo) desactivarComparadorBarra();
    } else {
        if (swipeBlock) swipeBlock.style.display = 'flex';
        if (animateBlock) animateBlock.style.display = 'none';
        if (dateLabel) dateLabel.innerHTML = '<span>Comparar períodos</span>';
        if (geotiffBtn) geotiffBtn.style.display = '';
        if (refreshBtn) refreshBtn.style.display = '';
        detenerAnimacionTemporal();
    }
    actualizarBotonesActivarDetener();
    console.log('Modo comparador:', modoComparadorBarra);
}

/** Secuencia (year, season) desde año inicio hasta año fin, Invierno→Otoño por año */
function buildSecuenciaAnimacion(yearInicio, yearFin) {
    const seq = [];
    const yi = Math.min(Number(yearInicio), Number(yearFin));
    const yf = Math.max(Number(yearInicio), Number(yearFin));
    for (let y = yi; y <= yf; y++) {
        for (const s of TEMPORADAS_ORDEN) {
            seq.push({ year: String(y), season: s });
        }
    }
    return seq;
}

function detenerAnimacionTemporal() {
    animacionTemporalInterval = null;
    if (animacionTemporalTimeout) {
        clearTimeout(animacionTemporalTimeout);
        animacionTemporalTimeout = null;
    }
    if (capaAnimacionActual && mapaComparadorBarra) {
        mapaComparadorBarra.removeLayer(capaAnimacionActual);
        capaAnimacionActual = null;
    }
    actualizarBotonesActivarDetener();
}

let secuenciaAnimacionActual = [];
let indiceAnimacion = 0;

function crossfadeCapas(capaVieja, capaNueva, duracionMs, onComplete) {
    if (!capaVieja || !capaNueva) {
        if (onComplete) onComplete();
        return;
    }
    const inicio = performance.now();
    function step(now) {
        const elapsed = now - inicio;
        const t = Math.min(elapsed / duracionMs, 1);
        const op = 1 - t;
        capaVieja.setOpacity(op);
        capaNueva.setOpacity(t);
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            if (mapaComparadorBarra && capaVieja) mapaComparadorBarra.removeLayer(capaVieja);
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(step);
}

async function avanzarFrameAnimacion() {
    if (!secuenciaAnimacionActual.length || !mapaComparadorBarra || !window.wmsEnhancer) return;
    indiceAnimacion = indiceAnimacion % secuenciaAnimacionActual.length;
    const paso = secuenciaAnimacionActual[indiceAnimacion];
    const capaVieja = capaAnimacionActual;

    try {
        const capaNueva = await window.wmsEnhancer.crearCapaComparacion(paso.year, paso.season);
        if (!capaNueva) {
            indiceAnimacion++;
            programarSiguienteFrame();
            return;
        }

        if (!capaVieja) {
            capaAnimacionActual = capaNueva;
            capaNueva.addTo(mapaComparadorBarra);
            indiceAnimacion++;
            programarSiguienteFrame();
            return;
        }

        capaNueva.setOpacity(0);
        capaNueva.addTo(mapaComparadorBarra);
        capaAnimacionActual = capaNueva;
        indiceAnimacion++;

        crossfadeCapas(capaVieja, capaNueva, DURACION_CROSSFADE_MS, programarSiguienteFrame);
    } catch (e) {
        console.warn('Error capa animación:', paso, e);
        indiceAnimacion++;
        programarSiguienteFrame();
    }
}

function programarSiguienteFrame() {
    if (!secuenciaAnimacionActual.length || animacionTemporalInterval == null) return;
    animacionTemporalTimeout = setTimeout(avanzarFrameAnimacion, INTERVALO_ANIMACION_MS);
}

async function iniciarAnimacionTemporal() {
    const elInicio = document.getElementById('comparador-animate-year-inicio');
    const elFin = document.getElementById('comparador-animate-year-fin');
    if (!elInicio || !elFin) return;
    const yearInicio = elInicio.value;
    const yearFin = elFin.value;
    if (!yearInicio || !yearFin) {
        mostrarAlertaEnMapa('Elige año inicio y año fin.');
        return;
    }
    detenerAnimacionTemporal();
    if (comparadorBarraActivo) desactivarComparadorBarra();

    secuenciaAnimacionActual = buildSecuenciaAnimacion(yearInicio, yearFin);
    if (secuenciaAnimacionActual.length === 0) {
        mostrarAlertaEnMapa('Rango de años no válido.');
        return;
    }
    indiceAnimacion = 0;
    mostrarAlertaEnMapa(`Animación: ${yearInicio} → ${yearFin} (${secuenciaAnimacionActual.length} pasos)`, 2500);
    animacionTemporalInterval = true;
    await avanzarFrameAnimacion();
    actualizarBotonesActivarDetener();
}

function estaAnimacionActiva() {
    return animacionTemporalInterval != null;
}

function actualizarBotonesActivarDetener() {
    const btnActivate = document.getElementById('comparador-activar-top');
    const btnDeactivate = document.getElementById('comparador-desactivar-top');
    if (!btnActivate || !btnDeactivate) return;
    const activo = comparadorBarraActivo || estaAnimacionActiva();
    btnActivate.style.display = activo ? 'none' : 'inline-flex';
    btnDeactivate.style.display = activo ? 'inline-flex' : 'none';
}

function comparadorActivarClick() {
    if (modoComparadorBarra === 'animate') iniciarAnimacionTemporal();
    else activarComparadorBarra();
}

function comparadorDetenerClick() {
    if (estaAnimacionActiva()) detenerAnimacionTemporal();
    else desactivarComparadorBarra();
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

    // Gráfica de evolución (líneas): Permanente vs Temporal por temporadas del año seleccionado
    const usarEvolucion = (tipo === 'evolucion' || !tipo) && typeof window.datosAgua.obtenerPermanenteTemporalPorTemporada === 'function';
    const evol = usarEvolucion ? window.datosAgua.obtenerPermanenteTemporalPorTemporada(year) : null;
    if (evol && evol.labels && evol.labels.length > 0) {
        const config = {
            type: 'line',
            data: {
                labels: evol.labels,
                datasets: [
                    {
                        label: 'Agua Permanente (km²)',
                        data: evol.permanente,
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Agua Temporal (km²)',
                        data: evol.temporal,
                        borderColor: '#66CCFF',
                        backgroundColor: 'rgba(102, 204, 255, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#a8dadc' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a8dadc' }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#a8dadc', usePointStyle: true } },
                    tooltip: { backgroundColor: 'rgba(13, 27, 42, 0.9)', titleColor: '#00ffe7', bodyColor: '#dff9ff' }
                }
            }
        };
        const chart = new Chart(canvas, config);
        if (canvasId === 'chart-left') chartLeft = chart;
        else chartRight = chart;
        return;
    }

    // Fallback: gráfica de barras por temporadas (un año)
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
                label: `Área ${year} (km²)`,
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
    if (!yearLeftSelect || !yearRightSelect) {
        console.warn('Selectores de año no encontrados');
        return;
    }
    
    // Arrastrar panel desde el header
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
    
    // Poblar selectores de años
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
    
    // Toggle mostrar/ocultar panel (si el botón existe)
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
    
    // Minimizar: colapsar el contenido del panel (solo queda la barra del título visible)
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('minimized');
            const isMinimized = panel.classList.contains('minimized');
            minimizeBtn.title = isMinimized ? 'Restaurar' : 'Minimizar';
            minimizeBtn.setAttribute('aria-label', isMinimized ? 'Restaurar' : 'Minimizar');
        });
    }
    
    // Event listeners para los selectores
    yearLeftSelect.addEventListener('change', actualizarGraficas);
    yearRightSelect.addEventListener('change', actualizarGraficas);
    if (typeSelect) typeSelect.addEventListener('change', actualizarGraficas);
    
    // Dibujar gráficas al cargar (así se ven datos aunque el panel esté visible por defecto)
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
window.comparadorActivarClick = comparadorActivarClick;
window.comparadorDetenerClick = comparadorDetenerClick;
window.actualizarComparadorBarra = actualizarComparadorBarra;
window.cambiarModoComparadorBarra = cambiarModoComparadorBarra;
window.actualizarGraficas = actualizarGraficas;
window.ocultarBarra = ocultarBarra;
window.mostrarBarra = mostrarBarra;
window.initializeGraficasPanel = initializeGraficasPanel;
window.toggleRiesgoBarra = toggleRiesgoBarra; // NUEVA FUNCIÓN