/**
 * Servidor Express para Mapa Coroplético Interactivo de Tabasco
 * 
 * Este servidor sirve los archivos estáticos de la aplicación web
 * y maneja las rutas principales.
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos desde la raíz
app.use(express.static(__dirname));

// Middleware para parsear JSON (por si se necesitan APIs en el futuro)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'lef.html'));
});

app.get('/lef', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'lef.html'));
});

app.get('/mapa-agua', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'mapa-agua.html'));
});

app.get('/comparador', (req, res) => {
    res.sendFile(path.join(__dirname, 'Html', 'comparador-sidebar.html'));
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'Html', 'lef.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🗺️  Mapa Coroplético Interactivo de Tabasco');
    console.log('='.repeat(60));
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Directorio raíz: ${__dirname}`);
    console.log(`🌐 Página principal: http://localhost:${PORT}/Html/lef.html`);
    console.log('='.repeat(60));
    console.log('⚠️  Asegúrate de que GeoServer esté ejecutándose en http://localhost:8080');
    console.log('='.repeat(60));
});

// Manejo de errores del servidor
process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
});

