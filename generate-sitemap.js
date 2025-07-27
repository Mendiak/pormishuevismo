import fetch from 'node-fetch';
import fs from 'fs';

// Carga las variables de entorno si usas un archivo .env localmente
import dotenv from 'dotenv';
dotenv.config();

const SITE_URL = 'https://pormishuevismo.vercel.app';

async function generateSitemap() {
    console.log('Obteniendo IDs de proyectos desde Airtable...');
    // Hacemos la petición más eficiente pidiendo solo un campo pequeño (el primario).
    // Airtable siempre devuelve el ID de registro ('rec...') en el nivel superior del objeto.
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}?fields%5B%5D=nombre`;
    
    const response = await fetch(airtableUrl, {
        headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_TOKEN}` }
    });

    // --- INICIO DE LA MODIFICACIÓN ---
    // Comprobamos si la petición a Airtable fue exitosa
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al contactar con Airtable:', errorData);
        // Lanzamos un error claro para detener la ejecución del build
        throw new Error(`Airtable respondió con un error: ${errorData.error?.message || response.statusText}`);
    }
    // --- FIN DE LA MODIFICACIÓN ---

    const data = await response.json();

    // Nos aseguramos de que 'records' exista antes de mapearlo
    const projectIds = (data.records || []).map(rec => rec.id); // Usamos el ID de registro de Airtable
    console.log(`Encontrados ${projectIds.length} proyectos.`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <priority>1.0</priority>
  </url>
  ${projectIds.map(id => `
  <url>
    <loc>${SITE_URL}/proyecto/${id}</loc>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    // Vercel busca los archivos estáticos en una carpeta 'public'
    if (!fs.existsSync('public')) {
        fs.mkdirSync('public');
    }
    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('sitemap.xml generado con éxito en la carpeta /public.');
}

generateSitemap();
