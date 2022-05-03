const fs = require('fs')

const routeIndex = require('./templates/routeIndex')

fs.writeFileSync(`./src/routes/index.ts`, routeIndex())