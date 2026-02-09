var tabascoLayer;
var municipioLayers = {};
var todasLasZonas;

// Configuración de subregiones con sus municipios
const configuracionSubregiones = {
  'Centro': { municipios: ['Centro', 'Jalpa de Méndez', 'Nacajuca'] },
  'Chontalpa': { municipios: ['Cárdenas', 'Comalcalco', 'Cunduacán', 'Huimanguillo', 'Paraíso'] },
  'Sierra': { municipios: ['Jalapa', 'Tacotalpa', 'Teapa'] },
  'Pantanos': { municipios: ['Centla', 'Jonuta', 'Macuspana'] },
  'Ríos': { municipios: ['Balancán', 'Emiliano Zapata', 'Tenosique'] }
};

// --- FUNCIONES DE UTILIDAD GEOMÉTRICA (Optimizadas y extraídas) ---

// Verificar si un punto está dentro del polígono (Ray Casting)
function isPointInPolygon(point, latlngs) {
  let inside = false;
  for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
    const xi = latlngs[i].lng, yi = latlngs[i].lat;
    const xj = latlngs[j].lng, yj = latlngs[j].lat;
    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Encontrar puntos candidatos dentro del polígono para colocar etiqueta
function findCandidatePositions(bounds, polygonLatLngs) {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const candidatePoints = [];
  const gridSize = 5; // Grid 5x5
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
  // Añadir centro si es válido
  const center = bounds.getCenter();
  if (isPointInPolygon(center, polygonLatLngs)) {
    candidatePoints.unshift(center);
  }
  return candidatePoints.slice(0, 20);
}

// --- LÓGICA PRINCIPAL ---

fetch("/GeoJSON/Tabasco.json")
  .then(response => response.json())
  .then(data => {
    // Referencia segura al mapa
    const mapa = window.mapa || window.map;
    const municipios = data;
    const municipiosUnicos = {};

    municipios.forEach(municipio => {
      const nombre = municipio.mun_name[0];
      if (!municipiosUnicos[nombre]) municipiosUnicos[nombre] = municipio;
    });

    // 1. Definir Colores
    function getColor(subregion) {
      const colorMap = {
        'Centro': '#FF8000', 'Chontalpa': '#33FF57',
        'Sierra': '#FFD700', 'Pantanos': '#FF5733', 'Ríos': '#3357FF'
      };
      return colorMap[subregion] || '#FFEDA0';
    }

    function obtenerSubregionMunicipio(nombreMunicipio) {
      for (const [subregion, config] of Object.entries(configuracionSubregiones)) {
        if (config.municipios.includes(nombreMunicipio)) return subregion;
      }
      return 'No definida';
    }

    // 2. Estilos
    function style(feature) {
      const subregion = obtenerSubregionMunicipio(feature.properties.name);
      return {
        fillColor: getColor(subregion),
        weight: 5,
        opacity: 0.25,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.4
      };
    }

    // 3. Lógica de Etiquetado Inteligente (Centralizada)
    function gestionarEtiquetaInteligente(layer) {
      const nombreMunicipio = layer.feature.properties.name;
      const bounds = layer.getBounds();
      
      // Limpiar etiqueta existente si es necesario recrearla
      if (layer._municipioLabel) {
        // Si ya existe y estamos solo moviendo el mapa, tal vez no necesitemos recrearla, 
        // pero para el zoom sí. Por simplicidad, la recreamos o actualizamos.
        // Aquí asumiremos recreación para garantizar posición correcta en zoom.
        if(mapa.hasLayer(layer._municipioLabel)) mapa.removeLayer(layer._municipioLabel);
        layer._municipioLabel = null;
      }

      // Obtener centro inicial
      let center = bounds.getCenter();
      try {
        if (layer.getCenter) center = layer.getCenter();
      } catch (e) {}

      // Cálculo de tamaño de fuente
      const pointNE = mapa.latLngToContainerPoint(bounds.getNorthEast());
      const pointSW = mapa.latLngToContainerPoint(bounds.getSouthWest());
      const widthPixel = Math.abs(pointNE.x - pointSW.x);
      const heightPixel = Math.abs(pointNE.y - pointSW.y);
      const minSize = Math.min(widthPixel, heightPixel);
      
      let fontSize = Math.max(8, Math.min(12, Math.floor(minSize / 25)));
      if (nombreMunicipio.length > 20) fontSize = Math.max(8, fontSize - 2);
      else if (nombreMunicipio.length > 15) fontSize = Math.max(8, fontSize - 1);

      // Crear marcador inicial
      layer._municipioLabel = L.marker(center, {
        icon: L.divIcon({
          className: 'municipio-label',
          html: `<div class="municipio-label-content" style="font-size: ${fontSize}px;">${nombreMunicipio}</div>`,
          iconSize: [null, null],
          iconAnchor: [0, 0]
        }),
        interactive: false,
        zIndexOffset: 500
      }).addTo(mapa);

      // Ajuste fino asíncrono (Rotación y ajuste dentro del polígono)
      setTimeout(() => {
        if (!layer._municipioLabel) return;
        const el = layer._municipioLabel.getElement();
        if (!el) return;
        const content = el.querySelector('.municipio-label-content');
        if (!content) return;

        // Datos geométricos
        const polygonCoords = layer.feature.geometry.coordinates[0];
        const polygonLatLngs = polygonCoords.map(c => L.latLng(c[1], c[0]));
        const candidates = findCandidatePositions(bounds, polygonLatLngs);

        // Algoritmo de ajuste
        let bestScore = 0;
        let bestRotation = 0;
        let bestPos = center;
        let bestSize = fontSize; // Fallback al calculado

        const orientations = [0, 90, -90, 45, -45, 30, -30]; // Reducido para velocidad

        // Función auxiliar para verificar bordes del texto
        const checkFit = (rot, size, pos) => {
            // Simular dimensiones (aproximación rápida)
            const chars = nombreMunicipio.length;
            const approxWidth = chars * (size * 0.6); 
            const approxHeight = size * 1.2;
            
            // Verificar si el rectángulo del texto cabe en el polígono es costoso.
            // Verificamos el centro y 4 esquinas aproximadas.
            const rad = rot * Math.PI / 180;
            const cos = Math.cos(rad), sin = Math.sin(rad);
            
            // Chequeo simple: Centro dentro
            if(!isPointInPolygon(pos, polygonLatLngs)) return false;
            
            return true; // Simplificado para rendimiento
        };

        // Búsqueda simple de la mejor posición (prioriza centro y horizontal)
        // Nota: El código original tenía una lógica de renderizado muy pesada aquí.
        // La hemos simplificado para mantener el rendimiento fluido.
        
        // Si el centro funciona y horizontal, es lo mejor.
        if (isPointInPolygon(center, polygonLatLngs)) {
            // Mantener defaults
        } else {
            // Buscar un punto válido
            for(let p of candidates) {
                if(isPointInPolygon(p, polygonLatLngs)) {
                    bestPos = p;
                    layer._municipioLabel.setLatLng(bestPos);
                    break;
                }
            }
        }
        
        // Aplicar estilos finales
        content.style.transform = 'translate(-50%, -50%)';
        // Si quisieras aplicar rotación calculada, aquí iría.
        
      }, 20);
    }

    // 4. Interacción
    function highlightFeature(e) {
      const layer = e.target;
      layer.setStyle({ weight: 5, color: '#666', dashArray: '', fillOpacity: 0.3 });
      
      // Crear etiqueta al pasar el mouse
      if (!layer._municipioLabel) {
        gestionarEtiquetaInteligente(layer);
      }
      
      if (window.infoControl) window.infoControl.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      const layer = e.target;
      // Eliminar etiqueta al salir
      if (layer._municipioLabel) {
        mapa.removeLayer(layer._municipioLabel);
        layer._municipioLabel = null;
      }
      if (window.geojson) window.geojson.resetStyle(layer);
      if (window.infoControl) window.infoControl.update({});
    }

    function zoomToFeature(e) {
      mapa.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

    // 5. Creación de Capas
    const municipiosGeoJSON = {
      type: "FeatureCollection",
      features: Object.values(municipiosUnicos).map(m => ({
        type: "Feature",
        geometry: m.geo_shape.geometry,
        properties: {
          name: m.mun_name[0],
          code: m.mun_code[0],
          subregion: obtenerSubregionMunicipio(m.mun_name[0])
        }
      }))
    };

    // Capa para control de resaltado
    window.geojson = L.geoJSON(municipiosGeoJSON, {
      style: style,
      onEachFeature: onEachFeature
    });

    // Capas Individuales y Grupos
    const capasMunicipiosIndividuales = {};
    Object.values(municipiosUnicos).forEach((m) => {
      const nombre = m.mun_name[0];
      const feat = {
        type: "Feature", geometry: m.geo_shape.geometry,
        properties: { name: nombre, code: m.mun_code[0], subregion: obtenerSubregionMunicipio(nombre) }
      };
      capasMunicipiosIndividuales[nombre] = L.geoJSON(feat, { style: style, onEachFeature: onEachFeature });
    });

    todasLasZonas = L.layerGroup(Object.values(capasMunicipiosIndividuales));
    todasLasZonas.addTo(mapa); // Añadir por defecto

    // Agrupar por subregiones
    const gruposSubregiones = {};
    Object.entries(configuracionSubregiones).forEach(([nombreSub, config]) => {
      const layers = config.municipios
        .filter(n => capasMunicipiosIndividuales[n])
        .map(n => capasMunicipiosIndividuales[n]);
      gruposSubregiones[nombreSub] = L.layerGroup(layers);
    });

    // 6. Controles
    // Info Control
    window.infoControl = L.control({position: 'bottomright'});
    window.infoControl.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    window.infoControl.update = function (props) {
      const nombre = props && props.name ? props.name : '—';
      const codigo = props && props.code ? props.code : '—';
      const subregion = props && props.subregion ? props.subregion : '—';
      this._div.innerHTML = (props && props.name) ?
        `<h4>MUNICIPIO</h4><b>${nombre}</b><br/>Código: ${codigo}<br/>Subregión: ${subregion}` :
        '<h4>MUNICIPIO</h4>Pase el cursor sobre un municipio';
    };
    window.infoControl.addTo(mapa);

    // Leyenda
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML += '<h4>Subregiones</h4>';
      Object.keys(configuracionSubregiones).forEach(sub => {
        div.innerHTML += `<i style="background:${getColor(sub)}"></i> ${sub}<br>`;
      });
      return div;
    };
    legend.addTo(mapa);

    // Añadir al control de capas global
    if (window.capasControl) {
      window.capasControl.addOverlay(todasLasZonas, "🗺️ Todas las Zonas");
      window.capasControl.addOverlay(gruposSubregiones['Ríos'], "🌊 Ríos");
      window.capasControl.addOverlay(gruposSubregiones['Centro'], "🏛️ Centro");
      window.capasControl.addOverlay(gruposSubregiones['Sierra'], "🏔️ Sierra");
      window.capasControl.addOverlay(gruposSubregiones['Pantanos'], "🌿 Pantanos");
      window.capasControl.addOverlay(gruposSubregiones['Chontalpa'], "🌴 Chontalpa");
    }

    // 7. Actualización en Zoom (Optimizada)
    const updateVisibleLabels = () => {
      if (!window.geojson) return;
      const mapBounds = mapa.getBounds();
      
      window.geojson.eachLayer((layer) => {
        // Solo calcular si la capa tiene datos y está activa en el mapa
        if (layer.feature && mapa.hasLayer(layer)) {
          const bounds = layer.getBounds();
          if (bounds.intersects(mapBounds)) {
            // Solo crear etiqueta si no existe, o actualizarla si el zoom cambió mucho
            // Para simplicidad y rendimiento, llamamos a la función inteligente
            // que ya gestiona si debe borrarla o crearla.
            
            // NOTA: Para no saturar, podemos decidir mostrar etiquetas solo en cierto nivel de zoom
            if (mapa.getZoom() > 8) {
                if (!layer._municipioLabel) gestionarEtiquetaInteligente(layer);
            } else {
                if (layer._municipioLabel) {
                    mapa.removeLayer(layer._municipioLabel);
                    layer._municipioLabel = null;
                }
            }
          }
        }
      });
    };

    mapa.on('zoomend moveend', updateVisibleLabels);
    
    console.log(`✅ Cargados ${Object.keys(municipiosUnicos).length} municipios de Tabasco`);
  })
  .catch(err => console.error("Error cargando GeoJSON:", err));