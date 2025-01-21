import { Hono } from "hono";
import { html } from "hono/html";

const app = new Hono();

const regionDomainMap: Record<string, string> = {
  us: "amazon.com",
  uk: "amazon.co.uk",
  in: "amazon.in",
};

const cfCountryRegionMap: Record<string, string> = {
  GB: "uk",
  US: "us",
  IN: "in",
};

const defaultDomain = regionDomainMap["us"];

const getDomain = (countryCode: unknown) => {
  if (!countryCode) return;
  const region = cfCountryRegionMap[countryCode as string];
  if (!region) return;
  else return regionDomainMap[region];
};

app.get("/", (c) => {
  return c.html(
    html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Amazon Link Redirector</title>
        </head>
        <body>
          <h1>Amazon Link Redirector</h1>
          <form action="/r" method="GET">
            <div>
              <label for="amazon-id">Search by Amazon ID</label>
            </div>
            <div>
              <input type="text" id="amazon-id" name="id" required />
              <button type="submit">Go</button>
            </div>
          </form>
        </body>
      </html>
    `
  );
});

app.get("/r", (c) => {
  const id = c.req.query("id");
  const originCountry = c.req.raw.cf?.country;
  const domain = getDomain(originCountry);

  if (!id) {
    c.status(400);
    return c.json({ msg: "Error. No ID supplied as URL Param" });
  }

  if (!domain) {
    return c.redirect(`https://${defaultDomain}/dp/${id}`);
  }
  return c.redirect(`https://${domain}/dp/${id}`);
});

app.get("/r/:id/:region", (c) => {
  const { id, region } = c.req.param();

  if (!id) {
    c.status(400);
    return c.json({
      msg: "Error. No ID supplied as URL Param",
    });
  }

  if (!region) {
    return c.redirect(`https://${defaultDomain}/dp/${id}`);
  }

  const domain = regionDomainMap[region];

  if (domain) {
    return c.redirect(`https://${domain}/dp/${id}`);
  } else {
    return c.redirect(`https://${defaultDomain}/dp/${id}`);
  }
});

export default app;
