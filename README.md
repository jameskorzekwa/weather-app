This is a [Next.js](https://nextjs.org/) project bootstrapped with
[`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

You can start editing the page by modifying `app/page.tsx`. The page
auto-updates as you edit the file.

This project uses
[`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to
automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out
[the Next.js GitHub repository](https://github.com/vercel/next.js/) - your
feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the
[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our
[Next.js deployment documentation](https://nextjs.org/docs/deployment) for more
details.

## Run as a Home Assistant add-on

This repo doubles as a Home Assistant add-on repository. The add-on packages
the same Next.js build into a Docker image that runs behind HA's ingress
proxy, so it appears as a sidebar panel without any custom dashboard setup.

To install:

1. In Home Assistant: **Settings → Add-ons → Add-on Store**.
2. Click the ⋮ menu → **Repositories**, paste this repo's URL, then **Add**.
3. Install the **Weather App** add-on, fill in the **Configuration** tab
   (lat/lon, API keys, etc.), and **Start** it.

The add-on files live in [`homeassistant/`](./homeassistant/). Docker images
are built and pushed to GHCR by
[`.github/workflows/build.yaml`](./.github/workflows/build.yaml) on every
push to `main` and on tagged releases — nothing about the Vercel deploy
changes.

See [`homeassistant/DOCS.md`](./homeassistant/DOCS.md) for the full options
reference.
