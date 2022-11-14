import { Card, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";
import { AmbassadorForm } from "../../components";

export default function AmbassadorEdit() {
    

    const { id } = useParams();

    const {
        data: Ambassador,
        isLoading,
        isRefetching,
    } = useAppQuery({
        url: `/api/ambassadors/${id}`,
        reactQueryOptions: {
            /* Disable refetching because the CodeForm component ignores changes to its props */
            refetchOnReconnect: false,
        },
    });

    const breadcrumbs = [{ content: "Ambassadors", url: "/" }];

    //loading screen
    if (isLoading || isRefetching) {
        return (
            <Page>
                <TitleBar
                    title="Edit Ambassador"
                    breadcrumbs={breadcrumbs}
                    primaryAction={null}
                />
                <Loading />
       
            </Page>
        );
    }

    //edit ambassador screen
    return (
        <Page>
            <TitleBar
                title="Edit Ambassador"
                breadcrumbs={breadcrumbs}
                primaryAction={null}
            />
            <AmbassadorForm Ambassador={Ambassador} />
        </Page>
    );
}