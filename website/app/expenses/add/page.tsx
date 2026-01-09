'use client';

import CategoriesSelect from '@/components/global/categories-select';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreateExpense } from '@/lib/hooks/use-expenses';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function AddExpenseContent() {
  const router = useRouter();
  const createExpense = useCreateExpense();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState({
    categoryId: '',
    categoryName: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [error, setError] = useState<string | null>(null);

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
      await createExpense.mutateAsync({
        categoryId: formData.categoryId,
        amount: formData.amount,
        description: formData.description || undefined,
        date: formData.date || undefined,
      });
      router.push('/expenses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
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
              <Link href="/expenses">
                <Button variant="outline">View Expenses</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Add Expense</h2>
          <p className="text-gray-600">Record a new expense</p>
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
              {!categoriesLoading && (!categories || categories.length === 0) && (
                <p className="text-sm text-gray-500">
                  <Link href="/categories" className="text-blue-600 hover:underline">
                    Create a category
                  </Link>{' '}
                  first to add expenses
                </p>
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
                disabled={createExpense.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={createExpense.isPending}
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
                disabled={createExpense.isPending}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createExpense.isPending || !formData.categoryId || !formData.amount}
                className="flex-1"
              >
                {createExpense.isPending ? 'Adding...' : 'Add Expense'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/expenses')}
                disabled={createExpense.isPending}
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

export default function AddExpensePage() {
  return (
    <ProtectedRoute>
      <AddExpenseContent />
    </ProtectedRoute>
  );
}
