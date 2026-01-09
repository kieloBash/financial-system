'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Financial System</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'User'}
              </span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome to your expense tracking dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
            <p className="text-2xl font-bold">$0.00</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
            <p className="text-2xl font-bold">$0.00</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
            <p className="text-2xl font-bold">0</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Prices</h3>
            <p className="text-2xl font-bold">0</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <Link href="/expenses/add">
              <Button>Add Expense</Button>
            </Link>
            <Link href="/expenses">
              <Button variant="outline">View Expenses</Button>
            </Link>
            <Button variant="outline">Manage Categories</Button>
            <Button variant="outline">Quick Prices</Button>
            <Button variant="outline">View Analytics</Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
