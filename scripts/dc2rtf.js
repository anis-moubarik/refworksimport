
var dc2rtf = {};

var config;

dc2rtf.map = function(metadata, conf) {
    config = conf || require('../config.json');
    result = {};
    for(var i = 0; i < metadata.length; i++){
        var qual = metadata[i]['$'].qualifier;
        var elm = metadata[i]['$'].element;
        var lang = metadata[i]['$'].language;
        var value = metadata[i]['$'].value;

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


/*function getTag(dcfield){
    switch(dcfield) {
        case "author":
            return "A1";
        case "issued":
            return "YR";
        case "uri":
            return "UL";
        case "abstract":
            return "AB";
        case "title":
            return "T1";
        case "volume":
            return "VO"
        case "iso":
            return "LA";
        case "type":
            return "RT";
        case "issn":
            return "SN";
        case "isbn":
            return "SN";
        case "subject":
            return "K1";
        default:
            return "undefined";
    }
}

function getLangCode(lang){
    switch(lang){
        case "fi":
            return "Finnish(32)";
        case "en":
            return "English(30)";
    }


}*/

module.exports = dc2rtf;
