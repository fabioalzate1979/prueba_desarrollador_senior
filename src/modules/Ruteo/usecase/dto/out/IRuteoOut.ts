export interface IRutaOut {
    id_equipo: number
}

export interface IEquipo {
    id_equipo: number
    nombre: string
    id_ciudad: number
}

export interface ITransportista {
    id_transportista: number
    nombre: string
    id_equipo: number
    disponible: boolean
    ultima_ubicacion_latitud: number
    ultima_ubicacion_longitud: number
    ultima_actualizacion: string
}

export interface IVehiculo {
    id_vehiculo: number
    placa: string
    id_equipo: number
    capacidad_peso: number
    capacidad_volumen: number
    estado: string
}

export interface IClima {
    id_clima: number
    id_ciudad: number
    fecha: string
    temperatura: number
    condicion: string
    probabilidad_lluvia: number
    velocidad_viento: number
}

export interface ITrafico {
    id_trafico: number
    id_ciudad: number
    fecha: string
    hora: string
    nivel_congestion: string
    tiempo_estimado_viaje: string
}

export interface IEnvio {
    id_envio: number
    id_cliente: number
    fecha_creacion: string
    direccion: string
    latitud: number
    longitud: number
    sla_entrega_fecha: string
    cliente?: ICliente
    unidades?: IUnidadEnvio[]
}

export interface ICliente {
    id_cliente: number
    nombre: string
    sla_prioridad: number
}

export interface IUnidadEnvio {
    id_unidad_envio: number
    id_envio: number
    peso: number
    volumen: number
    descripcion: string
}

export interface IPlanificacionRuta {
    id_planificacion: number
    id_equipo: number
    id_vehiculo: number
    id_transportista: number
    estado: string
    detalle?: IDetallePlanificacionRuta[]
}

export interface IDetallePlanificacionRuta {
    id_detalle: number
    id_planificacion: number
    id_envio: number
    orden_entrega: number
    envio?: IEnvio
}

export interface IRutaOptimizada {
    planificacion: IPlanificacionRuta
    transportista: ITransportista
    vehiculo: IVehiculo
    detalles: IDetallePlanificacionRuta[]
}
