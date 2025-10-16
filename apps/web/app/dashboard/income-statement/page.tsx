'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api-client'
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function IncomeStatementPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incomeStatement', DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID],
    queryFn: () => api.incomeStatement(DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID).then(res => res.data.data),
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income Statement</h1>
          <p className="text-muted-foreground">
            Profit & Loss statement
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data ? formatCurrency(data.totalRevenue) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">COGS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data ? formatCurrency(data.totalCOGS) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data ? formatCurrency(data.totalExpenses) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data && data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data ? formatCurrency(data.netIncome) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed P&L */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>
            Revenue, expenses, and profitability analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Revenue Section */}
              <div>
                <div className="flex items-center justify-between py-2 border-b-2 border-green-200 bg-green-50 px-4">
                  <span className="font-semibold text-green-900">REVENUE</span>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                {data.revenue.length > 0 ? (
                  <Table>
                    <TableBody>
                      {data.revenue.map((row: any) => (
                        <TableRow key={row.accountId}>
                          <TableCell className="font-medium">{row.accountCode}</TableCell>
                          <TableCell>{row.accountName}</TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            {formatCurrency(Math.abs(row.balance))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="font-bold">Total Revenue</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(data.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground p-4">No revenue accounts</p>
                )}
              </div>

              {/* Expenses Section */}
              <div>
                <div className="flex items-center justify-between py-2 border-b-2 border-red-200 bg-red-50 px-4">
                  <span className="font-semibold text-red-900">EXPENSES</span>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                {data.expenses.length > 0 ? (
                  <Table>
                    <TableBody>
                      {data.expenses.map((row: any) => (
                        <TableRow key={row.accountId}>
                          <TableCell className="font-medium">{row.accountCode}</TableCell>
                          <TableCell>{row.accountName}</TableCell>
                          <TableCell className="text-right font-mono text-red-600">
                            {formatCurrency(Math.abs(row.balance))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="font-bold">Total Expenses</TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {formatCurrency(data.totalExpenses)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground p-4">No expense accounts</p>
                )}
              </div>

              {/* Net Income */}
              <div className="p-6 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Income (Loss)</p>
                    <p className={`text-3xl font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(data.netIncome)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`text-lg font-semibold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.netIncome >= 0 ? 'Profit' : 'Loss'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
