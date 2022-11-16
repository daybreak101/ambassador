import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import {
    Button,
    Card,
    EmptyState,
    Layout,
    Page,
    SkeletonBodyText,
    Heading,

} from "@shopify/polaris";
import { AmbassadorIndex } from "../components";
import { useAppQuery } from "../hooks";

export default function HomePage() {
    /*
      Add an App Bridge useNavigate hook to set up the navigate function.
      This function modifies the top-level browser URL so that you can
      navigate within the embedded app and keep the browser in sync on reload.
    */
    const navigate = useNavigate();

    /*
      These are mock values. Setting these values lets you preview the loading markup and the empty state.
    */
    /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
    const {
        data: Ambassadors,
        isLoading,

        /*
          react-query provides stale-while-revalidate caching.
          By passing isRefetching to Index Tables we can show stale data and a loading state.
          Once the query refetches, IndexTable updates and the loading state is removed.
          This ensures a performant UX.
        */
        isRefetching,
    } = useAppQuery({
        url: "/api/ambassadors",
    });

    //const Ambassadors = [];
    /* Set the codes to use in the list */
    const ambassadorsMarkup = Ambassadors?.length ? (
        <AmbassadorIndex Ambassadors={Ambassadors} loading={isRefetching} />
    ) : null;

    /* loadingMarkup uses the loading component from AppBridge and components from Polaris  */
    const loadingMarkup = isLoading ? (
        <Card sectioned>
            <Loading />
            <SkeletonBodyText />
        </Card>
    ) : null;

    const activeAmbassadors = useCallback(async () => {
        navigate("/");
    })

    /* Use Polaris Card and EmptyState components to define the contents of the empty state */
    const emptyStateMarkup =
        !isLoading && !Ambassadors?.length ? (
            <Card sectioned>
                <EmptyState
                    heading="View Pending Ambassadors"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                    <p>
                        There are currently no pending ambassador requests!
                    </p>
                </EmptyState>
            </Card>
        ) : null;

    /*
      Use Polaris Page and TitleBar components to create the page layout,
      and include the empty state contents set above.
    */
    return (
        <Page fullWidth={!!ambassadorsMarkup}>
            <TitleBar
                title="Ambassadors"
            />
            <Layout>
                <Layout.Section>
                    <Button
                        size="large"
                        color="green"
                        onClick={activeAmbassadors}
                    >
                        View Active Ambassadors
                    </Button>
                </Layout.Section>

                <Layout.Section>
                    <Heading>Pending Ambassadors</Heading>
                    <br></br>
                    {loadingMarkup}
                    {ambassadorsMarkup}
                    {emptyStateMarkup}
                </Layout.Section>
            </Layout>
        </Page>
    );
}