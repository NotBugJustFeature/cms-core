type actions = 'read' | 'readAll' | 'create' | 'delete' | 'update'

type TQueryOverride = { allowed: boolean; queryOverride?: Record<string, any> }

type PermissionResult = boolean | TQueryOverride | Promise<boolean | TQueryOverride>

class PermissionHandler {
    private static instance: PermissionHandler
    private permissions: Map<string, Map<actions, (context: any) => PermissionResult>>
    private defaultPolicy: (context: any) => PermissionResult

    private constructor() {
        this.permissions = new Map()
        this.defaultPolicy = async () => true
    }

    static getInstance(): PermissionHandler {
        if (!PermissionHandler.instance) {
            PermissionHandler.instance = new PermissionHandler()
        }
        return PermissionHandler.instance
    }

    register(resource: string, action: actions, fn: (context: any) => PermissionResult) {
        if (!this.permissions.has(resource)) {
            this.permissions.set(resource, new Map())
        }
        this.permissions.get(resource)!.set(action, fn)
    }

    setDefaultPolicy(fn: (context: any) => PermissionResult) {
        this.defaultPolicy = fn
    }

    async check(
        resource: string,
        action: actions,
        context: any
    ): Promise<boolean | TQueryOverride> {
        const resourcePerms = this.permissions.get(resource)
        if (!resourcePerms) return await this.defaultPolicy(context)

        const fn = resourcePerms.get(action)
        if (!fn) return await this.defaultPolicy(context)

        return await fn(context)
    }
}

export default PermissionHandler.getInstance()
