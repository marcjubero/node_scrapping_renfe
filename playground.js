var cheerio = require('cheerio'),
    request = require('request'),
    iconv   = require('iconv-lite'),
    fs      = require('fs'),
    urlStations     = 'http://horarios.renfe.com/cer/hjcer300.jsp?NUCLEO=50&CP=NO&I=s',
    urlSchedule     = 'http://horarios.renfe.com/cer/hjcer310.jsp?&',
    noChanges       = 'nucleo=50&i=s&cp=NO&o=78600&d=71801&df=20160130&ho=00&hd=26&TXTInfo=',
    oneChanges      = 'nucleo=50&i=s&cp=NO&o=72400&d=71709&df=20160130&ho=00&hd=26&TXTInfo=',
    twoChanges      = 'nucleo=50&i=s&cp=NO&o=72501&d=77003&df=20160130&ho=00&hd=26&TXTInfo='


function writeFile(data) {
    fs.writeFile("out.txt", data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function readFile(path) {
    // path -> ./offline/renfe_[0,1,2]tb.html
    fs.readFile(path, function (err, data) {
        if (err) {
            return console.log(err);
        }
        return data;
    });
}

function deleteExtraWhitespaces (text) {
    return text.replace(/\s+/g,' ').replace(/^\s+|\s+$/,'')
}

function getStations() {
    request({method: 'GET', encoding: null, uri: urlStations}, function(error, response, html) {
            if(!error && response.statusCode == 200) {
                var stations = [],
                    $ = cheerio.load(iconv.decode(new Buffer(html), "ISO-8859-1"));

                $('select.caja_texto1').first().children().each(function(i, element) {
                    var a = $(this),
                        text = a.text().replace(/\s+/g,' ').replace(/^\s+|\s+$/,''),
                        value = a.attr('value');

                    if(i > 0) {
                        stations.push({ "code": value, "name": text})
                        console.log({ "code": value, "name": text});
                    }
                });
            }
        }
    );
}

function parseNoChangeSchedule (data) {
    console.log("-> parse 0 changes sch");
    console.log(data);
    return data.map(function(elem) {
        return {
            "line": elem[0],
            "dep_time": elem[1],
            "arr_rime": elem[2],
            "total_time": elem[3]
        }
    });
}

function parseSingleChangeSchedule(data) {
    console.log("-> parse 1 changes sch");
    console.log(data);
}

function parseMultiChangesSchedule(data) {
    console.log("-> parse 2 changes sch");
    console.log(data);
}

function parseScheduleArray(data, changes) {
    var parsedJsonSchedule = (changes == 0) ? parseNoChangeSchedule(data) : (changes >= 2) ? parseMultiChangesSchedule(data) : parseSingleChangeSchedule(data);
    //console.log(parsedJsonSchedule)

    //return parsedJsonSchedule;
}

var urlRequest = urlSchedule + twoChanges
request({method: 'GET', encoding: null, uri: urlRequest}, function(error,response, html) {
    if(!error && response.statusCode == 200) {
        var tripSchedule = [],
            $ = cheerio.load(html),
            scheduleTable = $('tbody').children(),
            countChanges = (scheduleTable.toString().match(/Transbordo/g) || []).length;

        $(scheduleTable).each(function(i, element) {
            var partialSchedule = [];
            $(this).children().each(function(i, element) {
                partialSchedule.push(deleteExtraWhitespaces($(this).html()))
            });
            tripSchedule.push(partialSchedule)
        });
        parseScheduleArray(tripSchedule.slice(2),countChanges);
    }
});
