"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Google Ads Conversion Tracking ID (AW-XXXXXXXXXX)
const GOOGLE_ADS_ID = "AW-18107104211";

export default function GoogleAnalytics() {
  // On charge la balise Google Ads meme si GA4 n'est pas configure
  const primaryId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="google-tags-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag("js", new Date());
          ${GA_MEASUREMENT_ID ? `gtag("config", "${GA_MEASUREMENT_ID}", {
            anonymize_ip: true,
            cookie_flags: "SameSite=None;Secure"
          });` : ""}
          gtag("config", "${GOOGLE_ADS_ID}");
        `}
      </Script>
    </>
  );
}
