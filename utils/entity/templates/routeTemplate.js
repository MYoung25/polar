module.exports = function (entityName) {
    return `import { logger } from '../config/index'
import { Router, Response, Request } from 'express'
import { ${entityName} } from '../entities/${entityName}'
import { userHasPermissions } from './auth/middleware'

const router = Router()

router.route('/')
    .get(userHasPermissions(), async (req: Request, res: Response) => {
        const items = await ${entityName}.find({})
        res.json(items)
    })
    .post(userHasPermissions(), async (req: Request, res: Response) => {
        const item = new ${entityName}(req.body)
        await item.save()
        res.status(201).json(item)
    })

router.route('/:id')
    .get(userHasPermissions(), async (req: Request, res: Response) => {
        try {
            const item = await ${entityName}.findOne({ _id: req.params.id })
            if (item) {
                res.json(item)
                return
            }
            res.sendStatus(404)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
    })
    .patch(userHasPermissions(), async (req: Request, res: Response) => {
        try {
            const item = await ${entityName}.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
            if (item) {
                res.json(item)
                return
            }
            res.sendStatus(404)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
    })
    .delete(userHasPermissions(), async (req: Request, res: Response) => {
        try {
            const item = await ${entityName}.deleteOne({ _id: req.params.id })
            if (item.deletedCount === 1) {
                res.sendStatus(204)
                return
            }
            res.sendStatus(404)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
    })

export default router
`
}
