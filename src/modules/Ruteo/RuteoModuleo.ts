import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { IModule } from '@common/modules/IModule'
import { HTTPMETODO, Ruta } from '@common/modules/Ruta'
import TYPESDEPENDENCIES from './dependencies/TypesDependencies'
import RuteoController from './controllers/RuteoController'
import RuteoOptimizarController from './controllers/RuteoOptimizacionController'

import createDependencies from './dependencies/Dependencies'
import RuteoSchema from './schemas/RuteoSchema'

export default class RuteoModule implements IModule {
    private moduloRuta = '/ruteo'

    constructor() {
        createDependencies()
    }

    getRutas(): Ruta[] {
        const ruteoController = DEPENDENCY_CONTAINER.get<RuteoController>(TYPESDEPENDENCIES.RuteoController)
        const ruteoOptimizarController = DEPENDENCY_CONTAINER.get<RuteoOptimizarController>(
            TYPESDEPENDENCIES.RuteoOptimizarController,
        )
        return [
            {
                metodo: HTTPMETODO.GET,
                url: '/equipo/:id_equipo',
                evento: ruteoController.consultarEquipo.bind(ruteoController),
                schema: RuteoSchema.consultaEquipo,
            },
            {
                metodo: HTTPMETODO.GET,
                url: '/optimizar-ruta/:id_equipo',
                evento: ruteoOptimizarController.optimizarRutaEquipo.bind(ruteoOptimizarController),
                // schema: RuteoSchema.calcularRutaOptima,
            },
        ]
    }

    get ruta(): string {
        return this.moduloRuta
    }
}
