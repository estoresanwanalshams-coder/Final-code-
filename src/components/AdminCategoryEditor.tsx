"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProductSlug } from "@/lib/admin-products";
import {
  adminCategoriesUpdatedEvent,
  type Category,
} from "@/lib/categories";
import {
  fetchSupabaseCategories,
  upsertSupabaseCategory,
} from "@/lib/supabase-categories";
import { uploadProductImage } from "@/lib/supabase-products";
import { compressImageFile } from "@/lib/image-compression";
import { normalizeImageUrl } from "@/lib/image-url";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  isActive: true,
  displayOrder: "0",
};

type CategoryForm = typeof emptyForm;

export function AdminCategoryEditor({
  categorySlug,
}: {
  categorySlug?: string;
}) {
  const router = useRouter();
  const isEditing = Boolean(categorySlug);

  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;

    async function initializeEditor() {
      if (!categorySlug) {
        setIsLoading(false);
        return;
      }

      try {
        const categories = await fetchSupabaseCategories();

        if (!active) {
          return;
        }

        const category = categories.find(
          (item) => item.slug === categorySlug,
        );

        if (!category) {
          setMessage("Category not found.");
          return;
        }

        setForm({
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl ?? "",
          isActive: category.isActive ?? true,
          displayOrder: String(category.displayOrder ?? 0),
        });

        setPreviewUrl(category.imageUrl ?? "");
      } catch (error) {
        const detail =
          error &&
          typeof error === "object" &&
          "message" in error
            ? String(error.message)
            : "Unknown error";

        setMessage(`Unable to load category: ${detail}`);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void initializeEditor();

    return () => {
      active = false;
    };
  }, [categorySlug]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function updateTextField(
    field: "name" | "description" | "imageUrl" | "displayOrder",
    value: string,
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      if (field === "name" && !isEditing) {
        next.slug = createProductSlug(value);
      }

      return next;
    });
  }

  function handleImageFile(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
  }

  function removeImage() {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setForm((current) => ({
      ...current,
      imageUrl: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();
    const displayOrder = Number.parseInt(form.displayOrder, 10);

    if (!name) {
      setMessage("Category name is required.");
      return;
    }

    if (!description) {
      setMessage("Category description is required.");
      return;
    }

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0
    ) {
      setMessage(
        "Display order must be a whole number of 0 or greater.",
      );
      return;
    }

    const slug =
      isEditing && categorySlug
        ? categorySlug
        : createProductSlug(name);

    if (!slug) {
      setMessage("Unable to create a valid category slug.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      let finalImageUrl = form.imageUrl.trim();

      if (selectedFile) {
        const compressedFile =
          await compressImageFile(selectedFile);

        const uploadedUrl =
          await uploadProductImage(compressedFile);

        finalImageUrl = normalizeImageUrl(uploadedUrl);
      } else if (finalImageUrl) {
        finalImageUrl = normalizeImageUrl(finalImageUrl);
      }

      const category: Category = {
        name,
        slug,
        description,
        imageUrl: finalImageUrl || undefined,
        isActive: form.isActive,
        displayOrder,
      };

      await upsertSupabaseCategory(category);

      window.dispatchEvent(
        new Event(adminCategoriesUpdatedEvent),
      );

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      const detail =
        error &&
        typeof error === "object" &&
        "message" in error
          ? String(error.message)
          : "Unknown error";

      setMessage(`Unable to save category: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-zinc-500">
            Loading category...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/categories"
              className="text-sm font-bold text-zinc-500 transition hover:text-orange-600"
            >
              ← Back to Categories
            </Link>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Category Management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-zinc-950">
              {isEditing ? "Edit Category" : "Add Category"}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {isEditing
                ? "Update category information, visibility, display order and visual."
                : "Create a new storefront category for HM Shop Online."}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
              form.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {form.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {message ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6"
        >
          <EditorCard
            title="Category Information"
            description="Basic information customers will see throughout the storefront."
          >
            <div className="grid gap-5">
              <LightField label="Category name">
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateTextField(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="Enter category name"
                  required
                  className={inputClass}
                />
              </LightField>

              <LightField label="Category slug">
                <input
                  value={form.slug}
                  readOnly
                  placeholder="Generated automatically"
                  className={`${inputClass} cursor-not-allowed bg-zinc-100 text-zinc-500`}
                />

                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  {isEditing
                    ? "The slug is locked because existing products and storefront links may depend on it."
                    : "Generated automatically from the category name."}
                </p>
              </LightField>

              <LightField label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateTextField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Short description of this category"
                  rows={4}
                  required
                  className={inputClass}
                />
              </LightField>
            </div>
          </EditorCard>

          <EditorCard
            title="Visibility & Display"
            description="Control whether customers can see this category and where it appears."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <LightField label="Category status">
                <select
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive:
                        event.target.value === "active",
                    }))
                  }
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Inactive categories stay available in admin but are hidden from customers.
                </p>
              </LightField>

              <LightField label="Display order">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.displayOrder}
                  onChange={(event) =>
                    updateTextField(
                      "displayOrder",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />

                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Lower numbers appear first. Example: 1, 2, 3.
                </p>
              </LightField>
            </div>
          </EditorCard>

          <EditorCard
            title="Category Visual"
            description="Add an optional image for future category merchandising and storefront presentation."
          >
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Preview
                </p>

                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt={`${form.name || "Category"} preview`}
                      width={500}
                      height={500}
                      unoptimized
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-xl font-black text-orange-500">
                        {form.name
                          .trim()
                          .charAt(0)
                          .toUpperCase() || "C"}
                      </div>

                      <p className="mt-3 text-xs font-semibold text-zinc-400">
                        No category image
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid content-start gap-5">
                <LightField label="Upload image">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleImageFile(
                        event.target.files?.[0],
                      )
                    }
                    className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-orange-600"
                  />
                </LightField>

                <LightField label="Or use image URL">
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) => {
                      const value = event.target.value;

                      updateTextField(
                        "imageUrl",
                        value,
                      );

                      if (!selectedFile) {
                        setPreviewUrl(value);
                      }
                    }}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </LightField>

                {previewUrl ? (
                  <div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </EditorCard>

          <div className="sticky bottom-0 z-20 flex flex-col gap-3 border-t border-zinc-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/admin/categories"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-300 focus:bg-white";

function EditorCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-bold text-zinc-950">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}

function LightField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}