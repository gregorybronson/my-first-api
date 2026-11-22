export default async (req) => {
  const url = new URL(req.url);
  const pages = Number(url.searchParams.get("pages")) || 1;

  const baseFee = 500;  // placeholder: your setup fee
  const perPage = 150;  // placeholder: your price per page

  return Response.json({
    pages: pages,
    quote: baseFee + pages * perPage
  });
};
