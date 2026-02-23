import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Mail, Building2, Trash2, Plus, 
  LogOut, AlertCircle, CheckCircle2, Loader2, Lock, HelpCircle, X, ChevronLeft
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'estrategia' | 'objetivos'>('estrategia');
  const [showHelp, setShowHelp] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [gmailPass, setGmailPass] = useState(''); 
  const [emailTpl, setEmailTpl] = useState('SEGURIDAD');
  const [targets, setTargets] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const templates = ['SEGURIDAD', 'FINANZAS', 'LOGISTICA', 'RRHH', 'IT_SUPPORT', 'BENEFICIOS'];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUserId(user.id);
      fetchTargets(user.id);
      fetchSmtpSettings(user.id); 
    }

    const saved = localStorage.getItem('hook_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCompanyName(parsed.companyName || '');
      // El adminEmail lo priorizamos desde la DB en fetchSmtpSettings
      setEmailTpl(parsed.emailTpl || 'SEGURIDAD');
    }
  };

  // 1. SINCRONIZACIÓN TOTAL: Traemos el email y la clave de la DB
  const fetchSmtpSettings = async (uid: string) => {
    const { data } = await supabase
      .from('user_settings')
      .select('gmail_user, gmail_app_password')
      .eq('user_id', uid)
      .single();
    
    if (data) {
      setAdminEmail(data.gmail_user || '');
      setGmailPass(data.gmail_app_password || '');
    }
  };

  const fetchTargets = async (uid: string) => {
    const { data } = await supabase.from('targets').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    setTargets(data || []);
  };

  const showMsg = (type: 'error' | 'success', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 2. GUARDADO COMPLETO: Aseguramos que el email de la DB sea el que manda
  const saveConfig = async () => {
    if (!companyName || !adminEmail || !gmailPass) {
      showMsg('error', 'RELLENA TODOS LOS CAMPOS INCLUYENDO LA CLAVE');
      return;
    }
    if (!validateEmail(adminEmail)) {
      showMsg('error', 'EMAIL DE GMAIL NO VÁLIDO');
      return;
    }

    setLoading(true);
    
    // Guardamos configuración visual en local
    localStorage.setItem('hook_config', JSON.stringify({ companyName, adminEmail, emailTpl }));

    // Guardamos credenciales críticas en Supabase (Multiusuario)
    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      gmail_user: adminEmail,
      gmail_app_password: gmailPass,
      updated_at: new Date()
    });

    setLoading(false);

    if (error) {
      showMsg('error', 'ERROR AL GUARDAR EN LA BASE DE DATOS');
      console.error(error);
    } else {
      showMsg('success', 'ESTRATEGIA Y SMTP ACTUALIZADOS');
    }
  };

  const addTarget = async () => {
    if (!newEmail || !userId) {
      showMsg('error', 'EL EMAIL ES OBLIGATORIO');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('targets').insert([{ 
      name: newName || 'Desconocido', 
      email: newEmail, 
      user_id: userId 
    }]);

    if (error) showMsg('error', 'ERROR DE CONEXIÓN');
    else {
      setNewName(''); setNewEmail('');
      fetchTargets(userId);
      showMsg('success', 'OBJETIVO REGISTRADO');
    }
    setLoading(false);
  };

  const deleteTarget = async (id: number) => {
    if (!userId) return;
    await supabase.from('targets').delete().eq('id', id).eq('user_id', userId);
    fetchTargets(userId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-10 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      
      {/* MODAL DE AYUDA */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#16181d] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowHelp(false)} className="absolute top-6 right-6 text-white/20 hover:text-white">
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-6 text-emerald-500">
                <AlertCircle size={20} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Tutorial SMTP Seguro</h3>
            </div>
            <div className="space-y-6 text-[11px] font-bold uppercase tracking-widest leading-loose text-white/60">
                <p><span className="text-emerald-500">01.</span> Entra en tu Cuenta de Google &gt; Seguridad.</p>
                <p><span className="text-emerald-500">02.</span> Activa "Verificación en 2 pasos".</p>
                <p><span className="text-emerald-500">03.</span> Busca "Contraseñas de aplicaciones".</p>
                <p><span className="text-emerald-500">04.</span> Genera una clave de 16 letras y pégala aquí sin espacios.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* MENSAJES DE ESTADO */}
        {msg.text && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">{msg.text}</p>
          </div>
        )}

        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <Link href="/dashboard" className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Panel de Control</h1>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
            <button onClick={() => setActiveTab('estrategia')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'estrategia' ? 'bg-white text-black' : 'text-white/40'}`}>Estrategia</button>
            <button onClick={() => setActiveTab('objetivos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'objetivos' ? 'bg-white text-black' : 'text-white/40'}`}>Objetivos</button>
          </div>
        </header>

        {activeTab === 'estrategia' ? (
          <div className="space-y-6">
            <section className="bg-[#16181d] border border-white/5 rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-emerald-500">
                  <Building2 size={16} />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Configuración SMTP</h2>
                </div>
                <button onClick={() => setShowHelp(true)} className="text-emerald-500/50 hover:text-emerald-500 transition-all">
                    <HelpCircle size={18} />
                </button>
              </div>
              
              <div className="grid gap-4">
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-emerald-500" placeholder="Nombre de Empresa" />
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-sm font-bold outline-none focus:border-emerald-500" placeholder="Tu Gmail" />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input type="password" value={gmailPass} onChange={(e) => setGmailPass(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-sm font-mono outline-none focus:border-emerald-500 font-bold" placeholder="Clave de Aplicación (16 letras)" />
                </div>
              </div>
            </section>

            <section className="bg-[#16181d] border border-white/5 rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 text-emerald-500">
                <Mail size={16} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Plantilla</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {templates.map(t => (
                  <button key={t} onClick={() => setEmailTpl(t)} className={`w-full p-3 md:p-4 rounded-xl border text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${emailTpl === t ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-white/5 bg-white/5 text-white/20'}`}>{t.replace('_', ' ')}</button>
                ))}
              </div>
            </section>
            
            <button onClick={saveConfig} disabled={loading} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 mb-4 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18}/> : 'Guardar y Sincronizar'}
            </button>

            <button onClick={handleLogout} className="w-full bg-red-500/5 text-red-500/50 border border-red-500/10 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="bg-[#16181d] border border-white/5 rounded-[2.5rem] p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <input placeholder="Nombre" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-emerald-500 text-white" />
              <input placeholder="Email Víctima" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-emerald-500 text-white" />
              <button onClick={addTarget} disabled={loading} className="bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all py-4">
                {loading ? <Loader2 size={16} className="animate-spin m-auto" /> : '+ Registrar'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {targets.map(t => (
                <div key={t.id} className="flex justify-between items-center p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] hover:border-emerald-500/30 transition-all">
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest truncate">{t.name}</p>
                    <p className="text-[11px] font-bold text-white/40 truncate">{t.email}</p>
                  </div>
                  <button onClick={() => deleteTarget(t.id)} className="p-2 text-white/10 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

