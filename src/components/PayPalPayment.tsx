

// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// import { useState, useRef, useEffect, useCallback } from "react";
// import { Check, ChevronsUpDown, Search, ShieldCheck, X } from "lucide-react";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
//     DialogDescription,
//     DialogFooter,
//     DialogClose
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// // Define Country Codes locally
// const COUNTRY_CODES = [
//     { name: "United States", code: "+1", flag: "🇺🇸" },
//     { name: "United Kingdom", code: "+44", flag: "🇬🇧" }
// ];

// const initialOptions = {
//     // Vite requires VITE_ prefix OR custom config to see env vars in the browser. 
//     // We updated vite.config.ts to allow the 'PAYPAL_' prefix.
//     clientId: (import.meta.env.PAYPAL_CLIENT_ID || import.meta.env.VITE_PAYPAL_CLIENT_ID || "").trim(),
//     currency: "USD",
//     intent: "capture",
//     // Switched to production for Live PayPal
//     environment: "production" as "sandbox" | "production",
// };



// export default function PayPalPayment({ onClose }: { onClose?: () => void }) {
//     const [message, setMessage] = useState("");
//     const [email, setEmail] = useState("");
//     const [fullName, setFullName] = useState("");
//     const [countryCode, setCountryCode] = useState("");
//     const [mobileNumber, setMobileNumber] = useState("");
//     const [acceptedTerms, setAcceptedTerms] = useState(false);
//     const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

//     // Dropdown state
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [searchQuery, setSearchQuery] = useState("");
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     // Ref to hold current form data for onApprove without causing re-renders
//     const formDataRef = useRef({ email, fullName, countryCode, mobileNumber });

//     useEffect(() => {
//         formDataRef.current = { email, fullName, countryCode, mobileNumber };
//     }, [email, fullName, countryCode, mobileNumber]);

//     // Filter countries
//     const filteredCountries = COUNTRY_CODES.filter(country =>
//         country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         country.code.includes(searchQuery)
//     );

//     // Close dropdown on click outside
//     useEffect(() => {
//         function handleClickOutside(event: MouseEvent) {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setIsDropdownOpen(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     const isFormValid = email && email.includes('@') && fullName && countryCode && mobileNumber && acceptedTerms;

//     const createOrder = useCallback(async () => {
//         try {
//             // Derive Supabase URL from env vars (Vite exposes VITE_ prefixed, but sometimes we need to fallback)
//             const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://davfhscenualgngvedna.supabase.co";

//             const response = await fetch(`${SUPABASE_URL}/functions/v1/Create_order`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     // Use anon key for Supabase Auth
//                     "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
//                 },
//                 body: JSON.stringify({
//                     cart: [
//                         {
//                             id: "LIFETIME_ACCESS",
//                             quantity: 1,
//                         },
//                     ],
//                 }),
//             });

//             const orderData = await response.json();

//             if (orderData.id) {
//                 return orderData.id;
//             } else {
//                 const errorDetail = orderData?.details?.[0];
//                 const errorMessage = errorDetail
//                     ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
//                     : JSON.stringify(orderData);

//                 throw new Error(errorMessage);
//             }
//         } catch (error) {
//             console.error(error);
//             setMessage(`Could not initiate PayPal Checkout: ${error}`);
//         }
//     }, []);

//     const onApprove = useCallback(async (data: any, actions: any) => {
//         try {
//             const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://davfhscenualgngvedna.supabase.co";

//             // Get latest form data from ref
//             const { email, fullName, countryCode, mobileNumber } = formDataRef.current;

//             const response = await fetch(`${SUPABASE_URL}/functions/v1/capture_order`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
//                 },
//                 body: JSON.stringify({
//                     orderID: data.orderID,
//                     user_email: email,
//                     full_name: fullName,
//                     country_code: countryCode,
//                     mobile_number: mobileNumber
//                 }),
//             });


//             const orderData = await response.json();

//             const errorDetail = orderData?.details?.[0];

//             if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
//                 return actions.restart();
//             } else if (errorDetail) {
//                 throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
//             } else {
//                 const transaction = orderData.purchase_units[0].payments.captures[0];
//                 setMessage(`Transaction ${transaction.status}: ${transaction.id}`);
//                 console.log("Capture result", orderData);
//             }
//         } catch (error) {
//             console.error(error);
//             setMessage(`Sorry, your transaction could not be processed: ${error}`);
//         }
//     }, []);

//     return (
//         <div className="w-full max-w-xl mx-auto p-4 flex items-center justify-center min-h-screen md:min-h-0 md:block">
//             <div className="bg-white w-full px-5 py-6 rounded-2xl shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">

//                 {/* Header Section with Flexbox */}
//                 <div className="flex justify-between items-start mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-transparent">
//                     {/* Left Spacer / Back Button Area */}
//                     <div className="w-8 pt-1">
//                     </div>

//                     {/* Center Title */}
//                     <div className="text-center flex-1 px-1">
//                         <h2 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight leading-tight">
//                             Create Account
//                         </h2>
//                         <p className="text-gray-500 text-xs sm:text-sm leading-snug">
//                             Join thousands of successful job seekers
//                         </p>
//                     </div>

//                     {/* Right Close Button */}
//                     <div className="w-8 flex justify-end pt-1">
//                         {onClose && (
//                             <button
//                                 onClick={onClose}
//                                 className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
//                                 aria-label="Close"
//                             >
//                                 <X className="w-5 h-5" />
//                             </button>
//                         )}
//                     </div>
//                 </div>

//                 <div className="space-y-5 px-1">
//                     {/* Full Name */}
//                     <div>
//                         <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
//                             Full Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             id="fullName"
//                             required
//                             value={fullName}
//                             onChange={(e) => setFullName(e.target.value)}
//                             className="w-full px-4 py-3 bg-[#F8F9FC] border border-blue-50/50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
//                             placeholder="Enter your full name"
//                         />
//                     </div>

//                     {/* Email */}
//                     <div>
//                         <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
//                             Email ID <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="email"
//                             id="email"
//                             required
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="w-full px-4 py-3 bg-[#F8F9FC] border border-blue-50/50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
//                             placeholder="Enter your email"
//                         />
//                     </div>

//                     {/* Mobile Number & Country Code */}
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                         <div className="col-span-1 relative" ref={dropdownRef}>
//                             <label htmlFor="countryCode" className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Country Code <span className="text-red-500">*</span>
//                             </label>
//                             <div
//                                 className="w-full px-4 py-3 bg-[#F8F9FC] border border-blue-50/50 rounded-lg flex items-center justify-between cursor-pointer hover:border-purple-400/50 transition-all font-medium text-gray-700"
//                                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                             >
//                                 <span className={`truncate ${countryCode ? "text-gray-900" : "text-gray-500"}`}>
//                                     {countryCode || "Code"}
//                                 </span>
//                                 <ChevronsUpDown className="w-4 h-4 text-gray-400 ml-1" />
//                             </div>

//                             {isDropdownOpen && (
//                                 <div className="absolute z-50 w-full sm:w-64 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-72 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5 top-full left-0">
//                                     <div className="p-2 border-b border-gray-50 bg-gray-50/50">
//                                         <div className="relative">
//                                             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                                             <input
//                                                 type="text"
//                                                 className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-700 placeholder:text-gray-400 outline-none"
//                                                 placeholder="Search country..."
//                                                 value={searchQuery}
//                                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                                 autoFocus
//                                                 onClick={(e) => e.stopPropagation()}
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="overflow-y-auto max-h-56 p-1">
//                                         {filteredCountries.length > 0 ? (
//                                             filteredCountries.map((country) => (
//                                                 <div
//                                                     key={`${country.code}-${country.name}`}
//                                                     className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer hover:bg-purple-50 rounded-md transition-colors group ${countryCode === country.code ? 'bg-purple-50' : ''}`}
//                                                     onClick={() => {
//                                                         setCountryCode(country.code);
//                                                         setSearchQuery("");
//                                                         setIsDropdownOpen(false);
//                                                     }}
//                                                 >
//                                                     <div className="flex items-center gap-3 overflow-hidden">
//                                                         <span className="text-lg">{country.flag}</span>
//                                                         <span className={`truncate font-medium ${countryCode === country.code ? 'text-purple-700' : 'text-gray-700 group-hover:text-gray-900'}`}>{country.name}</span>
//                                                     </div>
//                                                     <span className={`text-xs ${countryCode === country.code ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>{country.code}</span>
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <div className="p-4 text-center text-sm text-gray-500">
//                                                 No country found.
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="col-span-1 sm:col-span-2">
//                             <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Phone Number <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="tel"
//                                 id="mobileNumber"
//                                 required
//                                 value={mobileNumber}
//                                 onChange={(e) => setMobileNumber(e.target.value)}
//                                 className="w-full px-4 py-3 bg-[#F8F9FC] border border-blue-50/50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
//                                 placeholder="Enter phone number"
//                             />
//                         </div>
//                     </div>

//                     {/* Terms and Conditions */}
//                     <div className="flex items-start mt-2">
//                         <div className="flex items-center h-5">
//                             <input
//                                 id="terms"
//                                 type="checkbox"
//                                 required
//                                 checked={acceptedTerms}
//                                 onChange={(e) => setAcceptedTerms(e.target.checked)}
//                                 className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-all cursor-pointer"
//                             />
//                         </div>
//                         <div className="ml-2 text-sm text-gray-600 select-none flex flex-wrap gap-1">
//                             <label htmlFor="terms" className="cursor-pointer">I agree to the</label>

//                             <Dialog>
//                                 <DialogTrigger asChild>
//                                     <button type="button" className="text-purple-600 hover:text-purple-700 font-medium underline focus:outline-none">
//                                         Terms and Conditions
//                                     </button>
//                                 </DialogTrigger>
//                                 <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
//                                     <DialogHeader>
//                                         <DialogTitle className="flex items-center gap-2 text-xl pb-2 border-b">
//                                             <ShieldCheck className="w-6 h-6 text-purple-600" />
//                                             WhoPosted.AI – Terms
//                                         </DialogTitle>
//                                         <DialogDescription className="pt-2">
//                                             Please review our terms of service carefully.
//                                         </DialogDescription>
//                                     </DialogHeader>

//                                     <div className="py-2 text-sm text-gray-700 space-y-4">
//                                         <p className="font-semibold text-gray-900 bg-purple-50 p-2 rounded-md border border-purple-100">
//                                             By proceeding, you explicitly agree that:
//                                         </p>
//                                         <ul className="list-disc pl-5 space-y-3 marker:text-purple-500">
//                                             <li><span className="font-medium text-gray-900">Lifetime Access:</span> You are purchasing lifetime access to WhoPosted.AI's verified job portal database.</li>
//                                             <li><span className="font-medium text-gray-900">No Refunds:</span> This is a digital, non-refundable product. No cancellations or refunds will be issued after purchase.</li>
//                                             <li><span className="font-medium text-gray-900">External Links:</span> Job links may expire or change if companies close applications or update their portals.</li>
//                                             <li><span className="font-medium text-gray-900">Sponsorships:</span> Sponsorship availability depends entirely on each company's hiring policy at the time of access.</li>
//                                             <li><span className="font-medium text-gray-900">Disclaimer:</span> WhoPosted.AI is not a recruitment agency and does not guarantee any job offer or sponsorship.</li>
//                                             <li><span className="font-medium text-gray-900">Usage:</span> You will use the platform strictly for personal job search purposes.</li>
//                                         </ul>
//                                     </div>

//                                     <DialogFooter className="sm:justify-end border-t pt-4">
//                                         <DialogClose asChild>
//                                             <Button
//                                                 type="button"
//                                                 className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
//                                                 onClick={() => setAcceptedTerms(true)}
//                                             >
//                                                 I Understand & Agree
//                                             </Button>
//                                         </DialogClose>
//                                     </DialogFooter>
//                                 </DialogContent>
//                             </Dialog>
//                             <span className="text-gray-600">and Privacy Policy.</span>
//                         </div>
//                     </div>

//                     {/* Info Text */}
//                     <p className="text-xs text-gray-500 text-center mt-2">
//                         We'll send your access details to the provided email.
//                     </p>

//                     {/* Proceed to Payment Button (triggers modal) */}
//                     <div className="mt-6 pt-2">
//                         <button
//                             type="button"
//                             onClick={() => setIsPaymentDialogOpen(true)}
//                             disabled={!isFormValid}
//                             className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform 
//                                 ${isFormValid
//                                     ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
//                                     : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                 }`}
//                         >
//                             Proceed to Payment
//                         </button>
//                     </div>

//                     {/* Payment Options Dialog */}
//                     <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
//                         <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl">
//                             <DialogHeader>
//                                 <DialogTitle className="text-center text-xl font-bold mb-4">Select Payment Method</DialogTitle>
//                             </DialogHeader>
//                             <div className="pt-2">
//                                 {message ? (
//                                     message.includes("Transaction COMPLETED") ? (
//                                         <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
//                                             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
//                                                 <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
//                                             </div>
//                                             <h3 className="text-xl font-bold text-gray-900 mb-1">Congratulations!</h3>
//                                             <p className="text-gray-600 font-medium mb-4">
//                                                 Payment successfully completed.
//                                             </p>

//                                             <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 mb-5 w-full">
//                                                 <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Transaction ID</span>
//                                                 <p className="font-mono text-gray-900 font-bold tracking-wide select-all">
//                                                     {message.replace("Transaction COMPLETED: ", "")}
//                                                 </p>
//                                             </div>

//                                             <p className="text-purple-700 font-bold text-base bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 w-full animate-pulse">
//                                                 Please check your email for access details.
//                                             </p>
//                                         </div>
//                                     ) : (
//                                         <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm font-medium text-center break-words">
//                                             {message}
//                                         </div>
//                                     )
//                                 ) : (
//                                     <PayPalPaymentButtons createOrder={createOrder} onApprove={onApprove} />
//                                 )}
//                             </div>
//                         </DialogContent>
//                     </Dialog>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // Separate component to prevent re-rendering issues with PayPal buttons when state changes
// const PayPalPaymentButtons = ({ createOrder, onApprove }: { createOrder: any, onApprove: any }) => {
//     return (
//         <PayPalScriptProvider options={initialOptions}>
//             <PayPalButtons
//                 createOrder={createOrder}
//                 onApprove={onApprove}
//                 style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
//             />
//         </PayPalScriptProvider>
//     )
// }





































































import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useRef, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Search, ShieldCheck, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Define Country Codes locally
const COUNTRY_CODES = [
    { name: "United States", code: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" }
];

const initialOptions = {
    clientId: (import.meta.env.VITE_PAYPAL_CLIENT_ID || "").trim(),
    currency: "USD",
    intent: "capture",
    environment: "production" as "sandbox" | "production",
};



export default function PayPalPayment({ onClose }: { onClose?: () => void }) {
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ref to hold current form data for onApprove without causing re-renders
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

    const isFormValid = email && email.includes('@') && fullName && countryCode && mobileNumber && acceptedTerms;

    const createOrder = useCallback(async () => {
        try {
            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

            const response = await fetch(`${SUPABASE_URL}/functions/v1/Create_order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    cart: [
                        {
                            id: "MONTHLY_SUBSCRIPTION",
                            quantity: 1,
                        },
                    ],
                }),
            });

            const orderData = await response.json();

            if (orderData.id) {
                return orderData.id;
            } else {
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);

                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            setMessage(`Could not initiate PayPal Checkout: ${error}`);
        }
    }, []);

    const onApprove = useCallback(async (data: any, actions: any) => {
        try {
            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

            // Get latest form data from ref
            const { email, fullName, countryCode, mobileNumber } = formDataRef.current;

            const response = await fetch(`${SUPABASE_URL}/functions/v1/capture_order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    orderID: data.orderID,
                    user_email: email,
                    full_name: fullName,
                    country_code: countryCode,
                    mobile_number: mobileNumber
                }),
            });


            const orderData = await response.json();

            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart();
            } else if (errorDetail) {
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
            } else {
                const transaction = orderData.purchase_units[0].payments.captures[0];
                setMessage(`Transaction ${transaction.status}: ${transaction.id}`);
                console.log("Capture result", orderData);
            }
        } catch (error) {
            console.error(error);
            setMessage(`Sorry, your transaction could not be processed: ${error}`);
        }
    }, []);

    return (
        <div className="w-full max-w-xl mx-auto p-4 flex items-center justify-center min-h-screen md:min-h-0 md:block">
            <div className="bg-white w-full px-5 py-6 rounded-2xl shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">

                {/* Header Section with Flexbox */}
                <div className="flex justify-between items-start mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-transparent">
                    {/* Left Spacer / Back Button Area */}
                    <div className="w-8 pt-1">
                    </div>

                    {/* Center Title */}
                    <div className="text-center flex-1 px-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight leading-tight">
                            Create Account
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm leading-snug">
                            Join thousands of successful job seekers
                        </p>
                    </div>

                    {/* Right Close Button */}
                    <div className="w-8 flex justify-end pt-1">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-5 px-1">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8F9FC] border border-blue-50/50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                            placeholder="Enter your full name"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8F9FC] border border-blue-50/50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Mobile Number & Country Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="col-span-1 relative" ref={dropdownRef}>
                            <label htmlFor="countryCode" className="block text-sm font-semibold text-gray-700 mb-2">
                                Country Code <span className="text-red-500">*</span>
                            </label>
                            <div
                                className="w-full px-4 py-3 bg-[#F8F9FC] border border-blue-50/50 rounded-lg flex items-center justify-between cursor-pointer hover:border-purple-400/50 transition-all font-medium text-gray-700"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className={`truncate ${countryCode ? "text-gray-900" : "text-gray-500"}`}>
                                    {countryCode || "Code"}
                                </span>
                                <ChevronsUpDown className="w-4 h-4 text-gray-400 ml-1" />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full sm:w-64 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-72 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5 top-full left-0">
                                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-700 placeholder:text-gray-400 outline-none"
                                                placeholder="Search country..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto max-h-56 p-1">
                                        {filteredCountries.length > 0 ? (
                                            filteredCountries.map((country) => (
                                                <div
                                                    key={`${country.code}-${country.name}`}
                                                    className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer hover:bg-purple-50 rounded-md transition-colors group ${countryCode === country.code ? 'bg-purple-50' : ''}`}
                                                    onClick={() => {
                                                        setCountryCode(country.code);
                                                        setSearchQuery("");
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className="text-lg">{country.flag}</span>
                                                        <span className={`truncate font-medium ${countryCode === country.code ? 'text-purple-700' : 'text-gray-700 group-hover:text-gray-900'}`}>{country.name}</span>
                                                    </div>
                                                    <span className={`text-xs ${countryCode === country.code ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>{country.code}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                No country found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                            <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="mobileNumber"
                                required
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8F9FC] border border-blue-50/50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start mt-2">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-all cursor-pointer"
                            />
                        </div>
                        <div className="ml-2 text-sm text-gray-600 select-none flex flex-wrap gap-1">
                            <label htmlFor="terms" className="cursor-pointer">I agree to the</label>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <button type="button" className="text-purple-600 hover:text-purple-700 font-medium underline focus:outline-none">
                                        Terms and Conditions
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-xl pb-2 border-b">
                                            <ShieldCheck className="w-6 h-6 text-purple-600" />
                                            WhoPosted.AI – Terms
                                        </DialogTitle>
                                        <DialogDescription className="pt-2">
                                            Please review our terms of service carefully.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="py-2 text-sm text-gray-700 space-y-4">
                                        <p className="font-semibold text-gray-900 bg-purple-50 p-2 rounded-md border border-purple-100">
                                            By proceeding, you explicitly agree that:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-3 marker:text-purple-500">
                                            <li><span className="font-medium text-gray-900">Monthly Subscription:</span> You are purchasing a monthly subscription to WhoPosted.AI's verified job portal database.</li>
                                            <li><span className="font-medium text-gray-900">No Refunds:</span> This is a digital, non-refundable product. No cancellations or refunds will be issued once the billing cycle has started.</li>
                                            <li><span className="font-medium text-gray-900">External Links:</span> Job links may expire or change if companies close applications or update their portals.</li>
                                            <li><span className="font-medium text-gray-900">Sponsorships:</span> Sponsorship availability depends entirely on each company's hiring policy at the time of access.</li>
                                            <li><span className="font-medium text-gray-900">Disclaimer:</span> WhoPosted.AI is not a recruitment agency and does not guarantee any job offer or sponsorship.</li>
                                            <li><span className="font-medium text-gray-900">Usage:</span> You will use the platform strictly for personal job search purposes.</li>
                                        </ul>
                                    </div>

                                    <DialogFooter className="sm:justify-end border-t pt-4">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                                                onClick={() => setAcceptedTerms(true)}
                                            >
                                                I Understand & Agree
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <span className="text-gray-600">and Privacy Policy.</span>
                        </div>
                    </div>

                    {/* Info Text */}
                    <p className="text-xs text-gray-500 text-center mt-2">
                        We'll send your access details to the provided email.
                    </p>

                    {/* Proceed to Payment Button (triggers modal) */}
                    <div className="mt-6 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsPaymentDialogOpen(true)}
                            disabled={!isFormValid}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform 
                                ${isFormValid
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Proceed to Payment
                        </button>
                    </div>

                    {/* Payment Options Dialog */}
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-center text-xl font-bold mb-4">Select Payment Method</DialogTitle>
                            </DialogHeader>
                            <div className="pt-2">
                                {message ? (
                                    message.includes("Transaction COMPLETED") ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                                <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">Congratulations!</h3>
                                            <p className="text-gray-600 font-medium mb-4">
                                                Payment successfully completed.
                                            </p>

                                            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 mb-5 w-full">
                                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Transaction ID</span>
                                                <p className="font-mono text-gray-900 font-bold tracking-wide select-all">
                                                    {message.replace("Transaction COMPLETED: ", "")}
                                                </p>
                                            </div>

                                            <p className="text-purple-700 font-bold text-base bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 w-full animate-pulse">
                                                Please check your email for access details.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm font-medium text-center break-words">
                                            {message}
                                        </div>
                                    )
                                ) : (
                                    <PayPalPaymentButtons createOrder={createOrder} onApprove={onApprove} />
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

// Separate component to prevent re-rendering issues with PayPal buttons when state changes
const PayPalPaymentButtons = ({ createOrder, onApprove }: { createOrder: any, onApprove: any }) => {
    return (
        <PayPalScriptProvider options={initialOptions}>
            {/* <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
            /> */}


            <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                forceReRender={["USD"]}
                style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                fundingSource={undefined}
                onInit={(_data, actions) => {
                    // Explicitly tell PayPal: this is NOT a shippable product
                    actions.disable();
                    actions.enable();
                }}
            />

        </PayPalScriptProvider>
    )
}
