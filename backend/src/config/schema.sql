-- ============================================
-- LKM_BUSINESS — Schéma base de données PostgreSQL
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client','admin')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Catégories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('physical','digital'))
);

-- Produits
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id INTEGER REFERENCES categories(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  image_url TEXT,
  type VARCHAR(20) CHECK (type IN ('physical','digital')) NOT NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Formules IPTV / abonnements
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL,
  duration_days INTEGER NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Commandes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(30) DEFAULT 'pending'
    CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
  total NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(30),
  payment_id VARCHAR(255),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lignes de commande
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  plan_id UUID REFERENCES subscription_plans(id),
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  item_name VARCHAR(200) NOT NULL
);

-- Abonnements actifs (produits digitaux)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id),
  product_id UUID REFERENCES products(id),
  plan_id UUID REFERENCES subscription_plans(id),
  product_name VARCHAR(200) NOT NULL,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active','expired','cancelled')),
  notif_sent_2d BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_subscriptions_user   ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_expiry ON subscriptions(expiry_date);
CREATE INDEX idx_orders_user          ON orders(user_id);
CREATE INDEX idx_users_email          ON users(email);

-- ---- Données initiales ----
INSERT INTO categories (name, slug, type) VALUES
  ('Montres connectées','montres','physical'),
  ('Audio premium','audio','physical'),
  ('Accessoires','accessoires','physical'),
  ('Streaming','streaming','digital'),
  ('IPTV','iptv','digital');

INSERT INTO products (category_id, name, price, type, stock, image_url) VALUES
  (1,'HW11 Pro',25000,'physical',50,'/uploads/hw11pro.jpg'),
  (1,'HW16 Max',30000,'physical',30,'/uploads/hw16max.jpg'),
  (2,'JBL TUNE 720BT',35000,'physical',20,'/uploads/jbl720bt.jpg'),
  (2,'JBL TUNE 520BT',28000,'physical',25,'/uploads/jbl520bt.jpg'),
  (2,'AirPods Pro 2',85000,'physical',15,'/uploads/airpodspro2.jpg'),
  (2,'AirPods Pro 3',95000,'physical',10,'/uploads/airpodspro3.jpg'),
  (2,'AirPods 4',70000,'physical',20,'/uploads/airpods4.jpg'),
  (3,'Tripod Live',15000,'physical',40,'/uploads/tripod.jpg'),
  (4,'Netflix',2500,'digital',999,'/uploads/netflix.jpg'),
  (4,'Prime Video',2500,'digital',999,'/uploads/primevideo.jpg'),
  (4,'Crunchyroll',2000,'digital',999,'/uploads/crunchyroll.jpg'),
  (4,'Apple Music',1500,'digital',999,'/uploads/applemusic.jpg'),
  (5,'IPTV Premium',3500,'digital',999,'/uploads/iptv_premium.jpg'),
  (5,'IPTV Ultra Premium',4000,'digital',999,'/uploads/iptv_ultra.jpg');

DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM products WHERE name='IPTV Premium';
  INSERT INTO subscription_plans (product_id,label,duration_days,price) VALUES
    (pid,'1 mois',30,3500),(pid,'3 mois',90,9000),
    (pid,'6 mois',180,13500),(pid,'1 an',365,25000);

  SELECT id INTO pid FROM products WHERE name='IPTV Ultra Premium';
  INSERT INTO subscription_plans (product_id,label,duration_days,price) VALUES
    (pid,'1 mois',30,4000),(pid,'3 mois',90,11000),
    (pid,'6 mois',180,15000),(pid,'1 an',365,27500);
END $$;
