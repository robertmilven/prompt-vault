import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kvjientfaaewancbmzrr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amllbnRmYWFld2FuY2JtenJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDg1MjcsImV4cCI6MjA5MDk4NDUyN30.Xsn6CWE3xQ2AYTNHmBpEMYL0W6RdyIlBlje_H74Y5Go";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// Backward compat - works on both client and server
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types based on the database schema
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
}

export interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  category_id: string;
  type: string | null;
  tags: string[] | null;
  camera_movement: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  source_base: string | null;
  source_record_id: string | null;
  is_featured: boolean;
  is_free: boolean;
  view_count: number;
  copy_count: number;
  created_at: string;
  categories?: Category;
}

// Fallback sample data for when the database is empty
export const SAMPLE_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Cinematic", slug: "cinematic", description: "Hollywood-style cinematic prompts", icon_url: null, sort_order: 1 },
  { id: "cat-2", name: "Live-Action", slug: "live-action", description: "Realistic live-action video prompts", icon_url: null, sort_order: 2 },
  { id: "cat-3", name: "Product", slug: "product", description: "Product showcase and commercial prompts", icon_url: null, sort_order: 3 },
  { id: "cat-4", name: "UGC", slug: "ugc", description: "User-generated content style prompts", icon_url: null, sort_order: 4 },
  { id: "cat-5", name: "Camera Movements", slug: "camera-movements", description: "Dynamic camera movement prompts", icon_url: null, sort_order: 5 },
  { id: "cat-6", name: "Atmospheric", slug: "atmospheric", description: "Mood and atmosphere-driven prompts", icon_url: null, sort_order: 6 },
];

export const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: "p-1", title: "Neon City Chase", prompt_text: "A high-speed chase through neon-lit Tokyo streets at night. Rain-slicked asphalt reflects pink and blue neon signs. Camera follows a motorcycle weaving between taxis. Cinematic, anamorphic lens flare, 4K, slow motion splash as tires cut through puddles.", category_id: "cat-1", type: "Cinematic",
    tags: ["neon", "chase", "night", "rain"], camera_movement: "Tracking shot", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: true, is_free: true, view_count: 1240, copy_count: 890, created_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "p-2", title: "Golden Hour Portrait", prompt_text: "Close-up portrait of a woman standing in a wheat field during golden hour. Warm sunlight backlighting her hair creating a halo effect. Shallow depth of field, skin details visible, gentle breeze moving the wheat. Shot on 85mm lens, f/1.4.", category_id: "cat-2", type: "Live-Action",
    tags: ["portrait", "golden hour", "nature"], camera_movement: "Static with subtle drift", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: true, is_free: true, view_count: 980, copy_count: 720, created_at: "2026-03-12T00:00:00Z",
  },
  {
    id: "p-3", title: "Luxury Watch Reveal", prompt_text: "A luxury chronograph watch sits on black velvet. Camera slowly orbits the watch as dramatic side-lighting reveals brushed steel details. Macro lens captures the texture of the dial. Dark, moody, premium feel. 4K product photography style.", category_id: "cat-3", type: "Product",
    tags: ["luxury", "watch", "product", "macro"], camera_movement: "Slow orbit", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: false, is_free: true, view_count: 650, copy_count: 410, created_at: "2026-03-10T00:00:00Z",
  },
  {
    id: "p-4", title: "Morning Routine Unboxing", prompt_text: "POV shot of hands unboxing a skincare product on a marble countertop. Soft morning light from a nearby window. Clean aesthetic, minimal background. Hands carefully lift the product, turning it to show the label. Natural, authentic UGC style.", category_id: "cat-4", type: "UGC",
    tags: ["unboxing", "skincare", "POV", "minimal"], camera_movement: "Static POV", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: false, is_free: true, view_count: 430, copy_count: 290, created_at: "2026-03-08T00:00:00Z",
  },
  {
    id: "p-5", title: "Drone Rise Over Mountains", prompt_text: "Drone rises vertically from a misty valley floor, slowly revealing a vast mountain range at sunrise. Layers of fog settle between peaks. Golden light spills over the ridgeline. Epic scale, nature documentary quality. Smooth vertical ascent.", category_id: "cat-5", type: "Camera Movement",
    tags: ["drone", "mountains", "sunrise", "epic"], camera_movement: "Vertical rise", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: true, is_free: true, view_count: 1560, copy_count: 1100, created_at: "2026-03-05T00:00:00Z",
  },
  {
    id: "p-6", title: "Foggy Forest Path", prompt_text: "A narrow dirt path winds through a dense ancient forest. Thick fog rolls between towering moss-covered trees. Volumetric light rays pierce through the canopy. Mysterious, ethereal atmosphere. Camera slowly glides forward along the path.", category_id: "cat-6", type: "Atmospheric",
    tags: ["forest", "fog", "mysterious", "ethereal"], camera_movement: "Slow dolly forward", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: false, is_free: true, view_count: 870, copy_count: 590, created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "p-7", title: "Cyberpunk Alley", prompt_text: "A narrow alleyway in a cyberpunk city. Holographic advertisements flicker on the walls. Steam rises from grates. A lone figure in a trench coat walks away from camera. Blade Runner aesthetic, volumetric fog, neon reflections on wet surfaces.", category_id: "cat-1", type: "Cinematic",
    tags: ["cyberpunk", "neon", "noir", "sci-fi"], camera_movement: "Static wide shot", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: false, is_free: false, view_count: 1100, copy_count: 780, created_at: "2026-02-28T00:00:00Z",
  },
  {
    id: "p-8", title: "Perfume Bottle Splash", prompt_text: "A glass perfume bottle shatters against a black background in super slow motion. Golden liquid explodes outward in all directions. Individual droplets catch the light like jewels. High-speed photography, 1000fps look, dramatic studio lighting.", category_id: "cat-3", type: "Product",
    tags: ["perfume", "splash", "slow-motion", "luxury"], camera_movement: "High-speed static", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: true, is_free: false, view_count: 920, copy_count: 640, created_at: "2026-02-25T00:00:00Z",
  },
  {
    id: "p-9", title: "Whip Pan Street Food", prompt_text: "Fast whip pan across a bustling Bangkok street food market at night. Camera whips between different food stalls, each lit by warm hanging bulbs. Steam, sizzle, and vibrant colors. Each stop is a 1-second freeze before whipping to the next stall.", category_id: "cat-5", type: "Camera Movement",
    tags: ["whip pan", "street food", "night market", "fast"], camera_movement: "Whip pan", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: false, is_free: true, view_count: 750, copy_count: 520, created_at: "2026-02-20T00:00:00Z",
  },
  {
    id: "p-10", title: "Rainy Window Melancholy", prompt_text: "Interior shot looking through a rain-covered window. Outside, city lights blur into soft bokeh circles. A cup of coffee sits on the windowsill, steam curling upward. Melancholic, contemplative mood. Lo-fi aesthetic, warm interior vs cold blue exterior.", category_id: "cat-6", type: "Atmospheric",
    tags: ["rain", "window", "melancholy", "cozy"], camera_movement: "Static with rack focus", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: false, is_free: true, view_count: 680, copy_count: 450, created_at: "2026-02-18T00:00:00Z",
  },
  {
    id: "p-11", title: "Desert Timelapse", prompt_text: "Timelapse of sand dunes in the Sahara desert from dawn to dusk. Shadows shift dramatically across rippled sand. The Milky Way slowly appears as day turns to night. Stars rotate above the dunes. Grand scale, patience of nature, IMAX quality.", category_id: "cat-1", type: "Cinematic",
    tags: ["desert", "timelapse", "stars", "epic"], camera_movement: "Static timelapse", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: false, is_free: true, view_count: 540, copy_count: 380, created_at: "2026-02-15T00:00:00Z",
  },
  {
    id: "p-12", title: "Sneaker Drop Close-Up", prompt_text: "Extreme close-up of a limited-edition sneaker dropping onto a reflective black surface. The shoe bounces once in slow motion. Camera catches every stitch and texture detail. Clean white shoe against pure black. Hype beast energy, studio lit.", category_id: "cat-3", type: "Product",
    tags: ["sneaker", "product", "close-up", "hype"], camera_movement: "Slow motion static", image_url: null, thumbnail_url: null, video_url: null, source_base: null, source_record_id: null, is_featured: false, is_free: false, view_count: 890, copy_count: 610, created_at: "2026-02-10T00:00:00Z",
  },
];
