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
                validates: [notEmptyString("Please name your Ambassador"), ],
            }),
            email: useField({
                value: Ambassador?.email || "",
                validates: [notEmptyString("Please enter an email")],
            }),
            instagram: useField(Ambassador?.instagram || ""),
            twitter: useField(Ambassador?.twitter || ""),
            tiktok: useField(Ambassador?.tiktok || ""),
            facebook: useField(Ambassador?.facebook || ""),
            youtube: useField(Ambassador?.youtube || ""),
            phone: useField({
                value: Ambassador?.phone || "",
                validates: [notEmptyString("Please enter ambassador's phone number")],
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


    //Form values
    const [values, setValues] = useState({});
    //Errors
    const [titleError, setTitleError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [instagramError, setInstagramError] = useState('');
    const [twitterError, setTwitterError] = useState('');
    const [tiktokError, setTiktokError] = useState('');
    const [facebookError, setFacebookError] = useState('');
    const [youtubeError, setYoutubeError] = useState('');

    const validate = (event, name, value) => {
        //A function to validate each input values

        switch (name) {
            case 'title':
                if (!new RegExp(/^[\p{L}'][ \p{L}'-]*[\p{L}]$/u).test(value)) {
                    setTitleError('Enter a valid name')
                } else {
                    setTitleError('');
                }
                break;

            case 'email':
                if (!new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value)) {
                    setEmailError('Enter a valid email address')
                } else {
                    setEmailError('');
                }
                break;
            //TODO: find a way to not include other content. Only profiles (low priority)
            case 'instagram':
                if (!new RegExp(/(?:(?:http | https): \/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/).test(value)) {
                    setInstagramError('Enter a valid Instagram profile URL')
                } else {
                    setInstagramError('');
                }
                break;

            //TODO: find a way to not include other content. Only profiles (low priority)
            case 'twitter':
                if (!new RegExp(/(?:https?:\/\/)?(?:[A-z]+\.)?twitter\.com\//).test(value)) {
                    setTwitterError('Enter a valid Twitter profile URL')
                } else {
                    setTwitterError('');
                }
                break;
            //TODO: fix regex, https//
            case 'tiktok':
                if (!new RegExp(/(?:https?:\/\/)?(?:[A-z]+\.)?tiktok\.com\//).test(value)) {
                    setTiktokError('Enter a valid TikTok user URL')
                } else {
                    setTiktokError('');
                }
                break;
            //TODO: find a way to not include other content. Only profiles (low priority)
            case 'facebook':
                if (!new RegExp(/(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/).test(value)) {
                    setFacebookError('Enter a valid Facebook profile URL')
                } else {
                    setFacebookError('');
                }
                break;
            //TODO: find a way to not include videos or other content. Only channels (low priority)
            case 'youtube':
                if (!new RegExp(/(https?:\/\/)?(www\.)?youtu((\.be)|(be\..{2,5}))\//g).test(value)) {
                    setYoutubeError('Enter a valid youtube channel URL')
                } else {
                    setYoutubeError('');
                }
                break;
            default: break;
        }
    }

    //A method to handle form inputs
    const handleChange = (event) => {
        //To stop default events    
        event.persist();

        let name = event.target.name;
        let val = event.target.value;

        validate(event, name, val);

        //Let's set these values in state
        setValues({
            ...values,
            [name]: val,
        })

    }

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
                                    name="title"
                                    label="Name"
                                    onBlur={handleChange}
                                />
                                { titleError && <h3>{titleError}</h3> }
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
                                    name="instagram"
                                    label="Instagram"
                                    onBlur={handleChange}
                                />
                                {instagramError && <h3>{instagramError}</h3>}
                                <br></br>
                                <TextField
                                    {...twitter}
                                    type="twitter"
                                    name="twitter"
                                    label="Twitter"
                                    onBlur={handleChange}
                                />
                                {twitterError && <h3>{twitterError}</h3>}
                                <br></br>
                                <TextField
                                    {...tiktok}
                                    type="tiktok"
                                    name="tiktok"
                                    label="TikTok"
                                    onBlur={handleChange}
                                />
                                {tiktokError && <h3>{tiktokError}</h3>}
                                <br></br>
                                <TextField
                                    {...facebook}
                                    type="facebook"
                                    name="facebook"
                                    label="Facebook"
                                    onBlur={handleChange}
                                />
                                {facebookError && <h3>{facebookError}</h3>}
                                <br></br>
                                <TextField
                                    {...youtube}
                                    type="youtube"
                                    name="youtube"
                                    label="YouTube"
                                    onBlur={handleChange}
                                />
                                {youtubeError && <h3>{youtubeError}</h3>}
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
                                    name="email"
                                    onBlur={handleChange}
                                />
                                {emailError && <h3>{emailError}</h3>}
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
            </Layout>
        </Stack>
    );
}
