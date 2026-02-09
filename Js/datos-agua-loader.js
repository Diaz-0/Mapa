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
            area_ha: encabezados.indexOf('area_ha'),
            area_perm_km2: encabezados.indexOf('area_perm_km2'),
            area_temp_km2: encabezados.indexOf('area_temp_km2')
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
                const area_perm_km2 = idx.area_perm_km2 >= 0 ? (parseFloat(valores[idx.area_perm_km2]) || 0) : 0;
                const area_temp_km2 = idx.area_temp_km2 >= 0 ? (parseFloat(valores[idx.area_temp_km2]) || 0) : 0;

                if (year && season) {
                    this.datos.push({ year, season, area_km2, area_ha, area_perm_km2, area_temp_km2 });
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
    },

    /**
     * Evolución Permanente vs Temporal por temporada (Invierno, Primavera, Verano, Otoño) para un año.
     * Para gráfica de líneas: igual que la de barras pero con dos series (Permanente y Temporal).
     */
    obtenerPermanenteTemporalPorTemporada(year) {
        const orden = ['Invierno', 'Primavera', 'Verano', 'Otoño'];
        const datos = this.obtenerTemporadasPorAnio(String(year));
        if (!datos || datos.length === 0) return null;
        const perm = orden.map(temp => {
            const d = datos.find(x => x.season === temp);
            return d ? (d.area_perm_km2 || 0) : 0;
        });
        const temp = orden.map(temp => {
            const d = datos.find(x => x.season === temp);
            return d ? (d.area_temp_km2 || 0) : 0;
        });
        return { labels: orden, permanente: perm, temporal: temp };
    },

    /**
     * Devuelve datos de evolución anual: promedio por año de Agua Permanente y Agua Temporal.
     * Para gráfica de líneas que muestra "si creció o disminuyó" en el tiempo.
     */
    obtenerEvolucionPermanenteTemporal() {
        const ordenEstaciones = ['Invierno', 'Primavera', 'Verano', 'Otoño'];
        const years = [...new Set(this.datos.map(d => d.year))].sort((a, b) => Number(a) - Number(b));
        const perm = [];
        const temp = [];
        for (const y of years) {
            const delAnio = this.datos.filter(d => d.year === y && ordenEstaciones.includes(d.season));
            const promPerm = delAnio.length ? delAnio.reduce((s, d) => s + (d.area_perm_km2 || 0), 0) / delAnio.length : 0;
            const promTemp = delAnio.length ? delAnio.reduce((s, d) => s + (d.area_temp_km2 || 0), 0) / delAnio.length : 0;
            perm.push(promPerm);
            temp.push(promTemp);
        }
        return { labels: years, permanente: perm, temporal: temp };
    }
};

// Exportar globalmente
window.datosAgua = datosAgua;
console.log('✅ Módulo de Datos CSV cargado');