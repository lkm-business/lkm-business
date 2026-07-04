# 🚀 Guide de déploiement — LKM_BUSINESS

## Stack technique
- **Frontend** : React 18 → hébergé sur **Vercel** (gratuit)
- **Backend** : Node.js + Express → hébergé sur **Railway** (gratuit jusqu'à 500h/mois)
- **Base de données** : PostgreSQL → hébergé sur **Railway** ou **Neon** (gratuit)
- **Emails** : Gmail SMTP (gratuit jusqu'à 500 emails/jour)

---

## ÉTAPE 1 — Préparer la base de données PostgreSQL

### Option A : Railway (recommandé, gratuit)
1. Va sur https://railway.app → Créer un compte
2. New Project → Add Service → Database → PostgreSQL
3. Copie la `DATABASE_URL` depuis les variables d'environnement
4. Dans l'onglet "Query", colle et exécute le contenu du fichier `backend/src/schema.sql`

### Option B : Neon (autre option gratuite)
1. Va sur https://neon.tech → Créer un compte
2. New Project → copie la connection string
3. Ouvre SQL Editor → colle le contenu de `schema.sql`

---

## ÉTAPE 2 — Déployer le Backend sur Railway

1. Va sur https://railway.app → New Project → Deploy from GitHub repo
2. Connecte ton GitHub et sélectionne le dossier `backend/`
3. Ajoute les variables d'environnement :

```
PORT=5000
NODE_ENV=production
DATABASE_URL=<ta_database_url>
JWT_SECRET=<clé_secrète_longue_et_aléatoire>
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<ton_gmail>
SMTP_PASS=<ton_app_password_gmail>
FROM_EMAIL=<ton_gmail>
FROM_NAME=LKM_BUSINESS
STRIPE_SECRET_KEY=sk_test_<ta_clé_stripe>
FRONTEND_URL=https://lkm-business.vercel.app
```

4. Railway génère automatiquement une URL genre : `https://lkm-business-api.railway.app`

---

## ÉTAPE 3 — Déployer le Frontend sur Vercel

1. Va sur https://vercel.com → New Project → Import GitHub
2. Sélectionne le dossier `frontend/`
3. Framework : Create React App
4. Ajoute la variable d'environnement :
```
REACT_APP_API_URL=https://lkm-business-api.railway.app/api
```
5. Clique Deploy → ton site sera sur `https://lkm-business.vercel.app`

---

## ÉTAPE 4 — Configurer le nom de domaine (optionnel)

### Acheter un domaine
- **Namecheap** : environ 8$/an pour `.com` → https://www.namecheap.com
- **Infomaniak** : option francophone → https://www.infomaniak.com

### Connecter à Vercel
1. Vercel → ton projet → Settings → Domains
2. Ajoute ton domaine (ex: `lkmbusiness.sn`)
3. Copie les DNS records et configure-les chez ton registrar

---

## ÉTAPE 5 — Paiements

### Stripe (cartes bancaires)
1. Créer un compte sur https://stripe.com
2. Récupère ta clé secrète dans Dashboard → API Keys
3. Met à jour `STRIPE_SECRET_KEY` dans les variables Railway

### Orange Money Sénégal
1. Contacter Orange Money Business : https://developer.orange.com/apis/om-webpay-sen
2. Ou appeler le service marchand Orange au **+221 33 825 00 00**
3. Demander un compte "Orange Money Web Payment"
4. Tu recevras un `merchant_key` et `merchant_secret`
5. Mettre à jour le fichier `backend/src/routes/payments.js`

### Wave Sénégal
1. Créer un compte Wave Business : https://www.wave.com/en/business/
2. Accéder à l'API : https://docs.wave.com
3. Récupérer ta clé API et mettre à jour `payments.js`

---

## ÉTAPE 6 — Configurer Gmail pour les emails

1. Va dans ton compte Gmail → Paramètres → Sécurité
2. Active "Validation en 2 étapes"
3. Génère un "Mot de passe d'application" pour l'app "Mail"
4. Utilise ce mot de passe dans `SMTP_PASS`

---

## ÉTAPE 7 — Passer en production

1. Dans Stripe, active le mode "Live" et remplace les clés test par les clés live
2. Change `NODE_ENV=production` dans Railway
3. Mets à jour `FRONTEND_URL` avec ton vrai domaine

---

## Résumé des coûts mensuels

| Service | Coût |
|---------|------|
| Vercel (frontend) | Gratuit |
| Railway (backend + BDD) | Gratuit jusqu'à 500h puis ~5$/mois |
| Neon (BDD alternative) | Gratuit |
| Nom de domaine | ~8$/an (~5 000 FCFA/an) |
| Gmail SMTP | Gratuit |
| **Total** | **~0 à 5$/mois au démarrage** |

---

## Structure des fichiers

```
lkm_business/
├── backend/
│   ├── src/
│   │   ├── index.js          ← Point d'entrée API
│   │   ├── db.js             ← Connexion PostgreSQL
│   │   ├── schema.sql        ← Structure base de données
│   │   ├── routes/
│   │   │   ├── auth.js       ← Inscription / Connexion
│   │   │   ├── products.js   ← Produits & abonnements
│   │   │   ├── orders.js     ← Commandes
│   │   │   ├── subscriptions.js ← Gestion abonnements
│   │   │   ├── payments.js   ← Paiements
│   │   │   └── admin.js      ← Panel admin
│   │   ├── middleware/
│   │   │   └── auth.js       ← Vérification JWT
│   │   └── services/
│   │       └── notificationService.js ← Emails automatiques
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx            ← Application principale
    │   ├── api.js             ← Client HTTP
    │   ├── styles.css         ← Styles globaux
    │   ├── context/
    │   │   ├── AuthContext.jsx ← Gestion authentification
    │   │   └── CartContext.jsx ← Gestion panier
    │   └── pages/
    │       ├── Home.jsx       ← Page boutique
    │       ├── Account.jsx    ← Compte / Dashboard
    │       └── Checkout.jsx   ← Page commande
    └── package.json
```
