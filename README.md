# 🗺️ Mapa Coroplético Interactivo de Tabasco

Aplicación web interactiva para visualización de mapas coropléticos de Tabasco con funcionalidades avanzadas de análisis espacial, comparación de capas temporales y visualización de datos de agua.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [Troubleshooting](#troubleshooting)
- [Contribución](#contribución)
- [Licencia](#licencia)

## ✨ Características

- 🗺️ Visualización interactiva de mapas con Leaflet
- 📊 Comparación lado a lado de capas temporales
- 💧 Análisis de datos de agua por temporada y año
- 📈 Gráficas interactivas con Chart.js
- 🎨 Interfaz moderna con efectos futuristas
- 🔍 Herramientas de dibujo y medición
- 🗺️ Mini mapa de navegación
- 📱 Diseño responsive

## 📦 Requisitos

### Requisitos Mínimos

- **Node.js**: 14.x o superior (recomendado: 18.x LTS)
- **npm**: Incluido con Node.js
- **Navegador web moderno**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **GeoServer**: 2.20.x o superior (para capas WMS)
- **RAM**: Mínimo 4 GB (recomendado: 8 GB)

### Requisitos Opcionales

- **Apache HTTP Server**: Para producción
- **Git**: Para clonar el repositorio

> 📄 Ver archivo `requisitos.txt` para información detallada de requisitos.

## 🚀 Instalación

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Diaz-0/Mapa.git
cd Leaflet
```

O si ya tienes el proyecto descargado, navega a la carpeta del proyecto.

### Paso 2: Instalar Dependencias de Node.js

```bash
npm install
```

Esto instalará Express y todas sus dependencias en la carpeta `node_modules/`.

### Paso 3: Verificar Instalación

```bash
node --version
npm --version
```

Deberías ver las versiones de Node.js y npm instaladas.

## ⚙️ Configuración

### Configuración de GeoServer

1. **Instalar GeoServer** desde https://geoserver.org/release/
2. **Iniciar GeoServer** (por defecto en http://localhost:8080)
3. **Crear Workspace** llamado `agua_tabasco`
4. **Configurar CORS** en GeoServer para permitir peticiones desde tu dominio:
   - Ve a: `Settings > Global Settings > CORS`
   - Habilita CORS y agrega tu dominio a los orígenes permitidos

### Configuración de URLs

Si tu GeoServer está en una URL diferente, edita los siguientes archivos:

- `Js/wms-enhancer.js` (línea 11)
- `Js/mapa-agua.js` (línea 3)
- `Js/comparador-agua.js` (línea 3)

Cambia `http://localhost:8080/geoserver/agua_tabasco/wms` por tu URL.

## ▶️ Ejecución

### Opción 1: Usando Express (Recomendado para desarrollo)

Si no tienes un archivo `server.js`, crea uno en la raíz del proyecto:

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'lef.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
```

Luego ejecuta:

```bash
node server.js
```

O si prefieres usar `npm start`, agrega esto a `package.json`:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Y ejecuta:

```bash
npm start
```

### Opción 2: Usando Live Server (VS Code)

1. Instala la extensión **Live Server** en VS Code
2. Haz clic derecho en `Html/lef.html`
3. Selecciona **"Open with Live Server"**

### Opción 3: Usando Apache HTTP Server

1. Copia el proyecto a la carpeta `htdocs` de Apache (o tu carpeta web)
2. Asegúrate de que el módulo `mod_headers` esté habilitado
3. El archivo `.htaccess` ya está configurado
4. Accede a: `http://localhost/Html/lef.html`

### Opción 4: Usando Python (Desarrollo rápido)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Luego accede a: `http://localhost:8000/Html/lef.html`

## 📁 Estructura del Proyecto

```
Leaflet/
│
├── Css/                    # Estilos CSS modulares
│   ├── base.css           # Estilos base
│   ├── mapa.css           # Estilos del mapa
│   ├── sidebar.css        # Estilos del sidebar
│   └── ...
│
├── Html/                   # Archivos HTML
│   ├── lef.html           # Página principal
│   ├── mapa-agua.html     # Mapa de agua
│   └── ...
│
├── Js/                     # Archivos JavaScript
│   ├── index.js           # Lógica principal
│   ├── mapa-agua.js       # Funcionalidad de mapas de agua
│   └── ...
│
├── GeoJSON/                # Archivos GeoJSON
│   └── Tabasco.json       # Polígonos de municipios
│
├── Data/                   # Datos CSV
│   └── agua_tabasco_datos.csv
│
├── Plugins/                # Bibliotecas locales
│   └── leaflet.js         # Leaflet core
│
├── Layers/                 # Configuración de capas
│   └── layer.js
│
├── .gitignore             # Archivos ignorados por Git
├── package.json           # Dependencias de Node.js
├── package-lock.json      # Lock de dependencias
├── requisitos.txt        # Requisitos del sistema
└── README.md             # Este archivo
```

## 🎮 Uso

### Página Principal (lef.html)

1. Abre `Html/lef.html` en tu navegador
2. El mapa se carga automáticamente centrado en Tabasco
3. Usa los controles del sidebar para:
   - Seleccionar capas del mapa
   - Cambiar estilos de visualización
   - Activar herramientas de dibujo
   - Ver información de municipios

### Comparador de Capas

1. Abre `Html/comparador-sidebar.html`
2. Selecciona dos capas temporales diferentes
3. Usa el control deslizante para comparar visualmente

### Mapa de Agua

1. Abre `Html/mapa-agua.html`
2. Selecciona temporada y año
3. Visualiza los datos de agua por municipio

## 🔧 Troubleshooting

### Error: "GeoServer no responde"

- Verifica que GeoServer esté ejecutándose en `http://localhost:8080`
- Revisa la configuración de CORS en GeoServer
- Verifica que el workspace `agua_tabasco` exista

### Error: "CORS bloqueado"

- Configura CORS en GeoServer:
  - Settings > Global Settings > CORS
  - Habilita CORS y agrega tu dominio

### Los mapas no cargan

- Verifica tu conexión a Internet (se necesitan recursos de CDN)
- Revisa la consola del navegador (F12) para errores
- Asegúrate de que los archivos CSS y JS estén en las rutas correctas

### Puerto 3000 ya está en uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

O cambia el puerto en `server.js`:

```javascript
const PORT = process.env.PORT || 3001; // Cambia a otro puerto
```

### node_modules no se encuentra

```bash
npm install
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas Adicionales

- El archivo `GeoJSON/georef-mexico-municipality-millesime@public.json` está excluido del repositorio por su tamaño (188.94 MB). Si lo necesitas, puedes usar Git LFS o agregarlo manualmente.

- Para producción, se recomienda:
  - Usar un servidor web robusto (Apache/Nginx)
  - Configurar HTTPS
  - Optimizar imágenes y recursos
  - Usar un CDN para recursos estáticos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👤 Autor

**Diaz-0**

- GitHub: [@Diaz-0](https://github.com/Diaz-0)

## 🙏 Agradecimientos

- Leaflet - Biblioteca de mapas interactivos
- GeoServer - Servidor de datos geoespaciales
- Chart.js - Biblioteca de gráficas
- Todos los contribuidores de las bibliotecas utilizadas

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub.

