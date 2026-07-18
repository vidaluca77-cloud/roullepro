import { AUTHORS } from "@/lib/authors";
import { BASE_URL, jsonLdHtml } from "@/lib/seo-schema";
import type { FaqItem } from "@/app/guides/_components/FaqAccordion";

type ItemListEntry = { name: string; url?: string };

type Props = {
  slug: string;
  title: string;
  description: string;
  breadcrumbLabel: string;
  publishedAt: string;
  updatedAt: string;
  faq?: FaqItem[];
  itemList?: ItemListEntry[];
};

/**
 * JSON-LD du dossier SEFi : Article + BreadcrumbList systématiques, FAQPage et
 * ItemList optionnels selon la page. URLs canoniques non-www (BASE_URL).
 */
export default function SefiJsonLd(props: Props) {
  const url = `${BASE_URL}/transport-medical/${props.slug}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    datePublished: props.publishedAt,
    dateModified: props.updatedAt,
    author: AUTHORS["lucas-horville"],
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
        name: "Transport médical",
        item: `${BASE_URL}/transport-medical`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: props.breadcrumbLabel,
        item: url,
      },
    ],
  };

  const faqLd = props.faq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: props.faq.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }
    : null;

  const itemListLd = props.itemList
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: props.title,
        itemListElement: props.itemList.map((it, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: it.name,
          ...(it.url ? { url: it.url } : {}),
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }}
        />
      )}
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(itemListLd) }}
        />
      )}
    </>
  );
}
