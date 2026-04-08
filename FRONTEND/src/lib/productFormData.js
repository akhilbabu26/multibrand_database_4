/**
 * Internal helper to append common product fields to FormData.
 */
function appendCommonFields(fd, values) {
  if (values.name) fd.append("name", values.name);
  if (values.brand) fd.append("brand", values.brand);
  if (values.type) fd.append("type", values.type);
  if (values.color) fd.append("color", values.color);
  if (values.size) fd.append("size", String(values.size));
  if (values.gender) fd.append("gender", values.gender);
  
  // Map camelCase to snake_case for the Go Backend
  const costPrice = values.costPrice ?? values.cost_price;
  if (costPrice != null) fd.append("cost_price", String(costPrice));

  const originalPrice = values.originalPrice ?? values.original_price;
  if (originalPrice != null) fd.append("original_price", String(originalPrice));

  const discPerc = values.discountPercentage ?? values.discount_percentage;
  if (discPerc != null) fd.append("discount_percentage", String(discPerc));

  if (values.description != null) fd.append("description", values.description);
  
  const stock = values.stock;
  if (stock != null) fd.append("stock", String(stock));

  return fd;
}

/**
 * Build multipart form data for Go admin product create handler.
 */
export function appendCreateProduct(fd, values, imageFiles) {
  appendCommonFields(fd, values);
  if (imageFiles?.length) {
    const fileList = imageHeadersToList(imageFiles);
    for (let i = 0; i < fileList.length; i++) {
        fd.append("images", fileList[i]);
    }
  }
  return fd;
}

/**
 * Build multipart form data for Go admin product update handler.
 */
export function appendUpdateProduct(fd, values, imageFiles) {
  appendCommonFields(fd, values);
  
  const isActive = values.isActive ?? values.is_active;
  if (isActive !== undefined) {
    fd.append("is_active", isActive ? "true" : "false");
  }
  
  const deleteImageIds = values.deleteImageIds ?? values.delete_image_ids;
  if (deleteImageIds?.length) {
    deleteImageIds.forEach(id => {
      fd.append("delete_image_ids", id);
    });
  }

  if (imageFiles?.length) {
    const fileList = imageHeadersToList(imageFiles);
    for (let i = 0; i < fileList.length; i++) {
      fd.append("images", fileList[i]);
    }
  }
  return fd;
}

function imageHeadersToList(files) {
    if (!files) return [];
    if (files instanceof FileList) return Array.from(files);
    if (Array.isArray(files)) return files;
    return [files];
}
