// Función de ayuda para escapar caracteres HTML y prevenir ataques XSS
function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    // Si no es un string (ej. un número), lo convertimos antes de escapar
    const str = String(unsafe);
    return str
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Función para generar el HTML de la página de detalle. Es más robusta y fácil de mantener.
function generateProjectPageHTML(project, isLocalDev = false) {
    /**
     * Genera una URL optimizada para una imagen usando el servicio de Vercel.
     * @param {string} originalUrl - La URL de la imagen original.
     * @param {number} width - El ancho deseado en píxeles.
     * @param {number} quality - La calidad de la imagen (1-100).
     * @returns {string} - La URL de la imagen optimizada.
     */
    const getOptimizedImageUrl = (originalUrl, width, quality = 75) => {
        // Detect local dev by host header (Vercel dev sets host to localhost)
        const isLocalDev = process.env.VERCEL_ENV === 'development' ||
            (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
        if (isLocalDev || !originalUrl || !/^https?:\/\//.test(originalUrl)) {
            return originalUrl;
        }
        return `/_vercel/image?url=${encodeURIComponent(originalUrl)}&w=${width}&q=${quality}`;
    };
    // --- Helper functions ---
    const formatCurrency = (num) => num ? `€${num.toLocaleString('es-ES')}` : 'No especificado';
    
    // Creamos un objeto "seguro" para evitar XSS, escapando todos los campos.
    const p_safe = {};
    for (const key in project.fields) {
        // Los arrays (como las imágenes) no se escapan, sus URLs se escaparán al usarlas.
        if (Array.isArray(project.fields[key])) {
            p_safe[key] = project.fields[key];
        } else {
            p_safe[key] = escapeHtml(project.fields[key]);
        }
    }
    const p = p_safe;

    const sobrecoste = project.fields.presupuestoFinal > project.fields.presupuestoInicial;
    const desviacion = project.fields.presupuestoInicial > 0 ? ((project.fields.presupuestoFinal - project.fields.presupuestoInicial) / project.fields.presupuestoInicial) * 100 : 0;

    const title = escapeHtml(`${p.nombre || 'Proyecto'} - Mapa del Pormishuevismo`);
    const description = escapeHtml((p.descripcion || `Ficha del proyecto ${p.nombre || ''}`).substring(0, 160));
    const imageUrl = p.imagen && p.imagen.length > 0
        ? escapeHtml(p.imagen[0].url)
        : 'https://pormishuevismo.vercel.app/assets/images/pormishuevismo-social-share.png';

    // Generamos el HTML de la página dinámicamente
    let textoObras = 'No especificado';
    if (p.añoInicio) {
        textoObras = `${p.añoInicio} - ${p.añoFin || 'Actualidad'}`;
    }

    const disclaimerPresupuesto = `<span class="cifra-estimada-info" title="Estas cifras son estimaciones, ya que la transparencia en las cuentas públicas a veces brilla por su ausencia."><i class="bi bi-info-circle"></i></span>`;

    const shareUrl = `https://pormishuevismo.vercel.app/proyecto/${project.id}`;
    const shareHtml = `
  <div class="share-container">
    <span>Compartir:</span>
    <div class="share-buttons">
      <a class="share-btn twitter" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(p_safe.nombre)}" target="_blank" rel="noopener" aria-label="Compartir en X"><i class="bi bi-twitter-x"></i></a>
      <a class="share-btn facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" aria-label="Compartir en Facebook"><i class="bi bi-facebook"></i></a>
      <a class="share-btn whatsapp" href="https://wa.me/?text=${encodeURIComponent(p_safe.nombre + ' ' + shareUrl)}" target="_blank" rel="noopener" aria-label="Compartir en WhatsApp"><i class="bi bi-whatsapp"></i></a>
      <button id="copy-link-btn" class="share-btn copy-link" aria-label="Copiar enlace">
  <i class="bi bi-link-45deg"></i>
</button>
    </div>
  </div>
`;

    const imagenesHtml = project.imagenes && project.imagenes.length > 0
      ? project.imagenes.map(url =>
          `<img src="${getOptimizedImageUrl(url, 800)}" alt="Imagen de ${escapeHtml(project.nombre)}" loading="lazy" width="400">`
        ).join('')
      : '<div class="imagen-placeholder"><span>Sin imágenes</span></div>';

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <meta name="description" content="${description}...">
            
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}...">
            <meta property="og:image" content="${imageUrl}">
            <meta property="og:url" content="https://pormishuevismo.vercel.app/proyecto/${project.id}">
            <meta property="og:type" content="article">

            <link rel="icon" href="/assets/images/favicon.png" type="image/png">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header class="titulo-principal-ficha">
                <div class="casco">
                    <img src="/assets/images/casco.png" alt="Icono de casco de obra">
                </div>
                <div class="titulo-texto">
                    <h1>PORMISHUEVISMO</h1>
                    <span>El Legado Arquitectónico</span>
                </div>
                <a href="/" class="volver-al-mapa-btn" title="Volver al mapa principal">
                    <i class="bi bi-arrow-left-circle"></i>
                    <span>Volver al Mapa</span>
                </a>
            </header>

            <main class="project-detail-container">
                <h1 class="project-title">${p.nombre}</h1>
                <p class="project-location">${p.ubicacion || 'Ubicación no especificada'}, ${p.provincia || ''}</p>

                <div class="project-main-content">
                    <div class="project-description">
                        <h2>Descripción</h2>
                        <p>${(p.descripcion || 'No hay descripción disponible.').replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="project-info-sidebar">
                        <h2>Detalles</h2>
                        <div class="info-grid">
                            <div class="info-item"><strong><i class="bi bi-building"></i> Estado</strong> ${p.estado || 'No especificado'}</div>
                            <div class="info-item"><strong><i class="bi bi-person"></i> Arquitecto/Artista</strong> ${p.arquitecto || 'Desconocido'}</div>
                            <div class="info-item"><strong><i class="bi bi-calendar-range"></i> Obras</strong> ${textoObras}</div>
                            <div class="info-item"><strong><i class="bi bi-egg-fried"></i> Puntuación</strong> ${'🥚'.repeat(project.fields.puntuacion || 0) || 'Sin puntuar'}</div>
                            <div class="info-item budget">
                                <strong><i class="bi bi-cash-coin"></i> Presupuesto Inicial${disclaimerPresupuesto}</strong>
                                <span>${formatCurrency(project.fields.presupuestoInicial)}</span>
                            </div>
                            <div class="info-item budget ${sobrecoste ? 'over-budget' : ''}">
                                <strong><i class="bi bi-graph-up-arrow"></i> Presupuesto Final${disclaimerPresupuesto}</strong>
                                <span>${formatCurrency(project.fields.presupuestoFinal)}</span>
                                ${sobrecoste ? `<small class="deviation">(+${desviacion.toFixed(0)}%)</small>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="project-gallery">
                    <h2>Galería de Imágenes</h2>
                    <div class="image-grid">
                        ${p.imagen ? p.imagen.map(img => `<a href="${escapeHtml(img.url)}" target="_blank" rel="noopener noreferrer"><img src="${getOptimizedImageUrl(img.url, 400)}" alt="Imagen de ${p.nombre}" loading="lazy" width="250" height="200"></a>`).join('') : '<p>No hay imágenes disponibles.</p>'}
                    </div>
                </div>

                ${shareHtml}
            </main>

            <footer>
                <a href="https://mendiak.github.io/portfolio/" target="_blank" rel="noopener noreferrer" title="Portfolio de Mikel Aramendia"><i class="bi bi-code-slash" aria-hidden="true"></i> Una web de Mikel Aramendia</a>
                <a href="https://github.com/Mendiak/pormishuevismo" target="_blank" rel="noopener noreferrer" title="Ver el código fuente en GitHub"><i class="bi bi-github" aria-hidden="true"></i> Ver en GitHub</a>
                <a href="https://www.oficinaperiferia.com/" target="_blank" rel="noopener noreferrer" title="Web de Erik Harley"><i class="bi bi-lightbulb" aria-hidden="true"></i> Inspirado por Erik Harley</a>
                <a href="https://airtable.com/appKVW43s8ln8paHH/pagH805tE1RXU8V9y/form" target="_blank" rel="noopener noreferrer" title="Añade un nuevo punto al mapa" class="footer-cta"><i class="bi bi-plus-circle" aria-hidden="true"></i> Añadir un proyecto</a>
            </footer>
            <script>
  document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('copy-link-btn');
    if(btn) {
      btn.addEventListener('click', function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
          const icon = btn.querySelector('i');
          if(icon) icon.className = 'bi bi-clipboard-check';
          setTimeout(() => {
            if(icon) icon.className = 'bi bi-link-45deg';
          }, 1200);
        });
      });
    }
  });
</script>
        </body>
        </html>
    `;
}

export default async function handler(request, response) {
    // Detectamos si estamos corriendo en el entorno de desarrollo de Vercel
    const isLocalDev = process.env.VERCEL_ENV === 'development';
    const { id } = request.query;
    const { AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID, AIRTABLE_API_TOKEN } = process.env;

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID || !AIRTABLE_API_TOKEN) {
        return response.status(500).json({ error: 'Error de configuración del servidor.' });
    }
    
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${id}`;
    
    try {
        const airtableResponse = await fetch(airtableUrl, {
            headers: { 'Authorization': `Bearer ${AIRTABLE_API_TOKEN}` },
        });

        if (airtableResponse.status === 404) {
            return response.status(404).setHeader('Content-Type', 'text/html').send('<h1>404 - Proyecto no encontrado</h1><p>El proyecto que buscas no existe o ha sido eliminado.</p><a href="/">Volver al mapa</a>');
        }

        if (!airtableResponse.ok) {
            const errorBody = await airtableResponse.text();
            console.error("Error from Airtable API:", errorBody);
            throw new Error(`Error desde Airtable: ${airtableResponse.statusText}. Detalles: ${errorBody}`);
        }

        const project = await airtableResponse.json();
        
        const html = generateProjectPageHTML(project, isLocalDev);

        // Cache de 1h, y si está caducada, se sirve la versión antigua hasta 1 semana mientras se revalida en segundo plano.
        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=604800');
        return response.status(200).setHeader('Content-Type', 'text/html').send(html);

    } catch (error) {
        console.error(error);
        return response.status(500).setHeader('Content-Type', 'text/html').send('<h1>500 - Error del servidor</h1><p>No se pudo generar la página del proyecto.</p>');
    }
}