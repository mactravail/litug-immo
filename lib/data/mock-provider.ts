import type { DataProvider } from './provider';
import type { Stats, Land, Lead, Conversation, Seller, LandFilter, LeadFilter, NewLand, Visit, NewVisit, VisitStatus, PublicLand, PublicLandDetail, PublicLandFilter, PublicVisitSlot } from './types';
import { SEED_LANDS, SEED_LEADS, SEED_CONVERSATIONS, SEED_SELLER, SEED_VISITS } from './seed';

let seller: Seller = { ...SEED_SELLER };
let lands: Land[] = [...SEED_LANDS];
let leads: Lead[] = [...SEED_LEADS];
const conversations: Conversation[] = [...SEED_CONVERSATIONS];
let visits: Visit[] = [...SEED_VISITS];

function calcStats(sellerId: string): Stats {
  const sl = lands.filter(l => l.sellerId === sellerId);
  const sl2 = leads.filter(l => l.sellerId === sellerId);
  return {
    landsTotal: sl.length,
    landsAvailable: sl.filter(l => l.saleStatus === 'disponible').length,
    landsInSale: sl.filter(l => l.saleStatus === 'en_cours_de_vente').length,
    landsSold: sl.filter(l => l.saleStatus === 'vendu').length,
    landsVerified: sl.filter(l => l.verificationStatus === 'verifie').length,
    landsToVerify: sl.filter(l => l.verificationStatus === 'a_verifier').length,
    leadsTotal: sl2.length,
    leadsQualified: sl2.filter(l => ['qualifie', 'en_contact'].includes(l.status)).length,
    portfolioValueFcfa: sl.filter(l => l.saleStatus !== 'vendu').reduce((sum, l) => sum + l.priceFcfa, 0),
  };
}

export const mockProvider: DataProvider = {
  async getSeller(id) {
    if (id === seller.id) return seller;
    return null;
  },

  async updateSeller(id, patch) {
    if (id !== seller.id) throw new Error(`Seller ${id} not found`);
    seller = { ...seller, ...patch };
    return seller;
  },

  async getStats(sellerId) {
    return calcStats(sellerId);
  },

  async listLands(sellerId, filter) {
    let result = lands.filter(l => l.sellerId === sellerId);
    if (filter?.saleStatus) result = result.filter(l => l.saleStatus === filter.saleStatus);
    if (filter?.verificationStatus) result = result.filter(l => l.verificationStatus === filter.verificationStatus);
    if (filter?.documentType) result = result.filter(l => l.documentType === filter.documentType);
    if (filter?.zone) result = result.filter(l => l.zone.toLowerCase().includes(filter.zone!.toLowerCase()));
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getLand(id) {
    return lands.find(l => l.id === id) ?? null;
  },

  async createLand(input) {
    const land: Land = {
      ...input,
      id: `land-${Date.now()}`,
      verificationStatus: 'non_verifie',
      saleStatus: 'disponible',
      published: false,
      photos: input.photos ?? [],
      documents: input.documents ?? [],
      createdAt: new Date().toISOString(),
    };
    lands = [...lands, land];
    return land;
  },

  async updateLand(id, patch) {
    const idx = lands.findIndex(l => l.id === id);
    if (idx === -1) throw new Error(`Land ${id} not found`);
    lands = lands.map(l => l.id === id ? { ...l, ...patch } : l);
    return lands.find(l => l.id === id)!;
  },

  async listLeads(sellerId, filter) {
    let result = leads.filter(l => l.sellerId === sellerId);
    if (filter?.status) result = result.filter(l => l.status === filter.status);
    if (filter?.source) result = result.filter(l => l.source === filter.source);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getLead(id) {
    return leads.find(l => l.id === id) ?? null;
  },

  async updateLead(id, patch) {
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found`);
    leads = leads.map(l => l.id === id ? { ...l, ...patch } : l);
    return leads.find(l => l.id === id)!;
  },

  async getConversation(leadId) {
    return conversations.find(c => c.leadId === leadId) ?? null;
  },

  async listVisits(sellerId) {
    return visits
      .filter(v => v.sellerId === sellerId)
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
  },

  async createVisit(input: NewVisit) {
    const visit: Visit = {
      ...input,
      id: `visit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    visits = [...visits, visit];
    return visit;
  },

  async updateVisitStatus(id: string, status: VisitStatus) {
    const idx = visits.findIndex(v => v.id === id);
    if (idx === -1) throw new Error(`Visit ${id} not found`);
    visits = visits.map(v => v.id === id ? { ...v, status } : v);
    return visits.find(v => v.id === id)!;
  },

  async listPublicLands(filter?: PublicLandFilter) {
    const sellerName = (sellerId: string) => sellerId === seller.id ? seller.businessName : '';
    let result = lands.filter(l => l.published === true);
    if (filter?.documentType) result = result.filter(l => l.documentType === filter.documentType);
    if (filter?.availableOnly) result = result.filter(l => l.saleStatus === 'disponible');
    // Available first, then most recent.
    result.sort((a, b) => {
      if (a.saleStatus !== b.saleStatus) return a.saleStatus.localeCompare(b.saleStatus);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    if (filter?.limit) result = result.slice(0, filter.limit);
    return result.map(l => ({ ...l, documents: [], sellerName: sellerName(l.sellerId) }));
  },

  async getPublicLandDetail(id: string) {
    const land = lands.find(l => l.id === id);
    if (!land) return null;
    const sellerName = land.sellerId === seller.id ? seller.businessName : '';
    const now = Date.now();
    const upcomingVisits: PublicVisitSlot[] = visits
      .filter(v => v.landId === id && (v.status === 'planifiee' || v.status === 'confirmee') && new Date(v.visitDate).getTime() >= now)
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
      .map(v => ({ id: v.id, visitDate: v.visitDate, status: v.status as PublicVisitSlot['status'] }));
    const publicLand: PublicLand = { ...land, documents: [], sellerName };
    return { land: publicLand, upcomingVisits } satisfies PublicLandDetail;
  },
};
