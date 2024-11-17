import { useState, useEffect } from 'react';
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
  Progress,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';

function TransferScreen() {
  const [amount, setAmount] = useState('');
  const [gasFee, setGasFee] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const toast = useToast();
  
  const walletType = sessionStorage.getItem('walletType');
  const destinationAddress = sessionStorage.getItem('destinationAddress');

  useEffect(() => {
    // Simulate random gas fee calculation
    setGasFee((Math.random() * 0.0001).toFixed(8));
  }, []);

  const handleTransfer = (e) => {
    e.preventDefault();
    setIsTransferring(true);

    // Simulate transfer progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setTransferProgress(progress);
      
      if (progress === 100) {
        clearInterval(interval);
        toast({
          title: "Transfer Complete",
          description: `${amount} BTC has been simulated to transfer to ${destinationAddress}`,
          status: "success",
          duration: 5000,
        });
        setIsTransferring(false);
      }
    }, 1000);
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading>Transfer Bitcoin</Heading>
        
        {walletType !== 'bitcoin' && (
          <Alert status="warning">
            <AlertIcon />
            Bridge not available for this wallet type. Transfer simulation not possible.
          </Alert>
        )}

        <Box w="100%" p={8} borderWidth={1} borderRadius={8}>
          <VStack spacing={4}>
            <Text>Destination: {destinationAddress}</Text>
            <FormControl isRequired>
              <FormLabel>Amount (BTC)</FormLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={walletType !== 'bitcoin' || isTransferring}
              />
            </FormControl>
            
            <Text>Estimated Gas Fee: {gasFee} BTC</Text>
            
            {isTransferring && (
              <Box w="100%">
                <Text mb={2}>Transfer Progress</Text>
                <Progress value={transferProgress} hasStripe isAnimated />
                <Text mt={2}>{transferProgress}% Complete</Text>
              </Box>
            )}

            <Button
              onClick={handleTransfer}
              colorScheme="blue"
              width="100%"
              disabled={walletType !== 'bitcoin' || isTransferring || !amount}
            >
              {isTransferring ? 'Transferring...' : 'Start Transfer'}
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

export default TransferScreen; 