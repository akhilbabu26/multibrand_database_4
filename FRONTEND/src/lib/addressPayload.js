/**
 * PATCH /addresses/:id expects JSON fields matching Go dto.UpdateAddressRequest (pointers).
 * Omitting a key leaves the field unchanged; `undefined` keys are stripped by JSON.stringify.
 */
export function buildAddressUpdateBody(values) {
  return {
    full_name: values.full_name,
    phone: values.phone,
    street: values.street,
    landmark: values.landmark ?? "",
    city: values.city,
    state: values.state,
    pin_code: values.pin_code,
    is_default: Boolean(values.is_default),
  };
}
