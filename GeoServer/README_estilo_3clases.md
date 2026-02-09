# Estilo GeoServer: 3 clases (Sin agua, Agua permanente, Agua temporal)

**Un solo estilo**, no dos. Ese estilo pinta las tres clases (incluyendo los dos tipos de agua: permanente y temporal) con colores distintos.

## Qué hace

El archivo `agua_3clases.sld` define **un** estilo para raster que pinta **tres clases** con colores distintos:

| Valor | Clase             | Color (hex) |
|-------|-------------------|-------------|
| 0     | Sin agua          | Negro `#000000` |
| 1     | Agua permanente   | Azul oscuro `#003366` |
| 2     | Agua temporal     | Azul claro `#66CCFF` |

Así en el mapa se distingue visualmente agua permanente de agua temporal.

## Cómo añadirlo en GeoServer

1. Abre GeoServer: **http://localhost:8080/geoserver**
2. Entra en **Data > Styles**.
3. **Add new style**.
4. **Name:** `agua_3clases`
5. En **Style editor** pega el contenido de `agua_3clases.sld` (o sube el archivo si tu versión lo permite).
6. **Validate** y luego **Save**.

## Aplicar el estilo a las capas de agua

1. Ve a **Data > Layer** y abre cada capa de agua (p. ej. `Agua_Verano_2020-1`).
2. En **Publishing > WMS Settings**, en **Default Style** elige **agua_3clases**.
3. **Save**.

**En la aplicación Leaflet:** en `Js/mapa-agua.js` ya está `styles: 'agua_3clases'`. Las peticiones WMS piden este estilo. Si el estilo no existe en GeoServer, la capa puede fallar o verse con el estilo por defecto. Si creaste el estilo dentro del workspace `agua_tabasco`, en `mapa-agua.js` usa `styles: 'agua_tabasco:agua_3clases'`.

## Si solo ves un color de agua (p. ej. todo cyan)

1. **Estilo no aplicado:** el WMS debe usar `agua_3clases`. Revisa que el estilo exista en GeoServer (Data > Styles) y que en `mapa-agua.js` siga `styles: 'agua_3clases'`. Opcionalmente, pon **Default Style** `agua_3clases` en cada capa de agua (Data > Layers > capa > Publishing).

2. **Datos solo 0 y 1:** si el raster en GeoServer es binario (0 = sin agua, 1 = agua), nunca saldrá “agua permanente” y “agua temporal” por separado. Hay que publicar las **clasificaciones de 3 clases** (0, 1, 2) del notebook (`Resultados/02_Clasificaciones_Raster/.../clasificacion_*.tif`), no un raster binario antiguo.

## Requisito

Las capas deben ser raster de **una banda** con valores de píxel **0**, **1** y **2** (clasificación del notebook: Sin agua, Agua permanente, Agua temporal). Si tus GeoTIFF tienen otra banda o otros valores, hay que ajustar el SLD o la capa en GeoServer.
