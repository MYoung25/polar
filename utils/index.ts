#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv))
  .command('entity:create', 'create an entity', (yargs) => {
    return yargs
      .positional('port', {
        describe: 'port to bind on',
        default: 5000
      })
  }, (argv) => {
    require('./entity/create')
  })
  .command('permissions:seed', 'seed route permissions to database', (yargs) => {
    return yargs
  }, (argv) => {
    require('./permissions/seed')
  })
  .parse()