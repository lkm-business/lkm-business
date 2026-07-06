const IMG_QUERY = {
  'hw11-pro': 'smartwatch',
  'hw16-max': 'smartwatch',
  'jbl-tune-720bt': 'headphones',
  'jbl-tune-520bt': 'headphones',
  'airpods-pro-2': 'airpods',
  'airpods-pro-3': 'airpods',
  'airpods-4': 'airpods',
  'tripod-live': 'tripod',
  'netflix': 'netflix',
  'prime-video': 'amazon',
  'crunchyroll': 'anime',
  'apple-music': 'music',
  'iptv-premium': 'television',
  'iptv-ultra-premium': 'television',
};

const CAT_QUERY = {
  'montres-connectees': 'smartwatch',
  'audio-premium': 'headphones',
  'accessoires': 'camera',
  'streaming': 'streaming',
  'iptv': 'television',
};

// hash stable pour verrouiller une image LoremFlickr par produit (évite que tous les produits
// partageant le même mot-clé affichent la photo identique)
const lockFor = (str) => {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 100;
};

export const produitImg = (p) => {
  if (p.image_principale) return p.image_principale;
  const query = IMG_QUERY[p.slug] || CAT_QUERY[p.categorie_slug] || 'technology';
  return `https://loremflickr.com/400/400/${query}?lock=${lockFor(p.id || p.slug)}`;
};

export const flickrImg = (query, lock, w = 400, h = 300) => `https://loremflickr.com/${w}/${h}/${query}?lock=${lock}`;
