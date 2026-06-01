import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface DisclaimerScreenProps {
  onAccept: (email: string) => void | Promise<void>;
}

const DisclaimerScreen: React.FC<DisclaimerScreenProps> = ({ onAccept }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Sign In only
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await onAccept(email.trim());
    } catch (err: any) {
      console.error("Auth error:", err);
      let errMsg = 'Erro ao processar autenticação.';
      if (err?.code === 'auth/invalid-email') {
        errMsg = 'E-mail inválido.';
      } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        errMsg = 'Credenciais incorretas ou usuário não cadastrado.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="safe-screen p-4 sm:p-6 flex flex-col items-center justify-center bg-ethereal-950 text-white animate-in fade-in duration-700">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 sm:space-y-8"
      >
        <header className="text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-magic-gold/10 rounded-full flex items-center justify-center mx-auto border border-magic-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
            <Shield size={32} className="text-magic-gold" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif italic text-white">Acesso à Jornada</h2>
          <p className="text-magic-gold text-[10px] font-black uppercase tracking-[0.3em]">Portal de Acesso Sagrado</p>
        </header>

        {/* Scrollable Terms / Disclaimer */}
        <div className="glass-mystic p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 space-y-6 max-h-[22vh] sm:max-h-[25vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4 text-[11px] sm:text-xs text-ethereal-200 leading-relaxed italic">
            <h3 className="text-xs sm:text-sm font-bold text-white not-italic">AVISO DE ISENÇÃO DE RESPONSABILIDADE MÉDICA</h3>
            <p>O aplicativo Reconexão Essencial é uma plataforma dedicada ao autoconhecimento e espiritualidade. Ao acessar o sistema, você concorda que:</p>
            
            <div className="space-y-3">
              <p><strong>Caráter Educativo:</strong> Todo o conteúdo, mapeamento de sintomas e sugestões têm finalidade exclusivamente educativa. Não constitui aconselhamento ou tratamento médico.</p>
              <p><strong>Não Substituição Médica:</strong> As práticas sugeridas não substituem acompanhamento profissional de médicos, nutricionistas ou terapeutas qualificados.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-magic-gold/50" size={18} />
              <input 
                type="email" 
                placeholder="Seu e-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-magic-gold/50 transition-all text-white placeholder-white/30"
                disabled={loading}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-magic-gold/50" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Sua senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm outline-none focus:border-magic-gold/50 transition-all text-white placeholder-white/30"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-magic-gold/50 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-center text-ethereal-400 italic">
            Utilize as credenciais de acesso fornecidas para iniciar sua jornada.
          </p>

          {error && <p className="text-rose-400 text-[10px] text-center font-bold uppercase tracking-widest animate-pulse">{error}</p>}

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white text-nature-950 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-nature-950" />
            ) : (
              <>
                Entrar na Jornada <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DisclaimerScreen;
