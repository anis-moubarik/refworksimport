var express = require('express');
var http = require('http');
var xml2js = require('xml2js');
var router = express.Router();
var dc2rtf = require('../scripts/dc2rtf');


var parser = new xml2js.Parser();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'api' });
});

router.get('/q/:host/:handlepre/:handlepost', function(req, res, next){
    var handle = req.params.handlepre + "/" + req.params.handlepost;
    var host = req.params.host;

    //Do a http request to the OAI-PMH provider and parse the xml to json using xml2js.
    try {
        http.get({
            hostname: host,
            port: 80,
            path: "/oai/request?verb=GetRecord&metadataPrefix=kk&identifier=oai:" + host + ":" + handle
        }, function (response) {
            var xml = '';
            response.on('data', function (d) {
                xml += d;
            });
            response.on('end', function () {
                parser.parseString(xml, function(err, result){
                    if(typeof result['OAI-PMH']['GetRecord'] == 'undefined'){
                        res.write("invalid xml");
                        res.end();
                        return;
                    }
                    var metadata = result['OAI-PMH']['GetRecord'][0].record[0].metadata[0]['kk:metadata'][0]['kk:field'];
                    var result = dc2rtf.map(metadata);

                    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                    res.write(dc2rtf.maketext(result));
                    res.end();
                });
            });
        })
    }catch (err){
        res.send(err.message);
    }
});


module.exports = router;
