export * from '../shared/shared_types'

import type User from './user.js'

export interface Users { [id: string]: User }
export type IgnoredUserIds = Set<string>

export interface ImageDescObject {
    tags: string[],
    image: HTMLImageElement
}
