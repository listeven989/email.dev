import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
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
import Papa from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faRecycle } from "@fortawesome/free-solid-svg-icons";

type Props = {
    setEmailAddresses: Dispatch<SetStateAction<string>>
    emailAddresses: string
}

export default function EmailRecipientsInput({ setEmailAddresses, emailAddresses }: Props) {

    const [inputType, setInputType] = useState("text");
    const [parsedEmails, setParsedEmails] = useState<string[]>([]);
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    const emails = results.data.map((row: any) => row.Email).filter((email: string) => {
                        if (email && email.includes("@")) {
                            return email;
                        }
                        return null;
                    });
                    setEmailAddresses(emails.join("\n"));
                    setParsedEmails(emails);
                },
                error: (error) => {
                    alert(`Error parsing CSV file: ${error.message}`);
                },
            });
        }
    };

    return (
        <FormControl id="emailAddresses">
            <FormLabel>Email Recipients</FormLabel>
            <RadioGroup
                value={inputType}
                onChange={(value) => setInputType(value as string)}
            >
                <Stack direction="row">
                    <Radio value="text">Text</Radio>
                    <Radio value="csv">CSV</Radio>
                </Stack>
            </RadioGroup>
            {inputType === "text" ? (
                <Textarea
                    style={{ marginTop: "1rem" }}
                    placeholder="Enter email addresses, one per line"
                    value={emailAddresses}
                    onChange={(e) => setEmailAddresses(e.target.value)}
                />
            ) : (
                <>
                    <Input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        display="none"
                    />
                    {fileName && (
                        <Text mt={2} fontSize="sm">
                            File: {fileName}
                        </Text>
                    )}
                    {fileName && (
                        <Textarea
                            mt={4}
                            value={parsedEmails.join("\n")}
                            readOnly
                            maxHeight="200px"
                            overflowY="scroll"
                        />
                    )}
                    <Button
                        style={{ marginTop: "1rem" }}
                        leftIcon={
                            fileName ? (
                                <FontAwesomeIcon icon={faRecycle} />
                            ) : (
                                <FontAwesomeIcon icon={faUpload} />
                            )
                        }
                        // colorScheme="blue"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {fileName ? "Pick Another CSV" : "Upload CSV"}
                    </Button>
                </>
            )}
        </FormControl>
    )
}