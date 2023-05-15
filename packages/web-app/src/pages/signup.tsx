import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  Link,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useState, ChangeEvent, FormEvent } from "react";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", email, password }),
      });

      if (response.ok) {
        const { user, token } = await response.json(); // Add token to the response
        console.log("User created successfully:", user);
        localStorage.setItem("authToken", token); // Store the token

        // Redirect to home page
        window.location.href = "/campaigns";
      } else {
        const { error } = await response.json();
        setError(error);
      }
    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <Flex
      minHeight="calc(100vh - 60px)"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, teal.500, green.500)"
    >
      <Center
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        boxShadow="2xl"
        borderRadius="xl"
        p={8}
        width="100%"
        maxWidth="500px"
      >
        <VStack spacing={6} width="69%">
          <Text fontSize="3xl" fontWeight="bold" color="teal.500">
            Signup
          </Text>
          <FormControl id="email" isRequired>
            <FormLabel>Email:</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FontAwesomeIcon icon={faEnvelope} color="gray" />
              </InputLeftElement>
              <Input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                width="100%"
                maxWidth="300px"
                pl="40px"
              />
            </InputGroup>
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password:</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FontAwesomeIcon icon={faLock} color="gray" />
              </InputLeftElement>
              <Input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                width="100%"
                maxWidth="300px"
                pl="40px"
              />
            </InputGroup>
          </FormControl>
          <Button type="submit" colorScheme="teal" size="md">
            Signup
          </Button>
          <Text fontSize="sm">
            Already have an account?{" "}
            <Link href="/login">
              <Text as="span" color="teal.500" textDecoration="underline">
                Login
              </Text>
            </Link>
          </Text>
        {error && (
          <Text color="red.500" textAlign="center" marginTop={4}>
            Error: {error}
          </Text>
        )}
        </VStack>
      </Center>
    </Flex>
  );
}

export default Signup;
