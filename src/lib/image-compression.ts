type CompressOptions = {
  maxDimension?: number;
  quality?: number;
};

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to load image"));
    };
    image.src = objectUrl;
  });
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {},
) {
  const maxDimension = options.maxDimension ?? 1600;
  const quality = options.quality ?? 0.82;

  if (!file.type.startsWith("image/")) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });

  if (!blob) {
    return file;
  }

  const nextName = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], nextName, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
