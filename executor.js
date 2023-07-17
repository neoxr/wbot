const Api = new(require('./lib/system/neoxrApi'))(process.env.API_KEY)
modules.exports = async (client, ctx, env) => {
   const { m, body, prefix, plugins, commands, args, command, text, prefixes } = ctx
   const setting = global.db.setting
   try {
      if (body && prefix && commands.includes(command) || body && !prefix && commands.includes(command) && setting.noprefix || body && !prefix && commands.includes(command) && env.evaluate_chars.includes(command)) {
         plugins.map(async cmd => {
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            const name = cmd.pluginName
            if (!turn && !turn_hidden) return
            if (cmd.owner && !isOwner) return client.reply(m.chat, global.status.owner, m)
            cmd.async(m, {
               client,
               args,
               text,
               prefix,
               command,
               setting,
               env,
               cache
            })
         })
      } else {
         plugins.filter(v => !v.usage && !v.hidden).map(async event => {
            let name = event.eventName
            if (!m.isGroup && !['system_ev', 'menfess_ev', 'chatbot', 'auto_download'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < global.timer) return
            if (setting.self && !isOwner && !m.fromMe) return
            if (event.owner && !isOwner) return
            event.async(m, {
               client,
               body,
               prefixes,
               env,
               cache
            })
         })
      }
   } catch (e) {
      console.log(e)
   }
}