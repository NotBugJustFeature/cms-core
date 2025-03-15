type TRoles = 'user' | 'admin' | '*'
type TCollections = 'user' | 'post' | 'comment' | '*'
type TScope = 'all' | 'own'

type Combination<T extends string, U extends string = ''> = T extends `${infer F}${infer R}`
    ? Combination<R, `${U}`> | Combination<R, `${U}${F}`>
    : U
type TCrud = 'c' | 'r' | 'u' | 'd'
export type TCrudCombination = Exclude<Combination<'crud'>, ''> | '*'

type Permission<
    R extends string = TRoles,
    C extends string = TCollections
> = `${R}:${C}:${TCrudCombination}:${TScope}`

type TPermissionStore<R extends string = TRoles, C extends string = TCollections> = {
    roles: R | '*'
    collection: C | '*'
    crud: Record<TCrud, boolean>
    scope: TScope
    validator?: undefined | (() => boolean)
}

class PermissionHandler<R extends string = TRoles, C extends string = TCollections> {
    private static instance: typeof PermissionHandler
    private permissions: Array<TPermissionStore<R, C>>

    private constructor() {
        this.permissions = new Array<TPermissionStore<R, C>>()
    }

    public static getInstance<
        R extends string = TRoles,
        C extends string = TCollections
    >(): PermissionHandler<R, C> {
        if (!PermissionHandler.instance) {
            PermissionHandler.instance = new PermissionHandler<
                R,
                C
            >() as unknown as typeof PermissionHandler
        }
        return PermissionHandler.instance as unknown as PermissionHandler<R, C>
    }

    private permissionSplitter(
        permission: Permission<R, C>
    ): [R | '*', C | '*', TCrudCombination, TScope] {
        const [roles, collection, crud, scope] = permission.split(':')
        return [
            roles as R | '*',
            collection as C | '*',
            crud == '*' ? 'crud' : (crud as TCrudCombination),
            scope as TScope
        ]
    }

    public addPermission(permission: Permission<R, C>, validator?: undefined | (() => boolean)) {
        const [roles, collection, crud, scope] = this.permissionSplitter(permission)
        const crudArray = crud.split('')
        const crudRes = ['c', 'r', 'u', 'd'].reduce(
            (acc, curr) => ({
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

    public hasPermission(permission: Permission<R, C>): boolean {
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

export const permissionHandler = PermissionHandler.getInstance<
    'user' | 'admin',
    'post' | 'comment' | 'user'
>()
permissionHandler.addPermission('admin:post:c:all', () => true)
console.log(permissionHandler.hasPermission('user:*:*:all'))
