<div align="center">
  <img src="public/assets/images/casco.pngassets/images/casco.png" alt="Icono de casco de obra" width="150"/>
  <h1>Mapa del Pormishuevismo</h1>
  <p>
    Un mapa interactivo que documenta y celebra un movimiento artístico-arquitectónico singular por toda España.
  </p>
  <p>
    <a href="https://pormishuevismo.vercel.app/"><strong>Ver Demo »</strong></a>
  </p>
  <br>
  <p>
    <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMendiak%2Fpormishuevismo&env=AIRTABLE_BASE_ID,AIRTABLE_TABLE_ID,AIRTABLE_API_TOKEN&envDescription=Necesitas%20tus%20credenciales%20de%20Airtable%20para%20que%20la%20app%20funcione."><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>
  </p>
</div>

---

### 🇪🇸 Sobre el Proyecto

Este no es un simple mapa. Es el **Archivo Digital del Pormishuevismo**, una magna obra de ingeniería cartográfica dedicada a catalogar los más insignes monumentos al ego y al ladrillo que salpican nuestra geografía. Inspirado por la labor arqueológica de [Erik Harley](https://www.oficinaperiferia.com/), este proyecto se erige como un faro de conocimiento, iluminando las sombras de presupuestos desviados y estéticas dudosas.

Navegue, filtre y maravíllese con las historias de hormigón y sueños (rotos) que componen este singular legado arquitectónico.

<details>
<summary>🇬🇧 About The Project</summary>
<br>
This is not a mere map. It is the <b>Digital Archive of Pormishuevismo</b>, a monumental work of cartographic engineering dedicated to cataloging the most distinguished monuments to ego and concrete that dot the Spanish landscape. Inspired by the archaeological work of <a href="https://www.oficinaperiferia.com/">Erik Harley</a>, this project stands as a beacon of knowledge, illuminating the shadows of budget overruns and questionable aesthetics.
<br><br>
Browse, filter, and marvel at the tales of concrete and (broken) dreams that make up this unique architectural legacy.
</details>

### ✨ Características / Features

*   **🗺️ Mapa Interactivo:** Visualiza todos los proyectos en un mapa dinámico gracias a Leaflet.js.
*   **🧩 Marcadores Agrupados:** Los marcadores se agrupan automáticamente para una navegación más limpia (`Leaflet.markercluster`).
*   **💾 Datos Dinámicos:** Toda la información se obtiene en tiempo real desde una base de datos de Airtable.
*   **🔍 Búsqueda y Filtrado Avanzado:** Filtra proyectos por provincia, tipo, estado o puntuación.
*   **📱 Diseño Responsivo:** Experiencia de usuario optimizada tanto para escritorio como para dispositivos móviles.
*   **🔗 Páginas de Detalle:** Cada proyecto tiene su propia URL para facilitar el compartido y mejorar el SEO.
*   **🤖 Sitemap Automático:** El sitemap se genera automáticamente durante el build para una mejor indexación.

### 🛠️ Stack Tecnológico / Tech Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ESM)
*   **Librerías / Libraries:** Leaflet.js, Leaflet.markercluster
*   **Backend:** Vercel Serverless Functions (Node.js)
*   **Base de Datos / Database:** Airtable
*   **Despliegue / Deployment:** Vercel

---

### 🚀 Cómo Empezar / Getting Started

Sigue estos pasos para tener una copia del proyecto funcionando en tu máquina local.

<details>
<summary>🇬🇧 Follow these steps to get a local copy running.</summary>
<br>
</details>

1.  **Clonar el repositorio / Clone the repo**
    ```sh
    git clone https://github.com/mendiak/pormishuevismo.git
    cd pormishuevismo
    ```

2.  **Instalar dependencias / Install dependencies**
    ```sh
    npm install
    ```

3.  **Configurar variables de entorno / Set up environment variables**
    
    🇪🇸 Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Airtable.

    🇬🇧 Create a `.env.local` file in the project root and add your Airtable credentials.
    ```env
    # .env.local
    AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
    AIRTABLE_TABLE_ID=tblXXXXXXXXXXXXXX
    AIRTABLE_API_TOKEN=keyXXXXXXXXXXXXXX
    ```

4.  **Ejecutar el servidor de desarrollo / Run the development server**

    🇪🇸 Este proyecto usa la CLI de Vercel para emular el entorno de producción localmente, incluyendo las funciones serverless.

    🇬🇧 This project uses the Vercel CLI to emulate the production environment locally, including the serverless functions.
    ```sh
    vercel dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

### 🤝 Contribuciones / Contributing

🇪🇸 ¡Las contribuciones son bienvenidas! La forma más sencilla de aportar es añadiendo nuevos proyectos al mapa.

👉 **Añade un nuevo proyecto a través de este formulario de Airtable**

Para otros tipos de contribuciones, por favor sigue el flujo estándar de GitHub (Fork, Branch, Pull Request).

<details>
<summary>🇬🇧 Contributions are welcome! The easiest way to contribute is by adding new projects to the map.</summary>
<br>
👉 <b><a href="https://airtable.com/appKVW43s8ln8paHH/pagH805tE1RXU8V9y/form">Add a new project via this Airtable form</a></b>
<br><br>
For other types of contributions, please follow the standard GitHub flow (Fork, Branch, Pull Request).
</details>

### 📄 Licencia / License

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

<details>
<summary>🇬🇧 Distributed under the MIT License. See `LICENSE` for more information.</summary>
<br>
</details>

### 🙏 Agradecimientos / Acknowledgements

*   **Inspiración:** Erik Harley
*   **Creado por / Created by:** Mikel Aramendia
