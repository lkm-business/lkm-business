export default function Contact() {
  return (
    <div style={{padding: '32px 24px', maxWidth: 520, margin: '0 auto', minHeight: '50vh'}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 16}}>📩 Contact</h1>
      <div style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, color: 'white', fontSize: 14, lineHeight: 2}}>
        <div>📧 Email : <a href="mailto:contact@lkmbusiness.com" style={{color: '#2DD4A7'}}>contact@lkmbusiness.com</a></div>
        <div>💬 WhatsApp : <a href="https://wa.me/message/VK75NLUQCZUIJ1" target="_blank" rel="noopener noreferrer" style={{color: '#2DD4A7'}}>Nous écrire</a></div>
        <div>💳 Paiement : Orange Money, Wave, Stripe</div>
        <div>🚚 Livraison : rapide, partout où LKM_BUSINESS opère</div>
      </div>
    </div>
  );
}
