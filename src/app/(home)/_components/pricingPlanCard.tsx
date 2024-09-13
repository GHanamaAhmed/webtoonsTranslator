"use client";
import { FaCheck } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import axios from "axios";
import { Slider } from "@/components/ui/slider";
import { Prisma } from "@prisma/client";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { Switch } from "@/components/ui/switch";

// Initialize Stripe with the API key
const stripePromise = loadStripe(process.env.STRIPE_API_KEY!);

interface PricingCardProps {
  id: string;
  duration: string;
  title: string;
  description: string;
  features: string[];
  pricings: Prisma.PricingGetPayload<Prisma.PricingFindUniqueArgs>[];
  isBest?: boolean;
}

interface PricingProps {
  plans: any[];
}

export default function Pricing({ plans }: PricingProps) {
  const [isRecurring, setIsRecurring] = useState(true);

  const handlePlanToggle = (isChecked: boolean) => {
    setIsRecurring(isChecked);
  };

  const renderPlans = (planType: "recurring" | "one-time") => {
    return plans
      .filter((plan) => plan.type === planType)
      .map((plan) => (
        <PricingCard
          key={plan.id}
          id={plan.id}
          pricings={plan.pricing}
          duration={plan.duration || ""}
          title={plan.name}
          description={plan.description}
          features={plan.features}
          isBest={plan.duration === "three-month"} // Logic for highlighting the best plan
        />
      ));
  };

  return (
    <div className="flex flex-col items-center gap-2 md:gap-4 xl:gap-6">
      {/* Recursion Switch */}
      <span className="flex items-center gap-1 md:gap-2 xl:gap-3 my-3 md:my-6 xl:my-10">
        <p
          className={`uppercase text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl font-extrabold ${
            !isRecurring ? "" : "opacity-70"
          }`}
        >
          Unlimited
        </p>
        <Switch
          defaultChecked={true}
          onCheckedChange={handlePlanToggle}
          id="recursion-toggle"
        />
        <p
          className={`uppercase text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl font-extrabold ${
            isRecurring ? "" : "opacity-70"
          }`}
        >
          Recursion
        </p>
      </span>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4 xl:gap-6">
        {isRecurring ? renderPlans("recurring") : renderPlans("one-time")}
      </div>
    </div>
  );
}

const PricingCard: React.FC<PricingCardProps> = ({
  id,
  duration,
  title,
  description,
  features,
  pricings,
  isBest = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentPricingIndex, setCurrentPricingIndex] = useState<number>(0);

  const allPricings = pricings.sort((a, b) => a.maxUsage - b.maxUsage);

  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;

    try {
      const { data } = await axios.post("/api/payments/stripe", {
        planId: id,
        pricingId: allPricings[currentPricingIndex].id,
      });

      const result = await stripe?.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result?.error) {
        console.error("Checkout error:", result.error.message);
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePricingIndex = (index: number) => {
    setCurrentPricingIndex(index);
  };

  return (
    <div
      className={`relative flex flex-col justify-between gap-2 md:gap-3 xl:gap-4 py-5 md:py-9 text-Text lg:py-12 xl:py-14 px-3 md:px-5 xl:px-7 rounded-2xl ${
        isBest ? "bg-gradient-to-br from-Secondary to-Primary" : "bg-Quaternary"
      }`}
    >
      {allPricings.length > 0 ? (
        <>
          {/* Plan Info */}
          <div className="flex flex-col gap-2 md:gap-3 xl:gap-4">
            <p className="flex items-center gap-1 font-medium text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              {(
                allPricings[currentPricingIndex].pricePerUnit *
                allPricings[currentPricingIndex].maxUsage
              ).toFixed(2)}{" "}
              / {duration === "one-time" ? "unlimited" : duration}
            </p>
            <p className="font-medium text-paragraph md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
              {title} - {allPricings[currentPricingIndex].maxUsage} Translations
            </p>
            <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              {description}
            </p>
            {/* Features List */}
            <div className="flex flex-col gap-2 md:gap-3 xl:gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 md:gap-4 xl:gap-5"
                >
                  <span className="rounded-full flex justify-center items-center p-1 xl:p-2 bg-LightBackground bg-opacity-10">
                    <FaCheck className="size-2 md:size-3 xl:size-4 fill-Text" />
                  </span>
                  <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            {pricings.length > 1 && (
              <div className="my-4">
                <label
                  htmlFor="usage-range"
                  className="block text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
                >
                  Max Usage: {allPricings[currentPricingIndex].maxUsage}
                </label>
                <div className="flex items-center w-full gap-4">
                  {/* Minus button */}
                  <button
                    className="p-2"
                    onClick={() => {
                      if (currentPricingIndex === 0) return;
                      updatePricingIndex(currentPricingIndex - 1);
                    }}
                  >
                    <AiOutlineMinus />
                  </button>
                  <Slider
                    id="usage-range"
                    value={[currentPricingIndex]}
                    min={0} // Set min value based on your requirements
                    max={pricings.length - 1} // Set max value based on your requirements
                    step={1}
                    onValueChange={(index) => {
                      updatePricingIndex(index[0]);
                    }}
                    className="mt-2"
                  />
                  {/* Plus button */}
                  <button
                    className="p-2"
                    onClick={() => {
                      if (currentPricingIndex >= allPricings.length - 1) return;
                      updatePricingIndex(currentPricingIndex + 1);
                    }}
                  >
                    <AiOutlinePlus />
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={handleCheckout}
              className="w-full py-2 px-5 text-Text bg-Primary rounded-full text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
            >
              {loading ? "Loading..." : "Subscribe"}
            </button>
          </div>
        </>
      ) : (
        <p>No pricing available</p>
      )}
    </div>
  );
};
