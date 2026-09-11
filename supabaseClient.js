const SUPABASE_URL = "https://brtxmfxieeoqczwzqwlq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kFXWDoFoNozQUkHdWYutQw_z2zOfPTS";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);