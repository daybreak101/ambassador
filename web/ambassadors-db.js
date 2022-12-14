//this file is the database and interactions

import sqlite3 from "sqlite3";
import path from "path";
import { Shopify } from "@shopify/shopify-api";

const DEFAULT_DB_FILE = path.join(process.cwd(), "ambassadors_db.sqlite");
const DEFAULT_PURCHASE_QUANTITY = 1;

export const AmbassadorsDB = {
    ambassadorsTableName: "ambassadors",
    db: null,
    ready: null,

    create: async function ({
        shopDomain,
        title,
        email,
        instagram,
        twitter,
        tiktok,
        facebook,
        youtube,
        phone,
        birth,
        plushie,
        discovery,
        hobbies,
        bio,
    }) {

        await this.ready;

        const query = `
      INSERT INTO ${this.ambassadorsTableName}
      (shopDomain, title, email, instagram, twitter, tiktok, facebook, youtube, phone, birth, plushie, discovery, hobbies, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id;
    `;

        const rawResults = await this.__query(query, [
            shopDomain,
            title,
            email,
            instagram,
            twitter,
            tiktok,
            facebook,
            youtube,
            phone,
            birth,
            plushie,
            discovery,
            hobbies,
            bio,
        ]);

        return rawResults[0].id;
    },

    update: async function (
        id,
        {
            title,
            email,
            instagram,
            twitter,
            tiktok,
            facebook,
            youtube,
            phone,
            birth,
            plushie,
            discovery,
            hobbies,
            bio,
            isActive,
        }
    ) {
        await this.ready;

        const query = `
      UPDATE ${this.ambassadorsTableName}
      SET
        title = ?,
        email = ?,
        instagram = ?,
        twitter = ?,
        tiktok = ?,
        facebook = ?,
        youtube = ?,
        phone = ?,
        birth = ?,
        plushie = ?,
        discovery = ?,
        hobbies = ?,
        bio = ?,
        isActive = ?
      WHERE
        id = ?;
    `;

        await this.__query(query, [
            title,
            email,
            instagram,
            twitter,
            tiktok,
            facebook,
            youtube,
            phone,
            birth,
            plushie,
            discovery,
            hobbies,
            bio,
            id,
            isActive,
        ]);
        return true;
    },

    approve: async function (
        id,
        {
            isActive,
        }
    ) {
        await this.ready;

        const query = `
      UPDATE ${this.ambassadorsTableName}
      SET
        isActive = TRUE
      WHERE
        id = ?;
    `;

        await this.__query(query, [
            id,
            isActive,
        ]);
        return true;
    },

   list: async function (shopDomain) {
        await this.ready;
        const query = `
      SELECT * FROM ${this.ambassadorsTableName}
      WHERE shopDomain = ?
      AND isActive = TRUE;
    `;

        const results = await this.__query(query, [shopDomain]);

        return results.map((ambassador) => ambassador);
    },

    listInactive: async function (shopDomain) {
        await this.ready;
        const query = `
      SELECT * FROM ${this.ambassadorsTableName}
      WHERE shopDomain = ?
      AND isActive = FALSE;
    `;

        const results = await this.__query(query, [shopDomain]);

        return results.map((ambassador) => ambassador);
    },

    read: async function (id) {
        await this.ready;
        const query = `
      SELECT * FROM ${this.ambassadorsTableName}
      WHERE id = ?;
    `;
        const rows = await this.__query(query, [id]);
        if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

        return rows[0];
    },

    delete: async function (id) {
        await this.ready;
        const query = `
      DELETE FROM ${this.ambassadorsTableName}
      WHERE id = ?;
    `;
        await this.__query(query, [id]);
        return true;
    },

    /* Private */

    /*
      Used to check whether to create the database.
      Also used to make sure the database and table are set up before the server starts.
    */

    __hasAmbassadorsTable: async function () {
        const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
        const rows = await this.__query(query, [this.ambassadorsTableName]);
        return rows.length === 1;
    },

    /* Initializes the connection with the app's sqlite3 database */
    init: async function () {

        /* Initializes the connection to the database */
        this.db = this.db ?? new sqlite3.Database(DEFAULT_DB_FILE);

        const hasAmbassadorsTable = await this.__hasAmbassadorsTable();

        if (hasAmbassadorsTable) {
            this.ready = Promise.resolve();

            /* Create the code table if it hasn't been created */
        } else {
            const query = `
        CREATE TABLE ${this.ambassadorsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          shopDomain VARCHAR(511) NOT NULL,
          title VARCHAR(511) NOT NULL,
          email VARCHAR(511) NOT NULL,
          instagram VARCHAR(511),
          twitter VARCHAR(511),
          tiktok VARCHAR(511),
          facebook VARCHAR(511),
          youtube VARCHAR(511),
          phone VARCHAR(511) NOT NULL,
          birth VARCHAR(511),
          plushie VARCHAR(511) NOT NULL,
          discovery VARCHAR(511),
          hobbies VARCHAR(511),
          bio VARCHAR(1023),
          createdAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
          isActive INTEGER NOT NULL DEFAULT (FALSE)
        )
      `;

            /* Tell the various CRUD methods that they can execute */
            this.ready = this.__query(query);
        }
    },

    /* Perform a query on the database. Used by the various CRUD methods. */
    __query: function (sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            }); 
        });
    },
};

