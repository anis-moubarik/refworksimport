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
                    var metadata = result['OAI-PMH']['GetRecord'][0].record[0].metadata[0]['kk:metadata'][0]['kk:field'];
                    var result = dc2rtf.map(metadata);

                    //Extract authors from result, and give it as separate variable to the view
                    var authors = result['A1'];
                    var keywords = result['K1'];
                    delete result['A1'];
                    delete result['K1'];
                    res.render('metadata', {title: 'Refworks Tagged Format', metadata: result, authors: authors, keywords: keywords})
                });
            });
        })
    }catch (err){
        res.send(err.message);
    }
});

module.exports = router;
