module.exports = function (entityName) {
    const testEntityName = entityName.toLowerCase().slice(0, -1)

    return `import mongoose from 'mongoose'
import request from 'supertest'
import { ${testEntityName} as item } from '../../jest/setup'
import { getLoggedInSuperAdminAgent } from '../../jest/utilities'
import { app } from './index'
import { ${entityName} } from '../entities/${entityName}'

// suppress error messages
jest.spyOn(console, 'error')
    .mockImplementation(() => ({}))

describe('/api/${entityName}', () => {
    let superadminAgent: request.SuperAgentTest

    beforeEach(async () => {
        superadminAgent = await getLoggedInSuperAdminAgent(app)
    })

    describe('GET', () => {

        it('returns a 200', async () => {
            const response = await superadminAgent.get('/${entityName}')
            expect(response.statusCode).toBe(200)
        })
        
        it('returns all ${entityName}s', async() => {
            const response = await superadminAgent.get('/${entityName}')
            expect(response.body.length).toBe(1)
        })
        
        // remove this for public routes
        it('returns a 401 for a user without permissions', async () => {
            const response = await request(app).get('/${entityName}')
            expect(response.statusCode).toBe(401)
        })

    })

    describe('POST', () => {
            
        it('returns a 201', async () => {
            const response = await superadminAgent.post('/${entityName}').send({})
            expect(response.statusCode).toBe(201)
        })

        it('returns the new ${entityName}', async () => {
            const response = await superadminAgent.post('/${entityName}').send({ name: '${entityName}' })
            expect(response.body).toHaveProperty('name', '${entityName}')
        })

        it('inserts the new ${entityName}', async () => {
            const response = await superadminAgent.post('/${entityName}').send({ name: '${entityName}' })
            const item = await ${entityName}.findById(response.body._id)
            expect(item).toHaveProperty('name', '${entityName}')
        })

        it('returns a 401 for a user without permissions', async () => {
            const response = await request(app).post('/${entityName}').send({ name: '${entityName}' })
            expect(response.statusCode).toBe(401)
        })

        it('returns 500 if the body is malformed', async () => {
            const response = await superadminAgent.post('/${entityName}').send({ _id: 'asdasfas' })
            expect(response.statusCode).toEqual(500)
        })
    
    })

    describe('/:id', () => {

        describe('GET', () => {

            it('returns a 200', async () => {
                const response = await superadminAgent.get(\`/${entityName}/` + '${item._id}' + `\`)
                expect(response.statusCode).toBe(200)
            })

            it('returns the ${entityName}', async () => {
                const response = await superadminAgent.get(\`/${entityName}/` + '${item._id}' + `\`)
                expect(response.body).toHaveProperty('_id', expect.any(String))
                expect(response.body).toHaveProperty('__v', 0)
            })

            it('returns a 404', async () => {
                const response = await superadminAgent.get(\`/${entityName}/` + '${new mongoose.Types.ObjectId()}' + `\`)
                expect(response.statusCode).toBe(404)
            })

            it('sends a 500 if a cast error occurs on _id', async () => {
                const response = await superadminAgent.get(\`/${entityName}/dfghjkkjhgf\`)
                expect(response.statusCode).toBe(500)
            })

            it('returns a 401 for a user without permissions', async () => {
                const response = await request(app).get(\`/${entityName}/` + '${item._id}' + `\`)
                expect(response.statusCode).toBe(401)
            })

        })

        describe('PATCH', () => {

            it('returns a 200', async () => {
                const response = await superadminAgent.patch(\`/${entityName}/` + '${item._id}' + `\`).send({ name: '${entityName}' })
                expect(response.statusCode).toBe(200)
            })

            it('returns the updated ${entityName}', async () => {
                const response = await superadminAgent.patch(\`/${entityName}/` + '${item._id}' + `\`).send({ name: 'Superman' })
                expect(response.body).toHaveProperty('name', 'Superman')
            })

            it('returns a 404', async () => {
                const response = await superadminAgent.patch(\`/${entityName}/` + '${new mongoose.Types.ObjectId()}' + `\`).send({ name: '${entityName}' })
                expect(response.statusCode).toBe(404)
            })

            it('sends a 500 if a cast error occurs on _id', async () => {
                const response = await superadminAgent.patch(\`/${entityName}/dfghjkkjhgf\`).send({ name: '${entityName}' })
                expect(response.statusCode).toBe(500)
            })

            it('returns a 401 for a user without permissions', async () => {
                const response = await request(app).patch(\`/${entityName}/` + '${item._id}' + `\`).send({ name: '${entityName}' })
                expect(response.statusCode).toBe(401)
            })

        })

        describe('DELETE', () => {

            it('returns a 204', async () => {
                const response = await superadminAgent.delete(\`/${entityName}/` + '${item._id}' + `\`)
                expect(response.statusCode).toBe(204)
            })

            it('deletes the ${entityName}', async () => {
                await superadminAgent.delete(\`/${entityName}/` + '${item._id}' + `\`)
                const found = await ${entityName}.findById(item._id)
                expect(found).toBeNull()
            })

            it('tries to delete a nonexistent ${entityName}', async () => {
                const response = await superadminAgent.delete(\`/${entityName}/` + '${new mongoose.Types.ObjectId()}' + `\`)
                expect(response.statusCode).toBe(404)
            })

            it('sends a 500 if an error occurs', async () => {
                const response = await superadminAgent.delete(\`/${entityName}/dfghjkkjhgf\`)
                expect(response.statusCode).toBe(500)
            })

            it('returns a 401 for a user without permissions', async () => {
                const response = await request(app).delete(\`/${entityName}/` + '${item._id}' + `\`)
                expect(response.statusCode).toBe(401)
            })

        })
    
    })

})
`
}
