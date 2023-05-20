import Link from "next/link";
import { useQuery, gql, useMutation } from "@apollo/client";
import {
  Box,
  Heading,
  VStack,
  Button,
  Text,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
} from "@chakra-ui/react";

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

const ARCHIVE_EMAIL_TEMPLATE = gql`
  mutation ArchiveEmailTemplate($id: ID!) {
    archiveEmailTemplate(id: $id) {
      id
    }
  }
`;

const EmailTemplates = () => {
  const { loading, error, data } = useQuery(GET_EMAIL_TEMPLATES);
  const [archiveEmailTemplateMutation] = useMutation(ARCHIVE_EMAIL_TEMPLATE);

  const archiveEmailTemplate = async (templateId: string) => {
    await archiveEmailTemplateMutation({
      variables: { id: templateId },
      refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!data) return null;

  const emailTemplates = data.emailTemplates;

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={6} align="start" w="100%">
        <Flex justifyContent="space-between" w="100%">
          <Heading as="h1" size="lg">
            Email Templates
          </Heading>
          <Link href="/email-templates/new">
            <Button
              as="a"
              colorScheme="blue"
              size="sm"
              fontWeight="bold"
              borderRadius="full"
              px={6}
              _hover={{ bg: "blue.600" }}
            >
              Create New Template
            </Button>
          </Link>
        </Flex>
        <Box w="100%">
          <Table
            variant="striped"
            colorScheme="gray"
            borderWidth="1px"
            borderRadius="md"
            overflow="hidden"
          >
            <Thead bg="gray.500">
              <Tr>
                <Th color="white" fontWeight="bold">
                  Name
                </Th>
                <Th color="white" fontWeight="bold">
                  Subject
                </Th>
                <Th color="white" fontWeight="bold">
                  HTML Content
                </Th>
                <Th color="white" fontWeight="bold">
                  Quick Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {emailTemplates.map((template: any) => (
                <Tr key={template.id}>
                  <Td>
                    <Text
                      as="a"
                      color="blue.500"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {template.name}
                    </Text>
                  </Td>
                  <Td>{template.subject}</Td>
                  <Td>
                    <Box
                      maxH="100px"
                      overflowY="auto"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                    >
                      {template.html_content}
                    </Box>
                  </Td>
                  <Td>
                    <Button
                      size="xs"
                      colorScheme="gray"
                      onClick={() => archiveEmailTemplate(template.id)}
                    >
                      Archive
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default EmailTemplates;
