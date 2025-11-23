# Datos de Agua - CSV

## Instrucciones para generar los datos

1. **Abre Google Earth Engine Code Editor**: https://code.earthengine.google.com/

2. **Copia y pega el código** del archivo `GEE_Export_CSV.js` en el editor

3. **Ejecuta el código** haciendo clic en "Run"

4. **Revisa la pestaña "Tasks"** (parte superior derecha del editor)

5. **Haz clic en "Run"** en la tarea "Datos_Agua_Tabasco_2015_2025"

6. **Configura la exportación**:
   - **Folder**: "Datos de mapas" (o el nombre que prefieras)
   - **File name prefix**: "agua_tabasco_datos" (o el que prefieras)
   - Haz clic en "Run"

7. **Espera a que termine** (puede tardar varios minutos dependiendo de los años)

8. **Descarga el CSV** desde Google Drive en la carpeta que especificaste

9. **Coloca el archivo CSV aquí** en la carpeta `Data/` con el nombre: `agua_tabasco_datos.csv`

## Estructura esperada del CSV

El CSV debería tener las siguientes columnas:

| year | season | area_km2 | area_ha |
|------|--------|----------|---------|
| 2020 | Primavera | 15.234 | 1523.4 |
| 2020 | Verano | 18.567 | 1856.7 |
| 2020 | Otoño | 12.891 | 1289.1 |
| 2020 | Invierno | 10.456 | 1045.6 |
| 2020 | Permanente | 8.123 | 812.3 |
| 2020 | Temporal | 5.333 | 533.3 |

## Notas

- El código procesa años del 2015 al 2025
- Para cada año calcula: Primavera, Verano, Otoño, Invierno, Permanente, Temporal
- Las áreas se calculan en km² y hectáreas (ha)
- El procesamiento puede tardar varios minutos

