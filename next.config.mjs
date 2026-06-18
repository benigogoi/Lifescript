/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Puppeteer / chromium are only loaded inside server route handlers for PDF
  // generation; keep them out of the client/server bundle tracing so Next does
  // not try to bundle the headless browser binary.
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
