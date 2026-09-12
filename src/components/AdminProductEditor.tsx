"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProductSlug } from "@/lib/admin-products";
import {
  categories as fallbackCategories,
  type Category,
  type CategorySlug,
} from "@/lib/categories";
import type { Product } from "@/lib/products";
import {
  fetchSupabaseProductBySlug,
  uploadProductImage,
  upsertSupabaseProduct,
} from "@/lib/supabase-products";
import { compressImageFile } from "@/lib/image-compression";
import {
  normalizeImageUrl,
  normalizeImageUrls,
} from "@/lib/image-url";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import { supabase } from "@/lib/supabase";

const emptyForm = {
  name: "",
  categorySlug: "home-and-kitchen" as CategorySlug,
  sku: "",
  brand: "",
  status: "active",
  stockStatus: "in_stock",
  searchKeywords: "",
  actualPrice: "",
  price: "",
  freeShipping: false,
  videoUrl: "",
  summary: "",
  details: "",
};

type ProductForm = typeof emptyForm;

type ManagedImageSource = "existing" | "new" | "url";

type ManagedImage = {
  id: string;
  url: string;
  previewUrl: string;
  source: ManagedImageSource;
  file?: File;
  isMain: boolean;
  uploadProgress: number;
};

export function AdminProductEditor({
  productSlug,
}: {
  productSlug?: string;
}) {
  const router = useRouter();
  const isEditing = Boolean(productSlug);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [categoryItems, setCategoryItems] =
    useState<Category[]>(fallbackCategories);

  const [managedImages, setManagedImages] =
    useState<ManagedImage[]>([]);

  const [urlInput, setUrlInput] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const dragImageIndexRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;

    async function initializeEditor() {
      try {
        const nextCategories =
          await fetchMergedCategories().catch(
            () => fallbackCategories,
          );

        if (!active) {
          return;
        }

        setCategoryItems(nextCategories);

        if (!productSlug) {
          setForm((current) => ({
            ...current,
            categorySlug:
              nextCategories[0]?.slug ??
              current.categorySlug,
          }));

          return;
        }

        const product =
          await fetchSupabaseProductBySlug(productSlug);

        if (!active) {
          return;
        }

        if (!product) {
          setMessage("Product not found.");
          return;
        }

        setForm({
          name: product.name,
          categorySlug: product.categorySlug,
          sku: product.sku ?? "",
          brand: product.brand ?? "",
          status: product.status ?? "active",
          stockStatus:
            product.stockStatus ?? "in_stock",
          searchKeywords: (
            product.searchKeywords ?? []
          ).join(", "),
          actualPrice: product.actualPrice
            ? String(product.actualPrice)
            : "",
          price: String(product.price),
          freeShipping: Boolean(product.freeShipping),
          videoUrl: product.videoUrl ?? "",
          summary: product.summary,
          details: product.details,
        });

        const urls = normalizeImageUrls(
          product.imageUrls ?? [product.imageUrl],
        );

        setManagedImages(
          urls.map((url, index) => ({
            id: `existing-${index}-${url}`,
            url,
            previewUrl: url,
            source: "existing",
            isMain: index === 0,
            uploadProgress: 100,
          })),
        );
      } catch (error) {
        const detail =
          error &&
          typeof error === "object" &&
          "message" in error
            ? String(error.message)
            : "Unknown error";

        setMessage(
          `Unable to load product: ${detail}`,
        );
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
  }, [productSlug]);

  function updateForm(
    field: Exclude<
      keyof ProductForm,
      "freeShipping"
    >,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function ensureMainImage(
    images: ManagedImage[],
  ) {
    if (images.length === 0) {
      return images;
    }

    if (images.some((image) => image.isMain)) {
      return images;
    }

    return images.map((image, index) => ({
      ...image,
      isMain: index === 0,
    }));
  }

  function createManagedImage(
    id: string,
    url: string,
    source: ManagedImageSource,
    file?: File,
  ): ManagedImage {
    return {
      id,
      url,
      previewUrl: url,
      source,
      file,
      isMain: false,
      uploadProgress:
        source === "new" ? 0 : 100,
    };
  }

  function setMainImage(imageId: string) {
    setManagedImages((images) =>
      images.map((image) => ({
        ...image,
        isMain: image.id === imageId,
      })),
    );
  }

  function removeImage(imageId: string) {
    setManagedImages((images) =>
      ensureMainImage(
        images.filter(
          (image) => image.id !== imageId,
        ),
      ),
    );
  }

  function moveImage(
    imageId: string,
    direction: "up" | "down",
  ) {
    setManagedImages((images) => {
      const index = images.findIndex(
        (image) => image.id === imageId,
      );

      if (index < 0) {
        return images;
      }

      const target =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        target < 0 ||
        target >= images.length
      ) {
        return images;
      }

      const next = [...images];
      const [moved] = next.splice(index, 1);

      next.splice(target, 0, moved);

      return ensureMainImage(next);
    });
  }

  function reorderImages(
    fromIndex: number,
    toIndex: number,
  ) {
    if (fromIndex === toIndex) {
      return;
    }

    setManagedImages((images) => {
      const next = [...images];
      const [moved] = next.splice(
        fromIndex,
        1,
      );

      next.splice(toIndex, 0, moved);

      return ensureMainImage(next);
    });
  }

  async function handleIncomingFiles(
    fileList: FileList | null,
  ) {
    if (!fileList?.length) {
      return;
    }

    const nextImages = Array.from(fileList)
      .filter((file) =>
        file.type.startsWith("image/"),
      )
      .map((file) =>
        createManagedImage(
          crypto.randomUUID(),
          URL.createObjectURL(file),
          "new",
          file,
        ),
      );

    setManagedImages((images) =>
      ensureMainImage([
        ...images,
        ...nextImages,
      ]),
    );
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    void handleIncomingFiles(
      event.dataTransfer.files,
    );
  }

  function addImageUrl() {
    const normalized =
      normalizeImageUrl(urlInput);

    if (!normalized) {
      return;
    }

    setManagedImages((images) => {
      if (
        images.some(
          (image) =>
            image.url === normalized,
        )
      ) {
        return images;
      }

      return ensureMainImage([
        ...images,
        createManagedImage(
          `url-${normalized}`,
          normalized,
          "url",
        ),
      ]);
    });

    setUrlInput("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (!form.name.trim()) {
      setMessage("Please enter a product name.");
      return;
    }

    if (managedImages.length === 0) {
      setMessage(
        "Please upload at least one product image.",
      );
      return;
    }

    const parsedPrice = Number(form.price);

    const parsedActualPrice =
      form.actualPrice.trim()
        ? Number(form.actualPrice)
        : undefined;

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      setMessage(
        "Please enter a valid selling price.",
      );
      return;
    }

    if (
      parsedActualPrice !== undefined &&
      (!Number.isFinite(parsedActualPrice) ||
        parsedActualPrice < 0)
    ) {
      setMessage(
        "Please enter a valid actual price.",
      );
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const uploadedUrlById =
        new Map<string, string>();

      for (const image of managedImages) {
        if (
          image.source === "new" &&
          image.file
        ) {
          setManagedImages((images) =>
            images.map((item) =>
              item.id === image.id
                ? {
                    ...item,
                    uploadProgress: 15,
                  }
                : item,
            ),
          );

          const compressedFile =
            await compressImageFile(
              image.file,
            );

          setManagedImages((images) =>
            images.map((item) =>
              item.id === image.id
                ? {
                    ...item,
                    uploadProgress: 55,
                  }
                : item,
            ),
          );

          const uploadedUrl =
            await uploadProductImage(
              compressedFile,
            );

          const normalizedUploadedUrl =
            normalizeImageUrl(uploadedUrl);

          uploadedUrlById.set(
            image.id,
            normalizedUploadedUrl,
          );

          setManagedImages((images) =>
            images.map((item) =>
              item.id === image.id
                ? {
                    ...item,
                    url: normalizedUploadedUrl,
                    previewUrl:
                      normalizedUploadedUrl,
                    source: "existing",
                    file: undefined,
                    uploadProgress: 100,
                  }
                : item,
            ),
          );
        } else {
          uploadedUrlById.set(
            image.id,
            normalizeImageUrl(image.url),
          );
        }
      }

      const normalizedOrderedUrls =
        normalizeImageUrls(
          managedImages.map(
            (image) =>
              uploadedUrlById.get(image.id) ??
              image.url,
          ),
        );

      const selectedMain =
        uploadedUrlById.get(
          managedImages.find(
            (image) => image.isMain,
          )?.id ?? "",
        ) ??
        normalizedOrderedUrls[0] ??
        "";

      const mainImageUrl =
        normalizeImageUrl(selectedMain);

      const imageUrls = [
        mainImageUrl,
        ...normalizedOrderedUrls.filter(
          (url) =>
            url !== mainImageUrl,
        ),
      ];

      const slug =
        isEditing && productSlug
          ? productSlug
          : createProductSlug(form.name);

      const product: Product = {
        name: form.name.trim(),
        slug,
        categorySlug: form.categorySlug,
        sku: form.sku.trim() || undefined,
        brand:
          form.brand.trim() || undefined,
        status:
          form.status === "draft"
            ? "draft"
            : "active",
        stockStatus:
          form.stockStatus ===
          "out_of_stock"
            ? "out_of_stock"
            : "in_stock",
        searchKeywords:
          form.searchKeywords
            .split(",")
            .map((keyword) =>
              keyword.trim(),
            )
            .filter(Boolean),
        actualPrice: parsedActualPrice,
        price: parsedPrice,
        freeShipping:
          form.freeShipping,
        imageUrl: mainImageUrl,
        imageUrls,
        videoUrl:
          form.videoUrl.trim() ||
          undefined,
        summary: form.summary,
        details: form.details,
      };

      await upsertSupabaseProduct(product, {
        previousSlug:
          isEditing && productSlug
            ? productSlug
            : undefined,
      });

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch(
          "/api/admin/revalidate",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              slug,
              previousSlug:
                isEditing
                  ? productSlug
                  : undefined,
            }),
          },
        ).catch(() => null);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      const detail =
        error &&
        typeof error === "object" &&
        "message" in error
          ? String(error.message)
          : "Unknown error";

      setMessage(
        `Unable to save product: ${detail}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-zinc-500">
            Loading product...
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
              href="/admin/products"
              className="text-sm font-bold text-zinc-500 transition hover:text-orange-600"
            >
              ← Back to Products
            </Link>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Product Management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-zinc-950">
              {isEditing
                ? "Edit Product"
                : "Add Product"}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {isEditing
                ? "Update product information, pricing, availability and media."
                : "Create a new product for HM Shop Online."}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
              form.status === "active"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {form.status === "active"
              ? "Active"
              : "Draft"}
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
            title="Product Information"
            description="Basic information used throughout your store."
          >
            <div className="grid gap-5">
              <LightField label="Product name">
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="Enter product name"
                  required
                  className={inputClass}
                />
              </LightField>

              <div className="grid gap-5 md:grid-cols-3">
                <LightField label="Category">
                  <select
                    value={form.categorySlug}
                    onChange={(event) =>
                      updateForm(
                        "categorySlug",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  >
                    {categoryItems.map(
                      (category) => (
                        <option
                          key={category.slug}
                          value={category.slug}
                        >
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>
                </LightField>

                <LightField label="SKU / Product Code">
                  <input
                    value={form.sku}
                    onChange={(event) =>
                      updateForm(
                        "sku",
                        event.target.value,
                      )
                    }
                    placeholder="HM-KIT-001"
                    className={inputClass}
                  />
                </LightField>

                <LightField label="Brand">
                  <input
                    value={form.brand}
                    onChange={(event) =>
                      updateForm(
                        "brand",
                        event.target.value,
                      )
                    }
                    placeholder="Optional"
                    className={inputClass}
                  />
                </LightField>
              </div>
            </div>
          </EditorCard>

          <EditorCard
            title="Publishing & Availability"
            description="Control whether the product is visible and available to customers."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <LightField label="Product Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="active">
                    Active
                  </option>
                  <option value="draft">
                    Draft
                  </option>
                </select>
              </LightField>

              <LightField label="Stock Status">
                <select
                  value={form.stockStatus}
                  onChange={(event) =>
                    updateForm(
                      "stockStatus",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="in_stock">
                    In Stock
                  </option>
                  <option value="out_of_stock">
                    Out of Stock
                  </option>
                </select>
              </LightField>
            </div>

            <div className="mt-5">
              <LightField label="Search Keywords">
                <input
                  value={form.searchKeywords}
                  onChange={(event) =>
                    updateForm(
                      "searchKeywords",
                      event.target.value,
                    )
                  }
                  placeholder="air cooler, portable cooler, summer gadget"
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-zinc-400">
                  Separate keywords with commas.
                  Customers do not see these.
                </p>
              </LightField>
            </div>
          </EditorCard>

          <EditorCard
            title="Pricing"
            description="Set the customer selling price and optional comparison price."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <LightField label="Actual price">
                <input
                  type="number"
                  min="0"
                  value={form.actualPrice}
                  onChange={(event) =>
                    updateForm(
                      "actualPrice",
                      event.target.value,
                    )
                  }
                  placeholder="AED actual price"
                  className={inputClass}
                />
              </LightField>

              <LightField label="Selling price">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    updateForm(
                      "price",
                      event.target.value,
                    )
                  }
                  placeholder="AED selling price"
                  required
                  className={inputClass}
                />
              </LightField>
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700">
              <input
                type="checkbox"
                checked={form.freeShipping}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    freeShipping:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-orange-500"
              />

              Free Shipping
            </label>
          </EditorCard>

          <EditorCard
            title="Product Media"
            description="Upload, arrange and choose the main product image."
          >
            <div
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDrop={handleDrop}
              className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-center"
            >
              <p className="text-sm font-bold text-zinc-800">
                Drop product images here
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                or choose one or multiple files
              </p>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-4 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
              >
                Choose Images
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) =>
                  void handleIncomingFiles(
                    event.target.files,
                  )
                }
              />
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={urlInput}
                onChange={(event) =>
                  setUrlInput(
                    event.target.value,
                  )
                }
                placeholder="Paste image URL"
                className={inputClass}
              />

              <button
                type="button"
                onClick={addImageUrl}
                className="shrink-0 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:border-orange-300 hover:text-orange-600"
              >
                Add URL
              </button>
            </div>

            {managedImages.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {managedImages.map(
                  (image, index) => (
                    <ManagedImageCard
                      key={image.id}
                      image={image}
                      index={index}
                      isSaving={isSaving}
                      onSetMain={() =>
                        setMainImage(image.id)
                      }
                      onMoveUp={() =>
                        moveImage(
                          image.id,
                          "up",
                        )
                      }
                      onMoveDown={() =>
                        moveImage(
                          image.id,
                          "down",
                        )
                      }
                      onRemove={() =>
                        removeImage(image.id)
                      }
                      onDragStart={() => {
                        dragImageIndexRef.current =
                          index;
                      }}
                      onDrop={() => {
                        const fromIndex =
                          dragImageIndexRef.current;

                        if (
                          fromIndex === null
                        ) {
                          return;
                        }

                        reorderImages(
                          fromIndex,
                          index,
                        );

                        dragImageIndexRef.current =
                          null;
                      }}
                    />
                  ),
                )}
              </div>
            ) : null}

            <div className="mt-5">
              <LightField label="Product video link">
                <input
                  value={form.videoUrl}
                  onChange={(event) =>
                    updateForm(
                      "videoUrl",
                      event.target.value,
                    )
                  }
                  placeholder="Optional video link"
                  className={inputClass}
                />
              </LightField>
            </div>
          </EditorCard>

          <EditorCard
            title="Product Content"
            description="Content shown on product cards and product pages."
          >
            <div className="grid gap-5">
              <LightField label="Short summary">
                <textarea
                  value={form.summary}
                  onChange={(event) =>
                    updateForm(
                      "summary",
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Short product summary"
                  required
                  className={inputClass}
                />
              </LightField>

              <LightField label="Product details">
                <textarea
                  value={form.details}
                  onChange={(event) =>
                    updateForm(
                      "details",
                      event.target.value,
                    )
                  }
                  rows={7}
                  placeholder="Detailed product description"
                  required
                  className={inputClass}
                />
              </LightField>
            </div>
          </EditorCard>

          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {isEditing
                ? "Save your changes before leaving this page."
                : "Complete the product information and save when ready."}
            </p>

            <div className="flex gap-3">
              <Link
                href="/admin/products"
                className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancel
              </Link>

              <button
                disabled={isSaving}
                className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

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
      <div className="mb-5 border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-bold text-zinc-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      {children}
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
    <label className="block text-sm font-semibold text-zinc-700">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

type ManagedImageCardProps = {
  image: ManagedImage;
  index: number;
  isSaving: boolean;
  onSetMain: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDrop: () => void;
};

function ManagedImageCard({
  image,
  index,
  isSaving,
  onSetMain,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDragStart,
  onDrop,
}: ManagedImageCardProps) {
  const isBlob =
    image.previewUrl.startsWith("blob:");

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) =>
        event.preventDefault()
      }
      onDrop={onDrop}
      className={`rounded-2xl border bg-white p-2 ${
        image.isMain
          ? "border-orange-300 ring-2 ring-orange-100"
          : "border-zinc-200"
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-50">
        <Image
          src={image.previewUrl}
          alt={`Product image ${index + 1}`}
          fill
          sizes="240px"
          loading="lazy"
          unoptimized={isBlob}
          className="object-contain p-2"
          referrerPolicy="no-referrer"
        />

        {image.isMain ? (
          <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white">
            Main
          </span>
        ) : null}
      </div>

      {image.source === "new" ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{
              width: `${image.uploadProgress}%`,
            }}
          />
        </div>
      ) : null}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={onSetMain}
          className="rounded-lg border border-zinc-200 px-2 py-2 text-xs font-bold text-zinc-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50"
        >
          Set Main
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={onRemove}
          className="rounded-lg border border-zinc-200 px-2 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          Remove
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={onMoveUp}
          className="rounded-lg border border-zinc-200 px-2 py-2 text-xs font-semibold text-zinc-600"
        >
          ← Up
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={onMoveDown}
          className="rounded-lg border border-zinc-200 px-2 py-2 text-xs font-semibold text-zinc-600"
        >
          Down →
        </button>
      </div>
    </div>
  );
}