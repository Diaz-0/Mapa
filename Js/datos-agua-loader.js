// Módulo para cargar y manejar datos CSV de agua
// Este archivo se usará cuando tengas los CSVs descargados de Google Earth Engine

const datosAgua = {
    // Datos cargados desde CSV
    datos: [],
    
    // Cargar datos desde CSV
    async cargarDesdeCSV(url) {
        try {
            const response = await fetch(url);
            const texto = await response.text();
            const lineas = texto.split('\n');
            
            // Parsear encabezados
            const encabezados = lineas[0].split(',').map(h => h.trim());
            this.datos = [];
            
            // Encontrar índices de las columnas
            const idxYear = encabezados.indexOf('year');
            const idxSeason = encabezados.indexOf('season');
            const idxAreaKm2 = encabezados.indexOf('area_km2');
            const idxAreaHa = encabezados.indexOf('area_ha');
            
            for (let i = 1; i < lineas.length; i++) {
                if (lineas[i].trim() === '') continue;
                
                // Manejar valores que pueden contener comas (como .geo)
                const valores = this.parsearLineaCSV(lineas[i]);
                
                if (valores.length > Math.max(idxYear, idxSeason, idxAreaKm2, idxAreaHa)) {
                    const year = valores[idxYear] ? String(valores[idxYear]).trim() : '';
                    let season = valores[idxSeason] ? String(valores[idxSeason]).trim() : '';
                    // Corregir codificación de "Otoño"
                    if (season === 'OtoÃ±o' || season === 'Otoño') season = 'Otoño';
                    
                    const area_km2 = parseFloat(valores[idxAreaKm2] ? String(valores[idxAreaKm2]).trim() : '0') || 0;
                    const area_ha = parseFloat(valores[idxAreaHa] ? String(valores[idxAreaHa]).trim() : '0') || 0;
                    
                    if (year && season) {
                        this.datos.push({
                            year: year,
                            season: season,
                            area_km2: area_km2,
                            area_ha: area_ha
                        });
                    }
                }
            }
            
            console.log('✅ Datos CSV cargados:', this.datos.length, 'registros');
            return this.datos;
        } catch (error) {
            console.error('❌ Error al cargar CSV:', error);
            return [];
        }
    },
    
    // Función auxiliar para parsear líneas CSV que pueden tener comas dentro de comillas
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
        valores.push(valorActual); // Último valor
        
        return valores;
    },
    
    // Obtener datos por año y temporada
    obtenerDatos(year, season) {
        return this.datos.find(d => 
            d.year === String(year) && 
            d.season === season
        );
    },
    
    // Obtener todas las temporadas de un año
    obtenerTemporadasPorAnio(year) {
        return this.datos.filter(d => 
            d.year === String(year) && 
            ['Primavera', 'Verano', 'Otoño', 'Invierno'].includes(d.season)
        );
    },
    
    // Obtener datos "antes, durante y después" de la inundación por año
    obtenerAntesDuranteDespues(year) {
        const antes = this.datos.find(d => 
            d.year === String(year) && d.season === 'Antes'
        );
        const durante = this.datos.find(d => 
            d.year === String(year) && d.season === 'Durante'
        );
        const despues = this.datos.find(d => 
            d.year === String(year) && d.season === 'Después'
        );
        return { antes, durante, despues };
    },
    
    // Obtener datos de agua permanente y temporal por año
    obtenerPermanenteTemporal(year) {
        const permanente = this.datos.find(d => 
            d.year === String(year) && d.season === 'Permanente'
        );
        const temporal = this.datos.find(d => 
            d.year === String(year) && d.season === 'Temporal'
        );
        return { permanente, temporal };
    }
};

// Exportar para uso global
window.datosAgua = datosAgua;

