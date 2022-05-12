module.exports = function (entityName) {
return `import { Schema, model, Types } from 'mongoose'

export interface I${entityName} {
    _id: Types.ObjectId,
    name: string
}

/**
 * @openapi
 * components:
 *  schemas:
 *      ${entityName}:
 *          type: object
 *          required:
 *              - name
 *          properties:
 *              _id: 
 *                  type: string
 *                  example: '627afea4acf098768c92b855'
 *              name:
 *                  type: string
 *                  example: '${entityName}'
 */
export const ${entityName.toLowerCase()}Schema = new Schema({
    name: String
})

export const ${entityName} = model<I${entityName}>('${entityName}', ${entityName.toLowerCase()}Schema)
`
}
