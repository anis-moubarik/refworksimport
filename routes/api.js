const express = require('express');
const https = require('https');
const xml2js = require('xml2js');
const router = express.Router();
const winston = require('../winston/config');
const dc2rtf = require('../scripts/dc2rtf');


let parser = new xml2js.Parser();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'api' });
});

router.get('/q/:host/:handlepre/:handlepost', function(req, res, next){
    let handle = req.params.handlepre + "/" + req.params.handlepost;
    let host = req.params.host;
    if (host == "theseus.fi")
	host = "www.theseus.fi";
    //Do a http request to the OAI-PMH provider and parse the xml to json using xml2js.
    try {
        https.get({
            hostname: host,
            port: 443,
            path: "/oai/request?verb=GetRecord&metadataPrefix=kk&identifier=oai:" + host + ":" + handle
        }, function (response) {
            let xml = '';
            response.on('data', function (d) {
                xml += d;
            });
            response.on('end', function () {
                parser.parseString(xml, function(err, result){
                    if(typeof result['OAI-PMH']['GetRecord'] == 'undefined'){
                        winston.error("invalid xml");
                        res.write("invalid xml");
                        res.end();
                        return;
                    }
                    let metadata = result['OAI-PMH']['GetRecord'][0].record[0].metadata[0]['kk:metadata'][0]['kk:field'];
                    let results = dc2rtf.map(metadata);

                    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                    res.write(dc2rtf.maketext(results));
                    res.end();
                });
            });
        })
    }catch (err){
        res.send(err.message);
    }
});


module.exports = router;
