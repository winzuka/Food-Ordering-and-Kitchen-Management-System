import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15' as any,
});


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { orderItems, orderId } = req.body;

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: orderItems.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.menuItem?.name || `Item #${item.menuItemId}`,
            },
            unit_amount: Math.round(item.price * 100), // convert to cents
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${req.headers.origin}/orders?success=true&order_id=${orderId}${req.body.isNewOrder ? '&isNewOrder=true' : ''}`,
        cancel_url: `${req.headers.origin}/orders?canceled=true`,
        metadata: {
          orderId: orderId.toString(),
          isNewOrder: req.body.isNewOrder ? 'true' : 'false'
        }
      });
      res.status(200).json({ url: session.url });
    } catch (err: any) {
      console.error(err);
      res.status(err.statusCode || 500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
