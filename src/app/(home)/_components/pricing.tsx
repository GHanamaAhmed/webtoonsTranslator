import { db } from "@/lib/db";
import React from "react";
import Pricing from "./pricingPlanCard";
import { stripe } from "@/lib/payments/stripe";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

export default async function PricingSection() {
  // await db.pricing.deleteMany({});
  // await db.plan.deleteMany({});
  // await db.subscription.deleteMany({});
  // Weekly Plan Pricing

  // await db.plan.create({
  //   data: {
  //     interval: "WEEKLY", // Use the correct enum for weekly
  //     pricing: {
  //       create: {
  //         name: "Weekly",
  //         description:
  //           "A weekly subscription plan with priority features and support.",
  //         features: [
  //           "Priority",
  //           "Model",
  //           "Better Translations",
  //           "Weekly credits package",
  //         ],
  //         pricePerUnit: 0.01,
  //         maxQuantity: 300,
  //         active: true,
  //       },
  //     },
  //   },
  // });

  // await db.plan.create({
  //   data: {
  //     interval: "MONTHLY", // Use the correct enum for monthly
  //     pricing: {
  //       create: {
  //         name: "Monthly",
  //         description:
  //           "A monthly subscription plan with comprehensive features and support.",
  //         features: [
  //           "Priority",
  //           "Model",
  //           "Better Translations",
  //           "Monthly credits package",
  //         ],
  //         pricePerUnit: 0.009,
  //         maxQuantity: 1500,
  //         active: true,
  //       },
  //     },
  //   },
  // });

  // await db.plan.create({
  //   data: {
  //     interval: "THREE_MONTHLY", // Use the correct enum for three months
  //     pricing: {
  //       create: {
  //         name: "Three Month",
  //         description:
  //           "A three-month subscription plan with extended access and premium features.",
  //         features: [
  //           "Priority",
  //           "Model",
  //           "Better Translations",
  //           "Three-month credits package",
  //         ],
  //         pricePerUnit: 0.0075,
  //         maxQuantity: 6000,
  //         active: true,
  //       },
  //     },
  //   },
  // });
  // Create pricing for different tiers in one-time plan
  // const pricingOnetimeTier1 = await db.pricing.create({
  //   data: {
  //     name: "Onetime",
  //     description: "A one-time purchase plan with lasting credits and priority support.",
  //     features: ["Priority", "Model", "No Limit Duration", "Better Translations", "One-time purchase"],
  //     pricePerUnit: 0.0198,
  //     maxQuantity: 50,
  //     active: true,
  //   },
  // });

  // const pricingOnetimeTier2 = await db.pricing.create({
  //   data: {
  //     name: "Onetime",
  //     description: "A one-time purchase plan with lasting credits and priority support.",
  //     features: ["Priority", "Model", "No Limit Duration", "Better Translations", "One-time purchase"],
  //     pricePerUnit: 0.01,
  //     maxQuantity: 500,
  //     active: true,
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
      planId: null,
    },
  });
  console.log(plans);
  console.log(pricing);

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
