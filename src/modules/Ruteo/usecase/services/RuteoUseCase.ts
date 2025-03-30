import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RuteoRepository } from '@modules/Ruteo/domain/repositories/RuteoRepository'
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies'
import { RedisRepository } from '@common/repositories/RedisRepository'
import TYPESREDIS from '@common/repositories/TypesRedis'
import { IIdEquipoIn } from '../dto/in'
import { IEquipo } from '../dto/out/IRuteoOut'

export default class RuteoUseCase {
    private ruteoRepository = DEPENDENCY_CONTAINER.get<RuteoRepository>(TYPESDEPENDENCIES.RuteoRepository)

    private redisRepository = DEPENDENCY_CONTAINER.get<RedisRepository>(TYPESREDIS.RedisRepository)

    async execute(idEquipo: IIdEquipoIn): Promise<IEquipo[] | []> {
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
}
