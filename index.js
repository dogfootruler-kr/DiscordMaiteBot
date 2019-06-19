'use strict';

require('dotenv').config();
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const Discord = require('discord.io');
const saveData = require('./db/insertRecipe').saveData;

const url = 'https://www.prochedemalade.com/backup/menus-sante/diabete/menus-et-recettes/';
const channelId = '542814475527651351';
var queue = [];

function sendRandomRecipe(channelID, type) {
    fs.readFile('output.json', (err, data) => {
        if (err) { throw err; }
        let dataJSON = JSON.parse(data);
        let randInt = Math.floor(Math.random() * dataJSON.length);
        let randColor = Math.floor(Math.random() * 16777215);
        let menu = dataJSON[randInt][type];

        console.log(`Menu selected: ${JSON.stringify(menu)}`);
        menu.forEach(element => {
            let fields = [];
            if (element.ingredients) {
                fields.push({
                    name: 'Ingrédients [4 personnes]',
                    value: element.ingredients.join('\n')
                });
            }

            if (element.preparation) {
                fields.push({
                    name: 'Préparation',
                    value: element.preparation.join('\n')
                });
            }

            if (element.conseils) {
                fields.push({
                    name: 'Conseils',
                    value: element.conseils.join('\n')
                });
            }

            let embedObject = {
                color: randColor,
                title: element.title,
                fields: fields
            };

            queue.push({
                to: channelID,
                embed: embedObject
            });
        });
    });
}

getRecipes();

function getRecipes() {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            var recipes = [];
            var day = {
                'Déjeuner': [],
                'Dîner': []
            };
            var type = 'Déjeuner';

            $('.recetteLinks .orangeBulls').each((i, elem) => {
                var title, ingredients, preparation, conseils;
                var recipe = {
                    title: '',
                    ingredients: '',
                    preparation: '',
                    conseils: ''
                };
                var data = $(elem);
                var parent = data.parent().parent().parent().prev().prev().first().text();
                if (parent === 'Déjeuner' && i !== 0) {
                    recipes.push(day);
                    day = {
                        'Déjeuner': [],
                        'Dîner': []
                    };
                    type = 'Déjeuner';
                } else if (parent === 'Dîner') {
                    type = 'Dîner';
                }

                title = data.children().first().text().trim().split('\n')[0];
                ingredients = data.children().first().text().trim()
                    .split('                    \n')[3].split('\n                                ');
                ingredients = ingredients.map((e) => {
                    return e.trim();
                });

                if (!data.children().first().text().trim().split('Préparation')[1]) {
                    conseils = data.children().first().text().trim()
                        .split('Préparation')[0].split('Conseils')[1].trim().split('\n');
                    conseils = conseils.map((e) => {
                        return e.trim();
                    }).filter((f) => {
                        if (f === 'Partagez ces informations avec un proche' || f === '' || f === 'Imprimer') {
                            return false;
                        }
                        return true;
                    });
                }

                if (data.children().first().text().trim().split('Conseils')[1]) {
                    conseils = data.children().first().text().trim().split('Conseils')[1].trim().split('\n');
                    conseils = conseils.map((e) => {
                        return e.trim();
                    }).filter((f) => {
                        if (f === 'Partagez ces informations avec un proche' || f === '' || f === 'Imprimer') {
                            return false;
                        }
                        return true;
                    });
                }

                if (data.children().first().text().trim().split('Préparation')[1]) {
                    preparation = data.children().first().text().trim().split('Préparation')[1]
                        .split('Conseils')[0].trim().split('\n');
                    preparation = preparation.map((e) => {
                        return e.trim();
                    }).filter((f) => {
                        if (f === 'Partagez ces informations avec un proche' || f === '' || f === 'Imprimer') {
                            return false;
                        }
                        return true;
                    });
                }

                recipe.title = title;
                recipe.ingredients = ingredients;
                recipe.preparation = preparation;
                recipe.conseils = conseils;
                day[type].push(recipe);
            });
        }

        if (recipes !== undefined) {
            saveData(recipes);
            fs.writeFile('output.json', JSON.stringify(recipes, null, 4), function () {
                console.log('File successfully written! - Check your project directory for the output.json file');
            });
        }
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

bot.on('message', function (user, userID, channelID, message) {
    if (user === bot.username) {
        return;
    }

    if (message.substring(0, 1) === '$') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        switch (cmd) {
        // !menu
        case 'menu':
            console.log('Sending a menu');
            sendRandomRecipe(channelID, 'Déjeuner');
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

    if (roughByteSize >= 4096) { return; }

    bot.sendMessage(messageToSend);
}, 1500);

// Sending random recipe each day at 16h30, seding lunch and dinner at 11h30 during weekend
setInterval(() => {
    var date = new Date();
    var hours = date.getHours();
    if ((date.getDay() === 6 || date.getDay() === 0) && hours === 10 && date.getMinutes() === 30) {
        console.log(`It is ${date.toLocaleString()}, sending lunch and dinner recipes.`);
        sendRandomRecipe(channelId, 'Déjeuner');
        sendRandomRecipe(channelId, 'Dîner');
    } else if (date.getDay() !== 6 && date.getDay() !== 0 && hours === 15 && date.getMinutes() === 30) {
        console.log(`It is ${date.toLocaleString()}, sending dinner recipe.`);
        sendRandomRecipe(channelId, 'Dîner');
    }
}, 60000);