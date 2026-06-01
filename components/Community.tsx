
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Heart, MessageCircle, Share2, X, Send, Sparkles, MoreVertical, Play, Pause, Star, ShieldAlert, Loader2, Trash2, Flag } from 'lucide-react';
import { CommunityPost } from '../types';
import { moderateContent } from '../services/geminiService';
import { useFirebase } from './FirebaseProvider';
import { collection, onSnapshot, query, orderBy, limit, addDoc, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

type FilterType = 'recent' | 'liked' | 'following';

const Community: React.FC = () => {
  const { user, userProfile } = useFirebase();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('recent');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [followedAuthors, setFollowedAuthors] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState('');
  const [activeMoment, setActiveMoment] = useState<CommunityPost | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, []);
  
  const filteredPosts = useMemo(() => {
    let result = posts.filter(post => !reportedPosts.has(post.id));
    if (activeFilter === 'recent') {
      result.sort((a, b) => b.timestamp - a.timestamp);
    } else if (activeFilter === 'liked') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (activeFilter === 'following') {
      result = result.filter(post => followedAuthors.has(post.author) || post.author === 'Você' || post.author === 'Guia Essência');
      result.sort((a, b) => b.timestamp - a.timestamp);
    }
    return result;
  }, [posts, activeFilter, followedAuthors]);

  const moments = useMemo(() => posts.filter(post => Boolean(post.video)).slice(0, 12), [posts]);
  const currentAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || 'Buscador')}&background=random`;

  const toggleFollow = (authorName: string) => {
    setFollowedAuthors(prev => {
      const next = new Set(prev);
      if (next.has(authorName)) next.delete(authorName);
      else next.add(authorName);
      return next;
    });
  };

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
      console.error("Like error:", error);
    }
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 800);
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
        avatar: currentAvatar,
        content: newPost,
        likes: 0,
        comments: 0,
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'posts'), postData);
      setNewPost('');
    } catch (error) {
      console.error("Post error:", error);
    } finally {
      setIsModerating(false);
    }
  };

  const reportPost = (postId: string) => {
    setReportedPosts(prev => new Set(prev).add(postId));
    setActiveMenuId(null);
  };

  const deletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setActiveMenuId(null);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="store-page navigated-screen p-4 pb-32 max-w-2xl mx-auto space-y-10 animate-in fade-in">
      <header className="flex flex-col items-center text-center gap-2">
        <h2 className="text-4xl font-serif text-white tracking-tighter italic leading-tight">Tribo Essência</h2>
        <p className="text-magic-gold text-[10px] font-black uppercase tracking-[0.4em]">Portal da Tribo</p>
      </header>

      {/* Moments Bar */}
      <section className="flex items-center gap-5 overflow-x-auto no-scrollbar py-4 px-2">
        {moments.length === 0 && (
          <p className="text-[10px] text-ethereal-500 uppercase tracking-widest py-5">
            Nenhum video publicado pela comunidade.
          </p>
        )}
        {moments.map((moment) => (
          <div 
            key={moment.id} 
            onClick={() => {
              setActiveMoment(moment);
              setIsPaused(false);
            }}
            className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-magic-gold via-indigo-500 to-rose-400 group-hover:scale-110 transition-transform duration-500 shadow-lg">
              <div className="w-full h-full rounded-full border-2 border-ethereal-950 overflow-hidden">
                <img src={moment.avatar} className="w-full h-full object-cover" alt={moment.author} />
              </div>
            </div>
            <span className="text-[8px] font-black text-white uppercase tracking-widest group-hover:text-magic-gold transition-colors">{moment.author}</span>
          </div>
        ))}
      </section>

      {/* New Post Input */}
      <div className="glass-mystic p-8 rounded-[3rem] shadow-2xl border border-white/5 space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-magic-gold/5 blur-3xl pointer-events-none" />
        <div className="flex gap-4 mb-4">
          <img src={currentAvatar} className="w-12 h-12 rounded-full border-2 border-magic-gold/20 shadow-md" alt="Você" />
          <textarea
            className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-6 text-sm text-ethereal-100 focus:border-magic-gold/30 outline-none resize-none placeholder:text-ethereal-700 italic leading-relaxed transition-all"
            placeholder="O que pulsa em sua alma agora?"
            rows={2}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-6">
          <p className="text-[9px] font-black uppercase tracking-widest text-ethereal-600">Publicacao em texto</p>
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
          <div className="mt-4 p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <ShieldAlert size={18} className="text-rose-400 shrink-0" />
            <p className="text-[10px] text-rose-200 font-medium italic leading-relaxed">
              Sua emanação não pôde ser enviada: {moderationError}
            </p>
          </div>
        )}
      </div>

      {/* Feed Filters */}
      <div className="flex flex-wrap justify-center gap-3 px-1">
        {(['recent', 'liked', 'following'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${
              activeFilter === f 
                ? 'bg-magic-gold text-nature-950 border-magic-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                : 'bg-white/5 text-ethereal-500 border-white/5 hover:border-white/10'
            }`}
          >
            {f === 'recent' ? 'Recentes' : f === 'liked' ? 'Luz Intensa' : 'Minha Senda'}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-12">
        {filteredPosts.map(post => (
          <div key={post.id} className="glass-mystic rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden animate-in slide-up relative">
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-magic-gold/20 blur-md rounded-full" />
                  <img src={post.avatar} className="relative w-14 h-14 rounded-full object-cover border-2 border-magic-gold/30 shadow-lg" alt={post.author} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-serif text-lg text-white font-bold italic">{post.author}</h4>
                    {post.authorId !== user?.uid && (
                      <button 
                        onClick={() => toggleFollow(post.author)}
                        className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                          followedAuthors.has(post.author) 
                            ? 'bg-white text-nature-950' 
                            : 'bg-white/5 text-magic-gold border border-magic-gold/30 hover:bg-white/10'
                        }`}
                      >
                        {followedAuthors.has(post.author) ? 'Conectado' : 'Conectar'}
                      </button>
                    )}
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
                    {post.authorId === user?.uid ? (
                      <button 
                        onClick={() => deletePost(post.id)}
                        className="w-full px-6 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={16} /> Excluir
                      </button>
                    ) : (
                      <button 
                        onClick={() => reportPost(post.id)}
                        className="w-full px-6 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-magic-gold hover:bg-magic-gold/10 transition-all"
                      >
                        <Flag size={16} /> Reportar
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
                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-ethereal-600 hover:text-indigo-400 transition-all">
                  <MessageCircle size={24} /> {post.comments} <span className="hidden sm:inline">Vozes</span>
                </button>
              </div>
              <button className="text-ethereal-700 hover:text-white transition-all p-3"><Share2 size={22} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Moment Immersive Player */}
      {activeMoment && (
        <div className="safe-overlay fixed inset-0 z-[300] bg-black flex flex-col animate-in fade-in duration-500">
          <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-[310] bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <img src={activeMoment.avatar} className="w-12 h-12 rounded-full border-2 border-magic-gold shadow-lg" alt="" />
              <span className="text-white font-bold text-sm tracking-[0.3em] uppercase italic">{activeMoment.author}</span>
            </div>
            <button onClick={() => { setActiveMoment(null); setIsPaused(false); }} className="text-white p-3 hover:bg-white/10 rounded-full transition-all">
              <X size={32} />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center cursor-pointer" onClick={handleVideoToggle}>
            <video 
              ref={videoRef}
              src={activeMoment.video} 
              autoPlay 
              loop 
              playsInline
              className="w-full h-full object-cover max-w-lg"
            />
            
            {/* Spiritual Interaction Indicator */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700 ${showIndicator ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <div className="p-10 rounded-full bg-magic-gold/20 backdrop-blur-md border border-magic-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                {isPaused ? (
                  <Pause size={48} className="text-magic-gold animate-pulse" />
                ) : (
                  <Play size={48} className="text-magic-gold" />
                )}
              </div>
            </div>

            {/* Permanent Pause Indicator */}
            {isPaused && !showIndicator && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 pointer-events-none animate-in fade-in duration-700">
                  <Play size={40} className="text-white/80" />
               </div>
            )}
          </div>

          <div className="absolute bottom-0 inset-x-0 p-12 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-6 text-white text-center z-[310]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse">Toque no fluxo para contemplar ou repousar</p>
            <div className="flex justify-center gap-12">
               <button className="flex flex-col items-center gap-2 group">
                 <div className="p-5 rounded-full bg-white/10 group-active:scale-90 transition-transform group-hover:bg-magic-gold/20"><Heart size={28} /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Emanar Luz</span>
               </button>
               <button className="flex flex-col items-center gap-2 group">
                 <div className="p-5 rounded-full bg-white/10 group-active:scale-90 transition-transform group-hover:bg-indigo-400/20"><Share2 size={28} /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Partilhar</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
