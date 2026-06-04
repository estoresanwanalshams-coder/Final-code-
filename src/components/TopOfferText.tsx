"use client";

import { useEffect, useState } from "react";
import { defaultSiteSettings, fetchSiteSettings } from "@/lib/site-settings";

export function TopOfferText() {
  const [offerText, setOfferText] = useState(defaultSiteSettings.offerText);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchSiteSettings();
        setOfferText(settings.offerText);
      } catch {
        setOfferText(defaultSiteSettings.offerText);
      }
    }

    const timer = window.setTimeout(loadSettings, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return <p className="justify-self-center">{offerText}</p>;
}
