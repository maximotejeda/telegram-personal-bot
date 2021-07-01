const fs = require('fs')
const path = require('path')
const {exec} = require('child_process')

async function fileder(ruta){
    try{
        let file = await fs.promises.lstat(ruta)
        //console.log(file.isFile())
        return file.isFile()
    }
    catch(err){
        console.log(err)
    }
}


async function filer(ctx, data){
    console.log('filer Data', data)
    try{
        let btn = []
        datos = await fs.promises.readdir(data) 
        let count = 0;
        datos.forEach((value, idx, arr)=>{
            if(btn.length===0){
                btn.push([])
                if(!data.endsWith('/')) data + '/';
                let atras = path.resolve(data + '/..') 
                atras = atras.replace(/\//g, '@')
                btn[count].push({text: '⏪ ../', callback_data:`filesys:/..` })
                }
                if((idx +1)%3===0 && idx>0){
                    count++
                    btn.push([])
                }
                let file
                //console.log(data.length)
                fileder(`${data}/${value}`)
                btn[count].push({text:`${value.toString()}`, callback_data:`filesys:${value}`})
                if(idx === arr.length -1){
                    btn[count+1]= [{text:"Delete Msg", callback_data:'delete'}]
                }
        })
        // for(let list of btn){
        //     for(let item of list){
        //     let sub = {...item}
        //     sub.callback_data = sub.callback_data.replace('filesys:', '').replace('@', '/').replace(':','')
        //     let icon = await fileder(sub.callback_data)
        //     icon = (icon)?"📄":"🗂";
        //     item.text = icon + item.text
        //     console.log(icon)
        // }}
 
        // console.log(btn)
        return btn  
        
    }
    catch(error){
        console.log(error)
        return ctx.reply("Wrong Directory")
    }
}

async function fileReader(ctx, path){
    // ctx.deleteMessage()
    exec(`tail -n 30 ${path}`,  (error, stdout, stderr) => {
        //console.log(stdout)
        btn = [[
            {text:'Delete', callback_data:'delete'}
        ]]
        ctx.telegram.sendMessage(ctx.chat.id, `Contenido del Archivo:\n${stdout}`, {
            reply_markup:{
            inline_keyboard: btn
            }
        })
    })
}

module.exports = {filer, fileReader, fileder}