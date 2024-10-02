import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/translator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // {
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/tr1_en.webp`,
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/tr1_ko.webp`,
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/tr2_fr.webp`,
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/tr2_ko.webp`,
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/tr3_en.webp`,
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/tr3_pr.webp`,
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
  ];
}
