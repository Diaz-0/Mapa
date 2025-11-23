		//minimap - crear capa inicial (usará la misma que el mapa principal)
		// Crear un mapeo de capas base para el minimap
		var miniMapLayers = {
			"OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© OpenStreetMap contributors'
			}),
			"Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© Google'
			}),
			"Google Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© Google'
			}),
			"Esri Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© Esri'
			}),
			"Stadia Satellite": L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© Stadia Maps',
				ext: 'jpg'
			}),
			"Google Terrain": L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© Google'
			}),
			"Thunderforest Outdoors": L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey={apikey}', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© Thunderforest',
				apikey: '9dfc94b6bdec40fa8e8ae0aa0b28bb7c'
			}),
			"Thunderforest Landscape": L.tileLayer('https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}{r}.png?apikey={apikey}', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© Thunderforest',
				apikey: '9dfc94b6bdec40fa8e8ae0aa0b28bb7c'
			}),
			"Thunderforest Spinal Map": L.tileLayer('https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}{r}.png?apikey={apikey}', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© Thunderforest',
				apikey: '9dfc94b6bdec40fa8e8ae0aa0b28bb7c'
			}),
			"CartoDB Positron": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© OpenStreetMap contributors © CARTO',
				subdomains: 'abcd'
			}),
			"CartoDB Dark Matter": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
				minZoom: 0,
				maxZoom: 13,
				attribution: '© OpenStreetMap contributors © CARTO',
				subdomains: 'abcd'
			})
		};
		
		// Obtener la capa inicial del mapa principal (por defecto CartoDB Dark Matter)
		var initialBaseLayer = "CartoDB Dark Matter";
		var initialMiniMapLayer = miniMapLayers[initialBaseLayer] || miniMapLayers["CartoDB Dark Matter"];
		
		var miniMap = new L.Control.MiniMap(initialMiniMapLayer, { 
			toggleDisplay: true,
			position: 'bottomleft',
			width: 200,
			height: 150,
			zoomAnimation: true,
			zoomAnimationThreshold: 4,
			showRectangle: true
		}).addTo(mapa);
		
		// Cambiar los textos del botón toggle del minimap
		setTimeout(function() {
			var toggleButton = document.querySelector('.leaflet-control-minimap .leaflet-control-minimap-toggle-display');
			if (toggleButton) {
				// Cambiar el texto cuando el minimap está visible
				if (!miniMap._container || !miniMap._container.classList.contains('minimized')) {
					toggleButton.setAttribute('title', 'Ocultar minimapa');
					toggleButton.setAttribute('aria-label', 'Ocultar minimapa');
				} else {
					toggleButton.setAttribute('title', 'Mostrar minimapa');
					toggleButton.setAttribute('aria-label', 'Mostrar minimapa');
				}
				
				// Actualizar el texto cuando se hace clic en el botón
				if (toggleButton.addEventListener) {
					toggleButton.addEventListener('click', function() {
						setTimeout(function() {
							var isMinimized = miniMap._container && miniMap._container.classList.contains('minimized');
							if (isMinimized) {
								toggleButton.setAttribute('title', 'Ocultar minimapa');
								toggleButton.setAttribute('aria-label', 'Ocultar minimapa');
							} else {
								toggleButton.setAttribute('title', 'Mostrar minimapa');
								toggleButton.setAttribute('aria-label', 'Mostrar minimapa');
							}
						}, 100);
					});
				}
			}
		}, 100);
		
		// Sincronizar el minimap con la capa base del mapa principal
		mapa.on('baselayerchange', function(e) {
			var layerName = e.name;
			var newMiniMapLayer = miniMapLayers[layerName];
			
			if (newMiniMapLayer && miniMap && miniMap._miniMap) {
				// Remover la capa actual del minimap
				miniMap._miniMap.eachLayer(function(layer) {
					if (layer instanceof L.TileLayer) {
						miniMap._miniMap.removeLayer(layer);
					}
				});
				
				// Agregar la nueva capa
				newMiniMapLayer.addTo(miniMap._miniMap);
			}
		});
		
		// Agregar flecha de orientación manualmente al minimap
		function addOrientationArrow() {
			var miniMapMap = miniMap._miniMap;
			if (miniMapMap && miniMapMap.getContainer) {
				var container = miniMapMap.getContainer();
				if (container) {
					// Función para actualizar la posición de la flecha
					function updateOrientationArrow() {
						try {
							// Obtener el bounds del minimap
							var miniBounds = miniMapMap.getBounds();
							var miniCenter = miniBounds.getCenter();
							
							// Calcular la posición de la flecha (en el centro del minimap)
							var arrowPosition = miniCenter;
							
							// Crear o actualizar el marcador de orientación (muñequito simple)
							if (!miniMap._orientationMarker) {
								var orientationIcon = L.divIcon({
									className: 'minimap-orientation-marker',
									html: '<div class="orientation-person"><i class="fas fa-user"></i></div>',
									iconSize: [20, 20],
									iconAnchor: [10, 10]
								});
								
								miniMap._orientationMarker = L.marker(arrowPosition, {
									icon: orientationIcon,
									interactive: false,
									zIndexOffset: 1000
								}).addTo(miniMapMap);
							} else {
								miniMap._orientationMarker.setLatLng(arrowPosition);
							}
						} catch (e) {
							console.log('Error actualizando flecha de orientación:', e);
						}
					}
					
					// Crear la flecha inicialmente
					updateOrientationArrow();
					
					// Actualizar cuando cambie el mapa principal
					mapa.on('moveend zoomend', updateOrientationArrow);
					
					// Actualizar cuando cambie el minimap
					miniMapMap.on('moveend zoomend', updateOrientationArrow);
					
					return true;
				}
			}
			return false;
		}
		
		// Intentar agregar la flecha con múltiples intentos
		var attempts = 0;
		var maxAttempts = 10;
		var intervalId = setInterval(function() {
			attempts++;
			if (addOrientationArrow() || attempts >= maxAttempts) {
				clearInterval(intervalId);
			}
		}, 200);
		

		var drawnItems = new L.featureGroup();
		mapa.addLayer(drawnItems);
		
		// Crear control de dibujo pero ocultarlo (usaremos nuestro panel personalizado)
		var drawControl = new L.Control.Draw({
			position: 'topright',
			draw: {
            circle: true,
            circlemarker: true,
            marker: true,
            rectangle: true,
            polyline: true,
            polygon: true
       },
			edit: {
				featureGroup: drawnItems
			}
		});	
		
		// Agregar el control pero ocultarlo
		mapa.addControl(drawControl);
		
		// Ocultar el control de dibujo original
		setTimeout(function() {
			var drawControlElement = document.querySelector('.leaflet-draw');
			if (drawControlElement) {
				drawControlElement.style.display = 'none';
			}
		}, 100);
		
		// Función para actualizar el contador de dibujos
		function actualizarContadorDibujos() {
			var count = drawnItems.getLayers().length;
			var exportBtn = document.getElementById('export');
			exportBtn.innerHTML = '📥 Exportar Dibujos (' + count + ')';
		}
		
		mapa.on('draw:created', function (e) {
			var layer = e.layer,
				feature = layer.feature = layer.feature || {};
			
			feature.type = feature.type || "Feature"; 
			
			var props = feature.properties = feature.properties || {};
				
				props.autor = "Usuario del Mapa de Tabasco";
				props.fecha = new Date().toLocaleDateString();
				props.tipo = e.layerType;
				
				drawnItems.addLayer(layer);
				
			// Actualizar contador
			actualizarContadorDibujos();
				
			// Mostrar información del dibujo creado
			console.log('Dibujo creado:', props.tipo, 'por', props.autor, 'el', props.fecha);
		});
		
		// Actualizar contador cuando se eliminen dibujos
		mapa.on('draw:deleted', function (e) {
			actualizarContadorDibujos();
		});
		
		
		// Función para configurar el evento de exportación
		function configurarExportacion() {
			var exportBtn = document.getElementById('export');
			if (exportBtn) {
				exportBtn.onclick = function(e) {
					e.preventDefault();
					
					// Extraer GeoJson desde featureGroup
					var data = drawnItems.toGeoJSON();
					
					if (data.features.length === 0) {
						alert('No hay dibujos para exportar. Dibuja algo en el mapa primero.');
						return;
					}
					
					// Crear el contenido del archivo
					var jsonString = JSON.stringify(data, null, 2);
					var blob = new Blob([jsonString], { type: 'application/json' });
					
					// Crear enlace de descarga
					var url = window.URL.createObjectURL(blob);
					var link = document.createElement('a');
					link.href = url;
					link.download = 'dibujos_tabasco_' + new Date().toISOString().split('T')[0] + '.geojson';
					
					// Agregar al DOM temporalmente y hacer clic
					document.body.appendChild(link);
					link.click();
					
					// Limpiar
					document.body.removeChild(link);
					window.URL.revokeObjectURL(url);
					
					// Mostrar mensaje de confirmación
					var mensaje = 'Archivo exportado exitosamente!\n\n';
					mensaje += 'Nombre: ' + link.download + '\n';
					mensaje += 'Elementos exportados: ' + data.features.length + '\n';
					mensaje += 'Ubicación: Carpeta de Descargas';
					alert(mensaje);
				};
			}
		}
		
		// Función para configurar eventos después de cargar paneles
		window.configurarEventosPaneles = function() {
			configurarExportacion();
			actualizarContadorDibujos();
		};
		
		// Variables globales para el panel de dibujo
		window.currentDrawTool = null;
		window.editMode = false;
		
		// Función para alternar el panel de dibujo
		window.toggleDrawingPanel = function() {
			var content = document.getElementById('drawing-content');
			var toggle = document.querySelector('.drawing-toggle');
			
			if (content.classList.contains('show')) {
				content.classList.remove('show');
				toggle.innerHTML = '▼';
			} else {
				content.classList.add('show');
				toggle.innerHTML = '▲';
			}
		};
		
		// Función para activar herramientas de dibujo
		window.activateDrawTool = function(tool) {
		// Desactivar herramienta anterior
		if (window.currentDrawTool) {
			var activeBtn = document.querySelector('.drawing-btn.active');
			if (activeBtn) {
				activeBtn.classList.remove('active');
			}
		}
			
			// Activar nueva herramienta
			window.currentDrawTool = tool;
			event.target.classList.add('active');
			
			// Activar el modo de dibujo correspondiente
			var drawControlElement = document.querySelector('.leaflet-draw');
			if (drawControlElement) {
				drawControlElement.style.display = 'block';
				
				// Simular clic en la herramienta correspondiente
				var toolButton = drawControlElement.querySelector('[title*="' + tool + '"]');
				if (toolButton) {
					toolButton.click();
				}
				
				// Ocultar el control después de activar la herramienta
				setTimeout(function() {
					drawControlElement.style.display = 'none';
				}, 100);
			}
		};
		
		// Función para alternar modo de edición
		window.toggleEditMode = function() {
			window.editMode = !window.editMode;
			var editBtn = event.target;
			
			if (window.editMode) {
				editBtn.classList.add('active');
				editBtn.style.background = '#1e7e34';
			} else {
				editBtn.classList.remove('active');
				editBtn.style.background = '#28a745';
			}
			
			// Activar/desactivar modo de edición en Leaflet Draw
			var drawControlElement = document.querySelector('.leaflet-draw');
			if (drawControlElement) {
				drawControlElement.style.display = 'block';
				
				var editButton = drawControlElement.querySelector('[title*="Edit"]');
				if (editButton) {
					editButton.click();
				}
				
				setTimeout(function() {
					drawControlElement.style.display = 'none';
				}, 100);
			}
		};
		
		// Función para limpiar todos los dibujos
		window.clearAllDrawings = function() {
			if (drawnItems.getLayers().length === 0) {
				alert('No hay dibujos para eliminar.');
				return;
			}
			
			if (confirm('¿Estás seguro de que quieres eliminar todos los dibujos?')) {
				drawnItems.clearLayers();
				actualizarContadorDibujos();
				alert('Todos los dibujos han sido eliminados.');
			}
		};
		
		// Función para alternar secciones de la barra lateral
		window.toggleSection = function(sectionId) {
			var content = document.getElementById(sectionId);
			var toggle = document.getElementById(sectionId.replace('-section', '-toggle'));
			
			if (content.classList.contains('show')) {
				content.classList.remove('show');
				toggle.innerHTML = '▼';
			} else {
				content.classList.add('show');
				toggle.innerHTML = '▲';
			}
		};
		
		// Función específica para alternar la sección del radar
		window.toggleRadarSection = function() {
			var content = document.getElementById('radar-section');
			var toggle = document.getElementById('radar-toggle');
			
			if (content.classList.contains('show')) {
				content.classList.remove('show');
				toggle.innerHTML = '▼';
			} else {
				content.classList.add('show');
				toggle.innerHTML = '▲';
			}
		};
		
		// Funciones para el panel adicional (mantener compatibilidad)
		window.toggleAdditionalPanel = function() {
			window.toggleSection('advanced-section');
		};
		
		// Funciones de análisis
		window.measureDistance = function() {
			alert('Función de medición de distancia - Próximamente');
		};
		
		window.measureArea = function() {
			alert('Función de medición de área - Próximamente');
		};
		
		window.getCoordinates = function() {
			alert('Función de coordenadas - Próximamente');
		};
		
		window.showStatistics = function() {
			alert('Función de estadísticas - Próximamente');
		};
		
		// Funciones de capas
		window.toggleSatellite = function() {
			alert('Cambiar a vista satelital - Próximamente');
		};
		
		window.toggleTerrain = function() {
			alert('Cambiar a vista de terreno - Próximamente');
		};
		
		window.toggleHeatmap = function() {
			alert('Mostrar mapa de calor - Próximamente');
		};
		
		window.toggleGrid = function() {
			alert('Mostrar cuadrícula - Próximamente');
		};
		
		// Funciones de configuración
		window.resetView = function() {
			mapa.setView([17.668149360093285, -91.53945922851564], 9);
		};
		
		window.toggleFullscreen = function() {
			alert('Pantalla completa - Próximamente');
		};
		
		window.exportMap = function() {
			alert('Exportar mapa - Próximamente');
		};
		
		window.showHelp = function() {
			var helpText = 'AYUDA DEL MAPA\n\n';
			helpText += 'PANEL DE DIBUJO:\n';
			helpText += '• Usa las herramientas para dibujar en el mapa\n';
			helpText += '• Edita o elimina dibujos existentes\n';
			helpText += '• Exporta tus dibujos como GeoJSON\n\n';
			helpText += 'PANEL AVANZADO:\n';
			helpText += '• Herramientas de análisis y medición\n';
			helpText += '• Cambio de capas base\n';
			helpText += '• Configuraciones del mapa\n\n';
			helpText += 'INTERACCIÓN:\n';
			helpText += '• Pasa el mouse sobre municipios para ver información\n';
			helpText += '• Haz clic en municipios para hacer zoom\n';
			helpText += '• Usa el minimapa para navegación rápida';
			
			alert(helpText);
		};