import { Shopify } from "@shopify/shopify-api";
import { AmbassadorsDB } from "../ambassadors-db.js";
import {
    getAmbassadorOr404,
    getShopUrlFromSession,
    parseAmbassadorBody,
    formatAmbassadorResponse,
} from "../helpers/ambassadors.js";

export default function applyAmbassadorApiEndpoints(app) {

    app.post("/api/ambassadors", async (req, res) => {
        try {
                     const id = await AmbassadorsDB.create({
                           ...(await parseAmbassadorBody(req)),
           
                       
            shopDomain: await getShopUrlFromSession(req, res),
        });
           const response = await formatAmbassadorResponse(req, res, [
               await AmbassadorsDB.read(id),
            ]);
           res.status(201).send(response[0]);
        } catch (error) {
           res.status(500).send(error.message);
        }
    });

    app.patch("/api/ambassadors/:id", async (req, res) => {
        const ambassador = await getAmbassadorOr404(req, res);

        if (ambassador) {
            try {
                await AmbassadorsDB.update(req.params.id, await parseAmbassadorBody(req));
                const response = await formatAmbassadorResponse(req, res, [
                    await AmbassadorsDB.read(req.params.id),
                ]);
                res.status(200).send(response[0]);
            } catch (error) {
                res.status(500).send(error.message);
            }
        }
    });

   app.get("/api/ambassadors", async (req, res) => {
        try {
            const rawCodeData = await AmbassadorsDB.list(
                await getShopUrlFromSession(req, res)
            );

            const response = await formatAmbassadorResponse(req, res, rawCodeData);
            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    });

    app.get("/api/ambassadors/:id", async (req, res) => {
        const ambassador = await getAmbassadorOr404(req, res);

        if (ambassador) {
            const formattedAmbassador = await formatAmbassadorResponse(req, res, [ambassador]);
            res.status(200).send(formattedAmbassador[0]);
        }
    });

    app.delete("/api/ambassadors/:id", async (req, res) => {
        const ambassador = await getAmbassadorOr404(req, res);

        if (ambassador) {
            await AmbassadorsDB.delete(req.params.id);
            res.status(200).send();
        }
    });
}
