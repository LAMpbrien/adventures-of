import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
  });
}

export { getStripe as stripe };

export async function createCheckoutSession(bookId: string, customerEmail?: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Personalized Storybook",
            description:
              "A fully illustrated personalized storybook featuring your child as the hero",
          },
          unit_amount: 1500, // $15.00
        },
        quantity: 1,
      },
    ],
    metadata: { book_id: bookId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/preview/${bookId}`,
  });

  return session;
}
