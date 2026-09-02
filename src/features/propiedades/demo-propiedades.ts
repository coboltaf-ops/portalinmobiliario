import type { Propiedad } from './store/propiedades-store'

// Datos DEMO para presentación: se muestran cuando no hay un backend (Supabase)
// con propiedades disponibles. Fotos de stock (Unsplash). Contexto Colombia · COP.
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`

const base = {
  nro_apto_casa: '',
  cuarto_ropas: true,
  piscina: false,
  juegos_infantiles: false,
  gimnasio: false,
  monto_administracion_mes: 0,
  monto_predial_anual: 0,
  asesor_asignado: '',
}

export const demoPropiedades: Propiedad[] = [
  {
    ...base, id: 'demo-01', nro_propiedad: 1, codigo: 'PROP-0001', urbanizacion: 'Edificio Bahía Poblado',
    tipo_propiedad: 'Apartamento', modalidad: 'Venta', precio_venta: 680000000, precio_alquiler: 0, tipo_moneda: 'COP',
    area_m2: 98, habitaciones: 3, banos: 2, estacionamientos: 1, balcones: 1, cuarto_servicio: false,
    gimnasio: true, piscina: true, monto_administracion_mes: 520000, monto_predial_anual: 2400000,
    amenidades: 'Piscina, Gimnasio, Portería 24h, Salón social', direccion: 'Cra. 43A #7-50', ciudad: 'Medellín', zona: 'El Poblado', estado: 'Disponible',
    descripcion: 'Moderno apartamento en El Poblado con excelente iluminación natural, acabados de lujo y vista a la ciudad. A pasos del Parque Lleras y centros comerciales.',
    imagenes: [img('1502672260266-1c1ef2d93688'), img('1522708323590-d24dbb6b0267'), img('1560448204-e02f11c3d0e2')],
  },
  {
    ...base, id: 'demo-02', nro_propiedad: 2, codigo: 'PROP-0002', urbanizacion: 'Finca La Esperanza',
    tipo_propiedad: 'Finca', modalidad: 'Venta', precio_venta: 1250000000, precio_alquiler: 0, tipo_moneda: 'COP',
    area_m2: 5200, habitaciones: 5, banos: 4, estacionamientos: 6, balcones: 2, cuarto_servicio: true, piscina: true,
    amenidades: 'Piscina, Kiosco, Zona BBQ, Establo, Jardines', direccion: 'Vereda El Tambo Km 4', ciudad: 'La Ceja', zona: 'Antioquia', estado: 'Disponible',
    descripcion: 'Espectacular finca de recreo con amplias zonas verdes, piscina y clima privilegiado del oriente antioqueño. Ideal para descanso o inversión turística.',
    imagenes: [img('1518780664697-55e3ad937233'), img('1449844908441-8829872d2607'), img('1500382017468-9049fed747ef')],
  },
  {
    ...base, id: 'demo-03', nro_propiedad: 3, codigo: 'PROP-0003', urbanizacion: 'Casa Alto de las Palmas',
    tipo_propiedad: 'Casa', modalidad: 'Venta y Alquiler', precio_venta: 920000000, precio_alquiler: 4200000, tipo_moneda: 'COP',
    area_m2: 210, habitaciones: 4, banos: 3, estacionamientos: 2, balcones: 1, cuarto_servicio: true,
    amenidades: 'Jardín privado, Estudio, Cuarto de servicio, Chimenea', direccion: 'Cl. 30 Sur #27-15', ciudad: 'Envigado', zona: 'Loma del Escobero', estado: 'Disponible',
    descripcion: 'Casa unifamiliar en sector campestre de Envigado, amplios espacios, acabados en madera y zona verde privada. Excelente ubicación y tranquilidad.',
    imagenes: [img('1568605114967-8130f3a36994'), img('1570129477492-45c003edd2be'), img('1512917774080-9991f1c4c750')],
  },
  {
    ...base, id: 'demo-04', nro_propiedad: 4, codigo: 'PROP-0004', urbanizacion: 'Torre Parque 93',
    tipo_propiedad: 'Apartamento', modalidad: 'Alquiler', precio_venta: 0, precio_alquiler: 5500000, tipo_moneda: 'COP',
    area_m2: 115, habitaciones: 3, banos: 2, estacionamientos: 2, balcones: 1, cuarto_servicio: false, gimnasio: true,
    monto_administracion_mes: 780000, amenidades: 'Gimnasio, Coworking, Terraza, Portería 24h', direccion: 'Cl. 93 #13-24', ciudad: 'Bogotá', zona: 'Chapinero - Parque 93', estado: 'Disponible',
    descripcion: 'Amplio apartamento amoblado a pasos del Parque de la 93. Zona financiera y gastronómica, ideal para ejecutivos.',
    imagenes: [img('1560185007-cde436f6a4d0'), img('1502005229762-cf1b2da7c5d6'), img('1493809842364-78817add7ffb')],
  },
  {
    ...base, id: 'demo-05', nro_propiedad: 5, codigo: 'PROP-0005', urbanizacion: 'Local Comercial Laureles',
    tipo_propiedad: 'Local', modalidad: 'Venta', precio_venta: 540000000, precio_alquiler: 0, tipo_moneda: 'COP',
    area_m2: 85, habitaciones: 0, banos: 1, estacionamientos: 1, balcones: 0, cuarto_servicio: false,
    amenidades: 'Vitrina amplia, Baño, Mezanine', direccion: 'Cir. 4 #70-20', ciudad: 'Medellín', zona: 'Laureles', estado: 'Disponible',
    descripcion: 'Local comercial sobre vía principal en Laureles, alto flujo peatonal y vehicular. Ideal para restaurante, cafetería o retail.',
    imagenes: [img('1441986300917-64674bd600d8'), img('1604014237800-1c9102c219da')],
  },
  {
    ...base, id: 'demo-06', nro_propiedad: 6, codigo: 'PROP-0006', urbanizacion: 'Finca Villa Marta',
    tipo_propiedad: 'Finca', modalidad: 'Alquiler', precio_venta: 0, precio_alquiler: 3500000, tipo_moneda: 'COP',
    area_m2: 3800, habitaciones: 4, banos: 3, estacionamientos: 4, balcones: 1, cuarto_servicio: true, piscina: true, juegos_infantiles: true,
    amenidades: 'Piscina, Cancha múltiple, Zona de camping, Fogata', direccion: 'Vereda La Mosca Km 2', ciudad: 'Guarne', zona: 'Antioquia', estado: 'Disponible',
    descripcion: 'Finca para eventos y descanso familiar, rodeada de naturaleza a 30 minutos de Medellín. Se alquila por temporadas.',
    imagenes: [img('1416331108676-a22ccb276e35'), img('1505843513577-22bb7d21e455'), img('1470770841072-f978cf4d019e')],
  },
  {
    ...base, id: 'demo-07', nro_propiedad: 7, codigo: 'PROP-0007', urbanizacion: 'Conjunto Ciudad Jardín',
    tipo_propiedad: 'Apartamento', modalidad: 'Venta', precio_venta: 430000000, precio_alquiler: 0, tipo_moneda: 'COP',
    area_m2: 88, habitaciones: 3, banos: 2, estacionamientos: 1, balcones: 1, cuarto_servicio: false, piscina: true, juegos_infantiles: true,
    monto_administracion_mes: 380000, amenidades: 'Piscina, Zona húmeda, Juegos infantiles, Portería', direccion: 'Cl. 16 #100-30', ciudad: 'Cali', zona: 'Ciudad Jardín', estado: 'Disponible',
    descripcion: 'Apartamento familiar en el exclusivo sector de Ciudad Jardín, con amplias zonas comunes y excelente valorización.',
    imagenes: [img('1512918728675-ed5a9ecdebfd'), img('1484154218962-a197022b5858'), img('1522708323590-d24dbb6b0267')],
  },
  {
    ...base, id: 'demo-08', nro_propiedad: 8, codigo: 'PROP-0008', urbanizacion: 'Casa Campestre Llanogrande',
    tipo_propiedad: 'Casa', modalidad: 'Venta', precio_venta: 1650000000, precio_alquiler: 0, tipo_moneda: 'COP',
    area_m2: 320, habitaciones: 5, banos: 4, estacionamientos: 4, balcones: 2, cuarto_servicio: true, piscina: true,
    amenidades: 'Piscina climatizada, Jacuzzi, Estudio, Cuarto de servicio, Jardines', direccion: 'Km 3 vía Llanogrande', ciudad: 'Rionegro', zona: 'Llanogrande', estado: 'Disponible',
    descripcion: 'Casa campestre de lujo en Llanogrande, arquitectura contemporánea, amplios ventanales y zonas verdes. Cerca al aeropuerto JMC.',
    imagenes: [img('1580587771525-78b9dba3b914'), img('1613490493576-7fde63acd811'), img('1600596542815-ffad4c1539a9')],
  },
  {
    ...base, id: 'demo-09', nro_propiedad: 9, codigo: 'PROP-0009', urbanizacion: 'Centro Empresarial Santa Bárbara',
    tipo_propiedad: 'Oficina', modalidad: 'Alquiler', precio_venta: 0, precio_alquiler: 7800000, tipo_moneda: 'COP',
    area_m2: 140, habitaciones: 0, banos: 2, estacionamientos: 3, balcones: 0, cuarto_servicio: false,
    monto_administracion_mes: 1200000, amenidades: 'Recepción, Salas de juntas, Aire acondicionado, Parqueo visitantes', direccion: 'Cra. 7 #123-45', ciudad: 'Bogotá', zona: 'Santa Bárbara', estado: 'Disponible',
    descripcion: 'Oficina en torre corporativa AAA en el norte de Bogotá, lista para operar, con vista panorámica y excelentes vías de acceso.',
    imagenes: [img('1497366216548-37526070297c'), img('1497366811353-6870744d04b2'), img('1524758631624-e2822e304c36')],
  },
  {
    ...base, id: 'demo-10', nro_propiedad: 10, codigo: 'PROP-0010', urbanizacion: 'Apartaestudio Sabaneta Park',
    tipo_propiedad: 'Apartamento', modalidad: 'Venta y Alquiler', precio_venta: 245000000, precio_alquiler: 1600000, tipo_moneda: 'COP',
    area_m2: 42, habitaciones: 1, banos: 1, estacionamientos: 1, balcones: 1, cuarto_servicio: false, gimnasio: true,
    monto_administracion_mes: 210000, amenidades: 'Gimnasio, Terraza BBQ, Coworking, Portería 24h', direccion: 'Cl. 75 Sur #45-10', ciudad: 'Sabaneta', zona: 'Aves María', estado: 'Disponible',
    descripcion: 'Moderno apartaestudio cerca al metro de Sabaneta, ideal para inversión en renta o primer hogar. Excelente ubicación y valorización.',
    imagenes: [img('1493809842364-78817add7ffb'), img('1502005229762-cf1b2da7c5d6'), img('1560185007-cde436f6a4d0')],
  },
]
