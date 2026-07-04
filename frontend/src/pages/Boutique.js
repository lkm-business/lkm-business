import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Boutique() {
  const [produits, setProduits] = useState([]);
  const [onglet, setOnglet] = useState('physique');
  const [iptvSel, setIptvSel] = useState({});
  const { ajouter } = useCart();

  useEffect(() => {
    API.get('/produits').then(r => setProduits(r.data)).catch(() => toast.error('Erreur chargement produits'));
  }, []);

  const physiques = produits.filter(p => p.type === 'physique');
  const streaming = produits.filter(p => p.type === 'numerique' && p.categorie_slug === 'streaming');
  const iptv = produits.filter(p => p.type === 'numerique' && p.categorie_slug === 'iptv');

  const cats = [...new Set(physiques.map(p => p.categorie_slug))];
  const ICO = {'montres-connectees':'⌚','audio-premium':'🎧','accessoires':'📹','streaming':'🎬','iptv':'📡'};

  const ajouterProduit = (p, formule=null) => {
    ajouter(p, formule);
    toast.success((formule ? p.nom + ' — ' + formule.duree_label : p.nom) + ' ajouté !');
  };

  const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

  return (
    <div>
      {/* Hero */}
      <div style={{background:'#f8f8f8',borderBottom:'0.5px solid #e5e5e5',display:'flex',overflow:'hidden'}}>
        <div style={{background:'#2DD4A7',width:88,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{fontSize:36}}>🖱️</span>
        </div>
        <div style={{padding:'20px 24px'}}>
          <div style={{fontSize:13,color:'#0F6E56',fontStyle:'italic',fontWeight:500,marginBottom:4}}>" Toi-même faut voir "</div>
          <h1 style={{fontSize:20,fontWeight:500,marginBottom:4}}>Tech & Divertissement au meilleur prix</h1>
          <p style={{fontSize:12,color:'#888',marginBottom:12}}>Montres connectées, audio premium, streaming et IPTV</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[['🚚 Livraison rapide','#E1F5EE','#0F6E56'],['⚡ Activation instantanée','#E6F1FB','#185FA5'],['🔒 Paiement sécurisé','#FAEEDA','#854F0B']].map(([t,bg,c])=>(
              <span key={t} style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:500,background:bg,color:c}}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'0.5px solid #e5e5e5',padding:'0 20px',background:'white'}}>
        {[['physique','📦 Produits physiques'],['numerique','📺 Abonnements & IPTV']].map(([k,l])=>(
          <button key={k} onClick={()=>setOnglet(k)} style={{
            padding:'10px 14px',fontSize:13,border:'none',background:'none',cursor:'pointer',
            borderBottom: onglet===k ? '2px solid #1D9E75' : '2px solid transparent',
            color: onglet===k ? '#0F6E56' : '#888', fontWeight: onglet===k?500:400,
            marginBottom:-0.5
          }}>{l}</button>
        ))}
      </div>

      {/* Physique */}
      {onglet === 'physique' && cats.map(cat => (
        <div key={cat} style={{padding:'16px 20px',borderBottom:'0.5px solid #f0f0f0'}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:12}}>
            {ICO[cat]||'📦'} {physiques.find(p=>p.categorie_slug===cat)?.categorie_nom}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:10}}>
            {physiques.filter(p=>p.categorie_slug===cat).map(p=>(
              <div key={p.id} style={{background:'white',border:'0.5px solid #e5e5e5',borderRadius:12,padding:10}}>
                <div style={{height:80,background:'#f8f8f8',borderRadius:8,marginBottom:8,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {p.image_principale
                    ? <img src={p.image_principale} alt={p.nom} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'} />
                    : <span style={{fontSize:28}}>{ICO[cat]||'📦'}</span>}
                </div>
                <span style={{display:'inline-block',padding:'2px 6px',borderRadius:4,fontSize:10,background:'#E1F5EE',color:'#0F6E56',marginBottom:4}}>{p.categorie_nom}</span>
                <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{p.nom}</div>
                <div style={{fontSize:12,fontWeight:500,color:'#0F6E56',marginBottom:6}}>{fmt(p.prix)}</div>
                <button onClick={()=>ajouterProduit(p)} style={{width:'100%',padding:6,border:'0.5px solid #ddd',borderRadius:8,background:'none',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                  + Ajouter
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Numérique */}
      {onglet === 'numerique' && (<>
        <div style={{padding:'16px 20px',borderBottom:'0.5px solid #f0f0f0'}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:12}}>🎬 Abonnements streaming</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:10}}>
            {streaming.map(p=>(
              <div key={p.id} style={{background:'white',border:'0.5px solid #e5e5e5',borderRadius:12,padding:10}}>
                <div style={{height:80,background:'#f0f8ff',borderRadius:8,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>
                  {p.slug==='netflix'?'🎬':p.slug==='prime-video'?'📺':p.slug==='crunchyroll'?'🍥':'🎵'}
                </div>
                <span style={{display:'inline-block',padding:'2px 6px',borderRadius:4,fontSize:10,background:'#E6F1FB',color:'#185FA5',marginBottom:4}}>Streaming</span>
                <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{p.nom}</div>
                <div style={{fontSize:12,fontWeight:500,color:'#0F6E56',marginBottom:2}}>{fmt(p.prix)}<span style={{fontSize:10,color:'#888'}}>/mois</span></div>
                <div style={{fontSize:10,color:'#888',marginBottom:6}}>1 utilisateur / mois</div>
                <button onClick={()=>ajouterProduit(p)} style={{width:'100%',padding:6,border:'0.5px solid #ddd',borderRadius:8,background:'none',cursor:'pointer',fontSize:11}}>
                  + S'abonner
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:'16px 20px'}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:12}}>📡 IPTV — Choisir ta formule</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
            {iptv.map(p=>(
              <div key={p.id} style={{background:'white',border: p.slug==='iptv-ultra-premium'?'2px solid #1D9E75':'0.5px solid #e5e5e5',borderRadius:12,padding:14}}>
                {p.slug==='iptv-ultra-premium' && <div style={{display:'inline-block',padding:'2px 8px',borderRadius:6,fontSize:10,background:'#E1F5EE',color:'#0F6E56',marginBottom:8,fontWeight:500}}>⭐ Ultra Premium</div>}
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span style={{fontSize:22}}>{p.slug==='iptv-premium'?'📡':'🛰️'}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:500}}>{p.nom}</div>
                    <div style={{fontSize:11,color:'#888'}}>{p.slug==='iptv-premium'?'18 000 chaînes • 80 000 films':'23 000 chaînes 4K • 128 000 films'}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:'#555',fontWeight:500,marginBottom:8}}>Choisir une formule :</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:10}}>
                  {(p.formules||[]).map((f,i)=>(
                    <button key={f.id} onClick={()=>setIptvSel(s=>({...s,[p.id]:f}))} style={{
                      padding:'7px 8px',border: iptvSel[p.id]?.id===f.id ? '2px solid #1D9E75' : '0.5px solid #ddd',
                      borderRadius:8,cursor:'pointer',background: iptvSel[p.id]?.id===f.id ? '#E1F5EE' : 'none',
                      textAlign:'left',transition:'all 0.1s'
                    }}>
                      <span style={{display:'block',fontSize:11,fontWeight:500,color:iptvSel[p.id]?.id===f.id?'#0F6E56':'#333'}}>{f.duree_label}</span>
                      <span style={{fontSize:11,color:'#0F6E56',fontWeight:500}}>{fmt(f.prix)}</span>
                    </button>
                  ))}
                </div>
                <button
                  disabled={!iptvSel[p.id]}
                  onClick={()=>{ if(iptvSel[p.id]) ajouterProduit(p, iptvSel[p.id]); }}
                  style={{
                    width:'100%',padding:8,background:iptvSel[p.id]?'#1D9E75':'#f0f0f0',
                    color:iptvSel[p.id]?'white':'#999',border:'none',borderRadius:8,
                    cursor:iptvSel[p.id]?'pointer':'not-allowed',fontSize:12,fontWeight:500
                  }}>
                  + Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        </div>
      </>)}
    </div>
  );
}
