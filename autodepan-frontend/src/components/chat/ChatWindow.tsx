import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/store';
import { api } from '@/lib/fetcher';
import { formatRelativeTime } from '@/lib/utils';
import { Spinner } from '@/components/common/Spinner';
import type { ChatMessage } from '@/types/user.types';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  missionUuid: string;
}

export function ChatWindow({ missionUuid }: ChatWindowProps) {
  const [text,    setText]    = useState('');
  const bottomRef             = useRef<HTMLDivElement>(null);
  const qc                    = useQueryClient();
  const me                    = useAppSelector((s) => s.auth.user);
  const { on }                = useSocket();

  const { data, isLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ['chat', missionUuid],
    queryFn:  () => api.get(`/missions/${missionUuid}/chat`),
  });

  const messages = data?.messages ?? [];

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (content: string) =>
      api.post<{ message: ChatMessage }>(`/missions/${missionUuid}/chat`, { content, type: 'text' }),
    onSuccess: ({ message: msg }) => {
      qc.setQueryData<{ messages: ChatMessage[] }>(['chat', missionUuid], (old) => ({
        messages: [...(old?.messages ?? []), msg],
      }));
      setText('');
    },
  });

  // Nouveaux messages en temps réel via Reverb (canal privé mission)
  useEffect(() => {
    const off = on<{ message: ChatMessage }>('chat.message', ({ message }) => {
      if (message.sender_id === me?.id) return;
      qc.setQueryData<{ messages: ChatMessage[] }>(['chat', missionUuid], (old) => ({
        messages: [...(old?.messages ?? []), message],
      }));
    }, `mission.${missionUuid}`, true);
    return off;
  }, [missionUuid, on, qc, me?.id]);

  // Auto-scroll vers le bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim() || isPending) return;
    sendMessage(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <p className="text-brand-muted text-sm">Commencez la conversation…</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === me?.id;
          return (
            <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
              {!isMine && msg.sender && (
                <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <span className="text-blue-400 text-xs font-bold">
                    {msg.sender.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className={cn(
                'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                isMine
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-surface text-brand-text rounded-bl-md border border-brand-border',
              )}>
                {msg.type === 'system' ? (
                  <p className="italic text-brand-muted text-xs text-center">{msg.content}</p>
                ) : msg.type === 'image' && msg.file_url ? (
                  <img
                    src={msg.file_url}
                    alt="Photo partagée"
                    className="rounded-xl max-w-full max-h-48 object-cover"
                  />
                ) : msg.type === 'location' && msg.lat && msg.lng ? (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${msg.lat}&mlon=${msg.lng}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 underline text-xs"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Voir la position
                  </a>
                ) : (
                  <>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn('text-[10px] mt-1', isMine ? 'text-orange-200' : 'text-brand-muted')}>
                      {formatRelativeTime(msg.created_at)}
                      {isMine && msg.read_at && ' · Lu'}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-surface border-t border-brand-border">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message… (Entrée pour envoyer)"
            rows={1}
            className="flex-1 bg-surface-raised border border-brand-border rounded-xl px-4 py-3
                       text-brand-text text-sm placeholder-brand-muted resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       max-h-28 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isPending}
            className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center
                       disabled:opacity-40 transition-all active:scale-95 flex-shrink-0"
          >
            {isPending
              ? <Spinner size="sm" className="border-t-white" />
              : <SendIcon className="w-5 h-5 text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}
