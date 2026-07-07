-- ============================================
-- LKM_BUSINESS - Schéma Base de Données
-- PostgreSQL
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: utilisateurs
-- ============================================
CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  adresse TEXT,
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  est_verifie BOOLEAN DEFAULT FALSE,
  token_verification VARCHAR(255),
  cree_le TIMESTAMP DEFAULT NOW(),
  mis_a_jour_le TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('physique', 'numerique')),
  description TEXT
);

-- ============================================
-- TABLE: produits
-- ============================================
CREATE TABLE produits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  prix_promo DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  type VARCHAR(20) NOT NULL CHECK (type IN ('physique', 'numerique')),
  categorie_id INTEGER REFERENCES categories(id),
  image_principale VARCHAR(500),
  images JSONB DEFAULT '[]',
  est_actif BOOLEAN DEFAULT TRUE,
  cree_le TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE: formules_iptv (formules d'abonnements IPTV)
-- ============================================
CREATE TABLE formules_iptv (
  id SERIAL PRIMARY KEY,
  produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
  duree_label VARCHAR(50) NOT NULL, -- "1 mois", "3 mois", etc.
  duree_jours INTEGER NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  est_actif BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLE: commandes
-- ============================================
CREATE TABLE commandes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  utilisateur_id UUID REFERENCES utilisateurs(id),
  statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN (
    'en_attente', 'payee', 'en_traitement', 'expediee', 'livree', 'annulee'
  )),
  montant_total DECIMAL(10,2) NOT NULL,
  methode_paiement VARCHAR(50),
  statut_paiement VARCHAR(30) DEFAULT 'non_paye' CHECK (statut_paiement IN (
    'non_paye', 'paye', 'rembourse', 'echoue'
  )),
  reference_paiement VARCHAR(255),
  adresse_livraison JSONB,
  notes TEXT,
  cree_le TIMESTAMP DEFAULT NOW(),
  mis_a_jour_le TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE: lignes_commande
-- ============================================
CREATE TABLE lignes_commande (
  id SERIAL PRIMARY KEY,
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id),
  formule_iptv_id INTEGER REFERENCES formules_iptv(id),
  nom_produit VARCHAR(200) NOT NULL,
  quantite INTEGER DEFAULT 1,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  sous_total DECIMAL(10,2) NOT NULL
);

-- ============================================
-- TABLE: abonnements
-- ============================================
CREATE TABLE abonnements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  commande_id UUID REFERENCES commandes(id),
  produit_id UUID REFERENCES produits(id),
  formule_iptv_id INTEGER REFERENCES formules_iptv(id),
  nom_abonnement VARCHAR(200) NOT NULL,
  date_debut TIMESTAMP NOT NULL DEFAULT NOW(),
  date_expiration TIMESTAMP NOT NULL,
  statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'expire', 'suspendu', 'annule')),
  notif_2j_envoyee BOOLEAN DEFAULT FALSE,
  cree_le TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE: panier
-- ============================================
CREATE TABLE panier (
  id SERIAL PRIMARY KEY,
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id),
  formule_iptv_id INTEGER REFERENCES formules_iptv(id),
  quantite INTEGER DEFAULT 1,
  ajoute_le TIMESTAMP DEFAULT NOW(),
  UNIQUE(utilisateur_id, produit_id, formule_iptv_id)
);

-- ============================================
-- TABLE: avis
-- ============================================
CREATE TABLE avis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT NOT NULL,
  cree_le TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DONNÉES INITIALES: Catégories
-- ============================================
INSERT INTO categories (nom, slug, type) VALUES
  ('Montres connectées', 'montres-connectees', 'physique'),
  ('Audio premium', 'audio-premium', 'physique'),
  ('Accessoires', 'accessoires', 'physique'),
  ('Streaming', 'streaming', 'numerique'),
  ('IPTV', 'iptv', 'numerique');

-- ============================================
-- DONNÉES INITIALES: Produits physiques
-- ============================================
INSERT INTO produits (nom, slug, prix, type, categorie_id, stock) VALUES
  ('HW11 Pro', 'hw11-pro', 25000, 'physique', 1, 50),
  ('HW16 Max', 'hw16-max', 30000, 'physique', 1, 30),
  ('JBL TUNE 720BT', 'jbl-tune-720bt', 40000, 'physique', 2, 40),
  ('JBL TUNE 520BT', 'jbl-tune-520bt', 30000, 'physique', 2, 35),
  ('AirPods Pro 2', 'airpods-pro-2', 10000, 'physique', 2, 20),
  ('AirPods Pro 3', 'airpods-pro-3', 15000, 'physique', 2, 15),
  ('AirPods 4', 'airpods-4', 15000, 'physique', 2, 25),
  ('Tripod Live', 'tripod-live', 20000, 'physique', 3, 60),
  ('Lenovo LP75', 'lenovo-lp75', 15000, 'physique', 2, 30),
  ('HW11 Mini', 'hw11-mini', 25000, 'physique', 1, 30);

-- ============================================
-- DONNÉES INITIALES: Produits numériques (streaming)
-- ============================================
INSERT INTO produits (nom, slug, prix, type, categorie_id, stock) VALUES
  ('Netflix', 'netflix', 2500, 'numerique', 4, 9999),
  ('Prime Video', 'prime-video', 2500, 'numerique', 4, 9999),
  ('Crunchyroll', 'crunchyroll', 2000, 'numerique', 4, 9999),
  ('Apple Music', 'apple-music', 1500, 'numerique', 4, 9999);

-- ============================================
-- DONNÉES INITIALES: IPTV + formules
-- ============================================
INSERT INTO produits (nom, slug, prix, type, categorie_id, stock) VALUES
  ('IPTV Premium', 'iptv-premium', 3500, 'numerique', 5, 9999),
  ('IPTV Ultra Premium', 'iptv-ultra-premium', 4000, 'numerique', 5, 9999);

-- Formules IPTV Premium (produit_id à adapter après INSERT)
INSERT INTO formules_iptv (produit_id, duree_label, duree_jours, prix)
SELECT id, '1 mois', 30, 3500 FROM produits WHERE slug='iptv-premium'
UNION ALL
SELECT id, '3 mois', 90, 9000 FROM produits WHERE slug='iptv-premium'
UNION ALL
SELECT id, '6 mois', 180, 13500 FROM produits WHERE slug='iptv-premium'
UNION ALL
SELECT id, '1 an', 365, 25000 FROM produits WHERE slug='iptv-premium';

-- Formules IPTV Ultra Premium
INSERT INTO formules_iptv (produit_id, duree_label, duree_jours, prix)
SELECT id, '1 mois', 30, 4000 FROM produits WHERE slug='iptv-ultra-premium'
UNION ALL
SELECT id, '3 mois', 90, 11000 FROM produits WHERE slug='iptv-ultra-premium'
UNION ALL
SELECT id, '6 mois', 180, 15000 FROM produits WHERE slug='iptv-ultra-premium'
UNION ALL
SELECT id, '1 an', 365, 27500 FROM produits WHERE slug='iptv-ultra-premium';

-- ============================================
-- INDEX pour les performances
-- ============================================
CREATE INDEX idx_abonnements_user ON abonnements(utilisateur_id);
CREATE INDEX idx_abonnements_expiration ON abonnements(date_expiration);
CREATE INDEX idx_commandes_user ON commandes(utilisateur_id);
CREATE INDEX idx_produits_type ON produits(type);
CREATE INDEX idx_avis_date ON avis(cree_le);

-- ============================================
-- DONNÉES: images produits réelles
-- ============================================
UPDATE produits SET image_principale = '/images/airpods4.webp' WHERE slug = 'airpods-4';
UPDATE produits SET image_principale = '/images/airpodspro2.jpg' WHERE slug = 'airpods-pro-2';
UPDATE produits SET image_principale = '/images/airpodspro3.jpg' WHERE slug = 'airpods-pro-3';
UPDATE produits SET image_principale = '/images/jbl520.jpeg' WHERE slug = 'jbl-tune-520bt';
UPDATE produits SET image_principale = '/images/jbl720.jpeg' WHERE slug = 'jbl-tune-720bt';
UPDATE produits SET image_principale = '/images/tripod.jpeg' WHERE slug = 'tripod-live';
UPDATE produits SET image_principale = '/images/lp75.jpg' WHERE slug = 'lenovo-lp75';
UPDATE produits SET image_principale = '/images/hw11mini.jpeg' WHERE slug = 'hw11-mini';
UPDATE produits SET image_principale = '/images/hw11pro.jpeg' WHERE slug = 'hw11-pro';
UPDATE produits SET image_principale = '/images/hw16.jpeg' WHERE slug = 'hw16-max';
UPDATE produits SET image_principale = '/images/applemusic.jpg' WHERE slug = 'apple-music';
UPDATE produits SET image_principale = '/images/crunchyroll.jpeg' WHERE slug = 'crunchyroll';
UPDATE produits SET image_principale = '/images/primevideo.jpg' WHERE slug = 'prime-video';
UPDATE produits SET image_principale = '/images/iptv.jpg' WHERE slug IN ('iptv-premium', 'iptv-ultra-premium');
