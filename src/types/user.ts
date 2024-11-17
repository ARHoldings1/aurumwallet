export interface User {
  username: string;
  password: string;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED';
  personalInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  kycDocuments?: {
    idCard: string;
    selfie: string;
    submissionDate?: Date;
  };
} 