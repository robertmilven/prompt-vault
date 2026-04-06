import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  "https://kvjientfaaewancbmzrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amllbnRmYWFld2FuY2JtenJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDg1MjcsImV4cCI6MjA5MDk4NDUyN30.Xsn6CWE3xQ2AYTNHmBpEMYL0W6RdyIlBlje_H74Y5Go"
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;
    const subscriptionId = session.subscription as string;

    if (userId) {
      await supabase
        .from("profiles")
        .update({
          is_paid: true,
          stripe_subscription_id: subscriptionId,
        })
        .eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const isActive = subscription.status === "active" || subscription.status === "trialing";

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId);

    if (profiles && profiles.length > 0) {
      await supabase
        .from("profiles")
        .update({ is_paid: isActive })
        .eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}
