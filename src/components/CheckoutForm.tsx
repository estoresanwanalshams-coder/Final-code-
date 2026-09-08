"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminEmail } from "@/lib/auth-role";
import {
  getApplicableShippingCharge,
  getCartItems,
  saveCartItems,
  type CartItem,
} from "@/lib/cart";
import type { Product } from "@/lib/products";
import {
  createNextOrderNumber,
  createSupabaseOrder,
} from "@/lib/supabase-orders";
import { fetchCustomerProfileByAuthUserId } from "@/lib/supabase-customers";
import { supabase } from "@/lib/supabase";
import { defaultSiteSettings, fetchSiteSettings } from "@/lib/site-settings";
import { isValidPhoneNumber, normalizePhoneInput } from "@/lib/phone";

type CheckoutFormProps = {
  fallbackProduct: Product;
  initialQuantity?: number;
};

export function CheckoutForm({
  fallbackProduct,
  initialQuantity = 1,
}: CheckoutFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emirate, setEmirate] = useState("");
  const [area, setArea] = useState("");
  const [building, setBuilding] = useState("");
  const [unit, setUnit] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [baseShippingCharge, setBaseShippingCharge] = useState(
    defaultSiteSettings.shippingCharge,
  );
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAccount, setIsAdminAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const cartItems = getCartItems();
      setItems(
        cartItems.length > 0
          ? cartItems
          : [{ product: fallbackProduct, quantity: initialQuantity }],
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fallbackProduct, initialQuantity]);

  useEffect(() => {
    async function loadAuthenticatedCustomer() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setIsAuthenticated(false);
        setIsAdminAccount(false);
        return;
      }

      const adminUser = isAdminEmail(user.email);
      setIsAdminAccount(adminUser);
      setIsAuthenticated(true);

      const profile = await fetchCustomerProfileByAuthUserId(user.id).catch(
        () => null,
      );

      const metadataName =
        (user.user_metadata?.full_name as string | undefined) ?? "";
      const metadataPhone =
        (user.user_metadata?.phone as string | undefined) ?? "";

      setFullName((current) => current || profile?.fullName || metadataName);
      setEmail((current) => current || profile?.email || user.email || "");
      setPhone((current) => current || profile?.phone || metadataPhone);
    }

    const timer = window.setTimeout(() => {
      void loadAuthenticatedCustomer();
    }, 0);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadAuthenticatedCustomer();
    });

    return () => {
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const settings = await fetchSiteSettings().catch(
        () => defaultSiteSettings,
      );
      setBaseShippingCharge(settings.shippingCharge);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );
  const shippingCharge = useMemo(
    () => getApplicableShippingCharge(items, baseShippingCharge),
    [items, baseShippingCharge],
  );
  const shippingMethod =
    shippingCharge === 0 && items.length > 0
      ? "Free Shipping"
      : "Standard Shipping";
  const grandTotal = total + shippingCharge;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidPhoneNumber(phone)) {
      setMessage("Please enter a valid phone number (7 to 15 digits).");
      return;
    }
    if (isAdminAccount) {
      setMessage("Admin account cannot place customer orders.");
      return;
    }

    setIsSubmitting(true);

    try {
      const addressLine1 = [
        building.trim(),
        unit.trim() ? `Unit: ${unit.trim()}` : "",
        street.trim(),
      ]
        .filter(Boolean)
        .join(", ");

      const addressLine2 = [
        area.trim(),
        landmark.trim() ? `Landmark: ${landmark.trim()}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const city = emirate;
      const orderNumber = await createNextOrderNumber();
      await createSupabaseOrder({
        orderNumber,
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        shippingMethod,
        additionalNotes,
        items,
        total: grandTotal,
      });
      await fetch("/api/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          fullName,
          email,
          phone,
          addressLine1,
          addressLine2,
          city,
          shippingMethod,
          additionalNotes,
          items,
          total: grandTotal,
        }),
      }).catch(() => null);
      saveCartItems([]);
      router.push(`/order-success?order=${encodeURIComponent(orderNumber)}`);
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "";
      if (detail.toLowerCase().includes("row-level security")) {
        setMessage(
          "Please login first. Order access is restricted to signed-in users.",
        );
      } else {
        setMessage(
          "Unable to place order. Please check Supabase orders table.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAdminAccount) {
    return (
      <div className="checkout-form-panel flex flex-col items-start justify-center gap-3 p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Customer checkout
        </p>

        <h2 className="text-2xl font-bold text-zinc-950">
          Admin account cannot place orders
        </h2>

        <p className="text-sm leading-6 text-zinc-600">
          Please use a customer account or sign out to place an order as a
          guest.
        </p>
      </div>
    );
  }
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="checkout-form checkout-form-panel grid gap-5 p-6 sm:p-8 lg:p-10 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <p className="text-base font-bold text-zinc-950">
            Contact Information
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            We’ll use these details to confirm and deliver your order.
          </p>
        </div>

        <label className="form-field md:col-span-2">
          Full Name*
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />
        </label>

        <label className="form-field">
          Mobile / WhatsApp Number*
          <input
            value={phone}
            onChange={(event) =>
              setPhone(normalizePhoneInput(event.target.value))
            }
            type="text"
            inputMode="tel"
            autoComplete="tel"
            pattern="[0-9+()\\-\\s]{7,20}"
            title="Enter a valid phone number"
            placeholder="+971 50 123 4567"
            required
          />
        </label>

        <label className="form-field">
          Email*
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            required
          />
        </label>
        <div className="md:col-span-2 mt-1">
          <p className="text-base font-bold text-zinc-950">Delivery Address</p>
          <p className="mt-1 text-sm text-zinc-500">
            Enter the address where you want your order delivered.
          </p>
        </div>
        <label className="form-field">
          Emirate*
          <select
            value={emirate}
            onChange={(event) => setEmirate(event.target.value)}
            required
          >
            <option value="">Select emirate</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Dubai">Dubai</option>
            <option value="Sharjah">Sharjah</option>
            <option value="Ajman">Ajman</option>
            <option value="Umm Al Quwain">Umm Al Quwain</option>
            <option value="Ras Al Khaimah">Ras Al Khaimah</option>
            <option value="Fujairah">Fujairah</option>
          </select>
        </label>

        <label className="form-field">
          Area*
          <input
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="e.g. Deira, Al Nahda"
            required
          />
        </label>

        <label className="form-field">
          Building / Villa*
          <input
            value={building}
            onChange={(event) => setBuilding(event.target.value)}
            placeholder="Building or villa name / number"
            required
          />
        </label>

        <label className="form-field">
          Flat / Office / Unit
          <input
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            placeholder="Flat, office or unit number"
          />
        </label>

        <label className="form-field">
          Street
          <input
            value={street}
            onChange={(event) => setStreet(event.target.value)}
            placeholder="Street name or number"
          />
        </label>

        <label className="form-field">
          Nearest Landmark
          <input
            value={landmark}
            onChange={(event) => setLandmark(event.target.value)}
            placeholder="e.g. Near metro, mall, mosque"
          />
        </label>
        <div className="md:col-span-2 overflow-hidden rounded-xl border border-orange-200 bg-orange-50/50">
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
              ✓
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-zinc-950">Cash on Delivery</p>
              <p className="mt-1 text-sm leading-5 text-zinc-600">
                Pay when your order arrives at your delivery address.
              </p>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <p className="text-zinc-600">
                  Delivery:{" "}
                  <span className="font-semibold text-zinc-900">
                    {shippingMethod}
                  </span>
                </p>

                <p className="text-zinc-600">
                  Shipping:{" "}
                  <span className="font-semibold text-zinc-900">
                    {shippingCharge === 0 ? "Free" : `AED ${shippingCharge}`}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <label className="form-field md:col-span-2">
          Additional Notes
          <textarea
            value={additionalNotes}
            onChange={(event) => setAdditionalNotes(event.target.value)}
            placeholder="Add any delivery instructions"
            rows={3}
          />
        </label>
        <div className="mb-4 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#fa710c]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.8 7.5 9.5 4.4-1.7 7.5-4.9 7.5-9.5V6L12 3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-950">
                Confirm your order with confidence
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                No online payment is required. Your order will be placed as Cash
                on Delivery.
              </p>
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="animated-button checkout-submit md:col-span-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Placing Order..."
            : `Place Order • AED ${grandTotal}`}
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-zinc-500 md:col-span-2">
          By placing your order, you confirm that your contact and delivery
          details are correct.
        </p>
        {message ? (
          <p className="md:col-span-2 text-sm font-bold text-red-600">
            {message}
          </p>
        ) : null}
      </form>
    </>
  );
}
