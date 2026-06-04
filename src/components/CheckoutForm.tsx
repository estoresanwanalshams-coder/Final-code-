"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { OrderSuccessModal } from "@/components/OrderSuccessModal";
import { isAdminEmail } from "@/lib/auth-role";
import { getCartItems, saveCartItems, type CartItem } from "@/lib/cart";
import type { Product } from "@/lib/products";
import {
  createOrderNumber,
  createSupabaseOrder,
} from "@/lib/supabase-orders";
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [shippingCharge, setShippingCharge] = useState(defaultSiteSettings.shippingCharge);
  const [message, setMessage] = useState("");
  const [successOrderNumber, setSuccessOrderNumber] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAccount, setIsAdminAccount] = useState(false);
  const [continueAsGuest, setContinueAsGuest] = useState(false);
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
    const timer = window.setTimeout(async () => {
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
      setEmail((currentEmail) => currentEmail || user.email || "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const settings = await fetchSiteSettings().catch(() => defaultSiteSettings);
      setShippingCharge(settings.shippingCharge);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [items],
  );
  const grandTotal = total + shippingCharge;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidPhoneNumber(phone)) {
      setMessage("Please enter a valid phone number (7 to 15 digits).");
      return;
    }
    if (!isAuthenticated && !continueAsGuest) {
      setMessage("Please login/register or continue as guest before placing an order.");
      return;
    }
    if (isAdminAccount) {
      setMessage("Admin account cannot place customer orders.");
      return;
    }

    setIsSubmitting(true);
    const orderNumber = createOrderNumber();

    try {
      await createSupabaseOrder({
        orderNumber,
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        shippingMethod: "Standard Shipping",
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
          shippingMethod: "Standard Shipping",
          additionalNotes,
          items,
          total: grandTotal,
        }),
      }).catch(() => null);
      saveCartItems([]);
      setSuccessOrderNumber(orderNumber);
      setMessage("");
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "";
      if (detail.toLowerCase().includes("row-level security")) {
        setMessage("Please login first. Order access is restricted to signed-in users.");
      } else {
        setMessage("Unable to place order. Please check Supabase orders table.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if ((!isAuthenticated && !continueAsGuest) || isAdminAccount) {
    return (
      <div className="checkout-form-panel flex flex-col items-start justify-center gap-3 p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          {isAdminAccount ? "Customer account required" : "Authentication required"}
        </p>
        <h2 className="text-2xl font-bold text-zinc-950">
          {isAdminAccount
            ? "Admin account cannot place orders"
            : "Login to place your order"}
        </h2>
        <p className="text-sm text-zinc-600">
          {isAdminAccount
            ? "Please use a customer account to place orders."
            : "You must be logged in before placing any order through Buy Now or Cart."}
        </p>
        <div className="mt-2 flex gap-3">
          <Link href="/login" className="btn-soft">
            Login
          </Link>
          <Link href="/register" className="btn-soft">
            Register
          </Link>
          {!isAdminAccount ? (
            <button
              type="button"
              onClick={() => {
                setContinueAsGuest(true);
                setMessage("");
              }}
              className="btn-soft"
            >
              Continue as Guest
            </button>
          ) : null}
        </div>
        {message ? (
          <p className="text-sm font-bold text-red-600">{message}</p>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {successOrderNumber ? (
        <OrderSuccessModal
          orderNumber={successOrderNumber}
          onClose={() => setSuccessOrderNumber("")}
        />
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="checkout-form checkout-form-panel grid gap-5 p-6 sm:p-8 lg:p-10 md:grid-cols-2"
      >
        <label className="form-field md:col-span-2">
          Full Name*
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            type="text"
            placeholder="Enter full name"
            required
          />
        </label>
        <label className="form-field">
          Email*
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Enter email address"
            required
          />
        </label>
        <label className="form-field">
          Phone number*
          <input
            value={phone}
            onChange={(event) => setPhone(normalizePhoneInput(event.target.value))}
            type="text"
            inputMode="tel"
            pattern="[0-9+()\\-\\s]{7,20}"
            title="Enter a valid phone number"
            placeholder="Enter phone number"
            required
          />
        </label>
        <label className="form-field md:col-span-2">
          Address line 1*
          <input
            value={addressLine1}
            onChange={(event) => setAddressLine1(event.target.value)}
            placeholder="Street, building, apartment"
            required
          />
        </label>
        <label className="form-field">
          Address line 2
          <input
            value={addressLine2}
            onChange={(event) => setAddressLine2(event.target.value)}
            placeholder="Area or landmark"
          />
        </label>
        <label className="form-field">
          City*
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city"
            required
          />
        </label>
        <div className="md:col-span-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
          <p className="font-semibold text-zinc-900">Shipping Method</p>
          <p>Standard Shipping</p>
          <p className="mt-1">Shipping Charge: AED {shippingCharge}</p>
          <p className="mt-2 font-semibold text-zinc-900">
            Payment Method: Cash on Delivery (COD) Only
          </p>
        </div>
        <div className="md:col-span-2 rounded-md border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
          <p>Subtotal: AED {total}</p>
          <p className="mt-1 font-semibold text-zinc-900">Grand Total: AED {grandTotal}</p>
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="animated-button checkout-submit md:col-span-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Placing Order..." : "Place Order"}
        </button>
        {message ? (
          <p className="md:col-span-2 text-sm font-bold text-red-600">{message}</p>
        ) : null}
      </form>
    </>
  );
}
