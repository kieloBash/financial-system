'use client';

import CategoriesSelect from '@/components/global/categories-select';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/lib/hooks/use-categories';
import { useDeleteExpense, useExpenses } from '@/lib/hooks/use-expenses';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function ExpensesContent() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    categoryId: '',
    categoryName: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });

  const { data: expensesData, isLoading, error } = useExpenses({
    categoryId: filters.categoryId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page: filters.page,
    limit: filters.limit,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const { data: categories } = useCategories();
  const deleteExpense = useDeleteExpense();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete expense');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Financial System</h1>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/expenses/add">
                <Button>Add Expense</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Expenses</h2>
          <p className="text-gray-600">View and manage your expenses</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <CategoriesSelect
                value={filters.categoryId ? { id: filters.categoryId, name: filters.categoryName } : null}
                onValueChange={(value) => {
                  setFilters({ ...filters, categoryId: value?.id || '', categoryName: value?.name || '', page: 1 })
                }}
                items={categories || []}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value, page: 1 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value, page: 1 })
                }
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    categoryId: '',
                    categoryName: '',
                    startDate: '',
                    endDate: '',
                    page: 1,
                    limit: 20,
                  })
                }
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Expenses List */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expenses...</p>
          </div>
        )}

        {error && (
          <Card className="p-6">
            <div className="text-red-600">
              Error loading expenses. Please try again.
            </div>
          </Card>
        )}

        {expensesData && (
          <>
            <div className="space-y-4 mb-6">
              {expensesData.data.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-600 mb-4">No expenses found</p>
                  <Link href="/expenses/add">
                    <Button>Add Your First Expense</Button>
                  </Link>
                </Card>
              ) : (
                expensesData.data.map((expense) => (
                  <Card key={expense.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold">
                            {formatCurrency(expense.amount)}
                          </h3>
                          {expense.category && (
                            <span
                              className="px-3 py-1 rounded-full text-sm"
                              style={{
                                backgroundColor: expense.category.color
                                  ? `${expense.category.color}20`
                                  : '#f3f4f6',
                                color: expense.category.color || '#374151',
                              }}
                            >
                              {expense.category.name}
                            </span>
                          )}
                        </div>
                        {expense.description && (
                          <p className="text-gray-600 mb-2">{expense.description}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/expenses/${expense.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                          disabled={deleteExpense.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {expensesData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {expensesData.pagination.page} of{' '}
                  {expensesData.pagination.totalPages} (
                  {expensesData.pagination.total} total)
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  disabled={
                    filters.page >= expensesData.pagination.totalPages
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <ExpensesContent />
    </ProtectedRoute>
  );
}
