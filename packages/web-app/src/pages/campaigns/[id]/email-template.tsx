import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    HStack,
} from "@chakra-ui/react";
import CreateTemplateDropdown from '@/components/campaigns/create-template-dropdown';
import ViewTemplate from '@/components/ViewTemplate';
import { GET_CAMPAIGN } from '.';

type Props = {}

const GET_EMAIL_TEMPLATES = gql`
  query GetEmailTemplates {
    emailTemplates {
      id
      name
      subject
      text_content
      html_content
    }
  }
`;

const SET_TEMPLATES = gql`
  mutation SetTemplate(
    $campaignId: ID!
    $emailTemplateIds: [EmailTemplateIdInput]!
  ) {
    updateCampaignTemplate(id: $campaignId, email_template_ids: $emailTemplateIds)
  }
`;



const GET_ACTIVE_TEMPLATES = gql`
  query GetActiveTemplate($campaignId: ID!) {
    emailTemplatesByCampaignId(campaignId: $campaignId) {
     id
     days_delay
    }
  }
`;

export default function EmailTemplate({ }: Props) {

    const router = useRouter()
    const { id: campaignId } = router.query;


    const { loading, error, data } = useQuery(GET_EMAIL_TEMPLATES);
    const { data: activeEmailTemplatesQueryData } = useQuery(GET_ACTIVE_TEMPLATES,
        { variables: { campaignId } }
    );

    const [setTemplate] = useMutation(SET_TEMPLATES, {
        refetchQueries: [
            {
                query: GET_CAMPAIGN,
                variables: { id: campaignId },
            },
            {
                query: GET_ACTIVE_TEMPLATES,
                variables: { campaignId }
            }
        ]
    });
    const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);

    const [selectedEmailTemplateIds, setSelectedEmailTemplateIds] = useState<{ id: string, days_delay?: number }[]>([{ id: '', days_delay: 0 }]);

    console.log({ selectedEmailTemplateIds })

    /**
     * 
     * 
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await setTemplate({
            variables: {
                campaignId,
                emailTemplateIds: selectedEmailTemplateIds.filter((template) => template.id !== ''),
            },
        });
        if (router.query?.newCampaign) {
            router.push(`/campaigns/add_recipients?campaignId=${campaignId}`)
        } else {
            router.push(`/campaigns/${campaignId}`);
        }
    };


    useEffect(() => {
        if (activeEmailTemplatesQueryData?.emailTemplatesByCampaignId?.length > 0) {
            const cleanTemplates = activeEmailTemplatesQueryData.emailTemplatesByCampaignId.map(({ __typename, ...template }: any) => template)
            setSelectedEmailTemplateIds(cleanTemplates)
        }
    }, [activeEmailTemplatesQueryData]);


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;


    const emailTemplates = data.emailTemplates;



    return (
        <Container maxW="container.md" py={12}>
            {selectedEmailTemplateIds.map(({ days_delay, id }, index) => {
                const selectedTemplate = emailTemplates.find(
                    (template: any) => template.id === id
                );

                return <>

                    {index !== 0 && <Box marginY={4}>
                        <FormLabel>Send After {days_delay} Day(s) from the previous email</FormLabel>

                        <NumberInput
                            min={1}
                            onChange={(e) => {
                                console.log({ e })
                                setSelectedEmailTemplateIds(ids => {
                                    const tempIds = [...ids];
                                    tempIds[index] = { ...tempIds[index], days_delay: parseInt(e) };
                                    return tempIds;
                                })

                            }}
                            value={days_delay} >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </Box>}

                    <Box
                        key={index}
                        padding={4}
                        borderRadius={6}
                        borderColor={'gray.100'}
                        border={'1px'}>



                        <FormControl id="emailTemplate">
                            <HStack justifyContent={'space-between'}>
                                <FormLabel>Email Template</FormLabel>

                                {index !== 0 &&
                                    <Button

                                        size={"xs"}
                                        onClick={() => setSelectedEmailTemplateIds(ids => [...ids].filter((_, i) => i !== index))}
                                        colorScheme="red">
                                        Remove
                                    </Button>
                                }
                            </HStack>
                            <Select
                                placeholder="Select email template"
                                value={id}
                                onChange={(e) => {
                                    if (e.target.value === "create_new") {
                                        setShowNewTemplateForm(true);
                                    } else {
                                        setSelectedEmailTemplateIds(ids => {
                                            const tempIds = [...ids];
                                            tempIds[index] = { ...tempIds[index], id: e.target.value };
                                            return tempIds;
                                        })

                                        setShowNewTemplateForm(false);
                                    }
                                }}
                            >
                                {emailTemplates.map((template: any) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                                <option value="create_new">Create New Email Template</option>
                            </Select>

                            <CreateTemplateDropdown
                                setShow={setShowNewTemplateForm}
                                show={showNewTemplateForm} />

                            {selectedTemplate && (
                                <ViewTemplate template={selectedTemplate} />
                            )}
                        </FormControl>
                    </Box>

                </>
            })}



            <Button
                marginTop={4}
                onClick={handleSubmit}
                colorScheme="blue">
                Save
            </Button>

            <Button
                borderWidth={1}
                color={'gray.500'}
                borderColor={'gray.300'}
                marginTop={4}
                marginLeft={4}
                onClick={() => setSelectedEmailTemplateIds(ids => [...ids, { id: '', days_delay: 1 }])}
                colorScheme="white">
                Add Email Template
            </Button>
        </Container >
    )
}