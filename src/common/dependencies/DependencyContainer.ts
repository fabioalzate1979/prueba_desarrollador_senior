import { RedisRepository } from '@common/repositories/RedisRepository'
import TYPESREDIS from '@common/repositories/TypesRedis'
import { IServer } from '@infrastructure/app/server'
import FastifyServer from '@infrastructure/app/server/fastify/Fastify'
import TYPESSERVER from '@infrastructure/app/server/TypeServer'
import redisClient from '@infrastructure/cache/adapter/Redis'
import { RedisRuteoDao } from '@infrastructure/cache/dao'
import { Container } from 'inversify'
import { RedisClientType } from 'redis'

export const DEPENDENCY_CONTAINER = new Container()

export const globalDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<IServer>(TYPESSERVER.Fastify).to(FastifyServer).inSingletonScope()
    DEPENDENCY_CONTAINER.bind<RedisRepository>(TYPESREDIS.RedisRepository).to(RedisRuteoDao).inSingletonScope()
    DEPENDENCY_CONTAINER.bind<RedisClientType>(TYPESREDIS.RedisClientType).toConstantValue(redisClient)
}
