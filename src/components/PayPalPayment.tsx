import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useRef, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// Define Country Codes locally
const COUNTRY_CODES = [
    { name: "United States", code: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { name: "India", code: "+91", flag: "🇮🇳" },
    { name: "Canada", code: "+1", flag: "🇨🇦" },
    { name: "Australia", code: "+61", flag: "🇦🇺" },
    { name: "Germany", code: "+49", flag: "🇩🇪" },
];

const initialOptions = {
    clientId: (import.meta.env.PAYPAL_CLIENT_ID || import.meta.env.VITE_PAYPAL_CLIENT_ID || "test").trim(),
    currency: "USD",
    intent: "capture",
};

export default function PayPalPayment({ onClose }: { onClose?: () => void }) {
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ref to hold current form data for callbacks
    const formDataRef = useRef({ email, fullName, countryCode, mobileNumber });

    useEffect(() => {
        formDataRef.current = { email, fullName, countryCode, mobileNumber };
    }, [email, fullName, countryCode, mobileNumber]);

    // Filter countries
    const filteredCountries = COUNTRY_CODES.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.includes(searchQuery)
    );

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [verificationToken, setVerificationToken] = useState("");
    const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
    const [otpMessage, setOtpMessage] = useState("");

    useEffect(() => {
        // Automatically skip OTP on localhost for easier testing
        if (window.location.hostname === "localhost") {
            setIsEmailVerified(true);
            setOtpMessage("Localhost detected: OTP verification skipped.");
        }
    }, []);

    const isFormValid = email && email.includes('@') && fullName && countryCode && mobileNumber && acceptedTerms && isEmailVerified;

    const [selectedGateway, setSelectedGateway] = useState<"none" | "paypal" | "razorpay">("none");

    const handleSendOtp = async () => {
        if (!email || !email.includes('@')) {
            setOtpMessage("Please enter a valid email address first.");
            return;
        }
        setSendingOtp(true);
        setOtpMessage("");
        try {
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                setIsOtpSent(true);
                setVerificationToken(data.verificationToken);
                setOtpExpiresAt(data.expiresAt);
                setOtpMessage("Verification code sent to your email!");
            } else {
                setOtpMessage(data.error || "Failed to send OTP.");
            }
        } catch (err) {
            setOtpMessage("Error sending OTP.");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue || otpValue.length < 6) {
            setOtpMessage("Please enter a valid 6-digit code.");
            return;
        }
        setVerifyingOtp(true);
        setOtpMessage("");
        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp: otpValue,
                    verificationToken,
                    expiresAt: otpExpiresAt
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsEmailVerified(true);
                setOtpMessage("Email verified successfully!");
            } else {
                setOtpMessage(data.error || "Invalid code.");
            }
        } catch (err) {
            setOtpMessage("Verification failed.");
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleProceed = async () => {
        setIsSaving(true);
        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || "";
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || "";

            if (supabaseUrl && supabaseAnonKey) {
                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                // Use upsert to handle existing users without 409 conflict
                // Note: This works best if you added the UNIQUE constraint to email as suggested
                await supabase
                    .from('user_by_form')
                    .upsert({
                        email,
                        full_name: fullName,
                        country_code: countryCode,
                        mobile_number: mobileNumber,
                        payment_status: 'unpaid'
                    }, { onConflict: 'email' });
            }
            setSelectedGateway("none"); // Reset selection state
            setIsPaymentDialogOpen(true);
        } catch (error) {
            console.error("Error in handleProceed:", error);
            setIsPaymentDialogOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRazorpayPayment = async () => {
        console.log("handleRazorpayPayment started");
        setMessage(""); 
        
        // Load razorpay script dynamically if not already present
        if (!(window as any).Razorpay) {
            console.log("Razorpay script not found. Loading dynamically...");
            setMessage("Loading Razorpay SDK...");
            try {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                document.body.appendChild(script);

                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        console.log("Razorpay script loaded successfully");
                        resolve(true);
                    };
                    script.onerror = () => {
                        console.error("Razorpay script failed to load");
                        reject(new Error("Failed to load Razorpay SDK. Check your internet connection or ad-blocker."));
                    };
                });
            } catch (err: any) {
                console.error("Script load error:", err);
                setMessage("Script Error: " + err.message);
                return;
            }
        }

        try {
            console.log("Initiating order creation...");
            setMessage("Initiating Razorpay...");
            
            // Add a timeout to the fetch call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
            
            try {
                const response = await fetch('/api/razorpay/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: 4.99, currency: "USD" }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log("Order creation response status:", response.status);
                const data = await response.json();
                console.log("Order creation data:", data);

                if (!response.ok) {
                    throw new Error(data.error || "Order creation failed. Check API keys.");
                }

                const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.RAZORPAY_KEY_ID;
                console.log("Using Razorpay Key:", rzpKey ? "FOUND" : "MISSING");

                if (!rzpKey) {
                    throw new Error("Razorpay Key ID is missing. Check environment variables.");
                }

                const options = {
                    key: rzpKey,
                    amount: data.amount,
                    currency: data.currency,
                    name: "WhoPosted",
                    description: "Premium Subscription",
                    order_id: data.id,
                    handler: async (response: any) => {
                        console.log("Payment successful handler called:", response);
                        setMessage("Verifying payment...");
                        try {
                            // Add timeout for verification
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                            const finalizeRes = await fetch('/api/payment-success', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orderId: response.razorpay_order_id,
                                    transactionId: response.razorpay_payment_id,
                                    amount: 4.99,
                                    currency: "USD",
                                    paymentGateway: "razorpay",
                                    email: email,
                                    fullName: fullName,
                                    metadata: response
                                }),
                                signal: controller.signal
                            });
                            
                            clearTimeout(timeoutId);
                            const finalizeData = await finalizeRes.json();
                            console.log("Finalize response:", finalizeData);
                            if (finalizeData.success) {
                                setMessage(`Transaction COMPLETED: ${response.razorpay_payment_id}`);
                            } else {
                                setMessage("Verification failed: " + (finalizeData.error || "Unknown error"));
                            }
                        } catch (err: any) {
                            console.error("Finalize error:", err);
                            setMessage("Verification error: " + (err.name === 'AbortError' ? "Server timeout" : err.message));
                        }
                    },
                    modal: {
                        ondismiss: function() {
                            console.log("Razorpay modal dismissed");
                            setMessage("");
                        }
                    },
                    prefill: { name: fullName, email: email },
                    theme: { color: "#9333ea" }
                };
                
                console.log("Opening Razorpay modal...");
                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    console.error("Payment failed:", response.error);
                    setMessage("Payment Failed: " + response.error.description);
                });
                rzp.open();
                setMessage(""); // Clear "Initiating..." message once modal is open
            } catch (fetchErr: any) {
                if (fetchErr.name === 'AbortError') {
                    throw new Error("Server took too long to respond. Please try again.");
                }
                throw fetchErr;
            }
        } catch (err: any) {
            console.error("Razorpay Error Flow:", err);
            setMessage("Razorpay failed: " + err.message);
        }
    };

    const handlePayPalSuccess = async (details: any) => {
        setMessage("Verifying payment...");
        try {
            // Add timeout for verification
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('/api/payment-success', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: details.id,
                    transactionId: details.purchase_units[0].payments.captures[0].id,
                    amount: 4.99,
                    currency: "USD",
                    paymentGateway: "paypal",
                    email: email,
                    fullName: fullName,
                    metadata: details
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();
            if (data.success) {
                setMessage(`Transaction COMPLETED: ${details.id}`);
            } else {
                setMessage("Verification failed: " + (data.error || "Unknown error"));
            }
        } catch (err: any) {
            console.error("PayPal verify error:", err);
            setMessage("Verification error: " + (err.name === 'AbortError' ? "Server timeout" : err.message));
        }
    };

    const createOrder = useCallback(async () => {
        try {
            const response = await fetch('/api/paypal/create-order', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart: [{ id: "MONTHLY_SUBSCRIPTION", quantity: 1 }]
                }),
            });

            const orderData = await response.json();
            if (orderData.id) return orderData.id;
            throw new Error(JSON.stringify(orderData));
        } catch (error) {
            console.error(error);
            setMessage(`Could not initiate PayPal Checkout: ${error}`);
        }
    }, []);

    const onApprove = useCallback(async (data: any, _actions: any) => {
        try {

            const response = await fetch('/api/paypal/capture-order', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID }),
            });

            const orderData = await response.json();

            if (orderData.status === 'COMPLETED') {
                await handlePayPalSuccess(orderData);
            } else {
                throw new Error("Capture status: " + orderData.status);
            }
        } catch (error: any) {
            console.error(error);
            setMessage(`Transaction error: ${error.message}`);
        }
    }, []);


    return (
        <div className="w-full max-w-xl mx-auto p-4 flex items-center justify-center min-h-screen">
            <div className="bg-white w-full px-5 py-6 rounded-2xl shadow-xl border border-gray-100 overflow-y-auto max-h-[95vh]">

                {/* Header */}
                <div className="flex justify-between items-start mb-6 sticky top-0 bg-white z-10">
                    <div className="text-center flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
                        <p className="text-gray-500 text-sm">Join thousands of successful job seekers</p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8F9FC] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email ID *</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isEmailVerified && window.location.hostname !== "localhost"}
                                className={`flex-1 px-4 py-3 bg-[#F8F9FC] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 transition-all ${(isEmailVerified && window.location.hostname !== "localhost") ? "border-green-200 bg-green-50/30 text-green-700" : "focus:ring-purple-500/20 focus:border-purple-500"}`}
                                placeholder="Enter your email"
                            />
                            {(!isEmailVerified && window.location.hostname !== "localhost") && (
                                <button
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || !email.includes('@')}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold rounded-lg transition-all text-sm whitespace-nowrap"
                                >
                                    {sendingOtp ? "Sending..." : isOtpSent ? "Resend" : "Send Code"}
                                </button>
                            )}
                        </div>
                    </div>

                    {(isOtpSent && !isEmailVerified && window.location.hostname !== "localhost") && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code *</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value)}
                                    placeholder="6-digit code"
                                    maxLength={6}
                                    className="flex-1 px-4 py-3 bg-[#F8F9FC] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono tracking-widest text-center"
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={verifyingOtp || otpValue.length < 6}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold rounded-lg transition-all"
                                >
                                    {verifyingOtp ? "Checking..." : "Verify"}
                                </button>
                            </div>
                        </div>
                    )}

                    {otpMessage && (
                        <p className={`text-xs font-medium ${otpMessage.includes("successfully") || otpMessage.includes("sent") ? "text-green-600" : "text-red-500"}`}>
                            {otpMessage}
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="col-span-1 relative" ref={dropdownRef}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Country Code *</label>
                            <div
                                className="w-full px-4 py-3 bg-[#F8F9FC] border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer hover:border-purple-400/50 transition-all"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className={`truncate ${countryCode ? "text-gray-900" : "text-gray-500"}`}>
                                    {countryCode || "Code"}
                                </span>
                                <ChevronsUpDown className="w-4 h-4 text-gray-400 ml-1" />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-50 w-64 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-72 overflow-hidden animate-in fade-in zoom-in-95 duration-100 top-full left-0">
                                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none"
                                                placeholder="Search country..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto max-h-56 p-1">
                                        {filteredCountries.map((country) => (
                                            <div
                                                key={`${country.code}-${country.name}`}
                                                className="flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer hover:bg-purple-50 rounded-md transition-colors"
                                                onClick={() => {
                                                    setCountryCode(country.code);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span>{country.flag}</span>
                                                    <span className="font-medium">{country.name}</span>
                                                </div>
                                                <span className="text-gray-400">{country.code}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                required
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8F9FC] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>

                    <div className="flex items-start mt-2">
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="w-4 h-4 mt-1 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="ml-2 text-sm text-gray-600 select-none">
                            I agree to the <span className="text-purple-600 font-medium underline">Terms and Conditions</span> and Privacy Policy.
                        </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                        type="button"
                        onClick={handleProceed}
                        disabled={!isFormValid || isSaving}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform 
                            ${isFormValid && !isSaving
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? "Saving..." : "Proceed to Payment"}
                    </button>

                    {/* Payment Dialog */}
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-center text-xl font-bold mb-2">Complete Payment</DialogTitle>
                                <DialogDescription className="text-center text-sm text-gray-500">
                                    Finalize your subscription via PayPal.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="pt-4">
                                {message ? (
                                    <div className={`p-6 rounded-xl text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 ${message.includes("COMPLETED") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                        {message.includes("COMPLETED") && (
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                                                <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xl font-extrabold">{message.includes("COMPLETED") ? "Unlock Successful!" : "Notice"}</p>
                                            <p className="text-sm mt-1 font-medium opacity-90">{message}</p>
                                        </div>

                                        {message.includes("COMPLETED") && (
                                            <div className="w-full space-y-3 pt-2">
                                                <div className="text-xs text-green-800 bg-green-100/50 p-3 rounded-lg border border-green-200/50">
                                                    Check your inbox for login instructions and access details.
                                                </div>
                                                <a
                                                    href="https://whoposted-main.vercel.app/login"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    Go to Dashboard
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedGateway === "none" ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={handleRazorpayPayment}
                                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all group"
                                                >
                                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                        <span className="text-purple-600 font-bold text-xl italic font-serif">R</span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">Pay with Razorpay</span>
                                                    <span className="text-xs text-gray-500 mt-1">Cards, Netbanking, UPI</span>
                                                </button>

                                                <button
                                                    onClick={() => setSelectedGateway("paypal")}
                                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                                                >
                                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                        <span className="text-blue-600 font-bold text-xl italic font-serif">P</span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">Pay with PayPal</span>
                                                    <span className="text-xs text-gray-500 mt-1">PayPal, Credit/Debit Cards</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="animate-in slide-in-from-right-4 duration-300">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedGateway("none")}
                                                    className="text-xs font-semibold text-gray-500 hover:text-purple-600 mb-4 flex items-center gap-1 transition-colors"
                                                >
                                                    &larr; Back to Payment Methods
                                                </button>

                                                {selectedGateway === "paypal" && (
                                                    <PayPalScriptProvider options={initialOptions}>
                                                        <PayPalButtons
                                                            createOrder={createOrder}
                                                            onApprove={onApprove}
                                                            style={{ layout: "vertical", color: "gold", shape: "rect" }}
                                                        />
                                                    </PayPalScriptProvider>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}