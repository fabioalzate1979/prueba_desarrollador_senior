import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies'
import { RuteoRepository } from '@modules/Ruteo/domain/repositories/RuteoRepository'
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
import { injectable } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'

@injectable()
export default class PostgresRuteoDao implements RuteoRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIES.dbCm)

    async obtenerEquipo(_id_equipo: number): Promise<IEquipo[] | []> {
        try {
            const sqlQuery = `SELECT * FROM public.equipo e WHERE e.id_equipo = $1;`
            const resultado: IEquipo[] | [] = await this.db.manyOrNone(sqlQuery, [_id_equipo])
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al consultar data en postgress: ${error.message}`)
        }
    }

    async obtenerTransportistasDisponibles(_id_equipo: number): Promise<ITransportista[] | []> {
        try {
            const sqlQuery = `
                SELECT * FROM transportista
                WHERE id_equipo = $1 AND disponible = true
                ORDER BY ultima_actualizacion DESC;
            `
            const resultado: ITransportista[] | [] = await this.db.manyOrNone(sqlQuery, [_id_equipo])
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al consultar transportistas: ${error.message}`)
        }
    }

    async obtenerVehiculosDisponibles(_id_equipo: number): Promise<IVehiculo[] | []> {
        try {
            const sqlQuery = `
                SELECT * FROM vehiculo
                WHERE id_equipo = $1 AND estado = 'available'
                ORDER BY capacidad_peso DESC;
            `
            const resultado: IVehiculo[] | [] = await this.db.manyOrNone(sqlQuery, [_id_equipo])
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al consultar vehículos: ${error.message}`)
        }
    }

    async obtenerClimaActual(_id_ciudad: number): Promise<IClima | null> {
        try {
            const sqlQuery = `
                SELECT * FROM clima
                WHERE id_ciudad = $1 AND fecha = CURRENT_DATE::date
                ORDER BY id_clima DESC
                LIMIT 1;
            `
            const resultado: IClima | null = await this.db.oneOrNone(sqlQuery, [_id_ciudad])
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al consultar clima: ${error.message}`)
        }
    }

    async obtenerTraficoActual(_id_ciudad: number): Promise<ITrafico[] | []> {
        try {
            const sqlQuery = `
                SELECT * FROM trafico
                WHERE id_ciudad = $1 AND fecha = CURRENT_DATE::date
                ORDER BY hora;
            `
            const resultado: ITrafico[] | [] = await this.db.manyOrNone(sqlQuery, [_id_ciudad])
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al consultar tráfico: ${error.message}`)
        }
    }

    async obtenerEnviosPendientes(_id_equipo: number): Promise<IEnvio[] | []> {
        try {
            const sqlQuery = `
                SELECT e.* FROM envio e
                LEFT JOIN detalle_planificacion_ruta dpr ON e.id_envio = dpr.id_envio
                WHERE e.id_equipo = $1
                AND dpr.id_envio IS NULL
                ORDER BY e.sla_entrega_fecha ASC;
            `
            const resultado: IEnvio[] | [] = await this.db.manyOrNone(sqlQuery, [_id_equipo])
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al consultar envíos pendientes: ${error.message}`)
        }
    }

    async crearPlanificacionRuta(
        _planificacion: Omit<IPlanificacionRuta, 'id_planificacion'>,
    ): Promise<IPlanificacionRuta> {
        try {
            const sqlQuery = `
                INSERT INTO planificacion_ruta (id_equipo, id_vehiculo, id_transportista, fecha_planificacion, estado)
                VALUES ($1, $2, $3, CURRENT_DATE::date, $4)
                RETURNING *;
            `
            const params = [
                _planificacion.id_equipo,
                _planificacion.id_vehiculo,
                _planificacion.id_transportista,
                _planificacion.estado,
            ]
            const resultado: IPlanificacionRuta = await this.db.one(sqlQuery, params)
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al crear planificación de ruta: ${error.message}`)
        }
    }

    async obtenerClientePorId(_id_cliente: number): Promise<ICliente | null> {
        try {
            const sqlQuery = `SELECT * FROM cliente WHERE id_cliente = $1;`
            const resultado: ICliente | null = await this.db.oneOrNone(sqlQuery, [_id_cliente])
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al consultar cliente: ${error.message}`)
        }
    }

    async obtenerUnidadesPorEnvio(_id_envio: number): Promise<IUnidadEnvio[] | []> {
        try {
            const sqlQuery = `SELECT * FROM unidad_envio WHERE id_envio = $1;`
            const resultado: IUnidadEnvio[] | [] = await this.db.manyOrNone(sqlQuery, [_id_envio])
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al consultar unidades de envío: ${error.message}`)
        }
    }

    async verificarPlanificacionExistente(_id_equipo: number, _fecha: string): Promise<boolean> {
        try {
            const sqlQuery = `
                SELECT EXISTS (
                    SELECT 1 FROM planificacion_ruta
                    WHERE id_equipo = $1 AND fecha_planificacion = $2::date
                ) as existe;
            `
            const resultado = await this.db.one(sqlQuery, [_id_equipo, _fecha])
            return resultado.existe
        } catch (error: any) {
            throw new PostgresException(500, `Error al verificar planificación existente: ${error.message}`)
        }
    }

    async crearDetallePlanificacion(
        _detalles: Omit<IDetallePlanificacionRuta, 'id_detalle'>[],
    ): Promise<IDetallePlanificacionRuta[]> {
        try {
            // Si no hay detalles, devolver array vacío
            if (_detalles.length === 0) {
                return []
            }
            const cs = new this.db.$config.pgp.helpers.ColumnSet(['id_planificacion', 'id_envio', 'orden_entrega'], {
                table: 'detalle_planificacion_ruta',
            })

            const query = `${this.db.$config.pgp.helpers.insert(_detalles, cs)} RETURNING *`
            const resultado: IDetallePlanificacionRuta[] = await this.db.many(query)
            return resultado
        } catch (error: any) {
            throw new PostgresException(500, `Error al crear detalles de planificación: ${error.message}`)
        }
    }
}
