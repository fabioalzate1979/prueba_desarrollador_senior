import { createClient, RedisClientType } from 'redis'

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_PORT = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? ''

console.log('REDISPORT', REDIS_PORT)
console.log('REDISHOST', REDIS_HOST)

const redisClient: RedisClientType = createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    },
    password: REDIS_PASSWORD,
})

redisClient.on('error', (err) => console.error('ERR_REDIS:', err))

redisClient
    .connect()
    .then(() => {
        console.log('Redis client connected successfully!')
    })
    .catch((err) => {
        console.error('Redis client connection error:', err)
    })

export default redisClient
