const MOVP_HEADERS = {
  'User-Agent': 'MOVP-CatalogManifest/1.0',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip'
};

// URL del manifiesto maestro que capturaste
const MANIFEST_URL = 'https://api.appsdevxp.com/db/catalog_manifest.json?manifest_cache=5979108';

async function getCatalog() {
  try {
    // Paso 1: Obtener el manifiesto principal para localizar el archivo de ítems activo
    const manifestResponse = await fetch(MANIFEST_URL, {
      method: 'GET',
      headers: MOVP_HEADERS
    });

    if (!manifestResponse.ok) {
      throw new Error(`Error al cargar el manifiesto: ${manifestResponse.status}`);
    }

    const manifestData = await manifestResponse.json();
    
    // Extraemos la URL del servidor de respaldo de GitHub o del servidor principal (server1)
    // Usar GitHub ("github") es ultra estable porque evita bloqueos 403 de la API
    const itemsUrl = manifestData.prod.urls.github || manifestData.prod.urls.server1;

    // Paso 2: Descargar la lista real de películas y series
    const itemsResponse = await fetch(itemsUrl, {
      method: 'GET',
      headers: MOVP_HEADERS
    });

    if (!itemsResponse.ok) {
      throw new Error(`Error al cargar el catálogo de ítems: ${itemsResponse.status}`);
    }

    const itemsData = await itemsResponse.json();

    // Verificamos que sea un arreglo de datos y lo mapeamos al formato de Kino TV
    const list = Array.isArray(itemsData) ? itemsData : (itemsData.items || itemsData.data || []);

    return list.map(item => ({
      id: item.id || item.slug,
      title: item.name || item.title,
      poster: item.poster || item.cover,
      type: item.type === 'tv' ? 'series' : 'movie'
    }));

  } catch (error) {
    console.error("Error crítico en el plugin MoviePlus:", error);
    return [];
  }
}

if (typeof Kino !== 'undefined') {
  Kino.registerPlugin({
    getCatalog: getCatalog
  });
}