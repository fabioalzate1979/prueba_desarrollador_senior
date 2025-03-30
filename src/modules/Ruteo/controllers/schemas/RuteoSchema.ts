import CustomJoi from '@common/util/JoiMessage'
import { IIdEquipoIn } from '@modules/Ruteo/usecase/dto/in'

// eslint-disable-next-line import/prefer-default-export
export const IdEquipoSchema = CustomJoi.object<IIdEquipoIn>({
    id_equipo: CustomJoi.number().required(),
})
