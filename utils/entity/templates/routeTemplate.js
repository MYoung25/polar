module.exports = function (entityName) {
    return `import { logger } from '../config/index'
import { Router, Response, Request } from 'express'
import { ${entityName} } from '../entities/${entityName}'
import { userHasPermissions } from './auth/middleware'

/**
 * @openapi
 * tags: 
 *  - name: ${entityName.toLowerCase()}
 *    description: ${entityName}
 */
const router = Router()
/**
 * @openapi
 * /${entityName.toLowerCase()}:
 *  get:
 *    tags:
 *      - ${entityName.toLowerCase()}
 *    operationId: search${entityName}
 *    summary: Search ${entityName} records
 *    description: Get ${entityName} records
 *    responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                  type: array
 *                  items:
 *                      $ref: '#/components/schemas/${entityName}'
 *  post:
 *    tags:
 *      - ${entityName.toLowerCase()}
 *    operationId: create${entityName}
 *    summary: Create a ${entityName} record
 *    description: Create a new ${entityName} record
 *    requestBody:
 *      content:
 *          application/json:
 *              schema: 
 *                  $ref: '#/components/schemas/${entityName}'
 *    responses:
 *      201:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/${entityName}'
 */
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

/**
 * @openapi
 * /${entityName.toLowerCase()}/{id}:
 *  parameters:
 *      - in: path
 *        name: id
 *  get:
 *      tags:
 *          - ${entityName.toLowerCase()}
 *      operationId: get${entityName}
 *      summary: Get a single ${entityName} record
 *      description: Get a single ${entityName} record
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/${entityName}'
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred
 *  patch:
 *      tags:
 *          - ${entityName.toLowerCase()}
 *      operationId: update${entityName}
 *      summary: Update a single ${entityName} record
 *      description: Update a single ${entityName} record
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/${entityName}'
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred 
 *  delete:
 *      tags:
 *          - ${entityName.toLowerCase()}
 *      operationId: delete${entityName}
 *      summary: Delete a ${entityName} record
 *      description: Delete a ${entityName} record
 *      responses:
 *          204:
 *              description: Success
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred
 */
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
