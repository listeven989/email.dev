import React from "react";
import {
  Box,
  Button,
  FormLabel,
  Textarea,
  Input,
} from "@chakra-ui/react";

type Props = {
  template?: any;
  hideSendTestEmail?: boolean;
};

export default function ViewTemplate({ template, hideSendTestEmail }: Props) {
  return (
    <Box mt={4}>
      <FormLabel>Subject</FormLabel>
      <Input disabled value={template?.subject} readOnly />
      {/* <FormLabel mt={4}>Text Content</FormLabel>
      <Textarea disabled value={template?.text_content} readOnly /> */}
      <FormLabel mt={4}>HTML Content</FormLabel>
      <Textarea value={template?.html_content} readOnly />
      {/* TODO: preview not actually displaying correctly */}
      {/* <Button
          mt={4}
          onClick={() => {
            onPreviewDialogOpen();
            setPreviewType("desktop");
          }}
        >
          Preview on Desktop
        </Button>
        <Button
          mt={4}
          ml={4}
          onClick={() => {
            onPreviewDialogOpen();
            setPreviewType("mobile");
          }}
        >
          Preview on Mobile
        </Button> */}
      {!hideSendTestEmail && (
        <Button
          mt={4}
          onClick={() => {
            window.open("/email-templates/test", "_blank");
          }}
        >
          Send Test Email
        </Button>
      )}
    </Box>
  );
}
