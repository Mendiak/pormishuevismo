import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Función para escapar caracteres HTML y evitar problemas de inyección
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

export default async function handler(request, response) {
    // 1. Obtenemos el ID del proyecto desde la URL
    const { id } = request.query;

    // 2. Hacemos una llamada a la API de Airtable para obtener los datos de ESE proyecto
    // ¡Asegúrate de que tu API Key y Base ID están como variables de entorno en Vercel!
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}/${id}`;
    
    let projectData;
    try {
        const airtableRes = await fetch(airtableUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
            }
        });

        if (!airtableRes.ok) {
            // Si el proyecto no se encuentra, Airtable devuelve un 404
            return response.status(404).send('Proyecto no encontrado');
        }
        
        const record = await airtableRes.json();
        projectData = record.fields;

    } catch (error) {
        console.error(error);
        return response.status(500).send('Error al obtener los datos del proyecto');
    }

    // 3. Leemos nuestra plantilla HTML principal
    // Vercel necesita que resolvamos la ruta de esta manera para encontrar el archivo en el entorno serverless
    const htmlTemplatePath = path.join(process.cwd(), 'index.html');
    let html = fs.readFileSync(htmlTemplatePath, 'utf-8');

    // 4. Reemplazamos los meta tags con la información específica del proyecto
    const title = escapeHtml(`${projectData.nombre} - Mapa del Pormishuevismo`);
    const description = escapeHtml(projectData.descripcion ? projectData.descripcion.substring(0, 155) : `Ficha del proyecto de pormishuevismo: ${projectData.nombre}.`);
    const imageUrl = projectData.imagen && projectData.imagen.length > 0 ? projectData.imagen[0].url : 'https://pormishuevismo.vercel.app/assets/images/pormishuevismo-social-share.png';

    html = html.replace(
        /<title>.*<\/title>/,
        `<title>${title}</title>`
    );
    html = html.replace(
        /<meta name="description" content=".*">/,
        `<meta name="description" content="${description}">`
    );
    html = html.replace(
        /<meta property="og:title" content=".*">/,
        `<meta property="og:title" content="${title}">`
    );
    html = html.replace(
        /<meta property="og:description" content=".*">/,
        `<meta property="og:description" content="${description}">`
    );
    html = html.replace(
        /<meta property="og:image" content=".*">/,
        `<meta property="og:image" content="${imageUrl}">`
    );

    // 5. Enviamos el HTML modificado como respuesta
    response.setHeader('Content-Type', 'text/html');
    return response.status(200).send(html);
}
