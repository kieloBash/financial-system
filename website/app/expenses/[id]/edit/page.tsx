'use client';

import CategoriesSelect from '@/components/global/categories-select';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategories } from '@/lib/hooks/use-categories';
import { useExpense, useUpdateExpense } from '@/lib/hooks/use-expenses';
import { format } from 'date-fns';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function EditExpenseContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: expense, isLoading: expenseLoading } = useExpense(id);
  const updateExpense = useUpdateExpense();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState({
    categoryId: '',
    categoryName: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setFormData({
        categoryId: expense.categoryId,
        categoryName: expense.category?.name || '',
        amount: expense.amount,
        description: expense.description || '',
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.categoryId || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await updateExpense.mutateAsync({
        id,
        data: {
          categoryId: formData.categoryId,
          amount: formData.amount,
          description: formData.description || undefined,
          date: formData.date || undefined,
        },
      });
      router.push('/expenses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    }
  };

  if (expenseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expense...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">Expense not found</p>
          <Link href="/expenses">
            <Button>Back to Expenses</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
              <Link href="/expenses">
                <Button variant="outline">View Expenses</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Edit Expense</h2>
          <p className="text-gray-600">Update expense details</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Category <span className="text-red-500">*</span>
              </Label>
              {categoriesLoading ? (
                <div className="text-sm text-gray-500">Loading categories...</div>
              ) : (
                <CategoriesSelect
                  value={formData.categoryId ? { id: formData.categoryId, name: formData.categoryName } : null}
                  onValueChange={(value) => {
                    setFormData({ ...formData, categoryId: value?.id || '', categoryName: value?.name || '' });
                  }}
                  items={categories || []}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                disabled={updateExpense.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={updateExpense.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description..."
                rows={4}
                disabled={updateExpense.isPending}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateExpense.isPending || !formData.categoryId || !formData.amount}
                className="flex-1"
              >
                {updateExpense.isPending ? 'Updating...' : 'Update Expense'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/expenses')}
                disabled={updateExpense.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default function EditExpensePage() {
  return (
    <ProtectedRoute>
      <EditExpenseContent />
    </ProtectedRoute>
  );
}
