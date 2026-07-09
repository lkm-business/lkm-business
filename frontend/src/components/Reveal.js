import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, style, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    // Filet de sécurité : si l'observer ne se déclenche jamais (ex: élément déjà visible au chargement
    // dans certains navigateurs), on affiche quand même le contenu plutôt que de le laisser invisible.
    const fallback = setTimeout(() => setVisible(true), 1500);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <div
      ref={ref}
      className={visible ? 'reveal reveal-visible' : 'reveal'}
      style={{...style, transitionDelay: `${delay}ms`}}
    >
      {children}
    </div>
  );
}
