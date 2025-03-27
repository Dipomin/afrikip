import React from 'react'
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../types_db';

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    
  );  
    export default async function checkSubscriptionStatut(userId:any) {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name')
            .eq('id', userId)
            .single();

            if(error) {
                console.error("Erreur lors de la récupération de l'utilisateur", error);
            }
        
            if(!data) {
                console.error('Utilisateur non trouvé');
            }

            const { data: subscriptionData, error: subscriptioError } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', userId)
                .single();

                if (subscriptioError) {
                    console.error('Erreur lors de la recupération du status de la souscription:', subscriptioError);
                }

                if(subscriptionData) {
                    const subscriptionStatus = subscriptionData.status;
                    console.log(`l'utilisateur ${data?.full_name} est: ${subscriptionStatus}`);
                } else {
                    console.log(`L'utilisateur ${data?.full_name} n'a pas de souscription.`);
                }
        
    }
