import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id, products(id, name, price, category, image_url)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const demandMap = {};
      data.forEach(item => {
        if (!demandMap[item.product_id]) {
          demandMap[item.product_id] = {
            product_id: item.product_id,
            product: item.products,
            wishlist_count: 0
          };
        }
        demandMap[item.product_id].wishlist_count++;
      });
      
      const result = Object.values(demandMap).sort((a, b) => b.wishlist_count - a.wishlist_count);
      
      return res.status(200).json(result);
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
