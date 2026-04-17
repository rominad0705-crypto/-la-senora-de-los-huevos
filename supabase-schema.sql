-- =============================================
-- LA SEÑORA DE LOS HUEVOS - Database Schema
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  zone TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'particular' CHECK (type IN ('particular', 'negocio')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  unit_size INTEGER NOT NULL DEFAULT 30,
  price_particular NUMERIC NOT NULL,
  price_negocio NUMERIC,
  active BOOLEAN DEFAULT TRUE
);

-- Insertar productos iniciales
INSERT INTO products (name, description, unit_size, price_particular, price_negocio) VALUES
  ('Maple 30 Medianos', 'Maple de 30 huevos medianos', 30, 6500, 6000),
  ('Maple 30 Grandes', 'Maple de 30 huevos grandes', 30, 8500, 8000),
  ('Medio Maple 15 XG', 'Medio maple de 15 huevos extra grandes', 15, 6000, NULL);

-- Pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'entregado', 'pagado')),
  payment_method TEXT CHECK (payment_method IN ('efectivo', 'transferencia')),
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de pedido
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL
);

-- Producción diaria (postura)
CREATE TABLE daily_production (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  medium_eggs INTEGER NOT NULL DEFAULT 0,
  large_eggs INTEGER NOT NULL DEFAULT 0,
  xl_eggs INTEGER NOT NULL DEFAULT 0,
  total_eggs INTEGER GENERATED ALWAYS AS (medium_eggs + large_eggs + xl_eggs) STORED,
  notes TEXT DEFAULT ''
);

-- Stock
CREATE TABLE stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  medium_stock INTEGER NOT NULL DEFAULT 0,
  large_stock INTEGER NOT NULL DEFAULT 0,
  xl_stock INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inversiones
CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL,
  notes TEXT DEFAULT ''
);

-- Gastos
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL,
  notes TEXT DEFAULT ''
);

-- Sanidad / Mortandad
CREATE TABLE mortality (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity INTEGER NOT NULL DEFAULT 1,
  cause TEXT DEFAULT '',
  notes TEXT DEFAULT ''
);

-- Habilitar Row Level Security (pero permitir todo por ahora)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortality ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (sin auth por ahora)
CREATE POLICY "Allow all" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON daily_production FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON investments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON mortality FOR ALL USING (true) WITH CHECK (true);
