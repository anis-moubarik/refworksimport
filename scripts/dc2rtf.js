
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

        if(elm === "type" && lang === "en"){
            if(value === "Master's thesis"){
                result['RT'] = "Dissertation/Thesis";
                continue;
            }
        }

        //Some Edge cases
        if(elm === "title" && qual !== "alternative"){
            result['T1'] = value;
            continue;
        }

        if(elm === "publisher"){
            result['PB'] = value;
            continue
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

        //If tag is undefined, ignore it
        var tag = config.mapping[qual]
        if(tag === undefined){
            continue;
        }

        if(elm === "language" && qual === "iso"){
            value = config.lang[value];
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

module.exports = dc2rtf;
