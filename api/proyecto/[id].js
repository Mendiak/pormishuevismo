// Función de ayuda para escapar caracteres HTML y prevenir ataques XSS
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Función para generar el HTML de la página de detalle. Es más robusta y fácil de mantener.
function generateProjectPageHTML(project) {
    const p = project.fields;
    const title = escapeHtml(`${p.nombre || 'Proyecto'} - Mapa del Pormishuevismo`);
    const description = escapeHtml((p.descripcion || `Ficha del proyecto ${p.nombre || ''}`).substring(0, 160));
    const imageUrl = p.imagen && p.imagen.length > 0
        ? p.imagen[0].url
        : 'https://pormishuevismo.vercel.app/assets/images/pormishuevismo-social-share.png';

    // Generamos el HTML de la página dinámicamente
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <meta name="description" content="${description}...">
            
            <!-- Open Graph / Social Media Meta Tags -->
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}...">
            <meta property="og:image" content="${imageUrl}">
            <meta property="og:url" content="https://pormishuevismo.vercel.app/proyecto/${project.id}">
            <meta property="og:type" content="website">

            <link rel="icon" href="/assets/images/favicon.png" type="image/png">
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Roboto', sans-serif; line-height: 1.6; margin: 0; background-color: #f4f7f6; color: #333; }
                .container { max-width: 800px; margin: 2rem auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #111; }
                img { max-width: 100%; height: auto; border-radius: 4px; margin-top: 1rem; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
                .info-item { background: #f9f9f9; padding: 1rem; border-radius: 4px; }
                .info-item strong { display: block; margin-bottom: 0.25rem; color: #555; }
                .image-gallery img { margin-bottom: 1rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${escapeHtml(p.nombre)}</h1>
                <p>${escapeHtml(p.descripcion)}</p>
                
                <div class="info-grid">
                    <div class="info-item"><strong>Ubicación</strong> ${escapeHtml(p.ubicacion || 'No especificada')}, ${escapeHtml(p.provincia || '')}</div>
                    <div class="info-item"><strong>Estado</strong> ${escapeHtml(p.estado || 'No especificado')}</div>
                    <div class="info-item"><strong>Arquitecto/Artista</strong> ${escapeHtml(p.arquitecto || 'Desconocido')}</div>
                    <div class="info-item"><strong>Puntuación</strong> ${'🥚'.repeat(p.puntuacion || 0) || 'Sin puntuar'}</div>
                </div>

                <div class="image-gallery">
                    ${p.imagen ? p.imagen.map(img => `<img src="${escapeHtml(img.url)}" alt="Imagen de ${escapeHtml(p.nombre)}">`).join('') : '<p>No hay imágenes disponibles.</p>'}
                </div>

                <hr style="margin: 2rem 0;">
                <a href="/">← Volver al mapa</a>
            </div>
        </body>
        </html>
    `;
}

export default async function handler(request, response) {
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
            return response.status(404).send('<h1>404 - Proyecto no encontrado</h1><p>El proyecto que buscas no existe o ha sido eliminado.</p><a href="/">Volver al mapa</a>');
        }

        if (!airtableResponse.ok) {
            const errorBody = await airtableResponse.text();
            console.error("Error from Airtable API:", errorBody);
            throw new Error(`Error desde Airtable: ${airtableResponse.statusText}`);
        }

        const project = await airtableResponse.json();
        
        const html = generateProjectPageHTML(project);

        response.setHeader('Content-Type', 'text/html');
        // Cache de 1h, y si está caducada, se sirve la versión antigua hasta 1 semana mientras se revalida en segundo plano.
        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=604800');
        return response.status(200).send(html);

    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'No se pudo generar la página del proyecto.' });
    }
}