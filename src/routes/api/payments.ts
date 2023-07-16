import { APIEvent } from 'solid-start';
import { stripe } from '~/lib/payments';
import { db } from '~/lib/data';

type Success = {
  id: string;
};

export const POST = async ({ request }: APIEvent) => {
  const bodyString = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!bodyString || !signature) {
    return new Response(null, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      bodyString,
      signature,
      process.env.STRIPE_SECRET_KEY as string
    );

    if (event.type !== 'checkout.session.completed') {
      console.error('Unexpected event type', event.type);
      return new Response();
    }

    const success = event.data.object as Success;
    const session = await stripe.checkout.sessions.retrieve(success.id, {
      expand: ['line_items'],
    });

    if (!session.customer_details?.email || !session.customer_details.name) {
      console.error("Customer doesn't have expected details");
      return new Response(null, { status: 400 });
    }

    let customer = await db.customer.findFirst({
      where: {
        email: session.customer_details.email,
      },
    });

    if (!customer) {
      const names = session.customer_details.name.split(' ');

      customer = await db.customer.create({
        data: {
          firstName: names[0].toLowerCase(),
          lastName: names[names.length - 1].toLowerCase(),
          email: session.customer_details.email.toLowerCase(),
        },
      });
    }

    const amount = session.line_items?.data[0]?.price?.unit_amount;
    const credits = session.line_items?.data[0]?.price?.metadata.credits;

    if (!amount || !credits) {
      console.error("Price doesn't have expected details");
      return new Response(null, { status: 400 });
    }

    await db.purchase.create({
      data: {
        customerId: customer.id,
        paid: amount / 100,
        credit: Number(credits),
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 400 });
  }

  return new Response();
};
