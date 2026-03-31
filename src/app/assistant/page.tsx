'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Send, Mic, MicOff, Camera, X, ArrowLeft,
  Paperclip, Volume2, VolumeX, Sparkles, ImageIcon, StopCircle
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fileToBase64 } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'What should I eat during my luteal phase?',
  'Why do I feel tired before my period?',
  'How can I reduce period cramps naturally?',
  'What\'s the best exercise for my cycle phase?',
  'How does stress affect my period?',
  'Help me understand my cycle phases',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm Luna, your personal health companion. 🌙\n\nI'm here 24/7 to help you understand your cycle, manage symptoms, track nutrition, improve sleep, and answer any health questions you have.\n\nHow can I support you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ url: string; base64: string; mediaType: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text?: string, imageBase64?: string, imageMime?: string) => {
    const content = text || input.trim();
    if (!content && !imageBase64) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      imageUrl: pendingImage?.url,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingImage(null);
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          imageData: imageBase64 || (pendingImage?.base64),
          imageMediaType: imageMime || (pendingImage?.mediaType),
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m)
        );
      }

      if (speakEnabled && fullText) {
        speak(fullText);
      }
    } catch (err) {
      toast.error('Luna had trouble responding. Please try again.');
      setMessages(prev => prev.filter(m => m.id !== aiMsgId));
    } finally {
      setLoading(false);
    }
  }, [input, messages, pendingImage, speakEnabled]);

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ''));
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        // Use Web Speech API for transcription
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Use Web Speech API for real-time transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          stopRecording();
        };

        recognition.onerror = () => {
          toast.error('Could not capture audio. Please type instead.');
          stopRecording();
        };

        recognition.start();
        (mediaRecorderRef as any).recognition = recognition;
      }
    } catch (err) {
      toast.error('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if ((mediaRecorderRef as any).recognition) {
      (mediaRecorderRef as any).recognition.stop();
    }
    setIsRecording(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const base64 = await fileToBase64(file);
    const url = URL.createObjectURL(file);
    setPendingImage({ url, base64, mediaType: file.type as any });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--surface-0)' }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-white/6 flex-shrink-0"
        style={{ background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors lg:hidden">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <Moon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-white">Luna AI</h1>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-xs text-white/40">Your 24/7 health companion</p>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button onClick={stopSpeaking} className="btn-ghost p-2 text-fuchsia-400">
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setSpeakEnabled(!speakEnabled)}
              className={`btn-ghost p-2 ${speakEnabled ? 'text-fuchsia-400 border-fuchsia-500/30' : 'text-white/40'}`}
              title={speakEnabled ? 'Voice responses on' : 'Voice responses off'}
            >
              {speakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-xs text-white/30 text-center mb-4 flex items-center gap-2 justify-center">
              <Sparkles className="w-3 h-3" />
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-4 py-2 rounded-full glass border border-white/10 text-white/60 hover:text-white hover:border-rose-500/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Moon className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] sm:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Uploaded" className="max-w-xs rounded-2xl mb-2 border border-white/10" />
                )}

                <div className={msg.role === 'user' ? 'chat-bubble-user px-4 py-3' : 'chat-bubble-ai px-4 py-3'}>
                  {msg.content ? (
                    <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-white/90'}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="text-white/80">{children}</li>,
                          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="text-white/70">{children}</em>,
                          h3: ({ children }) => <h3 className="text-white font-semibold mt-3 mb-1">{children}</h3>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-white/20 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-white/6"
        style={{ background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)' }}>

        {/* Pending image preview */}
        <AnimatePresence>
          {pendingImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex items-center gap-3"
            >
              <div className="relative">
                <img src={pendingImage.url} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-white/10" />
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-surface-3 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-white/40">Image ready to send</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3">
          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost p-3 text-white/40 hover:text-white/70 flex-shrink-0"
              title="Upload image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-xl border flex-shrink-0 transition-all ${
                isRecording
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 voice-active'
                  : 'btn-ghost text-white/40 hover:text-white/70'
              }`}
              title={isRecording ? 'Stop recording' : 'Voice message'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'Listening...' : 'Ask Luna anything about your health...'}
              rows={1}
              className="input-dark w-full px-4 py-3 text-sm resize-none leading-relaxed max-h-32"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Send */}
          <button
            onClick={() => sendMessage()}
            disabled={loading || (!input.trim() && !pendingImage)}
            className="btn-primary p-3 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[10px] text-white/20 text-center mt-2">
          Luna AI may make mistakes. For medical emergencies, contact a healthcare professional.
        </p>
      </div>
    </div>
  );
}
