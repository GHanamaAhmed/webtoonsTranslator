"use client";
import React, { useEffect, useState } from "react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function NProgressBar() {
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    const interval = setTimeout(() => {
      setColor((prevColor) =>
        prevColor === "#ffffff" ? "#112D57" : "#ffffff"
      );
    }, 0);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ProgressBar
        height="4px"
        color={color}
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
