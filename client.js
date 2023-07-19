"use strict";
const { Baileys, MongoDB, PostgreSQL, Scandir, Function: Func, NeoxrCommands: Commands } = new(require('@neoxr/wb'))
const spinnies = new(require('spinnies'))(),
   fs = require('fs'),
   colors = require('@colors/colors'),
   stable = require('json-stable-stringify'),
   env = require('./config.json')
if (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) MongoDB.db = env.database
const machine = (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) ? MongoDB : (process.env.DATABASE_URL && /postgres/.test(process.env.DATABASE_URL)) ? PostgreSQL : new(require('./lib/system/localdb'))(env.database)
const client = new Baileys({
   sf: 'session', // Session Folder
   version: [2, 2318, 11] // WhatsApp Web Version
})
global.neoxr = Commands
/* starting to connect */
client.on('connect', async () => {
   /* load database */
   global.db = {users: [], chats: [], groups: [], setting: {}, ...(await machine.fetch() || {})}
   
   /* save database */
   await machine.save(global.db)
})

/* print error */
client.on('error', async error => console.log(colors.red(error.message)))

/* bot is connected */
client.on('ready', async () => {
   /* load all plugins */
   spinnies.add('start', {
      text: 'Load Plugins . . .'
   })
   const plugins = await Scandir('./plugins')
   plugins.filter(v => v.endsWith('.js')).map(file => require(file))
   spinnies.succeed('start', {
      text: `${plugins.length} Plugins loaded`
   })

   /* auto restart if ram usage is over */
   const ramCheck = setInterval(() => {
      var ramUsage = process.memoryUsage().rss
      if (ramUsage >= env.ram_usage) {
         clearInterval(ramCheck)
         process.send('reset')
      }
   }, 60 * 1000)
   
   /* require all additional functions */
   require('./lib/system/config')
   
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

/* print all message object */
client.on('message', ctx => require('./handler')(client.sock, ctx))

/* print deleted message object */
client.on('message.delete', ctx => ctx ? client.sock.copyNForward(ctx.chat, ctx.delete) : '')

/* other events */
client.on('group.add', ctx => console.log(ctx))
client.on('group.remove', ctx => console.log(ctx))
client.on('group.promote', ctx => console.log(ctx))
client.on('group.demote', ctx => console.log(ctx))
client.on('caller', ctx => console.log(ctx))