import type { Stats, Land, Lead, Conversation, Seller, LandFilter, LeadFilter, NewLand, Visit, NewVisit, VisitStatus } from './types';

export interface DataProvider {
  getSeller(id: string): Promise<Seller | null>;
  updateSeller(id: string, patch: Partial<Pick<Seller, 'businessName' | 'phone' | 'email'>>): Promise<Seller>;
  getStats(sellerId: string): Promise<Stats>;
  listLands(sellerId: string, filter?: LandFilter): Promise<Land[]>;
  getLand(id: string): Promise<Land | null>;
  createLand(input: NewLand): Promise<Land>;
  updateLand(id: string, patch: Partial<Land>): Promise<Land>;
  listLeads(sellerId: string, filter?: LeadFilter): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  updateLead(id: string, patch: Partial<Lead>): Promise<Lead>;
  getConversation(leadId: string): Promise<Conversation | null>;
  listVisits(sellerId: string): Promise<Visit[]>;
  createVisit(input: NewVisit): Promise<Visit>;
  updateVisitStatus(id: string, status: VisitStatus): Promise<Visit>;
}

let _provider: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (_provider) return _provider;
  if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase') {
    const { supabaseProvider } = require('./supabase-provider');
    _provider = supabaseProvider;
  } else {
    const { mockProvider } = require('./mock-provider');
    _provider = mockProvider;
  }
  return _provider!;
}
