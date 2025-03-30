/* eslint-disable import/prefer-default-export */
import { RedisRepository } from '@common/repositories/RedisRepository'
import { injectable } from 'inversify'
import { IEquipo } from '@modules/Ruteo/usecase/dto/out/IRuteoOut'
import redisClient from '../adapter/Redis'

@injectable()
export class RedisRuteoDao implements RedisRepository {
    async getEquipoRuta(id_equipo: number): Promise<IEquipo | null> {
        try {
            const key = `equipo:${id_equipo}`
            const data = await redisClient.get(key)

            if (data) {
                return JSON.parse(data) as IEquipo
            }

            return null
        } catch (error) {
            console.error('Error in getEquipoRuta:', error.message)
            return null
        }
    }

    async saveEquipoRuta(equipo: IEquipo): Promise<boolean> {
        try {
            const key = `equipo:${equipo.id_equipo}`
            const value = JSON.stringify(equipo)

            await redisClient.set(key, value)
            return true
        } catch (error) {
            console.error('Error en saveEquipoRuta:', error.message)
            return false
        }
    }
}
