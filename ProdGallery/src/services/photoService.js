import { photosAPI } from "./api";

/** Fetch one Laravel-paginated photo page while preserving pagination metadata. */
export async function fetchPhotoPage(params = {}) {
  const response = await photosAPI.getPage(params);
  if (Array.isArray(response)) {
    return { data: response, current_page: 1, last_page: 1, per_page: response.length, total: response.length, links: [] };
  }
  return {
    data: Array.isArray(response?.data) ? response.data : [],
    current_page: Number(response?.current_page || params.page || 1),
    last_page: Number(response?.last_page || 1),
    per_page: Number(response?.per_page || params.per_page || 12),
    total: Number(response?.total || 0),
    links: response?.links || [],
  };
}
