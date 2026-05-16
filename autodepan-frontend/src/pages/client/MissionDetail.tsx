import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, MapPin, AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { missionService } from '@/services/mission.service';
import { MissionBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Card, CardBody } from '@/components/common/Card';
import { Rating } from '@/components/common/Rating';
import { formatDate, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/fetcher';
import toast from '@/lib/toast';

export function MissionDetail() {
  const { uuid }          = useParams<{ uuid: string }>();
  const navigate          = useNavigate();
  const qc                = useQueryClient();
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['mission', uuid],
    queryFn:  () => missionService.getClientMission(uuid!),
    enabled:  !!uuid,
  });

  const mission = data?.mission;

  const { mutate: validate, isPending: validating } = useMutation({
    mutationFn: () => missionService.validateMission(uuid!),
    onSuccess:  () => {
      toast.success('Mission validée ! Paiement libéré au dépanneur.');
      qc.invalidateQueries({ queryKey: ['mission', uuid] });
    },
    onError: () => toast.error('Impossible de valider la mission.'),
  });

  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: () => missionService.cancelMission(uuid!),
    onSuccess:  () => { toast.success('Mission annulée.'); navigate('/client/missions'); },
    onError:    () => toast.error('Impossible d\'annuler.'),
  });

  const { mutate: openDispute, isPending: disputing } = useMutation({
    mutationFn: () => missionService.openDispute(uuid!, disputeReason),
    onSuccess:  () => {
      toast.success('Litige ouvert. Notre équipe va examiner votre demande.');
      setShowDispute(false);
      qc.invalidateQueries({ queryKey: ['mission', uuid] });
    },
    onError: () => toast.error('Impossible d\'ouvrir un litige.'),
  });

  const { mutate: leaveReview, isPending: reviewing } = useMutation({
    mutationFn: () => api.post(`/missions/${uuid}/review`, { rating, comment }),
    onSuccess:  () => { toast.success('Avis envoyé.'); qc.invalidateQueries({ queryKey: ['mission', uuid] }); },
    onError:    () => toast.error('Impossible d\'envoyer l\'avis.'),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!mission)  return <div className="p-6 text-center text-brand-muted">Mission introuvable.</div>;

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-brand-muted">←</button>
        <div>
          <h1 className="text-brand-text font-bold">Détail de la mission</h1>
          <p className="text-brand-muted text-xs font-mono">{mission.uuid}</p>
        </div>
        <div className="ml-auto"><MissionBadge status={mission.status} /></div>
      </div>

      {/* Infos mission */}
      <Card>
        <CardBody className="space-y-3">
          <Row label="Type de panne"  value={mission.breakdown_type} />
          {mission.breakdown_details  && <Row label="Détails"         value={mission.breakdown_details} />}
          {mission.vehicle_brand      && <Row label="Véhicule"         value={`${mission.vehicle_brand} ${mission.vehicle_model ?? ''}`} />}
          {mission.vehicle_plate      && <Row label="Immatriculation"  value={mission.vehicle_plate} />}
          <Row label="Date"           value={formatDate(mission.created_at)} />
          {mission.distance_km        && <Row label="Distance"          value={`${mission.distance_km} km`} />}
          {mission.estimated_duration_min && <Row label="Durée estimée" value={`${mission.estimated_duration_min} min`} />}
        </CardBody>
      </Card>

      {/* Dépanneur */}
      {mission.depanneur && (
        <Card>
          <CardBody>
            <p className="text-brand-muted text-xs mb-2">Dépanneur</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400 font-bold">{mission.depanneur.name?.charAt(0)}</span>
              </div>
              <div>
                <p className="text-brand-text font-semibold">{mission.depanneur.name}</p>
                {mission.depanneur.phone && (
                  <a href={`tel:${mission.depanneur.phone}`} className="text-primary text-sm flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {mission.depanneur.phone}
                  </a>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Paiement */}
      {(mission.final_price || mission.estimated_price) && (
        <Card>
          <CardBody className="space-y-2">
            {mission.final_price     && <Row label="Montant total"      value={formatCurrency(Number(mission.final_price))} bold />}
            {mission.estimated_price && !mission.final_price && <Row label="Montant estimé" value={`~${formatCurrency(Number(mission.estimated_price))}`} />}
            {mission.platform_fee    && <Row label="Commission (10%)"   value={formatCurrency(Number(mission.platform_fee))} />}
            {mission.depanneur_amount && <Row label="Net dépanneur"     value={formatCurrency(Number(mission.depanneur_amount))} />}
          </CardBody>
        </Card>
      )}

      {/* Formulaire avis */}
      {mission.status === 'completed' && mission.depanneur && (
        <Card>
          <CardBody>
            <p className="text-brand-text font-semibold mb-3">Laisser un avis</p>
            <Rating value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience…"
              rows={3}
              className="w-full mt-3 bg-surface-raised border border-brand-border rounded-xl px-4 py-3
                         text-brand-text text-sm placeholder-brand-muted resize-none
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              fullWidth
              variant="outline"
              loading={reviewing}
              disabled={!rating}
              onClick={() => leaveReview()}
              className="mt-3"
            >
              Envoyer l'avis
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Litige */}
      {showDispute && (
        <Card>
          <CardBody className="space-y-3">
            <p className="text-brand-text font-semibold">Ouvrir un litige</p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Décrivez le problème en détail…"
              rows={4}
              className="w-full bg-surface-raised border border-brand-border rounded-xl px-4 py-3
                         text-brand-text text-sm placeholder-brand-muted resize-none
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowDispute(false)}>Annuler</Button>
              <Button variant="danger" fullWidth loading={disputing} disabled={!disputeReason.trim()} onClick={() => openDispute()}>
                Ouvrir le litige
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2">
        {mission.status === 'completed' && !mission.payment && (
          <Button fullWidth size="lg" onClick={() => validate()} loading={validating}>
            <Check className="w-4 h-4 inline mr-1" /> Confirmer et valider la mission
          </Button>
        )}

        {mission.status === 'searching' && (
          <Button fullWidth variant="danger" onClick={() => cancel()} loading={cancelling}>
            Annuler la demande
          </Button>
        )}

        {['accepted', 'en_route', 'arrived', 'in_progress'].includes(mission.status) && (
          <Button fullWidth variant="outline" onClick={() => navigate(`/client/tracking/${uuid}`)}>
            <MapPin className="w-4 h-4 inline mr-1" /> Voir le suivi en direct
          </Button>
        )}

        {['completed', 'in_progress'].includes(mission.status) && !showDispute && !mission.dispute && (
          <Button variant="ghost" fullWidth onClick={() => setShowDispute(true)} className="text-red-400">
            <AlertTriangle className="w-4 h-4 inline mr-1" /> Signaler un problème
          </Button>
        )}

        <Link
          to={`/client/chat/${mission.uuid}`}
          className="block w-full text-center py-3 px-5 rounded-xl border border-brand-border text-brand-text text-sm font-semibold hover:bg-surface-raised transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" /> Ouvrir le chat
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-brand-muted text-sm flex-shrink-0">{label}</span>
      <span className={`text-sm text-right ${bold ? 'text-green-400 font-bold text-base' : 'text-brand-text font-medium'}`}>
        {value}
      </span>
    </div>
  );
}
