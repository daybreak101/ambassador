import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { AmbassadorForm } from "../../components";
export default function ManageCode() {
    const breadcrumbs = [{ content: "Ambassadors", url: "/" }];

    //new ambassador screen
    return (
        <Page>
            <TitleBar
                title="Create a new Ambassador"
                breadcrumbs={breadcrumbs}
                primaryAction={null}
            />
            <AmbassadorForm />
        </Page>
    );
}