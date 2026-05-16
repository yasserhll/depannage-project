import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, XCircle, AlertCircle, Camera } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { missionService } from '@/services/mission.service';
import { BREAKDOWN_TYPES } from '@/types/mission.types';
import toast from '@/lib/toast';
import type { ApiError } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

export function NewMission() {
  const navigate    = useNavigate();
  const { getOnce } = useGeolocation();

  const [position,   setPosition]   = useState<{ lat: number; lng: number } | null>(null);
  const [locating,   setLocating]   = useState(true);
  const [breakdown,  setBreakdown]  = useState('');
  const [details,    setDetails]    = useState('');
  const [vehicle,    setVehicle]    = useState({ brand: '', model: '', year: '', plate: '' });
  const [photos,     setPhotos]     = useState<File[]>([]);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  useEffect(() => {
    getOnce()
      .then((pos) => setPosition({ lat: pos.lat, lng: pos.lng }))
      .catch(() => toast.error('Impossible de détecter votre position GPS.'))
      .finally(() => setLocating(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!position) throw new Error('Position GPS requise');
      if (!breakdown) throw new Error('Veuillez sélectionner le type de panne');

      const { mission } = await missionService.createMission({
        client_lat:        position.lat,
        client_lng:        position.lng,
        breakdown_type:    breakdown,
        breakdown_details: details,
        vehicle_brand:     vehicle.brand || undefined,
        vehicle_model:     vehicle.model || undefined,
        vehicle_year:      vehicle.year ? Number(vehicle.year) : undefined,
        vehicle_plate:     vehicle.plate || undefined,
      });

      if (photos.length > 0) {
        await missionService.uploadMissionPhotos(mission.uuid, photos);
      }

      return mission;
    },
    onSuccess: (mission) => {
      toast.success('Demande envoyée ! Recherche d\'un dépanneur...');
      navigate(`/client/tracking/${mission.uuid}`, { replace: true });
    },
    onError: (err: ApiError) => {
      if (err.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(err.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
        setErrors(mapped);
      } else {
        toast.error(err.message);
      }
    },
  });

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setPhotos(files);
  };

  return (
    <div className="px-4 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button onClick={() => navigate(-1)} className="text-brand-muted text-sm mb-3 flex items-center gap-1">
          ← Retour
        </button>
        <h1 className="text-brand-text text-xl font-bold">Demander un dépannage</h1>
        <p className="text-brand-muted text-sm">Décrivez votre situation pour trouver un dépanneur rapidement</p>
      </div>

      {/* Position GPS */}
      <div className={cn(
        'rounded-xl p-4 flex items-center gap-3',
        position ? 'bg-green-500/10 border border-green-500/20' : 'bg-surface border border-brand-border',
      )}>
        {locating ? (
          <>
            <div className="w-9 h-9 bg-surface-raised rounded-lg flex items-center justify-center">
              <span className="text-sm animate-spin">⟳</span>
            </div>
            <div>
              <p className="text-brand-text text-sm font-medium">Localisation en cours…</p>
              <p className="text-brand-muted text-xs">Veuillez autoriser l'accès au GPS</p>
            </div>
          </>
        ) : position ? (
          <>
            <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 text-sm font-medium">Position détectée</p>
              <p className="text-brand-muted text-xs">
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </p>
            </div>
          </>
        ) : (
          <p className="text-red-400 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" /> Impossible de détecter la position
          </p>
        )}
      </div>

      {/* Type de panne */}
      <div>
        <p className="text-brand-text text-sm font-medium mb-3">Type de panne *</p>
        <div className="grid grid-cols-2 gap-2">
          {BREAKDOWN_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setBreakdown(type)}
              className={cn(
                'px-3 py-3 rounded-xl text-xs font-medium text-left transition-all border',
                breakdown === type
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'bg-surface border-brand-border text-brand-muted hover:border-primary/50',
              )}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.breakdown_type && <p className="text-red-400 text-xs mt-1">{errors.breakdown_type}</p>}
      </div>

      {/* Détails */}
      <div>
        <label className="text-brand-text text-sm font-medium block mb-2">
          Description (optionnel)
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Décrivez le problème en détail…"
          rows={3}
          className="w-full bg-surface border border-brand-border rounded-xl px-4 py-3
                     text-brand-text text-sm placeholder-brand-muted resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Véhicule */}
      <div>
        <p className="text-brand-text text-sm font-medium mb-3">Véhicule (optionnel)</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Marque"  value={vehicle.brand} onChange={(e) => setVehicle((v) => ({ ...v, brand: e.target.value }))}  placeholder="Renault" />
          <Input label="Modèle"  value={vehicle.model} onChange={(e) => setVehicle((v) => ({ ...v, model: e.target.value }))}  placeholder="Clio" />
          <Input label="Année"   type="number" value={vehicle.year}  onChange={(e) => setVehicle((v) => ({ ...v, year: e.target.value }))}   placeholder="2020" />
          <Input label="Immatriculation" value={vehicle.plate} onChange={(e) => setVehicle((v) => ({ ...v, plate: e.target.value }))} placeholder="XXX-123-XX" />
        </div>
      </div>

      {/* Photos */}
      <div>
        <p className="text-brand-text text-sm font-medium mb-3">Photos du véhicule (max 5)</p>
        <label className="block w-full border-2 border-dashed border-brand-border rounded-xl
                          p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
          <Camera className="w-6 h-6 mx-auto mb-1 text-brand-muted" />
          <span className="text-brand-muted text-sm">
            {photos.length > 0
              ? `${photos.length} photo(s) sélectionnée(s)`
              : 'Appuyer pour ajouter des photos'}
          </span>
        </label>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={() => { setErrors({}); mutate(); }}
        loading={isPending}
        disabled={!position || !breakdown}
        className="sticky bottom-4"
      >
        <AlertCircle className="w-5 h-5 inline mr-2" /> Envoyer la demande de dépannage
      </Button>
    </div>
  );
}
