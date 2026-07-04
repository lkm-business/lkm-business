-- LKM_BUSINESS Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products (physical)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  badge VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions catalog
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'streaming' | 'iptv'
  price NUMERIC(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  is_active BOOLEAN DEFAULT true
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(30) DEFAULT 'pending',
  total NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(30) DEFAULT 'pending',
  payment_ref VARCHAR(255),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  plan_id UUID REFERENCES subscription_plans(id),
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  item_type VARCHAR(20) NOT NULL -- 'product' | 'subscription'
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES subscription_plans(id),
  order_id UUID REFERENCES orders(id),
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP NOT NULL,
  notified_2days BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_subs_user ON user_subscriptions(user_id);
CREATE INDEX idx_subs_expiry ON user_subscriptions(expiry_date);

-- Seed products
INSERT INTO products (name, description, price, category, badge, image_url) VALUES
('HW11 Pro', 'Montre connectée AMOLED 2.04", Bluetooth, 15 jours batterie', 25000, 'montres', 'Montre connectée', '/images/hw11pro.jpg'),
('HW16 Max', 'Montre connectée ronde Super AMOLED, charge sans fil', 30000, 'montres', 'Montre connectée', '/images/hw16max.jpg'),
('JBL TUNE 720BT', 'Casque sans fil 76h, Pure Bass Sound', 35000, 'audio', 'Casque sans fil', '/images/jbl720.jpg'),
('JBL TUNE 520BT', 'Casque sans fil 57h, Design Award 2023', 28000, 'audio', 'Casque sans fil', '/images/jbl520.jpg'),
('AirPods Pro 2', 'Écouteurs Apple ANC, boîtier USB-C', 85000, 'audio', 'Écouteurs Apple', '/images/airpodspro2.jpg'),
('AirPods Pro 3', 'Écouteurs Apple 2× ANC, capteur fréquence cardiaque', 95000, 'audio', 'Écouteurs Apple', '/images/airpodspro3.jpg'),
('AirPods 4', 'Écouteurs Apple, boîtier USB-C', 70000, 'audio', 'Écouteurs Apple', '/images/airpods4.jpg'),
('Tripod Live', 'Trépied 2.1M, kit streaming complet', 15000, 'accessoires', 'Accessoire', '/images/tripod.jpg');

-- Seed subscription plans
INSERT INTO subscription_plans (name, type, price, duration_days, description, icon) VALUES
('Netflix', 'streaming', 2500, 30, '1 utilisateur / mois', '🎬'),
('Prime Video', 'streaming', 2500, 30, '1 utilisateur / mois', '📺'),
('Crunchyroll', 'streaming', 2000, 30, '1 utilisateur / mois', '🍥'),
('Apple Music', 'streaming', 1500, 30, '1 utilisateur / mois', '🎵'),
('IPTV Premium — 1 mois', 'iptv', 3500, 30, '18 000 chaînes • 80 000 films', '📡'),
('IPTV Premium — 3 mois', 'iptv', 9000, 90, '18 000 chaînes • 80 000 films', '📡'),
('IPTV Premium — 6 mois', 'iptv', 13500, 180, '18 000 chaînes • 80 000 films', '📡'),
('IPTV Premium — 1 an', 'iptv', 25000, 365, '18 000 chaînes • 80 000 films', '📡'),
('IPTV Ultra Premium — 1 mois', 'iptv', 4000, 30, '23 000 chaînes 4K • 128 000 films', '🛰️'),
('IPTV Ultra Premium — 3 mois', 'iptv', 11000, 90, '23 000 chaînes 4K • 128 000 films', '🛰️'),
('IPTV Ultra Premium — 6 mois', 'iptv', 15000, 180, '23 000 chaînes 4K • 128 000 films', '🛰️'),
('IPTV Ultra Premium — 1 an', 'iptv', 27500, 365, '23 000 chaînes 4K • 128 000 films', '🛰️');
