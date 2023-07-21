const { Function: Func, Logs, Scraper } = new(require('@neoxr/wb'))
const env = require('./config.json')
const cron = require('node-cron')
const cache = new(require('node-cache'))({
   stdTTL: env.cooldown
})
module.exports = async (client, ctx) => {
   const { m, body, prefix, plugins, commands, args, command, text, prefixes } = ctx
   try {
      require('./lib/system/schema')(m, env) /* input database */
      const isOwner = [client.decodeJid(client.user.id).split`@` [0], env.owner, ...global.db.setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const isPrem = (global.db.users.some(v => v.jid == m.sender) && global.db.users.find(v => v.jid == m.sender).premium)
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
      if (!setting.online) client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) {
         client.sendPresenceUpdate('available', m.chat)
         client.readMessages([m.key])
      }
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Func.jsonFormat(m), m)
      if (m.isGroup) groupSet.activity = new Date() * 1
      if (users) users.lastseen = new Date() * 1
      if (chats) {
         chats.chat += 1
         chats.lastchat = new Date * 1
      }
      if (m.isGroup && !m.isBot && users && users.afk > -1) {
         client.reply(m.chat, `You are back online after being offline for : ${Func.texted('bold', Func.toTime(new Date - users.afk))}\n\n• ${Func.texted('bold', 'Reason')}: ${users.afkReason ? users.afkReason : '-'}`, m)
         users.afk = -1
         users.afkReason = ''
      }
      cron.schedule('00 00 * * *', () => {
         setting.lastReset = new Date * 1
         global.db.users.filter(v => v.limit < env.limit && !v.premium).map(v => v.limit = env.limit)
         Object.entries(global.db.statistic).map(([_, prop]) => prop.today = 0)
      }, {
         scheduled: true,
         timezone: global.timezone
      })
      if (m.isGroup && !m.fromMe) {
         let now = new Date() * 1
         if (!groupSet.member[m.sender]) {
            groupSet.member[m.sender] = {
               lastseen: now,
               warning: 0
            }
         } else {
            groupSet.member[m.sender].lastseen = now
         }
      }
      if (m.isBot || m.chat.endsWith('broadcast') || /edit/.test(m.mtype)) return
      const matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
      }
      if (body && prefix && commands.includes(command) || body && !prefix && commands.includes(command) && setting.noprefix || body && !prefix && commands.includes(command) && env.evaluate_chars.includes(command)) {
         if (setting.error.includes(command)) return client.reply(m.chat, Func.texted('bold', `🚩 Command _${(prefix ? prefix : '') + command}_ disabled.`), m)
         if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         if (cache.has(m.sender) && cache.get(m.sender) === 1 && !isOwner) return
         cache.set(m.sender, 1)
         if (commands.includes(command)) {
            users.hit += 1
            users.usebot = new Date() * 1
            Func.hitstat(command, m.sender)
         }
         const is_commands = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))
         for (let name in is_commands) {
            const cmd = is_commands[name].run
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            if (!turn && !turn_hidden) continue
            if (setting.self && !isOwner && !m.fromMe) continue
            if (!m.isGroup && !['owner', 'premium'].includes(name) && chats && !isPrem && !users.banned && setting.groupmode) {
               client.sendMessageModify(m.chat, `🚩 Using bot in private chat only for premium user, upgrade to premium plan only Rp. 20,000,- to get 1K limits for 1 month.\n\nIf you want to buy contact *${prefixes[0]}owner*`, m, {
                  largeThumb: true,
                  thumbnail: 'https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg',
                  url: setting.link
               }).then(() => chats.lastchat = new Date() * 1)
               continue
            }
            if (!['me', 'owner', 'exec'].includes(name) && users && (users.banned || new Date - users.banTemp < env.timer)) continue
            if (m.isGroup && !['activation', 'groupinfo'].includes(name) && groupSet.mute) continue
            if (cmd.cache && cmd.location) {
               let file = require.resolve(cmd.location)
               Func.reload(file)
            }
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.restrict && !isPrem && !isOwner && text && new RegExp('\\b' + setting.toxic.join('\\b|\\b') + '\\b').test(text.toLowerCase())) {
               client.reply(m.chat, `⚠️ You violated the *Terms & Conditions* of using bots by using blacklisted keywords, as a penalty for your violation being blocked and banned.`, m).then(() => {
                  users.banned = true
                  client.updateBlockStatus(m.sender, 'block')
               })
               continue
            }
            if (cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               continue
            }
            if (cmd.limit && users.limit < 1) {
               client.reply(m.chat, `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plans.`, m).then(() => users.premium = false)
               continue
            }
            if (cmd.limit && users.limit > 0) {
               const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit >= limit) {
                  users.limit -= limit
               } else {
                  client.reply(m.chat, Func.texted('bold', `⚠️ Your limit is not enough to use this feature.`), m)
                  continue
               }
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
            cmd.async(m, { client, args, text, isPrefix: prefix, prefixes, command, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, Func, Scraper })
            break
         }
      } else {
         const is_events = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => !prop.run.usage))
         for (let name in is_events) {
            let event = is_events[name].run
            if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !['system_ev'].includes(event.pluginName) && !isOwner && !m.fromMe) continue
            if (!m.isGroup && !['owner', 'premium'].includes(name) && chats && !isPrem && !users.banned && setting.groupmode) {
               client.sendMessageModify(m.chat, `🚩 Using bot in private chat only for premium user, upgrade to premium plan only Rp. 20,000,- to get 1K limits for 1 month.\n\nIf you want to buy contact *${prefixes[0]}owner*`, m, {
                  largeThumb: true,
                  thumbnail: 'https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg',
                  url: setting.link
               }).then(() => chats.lastchat = new Date() * 1)
               continue
            }
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && users && (users.banned || new Date - users.banTemp < env.timer)) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && groupSet && groupSet.mute) continue
            if (event.cache && event.location) {
               let file = require.resolve(event.location)
               Func.reload(file)
            }
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.group && !m.isGroup) continue
            if (event.limit && users.limit < 1) continue
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            if (event.download && (!setting.autodownload || (body && env.evaluate_chars.some(v => body.startsWith(v))))) continue
            event.async(m, { client, body, prefixes, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, Func, Scraper })
         }
      }
   } catch (e) {
      if (/(overlimit|timeout)/ig.test(e.message)) return
      console.log(e)
      if (!m.fromMe) return m.reply(Func.jsonFormat(new Error('neoxr-bot encountered an error :' + e)))
   }
   Func.reload(require.resolve(__filename))
}