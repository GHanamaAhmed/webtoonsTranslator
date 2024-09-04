"use client";

import { ClientSideSuspense } from "@liveblocks/react";

import Loader from "./Loader";

const LiveblocksSuspense = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClientSideSuspense fallback={<Loader />}>
      {() => children}
    </ClientSideSuspense>
  );
};

export default LiveblocksSuspense;
