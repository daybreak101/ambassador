import { useNavigate } from "@shopify/app-bridge-react";
import {
    Card,
    Icon,
    IndexTable,
    Stack,
    TextStyle,
    Thumbnail,
    UnstyledLink,
} from "@shopify/polaris";

import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
import { useMedia } from "@shopify/react-hooks";
import dayjs from "dayjs";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({
    id,
    title,
    createdAt,
    navigate,
}) {
    return (
        <UnstyledLink onClick={() => navigate(`/ambassadors/${id}`)}>
            <div
                style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}
            >
                <Stack>
                    <Stack.Item fill>
                        <Stack vertical={true}>
                            <Stack.Item>
                                <p>
                                    <TextStyle variation="strong">
                                        { id }
                                        {truncate(title, 35)}
                                        { createdAt }

                                    </TextStyle>
                                </p>
                            </Stack.Item>
                        </Stack>
                    </Stack.Item>
                </Stack>
            </div>
        </UnstyledLink>
    );
}


export function AmbassadorIndex({ Ambassadors, loading }) {
    const navigate = useNavigate();

    /* Check if screen is small */
    const isSmallScreen = useMedia("(max-width: 640px)");

    /* Map over QRCodes for small screen */
    const smallScreenMarkup = Ambassadors.map((Ambassador) => (
        <SmallScreenCard key={Ambassador.id} navigate={navigate} {...Ambassador} />
    ));

    const resourceName = {
        singular: "Ambassador",
        plural: "Ambassadors",
    };

    //display for each row
    const rowMarkup = Ambassadors.map(
        ({ id, title, createdAt }, index) => {
           
            return (

                <IndexTable.Row
                    id={id}
                    key={id}
                    position={index}
                    onClick={() => {
                        navigate(`/ambassadors/${id}`);
                    }}
                >
                    <IndexTable.Cell>{id}</IndexTable.Cell>
                    <IndexTable.Cell>
                        <UnstyledLink data-primary-link url={`/ambassadors/${id}`}>
                            {truncate(title, 25)}
                        </UnstyledLink>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{createdAt}</IndexTable.Cell>

                    
                </IndexTable.Row>
            );
        }
    );

    /* A layout for small screens, built using Polaris components */
    return (
        <Card>
            {isSmallScreen ? (
                smallScreenMarkup
            ) : (
                <IndexTable
                    resourceName={resourceName}
                    itemCount={Ambassadors.length}
                        headings={[
                            { title: "ID#" },
                            { title: "Name" },
                            { title: "Joined" },
                    ]}
                    selectable={false}
                    loading={loading}
                >
                    {rowMarkup}
                </IndexTable>
            )}
        </Card>
    );
}
/* A function to truncate long strings */
function truncate(str, n) {
    return str.length > n ? str.substr(0, n - 1) + "…" : str;
}