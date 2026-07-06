import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div style={{maxWidth:420,margin:'64px auto',padding:'0 20px',textAlign:'center'}}>
      <div style={{fontSize:48,marginBottom:12}}>✅</div>
      <h1 style={{fontSize:19,fontWeight:500,marginBottom:8,color:'white'}}>Commande confirmée !</h1>
      <p style={{fontSize:13,color:'#cbd5d2',marginBottom:24}}>
        Merci pour ta commande. Tes abonnements digitaux sont maintenant actifs dans ton compte.
      </p>
      <div style={{display:'flex',gap:10,justifyContent:'center'}}>
        <Link to="/compte" style={{padding:'10px 18px',background:'#1D9E75',color:'white',borderRadius:8,fontSize:13,fontWeight:500,textDecoration:'none'}}>
          Voir mes abonnements
        </Link>
        <Link to="/" style={{padding:'10px 18px',border:'0.5px solid rgba(255,255,255,0.3)',borderRadius:8,fontSize:13,color:'white',textDecoration:'none'}}>
          Continuer les achats
        </Link>
      </div>
    </div>
  );
}
