const { Function: Func, Logs, Scraper } = new(require('@neoxr/wb'))
const env = require('./config.json')
const cache = new(require('node-cache'))({
   stdTTL: env.cooldown
})
module.exports = async (client, ctx) => {
   const { m, body, prefix, plugins, commands, args, command, text, prefixes } = ctx
   try {
      require('./lib/system/schema')(m) /* input database */
      const isOwner = [client.decodeJid(client.user.id).split`@` [0], env.owner, ...global.db.setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      const participants = m.isGroup ? groupMetadata.participants : [] || []
      const adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      const isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net') : false
      const blockList = typeof await (await client.fetchBlocklist()) != 'undefined' ? await (await client.fetchBlocklist()) : []
      const groupSet = global.db.groups.find(v => v.jid == m.chat),
         chats = global.db.chats.find(v => v.jid == m.chat),
         users = global.db.users.find(v => v.jid == m.sender),
         setting = global.db.setting
      Logs(client, m, false)
      if (cache.has(m.sender) && cache.get(m.sender) === 1 && !isOwner) return
      cache.set(m.sender, 1)
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Func.jsonFormat(m), m)
      if (m.isGroup) groupSet.activity = new Date() * 1
      if (users) users.lastseen = new Date() * 1
      if (chats) {
         chats.chat += 1
         chats.lastchat = new Date * 1
      }
      if (m.isBot || m.chat.endsWith('broadcast') || /edit/.test(m.mtype)) return
      const matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
      }
      if (body && prefix && commands.includes(command) || body && !prefix && commands.includes(command) && setting.noprefix || body && !prefix && commands.includes(command) && env.evaluate_chars.includes(command)) {
     	if (setting.error.includes(command)) return client.reply(m.chat, Func.texted('bold', `🚩 Command _${(prefix ? prefix : '') + command}_ disabled.`), m)
         if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         for (let cmd of plugins.filter(v => v.usage || v.hidden)) {
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            const name = cmd.pluginName
            if (!turn && !turn_hidden) continue
            if (setting.self && !isOwner && !m.fromMe) continue
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (cmd.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            cmd.async(m, {
               client,
               args,
               text,
               prefix,
               prefixes,
               command,
               groupMetadata,
               participants,
               users,
               chats,
               groupSet,
               setting,
               isOwner,
               isAdmin,
               isBotAdmin,
               plugins,
               blockList,
               env,
               ctx,
               Func,
               Scraper
            })
         }
      } else {
         for (let event of plugins.filter(v => !v.usage && !v.hidden)) {
            const name = event.eventName
            if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !['system_ev'].includes(event.pluginName) && !isOwner && !m.fromMe) continue
            if (event.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (event.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (event.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (event.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (event.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            event.async(m, {
               client,
               body,
               prefixes,
               groupMetadata,
               participants,
               users,
               chats,
               groupSet,
               setting,
               isOwner,
               isAdmin,
               isBotAdmin,
               plugins,
               blockList,
               env,
               ctx,
               Func,
               Scraper
            })
         }
      }
   } catch (e) {
      if (/(overlimit|timeout)/ig.test(e.message)) return
      console.log(e)
      if (!m.fromMe) return m.reply(Func.jsonFormat(new Error('neoxr-bot encountered an error :' + e)))
   }
   Func.reload(require.resolve(__filename))
}