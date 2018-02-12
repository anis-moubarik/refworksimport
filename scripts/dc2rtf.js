
var dc2rtf = {};

var config;

dc2rtf.map = function(metadata, conf) {
    config = conf || require('../config.json');
    result = {};
    for(var i = 0; i < metadata.length; i++){
        var qual = metadata[i]['$'].qualifier;
        var elm = metadata[i]['$'].element;
        var lang = metadata[i]['$'].language;
        var value = metadata[i]['$'].value.replace(/\r?\n|\r/g, "");

        // Get the type and add it to the result array
        if(elm === "type" && lang === "en"){
            if(value.indexOf("thesis") > -1){
                result['RT'] = "Dissertation/Thesis";
            }else if(value.indexOf("abstract") > -1){
                result['RT'] = "Abstract";
            }else{
                result['RT'] = "Generic";
            }
        }

        // Some Edge Cases
        if(elm === "title" && qual !== "alternative"){
            result['T1'] = value;
            continue;
        }

        if(elm === "publisher" || elm === "organization"){
            var cleanedpub = cleanpublisher(value);
            //Check if the same publisher is in already
            if(result['PB'] != undefined ){
                if(result['PB'] === value || result['PB'].includes(value))
                {
                    continue;
                }
            }
            // If there's more than one publisher we add it in to an array
            result['PB'] == undefined ? result['PB'] = [value] : result['PB'].push(value);
            continue;
        }

        //Add Keywords
        if (elm === "subject"){
            var keytag = config.mapping[elm];
            result[keytag] == undefined ? result[keytag] = [value] : result[keytag].push(value);
            continue;
        }

        //Add LUT Publisher
        if(elm === "contributor" && (value.indexOf("Lappeenrannan") > -1)){
            result['PB'] = value.split("/")[0];
            continue;
        }

        // Pagerange
        if(elm === "format" && qual === "pagerange"){
            var pages = value.split("-");
            result['SP'] = pages[0];
            result['OP'] = pages[1];
            continue;
        }

        //If tag is undefined, ignore it
        var tag = config.mapping[qual];
        if(tag === undefined){
            continue;
        }

        if(elm === "language" && qual === "iso"){
            value = typeof config.lang[value] == 'undefined' ? "Finnish(32)" : config.lang[value];
        }

        //Add primary authors to a array
        if(tag === "A1"){
            result[tag] == undefined ? result[tag] = [value] : result[tag].push(value);
            continue;
        }

        //Clean the issued date
        if(tag === "YR"){
            var yearArr = /^[12][0-9]{3}/.exec(value);
            result[tag] = yearArr[0];
            continue;
       }

        //If the tag is not empty, append the value to it
        if(result[tag] !== undefined){
            result[tag] += ", "+value;
        }else {
            result[tag] = value;
        }
    }

    return result;
};

dc2rtf.maketext = function(data){
    var text = "";

    for(var key in data){
        if (data[key].constructor === Array){
            for(var i = 0; i < data[key].length; i++){
                text += key + " " + data[key][i] + "\n"
            }
        }else{
            text += key + " " + data[key]+"\n";
        }
    }

    return text;


};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function cleanpublisher(publisherstring){
    var pubarray = publisherstring.split("|");
    pubarray.pop();
    var publishers = [];
    for (var pub in pubarray){
        var pubstring = pubarray[pub].replaceAll("fi=", "");
        pubstring = pubstring.replaceAll("en=", "");
        publishers.push(pubstring);
    }
    return publishers;
};


module.exports = dc2rtf;
