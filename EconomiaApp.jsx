import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  LayoutDashboard, Wallet, TrendingUp, Target, Menu, X, ArrowUpRight,
  ArrowDownRight, Sparkles, PiggyBank, Trash2, Pencil, Search, ArrowUpDown,
  Repeat, Plus, Calendar, Check, DollarSign, Tag, FileText, CalendarDays,
  PieChart as PieChartIcon, LogOut, Loader2, Receipt,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Conexão com o Supabase (login + banco de dados na nuvem)                */
/* ---------------------------------------------------------------------- */

const SUPABASE_URL = "https://aqktifkcmtpjjbtdrtee.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa3RpZmtjbXRwampidGRydGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMjkyNzUsImV4cCI6MjA5ODYwNTI3NX0.cpffdduxnJi1Q8jT8-OtDfdipfGEYCsCGqYl7Mz7qA0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function transacaoToRemote(t) {
  return {
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date,
    recurring: !!t.recurring,
    series_id: t.seriesId || null,
  };
}
function transacaoFromRemote(r) {
  return {
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    category: r.category,
    description: r.description,
    date: r.date,
    recurring: !!r.recurring,
    seriesId: r.series_id || undefined,
  };
}
function metaToRemote(g) {
  return {
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount ?? 0,
    deadline: g.deadline,
    icon: g.icon,
  };
}
function metaFromRemote(r) {
  return {
    id: r.id,
    name: r.name,
    targetAmount: Number(r.target_amount),
    currentAmount: Number(r.current_amount),
    deadline: r.deadline,
    icon: r.icon,
  };
}

/* ---------------------------------------------------------------------- */
/* Tela de login / cadastro                                                */
/* ---------------------------------------------------------------------- */

function TelaLogin() {
  const [modo, setModo] = useState("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [avisoCadastro, setAvisoCadastro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setAvisoCadastro("");
    if (!email.trim() || !senha) return;
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
        if (error) throw error;
        setAvisoCadastro("Conta criada! Verifique seu e-mail para confirmar antes de entrar (se a confirmação estiver ativada no projeto).");
      }
    } catch (err) {
      setErro(err.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, oklch(0.10 0.025 260) 0%, oklch(0.12 0.02 250) 40%, oklch(0.14 0.025 170) 100%)" }}>
      <form onSubmit={enviar} className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(16,185,129,0.02) 100%)", backdropFilter: "blur(20px) saturate(1.2)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-900 font-bold text-lg">E</div>
          <h1 className="text-lg font-bold text-white">Economia App</h1>
          <p className="text-xs text-slate-400">{modo === "entrar" ? "Entre na sua conta" : "Crie sua conta"}</p>
        </div>
        <div className="space-y-2">
          <input type="email" required placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-white/10 bg-white/5 text-white placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm" />
          <input type="password" required minLength={6} placeholder="Senha (mín. 6 caracteres)" value={senha} onChange={e => setSenha(e.target.value)} className="w-full border border-white/10 bg-white/5 text-white placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm" />
        </div>
        {erro && <p className="text-xs text-red-400">{erro}</p>}
        {avisoCadastro && <p className="text-xs text-emerald-400">{avisoCadastro}</p>}
        <button type="submit" disabled={carregando} className="w-full bg-emerald-500 text-slate-900 rounded-lg py-2 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
          {carregando && <Loader2 size={14} className="animate-spin" />}
          {modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>
        <button
          type="button"
          onClick={() => { setModo(modo === "entrar" ? "cadastrar" : "entrar"); setErro(""); setAvisoCadastro(""); }}
          className="w-full text-xs text-slate-400 pt-1"
        >
          {modo === "entrar" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Helpers: categories, dates, currency                                    */
/* ---------------------------------------------------------------------- */

const CATEGORIES = [
  "Salário", "Alimentação", "Transporte", "Moradia", "Saúde", "Educação",
  "Lazer", "Vestuário", "Tecnologia", "Assinaturas", "Outros",
];

const CATEGORY_COLORS = {
  "Salário": "#10B981", "Alimentação": "#F59E0B", "Transporte": "#3B82F6",
  "Moradia": "#8B5CF6", "Saúde": "#F87171", "Educação": "#14B8A6",
  "Lazer": "#EC4899", "Vestuário": "#F472B6", "Tecnologia": "#06B6D4",
  "Assinaturas": "#A78BFA", "Outros": "#94A3B8",
};

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m, day: d };
}
function monthKey(dateStr) {
  const { year, month } = parseISODate(dateStr);
  return year * 12 + month;
}
function monthYearLabel(dateStr) {
  const { year, month } = parseISODate(dateStr);
  return `${MONTH_LABELS[month - 1]}/${String(year).slice(-2)}`;
}
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
function addMonthsISO(dateStr, n) {
  const { year, month, day } = parseISODate(dateStr);
  const total = year * 12 + (month - 1) + n;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  const clampedDay = Math.min(day, daysInMonth(newYear, newMonth));
  return `${newYear}-${String(newMonth).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
}
function currentMonthKey() {
  const now = new Date();
  return now.getFullYear() * 12 + (now.getMonth() + 1);
}
function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

/* ---------------------------------------------------------------------- */
/* Toast (substitui "sonner")                                              */
/* ---------------------------------------------------------------------- */

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((title, description) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, description }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return { toasts, push };
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(320px,calc(100vw-2rem))]">
      {toasts.map((t) => (
        <div key={t.id} className="glass-card rounded-xl p-3.5 anim-fade-up">
          <p className="text-sm font-semibold text-emerald-400">{t.title}</p>
          {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Finance data hook (estado em memória — sem persistência entre sessões) */
/* ---------------------------------------------------------------------- */

function seedData() {
  return {
    transactions: [
      { id: "1", type: "income", amount: 5000, category: "Salário", description: "Salário mensal", date: "2026-07-01", recurring: true, seriesId: "1" },
      { id: "2", type: "expense", amount: 320, category: "Alimentação", description: "Supermercado semanal", date: "2026-07-03" },
      { id: "3", type: "expense", amount: 180, category: "Transporte", description: "Combustível", date: "2026-07-05" },
      { id: "4", type: "income", amount: 5000, category: "Salário", description: "Salário mensal", date: "2026-06-01", recurring: true, seriesId: "1" },
      { id: "5", type: "expense", amount: 450, category: "Alimentação", description: "Restaurantes e mercado", date: "2026-06-04" },
      { id: "6", type: "expense", amount: 200, category: "Transporte", description: "Uber e gasolina", date: "2026-06-08" },
      { id: "7", type: "expense", amount: 120, category: "Lazer", description: "Cinema e jantar", date: "2026-06-12" },
      { id: "8", type: "income", amount: 5000, category: "Salário", description: "Salário mensal", date: "2026-05-01", recurring: true, seriesId: "1" },
      { id: "9", type: "expense", amount: 380, category: "Alimentação", description: "Mercado e delivery", date: "2026-05-06" },
      { id: "10", type: "expense", amount: 150, category: "Transporte", description: "Combustível e estacionamento", date: "2026-05-10" },
      { id: "11", type: "expense", amount: 90, category: "Lazer", description: "Streaming e apps", date: "2026-05-15" },
      { id: "12", type: "income", amount: 5000, category: "Salário", description: "Salário mensal", date: "2026-04-01", recurring: true, seriesId: "1" },
      { id: "13", type: "expense", amount: 410, category: "Alimentação", description: "Supermercado mensal", date: "2026-04-03" },
      { id: "14", type: "expense", amount: 170, category: "Transporte", description: "Combustível", date: "2026-04-07" },
      { id: "15", type: "expense", amount: 60, category: "Outros", description: "Assinaturas", date: "2026-04-10" },
    ],
    goals: [
      { id: "g1", name: "Viagem ao Nordeste", targetAmount: 3000, currentAmount: 1850, deadline: "2026-12-01", icon: "✈️" },
      { id: "g2", name: "Reserva de Emergência", targetAmount: 15000, currentAmount: 4200, deadline: "2027-06-01", icon: "🛡️" },
      { id: "g3", name: "Notebook Novo", targetAmount: 8000, currentAmount: 2100, deadline: "2027-03-01", icon: "💻" },
    ],
  };
}

function generateMissingRecurring(transactions) {
  const seriesMap = new Map();
  transactions.forEach((t) => {
    if (!t.recurring && !t.seriesId) return;
    const key = t.seriesId || t.id;
    if (!seriesMap.has(key)) seriesMap.set(key, []);
    seriesMap.get(key).push(t);
  });

  const generated = [];
  const todayKey = currentMonthKey();

  seriesMap.forEach((items, key) => {
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    if (!latest.recurring) return;

    let cursor = latest.date;
    let iterations = 0;
    while (iterations < 24) {
      cursor = addMonthsISO(cursor, 1);
      if (monthKey(cursor) > todayKey) break;
      generated.push({
        id: `${key}-${cursor}-${Math.random().toString(36).slice(2, 7)}`,
        type: latest.type,
        amount: latest.amount,
        category: latest.category,
        description: latest.description,
        date: cursor,
        recurring: true,
        seriesId: key,
      });
      iterations++;
    }
  });

  return generated;
}

function useFinance(toast) {
  const [data, setData] = useState({ transactions: [], goals: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const hasGeneratedRecurring = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rTx, rGoals] = await Promise.all([
          supabase.from("transacoes").select("*").order("date", { ascending: false }),
          supabase.from("metas").select("*"),
        ]);
        if (rTx.error) throw rTx.error;
        if (rGoals.error) throw rGoals.error;
        if (!cancelled) {
          setData({
            transactions: rTx.data.map(transacaoFromRemote),
            goals: rGoals.data.map(metaFromRemote),
          });
        }
      } catch (err) {
        if (!cancelled) setLoadError("Erro ao carregar dados: " + (err?.message || JSON.stringify(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading || hasGeneratedRecurring.current) return;
    hasGeneratedRecurring.current = true;
    (async () => {
      const generated = generateMissingRecurring(data.transactions);
      if (generated.length === 0) return;
      const { data: inserted, error } = await supabase
        .from("transacoes")
        .insert(generated.map(transacaoToRemote))
        .select();
      if (error) return;
      const novas = inserted.map(transacaoFromRemote);
      const incomeCount = novas.filter((t) => t.type === "income").length;
      if (incomeCount > 0) {
        toast(
          incomeCount === 1 ? "1 receita recorrente foi lançada automaticamente" : `${incomeCount} receitas recorrentes foram lançadas automaticamente`,
          "Revise em Movimentações se algo estiver diferente."
        );
      }
      setData((prev) => ({ ...prev, transactions: [...novas, ...prev.transactions] }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const addTransaction = useCallback(async (tx) => {
    const { data: inserted, error } = await supabase.from("transacoes").insert(transacaoToRemote(tx)).select().single();
    if (error) { toast("Não foi possível salvar", error.message); return; }
    let newTx = transacaoFromRemote(inserted);
    if (tx.recurring && !newTx.seriesId) {
      await supabase.from("transacoes").update({ series_id: newTx.id }).eq("id", newTx.id);
      newTx = { ...newTx, seriesId: newTx.id };
    }
    setData((prev) => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
  }, [toast]);

  const updateTransaction = useCallback(async (id, tx) => {
    const seriesId = tx.recurring ? tx.seriesId || id : null;
    const { error } = await supabase.from("transacoes").update({ ...transacaoToRemote(tx), series_id: seriesId }).eq("id", id);
    if (error) { toast("Não foi possível salvar", error.message); return; }
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...tx, seriesId: seriesId || undefined } : t)),
    }));
  }, [toast]);

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase.from("transacoes").delete().eq("id", id);
    if (error) { toast("Não foi possível excluir", error.message); return; }
    setData((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }));
  }, [toast]);

  const addGoal = useCallback(async (goal) => {
    const { data: inserted, error } = await supabase.from("metas").insert(metaToRemote({ ...goal, currentAmount: 0 })).select().single();
    if (error) { toast("Não foi possível salvar a meta", error.message); return; }
    setData((prev) => ({ ...prev, goals: [...prev.goals, metaFromRemote(inserted)] }));
  }, [toast]);

  const deleteGoal = useCallback(async (id) => {
    const { error } = await supabase.from("metas").delete().eq("id", id);
    if (error) { toast("Não foi possível excluir a meta", error.message); return; }
    setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }, [toast]);

  const updateGoalAmount = useCallback(async (id, amount) => {
    const goal = data.goals.find((g) => g.id === id);
    if (!goal) return;
    const clamped = Math.min(Math.max(0, amount), goal.targetAmount);
    const { error } = await supabase.from("metas").update({ current_amount: clamped }).eq("id", id);
    if (error) { toast("Não foi possível atualizar a meta", error.message); return; }
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, currentAmount: clamped } : g)),
    }));
  }, [data.goals, toast]);

  const clearAll = useCallback(async () => {
    await Promise.all([
      supabase.from("transacoes").delete().not("id", "is", null),
      supabase.from("metas").delete().not("id", "is", null),
    ]);
    setData({ transactions: [], goals: [] });
  }, []);

  return { data, loading, loadError, addTransaction, updateTransaction, deleteTransaction, addGoal, deleteGoal, updateGoalAmount, clearAll };
}

/* ---------------------------------------------------------------------- */
/* Sidebar                                                                 */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard },
  { id: "monthly-expenses", label: "Gastos do Mês", icon: Receipt },
  { id: "transactions", label: "Movimentações", icon: Wallet },
  { id: "evolution", label: "Evolução", icon: TrendingUp },
  { id: "goals", label: "Metas", icon: Target },
];

function EMarkLogo() {
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="relative z-10">
        <rect x="4" y="12" width="3" height="6" rx="1" fill="rgba(15,23,42,0.9)" />
        <rect x="9" y="8" width="3" height="10" rx="1" fill="rgba(15,23,42,0.9)" />
        <rect x="14" y="4" width="3" height="14" rx="1" fill="rgba(15,23,42,0.9)" />
        <rect x="4" y="4" width="13" height="3" rx="1" fill="rgba(15,23,42,0.9)" />
      </svg>
    </div>
  );
}

function Sidebar({ activeTab, onTabChange }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 glass-card p-2.5 rounded-xl text-foreground/80 hover:text-foreground transition-colors"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 anim-fade" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 lg:z-30 flex flex-col bg-[oklch(0.10_0.02_260)]/80 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center gap-3">
          <EMarkLogo />
          <span className="text-lg font-bold tracking-tight">Economia</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Cada real guardado<br />é um passo a mais.
          </p>
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* ConfirmDialog                                                            */
/* ---------------------------------------------------------------------- */

function ConfirmDialog({ title, description, confirmLabel = "Confirmar", cancelLabel = "Cancelar", onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade" onClick={onCancel}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-sm relative glow-emerald anim-pop" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-400/15 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={20} className="text-red-400" />
          </div>
          <h3 className="text-base font-bold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-5">{description}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/5 text-sm font-medium text-foreground hover:bg-white/10 transition-all active:scale-95">
              {cancelLabel}
            </button>
            <button onClick={onConfirm} autoFocus className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-1.5">
              <Check size={14} />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* AddTransactionModal                                                      */
/* ---------------------------------------------------------------------- */

function AddTransactionModal({ onClose, onSubmit, initialTransaction }) {
  const isEditing = !!initialTransaction;
  const [type, setType] = useState(initialTransaction?.type ?? "expense");
  const [amount, setAmount] = useState(initialTransaction ? String(initialTransaction.amount) : "");
  const [category, setCategory] = useState(initialTransaction?.category ?? CATEGORIES[0]);
  const [description, setDescription] = useState(initialTransaction?.description ?? "");
  const [date, setDate] = useState(initialTransaction?.date ?? new Date().toISOString().split("T")[0]);
  const [recurring, setRecurring] = useState(initialTransaction?.recurring ?? false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    onSubmit({ type, amount: parseFloat(amount), category, description, date, recurring, seriesId: initialTransaction?.seriesId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md relative glow-emerald anim-pop max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold mb-1">
          {isEditing ? "Editar movimentação" : type === "expense" ? "Registrar gasto" : "Registrar receita"}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {isEditing ? "Ajuste os dados e salve" : type === "expense" ? "Para onde foi seu dinheiro?" : "De onde veio o dinheiro?"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
            <button type="button" onClick={() => setType("expense")} className={`py-2.5 rounded-lg text-sm font-medium transition-all ${type === "expense" ? "bg-red-400/20 text-red-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Gasto
            </button>
            <button type="button" onClick={() => setType("income")} className={`py-2.5 rounded-lg text-sm font-medium transition-all ${type === "income" ? "bg-emerald-400/20 text-emerald-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Receita
            </button>
          </div>

          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none transition-colors font-mono text-lg" />
          </div>

          <div className="relative">
            <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none transition-colors" />
          </div>

          <div className="relative">
            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-emerald-500/50 focus:outline-none transition-colors appearance-none">
              {CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
            </select>
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-emerald-500/50 focus:outline-none transition-colors" />
          </div>

          <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${recurring ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground"}`}>
              <Repeat size={14} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Repetir todo mês</p>
              <p className="text-xs text-muted-foreground">Ideal para salário, aluguel ou assinaturas fixas</p>
            </div>
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="w-4 h-4 accent-emerald-500 shrink-0" />
          </label>

          <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 text-slate-900 font-semibold text-sm hover:bg-emerald-400 transition-colors active:scale-95 shadow-lg shadow-emerald-500/20">
            {isEditing ? "Salvar alterações" : `Confirmar ${type === "expense" ? "gasto" : "receita"}`}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* AddGoalModal                                                             */
/* ---------------------------------------------------------------------- */

const GOAL_ICONS = ["✈️", "🛡️", "💻", "🏠", "🚗", "📱", "🎓", "🎯", "🏖️", "🎮"];

function AddGoalModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState(GOAL_ICONS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    onSubmit({
      name,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      icon,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md relative glow-emerald anim-pop" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold mb-1">Nova Meta</h2>
        <p className="text-sm text-muted-foreground mb-5">Defina um objetivo para motivar sua economia</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {GOAL_ICONS.map((i) => (
              <button key={i} type="button" onClick={() => setIcon(i)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${icon === i ? "bg-emerald-500/20 border-2 border-emerald-500/50 shadow-sm" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}>
                {i}
              </button>
            ))}
          </div>

          <div className="relative">
            <Target size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da meta" required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none transition-colors" />
          </div>

          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="number" step="0.01" min="0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="Valor objetivo" required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none transition-colors font-mono" />
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-emerald-500/50 focus:outline-none transition-colors" />
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 text-slate-900 font-semibold text-sm hover:bg-emerald-400 transition-colors active:scale-95 shadow-lg shadow-emerald-500/20">
            Criar meta
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* MonthlyExpenses (Gastos do Mês)                                         */
/* ---------------------------------------------------------------------- */

function MonthlyExpenses({ transactions, onAdd, onDelete }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [deletingTx, setDeletingTx] = useState(null);

  const nowKey = currentMonthKey();
  const monthLabel = `${MONTH_LABELS[new Date().getMonth()]} de ${new Date().getFullYear()}`;

  const monthExpenses = useMemo(
    () => transactions.filter((t) => t.type === "expense" && monthKey(t.date) === nowKey),
    [transactions, nowKey]
  );

  const total = useMemo(() => monthExpenses.reduce((s, t) => s + t.amount, 0), [monthExpenses]);

  const byCategory = useMemo(() => {
    const map = {};
    monthExpenses.forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthExpenses]);

  const sorted = useMemo(() => [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date)), [monthExpenses]);

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = parseFloat(String(amount).replace(",", "."));
    if (!description || Number.isNaN(parsed) || parsed <= 0) return;
    onAdd({ type: "expense", amount: parsed, category, description, date });
    setAmount("");
    setDescription("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gastos do mês</h1>
        <p className="text-muted-foreground text-sm mt-1">{monthLabel} · lance rápido, sem preencher tudo</p>
      </div>

      <div className="glass-card rounded-2xl p-6 anim-fade-up flex items-center justify-between glow-emerald">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total gasto neste mês</p>
          <p className="text-3xl font-bold font-mono text-red-400">{formatBRL(total)}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-400/15 flex items-center justify-center text-red-400">
          <Receipt size={22} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 anim-fade-up space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Novo gasto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none transition-colors font-mono text-lg" />
          </div>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-emerald-500/50 focus:outline-none transition-colors" />
          </div>
        </div>
        <div className="relative">
          <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" required
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none transition-colors" />
        </div>
        <div className="relative">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-emerald-500/50 focus:outline-none transition-colors appearance-none">
            {CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 text-slate-900 font-semibold text-sm hover:bg-emerald-400 transition-colors active:scale-95 shadow-lg shadow-emerald-500/20">
          + Adicionar gasto
        </button>
      </form>

      {byCategory.length > 0 && (
        <div className="glass-card rounded-2xl p-6 anim-fade-up">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Por categoria</h3>
          <div className="space-y-3">
            {byCategory.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{cat}</span>
                  <span className="font-mono text-muted-foreground">{formatBRL(val)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(val / total) * 100}%`, background: CATEGORY_COLORS[cat] || "#94A3B8" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 anim-fade-up">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Lançamentos do mês</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhum gasto lançado neste mês ainda.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/[0.04] transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-400/15 text-red-400 shrink-0">
                    <ArrowDownRight size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-mono font-semibold text-red-400 mr-1">- {formatBRL(t.amount)}</span>
                  <button onClick={() => setDeletingTx(t)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1.5" aria-label="Excluir">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deletingTx && (
        <ConfirmDialog
          title="Excluir gasto?"
          description={`"${deletingTx.description}" · ${formatBRL(deletingTx.amount)} será removido. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onCancel={() => setDeletingTx(null)}
          onConfirm={() => { onDelete(deletingTx.id); setDeletingTx(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Dashboard                                                                */
/* ---------------------------------------------------------------------- */

function savingsRatePct(income, expense) {
  return income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
}

function Dashboard({ transactions, goals, onAddTransaction, onAddGoal }) {
  const [modal, setModal] = useState(null);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  const monthMap = new Map();
  transactions.forEach((t) => {
    const key = monthKey(t.date);
    if (!monthMap.has(key)) monthMap.set(key, { label: monthYearLabel(t.date), income: 0, expense: 0 });
    const entry = monthMap.get(key);
    if (t.type === "income") entry.income += t.amount; else entry.expense += t.amount;
  });
  const activeMonths = Array.from(monthMap.entries()).sort(([a], [b]) => a - b).slice(-6).map(([key, v]) => [v.label, v]);
  const maxVal = Math.max(1, ...activeMonths.map(([, v]) => Math.max(v.income, v.expense)));

  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const now = new Date();
  const currentMonthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const currentMonthName = currentMonthNames[now.getMonth()].replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 anim-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seu dinheiro trabalhando por você</h1>
          <p className="text-muted-foreground text-sm mt-1">{currentMonthName} de {now.getFullYear()} — tudo sob controle</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal("transaction")} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/20">
            + Registrar
          </button>
          <button onClick={() => setModal("goal")} className="px-4 py-2.5 rounded-xl glass-card text-sm font-medium hover:bg-white/[0.08] transition-all duration-200 active:scale-95">
            + Meta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 glass-card rounded-2xl p-6 sm:p-8 glow-emerald relative overflow-hidden anim-fade-up" style={{ animationDelay: "40ms" }}>
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/6 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/4 rounded-full blur-[60px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-emerald-400" />
              <p className="text-sm text-muted-foreground font-medium">Saldo acumulado</p>
            </div>
            <p className="text-4xl sm:text-5xl font-bold mt-1 text-glow font-mono tracking-tight">{formatBRL(balance)}</p>
            <div className="flex gap-6 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <span className="text-sm text-emerald-400 font-medium font-mono">+ {formatBRL(totalIncome)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                <span className="text-sm text-red-400 font-medium font-mono">- {formatBRL(totalExpense)}</span>
              </div>
            </div>
            {balance > 0 && (
              <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                <p className="text-xs text-emerald-400/80 font-medium">
                  Você economizou <span className="text-emerald-400 font-semibold">{formatBRL(Math.max(0, totalIncome - totalExpense))}</span> neste mês.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-card rounded-2xl p-5 glass-card-hover flex-1 anim-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400"><TrendingUp size={16} /></div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Economia mensal</span>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-400">{formatBRL(Math.max(0, totalIncome - totalExpense))}</p>
            <p className="text-xs text-muted-foreground mt-1">{savingsRatePct(totalIncome, totalExpense)}% do salário guardado</p>
          </div>

          <div className="glass-card rounded-2xl p-5 glass-card-hover flex-1 anim-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500/15 text-teal-400"><PiggyBank size={16} /></div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Metas</span>
            </div>
            <p className="text-2xl font-bold font-mono">{goals.length}</p>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 progress-glow transition-all duration-700" style={{ width: `${Math.round((totalSaved / Math.max(1, totalTarget)) * 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formatBRL(totalSaved)} de {formatBRL(totalTarget)}</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 anim-fade-up" style={{ animationDelay: "200ms" }}>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Receita vs Gastos — últimos meses</h3>
        <div className="flex items-end gap-2 h-36">
          {activeMonths.map(([month, d]) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-1 items-end justify-center" style={{ height: "120px" }}>
                <div className="w-4 sm:w-6 rounded-t-md bg-gradient-to-t from-emerald-600/60 to-emerald-400/60 transition-all duration-700" style={{ height: `${(d.income / Math.max(maxVal, 1)) * 120}px` }} />
                <div className="w-4 sm:w-6 rounded-t-md bg-gradient-to-t from-red-500/40 to-red-400/30 transition-all duration-700" style={{ height: `${(d.expense / Math.max(maxVal, 1)) * 120}px` }} />
              </div>
              <span className="text-[11px] text-muted-foreground mt-1">{month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded-sm bg-emerald-400/60" />Receita</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded-sm bg-red-400/30" />Gastos</div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 anim-fade-up" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Últimas movimentações</h3>
          <button onClick={() => setModal("transaction")} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Ver todas</button>
        </div>
        <div className="space-y-2">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/[0.04] transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${tx.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>
                  {tx.type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} · {new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
              <span className={`text-sm font-mono font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                {tx.type === "income" ? "+" : "-"} {formatBRL(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {goals.length > 0 && (
        <div className="glass-card rounded-2xl p-6 anim-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Suas metas</h3>
            <span className="text-xs text-muted-foreground">{formatBRL(totalSaved)} guardado no total</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const pct = Math.round((goal.currentAmount / Math.max(1, goal.targetAmount)) * 100);
              return (
                <div key={goal.id} className="glass-card rounded-xl p-4 glass-card-hover">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{goal.icon}</span>
                    <span className="text-sm font-medium">{goal.name}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 progress-glow transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground font-mono">{formatBRL(goal.currentAmount)}</span>
                    <span className="text-xs font-semibold font-mono text-emerald-400">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal === "transaction" && <AddTransactionModal onClose={() => setModal(null)} onSubmit={(tx) => { onAddTransaction(tx); setModal(null); }} />}
      {modal === "goal" && <AddGoalModal onClose={() => setModal(null)} onSubmit={(goal) => { onAddGoal(goal); setModal(null); }} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Transactions                                                             */
/* ---------------------------------------------------------------------- */

const FILTER_CATEGORIES = ["Todos", ...CATEGORIES];
const SORT_LABELS = { "date-desc": "Mais recentes", "date-asc": "Mais antigas", "amount-desc": "Maior valor", "amount-asc": "Menor valor" };

function Transactions({ transactions, onAdd, onUpdate, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTx, setDeletingTx] = useState(null);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = transactions.filter((t) => {
      if (filter === "income" && t.type !== "income") return false;
      if (filter === "expense" && t.type !== "expense") return false;
      if (categoryFilter !== "Todos" && t.category !== categoryFilter) return false;
      if (q && !t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
      return true;
    });
    result.sort((a, b) => {
      switch (sort) {
        case "date-asc": return a.date.localeCompare(b.date);
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc": return a.amount - b.amount;
        default: return b.date.localeCompare(a.date);
      }
    });
    return result;
  }, [transactions, filter, categoryFilter, search, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Todas as movimentações</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} registros · controle total</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/20 self-start">
          + Registrar
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por descrição ou categoria..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none transition-colors" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
          {["all", "income", "expense"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {f === "all" ? "Todos" : f === "income" ? "Receitas" : "Gastos"}
            </button>
          ))}
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground focus:border-emerald-500/50 focus:outline-none appearance-none pr-8">
          {FILTER_CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
        </select>
        <div className="relative">
          <ArrowUpDown size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="pl-8 pr-8 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground focus:border-emerald-500/50 focus:outline-none appearance-none">
            {Object.keys(SORT_LABELS).map((s) => <option key={s} value={s} className="bg-slate-800">{SORT_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4 glow-emerald">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total receitas</p>
          <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{formatBRL(filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0))}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total gastos</p>
          <p className="text-lg font-bold text-red-400 font-mono mt-1">{formatBRL(filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0))}</p>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((tx) => (
          <div key={tx.id} className="glass-card rounded-xl p-4 flex items-center justify-between group glass-card-hover">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${tx.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>
                {tx.type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  {tx.recurring && <span title="Recorrente todo mês"><Repeat size={11} className="text-muted-foreground shrink-0" /></span>}
                </div>
                <p className="text-xs text-muted-foreground">{tx.category} · {new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-sm font-mono font-semibold mr-2 ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                {tx.type === "income" ? "+" : "-"} {formatBRL(tx.amount)}
              </span>
              <button onClick={() => setEditingTx(tx)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-emerald-400 p-1.5" aria-label="Editar"><Pencil size={14} /></button>
              <button onClick={() => setDeletingTx(tx)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1.5" aria-label="Excluir"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Nenhuma movimentação encontrada.</p>
          <p className="text-muted-foreground text-xs mt-1">Registre um gasto ou receita para começar.</p>
        </div>
      )}

      {modalOpen && <AddTransactionModal onClose={() => setModalOpen(false)} onSubmit={(tx) => { onAdd(tx); setModalOpen(false); }} />}
      {editingTx && <AddTransactionModal initialTransaction={editingTx} onClose={() => setEditingTx(null)} onSubmit={(tx) => { onUpdate(editingTx.id, tx); setEditingTx(null); }} />}
      {deletingTx && (
        <ConfirmDialog
          title="Excluir movimentação?"
          description={`"${deletingTx.description}" · ${formatBRL(deletingTx.amount)} será removida. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onCancel={() => setDeletingTx(null)}
          onConfirm={() => { onDelete(deletingTx.id); setDeletingTx(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Goals                                                                    */
/* ---------------------------------------------------------------------- */

function Goals({ goals, onAdd, onDelete, onUpdateAmount }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [customAmounts, setCustomAmounts] = useState({});

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suas metas de economia</h1>
          <p className="text-muted-foreground text-sm mt-1">{goals.length} objetivos ativos · {formatBRL(totalCurrent)} guardado de {formatBRL(totalTarget)}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/20 self-start flex items-center gap-2">
          <Plus size={14} />Nova Meta
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 glow-emerald relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Progresso geral</h3>
          </div>
          <div className="flex items-end justify-between mb-3">
            <span className="text-lg font-bold font-mono text-emerald-400">{overallPct}%</span>
            <span className="text-xs text-muted-foreground">Faltam {formatBRL(Math.max(0, totalTarget - totalCurrent))}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 progress-glow transition-all duration-700" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>{formatBRL(totalCurrent)} guardado</span>
            <span>{formatBRL(totalTarget)} no total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const pct = Math.round((goal.currentAmount / Math.max(1, goal.targetAmount)) * 100);
          const remaining = goal.targetAmount - goal.currentAmount;
          const deadlineDate = new Date(goal.deadline + "T00:00:00");
          const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

          return (
            <div key={goal.id} className="glass-card rounded-2xl p-5 glass-card-hover group relative overflow-hidden">
              {pct >= 100 && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold">{goal.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar size={10} className="text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">{daysLeft > 0 ? `${daysLeft} dias restantes` : "Prazo vencido"}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setDeletingGoal(goal)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
                </div>

                <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-gradient-to-r from-emerald-400 to-teal-300 progress-glow" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-muted-foreground font-mono">{formatBRL(goal.currentAmount)}</span>
                    <span className="text-xs text-muted-foreground font-mono"> / </span>
                    <span className="text-xs text-muted-foreground font-mono">{formatBRL(goal.targetAmount)}</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-emerald-400">{pct}%</span>
                </div>

                {remaining > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      {[10, 50, 100].map((amount) => (
                        <button key={amount} onClick={() => onUpdateAmount(goal.id, Math.min(goal.currentAmount + amount, goal.targetAmount))} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all active:scale-95">
                          +{formatBRL(amount)}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const raw = customAmounts[goal.id];
                      const value = raw ? parseFloat(raw.replace(",", ".")) : NaN;
                      if (!value || value <= 0) return;
                      onUpdateAmount(goal.id, goal.currentAmount + value);
                      setCustomAmounts((prev) => ({ ...prev, [goal.id]: "" }));
                    }} className="flex gap-2">
                      <input type="number" step="0.01" min="0" value={customAmounts[goal.id] ?? ""} onChange={(e) => setCustomAmounts((prev) => ({ ...prev, [goal.id]: e.target.value }))} placeholder="Outro valor"
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none transition-colors font-mono" />
                      <button type="submit" className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all active:scale-95 flex items-center gap-1">
                        <Check size={12} />Add
                      </button>
                    </form>
                  </div>
                )}

                {remaining <= 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Sparkles size={12} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Meta alcançada! Parabéns!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Target size={24} className="text-muted-foreground" /></div>
          <p className="text-muted-foreground text-sm">Nenhuma meta criada ainda.</p>
          <p className="text-muted-foreground text-xs mt-1">Defina objetivos para dar um propósito ao seu dinheiro.</p>
          <button onClick={() => setModalOpen(true)} className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
            + Criar primeira meta
          </button>
        </div>
      )}

      {modalOpen && <AddGoalModal onClose={() => setModalOpen(false)} onSubmit={(goal) => { onAdd(goal); setModalOpen(false); }} />}
      {deletingGoal && (
        <ConfirmDialog
          title="Excluir meta?"
          description={`"${deletingGoal.name}" e o progresso guardado (${formatBRL(deletingGoal.currentAmount)}) serão removidos. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onCancel={() => setDeletingGoal(null)}
          onConfirm={() => { onDelete(deletingGoal.id); setDeletingGoal(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Evolution                                                                */
/* ---------------------------------------------------------------------- */

function Evolution({ transactions }) {
  const monthMap = new Map();
  transactions.forEach((t) => {
    const key = monthKey(t.date);
    if (!monthMap.has(key)) monthMap.set(key, { month: monthYearLabel(t.date), income: 0, expense: 0, balance: 0 });
    const entry = monthMap.get(key);
    if (t.type === "income") entry.income += t.amount; else entry.expense += t.amount;
  });

  const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => a - b);
  let runningBalance = 0;
  const activeData = sortedKeys.map((key) => {
    const entry = monthMap.get(key);
    entry.balance = entry.income - entry.expense;
    runningBalance += entry.balance;
    return { ...entry, balance: runningBalance };
  });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const monthlySavings = totalIncome - totalExpense;
  const currentBalance = activeData.length > 0 ? activeData[activeData.length - 1].balance : 0;
  const projection = Array.from({ length: 13 }, (_, i) => ({ month: i === 0 ? "Atual" : `Mês ${i}`, value: currentBalance + monthlySavings * i }));

  const categoryMap = new Map();
  transactions.filter((t) => t.type === "expense").forEach((t) => categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount));
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const tooltipStyle = { background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f8fafc", fontSize: "13px", backdropFilter: "blur(8px)" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Veja seu dinheiro crescer</h1>
        <p className="text-muted-foreground text-sm mt-1">Evolução, projeções e o ritmo da sua economia</p>
      </div>

      <div className="glass-card rounded-2xl p-6 glow-emerald relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center"><TrendingUp size={14} className="text-emerald-400" /></div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Taxa de economia</p>
            </div>
            <p className="text-3xl font-bold font-mono text-glow">{savingsRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Do salário que você guarda</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center"><PiggyBank size={14} className="text-teal-400" /></div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Economia mensal</p>
            </div>
            <p className="text-3xl font-bold font-mono text-emerald-400">{formatBRL(monthlySavings)}</p>
            <p className="text-xs text-muted-foreground mt-1">Receita menos gastos</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center"><CalendarDays size={14} className="text-blue-400" /></div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Projeção anual</p>
            </div>
            <p className="text-3xl font-bold font-mono text-teal-400">{formatBRL(currentBalance + monthlySavings * 12)}</p>
            <p className="text-xs text-muted-foreground mt-1">Se mantiver o ritmo</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Balanço acumulado ao longo do tempo</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatBRL(value), "Balanço"]} />
              <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2.5} fill="url(#balanceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Receita vs Gastos por mês</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatBRL(value), name === "income" ? "Receita" : "Gastos"]} />
              <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} opacity={0.7} />
              <Bar dataKey="expense" fill="#F87171" radius={[6, 6, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon size={14} className="text-teal-400" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Para onde vai o seu dinheiro</h3>
        </div>
        {categoryData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="75%" paddingAngle={2}>
                  {categoryData.map((entry) => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94A3B8"} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatBRL(value), name]} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">Registre alguns gastos para ver a distribuição por categoria.</p>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Projeção: onde seu dinheiro estará</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatBRL(value), "Projeção"]} />
              <Line type="monotone" dataKey="value" stroke="#14B8A6" strokeWidth={2.5} strokeDasharray="6 4" dot={{ fill: "#14B8A6", r: 4, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3">* Projeção baseada na economia mensal atual. Valores podem variar conforme novos gastos e receitas.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* App shell                                                                */
/* ---------------------------------------------------------------------- */

function EconomiaAppInterno() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toasts, push: toast } = useToasts();
  const { data, loading, loadError, addTransaction, updateTransaction, deleteTransaction, addGoal, deleteGoal, updateGoalAmount, clearAll } = useFinance(toast);

  const handleClearAll = useCallback(() => {
    clearAll();
    setShowClearConfirm(false);
    toast("Todos os dados foram apagados", "Comece do zero agora.");
  }, [clearAll, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, oklch(0.10 0.025 260) 0%, oklch(0.12 0.02 250) 40%, oklch(0.14 0.025 170) 100%)" }}>
        <Loader2 className="animate-spin text-emerald-400" size={28} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center" style={{ background: "linear-gradient(160deg, oklch(0.10 0.025 260) 0%, oklch(0.12 0.02 250) 40%, oklch(0.14 0.025 170) 100%)" }}>
        <p className="text-red-400 text-sm max-w-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(160deg, oklch(0.10 0.025 260) 0%, oklch(0.12 0.02 250) 40%, oklch(0.14 0.025 170) 100%)" }}>
      <style>{`
        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(16,185,129,0.02) 100%);
          backdrop-filter: blur(20px) saturate(1.2);
          -webkit-backdrop-filter: blur(20px) saturate(1.2);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.2);
        }
        .glass-card-hover { transition: all 200ms cubic-bezier(0.23,1,0.32,1); }
        .glass-card-hover:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(16,185,129,0.04) 100%);
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(16,185,129,0.12);
          border-color: rgba(16,185,129,0.15);
        }
        .glow-emerald { box-shadow: 0 0 60px rgba(16,185,129,0.08), 0 0 120px rgba(20,184,166,0.04); }
        .text-glow { text-shadow: 0 0 30px rgba(16,185,129,0.4), 0 0 60px rgba(16,185,129,0.15); }
        .progress-glow { box-shadow: 0 0 8px rgba(16,185,129,0.4), 0 0 20px rgba(16,185,129,0.15); }
        .text-muted-foreground { color: oklch(0.60 0.02 260); }
        .text-foreground { color: oklch(0.95 0.01 260); }
        .text-destructive { color: oklch(0.65 0.20 25); }
        .border-border { border-color: oklch(0.28 0.015 260); }
        body { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .anim-fade-up { animation: fadeInUp 0.35s cubic-bezier(0.23,1,0.32,1) both; }
        .anim-fade { animation: fadeIn 0.2s ease-out both; }
        .anim-pop { animation: popIn 0.25s cubic-bezier(0.23,1,0.32,1) both; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/[0.03] blur-[100px] translate-y-1/3" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/[0.02] blur-[80px] -translate-x-1/2" />
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="lg:ml-64 min-h-screen p-4 lg:p-8 relative z-10 text-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-end gap-2 mb-2">
            <button onClick={() => setShowClearConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95">
              <Trash2 size={13} />Apagar tudo
            </button>
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all active:scale-95">
              <LogOut size={13} />Sair
            </button>
          </div>

          {activeTab === "dashboard" && <Dashboard transactions={data.transactions} goals={data.goals} onAddTransaction={addTransaction} onAddGoal={addGoal} />}
          {activeTab === "monthly-expenses" && <MonthlyExpenses transactions={data.transactions} onAdd={addTransaction} onDelete={deleteTransaction} />}
          {activeTab === "transactions" && <Transactions transactions={data.transactions} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} />}
          {activeTab === "evolution" && <Evolution transactions={data.transactions} />}
          {activeTab === "goals" && <Goals goals={data.goals} onAdd={addGoal} onDelete={deleteGoal} onUpdateAmount={updateGoalAmount} />}
        </div>
      </main>

      {showClearConfirm && (
        <ConfirmDialog
          title="Apagar todos os dados?"
          description="Isso vai remover todas as movimentações, metas e registros. Essa ação não pode ser desfeita."
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={handleClearAll}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Porta de entrada: mostra a tela de login ou o app, conforme a sessão    */
/* ---------------------------------------------------------------------- */

export default function EconomiaApp() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, oklch(0.10 0.025 260) 0%, oklch(0.12 0.02 250) 40%, oklch(0.14 0.025 170) 100%)" }}>
        <Loader2 className="animate-spin text-emerald-400" size={28} />
      </div>
    );
  }
  if (!session) return <TelaLogin />;
  return <EconomiaAppInterno key={session.user.id} />;
}
