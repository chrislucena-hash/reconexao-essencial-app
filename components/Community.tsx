import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Heart, MessageCircle, Share2, X, Send, Sparkles, Edit3, Save, MoreVertical, Camera, Star, ShieldAlert, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { CommunityPost, Comment, AppView } from '../types';
import { moderateContent } from '../services/geminiService';
import { useFirebase } from './FirebaseProvider';
import NextStepGuide from './NextStepGuide';
import { collection, onSnapshot, query, orderBy, limit, addDoc, deleteDoc, doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface CommunityProps {
  setView?: (view: AppView) => void;
  onResetJourney?: () => void;
}

const Community: React.FC<CommunityProps> = ({ setView, onResetJourney }) => {
  const { user, userProfile } = useFirebase();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState('');
  const [isModerating, setIsModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Custom Identity state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('Buscador');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [communityToast, setCommunityToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Interactive Comments / Messaging State
  const [activeCommentsPost, setActiveCommentsPost] = useState<CommunityPost | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentModerationError, setCommentModerationError] = useState<string | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setCommunityToast({ message, type });
    setTimeout(() => setCommunityToast(null), 4000);
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync tempName when userProfile is loaded
  useEffect(() => {
    if (userProfile?.name) {
      setTempName(userProfile.name);
    }
  }, [userProfile?.name]);

  // Firestore error handler
  const handleFirestoreError = (error: any, operationType: string, path: string) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: {
        userId: user?.uid,
        email: user?.email,
        isAnonymous: user?.isAnonymous
      }
    };
    console.error('[Egrégora Firestore Error]', errInfo);
  };

  useEffect(() => {
    setIsLoadingPosts(true);
    setPostsError(false);
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];
      setPosts(fetchedPosts);
      setIsLoadingPosts(false);
      setPostsError(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'posts');
      setIsLoadingPosts(false);
      setPostsError(true);
    });
    return () => unsubscribe();
  }, [user]);

  // Live subscription for post comments
  useEffect(() => {
    if (!activeCommentsPost) {
      setPostComments([]);
      return;
    }
    const commentsQuery = query(
      collection(db, 'posts', activeCommentsPost.id, 'comments'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setPostComments(fetchedComments);
    }, (error) => {
      handleFirestoreError(error, 'list_comments', `posts/${activeCommentsPost.id}/comments`);
    });
    return () => unsubscribe();
  }, [activeCommentsPost]);

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !user || !activeCommentsPost) return;

    setIsPostingComment(true);
    setCommentModerationError(null);

    try {
      const moderation = await moderateContent(newCommentText);
      if (!moderation.safe) {
        setCommentModerationError(moderation.reason || "Conteúdo inadequado detectado.");
        setIsPostingComment(false);
        return;
      }

      const commentData = {
        author: userProfile?.name || 'Buscador',
        authorId: user.uid,
        avatar: userProfile?.photoURL || '',
        text: newCommentText.trim(),
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'posts', activeCommentsPost.id, 'comments'), commentData);

      await updateDoc(doc(db, 'posts', activeCommentsPost.id), {
        comments: increment(1)
      });

      setNewCommentText('');
      triggerToast('Sua voz ecoou na comunidade!', 'success');
    } catch (error) {
      handleFirestoreError(error, 'create_comment', `posts/${activeCommentsPost.id}/comments`);
      triggerToast('Erro ao enviar voz na comunidade.', 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeCommentsPost) return;
    try {
      await deleteDoc(doc(db, 'posts', activeCommentsPost.id, 'comments', commentId));
      await updateDoc(doc(db, 'posts', activeCommentsPost.id), {
        comments: increment(-1)
      });
      triggerToast('Voz removida com sucesso.', 'success');
    } catch (error) {
      handleFirestoreError(error, 'delete_comment', `posts/${activeCommentsPost.id}/comments/${commentId}`);
      triggerToast('Não foi possível excluir a mensagem. Tente novamente.', 'error');
    }
  };
  
  const filteredPosts = useMemo(() => {
    return posts
      .filter(post => !hiddenPosts.has(post.id))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [posts, hiddenPosts]);

  const toggleLike = async (postId: string) => {
    const isLiked = likedPosts.has(postId);
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      await updateDoc(doc(db, 'posts', postId), {
        likes: increment(isLiked ? -1 : 1)
      });
    } catch (error) {
      handleFirestoreError(error, 'update_like', `posts/${postId}`);
      setLikedPosts(prev => {
        const next = new Set(prev);
        if (isLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      triggerToast('Não foi possível registrar sua reação. Tente novamente.', 'error');
    }
  };

  // Canvas image compression helper
  const compressImage = (base64Str: string, maxWidth = 150, maxHeight = 150): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  // Profile Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerToast("A imagem deve ter no máximo 5MB.", 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const rawBase64 = reader.result as string;
      setIsUploadingAvatar(true);
      try {
        const compressedBase64 = await compressImage(rawBase64, 150, 150);
        const userDocRef = doc(db, 'users', user.uid);
        // Using setDoc with merge to safely support profiles that might not have a document yet
        await setDoc(userDocRef, { photoURL: compressedBase64 }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, 'set_avatar', `users/${user.uid}`);
        triggerToast("Erro ao salvar foto de identificação.", 'error');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Name Change Handler
  const handleSaveName = async () => {
    if (!tempName.trim() || !user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { name: tempName.trim() }, { merge: true });
      setIsEditingName(false);
      triggerToast('Nome atualizado.');
    } catch (error) {
      handleFirestoreError(error, 'set_name', `users/${user.uid}`);
      triggerToast('Não foi possível atualizar o nome. Tente novamente.', 'error');
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    
    setIsModerating(true);
    setModerationError(null);
    
    try {
      const moderation = await moderateContent(newPost);
      if (!moderation.safe) {
        setModerationError(moderation.reason || "Conteúdo inadequado detectado.");
        setIsModerating(false);
        return;
      }

      const postData = {
        author: userProfile?.name || 'Buscador',
        authorId: user.uid,
        avatar: userProfile?.photoURL || '',
        content: newPost,
        likes: 0,
        comments: 0,
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'posts'), postData);
      setNewPost('');
      triggerToast('Publicação enviada.');
    } catch (error) {
      handleFirestoreError(error, 'create_post', 'posts');
      triggerToast('Não foi possível publicar. Tente novamente.', 'error');
    } finally {
      setIsModerating(false);
    }
  };

  const hidePost = (postId: string) => {
    setHiddenPosts(prev => new Set(prev).add(postId));
    setActiveMenuId(null);
    triggerToast('Publicação ocultada nesta sessão.');
  };

  const handleSharePost = async (post: CommunityPost) => {
    const text = `${post.content}\n\n— Reconexão Essencial`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Reconexão Essencial', text });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const field = document.createElement('textarea');
        field.value = text;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      triggerToast('Texto da publicação copiado para compartilhar.');
    } catch {
      triggerToast('Compartilhamento indisponível neste dispositivo.', 'error');
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setActiveMenuId(null);
    } catch (error) {
      handleFirestoreError(error, 'delete_post', `posts/${postId}`);
      triggerToast('Não foi possível excluir a publicação. Tente novamente.', 'error');
    }
  };

  return (
    <div className="p-4 pt-safe pb-safe-nav max-w-2xl mx-auto space-y-10 animate-in fade-in">
      <header className="flex flex-col items-center text-center gap-2">
        <h2 className="text-4xl font-serif text-reconexao-navy tracking-tighter italic leading-tight">Egrégora</h2>
        <p className="text-ethereal-300 text-xs italic max-w-lg leading-relaxed">
          Junte-se a outras centelhas divinas para aumentar a nossa egrégora. Troquem informações para ajudarem uns aos outros. Somos todos um.
        </p>
      </header>

      {/* New Post Input */}
      <div className="glass-mystic p-6 sm:p-8 rounded-[3rem] shadow-2xl border border-white/5 space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-magic-gold/5 blur-3xl pointer-events-none" />
        
        {/* User Identity Setup */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <button type="button" aria-label="Alterar foto de perfil" className="relative group cursor-pointer shrink-0" onClick={() => avatarInputRef.current?.click()}>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-magic-gold/40 shadow-lg relative bg-white/5 flex items-center justify-center">
              {isUploadingAvatar ? (
                <Loader2 size={20} className="animate-spin text-magic-gold" />
              ) : (
                userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} className="w-full h-full object-cover transition-all group-hover:scale-105" alt="Sua foto" />
                ) : (
                  <span className="text-xl font-bold text-magic-gold" aria-label="Sem foto de perfil">
                    {(userProfile?.name || 'B').charAt(0).toLocaleUpperCase('pt-BR')}
                  </span>
                )
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <Camera size={14} className="text-white" />
            </div>
          </button>
          
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-black text-magic-gold uppercase tracking-[0.2em]">Sua Identidade Sagrada</p>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)} 
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs text-white focus:border-magic-gold/30 outline-none w-full max-w-[150px]" 
                  placeholder="Nome de Alma"
                />
                <button onClick={handleSaveName} className="p-1.5 bg-magic-gold/15 text-magic-gold rounded-lg hover:bg-magic-gold/25 transition-all shrink-0"><Save size={12} /></button>
                <button onClick={() => setIsEditingName(false)} className="p-1.5 bg-white/5 text-white/50 rounded-lg hover:bg-white/10 transition-all shrink-0"><X size={12} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <h4 className="font-serif text-base sm:text-lg text-white font-bold italic truncate">{userProfile?.name || 'Buscador'}</h4>
                <button 
                  onClick={() => { setTempName(userProfile?.name || 'Buscador'); setIsEditingName(true); }} 
                  className="p-1 text-ethereal-400 hover:text-magic-gold transition-colors shrink-0"
                  title="Editar nome"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
            <p className="text-[8px] font-black text-ethereal-500 uppercase tracking-widest mt-0.5">Toque na foto para alterá-la</p>
          </div>
          
          <input 
            type="file" 
            ref={avatarInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Textarea Input */}
        <div className="flex gap-4">
          <textarea
            className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-5 sm:p-6 text-sm text-ethereal-100 focus:border-magic-gold/30 outline-none resize-none placeholder:text-ethereal-700 italic leading-relaxed transition-all"
            placeholder="O que pulsa em sua alma agora?"
            rows={2}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
        </div>

        <div className="flex justify-end items-center border-t border-white/5 pt-6">
          <button 
            onClick={handlePost}
            disabled={!newPost.trim() || isModerating}
            className="bg-white text-nature-950 px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(255,255,255,0.05)] hover:scale-105 active:scale-95 disabled:opacity-20 transition-all flex items-center gap-3 overflow-hidden relative"
          >
            {isModerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Moderando...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Emanar</span>
              </>
            )}
          </button>
        </div>
        {moderationError && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2" role="alert">
            <ShieldAlert size={18} className="text-rose-700 shrink-0" />
            <p className="text-[10px] text-rose-700 font-medium italic leading-relaxed">
              Sua emanação não pôde ser enviada: {moderationError}
            </p>
          </div>
        )}
      </div>


      {/* Posts List */}
      <div className="space-y-12">
        {isLoadingPosts && (
          <div className="glass-mystic rounded-3xl border border-white/10 p-8 text-center text-ethereal-300 text-sm" role="status">
            Carregando publicações...
          </div>
        )}
        {postsError && (
          <div className="glass-mystic rounded-3xl border border-rose-200 p-8 text-center text-rose-700 text-sm" role="alert">
            Não foi possível carregar a comunidade. Verifique sua conexão e tente novamente.
          </div>
        )}
        {!isLoadingPosts && !postsError && filteredPosts.length === 0 && (
          <div className="glass-mystic rounded-3xl border border-white/10 p-8 text-center text-ethereal-300 text-sm">
            Ainda não há publicações para mostrar.
          </div>
        )}
        {filteredPosts.map(post => (
          <div key={post.id} className="glass-mystic rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden animate-in slide-up relative">
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-magic-gold/20 blur-md rounded-full" />
                  {post.avatar ? (
                    <img src={post.avatar} className="relative w-14 h-14 rounded-full object-cover border-2 border-magic-gold/30 shadow-lg" alt={post.author} />
                  ) : (
                    <span className="relative w-14 h-14 rounded-full border-2 border-magic-gold/30 bg-white/10 flex items-center justify-center text-magic-gold font-bold text-xl" aria-label={post.author}>
                      {post.author?.charAt(0).toLocaleUpperCase('pt-BR') || 'B'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-serif text-lg text-white font-bold italic">{post.author}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] text-ethereal-500 font-black uppercase tracking-[0.2em] mt-1">
                    <Star size={10} className="text-magic-gold" /> {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                  className="p-3 text-ethereal-600 hover:text-white rounded-full transition-all"
                >
                  <MoreVertical size={22} />
                </button>
                {activeMenuId === post.id && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-mystic border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in duration-200">
                    {post.authorId === user?.uid || post.author === 'Você' ? (
                      <button 
                        onClick={() => deletePost(post.id)}
                        className="w-full px-6 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={16} /> Excluir
                      </button>
                    ) : (
                      <button 
                        onClick={() => hidePost(post.id)}
                        className="w-full px-6 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-magic-gold hover:bg-magic-gold/10 transition-all"
                      >
                        <X size={16} /> Ocultar nesta sessão
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-10 pb-6">
              <p className="text-ethereal-100 text-sm leading-relaxed italic font-light">"{post.content}"</p>
            </div>

            {post.image && (
              <div className="px-4">
                <img src={post.image} className="w-full h-96 object-cover rounded-[3rem] shadow-2xl border border-white/5" alt="Conteúdo" />
              </div>
            )}

            {post.video && (
              <div className="px-4">
                <div className="relative rounded-[3rem] overflow-hidden bg-nature-950 group shadow-2xl border border-white/5">
                  <video src={post.video} controls className="w-full h-96 object-cover" />
                </div>
              </div>
            )}

            {(post.image || post.video) && post.caption && (
              <div className="px-10 pt-6 flex items-start gap-3">
                <Sparkles size={16} className="text-magic-gold mt-1 shrink-0" />
                <p className="text-xs text-ethereal-400 italic font-medium leading-relaxed">"{post.caption}"</p>
              </div>
            )}

            <div className="p-8 mt-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex gap-8">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${likedPosts.has(post.id) ? 'text-magic-gold scale-110' : 'text-ethereal-600 hover:text-magic-gold'}`}
                >
                  <Heart size={24} fill={likedPosts.has(post.id) ? "currentColor" : "none"} /> {post.likes} <span className="hidden sm:inline">Luz</span>
                </button>
                <button 
                  onClick={() => setActiveCommentsPost(post)}
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-ethereal-600 hover:text-indigo-400 transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle size={24} /> {post.comments} <span className="hidden sm:inline">Vozes</span>
                </button>
              </div>
              <button onClick={() => handleSharePost(post)} className="text-ethereal-700 hover:text-white transition-all p-3" title="Compartilhar publicação" aria-label="Compartilhar publicação"><Share2 size={22} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Comments Modal (Troca de Mensagens da Tribo) */}
      {activeCommentsPost && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div 
            className="w-full max-w-xl mx-auto glass-mystic border-t sm:border border-reconexao-navy/10 rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-magic-gold/10 text-magic-gold border border-magic-gold/20">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white font-bold italic">Vozes da Tribo</h3>
                  <p className="text-[9px] font-black text-magic-gold uppercase tracking-widest">
                    Postagem de {activeCommentsPost.author}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveCommentsPost(null); setCommentModerationError(null); }}
                className="p-2.5 text-ethereal-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Original Post Snippet */}
            <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 shrink-0">
              <p className="text-xs text-ethereal-300 italic line-clamp-2">"{activeCommentsPost.content}"</p>
            </div>

            {/* Comments Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {postComments.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Sparkles size={32} className="text-magic-gold/40 mx-auto animate-pulse" />
                  <p className="text-xs font-serif italic text-ethereal-400">Seja a primeira voz a ecoar nesta emanação...</p>
                </div>
              ) : (
                postComments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3.5 group animate-in slide-up duration-200">
                    {c.avatar ? (
                      <img src={c.avatar} className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0 mt-0.5 shadow-md" alt={c.author} />
                    ) : (
                      <span className="w-9 h-9 rounded-full border border-white/10 bg-white/10 shrink-0 mt-0.5 flex items-center justify-center text-magic-gold font-bold" aria-label={c.author}>
                        {c.author?.charAt(0).toLocaleUpperCase('pt-BR') || 'B'}
                      </span>
                    )}
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white font-serif italic">{c.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black text-ethereal-500 uppercase tracking-widest">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {(c.authorId === user?.uid || userProfile?.role === 'admin') && (
                            <button 
                              onClick={() => handleDeleteComment(c.id)}
                              className="p-1 text-ethereal-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                              title="Excluir mensagem"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-ethereal-100 italic leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Moderation Error Alert */}
            {commentModerationError && (
              <div className="px-6 py-3 bg-rose-50 border-t border-rose-200 flex items-center gap-2 text-rose-700 text-xs italic shrink-0" role="alert">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{commentModerationError}</span>
              </div>
            )}

            {/* New Comment Input Field */}
            <div className="p-4 sm:p-6 pb-safe border-t border-reconexao-navy/10 bg-reconexao-bg shrink-0">
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                  placeholder="Escreva sua mensagem para a tribo..."
                  className="flex-1 min-w-0 bg-white border border-reconexao-navy/10 rounded-2xl px-5 py-3.5 text-xs text-reconexao-navy placeholder:text-ethereal-600 outline-none focus:border-magic-gold/40 transition-all italic"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newCommentText.trim() || isPostingComment}
                  className="p-3.5 bg-magic-gold text-nature-950 rounded-2xl hover:bg-magic-gold/90 disabled:opacity-30 transition-all active:scale-90 shrink-0 font-bold"
                  title="Enviar Voz"
                >
                  {isPostingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {setView && (
        <NextStepGuide 
          currentStepName="Portal da Egrégora"
          stepNumber={7}
          totalSteps={7}
          nextStepName="Portal do Início"
          nextStepLabel="Recomeçar Ciclo no Início"
          onNavigate={() => {
            if (onResetJourney) {
              setShowResetConfirm(true);
            } else {
              setView(AppView.DASHBOARD);
            }
          }}
          message="Você completou a jornada pelos 7 Portais de Luz! O ciclo se renova continuamente. Siga para o Início para vivenciar o novo dia."
        />
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] bg-ethereal-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-mystic border border-magic-gold/30 w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-magic-gold/10 rounded-full flex items-center justify-center text-magic-gold border border-magic-gold/20">
              <Sparkles size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-white italic">Recomeçar Novo Ciclo?</h3>
              <p className="text-xs text-ethereal-200 leading-relaxed">
                Ao recomeçar o ciclo, o progresso e os registros do diário serão apagados. Sua conta e as publicações da comunidade permanecerão disponíveis.
              </p>
            </div>

            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={() => {
                  setShowResetConfirm(false);
                  try {
                    sessionStorage.setItem('cycle_reset_notice', 'true');
                  } catch (e) {}
                  if (onResetJourney) {
                    onResetJourney();
                  }
                }}
                className="w-full bg-magic-gold text-nature-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-magic-gold/90 transition-colors"
              >
                Sim, Recomeçar Ciclo
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="w-full bg-white/5 text-white/60 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {communityToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in slide-up duration-300">
          <div className={`glass-mystic p-5 rounded-3xl border backdrop-blur-xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] ${
            communityToast.type === 'error' ? 'border-rose-500/30 bg-rose-500/10' : 'border-aura-emerald/30 bg-aura-emerald/10'
          }`}>
            <div className={`p-2 rounded-xl ${communityToast.type === 'error' ? 'bg-rose-500/20 text-rose-500' : 'bg-aura-emerald/20 text-aura-emerald'}`}>
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-[10px] font-black uppercase tracking-widest ${communityToast.type === 'error' ? 'text-rose-400' : 'text-aura-emerald'}`}>
                {communityToast.type === 'error' ? 'Aviso do Portal' : 'Sucesso'}
              </p>
              <p className="text-xs text-ethereal-100 italic leading-snug">{communityToast.message}</p>
            </div>
            <button 
              onClick={() => setCommunityToast(null)}
              className="text-ethereal-500 hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
