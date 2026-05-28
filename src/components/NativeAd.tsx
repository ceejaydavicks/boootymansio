import { useEffect, useRef } from "react";

export default function NativeAd() {
  const ref = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !ref.current) return;
    injected.current = true;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "https://alarmpenguinmelt.com/e8f9db1cf43468597a13efb8810f894f/invoke.js";
    ref.current.appendChild(script);
  }, []);

  return (
    <div className="w-full my-4">
      <div ref={ref} id="container-e8f9db1cf43468597a13efb8810f894f" />
    </div>
  );
}
