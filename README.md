<div align="center">
  <img src="https://pormishuevismo.vercel.app/assets/images/pormishuevismo-social-share.png" alt="Logo de Pormishuevismo" width="700"/>
  <h1>Mapa del Pormishuevismo</h1>
  <p>
    Un mapa interactivo que documenta y celebra un movimiento artístico-arquitectónico singular por toda España.
  </p>
  <p>
    <a href="https://pormishuevismo.vercel.app/"><strong>Ver Demo »</strong></a>
  </p>
  <br>
    <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmendiak%2Fpormishuevismo&env=AIRTABLE_BASE_ID,AIRTABLE_TABLE_ID,AIRTABLE_API_TOKEN&envDescription=Necesitas%20tus%20credenciales%20de%20Airtable%20para%20que%20la%20app%20funcione."><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>
    <img src="https://img.shields.io/github/license/mendiak/pormishuevismo?style=for-the-badge" alt="Licencia">
</div>

---

### 🇪🇸 Sobre el Proyecto

**Pormishuevismo** es un mapa interactivo que documenta y celebra un movimiento artístico-arquitectónico singular por toda España. Inspirado por el trabajo de [Erik Harley](https://www.oficinaperiferia.com/), este proyecto te permite explorar, filtrar y conocer la historia detrás de cada obra.

La aplicación carga dinámicamente los datos desde una base de Airtable, los muestra en un mapa de Leaflet y permite a los usuarios filtrar y buscar proyectos de interés.

<details>
<summary>🇬🇧 About The Project</summary>
<br>
<b>Pormishuevismo</b> is an interactive map that documents and celebrates a unique artistic-architectural movement throughout Spain. Inspired by the work of <a href="https://www.oficinaperiferia.com/">Erik Harley</a>, this project allows you to explore, filter, and learn the story behind each creation.
<br><br>
The application dynamically loads data from an Airtable base, displays it on a Leaflet map, and allows users to filter and search for projects of interest.
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

Distribuido bajo la Licencia ISC.

<details>
<summary>🇬🇧 Distributed under the ISC License.</summary>
<br>
</details>

### 🙏 Agradecimientos / Acknowledgements

*   **Inspiración:** Erik Harley
*   **Creado por / Created by:** Mikel Aramendia
