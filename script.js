let puntos = []; // Lo dejamos vacío, se llenará desde Airtable

// Detectar si es móvil para ajustar el zoom inicial del mapa
const isMobile = window.innerWidth <= 800;
// Un zoom más bajo (5) aleja la vista, mostrando más área, ideal para pantallas estrechas.
const initialZoom = isMobile ? 5 : 6;

const mapa = L.map('map').setView([40.2, -3.5], initialZoom);

let modal, modalImg, closeBtn;
let activeMarker = null; // Para guardar la referencia al marcador activo

const marcadores = [];

// --- FUNCIONES PRINCIPALES ---

async function cargarDatosDesdeAirtable() {
    showLoadingIndicator();
    // Ahora llamamos a nuestra propia API segura, que se encuentra en /api/get-data
    const url = '/api/get-data';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Error handling mejorado: si la respuesta no es JSON, lo indicamos.
            const contentType = response.headers.get("content-type");
            let errorText;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorData = await response.json();
                errorText = errorData.error || `Error del servidor: ${response.statusText}`;
            } else {
                // Esto suele ocurrir si la función serverless falla y Vercel devuelve una página de error HTML.
                errorText = `Error inesperado del servidor (la respuesta no es JSON). Revisa los logs de la función en el panel de Vercel. (Status: ${response.status})`;
            }
            throw new Error(errorText);
        }
        const data = await response.json();
        // Transformamos los datos de Airtable a nuestro formato `puntos`
        puntos = data.records.map(record => {
            // Parsear coordenadas desde un único campo de texto "lat, lng"
            const coordsString = record.fields.coordenadas || '';
            const coordsParts = coordsString.split(',');
            const lat = coordsParts.length === 2 ? parseFloat(coordsParts[0].trim()) || 0 : 0;
            const lng = coordsParts.length === 2 ? parseFloat(coordsParts[1].trim()) || 0 : 0;

            return {
                id: record.fields.id || `gen_${Math.random()}`,
                nombre: record.fields.nombre || 'Registro sin nombre',
                provincia: record.fields.provincia || 'Sin provincia',
                tipo: record.fields.tipo,
                lat, // Usamos la latitud parseada
                lng, // Usamos la longitud parseada
                descripcion: record.fields.descripcion || '',
                presupuestoInicial: record.fields.presupuestoInicial || 0,
                presupuestoFinal: record.fields.presupuestoFinal || 0,
                arquitecto: record.fields.arquitecto || 'Desconocido',
                añoInicio: record.fields.añoInicio || null,
                añoFin: record.fields.añoFin || null,
                puntuacion: record.fields.puntuacion || 0,
                imagenes: record.fields.imagen ? record.fields.imagen.map(img => img.url) : [],
                ubicacion: record.fields.ubicacion || '',
                estado: record.fields.estado || 'No especificado' // Añadimos el nuevo campo
            };
        });

        // Una vez cargados los datos, inicializamos la web
        poblarSelectorProvincias();
        poblarSelectorTipos();
        poblarSelectorEstado(); // Poblamos el nuevo selector
        cargarPuntos();

    } catch (error) {
        console.error("No se pudieron cargar los datos desde Airtable:", error);
        document.getElementById('lista-puntos').innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
    } finally {
        hideLoadingIndicator();
    }
}

const brickIcon = L.divIcon({
    html: '🧱',
    className: 'emoji-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30], // El punto del icono que corresponderá a la ubicación del marcador
    popupAnchor: [0, -35] // El punto desde donde se abrirá el popup, relativo al iconAnchor
});

// Icono para el marcador seleccionado
const selectedBrickIcon = L.divIcon({
    html: '🧱',
    className: 'emoji-icon selected-emoji-icon', // Clase especial para el estilo
    iconSize: [40, 40], // Un poco más grande para que destaque
    iconAnchor: [20, 40],
    popupAnchor: [0, -45]
});

function renderPuntuacion(huevos) {    
    return '🥚'.repeat(huevos);
}

function showLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'block';
}

function hideLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'none';
}

function cargarPuntos() {
    // Leer todos los valores de los filtros y ordenación desde el DOM
    const filtroProvincia = document.getElementById('provincia-select').value;
    const filtroTipo = document.getElementById('tipo-select').value;
    const filtroTexto = document.getElementById('search-input').value;
    const filtroPuntuacion = document.getElementById('puntuacion-select').value;
    const filtroEstado = document.getElementById('estado-select').value;
    const sortBy = document.getElementById('sort-by').value;
    const sortDirection = document.getElementById('sort-direction').value;

    document.getElementById('lista-puntos').innerHTML = '';
    marcadores.forEach(m => mapa.removeLayer(m));
    showLoadingIndicator();

    let puntosFiltrados = puntos;
    if (filtroProvincia !== 'todas') {

    puntosFiltrados = puntosFiltrados.filter(p => p.provincia === filtroProvincia);
    }
    if (filtroTipo !== 'todos') {
    puntosFiltrados = puntosFiltrados.filter(p => p.tipo === filtroTipo);
    }
    if (filtroTexto) {
        const textoBusqueda = filtroTexto.toLowerCase();
        puntosFiltrados = puntosFiltrados.filter(p => p.nombre.toLowerCase().includes(textoBusqueda) || p.descripcion.toLowerCase().includes(textoBusqueda));
    }

    if (filtroPuntuacion !== 'todos') {
        puntosFiltrados = puntosFiltrados.filter(p => p.puntuacion === parseInt(filtroPuntuacion));
    }

    if (filtroEstado !== 'todos') {
        puntosFiltrados = puntosFiltrados.filter(p => p.estado === filtroEstado);
    }

    // Apply sorting
    puntosFiltrados.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'nombre') {
            comparison = (a.nombre || '').localeCompare(b.nombre || '');
        } else if (sortBy === 'puntuacion') {
            comparison = (a.puntuacion || 0) - (b.puntuacion || 0); // Sort ascending initially
        } else if (sortBy === 'presupuestoFinal') {
            comparison = (a.presupuestoFinal || 0) - (b.presupuestoFinal || 0);
        } else if (sortBy === 'provincia') {
            comparison = (a.provincia || '').localeCompare(b.provincia || '');
        }

        // Adjust direction
        if (sortDirection === 'desc') {
            comparison = -comparison;
        }

        return comparison;
    });

    // Comprobamos si hay resultados ANTES de intentar renderizar nada
    if (puntosFiltrados.length === 0) {
        // Si no hay resultados, mostramos el mensaje socarrón
        document.getElementById('lista-puntos').innerHTML = `
            <div class="empty-state-message">
                <i class="bi bi-wind"></i>
                <p><strong>Vaya, parece que no hay nada por aquí.</strong></p>
                <p>O tu búsqueda es muy exquisita, o todavía no se ha construido la maravilla que buscas.</p>
                <p>¡Prueba con otros filtros!</p>
            </div>
        `;
    } else {
        // Si hay resultados, procedemos a renderizar la lista como antes
        puntosFiltrados.forEach((p, index) => {

        const sobrecoste = (p.presupuestoFinal > p.presupuestoInicial * 1.25);
        const desviacion = ((p.presupuestoFinal - p.presupuestoInicial) / p.presupuestoInicial) * 100;
        const estiloPresupuestoFinal = sobrecoste ? 'color: red; font-weight: bold;' : '';
        const textoDesviacion = sobrecoste ? ` (<em>+${desviacion.toFixed(0)}%</em>)` : '';

        // Crear el texto del periodo de obras de forma segura
        let textoObras = '';
        if (p.añoInicio) {
            const fin = p.añoFin ? p.añoFin : 'Actualidad';
            textoObras = `<strong>Obras:</strong> ${p.añoInicio} - ${fin}<br>`;
        }

        const popupContent = `
            <div class="popup-content">
                <strong>${p.nombre}</strong><br>
                ${p.ubicacion ? `<div class="popup-location-line"><strong>Ubicación:</strong> ${p.ubicacion}</div>` : ''}
                <div class="imagen-placeholder"><img src="${p.imagenes.length > 0 ? p.imagenes[0] : 'https://via.placeholder.com/300'}" alt="Imagen de ${p.nombre}" width="100%"></div>
                <div class="popup-descripcion">${p.descripcion}</div>
                <strong>Presupuesto inicial:</strong> €${p.presupuestoInicial.toLocaleString()}<br>
                <strong>Presupuesto final:</strong> <span style="${estiloPresupuestoFinal}">€${p.presupuestoFinal.toLocaleString()}</span>${textoDesviacion}<br>
                <strong>Arquitecto/Artista:</strong> ${p.arquitecto}<br>
                ${textoObras}
                <strong>Pormishuevismo:</strong> ${renderPuntuacion(p.puntuacion)}<br>
                <strong>Coordenadas:</strong> ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}<br>
            </div>
        `;
        const marker = L.marker([p.lat, p.lng], { icon: brickIcon }).addTo(mapa).bindPopup(popupContent, {
            className: 'custom-popup',
            // Añadimos un padding generoso para el autopaneo, especialmente en la parte superior.
            // Esto fuerza al mapa a desplazarse hacia abajo si es necesario para mostrar el popup completo.
            // Hacemos el padding vertical dinámico: más pequeño en móvil para no empujar el mapa demasiado abajo.
            autoPanPadding: isMobile ? L.point(50, 75) : L.point(50, 150)
        });
        marcadores.push(marker);

        const div = document.createElement('div');
        div.className = 'punto';
        div.id = `punto-${p.id}`;

        // Enlazamos el elemento de la lista con su marcador y viceversa
        div.marker = marker;
        marker.divElement = div;

        // Añadimos un retraso a la animación para crear el efecto escalonado
        div.style.animationDelay = `${index * 50}ms`; // 50ms de retraso entre cada card

        // Generar HTML para las miniaturas de las imágenes
        let thumbnailsHTML = '';
        if (p.imagenes && p.imagenes.length > 0) {
            const imageElements = p.imagenes.slice(0, 3).map(url => 
                `<img src="${url}" alt="Miniatura de ${p.nombre}" class="thumbnail-img">`
            ).join('');
            thumbnailsHTML = `<div class="thumbnails-container">${imageElements}</div>`;
        } else {
            thumbnailsHTML = '<div class="imagen-placeholder"><span>Sin imágenes</span></div>';
        }

        // Obtenemos la información del estado para mostrarla con icono y color
        const { texto, icono, claseCss } = getEstadoInfo(p.estado);

        div.innerHTML = `
            <div class="punto-cabecera">
                <div class="punto-titulo">
                    <strong>${p.nombre}</strong>
                    <div class="ubicacion-linea">
                        ${p.ubicacion ?
                            `<span>${p.ubicacion}</span> <span class="ubicacion-detalle">(${p.provincia})</span>` :
                            `<span>${p.provincia}</span>`
                        }
                    </div>
                </div>
                <i class="bi bi-chevron-down expand-icon"></i>
            </div>
            <div class="punto-detalles">
                ${thumbnailsHTML}
                <div class="datos-punto">
                    <strong><i class="bi bi-cash-coin"></i> Presupuesto inicial:</strong> €${p.presupuestoInicial.toLocaleString()}<br>
                    <strong><i class="bi bi-cash-coin"></i> Presupuesto final:</strong> <span style="${estiloPresupuestoFinal}">€${p.presupuestoFinal.toLocaleString()}</span>${textoDesviacion}<br>
                    <strong>Arquitecto:</strong> ${p.arquitecto}<br>
                    ${textoObras}
                    <div class="estado-linea ${claseCss}"><strong><i class="bi ${icono}"></i> Estado:</strong> ${texto}</div>
                    <strong>Pormishuevismo:</strong> ${renderPuntuacion(p.puntuacion)}<br>
                    <strong><i class="bi bi-geo-alt"></i> Coordenadas:</strong> ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}<br>
                </div>
            </div>
        `;

        div.addEventListener('click', () => {
            const seHaExpandido = togglePuntoEnLista(div);

            // Solo centramos el mapa y abrimos el popup cuando se expande, no al colapsar
            if (seHaExpandido) {
                mapa.flyTo([p.lat, p.lng], 15); // Inicia la animación de vuelo

                // Esperamos a que la animación 'flyTo' termine para abrir el popup.
                // Esto asegura que el cálculo de la posición del popup es correcto y evita que se corte.
                mapa.once('moveend', () => {
                    marker.openPopup();
                });

                // En móvil, oculta la sidebar al hacer clic en un punto para ver el mapa
                if (window.innerWidth <= 800) {
                    document.getElementById('sidebar').classList.remove('sidebar-visible');
                    // También reseteamos el estado del botón del menú
                    const toggleBtn = document.getElementById('sidebar-toggle');
                    if (toggleBtn) toggleBtn.classList.remove('open');
                }
            }
        });

        // Añadir listeners a las miniaturas para abrir el modal
        const thumbnailImages = div.querySelectorAll('.thumbnail-img');
        thumbnailImages.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que se dispare el evento click del contenedor .punto
                modalImg.src = p.imagenes[index]; // Usa la URL original de la imagen clickada
                modal.style.display = "flex"; // Cambiado a flex para que el centrado de CSS funcione
            });
        });

        div.addEventListener('mouseover', () => {
            if (marker._icon) { // Asegurarnos de que el icono del marcador existe
                marker._icon.classList.add('marker-highlight');
            }
        });

        div.addEventListener('mouseout', () => {
            if (marker._icon) {
                marker._icon.classList.remove('marker-highlight');
            }
        });

        marker.on('mouseover', () => {
            div.classList.add('punto-highlight');
        });

        marker.on('mouseout', () => {
            div.classList.remove('punto-highlight');
        });

        marker.on('click', () => {
            // Desliza la lista hasta el elemento
            marker.divElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            // Expande la ficha del proyecto en la lista
            togglePuntoEnLista(marker.divElement);
        });

        document.getElementById('lista-puntos').appendChild(div);
        });
    }

    hideLoadingIndicator();
    document.getElementById('conteo-puntos').textContent = puntosFiltrados.length;
}

function poblarSelectorProvincias() {
    const provinciasUnicas = [...new Set(puntos.map(p => p.provincia))];
    const select = document.getElementById('provincia-select');
    provinciasUnicas.sort().forEach(prov => {
    const opt = document.createElement('option');
    opt.value = prov;
    opt.textContent = prov;
    select.appendChild(opt);
    });
}

function poblarSelectorTipos() {
    const tiposUnicos = [...new Set(puntos.map(p => p.tipo).filter(t => t))]; // Filtra tipos nulos o vacíos
    const select = document.getElementById('tipo-select');
    tiposUnicos.sort().forEach(tipo => {
        const opt = document.createElement('option');
        opt.value = tipo;
        // Capitaliza la primera letra para una mejor presentación
        opt.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        select.appendChild(opt);
    });
}

function poblarSelectorEstado() {
    const estadosUnicos = [...new Set(puntos.map(p => p.estado).filter(e => e && e !== 'No especificado'))];
    const select = document.getElementById('estado-select');
    estadosUnicos.sort().forEach(estado => {
        const opt = document.createElement('option');
        opt.value = estado;
        opt.textContent = estado;
        select.appendChild(opt);
    });
}

/**
 * Devuelve el texto, icono y clase CSS para un estado determinado.
 * @param {string} estado - El estado de la obra.
 * @returns {{texto: string, icono: string, claseCss: string}}
 */
function getEstadoInfo(estado) {
    switch (estado) {
        case 'En construccion':
            return { texto: 'En construcción', icono: 'bi-cone-striped', claseCss: 'estado-en-construccion' };
        case 'Finalizado':
            return { texto: 'Finalizado', icono: 'bi-check-circle-fill', claseCss: 'estado-finalizado' };
        case 'Paralizado':
            return { texto: 'Paralizado', icono: 'bi-pause-circle-fill', claseCss: 'estado-paralizado' };
        case 'No especificado':
            return { texto: 'No especificado', icono: 'bi-question-circle', claseCss: 'estado-no-especificado' };
        default:
            // Si hay algún otro estado no contemplado, lo mostramos tal cual
            return { texto: estado, icono: 'bi-question-circle', claseCss: 'estado-no-especificado' };
    }
}

/**
 * Expande o colapsa un elemento de la lista de proyectos.
 * Se encarga de cerrar otros elementos que estuvieran abiertos.
 * @param {HTMLElement} itemDiv - El elemento div del proyecto en la lista.
 * @returns {boolean} - Devuelve `true` si el elemento se ha expandido, `false` si se ha colapsado.
 */
function togglePuntoEnLista(itemDiv) {
    const isAlreadyActive = itemDiv.classList.contains('expandido');
    const marker = itemDiv.marker;

    // Primero, reseteamos cualquier elemento que estuviera activo
    resetActiveElements();

    // Si el elemento que hemos pulsado no era el que estaba activo, lo expandimos.
    // Si era el activo, el reset anterior ya lo ha colapsado y no hacemos nada más.
    if (!isAlreadyActive && marker) {
        itemDiv.classList.add('expandido');
        marker.setIcon(selectedBrickIcon);
        activeMarker = marker; // Guardamos la referencia al marcador activo
        return true; // Indicamos que se ha expandido
    }

    return false; // Indicamos que se ha colapsado (o no ha cambiado)
}

/**
 * Resetea el estado de los elementos activos en la UI.
 * Colapsa cualquier elemento expandido, quita resaltados y cierra popups del mapa.
 */
function resetActiveElements() {
    // Si hay un marcador activo, le devolvemos su icono original
    if (activeMarker) {
        activeMarker.setIcon(brickIcon);
        activeMarker = null;
    }

    // Buscar y colapsar cualquier elemento expandido en la lista
    const expandedItem = document.querySelector('.punto.expandido');
    if (expandedItem) {
        expandedItem.classList.remove('expandido');
    }

    // Quitar el resaltado de cualquier elemento en la lista
    const highlightedItem = document.querySelector('.punto.punto-highlight');
    if (highlightedItem) {
        highlightedItem.classList.remove('punto-highlight');
    }

    // Cerrar cualquier popup que esté abierto en el mapa
    mapa.closePopup();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos del Modal
    modal = document.getElementById("image-modal");
    modalImg = document.getElementById("modal-image");
    closeBtn = document.querySelector("#image-modal .close");
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    // Configuración de capas del mapa
    const mapLayers = {
        "Predeterminado": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }),
        "Calles": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }),
        "Satélite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri', maxZoom: 19 })
    };

    const mapLayerSelect = document.getElementById("map-layer-select");
    for (const layerName in mapLayers) {
        const option = document.createElement("option");
        option.value = layerName;
        option.text = layerName;
        mapLayerSelect.appendChild(option);    
    }

    // Establecer capa por defecto
    mapLayers["Satélite"].addTo(mapa);
    mapLayerSelect.value = "Satélite";

    // --- Event Listeners ---

    // Listener para el botón de menú en móvil
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic se propague al mapa
            sidebar.classList.toggle('sidebar-visible');
            toggleBtn.classList.toggle('open'); // Anima el icono
        });
    }

    // Listener para el botón de "Volver Arriba"
    if (sidebar && backToTopBtn) {
        // Mostrar/ocultar el botón según la posición del scroll en la sidebar
        sidebar.addEventListener('scroll', () => {
            if (sidebar.scrollTop > 300) { // Muestra el botón después de 300px de scroll
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Hacer scroll suave hacia arriba al hacer clic
        backToTopBtn.addEventListener('click', () => {
            sidebar.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Cierra la sidebar si se hace clic en el mapa (útil en móvil)
    // y deselecciona/colapsa cualquier punto activo.
    mapa.on('click', () => {
        sidebar.classList.remove('sidebar-visible');
        if (toggleBtn) {
            toggleBtn.classList.remove('open'); // Resetea el icono del menú
        }
        resetActiveElements();
    });

    // Lógica para mostrar un indicador de scroll en los popups (fade out)
    mapa.on('popupopen', (e) => {
        const popup = e.popup;
        // El contenido real que se desplaza es .leaflet-popup-content
        const contentElement = popup.getElement().querySelector('.leaflet-popup-content');
        // El degradado se aplica al wrapper para que se posicione correctamente
        const wrapper = popup.getElement().querySelector('.leaflet-popup-content-wrapper');

        if (!contentElement || !wrapper) return;

        const checkScroll = () => {
            // Una pequeña tolerancia para evitar problemas con píxeles fraccionados
            const tolerance = 2;
            const isAtBottom = contentElement.scrollHeight - contentElement.scrollTop <= contentElement.clientHeight + tolerance;
            const isScrollable = contentElement.scrollHeight > contentElement.clientHeight;

            if (isScrollable && !isAtBottom) {
                wrapper.classList.add('has-scroll');
            } else {
                wrapper.classList.remove('has-scroll');
            }
        };

        // Lo comprobamos al abrir el popup (con un pequeño retardo para que se renderice)
        setTimeout(checkScroll, 100);

        // Y también cada vez que el usuario hace scroll dentro del popup
        contentElement.addEventListener('scroll', checkScroll);

        // Importante: limpiamos el listener cuando el popup se cierra para evitar fugas de memoria
        popup.on('remove', () => {
            contentElement.removeEventListener('scroll', checkScroll);
        });
    });

    // Listeners para cerrar el modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Cierra el modal si se hace clic en el fondo oscuro
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Unificar todos los listeners para que llamen a la misma función
    document.getElementById('provincia-select').addEventListener('change', cargarPuntos);
    document.getElementById('tipo-select').addEventListener('change', cargarPuntos);
    document.getElementById('puntuacion-select').addEventListener('change', cargarPuntos);
    document.getElementById('estado-select').addEventListener('change', cargarPuntos);
    document.getElementById('search-button').addEventListener('click', cargarPuntos);
    document.getElementById('sort-by').addEventListener('change', cargarPuntos);
    document.getElementById('sort-direction').addEventListener('change', cargarPuntos);

    document.getElementById('search-input').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            cargarPuntos();
        }
    });

    mapLayerSelect.addEventListener("change", function() {
        const selectedLayerName = this.value;
        for (const layerName in mapLayers) {
            if (layerName === selectedLayerName) {
                mapLayers[layerName].addTo(mapa);
            } else {
                mapLayers[layerName].remove();
            }
        }
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('provincia-select').value = 'todas';
        document.getElementById('tipo-select').value = 'todos';
        document.getElementById('puntuacion-select').value = 'todos';
        document.getElementById('estado-select').value = 'todos';
        document.getElementById('search-input').value = '';
        cargarPuntos();
    });

    // Carga inicial de datos
    await cargarDatosDesdeAirtable(); 

});