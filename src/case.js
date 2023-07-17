const { Function: Func, Logs } = new(require('@neoxr/wb'))
const Api = new(require('../lib/system/neoxrApi'))(process.env.API_KEY)
const cache = new(require('node-cache'))({
   stdTTL: 3
})
module.exports = async (client, ctx, env) => {
   const { m, body, prefix, args, command, text, prefixes } = ctx
   const setting = global.db.setting
   Logs(client, m, false)
   if (cache.has(m.sender)) return m.reply('.')
   cache.set(m.sender, 1)
   try {
      switch (command) {
         case 'run':
         case 'runtime':
            m.reply(`*Running for : [ ${Func.toTime(process.uptime() * 1000)} ]*`)
            break
      }
   } catch (e) {
      console.log(e)
   }
   Func.reload(require.resolve(__filename))
}