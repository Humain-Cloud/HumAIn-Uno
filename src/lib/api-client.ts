const BASE_URL = '/api'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || `API Error: ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Knowledge base
  knowledge: {
    search: (params: { q?: string; framework?: string; industry?: string; category?: string; page?: number; pageSize?: number }) => {
      const sp = new URLSearchParams()
      if (params.q) sp.set('q', params.q)
      if (params.framework) sp.set('framework', params.framework)
      if (params.industry) sp.set('industry', params.industry)
      if (params.category) sp.set('category', params.category)
      if (params.page) sp.set('page', String(params.page))
      if (params.pageSize) sp.set('pageSize', String(params.pageSize))
      return fetchAPI(`/knowledge/search?${sp.toString()}`)
    },
    get: (id: string) => fetchAPI(`/knowledge/${id}`),
    list: (params?: { page?: number; pageSize?: number; framework?: string; industry?: string; category?: string }) => {
      const sp = new URLSearchParams()
      if (params?.page) sp.set('page', String(params.page))
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize))
      if (params?.framework) sp.set('framework', params.framework)
      if (params?.industry) sp.set('industry', params.industry)
      if (params?.category) sp.set('category', params.category)
      return fetchAPI(`/knowledge?${sp.toString()}`)
    },
  },

  // Agents (user-created)
  agents: {
    list: (params?: { page?: number; pageSize?: number; privacy?: string; creatorId?: string; sort?: string }) => {
      const sp = new URLSearchParams()
      if (params?.page) sp.set('page', String(params.page))
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize))
      if (params?.privacy) sp.set('privacy', params.privacy)
      if (params?.creatorId) sp.set('creatorId', params.creatorId)
      if (params?.sort) sp.set('sort', params.sort)
      return fetchAPI(`/agents?${sp.toString()}`)
    },
    get: (id: string) => fetchAPI(`/agents/${id}`),
    create: (data: any) => fetchAPI('/agents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/agents/${id}`, { method: 'DELETE' }),
    fork: (id: string) => fetchAPI(`/agents/${id}/fork`, { method: 'POST' }),
    star: (id: string) => fetchAPI(`/agents/${id}/star`, { method: 'POST' }),
    unstar: (id: string) => fetchAPI(`/agents/${id}/star`, { method: 'DELETE' }),
    comment: (id: string, content: string) => fetchAPI(`/agents/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    getComments: (id: string) => fetchAPI(`/agents/${id}/comments`),
  },

  // Categories
  categories: {
    list: () => fetchAPI('/categories'),
  },

  // Stats
  stats: {
    get: () => fetchAPI('/stats'),
  },

  // AI
  ai: {
    suggest: (description: string) => fetchAPI('/ai/suggest', { method: 'POST', body: JSON.stringify({ description }) }),
    generateSpec: (data: any) => fetchAPI('/ai/generate-spec', { method: 'POST', body: JSON.stringify(data) }),
    generateCode: (data: any) => fetchAPI('/ai/generate-code', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Auth
  auth: {
    session: () => fetchAPI('/auth/session'),
  },
}
