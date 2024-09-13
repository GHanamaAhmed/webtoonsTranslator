import { db } from "@/lib/db";
import React from "react";
import Pricing from "./pricingPlanCard";
import { stripe } from "@/lib/payments/stripe";
export default async function PricingSection() {
  // Onetime Plan
  // await db.plan.create({
  //   data: {
  //     name: "Onetime",
  //     description:
  //       "A one-time purchase plan with lasting credits and priority support.",
  //     duration: "one-time",
  //     type: "one-time",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "No Limit Duration",
  //       "Better Translations",
  //       "One-time purchase",
  //     ],
  //     pricing: {
  //       create: [
  //         { pricePerUnit: 0.0198, maxUsage: 50 },
  //       ],
  //     },
  //   },
  // });
  // await db.plan.create({
  //   data: {
  //     name: "Onetime",
  //     description:
  //       "A one-time purchase plan with lasting credits and priority support.",
  //     duration: "one-time",
  //     type: "one-time",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "No Limit Duration",
  //       "Better Translations",
  //       "One-time purchase",
  //     ],
  //     pricing: {
  //       create: [
  //         { pricePerUnit: 0.01, maxUsage: 500 },
  //       ],
  //     },
  //   },
  // });
  // await db.plan.create({
  //   data: {
  //     name: "Onetime",
  //     description:
  //       "A one-time purchase plan with lasting credits and priority support.",
  //     duration: "one-time",
  //     type: "one-time",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "No Limit Duration",
  //       "Better Translations",
  //       "One-time purchase",
  //     ],
  //     pricing: {
  //       create: [
  //         { pricePerUnit: 0.00909090909, maxUsage: 1100 },
  //       ],
  //     },
  //   },
  // });

  // await db.plan.create({
  //   data: {
  //     name: "Onetime",
  //     description:
  //       "A one-time purchase plan with lasting credits and priority support.",
  //     duration: "one-time",
  //     type: "one-time",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "No Limit Duration",
  //       "Better Translations",
  //       "One-time purchase",
  //     ],
  //     pricing: {
  //       create: [
  //         { pricePerUnit: 0.008, maxUsage: 3000 },
  //       ],
  //     },
  //   },
  // });
  // await db.plan.create({
  //   data: {
  //     name: "Onetime",
  //     description:
  //       "A one-time purchase plan with lasting credits and priority support.",
  //     duration: "one-time",
  //     type: "one-time",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "No Limit Duration",
  //       "Better Translations",
  //       "One-time purchase",
  //     ],
  //     pricing: {
  //       create: [
  //         { pricePerUnit: 0.0075, maxUsage: 8000 },
  //       ],
  //     },
  //   },
  // });
  // await db.plan.create({
  //   data: {
  //     name: "Onetime",
  //     description:
  //       "A one-time purchase plan with lasting credits and priority support.",
  //     duration: "one-time",
  //     type: "one-time",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "No Limit Duration",
  //       "Better Translations",
  //       "One-time purchase",
  //     ],
  //     pricing: {
  //       create: [
  //          { pricePerUnit: 0.007, maxUsage: 16000 },
  //       ],
  //     },
  //   },
  // });

  // // Weekly Plan
  // await db.plan.create({
  //   data: {
  //     name: "Weekly",
  //     description:
  //       "A weekly subscription plan with priority features and support.",
  //     duration: "week",
  //     type: "recurring",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "Better Translations",
  //       "Weekly credits package",
  //     ],
  //     pricing: {
  //       create: [
  //         { pricePerUnit: 0.01, maxUsage: 300 },
  //         { pricePerUnit: 0.009, maxUsage: 600 },
  //         { pricePerUnit: 0.008, maxUsage: 1200 },
  //         { pricePerUnit: 0.007, maxUsage: 2500 },
  //       ],
  //     },
  //   },
  // });

  // // Monthly Plan
  // await db.plan.create({
  //   data: {
  //     name: "Monthly",
  //     description:
  //       "A monthly subscription plan with comprehensive features and support.",
  //     duration: "month",
  //     type: "recurring",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "Better Translations",
  //       "Monthly credits package",
  //     ],
  //     pricing: {
  //       create: [
  //         { pricePerUnit: 0.009, maxUsage: 1500 },
  //         { pricePerUnit: 0.008, maxUsage: 3000 },
  //         { pricePerUnit: 0.0075, maxUsage: 5000 },
  //         { pricePerUnit: 0.007, maxUsage: 8000 },
  //       ],
  //     },
  //   },
  // });

  // // Three Month Plan
  // await db.plan.create({
  //   data: {
  //     name: "Three Month",
  //     description:
  //       "A three-month subscription plan with extended access and premium features.",
  //     duration: "three-month",
  //     type: "recurring",
  //     features: [
  //       "Priority",
  //       "Model",
  //       "Better Translations",
  //       "Three-month credits package",
  //     ],
  //     pricing: {
  //       create: [
  //         { pricePerUnit: 0.0075, maxUsage: 6000 },
  //         { pricePerUnit: 0.007, maxUsage: 9000 },
  //         { pricePerUnit: 0.0065, maxUsage: 12000 },
  //         { pricePerUnit: 0.006, maxUsage: 20000 },
  //       ],
  //     },
  //   },
  // });

  // await db.plan.deleteMany({});
  const plans = await db.plan.findMany({
    where: {
      active: true,
    },
    include: {
      pricing: true,
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
          <Pricing plans={plans} />
        </div>
      </div>
    </section>
  );
}
