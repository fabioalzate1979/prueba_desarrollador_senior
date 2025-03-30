import { BadRequestSchema, RepositoryErrorSchema } from '../../../common/swagger/errors'

const RuteoSchema = {
    consultaEquipo: {
        description: 'Consultar equipo por ID',
        tags: ['Ruteo'],
        params: {
            type: 'object',
            properties: {
                id_equipo: { type: 'integer' },
            },
        },
        response: {
            200: {
                description: 'Consulta de equipo exitosa',
                type: 'object',
                properties: {
                    isError: { type: 'boolean', example: false },
                    data: {
                        type: 'object',
                        properties: {
                            ok: { type: 'string', example: 'Se realizo la consulta de equipo' },
                            data: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id_equipo: { type: 'integer' },
                                        nombre: { type: 'string' },
                                        id_ciudad: { type: 'integer' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: BadRequestSchema,
            500: RepositoryErrorSchema,
        },
    },
    planificacionRuta: {
        description: 'Planificar la ruta del equipo',
        tags: ['Ruteo'],
        response: {
            200: {
                description: 'Planificación de ruta exitosa',
                type: 'object',
                properties: {
                    isError: { type: 'boolean', example: false },
                    data: {
                        type: 'object',
                        properties: {
                            ok: { type: 'string', example: 'Se realizo la planificacion de la ruta del equipo' },
                            data: {
                                type: 'object',
                                properties: {
                                    planificacion: {
                                        type: 'object',
                                        properties: {
                                            id_planificacion: { type: 'integer' },
                                            id_equipo: { type: 'integer' },
                                            id_vehiculo: { type: 'integer' },
                                            id_transportista: { type: 'integer' },
                                            fecha_planificacion: { type: 'string', format: 'date-time' },
                                            estado: { type: 'string' },
                                        },
                                    },
                                    transportista: {
                                        type: 'object',
                                        properties: {
                                            id_transportista: { type: 'integer' },
                                            nombre: { type: 'string' },
                                            id_equipo: { type: 'integer' },
                                            disponible: { type: 'boolean' },
                                            ultima_ubicacion_latitud: { type: 'number' },
                                            ultima_ubicacion_longitud: { type: 'number' },
                                            ultima_actualizacion: { type: 'string', format: 'date-time' },
                                        },
                                    },
                                    vehiculo: {
                                        type: 'object',
                                        properties: {
                                            id_vehiculo: { type: 'integer' },
                                            placa: { type: 'string' },
                                            id_equipo: { type: 'integer' },
                                            capacidad_peso: { type: 'number' },
                                            capacidad_volumen: { type: 'number' },
                                            estado: { type: 'string' },
                                        },
                                    },
                                    detalles: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_detalle: { type: 'integer' },
                                                id_planificacion: { type: 'integer' },
                                                id_envio: { type: 'integer' },
                                                orden_entrega: { type: 'integer' },
                                                envio: {
                                                    type: 'object',
                                                    properties: {
                                                        id_envio: { type: 'integer' },
                                                        id_cliente: { type: 'integer' },
                                                        fecha_creacion: { type: 'string', format: 'date-time' },
                                                        direccion: { type: 'string' },
                                                        latitud: { type: 'number' },
                                                        longitud: { type: 'number' },
                                                        sla_entrega_fecha: { type: 'string', format: 'date-time' },
                                                        id_equipo: { type: 'integer' },
                                                        cliente: {
                                                            type: 'object',
                                                            properties: {
                                                                id_cliente: { type: 'integer' },
                                                                nombre: { type: 'string' },
                                                                sla_prioridad: { type: 'integer' },
                                                            },
                                                        },
                                                        unidades: {
                                                            type: 'array',
                                                            items: {
                                                                type: 'object',
                                                                properties: {
                                                                    id_unidad_envio: { type: 'integer' },
                                                                    id_envio: { type: 'integer' },
                                                                    peso: { type: 'number' },
                                                                    volumen: { type: 'number' },
                                                                    descripcion: { type: 'string' },
                                                                },
                                                            },
                                                        },
                                                        pesoTotal: { type: 'number' },
                                                        volumenTotal: { type: 'number' },
                                                        puntaje: { type: 'number' },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: BadRequestSchema,
            500: RepositoryErrorSchema,
        },
    },
}

export default RuteoSchema
