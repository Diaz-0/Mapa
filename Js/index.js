var tabascoLayer;
var municipioLayers = {};
var todasLasZonas;



// Configuración de subregiones con sus municipios
const configuracionSubregiones = {
  'Centro': {
    municipios: ['Centro', 'Jalpa de Méndez', 'Nacajuca']
  },
  'Chontalpa': {
    municipios: ['Cárdenas', 'Comalcalco', 'Cunduacán', 'Huimanguillo', 'Paraíso']
  },
  'Sierra': {
    municipios: ['Jalapa', 'Tacotalpa', 'Teapa']
  },
  'Pantanos': {
    municipios: ['Centla', 'Jonuta', 'Macuspana']
  },
  'Ríos': {
    municipios: ['Balancán', 'Emiliano Zapata', 'Tenosique']
  }
};


fetch("/GeoJSON/Tabasco.json")
  .then(response => response.json())
  .then(data => {
    // Los datos ya son un array de municipios de Tabasco
    const municipios = data;
    
    // Obtener municipios únicos
    const municipiosUnicos = {};
    municipios.forEach(municipio => {
      const nombre = municipio.mun_name[0];
      if (!municipiosUnicos[nombre]) {
        municipiosUnicos[nombre] = municipio;
      }
    });
    
    // Crear capa para el estado completo de Tabasco
    const tabascoFeatures = Object.values(municipiosUnicos).map(municipio => ({
      type: "Feature",
      geometry: municipio.geo_shape.geometry,
      properties: {
        name: municipio.mun_name[0],
        code: municipio.mun_code[0]
      }
    }));
    
    const tabascoGeoJSON = {
      type: "FeatureCollection",
      features: tabascoFeatures
    };
    
    tabascoLayer = L.geoJSON(tabascoGeoJSON, {
      style: { color: "#1f77b4", weight: 2, fillOpacity: 0.1 }
    });

    // Función para obtener el color de la subregión de un municipio (mejorada con paleta ColorBrewer)
    function getColor(subregion) {
      const colorMap = {
        'Centro': '#FF8000', // Naranja
        'Chontalpa': '#33FF57', // Verde
        'Sierra': '#FFD700', // Dorado
        'Pantanos': '#FF5733', // Rojo
        'Ríos': '#3357FF' // Azul
      };
      return colorMap[subregion] || '#FFEDA0';
    }

    function obtenerColorSubregion(nombreMunicipio) {
      for (const [subregion, config] of Object.entries(configuracionSubregiones)) {
        if (config.municipios.includes(nombreMunicipio)) {
          return getColor(subregion);
        }
      }
      return '#FFEDA0'; // Color por defecto si no se encuentra
    }

    // Función para obtener el estilo de un municipio (siguiendo patrón de documentación)
    function style(feature) {
      const nombreMunicipio = feature.properties.name;
      const subregion = obtenerSubregionMunicipio(nombreMunicipio);
      
      return {
        fillColor: getColor(subregion),
        weight: 5,
        opacity: 0.25,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.4
      };
    }

    // Función para resaltar municipio al pasar el mouse (siguiendo patrón de documentación)
    function highlightFeature(e) {
      const layer = e.target;
      const nombreMunicipio = layer.feature.properties.name;
      
      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.3
      });
      
      // No usar bringToFront para evitar que cubra los marcadores
      // layer.bringToFront();
      
      // Función para crear/actualizar la etiqueta del municipio
      const createOrUpdateLabel = (targetLayer) => {
        // Si ya existe la etiqueta, eliminarla para recrearla con el nuevo zoom
        if (targetLayer._municipioLabel) {
          mapa.removeLayer(targetLayer._municipioLabel);
          targetLayer._municipioLabel = null;
        }
        
        const bounds = targetLayer.getBounds();
        
        // Usar el centroide del polígono si está disponible, sino usar el centro del bounds
        let center;
        try {
          if (targetLayer.getCenter && typeof targetLayer.getCenter === 'function') {
            center = targetLayer.getCenter();
          } else {
            center = bounds.getCenter();
          }
        } catch (e) {
          center = bounds.getCenter();
        }
        
        // Obtener las coordenadas reales del polígono para verificar límites
        const polygonCoords = targetLayer.feature.geometry.coordinates[0];
        const polygonLatLngs = polygonCoords.map(coord => L.latLng(coord[1], coord[0]));
      
        // Función para verificar si un punto está dentro del polígono usando ray casting
        const isPointInPolygon = (point, latlngs) => {
          let inside = false;
          for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
            const xi = latlngs[i].lng, yi = latlngs[i].lat;
            const xj = latlngs[j].lng, yj = latlngs[j].lat;
            
            const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
              (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          return inside;
        };
        
        // Función para encontrar múltiples puntos candidatos dentro del polígono
        // Optimizado: usa menos puntos para mayor velocidad
        const findCandidatePositions = () => {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          const candidatePoints = [];
          
          // Generar una cuadrícula más pequeña para mayor velocidad (5x5 = 25 puntos)
          const gridSize = 5;
          const latStep = (ne.lat - sw.lat) / gridSize;
          const lngStep = (ne.lng - sw.lng) / gridSize;
          
          // Generar puntos de la cuadrícula (salteando algunos para ser más rápido)
          for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
              const lat = sw.lat + (latStep * i);
              const lng = sw.lng + (lngStep * j);
              const point = L.latLng(lat, lng);
              
              // Solo incluir puntos que están dentro del polígono
              if (isPointInPolygon(point, polygonLatLngs)) {
                candidatePoints.push(point);
              }
            }
          }
          
          // Siempre agregar el centroide si está dentro del polígono
          try {
            if (targetLayer.getCenter && typeof targetLayer.getCenter === 'function') {
              const centroid = targetLayer.getCenter();
              if (isPointInPolygon(centroid, polygonLatLngs)) {
                // Priorizar el centroide agregándolo al inicio
                candidatePoints.unshift(centroid);
              }
            }
          } catch (e) {
            // Ignorar error
          }
          
          // Si no hay puntos candidatos, usar el centro del bounds
          if (candidatePoints.length === 0) {
            candidatePoints.push(bounds.getCenter());
          }
          
          // Limitar a máximo 20 puntos para mayor velocidad
          return candidatePoints.slice(0, 20);
        };
        
        // Calcular el tamaño aproximado del polígono en píxeles
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const pointNE = mapa.latLngToContainerPoint(ne);
        const pointSW = mapa.latLngToContainerPoint(sw);
        const width = Math.abs(pointNE.x - pointSW.x);
        const height = Math.abs(pointNE.y - pointSW.y);
        const minSize = Math.min(width, height);
        
        // Calcular tamaño de fuente adaptativo basado en el tamaño del polígono
        // Más conservador: 1px por cada 25px del polígono, con límites entre 8px y 12px
        let fontSize = Math.max(8, Math.min(12, Math.floor(minSize / 25)));
        
        // Ajustar el tamaño del texto según la longitud del nombre
        const textLength = nombreMunicipio.length;
        if (textLength > 20) {
          fontSize = Math.max(8, fontSize - 2);
        } else if (textLength > 15) {
          fontSize = Math.max(8, fontSize - 1);
        }
        
        targetLayer._municipioLabel = L.marker(center, {
          icon: L.divIcon({
            className: 'municipio-label',
            html: '<div class="municipio-label-content" style="font-size: ' + fontSize + 'px;">' + nombreMunicipio + '</div>',
            iconSize: [null, null],
            iconAnchor: [0, 0]
          }),
          interactive: false,
          zIndexOffset: 500
        }).addTo(mapa);
        
        // Verificar y ajustar que el texto esté dentro del polígono después de renderizar
        // Timeout reducido para respuesta más rápida
        setTimeout(() => {
          if (!targetLayer._municipioLabel) return;
          const labelElement = targetLayer._municipioLabel.getElement();
          if (labelElement) {
            const content = labelElement.querySelector('.municipio-label-content');
            if (content) {
              // Calcular el ancho y alto del polígono en píxeles
              const polygonWidth = Math.abs(pointNE.x - pointSW.x);
              const polygonHeight = Math.abs(pointNE.y - pointSW.y);
              
              // Obtener puntos candidatos para probar
              const candidatePositions = findCandidatePositions();
              
              // Función para verificar si las esquinas del texto están dentro del polígono
              const textCornersInPolygon = (rotation, testSize, centerPoint) => {
                // Guardar estado original
                const originalTransform = content.style.transform;
                const originalFontSize = content.style.fontSize;
                
                // Aplicar tamaño y rotación temporalmente
                content.style.fontSize = testSize + 'px';
                if (rotation !== 0) {
                  content.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
                } else {
                  content.style.transform = 'translate(-50%, -50%)';
                }
                
                // Forzar recálculo del layout
                void content.offsetWidth;
                
                const textWidth = content.offsetWidth || content.scrollWidth;
                const textHeight = content.offsetHeight || content.scrollHeight;
                
                // Calcular las esquinas del texto en píxeles
                const centerPixel = mapa.latLngToContainerPoint(centerPoint);
                const halfWidth = textWidth / 2;
                const halfHeight = textHeight / 2;
                
                // Esquinas del texto (sin rotación)
                let corners = [
                  { x: centerPixel.x - halfWidth, y: centerPixel.y - halfHeight }, // top-left
                  { x: centerPixel.x + halfWidth, y: centerPixel.y - halfHeight }, // top-right
                  { x: centerPixel.x + halfWidth, y: centerPixel.y + halfHeight }, // bottom-right
                  { x: centerPixel.x - halfWidth, y: centerPixel.y + halfHeight }  // bottom-left
                ];
                
                // Si está rotado, rotar las esquinas
                if (rotation !== 0) {
                  const rad = rotation * Math.PI / 180;
                  const cos = Math.cos(rad);
                  const sin = Math.sin(rad);
                  
                  corners = corners.map(corner => {
                    const dx = corner.x - centerPixel.x;
                    const dy = corner.y - centerPixel.y;
                    return {
                      x: centerPixel.x + (dx * cos - dy * sin),
                      y: centerPixel.y + (dx * sin + dy * cos)
                    };
                  });
                }
                
                // Convertir esquinas de píxeles a lat/lng y verificar si están dentro del polígono
                let allCornersInside = true;
                for (const corner of corners) {
                  const cornerLatLng = mapa.containerPointToLatLng(corner);
                  if (!isPointInPolygon(cornerLatLng, polygonLatLngs)) {
                    allCornersInside = false;
                    break;
                  }
                }
                
                // Restaurar estado original
                content.style.transform = originalTransform;
                content.style.fontSize = originalFontSize;
                
                return allCornersInside;
              };
              
              // Función para obtener las dimensiones del texto con una orientación específica
              const getTextDimensions = (rotation, testSize) => {
                // Guardar estado original
                const originalTransform = content.style.transform;
                const originalFontSize = content.style.fontSize;
                
                // Aplicar tamaño y rotación temporalmente
                content.style.fontSize = testSize + 'px';
                if (rotation !== 0) {
                  content.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
                } else {
                  content.style.transform = 'translate(-50%, -50%)';
                }
                
                // Forzar recálculo del layout
                void content.offsetWidth;
                
                const textWidth = content.offsetWidth || content.scrollWidth;
                const textHeight = content.offsetHeight || content.scrollHeight;
                
                // Restaurar estado original
                content.style.transform = originalTransform;
                content.style.fontSize = originalFontSize;
                
                // Si está rotado 90° o -90°, las dimensiones se intercambian
                if (rotation === 90 || rotation === -90) {
                  return { width: textHeight, height: textWidth };
                }
                
                return { width: textWidth, height: textHeight };
              };
              
              // Función para ajustar el tamaño, orientación y posición del texto
              const adjustTextSize = () => {
                let currentSize = parseInt(content.style.fontSize) || fontSize;
                let bestRotation = 0;
                let bestSize = currentSize;
                let bestPosition = center;
                let bestScore = 0;
                
                // Probar orientaciones optimizadas (menos orientaciones para mayor velocidad)
                // Priorizar horizontales y verticales, luego algunas diagonales
                const orientations = [0, 90, -90, 45, -45, 30, -30, 60, -60, 15, -15, 75, -75, 120, -120, 135, -135, 150, -150, 165, -165];
                
                // Probar combinaciones de posición y orientación (optimizado para velocidad)
                // Detenerse cuando se encuentre una buena solución
                let foundGoodSolution = false;
                
                for (const testPosition of candidatePositions) {
                  for (const rotation of orientations) {
                    // Probar con el tamaño actual
                    let testSize = currentSize;
                    let fits = false;
                    
                    // Verificar si cabe con este tamaño
                    const dims = getTextDimensions(rotation, testSize);
                    const fitsBounds = dims.width <= polygonWidth * 0.65 && dims.height <= polygonHeight * 0.65;
                    
                    if (fitsBounds && textCornersInPolygon(rotation, testSize, testPosition)) {
                      fits = true;
                    } else {
                      // Si no cabe, reducir el tamaño solo una vez (más rápido)
                      if (testSize > 7) {
                        testSize = Math.max(7, Math.floor(testSize * 0.85));
                        const dims2 = getTextDimensions(rotation, testSize);
                        const fitsBounds2 = dims2.width <= polygonWidth * 0.65 && dims2.height <= polygonHeight * 0.65;
                        
                        if (fitsBounds2 && textCornersInPolygon(rotation, testSize, testPosition)) {
                          fits = true;
                        }
                      }
                    }
                    
                    if (fits) {
                      // Calcular un score: tamaño del texto (más grande = mejor)
                      const rotationPenalty = Math.abs(rotation) / 180;
                      const score = testSize * 1000 - (rotationPenalty * 100);
                      
                      if (score > bestScore) {
                        bestRotation = rotation;
                        bestSize = testSize;
                        bestPosition = testPosition;
                        bestScore = score;
                        
                        // Si encontramos una solución con tamaño grande y orientación horizontal, detener búsqueda
                        if (testSize >= currentSize * 0.9 && Math.abs(rotation) <= 30) {
                          foundGoodSolution = true;
                          break;
                        }
                      }
                    }
                  }
                  
                  if (foundGoodSolution) break;
                }
                
                // Si no se encontró ninguna solución, usar valores por defecto
                if (bestScore === 0) {
                  bestRotation = 0;
                  bestSize = Math.max(7, Math.floor(currentSize * 0.8));
                  bestPosition = center;
      }
      
                // Actualizar la posición del marcador si es diferente
                if (targetLayer._municipioLabel && !bestPosition.equals(center)) {
                  mapa.removeLayer(targetLayer._municipioLabel);
                  targetLayer._municipioLabel = L.marker(bestPosition, {
                    icon: L.divIcon({
                      className: 'municipio-label',
                      html: '<div class="municipio-label-content" style="font-size: ' + bestSize + 'px;">' + nombreMunicipio + '</div>',
                      iconSize: [null, null],
                      iconAnchor: [0, 0]
                    }),
                    interactive: false,
                    zIndexOffset: 500
                  }).addTo(mapa);
                  
                  // Actualizar referencia al contenido
                  setTimeout(() => {
                    if (!targetLayer._municipioLabel) return;
                    const labelElement = targetLayer._municipioLabel.getElement();
                    if (labelElement) {
                      const newContent = labelElement.querySelector('.municipio-label-content');
                      if (newContent) {
                        newContent.style.fontSize = bestSize + 'px';
                        if (bestRotation !== 0) {
                          newContent.style.transform = `translate(-50%, -50%) rotate(${bestRotation}deg)`;
                        } else {
                          newContent.style.transform = 'translate(-50%, -50%)';
                        }
                      }
                    }
                  }, 50);
                } else {
                  // Aplicar la mejor combinación encontrada
                  content.style.fontSize = bestSize + 'px';
                  if (bestRotation !== 0) {
                    content.style.transform = `translate(-50%, -50%) rotate(${bestRotation}deg)`;
                  } else {
                    content.style.transform = 'translate(-50%, -50%)';
                  }
                }
              };
              
              // Ejecutar ajuste después de que el DOM se actualice
              adjustTextSize();
            }
          }
        }, 50); // Reducido de 150ms a 50ms para respuesta más rápida
      };
      
      // Mostrar etiqueta del municipio integrada en el polígono
      if (!layer._municipioLabel) {
        createOrUpdateLabel(layer);
      }
      
      // Actualizar control de información
      if (window.infoControl) {
        window.infoControl.update(layer.feature.properties);
      }
    }
    
    // Función para restaurar estilo al quitar el mouse (siguiendo patrón de documentación)
    function resetHighlight(e) {
      const layer = e.target;
      
      // Eliminar etiqueta del municipio
      if (layer._municipioLabel) {
        mapa.removeLayer(layer._municipioLabel);
        layer._municipioLabel = null;
      }
      
      if (window.geojson) {
        window.geojson.resetStyle(layer);
      }
      
      // Actualizar control de información sin ocultarlo completamente
      if (window.infoControl) {
        window.infoControl.update({});
      }
    }

    // Función para hacer zoom al municipio al hacer clic (siguiendo patrón de documentación)
    function zoomToFeature(e) {
      mapa.fitBounds(e.target.getBounds());
    }

    // Función para manejar eventos en cada feature (siguiendo patrón de documentación)
    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

    // Crear el GeoJSON con todos los municipios
    const municipiosGeoJSON = {
      type: "FeatureCollection",
      features: Object.values(municipiosUnicos).map(municipio => ({
        type: "Feature",
        geometry: municipio.geo_shape.geometry,
        properties: {
          name: municipio.mun_name[0],
          code: municipio.mun_code[0],
          subregion: obtenerSubregionMunicipio(municipio.mun_name[0])
        }
      }))
    };

    // Función para obtener la subregión de un municipio
    function obtenerSubregionMunicipio(nombreMunicipio) {
      for (const [subregion, config] of Object.entries(configuracionSubregiones)) {
        if (config.municipios.includes(nombreMunicipio)) {
          return subregion;
        }
      }
      return 'No definida';
    }

    // Crear capas individuales para cada municipio
    const capasMunicipiosIndividuales = {};
    Object.values(municipiosUnicos).forEach((municipio) => {
      const nombreMunicipio = municipio.mun_name[0];
      const color = obtenerColorSubregion(nombreMunicipio);
      
      const municipioFeature = {
        type: "Feature",
        geometry: municipio.geo_shape.geometry,
        properties: {
          name: nombreMunicipio,
          code: municipio.mun_code[0],
          subregion: obtenerSubregionMunicipio(nombreMunicipio)
        }
      };
      
      const municipioLayer = L.geoJSON(municipioFeature, {
        style: style,
        onEachFeature: onEachFeature
      });
      
      capasMunicipiosIndividuales[nombreMunicipio] = municipioLayer;
    });

    // Crear grupo con todas las zonas (subregiones)
    todasLasZonas = L.layerGroup(Object.values(capasMunicipiosIndividuales));
    
    // Crear la variable geojson global para resetStyle (siguiendo patrón de documentación)
    window.geojson = L.geoJSON(municipiosGeoJSON, {
      style: style,
      onEachFeature: onEachFeature
    });
    
    // Agregar todas las zonas al mapa por defecto (esto activará el checkbox en el control)
    todasLasZonas.addTo(mapa);

    // Crear grupos de capas por subregiones oficiales de Tabasco
    const gruposSubregiones = {};
    
    Object.entries(configuracionSubregiones).forEach(([nombreSubregion, config]) => {
      const capasMunicipios = config.municipios
        .filter(nombre => capasMunicipiosIndividuales[nombre]) // Solo incluir municipios que existen
        .map(nombre => capasMunicipiosIndividuales[nombre]);
      
      gruposSubregiones[nombreSubregion] = L.layerGroup(capasMunicipios);
    });

    // Crear control de información personalizado (siguiendo patrón de documentación)
    window.infoControl = L.control({position: 'bottomright'});

    window.infoControl.onAdd = function (mapa) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    // 
    window.infoControl.update = function (props) {
      if (props && props.name) {
        const nombre = props.name || 'N/A';
        const codigo = props.code || 'N/A';
        const subregion = props.subregion || 'No definida';
        
        this._div.innerHTML = '<h4>MUNICIPIO</h4>' + 
          '<b>' + nombre + '</b><br />' + 
          'Código: ' + codigo + '<br />' + 
          'Subregión: ' + subregion;
      } else {
        this._div.innerHTML = '<h4>MUNICIPIO</h4>' + 'Pase el Cursor Sobre un Municipio';
      }
    };

    window.infoControl.addTo(mapa);

    // Crear control de leyenda personalizado (siguiendo patrón de documentación)
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (mapa) {
      const div = L.DomUtil.create('div', 'info legend');
      
      // Agregar título
      div.innerHTML += '<h4>Subregiones de Tabasco</h4>';
      
      // Agregar cada subregión con su color usando la función getColor
      Object.keys(configuracionSubregiones).forEach(subregion => {
        div.innerHTML +=
          '<i style="background:' + getColor(subregion) + '"></i> ' +
          subregion + '<br>';
      });

      return div;
    };

    legend.addTo(mapa);

    // Agregar subregiones al control de capas
    window.capasControl.addOverlay(todasLasZonas, "🗺️ Todas las Zonas");
    
    // Agregar cada subregión con su icono correspondiente
    window.capasControl.addOverlay(gruposSubregiones['Ríos'], "🌊 Ríos");
    window.capasControl.addOverlay(gruposSubregiones['Centro'], "🏛️ Centro");
    window.capasControl.addOverlay(gruposSubregiones['Sierra'], "🏔️ Sierra");
    window.capasControl.addOverlay(gruposSubregiones['Pantanos'], "🌿 Pantanos");
    window.capasControl.addOverlay(gruposSubregiones['Chontalpa'], "🌴 Chontalpa");
    
    // Función para actualizar todas las etiquetas visibles cuando cambia el zoom
    const updateVisibleLabels = () => {
      // Buscar todas las capas que tienen etiquetas activas
      if (window.geojson) {
        window.geojson.eachLayer((layer) => {
          if (layer._municipioLabel && layer.feature) {
            // Verificar si el polígono está visible en el viewport actual
            const bounds = layer.getBounds();
            const mapBounds = mapa.getBounds();
            
            // Si el polígono está parcialmente visible, actualizar la etiqueta
            if (bounds.intersects(mapBounds)) {
              // Recrear la etiqueta con el nuevo zoom
              const nombreMunicipio = layer.feature.properties.name;
              
              // Función para crear/actualizar la etiqueta (similar a la de highlightFeature)
              const createOrUpdateLabel = (targetLayer) => {
                // Si ya existe la etiqueta, eliminarla para recrearla con el nuevo zoom
                if (targetLayer._municipioLabel) {
                  mapa.removeLayer(targetLayer._municipioLabel);
                  targetLayer._municipioLabel = null;
                }
                
                const bounds = targetLayer.getBounds();
                
                // Usar el centroide del polígono si está disponible, sino usar el centro del bounds
                let center;
                try {
                  if (targetLayer.getCenter && typeof targetLayer.getCenter === 'function') {
                    center = targetLayer.getCenter();
                  } else {
                    center = bounds.getCenter();
                  }
                } catch (e) {
                  center = bounds.getCenter();
                }
                
                // Obtener las coordenadas reales del polígono para verificar límites
                const polygonCoords = targetLayer.feature.geometry.coordinates[0];
                const polygonLatLngs = polygonCoords.map(coord => L.latLng(coord[1], coord[0]));
                
                // Función para verificar si un punto está dentro del polígono usando ray casting
                const isPointInPolygon = (point, latlngs) => {
                  let inside = false;
                  for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
                    const xi = latlngs[i].lng, yi = latlngs[i].lat;
                    const xj = latlngs[j].lng, yj = latlngs[j].lat;
                    
                    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
                      (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
                    if (intersect) inside = !inside;
                  }
                  return inside;
                };
                
                // Función para encontrar múltiples puntos candidatos dentro del polígono
                // Optimizado: usa menos puntos para mayor velocidad
                const findCandidatePositions = () => {
                  const ne = bounds.getNorthEast();
                  const sw = bounds.getSouthWest();
                  const candidatePoints = [];
                  
                  const gridSize = 5; // Reducido de 8 a 5 para mayor velocidad
                  const latStep = (ne.lat - sw.lat) / gridSize;
                  const lngStep = (ne.lng - sw.lng) / gridSize;
                  
                  for (let i = 0; i <= gridSize; i++) {
                    for (let j = 0; j <= gridSize; j++) {
                      const lat = sw.lat + (latStep * i);
                      const lng = sw.lng + (lngStep * j);
                      const point = L.latLng(lat, lng);
                      
                      if (isPointInPolygon(point, polygonLatLngs)) {
                        candidatePoints.push(point);
                      }
                    }
                  }
                  
                  try {
                    if (targetLayer.getCenter && typeof targetLayer.getCenter === 'function') {
                      const centroid = targetLayer.getCenter();
                      if (isPointInPolygon(centroid, polygonLatLngs)) {
                        candidatePoints.unshift(centroid);
                      }
                    }
                  } catch (e) {
                    // Ignorar error
                  }
                  
                  if (candidatePoints.length === 0) {
                    candidatePoints.push(bounds.getCenter());
                  }
                  
                  // Limitar a máximo 20 puntos para mayor velocidad
                  return candidatePoints.slice(0, 20);
                };
                
                // Calcular el tamaño aproximado del polígono en píxeles
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                const pointNE = mapa.latLngToContainerPoint(ne);
                const pointSW = mapa.latLngToContainerPoint(sw);
                const width = Math.abs(pointNE.x - pointSW.x);
                const height = Math.abs(pointNE.y - pointSW.y);
                const minSize = Math.min(width, height);
                
                // Calcular tamaño de fuente adaptativo basado en el tamaño del polígono
                let fontSize = Math.max(8, Math.min(12, Math.floor(minSize / 25)));
                
                // Ajustar el tamaño del texto según la longitud del nombre
                const textLength = nombreMunicipio.length;
                if (textLength > 20) {
                  fontSize = Math.max(8, fontSize - 2);
                } else if (textLength > 15) {
                  fontSize = Math.max(8, fontSize - 1);
                }
                
                targetLayer._municipioLabel = L.marker(center, {
                  icon: L.divIcon({
                    className: 'municipio-label',
                    html: '<div class="municipio-label-content" style="font-size: ' + fontSize + 'px;">' + nombreMunicipio + '</div>',
                    iconSize: [null, null],
                    iconAnchor: [0, 0]
                  }),
                  interactive: false,
                  zIndexOffset: 500
                }).addTo(mapa);
                
                // Verificar y ajustar que el texto esté dentro del polígono después de renderizar
                // Timeout reducido para respuesta más rápida
                setTimeout(() => {
                  if (!targetLayer._municipioLabel) return;
                  const labelElement = targetLayer._municipioLabel.getElement();
                  if (labelElement) {
                    const content = labelElement.querySelector('.municipio-label-content');
                    if (content) {
                      // Calcular el ancho y alto del polígono en píxeles
                      const polygonWidth = Math.abs(pointNE.x - pointSW.x);
                      const polygonHeight = Math.abs(pointNE.y - pointSW.y);
                      
                      // Obtener puntos candidatos para probar
                      const candidatePositions = findCandidatePositions();
                      
                      // Función para verificar si las esquinas del texto están dentro del polígono
                      const textCornersInPolygon = (rotation, testSize, centerPoint) => {
                        const originalTransform = content.style.transform;
                        const originalFontSize = content.style.fontSize;
                        
                        content.style.fontSize = testSize + 'px';
                        if (rotation !== 0) {
                          content.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
                        } else {
                          content.style.transform = 'translate(-50%, -50%)';
                        }
                        
                        void content.offsetWidth;
                        
                        const textWidth = content.offsetWidth || content.scrollWidth;
                        const textHeight = content.offsetHeight || content.scrollHeight;
                        
                        const centerPixel = mapa.latLngToContainerPoint(centerPoint);
                        const halfWidth = textWidth / 2;
                        const halfHeight = textHeight / 2;
                        
                        let corners = [
                          { x: centerPixel.x - halfWidth, y: centerPixel.y - halfHeight },
                          { x: centerPixel.x + halfWidth, y: centerPixel.y - halfHeight },
                          { x: centerPixel.x + halfWidth, y: centerPixel.y + halfHeight },
                          { x: centerPixel.x - halfWidth, y: centerPixel.y + halfHeight }
                        ];
                        
                        if (rotation !== 0) {
                          const rad = rotation * Math.PI / 180;
                          const cos = Math.cos(rad);
                          const sin = Math.sin(rad);
                          
                          corners = corners.map(corner => {
                            const dx = corner.x - centerPixel.x;
                            const dy = corner.y - centerPixel.y;
                            return {
                              x: centerPixel.x + (dx * cos - dy * sin),
                              y: centerPixel.y + (dx * sin + dy * cos)
                            };
                          });
                        }
                        
                        let allCornersInside = true;
                        for (const corner of corners) {
                          const cornerLatLng = mapa.containerPointToLatLng(corner);
                          if (!isPointInPolygon(cornerLatLng, polygonLatLngs)) {
                            allCornersInside = false;
                            break;
                          }
                        }
                        
                        content.style.transform = originalTransform;
                        content.style.fontSize = originalFontSize;
                        
                        return allCornersInside;
                      };
                      
                      const getTextDimensions = (rotation, testSize) => {
                        const originalTransform = content.style.transform;
                        const originalFontSize = content.style.fontSize;
                        
                        content.style.fontSize = testSize + 'px';
                        if (rotation !== 0) {
                          content.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
                        } else {
                          content.style.transform = 'translate(-50%, -50%)';
                        }
                        
                        void content.offsetWidth;
                        
                        const textWidth = content.offsetWidth || content.scrollWidth;
                        const textHeight = content.offsetHeight || content.scrollHeight;
                        
                        content.style.transform = originalTransform;
                        content.style.fontSize = originalFontSize;
                        
                        if (rotation === 90 || rotation === -90) {
                          return { width: textHeight, height: textWidth };
                        }
                        
                        return { width: textWidth, height: textHeight };
                      };
                      
                      const adjustTextSize = () => {
                        let currentSize = parseInt(content.style.fontSize) || fontSize;
                        let bestRotation = 0;
                        let bestSize = currentSize;
                        let bestPosition = center;
                        let bestScore = 0;
                        
                        // Probar orientaciones optimizadas (menos orientaciones para mayor velocidad)
                        const orientations = [0, 90, -90, 45, -45, 30, -30, 60, -60, 15, -15, 75, -75, 120, -120, 135, -135, 150, -150, 165, -165];
                        
                        // Probar combinaciones de posición y orientación (optimizado para velocidad)
                        let foundGoodSolution = false;
                        
                        for (const testPosition of candidatePositions) {
                          for (const rotation of orientations) {
                            let testSize = currentSize;
                            let fits = false;
                            
                            const dims = getTextDimensions(rotation, testSize);
                            const fitsBounds = dims.width <= polygonWidth * 0.65 && dims.height <= polygonHeight * 0.65;
                            
                            if (fitsBounds && textCornersInPolygon(rotation, testSize, testPosition)) {
                              fits = true;
                            } else {
                              // Si no cabe, reducir el tamaño solo una vez (más rápido)
                              if (testSize > 7) {
                                testSize = Math.max(7, Math.floor(testSize * 0.85));
                                const dims2 = getTextDimensions(rotation, testSize);
                                const fitsBounds2 = dims2.width <= polygonWidth * 0.65 && dims2.height <= polygonHeight * 0.65;
                                
                                if (fitsBounds2 && textCornersInPolygon(rotation, testSize, testPosition)) {
                                  fits = true;
                                }
                              }
                            }
                            
                            if (fits) {
                              const rotationPenalty = Math.abs(rotation) / 180;
                              const score = testSize * 1000 - (rotationPenalty * 100);
                              
                              if (score > bestScore) {
                                bestRotation = rotation;
                                bestSize = testSize;
                                bestPosition = testPosition;
                                bestScore = score;
                                
                                // Si encontramos una solución con tamaño grande y orientación horizontal, detener búsqueda
                                if (testSize >= currentSize * 0.9 && Math.abs(rotation) <= 30) {
                                  foundGoodSolution = true;
                                  break;
                                }
                              }
                            }
                          }
                          
                          if (foundGoodSolution) break;
                        }
                        
                        if (bestScore === 0) {
                          bestRotation = 0;
                          bestSize = Math.max(7, Math.floor(currentSize * 0.8));
                          bestPosition = center;
                        }
                        
                        if (targetLayer._municipioLabel && !bestPosition.equals(center)) {
                          mapa.removeLayer(targetLayer._municipioLabel);
                          targetLayer._municipioLabel = L.marker(bestPosition, {
                            icon: L.divIcon({
                              className: 'municipio-label',
                              html: '<div class="municipio-label-content" style="font-size: ' + bestSize + 'px;">' + nombreMunicipio + '</div>',
                              iconSize: [null, null],
                              iconAnchor: [0, 0]
                            }),
                            interactive: false,
                            zIndexOffset: 500
                          }).addTo(mapa);
                          
                          setTimeout(() => {
                            if (!targetLayer._municipioLabel) return;
                            const labelElement = targetLayer._municipioLabel.getElement();
                            if (labelElement) {
                              const newContent = labelElement.querySelector('.municipio-label-content');
                              if (newContent) {
                                newContent.style.fontSize = bestSize + 'px';
                                if (bestRotation !== 0) {
                                  newContent.style.transform = `translate(-50%, -50%) rotate(${bestRotation}deg)`;
                                } else {
                                  newContent.style.transform = 'translate(-50%, -50%)';
                                }
                              }
                            }
                          }, 50);
                        } else {
                          content.style.fontSize = bestSize + 'px';
                          if (bestRotation !== 0) {
                            content.style.transform = `translate(-50%, -50%) rotate(${bestRotation}deg)`;
                          } else {
                            content.style.transform = 'translate(-50%, -50%)';
                          }
                        }
                      };
                      
                      adjustTextSize();
                    }
                  }
                }, 50); // Reducido de 150ms a 50ms para respuesta más rápida
              };
              
              createOrUpdateLabel(layer);
            }
          }
        });
      }
    };
    
    // Agregar listener para actualizar etiquetas cuando cambia el zoom
    mapa.on('zoomend', updateVisibleLabels);
    mapa.on('moveend', updateVisibleLabels); // También actualizar cuando se mueve el mapa
    
    console.log(`Cargados ${Object.keys(municipiosUnicos).length} municipios de Tabasco`);
  });