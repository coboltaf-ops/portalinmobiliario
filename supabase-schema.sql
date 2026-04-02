-- ============================================
-- PORTAL INMOBILIARIO - Schema para Supabase
-- ============================================

-- Tabla: configuracion (tablas de referencia)
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  nombre TEXT NOT NULL,
  simbolo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: empresa
CREATE TABLE IF NOT EXISTS empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo_identificacion TEXT DEFAULT '',
  nro_documento TEXT DEFAULT '',
  correo TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  direccion TEXT DEFAULT '',
  ciudad TEXT DEFAULT '',
  pais TEXT DEFAULT '',
  representante_legal TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  imagen TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario TEXT UNIQUE NOT NULL,
  clave TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT DEFAULT 'Usuario',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar usuario admin por defecto
INSERT INTO usuarios (usuario, clave, nombre, rol) VALUES ('admin', 'admin', 'Administrador', 'Admin')
ON CONFLICT (usuario) DO NOTHING;

-- Tabla: comerciales
CREATE TABLE IF NOT EXISTS comerciales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT DEFAULT '',
  correo TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  movil TEXT DEFAULT '',
  cargo TEXT DEFAULT '',
  departamento TEXT DEFAULT '',
  zona_asignada TEXT DEFAULT '',
  foto TEXT DEFAULT '',
  situacion TEXT DEFAULT 'Activo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: propiedades
CREATE TABLE IF NOT EXISTS propiedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nro_propiedad SERIAL,
  codigo TEXT UNIQUE NOT NULL,
  urbanizacion TEXT DEFAULT '',
  nro_apto_casa TEXT DEFAULT '',
  tipo_propiedad TEXT DEFAULT '',
  modalidad TEXT DEFAULT 'Venta',
  precio_venta NUMERIC DEFAULT 0,
  precio_alquiler NUMERIC DEFAULT 0,
  tipo_moneda TEXT DEFAULT 'USD',
  area_m2 NUMERIC DEFAULT 0,
  habitaciones INT DEFAULT 0,
  banos INT DEFAULT 0,
  estacionamientos INT DEFAULT 0,
  balcones INT DEFAULT 0,
  cuarto_ropas BOOLEAN DEFAULT false,
  cuarto_servicio BOOLEAN DEFAULT false,
  amenidades TEXT DEFAULT '',
  direccion TEXT DEFAULT '',
  ciudad TEXT DEFAULT '',
  zona TEXT DEFAULT '',
  estado TEXT DEFAULT 'Disponible',
  asesor_asignado UUID REFERENCES comerciales(id),
  descripcion TEXT DEFAULT '',
  imagenes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT DEFAULT '',
  correo TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  movil TEXT DEFAULT '',
  tipo TEXT DEFAULT '',
  interes TEXT DEFAULT '',
  presupuesto_min NUMERIC DEFAULT 0,
  presupuesto_max NUMERIC DEFAULT 0,
  tipo_moneda TEXT DEFAULT 'USD',
  zona_preferida TEXT DEFAULT '',
  tipo_propiedad_buscada TEXT DEFAULT '',
  asesor_asignado TEXT DEFAULT '',
  observaciones TEXT DEFAULT '',
  situacion TEXT DEFAULT 'Activo',
  imagen TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  fecha TEXT DEFAULT '',
  nombre TEXT NOT NULL,
  apellido TEXT DEFAULT '',
  correo TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  mensaje TEXT DEFAULT '',
  origen TEXT DEFAULT '',
  propiedad_id UUID REFERENCES propiedades(id),
  estado TEXT DEFAULT 'Nueva',
  comercial_asignado TEXT DEFAULT '',
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nro_cotizacion TEXT UNIQUE NOT NULL,
  fecha TEXT DEFAULT '',
  cliente_id UUID REFERENCES clientes(id),
  propiedad_id UUID REFERENCES propiedades(id),
  comercial_id TEXT DEFAULT '',
  tipo_moneda TEXT DEFAULT 'USD',
  precio_ofertado NUMERIC DEFAULT 0,
  condiciones_pago TEXT DEFAULT '',
  observaciones TEXT DEFAULT '',
  situacion TEXT DEFAULT 'Pendiente',
  imagen TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nro_contrato TEXT UNIQUE NOT NULL,
  tipo TEXT DEFAULT 'Venta',
  fecha TEXT DEFAULT '',
  cliente_id UUID REFERENCES clientes(id),
  propiedad_id UUID REFERENCES propiedades(id),
  comercial_id TEXT DEFAULT '',
  tipo_moneda TEXT DEFAULT 'USD',
  monto NUMERIC DEFAULT 0,
  plazo INT DEFAULT 0,
  fecha_inicio TEXT DEFAULT '',
  fecha_fin TEXT DEFAULT '',
  condiciones TEXT DEFAULT '',
  observaciones TEXT DEFAULT '',
  situacion TEXT DEFAULT 'Borrador',
  imagen TEXT DEFAULT '',
  documentos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: correos_enviados
CREATE TABLE IF NOT EXISTS correos_enviados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TEXT DEFAULT '',
  hora TEXT DEFAULT '',
  destinatario TEXT DEFAULT '',
  asunto TEXT DEFAULT '',
  mensaje TEXT DEFAULT '',
  consecutivo TEXT DEFAULT '',
  estado TEXT DEFAULT 'Enviado',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Habilitar RLS (Row Level Security)
-- Permitir acceso publico por ahora
-- ============================================

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE comerciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE correos_enviados ENABLE ROW LEVEL SECURITY;

-- Politicas de acceso publico (para desarrollo)
CREATE POLICY "Allow all" ON configuracion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON empresa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON comerciales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON propiedades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON solicitudes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cotizaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON contratos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON correos_enviados FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Insertar datos de referencia por defecto
-- ============================================

-- Tipos de propiedad
INSERT INTO configuracion (tabla, nombre) VALUES
  ('tiposPropiedad', 'Casa'), ('tiposPropiedad', 'Apartamento'), ('tiposPropiedad', 'Local Comercial'),
  ('tiposPropiedad', 'Oficina'), ('tiposPropiedad', 'Terreno'), ('tiposPropiedad', 'Townhouse');

-- Monedas
INSERT INTO configuracion (tabla, nombre, simbolo) VALUES
  ('monedas', 'USD', '$'), ('monedas', 'VES', 'Bs'), ('monedas', 'COP', '$'), ('monedas', 'EUR', '€');

-- Zonas
INSERT INTO configuracion (tabla, nombre) VALUES
  ('zonas', 'Norte'), ('zonas', 'Sur'), ('zonas', 'Este'), ('zonas', 'Oeste'), ('zonas', 'Centro');

-- Ciudades
INSERT INTO configuracion (tabla, nombre) VALUES
  ('ciudades', 'Caracas'), ('ciudades', 'Valencia'), ('ciudades', 'Maracaibo'), ('ciudades', 'Barquisimeto');

-- Paises
INSERT INTO configuracion (tabla, nombre) VALUES
  ('paises', 'Venezuela'), ('paises', 'Colombia'), ('paises', 'Estados Unidos'), ('paises', 'Espana');

-- Situaciones propiedad
INSERT INTO configuracion (tabla, nombre) VALUES
  ('situacionesPropiedad', 'Disponible'), ('situacionesPropiedad', 'Reservada'), ('situacionesPropiedad', 'Vendida'), ('situacionesPropiedad', 'Alquilada');

-- Tipos identificacion
INSERT INTO configuracion (tabla, nombre) VALUES
  ('tiposIdentificacion', 'Cedula'), ('tiposIdentificacion', 'RIF'), ('tiposIdentificacion', 'Pasaporte'), ('tiposIdentificacion', 'NIT');

-- Origenes solicitud
INSERT INTO configuracion (tabla, nombre) VALUES
  ('origenesSolicitud', 'Pagina Web'), ('origenesSolicitud', 'Redes Sociales'), ('origenesSolicitud', 'Referido'),
  ('origenesSolicitud', 'Llamada Telefonica'), ('origenesSolicitud', 'Visita Oficina'), ('origenesSolicitud', 'Portal Inmobiliario');
