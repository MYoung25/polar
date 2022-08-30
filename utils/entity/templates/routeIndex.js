const fs = require('fs')

module.exports = function () {
    const routes = fs.readdirSync('./src/routes/')
    .filter(route => route != 'index.ts' && !route.includes('test'))
    .map(route => route.replace('.ts', ''))
    .sort()

    return `import express, { Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import pinoHttp from 'pino-http'
import { config } from '../config'
import { setupPassport } from "./auth"
${
    routes
        .map(route => 'import ' + route + ' from \'./' + route + '\'')
        .join('\n')
}

export const app = express()

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: config.npm_package_name,
        version: config.npm_package_version,
    },
}

const swaggerJSDocOptions = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./src/routes/*.ts', './src/routes/auth/*.ts', './src/entities/*.ts'],
}
  
const swaggerSpec = swaggerJSDoc(swaggerJSDocOptions);
  
const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        filter: true,
        tagsSorter: 'alpha'
    }
}

app.use(cors(config.cors))
app.get("/docs/swagger.json", (req, res) => res.json(swaggerSpec));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))  

app.use(helmet())

/** 
 * @openapi
 * /ping:
 *  get:
 *    operationId: ping
 *    summary: ping
 *    description: Ping route for docker healthcheck
 *    responses:
 *      200: 
 *        description: container is active
 *      503:
 *        description: container is starting/inactive/errored
 */
app.get('/ping', (req: Request, res: Response) => {
  const { readyState } = mongoose.connection
  let status = 503
  if (readyState) {
    status = 200
  }
  res.sendStatus(status)
})

if (config.node_env === 'test') {
    app.use(pinoHttp())
}
app.use(express.json())
setupPassport(app)

${
    routes
        .map(route => 'app.use(\'/' + route.toLowerCase() + '\', ' + route + ')')
        .join('\n')
}
`
}
