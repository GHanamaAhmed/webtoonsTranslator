import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

export default function FAQ() {
  return (
    <section id="FAQ" className="flex justify-center items-center bg-DarkBackground2">
      <div className=" w-full md:w-10/12 flex flex-col items-center gap-4 md:gap-6 xl:gap-8 text-Text py-10 md:py-14 lg:py-16 xl:py-20 2xl:py-24 px-5">
        <p className="text-center text-header md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl font-extrabold">
          Frequently Asked Questions (FAQ)
        </p>
        <Accordion
          className="w-full"
          type="multiple"
          defaultValue={Array.from({ length: 6 }, (_, i) => `item-${i + 1}`)}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
              What is ManhwaVision AI?
            </AccordionTrigger>
            <AccordionContent className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              ManhwaVision AI is an innovative platform that enables users to
              translate  manga and webtoons into multiple languages. Our advanced
              text recognition and translation tools allow you to read your
              favorite comics in your preferred language or translate them for
              others to enjoy.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
              What languages are supported for translation?
            </AccordionTrigger>
            <AccordionContent className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              ManhwaVision AI supports a wide range of languages, including
              but not limited to English, Korean, Japanese, Chinese, Spanish,
              French, and Arabic. We are continuously working to add more
              languages to ensure a comprehensive translation service.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
              Is ManhwaVision AI free to use?
            </AccordionTrigger>
            <AccordionContent className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              We offer both free and premium plans. Our free plan allows users
              to translate a limited number of pages per month. For users who
              need more extensive translation capabilities, our premium plans
              provide unlimited access to all features, including high-quality
              translation, bulk processing, and more.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
              How accurate are the translations provided?
            </AccordionTrigger>
            <AccordionContent className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              Our translations are powered by advanced AI and natural language
              processing technologies, which provide highly accurate results.
              However, as with any automated translation service, there may be
              nuances or cultural references that require manual adjustment. We
              encourage users to review translations to ensure the highest
              quality.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
              How do translation points work?
            </AccordionTrigger>
            <AccordionContent className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              Translation points are a way to manage the usage of our
              translation services. Each time you translate an image, one
              translation point is used. Free plan users receive a set number of
              translation points each month, which they can use to translate a
              specific number of images. If you run out of points, you can
              either wait until the next month for your points to renew or
              upgrade to a premium plan, which offers more points or unlimited
              translations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
              How can I contact customer support?
            </AccordionTrigger>
            <AccordionContent className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              If you have any questions or need assistance, you can reach our
              customer support team through the contact form on our website or
              by emailing support@manhwavision.com. We are here to help and
              will respond to your inquiry as soon as possible.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
