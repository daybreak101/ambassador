import { Shopify } from "@shopify/shopify-api";
import { AmbassadorsDB } from "../ambassadors-db.js";

export async function getAmbassadorOr404(req, res, checkDomain = true) {
    const id = req.params.id;
    if (!id.match(/[0-9]+/)) {
        res.status(404).send();
    }


    try {
        const response = await AmbassadorsDB.read(id);
        if (
            response === undefined ||
            (checkDomain &&
                (await getShopUrlFromSession(req, res)) !== response.shopDomain)
        ) {
            res.status(404).send();
        } else {
            return response;
        }
    } catch (error) {
        //was commented out
        res.status(500).send(error.message);
    }

    return undefined;
}

export async function getShopUrlFromSession(req, res) {
    const session = await Shopify.Utils.loadCurrentSession(req, res, false);
    return `https://${session.shop}`;
}

export async function parseAmbassadorBody(req, res) {
    return {
        title: req.body.title,
    };

}export async function formatAmbassadorResponse(req, res, rawCodeData) {
    const ids = [];
    rawCodeData.forEach(() => {});

    /* Instantiate a new GraphQL client to query the Shopify GraphQL Admin API */

    const session = await Shopify.Utils.loadCurrentSession(req, res, false);
    const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);
  
    const formattedData = rawCodeData.map((ambassador) => {

        /*
          Merge the data from the app's database with the data queried from the Shopify GraphQL Admin API
        */
        const formattedAmbassador = {
            ...ambassador,
        };


        return formattedAmbassador;
    });

    return formattedData;
}
