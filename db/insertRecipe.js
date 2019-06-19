'use strict';

const fs = require('fs');
const DB = require('./index');
const async = require('async');
const q = require('q');
var db = new DB();

function getRecipe(meal, menuid) {
    let promises = [];
    let p = Promise.resolve(); // I don't know the Q equivalent of this
    for (var i=0; i<meal.length; i++) {
        let recipe = meal[i];
        p = p.then(function() {
            return db.insertIntoRecipe({
                title: recipe.title,
                menuid
            }).then((recipeResponse) => {
                if (recipe.ingredients && recipe.ingredients.length > 0) {
                    return db.insertIntoIngredients({
                        recipeid: recipeResponse.recipeid,
                        description: recipe.ingredients.join('\n')
                    });
                }
                return recipeResponse;
            }).then((recipeResponse) => {
                if (recipe.preparation && recipe.preparation.length > 0) {
                    return db.insertIntoPreparations({
                        recipeid: recipeResponse.recipeid,
                        description: recipe.preparation.join('\n')
                    });
                }
                return recipeResponse;
            }).then((recipeResponse) => {
                if (recipe.conseils && recipe.conseils.length > 0) {
                    return db.insertIntoConseils({
                        recipeid: recipeResponse.recipeid,
                        description: recipe.conseils.join('\n')
                    });
                }
                return recipeResponse;
            });
        });
        promises[i] = p;
    };

    return q.all(promises);
}

function saveData(dataJSON) {
    let menuid = 1;
    let promises = [];

    dataJSON.forEach((dayRecipe) => {
        promises.push(getRecipe(dayRecipe['Déjeuner'], menuid));
        menuid++;
        promises.push(getRecipe(dayRecipe['Dîner'], menuid));
        menuid++;
    });

    Promise.all(promises).then(() => {
        console.log('Finished all recipes');
    });
}

module.exports = {
    saveData
}