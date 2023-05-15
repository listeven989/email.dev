import {
  Center,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";

function Settings() {
  return (
    <Flex
      minHeight="calc(100vh - 60px)"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, teal.500, green.500)"
    >
      <Center
        bg="white"
        boxShadow="2xl"
        borderRadius="xl"
        p={8}
        width="100%"
        maxWidth="500px"
      >
        <VStack spacing={6} width="69%">
          <Text fontSize="3xl" fontWeight="bold" color="teal.500">
            Account Settings
          </Text>
          <FormControl id="email" isDisabled>
            <FormLabel>Email:</FormLabel>
            <Input
              type="email"
              value={localStorage.getItem("userEmail") || ""}
            />
          </FormControl>
          <FormControl id="userId" isDisabled>
            <FormLabel>User ID:</FormLabel>
            <Input type="text" value={""} />
          </FormControl>
          <Text fontSize="sm">
            Need help?{" "}
            <Text as="span" color="teal.500">
              Contact Steven
            </Text>
          </Text>
        </VStack>
      </Center>
    </Flex>
  );
}

export default Settings;
