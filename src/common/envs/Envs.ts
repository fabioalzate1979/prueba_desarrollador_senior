import dotenv from 'dotenv'
import validateEnvs from './Validate'
import getEnvFile from './EnvFile'

const isTestingJestEnv = process.env.NODE_ENV === 'test'

dotenv.config({
    path: getEnvFile(),
})

const ENV = {
    POSTGRES_HOST: process.env.POSTGRES_HOST as string,
    DOMAIN: process.env.DOMAIN || '',
    SERVICE_NAME: process.env.SERVICE_NAME || '',
    PROJECT_ID: process.env.PROJECT_ID || 'nombre-proyecto',
    ENV: process.env.ENV || 'local',
    HOST: process.env.HOST || 'localhost',
    PG_PORT: process.env.PG_PORT || '',
    POSTGRES_USER: process.env.POSTGRES_USER || '',
    POSTGRES_PASS: process.env.POSTGRES_PASS || '',
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || '',
    PORT: process.env.PORT || '8080',
    PREFIX_LOGGER: process.env.PREFIX_LOGGER || '',
    LOGGER_LEVEL: process.env.LOGGER_LEVEL || 'false',
    VERSION: process.env.VERSION ?? 'v1',
    REDIS_HOST: process.env.REDIS_HOST || '',
    REDIS_PORT: process.env.REDIS_PORT || '',
    REDIS_TIMEOUT: process.env.REDIS_TIMEOUT || '',
}

if (!isTestingJestEnv) validateEnvs(ENV)

export default ENV
