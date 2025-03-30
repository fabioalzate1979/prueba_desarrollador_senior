import { IEquipo } from '@modules/Ruteo/usecase/dto/out/IRuteoOut'

export interface RedisRepository {
    getEquipoRuta(id_equipo: number): Promise<IEquipo | null>
    saveEquipoRuta(equipo: IEquipo): Promise<boolean>
}
