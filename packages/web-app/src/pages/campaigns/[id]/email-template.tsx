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
    Textarea,
    VStack,
    Radio,
    RadioGroup,
    Stack,
    Input,
    Text,
    Collapse,
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

const SET_TEMPLATE = gql`
  mutation SetTemplate(
    $campaignId: ID!
    $emailTemplateId: ID!
  ) {
    updateCampaignTemplate(id: $campaignId, email_template_id: $emailTemplateId) {
      id
    }
  }
`;



const GET_ACTIVE_TEMPLATE = gql`
  query GetActiveTemplate($campaignId: ID!) {
    emailTemplateByCampaignId(campaignId: $campaignId) {
     id
    }
  }
`;

export default function EmailTemplate({ }: Props) {

    const router = useRouter()
    const { id: campaignId } = router.query;

    const { loading, error, data } = useQuery(GET_EMAIL_TEMPLATES);
    const { data: activeEmailTemplateQueryData } = useQuery(GET_ACTIVE_TEMPLATE,
        { variables: { campaignId } }
    );

    const [setTemplate] = useMutation(SET_TEMPLATE, {
        refetchQueries: [
            {
                query: GET_CAMPAIGN,
                variables: { id: campaignId },
            }
        ]
    });
    const [emailTemplateId, setEmailTemplateId] = useState("");
    const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);



    /**
     * 
     * 
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await setTemplate({
            variables: {
                campaignId,
                emailTemplateId,
            },
        });
        router.push(`/campaigns/${campaignId}`);
    };


    useEffect(() => {
        if (activeEmailTemplateQueryData && activeEmailTemplateQueryData.emailTemplateByCampaignId) {
            setEmailTemplateId(activeEmailTemplateQueryData.emailTemplateByCampaignId.id);
        }
    }, [activeEmailTemplateQueryData]);


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;


    const emailTemplates = data.emailTemplates;

    const selectedTemplate = emailTemplates.find(
        (template: any) => template.id === emailTemplateId
    );

    return (
        <Container maxW="container.md" py={12}>
            <VStack as="form" onSubmit={handleSubmit} spacing={6} align="start">
                <FormControl id="emailTemplate">
                    <FormLabel>Email Template</FormLabel>
                    <Select
                        placeholder="Select email template"
                        value={emailTemplateId}
                        onChange={(e) => {
                            if (e.target.value === "create_new") {
                                setShowNewTemplateForm(true);
                            } else {
                                setEmailTemplateId(e.target.value);
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
                <Button type="submit" colorScheme="blue">
                    Save
                </Button>
            </VStack>
        </Container>
    )
}