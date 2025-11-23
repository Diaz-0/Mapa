# Estructura de Archivos CSS - Mapa Coroplético de Tabasco

## 📁 Organización Modular

El CSS ha sido dividido en archivos especializados para mejor organización y mantenimiento:

### 🎯 **base.css**
- **Propósito**: Estilos base y layout principal
- **Contenido**:
  - Reset de márgenes y padding
  - Configuración del body y html
  - Layout principal con barra lateral
  - Contenedor del mapa
  - Estilos responsive básicos

### 🗺️ **mapa.css**
- **Propósito**: Estilos específicos del mapa y controles de Leaflet
- **Contenido**:
  - Control de información (.info)
  - Leyenda del mapa (.legend)
  - Popup flotante para mensajes
  - Estilos de elementos del mapa

### 🎛️ **sidebar.css**
- **Propósito**: Estilos de la barra lateral derecha
- **Contenido**:
  - Estructura de la sidebar
  - Headers de secciones
  - Botones de herramientas
  - Control de capas integrado
  - Efectos hover y transiciones

### ✨ **efectos-futuristas.css**
- **Propósito**: Efectos visuales futuristas
- **Contenido**:
  - Sistema de partículas
  - Efecto de conexión de datos
  - Título futurista
  - Panel de estadísticas
  - Sistema de notificaciones
  - Display de coordenadas

### 📡 **radar.css**
- **Propósito**: Estilos del sistema de radar
- **Contenido**:
  - Pantalla del radar
  - Grid y barrido animado
  - Puntos de radar
  - Estadísticas del radar
  - Animaciones específicas

### 💬 **mensaje.css**
- **Propósito**: Estilos de mensajes y popups
- **Contenido**:
  - Estilos de mensajes específicos
  - Popups de información

## 🔧 **Ventajas de la Separación**

### **Mantenimiento**
- ✅ **Código organizado**: Cada funcionalidad en su archivo
- ✅ **Fácil localización**: Encontrar estilos específicos rápidamente
- ✅ **Modificaciones aisladas**: Cambios no afectan otros módulos

### **Performance**
- ✅ **Carga modular**: Solo cargar estilos necesarios
- ✅ **Caché eficiente**: Archivos pequeños se cachean mejor
- ✅ **Debugging**: Errores aislados por módulo

### **Desarrollo**
- ✅ **Colaboración**: Diferentes desarrolladores pueden trabajar en diferentes archivos
- ✅ **Versionado**: Cambios específicos por funcionalidad
- ✅ **Reutilización**: Archivos CSS pueden usarse en otros proyectos

## 📋 **Orden de Carga**

Los archivos CSS se cargan en el siguiente orden:

1. **base.css** - Estilos base y layout
2. **mapa.css** - Estilos del mapa
3. **sidebar.css** - Estilos de la barra lateral
4. **efectos-futuristas.css** - Efectos visuales
5. **radar.css** - Estilos del radar
6. **mensaje.css** - Estilos de mensajes

## 🎨 **Tema Futurista**

Todos los archivos mantienen la coherencia del tema futurista:
- **Colores principales**: #00ffe7 (cian), #ff073a (rojo), #1e3a8a (azul)
- **Efectos**: Resplandor, blur, gradientes
- **Animaciones**: Transiciones suaves y efectos de pulso
- **Tipografía**: Orbitron para elementos futuristas

## 📱 **Responsive Design**

Cada archivo incluye sus propias reglas responsive:
- **Mobile**: Adaptación para pantallas pequeñas
- **Tablet**: Optimización para dispositivos medianos
- **Desktop**: Experiencia completa en pantallas grandes
