import { type ClassValue, clsx } from "clsx"
import fr from "date-fns/locale/fr"
import { twMerge } from "tailwind-merge"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from '../types_db'
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR"
})


export async function exchangeCodeForSession(code: string) {
  const supabase = createClientComponentClient<Database>()
  return await supabase.auth.exchangeCodeForSession(code)
}
