var express = require('express');
var http = require('http');
var xml2js = require('xml2js');
var router = express.Router();
var dc2rtf = require('../scripts/dc2rtf');


var parser = new xml2js.Parser();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'api' });
});

router.get('/refworks', function(req, res, next){
    var handle = req.query.handle;
    var host = req.query.host;
    console.log(host);
    console.log(handle);

    //Do a http request to the OAI-PMH provider and parse the xml to json.
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
                    var metadata = result['OAI-PMH']['GetRecord'][0].record[0].metadata[0]['kk:metadata'][0]['kk:field'];
                    var result = dc2rtf.map(metadata);
                    res.render('metadata', {title: 'Refworks Tagged Format', metadata: result})
                });
            });
        })
    }catch (err){
        res.send(err.message);
    }
});

module.exports = router;
