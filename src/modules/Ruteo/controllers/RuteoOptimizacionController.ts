import Result from '@common/http/Result'
import { Response } from '@common/http/Response'
import { Req, Status } from '@modules/shared/infrastructure'
import { injectable } from 'inversify'
import { validateData } from '@common/util/Schemas'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { IIdEquipoIn } from '../usecase/dto/in'
import { IdEquipoSchema } from './schemas/RuteoSchema'
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies'
import RuteoOptimizacionUseCase from '../usecase/services/RuteoOptimizaacionUseCase'

@injectable()
export default class RuteoOptimizacionController {
    private ruteoOptimizacionUseCase = DEPENDENCY_CONTAINER.get<RuteoOptimizacionUseCase>(
        TYPESDEPENDENCIES.RuteoOptimizacionUseCase,
    )

    async optimizarRutaEquipo(_req: Req): Promise<Response<Status | null>> {
        const dataIn = validateData<IIdEquipoIn>(IdEquipoSchema, _req.data)
        const data = await this.ruteoOptimizacionUseCase.execute(dataIn)
        return Result.ok<Status>({ ok: 'Se realizo la consulta de equipo', data })
    }
}
