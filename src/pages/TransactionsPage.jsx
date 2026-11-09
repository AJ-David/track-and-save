import { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import TransactionModal from '../components/transactions/TransactionModal';
import DeleteConfirmModal from '../components/transactions/DeleteConfirmModal';
import { useTransactions } from '../hooks/useTransactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, CURRENCIES } from '../lib/constants';
import { formatCurrency, formatDate } from '../lib/formatters';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

const ITEMS_PER_PAGE = 8;

export default function TransactionsPage() {
  const { currency } = useApp();
  const toast = useToast();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  // Raw data from hook
  const {
    transactions: rawTransactions,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactions();

  // Categories list based on active type filter
  const allCategories = useMemo(() => {
    if (typeFilter === 'income') return INCOME_CATEGORIES;
    if (typeFilter === 'expense') return EXPENSE_CATEGORIES;
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  }, [typeFilter]);

  // Live Reactive Filter & Search
  const filteredTransactions = useMemo(() => {
    return rawTransactions
      .filter((txn) => {
        // Type filter
        if (typeFilter !== 'all' && txn.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && txn.category !== categoryFilter) return false;

        // Payment method filter
        if (paymentMethodFilter !== 'all' && txn.payment_method !== paymentMethodFilter) return false;

        // Search filter (searches description, category, payment method, amount)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const desc = (txn.description || '').toLowerCase();
          const cat = (txn.category || '').toLowerCase();
          const method = (txn.payment_method || '').toLowerCase();
          const amountStr = String(txn.amount || '');

          if (
            !desc.includes(q) &&
            !cat.includes(q) &&
            !method.includes(q) &&
            !amountStr.includes(q)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
        if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
        return new Date(b.date) - new Date(a.date); // default 'date-desc'
      });
  }, [rawTransactions, searchTerm, typeFilter, categoryFilter, paymentMethodFilter, sortBy]);

  // Dynamic summary for current filtered view
  const currentSummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'income') income += Number(t.amount || 0);
      if (t.type === 'expense') expenses += Number(t.amount || 0);
    }
    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [filteredTransactions]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (txn) => {
    setEditingTransaction(txn);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data) => {
    try {
      if (editingTransaction) {
        await editTransaction(editingTransaction.id, data);
        toast.success('Transaction updated successfully');
      } else {
        await addTransaction(data);
        toast.success('Transaction added successfully');
        setCurrentPage(1);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction');
      throw err;
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await removeTransaction(id);
      toast.success('Transaction deleted successfully');
      setDeletingTransaction(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction');
      throw err;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentMethodFilter('all');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      typeFilter !== 'all' ||
      categoryFilter !== 'all' ||
      paymentMethodFilter !== 'all' ||
      sortBy !== 'date-desc'
  );

  const getCategoryLabel = (type, id) => {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return list.find((c) => c.id === id)?.label || id;
  };

  const getPaymentMethodLabel = (id) => {
    return PAYMENT_METHODS.find((p) => p.id === id)?.label || id;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Transactions</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Browse, search, and manage your income and expenses in real-time.
          </p>
        </div>
        <Button icon={Plus} onClick={handleOpenAddModal}>
          Add Transaction
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Income ({hasActiveFilters ? 'Filtered' : 'Total'})
          </p>
          <p
            className="text-2xl font-black text-emerald-400 mt-1 tracking-tight cursor-help"
            title={CURRENCIES[currency]?.name ? `${CURRENCIES[currency].name} (${currency})` : undefined}
          >
            +{formatCurrency(currentSummary.income, currency)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Expenses ({hasActiveFilters ? 'Filtered' : 'Total'})
          </p>
          <p
            className="text-2xl font-black text-red-400 mt-1 tracking-tight cursor-help"
            title={CURRENCIES[currency]?.name ? `${CURRENCIES[currency].name} (${currency})` : undefined}
          >
            -{formatCurrency(currentSummary.expenses, currency)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Net Cash Flow
          </p>
          <p
            className={cn(
              'text-2xl font-black mt-1 tracking-tight cursor-help',
              currentSummary.balance >= 0 ? 'text-white' : 'text-red-400'
            )}
            title={CURRENCIES[currency]?.name ? `${CURRENCIES[currency].name} (${currency})` : undefined}
          >
            {formatCurrency(currentSummary.balance, currency)}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card padding={false} className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Live Search */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description or amount..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] transition-all text-zinc-100 placeholder-zinc-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCategoryFilter('all');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] text-zinc-200 transition-all font-semibold cursor-pointer"
            >
              <option value="all" className="bg-[#12131a] text-zinc-200">All Types</option>
              <option value="income" className="bg-[#12131a] text-zinc-200">Income (+)</option>
              <option value="expense" className="bg-[#12131a] text-zinc-200">Expense (-)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] text-zinc-200 transition-all cursor-pointer"
            >
              <option value="all" className="bg-[#12131a] text-zinc-200">All Categories</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#12131a] text-zinc-200">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] text-zinc-200 transition-all cursor-pointer"
            >
              <option value="all" className="bg-[#12131a] text-zinc-200">All Methods</option>
              {PAYMENT_METHODS.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#12131a] text-zinc-200">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] text-zinc-200 transition-all font-semibold cursor-pointer"
            >
              <option value="date-desc" className="bg-[#12131a] text-zinc-200">Newest First</option>
              <option value="date-asc" className="bg-[#12131a] text-zinc-200">Oldest First</option>
              <option value="amount-desc" className="bg-[#12131a] text-zinc-200">Highest Amount</option>
              <option value="amount-asc" className="bg-[#12131a] text-zinc-200">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Filter Indicator Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 overflow-x-auto text-xs text-zinc-400">
          <Filter className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
          <span className="font-medium flex-shrink-0">Showing:</span>
          <span className="bg-red-950/60 text-red-400 border border-red-800/40 px-2.5 py-0.5 rounded-full font-bold">
            {filteredTransactions.length} of {rawTransactions.length} record{rawTransactions.length === 1 ? '' : 's'}
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-semibold ml-auto hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Transaction Table / List */}
      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Spinner size="md" />
            <p className="text-xs text-gray-400 mt-2">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            {error}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={hasActiveFilters ? 'No matching transactions' : 'No transactions recorded'}
            description={
              hasActiveFilters
                ? 'Try broadening your search term or clearing one of your filters.'
                : 'Get started by recording your first income or expense.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              ) : (
                <Button icon={Plus} onClick={handleOpenAddModal}>
                  Add Transaction
                </Button>
              )
            }
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900 text-xs font-bold uppercase text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Date</th>
                    <th
                      className="px-6 py-4 text-right cursor-help"
                      title={CURRENCIES[currency]?.name ? `${CURRENCIES[currency].name} (${currency})` : undefined}
                    >
                      Amount ({currency})
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {paginatedTransactions.map((txn) => {
                    const isIncome = txn.type === 'income';
                    return (
                      <tr
                        key={txn.id}
                        className="hover:bg-zinc-800/40 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                                isIncome ? 'bg-emerald-950/60 border border-emerald-800/40' : 'bg-red-950/60 border border-red-800/40'
                              )}
                            >
                              {isIncome ? (
                                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-white truncate">
                                {txn.description}
                              </p>
                              <span className="text-xs text-zinc-500 capitalize">
                                {txn.type}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge color={isIncome ? 'green' : 'red'}>
                            {getCategoryLabel(txn.type, txn.category)}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{getPaymentMethodLabel(txn.payment_method)}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{formatDate(txn.date, 'medium')}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span
                            className={cn(
                              'font-bold text-sm cursor-help',
                              isIncome ? 'text-emerald-400' : 'text-zinc-100'
                            )}
                            title={CURRENCIES[currency]?.name ? `${CURRENCIES[currency].name} (${currency})` : undefined}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(txn.amount, currency)}
                          </span>
                        </td>

                        {/* Row Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(txn)}
                              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Edit transaction"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTransaction(txn)}
                              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
                <span>
                  Showing page <strong className="text-zinc-200">{currentPage}</strong> of{' '}
                  <strong className="text-zinc-200">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modals */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTransaction}
        transaction={editingTransaction}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteTransaction}
        transaction={deletingTransaction}
      />
    </div>
  );
}
