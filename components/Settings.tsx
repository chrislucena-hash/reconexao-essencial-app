
import React, { useState } from 'react';
import { UserProfile, AppView } from '../types';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  ChevronRight, 
  ArrowLeft,
  Info,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  setView: (view: AppView) => void;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, onUpdateProfile, setView }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    name: userProfile.name,
    email: userProfile.email || '',
    phone: userProfile.phone || ''
  });

  const handleSave = () => {
    onUpdateProfile(tempProfile);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja reiniciar sua jornada? Todos os dados serão perdidos.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair de sua conta?')) {
      try {
        await signOut(auth);
        setView(AppView.WELCOME);
      } catch (err) {
        console.error("Erro ao deslogar:", err);
      }
    }
  };

  return (
    <div className="store-page navigated-screen min-h-screen pb-40 p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => setView(AppView.DASHBOARD)}
          className="p-3 bg-white/5 rounded-2xl text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-magic-gold text-[10px] font-black uppercase tracking-[0.4em]">Configurações</p>
          <h2 className="text-3xl font-serif text-white italic">Seu Portal</h2>
        </div>
      </header>

      <section className="space-y-4">
        <div className="glass-mystic p-6 rounded-[2.5rem] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-aura-violet/20 rounded-2xl flex items-center justify-center text-aura-violet">
                <User size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">Perfil do Buscador</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Informações da Conta</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-magic-gold text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">Nome de Alma</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-magic-gold/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="email"
                  disabled={!isEditing}
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-magic-gold/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">Celular</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="tel"
                  disabled={!isEditing}
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-magic-gold/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {isEditing && (
              <button 
                onClick={handleSave}
                className="w-full bg-magic-gold text-nature-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Salvar Alterações
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => setShowAbout(true)}
            className="w-full glass-mystic p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-aura-indigo/20 rounded-xl flex items-center justify-center text-aura-indigo">
                <Info size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">Sobre o App</h4>
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Termos e Isenção</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full glass-mystic p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-magic-gold/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-magic-gold/10 rounded-xl flex items-center justify-center text-magic-gold">
                <LogOut size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">Sair da Conta</h4>
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Fazer logout desta sessão</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all animate-pulse" />
          </button>

          <button 
            onClick={handleReset}
            className="w-full glass-mystic p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                <LogOut size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-rose-500">Reiniciar Jornada</h4>
                <p className="text-[9px] text-rose-500/40 uppercase tracking-widest">Limpar todos os dados</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-rose-500/20 group-hover:text-rose-500 transition-all" />
          </button>
        </div>
      </section>

      <AnimatePresence>
        {showAbout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="safe-overlay fixed inset-0 z-[100] bg-ethereal-950/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-mystic border border-white/10 w-full max-w-md rounded-[3rem] p-8 flex flex-col space-y-6 shadow-2xl max-h-[80vh]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-magic-gold" />
                  <h3 className="text-xl font-serif text-white italic">Sobre o App</h3>
                </div>
                <button 
                  onClick={() => setShowAbout(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <ArrowLeft size={20} className="text-white/40" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 text-xs text-ethereal-200 leading-relaxed italic">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white not-italic uppercase tracking-widest">AVISO DE ISENÇÃO DE RESPONSABILIDADE MÉDICA E TERMOS DE USO</h4>
                  <p>O aplicativo Reconexão Essencial é uma plataforma dedicada ao autoconhecimento, desenvolvimento pessoal e espiritualidade. Ao utilizar este aplicativo, você concorda com os seguintes pontos:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-magic-gold font-bold not-italic uppercase tracking-tighter text-[10px] mb-1">Caráter Educativo e Espiritual</p>
                      <p>Todo o conteúdo, incluindo testes de sensibilidade (glúten/caseína), mapeamento de sintomas e sugestões nutricionais, tem finalidade exclusivamente educativa e de expansão da consciência. Não constitui diagnóstico médico, prescrição dietética ou tratamento de saúde.</p>
                    </div>
                    
                    <div>
                      <p className="text-magic-gold font-bold not-italic uppercase tracking-tighter text-[10px] mb-1">Não Substituição Profissional</p>
                      <p>As ferramentas aqui disponibilizadas não substituem a consulta com médicos, nutricionistas, psicólogos ou outros profissionais de saúde. Nunca ignore orientações médicas profissionais em razão de informações lidas neste app.</p>
                    </div>
                    
                    <div>
                      <p className="text-magic-gold font-bold not-italic uppercase tracking-tighter text-[10px] mb-1">Responsabilidade do Usuário</p>
                      <p>A decisão de implementar mudanças na dieta (como a retirada de glúten ou leite) ou realizar práticas de jejum e purificação é de inteira responsabilidade do usuário. Recomendamos acompanhamento profissional para qualquer alteração clínica.</p>
                    </div>
                    
                    <div>
                      <p className="text-magic-gold font-bold not-italic uppercase tracking-tighter text-[10px] mb-1">Limitação de Resultados</p>
                      <p>O processo de "autocura" mencionado refere-se à busca por equilíbrio emocional e espiritual, e os resultados podem variar de pessoa para pessoa.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 text-center space-y-4">
                  <a 
                    href="https://www.notion.so/POL-TICA-DE-PRIVACIDADE-APP-RECONEX-O-ESSENCIAL-31eb9d89692a801e947efdd664aaa46d" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-magic-gold text-[10px] font-black uppercase tracking-widest underline block"
                  >
                    Política de Privacidade
                  </a>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Versão 1.0.0 • Reconexão Essencial</p>
                </div>
              </div>

              <button 
                onClick={() => setShowAbout(false)}
                className="w-full bg-white/5 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="pt-4 border-t border-white/5">
        <div className="glass-mystic p-6 rounded-[2.5rem] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 bg-magic-gold/20 rounded-2xl flex items-center justify-center text-magic-gold mx-auto">
            <Mail size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold">Suporte e Dúvidas</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Estamos aqui para ajudar</p>
          </div>
          <a 
            href="mailto:reconexaoessencial.br@gmail.com"
            className="inline-block w-full bg-white/5 text-magic-gold py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-magic-gold/20"
          >
            reconexaoessencial.br@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
};

export default Settings;
