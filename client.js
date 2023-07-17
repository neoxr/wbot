"use strict";
const { Baileys, MongoDB, PostgreSQL, Scandir, Function: Func, NeoxrCommands: Commands } = new(require('./wb'))
const spinnies = new(require('spinnies'))(),
   fs = require('fs'),
   colors = require('@colors/colors'),
   stable = require('json-stable-stringify'),
   env = require('./config.json')
if (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) MongoDB.db = env.database
const machine = (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) ? MongoDB : (process.env.DATABASE_URL && /postgres/.test(process.env.DATABASE_URL)) ? PostgreSQL : new(require('./lib/system/localdb'))(env.database)
const client = new Baileys({
   sf: 'session',
   version: [2, 2318, 11]
})
global.neoxr = Commands
client.on('connect', async () => {
   /* load database */
   global.db = {users: [], chats: [], groups: [], setting: {}, ...(await machine.fetch() || {})}
   
   /* save database */
   await machine.save(global.db)
})

client.on('error', async error => console.log(colors.red(error.message)))

client.on('ready', async () => {
   /* await Func.delay(1000)
   spinnies.add('start', {
      text: 'Load Plugins . . .'
   }) */
   
   /* load all plugins */
   /* const plugins = await Scandir('./plugins')
   plugins.filter(v => v.endsWith('.js')).map(file => require(file))
   await Func.delay(1000)
   spinnies.succeed('start', {
      text: `${plugins.length} Plugins loaded`
   }) */
   
     /* auto restart if ram usage is over */
   const ramCheck = setInterval(() => {
      var ramUsage = process.memoryUsage().rss
      if (ramUsage >= env.ram_usage) {
         clearInterval(ramCheck)
         process.send('reset')
      }
   }, 60 * 1000)

   /* clear temp folder every 3 minutes */
   setInterval(() => {
      const tmpFiles = fs.readdirSync('./temp')
      if (tmpFiles.length > 0) {
         tmpFiles.map(v => fs.unlinkSync('./temp/' + v))
      }
   }, 60 * 1000 * 3)
   
   /* save database every 30 seconds */
   setInterval(async () => {
      if (global.db) await machine.save(global.db)
   }, 30_000)
})

client.on('message', ctx => require('./src/case')(client.sock, ctx, env))