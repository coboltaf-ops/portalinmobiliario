'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useSolicitudesStore } from '@/features/solicitudes/store/solicitudes-store'
import { useCotizacionesStore } from '@/features/cotizaciones/store/cotizaciones-store'
import { useContratosStore } from '@/features/contratos/store/contratos-store'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { useCorreosStore } from '@/features/correos-enviados/store/correos-store'
import { useModulosStore } from '@/features/configuracion/store/modulos-store'

export function useFetchData() {
  const fetchUsers = useAuthStore(s => s.fetchUsers)
  const fetchConfig = useConfigStore(s => s.fetchConfig)
  const fetchPropiedades = usePropiedadesStore(s => s.fetchPropiedades)
  const fetchComerciales = useComercialesStore(s => s.fetchComerciales)
  const fetchClientes = useClientesStore(s => s.fetchClientes)
  const fetchSolicitudes = useSolicitudesStore(s => s.fetchSolicitudes)
  const fetchCotizaciones = useCotizacionesStore(s => s.fetchCotizaciones)
  const fetchContratos = useContratosStore(s => s.fetchContratos)
  const fetchEmpresa = useEmpresaStore(s => s.fetchEmpresa)
  const fetchCorreos = useCorreosStore(s => s.fetchCorreos)
  const fetchModulos = useModulosStore(s => s.fetchModulos)

  useEffect(() => {
    fetchUsers()
    fetchConfig()
    fetchPropiedades()
    fetchComerciales()
    fetchClientes()
    fetchSolicitudes()
    fetchCotizaciones()
    fetchContratos()
    fetchEmpresa()
    fetchCorreos()
    fetchModulos()
  }, [fetchUsers, fetchConfig, fetchPropiedades, fetchComerciales, fetchClientes, fetchSolicitudes, fetchCotizaciones, fetchContratos, fetchEmpresa, fetchCorreos, fetchModulos])
}
