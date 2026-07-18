// Certaines combinaisons marque/système de TV ne supportent pas d'application IPTV
// gratuite fiable : système propriétaire principal de la marque, ou VIDAA (Hisense
// et certains modèles LG/Samsung sous licence VIDAA).
const SYSTEMES_PAYANTS_SEULS = {
  LG: ['WebOS', 'VIDAA'],
  Samsung: ['Tizen', 'VIDAA'],
  Hisense: ['VIDAA'],
};

export const estPayanteSeule = (marque, systeme) =>
  (SYSTEMES_PAYANTS_SEULS[marque] || []).includes(systeme);
