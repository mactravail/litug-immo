import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Vitrine publique « Exemple de maison » (landing). Lecture anon de house_examples.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('house_examples')
      .select('id, title, surface, photo')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) throw error;
    return NextResponse.json({ houses: data ?? [] });
  } catch {
    return NextResponse.json({ houses: [] }, { status: 200 });
  }
}
