var HTTPS = require("https");
var cool = require("cool-ascii-faces");

var botID = process.env.BOT_ID;

function respond() {
    var request = JSON.parse(this.req.chunks[0]),
    botRegex = /^@dice/i;

    if (request.text && botRegex.test(request.text)) {
        this.res.writeHead(200);
        postMessage(request.text.split(" "));
        this.res.end();
    } else {
        console.log("don't care");
        this.res.writeHead(200);
        this.res.end();
  }
}

function postMessage(args) {
    var botResponse, options, body, botReq;
    
    botResponse = interpret(args.slice(1));
//  botResponse = cool();

    options = {
        hostname: "api.groupme.com",
        path: "/v3/bots/post",
        method: "POST"
    };

    body = {
        "bot_id" : botID,
        "text" : botResponse
    };

    console.log("sending " + botResponse + " to " + botID);

    botReq = HTTPS.request(options, function(res) {
        if (res.statusCode == 202) {
            //neat
        } else {
            console.log("rejecting bad status code " + res.statusCode);
        }
    });

    botReq.on("error", function(err) {
        console.log("error posting message "  + JSON.stringify(err));
    });
    botReq.on('timeout', function(err) {
        console.log("timeout posting message "  + JSON.stringify(err));
    });
    botReq.end(JSON.stringify(body));
}

function interpret(args) {
    var regex = /^roll$/i;
    if (regex.test(args[0])) {
        if (args.length < 2)
            return "You need to tell me what to roll.";
        var nextword = (args[1] == 'a') ? 2 : 1;
        regex = /[dD]\d+$/;
        if (!regex.test(args[nextword]))
            return "I don't know how to roll '" + args.slice(nextword).join(" ") + "'.";
        var count = args[nextword].split(/[dD]/)[0];
        count = (count == '') ? 1 : count;
        var sides = args[nextword].split(/[dD]/)[1];
        regex = /^[1-9]$/
        if (!regex.test(count) && count != 1)
            return "I can only roll between one and nine dice.";
        regex = /^(4|6|8|1[02]|20)$/;
        if (!regex.test(sides))
            return "I don't have that shape.\nTry a d4, d6, d8, d10, d12, or d20.";
        var rolls = roll(parseInt(count), parseInt(sides)).join(", ");
        return "You rolled " + rolls + ".";
    }
    regex = /^(flip|toss)/i;
    if (regex.test(args[0])) {
        regex = /^(coin|a coin)$/i;
        var term = (args.length > 2) ? args[1] + " " + args[2] : args[1];
        if (regex.test(term))
            return "The coin landed on " + flipcoin() + ".";
        var term = (args[1] == null) ? "nothing" : "'" + args.slice(1).join(" ") + "'";
        return "I don't know how to " + args[0] + term + ".";
    }
    regex = /^(about|help|\?)$/i;
    if (regex.test(args[0]) || args.length == 0) {
        return ">I'm DiceBot, a chatbot designed to help you play games of chance.\nType @dice commands to see what I can do!\n\nProgrammed by Kevin Nash using the Groupme bot API."
    }
    regex = /^(commands)$/i;
    if (regex.test(args[0]))
        return ">@dice help - displays basic info\n@dice roll [X]d[Y] - rolls X Y-sided dice\n@dice flip coin - flips a two sided coin";
    return "I don't know what '" + args[0] + "' means.";
}

function roll(count, sides) {
    var rolls = new Array(count);
    for (var i = 0; i < count; i++) {
        rolls[i] = Math.floor(Math.random() * sides) + 1;
    }
    return rolls;
}

function flipcoin() {
    return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
}

exports.respond = respond;
