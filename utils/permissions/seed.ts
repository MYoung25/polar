import fs from 'fs'
import path from 'path'
import { RouteInterface } from "./permissionsUtilities"
import { establishMongooseConnection } from "../../src/mongodb"
import { HydratedDocument } from 'mongoose'
import { Permissions, IPermissions } from "../../src/entities/Permissions"
import { Roles } from "../../src/entities/Roles"

// @ts-ignore
fs.readdir('./src/routes/', async (err, files) => {
    const permissionsRoutes = files.filter((file: string) => (
        !file.includes('test') && file.includes('.ts') && file !== 'index.ts'
    ))

    const permissionsList: HydratedDocument<IPermissions>[] = []
    await Promise.all(permissionsRoutes.map(async module => {
        import(path.resolve(__dirname, `../../src/routes/${module}`))
            .then(router => {
                let moduleCommonName = module.replace('.ts', '').toLowerCase()

                router.default.stack.forEach((layer: {
                    route: {
                        path: string,
                        stack: any[],
                        methods: RouteInterface
                    }
                }) => {
                    const path = layer.route.path.slice(1).replace(':', '')
                    Object.entries(layer.route.methods)
                        .filter(([method, bool]) => bool)
                        .forEach(([method]) => {
                            permissionsList.push(new Permissions({
                                name: `${moduleCommonName}.${path ? path + '.' : ''}${method}`,
                                group: moduleCommonName
                            }))
                        })
                })
            })
    }))

    try {
        await establishMongooseConnection()
    } catch (e: any) {
        console.error(e?.message)
        process.exit(1)
    }

    // TODO delete permissions that no longer exist
    const allCurrentPermissions = await Permissions.find({})
    const hashedCurrentPermissions = allCurrentPermissions.reduce((acc: Record<string, IPermissions>, curr) => {
        acc[curr.name] = curr
        return acc
    }, {})

    const savedPermissions = await Promise.all(permissionsList.map(async (permission: HydratedDocument<IPermissions>) => {
        const { name, group } = permission
        if (hashedCurrentPermissions[name]) {
            // remove from current permissions, anything left at the end will be deleted
            delete hashedCurrentPermissions[name]
        }
        return Permissions.findOneAndUpdate({ name: permission.name }, {
            name, group
        }, { upsert: true, returnDocument: 'after' })
    }))

    await Permissions.deleteMany({ _id: { $in: Object.values(hashedCurrentPermissions).map(({ _id }) => _id) } })

    await Roles.findOneAndUpdate(
        { name: 'SUPERADMIN' },
        {
            name: 'SUPERADMIN',
            permissions: savedPermissions
        },
        { upsert: true }
    )

    await Roles.findOneAndUpdate(
        { name: 'user' },
        { name: 'USER', permissions: savedPermissions.filter((permission: HydratedDocument<unknown, IPermissions>) => permission.name === 'users.me.get')},
        { upsert: true }
    )

    process.exit()
})
