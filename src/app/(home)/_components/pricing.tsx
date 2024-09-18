import { db } from "@/lib/db";
import React from "react";
import Pricing from "./pricingPlanCard";
import { stripe } from "@/lib/payments/stripe";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

export default async function PricingSection() {
  // await db.plan.deleteMany({});

  // await db.pricing.deleteMany({});
  // await db.subscription.deleteMany({});

  // Monthly Subscription Plans
  

  const session = await getServerSession(options);
  const plans = await db.plan.findMany({
    where: {
      active: true,
    },
    include: {
      pricing: {
        include: {
          subscription: {
            where: {
              userId: session?.user.id,
              status: "ACTIVE",
            },
          },
        },
      },
    },
  });
  const pricing = await db.pricing.findMany({
    where: {
      active: true,
      Plan: {
        none: {},
      },
    },
  });
  return (
    <section id="pricing" className="flex justify-center items-center">
      <div className="w-10/12 flex flex-col items-center gap-4 md:gap-6 xl:gap-8 text-Text py-10 md:py-14 lg:py-16 xl:py-20 2xl:py-24 px-5">
        <p className="text-center text-header md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl font-extrabold">
          Flexible Pricing Plans for Every Translator
        </p>
        <p className="text-center md:w-10/12 text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
          Get accurate translations for your manga or manhwa with Webtoon
          Translator. Using DeepL and advanced language models, we provide
          exceptional results. Enjoy 10 free translations per week with our
          basic plan, or subscribe for more credits. Support our service to help
          us improve.
        </p>
        <div className="">
          <Pricing plans={plans} pricing={pricing} />
        </div>
      </div>
    </section>
  );
}
