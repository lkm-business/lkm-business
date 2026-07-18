export default function About() {
  return (
    <div style={{padding: '32px 24px', maxWidth: 720, margin: '0 auto', minHeight: '50vh'}}>
      <h1 style={{fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8}}>À propos de LKM_BUSINESS</h1>
      <p style={{fontSize: 13, color: '#888', marginBottom: 24, fontStyle: 'italic'}}>" Toi-même faut voir "</p>

      <div style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24, marginBottom: 20}}>
        <p style={{color: '#ccc', fontSize: 14, lineHeight: 1.8, marginBottom: 16}}>
          LKM_BUSINESS est une boutique en ligne basée au Sénégal qui propose deux grandes familles de produits :
          des <strong style={{color: 'white'}}>produits tech physiques</strong> (montres connectées, écouteurs et casques audio,
          accessoires de création de contenu) livrés rapidement, et des <strong style={{color: 'white'}}>abonnements numériques</strong>
          (Netflix, Prime Video, Crunchyroll, Apple Music, IPTV Premium et Ultra Premium) activés après paiement.
        </p>
        <p style={{color: '#ccc', fontSize: 14, lineHeight: 1.8}}>
          Notre objectif : rendre la technologie et le divertissement accessibles, avec des prix clairs, un paiement
          sécurisé (Wave, Orange Money, carte bancaire) et un support réactif pour t'accompagner avant et après ton achat.
        </p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14}}>
        <div style={{background: '#111', border: '1px solid #262626', borderRadius: 12, padding: 18}}>
          <div style={{fontSize: 24, marginBottom: 8}}>⌚</div>
          <div style={{color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 4}}>Produits physiques</div>
          <div style={{color: '#888', fontSize: 12.5, lineHeight: 1.6}}>Montres connectées, audio premium, accessoires — livrés partout où on opère.</div>
        </div>
        <div style={{background: '#111', border: '1px solid #262626', borderRadius: 12, padding: 18}}>
          <div style={{fontSize: 24, marginBottom: 8}}>🎬</div>
          <div style={{color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 4}}>Streaming</div>
          <div style={{color: '#888', fontSize: 12.5, lineHeight: 1.6}}>Netflix, Prime Video, Crunchyroll, Apple Music — accès activé rapidement.</div>
        </div>
        <div style={{background: '#111', border: '1px solid #262626', borderRadius: 12, padding: 18}}>
          <div style={{fontSize: 24, marginBottom: 8}}>📡</div>
          <div style={{color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 4}}>IPTV</div>
          <div style={{color: '#888', fontSize: 12.5, lineHeight: 1.6}}>Des milliers de chaînes et de films en Premium ou Ultra Premium 4K.</div>
        </div>
      </div>
    </div>
  );
}
