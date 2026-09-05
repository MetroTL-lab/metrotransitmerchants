export interface UploadedDocDetail {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  category: 'cac' | 'address' | 'owner_id' | 'logo_or_catalog';
}

export interface SellerApplicationForm {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessCategory: string;
  monthlyVolume: string;
  operatingCity: string;
  pickupAddress: string;
  websiteOrSocial: string;
  servicesNeeded: string[];
  notes: string;
  registrationNumber: string;
  taxIdNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  documents: {
    cacCertificate: UploadedDocDetail | null;
    proofOfAddress: UploadedDocDetail | null;
    ownerId: UploadedDocDetail | null;
    storeLogoOrCatalog: UploadedDocDetail | null;
  };
}
