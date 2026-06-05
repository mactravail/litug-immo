import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { DataProvider } from './provider';
import type {
  Stats, Land, Lead, Conversation, Seller,
  LandFilter, LeadFilter, NewLand, Visit, NewVisit, VisitStatus,
} from './types';

// --- Mappers DB (snake_case) → TypeScript (camelCase) ---

function mapSeller(row: Record<string, unknown>): Seller {
  return {
    id: row.id as string,
    businessName: row.business_name as string,
    phone: (row.phone as string) ?? '',
    email: (row.email as string) ?? '',
    subscriptionStatus: row.subscription_status as Seller['subscriptionStatus'],
    createdAt: row.created_at as string,
  };
}

function mapLand(row: Record<string, unknown>): Land {
  return {
    id: row.id as string,
    sellerId: row.seller_id as string,
    title: row.title as string,
    zone: row.zone as string,
    surface: row.surface as number | undefined ?? undefined,
    priceFcfa: row.price_fcfa as number,
    documentType: row.document_type as Land['documentType'],
    verificationStatus: row.verification_status as Land['verificationStatus'],
    verifiedByNotaire: row.verified_by_notaire as string | undefined ?? undefined,
    verifiedAt: row.verified_at as string | undefined ?? undefined,
    registryChecked: row.registry_checked as string | undefined ?? undefined,
    saleStatus: row.sale_status as Land['saleStatus'],
    photos: (row.photos as string[]) ?? [],
    documents: (row.documents as string[]) ?? [],
    description: row.description as string | undefined ?? undefined,
    createdAt: row.created_at as string,
  };
}

function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    sellerId: row.seller_id as string,
    name: row.name as string | undefined ?? undefined,
    phone: row.phone as string | undefined ?? undefined,
    budgetFcfa: row.budget_fcfa as number | undefined ?? undefined,
    desiredZone: row.desired_zone as string | undefined ?? undefined,
    desiredDocumentType: row.desired_document_type as Lead['desiredDocumentType'] ?? undefined,
    status: row.status as Lead['status'],
    source: row.source as Lead['source'],
    interestedLandId: row.interested_land_id as string | undefined ?? undefined,
    createdAt: row.created_at as string,
  };
}

function mapConversation(row: Record<string, unknown>): Conversation {
  return {
    id: row.id as string,
    leadId: row.lead_id as string,
    messages: (row.messages as Conversation['messages']) ?? [],
  };
}

function mapVisit(row: Record<string, unknown>): Visit {
  return {
    id: row.id as string,
    sellerId: row.seller_id as string,
    landId: row.land_id as string,
    leadId: row.lead_id as string | undefined ?? undefined,
    visitDate: row.visit_date as string,
    notes: row.notes as string | undefined ?? undefined,
    status: row.status as Visit['status'],
    createdAt: row.created_at as string,
  };
}

// --- Provider ---

export const supabaseProvider: DataProvider = {
  async getSeller(id) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return mapSeller(data);
  },

  async updateSeller(id, patch) {
    const supabase = await createSupabaseServerClient();
    const update: Record<string, unknown> = {};
    if (patch.businessName !== undefined) update.business_name = patch.businessName;
    if (patch.phone !== undefined) update.phone = patch.phone;
    if (patch.email !== undefined) update.email = patch.email;
    const { data, error } = await supabase
      .from('sellers')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error(`updateSeller failed: ${error?.message}`);
    return mapSeller(data);
  },

  async getStats(sellerId) {
    const supabase = await createSupabaseServerClient();
    const [{ data: landsData }, { data: leadsData }] = await Promise.all([
      supabase
        .from('lands')
        .select('sale_status, verification_status, price_fcfa')
        .eq('seller_id', sellerId),
      supabase
        .from('leads')
        .select('status')
        .eq('seller_id', sellerId),
    ]);
    const ls = landsData ?? [];
    const ld = leadsData ?? [];
    const stats: Stats = {
      landsTotal: ls.length,
      landsAvailable: ls.filter(l => l.sale_status === 'disponible').length,
      landsInSale: ls.filter(l => l.sale_status === 'en_cours_de_vente').length,
      landsSold: ls.filter(l => l.sale_status === 'vendu').length,
      landsVerified: ls.filter(l => l.verification_status === 'verifie').length,
      landsToVerify: ls.filter(l => l.verification_status === 'a_verifier').length,
      leadsTotal: ld.length,
      leadsQualified: ld.filter(l => ['qualifie', 'en_contact'].includes(l.status)).length,
      portfolioValueFcfa: ls
        .filter(l => l.sale_status !== 'vendu')
        .reduce((sum, l) => sum + (l.price_fcfa as number), 0),
    };
    return stats;
  },

  async listLands(sellerId, filter?: LandFilter) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('lands').select('*').eq('seller_id', sellerId);
    if (filter?.saleStatus) query = query.eq('sale_status', filter.saleStatus);
    if (filter?.verificationStatus) query = query.eq('verification_status', filter.verificationStatus);
    if (filter?.documentType) query = query.eq('document_type', filter.documentType);
    if (filter?.zone) query = query.ilike('zone', `%${filter.zone}%`);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapLand);
  },

  async getLand(id) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('lands')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return mapLand(data);
  },

  async createLand(input: NewLand) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('lands')
      .insert({
        seller_id: input.sellerId,
        title: input.title,
        zone: input.zone,
        surface: input.surface ?? null,
        price_fcfa: input.priceFcfa,
        document_type: input.documentType,
        description: input.description ?? null,
        photos: input.photos ?? [],
        documents: input.documents ?? [],
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? 'createLand failed');
    return mapLand(data);
  },

  async updateLand(id, patch) {
    const supabase = await createSupabaseServerClient();
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.zone !== undefined) update.zone = patch.zone;
    if (patch.surface !== undefined) update.surface = patch.surface;
    if (patch.priceFcfa !== undefined) update.price_fcfa = patch.priceFcfa;
    if (patch.documentType !== undefined) update.document_type = patch.documentType;
    if (patch.verificationStatus !== undefined) update.verification_status = patch.verificationStatus;
    if (patch.verifiedByNotaire !== undefined) update.verified_by_notaire = patch.verifiedByNotaire;
    if (patch.verifiedAt !== undefined) update.verified_at = patch.verifiedAt;
    if (patch.registryChecked !== undefined) update.registry_checked = patch.registryChecked;
    if (patch.saleStatus !== undefined) update.sale_status = patch.saleStatus;
    if (patch.photos !== undefined) update.photos = patch.photos;
    if (patch.documents !== undefined) update.documents = patch.documents;
    if (patch.description !== undefined) update.description = patch.description;
    const { data, error } = await supabase
      .from('lands')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? `Land ${id} not found`);
    return mapLand(data);
  },

  async listLeads(sellerId, filter?: LeadFilter) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('leads').select('*').eq('seller_id', sellerId);
    if (filter?.status) query = query.eq('status', filter.status);
    if (filter?.source) query = query.eq('source', filter.source);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapLead);
  },

  async getLead(id) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return mapLead(data);
  },

  async updateLead(id, patch) {
    const supabase = await createSupabaseServerClient();
    const update: Record<string, unknown> = {};
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.phone !== undefined) update.phone = patch.phone;
    if (patch.budgetFcfa !== undefined) update.budget_fcfa = patch.budgetFcfa;
    if (patch.desiredZone !== undefined) update.desired_zone = patch.desiredZone;
    if (patch.desiredDocumentType !== undefined) update.desired_document_type = patch.desiredDocumentType;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.source !== undefined) update.source = patch.source;
    if (patch.interestedLandId !== undefined) update.interested_land_id = patch.interestedLandId;
    const { data, error } = await supabase
      .from('leads')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? `Lead ${id} not found`);
    return mapLead(data);
  },

  async getConversation(leadId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .single();
    if (error || !data) return null;
    return mapConversation(data);
  },

  async listVisits(sellerId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('seller_id', sellerId)
      .order('visit_date', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapVisit);
  },

  async createVisit(input: NewVisit) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('visits')
      .insert({
        seller_id: input.sellerId,
        land_id: input.landId,
        lead_id: input.leadId ?? null,
        visit_date: input.visitDate,
        notes: input.notes ?? null,
        status: input.status,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? 'createVisit failed');
    return mapVisit(data);
  },

  async updateVisitStatus(id: string, status: VisitStatus) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('visits')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? `Visit ${id} not found`);
    return mapVisit(data);
  },
};
