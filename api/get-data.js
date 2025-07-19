// Este código se ejecuta en el servidor de Vercel, no en el navegador del usuario.

export default async function handler(request, response) {
  const AIRTABLE_BASE_ID = 'appKVW43s8ln8paHH';
  const AIRTABLE_TABLE_ID = 'tblQ6AJIC9NgL7MwW';
  // ¡La clave se lee de las "Environment Variables" de Vercel, no está en el código!
  const AIRTABLE_TOKEN = process.env.AIRTABLE_API_TOKEN;

  if (!AIRTABLE_TOKEN) {
    return response.status(500).json({ error: 'La clave de la API de Airtable no está configurada en el servidor.' });
  }

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

  try {
    const airtableResponse = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      },
    });

    if (!airtableResponse.ok) {
      throw new Error(`Error desde Airtable: ${airtableResponse.statusText}`);
    }

    const data = await airtableResponse.json();
    
    // Devolvemos los datos al frontend
    return response.status(200).json(data);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'No se pudieron obtener los datos.' });
  }
}
