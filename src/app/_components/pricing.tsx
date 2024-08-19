import React from "react";
import { FaCheck } from "react-icons/fa";
interface PricingPlanProps {
  price: string;
  frequency: string;
  title: string;
  description: string;
  features: string[];
  isBest?: boolean; // Optional prop to indicate if this is the best plan
}

export default function Pricing() {
  return (
    <section className="flex justify-center items-center">
      <div className="w-full md:w-10/12 flex flex-col items-center gap-4 md:gap-6 xl:gap-8 text-text py-10 md:py-14 lg:py-16 xl:py-20 2xl:py-24 px-5">
        <p className="text-center text-header md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl font-extrabold">
          High-Quality Translations for Raw Manga{" "}
        </p>
        <p className="text-center md:w-10/12 text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
          Get accurate translations for your manga or manhwa with Webtoon
          Translator. Using DeepL and advanced language models, we provide
          exceptional results. Enjoy 10 free translations per week with our
          basic plan, or subscribe for more credits. Support our service to help
          us improve.
        </p>
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 xl:gap-6">
          <PricingPlan
            price="$3.99"
            frequency="month"
            title="Company"
            description="Automation plus enterprise-grade features."
            features={[
              "Multi-step Zap",
              "Feature 2",
              "Feature 3",
              "Feature 4",
              "Feature 5",
            ]}
          />
          <PricingPlan
            price="$3.99"
            frequency="month"
            title="Company"
            description="Automation plus enterprise-grade features."
            features={[
              "Multi-step Zap",
              "Feature 2",
              "Feature 3",
              "Feature 4",
              "Feature 5",
            ]}
            isBest={true} // This will apply the gradient background
          />

          <PricingPlan
            price="$3.99"
            frequency="month"
            title="Company"
            description="Automation plus enterprise-grade features."
            features={[
              "Multi-step Zap",
              "Feature 2",
              "Feature 3",
              "Feature 4",
              "Feature 5",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  price,
  frequency,
  title,
  description,
  features,
  isBest = false,
}) => {
  return (
    <div
      className={`relative flex flex-col gap-2 md:gap-3 xl:gap-4 py-5 md:py-9 text-white lg:py-12 xl:py-14 px-3 md:px-5 xl:px-12 rounded-2xl ${
        isBest
          ? "bg-gradient-to-br from-secondary to-primary"
          : "bg-quaternary "
      }`}
    >
      <p className="items-center flex gap-1 font-medium text-header md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl">
        {price} /{" "}
        <span className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
          {frequency}
        </span>
      </p>
      <p className="font-medium text-header md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
        {title}
      </p>
      <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
        {description}
      </p>
      <div className="flex flex-col gap-2 md:gap-3 xl:gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-3 md:gap-4 xl:gap-5"
          >
            <span className="rounded-full flex justify-center items-center p-1 xl:p-2 bg-text bg-opacity-10">
              <FaCheck className="size-2 md:size-3 xl:size-5 fill-text" />
            </span>
            <p className="text-text text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              {feature}
            </p>
          </div>
        ))}
      </div>
      <button className="py-2 px-5 text-text bg-primary rounded-full text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
        Choose plan
      </button>
    </div>
  );
};
