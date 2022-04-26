const readline = require('readline')
const fs = require('fs')

const entityTemplate = require('./templates/entityTemplate')
const entityTestTemplate = require('./templates/entityTestTemplate')
const routeTemplate = require('./templates/routeTemplate')
const routeTestTemplate = require('./templates/routeTestTemplate')
const routeIndex = require('./templates/routeIndex')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const questions = [
    "What would you like to call this entity?",
    "Would you like to initialize CRUD routes for this entity? (y/n)"
]

let i = 0
let entityName
function askQuestion () {
    rl.question(`${questions[i]} `, (line) => {
        switch (i) {
            case 0:
                entityName = line.trim().replace(/\s/i, '_')
                try {
                    fs.readdirSync('./src/entities')
                } catch (e) {
                    fs.mkdirSync('./src/entities')
                }

                fs.writeFileSync(`./src/entities/${entityName}.ts`, entityTemplate(entityName))
                fs.writeFileSync(`./src/entities/${entityName}.test.ts`, entityTestTemplate(entityName))
                break;
            case 1:
                if (line.includes('y')) {
                    try {
                        fs.readdirSync('./src/routes')
                    } catch (e) {
                        fs.mkdirSync('./src/routes')
                    }

                    fs.writeFileSync(`./src/routes/${entityName}.ts`, routeTemplate(entityName))
                    fs.writeFileSync(`./src/routes/${entityName}.test.ts`, routeTestTemplate(entityName))
                    fs.writeFileSync(`./src/routes/index.ts`, routeIndex())

                    // add entity to jest setup import
                    let jestSetup = fs.readFileSync('./jest/setup.ts', 'utf8')

                    function insertStringAtRegexPosition (regex, string, position = 0) {
                        const matches = jestSetup.matchAll(regex)
                        const idx = [...matches][position].index
                        jestSetup = [jestSetup.slice(0, idx), string + '\n', jestSetup.slice(idx)].join('')
                    }

                    const testEntityName = entityName.toLowerCase().slice(0, -1)
                    // require entity
                    insertStringAtRegexPosition(/.+require\(.+\)/g,`const { ${entityName} } = require('../src/entities/${entityName}')`, 1)
                    // create entity
                    insertStringAtRegexPosition(/export const.+/g, `export const ${testEntityName} = new ${entityName}({})`)
                    // save entity
                    insertStringAtRegexPosition(/.+\.save/g, `\tawait ${testEntityName}.save()`)
                    // afterEach delete
                    insertStringAtRegexPosition(/.+deleteMany.+\$ne.+/g, `\tawait ${entityName}.deleteMany({ _id: { $ne: ${testEntityName}._id } })`)
                    // afterAll delete
                    insertStringAtRegexPosition(/(\s{1,4}|\t)await mongoose\.disconnect/g, `\tawait ${entityName}.deleteMany({})`)

                    fs.writeFileSync('./jest/setup.ts', jestSetup)
                    rl.write(`Edit the entity in src/entities/${entityName}.ts and add the entity to the jest setup in jest/setup.ts`)
                }
                break;
            default:
                return
        }

        i++
        if (questions[i]) {
            askQuestion()
        } else {
            rl.close()
        }
    })
}

askQuestion()

rl.on('close', () => {
    process.exit()
})
