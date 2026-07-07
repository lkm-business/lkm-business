export function OrangeMoneyIcon() {
  return <img src="/images/OM.jpeg" alt="Orange Money" width="36" height="24" style={{borderRadius: 4, objectFit: 'cover'}} />;
}

export function WaveIcon() {
  return <img src="/images/wave.png" alt="Wave" width="36" height="24" style={{borderRadius: 4, objectFit: 'cover'}} />;
}

export function StripeIcon() {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
      <rect width="36" height="24" rx="4" fill="#635BFF" />
      <text x="18" y="17" textAnchor="middle" fontSize="13" fontWeight="700" fontStyle="italic" fill="white" fontFamily="Georgia, serif">S</text>
    </svg>
  );
}

export function PaypalIcon() {
  return <img src="/images/paypal.jpeg" alt="PayPal" width="36" height="24" style={{borderRadius: 4, objectFit: 'cover'}} />;
}

export function VisaIcon() {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
      <rect width="36" height="24" rx="4" fill="#1A1F71" />
      <text x="18" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fontStyle="italic" fill="white" fontFamily="Arial, sans-serif">VISA</text>
    </svg>
  );
}

export function MastercardIcon() {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
      <rect width="36" height="24" rx="4" fill="white" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="23" cy="12" r="7" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
  );
}

export function TruckIcon() {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" aria-label="Paiement à la livraison">
      <rect width="36" height="24" rx="4" fill="rgba(255,255,255,0.15)" />
      <g fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="8" width="14" height="8" />
        <path d="M19 11h5l4 3v2h-9z" />
        <circle cx="12" cy="19" r="1.8" fill="white" stroke="none" />
        <circle cx="25" cy="19" r="1.8" fill="white" stroke="none" />
      </g>
    </svg>
  );
}
