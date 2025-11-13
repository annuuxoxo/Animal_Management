const API_BASE_URL = 'http://localhost:5000/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Animals API
export const animalsAPI = {
  getAll: () => fetchAPI<any[]>('/animals'),
  getById: (id: string) => fetchAPI<any>(`/animals/${id}`),
  create: (data: any) => fetchAPI<any>('/animals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI<any>(`/animals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<{ message: string }>(`/animals/${id}`, { method: 'DELETE' }),
};

// Health Records API
export const healthRecordsAPI = {
  getAll: () => fetchAPI<any[]>('/health-records'),
  getById: (id: string) => fetchAPI<any>(`/health-records/${id}`),
  create: (data: any) => fetchAPI<any>('/health-records', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI<any>(`/health-records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<{ message: string }>(`/health-records/${id}`, { method: 'DELETE' }),
};

// Feeding Tasks API
export const feedingTasksAPI = {
  getAll: () => fetchAPI<any[]>('/feeding-tasks'),
  getById: (id: string) => fetchAPI<any>(`/feeding-tasks/${id}`),
  create: (data: any) => fetchAPI<any>('/feeding-tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI<any>(`/feeding-tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<{ message: string }>(`/feeding-tasks/${id}`, { method: 'DELETE' }),
};

// Breeding Records API
export const breedingRecordsAPI = {
  getAll: () => fetchAPI<any[]>('/breeding-records'),
  getById: (id: string) => fetchAPI<any>(`/breeding-records/${id}`),
  create: (data: any) => fetchAPI<any>('/breeding-records', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI<any>(`/breeding-records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<{ message: string }>(`/breeding-records/${id}`, { method: 'DELETE' }),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => fetchAPI<any[]>('/inventory'),
  getById: (id: string) => fetchAPI<any>(`/inventory/${id}`),
  create: (data: any) => fetchAPI<any>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI<any>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<{ message: string }>(`/inventory/${id}`, { method: 'DELETE' }),
};

// Staff API
export const staffAPI = {
  getAll: () => fetchAPI<any[]>('/staff'),
  getById: (id: string) => fetchAPI<any>(`/staff/${id}`),
  create: (data: any) => fetchAPI<any>('/staff', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI<any>(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<{ message: string }>(`/staff/${id}`, { method: 'DELETE' }),
};

// Settings API
export const settingsAPI = {
  get: () => fetchAPI<any>('/settings'),
  update: (data: any) => fetchAPI<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

