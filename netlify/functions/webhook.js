import crypto from "node:crypto";

export default async (req) => {
  const body = await req.text();
  const header = req.headers.get("stripe-signature") || "";

  // Step 1: confirm the message really came from Stripe
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const expected = crypto
    .createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
    .update(parts.t + "." + body)
    .digest("hex");

  if (expected !== parts.v1) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  // Step 2: act only on completed payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const form = new URLSearchParams({
      "form-name": "payments",
      name: session.metadata?.lead_name || "",
      email: session.customer_details?.email || "",
      pages: session.metadata?.pages || "",
      quote: session.metadata?.quote || "",
      amount_paid: String(session.amount_total / 100)
    });

    await fetch(new URL(req.url).origin + "/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString()
    });
  }

  return new Response("ok");
};
