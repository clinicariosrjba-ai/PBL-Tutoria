/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  PlayCircle, 
  PauseCircle, 
  CheckCircle, 
  X,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FalaPendente, Screen, AppState } from './types';
import { cn } from './lib/utils';

// --- COMPONENTS ---

interface SortableItemProps {
  key?: React.Key;
  id: string;
  fala: FalaPendente;
  index: number;
  total: number;
  isPrimeiro: boolean;
  onConcluir: () => void;
  onContribuir: (nome: string) => void;
  onMover: (direcao: 'cima' | 'baixo') => void;
  timerContent?: React.ReactNode;
}

function SortableItem({ id, fala, index, total, isPrimeiro, onConcluir, onContribuir, onMover, timerContent }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isPrimeiro) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative bg-white border-2 border-teal-600 rounded-xl shadow-xl p-6 mb-8 group"
      >
        <div className="absolute -top-3 left-6 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
          Falando Agora
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div 
              {...attributes} {...listeners}
              className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center border-4 border-teal-100 flex-shrink-0 cursor-grab active:cursor-grabbing"
            >
              <span className="text-2xl font-black text-teal-700">{index + 1}º</span>
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-800 leading-tight">{fala.nome}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Intervenção PBL</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onContribuir(fala.nome)}
              className="px-4 h-14 rounded-xl border-2 border-amber-200 text-amber-700 font-black text-[10px] uppercase tracking-widest hover:bg-amber-50 hover:border-amber-400 transition-all active:scale-95 flex items-center gap-2"
              title="Abrir intervenção de colega"
            >
              <PlusCircle size={16} />
              Intervenção
            </button>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => onMover('baixo')}
                disabled={total <= 1}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-teal-600 hover:border-teal-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Mover para baixo"
              >
                <ChevronDown size={20} />
              </button>
            </div>
             <button 
              onClick={onConcluir}
              className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 shadow-lg transition-all hover:scale-105 active:scale-95"
              title="Concluir fala"
            >
              <CheckCircle size={28} />
            </button>
          </div>
        </div>

        {timerContent && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            {timerContent}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-3 flex items-center justify-between group hover:bg-white hover:border-teal-300 transition-all cursor-move"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-200 text-xs">
          {index + 1}
        </div>
        <span className="font-bold text-slate-700">{fala.nome}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onMover('cima'); }}
            className="p-1.5 rounded bg-white text-slate-400 hover:text-teal-600 hover:shadow-sm transition-all"
            title="Mover para cima"
          >
            <ChevronUp size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMover('baixo'); }}
            disabled={index === total - 1}
            className="p-1.5 rounded bg-white text-slate-400 hover:text-teal-600 hover:shadow-sm disabled:opacity-20 transition-all"
            title="Mover para baixo"
          >
            <ChevronDown size={18} />
          </button>
        </div>
        
        <div 
          {...attributes} {...listeners}
          className="opacity-0 group-hover:opacity-30 transition-opacity p-2 cursor-grab active:cursor-grabbing hover:bg-slate-200 rounded-md"
        >
          <GripVertical size={20} />
        </div>
      </div>
    </div>
  );
}

// --- SCREENS ---

function TelaCadastro({ onIniciar }: { onIniciar: (config: AppState) => void }) {
  const [alunos, setAlunos] = useState<string[]>([]);
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [inputAluno, setInputAluno] = useState("");
  const [inputObjetivo, setInputObjetivo] = useState("");

  const addAluno = () => {
    if (inputAluno.trim()) {
      setAlunos([...alunos, inputAluno.trim()]);
      setInputAluno("");
    }
  };

  const addObjetivo = () => {
    if (inputObjetivo.trim()) {
      setObjetivos([...objetivos, inputObjetivo.trim()]);
      setInputObjetivo("");
    }
  };

  const removeAluno = (index: number) => {
    setAlunos(alunos.filter((_, i) => i !== index));
  };

  const removeObjetivo = (index: number) => {
    setObjetivos(objetivos.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="bg-teal-800 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center font-bold text-white">P</div>
            <span className="text-xs font-black tracking-[0.3em] uppercase opacity-70">Tutoria PBL</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Configuração de Sessão</h1>
          <p className="text-teal-200 text-sm mt-2 font-medium opacity-80">Prepare o ambiente para a discussão dos objetivos.</p>
        </div>
        
        <div className="p-8 space-y-10">
          {/* Alunos Section */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Alunos Participantes</h2>
                <span className="text-[10px] bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full uppercase">{alunos.length} Inscritos</span>
             </div>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-teal-500 outline-none py-3 px-4 text-sm font-medium transition-all"
                placeholder="Ex: Lucas Gabriel..."
                value={inputAluno}
                onChange={(e) => setInputAluno(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAluno()}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <button 
                onClick={addAluno} 
                className="bg-teal-600 text-white w-12 h-12 flex items-center justify-center rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-90"
              >
                <PlusCircle size={24} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {alunos.map((aluno, i) => (
                  <motion.span 
                    key={`aluno-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 group hover:border-red-200 hover:bg-red-50 transition-all"
                  >
                    {aluno}
                    <button onClick={() => removeAluno(i)} className="text-slate-300 group-hover:text-red-500 transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Objetivos Section */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Objetivos de Aprendizagem</h2>
                <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase">{objetivos.length} Definidos</span>
             </div>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-teal-500 outline-none py-3 px-4 text-sm font-medium transition-all"
                placeholder="Ex: Analisar as vias metabólicas..."
                value={inputObjetivo}
                onChange={(e) => setInputObjetivo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addObjetivo()}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <button 
                onClick={addObjetivo} 
                className="bg-teal-600 text-white w-12 h-12 flex items-center justify-center rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-90"
              >
                <PlusCircle size={24} />
              </button>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {objetivos.map((obj, i) => (
                  <motion.div 
                    key={`obj-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl flex items-center justify-between group hover:border-teal-200 hover:bg-white transition-all shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-teal-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm text-slate-700 font-bold leading-tight">{obj}</span>
                    </div>
                    <button onClick={() => removeObjetivo(i)} className="text-slate-300 group-hover:text-red-500 transition-colors shrink-0">
                      <X size={18} strokeWidth={3} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <button 
            className={cn(
              "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform active:scale-[0.98] shadow-xl",
              (alunos.length > 0 && objetivos.length > 0)
                ? "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-100"
                : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
            )}
            disabled={alunos.length === 0 || objetivos.length === 0}
            onClick={() => onIniciar({ alunos, objetivos })}
          >
            Iniciar Dinâmica de Tutoria
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TelaGerenciador({ config, onFinalizar }: { config: AppState, onFinalizar: () => void }) {
  const [objetivoAtual, setObjetivoAtual] = useState(0);
  const [filaFalas, setFilaFalas] = useState<FalaPendente[]>([]);
  const [segundosRestantes, setSegundosRestantes] = useState(180);
  const [extensoesUsadas, setExtensoesUsadas] = useState(0);
  const [timerRodando, setTimerRodando] = useState(false);
  const [startTime] = useState(Date.now());
  const [objetivosFinalizados, setObjetivosFinalizados] = useState<number[]>([]);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [totalActiveSeconds, setTotalActiveSeconds] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  // Intervenção State
  const [intervencaoAtiva, setIntervencaoAtiva] = useState(false);
  const [intervencaoNome, setIntervencaoNome] = useState<string | null>(null);
  const [segundosIntervencao, setSegundosIntervencao] = useState(60);
  const [extensoesIntervencao, setExtensoesIntervencao] = useState(0);
  const [selecionandoInterventor, setSelecionandoInterventor] = useState(false);

  const timerRef = useRef<any>(null);
  const intervencaoTimerRef = useRef<any>(null);
  const sessionTimerRef = useRef<any>(null);

  // Persistence: Save state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('pbl_session_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setObjetivoAtual(parsed.objetivoAtual || 0);
        setFilaFalas(parsed.filaFalas || []);
        setObjetivosFinalizados(parsed.objetivosFinalizados || []);
        setTotalActiveSeconds(parsed.totalActiveSeconds || 0);
      } catch (e) {
        console.error("Erro ao carregar estado salvo:", e);
      }
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      objetivoAtual,
      filaFalas,
      objetivosFinalizados,
      totalActiveSeconds,
    };
    localStorage.setItem('pbl_session_state', JSON.stringify(stateToSave));
  }, [objetivoAtual, filaFalas, objetivosFinalizados, totalActiveSeconds]);

  useEffect(() => {
    sessionTimerRef.current = setInterval(() => {
      if (!sessionPaused && !showSummary) {
        setTotalActiveSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [sessionPaused, showSummary]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSegundosRestantes(180);
    setExtensoesUsadas(0);
    setTimerRodando(false);
  };

  useEffect(() => {
    if (timerRodando && !sessionPaused && !intervencaoAtiva) {
      timerRef.current = setInterval(() => {
        setSegundosRestantes((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerRodando(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { 
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRodando, sessionPaused, intervencaoAtiva]);

  // Intervenção Timer logic
  useEffect(() => {
    if (intervencaoAtiva && !sessionPaused) {
      intervencaoTimerRef.current = setInterval(() => {
        setSegundosIntervencao((prev) => {
          if (prev <= 1) {
            if (intervencaoTimerRef.current) clearInterval(intervencaoTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervencaoTimerRef.current) clearInterval(intervencaoTimerRef.current);
    }
    return () => {
      if (intervencaoTimerRef.current) clearInterval(intervencaoTimerRef.current);
    };
  }, [intervencaoAtiva, sessionPaused]);

  const toggleTimer = () => setTimerRodando(!timerRodando);

  const toggleObjetivo = (index: number) => {
    setObjetivosFinalizados(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const adicionarTempo = () => {
    if (extensoesUsadas < 2) {
      setSegundosRestantes(prev => prev + 180);
      setExtensoesUsadas(prev => prev + 1);
    }
  };

  const formatarTempo = (s: number) => {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  const adicionarFala = (nome: string) => {
    const novaFala: FalaPendente = {
      id: Math.random().toString(36).substr(2, 9),
      nome
    };
    setFilaFalas([...filaFalas, novaFala]);
  };

  const moverFila = (index: number, direcao: 'cima' | 'baixo') => {
    const novaFila = [...filaFalas];
    const targetIndex = direcao === 'cima' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < novaFila.length) {
      const temp = novaFila[index];
      novaFila[index] = novaFila[targetIndex];
      novaFila[targetIndex] = temp;
      setFilaFalas(novaFila);
    }
  };

  const concluirFala = (index: number) => {
    const fala = filaFalas[index];
    if (!fala) return;

    const novaFila = [...filaFalas];
    novaFila.splice(index, 1);
    setFilaFalas(novaFila);
    resetTimer();
  };

  const abrirIntervencao = (contribuinte: string) => {
    setIntervencaoNome(contribuinte);
    setSegundosIntervencao(60);
    setExtensoesIntervencao(0);
    setIntervencaoAtiva(true);
  };

  const extenderIntervencao = () => {
    if (extensoesIntervencao < 2) {
      setSegundosIntervencao(prev => prev + 60);
      setExtensoesIntervencao(prev => prev + 1);
    }
  };

  const fecharIntervencao = () => {
    setIntervencaoAtiva(false);
    setIntervencaoNome(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFilaFalas((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const novaFila = arrayMove(items, oldIndex, newIndex);
        
        if (oldIndex === 0 || newIndex === 0) {
          resetTimer();
        }
        
        return novaFila;
      });
    }
  };

  if (showSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="bg-teal-600 p-8 text-white text-center">
            <CheckCircle size={64} className="mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase tracking-tight">Sessão Finalizada</h2>
            <p className="text-teal-100 mt-2 font-medium">Resumo dos resultados da tutoria</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-center">Tempo Total de Diálogo Ativo</p>
                <p className="text-4xl font-mono font-bold text-slate-800 text-center">{formatarTempo(totalActiveSeconds)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Objetivos Concluídos</p>
                <p className="text-2xl font-mono font-bold text-slate-800">{objetivosFinalizados.length}/{config.objetivos.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status Final</p>
                <p className="text-xl font-bold text-teal-600 uppercase">Sessão encerrada</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('pbl_session_state');
                onFinalizar();
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
            >
              Voltar ao Cadastro
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header Navigation */}
      <nav className="h-16 bg-teal-800 text-white flex items-center justify-between px-8 shadow-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center font-bold">P</div>
          <span className="text-lg font-semibold tracking-tight uppercase">Tutoria PBL • Gestão de Falas</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSummary(true)}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-md text-sm font-bold transition-colors shadow-sm"
          >
            FINALIZAR SESSÃO
          </button>
        </div>
      </nav>

      {/* Objective Control Bar */}
      <section className="h-24 bg-teal-50 border-b border-teal-200 flex items-center justify-between px-8 flex-shrink-0">
        <button 
          disabled={objetivoAtual === 0}
          onClick={() => {
            setObjetivoAtual(objetivoAtual - 1);
            setFilaFalas([]);
            resetTimer();
          }}
          className="p-2 hover:bg-teal-100 rounded-full text-teal-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="flex flex-col items-center max-w-2xl text-center">
          <span className="text-[10px] text-teal-600 font-bold tracking-[0.2em] uppercase mb-1">
            Objetivo Atual ({(objetivoAtual + 1).toString().padStart(2, '0')}/{config.objetivos.length.toString().padStart(2, '0')})
          </span>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-teal-900 uppercase tracking-tight line-clamp-1">
              {config.objetivos[objetivoAtual]}
            </h2>
            <button 
              onClick={() => toggleObjetivo(objetivoAtual)}
              className={cn(
                "p-1.5 rounded-full transition-all shrink-0",
                objetivosFinalizados.includes(objetivoAtual)
                  ? "bg-green-500 text-white"
                  : "bg-slate-200 text-slate-400 hover:bg-green-100 hover:text-green-600"
              )}
              title="Marcar objetivo como concluído"
            >
              <CheckCircle size={20} />
            </button>
          </div>
        </div>
        <button 
          disabled={objetivoAtual === config.objetivos.length - 1}
          onClick={() => {
            setObjetivoAtual(objetivoAtual + 1);
            setFilaFalas([]);
            resetTimer();
          }}
          className="p-2 hover:bg-teal-100 rounded-full text-teal-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={28} />
        </button>
      </section>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {sessionPaused && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center w-full max-w-sm border-4 border-amber-400">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PauseCircle size={40} className="sm:hidden" />
                  <PauseCircle size={48} className="hidden sm:block" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Sessão em Pausa</h3>
                <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">A discussão está suspensa no momento.</p>
                <button 
                  onClick={() => setSessionPaused(false)}
                  className="mt-6 w-full py-4 bg-teal-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg text-sm"
                >
                  Retomar Agora
                </button>
             </div>
          </div>
        )}

        {/* Left: Speaking Queue */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col relative">
          <AnimatePresence>
            {intervencaoAtiva && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-8 left-8 right-8 bg-amber-500 text-white rounded-3xl shadow-2xl p-8 z-50 border-4 border-amber-300"
              >
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center font-black">
                        <PlusCircle size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 decoration-white">Intervenção em Curso</span>
                        <h4 className="text-2xl font-black uppercase leading-none">{intervencaoNome}</h4>
                      </div>
                   </div>
                   <button 
                    onClick={fecharIntervencao}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                   >
                     <X size={32} />
                   </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[10px] font-bold uppercase mb-1 opacity-80">Tempo de Contribuição</span>
                    <div className={cn(
                      "text-7xl font-mono font-black tracking-tight leading-none",
                      segundosIntervencao < 10 ? "animate-pulse text-red-100" : ""
                    )}>
                      {formatarTempo(segundosIntervencao)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <button 
                      onClick={extenderIntervencao}
                      disabled={extensoesIntervencao >= 2}
                      className="bg-white text-amber-600 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                      ESTENDER +1 MINUTO ({2 - extensoesIntervencao} rest.)
                    </button>
                    <button 
                      onClick={fecharIntervencao}
                      className="bg-amber-700 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-800 transition-all active:scale-95"
                    >
                      ENCERRAR CONTRIBUIÇÃO
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h3 className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest">Fila de Intervenções</h3>
            <span className="text-[10px] sm:text-xs bg-slate-200 px-2 sm:px-3 py-1 rounded text-slate-600 font-bold">
              {filaFalas.length} {filaFalas.length === 1 ? 'Aguardando' : 'Aguardando'}
            </span>
          </div>

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={filaFalas}
              strategy={verticalListSortingStrategy}
            >
              {filaFalas.map((fala: FalaPendente, index: number) => (
                <SortableItem 
                  key={fala.id}
                  id={fala.id}
                  fala={fala}
                  index={index}
                  total={filaFalas.length}
                  isPrimeiro={index === 0}
                  onContribuir={() => setSelecionandoInterventor(true)}
                  onMover={(dir) => moverFila(index, dir)}
                  onConcluir={() => concluirFala(index)}
                  timerContent={
                    index === 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                         <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tempo Restante</span>
                            <div className={cn(
                              "text-5xl sm:text-6xl font-mono font-black tracking-tighter leading-none",
                              segundosRestantes < 30 ? "text-red-500 animate-pulse" : "text-slate-900"
                            )}>
                              {formatarTempo(segundosRestantes)}
                            </div>
                         </div>
                         
                         <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                            <div className="flex gap-2 w-full justify-center sm:justify-end">
                              <button 
                                onClick={toggleTimer}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center hover:bg-teal-200 transition-all active:scale-95 shadow-sm"
                              >
                                {timerRodando ? <PauseCircle size={28} className="sm:hidden" /> : <PlayCircle size={28} className="sm:hidden" />}
                                {timerRodando ? <PauseCircle size={32} className="hidden sm:block" /> : <PlayCircle size={32} className="hidden sm:block" />}
                              </button>
                              <button 
                                onClick={adicionarTempo}
                                disabled={extensoesUsadas >= 2}
                                className={cn(
                                  "bg-amber-400 hover:bg-amber-500 text-amber-900 px-4 sm:px-6 h-12 sm:h-14 rounded font-black text-[10px] sm:text-xs uppercase tracking-tight shadow-md transition-all active:scale-95 disabled:opacity-30 flex-1 sm:flex-none",
                                )}
                              >
                                <span>+3 MINUTOS</span>
                                <div className="text-[9px] font-bold opacity-60">({2 - extensoesUsadas} Restantes)</div>
                              </button>
                            </div>
                         </div>
                      </div>
                    )
                  }
                />
              ))}
              {filaFalas.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-12 text-slate-400 min-h-[300px]">
                  <PlayCircle size={40} className="opacity-10 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-[10px] sm:text-sm">Pronto para começar</p>
                  <p className="text-[10px] uppercase tracking-tight mt-1 text-center">Selecione um aluno na barra lateral para iniciar a fala.</p>
                </div>
              )}
            </SortableContext>
          </DndContext>
        </div>

        {/* Right: Student Picker & Metrics */}
        <aside className="w-full lg:w-[350px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-8 flex flex-col gap-8 sm:gap-10 overflow-y-auto shrink-0 relative">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "text-[10px] sm:text-sm font-black uppercase tracking-widest transition-colors",
                selecionandoInterventor ? "text-amber-600" : "text-slate-400"
              )}>
                {selecionandoInterventor ? "Selecione o Contribuidor" : "Adicionar à Fila"}
              </h3>
              {selecionandoInterventor && (
                <button 
                  onClick={() => setSelecionandoInterventor(false)}
                  className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"
                >
                  <X size={12} /> Cancelar
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
              {config.alunos.map((aluno, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (selecionandoInterventor) {
                      abrirIntervencao(aluno);
                      setSelecionandoInterventor(false);
                    } else {
                      adicionarFala(aluno);
                    }
                  }}
                  className={cn(
                    "px-3 py-3 border rounded text-[10px] font-bold transition-all text-left truncate active:scale-95 shadow-sm",
                    selecionandoInterventor 
                      ? "bg-amber-50 border-amber-300 text-amber-700 animate-pulse hover:bg-amber-100" 
                      : "bg-slate-50 border-slate-200 hover:border-teal-400 hover:text-teal-700 hover:bg-white"
                  )}
                >
                  {aluno}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest">Status dos Objetivos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {config.objetivos.map((obj, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all flex items-center justify-between gap-3",
                    objetivosFinalizados.includes(i)
                      ? "bg-green-50 border-green-200 text-green-900 shadow-sm"
                      : "bg-slate-50 border-slate-100 text-slate-500 opacity-70"
                  )}
                >
                  <span className="text-[9px] font-black shrink-0 w-5 h-5 flex items-center justify-center bg-white rounded-full border border-current">
                    {i + 1}
                  </span>
                  <p className="text-[10px] font-bold leading-tight flex-1 line-clamp-2">{obj}</p>
                  <button 
                    onClick={() => toggleObjetivo(i)}
                    className={cn(
                      "shrink-0 p-1 rounded-md transition-colors",
                      objetivosFinalizados.includes(i)
                        ? "text-green-600 hover:bg-green-100"
                        : "text-slate-300 hover:bg-slate-200"
                    )}
                  >
                    <CheckCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest">Resumo de Sessão</h3>
            <div className="space-y-6">
              <div 
                onClick={() => setSessionPaused(!sessionPaused)}
                className={cn(
                  "p-5 rounded-xl border-2 shadow-sm flex items-center justify-between cursor-pointer transition-all active:scale-95 group",
                  sessionPaused 
                    ? "bg-amber-50 border-amber-300 shadow-amber-100" 
                    : "bg-slate-50 border-slate-100 hover:border-teal-300"
                )}
              >
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Tempo Ativo Total</p>
                  <p className={cn(
                    "text-2xl font-mono font-bold transition-colors",
                    sessionPaused ? "text-amber-600" : "text-slate-800"
                  )}>
                    {formatarTempo(totalActiveSeconds)}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                   <span className={cn(
                     "text-[10px] font-black uppercase px-2 py-1 rounded transition-colors",
                     sessionPaused ? "bg-amber-400 text-white animate-pulse" : "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
                   )}>
                     {sessionPaused ? "Pausado" : "Sessão"}
                   </span>
                   <div className="text-slate-400">
                     {sessionPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                   </div>
                </div>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                 <p className="text-[9px] text-teal-600 font-bold uppercase tracking-tight mb-1">Objetivos Concluídos</p>
                 <p className="text-xl sm:text-2xl font-black text-teal-900 leading-none">{objetivosFinalizados.length}/{config.objetivos.length}</p>
                 <p className="text-[9px] text-teal-400 mt-2 font-medium">Equilíbrio e foco no aprendizado.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );

}

// --- MAIN APP ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('cadastro');
  const [config, setConfig] = useState<AppState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Recovery: Load screen and config from localStorage
  useEffect(() => {
    const savedScreen = localStorage.getItem('pbl_app_screen');
    const savedConfig = localStorage.getItem('pbl_app_config');
    
    if (savedScreen && savedConfig) {
      setScreen(savedScreen as Screen);
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Erro ao recuperar config:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pbl_app_screen', screen);
      if (config) {
        localStorage.setItem('pbl_app_config', JSON.stringify(config));
      } else {
        localStorage.removeItem('pbl_app_config');
      }
    }
  }, [screen, config, isInitialized]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (screen === 'gerenciador') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [screen]);

  const handleIniciar = (data: AppState) => {
    setConfig(data);
    setScreen('gerenciador');
  };

  const handleFinalizar = () => {
    localStorage.removeItem('pbl_app_screen');
    localStorage.removeItem('pbl_app_config');
    localStorage.removeItem('pbl_session_state');
    setScreen('cadastro');
    setConfig(null);
  };

  if (!isInitialized) return <div className="min-h-screen bg-slate-50" />;

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-200">
      <AnimatePresence mode="wait">
        {screen === 'cadastro' ? (
          <motion.div 
            key="cadastro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TelaCadastro onIniciar={handleIniciar} />
          </motion.div>
        ) : (
          <motion.div 
            key="gerenciador"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full"
          >
            {config && <TelaGerenciador config={config} onFinalizar={handleFinalizar} />}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
