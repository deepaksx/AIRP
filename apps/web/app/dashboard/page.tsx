'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api-client'
import { TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health().then(res => res.data),
  })

  const { data: trialBalanceData } = useQuery({
    queryKey: ['trialBalance', DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID],
    queryFn: () => api.trialBalance(DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID).then(res => res.data.data),
  })

  const { data: incomeStatementData } = useQuery({
    queryKey: ['incomeStatement', DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID],
    queryFn: () => api.incomeStatement(DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID).then(res => res.data.data),
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your accounting system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Debits
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trialBalanceData ? formatCurrency(trialBalanceData.totalDebits) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              All debit transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Credits
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trialBalanceData ? formatCurrency(trialBalanceData.totalCredits) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              All credit transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Income
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${incomeStatementData && incomeStatementData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {incomeStatementData ? formatCurrency(incomeStatementData.netIncome) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Journals
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.database?.journals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Posted transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Ledger Balance Status</CardTitle>
          <CardDescription>Current state of your accounting ledger</CardDescription>
        </CardHeader>
        <CardContent>
          {trialBalanceData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Balance Status</span>
                {trialBalanceData.isBalanced ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Balanced
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Unbalanced
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Accounts</p>
                  <p className="text-2xl font-bold">{trialBalanceData.rows.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difference</p>
                  <p className="text-2xl font-bold">{formatCurrency(trialBalanceData.difference)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>API and database connection</CardDescription>
        </CardHeader>
        <CardContent>
          {healthData ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <span className="text-sm font-medium text-green-600">✓ {healthData.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="text-sm font-medium text-green-600">
                  {healthData.database.connected ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Workspaces</span>
                <span className="text-sm font-medium">{healthData.database.workspaces}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
