import React, { Dispatch, SetStateAction, useState } from 'react'
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
import { gql, useMutation } from '@apollo/client';
import { GET_EMAIL_TEMPLATES } from '@/pages/campaigns/add_recipients';

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
}


const CREATE_EMAIL_TEMPLATE = gql`
  mutation CreateEmailTemplate(
    $name: String!
    $subject: String!
    $textContent: String!
    $htmlContent: String!
  ) {
    createEmailTemplate(
      name: $name
      subject: $subject
      text_content: $textContent
      html_content: $htmlContent
    ) {
      id
      name
    }
  }
`;

export default function CreateTemplateDropdown({ show, setShow }: Props) {
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateSubject, setNewTemplateSubject] = useState("");
    const [newTextContent, setNewTextContent] = useState("");
    const [newHtmlContent, setNewHtmlContent] = useState("");


    const handleCreateNewTemplate = async () => {
        await createEmailTemplate({
            variables: {
                name: newTemplateName,
                subject: newTemplateSubject,
                textContent: newTextContent,
                htmlContent: newHtmlContent,
            },
        });
        setShow(false);
        setNewTemplateName("");
        setNewTemplateSubject("");
        setNewTextContent("");
        setNewHtmlContent("");
    };


    const [createEmailTemplate, { loading }] = useMutation(CREATE_EMAIL_TEMPLATE, {
        refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
    });


    return (
        <Collapse in={show} animateOpacity>
            <VStack mt={4} spacing={4}>
                <FormControl id="newTemplateName">
                    <FormLabel>New Template Name</FormLabel>
                    <Input
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                </FormControl>
                <FormControl id="newTemplateSubject">
                    <FormLabel>New Template Subject</FormLabel>
                    <Input
                        value={newTemplateSubject}
                        onChange={(e) => setNewTemplateSubject(e.target.value)}
                    />
                </FormControl>
                {/* <FormControl id="newTextContent">
                    <FormLabel>New Text Content</FormLabel>
                    <Textarea
                        value={newTextContent}
                        onChange={(e) => setNewTextContent(e.target.value)}
                    />
                </FormControl> */}
                <FormControl id="newHtmlContent">
                    <FormLabel>New HTML Content</FormLabel>
                    <Textarea
                        value={newHtmlContent}
                        onChange={(e) => setNewHtmlContent(e.target.value)}
                    />
                </FormControl>
                {loading ? <Text>Creating Template...</Text>
                    :
                    <Button onClick={handleCreateNewTemplate}>
                        Save New Template
                    </Button>
                }
            </VStack>
        </Collapse>
    )
}