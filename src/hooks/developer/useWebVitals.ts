import { useState, useEffect } from "react";
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";

interface VitalsData {
  lcp: number | null;
  lcp_rating: string;
  fcp: number | null;
  fcp_rating: string;
  cls: number | null;
  cls_rating: string;
  inp: number | null;
  inp_rating: string;
  ttfb: number | null;
  ttfb_rating: string;
}

interface VitalEntry {
  name: string;
  value: number;
  rating: string;
  timestamp: number;
}

export function useWebVitals() {
  const [vitals, setVitals] = useState<VitalsData>({
    lcp: null,
    lcp_rating: "good",
    fcp: null,
    fcp_rating: "good",
    cls: null,
    cls_rating: "good",
    inp: null,
    inp_rating: "good",
    ttfb: null,
    ttfb_rating: "good",
  });

  const [history, setHistory] = useState<VitalEntry[]>([]);

  useEffect(() => {
    onLCP((metric) => {
      setVitals((prev) => ({
        ...prev,
        lcp: metric.value,
        lcp_rating: metric.rating,
      }));
      setHistory((prev) => [
        ...prev,
        {
          name: "LCP",
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
        },
      ]);
    });

    onFCP((metric) => {
      setVitals((prev) => ({
        ...prev,
        fcp: metric.value,
        fcp_rating: metric.rating,
      }));
      setHistory((prev) => [
        ...prev,
        {
          name: "FCP",
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
        },
      ]);
    });

    onCLS((metric) => {
      setVitals((prev) => ({
        ...prev,
        cls: metric.value,
        cls_rating: metric.rating,
      }));
      setHistory((prev) => [
        ...prev,
        {
          name: "CLS",
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
        },
      ]);
    });

    onINP((metric) => {
      setVitals((prev) => ({
        ...prev,
        inp: metric.value,
        inp_rating: metric.rating,
      }));
      setHistory((prev) => [
        ...prev,
        {
          name: "INP",
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
        },
      ]);
    });

    onTTFB((metric) => {
      setVitals((prev) => ({
        ...prev,
        ttfb: metric.value,
        ttfb_rating: metric.rating,
      }));
      setHistory((prev) => [
        ...prev,
        {
          name: "TTFB",
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
        },
      ]);
    });
  }, []);

  return { vitals, history };
}
