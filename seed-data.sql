INSERT INTO comerciales (id, codigo, nombre, apellido, correo, telefono, movil, cargo, departamento, zona_asignada, situacion) VALUES
('c1000001-0000-0000-0000-000000000001', 'COM-00001', 'Carlos', 'Martinez', 'carlos@inmobiliaria.com', '0212-5551234', '0414-5551234', 'Asesor Senior', 'Ventas', 'Norte', 'Activo'),
('c1000001-0000-0000-0000-000000000002', 'COM-00002', 'Maria', 'Rodriguez', 'maria@inmobiliaria.com', '0212-5555678', '0424-5555678', 'Asesora', 'Ventas', 'Sur', 'Activo'),
('c1000001-0000-0000-0000-000000000003', 'COM-00003', 'Jose', 'Lopez', 'jose@inmobiliaria.com', '0212-5559012', '0416-5559012', 'Asesor Junior', 'Alquileres', 'Este', 'Activo');

INSERT INTO empresa (id, nombre, tipo_identificacion, nro_documento, correo, telefono, direccion, ciudad, pais, representante_legal) VALUES
('e1000001-0000-0000-0000-000000000001', 'Inmobiliaria Premium VE', 'RIF', 'J-12345678-9', 'info@inmobiliariapremium.com', '0212-9876543', 'Av. Libertador, Torre Premium, Piso 8', 'Caracas', 'Venezuela', 'Pedro Gonzalez');

INSERT INTO propiedades (id, codigo, urbanizacion, nro_apto_casa, tipo_propiedad, modalidad, precio_venta, precio_alquiler, tipo_moneda, area_m2, habitaciones, banos, estacionamientos, balcones, cuarto_ropas, cuarto_servicio, amenidades, direccion, ciudad, zona, estado, descripcion) VALUES
('a1000001-0000-0000-0000-000000000001', 'PROP-00001', 'Los Palos Grandes', 'Apto 4-B', 'Apartamento', 'Venta', 185000, 0, 'USD', 120, 3, 2, 2, 1, true, true, 'Piscina, Gimnasio, Areas Verdes, Vigilancia 24h', 'Calle Los Jabillos, Edif. Torre Azul', 'Caracas', 'Norte', 'Disponible', 'Hermoso apartamento con vista panoramica'),
('a1000001-0000-0000-0000-000000000002', 'PROP-00002', 'El Hatillo', 'Casa 15', 'Casa', 'Venta', 320000, 0, 'USD', 280, 4, 3, 3, 2, true, true, 'Jardin, BBQ, Piscina Privada, Seguridad', 'Calle La Colina, Sector Las Mercedes', 'Caracas', 'Sur', 'Disponible', 'Espectacular casa con amplios espacios y piscina'),
('a1000001-0000-0000-0000-000000000003', 'PROP-00003', 'La Trigalena', 'Apto 7-A', 'Apartamento', 'Alquiler', 0, 850, 'USD', 95, 2, 2, 1, 1, false, false, 'Piscina, Parque Infantil, Vigilancia', 'Av. Bolivar Norte, Res. Monte Verde', 'Valencia', 'Norte', 'Disponible', 'Apartamento moderno en excelente ubicacion'),
('a1000001-0000-0000-0000-000000000004', 'PROP-00004', 'Prebo', 'Local 3', 'Local Comercial', 'Venta y Alquiler', 95000, 1200, 'USD', 150, 0, 1, 2, 0, false, false, 'Estacionamiento Amplio, Seguridad', 'Av. Andres Eloy Blanco, C.C. Valencia Plaza', 'Valencia', 'Centro', 'Disponible', 'Local comercial en zona de alto trafico'),
('a1000001-0000-0000-0000-000000000005', 'PROP-00005', 'Santa Fe', 'TH-22', 'Townhouse', 'Venta', 145000, 0, 'USD', 180, 3, 2, 2, 0, true, true, 'Areas Verdes, Parque, Vigilancia 24h', 'Calle Principal, Conj. Res. Santa Fe', 'Barquisimeto', 'Este', 'Disponible', 'Townhouse con excelentes acabados, 2 niveles'),
('a1000001-0000-0000-0000-000000000006', 'PROP-00006', 'Colinas de Bello Monte', 'PH-1', 'Apartamento', 'Venta', 250000, 0, 'USD', 200, 4, 3, 2, 2, true, true, 'Piscina, Gimnasio, Sauna, Salon de Fiestas', 'Av. Principal, Torre Bella Vista', 'Caracas', 'Este', 'Reservada', 'Penthouse con terraza privada y vista a la ciudad');

INSERT INTO clientes (id, codigo, nombre, apellido, correo, telefono, movil, tipo, interes, presupuesto_min, presupuesto_max, tipo_moneda, zona_preferida, tipo_propiedad_buscada, observaciones, situacion) VALUES
('b1000001-0000-0000-0000-000000000001', 'CLI-00001', 'Ana', 'Garcia', 'ana.garcia@gmail.com', '0212-3334455', '0414-3334455', 'Comprador', 'Apartamento', 100000, 200000, 'USD', 'Norte', 'Apartamento', 'Busca apartamento con vista, minimo 3 habitaciones', 'Activo'),
('b1000001-0000-0000-0000-000000000002', 'CLI-00002', 'Roberto', 'Fernandez', 'roberto.f@hotmail.com', '0241-7778899', '0424-7778899', 'Comprador', 'Casa', 250000, 400000, 'USD', 'Sur', 'Casa', 'Familia de 5, necesita minimo 4 habitaciones', 'Activo'),
('b1000001-0000-0000-0000-000000000003', 'CLI-00003', 'Laura', 'Mendez', 'laura.mendez@yahoo.com', '', '0416-1112233', 'Inquilino', 'Apartamento', 500, 1000, 'USD', 'Norte', 'Apartamento', 'Busca alquiler temporal por 1 ano', 'Activo'),
('b1000001-0000-0000-0000-000000000004', 'CLI-00004', 'Miguel', 'Torres', 'miguel.torres@gmail.com', '0251-4445566', '0414-4445566', 'Comprador', 'Townhouse', 120000, 160000, 'USD', 'Este', 'Townhouse', 'Interesado en Barquisimeto', 'Prospecto');

INSERT INTO solicitudes (id, codigo, fecha, nombre, apellido, correo, telefono, mensaje, origen, propiedad_id, estado, notas) VALUES
('d1000001-0000-0000-0000-000000000001', 'SOL-00001', '02/04/2026', 'Pedro', 'Ramirez', 'pedro.r@gmail.com', '0414-9998877', 'Estoy interesado en el apartamento de Los Palos Grandes', 'Pagina Web', 'a1000001-0000-0000-0000-000000000001', 'Nueva', ''),
('d1000001-0000-0000-0000-000000000002', 'SOL-00002', '02/04/2026', 'Carmen', 'Diaz', 'carmen.diaz@hotmail.com', '0424-6665544', 'Me interesa la casa en El Hatillo', 'Redes Sociales', 'a1000001-0000-0000-0000-000000000002', 'En Atencion', 'Se agendo visita para el sabado');

INSERT INTO cotizaciones (id, nro_cotizacion, fecha, cliente_id, propiedad_id, tipo_moneda, precio_ofertado, condiciones_pago, observaciones, situacion) VALUES
('f1000001-0000-0000-0000-000000000001', 'COT-00001', '02/04/2026', 'b1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'USD', 180000, 'Pago 60% inicial, 40% a 6 meses', 'Cliente muy interesada', 'Pendiente'),
('f1000001-0000-0000-0000-000000000002', 'COT-00002', '02/04/2026', 'b1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000002', 'USD', 310000, 'Pago de contado', 'Oferta formal presentada', 'Pendiente');

INSERT INTO contratos (id, nro_contrato, tipo, fecha, cliente_id, propiedad_id, tipo_moneda, monto, plazo, fecha_inicio, fecha_fin, condiciones, observaciones, situacion, documentos) VALUES
('aa000001-0000-0000-0000-000000000001', 'CTR-00001', 'Arrendamiento', '02/04/2026', 'b1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000003', 'USD', 850, 12, '01/05/2026', '01/05/2027', 'Pago mensual los primeros 5 dias', 'Contrato de alquiler por 1 ano', 'Activo', '[]');
