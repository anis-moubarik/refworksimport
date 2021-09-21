
let dc2rtf = {};

let config;

dc2rtf.map = function(metadata, conf) {
    config = conf || require('../config.json');
    result = {};
    for(let i = 0; i < metadata.length; i++){
        let qual = metadata[i]['$'].qualifier;
        let elm = metadata[i]['$'].element;
        let lang = metadata[i]['$'].language;
        let value = metadata[i]['$'].value.replace(/\r?\n|\r/g, "");

        // Get the type and add it to the result array
        if(elm === "type" && lang === "en"){
            if(value.includes("thesis") || value.includes("Bachelor's")){
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

        if((elm === "publisher" || elm === "organization") && qual === undefined){
            let cleanedpub = cleanpublisher(value);
            //Check if the same publisher is in already
            if(result['PB'] != undefined ){
                if(result['PB'] === value || result['PB'].includes(value))
                {
                    continue;
                }
            }

            //Check if we have a string or an object
            if(typeof cleanedpub == "string"){
                result['PB'] == undefined ? result['PB'] = [cleanedpub] : result['PB'].push(cleanedpub);
                continue;
            }

            //Check the language and if there's more than one publisher we add it in to an array
            if(result['LA'] === 'English') {
                result['PB'] == undefined ? result['PB'] = [cleanedpub['en']] : result['PB'].push(cleanedpub['en']);
            }
            else if(result['LA'] === 'Finnish') {
                result['PB'] == undefined ? result['PB'] = [cleanedpub['fi']] : result['PB'].push(cleanedpub['sv']);
            }
            else if(result['LA'] === 'Swedish') {
                result['PB'] == undefined ? result['PB'] = [cleanedpub['sv']] : result['PB'].push(cleanedpub['sv']);
            } else {
                result['PB'] == undefined ? result['PB'] = [cleanedpub['fi']] : result['PB'].push(cleanedpub['sv']);
            }
            continue;
        }

        //Add Keywords
        if (elm === "subject"){
            let keytag = config.mapping[elm];
            result[keytag] == undefined ? result[keytag] = [value] : result[keytag].push(value);
            continue;
        }

        //Add LUT Publisher
        if(elm === "contributor" && (value.indexOf("Lappeenrannan") > -1)){
            result['PB'] = [value.split("/")[0]];
            continue;
        }

        //Add Theseus Publisher
        if (elm === "contributor" && value.indexOf("fi=") > -1){
            let cleanedpub = cleanpublisher(value);
            if(result['LA'] === 'English') {
                result['PB'] == undefined ? result['PB'] = [cleanedpub['en']] : result['PB'].push(cleanedpub['en']);
            }
            else if(result['LA'] === 'Finnish') {
                result['PB'] == undefined ? result['PB'] = [cleanedpub['fi']] : result['PB'].push(cleanedpub['sv']);
            }
            else if(result['LA'] === 'Swedish') {
                result['PB'] == undefined ? result['PB'] = [cleanedpub['sv']] : result['PB'].push(cleanedpub['sv']);
            } else {
                result['PB'] == undefined ? result['PB'] = [cleanedpub['fi']] : result['PB'].push(cleanedpub['sv']);
            }
            continue;
        }

        // Pagerange
        if(elm === "format" && qual === "pagerange"){
            let pages = value.split("-");
            result['SP'] = pages[0];
            result['OP'] = pages[1];
            continue;
        }

        // Add urn link
        if(qual === "uri" && value.includes("URN")){
            result['LK'] = "http://urn.fi/"+value;
            continue;
        }

        if(qual === "urn"){
            value = "http://urn.fi/"+value;
        }

        //If tag is undefined, ignore it
        let tag = config.mapping[qual];
        if(tag === undefined){
            continue;
        }

        if(elm === "language" && qual === "iso"){
            value = typeof config.lang[value] == 'undefined' ? "Finnish(32)" : config.lang[value];
        }

        //Add primary authors to a array
        if(tag === "A1"){
            //Due to Refworks bug the first author needs to be duplicated
            if(result[tag] === undefined){
                result[tag] = [value];
                result[tag].push(value);
            } else {
                result[tag].push(value);
            }
            continue;
        }

        //Clean the issued date
        if(tag === "YR"){
            let yearArr = /^[12][0-9]{3}/.exec(value);
            result[tag] = yearArr[0];
            continue;
       }

        //If the tag is not empty, append the value to it
        if(result[tag] !== undefined){
            result[tag].push(value);
        }else {
            result[tag] = [value];
        }
    }

    return result;
};

dc2rtf.maketext = function(data){
    let text = "";

    for(let key in data){
        if (data[key].constructor === Array){
            for(let i = 0; i < data[key].length; i++){
                text += key + " " + data[key][i] + "\n"
            }
        }else{
            text += key + " " + data[key]+"\n";
        }
    }

    return text;


};

String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function cleanpublisher(publisherstring){
    if(!isLocalizedString(publisherstring)){
        return publisherstring;
    }
    let firegex = /fi=[^|]+/gm;
    let svregex = /sv=[^|]+/gm;
    let enregex = /en=[^|]+/gm;

    let publishers = {};
    publishers["fi"] = publisherstring.match(firegex)[0].replaceAll("fi=", "");
    publishers["sv"] = publisherstring.match(svregex)[0].replaceAll("sv=", "");
    publishers["en"] = publisherstring.match(enregex)[0].replaceAll("en=", "");
    return publishers;
};

function isLocalizedString(s){
    return !!(s.includes("fi=") || s.includes("en=") || s.includes("sv="));

}


module.exports = dc2rtf;
