'use server';

import { revalidatePath } from 'next/cache';
import { getDataProvider } from '@/lib/data/provider';
import { getAuthenticatedSellerId } from '@/lib/supabase-server';
import type { SaleStatus, LeadStatus, NewLand, NewVisit, VisitStatus } from '@/lib/data/types';

export async function updateLandSaleStatus(landId: string, status: SaleStatus) {
  await getDataProvider().updateLand(landId, { saleStatus: status });
  revalidatePath(`/terrains/${landId}`);
  revalidatePath('/terrains');
  revalidatePath('/');
}

export async function setLandPublished(landId: string, published: boolean) {
  await getDataProvider().updateLand(landId, { published });
  revalidatePath(`/terrains/${landId}`);
  revalidatePath('/terrains');
  revalidatePath('/nos-terrains');
  revalidatePath(`/nos-terrains/${landId}`);
  revalidatePath('/');
}

export async function requestVerification(landId: string) {
  await getDataProvider().updateLand(landId, { verificationStatus: 'a_verifier' });
  revalidatePath(`/terrains/${landId}`);
  revalidatePath('/terrains');
  revalidatePath('/');
}

export async function createLand(input: Omit<NewLand, 'sellerId'>) {
  const sellerId = await getAuthenticatedSellerId();
  const land = await getDataProvider().createLand({ ...input, sellerId });
  revalidatePath('/terrains');
  revalidatePath('/');
  return land;
}

export async function updateLandPhotos(landId: string, photos: string[]) {
  await getDataProvider().updateLand(landId, { photos });
  revalidatePath(`/terrains/${landId}`);
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await getDataProvider().updateLead(leadId, { status });
  revalidatePath(`/clients/${leadId}`);
  revalidatePath('/clients');
  revalidatePath('/');
}

export async function updateSellerProfile(data: { businessName: string; phone: string; email: string }) {
  const sellerId = await getAuthenticatedSellerId();
  await getDataProvider().updateSeller(sellerId, data);
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/parametres');
}

export async function cancelSubscription() {
  revalidatePath('/parametres');
}

export async function createVisit(input: Omit<NewVisit, 'sellerId'>) {
  const sellerId = await getAuthenticatedSellerId();
  await getDataProvider().createVisit({ ...input, sellerId });
  revalidatePath('/visites');
  revalidatePath('/');
}

export async function updateVisitStatus(visitId: string, status: VisitStatus) {
  await getDataProvider().updateVisitStatus(visitId, status);
  revalidatePath('/visites');
  revalidatePath('/');
}
