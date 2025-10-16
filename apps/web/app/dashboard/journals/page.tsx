'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEFAULT_ENTITY_ID, DEFAULT_BOOK_ID, ACCOUNTS } from '@/lib/constants'
import api from '@/lib/api-client'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

type JournalLine = {
  lineNumber: number
  accountId: string
  debit: number
  credit: number
  description?: string
}

export default function JournalsPage() {
  const queryClient = useQueryClient()
  const [lines, setLines] = useState<JournalLine[]>([
    { lineNumber: 1, accountId: '', debit: 0, credit: 0 },
    { lineNumber: 2, accountId: '', debit: 0, credit: 0 },
  ])

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      description: '',
      journalDate: new Date().toISOString().split('T')[0],
    }
  })

  const createJournalMutation = useMutation({
    mutationFn: (data: any) => api.createJournal(data),
    onSuccess: async (response) => {
      const journalId = response.data.data.journalId
      toast.success('Journal created successfully')

      // Auto-post the journal
      try {
        await api.postJournal(journalId)
        toast.success('Journal posted successfully')
        queryClient.invalidateQueries({ queryKey: ['trialBalance'] })
        queryClient.invalidateQueries({ queryKey: ['incomeStatement'] })
        reset()
        setLines([
          { lineNumber: 1, accountId: '', debit: 0, credit: 0 },
          { lineNumber: 2, accountId: '', debit: 0, credit: 0 },
        ])
      } catch (error: any) {
        toast.error(error.response?.data?.errors?.[0]?.message || 'Failed to post journal')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0]?.message || 'Failed to create journal')
    },
  })

  const onSubmit = (data: any) => {
    const validLines = lines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0))

    if (validLines.length < 2) {
      toast.error('Please add at least 2 valid journal lines')
      return
    }

    const totalDebit = validLines.reduce((sum, l) => sum + Number(l.debit), 0)
    const totalCredit = validLines.reduce((sum, l) => sum + Number(l.credit), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error(`Journal is not balanced. DR: $${totalDebit.toFixed(2)}, CR: $${totalCredit.toFixed(2)}`)
      return
    }

    createJournalMutation.mutate({
      entityId: DEFAULT_ENTITY_ID,
      bookIds: [DEFAULT_BOOK_ID],
      journalDate: data.journalDate,
      description: data.description,
      lines: validLines,
    })
  }

  const addLine = () => {
    setLines([...lines, {
      lineNumber: lines.length + 1,
      accountId: '',
      debit: 0,
      credit: 0,
    }])
  }

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index).map((l, i) => ({ ...l, lineNumber: i + 1 })))
    }
  }

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
  }

  const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journal Entry</h1>
        <p className="text-muted-foreground">
          Create and post journal entries
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Journal Entry</CardTitle>
          <CardDescription>Create a balanced journal entry to post to the ledger</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="e.g., Monthly rent payment"
                  {...register('description', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="journalDate">Date *</Label>
                <Input
                  id="journalDate"
                  type="date"
                  {...register('journalDate', { required: true })}
                />
              </div>
            </div>

            {/* Journal Lines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Journal Lines</Label>
                <Button type="button" size="sm" onClick={addLine} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>

              {lines.map((line, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Line {line.lineNumber}</span>
                    {lines.length > 2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Account *</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={line.accountId}
                        onChange={(e) => updateLine(index, 'accountId', e.target.value)}
                      >
                        <option value="">Select account...</option>
                        {ACCOUNTS.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Debit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit}
                        onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Credit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit}
                        onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Balance Summary */}
              <div className="p-4 border rounded-lg bg-gray-100">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Debit</p>
                    <p className="text-lg font-bold text-blue-600">${totalDebit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Credit</p>
                    <p className="text-lg font-bold text-red-600">${totalCredit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-orange-600'}`}>
                      {isBalanced ? '✓ Balanced' : '⚠ Unbalanced'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createJournalMutation.isPending || !isBalanced}
            >
              {createJournalMutation.isPending ? 'Creating...' : 'Create & Post Journal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
