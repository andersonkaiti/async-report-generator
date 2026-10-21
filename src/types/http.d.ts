export namespace Http {
  export interface Request {
    body: Record<string, unknown>
    params: Record<string, unknown>
  }

  export interface Response {
    statusCode: number
    body?: Record<string, unknown>
    headers?: Record<string, unknown>
  }
}
