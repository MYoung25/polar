module.exports = function (entityName) {
    return `import { logger } from '../config/index'
import { Router, Response, Request } from 'express'
import { ${entityName} } from '../entities/${entityName}'
import { userHasPermissions } from './auth/middleware'
import { createFilteredQuery, createQueryOptions } from '../entities/queryUtils'

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
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *            type: integer
 *            minimum: 1
 *      - in: query
 *        name: offset
 *        schema:
 *            type: integer
 *      - in: query
 *        name: sort
 *        schema:
 *            type: string
 *            enum: []
 *      - in: query
 *        name: order
 *        schema:
 *            type: string
 *            enum: [asc, desc]
 *            default: asc
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
        try {
            const { name }: {
                name?: string
            } = req.query

            const searchFor = {
                name
            }

            const queryOptions = createQueryOptions(req.query)

            const items = await ${entityName}.find(createFilteredQuery(searchFor, req), undefined, queryOptions)
            res.json(items)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
    })
    .post(userHasPermissions(), async (req: Request, res: Response) => {
        try {
            const item = new ${entityName}(req.body)
            await item.save()
            res.status(201).json(item)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
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
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema: 
 *                      $ref: '#/components/schemas/${entityName}'
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
            const item = await ${entityName}.findOne(createFilteredQuery({ _id: req.params.id }, req))
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
            const item = await ${entityName}.findOne(createFilteredQuery({ _id: req.params.id }, req))
            if (!item) return res.sendStatus(404)

            item.set(req.body)
            await item.save()

            res.json(item)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
    })
    .delete(userHasPermissions(), async (req: Request, res: Response) => {
        try {
            const item = await ${entityName}.deleteOne(createFilteredQuery({ _id: req.params.id }, req))
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
