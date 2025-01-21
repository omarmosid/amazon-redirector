# Amazon Link Redirector

Easily find the right Amazon product in your region. Enter a
product URL, choose a country, and it will take you straight to the
correct Amazon site for a seamless shopping experience.

## Run locally

```
npm install
npm run dev
```

```
npm run deploy
```

## Endpoints

### Using URL

```
https://amzn.omarmo.com/r?url=https://www.amazon.co.uk/dp/1780338376
```

Force a region

```
https://amzn.omarmo.com/r?url=https://www.amazon.co.uk/dp/1780338376&region=de
```

### Using ID

```
https://amzn.omarmo.com/r/1780338376
```

Force a region

```
https://amzn.omarmo.com/r/1780338376?region=de
```
