import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RuteoRepository } from '@modules/Ruteo/domain/repositories/RuteoRepository'
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies'
import { RedisRepository } from '@common/repositories/RedisRepository'
import TYPESREDIS from '@common/repositories/TypesRedis'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import { IIdEquipoIn } from '../dto/in'
import {
    IClima,
    IEnvio,
    IEquipo,
    IPlanificacionRuta,
    IRutaOptimizada,
    ITrafico,
    ITransportista,
    IVehiculo,
} from '../dto/out/IRuteoOut'

export default class RuteoOptimizacionUseCase {
    private ruteoRepository = DEPENDENCY_CONTAINER.get<RuteoRepository>(TYPESDEPENDENCIES.RuteoRepository)

    private redisRepository = DEPENDENCY_CONTAINER.get<RedisRepository>(TYPESREDIS.RedisRepository)

    async execute(idEquipo: IIdEquipoIn): Promise<IRutaOptimizada> {
        const consultaEquipo = await this.consultaEquipo(idEquipo)

        if (!consultaEquipo || consultaEquipo.length === 0) {
            throw new BadMessageException('404', 'Equipo no encontrado')
        }

        // Verificar si ya existe una planificación para hoy
        const fechaActual = new Date().toISOString().split('T')[0]
        const existePlanificacion = await this.ruteoRepository.verificarPlanificacionExistente(
            idEquipo.id_equipo,
            fechaActual,
        )
        console.log('existePlanificacion', existePlanificacion)

        if (existePlanificacion) {
            throw new BadMessageException('400', 'Ya existe una ruta planificada para hoy')
        }

        // Proceder con la optimización de la ruta
        const rutaOptimizada = await this.calcularRutaOptima(idEquipo, consultaEquipo[0])
        return rutaOptimizada
    }

    private async consultaEquipo(idEquipo: IIdEquipoIn): Promise<IEquipo[] | []> {
        const rutaCacheada = await this.redisRepository.getEquipoRuta(idEquipo.id_equipo)

        if (rutaCacheada) {
            return [rutaCacheada]
        }

        const ruta = await this.ruteoRepository.obtenerEquipo(idEquipo.id_equipo)

        if (ruta && ruta.length > 0) {
            await this.redisRepository.saveEquipoRuta(ruta[0])
        }

        return ruta
    }

    private async calcularRutaOptima(idEquipo: IIdEquipoIn, equipo: IEquipo): Promise<IRutaOptimizada> {
        // Obtener transportistas disponibles
        const transportistas = await this.ruteoRepository.obtenerTransportistasDisponibles(idEquipo.id_equipo)
        if (transportistas.length === 0) {
            throw new BadMessageException('400', 'No hay transportistas disponibles para este equipo')
        }

        // Obtener vehículos disponibles
        const vehiculos = await this.ruteoRepository.obtenerVehiculosDisponibles(idEquipo.id_equipo)
        if (vehiculos.length === 0) {
            throw new BadMessageException('400', 'No hay vehículos disponibles para este equipo')
        }

        // Obtener clima actual
        const clima = await this.ruteoRepository.obtenerClimaActual(equipo.id_ciudad)

        // Obtener tráfico actual
        const trafico = await this.ruteoRepository.obtenerTraficoActual(equipo.id_ciudad)

        // Obtener envíos pendientes
        const enviosPendientes = await this.ruteoRepository.obtenerEnviosPendientes(equipo.id_equipo)
        if (enviosPendientes.length === 0) {
            throw new BadMessageException('400', 'No hay envíos pendientes para planificar')
        }

        // Cargar información adicional para cada envío
        const enviosConDetalles = await Promise.all(
            enviosPendientes.map(async (envio) => {
                // Obtener cliente
                if (envio.id_cliente) {
                    const cliente = await this.ruteoRepository.obtenerClientePorId(envio.id_cliente)
                    if (cliente) {
                        // eslint-disable-next-line no-param-reassign
                        envio.cliente = cliente
                    } else {
                        // eslint-disable-next-line no-param-reassign
                        envio.cliente = undefined
                    }
                }
                // Obtener unidades
                // eslint-disable-next-line no-param-reassign
                envio.unidades = await this.ruteoRepository.obtenerUnidadesPorEnvio(envio.id_envio)
                return envio
            }),
        )

        // Seleccionar mejor transportista y vehículo
        const transportistaSeleccionado = await this.seleccionarMejorTransportista(transportistas)
        const vehiculoSeleccionado = await this.seleccionarMejorVehiculo(vehiculos)

        // Seleccionar y ordenar envíos
        const enviosSeleccionados = await this.seleccionarYOrdenarEnvios(
            enviosConDetalles,
            vehiculoSeleccionado,
            transportistaSeleccionado,
            clima,
            trafico,
        )

        // Crear planificación de ruta
        const nuevaPlanificacion: Omit<IPlanificacionRuta, 'id_planificacion'> = {
            id_equipo: idEquipo.id_equipo,
            id_vehiculo: vehiculoSeleccionado.id_vehiculo,
            id_transportista: transportistaSeleccionado.id_transportista,
            estado: 'inicial',
        }

        const planificacionCreada = await this.ruteoRepository.crearPlanificacionRuta(nuevaPlanificacion)

        // Crear detalles de planificación
        const detallesParaCrear = enviosSeleccionados.map((envio, index) => ({
            id_planificacion: planificacionCreada.id_planificacion,
            id_envio: envio.id_envio,
            orden_entrega: index + 1,
        }))

        const detallesCreados = await this.ruteoRepository.crearDetallePlanificacion(detallesParaCrear)

        // Construir y retornar respuesta final
        const rutaOptimizada: IRutaOptimizada = {
            planificacion: planificacionCreada,
            transportista: transportistaSeleccionado,
            vehiculo: vehiculoSeleccionado,
            detalles: detallesCreados.map((detalle) => {
                const envioCorrespondiente = enviosSeleccionados.find((e) => e.id_envio === detalle.id_envio)
                return {
                    ...detalle,
                    envio: envioCorrespondiente,
                }
            }),
        }

        return rutaOptimizada
    }

    private async seleccionarMejorTransportista(transportistas: ITransportista[]): Promise<ITransportista> {
        // Ordenar por la fecha de última actualización (el más reciente primero)
        const transportistasOrdenados = [...transportistas].sort((a, b) => {
            const fechaA = new Date(a.ultima_actualizacion).getTime()
            const fechaB = new Date(b.ultima_actualizacion).getTime()
            return fechaB - fechaA
        })

        return transportistasOrdenados[0]
    }

    private seleccionarMejorVehiculo(vehiculos: IVehiculo[]): IVehiculo {
        const vehiculosOrdenados = [...vehiculos].sort((a, b) => b.capacidad_peso - a.capacidad_peso)
        return vehiculosOrdenados[0]
    }

    // eslint-disable-next-line max-params
    private async seleccionarYOrdenarEnvios(
        envios: IEnvio[],
        vehiculo: IVehiculo,
        transportista: ITransportista,
        clima: IClima | null,
        trafico: ITrafico[] | [],
    ): Promise<IEnvio[]> {
        const capacidadPeso = vehiculo.capacidad_peso
        const capacidadVolumen = vehiculo.capacidad_volumen

        // Calcular totales y puntajes para cada envío
        const enviosConTotal = await Promise.all(
            envios.map(async (envio) => {
                const pesoTotal = envio.unidades?.reduce((sum, unidad) => sum + unidad.peso, 0) || 0
                const volumenTotal = envio.unidades?.reduce((sum, unidad) => sum + unidad.volumen, 0) || 0

                const puntaje = await this.calcularPuntajeEnvio(envio, transportista, clima, trafico)

                return {
                    ...envio,
                    pesoTotal,
                    volumenTotal,
                    puntaje,
                }
            }),
        )

        // Ordenar por puntaje (mayor puntaje = mayor prioridad)
        enviosConTotal.sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0))

        // Seleccionar envíos según capacidad del vehículo
        const enviosSeleccionados: IEnvio[] = []
        let pesoAcumulado = 0
        let volumenAcumulado = 0

        // eslint-disable-next-line no-restricted-syntax
        for (const envio of enviosConTotal) {
            if (
                pesoAcumulado + (envio.pesoTotal || 0) <= capacidadPeso &&
                volumenAcumulado + (envio.volumenTotal || 0) <= capacidadVolumen
            ) {
                enviosSeleccionados.push(envio)
                pesoAcumulado += envio.pesoTotal || 0
                volumenAcumulado += envio.volumenTotal || 0
            }
        }

        // Ordenar por ruta óptima (menor distancia total)
        return this.ordenarPorRutaOptima(enviosSeleccionados, transportista)
    }

    private async calcularPuntajeEnvio(
        envio: IEnvio,
        transportista: ITransportista,
        clima: IClima | null,
        trafico: ITrafico[] | [],
    ): Promise<number> {
        const fechaActual = new Date()
        const fechaEntrega = new Date(envio.sla_entrega_fecha)
        const diasHastaEntrega = Math.ceil((fechaEntrega.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24))

        // Menor cantidad de días hasta la entrega = mayor puntaje
        const puntajeDias = diasHastaEntrega <= 0 ? 100 : 50 / diasHastaEntrega

        // Mayor prioridad del cliente = mayor puntaje
        const prioridadCliente = 20 * (envio.cliente?.sla_prioridad || 3)

        // Calcular distancia y convertirla a puntaje (menor distancia = mayor puntaje)
        const distancia = await this.calcularDistancia(
            transportista.ultima_ubicacion_latitud,
            transportista.ultima_ubicacion_longitud,
            envio.latitud,
            envio.longitud,
        )
        const puntajeDistancia = 100 / (1 + distancia * 0.1)

        // Factores de clima y tráfico
        let factorClima = 1
        if (clima && clima.condicion.toLowerCase().includes('lluvia')) {
            factorClima = 1.2
        }

        let factorTrafico = 1
        if (trafico && trafico.length > 0) {
            const horaActual = new Date().getHours()
            const traficoActual = trafico.find((t) => {
                const [hora] = t.hora.split(':').map(Number)
                return Math.abs(hora - horaActual) <= 1
            })

            if (traficoActual && traficoActual.nivel_congestion === 'alto') {
                factorTrafico = 0.7 // Reduce el puntaje en zonas de tráfico alto
            } else if (traficoActual && traficoActual.nivel_congestion === 'medio') {
                factorTrafico = 0.9 // Reduce el puntaje en zonas de tráfico medio
            }
        }

        // Cálculo del puntaje final
        return (puntajeDias + prioridadCliente + puntajeDistancia) * factorClima * factorTrafico
    }

    private async calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
        const R = 6371 // Radio de la Tierra en km
        const dLat = this.deg2rad(lat2 - lat1)
        const dLon = this.deg2rad(lon2 - lon1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180)
    }

    private async ordenarPorRutaOptima(envios: IEnvio[], transportista: ITransportista): Promise<IEnvio[]> {
        if (envios.length === 0) {
            return []
        }

        const enviosOrdenados: IEnvio[] = []
        const enviosPendientes = [...envios]
        let puntoActual = {
            latitud: transportista.ultima_ubicacion_latitud,
            longitud: transportista.ultima_ubicacion_longitud,
        }

        while (enviosPendientes.length > 0) {
            // Capturar el puntoActual en una variable local para evitar referencias inseguras
            const currentPoint = { ...puntoActual }

            // Calcular distancias en paralelo
            // eslint-disable-next-line no-await-in-loop
            const distancias = await Promise.all(
                enviosPendientes.map((envio) =>
                    this.calcularDistancia(currentPoint.latitud, currentPoint.longitud, envio.latitud, envio.longitud),
                ),
            )

            let envioMasCercano: IEnvio | null = null
            let distanciaMinima = Infinity
            let indiceEnvioMasCercano = -1

            // Encontrar el envío más cercano
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < distancias.length; i++) {
                if (distancias[i] < distanciaMinima) {
                    distanciaMinima = distancias[i]
                    envioMasCercano = enviosPendientes[i]
                    indiceEnvioMasCercano = i
                }
            }

            if (envioMasCercano) {
                enviosOrdenados.push(envioMasCercano)
                puntoActual = {
                    latitud: envioMasCercano.latitud,
                    longitud: envioMasCercano.longitud,
                }
                enviosPendientes.splice(indiceEnvioMasCercano, 1)
            } else {
                // Caso teórico que no debería ocurrir, pero para evitar bucles infinitos
                break
            }
        }

        return enviosOrdenados
    }
}
