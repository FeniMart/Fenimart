import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { product_id, user_email } = req.query;
      let query = supabase.from('wishlists').select('*, products(*)');
      if (product_id) query = query.eq('product_id', product_id);
      if (user_email) query = query.eq('user_email', user_email);
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    
    if (req.method === 'POST') {
      const { product_id, user_email } = req.body;
      
      const { data: existing } = await supabase
        .from('wishlists')
        .select('*')
        .eq('product_id', product_id)
        .eq('user_email', user_email)
        .single();
      
      if (existing) {
        return res.status(200).json({ message: 'Already in wishlist', data: existing });
      }
      
      const { data, error } = await supabase
        .from('wishlists')
        .insert({ product_id, user_email })
        .select()
        .single();
      
      if (error) throw error;
      
      return res.status(201).json(data);
    }
    
    if (req.method === 'DELETE') {
      const { product_id, user_email } = req.body;
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('product_id', product_id)
        .eq('user_email', user_email);
      
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
