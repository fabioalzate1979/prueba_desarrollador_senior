import { ErrorCode, StatusCode } from './ErrorCode'
import Exception from './Exceptions'

export default class RedisError extends Exception {
    constructor(message: string) {
        const fsError = ErrorCode.REDIS_ERROR
        super(message, ErrorCode.REDIS_ERROR, StatusCode.INTERNAL_ERROR, fsError)
    }
}
