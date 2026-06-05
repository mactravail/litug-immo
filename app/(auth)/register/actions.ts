'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function register(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        business_name: formData.get('businessName') as string,
        phone: formData.get('phone') as string,
      },
    },
  });

  if (error) {
    redirect('/register?error=inscription_echouee');
  }

  redirect('/login?inscrit=true');
}
