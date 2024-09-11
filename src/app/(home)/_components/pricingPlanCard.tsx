"use client";
import { FaCheck } from "react-icons/fa"; // Import the icons
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import axios from "axios";
import { Slider } from "@/components/ui/slider";
import { Prisma } from "@prisma/client";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

const stripePromise = loadStripe(`${process.env.STRIPE_API_KEY}`);

interface PricingPlanProps {
  id: string;
  duration: string;
  title: string;
  description: string;
  features: string[];
  pricings: Prisma.PricingGetPayload<Prisma.PricingFindUniqueArgs>[]; // Add maxUsage to the props
  isBest?: boolean; // Optional prop to indicate if this is the best plan
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  id,
  duration,
  title,
  description,
  features,
  pricings,
  isBest = false,
}) => {
  const [loading, setLoading] = useState(false);
  const allPricings = pricings.sort((a, b) => a.maxUsage - b.maxUsage);
  const [currentPricingIndex, setCurrentPricingIndex] = useState<number>(0);
  const handleCheckout = async () => {
    setLoading(true);

    const stripe = await stripePromise;

    const res = await axios.post("/api/payments/stripe", {
      planId: id,
      pricingId: allPricings[currentPricingIndex].id, // Include currentUsage in the request
    });

    const { sessionId } = res.data;

    // Redirect to Stripe Checkout
    const result = await stripe?.redirectToCheckout({
      sessionId: sessionId,
    });

    if (result?.error) {
      console.error("Error:", result.error);
    }

    setLoading(false);
  };

  // Helper function to update the pricing based on maxUsage
  const updatePricingIndex = (index: number) => {
    setCurrentPricingIndex(index);
  };
  return (
    <div
      className={`relative flex flex-col gap-2 md:gap-3 xl:gap-4 py-5 md:py-9 text-Text lg:py-12 xl:py-14 px-3 md:px-5 xl:px-7 rounded-2xl ${
        isBest ? "bg-gradient-to-br from-Secondary to-Primary" : "bg-Quaternary"
      }`}
    >
      {currentPricingIndex >= 0 ? (
        <>
          <p className="items-center flex gap-1 font-medium text-header md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl">
            {(
              allPricings[currentPricingIndex].pricePerUnit *
              allPricings[currentPricingIndex].maxUsage
            ).toFixed(2)}{" "}
            /{" "}
            <span className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              {duration}
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
                <span className="rounded-full flex justify-center items-center p-1 xl:p-2 bg-LightBackground bg-opacity-10">
                  <FaCheck className="size-2 md:size-3 xl:size-5 fill-Text" />
                </span>
                <p className="text-Text text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
                  {feature}
                </p>
              </div>
            ))}
          </div>
          <div className="my-4">
            <label
              htmlFor="usage-range"
              className="block text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
            >
              Max Usage: {allPricings[currentPricingIndex].maxUsage} /{" "}
              {allPricings[currentPricingIndex].pricePerUnit.toPrecision(2)} per
              transaltion
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
          <button
            onClick={handleCheckout}
            className="py-2 px-5 text-Text bg-Primary rounded-full text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
          >
            {loading ? "Loading..." : "Subscribe"}
          </button>
        </>
      ) : (
        <p>No pricing available</p>
      )}
    </div>
  );
};

export default PricingPlan;
