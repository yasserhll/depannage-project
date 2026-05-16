import { useParams, useNavigate } from 'react-router-dom';
import { ChatWindow } from '@/components/chat/ChatWindow';

export function ClientChat() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-border bg-surface">
        <button onClick={() => navigate(-1)} className="text-brand-muted text-sm">← Retour</button>
        <p className="text-brand-text font-semibold">Chat mission</p>
      </div>
      {uuid && <ChatWindow missionUuid={uuid} />}
    </div>
  );
}
