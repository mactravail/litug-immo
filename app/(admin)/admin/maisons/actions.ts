'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export type ActionResult = { ok: true } | { ok: false; error: string };

/** ~2.8 Mo de base64 ≈ 2 Mo d'image : garde-fou contre des lignes énormes en base. */
const MAX_PHOTO_LEN = 2_800_000;

/**
 * Ajoute un exemple de maison (photo + titre + surface optionnels).
 * La photo arrive déjà en data URL base64 (redimensionnée côté client).
 * Écriture via la clé service_role (contourne RLS) — jamais depuis le front.
 */
export async function addHouseExample(input: {
  title?: string;
  surface?: string;
  photo: string;
}): Promise<ActionResult> {
  const photo = (input.photo ?? '').trim();
  if (!photo.startsWith('data:image/')) {
    return { ok: false, error: 'Photo manquante ou format non supporté.' };
  }
  if (photo.length > MAX_PHOTO_LEN) {
    return { ok: false, error: 'Image trop lourde. Choisissez une photo plus légère.' };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('house_examples').insert({
      title: input.title?.trim() || null,
      surface: input.surface?.trim() || null,
      photo,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/maisons');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue.' };
  }
}

/** Supprime un exemple de maison. */
export async function deleteHouseExample(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Identifiant manquant.' };
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('house_examples').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/maisons');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue.' };
  }
}
