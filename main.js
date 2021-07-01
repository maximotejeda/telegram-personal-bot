const config = require("./config")
const {Telegraf} = require('telegraf');
const fs = require('fs');
const path = require('path');
const { fileder, filer, fileReader } = require("./fileHandler");
const {
    uptime, 
    who, 
    ipNumber, 
    updateHost, 
    authLog,
    env,
    sleep
} = require('./commandviewer');
const {
    listContainers,
    containerRestart,
    containerLog,
    containerStop,
    listStopedContainers,
    containerRm,
    containerStart
} = require('./containers');

const {token} = config.module
const {myChat} = config.module
const authorized = [myChat]
const bot = new Telegraf(token)

//auth
async function itsMe(list, ctx){
    if(!list.length)return false
    let subList = [...list[0].split(/,\s/)]   
    let role = '' 
    let roleAuth = subList.filter((val, idx)=>{
        if(ctx.from.id.toString() === val){
            if(idx===0) role = "admin"
            else role = "viewer"
            return  true
        }
    })
   
    return {authorized: Boolean(roleAuth.length), role:role}
}
bot.use(async (ctx, next)=>{
    let {authorized:cont, role} = await itsMe(authorized, ctx)
    ctx.state.role = role
    return (cont)?await next():ctx.reply("👮‍♂️no Autorizado👮‍♂️" )
})

bot.start((ctx)=> {
    ctx.replyWithMarkdownV2('Start Mesage',{
        reply_markup:{
            inline_keyboard:[[{text:"Bienvenido", callback_data:'bienvenida'}]]
        }
    }
    )
});

bot.help((ctx)=>{
    message = `
    Help Message:\n you have available right now the following comands.
    COMMANDS:
    - /start: Initialize the bot
    - /help:  Show this "Message" \n
    
    KEYWORDS:
      OS:
      - folder \/path\/: shows path and view files\n
      - uptime:\t Returns online time
      - who: \tReturns users online
      - ipNumber: Ip number of the host
      - authLog: Returns the las 30 lines of /var/log/auth.log
      - env: Returns the enviroment of the server

    CONTAINERS COMMAND:
      - container list: Returns a list of active containers
        Options Query:
        - restart: Restart Given container
        - log: Logs of given container
        - stop: Stop container

    - container list -a List of exited containers
        *Options Query:*
        - start: Start a stoped container
        - log: Logs stoped container
        - rm: Delete a given container
    `
    ctx.telegram.sendMessage(ctx.chat.id, message, {reply_markup:{inline_keyboard:[[{text:"Delete", callback_data:'delete'}]]}})
});
/**
 * Manejo del filsys
 */
bot.hears(/folder\s?/i, async (ctx)=>{
    try{
        let msg = ctx.message.text
        msg = msg.replace(/folder\s?/i, '')
        if(msg === ''){
            msg = path.resolve('./')
        }
        if(!msg.match(/^\.?\.?\//)){
            return ctx.reply("Path Erronea")
        }
        let btn = await filer(ctx, msg)
        //console.log(btn)
        return ctx.telegram.sendMessage(ctx.chat.id, `Folder:${msg}`,{
            reply_markup:{
                inline_keyboard: btn
            }
        })
    }
    catch(error){
        console.log(error)
        console.log("folder error")
    }
    
})

bot.action(/^filesys.*/, async (ctx)=>{
    /** [ 'update', 'tg', 'botInfo', 'state', 'match' ] */
    console.log(ctx.update.callback_query.message.text)
    try{
        ctx.deleteMessage()
        let data = ctx.update.callback_query.data
        let dir = ctx.update.callback_query.message.text.replace(/folder:\s?/i, '')
        let [other] = data.replace('filesys:', '').replace(/\@/g, '/').split(':');
        if(!dir.endsWith('/')) dir=dir+'/';
        
        if(!other) other = '';
        let joinedPath = path.join(dir, other);
        console.log("path post process",joinedPath);
        console.log('dir', dir);

    let isDir = await fileder(joinedPath)
    console.log(!isDir)
    if(!isDir){
        let btn = await filer(ctx, joinedPath)
        console.log('sending data',joinedPath)
        //console.log(btn)
        return ctx.telegram.sendMessage(ctx.chat.id, `Folder:${joinedPath}`, {
            reply_markup:{
                inline_keyboard: btn
            }    
        })
    }

    fileReader(ctx, joinedPath)
    console.log("is file")}
    catch(error){
        console.log(error)
        console.log("error en inlinequery")
    }
 
})

bot.action(/delete\s?/i, async(ctx)=>{
    ctx.deleteMessage()
    
    console.log("Deleting message")
})
bot.action(/^container:.*/i, async(ctx)=>{
    let [msg, ] = ctx.callbackQuery.message.text.split('\n')
    let [cbquery,cmd,contID] = ctx.callbackQuery.data.split(":")
    ctx.deleteMessage()
    if(msg.match(/containers Activos/i)){
        console.log("showing containers")
        
        let container = ctx.update.callback_query.data.replace(/container:/i, '')
        ctx.replyWithMarkdownV2('What u wish to do?', {
            reply_markup:{
                inline_keyboard:[[
                    {text:'restart', callback_data:`container:restart:${container}`},
                    {text:'log', callback_data:`container:log:${container}`},
                    {text:'stop', callback_data:`container:stop:${container}`}
    
                ],
                [{text: 'Delete Message', callback_data:'delete'}]
            ]
            }})
    }
    else if(msg.match(/inactive containers/i)){
        console.log("showing containers")
        
        let container = ctx.update.callback_query.data.replace(/container:/i, '')
        ctx.replyWithMarkdownV2('What u wish to do?', {
            reply_markup:{
                inline_keyboard:[[
                    {text:'start', callback_data:`container:start:${container}`},
                    {text:'log', callback_data:`container:log:${container}`},
                    {text:'rm', callback_data:`container:rm:${container}`}
                    
    
                ],
                [{text: 'Delete Message', callback_data:'delete'}]
            ]
            }})
    }
    else if(cmd.match(/restart.*/i)){
        containerRestart(ctx, contID)
    }else if(cmd.match(/log.*/i)){
        containerLog(ctx, contID)
    }else if(cmd.match(/stop.*/i)){
        containerStop(ctx, contID)
    }else if(cmd.match(/start.*/i)){
        containerStart(ctx, contID)
    }else if(cmd.match(/rm.*/i)){
        containerRm(ctx, contID)
    }
    
})


/**
 * Comandos De visualizacion
 */

bot.hears(/uptime/i, async(ctx)=>{
    await uptime(ctx)
})

bot.hears(/who/i, async(ctx)=>{
    await who(ctx)
})

bot.hears(/ip/i, async(ctx)=>{
    await ipNumber(ctx)
})

bot.hears(/update host/i, async (ctx)=>{
    await updateHost(ctx)
})
bot.hears(/authlog/i, async (ctx)=>{
    await authLog(ctx)
})
bot.hears(/env/i, async (ctx)=>{
    await env(ctx)
})
bot.hears(/^containers list$/i, async(ctx)=>{
    await listContainers(ctx)
})
bot.hears(/containers list -a/i, async(ctx)=>{
    await listStopedContainers(ctx)
})
bot.help(ctx=>ctx.reply(ctx.chat.id))
bot.launch()