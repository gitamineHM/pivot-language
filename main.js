//////////    Author : Amine HM                //////////
/////////   Minimalist Pivot Translation API  //////////
////////             v0.0.1                   //////////

var express = require('express');
var request = require('request');
var bodyParser = require("body-parser");
var cors = require('cors')
var morgan = require('morgan') ;
var app = express()
var output,b,result;
var Param = {
  SYSTRAN_API : 'https://api-platform.systran.net/translation/text/translate?key=',
  SERVER_KEY : 'cd1669a0-ca1a-4a09-9c13-debc38ffc1e4',
  BROWSER_KEY : '0a6a5a10-2e89-41da-be81-f5f224c254ed',
  // PIVOT :  ['en'] //langues pivots,
  API_PORT : 3000
 }

//////////////////////// LOCAL REST SERVER /////////////////////////////

app.use(cors())
// app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));

/////////////////////////////Functions/////////////////////////////

function Translate(toTranslate) // source,target,text
{
 return new Promise(function (resolve, reject) {
  request.get({ url : Param.SYSTRAN_API + Param.SERVER_KEY , form : { source : toTranslate.source , target : toTranslate.target, input : toTranslate.input }} ,
     function (error, response, body) {
       // console.log({ status : response.statusCode, body : body })
    if(error || response.statusCode != 200)
      reject({ status : response.statusCode, body : body})
    if (!error && response.statusCode == 200) {
    // Show the HTML for the Google homepage.
      body = JSON.parse(body)
      resolve({ status : response.statusCode, body : body })
    }
})
})
}

//////////////////////API DEFINITION ///////////////////////////////////

app.post('/translate', function(req, res) {
  b = req.body
  // console.log(b)
  var toTranslate = { source : b.source , target : b.target , input : b.input}
  var promise = Translate(toTranslate)
  promise.then(
    function(data) {
        if (data.status == 200)
        {
            var sourceLanguage = (toTranslate.source=='auto') ? data.body.outputs[0].detectedLanguage : toTranslate.source
            result = '[' + sourceLanguage + '] ' + toTranslate.input + ' >>> [' + toTranslate.target + '] ' + data.body.outputs[0].output
            // console.log(result) // Résultat de la Traduction Directe
            res.send(data.body)
        }
   },function(data){
        if (data.status == 500)
        {
            //Traduction impossible utilisation de la langue pivot
            var toTranslate2 = JSON.parse(JSON.stringify(toTranslate));

            toTranslate2.source = 'en'
            toTranslate.target = 'en'
            // console.log(toTranslate)
            var promise2 = Translate(toTranslate)
            var intermediate = ''

            promise2.then(
              function(data) {
                  if (data.status == 200)
                  {
                      intermediate = data.body.outputs[0]
                      return intermediate
                  }
              },function(data){
              if (data.status == 500)
              {
                    console.log('erreur de traduction vers langue pivot')
              }
              }).then(function(result){
                 toTranslate2.input = result.output
                 var promise3 = Translate(toTranslate2)
                 promise3.then(
                   function(data) {
                       if (data.status == 200)
                       {
                            var sourceLanguage = (toTranslate.source=='auto') ? result.detectedLanguage : toTranslate.source
                            result = '[' + sourceLanguage + '] ' + toTranslate.input + ' >>> [' + toTranslate2.target + '] ' + data.body.outputs[0].output
                            console.log(result) // Résultat de la Traduction inDirecte via Pivot
                            res.send(data.body)

                     }},function(data){
                       if (data.status == 500)
                       {

                         console.log('erreur de traduction depuis la langue pivot')
                       }
                      })

              })
         }
})
})

app.listen(Param.API_PORT,function(){
    console.log('Node server running @ http://localhost:' + Param.API_PORT)
});

process.on('uncaughtException', function(err) { //Deal with already : switch to next port
        if(err.errno === 'EADDRINUSE' && err.port === Param.API_PORT)
            { console.log('Port ' + Param.API_PORT + ' already in use.');
             app.listen( (parseInt(Param.API_PORT) + 1) , function(){
               console.log('listening on *: ' + ( parseInt(Param.API_PORT) + 1));
             });
           }
         });
