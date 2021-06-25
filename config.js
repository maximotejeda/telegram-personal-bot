require('dotenv').config()
exports.module = {
    token: process.env.APIKEY,
    myChat: process.env.MYCHAT
}