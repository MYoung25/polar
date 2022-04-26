module.exports = function (entityName) {
return `import { Schema, model, Types } from 'mongoose'

export interface I${entityName} {
    _id: Types.ObjectId,
    name: string
}

export const ${entityName.toLowerCase()}Schema = new Schema({
    name: String
})

export const ${entityName} = model<I${entityName}>('${entityName}', ${entityName.toLowerCase()}Schema)
`
}
