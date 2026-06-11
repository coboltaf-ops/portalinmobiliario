-- Crear tabla modulos
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Insertar módulos existentes
INSERT INTO modulos (nombre, slug, activo, orden, descripcion) VALUES
('Dashboard', 'dashboard', true, 0, 'Panel principal'),
('Propiedades', 'propiedades', true, 1, 'Gestión de propiedades'),
('Clientes', 'clientes', true, 2, 'Base de datos de clientes'),
('Comerciales', 'comerciales', true, 3, 'Gestión de comerciales'),
('Solicitudes', 'solicitudes', true, 4, 'Solicitudes de propiedad'),
('Cotizaciones', 'cotizaciones', true, 5, 'Cotizaciones'),
('Contratos', 'contratos', true, 6, 'Gestión de contratos'),
('Correos Enviados', 'correos-enviados', true, 7, 'Historial de correos'),
('Datos Empresa', 'datos-empresa', true, 8, 'Información de la empresa'),
('Configuración', 'configuracion', true, 9, 'Configuración del sistema'),
('Módulos', 'modulos', true, 10, 'Gestión de módulos del sistema')
ON CONFLICT (slug) DO NOTHING;

-- Habilitar RLS si es necesario
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
