const puntos = [
    {
    id: 1,
    nombre: "Puente de Zubizuri",
    provincia: "Bilbao",
    tipo: "puente",
    lat: 40.3,
    lng: -3.7,
    descripcion: "Callejeros asfaltados pero sin casas construidas.",
    presupuestoInicial: 2000000,
    presupuestoFinal: 5500000,
    arquitecto: "Estudio XYZ",
    añoInicio: 2006,
    añoFin: 2011,
    puntuacion: 4,
    imagen: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjjXVgnHHQcukUz1ekWR9DP0mlOfgw46yYHXU5bSD8vHlkyaKXgnEPxVHcpps5d_r7KeJJutlvoqQRIlikdQ0AQm4uQU5svqBykZxDvePNLCA4lCZja4xggE6Y4b8DNYUVQy-3ZD1Pe4mY/s1600/Puente+Zubiri+cristal.jpg",
    enlacePrensa: "https://www.ejemplo.com/noticia1"
    },
    {
    id: 2,
    nombre: "Urbanizacion de Valdecañas",
    provincia: "Extremadura",
    tipo: "pabellon",
    lat: 39.5,
    lng: -0.4,
    descripcion: "Piscina municipal en una zona sin carreteras.",
    presupuestoInicial: 800000,
    presupuestoFinal: 1400000,
    arquitecto: "Arquitectos del Levante",
    añoInicio: 2010,
    añoFin: 2013,
    puntuacion: 5,
    imagen: "https://www.eldebate.com/files/article_social/files/fp/uploads/2022/11/14/63728716e91b0.r_d.675-195-0.jpeg",
    enlacePrensa: "https://www.ejemplo.com/noticia2"
    },
    {
    id: 3,
    nombre: "Polígono sin empresas",
    provincia: "Soria",
    tipo: "urbanizacion",
    lat: 41.7,
    lng: -2.5,
    descripcion: "Naves industriales construidas, pero sin actividad ni servicios.",
    presupuestoInicial: 1200000,
    presupuestoFinal: 1200000,
    arquitecto: "Ingeniería Castella",
    añoInicio: 2008,
    añoFin: 2009,
    puntuacion: 3,
    imagen: "https://images.ecestaticos.com/Nh8DxCrKNTpIXVaHJw2fjf6THF0=/311x0:2169x1393/1200x899/filters:fill(white):format(jpg)/f.elconfidencial.com%2Foriginal%2F49f%2Fa85%2F39d%2F49fa8539d58cdb05273999b7c7d3e357.jpg",
    enlacePrensa: "https://www.ejemplo.com/noticia3",
    ubicacion: "Cerca del pueblo de Medinaceli"
    }
];

const mapa = L.map('map').setView([40.2, -3.5], 6);

let modal, modalImg, closeBtn;

document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    modal = document.getElementById("image-modal");
    modalImg = document.getElementById("modal-image");
    closeBtn = document.querySelector("#image-modal .close");

const mapLayers = {
    "Predeterminado": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }),
    "Calles": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }),
    "Satélite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    })
};

const mapLayerSelect = document.getElementById("map-layer-select");
let defaultLayer;
for (const layerName in mapLayers) {
    const option = document.createElement("option");
    option.value = layerName;
    option.text = layerName;
    mapLayerSelect.appendChild(option);    
}

defaultLayer = mapLayers["Satélite"];
defaultLayer.addTo(mapa);
mapLayerSelect.value = "Satélite";

const brickIcon = L.divIcon({
    html: '🧱',
    className: 'emoji-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30], // El punto del icono que corresponderá a la ubicación del marcador
    popupAnchor: [0, -35] // El punto desde donde se abrirá el popup, relativo al iconAnchor
});

const marcadores = [];

function renderPuntuacion(huevos) {    
    return '🥚'.repeat(huevos);
}

function showLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'block';
}

function hideLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'none';
}

function cargarPuntos(filtroProvincia = 'todas', filtroTipo = 'todos', filtroTexto = '') {
    document.getElementById('lista-puntos').innerHTML = '';
    const sortBy = document.getElementById('sort-by').value; // Get the selected sorting criteria
    const sortDirection = document.getElementById('sort-direction').value; // Get the selected sorting direction

    marcadores.forEach(m => mapa.removeLayer(m));

    const filtroPuntuacion = document.getElementById('puntuacion-select').value;
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

    // Apply sorting
    puntosFiltrados.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'nombre') {
            comparison = a.nombre.localeCompare(b.nombre);
        } else if (sortBy === 'puntuacion') {
            comparison = a.puntuacion - b.puntuacion; // Sort ascending initially
        } else if (sortBy === 'presupuestoFinal') {
            comparison = a.presupuestoFinal - b.presupuestoFinal;
        } else if (sortBy === 'provincia') {
            comparison = a.provincia.localeCompare(b.provincia);
        }

        // Adjust direction
        if (sortDirection === 'desc') {
            comparison = -comparison;
        }

        return comparison;
    });
    puntosFiltrados.forEach(p => {

    const sobrecoste = (p.presupuestoFinal > p.presupuestoInicial * 1.25);
    const desviacion = ((p.presupuestoFinal - p.presupuestoInicial) / p.presupuestoInicial) * 100;
    const estiloPresupuestoFinal = sobrecoste ? 'color: red; font-weight: bold;' : '';
    const textoDesviacion = sobrecoste ? ` (<em>+${desviacion.toFixed(0)}%</em>)` : '';

    const popupContent = `
        <div class="popup-content">
            <strong>${p.nombre}</strong><br>
            ${p.descripcion}<br><br>
            <div class="imagen-placeholder"><img src="${p.imagen}" alt="Imagen de ${p.nombre}" width="100%"></div><br>
            <strong>Presupuesto inicial:</strong> €${p.presupuestoInicial.toLocaleString()}<br>
            <strong>Presupuesto final:</strong> <span style="${estiloPresupuestoFinal}">€${p.presupuestoFinal.toLocaleString()}</span>${textoDesviacion}<br>
            <strong>Arquitecto:</strong> ${p.arquitecto}<br>
            <strong>Obras:</strong> ${p.añoInicio} - ${p.añoFin}<br>
            <strong>Pormishuevismo:</strong> ${renderPuntuacion(p.puntuacion)}<br>
            <strong>Coordenadas:</strong> ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}<br>
            ${p.ubicacion ? `<strong>Ubicación:</strong> ${p.ubicacion}<br>` : ''}
            <a href="${p.enlacePrensa}" target="_blank"><i class="bi bi-link-45deg"></i> Ver en prensa</a>
        </div>
    `;
    const marker = L.marker([p.lat, p.lng], { icon: brickIcon }).addTo(mapa).bindPopup(popupContent);
    marcadores.push(marker);

    const div = document.createElement('div');
    div.className = 'punto';
    div.id = `punto-${p.id}`;

    // Icons based on the type of location
    div.innerHTML = `        
        <strong>${p.nombre}</strong><br>
        <div class="imagen-placeholder"><img src="${p.imagen}" alt="Imagen de ${p.nombre}" width="100%"></div>
        <div class="datos-punto">
            <strong><i class="bi bi-cash-coin"></i> Presupuesto inicial:</strong> €${p.presupuestoInicial.toLocaleString()}<br>
            <strong><i class="bi bi-cash-coin"></i> Presupuesto final:</strong> <span style="${estiloPresupuestoFinal}">€${p.presupuestoFinal.toLocaleString()}</span>${textoDesviacion}<br>
            <strong>Arquitecto:</strong> ${p.arquitecto}<br>
            <strong>Provincia:</strong> ${p.provincia}<br>
            <strong>Obras:</strong> ${p.añoInicio} - ${p.añoFin}<br>
            <strong>Pormishuevismo:</strong> ${renderPuntuacion(p.puntuacion)}<br>
            <strong><i class="bi bi-geo-alt"></i> Coordenadas:</strong> ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}<br>
            ${p.ubicacion ? `<strong>Ubicación:</strong> ${p.ubicacion}<br>` : ''}
            <a href="${p.enlacePrensa}" target="_blank"><i class="bi bi-newspaper"></i> Ver en prensa</a>            
        </div>
    `;

    div.addEventListener('click', () => {
        mapa.setView([p.lat, p.lng], 15);
        marker.openPopup();
    });

    const imagen = div.querySelector('.imagen-placeholder img');
    imagen.addEventListener('click', () => {
        modalImg.src = p.imagen;
        modal.style.display = "block";
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
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    marker.on('mouseout', () => {
        div.classList.remove('punto-highlight');
    });

    document.getElementById('lista-puntos').appendChild(div);
    });

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

function performSearch() {
    cargarPuntos(
        document.getElementById('provincia-select').value,
        document.getElementById('tipo-select').value,
        document.getElementById('search-input').value
    );
}

document.getElementById('provincia-select').addEventListener('change', e => {
    performSearch();
});
document.getElementById('tipo-select').addEventListener('change', e => {
    cargarPuntos(document.getElementById('provincia-select').value, e.target.value, document.getElementById('search-input').value);
});

document.getElementById('search-button').addEventListener('click', () => {
    cargarPuntos(document.getElementById('provincia-select').value, document.getElementById('tipo-select').value, document.getElementById('search-input').value);
});

document.getElementById('search-input').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        cargarPuntos(document.getElementById('provincia-select').value, document.getElementById('tipo-select').value, document.getElementById('search-input').value);
    }
});

poblarSelectorProvincias();
cargarPuntos();
document.getElementById('puntuacion-select').addEventListener('change', e => {
    cargarPuntos(document.getElementById('provincia-select').value, document.getElementById('tipo-select').value, document.getElementById('search-input').value);
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
    document.getElementById('search-input').value = '';
    cargarPuntos();
});

document.getElementById('sort-by').addEventListener('change', () => {
    cargarPuntos(document.getElementById('provincia-select').value, document.getElementById('tipo-select').value, document.getElementById('search-input').value);
});

});