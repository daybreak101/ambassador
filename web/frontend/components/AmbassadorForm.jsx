import { useState, useCallback } from "react";
import {
    Banner,
    Card,
    Form,
    FormLayout,
    TextField,
    Button,
    ChoiceList,
    Select,
    Thumbnail,
    Icon,
    Stack,
    TextStyle,
    Layout,
    EmptyState,
} from "@shopify/polaris";
import {
    ContextualSaveBar,
    useNavigate,
    ResourcePicker,
    useAppBridge,
} from "@shopify/app-bridge-react";
import { ImageMajor, AlertMinor } from "@shopify/polaris-icons";
import { useForm, useField, notEmptyString } from "@shopify/react-form";
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

export function AmbassadorForm({ Ambassador: InitialAmbassador }) {
    const [Ambassador, setAmbassador] = useState(InitialAmbassador);
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    const appBridge = useAppBridge();
    const [showResourcePicker, setShowResourcePicker] = useState(false);

    /*
      This is a placeholder function that is triggered when the user hits the "Save" button.
  
      It will be replaced by a different function when the frontend is connected to the backend.
    */
    const onSubmit = useCallback(
        (body) => {
            (async () => {
                const parsedBody = body;
                parsedBody.destination = parsedBody.destination[0];
                const AmbassadorId = Ambassador?.id;
                /* construct the appropriate URL to send the API request to based on whether the code is new or being updated */
                const url = AmbassadorId ? `/api/ambassadors/${AmbassadorId}` : "/api/ambassadors";
                /* a condition to select the appropriate HTTP method: PATCH to update a code or POST to create a new code */
                const method = AmbassadorId ? "PATCH" : "POST";
                /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
                const response = await fetch(url, {
                    method,
                    body: JSON.stringify(parsedBody),
                    headers: { "Content-Type": "application/json" },
                });
                if (response.ok) {
                    makeClean();
                    const Ambassador = await response.json();
                    /* if this is a new code, then save the code and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
                    if (!AmbassadorId) {
                        navigate(`/ambassadors/${Ambassador.id}`);
                        /* if this is a code update, update the code state in this component */
                    } else {
                        setAmbassador(Ambassador);
                    }
                }
            })();
            return { status: "success" };
        },
        [Ambassador, setAmbassador]
    );

    /*
      Sets up the form state with the useForm hook.
  
      Accepts a "fields" object that sets up each individual field with a default value and validation rules.
  
      Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.
  
      Returns helpers to manage form state, as well as component state that is based on form state.
    */
    const {
        fields: { title, },
        dirty,
        reset,
        submitting,
        submit,
        makeClean,
    } = useForm({
        fields: {
            title: useField({
                value: Ambassador?.title || "",
                validates: [notEmptyString("Please name your Ambassador")],
            }),

  
        },
        onSubmit,
    });


    return (
        <Stack vertical>
            <Layout>
                <Layout.Section>
                    <Form>
                        <ContextualSaveBar
                            saveAction={{
                                label: "Save",
                                onAction: submit,
                                loading: submitting,
                                disabled: submitting,
                            }}
                            discardAction={{
                                label: "Discard",
                                onAction: reset,
                                loading: submitting,
                                disabled: submitting,
                            }}
                            visible={dirty}
                            fullWidth
                        />
                        <FormLayout>
                            <Card sectioned title="Title">
                                <TextField
                                    {...title}
                                    label="Title"
                                />
                            </Card>
                        </FormLayout>
                    </Form>
                </Layout.Section>
            </Layout>
        </Stack>
    );
}



