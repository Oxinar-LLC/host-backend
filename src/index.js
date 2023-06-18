const api_keys = require('./db/api_keys.json');
const auth_keys = require('./db/auth_keys.json');
const config = require('./ins_conf.json');

const fs = require('fs');
const {Client, Intents, MessageEmbed} = require('discord.js');
const axios = require('axios');
const aws_sdk = require('aws-sdk');
//const cloudflare = require('cloudflare')({ email: 'erhanakinci0000@gmail.com', key: config.CLOUDFLARE_KEY }); stop!!!!!!!!!
const express = require('express');
const expressFTP = require('express-fileupload');
const router = express();
const comms_cli = new Client({ intents: [Intents.FLAGS.GUILDS] });

router.use(expressFTP())

comms_cli.login(config.LOGGER_AUTHENTICATION);

const s3 = new aws_sdk.S3({
    accessKeyId: config.UPLOAD_ID,
    secretAccessKey: config.S3_SECRET
})

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;

    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
   return result;
}

function uploadFile(input_File, req, res) {
    //const fileContent = fs.readFileSync(input_FileName)
    const log_channel = comms_cli.channels.cache.get(config.LOG_CHANNEL)
    const glacier = comms_cli.channels.cache.get(config.GLACIER_LOG)

    const cdn = {
        Bucket: config.CDN_URL,
        Key: `${makeid(8)}.png`,
        Body: input_File,
        ACL: 'public-read',
        ContentType: 'image/png'
    }

    const deeparchive = {
        Bucket: config.DEEPARCHIVE_URL,
        Key: cdn.Key,
        Body: input_File,
        ACL: 'public-read',
        ContentType: 'image/png'
    }

    s3.upload(cdn, function(err, data) {
         if (err) {
            throw err;
        }

        console.log(`Uploaded ${cdn.Key}!`)
        if (log_channel && glacier) {
            log_channel.send(`Image uploaded: Authentication Key: \`${req.body.api_key}\` | Image: \`https://cdn.oxinar.xyz/${cdn.Key}\``)
        }
        return res.send({"status": 200,"data": {"link": `https://cdn.oxinar.xyz/${cdn.Key}`}})
    })
    s3.upload(deeparchive, function(err, data) {
        if (err) {
           throw err;
       }

       const glacier = comms_cli.channels.cache.get(config.GLACIER_LOG)
       console.log(`Uploaded ${cdn.Key}!`)
       if (log_channel && glacier) {
           glacier.send(`https://cdna.oxinar.xyz/${cdn.Key}`)
       }
   })
}

router.post('/v1/upload', function(req, res) {
    if (api_keys.find(key => key == req.body.api_key)) {
        uploadFile(req.files.upload_file.data, req, res)
    } else {
        return res.send({"status": 200,"data": {"error": "Invalid API key!"}})
    }
})

router.post('/v1/adminUtils/wipedrive', function(req, res) {
    /*if (auth_keys.find(key => key === req.body.auth_key)) {
        const deleteObjects = s3.listObjectsV2()
        for (let i = 0; i < deleteObjects.length; i++) {
            if (deleteObjects[i].Key !== "index.html") {
                console.log(`Deleted ${deleteObjects[i].Key}`)
                s3.deleteObject(deleteObjects[i].Key)
                //console.log(`Deleted ${deleteObjects[i].Key}`)
            }
        }
    } else {
        // ip ban the faggot

        axios.default.post()
    }*/

    res.send({"status": 200,"data": {"error": "Faggot"}})
})

router.post('v1/generateKey', function(req, res){
    if (auth_keys.find(key => key === req.body.auth_key)) {
        
    }
})

router.get('/', function(req, res) {
    res.send('😭😭')
})

router.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`)
})

comms_cli.on('ready', () => {
    console.log(`Logged in to the Discord bot.`)
})