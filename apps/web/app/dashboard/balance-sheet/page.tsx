'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api-client'
import { RefreshCw, Building2, CreditCard, PiggyBank } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BalanceSheetPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['balanceSheet', DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID],
    queryFn: () => api.balanceSheet(DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID).then(res => res.data.data),
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
          <p className="text-muted-foreground">
            Statement of financial position
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data ? formatCurrency(data.totalAssets) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data ? formatCurrency(data.totalLiabilities) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data ? formatCurrency(data.totalEquity) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Balance Sheet */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Assets
            </CardTitle>
            <CardDescription>What the company owns</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : data && data.assets.length > 0 ? (
              <Table>
                <TableBody>
                  {data.assets.map((row: any) => (
                    <TableRow key={row.accountId}>
                      <TableCell className="font-medium">{row.accountCode}</TableCell>
                      <TableCell>{row.accountName}</TableCell>
                      <TableCell className="text-right font-mono text-blue-600">
                        {formatCurrency(Math.abs(row.balance))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total Assets</TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      {formatCurrency(data.totalAssets)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No asset accounts</p>
            )}
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <div className="space-y-6">
          {/* Liabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                Liabilities
              </CardTitle>
              <CardDescription>What the company owes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : data && data.liabilities.length > 0 ? (
                <Table>
                  <TableBody>
                    {data.liabilities.map((row: any) => (
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
                      <TableCell colSpan={2} className="font-bold">Total Liabilities</TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {formatCurrency(data.totalLiabilities)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No liability accounts</p>
              )}
            </CardContent>
          </Card>

          {/* Equity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PiggyBank className="w-5 h-5 mr-2 text-green-600" />
                Equity
              </CardTitle>
              <CardDescription>Owner's equity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : data && data.equity.length > 0 ? (
                <Table>
                  <TableBody>
                    {data.equity.map((row: any) => (
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
                      <TableCell colSpan={2} className="font-bold">Total Equity</TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(data.totalEquity)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No equity accounts</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Balance Check */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Equation</CardTitle>
          <CardDescription>Assets = Liabilities + Equity</CardDescription>
        </CardHeader>
        <CardContent>
          {data && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Assets</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.totalAssets)}</p>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">=</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Liabilities + Equity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(data.totalLiabilitiesAndEquity)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
