// Flutterwave inline script loader for React
import { useEffect } from "react";

export const useFlutterwaveScript = () => {
    useEffect(() => {
        if (document.getElementById("flutterwave-inline-script")) return;
        const script = document.createElement("script");
        script.id = "flutterwave-inline-script";
        script.src = "https://checkout.flutterwave.com/v3.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, []);
};
