# LKM_BUSINESS — Notes pour Claude Code

Site e-commerce (Sénégal) vendant des produits tech physiques (montres connectées,
audio, accessoires) et des abonnements numériques (streaming, IPTV). Slogan : "Toi-même
faut voir".

## Stack

- **Frontend** : React 18 (Create React App), React Router v6, styles inline (pas de
  framework CSS), quelques classes utilitaires dans `frontend/src/index.css`.
- **Backend** : Node.js + Express, PostgreSQL (via `pg`), JWT pour l'auth.
- **Bases de données** : Postgres local pour le dev, Neon (serverless Postgres) en
  production.
- **Déploiement** : Vercel (frontend), Render (backend, plan gratuit — pas d'IP de
  sortie fixe garantie), GitHub (`lkm-business/lkm-business`, branche `main`).

## Conventions importantes

- **Tout est en français** : schéma DB, routes, variables (`produits`, `utilisateurs`,
  `commandes`, `abonnements`, `nom`, `prix`, `telephone`...). Rester cohérent.
- **Thème sombre partout**, pas de fond blanc — palette : `#1D9E75` (vert primaire),
  `#2DD4A7` (accent menthe), `#0F6E56` (vert foncé), cartes `#111`/`#1a1a1a`.
- Styles en objets inline JS, pas de CSS-in-JS lib.
- JWT payload = `{ id, email, role }` uniquement (pas `nom` — le récupérer en DB si besoin
  côté backend).

## Structure backend

- `backend/server.js` — point d'entrée, monte les routes sous `/api/*`.
- `backend/middleware/auth.js` — exige un JWT valide.
- `backend/middleware/authOptionnelle.js` — vérifie le JWT s'il existe, sinon
  `req.user = null` (utilisé pour le checkout invité).
- `backend/middleware/estAdmin.js` — exige `req.user.role === 'admin'`.
- `backend/routes/` — une route par ressource (`produits`, `commandes`, `paiements`,
  `abonnements`, `auth`, `categories`, `avis`, `panier`).
- `backend/services/email.js` — notifications par email (Gmail SMTP via nodemailer).
  **Fonctionne.**
- `backend/services/whatsapp.js` — notifications WhatsApp via CallMeBot. **Ne
  fonctionne pas** — jamais reçu de clé API malgré plusieurs tentatives. Le code est en
  place et no-op silencieusement si `CALLMEBOT_API_KEY` est absent. Ne pas perdre de
  temps dessus sans nouvelle info de l'utilisateur.

## Structure frontend

- `frontend/src/pages/` — une page par route.
- `frontend/src/components/ProductCard.jsx` / `ProductModal.jsx` — produits physiques et
  abonnements simples (pas IPTV).
- `frontend/src/components/IptvCard.jsx` — produits IPTV (sélecteur de formule dédié).
- `frontend/src/components/IptvSetupForm.jsx` — questionnaire de configuration IPTV au
  checkout (appareil, marque/système TV, appli existante ou à choisir).
- `frontend/src/utils/iptv.js` — règle partagée `estPayanteSeule(marque, systeme)` :
  force une appli payante uniquement (IBO Player / SmartOne) pour LG+WebOS,
  Samsung+Tizen, ou n'importe laquelle des trois marques (LG/Samsung/Hisense) sous VIDAA.
- `frontend/src/context/CartContext.js` — panier en mémoire (pas de persistance
  localStorage), items identifiés par `produit.id[-formule.id][-couleur]`.
- `frontend/src/utils/colors.js` — table de correspondance nom de couleur → hex pour les
  pastilles de couleur produit.

## Paiement — CinetPay (API v1)

Remplace un ancien flux cassé (lien Wave manuel, écran "envoie à ce numéro" pour Orange
Money, boutons Stripe/PayPal jamais branchés). Un seul flux "Payer en ligne" couvre
Wave, Orange Money, Free Money et carte sur une page hébergée CinetPay.

- Auth : `POST {CINETPAY_BASE_URL}/v1/oauth/login` avec `{api_key, api_password}` →
  jeton bearer mis en cache jusqu'à expiration (voir `backend/routes/paiements.js`).
- Paiement : `POST {CINETPAY_BASE_URL}/v1/payment` avec le jeton, retourne un
  `payment_url` vers lequel rediriger le client.
- `client_email` est **requis par l'API CinetPay** même si le site ne l'exige plus côté
  client — un email `inviteXXXXXXXX@lkmbusiness.com` est généré à partir du téléphone si
  l'invité n'en a pas fourni.
- ⚠️ **Piège connu** : CinetPay filtre par liste blanche d'IP. Render (plan gratuit) n'a
  pas d'IP de sortie garantie à 100% stable. Si un client signale "Erreur paiement", la
  cause la plus probable est que l'IP de sortie de Render n'est plus dans la liste
  blanche CinetPay. Diagnostic : `GET /api/health/ip-sortante` sur le backend renvoie
  l'IP actuelle — la comparer à la liste blanche dans le dashboard CinetPay (API &
  sécurité → Liste Blanche IP) et la réajouter si besoin. Solution durable non mise en
  place : IP dédiée Render (payant, plan Pro) ou migration vers un agrégateur sans
  restriction d'IP (PayDunya envisagé mais bloqué par l'utilisateur sur un souci
  d'inscription).

## Commande sans compte (invité)

`POST /api/commandes` et `POST /api/paiements/cinetpay` acceptent les deux via
`authOptionnelle`. Sans compte, le body doit contenir `client: {nom, telephone, email?}`
(nom + téléphone obligatoires, email optionnel). Les infos invité sont stockées dans
`commandes.adresse_livraison` (JSONB) sous la clé `client`, pas dans une colonne dédiée.

## Notifications admin

`backend/routes/commandes.js` envoie un email à l'admin (jamais de WhatsApp fonctionnel)
quand : la commande est passée sans compte (à valider/préparer manuellement), OU elle
contient un produit numérique (accès à créer). Le message inclut la config IPTV si
présente (`adresse_livraison.iptv`).

## Déploiement — vérifier après un push

Après chaque push sur `main`, Vercel et Render redéploient automatiquement. Pour
vérifier par API (jetons dans les variables d'env de la session, pas commités) :

```
GET https://api.vercel.com/v9/projects/{projectId}  → latestDeployments[0].readyState
GET https://api.render.com/v1/services/{serviceId}/deploys?limit=1 → deploy.status
```

Le jeton Vercel expire régulièrement (ré-auth SAML) — demander un nouveau jeton à
l'utilisateur sur https://vercel.com/account/tokens si les appels échouent avec
`forbidden`.

## Autres docs

- `docs/GUIDE_DEPLOIEMENT.md` — guide de déploiement pas à pas (Vercel/Render/Neon).
- `README.md` — démarrage rapide en local.
