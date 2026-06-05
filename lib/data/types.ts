export type DocumentType = 'tf' | 'bail' | 'deliberation';
export type VerificationStatus = 'non_verifie' | 'a_verifier' | 'verifie';
export type SaleStatus = 'disponible' | 'en_cours_de_vente' | 'vendu';
export type LeadStatus = 'nouveau' | 'qualifie' | 'en_contact' | 'converti' | 'perdu';
export type LeadSource = 'whatsapp' | 'site' | 'autre';

export interface Land {
  id: string;
  sellerId: string;
  title: string;
  zone: string;
  surface?: number;
  priceFcfa: number;
  documentType: DocumentType;
  verificationStatus: VerificationStatus;
  verifiedByNotaire?: string;
  verifiedAt?: string;
  registryChecked?: string;
  saleStatus: SaleStatus;
  photos: string[];
  documents: string[];
  description?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  sellerId: string;
  name?: string;
  phone?: string;
  budgetFcfa?: number;
  desiredZone?: string;
  desiredDocumentType?: DocumentType;
  status: LeadStatus;
  source: LeadSource;
  interestedLandId?: string;
  createdAt: string;
}

export interface Message {
  role: 'user' | 'ai' | 'seller';
  text: string;
  at: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  messages: Message[];
}

export interface Seller {
  id: string;
  businessName: string;
  phone: string;
  email: string;
  subscriptionStatus: 'trial' | 'active' | 'past_due';
  createdAt: string;
}

export interface Stats {
  landsTotal: number;
  landsAvailable: number;
  landsInSale: number;
  landsSold: number;
  landsVerified: number;
  landsToVerify: number;
  leadsTotal: number;
  leadsQualified: number;
  portfolioValueFcfa: number;
}

export interface LandFilter {
  saleStatus?: SaleStatus;
  verificationStatus?: VerificationStatus;
  documentType?: DocumentType;
  zone?: string;
}

export interface LeadFilter {
  status?: LeadStatus;
  source?: LeadSource;
}

export interface NewLand {
  sellerId: string;
  title: string;
  zone: string;
  surface?: number;
  priceFcfa: number;
  documentType: DocumentType;
  description?: string;
  photos?: string[];
  documents?: string[];
}

export type VisitStatus = 'planifiee' | 'confirmee' | 'annulee' | 'effectuee';

export interface Visit {
  id: string;
  sellerId: string;
  landId: string;
  leadId?: string;
  visitDate: string;
  notes?: string;
  status: VisitStatus;
  createdAt: string;
}

export type NewVisit = Omit<Visit, 'id' | 'createdAt'>;
