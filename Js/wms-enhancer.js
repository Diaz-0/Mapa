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