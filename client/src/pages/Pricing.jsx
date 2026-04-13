import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { ServerUrl } from "../App";
function Pricing({ showBackButton = true }) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: 100,
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: 500,
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Most Popular",
    },
  ];

  const handlePayment = async (plan) => {
    if (loadingPlan) return;
    if (plan.price === 0) return;

    try {
      setLoadingPlan(plan.id);

      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        {
          planId: plan.id,
          amount: plan.price,
          credits: plan.credits,
        },
        { withCredentials: true }
      );

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "IntervAI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async function (response) {
          try {
            await axios.post(
              ServerUrl + "/api/payment/verify",
              response,
              { withCredentials: true }
            );

            alert("Payment Successful 🎉 Credits Added!");
            navigate("/");
          } catch (err) {
            alert("Verification failed ❌");
          } finally {
            setLoadingPlan(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function () {
        alert("Payment Failed ❌");
        setLoadingPlan(null);
      });

      rzp.open();
    } catch (error) {
      console.log(error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white py-16 px-6">
      {/* Back Button */}
     {showBackButton && (
  <div className="max-w-6xl mx-auto mb-10 flex items-start gap-4">
    <button
      onClick={() => navigate("/")}
      className="mt-2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
    >
      <FaArrowLeft className="text-white" />
    </button>
  </div>
)}

      {/* Heading */}
      <div className="text-center w-full mb-12">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-stone-400 mt-3 text-lg">
          Flexible pricing to match your interview preparation goals.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.04 }}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              className={`relative rounded-2xl p-10 flex flex-col transition-all duration-300 cursor-pointer
              ${
                isSelected
                  ? "bg-[#141417] border border-amber-400/20 ring-1 ring-amber-400/30"
                  : "bg-[#0f0f11] border border-white/10 hover:border-amber-400/10"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-bold uppercase px-3.5 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              {/* Default Tag */}
              {plan.default && (
                <div className="absolute top-6 right-6 bg-white/10 text-white text-xs px-3 py-1 rounded-full">
                  Default
                </div>
              )}

              {/* Plan Name */}
              <p className="text-xs font-semibold text-stone-500 tracking-widest uppercase mb-5">
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-end gap-1 mb-1.5">
                <span
                  className={`font-serif text-5xl leading-none tracking-tight 
                  ${
                    plan.id === "pro"
                      ? "bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent"
                      : "bg-gradient-to-br from-stone-100 to-stone-400 bg-clip-text text-transparent"
                  }`}
                >
                  ₹{plan.price}
                </span>
                <span className="text-sm text-stone-500 mb-1.5">
                  /one-time
                </span>
              </div>

              {/* Credits */}
              <p className="text-sm text-amber-400 mb-7">
                {plan.credits} Credits
              </p>

              <div className="h-px bg-white/10 mb-7" />

              {/* Features */}
              <ul className="space-y-3 mb-9 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-stone-400"
                  >
                    <span className="text-amber-400 text-xs mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Button */}
              {!plan.default && (
                <button
                  disabled={loadingPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(plan.id);
                    } else {
                      handlePayment(plan);
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition
                  ${
                    isSelected
                      ? "bg-amber-400 text-black hover:opacity-90"
                      : "bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : isSelected
                    ? `Proceed to Pay ₹${plan.price}`
                    : "Select Plan"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Pricing;