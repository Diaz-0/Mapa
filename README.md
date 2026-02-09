# Mapa Coroplético Interactivo de Tabasco

Aplicación web de Sistema de Información Geográfica (SIG) para la visualización interactiva de mapas coropléticos del estado de Tabasco, México. Incluye análisis espacial, comparación temporal de capas de agua mediante Sentinel-1 SAR y visualización de datos hidrológicos estacionales.

---

## Tabla de contenidos

- [Características](#características)
- [Requisitos del sistema](#requisitos-del-sistema)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Solución de problemas](#solución-de-problemas)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Licencia](#licencia)

---

## Características

| Funcionalidad | Descripción |
|---------------|-------------|
| **Mapa principal** | Visualización de municipios de Tabasco con subregiones (Centro, Chontalpa, Sierra, Pantanos, Ríos) |
| **Capas base** | OpenStreetMap, Google Satellite/Hybrid, Esri, Stadia, Thunderforest, CartoDB |
| **Agua temporal** | Capas WMS por temporada (Invierno, Primavera, Verano, Otoño) clasificadas con Sentinel-1 SAR |
| **Comparador** | Vista lado a lado con barrido o animación entre años/temporadas |
| **Gráficas** | Evolución temporal (temporadas, inundación) con Chart.js |
| **Herramientas** | Dibujo (Leaflet.draw), minimapa, panel de estadísticas, overlay Meteoblue |
| **Interfaz** | Tema futurista, diseño responsive, panel lateral colapsable |

---

## Requisitos del sistema

- **Node.js** 14.x o superior (recomendado: 18.x LTS)
- **npm** 6.0 o superior
- **GeoServer** 2.20.x o superior (para capas WMS)
- **Navegador** Chrome 90+, Firefox 88+, Edge 90+ o Safari 14+
- **RAM** 4 GB mínimo (8 GB recomendado)

Para requisitos detallados, consulte `requisitos.txt`.

---

## Instalación

### 1. Clonar o descargar el repositorio

```bash
git clone https://github.com/Diaz-0/Mapa.git
cd Leaflet
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Verificar instalación

```bash
node --version   # Debe ser >= 14.x
npm --version
```

---

## Configuración

### GeoServer

1. Instale GeoServer desde [geoserver.org](https://geoserver.org/release/)
2. Cree el workspace **`agua_subregion_rios`**
3. Publique las capas raster (GeoTIFF) con nomenclatura: `S1_{año}_{temporada}_clasificado_filtrado`
4. Aplique el estilo `agua_3clases` (ver `GeoServer/README_estilo_3clases.md`)
5. Habilite CORS en *Settings > Global Settings > CORS*

### URLs personalizadas

Si GeoServer no está en `localhost:8080`, actualice:

- `Js/wms-enhancer.js` (líneas 8-9)
- `Js/mapa-agua.js` (aguaConfig)

---

## Ejecución

### Con Express (recomendado)

```bash
npm start
```

O:

```bash
node server.js
```

Aplicación disponible en: **http://localhost:3000**

### Otras opciones

| Método | Comando | URL |
|--------|---------|-----|
| Live Server (VS Code) | Extensión Live Server | `http://127.0.0.1:5500/Html/lef.html` |
| Python HTTP | `python -m http.server 8000` | `http://localhost:8000/Html/lef.html` |
| Apache | Copiar a `htdocs` | `http://localhost/Html/lef.html` |

---

## Estructura del proyecto

```
Leaflet/
├── Html/                    # Páginas y componentes
│   ├── lef.html             # Aplicación principal
│   ├── mapa-agua.html       # Mapa de agua (vista simplificada)
│   ├── sidebar.html         # Panel lateral (cargado dinámicamente)
│   ├── comparador-sidebar.html
│   ├── efectos-futuristas.html
│   └── graficas-panel.html
│
├── Css/                     # Estilos modulares
│   ├── base.css             # Layout y reset
│   ├── mapa.css             # Controles Leaflet, leyendas
│   ├── sidebar.css          # Panel lateral, capas
│   ├── efectos-futuristas.css
│   ├── radar.css
│   ├── meteoblue.css
│   ├── comparador-sidebar.css
│   └── mapa-agua.css
│
├── Js/                      # Lógica de aplicación
│   ├── index.js             # Municipios, capas base, info
│   ├── wms-enhancer.js      # Cliente WMS, capas GeoServer
│   ├── mapa-agua.js         # Leyenda y capas de agua
│   ├── comparador-agua.js   # Comparador temporal, gráficas
│   ├── datos-agua-loader.js # Carga CSV de estadísticas
│   ├── efectos-futuristas.js
│   ├── Dibujo_mnmapa.js     # Herramientas de dibujo
│   └── Puntos.js            # Marcadores de interés
│
├── Layers/
│   └── layer.js             # Inicialización mapa, capas base
│
├── GeoJSON/
│   └── Tabasco.json         # Polígonos de municipios
│
├── Data/
│   └── agua_tabasco_datos.csv   # Estadísticas por temporada/año
│
├── GeoServer/
│   ├── agua_3clases.sld     # Estilo SLD (3 clases)
│   └── README_estilo_3clases.md
│
├── Plugins/                 # Leaflet y assets
│   ├── leaflet.js
│   ├── leaflet.css
│   └── images/
│
├── server.js                # Servidor Express
├── package.json
├── requisitos.txt
└── README.md
```

---

## Rutas de la aplicación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | lef.html | Aplicación principal con mapa completo |
| `/lef` | lef.html | Igual que `/` |
| `/mapa-agua` | mapa-agua.html | Vista simplificada de agua temporal |
| `/comparador` | comparador-sidebar.html | Fragmento del comparador (sirve HTML completo) |

---

## Solución de problemas

### GeoServer no responde

- Verifique que GeoServer esté en ejecución en `http://localhost:8080`
- Confirme que el workspace `agua_subregion_rios` exista
- Revise la configuración CORS en GeoServer

### Error CORS en el navegador

- En GeoServer: *Settings > Global Settings > CORS*: habilitar y agregar el origen de la aplicación

### Capas WMS no aparecen

- Consulte la consola del navegador (F12) para errores de red
- Verifique que los nombres de capas coincidan con la configuración en GeoServer
- Asegúrese de que el estilo `agua_3clases` esté asociado a las capas

### Puerto 3000 en uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill
```

O defina otra variable de entorno: `PORT=3001 npm start`

---

## Tecnologías utilizadas

| Componente | Tecnología |
|------------|------------|
| Mapas | Leaflet 1.9.x |
| Servidor | Node.js, Express 4.18 |
| Capas WMS | GeoServer |
| Datos espaciales | GeoJSON, Sentinel-1 SAR |
| Gráficas | Chart.js 4.4 |
| UI | Font Awesome 6, Google Fonts (Orbitron, Montserrat) |
| Plugins Leaflet | Side-by-Side, Draw, MiniMap |

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## Autor

**Diaz-0** — [GitHub](https://github.com/Diaz-0)
