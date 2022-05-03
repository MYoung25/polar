#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv))
  .scriptName('yarn polar')
  .command('entity:create', 'create an entity', (yargs) => {
    return yargs
      .positional('port', {
        describe: 'port to bind on',
        default: 5000
      })
  }, (argv) => {
    require('./entity/create')
  })
  .command('routeindex:regenerate', 'regenerate routes/index.ts', (yargs) => {
    return yargs
  }, (argv) => {
    require('./entity/regenerate')
  })
  .parse()