import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    key: 'jbl720',
    bg: 'linear-gradient(135deg, #0b0b0b, #1c1c1c)',
    textColor: 'white',
    badge: 'Casque sans fil',
    badgeBg: '#1D9E75',
    title: 'Son Pure Bass Immersif',
    subtitle: "JBL TUNE 720BT — 76h d'autonomie",
    price: '40 000 FCFA',
    button: 'Commander maintenant',
    buttonBg: 'white',
    buttonColor: '#0F6E56',
    path: '/produits#audio',
    images: ['/images/jbl720.jpeg'],
  },
  {
    key: 'hw16',
    bg: 'linear-gradient(135deg, #7c3f0a, #e0862b)',
    textColor: 'white',
    badge: 'Montre connectée',
    badgeBg: '#1D9E75',
    title: 'La Montre qui Redéfinit le Style',
    subtitle: 'HW16 Max — Super AMOLED, charge sans fil',
    price: '30 000 FCFA',
    button: 'Découvrir',
    buttonBg: 'white',
    buttonColor: '#7c3f0a',
    path: '/produits#montres',
    images: ['/images/hw16.jpeg'],
  },
  {
    key: 'airpodspro3',
    bg: 'linear-gradient(135deg, #2b2b30, #14141a)',
    textColor: 'white',
    badge: 'Écouteurs Apple',
    badgeBg: '#2563eb',
    title: 'Audio Apple Premium',
    subtitle: 'AirPods Pro 3 — Réduction de bruit active',
    price: '15 000 FCFA',
    button: 'Acheter maintenant',
    buttonBg: '#2563eb',
    buttonColor: 'white',
    path: '/produits#audio',
    images: ['/images/airpodspro3.jpg'],
  },
  {
    key: 'iptv-ultra',
    bg: 'linear-gradient(135deg, #0a1628, #12294f)',
    bgImage: '/images/iptv.jpg',
    textColor: 'white',
    badge: 'IPTV Ultra Premium',
    badgeBg: '#7c3aed',
    title: '23 000 Chaînes 4K/UHD',
    subtitle: 'IPTV Ultra Premium — 128 000 films, 23 000 séries',
    price: 'Dès 4 000 FCFA/mois',
    button: "S'abonner",
    buttonBg: 'white',
    buttonColor: '#12294f',
    path: '/abonnements#iptv-ultra-premium',
  },
  {
    key: 'streaming',
    bg: 'linear-gradient(135deg, #1a0505, #3d0a0a)',
    bgImage: '/images/streaming.jpeg',
    overlay: 'linear-gradient(90deg, rgba(26,5,5,0.92), rgba(61,10,10,0.55))',
    textColor: 'white',
    badge: 'Streaming',
    badgeBg: '#E63946',
    title: 'Tous tes Streamings au Meilleur Prix',
    subtitle: 'Netflix, Prime Video, Crunchyroll, Apple Music',
    price: 'Dès 1 500 FCFA/mois',
    button: 'Voir les offres',
    buttonBg: 'white',
    buttonColor: '#7a1f1f',
    path: '/abonnements#streaming',
  },
];

const N = SLIDES.length;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % N), 4000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const goTo = (i) => setIndex(((i % N) + N) % N);
  const goToPath = (path) => navigate(path);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{position: 'relative', overflow: 'hidden', minHeight: 'min(480px, 90vh)'}}
    >
      <div style={{
        display: 'flex', width: `${N * 100}%`, height: '100%',
        transform: `translateX(-${index * (100 / N)}%)`,
        transition: 'transform 0.85s cubic-bezier(0.65, 0, 0.35, 1)',
      }}>
        {SLIDES.map((s, i) => {
          const active = i === index;
          return (
            <div key={s.key} style={{
              flex: `0 0 ${100 / N}%`, minHeight: 'min(480px, 90vh)', background: s.bg,
              display: 'flex', alignItems: 'center', flexWrap: 'wrap', position: 'relative',
              padding: '40px 6%', overflow: 'hidden',
            }}>
              {s.bgImage && (
                <>
                  <img src={s.bgImage} alt="" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0}} />
                  <div style={{position: 'absolute', inset: 0, background: s.overlay || 'linear-gradient(90deg, rgba(10,22,40,0.92), rgba(10,22,40,0.55))', zIndex: 1}} />
                </>
              )}

              <div
                key={active ? `${s.key}-text-on` : `${s.key}-text-off`}
                className={active ? 'hero-text-anim' : ''}
                style={{flex: '1 1 320px', color: s.textColor, zIndex: 2, minWidth: 260}}
              >
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11,
                  fontWeight: 700, background: s.badgeBg, color: 'white', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.4
                }}>{s.badge}</span>
                <h1 style={{fontSize: 'clamp(24px, 4.5vw, 38px)', fontWeight: 800, marginBottom: 12, lineHeight: 1.15}}>{s.title}</h1>
                <p style={{fontSize: 'clamp(13px, 2vw, 16px)', opacity: 0.9, marginBottom: 16}}>{s.subtitle}</p>
                <div style={{fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, marginBottom: 22}}>{s.price}</div>
                <button onClick={() => goToPath(s.path)} style={{
                  background: s.buttonBg, color: s.buttonColor, border: 'none', padding: '13px 28px',
                  borderRadius: 30, fontSize: 14, fontWeight: 700, cursor: 'pointer'
                }}>
                  {s.button}
                </button>
              </div>

              {!s.bgImage && (
                <div
                  key={active ? `${s.key}-img-on` : `${s.key}-img-off`}
                  className={`hero-carousel-image ${active ? 'hero-image-anim' : ''}`}
                  style={{flex: '1 1 260px', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 220, zIndex: 2}}
                >
                  {s.netflix && (
                    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 14, background: '#141414', color: '#E50914',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900
                      }}>N</div>
                      {s.images.map(src => (
                        <img key={src} src={src} alt="" style={{width: 64, height: 64, borderRadius: 14, objectFit: 'cover'}} />
                      ))}
                    </div>
                  )}
                  {!s.netflix && s.images?.map(src => (
                    <img key={src} src={src} alt={s.title} style={{maxWidth: '100%', maxHeight: 'min(360px, 60vh)', objectFit: 'contain', borderRadius: 16}} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => goTo(index - 1)} aria-label="Précédent" style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
        width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)',
        color: 'white', fontSize: 18, cursor: 'pointer'
      }}>‹</button>
      <button onClick={() => goTo(index + 1)} aria-label="Suivant" style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
        width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)',
        color: 'white', fontSize: 18, cursor: 'pointer'
      }}>›</button>

      <div style={{position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3}}>
        {SLIDES.map((s, i) => (
          <button key={s.key} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} style={{
            width: i === index ? 24 : 8, height: 8, borderRadius: 4, border: 'none',
            background: i === index ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'width 0.3s ease'
          }} />
        ))}
      </div>
    </div>
  );
}
