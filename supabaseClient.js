const isStaging = location.href.includes('staging');

const SUPABASE_URL = isStaging
    ? "https://pqxkbcgljilebcpvgboj.supabase.co"
    : "https://brtxmfxieeoqczwzqwlq.supabase.co";
const SUPABASE_ANON_KEY = isStaging
    ? "sb_publishable_10f-MtTz245wD1tglP5diQ_St4BqIIC"
    :"sb_publishable_kFXWDoFoNozQUkHdWYutQw_z2zOfPTS";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



