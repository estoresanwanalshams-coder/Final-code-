"use client";

import dynamic from "next/dynamic";

const FloatingActions = dynamic(
  () => import("@/components/FloatingActions").then((module) => module.FloatingActions),
  { ssr: false },
);
const FloatingWhatsApp = dynamic(
  () => import("@/components/FloatingWhatsApp").then((module) => module.FloatingWhatsApp),
  { ssr: false },
);

export function ClientFloatingWidgets() {
  return (
    <>
      <FloatingActions />
      <FloatingWhatsApp />
    </>
  );
}
