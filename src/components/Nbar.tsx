"use client";
import React from "react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function NProgressBar() {
  return (
    <ProgressBar
      height="4px"
      color="#112D57"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
