const MOVP_HEADERS = {
  'User-Agent': 'MOVP-CatalogManifest/1.0',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip'
};

const MANIFEST_URL = 'https://api.appsdevxp.com/db/catalog_manifest.json?manifest_cache=5979108';

async function getCatalog() {
  try {
    const manifestResponse = await fetch(MANIFEST_URL, {
      method: 'GET',
      headers: MOVP_HEADERS
    });

    if (!manifestResponse.ok) {
      throw new Error(`Error en manifiesto: ${manifestResponse.status}`);
    }

    const manifestData = await manifestResponse.json();
    const itemsUrl = manifestData.prod.urls.github || manifestData.prod.urls.server1;

    const itemsResponse = await fetch(itemsUrl, {
      method: 'GET',
      headers: MOVP_HEADERS
    });

    if (!itemsResponse.ok) {
      throw new Error(`Error en ítems: ${itemsResponse.status}`);
    }

    const itemsData = await itemsResponse.json();
    const list = Array.isArray(itemsData) ? itemsData : (itemsData.items || itemsData.data || []);

    return list.map(item => ({
      id: item.id || item.slug,
      title: item.name || item.title,
      poster: item.poster || item.cover,
      type: item.type === 'tv' ? 'series' : 'movie'
    }));

  } catch (error) {
    console.error("Error al cargar el catálogo:", error);
    return [];
  }
}

if (typeof Kino !== 'undefined') {
  Kino.registerPlugin({
    getCatalog: getCatalog
  });
}
