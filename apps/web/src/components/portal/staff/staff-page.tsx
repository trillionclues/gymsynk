'use client';

import { useEffect, useState } from 'react';
import { loadStaffList, createStaffMember, toggleStaffActive, type StaffItem, type CreateStaffPayload } from '@/services/staff-service';
import { useAuthStore } from '@/stores/authStore';
import { MONO } from '@/lib/constants';
import { UserCheck, Plus, X, Power, AlertCircle, UserPlus, Mail, Phone, Lock } from 'lucide-react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SheetSelect } from '@/components/ui/sheet-select';

export function StaffPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER' | 'FLOOR_STAFF'>('CASHIER');
  const [password, setPassword] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadStaffList();
      setStaff(data);
    } catch {
      setError('Failed to load staff list. Make sure you are logged in as an Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStaff();
  }, []);

  const openInviteModal = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setRole('CASHIER');
    setPassword('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setModalError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    const payload: CreateStaffPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      role,
      password,
    };

    try {
      await createStaffMember(payload);
      setIsModalOpen(false);
      void fetchStaff();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleStaffActive(id);
      void fetchStaff();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[color:var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[color:var(--color-text-strong)]">
              Staff Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
            Manage system administrators, cashiers, and team access credentials.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openInviteModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
            style={MONO}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-[color:var(--color-surface-2)]" />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="mx-auto h-10 w-10 text-[color:var(--color-text-muted)]" />
            <h3 className="mt-3 text-sm font-bold text-[color:var(--color-text-strong)]">No staff members found</h3>
            <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]">Click 'Add Staff Member' to invite cashiers to your organization.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] font-semibold text-[color:var(--color-text-subtle)] uppercase tracking-wider" style={MONO}>
                <tr>
                  <th className="px-6 py-3.5">Staff Name</th>
                  <th className="px-6 py-3.5">Email & Phone</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-[color:var(--color-surface-2)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[color:var(--color-text-strong)] text-sm">
                        {s.firstName} {s.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-[11px]" style={MONO}>
                        <div className="text-[color:var(--color-text-strong)]">{s.email || '—'}</div>
                        <div className="text-[color:var(--color-text-subtle)]">{s.phone || '—'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          s.role === 'ADMIN'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        }`}
                        style={MONO}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          s.isActive
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-neutral-500/10 text-neutral-400'
                        }`}
                        style={MONO}
                      >
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(s.id)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold transition ${
                            s.isActive ? 'text-red-400 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'
                          }`}
                          style={MONO}
                        >
                          <Power className="h-3.5 w-3.5" /> {s.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-[color:var(--color-text-subtle)] uppercase tracking-wider" style={MONO}>
                          Read Only
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BottomSheet
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Staff Member"
        titleIcon={<UserPlus className="h-5 w-5 text-emerald-500" />}
        maxWidth="md"
      >
        {modalError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs outline-none focus:border-[color:var(--color-border-strong)] transition"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Morgan"
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs outline-none focus:border-[color:var(--color-border-strong)] transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cashier@yourgym.com"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs outline-none focus:border-[color:var(--color-border-strong)] transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs outline-none focus:border-[color:var(--color-border-strong)] transition"
              />
            </div>
            <SheetSelect
              label="System Role"
              value={role}
              onChange={(v) => setRole(v as typeof role)}
              options={[
                { value: 'CASHIER',    label: 'Cashier',       description: 'Desk & payment processing', icon: '💳' },
                { value: 'ADMIN',      label: 'Administrator', description: 'Full system access',        icon: '🛡️' },
                { value: 'FLOOR_STAFF', label: 'Floor Staff',  description: 'Check-in & floor access',   icon: '🏋️' },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
              Initial Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs outline-none focus:border-[color:var(--color-border-strong)] transition"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[color:var(--color-border)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-[color:var(--color-border)] px-4 py-2.5 text-xs font-semibold hover:bg-[color:var(--color-surface-2)] transition"
              style={MONO}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              style={MONO}
            >
              {submitting ? 'Creating…' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
