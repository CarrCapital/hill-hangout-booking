"use client";

// Approximate location map, similar to Airbnb's pre-booking view: shows the
// general area (neighborhood) with a fuzzy circle rather than a precise pin.
// Uses OpenStreetMap tiles via Leaflet. No API key needed.
// Exact address is intentionally not displayed on this page.

import { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lng: number;
  neighborhood: string;
};

export default function LocationMap({ lat, lng, neighborhood }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current || !containerRef.current) return;
    initialised.current = true;

    let destroyed = false;
    let map: unknown = null;

    (async () => {
      // Dynamic import so Leaflet is only loaded client-side.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L: any = await import("leaflet");
      // CSS, loaded as a side-effect style sheet.
      await loadLeafletCss();
      if (destroyed || !containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 14,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).addTo(map as any);

      // Fuzzy circle like Airbnb's pre-booking map.
      L.circle([lat, lng], {
        radius: 250, // meters
        color: "#3F5145",
        weight: 1,
        fillColor: "#3F5145",
        fillOpacity: 0.18,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).addTo(map as any);
    })();

    return () => {
      destroyed = true;
      if (map) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map as any).remove();
      }
    };
  }, [lat, lng]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "280px",
          border: "1px solid var(--line2)",
          background: "var(--paper2)",
        }}
      />
      <p
        style={{
          color: "var(--ink3)",
          fontSize: ".78rem",
          margin: ".6rem 0 0",
        }}
      >
        Approximate area in {neighborhood}. The exact address goes to guests
        once the booking is confirmed.
      </p>
    </div>
  );
}

let cssLoaded = false;
function loadLeafletCss(): Promise<void> {
  if (cssLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'link[data-leaflet-css="1"]',
    ) as HTMLLinkElement | null;
    if (existing) {
      cssLoaded = true;
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.leafletCss = "1";
    link.onload = () => {
      cssLoaded = true;
      resolve();
    };
    link.onerror = () => reject(new Error("Failed to load Leaflet CSS"));
    document.head.appendChild(link);
  });
}
