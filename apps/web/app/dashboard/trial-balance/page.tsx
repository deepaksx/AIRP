'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api-client'
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TrialBalancePage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trialBalance', DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID],
    queryFn: () => api.trialBalance(DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID).then(res => res.data.data),
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
          <p className="text-muted-foreground">
            Summary of all account balances
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data ? formatCurrency(data.totalDebits) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data ? formatCurrency(data.totalCredits) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data && (
              <div className="flex items-center space-x-2">
                {data.isBalanced ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">Balanced</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">Unbalanced</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Account Balances</CardTitle>
          <CardDescription>
            Detailed breakdown of all accounts as of today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : data ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row: any) => (
                  <TableRow key={row.accountId}>
                    <TableCell className="font-medium">{row.accountCode}</TableCell>
                    <TableCell>{row.accountName}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {row.accountType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-blue-600">
                      {formatCurrency(row.debit)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      {formatCurrency(row.credit)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(Math.abs(row.balance))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">TOTAL</TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    {formatCurrency(data.totalDebits)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(data.totalCredits)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {data.isBalanced ? (
                      <span className="text-green-600">✓ Balanced</span>
                    ) : (
                      <span className="text-red-600">✗ Unbalanced</span>
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
