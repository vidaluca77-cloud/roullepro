import type { FaqItem } from "./FaqAccordion";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type Props = {
  slug: string;
  title: string;
  description: string;
  breadcrumbLabel: string;
  publishedAt: string; // ISO
  updatedAt: string; // ISO
  faq: FaqItem[];
};

export default function JsonLd(props: Props) {
  const url = `${BASE_URL}/guides/${props.slug}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    datePublished: props.publishedAt,
    dateModified: props.updatedAt,
    author: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo-roullepro-circle.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${BASE_URL}/logo-roullepro-horizontal.png`,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${BASE_URL}/guides/transport-sanitaire-conformite-2026-2027`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: props.breadcrumbLabel,
        item: url,
      },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: props.faq.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </>
  );
}
