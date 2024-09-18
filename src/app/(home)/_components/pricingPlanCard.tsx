"use client";
import { FaCheck } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Slider } from "@/components/ui/slider";
import { Prisma } from "@prisma/client";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { Switch } from "@/components/ui/switch";
import { DialogContext } from "@/components/alertDialog";

// Initialize Stripe with the API key
const stripePromise = loadStripe(process.env.STRIPE_API_KEY!);

interface PricingProps {
  plans: Prisma.PlanGetPayload<{
    include: {
      pricing: {
        include: {
          subscription: true;
        };
      };
    };
  }>[];
  pricing: Prisma.PricingGetPayload<Prisma.PricingFindManyArgs>[];
}

export default function Pricing({ plans, pricing }: PricingProps) {
  const [isRecurring, setIsRecurring] = useState(true);

  const handlePlanToggle = (isChecked: boolean) => {
    setIsRecurring(isChecked);
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
          One-Time
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
          Reccuring
        </p>
      </span>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4 xl:gap-6">
        {!isRecurring &&
          pricing.map((pricing, index) => (
            <PricingCard key={pricing.id} {...pricing} />
          ))}
        {isRecurring &&
          plans.map((plan, index) => <PlanCard key={plan.id} {...plan} />)}
      </div>
    </div>
  );
}

const PricingCard: React.FC<
  Prisma.PricingGetPayload<Prisma.PricingFindManyArgs>
> = ({
  description,
  discount,
  features,
  id,
  index,
  isBest,
  maxQuantity,
  name,
  planId,
  pricePerUnit,
}) => {
  const [loading, setLoading] = useState(false);
  const dialog = useContext(DialogContext);
  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;

    try {
      const { data } = await axios.post("/api/payments/stripe", {
        pricingId: id,
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
  return (
    <div
      className={`relative flex flex-col justify-between gap-2 md:gap-3 xl:gap-4 py-5 md:py-9 text-Text lg:py-12 xl:py-14 px-3 md:px-5 xl:px-7 rounded-2xl ${
        isBest ? "bg-gradient-to-br from-Secondary to-Primary" : "bg-Quaternary"
      }`}
    >
      <>
        {/* Plan Info */}
        <div className="flex flex-col gap-2 md:gap-3 xl:gap-4">
          <p className="flex items-center gap-1 font-medium text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
            {(maxQuantity * pricePerUnit).toFixed(2)}$ /{"One-Time"}
          </p>
          <p className="font-medium text-paragraph md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
            {name} - {maxQuantity} Translations
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
          <button
            onClick={handleCheckout}
            className="w-full py-2 px-5 text-Text bg-Primary rounded-full text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
          >
            {loading ? "Loading..." : "Buy Now"}
          </button>
        </div>
      </>
    </div>
  );
};

const PlanCard: React.FC<
  Prisma.PlanGetPayload<{
    include: {
      pricing: {
        include: {
          subscription: true;
        };
      };
    };
  }>
> = ({ id, interval, isBest, index, pricing, pricingId }) => {
  const [loading, setLoading] = useState(false);
  const dialog = useContext(DialogContext);
  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;

    try {
      const { data } = await axios.post("/api/payments/stripe", {
        pricingId: id,
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

  const cancelSubscription = () => {
    dialog.open({
      message:
        "After unsubscribing, you can continue using the service until the current billing period ends.",
      title: "Canceling Your Subscription",
      async onOK() {
        setLoading(true);
        try {
          await axios.delete("/api/payments/stripe/subscription", {
            data: {},
          });
        } catch (error) {
          console.error("Error cancelling subscription:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };
  const reSubscription = async () => {
    setLoading(true);
    try {
      await axios.put("/api/payments/stripe/subscription", {});
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className={`relative flex flex-col justify-between gap-2 md:gap-3 xl:gap-4 py-5 md:py-9 text-Text lg:py-12 xl:py-14 px-3 md:px-5 xl:px-7 rounded-2xl ${
        isBest ? "bg-gradient-to-br from-Secondary to-Primary" : "bg-Quaternary"
      }`}
    >
      <>
        {/* Plan Info */}
        <div className="flex flex-col gap-2 md:gap-3 xl:gap-4">
          <p className="capitalize flex items-center gap-1 font-medium text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
            {pricing.maxQuantity * pricing.pricePerUnit}$ /
            {interval.toLocaleLowerCase()}
          </p>
          <p className="font-medium text-paragraph md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
            {pricing.name} - {pricing.maxQuantity} Translations
          </p>
          <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
            {pricing.description}
          </p>
          {/* Features List */}
          <div className="flex flex-col gap-2 md:gap-3 xl:gap-4">
            {pricing.features.map((feature, index) => (
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
          <button
            onClick={handleCheckout}
            className="w-full py-2 px-5 text-Text bg-Primary rounded-full text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
          >
            {loading ? "Loading..." : "Subscribe"}
          </button>
        </div>
      </>
    </div>
  );
};
