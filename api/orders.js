import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { user_id, id } = req.query;
      let query = supabase.from('orders').select('*, order_items(*, products(name, price))').order('created_at', { ascending: false });
      if (user_id) query = query.eq('user_id', user_id);
      if (id) query = query.eq('id', id).single();
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, items, total, customer_info, payment_method } = req.body;
      
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id,
          total_amount: total,
          status: payment_method === 'Cash on Delivery' ? 'pending' : 'completed',
          payment_status: payment_method === 'Cash on Delivery' ? 'pending' : 'paid',
          payment_method,
          invoice_number: invoiceNumber,
          customer_name: customer_info.name,
          customer_email: customer_info.email,
          customer_phone: customer_info.phone,
          billing_address: customer_info.address
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
      
      const invoiceData = {
        invoice_number: invoiceNumber,
        date: new Date().toISOString(),
        customer: customer_info,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: total,
        tax: 0,
        total,
        payment_method
      };
      
      await supabase.from('invoices').insert({
        order_id: order.id,
        invoice_number: invoiceNumber,
        invoice_data: invoiceData
      });
      
      return res.status(201).json({ order, invoiceNumber });
    }
    if (req.method === 'PUT') {
      const { id, status, payment_status } = req.body;
      const updates = {};
      if (status) updates.status = status;
      if (payment_status) updates.payment_status = payment_status;
      const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
