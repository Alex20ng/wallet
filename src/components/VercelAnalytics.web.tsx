import { inject } from "@vercel/analytics";
import { useEffect } from "react";

export default function VercelAnalytics() {
  useEffect(() => {
    inject();
  }, []);

  return null;
}
