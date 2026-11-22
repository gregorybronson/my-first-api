export default async (req) => {
  const url = new URL(req.url);
  const pages = Number(url.searchParams.get("pages")) || 1;
  const name = url.searchParams.get("name") || "";
  const email = url.searchParams.get("email") || "";

  // Keep these the same as in quote.js
  const baseFee = 500;      // placeholder: your setup fee
  const perPage = 150;      // placeholder: your price per page
  const depositRate = 0.5;  // placeholder: share of the quote due up front

  const quote = baseFee + pages * perPage;
  const deposit = Math.round(quote * depositRate);

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", url.origin + "/thanks.html?paid=1");
  params.append("cancel_url", url.origin + "/thanks.html");
  if (email) params.append("customer_email", email);
  params.append("line_items[0][quantity]", "1");
  params.append("line_items[0][price_data][currency]", "usd");
  params.append("line_items[0][price_data][unit_amount]", String(deposit * 100));
  params.append("line_items[0][price_data][product_data][name]",
    "Website deposit for " + pages + " pages");
  params.append("metadata[lead_name]", name);
  params.append("metadata[pages]", String(pages));
  params.append("metadata[quote]", String(quote));

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  const session = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return Response.json(
      { error: session.error?.message || "Stripe error" },
      { status: 500 }
    );
  }

  return Response.json({ url: session.url, deposit: deposit, quote: quote });
};
