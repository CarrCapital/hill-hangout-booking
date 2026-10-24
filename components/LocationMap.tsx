"use client";
// Client shell; the real map is loaded only in the browser via next/dynamic
// to avoid "window is not defined" during Next.js SSR. Must be "use client"
// in Next.js 15 App Router since ssr:false is not allowed in server
// components.

import dynamic from "next/dynamic";

type Props = {
  lat: number;
  lng: number;
  neighborhood: string;
};

const Client = dynamic(() => import("./LocationMapClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "320px",
        border: "1px solid var(--line2)",
        background: "var(--paper2)",
      }}
    />
  ),
});

export default function LocationMap(props: Props) {
  return <Client {...props} />;
}
