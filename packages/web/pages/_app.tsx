import React from "react";
import { AppProps } from "next/app";

import "tailwindcss/tailwind.css";

import { IdProvider } from "@radix-ui/react-id";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <IdProvider>
      <Component {...pageProps} />
    </IdProvider>
  );
};

export default App;
