'use strict';

const { Pool } = require('pg');

class database {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL + '?ssl=true'
        });
    }

    selectAllUsers() {
        return this.pool.connect()
            .then((client) => {
                return client.query('SELECT * FROM users')
                    .then(res => {
                        client.release();
                        return res.rows;
                    })
                    .catch(e => {
                        client.release();
                        console.log(e.stack);
                    });
            });
    }

    selectUserByScreenNameAndChannelId(screenName, channelid) {
        return this.pool.connect()
            .then((client) => {
                return client.query('SELECT * FROM users WHERE twitterscreenname=$1 AND channelid=$2',
                    [screenName, channelid])
                    .then(res => {
                        client.release();
                        return res.rowCount !== 0 ? true : false;
                    })
                    .catch(e => {
                        client.release();
                        console.log(e.stack);
                    });
            });
    }

    deleteByScreenName(screenName) {
        return this.pool.connect()
            .then((client) => {
                return client.query('DELETE FROM users WHERE twitterscreenname=$1', [screenName])
                    .then(res => {
                        client.release();
                        return res.rowCount !== 0 ? true : false;
                    })
                    .catch(e => {
                        client.release();
                        console.log(e.stack);
                    });
            });
    }

    updateByScreenName(screenName, iconURL) {
        return this.pool.connect()
            .then((client) => {
                return client.query('UPDATE users SET iconurl=$1 WHERE twitterscreenname=$2', [iconURL, screenName])
                    .then(res => {
                        client.release();
                        return res.rowCount !== 0 ? true : false;
                    })
                    .catch(e => {
                        client.release();
                        console.log(e.stack);
                    });
            });
    }

    insertIntoRecipe({ title, menuid }) {
        return this.pool.connect()
            .then((client) => {
                return client.query('INSERT INTO recipes(title, menuid) VALUES($1, $2) RETURNING *',
                    [title, menuid])
                    .then(res => {
                        client.release();
                        //console.log(`INSERT recipes return: ${JSON.stringify(res)}`);
                        return res.rows[0];
                    })
                    .catch(e => {
                        client.release();
                        console.log(e.stack);
                    });
            });
    }

    insertIntoIngredients({ recipeid, description }) {
        return this.pool.connect()
            .then((client) => {
                return client.query('INSERT INTO ingredients(recipeid, description) VALUES($1, $2) RETURNING *',
                    [recipeid, description])
                    .then(res => {
                        client.release();
                        //console.log(`INSERT ingredients return: ${JSON.stringify(res.rows[0])}`);
                        return res.rows[0];
                    })
                    .catch(e => {
                        client.release();
                        console.log(e.stack);
                    });
            });
    }

    insertIntoPreparations({ recipeid, description }) {
        return this.pool.connect()
            .then((client) => {
                return client.query('INSERT INTO preparations(recipeid, description) VALUES($1, $2) RETURNING *',
                    [recipeid, description])
                    .then(res => {
                        client.release();
                        //console.log(`INSERT preparations return: ${JSON.stringify(res.rows)}`);
                        return res.rows[0];
                    })
                    .catch(e => {
                        client.release();
                        console.log(e.stack);
                    });
            });
    }

    insertIntoConseils({ recipeid, description }) {
        return this.pool.connect()
            .then((client) => {
                return client.query('INSERT INTO conseils(recipeid, description) VALUES($1, $2) RETURNING *',
                    [recipeid, description])
                    .then(res => {
                        client.release();
                        //console.log(`INSERT conseils return: ${JSON.stringify(res.rows)}`);
                        return res.rows[0];
                    })
                    .catch(e => {
                        client.release();
                        console.log(e.stack);
                    });
            });
    }
}

module.exports = database;