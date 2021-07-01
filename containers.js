const {exec} = require("child_process")
const controller =  process.env.COMMANDER

/**
 * sleep the execution for a number of milliseconds
 * @param {*} num 
 */
 async function sleep(num){
    setTimeout(()=>{}, num)
}

async function grouping(list){
    let newList = [[]]
    let counter = 0
    for(let i =0; i<list.length; i++){
        if(i>0 && i%3===1){
            newList.push([])
            counter ++
        }
        newList[counter].push(list[i])
    }
    return newList
}

async function listContainers(ctx){
    exec(`${controller} ps --format "{{.ID}} {{.Names}}"`,async (error, stdout, stderr)=>{
        let cnt =[]
        stdout = stdout.split('\n')
        stdout.forEach((val, idx)=>{
            let [id, name] = val.split(' ')
            if(name)cnt.push({text:name, callback_data:`container:${id}`})
        }) 
        let newCnt = await grouping(cnt)
        
        ctx.telegram.sendMessage(ctx.chat.id, `containers Activos:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: newCnt
            }
        })
    })
}

async function containerRestart(ctx, container){
    if(!ctx.state.role === "admin"){
        return ctx.reply("No authorizado")
    }
    exec(`docker restart ${container}`,(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `Reiniciando container:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}
async function containerLog(ctx, container){
    exec(`docker logs --tail 20 ${container}`,(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        let retor = stdout.split('\n').map((val)=>{
            return val
        })
        ctx.telegram.sendMessage(ctx.chat.id, `Logs container:`, {
            reply_markup:{
                inline_keyboard: btn
            }
        })
        
    })
}
async function containerStop(ctx, container){
    if(!ctx.state.role === "admin"){
        return ctx.reply("No authorizado")
    }
    exec(`docker stop ${container}`,(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `Reiniciando container:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}
/**
 * Stopped containes
 * @param {*} ctx 
 */
async function listStopedContainers(ctx){
    exec(`${controller} ps --filter "status=exited" --format "{{.ID}} {{.Names}}"`,async (error, stdout, stderr)=>{
        let cnt =[]
        stdout = stdout.split('\n')
        stdout.forEach((val, idx)=>{
            let [id, name] = val.split(' ')
            if(name)cnt.push({text:name, callback_data:`container:${id}`})
        }) 
        let newCnt = await grouping(cnt)
        ctx.telegram.sendMessage(ctx.chat.id, `inactive containers:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: newCnt
            }
        })
    })
}
async function containerStart(ctx, container){
    if(!ctx.state.role === "admin"){
        return ctx.reply("No authorizado")
    }console.log('admin')
    exec(`docker start ${container}`,(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `iniciando container:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}
async function containerRm(ctx, container){
    if(!ctx.state.role === "admin"){
        return ctx.reply("No authorizado")
    }
    exec(`docker rm ${container}`,(error, stdout, stderr)=>{
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `Eliminando container:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}
module.exports = {listContainers, containerRestart, containerLog, containerStop, listStopedContainers, containerStart, containerRm}