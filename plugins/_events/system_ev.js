neoxr.create(async (m, {
   client,
   body,
   Func
}) => {
   try {
      // Clear DB
      setInterval(async () => {
         let day = 86400000 * 14,
            now = new Date() * 1
         global.db.users.filter(v => now - v.lastseen > day && !v.premium && !v.banned && v.point < 1000000).map(v => {
            let user = global.db.users.find(x => x.jid == v.jid)
            if (user) Func.removeItem(global.db.users, user)
         })
         global.db.chats.filter(v => now - v.lastseen > day).map(v => {
            let chat = global.db.chats.find(x => x.jid == v.jid)
            if (chat) Func.removeItem(global.db.chats, chat)
         })
         global.db.groups.filter(v => now - v.lastseen > day).map(v => {
            let group = global.db.groups.find(x => x.jid == v.jid)
            if (group) Func.removeItem(global.db.groups, group)
         })
      }, 60_000)

      if (body && /hai/i.test(body)) return m.reply(`Hai juga pler`)
   } catch (e) {
      console.log(e)
      return client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   error: false
}, __filename)