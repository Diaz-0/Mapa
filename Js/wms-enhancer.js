/**
 * Módulo mejorado para manejo de capas WMS de GeoServer
 * Incluye funciones para obtener datos reales, validación y optimizaciones
 * 
 * NOTA: Si tienes problemas de CORS, la validación está deshabilitada por defecto.
 * Para habilitarla, configura CORS en GeoServer o cambia validarCapas a true
 * cuando trabajes desde el mismo dominio.
 */

const wmsEnhancer = {
    geoserverUrl: 'http://localhost:8080/geoserver/agua_tabasco/wms',
    workspace: 'agua_tabasco',
    version: '1.1.1',
    format: 'image/png',
    
    // Cache de capas validadas
    capasValidadas: new Map(),
    
    // Opción para validar existencia de capas (habilitada tras configurar CORS)
    validarCapas: true,
    
    /**
     * Validar que una capa WMS existe en GeoServer
     * @param {string} layerName - Nombre de la capa (ej: 'Agua_Otono_2020-1')
     * @returns {Promise<boolean|null>} - true si existe, false si no existe, null si no se pudo validar (CORS)
     */
    async validarCapa(layerName) {
        // Si la validación está deshabilitada, retornar null (no validado)
        if (!this.validarCapas) {
            return null;
        }
        
        // Si ya está en cache, devolver el resultado
        if (this.capasValidadas.has(layerName)) {
            return this.capasValidadas.get(layerName);
        }
        
        try {
            // Usar GetCapabilities para verificar que la capa existe
            const url = `${this.geoserverUrl}?service=WMS&version=${this.version}&request=GetCapabilities`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`⚠️ No se pudo validar capa ${layerName} (status: ${response.status})`);
                this.capasValidadas.set(layerName, null); // null = no validado
                return null;
            }
            
            const text = await response.text();
            // En servicios por workspace, el nombre puede venir sin prefijo si en GeoServer
            // no está marcada la opción "Incluir el prefijo de capa en capabilities locales".
            const nameWithPrefix = `${this.workspace}:${layerName}`;
            const nameWithoutPrefix = `${layerName}`;
            const existe = text.includes(nameWithPrefix) || text.includes(nameWithoutPrefix);
            
            this.capasValidadas.set(layerName, existe);
            
            if (existe) {
                console.log(`✅ Capa validada: ${layerName}`);
            } else {
                console.warn(`⚠️ Capa no encontrada: ${layerName}`);
            }
            
            return existe;
        } catch (error) {
            // Si es un error de CORS o de red, no bloquear la creación de la capa
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                console.warn(`⚠️ No se pudo validar capa ${layerName} (CORS o conexión). Continuando sin validación.`);
                this.capasValidadas.set(layerName, null); // null = no validado, pero permitir creación
                return null;
            }
            
            console.error(`❌ Error al validar capa ${layerName}:`, error);
            this.capasValidadas.set(layerName, null);
            return null;
        }
    },
    
    /**
     * Crear una capa WMS optimizada con validación opcional
     * @param {string} layerName - Nombre de la capa
     * @param {Object} options - Opciones adicionales para la capa
     * @returns {Promise<L.TileLayer.WMS|null>} - Capa WMS o null si no existe (solo si se validó)
     */
    async crearCapaWMSOptimizada(layerName, options = {}) {
        // Validar que la capa existe (opcional, puede retornar null si hay CORS)
        const validacion = await this.validarCapa(layerName);
        
        // Solo bloquear si la validación fue exitosa y retornó false (la capa no existe)
        if (validacion === false) {
            console.error(`❌ No se puede crear capa: ${layerName} no existe`);
            return null;
        }
        
        // Si validacion es null (no se pudo validar por CORS), continuar con la creación
        if (validacion === null) {
            console.log(`⚠️ Continuando sin validación para ${layerName} (CORS o validación deshabilitada)`);
        }
        
        const configuracion = {
            layers: `${this.workspace}:${layerName}`,
            format: this.format,
            transparent: true,
            version: this.version,
            attribution: `GeoServer WMS | ${layerName}`,
            pane: 'overlayPane',
            zIndex: 1000,
            opacity: options.opacity || 1,
            // Optimizaciones de rendimiento
            keepBuffer: 2,
            updateWhenIdle: true,
            updateWhenZooming: false,
            // Manejo de errores
            errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            ...options
        };
        
        const capa = L.tileLayer.wms(this.geoserverUrl, configuracion);
        
        // Guardar referencia a la capa para uso posterior
        capa._wmsLayerName = layerName;
        capa._wmsWorkspace = this.workspace;
        
        console.log(`✅ Capa WMS creada: ${layerName}`);
        return capa;
    },
    
    /**
     * Obtener datos de un punto específico usando GetFeatureInfo
     * @param {string} layerName - Nombre de la capa
     * @param {L.LatLng} latlng - Coordenadas del punto
     * @param {L.Map} map - Instancia del mapa
     * @param {string} infoFormat - Formato de respuesta (default: 'application/json')
     * @returns {Promise<Object|null>} - Datos del punto o null si hay error
     */
    async obtenerDatosPunto(layerName, latlng, map, infoFormat = 'application/json') {
        try {
            const bounds = map.getBounds();
            const size = map.getSize();
            
            // Convertir coordenadas a píxeles
            const point = map.latLngToContainerPoint(latlng);
            const x = Math.round(point.x);
            const y = Math.round(point.y);
            
            // Construir URL de GetFeatureInfo
            const params = new URLSearchParams({
                service: 'WMS',
                version: this.version,
                request: 'GetFeatureInfo',
                layers: `${this.workspace}:${layerName}`,
                query_layers: `${this.workspace}:${layerName}`,
                info_format: infoFormat,
                feature_count: 50,
                x: x,
                y: y,
                width: size.x,
                height: size.y,
                bbox: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
                srs: 'EPSG:4326'
            });
            
            const url = `${this.geoserverUrl}?${params.toString()}`;
            
            console.log(`🔍 Consultando GetFeatureInfo para ${layerName} en [${latlng.lat}, ${latlng.lng}]`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`❌ Error en GetFeatureInfo: ${response.status}`);
                return null;
            }
            
            let datos;
            if (infoFormat === 'application/json') {
                datos = await response.json();
            } else if (infoFormat.includes('text/html')) {
                // Para HTML, devolver el texto
                datos = await response.text();
            } else {
                // Para otros formatos, intentar JSON primero
                datos = await response.json().catch(() => response.text());
            }
            
            console.log(`✅ Datos obtenidos de GetFeatureInfo:`, datos);
            return datos;
            
        } catch (error) {
            // Si es un error de CORS, mostrar un mensaje más específico
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                console.warn(`⚠️ GetFeatureInfo bloqueado por CORS. Configura GeoServer para permitir peticiones desde ${window.location.origin}`);
            } else {
                console.error(`❌ Error al obtener datos del punto:`, error);
            }
            return null;
        }
    },
    
    /**
     * Obtener estadísticas de un área usando múltiples puntos
     * @param {string} layerName - Nombre de la capa
     * @param {L.LatLngBounds} bounds - Área a analizar
     * @param {L.Map} map - Instancia del mapa
     * @param {number} samplePoints - Número de puntos de muestra (default: 10)
     * @returns {Promise<Object>} - Estadísticas (min, max, avg, count)
     */
    async obtenerEstadisticasArea(layerName, bounds, map, samplePoints = 10) {
        try {
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            
            const latStep = (ne.lat - sw.lat) / samplePoints;
            const lngStep = (ne.lng - sw.lng) / samplePoints;
            
            const valores = [];
            
            // Muestrear puntos en el área
            for (let i = 0; i <= samplePoints; i++) {
                for (let j = 0; j <= samplePoints; j++) {
                    const lat = sw.lat + (latStep * i);
                    const lng = sw.lng + (lngStep * j);
                    const latlng = L.latLng(lat, lng);
                    
                    const datos = await this.obtenerDatosPunto(layerName, latlng, map);
                    
                    if (datos && datos.features && datos.features.length > 0) {
                        // Extraer valores numéricos de los datos
                        const feature = datos.features[0];
                        if (feature.properties) {
                            const props = feature.properties;
                            // Buscar valores numéricos en las propiedades
                            for (let key in props) {
                                const valor = parseFloat(props[key]);
                                if (!isNaN(valor)) {
                                    valores.push(valor);
                                    break; // Solo tomar el primer valor numérico encontrado
                                }
                            }
                        }
                    }
                }
            }
            
            if (valores.length === 0) {
                return { min: null, max: null, avg: null, count: 0 };
            }
            
            const min = Math.min(...valores);
            const max = Math.max(...valores);
            const avg = valores.reduce((a, b) => a + b, 0) / valores.length;
            
            return {
                min: min,
                max: max,
                avg: avg,
                count: valores.length
            };
            
        } catch (error) {
            console.error(`❌ Error al obtener estadísticas:`, error);
            return { min: null, max: null, avg: null, count: 0 };
        }
    },
    
    /**
     * Crear capa WMS con GetFeatureInfo habilitado
     * @param {string} layerName - Nombre de la capa
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<L.TileLayer.WMS|null>} - Capa WMS con eventos de click
     */
    async crearCapaWMSInteractiva(layerName, options = {}) {
        const capa = await this.crearCapaWMSOptimizada(layerName, options);
        
        if (!capa) return null;
        
        // Habilitar interactividad
        capa.on('click', async (e) => {
            const datos = await this.obtenerDatosPunto(layerName, e.latlng, e.target._map);
            
            if (datos) {
                // Disparar evento personalizado con los datos
                const evento = new CustomEvent('wms:featureinfo', {
                    detail: {
                        layerName: layerName,
                        latlng: e.latlng,
                        data: datos
                    }
                });
                document.dispatchEvent(evento);
                
                // También mostrar en consola
                console.log(`📊 Datos de ${layerName} en [${e.latlng.lat}, ${e.latlng.lng}]:`, datos);
            }
        });
        
        return capa;
    },
    
    /**
     * Mejorar una capa WMS existente con validación y mejor manejo
     * @param {L.TileLayer.WMS} capa - Capa WMS existente
     * @param {string} layerName - Nombre de la capa
     * @returns {L.TileLayer.WMS} - Capa mejorada
     */
    mejorarCapaWMS(capa, layerName) {
        if (!capa) return null;
        
        // Agregar métodos de utilidad
        capa.obtenerDatosPunto = (latlng, map) => {
            return this.obtenerDatosPunto(layerName, latlng, map);
        };
        
        capa.obtenerEstadisticas = (bounds, map) => {
            return this.obtenerEstadisticasArea(layerName, bounds, map);
        };
        
        capa._wmsLayerName = layerName;
        capa._wmsWorkspace = this.workspace;
        
        console.log(`✅ Capa WMS mejorada: ${layerName}`);
        return capa;
    },
    
    /**
     * Crear capa de comparación mejorada (compatible con comparador-agua.js)
     * @param {number} year - Año
     * @param {string} season - Temporada
     * @returns {Promise<L.TileLayer.WMS|null>} - Capa WMS
     */
    async crearCapaComparacion(year, season) {
        // Generar candidatos: nuevo (sin acentos, minúsculas, sin sufijo) y legado (Mayúscula y -1)
        const normalize = (s) => (s || '').toString()
            .normalize('NFD').replace(/\p{Diacritic}/gu, '')
            .toLowerCase();

        const seasonNorm = normalize(season);
        const seasonCap = seasonNorm.charAt(0).toUpperCase() + seasonNorm.slice(1);

        const candidates = [
            `agua_${seasonNorm}_${year}`,        // nuevo estándar
            `Agua_${seasonCap}_${year}-1`        // legado (actual en tu GeoServer)
        ];

        for (const candidate of candidates) {
            const validacion = await this.validarCapa(candidate);
            if (validacion === true || validacion === null) {
                return await this.crearCapaWMSOptimizada(candidate, {
                    attribution: `Agua ${season} ${year} | Sentinel-1 SAR`,
                    opacity: 1
                });
            }
        }

        // Si ninguna pasó, intenta igualmente con el primero (por compatibilidad)
        return await this.crearCapaWMSOptimizada(candidates[0], {
            attribution: `Agua ${season} ${year} | Sentinel-1 SAR`,
            opacity: 1
        });
    }
};

// Exportar funciones para uso global
window.wmsEnhancer = wmsEnhancer;
window.obtenerDatosWMS = (layerName, latlng, map) => wmsEnhancer.obtenerDatosPunto(layerName, latlng, map);
window.validarCapaWMS = (layerName) => wmsEnhancer.validarCapa(layerName);
window.crearCapaWMSInteractiva = (layerName, options) => wmsEnhancer.crearCapaWMSInteractiva(layerName, options);

console.log('✅ Módulo WMS Enhancer cargado');

