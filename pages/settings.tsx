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
  const [showHelp, setShowHelp] = useState(false); // Estado para el modal de ayuda
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
      setAdminEmail(parsed.adminEmail || '');
      setEmailTpl(parsed.emailTpl || 'SEGURIDAD');
    }
  };

  const fetchSmtpSettings = async (uid: string) => {
    const { data } = await supabase
      .from('user_settings')
      .select('gmail_app_password')
      .eq('user_id', uid)
      .single();
    
    if (data) setGmailPass(data.gmail_app_password);
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
    localStorage.setItem('hook_config', JSON.stringify({ companyName, adminEmail, emailTpl }));

    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      gmail_user: adminEmail,
      gmail_app_password: gmailPass,
      updated_at: new Date()
    });

    setLoading(false);

    if (error) {
      showMsg('error', 'ERROR AL GUARDAR EN LA BASE DE DATOS');
    } else {
      showMsg('success', 'ESTRATEGIA Y SMTP GUARDADOS');
    }
  };

  const addTarget = async () => {
    if (!newEmail || !userId) {
      showMsg('error', 'EL EMAIL DEL OBJETIVO ES OBLIGATORIO');
      return;
    }
    if (!validateEmail(newEmail)) {
      showMsg('error', 'FORMATO DE EMAIL INCORRECTO');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('targets').insert([{ 
      name: newName || 'Desconocido', 
      email: newEmail, 
      user_id: userId 
    }]);

    if (error) {
      showMsg('error', 'ERROR DE CONEXIÓN');
    } else {
      setNewName('');
      setNewEmail('');
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
    <div className="min-h-screen bg-[#0f1115] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      
      {/* MODAL DE INSTRUCCIONES */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#16181d] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowHelp(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-6 text-emerald-500">
                <AlertCircle size={20} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Tutorial Clave de Aplicación</h3>
            </div>
            <div className="space-y-6 text-[11px] font-bold uppercase tracking-widest leading-loose text-white/60">
                <div className="flex gap-4">
                    <span className="text-emerald-500">01.</span>
                    <p>Ve a tu <span className="text-white italic underline">Cuenta de Google</span> &gt; Seguridad.</p>
                </div>
                <div className="flex gap-4">
                    <span className="text-emerald-500">02.</span>
                    <p>Activa la "Verificación en 2 pasos".</p>
                </div>
                <div className="flex gap-4">
                    <span className="text-emerald-500">03.</span>
                    <p>Busca "Contraseñas de aplicaciones" en la barra de búsqueda superior.</p>
                </div>
                <div className="flex gap-4">
                    <span className="text-emerald-500">04.</span>
                    <p>Crea una llamada "HOOKWATCH" y pega aquí el código de 16 letras.</p>
                </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-10 w-full bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-emerald-500">
                <ChevronLeft size={16}/> Volver a la configuración
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {msg.text && (
          <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="text-[10px] font-black uppercase tracking-widest">{msg.text}</p>
          </div>
        )}

        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Panel de Control</h1>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setActiveTab('estrategia')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'estrategia' ? 'bg-white text-black' : 'text-white/40'}`}>Estrategia</button>
            <button onClick={() => setActiveTab('objetivos')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'objetivos' ? 'bg-white text-black' : 'text-white/40'}`}>Objetivos</button>
          </div>
        </header>

        {activeTab === 'estrategia' ? (
          <div className="space-y-6">
            <section className="bg-[#16181d] border border-white/5 rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-emerald-500">
                  <Building2 size={16} />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Información de la Organización</h2>
                </div>
                {/* BOTÓN DE AYUDA CON EL ASTERISCO/ICONO */}
                <button onClick={() => setShowHelp(true)} className="flex items-center gap-2 text-emerald-500/50 hover:text-emerald-500 transition-all group">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">¿Necesitas ayuda?</span>
                    <HelpCircle size={18} />
                </button>
              </div>
              <div className="grid gap-4">
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all" placeholder="Empresa a suplantar durante el ataque (Ej: Microsoft, Amazon, Entidad Propia...)" />
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-sm font-bold outline-none focus:border-emerald-500 transition-all" placeholder="Email de aviso de ataques" />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input type="password" value={gmailPass} onChange={(e) => setGmailPass(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-sm font-mono outline-none focus:border-emerald-500 transition-all font-bold" placeholder="Clave de Aplicación (16 letras)" />
                </div>
              </div>
            </section>

            <section className="bg-[#16181d] border border-white/5 rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-6 text-emerald-500">
                <Mail size={16} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Plantilla Predeterminada</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {templates.map(t => (
                  <button key={t} onClick={() => setEmailTpl(t)} className={`w-full p-4 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${emailTpl === t ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-white/5 bg-white/5 text-white/20'}`}>{t.replace('_', ' ')}</button>
                ))}
              </div>
            </section>
            
            <button onClick={saveConfig} disabled={loading} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 mb-4 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18}/> : 'Guardar Configuración'}
            </button>

            <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={16} /> Cerrar Sesión Segura
            </button>
          </div>
        ) : (
          <div className="bg-[#16181d] border border-white/5 rounded-[2.5rem] p-10">
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <input placeholder="Nombre de la víctima" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-emerald-500 text-white" />
              <input placeholder="Email de la víctima" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-emerald-500 text-white" />
              <button onClick={addTarget} disabled={loading} className="bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} className="mr-2"/> Registrar Objetivo</>}
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {targets.map(t => (
                <div key={t.id} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] group hover:border-emerald-500/30 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{t.name}</p>
                    <p className="text-xs font-bold text-white/40">{t.email}</p>
                  </div>
                  <button onClick={() => deleteTarget(t.id)} className="p-2 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
