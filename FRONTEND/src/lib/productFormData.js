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
  if (values.cost_price != null) fd.append("cost_price", String(values.cost_price));
  if (values.original_price != null) fd.append("original_price", String(values.original_price));
  if (values.discount_percentage != null) fd.append("discount_percentage", String(values.discount_percentage));
  if (values.description != null) fd.append("description", values.description);
  if (values.stock != null) fd.append("stock", String(values.stock));
  return fd;
}

/**
 * Build multipart form data for Go admin product create handler.
 */
export function appendCreateProduct(fd, values, imageFiles) {
  appendCommonFields(fd, values);
  if (imageFiles?.length) {
    for (let i = 0; i < imageHeadersToList(imageFiles).length; i++) {
        const fileList = imageHeadersToList(imageFiles);
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
  if (values.is_active !== undefined) {
    fd.append("is_active", values.is_active ? "true" : "false");
  }
  
  if (values.delete_image_ids?.length) {
    values.delete_image_ids.forEach(id => {
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
