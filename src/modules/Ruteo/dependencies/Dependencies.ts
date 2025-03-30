import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
// import  from '@infrastructure/bd/dao/PostgresRuteoRepository'
import { IDatabase, IMain } from 'pg-promise'
import cm from '@infrastructure/bd/adapter/Config'
import PostgresRuteoDao from '@infrastructure/bd/dao/PostgresRuteoDao'
import TYPESDEPENDENCIES from './TypesDependencies'
import RuteoController from '../controllers/RuteoController'
import RuteoOptimizarController from '../controllers/RuteoOptimizacionController'
import RuteoUseCase from '../usecase/services/RuteoUseCase'
import { RuteoRepository } from '../domain/repositories/RuteoRepository'
import RuteoOptimizacionUseCase from '../usecase/services/RuteoOptimizaacionUseCase'

const createDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<RuteoController>(TYPESDEPENDENCIES.RuteoController).to(RuteoController).inSingletonScope()
    DEPENDENCY_CONTAINER.bind<RuteoOptimizarController>(TYPESDEPENDENCIES.RuteoOptimizarController)
        .to(RuteoOptimizarController)
        .inSingletonScope()

    DEPENDENCY_CONTAINER.bind<RuteoUseCase>(TYPESDEPENDENCIES.RuteoUseCase)
        .toDynamicValue(() => {
            return new RuteoUseCase()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<RuteoOptimizacionUseCase>(TYPESDEPENDENCIES.RuteoOptimizacionUseCase)
        .toDynamicValue(() => {
            return new RuteoOptimizacionUseCase()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<IDatabase<IMain>>(TYPESDEPENDENCIES.dbCm).toConstantValue(cm)
    DEPENDENCY_CONTAINER.bind<RuteoRepository>(TYPESDEPENDENCIES.RuteoRepository)
        .to(PostgresRuteoDao)
        .inSingletonScope()
}

export default createDependencies
