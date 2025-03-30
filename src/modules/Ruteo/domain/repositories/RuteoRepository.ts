import {
    ICliente,
    IClima,
    IDetallePlanificacionRuta,
    IEnvio,
    IEquipo,
    IPlanificacionRuta,
    ITrafico,
    ITransportista,
    IUnidadEnvio,
    IVehiculo,
} from '@modules/Ruteo/usecase/dto/out/IRuteoOut'

export interface RuteoRepository {
    obtenerEquipo(id_equipo: number): Promise<IEquipo[] | []>
    obtenerTransportistasDisponibles(_id_equipo: number): Promise<ITransportista[] | []>
    obtenerVehiculosDisponibles(_id_equipo: number): Promise<IVehiculo[] | []>
    obtenerClimaActual(_id_ciudad: number): Promise<IClima | null>
    obtenerTraficoActual(_id_ciudad: number): Promise<ITrafico[] | []>
    obtenerEnviosPendientes(_id_equipo: number): Promise<IEnvio[] | []>
    obtenerUnidadesPorEnvio(_id_envio: number): Promise<IUnidadEnvio[] | []>
    obtenerClientePorId(_id_cliente: number): Promise<ICliente | null>
    crearPlanificacionRuta(planificacion: Omit<IPlanificacionRuta, 'id_planificacion'>): Promise<IPlanificacionRuta>
    crearDetallePlanificacion(
        _detalles: Omit<IDetallePlanificacionRuta, 'id_detalle'>[],
    ): Promise<IDetallePlanificacionRuta[]>
    verificarPlanificacionExistente(_id_equipo: number, _fecha: string): Promise<boolean>
}
