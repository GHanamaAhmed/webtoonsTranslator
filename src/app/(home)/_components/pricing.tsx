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

  // await db.plan.create({
  //   data: {
  //     interval: "MONTHLY", // Recurring monthly plan
  //     pricing: {
  //       create: {
  //         name: "Basic",
  //         description:
  //           "A basic monthly subscription with normal support and essential features.",
  //         features: [
  //           "Normal Support", // Basic level of support
  //           "Basic Model Access",
  //           "Improved Translations",
  //           "Monthly credits package",
  //         ],
  //         pricePerUnit: 0.009,
  //         maxQuantity: 2000,
  //         active: true,
  //         index: 0,
  //       },
  //     },
  //   },
  // });

  // // Premium Monthly Plan
  // await db.plan.create({
  //   data: {
  //     interval: "MONTHLY", // Recurring monthly plan
    //         isBest: true, // Highlighting as the best plan

  //     pricing: {
  //       create: {
  //         name: "Premium",
  //         description:
  //           "A premium monthly subscription offering priority support and enhanced features.",
  //         features: [
  //           "Priority Support", // Better than normal support
  //           "Premium Model Access",
  //           "Enhanced Translations",
  //           "Larger Monthly credits package",
  //         ],
  //         pricePerUnit: 0.007,
  //         maxQuantity: 6000,
  //      active: true,
  //         index: 1,
  //       },
  //     },
  //   },
  // });

  // // Standard Monthly Plan
  // await db.plan.create({
  //   data: {
  //     interval: "MONTHLY", // Recurring monthly plan
  //     pricing: {
  //       create: {
  //         name: "Standard",
  //         description:
  //           "A standard monthly subscription offering premium support, extended access, and advanced features.",
  //         features: [
  //           "Premium Support", // Premium support for standard plan
  //           "Premium Model Access",
  //           "Enhanced Translations",
  //           "Monthly credits package",
  //         ],

  //         pricePerUnit: 0.008,
  //         maxQuantity: 4000,
  //         active: true,
  //         index: 2,
  //       },
  //     },
  //   },
  // });

  // // Basic One-Time Purchase Plan
  // const pricingOnetimeTier1 = await db.pricing.create({
  //   data: {
  //     name: "Basic One-Time",
  //     description:
  //       "A one-time purchase plan with normal support and lasting credits.",
  //     features: [
  //       "Normal Support", // Basic support for the one-time plan
  //       "Basic Model Access",
  //       "No Expiration",
  //       "Improved Translations",
  //       "One-time purchase",
  //     ],
  //     pricePerUnit: 0.0198,
  //     maxQuantity: 50,
  //     active: true,
  //     index: 0,
  //   },
  // });

  // // Premium One-Time Purchase Plan
  // const pricingOnetimeTier2 = await db.pricing.create({
  //   data: {
  //     name: "Premium One-Time",
  //     description:
  //       "A one-time purchase plan with priority support and higher credits.",
  //     features: [
  //       "Priority Support", // Premium support for the best one-time plan
  //       "Premium Model Access",
  //       "No Expiration",
  //       "Enhanced Translations",
  //       "One-time purchase",
  //     ],
  //     pricePerUnit: 0.008,
  //     maxQuantity: 4000,
  //     active: true,
  //     index: 1,
  //     isBest: true, // Marking as the best one-time purchase
  //   },
  // });

  // // Standard One-Time Purchase Plan (New Plan)
  // const pricingOnetimeTier3 = await db.pricing.create({
  //   data: {
  //     name: "Standard One-Time",
  //     description:
  //       "A one-time purchase plan with premium support and extended credits.",
  //     features: [
  //       "Premium Support", // Premium support for standard one-time plan
  //       "Premium Model Access",
  //       "No Expiration",
  //       "Enhanced Translations",
  //       "One-time purchase",
  //     ],
  //     pricePerUnit: 0.009,
  //     maxQuantity: 1110,
  //     active: true,
  //     index: 2,
  //   },
  // });

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
