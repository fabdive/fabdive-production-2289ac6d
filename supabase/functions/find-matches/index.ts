import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Finding matches for user:', userId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's profile and preferences
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    const { data: userPreferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefError || !userPreferences) {
      throw new Error('User preferences not found');
    }

    if (!userProfile.latitude || !userProfile.longitude) {
      return new Response(
        JSON.stringify({ error: 'User location not set' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert distance preferences to km ranges
    const maxDistances: number[] = [];
    if (userPreferences.preferred_distances?.includes('0-50')) {
      maxDistances.push(50);
    }
    if (userPreferences.preferred_distances?.includes('50-200')) {
      maxDistances.push(200);
    }
    if (userPreferences.preferred_distances?.includes('+200')) {
      maxDistances.push(10000); // Very large number for unlimited
    }
    if (userPreferences.preferred_distances?.includes('peu-importe')) {
      maxDistances.push(10000);
    }

    const maxDistance = Math.max(...maxDistances, 50); // Default to 50km

    // Find potential matches using the secure matching function
    const { data: matches, error: matchError } = await supabase
      .rpc('get_safe_matching_profiles', {
        max_distance_km: maxDistance
      });

    if (matchError) {
      console.error('Error finding matches:', matchError);
      throw new Error('Failed to find matches');
    }

    console.log('Found matches:', matches?.length || 0);

    return new Response(
      JSON.stringify({
        matches: matches || [],
        userLocation: {
          latitude: userProfile.latitude,
          longitude: userProfile.longitude
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in find-matches function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});