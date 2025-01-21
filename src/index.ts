import { Hono } from "hono";
import { html } from "hono/html";

const app = new Hono();

const countryData: Record<
  string,
  { domain: string; countryName: string; code: string }
> = {
  us: { domain: "amazon.com", countryName: "United States", code: "US" },
  uk: { domain: "amazon.co.uk", countryName: "United Kingdom", code: "GB" },
  in: { domain: "amazon.in", countryName: "India", code: "IN" },
  ca: { domain: "amazon.ca", countryName: "Canada", code: "CA" },
  de: { domain: "amazon.de", countryName: "Germany", code: "DE" },
  nl: { domain: "amazon.nl", countryName: "Netherlands", code: "NL" },
  es: { domain: "amazon.es", countryName: "Spain", code: "ES" },
  sg: { domain: "amazon.sg", countryName: "Singapore", code: "SG" },
  za: { domain: "amazon.co.za", countryName: "South Africe", code: "ZA" },
};

// Default domain
const defaultDomain = countryData["us"].domain;

// Affiliate ID
const tagId = "omarmosid-21";

const getCountryData = (countryCode: unknown) => {
  const country = Object.values(countryData).find(
    (country) => country.code === countryCode
  );
  return country;
};

const extractAmazonProductId = (url?: string) => {
  if (!url) return;
  const regex =
    /(?:\/dp\/|\/gp\/product\/|\/gp\/offer-listing\/|\/ASIN\/)([A-Z0-9]{10})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const getAmazonUrl = (domain: string, productId: string) => {
  return `https://${domain}/dp/${productId}?tag=${tagId}`;
};

// Usage of the consolidated object
app.get("/", (c) => {
  const originCountryCode = c.req.raw.cf?.country;
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
          <meta
            name="description"
            content="Redirect to the correct Amazon region based on your location or chosen country. Simplify your shopping experience with our easy-to-use Amazon Link Redirector."
          />
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
            <p class="items-center my-4">
              Easily find the right Amazon product in your region. Enter a
              product URL, choose a country, and we'll take you straight to the
              correct Amazon site for a seamless shopping experience.
            </p>
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
                    Use my location -
                    ${getCountryData(originCountryCode)?.countryName}
                  </option>
                  ${Object.entries(countryData).map(
                    ([region, { countryName }]) =>
                      html`<option value="${region}">${countryName}</option>`
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

  const region = selectedCountry || originCountry;
  const domain = getCountryData(region as string)?.domain || defaultDomain;
  const redirectUrl = getAmazonUrl(domain, productId);

  return c.redirect(redirectUrl);
});

app.get("/r/:id", (c) => {
  const productId = c.req.param("id");
  const selectedCountry = c.req.query("region");
  const originCountry = c.req.raw.cf?.country;

  if (!productId) {
    c.status(400);
    return c.json({ msg: "Error. Invalid Amazon product URL" });
  }

  const region = selectedCountry || originCountry;
  const domain = getCountryData(region as string)?.domain || defaultDomain;
  const redirectUrl = getAmazonUrl(domain, productId);

  return c.redirect(redirectUrl);
});

export default app;
