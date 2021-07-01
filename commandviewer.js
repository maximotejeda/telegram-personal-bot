const {exec} = require("child_process")

/**
 * sleep the execution for a number of milliseconds
 * @param {*} num 
 */
async function sleep(num){
    setTimeout(()=>{}, num)
}
/**
 * return uptime
 * @param {*} ctx 
 */
async function uptime(ctx){
    exec('uptime',(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `Tiempo de Actividad:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}
/**
 * returns users in the server
 * @param {*} ctx 
 */
async function who(ctx){
    exec('w',(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `Usuarios Activos:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}
/**
 * Return server ip
 * @param {*} ctx 
 */
async function ipNumber(ctx){
    exec('curl ifconfig.me',(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `Host IP:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}
/**
 * actualiza host
 * @param {*} ctx 
 * @returns 
 */
async function updateHost(ctx){
    console.log('Updating Host')
    if(ctx.state.role != 'admin') return ctx.reply("must be the admin to exec this command")
    exec('sudo apt update',(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        if(stdout){
        ctx.telegram.sendMessage(ctx.chat.id, `updating: True`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })}
    })
}
/**
 * visualiza logs
 * @param {*} ctx 
 */
async function authLog(ctx){
    exec('sudo tail -n 30 /var/log/auth.log || grep "Failed"',(error, stdout, stderr)=>{
    btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `Failed Logs:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}
/**
 * Visualiza environment
 */
async function env(ctx){
    exec('env',(error, stdout, stderr)=>{
    btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        if (stdout.length > 1024){
            stdout = stdout.split('\n')
            let num = stdout.length /10
            for(let x = 0;x < num;x+10,num--){
                if(num>1){
                    start = x
                    stop = x + 10
                }
                else{
                    start = x
                    stop = stdout.length-1
                }
                ctx.telegram.sendMessage(ctx.chat.id, `Environment:\n${stdout.splice(start,stop).join('\n')}`, {
                    reply_markup:{
                    inline_keyboard: btn
                    }
                })
                sleep(1000)              
            }
            return
        }
        ctx.telegram.sendMessage(ctx.chat.id, `Environment:\n${stdout.length}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}


module.exports = {uptime, who, ipNumber, updateHost, authLog, env, sleep}