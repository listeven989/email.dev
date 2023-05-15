import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Text,
    Flex,
    Center,
  } from '@chakra-ui/react';
  import { useState, ChangeEvent, FormEvent } from 'react';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password }),
      });

      if (response.ok) {
        const { user } = await response.json();
        console.log('User created successfully:', user);
      } else {
        const { error } = await response.json();
        setError(error);
      }
    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <Flex minHeight="100vh" alignItems="center" justifyContent="center">
      <Center
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        boxShadow="md"
        borderRadius="md"
        p={8}
        width="100%"
        maxWidth="400px"
      >
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">
            Signup
          </Text>
          <FormControl id="email" isRequired>
            <FormLabel>Email:</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password:</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
          </FormControl>
          <Button type="submit" colorScheme="blue">
            Signup
          </Button>
        </VStack>
        {error && (
          <Text color="red.500" textAlign="center" marginTop={4}>
            Error: {error}
          </Text>
        )}
      </Center>
    </Flex>
  );
}

export default Signup;