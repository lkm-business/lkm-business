const cardStyle = {background:'#111',border:'1px solid #262626',borderRadius:12,padding:16,marginBottom:16};
const selectStyle = {width:'100%',padding:'8px 12px',border:'1px solid #333',borderRadius:8,fontSize:13,boxSizing:'border-box',outline:'none',background:'#1a1a1a',color:'white',marginBottom:10};
const labelStyle = {fontSize:12,color:'#999',marginBottom:6,display:'block'};

const APPAREILS = [
  { id: 'tv', label: '📺 TV' },
  { id: 'ordinateur', label: '💻 Ordinateur' },
  { id: 'tablette', label: '📱 Tablette' },
  { id: 'telephone', label: '📲 Téléphone' },
];

const MARQUES = ['LG', 'Samsung', 'Hisense', 'Sony', 'TCL', 'Autre'];
const SYSTEMES = ['WebOS', 'Tizen', 'VIDAA', 'Android TV', 'Roku', 'Autre'];

const OuiNon = ({ value, onChange }) => (
  <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
    {['oui', 'non'].map(v => (
      <button key={v} type="button" onClick={() => onChange(v)} style={{
        flex: 1, padding: 9, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
        border: value === v ? '2px solid #1D9E75' : '1px solid #333',
        background: value === v ? '#123a2c' : '#1a1a1a',
        color: value === v ? '#2DD4A7' : 'white',
      }}>{v}</button>
    ))}
  </div>
);

export default function IptvSetupForm({ config, setConfig }) {
  const set = (champ, valeur) => setConfig(c => ({ ...c, [champ]: valeur }));

  const forcePayanteSeule = config.appareil === 'tv'
    && ['LG', 'Samsung', 'Hisense'].includes(config.marque)
    && config.systeme === 'VIDAA';

  return (
    <div style={cardStyle}>
      <div style={{fontSize: 13, fontWeight: 500, marginBottom: 4, color: 'white'}}>📡 Configuration IPTV</div>
      <div style={{fontSize: 11, color: '#888', marginBottom: 12}}>Pour préparer ton accès sur le bon appareil.</div>

      <label style={labelStyle}>Sur quel appareil vas-tu regarder le contenu ?</label>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12}}>
        {APPAREILS.map(a => (
          <button key={a.id} type="button" onClick={() => setConfig({ appareil: a.id })} style={{
            padding: 10, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, textAlign: 'left',
            border: config.appareil === a.id ? '2px solid #1D9E75' : '1px solid #333',
            background: config.appareil === a.id ? '#123a2c' : '#1a1a1a',
            color: config.appareil === a.id ? '#2DD4A7' : 'white',
          }}>{a.label}</button>
        ))}
      </div>

      {config.appareil === 'tv' && (
        <>
          <label style={labelStyle}>Marque de la TV</label>
          <select style={selectStyle} value={config.marque || ''} onChange={e => set('marque', e.target.value)}>
            <option value="">Choisir...</option>
            {MARQUES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <label style={labelStyle}>Système de la TV</label>
          <select style={selectStyle} value={config.systeme || ''} onChange={e => set('systeme', e.target.value)}>
            <option value="">Choisir...</option>
            {SYSTEMES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {config.marque && config.systeme && (<>
            <label style={labelStyle}>As-tu déjà utilisé l'IPTV ?</label>
            <OuiNon value={config.dejaUtilise} onChange={v => setConfig(c => ({ ...c, dejaUtilise: v, aUneApp: '', nomApplication: '', typeApp: '', appPayante: '' }))} />
          </>)}

          {config.dejaUtilise === 'oui' && (<>
            <label style={labelStyle}>As-tu déjà une application IPTV installée ?</label>
            <OuiNon value={config.aUneApp} onChange={v => setConfig(c => ({ ...c, aUneApp: v, nomApplication: '', typeApp: '', appPayante: '' }))} />
          </>)}

          {config.aUneApp === 'oui' && config.dejaUtilise === 'oui' && (
            <>
              <label style={labelStyle}>Nom de ton application IPTV</label>
              <input value={config.nomApplication || ''} onChange={e => set('nomApplication', e.target.value)} placeholder="Ex: IBO Player, Smarters..."
                style={{...selectStyle}} />
            </>
          )}

          {((config.dejaUtilise === 'non') || (config.dejaUtilise === 'oui' && config.aUneApp === 'non')) && (
            <>
              {forcePayanteSeule ? (
                <div style={{fontSize: 12, color: '#f2c14e', marginBottom: 10}}>
                  ⚠️ Cette TV ({config.marque} / VIDAA) ne supporte pas d'application gratuite fiable — application payante uniquement.
                </div>
              ) : (
                <>
                  <label style={labelStyle}>Choisir une application</label>
                  <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                    {['gratuite', 'payante'].map(v => (
                      <button key={v} type="button" onClick={() => setConfig(c => ({ ...c, typeApp: v, appPayante: '' }))} style={{
                        flex: 1, padding: 9, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                        border: config.typeApp === v ? '2px solid #1D9E75' : '1px solid #333',
                        background: config.typeApp === v ? '#123a2c' : '#1a1a1a',
                        color: config.typeApp === v ? '#2DD4A7' : 'white',
                      }}>{v}</button>
                    ))}
                  </div>
                </>
              )}

              {(config.typeApp === 'payante' || forcePayanteSeule) && (
                <>
                  <label style={labelStyle}>Quelle application payante ?</label>
                  <div style={{display: 'flex', gap: 8}}>
                    {['IBO Player', 'SmartOne'].map(app => (
                      <button key={app} type="button" onClick={() => set('appPayante', app)} style={{
                        flex: 1, padding: 9, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        border: config.appPayante === app ? '2px solid #1D9E75' : '1px solid #333',
                        background: config.appPayante === app ? '#123a2c' : '#1a1a1a',
                        color: config.appPayante === app ? '#2DD4A7' : 'white',
                      }}>{app}</button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
