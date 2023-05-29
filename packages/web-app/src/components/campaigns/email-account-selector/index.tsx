"use client";
import React, { Dispatch, SetStateAction } from 'react'
import {
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Container,
    Select,
    useDisclosure,
    Checkbox, CheckboxGroup, Text
} from "@chakra-ui/react";

type Props = {
    emailAccounts: any,
    selectedEmailAccountIds: string[],
    setSelectedEmailAccountIds: Dispatch<SetStateAction<string[]>>

}

export default function EmailAccountSelector({
    emailAccounts,
    selectedEmailAccountIds,
    setSelectedEmailAccountIds
}: Props) {

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>

            <Button w="full" onClick={onOpen}>Select Email Accounts</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Select Email Accounts</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>

                        {emailAccounts.map((account: any) => {
                            const isSelected = selectedEmailAccountIds.includes(account.id)

                            return <Box key={account.id} my={4}>
                                <Checkbox
                                    onChange={(e) => {
                                        console.log("check status change")
                                        if (e.target.checked) {
                                            setSelectedEmailAccountIds(ids => {
                                                return [...ids, account.id]
                                            })
                                        } else {
                                            setSelectedEmailAccountIds(ids => {
                                                return ids.filter(id => id !== account.id)
                                            })
                                        }
                                    }
                                    }
                                    isChecked={isSelected}>{account.email_address}</Checkbox>

                                {isSelected && (
                                    <Box ml={16}>
                                        <Box>
                                        <Text fontSize='xs'><strong>SMTP Host:</strong> {account.smtp_host} </Text>
                                        </Box>
                                        <Box>
                                        <Text fontSize='xs'> <strong>Account ID:</strong> {account.id} </Text>
                                        </Box>
                                        <Box>
                                        <Text fontSize='xs'><strong>Email Address:</strong>{" "}
                                            {account.email_address}
                                            </Text>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        })
                        }
                    </ModalBody>

                </ModalContent>
            </Modal>

        </>
    )
}