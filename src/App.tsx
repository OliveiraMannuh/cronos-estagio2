/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  Loader2,
  Save,
  X,
  Edit3,
  Image as ImageIcon,
  LogOut,
  LogIn,
  Download,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InternshipEntry, InternshipStats } from './types';
import { GoogleGenAI } from "@google/genai";
import { auth, db } from './firebase';
import { exportToDocx } from './utils/exportUtils';
import { LandingPage } from './components/LandingPage';
import { FullGallery } from './components/FullGallery';
import { SobrePage } from './components/SobrePage';
import { InstituicaoPage } from './components/InstituicaoPage';
import { ContatoPage } from './components/ContatoPage';
import { PredictionArea } from './components/PredictionArea';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import * as GoogleDocsService from './services/googleDocsService';

const GOAL_HOURS = 36;
const GOAL_MINUTES = GOAL_HOURS * 60;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

interface UserSettings {
  googleDocId?: string;
  autoSyncEnabled: boolean;
}

const buildEntriesSyncHash = (entries: InternshipEntry[]): string => {
  const normalized = [...entries]
    .sort((a, b) => {
      const left = `${a.date}|${a.startTime}|${a.endTime}|${a.durationMinutes}|${a.reportText || ''}`;
      const right = `${b.date}|${b.startTime}|${b.endTime}|${b.durationMinutes}|${b.reportText || ''}`;
      return left.localeCompare(right);
    })
    .map((entry) => ({
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      durationMinutes: entry.durationMinutes,
      reportText: entry.reportText || '',
    }));

  const source = JSON.stringify(normalized);
  let hash = 5381;

  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) + hash) + source.charCodeAt(i);
    hash |= 0;
  }

  return (hash >>> 0).toString(16);
};

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Gemini safely
let aiInstance: GoogleGenAI | null = null;
const getAi = () => {
  if (aiInstance) return aiInstance;
  
  const env = (import.meta as any).env as Record<string, string | undefined>;
  const rawApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);
  const apiKey = rawApiKey?.trim().replace(/^['\"]|['\"]$/g, "");
  const looksLikePlaceholder = !!apiKey && /^(MY_|YOUR_|SUA_|EXAMPLE_|CHAVE_|KEY_)/i.test(apiKey);
  // Verifica se a chave existe e não é uma string vazia ou "undefined" vinda do build
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10 || looksLikePlaceholder) {
    return null;
  }
  
  try {
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (e) {
    console.error("Erro ao criar instância do Gemini:", e);
    return null;
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(sessionStorage.getItem('google_access_token'));
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [entries, setEntries] = useState<InternshipEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({ autoSyncEnabled: false });
  const [dashboardTab, setDashboardTab] = useState<'registros' | 'predicao'>('predicao');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [reportText, setReportText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // Viewing/Editing State
  const [viewingEntry, setViewingEntry] = useState<InternshipEntry | null>(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [tempReportText, setTempReportText] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [tempStartTime, setTempStartTime] = useState('');
  const [tempEndTime, setTempEndTime] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        // Load settings from Firestore
        try {
          const settingsDoc = await getDoc(doc(db, 'settings', currentUser.uid));
          if (settingsDoc.exists()) {
            setSettings(settingsDoc.data() as UserSettings);
          }
        } catch (error) {
          const errorCode = (error as { code?: string })?.code;
          if (errorCode !== 'permission-denied') {
            console.error('Erro ao carregar configurações do usuário:', error);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    
    if (!user) {
      setEntries([]);
      return;
    }

    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries: InternshipEntry[] = [];
      snapshot.forEach((doc) => {
        fetchedEntries.push({ id: doc.id, ...doc.data() } as InternshipEntry);
      });
      // Ordenação feita no cliente para evitar a necessidade de criar um Índice Composto (Composite Index) no Firestore
      fetchedEntries.sort((a, b) => b.date.localeCompare(a.date));
      setEntries(fetchedEntries);
      setLoadError(null);
    }, (error) => {
      setLoadError("Erro de permissão no banco de dados. Verifique as configurações de segurança.");
      handleFirestoreError(error, OperationType.GET, 'entries');
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!isAuthReady) return;

    const publicPaths = ['/', '/galeria', '/sobre', '/instituicao', '/contato'];

    if (user && location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!user && location.pathname === '/dashboard') {
      navigate('/', { replace: true });
      return;
    }

    if (!user && !publicPaths.includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  }, [user, isAuthReady, location.pathname, navigate]);

  const stats = useMemo((): InternshipStats => {
    const totalMinutes = entries.reduce((acc, entry) => acc + entry.durationMinutes, 0);
    const remainingMinutes = Math.max(0, GOAL_MINUTES - totalMinutes);
    const progressPercentage = Math.min(100, (totalMinutes / GOAL_MINUTES) * 100);

    return {
      totalMinutes,
      goalMinutes: GOAL_MINUTES,
      remainingMinutes,
      progressPercentage
    };
  }, [entries]);

  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const duration = calculateDuration(startTime, endTime);
      
      const newEntry = {
        userId: user.uid,
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        reportText: reportText.trim() || null
      };

      await addDoc(collection(db, 'entries'), newEntry);
      
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'entries');
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setReportText('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('08:00');
    setEndTime('12:00');
  };

  const removeEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'entries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `entries/${id}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const ai = getAi();
        if (!ai) {
          throw new Error("Serviço de IA não configurado. Defina uma chave válida em VITE_GEMINI_API_KEY (ou GEMINI_API_KEY) no ambiente e reinicie o app.");
        }
        const base64Data = (reader.result as string).split(',')[1];
        
        const response = await ai.models.generateContent({
          model: "models/gemini-3-flash-preview",
          contents: {
            parts: [
              { text: "Você é um assistente acadêmico especializado em Letras. Transcreva fielmente o texto desta imagem de relatório de estágio. Se houver partes manuscritas, tente decifrar pelo contexto. Retorne apenas o texto transcrito, de forma organizada." },
              { inlineData: { mimeType: file.type, data: base64Data } }
            ]
          }
        });

        const text = response.text;
        if (text) {
          if (viewingEntry) {
            setTempReportText(prev => prev ? prev + "\n\n" + text : text);
            setIsEditingReport(true);
          } else {
            setReportText(prev => prev ? prev + "\n\n" + text : text);
          }
        }
      } catch (error) {
        console.error("Erro na transcrição:", error);
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("API_KEY_INVALID") || message.includes("API key not valid")) {
          alert("A chave Gemini está inválida. Configure uma chave real em VITE_GEMINI_API_KEY (ou GEMINI_API_KEY) e reinicie o servidor.");
        } else if (message.includes("Serviço de IA não configurado")) {
          alert("A transcrição está desativada: configure VITE_GEMINI_API_KEY em .env.local e reinicie o servidor.");
        } else {
          alert("Não foi possível transcrever a imagem. Verifique sua conexão ou tente outra foto.");
        }
      } finally {
        setIsTranscribing(false);
        // Limpar o input para permitir subir a mesma foto se necessário
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      alert("Erro ao ler o arquivo de imagem.");
      setIsTranscribing(false);
    };

    reader.readAsDataURL(file);
  };

  const saveEditedReport = async () => {
    if (!viewingEntry) return;
    
    try {
      const duration = calculateDuration(tempStartTime, tempEndTime);
      
      const updatedData = { 
        reportText: tempReportText || null,
        date: tempDate,
        startTime: tempStartTime,
        endTime: tempEndTime,
        durationMinutes: duration
      };

      await updateDoc(doc(db, 'entries', viewingEntry.id), updatedData);
      
      setViewingEntry({ ...viewingEntry, ...updatedData });
      setIsEditingReport(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `entries/${viewingEntry.id}`);
    }
  };

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  const handleLogin = async (): Promise<string | null> => {
    if (isLoggingIn) return null;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/documents');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        setAccessToken(token);
        sessionStorage.setItem('google_access_token', token);
        return token;
      }

      return null;
    } catch (error: any) {
      // Ignore cancelled popup errors to improve UX and avoid the console error reported by the user
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log("Login popup closed or cancelled.");
      } else {
        console.error("Erro ao fazer login:", error);
        alert(`Erro ao fazer login: ${error.message || "Verifique se o seu domínio está autorizado no console do Firebase."}`);
      }
      return null;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const getOrCreateGoogleDocId = async (token: string): Promise<string> => {
    let docId = settings.googleDocId;

    if (!docId) {
      docId = await GoogleDocsService.findDocByTitle(token, 'Cronos Estágio - Relatórios');
    }
    if (!docId) {
      docId = await GoogleDocsService.createDoc(token, 'Cronos Estágio - Relatórios');
    }

    if (!docId) {
      throw new Error('Não foi possível criar ou localizar o Google Docs.');
    }

    if (docId !== settings.googleDocId && user) {
      const newSettings = { ...settings, autoSyncEnabled: true, googleDocId: docId };
      setSettings(newSettings);
      try {
        await setDoc(doc(db, 'settings', user.uid), newSettings);
      } catch (error) {
        console.warn('Não foi possível salvar settings no Firestore. Mantendo estado local.', error);
      }
    }

    return docId;
  };

  const syncEntriesIfNeeded = async (token: string, entriesToSync: InternshipEntry[]) => {
    const docId = await getOrCreateGoogleDocId(token);
    const syncHash = buildEntriesSyncHash(entriesToSync);
    const docText = await GoogleDocsService.getDocText(token, docId);
    const needsSync = !GoogleDocsService.hasSyncHash(docText, syncHash);

    if (needsSync) {
      await GoogleDocsService.syncAllEntriesToDoc(token, docId, entriesToSync, { syncHash });
    }

    return { docId, needsSync };
  };

  const syncToGoogleDocs = async (entriesToSync: InternshipEntry[]) => {
    if (!settings.autoSyncEnabled || !accessToken) return;

    try {
      setIsSyncing(true);
      await syncEntriesIfNeeded(accessToken, entriesToSync);
    } catch (error) {
      console.error("Erro ao sincronizar com Google Docs:", error);
      // We don't block the user if sync fails, but we could notify them.
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleSync = async () => {
    if (!user) {
      alert("Faça login para sincronizar com Google Docs.");
      return;
    }

    // Open the tab from user gesture to minimize popup blocking.
    const docsTab = window.open('about:blank', '_blank');

    setIsSyncing(true);

    try {
      let token = accessToken;

      if (!token) {
        token = await handleLogin();
      }

      if (!token) {
        if (docsTab && !docsTab.closed) docsTab.close();
        alert("Não foi possível autorizar o acesso ao Google Docs.");
        return;
      }

      const { docId, needsSync } = await syncEntriesIfNeeded(token, entries);

      const newSettings = { ...settings, autoSyncEnabled: true, googleDocId: docId };
      setSettings(newSettings);
      try {
        await setDoc(doc(db, 'settings', user.uid), newSettings);
      } catch (error) {
        console.warn('Não foi possível salvar settings no Firestore. Mantendo estado local.', error);
      }

      const googleDocUrl = `https://docs.google.com/document/d/${docId}/edit`;
      if (docsTab && !docsTab.closed) {
        docsTab.location.href = googleDocUrl;
      } else {
        window.open(googleDocUrl, '_blank', 'noopener,noreferrer');
      }

      alert(
        needsSync
          ? 'Relatório atualizado e aberto no Google Docs.'
          : 'Nenhuma atualização pendente. Documento aberto no Google Docs.'
      );
    } catch (error) {
      console.error('Erro ao sincronizar com Google Docs:', error);
      if (docsTab && !docsTab.closed) docsTab.close();
      alert('Falha ao sincronizar e abrir o Google Docs. Verifique permissões e tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!settings.autoSyncEnabled || !accessToken || !user || entries.length === 0) return;
    syncToGoogleDocs(entries);
  }, [entries, settings.autoSyncEnabled, accessToken, user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleExport = async () => {
    if (entries.length === 0) return;
    setIsExporting(true);
    try {
      await exportToDocx(entries);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Ocorreu um erro ao gerar o documento DOCX.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <Loader2 size={32} className="text-[#8B5E3C] animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        location.pathname === '/galeria' ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <FullGallery onBack={() => navigate('/')} onLogin={handleLogin} />
          </motion.div>
        ) : location.pathname === '/sobre' ? (
          <motion.div
            key="sobre"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <SobrePage onBack={() => navigate('/')} />
          </motion.div>
        ) : location.pathname === '/instituicao' ? (
          <motion.div
            key="instituicao"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <InstituicaoPage onBack={() => navigate('/')} />
          </motion.div>
        ) : location.pathname === '/contato' ? (
          <motion.div
            key="contato"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <ContatoPage onBack={() => navigate('/')} />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <LandingPage
              onLogin={handleLogin}
              onViewGallery={() => navigate('/galeria')}
              onViewSobre={() => navigate('/sobre')}
              onViewInstituicao={() => navigate('/instituicao')}
              onViewContato={() => navigate('/contato')}
              isLoggingIn={isLoggingIn}
            />
          </motion.div>
        )
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-slate-50 font-sans selection:bg-[#00B37E]/20"
        >
          {/* Hidden Global File Input */}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />

          {/* Header */}
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/cronos_estagio/logo.png" alt="Cronos Estágio" className="w-8 h-8 object-contain" />
                <h1 className="text-xl font-serif font-semibold tracking-tight text-slate-900">Cronos Estágio</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-500 hidden sm:block uppercase tracking-widest">Estudante de Letras</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                  title="Sair"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white rounded-full p-1 border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setDashboardTab('predicao')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    dashboardTab === 'predicao' 
                      ? 'bg-[#00B37E] text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Predição
                </button>
                <button 
                  onClick={() => setDashboardTab('registros')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    dashboardTab === 'registros' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Registros
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {dashboardTab === 'predicao' ? (
                <motion.div
                  key="predicao"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PredictionArea />
                </motion.div>
              ) : (
                <motion.div
                  key="registros"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-2xl mx-auto"
                >
                  {/* Progress Card */}
                  <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm mb-6 sm:mb-8">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Progresso Total</p>
                        <h2 className="text-4xl font-serif font-bold text-slate-900">{formatMinutes(stats.totalMinutes)}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 mb-1">Meta: {GOAL_HOURS}h</p>
                        <p className={`text-sm font-semibold ${stats.remainingMinutes === 0 ? 'text-[#00B37E]' : 'text-slate-700'}`}>
                          {stats.remainingMinutes === 0 ? 'Concluído!' : `Faltam ${formatMinutes(stats.remainingMinutes)}`}
                        </p>
                      </div>
                    </div>

                    <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-slate-800 rounded-full"
                      />
                    </div>
                  </section>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-serif font-semibold text-slate-900">Registros</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        onClick={handleExport}
                        disabled={entries.length === 0 || isExporting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title="Exportar todos os relatórios para DOCX"
                      >
                        {isExporting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Download size={18} />
                        )}
                        {isExporting ? 'Processando...' : 'Exportar DOCX'}
                      </button>
                      <button 
                        onClick={handleToggleSync}
                        disabled={isSyncing}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm ${
                          settings.autoSyncEnabled 
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                            : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                        title="Sincronizar e abrir no Google Docs"
                      >
                        {isSyncing ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <div className={`w-2.5 h-2.5 rounded-full ${settings.autoSyncEnabled ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                        )}
                        {isSyncing ? 'Sincronizando...' : 'Google Docs'}
                      </button>
                      <button 
                        onClick={() => setIsFormOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10"
                      >
                        <Plus size={18} />
                        Novo Registro
                      </button>
                    </div>
                  </div>

                  {/* Entries List */}
                  <div className="space-y-4">
                    {loadError && (
                      <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{loadError}</p>
                      </div>
                    )}
                    <AnimatePresence mode="popLayout">
                      {entries.length === 0 && !loadError ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl"
                        >
                          <Clock className="mx-auto text-slate-300 mb-3" size={32} />
                          <p className="text-slate-500">Nenhum registro encontrado.</p>
                        </motion.div>
                      ) : (
                        entries.map((entry) => (
                          <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:border-slate-300 transition-all hover:shadow-md cursor-pointer"
                            onClick={() => {
                              setViewingEntry(entry);
                              setTempReportText(entry.reportText || '');
                              setTempDate(entry.date);
                              setTempStartTime(entry.startTime);
                              setTempEndTime(entry.endTime);
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-700">
                                <span className="text-[10px] font-bold uppercase leading-none text-[#00B37E]">
                                  {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                </span>
                                <span className="text-lg font-serif font-bold leading-none">
                                  {new Date(entry.date + 'T00:00:00').getDate()}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-0.5">
                                  <Clock size={14} />
                                  <span>{entry.startTime} — {entry.endTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-slate-900">{formatMinutes(entry.durationMinutes)}</p>
                                  {entry.reportText && (
                                    <span className="flex items-center gap-1 text-[10px] bg-[#00B37E]/10 text-[#00B37E] px-2 py-0.5 rounded-full font-bold uppercase border border-[#00B37E]/20">
                                      <FileText size={10} /> Relatório
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (deletingId === entry.id) {
                                  removeEntry(entry.id);
                                  setDeletingId(null);
                                } else {
                                  setDeletingId(entry.id);
                                }
                              }}
                              onMouseLeave={() => deletingId === entry.id && setDeletingId(null)}
                              className={`p-2 transition-all rounded-xl flex items-center gap-2 whitespace-nowrap ${
                                deletingId === entry.id 
                                  ? 'bg-red-500 text-white opacity-100 shadow-md ring-2 ring-red-200' 
                                  : 'text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-100 md:opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              {deletingId === entry.id ? (
                                <>
                                  <Trash2 size={14} />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Confirmar?</span>
                                </>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl z-50 border border-[#E8E8E8] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif font-bold">Novo Registro</h2>
                <button onClick={resetForm} className="text-[#D1D1D1] hover:text-[#2C2C2C]">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddEntry} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7A7A7A] mb-2">Data</label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#FDFCFB] border border-[#F2E8DF] rounded-2xl py-3 px-4 focus:outline-none focus:border-[#8B5E3C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7A7A7A] mb-2">Início</label>
                    <input 
                      type="time" 
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#FDFCFB] border border-[#F2E8DF] rounded-2xl py-3 px-4 focus:outline-none focus:border-[#8B5E3C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7A7A7A] mb-2">Saída</label>
                    <input 
                      type="time" 
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#FDFCFB] border border-[#F2E8DF] rounded-2xl py-3 px-4 focus:outline-none focus:border-[#8B5E3C] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">Relatório do Dia</label>
                  
                  {/* Enhanced Upload Area */}
                  <div 
                    onClick={() => !isTranscribing && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3
                      ${isTranscribing ? 'bg-[#FDFCFB] border-[#F2E8DF] cursor-wait' : 'bg-[#FDFCFB] border-[#F2E8DF] hover:border-[#8B5E3C] hover:bg-[#F2E8DF]/20'}
                    `}
                  >
                    {isTranscribing ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="text-[#8B5E3C] animate-spin" />
                        <p className="text-sm font-medium text-[#8B5E3C]">Cronos está lendo sua foto...</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-[#F2E8DF] rounded-2xl text-[#8B5E3C]">
                          <Camera size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-[#2C2C2C]">Clique para escanear foto do relatório</p>
                          <p className="text-xs text-[#7A7A7A] mt-1">A IA irá transcrever suas anotações automaticamente</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-white border border-[#F2E8DF] rounded-3xl p-6 focus-within:border-[#8B5E3C] transition-colors">
                    <textarea 
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="O texto transcrito aparecerá aqui para você editar..."
                      className="w-full h-40 bg-transparent border-none focus:ring-0 resize-none text-sm placeholder:text-[#D1D1D1] leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#2C2C2C] text-white py-4 rounded-2xl font-semibold hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
                  >
                    Salvar Registro
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View/Edit Entry Modal */}
      <AnimatePresence>
        {viewingEntry && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setViewingEntry(null);
                setIsEditingReport(false);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl z-50 border border-[#E8E8E8] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  {isEditingReport ? (
                    <div className="space-y-4 pr-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A] mb-1">Data</label>
                        <input 
                          type="date" 
                          value={tempDate}
                          onChange={(e) => setTempDate(e.target.value)}
                          className="w-full bg-[#FDFCFB] border border-[#F2E8DF] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#8B5E3C]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A] mb-1">Início</label>
                          <input 
                            type="time" 
                            value={tempStartTime}
                            onChange={(e) => setTempStartTime(e.target.value)}
                            className="w-full bg-[#FDFCFB] border border-[#F2E8DF] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#8B5E3C]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A] mb-1">Saída</label>
                          <input 
                            type="time" 
                            value={tempEndTime}
                            onChange={(e) => setTempEndTime(e.target.value)}
                            className="w-full bg-[#FDFCFB] border border-[#F2E8DF] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#8B5E3C]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-serif font-bold mb-1">
                        {new Date(viewingEntry.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </h2>
                      <p className="text-sm text-[#7A7A7A]">{viewingEntry.startTime} — {viewingEntry.endTime} ({formatMinutes(viewingEntry.durationMinutes)})</p>
                    </>
                  )}
                </div>
                <button onClick={() => setViewingEntry(null)} className="text-[#D1D1D1] hover:text-[#2C2C2C] ml-4">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-[#FDFCFB] border border-[#F2E8DF] rounded-3xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">Relatório</h3>
                  <div className="flex gap-4">
                    {isEditingReport && (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isTranscribing}
                        className="flex items-center gap-1.5 text-[#8B5E3C] hover:text-[#2C2C2C] transition-colors disabled:opacity-50"
                      >
                        {isTranscribing ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                        <span className="text-xs font-bold uppercase">{isTranscribing ? 'Lendo...' : 'Escanear Foto'}</span>
                      </button>
                    )}
                    {!isEditingReport ? (
                      <button 
                        onClick={() => setIsEditingReport(true)}
                        className="flex items-center gap-1.5 text-[#8B5E3C] hover:text-[#2C2C2C] transition-colors"
                      >
                        <Edit3 size={14} />
                        <span className="text-xs font-bold uppercase">Editar</span>
                      </button>
                    ) : (
                      <button 
                        onClick={saveEditedReport}
                        className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Save size={14} />
                        <span className="text-xs font-bold uppercase">Salvar</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditingReport ? (
                  <textarea 
                    value={tempReportText}
                    onChange={(e) => setTempReportText(e.target.value)}
                    className="w-full h-64 bg-transparent border-none focus:ring-0 resize-none text-sm"
                    autoFocus
                  />
                ) : (
                  <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-wrap min-h-[100px]">
                    {viewingEntry.reportText || (
                      <p className="text-[#D1D1D1] italic">Nenhum relatório escrito para este dia.</p>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setViewingEntry(null)}
                className="w-full bg-[#F2E8DF] text-[#8B5E3C] py-4 rounded-2xl font-semibold hover:bg-[#E8D5C4] transition-all"
              >
                Fechar
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F2E8DF]/50 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#8B5E3C]">
          {stats.remainingMinutes === 0 ? (
            <>
              <CheckCircle2 size={14} />
              Estágio Concluído
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              Em andamento
            </>
          )}
        </div>
      </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
