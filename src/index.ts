import { Hono } from "hono";
import { html } from "hono/html";

const app = new Hono();

const regionDomainMap: Record<string, string> = {
  us: "amazon.com",
  uk: "amazon.co.uk",
  in: "amazon.in",
  ca: "amazon.ca",
  de: "amazon.de",
  nl: "amazon.nl",
  es: "amazon.es",
  sg: "amazon.sg",
};

const cfCountryRegionMap: Record<string, string> = {
  GB: "uk",
  US: "us",
  IN: "in",
  CA: "ca",
  DE: "de",
  NL: "nl",
  ES: "es",
  SG: "sg",
};

const countryNameMap: Record<string, string> = {
  us: "United States",
  uk: "United Kingdom",
  in: "India",
  ca: "Canada",
  de: "Germany",
  nl: "Netherlands",
  es: "Spain",
  sg: "Singapore",
};

const defaultDomain = regionDomainMap["us"];

const extractAmazonProductId = (url?: string) => {
  if (!url) return;
  const regex =
    /(?:\/dp\/|\/gp\/product\/|\/gp\/offer-listing\/|\/ASIN\/)([A-Z0-9]{10})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

app.get("/", (c) => {
  const originCountry = c.req.raw.cf?.country;
  const originRegion = cfCountryRegionMap[originCountry as string] || "us";

  return c.html(
    html` <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Amazon Link Redirector</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            function validateForm() {
              const url = document.getElementById('product-url').value;
              const regex = /(?:https?://)?(?:www.)?amazon.[a-z.]+/(?:dp|gp/product|gp/offer-listing|ASIN)/[A-Z0-9]{10}/;
              if (!regex.test(url)) {
                alert('Please enter a valid Amazon product URL');
                return false;
              }
              return true;
            }
          </script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
          <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">
              Amazon Link Redirector
            </h1>
            <form action="/r" method="GET" onsubmit="return validateForm()">
              <div class="mb-4">
                <label for="product-url" class="block text-gray-700"
                  >Amazon Product URL</label
                >
                <input
                  type="text"
                  id="product-url"
                  name="url"
                  required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div class="mb-4">
                <label for="region" class="block text-gray-700"
                  >Select Country</label
                >
                <select
                  id="region"
                  name="region"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">
                    Use my location - ${countryNameMap[originRegion]}
                  </option>
                  ${Object.entries(regionDomainMap).map(
                    ([region, domain]) =>
                      html`<option value="${region}">
                        ${countryNameMap[region]}
                      </option>`
                  )}
                </select>
              </div>
              <div class="text-center">
                <button
                  type="submit"
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Go
                </button>
              </div>
            </form>
          </div>
        </body>
      </html>`
  );
});

app.get("/r", (c) => {
  const productUrl = c.req.query("url");
  const selectedCountry = c.req.query("region");
  const originCountry = c.req.raw.cf?.country;

  const productId = extractAmazonProductId(productUrl);

  if (!productId) {
    c.status(400);
    return c.json({ msg: "Error. Invalid Amazon product URL" });
  }

  const region = selectedCountry || cfCountryRegionMap[originCountry as string];
  const domain = regionDomainMap[region] || defaultDomain;

  return c.redirect(`https://${domain}/dp/${productId}`);
});

app.get("/r/:id", (c) => {
  const productId = c.req.param("id");
  const selectedCountry = c.req.query("region");
  const originCountry = c.req.raw.cf?.country;

  if (!productId) {
    c.status(400);
    return c.json({ msg: "Error. Invalid Amazon product URL" });
  }

  const region = selectedCountry || cfCountryRegionMap[originCountry as string];
  const domain = regionDomainMap[region] || defaultDomain;

  return c.redirect(`https://${domain}/dp/${productId}`);
});

export default app;
