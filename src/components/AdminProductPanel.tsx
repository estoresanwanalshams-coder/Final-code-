"use client";

import Image from "next/image";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createProductSlug } from "@/lib/admin-products";
import {
  adminCategoriesUpdatedEvent,
  categories as fallbackCategories,
  type Category,
  type CategorySlug,
} from "@/lib/categories";
import type { Product } from "@/lib/products";
import {
  deleteSupabaseProduct,
  fetchSupabaseProducts,
  uploadProductImage,
  upsertSupabaseProduct,
} from "@/lib/supabase-products";
import { compressImageFile } from "@/lib/image-compression";
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-url";
import { fetchMergedCategories } from "@/lib/supabase-categories";

const emptyForm = {
  name: "",
  categorySlug: "home-and-kitchen" as CategorySlug,
  actualPrice: "",
  price: "",
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

export function AdminProductPanel() {
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryItems, setCategoryItems] = useState<Category[]>(fallbackCategories);
  const [managedImages, setManagedImages] = useState<ManagedImage[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const dragImageIndexRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadCategoryOptions() {
    const nextCategories = await fetchMergedCategories().catch(
      () => fallbackCategories,
    );
    setCategoryItems(nextCategories);
    setForm((currentForm) => {
      if (
        nextCategories.some(
          (category) => category.slug === currentForm.categorySlug,
        )
      ) {
        return currentForm;
      }

      return {
        ...currentForm,
        categorySlug: nextCategories[0]?.slug as CategorySlug,
      };
    });
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const [nextProducts] = await Promise.all([
          fetchSupabaseProducts(),
          loadCategoryOptions(),
        ]);
        setAdminProducts(nextProducts);
      } catch {
        setMessage("Create the Supabase products table before using admin CRUD.");
      } finally {
        setIsLoading(false);
      }
    }

    const timer = window.setTimeout(loadProducts, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleCategoriesUpdated() {
      void loadCategoryOptions();
    }

    window.addEventListener(adminCategoriesUpdatedEvent, handleCategoriesUpdated);

    return () => {
      window.removeEventListener(adminCategoriesUpdatedEvent, handleCategoriesUpdated);
    };
  }, []);

  const allProducts = useMemo(() => adminProducts, [adminProducts]);
  const visibleProducts = useMemo(() => {
    const query = productSearchQuery.trim().toLowerCase();
    if (!query) {
      return allProducts;
    }

    return allProducts.filter((product) => {
      const categoryName =
        categoryItems.find((item) => item.slug === product.categorySlug)?.name ?? "";
      return (
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.categorySlug.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query)
      );
    });
  }, [allProducts, productSearchQuery, categoryItems]);

  function updateForm(field: keyof ProductForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function ensureMainImage(images: ManagedImage[]) {
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
      uploadProgress: source === "new" ? 0 : 100,
    };
  }

  function setMainImage(imageId: string) {
    setManagedImages((currentImages) =>
      currentImages.map((image) => ({
        ...image,
        isMain: image.id === imageId,
      })),
    );
  }

  function removeImage(imageId: string) {
    setManagedImages((currentImages) =>
      ensureMainImage(currentImages.filter((image) => image.id !== imageId)),
    );
  }

  function reorderImages(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) {
      return;
    }

    setManagedImages((currentImages) => {
      const nextImages = [...currentImages];
      const [moved] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, moved);
      return ensureMainImage(nextImages);
    });
  }

  function moveImage(imageId: string, direction: "up" | "down") {
    setManagedImages((currentImages) => {
      const index = currentImages.findIndex((image) => image.id === imageId);
      if (index < 0) {
        return currentImages;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentImages.length) {
        return currentImages;
      }

      const nextImages = [...currentImages];
      const [moved] = nextImages.splice(index, 1);
      nextImages.splice(targetIndex, 0, moved);
      return ensureMainImage(nextImages);
    });
  }

  async function handleIncomingFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const nextImages = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) =>
        createManagedImage(crypto.randomUUID(), URL.createObjectURL(file), "new", file),
      );

    if (nextImages.length === 0) {
      return;
    }

    setManagedImages((currentImages) =>
      ensureMainImage([...currentImages, ...nextImages]),
    );
  }

  function handleDropZoneDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    void handleIncomingFiles(event.dataTransfer.files);
  }

  function addImageUrl() {
    const normalized = normalizeImageUrl(urlInput);
    if (!normalized) {
      return;
    }

    setManagedImages((currentImages) => {
      if (currentImages.some((image) => image.url === normalized)) {
        return currentImages;
      }

      return ensureMainImage([
        ...currentImages,
        createManagedImage(`url-${normalized}`, normalized, "url"),
      ]);
    });
    setUrlInput("");
  }

  function resetForm() {
    setEditingSlug(null);
    setForm(emptyForm);
    setManagedImages([]);
    setUrlInput("");
  }

  function downloadCsv() {
    if (allProducts.length === 0) {
      setMessage("No products available to export.");
      return;
    }

    const headers = [
      "Name",
      "Slug",
      "Category",
      "Actual Price",
      "Price",
      "Main Image URL",
      "Summary",
    ];
    const rows = allProducts.map((product) => [
      product.name,
      product.slug,
      product.categorySlug,
      String(product.actualPrice ?? ""),
      String(product.price),
      product.imageUrl,
      product.summary,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "products-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPdf() {
    if (allProducts.length === 0) {
      setMessage("No products available to export.");
      return;
    }

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.setFontSize(14);
    pdf.text("Products List", 14, 14);
    autoTable(pdf, {
      startY: 20,
      head: [["Name", "Slug", "Category", "Price", "Main Image URL"]],
      body: allProducts.map((product) => [
        product.name,
        product.slug,
        product.categorySlug,
        product.actualPrice && product.actualPrice > product.price
          ? `AED ${product.actualPrice} -> AED ${product.price}`
          : `AED ${product.price}`,
        product.imageUrl,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [24, 24, 27] },
    });
    pdf.save("products-list.pdf");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    if (managedImages.length === 0) {
      setMessage("Please upload at least one product image.");
      return;
    }

    const slug = editingSlug ?? createProductSlug(form.name);
    setIsSaving(true);

    try {
      const uploadedUrlById = new Map<string, string>();

      for (const image of managedImages) {
        if (image.source === "new" && image.file) {
          setManagedImages((currentImages) =>
            currentImages.map((currentImage) =>
              currentImage.id === image.id
                ? { ...currentImage, uploadProgress: 15 }
                : currentImage,
            ),
          );
          const compressedFile = await compressImageFile(image.file);
          setManagedImages((currentImages) =>
            currentImages.map((currentImage) =>
              currentImage.id === image.id
                ? { ...currentImage, uploadProgress: 55 }
                : currentImage,
            ),
          );
          const uploadedUrl = await uploadProductImage(compressedFile);
          const normalizedUploadedUrl = normalizeImageUrl(uploadedUrl);
          uploadedUrlById.set(image.id, normalizedUploadedUrl);
          setManagedImages((currentImages) =>
            currentImages.map((currentImage) =>
              currentImage.id === image.id
                ? {
                    ...currentImage,
                    url: normalizedUploadedUrl,
                    previewUrl: normalizedUploadedUrl,
                    source: "existing",
                    file: undefined,
                    uploadProgress: 100,
                  }
                : currentImage,
            ),
          );
          continue;
        }

        uploadedUrlById.set(image.id, normalizeImageUrl(image.url));
      }

      const normalizedOrderedUrls = normalizeImageUrls(
        managedImages.map((image) => uploadedUrlById.get(image.id) ?? image.url),
      );
      const selectedMain =
        uploadedUrlById.get(
          managedImages.find((image) => image.isMain)?.id ?? "",
        ) ?? normalizedOrderedUrls[0] ?? "";
      const mainImageUrl = normalizeImageUrl(selectedMain);
      const imageUrls = [
        mainImageUrl,
        ...normalizedOrderedUrls.filter((url) => url !== mainImageUrl),
      ];

      const product: Product = {
        name: form.name,
        slug,
        categorySlug: form.categorySlug,
        actualPrice: form.actualPrice ? Number(form.actualPrice) : undefined,
        price: Number(form.price),
        imageUrl: mainImageUrl,
        imageUrls,
        videoUrl: form.videoUrl || undefined,
        summary: form.summary,
        details: form.details,
      };

      await upsertSupabaseProduct(product);
      setAdminProducts(await fetchSupabaseProducts());
      setMessage(editingSlug ? "Product updated." : "Product added.");
      resetForm();
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";
      setMessage(`Unable to save product: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  }

  function editProduct(product: Product) {
    const initialUrls = normalizeImageUrls(product.imageUrls ?? [product.imageUrl]);
    setEditingSlug(product.slug);
    setForm({
      name: product.name,
      categorySlug: product.categorySlug,
      actualPrice: product.actualPrice ? String(product.actualPrice) : "",
      price: String(product.price),
      videoUrl: product.videoUrl ?? "",
      summary: product.summary,
      details: product.details,
    });
    setManagedImages(
      ensureMainImage(
        initialUrls.map((url, index) => ({
          ...createManagedImage(`existing-${index}-${url}`, url, "existing"),
          isMain: index === 0,
          uploadProgress: 100,
        })),
      ),
    );
  }

  async function deleteProduct(slug: string) {
    try {
      await deleteSupabaseProduct(slug);
      setAdminProducts(await fetchSupabaseProducts());
      setMessage("Product deleted.");
    } catch {
      setMessage("Unable to delete product. Check Supabase table and policies.");
    }
  }

  return (
    <section className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="content-reveal h-fit rounded-2xl bg-zinc-950 p-6 text-white shadow-xl"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Admin panel
          </p>
          <h1 className="mt-3 text-3xl font-bold">
            {editingSlug ? "Edit product" : "Add new product"}
          </h1>

          <div className="mt-7 grid gap-4">
            <label className="form-field">
              Product name
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Enter product name"
                required
              />
            </label>

            <label className="form-field">
              Category
              <select
                value={form.categorySlug}
                onChange={(event) =>
                  updateForm("categorySlug", event.target.value)
                }
              >
                {categoryItems.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              Actual price
              <input
                type="number"
                min="0"
                value={form.actualPrice}
                onChange={(event) => updateForm("actualPrice", event.target.value)}
                placeholder="AED actual price"
              />
            </label>

            <label className="form-field">
              Price
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
                placeholder="AED price"
                required
              />
            </label>

            <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
              <p className="text-sm font-bold text-white">Product images</p>
              <p className="mt-1 text-xs text-zinc-300">
                Drag and drop, reorder, set any image as main, or remove images.
              </p>

              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDropZoneDrop}
                className="mt-4 rounded-xl border border-dashed border-white/30 bg-white/5 p-4 text-center"
              >
                <p className="text-sm text-zinc-200">
                  Drop images here or choose files.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Choose Images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => void handleIncomingFiles(event.target.files)}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={urlInput}
                  onChange={(event) => setUrlInput(event.target.value)}
                  placeholder="Paste image URL (Google Drive supported)"
                  className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-300"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="rounded-md border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Add URL
                </button>
              </div>

              {managedImages.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {managedImages.map((image, index) => (
                    <ManagedImageCard
                      key={image.id}
                      image={image}
                      index={index}
                      isSaving={isSaving}
                      onSetMain={() => setMainImage(image.id)}
                      onMoveUp={() => moveImage(image.id, "up")}
                      onMoveDown={() => moveImage(image.id, "down")}
                      onRemove={() => removeImage(image.id)}
                      onDragStart={() => {
                        dragImageIndexRef.current = index;
                      }}
                      onDrop={() => {
                        const fromIndex = dragImageIndexRef.current;
                        if (fromIndex === null) {
                          return;
                        }
                        reorderImages(fromIndex, index);
                        dragImageIndexRef.current = null;
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <label className="form-field">
              Product video link
              <input
                value={form.videoUrl}
                onChange={(event) => updateForm("videoUrl", event.target.value)}
                placeholder="Optional video link"
              />
            </label>

            <label className="form-field">
              Short summary
              <textarea
                value={form.summary}
                onChange={(event) => updateForm("summary", event.target.value)}
                placeholder="Short text for product card"
                rows={3}
                required
              />
            </label>

            <label className="form-field">
              Product details
              <textarea
                value={form.details}
                onChange={(event) => updateForm("details", event.target.value)}
                placeholder="Detailed product page description"
                rows={4}
                required
              />
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              disabled={isSaving}
              className="animated-button inquiry-submit flex-1 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving
                ? "Saving..."
                : editingSlug
                  ? "Save Changes"
                  : "Add Product"}
            </button>
            {editingSlug ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="content-reveal">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Product manager
          </p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-950">
            Current products
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Products shown here are stored permanently in Supabase and appear on
            the website for every visitor.
          </p>
          {message ? (
            <p className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-700">
              {message}
            </p>
          ) : null}
          <div className="mt-4 max-w-xl">
            <label className="light-form-field">
              Search products
              <input
                type="text"
                value={productSearchQuery}
                onChange={(event) => setProductSearchQuery(event.target.value)}
                placeholder="Search by name, slug, or category"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadCsv}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => void downloadPdf()}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
            >
              Export PDF
            </button>
          </div>

          <div className="mt-7 space-y-4">
            {isLoading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">
                Loading Supabase products...
              </div>
            ) : null}
            {visibleProducts.map((product) => {
              return (
                <article
                  key={product.slug}
                  className="cart-row rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="96px"
                      loading="lazy"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-zinc-950">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {product.actualPrice && product.actualPrice > product.price ? (
                        <>
                          <span className="line-through">AED {product.actualPrice}</span>{" "}
                          <span className="font-semibold text-emerald-700">AED {product.price}</span>
                        </>
                      ) : (
                        <>AED {product.price}</>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-950 transition hover:border-zinc-950"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.slug)}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
            {!isLoading && visibleProducts.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">
                No products match your search.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
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

const ManagedImageCard = memo(function ManagedImageCard({
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
  const isBlob = image.previewUrl.startsWith("blob:");

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className={`rounded-xl border p-2 ${
        image.isMain
          ? "border-emerald-400 bg-emerald-100/20"
          : "border-white/20 bg-white/5"
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
        <Image
          src={image.previewUrl}
          alt={`Product image ${index + 1}`}
          fill
          sizes="220px"
          loading="lazy"
          unoptimized={isBlob}
          className="object-cover"
          referrerPolicy="no-referrer"
        />
        {image.isMain ? (
          <span className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
            Main
          </span>
        ) : null}
      </div>
      {image.source === "new" ? (
        <div className="mt-2 h-1.5 rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${image.uploadProgress}%` }}
          />
        </div>
      ) : null}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSetMain}
          disabled={isSaving}
          className="rounded border border-white/30 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Set Main
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={isSaving}
          className="rounded border border-red-400/60 px-2 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isSaving}
          className="rounded border border-white/30 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Move Up
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isSaving}
          className="rounded border border-white/30 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Move Down
        </button>
      </div>
    </div>
  );
});
