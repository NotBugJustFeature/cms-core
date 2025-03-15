type TRoles = 'user' | 'admin' | '*'
type TCollections = 'user' | 'post' | 'comment' | '*'
type TScope = 'all' | 'own'

type ValueOrArray<T> = T | T[]

type Combination<T extends string, U extends string = ''> = T extends `${infer F}${infer R}`
    ? Combination<R, `${U}`> | Combination<R, `${U}${F}`>
    : U
type TCrud = 'c' | 'r' | 'u' | 'd'
export type TCrudCombination = Exclude<Combination<'crud'>, ''> | '*'

type Permission = `${TRoles}:${TCollections}:${TCrudCombination}:${TScope}`

type TPermissionStore = {
    roles: TRoles
    collection: TCollections
    crud: Record<TCrud, boolean>
    scope: TScope
    validator?: undefined | (() => boolean)
}

class PermissionHandler {
    private static instance: PermissionHandler
    private permissions: Array<TPermissionStore>

    private constructor() {
        this.permissions = new Array<TPermissionStore>()
    }

    public static getInstance(): PermissionHandler {
        if (!PermissionHandler.instance) {
            PermissionHandler.instance = new PermissionHandler()
        }
        return PermissionHandler.instance
    }

    private permissionSplitter(
        permission: Permission
    ): [TRoles, TCollections, TCrudCombination, TScope] {
        const [roles, collection, crud, scope] = permission.split(':')
        return [
            roles as TRoles,
            collection as TCollections,
            crud == '*' ? 'crud' : (crud as TCrudCombination),
            scope as TScope
        ]
    }

    public addPermission(permission: Permission, validator?: undefined | (() => boolean)) {
        const [roles, collection, crud, scope] = this.permissionSplitter(permission)
        // console.log(collection, crud.split(''), scope)
        const crudArray = crud.split('')
        const crudRes = ['c', 'r', 'u', 'd'].reduce(
            (acc, curr) => ({
                // @ts-ignore
                ...acc,
                [curr]: crudArray.includes(curr)
            }),
            {} as Record<TCrud, boolean>
        )
        console.log(crudRes)

        this.permissions.push({
            roles,
            collection,
            crud: crudRes,
            scope,
            validator
        })
    }
    private equalsOrProvided(a: any, b: any): boolean {
        if (a == b || a == '*' || b == '*') return true

        return false
    }
    private crudSatisfies(a: Record<TCrud, boolean>, b: TCrudCombination): boolean {
        const bArray = b.split('')
        //@ts-ignore
        return bArray.every((b) => Boolean(a[b]))
    }
    public hasPermission(permission: Permission): boolean {
        const [roles, collection, crud, scope] = this.permissionSplitter(permission)
        for (const perm of this.permissions) {
            if (
                this.equalsOrProvided(perm.roles, roles) &&
                this.equalsOrProvided(perm.collection, collection) &&
                this.crudSatisfies(perm.crud, crud) &&
                this.equalsOrProvided(perm.scope, scope)
            ) {
                return perm.validator ? perm.validator() : true
            }
        }
        return false
    }
}

export const permissionHandler = PermissionHandler.getInstance()
