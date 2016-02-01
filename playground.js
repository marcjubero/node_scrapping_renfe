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

function readFile() {
    fs.readFile( 'renfe_1tb.html', function (err, data) {
        if (err) {
            return console.log(err);
        }
        return data;
    });
}

function getStations() {
    request({method: 'GET', encoding: null, uri: urlStations}, function(error, response, html) {
            if(!error && response.statusCode == 200) {
                var stations = [];
                var $ = cheerio.load(iconv.decode(new Buffer(html), "ISO-8859-1"));
                $('select.caja_texto1').first().children().each(function(i, element) {
                    var a = $(this),
                        text = a.text().replace(/\s+/g,' ').replace(/^\s+|\s+$/,''),
                        value = a.attr('value');

                    if(i > 0) {
                        stations.push({ "value": value, "name": text})
                        console.log({ "value": value, "name": text});
                    }
                });
            }
        }
    );
}

function parseSimpleSchedule (data) {
    // TODO: Cosas nazis
}

function parseSchedule(data, changes) {
    // TODO: Cosas aún mas nazis
}

var urlRequest = urlSchedule + twoChanges
request({method: 'GET', encoding: null, uri: urlRequest}, function(error,response, html) {
    if(!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var scheduleTable = $('tbody').children();
        var countChanges = (scheduleTable.toString().match(/Transbordo/g) || []).length;
        console.log("#Changes: " + countChanges);

        $(scheduleTable).each(function(i, element) {
            console.log("\n");

            $(this).children().each(function(i, element) {
                console.log(i + " -> " + $(this).html())
            });
        });
    }
});
