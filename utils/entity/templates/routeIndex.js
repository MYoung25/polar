const fs = require('fs')

module.exports = function () {
    const routes = fs.readdirSync('./src/routes/')
    .filter(route => route != 'index.ts' && !route.includes('test'))
    .map(route => route.replace('.ts', ''))
    .sort()

    return `import express, { Request, Response } from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { setupPassport } from "./auth"
${
    routes
        .map(route => 'import ' + route + ' from \'./' + route + '\'')
        .join('\n')
}

export const app = express()

app.use(helmet())

app.get('/ping', (req: Request, res: Response) => {
  const { readyState } = mongoose.connection
  let status = 503
  if (readyState) {
    status = 200
  }
  res.sendStatus(status)
})

app.use(express.json())
setupPassport(app)

${
    routes
        .map(route => 'app.use(\'/' + route.toLowerCase() + '\', ' + route + ')')
        .join('\n')
}
`
}
