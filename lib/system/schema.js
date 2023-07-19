module.exports = (m) => {
   const isNumber = x => typeof x === 'number' && !isNaN(x)
   let user = global.db.users.find(v => v.jid == m.sender)
   if (user) {
      if (!isNumber(user.lastseen)) user.lastseen = 0
      if (!isNumber(user.spam)) user.spam = 0
   } else {
      global.db.users.push({
         jid: m.sender,
         lastseen: 0,
         spam: 0
      })
   }

   if (m.isGroup) {
      let group = global.db.groups.find(v => v.jid == m.chat)
      if (group) {
         if (!isNumber(group.activity)) group.activity = new Date * 1
      } else {
         global.db.groups.push({
            jid: m.chat,
            activity: new Date * 1
         })
      }
   }

   let chat = global.db.chats.find(v => v.jid == m.chat)
   if (chat) {
      if (!isNumber(chat.chat)) chat.chat = 0
      if (!isNumber(chat.lastchat)) chat.lastchat = 0
      if (!isNumber(chat.lastreply)) chat.lastreply = 0
   } else {
      global.db.chats.push({
         jid: m.chat,
         chat: 0,
         lastchat: 0,
         lastreply: 0
      })
   }

   let setting = global.db.setting
   if (setting) {
      if (!('greeting' in setting)) setting.greeting = false
      if (!('debug' in setting)) setting.debug = false
      if (!('self' in setting)) setting.self = true
      if (!('error' in setting)) setting.error = []
      if (!('hidden' in setting)) setting.hidden = []
      if (!('pluginDisable' in setting)) setting.pluginDisable = []
      if (!('multiprefix' in setting)) setting.multiprefix = true
      if (!('prefix' in setting)) setting.prefix = ['.', '/', '!', '#']
      if (!('noprefix' in setting)) setting.noprefix = false
      if (!('whitelist' in setting)) setting.whitelist = []
      if (!('online' in setting)) setting.online = false
      if (!('onlyprefix' in setting)) setting.onlyprefix = '`'
      if (!('owners' in setting)) setting.owners = []
      if (!('receiver' in setting)) setting.receiver = []
      if (!('viewstory' in setting)) setting.viewstory = false
      if (!('style' in setting)) setting.style = 1
      if (!('cover' in setting)) setting.cover = 'https://telegra.ph/file/def5f60f0ba4a7ba5820e.jpg'
      if (!('msg' in setting)) setting.msg = '?'
      if (!('response' in setting)) setting.response = []
      if (!('ig_cookie' in setting)) setting.ig_cookie = ''
   } else {
      global.db.setting = {
         greeting: false,
         debug: false,
         self: true,
         error: [],
         hidden: [],
         pluginDisable: [],
         multiprefix: true,
         prefix: ['.', '#', '!', '/'],
         noprefix: false,
         whitelist: [],
         online: false,
         onlyprefix: '`',
         owners: [],
         receiver: [],
         viewstory: false,
         style: 1,
         cover: 'https://telegra.ph/file/def5f60f0ba4a7ba5820e.jpg',
         msg: '?',
         response: [],
         ig_cookie: ''
      }
   }
}