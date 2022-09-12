require('dotenv').config();
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const bitcore = require('bitcore-lib');
const http = require('http');
const https = require('axios');
const config = require('./config');
const ethers = require('ethers');
// const explorers = require('bitcore-explorers');
// const BlockIo = require('block_io');
const Wallet = require('ethereumjs-wallet');
const TronWeb = require('tronweb');
const { MongoClient, ServerApiVersion } = require('mongodb');
var bodyParser = require("body-parser");
const session = require('express-session');
const nodemailer = require('nodemailer');
var cookieParser = require('cookie-parser');
// const BscConnector = require('@binance-chain/bsc-connector');
// const BncClient = require('@binance-chain/javascript-sdk');
// const bsc = new BscConnector({supportedChainIds: [56, 97]});
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/9ecee2fce9c64601912d6e5aa8b5f630");
const bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/', { name: 'binance', chainId: 56 });
// const insight = new explorers.Insight();

// const bscclient = new BncClient.BncClient("https://api.binance.org/bc/");
// BncClient.initChain();
// const convert = require("crypto-convert");

// async function convertcryto(val){
// 	//Cache is not yet loaded on application start
// 	if(!convert.isReady){
// 		await convert.ready();
// 	}
// 	return convert.BNB.USD(val);
	// convert.ETH.JPY(val);
	// convert.LINK.LTC(val);
	// convert.USD.CRO(val);
	// //More readable syntax
	// new convert.from("BTC").to("USD").amount(val);
//}

// convertcryto(1).then(val => console.log(val), e => console.log(e));

// let usdtcontractabi = [{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
// let usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
// let usdtcontract = new ethers.Contract(usdtAddress,usdtcontractabi, provider);
// usdtcontract.balanceOf('0xdfcb33f730acde0cdac656d0c1f17ba2333552b5').then(bal => console.log(bal.toNumber()/1000000),e=>console.log(e));

// bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/', { name: 'binance', chainId: 56 });

// let usdtcontractabi = [{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
// let usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
// let usdtcontract = new ethers.Contract(usdtAddress,usdtcontractabi, bscProvider);
// usdtcontract.balanceOf('0xBe60d4c4250438344bEC816Ec2deC99925dEb4c7').then(bal => console.log(bal.toNumber()/1000000),e=>console.log(e));


// console.log(bscclient)
// server config
const PORT = config.app.PORT || 3001
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`));

// EMAIL TRANSPORT
var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "0ffba0486624c3",
      pass: "050b27c98039fc"
    }
});
// console.log(transporter.sendMail());
// SESSION SET
app.use(session({secret: config.app.session, resave: false, saveUninitialized: true}));
// COOKIES SET
app.use(cookieParser());
//Templating Engine
app.set('view engine', 'ejs');

// CRYPTO SETUP
// bitcoin
// const block_io = new BlockIo(config.btc.API_KEY);

// bcrypt password encryption
async function password_encrypt($pass){
   const salt = await bcrypt.genSalt(10);
   return await bcrypt.hash($pass, salt);
}

// ethereum
function createEtherAcct(){
    return Wallet.default.generate();
}

// tron
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const trxprivateKey = process.env.TRON_PRIVATEKEY;
const tronWeb = new TronWeb(fullNode,solidityNode,eventServer, trxprivateKey);


async function createTronAcct(){
   let account = await tronWeb.createAccount();
   return account;
}
// console.log(createTronAcct());


// MongoDB

// Connection URL
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4mk8y.mongodb.net/${config.db.name}?retryWrites=true&w=majority`;
const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// Database Name
// const dbName = config.db.name;
async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(config.db.name);
  //   const collection = db.collection('documents');

  // the following code examples can be pasted here...
  return db;
}
// setInterval(res => {
//     main()
//     .then((db)=>{
//         let capId = {id: 1};
//         db.collection(`${config.db.prefix}_MktCap`).findOne(capId).then(mc => {
//          if(mc.marketCap % 11 != 0) {
//            mc_new = mc.marketCap + 2000;
//            db.collection(`${config.db.prefix}_MktCap`).updateOne(capId, {$set:{marketCap:mc_new}})
//          }else{
//             mc_new = mc.marketCap - 7000;
//             db.collection(`${config.db.prefix}_MktCap`).updateOne(capId, {$set:{marketCap:mc_new}})
//          }
//     })
//     })
//     .catch(console.error);
// }, 3000)




// setInterval(function(){
//     main()
//     .then((db)=>{
//     let users = db.collection(`${config.db.prefix}_Users`).find().limit(10000);
//     users.toArray().then(user =>{
//         user.forEach(val => {
//             if(val.TradingCapital > 20){
//             num = (Math.random() + 1) / 100 * val.TradingCapital;
//             bal = Number((val.WalletBalance + num).toFixed(2));
//             console.log(val.WalletBalance)
//             db.collection(`${config.db.prefix}_Users`).updateOne(val, {$set:{WalletBalance:bal}})
//             // console.log(val.TradingCapital);
//             // console.log(num)
//             // console.log(val.WalletBalance)
//             // console.log(bal)
//             }
//         })
//     })
//   })
// }, 86400000);






app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));    
app.post('/register', multer().none(), (req, res) => {
    var name = req.body.username.trim() || null;
    var email = req.body.email.trim() || null;
    var pass = req.body.password.trim() || null;
    var con = req.body.confirm.trim() || null;
    var ref = req.body.refcode || null;
    if(pass != con){
        res.status(502).send("Password Mismatch");
    }
    if(ref){
    main()
        .then((db)=>{
            db.collection(`${config.db.prefix}_Referrals`).insertOne({'username': name, 'ref_id': ref , 'status':0},
            function(err, collection){
                if (err) throw err;
                console.log(collection.insertedId);        
            })
        }).catch(console.error);
    }
 main()
  .then((db)=>{
    db.collection(`${config.db.prefix}_Users`).findOne({$or :[{'email': email},{'username': name}]}).then(em => {
        if(em == null){
        if(name && email && pass && con){
            let etherAcct = createEtherAcct();
            createTronAcct().then(tronAcct => {
            // let file = fs.readFileSync('btcaddress/Crypto-Address.txt');
            // const rows = file.toString().trim().split(',');
            // // console.log(rows)
            // let btcAddress = rows[0];
            // let new_row = rows.filter(row => row != btcAddress);
            // fs.writeFileSync('btcaddress/Crypto-Address.txt', new_row.toString());
            let buf = bitcore.crypto.Random.getRandomBuffer(32); 
            let rand_num = bitcore.crypto.BN.fromBuffer(buf);
            btcAddress = new bitcore.PrivateKey(rand_num).toAddress().toString();
            btcPrivateWIF = new bitcore.PrivateKey(rand_num).toWIF(); 
            etherAddress = etherAcct.getAddressString();
            ethPrivateKey = etherAcct.getPrivateKeyString();
            btcAddress = btcAddress;
            tronAddress = tronAcct.address.base58; 
            tronPrivateKey = tronAcct.privateKey;
            TradingCapital = 0;
            WalletBalance = 0;
            refBalance = 0;
            ref_code = btoa(name);
            verification_code = 1;
            // verification_code = 0;
            let data = {
                "username": name,
                "email": email,
                "password": Buffer.from(pass, 'utf8').toString('hex') ,
                'etherAddress' : etherAddress,
                'ethPrivateKey' : ethPrivateKey,
                'btcAddress' : btcAddress,
                'btcPrivateWIF' : btcPrivateWIF,  
                'tronAddress' : tronAddress, 
                'tronPrivateKey' : tronPrivateKey,
                'TradingCapital' :  TradingCapital,
                'WalletBalance' :  WalletBalance,
                'refCode' : ref_code,
                'refBalance' : refBalance,
                'verification_code': verification_code,
                'createDate' : Date.now(),
                'deposit_date': Date.now(),
                'valid' : 0
            }
            db.collection(`${config.db.prefix}_Users`).insertOne(data,function(err, collection){
                if (err) throw err;
                console.log(collection.insertedId);
                message = {
                    from: "weeb@weebio.online",
                    to: email ,
                    subject: "Registration Successful",
                    html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="x-apple-disable-message-reformatting">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge"><title></title><style type="text/css">@media only screen and (min-width: 620px) {.u-row {width: 600px !important;}.u-row .u-col {vertical-align: top;}.u-row .u-col-100 {width: 600px !important;}}@media (max-width: 620px) {.u-row-container {max-width: 100% !important;
                    padding-left: 0px !important;padding-right: 0px !important;}.u-row .u-col {min-width: 320px !important;max-width: 100% !important;display: block !important;}.u-row {width: calc(100% - 40px) !important;}.u-col {width: 100% !important;}.u-col > div {margin: 0 auto;}}body {margin: 0;padding: 0;}table,tr,td {vertical-align: top;border-collapse: collapse;
                    }p { margin: 0;}.ie-container table,.mso-container table {table-layout: fixed;}* {line-height: inherit;}a[x-apple-data-detectors='true'] {color: inherit !important;text-decoration: none !important;} 
                    table, td { color: #000000; } @media (max-width: 480px) { #u_content_image_3 .v-container-padding-padding { padding: 46px 10px 10px !important; } #u_content_image_3 .v-src-width { width: auto !important; } #u_content_image_3 .v-src-max-width { max-width: 29% !important; } #u_content_heading_3 .v-container-padding-padding { padding: 10px 20px !important; } #u_content_heading_3 .v-font-size { font-size: 28px !important; } #u_content_text_3 .v-container-padding-padding { padding: 10px 22px 26px !important; } }</style>
                    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"></head><body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">  
                    <table id="u_content_heading_3" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr>
                    <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 55px;font-family:'Montserrat',sans-serif;" align="left">
                    <h1 class="v-font-size" style="margin: 0px; line-height: 160%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: 'Montserrat',sans-serif; font-size: 33px;">Registration Successful!
                    </h1></td></tr></tbody></table><table id="u_content_text_3" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody><tr><td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 60px 50px;font-family:'Montserrat',sans-serif;" align="left">
                    <div style="color: #444444; line-height: 170%; text-align: center; word-wrap: break-word;"><p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                    <p style="font-size: 14px; line-height: 170%;">Welcome to Weebio.com. The Number 1. cryptocurrency trading Unit, We have the best trading bots and strategies to guarantee fast profits on investment and much more. </p>
                    <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                    <p style="font-size: 14px; line-height: 170%;">Click The link below to validate your account <a target="_blank" style="color:blue;text-decoration:underline" href="https://weebio.online/validate?msg=${ref_code}">Validate</a>.</p>
                    <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                    <p style="font-size: 14px; line-height: 170%;">Lastly, if you need any help whatsoever, just reply to this e-mail.</p>
                    <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                    <p style="font-size: 14px; line-height: 170%;">Best Regards, Weebio Team.</p></div></td></tr></tbody></table></body></html>`};
                transporter.sendMail(message, function(err, info) {
                    if (err) throw err;
                    req.session.email = {email:email};
                    res.cookie('email', Buffer.from(email, 'utf8').toString('hex'), {expire: 4000000 + Date.now()});
                    res.send('Success'); 
                });
            });
        });
           
        }else{
            res.status(502).send("Incomplete Details");
        }
    }else{
        res.status(502).send("User with Email/Username already exists");;
    }
 })   
 })
 .catch(console.error);
})


app.post('/resend', (req, res) => {
    let {email} = req.session.email || JSON.parse(Buffer.from(req.cookies.email, 'hex').toString('utf8')).email;
    main()
      .then((db)=>{
        if(email){
            let data = {"email": email}
            db.collection(`${config.db.prefix}_Users`).findOne(data).then(loginfo => {
                if(loginfo){
                console.log(loginfo)
               let message = { 
                from: "weeb@weebio.online",
                to: email ,
                subject: "Registration Successful",
                html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="x-apple-disable-message-reformatting">
                <meta http-equiv="X-UA-Compatible" content="IE=edge"><title></title><style type="text/css">@media only screen and (min-width: 620px) {.u-row {width: 600px !important;}.u-row .u-col {vertical-align: top;}.u-row .u-col-100 {width: 600px !important;}}@media (max-width: 620px) {.u-row-container {max-width: 100% !important;
                padding-left: 0px !important;padding-right: 0px !important;}.u-row .u-col {min-width: 320px !important;max-width: 100% !important;display: block !important;}.u-row {width: calc(100% - 40px) !important;}.u-col {width: 100% !important;}.u-col > div {margin: 0 auto;}}body {margin: 0;padding: 0;}table,tr,td {vertical-align: top;border-collapse: collapse;
                }p { margin: 0;}.ie-container table,.mso-container table {table-layout: fixed;}* {line-height: inherit;}a[x-apple-data-detectors='true'] {color: inherit !important;text-decoration: none !important;} 
                table, td { color: #000000; } @media (max-width: 480px) { #u_content_image_3 .v-container-padding-padding { padding: 46px 10px 10px !important; } #u_content_image_3 .v-src-width { width: auto !important; } #u_content_image_3 .v-src-max-width { max-width: 29% !important; } #u_content_heading_3 .v-container-padding-padding { padding: 10px 20px !important; } #u_content_heading_3 .v-font-size { font-size: 28px !important; } #u_content_text_3 .v-container-padding-padding { padding: 10px 22px 26px !important; } }</style>
                <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"></head><body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">  
                <table id="u_content_heading_3" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 55px;font-family:'Montserrat',sans-serif;" align="left">
                <h1 class="v-font-size" style="margin: 0px; line-height: 160%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: 'Montserrat',sans-serif; font-size: 33px;">Registration Successful!
                </h1></td></tr></tbody></table><table id="u_content_text_3" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody><tr><td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 60px 50px;font-family:'Montserrat',sans-serif;" align="left">
                <div style="color: #444444; line-height: 170%; text-align: center; word-wrap: break-word;"><p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                <p style="font-size: 14px; line-height: 170%;">Welcome to Weebio.com. The Number 1. cryptocurrency trading Unit, We have the best trading bots and strategies to guarantee fast profits on investment and much more. </p>
                <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                <p style="font-size: 14px; line-height: 170%;">Click The link below to validate your account <a target="_blank" style="color:blue;text-decoration:underline" href="https://weebio.online/validate?msg=${loginfo.refCode}">Validate</a>.</p>
                <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                <p style="font-size: 14px; line-height: 170%;">Lastly, if you need any help whatsoever, just reply to this e-mail.</p>
                <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                <p style="font-size: 14px; line-height: 170%;">Best Regards, Weebio Team.</p></div></td></tr></tbody></table></body></html>`};
                transporter.sendMail(message, function(err, info) {
                if (err) throw err;
                res.send('Email Sent'); 
                 });
            }
        })
        }else{
                res.status(502).send("User with Email does not exist");;
        }
    })
 .catch(console.error);
})

app.post('/login', multer().none(), (req, res) => {
    var email = req.body.email.trim() || null;
    var pass = req.body.password.trim() || null;
    // if(pass != con){
    // return res.redirect('/register');
    // }
 main()
  .then((db)=>{
        if(email && pass){
            let data = {
                "email": email,
                "password": Buffer.from(pass, 'utf8').toString('hex') ,
            }
            db.collection(`${config.db.prefix}_Users`).findOne(data).then(loginfo => {
                if(loginfo){
                if(loginfo.valid == 1){
                    req.session.user = {id:loginfo._id, email:loginfo.email, username:loginfo.username};
                    res.cookie('user', Buffer.from(JSON.stringify(req.session.user), 'utf8').toString('hex'), {expire: 40000000000 + Date.now()});
                    res.send('Success');
                 }else{
                    res.status(502).send("Please visit your email to validate your account");
                 }
                }else{
                    res.status(502).send("Email/Password Incorrect");
                }
            });
    }else{
        res.status(502).send("Incomplete details");
    }
  })
 .catch(console.error);
})


app.post('/private', multer().none(), (req, res) => {
    var email = req.body.email.trim() || null;
 main()
  .then((db)=>{
        if(email == req.session.user.email || email == JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8')).email){
            let data = {"email": email}
            db.collection(`${config.db.prefix}_Users`).findOne(data).then(loginfo => {
                if(loginfo){
                    message = {
                        from: "weeb@weebio.online",
                        to: email ,
                        subject: "Private Keys",
                        html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                        <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="x-apple-disable-message-reformatting">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge"><title></title><style type="text/css">@media only screen and (min-width: 620px) {.u-row {width: 600px !important;}.u-row .u-col {vertical-align: top;}.u-row .u-col-100 {width: 600px !important;}}@media (max-width: 620px) {.u-row-container {max-width: 100% !important;
                        padding-left: 0px !important;padding-right: 0px !important;}.u-row .u-col {min-width: 320px !important;max-width: 100% !important;display: block !important;}.u-row {width: calc(100% - 40px) !important;}.u-col {width: 100% !important;}.u-col > div {margin: 0 auto;}}body {margin: 0;padding: 0;}table,tr,td {vertical-align: top;border-collapse: collapse;
                        }p { margin: 0;}.ie-container table,.mso-container table {table-layout: fixed;}* {line-height: inherit;}a[x-apple-data-detectors='true'] {color: inherit !important;text-decoration: none !important;} 
                        table, td { color: #000000; } @media (max-width: 480px) { #u_content_image_3 .v-container-padding-padding { padding: 46px 10px 10px !important; } #u_content_image_3 .v-src-width { width: auto !important; } #u_content_image_3 .v-src-max-width { max-width: 29% !important; } #u_content_heading_3 .v-container-padding-padding { padding: 10px 20px !important; } #u_content_heading_3 .v-font-size { font-size: 28px !important; } #u_content_text_3 .v-container-padding-padding { padding: 10px 22px 26px !important; } }</style>
                        <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"></head><body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">  
                        <table id="u_content_heading_3" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr>
                        <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 55px;font-family:'Montserrat',sans-serif;" align="left">
                        <h1 class="v-font-size" style="margin: 0px; line-height: 160%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: 'Montserrat',sans-serif; font-size: 33px;">
                        </h1></td></tr></tbody></table><table id="u_content_text_3" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 60px 50px;font-family:'Montserrat',sans-serif;" align="left">
                        <div style="color: #444444; line-height: 170%; text-align: center; word-wrap: break-word;"><p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">Your Wallet Private Keys </p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">BITCOIN Wallet Private Key: ${loginfo.tronPrivateKey}</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">BSC Wallet Private Key: ${loginfo.ethPrivateKey}</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">ETHEREUM Wallet Private Key: ${loginfo.tronPrivateKey}</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">TRON Wallet Private Key: ${loginfo.ethPrivateKey}</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">If you need any Assistance whatsoever, just reply to this e-mail.</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">Best Regards, Weebio Team.</p></div></td></tr></tbody></table></body></html>`};
                        transporter.sendMail(message, function(err, info) {
                        if (err) throw err;
                        res.send('Success'); 
                    });
                }else{
                    res.status(502).send("Email Incorrect");
                }
            });
    }else{
        res.status(502).send("Invalid User");
    }
  })
 .catch(console.error);
})


app.post('/getcode', multer().none(), (req, res) => {
    var email = req.body.email.trim() || null;
 main()
  .then((db)=>{
        if(email == req.session.user.email || email == JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8')).email){
            let data = {"email": email}
            db.collection(`${config.db.prefix}_Users`).findOne(data).then(info => {
                if(info){
                    v_code = Math.round(Math.random() * 100000) + Math.round(Math.random() * 10000) + Math.round(Math.random() * 1000) + Math.round(Math.random() * 100) + Math.round(Math.random() * 10);
                    db.collection(`${config.db.prefix}_Users`).updateOne(info, {$set:{verification_code:v_code}})
                    message = {
                        from: "weeb@weebio.online",
                        to: email ,
                        subject: "Weebio Verification Code",
                        html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                        <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="x-apple-disable-message-reformatting">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge"><title></title><style type="text/css">@media only screen and (min-width: 620px) {.u-row {width: 600px !important;}.u-row .u-col {vertical-align: top;}.u-row .u-col-100 {width: 600px !important;}}@media (max-width: 620px) {.u-row-container {max-width: 100% !important;
                        padding-left: 0px !important;padding-right: 0px !important;}.u-row .u-col {min-width: 320px !important;max-width: 100% !important;display: block !important;}.u-row {width: calc(100% - 40px) !important;}.u-col {width: 100% !important;}.u-col > div {margin: 0 auto;}}body {margin: 0;padding: 0;}table,tr,td {vertical-align: top;border-collapse: collapse;
                        }p { margin: 0;}.ie-container table,.mso-container table {table-layout: fixed;}* {line-height: inherit;}a[x-apple-data-detectors='true'] {color: inherit !important;text-decoration: none !important;} 
                        table, td { color: #000000; } @media (max-width: 480px) { #u_content_image_3 .v-container-padding-padding { padding: 46px 10px 10px !important; } #u_content_image_3 .v-src-width { width: auto !important; } #u_content_image_3 .v-src-max-width { max-width: 29% !important; } #u_content_heading_3 .v-container-padding-padding { padding: 10px 20px !important; } #u_content_heading_3 .v-font-size { font-size: 28px !important; } #u_content_text_3 .v-container-padding-padding { padding: 10px 22px 26px !important; } }</style>
                        <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"></head><body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">  
                        <table id="u_content_heading_3" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr>
                        <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 55px;font-family:'Montserrat',sans-serif;" align="left">
                        <h1 class="v-font-size" style="margin: 0px; line-height: 160%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: 'Montserrat',sans-serif; font-size: 33px;">
                        </h1></td></tr></tbody></table><table id="u_content_text_3" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 60px 50px;font-family:'Montserrat',sans-serif;" align="left">
                        <div style="color: #444444; line-height: 170%; text-align: center; word-wrap: break-word;"><p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">Verification Code</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">Your verification code is: ${v_code}</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">This code will expire after 10mins</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">If you need any Assistance whatsoever, just reply to this e-mail.</p>
                        <p style="font-size: 14px; line-height: 170%;">&nbsp;</p>
                        <p style="font-size: 14px; line-height: 170%;">Best Regards, Weebio Team.</p></div></td></tr></tbody></table></body></html>`};
                        transporter.sendMail(message, function(err, info) {
                        if (err) throw err;
                        res.send('Success'); 
                    });
                }else{
                    res.status(502).send("Email Incorrect");
                }
            });
    }else{
        res.status(502).send("Invalid User");
    }
  })
 .catch(console.error);
})



app.post('/transfer', multer().none(), (req, res) => {
    var amount = Number(req.body.amount.trim()) || null;
    var v_code = Number(req.body.v_code.trim()) || null;
    // if(pass != con){
    // return res.redirect('/register');
    // }
 main()
  .then((db)=>{
        if(amount && v_code){
            db.collection(`${config.db.prefix}_Users`).findOne({'verification_code': v_code}).then(info => {
                if(info){
                if(info.email == req.session.user.email || email == JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8')).email){
                    if(info.WalletBalance >= amount){
                    bal = info.TradingCapital + Number(amount);
                    wbal = info.WalletBalance - Number(amount);
                    db.collection(`${config.db.prefix}_Users`).updateOne(info, {$set:{TradingCapital:bal, WalletBalance:wbal, verification_code:0, deposit_date: Date.now()}})
                    .then(()=>{
                     let state = "success";
                     let data = {'username': info.username, 'transType': 'Internal', 'amount' : amount, 'v_code': v_code, 'status': state, 'date': Date.now() };
                     db.collection(`${config.db.prefix}_ITransfer`).insertOne(data, ()=>{
                        db.collection(`${config.db.prefix}_Transactions`).insertOne(data, function(err, collection){
                            if (err) throw err; 
                            console.log(collection.insertedId);        
                       });
                     });
                    }) 
                    res.send('Success');
                }else{
                    res.status(502).send("Insufficient funds for transfer"); 
                }
                }else{
                    res.status(502).send("Invalid User");
                }
            }else{
                res.status(502).send("Invalid verification code");
            }
            });
    }else{
        res.status(502).send("Invalid entry for amount or verification code. cannot transfer 0");
    }
  })
 .catch(console.error);
})
//   .finally(() => client.close());


app.post('/setdetail', multer().none(), (req, res) => {
    var username = req.body.username.trim() || null;
    var new_email = req.body.email.trim() || null;
    // if(pass != con){
    // return res.redirect('/register');
    // }
 main()
  .then((db)=>{
        if(username || new_email){
        db.collection(`${config.db.prefix}_Users`).findOne({$or :[{'email': new_email},{'username': username}]}).then(em => {
            if(em == null){        
            let email = JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8')).email || req.session.user.email;
            db.collection(`${config.db.prefix}_Users`).findOne({'email': email}).then(info => {
                if(info){
                    if(username){
                    db.collection(`${config.db.prefix}_Users`).updateOne(info, {$set:{username:username,refCode: btoa(username)}})
                    .then(()=>{
                        if(req.session.user){
                          req.session.user.username = username;
                        }
                          res.cookie('user', Buffer.from(JSON.stringify(req.session.user), 'utf8').toString('hex'), {expire: 40000000000 + Date.now()});
                          res.status(200).send("Details updated successfully")
                    }) 
                   }
                   if(new_email){
                    db.collection(`${config.db.prefix}_Users`).updateOne(info, {$set:{email:new_email}})
                    .then(()=>{
                        if(req.session.user){
                          req.session.user.email = new_email;
                        }
                          res.cookie('user', Buffer.from(JSON.stringify(req.session.user), 'utf8').toString('hex'), {expire: 40000000000 + Date.now()});
                          res.status(200).send("Details updated successfully")
                    }) 
                   }

                }else{
                    res.status(502).send("Invalid User");
                }
            
            });
        }else{
            res.status(502).send("Email or Username Already Exists");
        }
       })
        }else{
            res.status(502).send("Invalid Update");
        }
  })
 .catch(console.error);
})


app.post('/setpassword', multer().none(), (req, res) => {
    var password = req.body.password.trim() || null;
    var new_password = req.body.new_password.trim() || null;
    var con_password = req.body.con_password.trim() || null;
    if(new_password != con_password){
        res.status(502).send("Password Mismatch");
    }
    // if(pass != con){
    // return res.redirect('/register');
    // }
 main()
  .then((db)=>{
        if(password && new_password && con_password){
            let email = JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8')).email || req.session.user.email;
            db.collection(`${config.db.prefix}_Users`).findOne({'email': email}).then(info => {
                if(info){
                    if(info.password == Buffer.from(password, 'utf8').toString('hex')){
                    db.collection(`${config.db.prefix}_Users`).updateOne(info, {$set:{password:Buffer.from(new_password, 'utf8').toString('hex')}})
                    .then(()=>{
                        res.status(200).send("Password updated successfully")
                    }) 
                    }else{
                        res.status(502).send("Wrong Password");
                    }
                }else{
                    res.status(502).send("Invalid User");
                }
            
            });
    }else{
        res.status(502).send("Invalid Update");
    }
  })
 .catch(console.error);
})


app.post('/withdrawal', multer().none(), (req, res) => {
    var address = req.body.address.trim() || null;
    var amount = Number(req.body.amount.trim()) || null;
    var v_code = Number(req.body.v_code.trim() )|| null;
    var type = req.body.type.trim() || null;
    // if(pass != con){
    // return res.redirect('/register');
    // }
 main()
  .then((db)=>{
        if(amount && v_code && address && type){
            db.collection(`${config.db.prefix}_Users`).findOne({'verification_code': v_code}).then(info => {
                if(info){
                 if(info.email == req.session.user.email || email == JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8')).email){
                   if(type == 'capital'){
                    if(info.TradingCapital >= amount){
                      if(Date.now() >= (info.deposit_date + 7257600000)){
                    bal = info.TradingCapital - Number(amount);
                    db.collection(`${config.db.prefix}_Users`).updateOne(info, {$set:{TradingCapital:bal, verification_code:0}})
                    .then(()=>{
                     if(address.startsWith("0x")){
                     let private = process.env.ETH_PRIVATEKEY;
                     let signer = new ethers.Wallet(private, provider);
                     let usdtcontractabi = [{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}, {"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
                     let usdtAddress = process.env.ETH_USDT_ADDRESS;
                     let usdtcontract = new ethers.Contract(usdtAddress,usdtcontractabi, signer);
                     usdtcontract.balanceOf(address).then(async function (res){
                    if(res > amount){
                        let gasPrice = await usdtcontract.estimateGas.transfer(process.env.ETHEREUM_ADDRESS, res);
                        let tx = await usdtcontract.transfer(address, amount-(gasPrice+100000));
                        if(tx.hash){
                            let state = "Success";
                            let data = {'username': info.username, 'transType': 'Withdrawal', 'amount' : amount, 'address' : address, 'v_code': v_code, 'status': state, 'date': Date.now(), 'hash' : tx.hash, 'price':gasPrice };
                            db.collection(`${config.db.prefix}_Withdrawal`).insertOne(data, ()=>{
                               db.collection(`${config.db.prefix}_Transactions`).insertOne(data, function(err, collection){
                                   if (err) throw err;
                                   console.log(collection.insertedId);  
                                   res.send('Success');      
                              });
                            });
                           }     
                        }
                       })
                     }else{
                     tronWeb.contract().at(process.env.TRX_USDT_ADDRESS)
                     .then(async (instance) =>{
                    let balance = await instance.balanceOf(TRON_ADDRESS).call()
                    if(balance.toNumber() > amount){
                        let tx = await instance.transfer(address, amount*1000000).send(); 
                        if(tx){
                            let state = "Success";
                            let data = {'username': info.username, 'transType': 'Withdrawal', 'amount' : amount, 'address' : address, 'v_code': v_code, 'status': state, 'date': Date.now(), 'hash' : tx.hash, 'price':gasPrice };
                            db.collection(`${config.db.prefix}_Withdrawal`).insertOne(data, ()=>{
                               db.collection(`${config.db.prefix}_Transactions`).insertOne(data, function(err, collection){
                                   if (err) throw err;
                                   console.log(collection.insertedId);  
                                   res.send('Success');      
                              });
                            });
                       }
                    }
                    })
                  }
                })       
                }else{
                    res.status(502).send("Cannot withdraw trading capital till after 90 days");
                }
            }else{
                res.status(502).send("Insufficient funds for withdrawal");
            }
                }else{
                    if(info.WalletBalance >= amount){
                    if(amount > 10){    
                    bal = info.WalletBalance - Number(amount);
                    db.collection(`${config.db.prefix}_Users`).updateOne(info, {$set:{WalletBalance:bal, verification_code: 0}})
                    .then(()=>{
                        if(address.startsWith("0x")){
                            let private = process.env.ETH_PRIVATEKEY;
                            let signer = new ethers.Wallet(private, provider);
                            let usdtcontractabi = [{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}, {"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
                            let usdtAddress = process.env.ETH_USDT_ADDRESS;
                            let usdtcontract = new ethers.Contract(usdtAddress,usdtcontractabi, signer);
                            usdtcontract.balanceOf(address).then(async function (res){
                               let gasPrice = await usdtcontract.estimateGas.transfer(process.env.ETHEREUM_ADDRESS, res);
                               let tx = await usdtcontract.transfer(address, amount-(gasPrice+100000));
                               if(tx.hash){
                                   let state = "Success";
                                   let data = {'username': info.username, 'transType': 'Withdrawal', 'amount' : amount, 'address' : address, 'v_code': v_code, 'status': state, 'date': Date.now(), 'hash' : tx.hash, 'price':gasPrice };
                                   db.collection(`${config.db.prefix}_Withdrawal`).insertOne(data, ()=>{
                                      db.collection(`${config.db.prefix}_Transactions`).insertOne(data, function(err, collection){
                                          if (err) throw err;
                                          console.log(collection.insertedId);  
                                          res.send('Success');      
                                     });
                                   });
                                  }     
                              })
                            }else{
                            tronWeb.contract().at(process.env.TRX_USDT_ADDRESS)
                            .then(async (instance) =>{
                                let balance = await instance.balanceOf(process.env.TRON_ADDRESS).call()
                               let tx = await instance.transfer(address, amount*1000000).send(); 
                               if(tx){
                                   let state = "Success";
                                   let data = {'username': info.username, 'transType': 'Withdrawal', 'amount' : amount, 'address' : address, 'v_code': v_code, 'status': state, 'date': Date.now(), 'hash' : tx.hash};
                                   db.collection(`${config.db.prefix}_Withdrawal`).insertOne(data, ()=>{
                                      db.collection(`${config.db.prefix}_Transactions`).insertOne(data, function(err, collection){
                                          if (err) throw err;
                                          console.log(collection.insertedId);  
                                          res.send('Success');      
                                     });
                                   });
                              }
                           })
                         }
                        })
                    }else{
                        res.status(502).send("Can only withdraw above 10 dollars");
                    }
                }else{
                    res.status(502).send("Insuffient amount for withdraw");
                }
                }
                }else{
                    res.status(502).send("Withrawal Failed");
                }
        }else{
            res.status(502).send("Invalid verification code");
        }
            });
    }else{
        res.status(502).send("Withrawal Failed");
    }
  })
 .catch(console.error);
})


// server
app.use('/', express.static('assets'));
app.get('/dashboard', (req, res) => {
    if(req.session.user || req.cookies.user){
        main().then((db)=>{
        let {username, email} = req.session.user || JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8'));
        db.collection(`${config.db.prefix}_Users`).findOne({'username': username, 'email': email}).then(info => {
            return info;   
         }).then((info)=>{
            db.collection(`${config.db.prefix}_MktCap`).findOne({id:1}).then((Cap)=>{
            res.render("dashboard", {user : info, mrktCap : Cap});
            })
         })
         .catch(console.error);
        })
    }else{
     res.redirect('/login')
    }
});
app.get('/validate', (req, res) => {
    if(req.session.email && req.query.msg || req.cookies.email && req.query.msg){
        main().then((db)=>{
        let {email} = req.session.email || JSON.parse(Buffer.from(req.cookies.email, 'hex').toString('utf8')).email;
         db.collection(`${config.db.prefix}_Users`).findOne({'refCode': req.query.msg,'email': email}).then(info => {
            return info;   
         }).then((info)=>{
            db.collection(`${config.db.prefix}_Users`).updateOne(info, {$set:{valid:1}})
            req.session.destroy();
            res.clearCookie('email');
            res.redirect("login?msg=emailvalidated");
         })
         .catch(console.error);
        })
    }else{
     res.redirect('/login?msg=validate')
    }
});
app.get('/settings', (req, res) => {
    if(req.session.user || req.cookies.user){
        main().then((db)=>{
            let {username, email} = req.session.user || JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8'));
                db.collection(`${config.db.prefix}_Users`).findOne({'username': username, 'email': email}).then(info => {
                  res.render("settings", {user: info, variable: req.query});
                })
                .catch(console.error);
        })
        }else{
         res.redirect('/login')
    }
});
app.get('/deposit', (req, res) => {
    if(req.session.user || req.cookies.user){
    main().then((db)=>{
        let {username, email} = req.session.user || JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8'));
            db.collection(`${config.db.prefix}_Users`).findOne({'username': username, 'email': email}).then(info => {
              res.render("deposit", {user: info});
            })
            .catch(console.error);
    })
    }else{
     res.redirect('/login')
    }
});
app.get('/history', (req, res) => {
    if(req.session.user || req.cookies.user){
            main().then((db)=>{
                let {username, email} = req.session.user || JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8'));
                    db.collection(`${config.db.prefix}_Users`).findOne({'username': username, 'email': email}).then(info => {
                       let trans = db.collection(`${config.db.prefix}_Transactions`).find({'username':info.username});
                       trans.toArray().then(arr=>{
                        res.render("history", {trans: arr});
                       })
                    })
                    .catch(console.error);
            })
    }else{
     res.redirect('/login')
    }
});
app.get('/login', (req, res) => {
    if(req.session.user || req.cookies.user){
        res.redirect('/dashboard')
    }else{
        res.render("login", {msg: req.query})
    }
});
app.get('/recovery', (req, res) => res.render("recovery"));
app.get('/index', (req, res) => {
    if(req.session.user || req.cookies.user){
        main().then((db)=>{
            db.collection(`${config.db.prefix}_MktCap`).findOne({id:1}).then((Cap)=>{
            res.render("index", {mrktCap : Cap, cookie : true});
            })
         .catch(console.error);
    })
    }else{
    main().then((db)=>{
            db.collection(`${config.db.prefix}_MktCap`).findOne({id:1}).then((Cap)=>{
            res.render("index", {mrktCap : Cap, cookie: false});
            })
         .catch(console.error);
    })
   }
});
app.get('/', (req, res) => {
    if(req.session.user || req.cookies.user){
        main().then((db)=>{
            db.collection(`${config.db.prefix}_MktCap`).findOne({id:1}).then((Cap)=>{
            res.render("index", {mrktCap : Cap, cookie : true});
            })
         .catch(console.error);
    })
    }else{
    main().then((db)=>{
            db.collection(`${config.db.prefix}_MktCap`).findOne({id:1}).then((Cap)=>{
            res.render("index", {mrktCap : Cap, cookie: false});
            })
         .catch(console.error);
    })
   }
});
app.get('/privacy', (req, res) => res.render("privacy"));
app.get('/terms', (req, res) => res.render("terms"));

// app.get('/register', (req, res) => res.render("register"));
app.get('/register', (req, res) => {
    if(req.session.user || req.cookies.user){
        res.redirect('/dashboard')
    }else{
    res.render("register", {refferer: req.query})
    }
  }
);
app.get('/transfer',(req, res) => {
    if(req.session.user || req.cookies.user){
      main().then((db)=>{
        let {username, email} = req.session.user || JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8'));
            db.collection(`${config.db.prefix}_Users`).findOne({'username': username, 'email': email}).then(info => {
              res.render("transfer", {user: info, variable: req.query});
            }).catch(console.error);
      })
    }else{
      res.redirect('/login');
    }
});
app.get('/withdrawal',(req, res) => {
    if(req.session.user || req.cookies.user){
    main().then((db)=>{
        let {username, email} = req.session.user || JSON.parse(Buffer.from(req.cookies.user, 'hex').toString('utf8'));
        db.collection(`${config.db.prefix}_Users`).findOne({'username': username, 'email': email}).then(info => {
            res.render("withdrawal", {user: info, variable: req.query});
        }).catch(console.error);
    })
    }else{
     res.redirect('/login')
    }
});
app.get('/logout',(req, res) => {
    res.clearCookie('user');
    req.session.destroy();
    res.send("logged out");
});

// app.get('/login', (req, res) => res.sendFile(__dirname + "/public/login.html"));
// app.get('/recovery', (req, res) => res.sendFile(__dirname + "/public/recovery.html"));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/user', user)
// app.use('/settings', settings)
// app.use('/media', media)
// app.use('/category', category);
// app.use('/collection', collection)
// app.use('/item', item)

/*
* Below lines used to handle invalid api calls
*/
// app.use(function (req, res, next) {
//     res.status(404).send("Sorry can't find that!")
// })
// app.use(function (err, req, res, next) {
//     console.error(err.stack)
//     res.status(500).send('Something broke!')
// })



// App listen
// app.listen(config.app.port, () => console.log(`Weebio app listening on port ${config.app.port}!`))