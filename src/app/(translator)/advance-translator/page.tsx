import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

/**
 * disable ssr to avoid pre-rendering issues of Next.js
 *
 * we're doing this because we're using a canvas element that can't be pre-rendered by Next.js on the server
 */
// const App = dynamic(() => import("./_components/translator"), { ssr: false });
const App = () => {
  return notFound();
};

export default App;
