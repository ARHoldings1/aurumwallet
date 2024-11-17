import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  Heading,
  Container,
  Input,
  FormControl,
  FormLabel,
  Text,
  useToast
} from '@chakra-ui/react';

function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [walletAddress, setWalletAddress] = useState('');

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    
    // Simple Bitcoin address validation (starts with 1, 3, or bc1)
    const isBitcoinAddress = /^(1|3|bc1)/.test(walletAddress);
    
    // Store the address type in session storage for the transfer screen
    sessionStorage.setItem('walletType', isBitcoinAddress ? 'bitcoin' : 'other');
    sessionStorage.setItem('destinationAddress', walletAddress);

    if (isBitcoinAddress) {
      toast({
        title: "Bitcoin address detected",
        description: "Proceeding to transfer screen",
        status: "success",
        duration: 2000,
      });
    } else {
      toast({
        title: "Non-Bitcoin address detected",
        description: "Bridge functionality not available",
        status: "warning",
        duration: 2000,
      });
    }
    
    navigate('/transfer');
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading>Your Dashboard</Heading>
        <Box w="100%" p={8} borderWidth={1} borderRadius={8}>
          <form onSubmit={handleAddressSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Enter Destination Wallet Address</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </FormControl>
              <Text fontSize="sm" color="gray.500">
                Enter any wallet address to simulate transfer
              </Text>
              <Button type="submit" colorScheme="blue" width="100%">
                Proceed to Transfer
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
}

export default Dashboard; 