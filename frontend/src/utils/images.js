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

// Netflix : gros "N" stylisé (noir/rouge) plutôt qu'une photo générique
const NETFLIX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#141414"/><text x="200" y="300" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="280" fill="#E50914" text-anchor="middle">N</text></svg>`;
const NETFLIX_IMG = `data:image/svg+xml,${encodeURIComponent(NETFLIX_SVG)}`;

export const produitImg = (p) => {
  if (p.image_principale) return p.image_principale;
  if (p.slug === 'netflix') return NETFLIX_IMG;
  const query = IMG_QUERY[p.slug] || CAT_QUERY[p.categorie_slug] || 'technology';
  return `https://loremflickr.com/400/400/${query}?lock=${lockFor(p.id || p.slug)}`;
};

export const flickrImg = (query, lock, w = 400, h = 300) => `https://loremflickr.com/${w}/${h}/${query}?lock=${lock}`;
