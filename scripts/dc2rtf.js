
var dc2rtf = {};

dc2rtf.map = function(metadata) {
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

        if(elm === "publisher" && lang === "fi"){
            result['PB'] = value;
            continue
        }

        //Add LUT Publisher
        if(elm === "contributor" && (value.indexOf("Lappeenrannan") > -1)){
            console.log(value)
            result['PB'] = value.split("/")[0];
            continue;
        }

        //If tag is undefined, ignore it
        var tag = getTag(qual);
        if(tag === "undefined"){
            continue;
        }

        if(elm === "language" && qual === "iso"){
            value = getLangCode(value);
        }

        //Add primary authors to a array
        if(tag === "A1"){
            result[tag] == undefined ? result[tag] = [value] : result[tag].push(value);
            console.log(result[tag])
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


function getTag(dcfield){
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
}

module.exports = dc2rtf;
