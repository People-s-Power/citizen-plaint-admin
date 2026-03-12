// Paystack inline script loader for React
import { useEffect } from "react";

export const usePaystackScript = () => {
    useEffect(() => {
        if (document.getElementById("paystack-inline-script")) return;
        const script = document.createElement("script");
        script.id = "paystack-inline-script";
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, []);
};
