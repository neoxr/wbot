const os = require('os')
const axios = require('axios')
neoxr.create(async (m, {
   client,
   command,
   setting,
   Func,
   Scraper,
   env
}) => {
   try {
      if (command == 'runtime' || command == 'run') return m.reply(`*Running for : [ ${Func.toTime(process.uptime() * 1000)} ]*`)
      if (command == 'server') {
         const json = await Func.fetchJson('http://ip-api.com/json')
         delete json.status
         delete json.query
         let caption = `乂  *S E R V E R*\n\n`
         caption += `┌  ◦  OS : ${os.type()} (${os.arch()} / ${os.release()})\n`
         caption += `│  ◦  Ram : ${Func.formatSize(process.memoryUsage().rss)} / ${Func.formatSize(os.totalmem())}\n`
         for (let key in json) caption += `│  ◦  ${Func.ucword(key)} : ${json[key]}\n`
         caption += `│  ◦  Uptime : ${Func.toTime(os.uptime * 1000)}\n`
         caption += `└  ◦  Processor : ${os.cpus()[0].model}\n\n`
         caption += env.footer
         client.sendMessageModify(m.chat, caption, m, {
            ads: false,
            largeThumb: true
         })
      }
   } catch (e) {
      client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   usage: ['runtime', 'server'],
   hidden: ['run'],
   category: 'miscs'
}, __filename)