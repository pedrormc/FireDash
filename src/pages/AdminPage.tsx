import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, X, Loader2, CheckCircle, XCircle, Pencil, Save, Ban } from 'lucide-react';
import { fetchUsers, createUser, updateUser, deactivateUser } from '../services/users';
import type { ApiUser } from '../services/users';
import { useAuth } from '../contexts/AuthContext';

const ROLES = ['admin', 'operador', 'visualizador'] as const;

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-fire-red/20 text-fire-red',
    operador: 'bg-fire-orange/20 text-fire-orange',
    visualizador: 'bg-blue-400/20 text-blue-400',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${styles[role] || 'bg-slate-400/20 text-slate-400'}`}>
      {role}
    </span>
  );
}

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ nome: '', email: '', senha: '', cargo: '', role: 'operador' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '', cargo: '', role: '', senha: '' });
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const newUser = await createUser({
        nome: createForm.nome,
        email: createForm.email,
        senha: createForm.senha,
        cargo: createForm.cargo || undefined,
        role: createForm.role,
      });
      setUsers((prev) => [newUser, ...prev]);
      setCreateForm({ nome: '', email: '', senha: '', cargo: '', role: 'operador' });
      setShowCreate(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (u: ApiUser) => {
    setEditingId(u.id);
    setEditForm({ nome: u.nome, email: u.email, cargo: u.cargo || '', role: u.role, senha: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: number) => {
    setSaving(true);
    try {
      const updated = await updateUser(id, {
        nome: editForm.nome,
        email: editForm.email,
        cargo: editForm.cargo || undefined,
        role: editForm.role,
        senha: editForm.senha || undefined,
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtivo = async (u: ApiUser) => {
    if (u.id === currentUser?.id) return;
    try {
      if (u.ativo) {
        await deactivateUser(u.id);
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ativo: false } : x)));
      } else {
        const updated = await updateUser(u.id, { ativo: true });
        setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fire-red" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Gerenciamento de Usuários</h2>
          <p className="text-xs text-fire-muted uppercase tracking-widest mt-1">
            {users.length} usuário(s) cadastrado(s)
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center space-x-2 bg-fire-red hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-fire-red/20"
        >
          {showCreate ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          <span className="text-sm">{showCreate ? 'Cancelar' : 'Novo Usuário'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-fire-red/10 border border-fire-red/30 rounded-xl px-4 py-3 text-fire-red text-xs font-medium flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-fire-red hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-fire-card border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-fire-red/20 p-2 rounded-lg">
              <UserPlus className="w-5 h-5 text-fire-red" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Criar Usuário</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">Nome *</label>
              <input
                required
                value={createForm.nome}
                onChange={(e) => setCreateForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">Email *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">Senha *</label>
              <input
                type="password"
                required
                value={createForm.senha}
                onChange={(e) => setCreateForm((f) => ({ ...f, senha: e.target.value }))}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">Cargo</label>
              <input
                value={createForm.cargo}
                onChange={(e) => setCreateForm((f) => ({ ...f, cargo: e.target.value }))}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">Role</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {createError && (
            <div className="bg-fire-red/10 border border-fire-red/30 rounded-xl px-4 py-3 text-fire-red text-xs font-medium">
              {createError}
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="flex items-center space-x-2 bg-fire-red hover:bg-red-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Criar Usuário</span>
          </button>
        </form>
      )}

      {/* Users table */}
      <div className="bg-fire-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center space-x-2">
          <Users className="w-4 h-4 text-fire-muted" />
          <h5 className="text-xs font-bold uppercase tracking-widest text-fire-muted">Todos os Usuários</h5>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/5 text-[10px] text-fire-muted font-black uppercase tracking-widest">
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Nome</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Cargo</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => {
                const isEditing = editingId === u.id;
                const isSelf = u.id === currentUser?.id;

                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-white">{u.id}</td>

                    {isEditing ? (
                      <>
                        <td className="px-5 py-3">
                          <input
                            value={editForm.nome}
                            onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
                            className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-fire-red"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            value={editForm.email}
                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-fire-red"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            value={editForm.cargo}
                            onChange={(e) => setEditForm((f) => ({ ...f, cargo: e.target.value }))}
                            className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-fire-red"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                            className="px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-fire-red"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 text-sm text-zinc-300">{u.nome}</td>
                        <td className="px-5 py-3 text-sm text-zinc-300">{u.email}</td>
                        <td className="px-5 py-3 text-sm text-fire-muted">{u.cargo || '—'}</td>
                        <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                      </>
                    )}

                    <td className="px-5 py-3">
                      {u.ativo ? (
                        <span className="flex items-center space-x-1 text-fire-green">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase">Ativo</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-fire-muted">
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase">Inativo</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(u.id)}
                              disabled={saving}
                              className="p-1.5 text-fire-green hover:bg-fire-green/10 rounded-lg transition-colors"
                              title="Salvar"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-fire-muted hover:bg-white/10 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              className="p-1.5 text-fire-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => handleToggleAtivo(u)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  u.ativo
                                    ? 'text-fire-muted hover:text-fire-red hover:bg-fire-red/10'
                                    : 'text-fire-muted hover:text-fire-green hover:bg-fire-green/10'
                                }`}
                                title={u.ativo ? 'Desativar' : 'Reativar'}
                              >
                                {u.ativo ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
