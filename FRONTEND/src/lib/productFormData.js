/**
 * Build multipart form data for Go admin product create/update handlers.
 */

export function appendCreateProduct(fd, values, imageFiles) {
  fd.append("name", values.name);
  fd.append("brand", values.brand);
  fd.append("type", values.type);
  fd.append("color", values.color);
  fd.append("size", String(values.size));
  fd.append("gender", values.gender);
  fd.append("cost_price", String(values.cost_price));
  fd.append("original_price", String(values.original_price));
  fd.append("discount_percentage", String(values.discount_percentage ?? 0));
  fd.append("description", values.description ?? "");
  fd.append("stock", String(values.stock ?? 0));
  if (imageFiles?.length) {
    for (let i = 0; i < imageFiles.length; i++) {
      fd.append("images", imageFiles[i]);
    }
  }
  return fd;
}

export function appendUpdateProduct(fd, values, imageFiles) {
  fd.append("name", values.name);
  fd.append("brand", values.brand);
  fd.append("type", values.type);
  fd.append("color", values.color);
  fd.append("size", String(values.size));
  fd.append("gender", values.gender);
  fd.append("cost_price", String(values.cost_price));
  fd.append("original_price", String(values.original_price));
  fd.append("discount_percentage", String(values.discount_percentage ?? 0));
  fd.append("description", values.description ?? "");
  fd.append("stock", String(values.stock ?? 0));
  fd.append("is_active", values.is_active ? "true" : "false");
  if (imageFiles?.length) {
    for (let i = 0; i < imageFiles.length; i++) {
      fd.append("images", imageFiles[i]);
    }
  }
  return fd;
}
