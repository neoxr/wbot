const { Logs, Function: Func, Scraper } = new(require('@neoxr/wb'))
// const Api = new(require('./lib/system/neoxrApi'))(process.env.API_KEY)
const { execSync } = require('child_process')
const moment = require('moment-timezone')
moment.tz.setDefault(global.timezone).locale('id')
module.exports = async (client, m, env, cache) => {
   try {
      global.db.hitstat = global.db.hitstat ? global.db.hitstat : {}
      const body = typeof m.text == 'string' ? m.text : false
      const groupSet = global.db.groups.find(v => v.jid == m.chat),
         chats = global.db.chats.find(v => v.jid == m.chat),
         users = global.db.users.find(v => v.jid == m.sender),
         setting = global.db.setting
      const getPrefix = body ? body.charAt(0) : ''
      const prefix = (setting.multiprefix ? setting.prefix.includes(getPrefix) : setting.onlyprefix == getPrefix) ? getPrefix : undefined
      Logs(client, m, prefix)
      const plugins = neoxr.plugins.filter(v => !setting.hidden.includes(v.category)).filter(v => !setting.pluginDisable.includes(v.pluginName))
      const commands = plugins.filter(v => v.usage).map(v => v.usage).concat(plugins.filter(v => v.hidden).map(v => v.hidden)).flat(Infinity)
      const args = body && body.replace(prefix, '').split` `.filter(v => v)
      const command = args && args.shift().toLowerCase()
      const clean = body && body.replace(prefix, '').trim().split` `.slice(1)
      const text = clean ? clean.join` ` : undefined
      const prefixes = global.db.setting.multiprefix ? global.db.setting.prefix : [global.db.setting.onlyprefix]
      const matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
      }
      if (body && prefix && commands.includes(command) || body && !prefix && commands.includes(command) && setting.noprefix || body && !prefix && commands.includes(command) && global.evaluate_chars.includes(command)) {
         if (setting.error.includes(command) && (!setting.self || m.isGroup && groupSet.mute)) return client.reply(m.chat, Func.texted('bold', `🚩 Command _${(prefix ? prefix : '') + command}_ disabled.`), m)
         try {
            if (new Date() * 1 - chats.command > (env.cooldown * 1000)) {
               chats.command = new Date() * 1
            } else {
               if (!m.fromMe) return
            }
         } catch (e) {
            global.db.chats.push({
               jid: m.chat,
               chat: 1,
               lastchat: 0,
               lastseen: new Date() * 1,
               command: new Date() * 1
            })
         }
         if (commands.includes(command)) {
            users.hit += 1
            users.usebot = new Date() * 1
         }
        // if (!m.isGroup && global.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         neoxr.plugins.map(async cmd => {
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            const name = cmd.pluginName
            if (!turn && !turn_hidden) return
            
            if (cmd.owner && !isOwner) return client.reply(m.chat, global.status.owner, m)

            cmd.async(m, {
               client,
               args,
               text,
               prefix: prefix ? prefix : '',
               command,
               
               users,
               chats,
               groupSet,
               setting,
               Func,
               Scraper,
               execSync,
               env,
               cache
            })
         })
      } else {
         neoxr.plugins.filter(v => !v.usage && !v.hidden).map(async event => {
            let name = event.eventName
            if (!m.isGroup && !['system_ev', 'menfess_ev', 'chatbot', 'auto_download'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < global.timer) return
            if (setting.self && !isOwner && !m.fromMe) return
            if (event.owner && !isOwner) return
            event.async(m, {
               client,
               body,
               
               prefixes,
               
               users,
               chats,
               groupSet,
              
               setting,
               Func,
               Scraper,
               env,
               cache
            })
         })
      }
   } catch (e) {
  	if (/(overlimit|timeout|banned)/ig.test(e.message)) return
      console.log(e)
      if (!m.fromMe) return m.reply(Func.jsonFormat(new Error('neoxr-bot encountered an error :' + e)))
   }
   Func.reload(require.resolve(__filename))
}