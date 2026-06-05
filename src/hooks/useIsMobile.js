import { useEffect, useState } from "react";

const QUERY = "(max-width: 820px)";

function detect() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}

export function useIsMobile() {
  const [mobile, setMobile] = useState(detect);
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setMobile(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);
  return mobile;
}
