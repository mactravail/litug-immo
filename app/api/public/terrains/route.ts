import { NextResponse, type NextRequest } from 'next/server';
import { getDataProvider } from '@/lib/data/provider';
import type { DocumentType } from '@/lib/data/types';

// Reads from Supabase via the anon role (public listing views) — must run per-request.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 6, 12);
  const availableOnly = searchParams.get('available') === '1';
  const documentType = (searchParams.get('docType') as DocumentType | null) ?? undefined;

  try {
    const lands = await getDataProvider().listPublicLands({ limit, availableOnly, documentType });

    // Trim heavy base64 photos to the first one for the teaser payload.
    const data = lands.map(l => ({
      id: l.id,
      title: l.title,
      zone: l.zone,
      surface: l.surface ?? null,
      priceFcfa: l.priceFcfa,
      documentType: l.documentType,
      verificationStatus: l.verificationStatus,
      saleStatus: l.saleStatus,
      sellerName: l.sellerName,
      photo: l.photos[0] ?? null,
    }));

    return NextResponse.json({ terrains: data });
  } catch {
    return NextResponse.json({ terrains: [] }, { status: 200 });
  }
}
