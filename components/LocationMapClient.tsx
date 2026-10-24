"use client";

// Leaflet-based approximate-area map. Only rendered in the browser (loaded via
// next/dynamic with ssr: false from LocationMap.tsx).

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
  neighborhood: string;
};

export default function LocationMapClient({ lat, lng, neighborhood }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    L.circle([lat, lng], {
      radius: 250, // meters
      color: "#3F5145",
      weight: 1,
      fillColor: "#3F5145",
      fillOpacity: 0.18,
    }).addTo(map);

    // Force Leaflet to re-measure after mount in case layout shifts.
    const t = setTimeout(() => map.invalidateSize(), 100);

    return () => {
      clearTimeout(t);
      map.remove();
    };
  }, [lat, lng]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "320px",
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
        once their booking is confirmed.
      </p>
    </div>
  );
}
