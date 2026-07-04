import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [tab, setTab] = useState('physique');
  const [iptvSelected, setIptvSelected] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data)).catch(console.error);
    api.get('/products/plans').then(r => setPlans(r.data)).catch(console.error);
  }, []);

  const streaming = plans.filter(p => p.type === 'streaming');
  const iptv = ['IPTV Premium', 'IPTV Ultra Premium'].map(name => ({
    name,
    icon: name.includes('Ultra') ? '🛰️' : '📡',
    featured: name.includes('Ultra'),
    desc: name.includes('Ultra') ? '23 000 chaînes 4K • 128 000 films • 23 000 séries' : '18 000 chaînes • 80 000 films • 22 000 séries',
    plans: plans.filter(p => p.type === 'iptv' && p.name.startsWith(name)),
  }));

  return (
    <main>
      <section className="hero">
        <div className="hero-slogan">" Toi-même faut voir "</div>
        <h1>Tech & Divertissement au meilleur prix</h1>
        <p>Montres connectées, audio premium, streaming et IPTV</p>
        <div className="hero-tags">
          <span className="tag green">🚚 Livraison rapide</span>
          <span className="tag blue">⚡ Activation instantanée</span>
          <span className="tag amber">🛡️ Paiement sécurisé</span>
        </div>
      </section>

      <div className="tab-bar">
        <button className={`tab ${tab==='physique'?'active':''}`} onClick={()=>setTab('physique')}>📦 Produits physiques</button>
        <button className={`tab ${tab==='digital'?'active':''}`} onClick={()=>setTab('digital')}>📺 Abonnements & IPTV</button>
      </div>

      {tab === 'physique' && (
        <div>
          {['montres','audio','accessoires'].map(cat => {
            const catProds = products.filter(p => p.category === cat);
            if (!catProds.length) return null;
            const titles = { montres:'⌚ Montres connectées', audio:'🎧 Audio premium', accessoires:'📷 Accessoires' };
            return (
              <section key={cat} className="section">
                <h2 className="section-title">{titles[cat]}</h2>
                <div className="grid">
                  {catProds.map(p => (
                    <div key={p.id} className="product-card">
                      <img src={p.image_url} alt={p.name} className="product-img" onError={e=>e.target.style.display='none'} />
                      <span className="badge green">{p.badge}</span>
                      <div className="product-name">{p.name}</div>
                      <div className="product-price">{Number(p.price).toLocaleString('fr-FR')} FCFA</div>
                      <button className="add-btn" onClick={() => addToCart({ id:p.id, name:p.name, price:+p.price, type:'product', item_type:'product', product_id:p.id })}>
                        + Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {tab === 'digital' && (
        <div>
          <section className="section">
            <h2 className="section-title">▶️ Abonnements streaming</h2>
            <div className="grid">
              {streaming.map(p => (
                <div key={p.id} className="product-card">
                  <div className="product-img-icon">{p.icon}</div>
                  <span className="badge blue">Streaming</span>
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">{Number(p.price).toLocaleString('fr-FR')} FCFA<span className="price-sub">/mois</span></div>
                  <div className="product-desc">{p.description}</div>
                  <button className="add-btn" onClick={() => addToCart({ id:p.id, name:p.name, price:+p.price, type:'subscription', item_type:'subscription', plan_id:p.id, ico:p.icon, days:p.duration_days })}>
                    + S'abonner
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="section">
            <h2 className="section-title">📡 IPTV — Choisir ta formule</h2>
            <div className="iptv-grid">
              {iptv.map(group => (
                <div key={group.name} className={`iptv-card ${group.featured?'featured':''}`}>
                  {group.featured && <span className="featured-badge">⭐ Ultra Premium</span>}
                  <div className="iptv-header"><span className="iptv-icon">{group.icon}</span><div><div className="iptv-name">{group.name}</div><div className="iptv-desc">{group.desc}</div></div></div>
                  <div className="plans-grid">
                    {group.plans.map((pl, i) => (
                      <button key={pl.id} className={`plan-btn ${iptvSelected[group.name]===i?'selected':''}`} onClick={() => setIptvSelected(s=>({...s,[group.name]:i}))}>
                        <span className="plan-label">{pl.name.split('—')[1]?.trim()}</span>
                        <span className="plan-price">{Number(pl.price).toLocaleString('fr-FR')} FCFA</span>
                      </button>
                    ))}
                  </div>
                  <button className="iptv-add-btn" disabled={iptvSelected[group.name]===undefined} onClick={() => {
                    const pl = group.plans[iptvSelected[group.name]];
                    if (pl) addToCart({ id:pl.id+'_'+Date.now(), name:pl.name, price:+pl.price, type:'subscription', item_type:'subscription', plan_id:pl.id, ico:group.icon, days:pl.duration_days });
                  }}>+ Ajouter au panier</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
