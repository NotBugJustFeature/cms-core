import * as zodTypes from './zod'
import { z } from 'zod'

export function sync<T, E = Error>(fn: () => T): [T, null] | [null, E] {
    try {
        return [fn() as T, null]
    } catch (e) {
        return [null, e as E]
    }
}
