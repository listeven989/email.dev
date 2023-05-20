import {
  Center,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

function Settings() {
  const [storedValue, setStoredValue] = useState("");
  const isClient = typeof window !== "undefined";

  useEffect(() => {
    if (isClient) {
      const value = localStorage.getItem("someKey");
      setStoredValue(value || "");
    }
  }, [isClient]);
  return (
    <Flex
      minHeight="calc(100vh - 60px)"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, #F8FAFC, #708196)"
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
              value={storedValue}
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
