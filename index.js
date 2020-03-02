'use strict';

require('dotenv').config();
const request = require('request');
const Discord = require('discord.io');

const spoontacularUrl = `https://api.spoonacular.com/recipes/random?number=1&apiKey=${process.env.SPOONTACULAR_TOKEN}&tag=lunch,dinner`;
const masterChannelID = '542814475527651351';
var queue = [];

/*Embed titles are limited to 256 characters
Embed descriptions are limited to 2048 characters
There can be up to 25 fields
A field's name is limited to 256 characters and its value to 1024 characters
The footer text is limited to 2048 characters
The author name is limited to 256 characters
In addition, the sum of all characters in an embed structure must not exceed 6000 characters
A bot can have 1 embed per message
A webhook can have 10 embeds per message*/

function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'gsm'));
}

function sendRandomRecipe(channelID) {
    request(spoontacularUrl, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        const recipe = body.recipes[0];
        let url = recipe.sourceUrl;
        let image = recipe.image;
        let ingredients = recipe.extendedIngredients;
        let title = recipe.title;
        let instructions = recipe.instructions;
        let readyInMinutes = recipe.readyInMinutes;
        let servings = recipe.servings;

        let fields = [];
        if (ingredients) {
            let ingredientStringArray = ingredients.map((ingredient) => {
                let name = ingredient.originalString;
                let amount = ingredient.measures.metric.amount;
                let unit = ingredient.measures.metric.unitLong;
                return `${name} (${amount} ${unit})`;
            });
            fields.push({
                name: `Ingrédients [${servings} personnes]`,
                value: ingredientStringArray.join('\n')
            });
        }

        if (instructions) {
            let compiledInstructions = instructions.replace(/(<ol>)|(<\/ol>)|(<li>)/gm, '').replace(/<\/li>/gm, '\n');
            // Fields value cannot exceed 1024 bytes.
            let listOfCompiledInstructions = chunkString(compiledInstructions, 1024);
            listOfCompiledInstructions.forEach((inst, index) => {
                if (index === 0)
                    fields.push({
                        name: `Préparation [prêt en ${readyInMinutes} minutes]`,
                        value: inst
                    });
                else
                    fields.push({
                        name: "suite",
                        value: inst
                    });
            });
        }

        let embedObject = {
            color: Math.floor(Math.random() * 16777215),
            title: title,
            fields: fields,
            thumbnail: {
                url: image
            },
            url: url
        };

        console.log(embedObject)

        queue.push({
            to: channelID,
            embed: embedObject
        });
    });
}

// Bot message handling
const bot = new Discord.Client({
    token: process.env.DISCORD_TOKEN,
    autorun: true
});

bot.on('ready', function () {
    console.log(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', async function (user, userID, channelID, message) {
    if (user === bot.username) {
        return;
    }

    if (message.substring(0, 1) === '$') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        switch (cmd) {
            // $menu
            case 'menu':
                console.log('Sending a menu');
                await sendRandomRecipe(channelID);
                break;
            default:
                break;
        }
    }

    if (message.indexOf('ortolan') !== -1) {
        console.log(`Sending ortolan message to ${channelID}`);
        queue.push({
            to: channelID,
            message: 'Je lui suce le derrière! https://www.youtube.com/watch?v=SEPMuyGe7dg'
        });
    }
});

bot.on('disconnect', function (errMsg, code) {
    console.log(`Disconnected from Discord. Error Code ${code}. Message ${errMsg}.`);
    bot.connect();
});

// Sending queue messages
setInterval(() => {
    if (queue.length === 0) { return; }

    let messageToSend = queue.shift();
    let roughByteSize = JSON.stringify(messageToSend).length;
    console.log(`Sending message queue. Queue length: ${queue.length}, Message length: ${roughByteSize}`);

    if (roughByteSize >= 6000) { return; }

    bot.sendMessage(messageToSend);
}, 1500);

// Sending random recipe each day at 16h30, sending lunch and dinner at 11h30 during weekend
setInterval(async () => {
    var date = new Date();
    var hours = date.getHours();
    if ((date.getDay() === 6 || date.getDay() === 0) && hours === 10 && date.getMinutes() === 30) {
        console.log(`It is ${date.toLocaleString()}, sending lunch and dinner recipes.`);
        await sendRandomRecipe(masterChannelID);
        await sendRandomRecipe(masterChannelID);
    } else if (date.getDay() !== 6 && date.getDay() !== 0 && hours === 15 && date.getMinutes() === 30) {
        console.log(`It is ${date.toLocaleString()}, sending dinner recipe.`);
        await sendRandomRecipe(masterChannelID);
    }
}, 60000);