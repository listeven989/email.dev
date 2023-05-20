// components/Navbar.tsx
import React from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useDisclosure,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import AuthLink from "./AuthLink";

const Links = [
  //   { name: "Dashboard", href: "/dashboard" },
  { name: "Campaigns", href: "/campaigns" },
  { name: "New Campaign", href: "/campaigns/new" },
  { name: "Email Accounts", href: "/email-accounts" },
  { name: "Email Tester", href: "/email-templates/test" },
  { name: "Email Templates", href: "/email-templates" },
  { name: "Settings", href: "/settings" },
  //   { name: "Features", href: "/features" },
  //   { name: "Pricing", href: "/pricing" },
];

const NavLink = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  const router = useRouter();
  const isActive = router.pathname.startsWith(href);

  return (
    <Link
      href={href}
      position="relative"
      display="inline-block"
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: useColorModeValue("gray.200", "gray.700"),
      }}
      _after={{
        content: isActive ? '""' : "none",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "2px",
        backgroundColor: "blue.500",
        borderRadius: "2px",
      }}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={<FontAwesomeIcon icon={isOpen ? faTimes : faBars} />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={"center"}>
          <Box>Logo</Box>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {Links.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={"center"}>
          <AuthLink />
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4}>
          <Stack as={"nav"} spacing={4}>
            {Links.map((link) => {
              // @ts-ignore
              return <NavLink key={link}>{link}</NavLink>;
            })}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navbar;
