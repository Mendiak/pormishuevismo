// Este código se ejecuta en el servidor de Vercel, no en el navegador del usuario.

export default async function handler(request, response) {
  // Leemos TODAS las credenciales desde las variables de entorno para mayor seguridad y flexibilidad.
  const { AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID, AIRTABLE_API_TOKEN } = process.env;

  if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID || !AIRTABLE_API_TOKEN) {
    return response.status(500).json({ error: 'Las credenciales de Airtable no están configuradas correctamente en el servidor.' });
  }

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

  try {
    const airtableResponse = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
      },
    });

    if (!airtableResponse.ok) {
      // Si hay un error, intentamos leer el cuerpo del error para dar más detalles.
      const errorBody = await airtableResponse.text();
      console.error("Error from Airtable API:", errorBody);
      throw new Error(`Error desde Airtable: ${airtableResponse.statusText}`);
    }

    const data = await airtableResponse.json();
    
    // Devolvemos los datos al frontend
    // Añadimos cabeceras de caché para mejorar el rendimiento y reducir las llamadas a la API
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300'); // Cache por 1 min, revalida en background
    return response.status(200).json(data);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'No se pudieron obtener los datos.' });
  }
}
