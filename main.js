const config = require("./config")
const {Telegraf} = require('telegraf');
const fs = require('fs');

const {token} = config.module
// console.log(token)
const {myChat} = config.module
const authorized = [myChat]
const bot = new Telegraf(token)

async function itsMe(list, ctx){
    return list.some(val=>Number(val)===ctx.chat.id)
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

bot.help(ctx=>ctx.reply(ctx.chat.id))
bot.launch()