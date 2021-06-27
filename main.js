const config = require("./config")
const {Telegraf} = require('telegraf');
const fs = require('fs');
const { exec } = require("child_process");

const {token} = config.module
// console.log(token)
const {myChat} = config.module
const authorized = [myChat]
const bot = new Telegraf(token)

async function itsMe(list, ctx){
    if(!list.length)return false
    let subList = [...list[0].split(/,\s/)]    
    return subList.includes(ctx.chat.id.toString())
}
bot.use(async (ctx, next)=>{
    let cont = await itsMe(authorized,ctx)
    return (cont)?await next():ctx.reply("👮‍♂️no Autorizado👮‍♂️" )
})

bot.start((ctx)=> {
    return ctx.reply("Bienvenido")
});

bot.command('folder', (ctx)=>{
    itsMe(authorized, ctx)
    const files = fs.readdirSync("./")
    return ctx.reply(files)
})
bot.command('info', ctx=>{
    return ctx.reply(`you are authenticaded as ${ctx.chat.id} y usuario ${ctx.me}`)
})

bot.on('text', (ctx)=>{
    ctx.reply(`Hello`)
})

bot.help(ctx=>ctx.reply(ctx.chat.id))
bot.launch()