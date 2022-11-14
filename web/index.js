// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";

import { setupGDPRWebHooks } from "./gdpr.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { AppInstallations } from "./app_installations.js";
import applyAmbassadorApiEndpoints from "./middleware/ambassador-api.js";
import { AmbassadorsDB } from "./ambassadors-db.js";

const USE_ONLINE_TOKENS = false;

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
//const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;
const PROD_INDEX_PATH = `${process.cwd()}/dist/`;

const dbFile = join(process.cwd(), "database.sqlite");


let sessionDb;
if (process.env.NODE_ENV === "test") {
    sessionDb = new Shopify.Session.MemorySessionStorage();
} else {
    sessionDb = new Shopify.Session.SQLiteSessionStorage(dbFile);
    // Rip out the (technically private) SQLite DB from the session storage
    // so we can re-use it for storing QR codes. This is a temporary workaround
    // until we augment the SQLiteSessionStorage implementation to also accept
    // a db instance.
    AmbassadorsDB.db = sessionDb.db;
}
await AmbassadorsDB.init();


Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SCOPES.split(","),
    HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
    HOST_SCHEME: process.env.HOST.split("://")[0],
    API_VERSION: LATEST_API_VERSION,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: sessionDb,
});

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
    root = process.cwd(),
    isProd = process.env.NODE_ENV === "production",
) {
    const app = express();

    app.set("use-online-tokens", USE_ONLINE_TOKENS);
    app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

    applyAuthMiddleware(app);

    // Do not call app.use(express.json()) before processing webhooks with
    // Shopify.Webhooks.Registry.process().
    // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
    // for more details.
    app.post("/api/webhooks", async (req, res) => {
        try {
            await Shopify.Webhooks.Registry.process(req, res);
            console.log(`Webhook processed, returned status code 200`);
        } catch (e) {
            console.log(`Failed to process webhook: ${e.message}`);
            if (!res.headersSent) {
                res.status(500).send(e.message);
            }
        }
    });

  // All endpoints after this point will have access to a request.body
    app.use("/api/*", verifyRequest(app));
  // attribute, as a result of the express.json() middleware
    app.use(express.json());

    applyAmbassadorApiEndpoints(app);

  app.use((req, res, next) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      res.status(500);
      return res.send("No shop provided");
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);

      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      "index.html"
    );

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
