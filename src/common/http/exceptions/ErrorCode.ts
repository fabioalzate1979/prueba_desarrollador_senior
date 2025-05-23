export enum ErrorCode {
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    BAD_MESSAGE = 'BAD_MESSAGE',
    SYNTAX_ERROR = 'SYNTAX_ERROR',
    REPOSITORY_ERROR = 'REPOSITORY_ERROR',
    PUBSUB_ERROR = 'PUBSUB_ERROR',
    POSTGRES_ERROR = 'POSTGRES_ERROR',
    REDIS_ERROR = 'REDIS_ERROR',
}

export enum StatusCode {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    PRECONDITION_FAILED = 412,
    I_AM_A_TEAPOT = 418,
    UNPROCESSABLE_ENTITY = 422,
    FAILED_DEPENDENCY = 424,
    TOO_EARLY = 425,
    PRECONDITION_REQUIRED = 428,
    INTERNAL_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
}
