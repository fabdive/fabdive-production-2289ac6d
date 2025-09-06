import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeResponse {
  lat: string;
  lon: string;
  display_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, userId, reverse } = await req.json();

    if (!address || !userId) {
      return new Response(
        JSON.stringify({ error: 'Address and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Geocoding address:', address, 'for user:', userId, 'reverse:', reverse);

    let geocodeUrl: string;
    
    if (reverse) {
      // Reverse geocoding: coordinates to address
      const [lat, lon] = address.split(',');
      geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    } else {
      // Forward geocoding: address to coordinates
      geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    }
    
    const geocodeResponse = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'FabDive-App/1.0'
      }
    });

    if (!geocodeResponse.ok) {
      throw new Error('Failed to geocode address');
    }

    let geocodeData: GeocodeResponse | GeocodeResponse[];
    
    if (reverse) {
      geocodeData = await geocodeResponse.json() as GeocodeResponse;
    } else {
      const results = await geocodeResponse.json() as GeocodeResponse[];
      if (results.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Address not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      geocodeData = results[0];
    }

    const result = Array.isArray(geocodeData) ? geocodeData[0] : geocodeData;
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'No results found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    console.log('Geocoded coordinates:', { latitude, longitude });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse city and country from display_name
    // Format example: "123 Rue de la Paix, 75001 Paris, Île-de-France, France"
    const parts = result.display_name.split(',').map(part => part.trim());
    
    let city = '';
    let country = '';
    
    if (parts.length > 0) {
      country = parts[parts.length - 1]; // Last part is usually the country
      
      // For city, look for the part that contains digits (postal code) or is the second part
      if (parts.length >= 3) {
        // Try to find postal code + city pattern
        for (let i = 1; i < parts.length - 1; i++) {
          const part = parts[i];
          // If part contains numbers (postal code), the city is likely in this part or the next
          if (/\d/.test(part)) {
            // Extract city name (remove postal code)
            city = part.replace(/^\d+\s*/, '').trim();
            break;
          }
        }
        
        // If no postal code found, take the second part (often the city)
        if (!city && parts.length >= 2) {
          city = parts[1];
        }
      } else if (parts.length === 2) {
        city = parts[0];
      }
    }
    
    // Fallback: if city is empty, use the first part (better than nothing)
    if (!city && parts.length > 0) {
      city = parts[0];
    }

    console.log('Parsed location:', { city, country, display_name: result.display_name });

    // Update user profile with coordinates
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        latitude: latitude,
        longitude: longitude,
        location_city: city,
        location_country: country
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to update profile with coordinates');
    }

    return new Response(
      JSON.stringify({
        latitude,
        longitude,
        display_name: result.display_name,
        city,
        country,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in geocode-address function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});