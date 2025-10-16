import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API functions
export const api = {
  // Health
  health: () => apiClient.get('/health'),

  // Journals
  createJournal: (data: any) => apiClient.post('/api/ledger/journals', data),
  postJournal: (id: string) => apiClient.post(`/api/ledger/journals/${id}/post`),
  getJournal: (id: string) => apiClient.get(`/api/ledger/journals/${id}`),
  listJournals: (params?: any) => apiClient.get('/api/ledger/journals', { params }),

  // Reports
  trialBalance: (entityId: string, bookId: string, params?: any) =>
    apiClient.get('/api/reports/trial-balance', { params: { entityId, bookId, ...params } }),
  incomeStatement: (entityId: string, bookId: string, params?: any) =>
    apiClient.get('/api/reports/income-statement', { params: { entityId, bookId, ...params } }),
  balanceSheet: (entityId: string, bookId: string, params?: any) =>
    apiClient.get('/api/reports/balance-sheet', { params: { entityId, bookId, ...params } }),
}

export default api
