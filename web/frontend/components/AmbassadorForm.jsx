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

//form is to create/edit an ambassador manually
export function AmbassadorForm({ Ambassador: InitialAmbassador }) {
    const [Ambassador, setAmbassador] = useState(InitialAmbassador);
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    const appBridge = useAppBridge();

    /*
      This is a placeholder function that is triggered when the user hits the "Save" button.
  
      It will be replaced by a different function when the frontend is connected to the backend.
    */
    const onSubmit = useCallback(
        (body) => {
            (async () => {
                //res.status(404).send();
     
                const parsedBody = body;

                //navigate('/ambassadors');
               // parsedBody.destination = parsedBody.destination[0];
                const AmbassadorId = Ambassador?.id

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
                else {
                    //navigate('/ambassadors/');
                }
            })();
            return { status: "success" };
        }, [Ambassador, setAmbassador]
    );

    /*
      Sets up the form state with the useForm hook.
  
      Accepts a "fields" object that sets up each individual field with a default value and validation rules.
  
      Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.
  
      Returns helpers to manage form state, as well as component state that is based on form state.
    */
    const {
        fields: { title, email, instagram, twitter, tiktok, facebook, youtube, phone, birth, plushie, discovery, hobbies, bio },
        dirty,
        reset,
        value,
        submitting,
        submit,
        makeClean,
    } = useForm({
        fields: {
            title: useField({
                value: Ambassador?.title || "",
                validates: [
                    notEmptyString("Please name your Ambassador"),
                    (title) => {
                        if (!new RegExp(/^[\p{L}'][ \p{L}'-]*[\p{L}]$/u).test(title)) {
                            return 'Name cannot have special characters!'
                        }
                    }
                ],
            }),
            email: useField({
                value: Ambassador?.email || "",
                validates: [
                    notEmptyString("Please enter an email"),
                    (email) => {
                        if (!new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email)) {
                            return 'Email is not in correct format.'
                        }
                    }
                ],
            }),
            instagram: useField({
                value: Ambassador?.instagram || "",
                validates: [
                    (instagram) => {
                        if (instagram.length == 0) {
                            return ''
                        }
                        else if (!new RegExp(/(?:(?:http | https): \/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/).test(instagram)) {
                            return 'Please enter a valid Instagram profile URL or leave it empty.'
                        }
                    }
                ],
            }),
            twitter: useField({
                value: Ambassador?.twitter || "",
                validates: [
                    (twitter) => {
                        if (twitter.length == 0) {
                            return ''
                        }
                        else if (!new RegExp(/(?:https?:\/\/)?(?:[A-z]+\.)?twitter\.com\//).test(twitter)) {
                            return 'Please enter a valid Twitter profile URL or leave it empty.'
                        }
                    }
                ],
            }),
            tiktok: useField({
                value: Ambassador?.tiktok || "",
                validates: [
                    (tiktok) => {
                        if (tiktok.length == 0) {
                            return ''
                        }
                        else if (!new RegExp(/(?:https?:\/\/)?(?:[A-z]+\.)?tiktok\.com\//).test(tiktok)) {
                            return 'Please enter a valid TikTok profile URL or leave it empty.'
                        }
                    }
                ],
            }),
            facebook: useField({
                value: Ambassador?.facebook || "",
                validates: [
                    (facebook) => {
                        if (facebook.length == 0) {
                            return ''
                        }
                        else if (!new RegExp(/(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/).test(facebook)) {
                            return 'Please enter a valid Facebook profile URL or leave it empty.'
                        }
                    }
                ],
            }),
            youtube: useField({
                value: Ambassador?.youtube || "",
                validates: [
                    (youtube) => {
                        if (youtube.length == 0) {
                            return ''
                        }
                        else if (!new RegExp(/(https?:\/\/)?(www\.)?youtu((\.be)|(be\..{2,5}))\//g).test(youtube)) {
                            return 'Please enter a valid YouTube profile URL or leave it empty.'
                        }
                    }
                ],
            }),
            phone: useField({
                value: Ambassador?.phone || "",
                validates: [
                    notEmptyString("Please name your Ambassador"),
                    (phone) => {
                        if (!new RegExp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im).test(phone)) {
                            return 'Phone number can only contain numbers.'
                        }
                    }
                ],
            }),
            birth: useField(Ambassador?.birth || ""),
            plushie: useField({
                value: Ambassador?.plushie || "",
                validates: [notEmptyString("Please enter ambassador's favorite plushie")],
            }),
            discovery: useField(Ambassador?.discovery || ""),
            hobbies: useField(Ambassador?.hobbies || ""),
            bio: useField(Ambassador?.bio || ""),
        },
        onSubmit,
    });

    const [isDeleting, setIsDeleting] = useState(false);
    const deleteAmbassador = useCallback(async () => {
        reset();
        setIsDeleting(true);
        const response = await fetch(`/api/ambassadors/${Ambassador.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            navigate(`/`);
        }
    }, [Ambassador]);

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
                            <Card sectioned title="Basic Info">
                                <TextField
                                    {...title}
                                    type="title"
                                    label="Name"
                                />
                                <br></br>
                                <TextField
                                    {...birth}
                                    type="date"
                                    label="Date Of Birth"
                                />
                                <br></br>
                            </Card>

                            <Card sectioned title="Social Media Links">
                                <TextField
                                    {...instagram}
                                    type="instagram"
                                    label="Instagram"
                                />
                                <br></br>
                                <TextField
                                    {...twitter}
                                    type="twitter"
                                    label="Twitter"
                                />
                                <br></br>
                                <TextField
                                    {...tiktok}
                                    type="tiktok"
                                    label="TikTok"
                                />
                                <br></br>
                                <TextField
                                    {...facebook}
                                    type="facebook"
                                    label="Facebook"
                                />
                                <br></br>
                                <TextField
                                    {...youtube}
                                    type="youtube"
                                    label="YouTube"
                                />
                                <br></br>
                            </Card>
                            <Card sectioned title="Contact Info">
                                <TextField
                                    {...phone}
                                    label="Phone Number"
                                />
                                <br></br>
                                <TextField
                                    {...email}
                                    label="Email"
                                    type="email"
                                />
                                <br></br>
                            </Card>   
                            <Card sectioned title="Shore Buddies">
                                <TextField
                                    {...plushie}
                                    label="Favorite Plushie"
                                />
                                <br></br>
                                <TextField
                                    {...discovery}
                                    label="How did they discover Shore Buddies?"
                                />
                                <br></br>
                            </Card>
                            <Card sectioned title="About Ambassador">
                                <TextField
                                    {...bio}
                                    label="Bio"
                                    multiline={true}
                                />
                                <br></br>
                                <TextField
                                    {...hobbies}
                                    label="Hobbies"
                                    multiline={true}                                  
                                />
                                <br></br>
                            </Card>
                        </FormLayout>
                    </Form>
                </Layout.Section>
                <Layout.Section>
                    {Ambassador?.id && (
                        <Button
                            outline
                            destructive
                            onClick={deleteAmbassador}
                            loading={isDeleting}
                        >
                            Delete Ambassador
                        </Button>
                    )}
                </Layout.Section>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
            </Layout>
        </Stack>
    );
}
