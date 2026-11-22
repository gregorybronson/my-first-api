import { settings } from "../../site-settings.js";

export default async (req) => {
  const url = new URL(req.url);
  let pages = Math.floor(Number(url.searchParams.get("pages"))) || 1;
  pages = Math.min(Math.max(pages, 1), settings.maxPages);

  return Response.json({
    pages: pages,
    quote: settings.baseFee + pages * settings.perPage
  });
};
