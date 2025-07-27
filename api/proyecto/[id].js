// Este es un archivo nuevo: api/proyecto/[id].js
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Función de ayuda para escapar caracteres HTML y prevenir ataques XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

export default async function handler(request, response) {
    // 1. Obtenemos el ID del proyecto desde la URL (ej: /proyecto/rec123 -> id = 'rec123')
    const { id } = request.query;

    // 2. Obtenemos las credenciales de Airtable desde las Variables de Entorno de Vercel
    const { AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID, AIRTABLE_API_TOKEN } = process.env;

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID || !AIRTABLE_API_TOKEN) {
        return response.status(500).send('Error de configuración del servidor: las credenciales de Airtable no están configuradas.');
    }

    // 3. Hacemos una llamada a la API de Airtable para obtener los datos de ESE proyecto
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${id}`;
    
    let projectData;
    try {
        const airtableRes = await fetch(airtableUrl, {
            headers: { 'Authorization': `Bearer ${AIRTABLE_API_TOKEN}` }
        });

        if (airtableRes.status === 404) {
            return response.status(404).send('Proyecto no encontrado');
        }
        if (!airtableRes.ok) {
            const errorBody = await airtableRes.text();
            console.error('Error de la API de Airtable:', errorBody);
            throw new Error(`La API de Airtable respondió con el estado ${airtableRes.status}`);
        }
        
        const record = await airtableRes.json();
        projectData = record.fields;

    } catch (error) {
        console.error(error);
        return response.status(500).send('Error al obtener los datos del proyecto desde Airtable.');
    }

    // 4. Leemos el archivo index.html para usarlo como plantilla
    const htmlTemplatePath = path.join(process.cwd(), 'index.html');
    let html;
    try {
        html = fs.readFileSync(htmlTemplatePath, 'utf-8');
    } catch (fsError) {
        console.error("No se pudo leer la plantilla index.html:", fsError);
        return response.status(500).send('Error del servidor: no se pudo cargar la plantilla de la página.');
    }

    // 5. Reemplazamos las metaetiquetas genéricas con los datos específicos del proyecto para el SEO
    const title = escapeHtml(`${projectData.nombre} - Ficha de Pormishuevismo`);
    const description = escapeHtml(projectData.descripcion ? projectData.descripcion.substring(0, 160) : `Ficha del proyecto de pormishuevismo: ${projectData.nombre}.`);
    const imageUrl = projectData.imagen && projectData.imagen.length > 0 
        ? projectData.imagen[0].url 
        : 'https://pormishuevismo.vercel.app/assets/images/pormishuevismo-social-share.png';

    html = html
        .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
        .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${description}">`)
        .replace(/<meta property="og:title" content=".*">/, `<meta property="og:title" content="${title}">`)
        .replace(/<meta property="og:description" content=".*">/, `<meta property="og:description" content="${description}">`)
        .replace(/<meta property="og:image" content=".*">/, `<meta property="og:image" content="${imageUrl}">`);

    // 6. Enviamos el HTML generado dinámicamente como respuesta
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache de 1 hora
    return response.status(200).send(html);
}