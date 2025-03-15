type TRoles = 'user' | 'admin' | '*'
type TCollections = 'user' | 'post' | 'comment' | '*'
type TScope = 'all' | 'own' | '*'

type Combination<T extends string, U extends string = ''> = T extends `${infer F}${infer R}`
    ? Combination<R, `${U}`> | Combination<R, `${U}${F}`>
    : U
type TCrud = 'c' | 'r' | 'u' | 'd'
export type TCrudCombination = Exclude<Combination<'crud'>, ''> | '*'

type Permission<R extends string = TRoles, C extends string = TCollections> = `${R | '*'}:${
    | C
    | '*'}:${TCrudCombination}:${TScope}`

type TPermissionStore<R extends string = TRoles, C extends string = TCollections> = {
    roles: R
    collection: C
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

    private permissionSplitter(permission: Permission<R, C>): [R, C, TCrudCombination, TScope] {
        const [roles, collection, crud, scope] = permission.split(':')
        return [roles as R, collection as C, crud as TCrudCombination, scope as TScope]
    }
    public addPermissionShort(
        permissions: Permission<R, C>,
        validator?: undefined | (() => boolean)
    ) {
        const [roles, collection, crud, scope] = this.permissionSplitter(permissions)
        this.addPermission(roles, collection, crud, scope, validator)
    }
    public addPermission(
        roles: R,
        collection: C,
        crud: TCrudCombination,
        scope: TScope,
        validator?: undefined | (() => boolean)
    ) {
        if (crud == '*') {
            crud = 'crud'
        }

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
        if (b == '*') return true
        const bArray = b.split('')
        bArray.every((b) => {
            //@ts-ignore
            // console.log(a, b, a[b])
            //@ts-ignore
            return Boolean(a[b])
        })
        //@ts-ignore
        return bArray.every((b) => Boolean(a[b]))
    }
    public hasPermissionShort(permission: Permission<R, C>): boolean {
        const [roles, collection, crud, scope] = this.permissionSplitter(permission)
        return this.hasPermission(roles, collection, crud, scope)
    }
    public hasPermission(roles: R, collection: C, crud: TCrudCombination, scope: TScope): boolean {
        for (const perm of this.permissions) {
            console.log(
                this.equalsOrProvided(perm.roles, roles),
                this.equalsOrProvided(perm.collection, collection),
                this.crudSatisfies(perm.crud, crud),
                this.equalsOrProvided(perm.scope, scope)
            )
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
    'asd' | 'admin',
    'post' | 'comment' | 'user'
>()
permissionHandler.addPermission('asd', 'user', 'd', 'own', () => true)
console.log(permissionHandler.hasPermission('asd', 'user', 'd', 'own'))
permissionHandler.addPermissionShort('asd:post:*:*', () => true)
console.log(permissionHandler.hasPermissionShort('asd:post:crud:*'))
