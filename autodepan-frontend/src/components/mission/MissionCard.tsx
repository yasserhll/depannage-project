import { useNavigate } from 'react-router-dom';
import { MapPin, Car, Ruler } from 'lucide-react';
import { Card, CardBody } from '@/components/common/Card';
import { MissionBadge } from '@/components/common/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Mission } from '@/types/mission.types';

interface MissionCardProps {
  mission:   Mission;
  roleBase?: 'client' | 'depanneur';
}

export function MissionCard({ mission, roleBase = 'client' }: MissionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (mission.status === 'en_route' || mission.status === 'accepted') {
      navigate(`/${roleBase}/tracking/${mission.uuid}`);
    } else {
      navigate(`/${roleBase}/missions/${mission.uuid}`);
    }
  };

  return (
    <Card onClick={handleClick} className="mb-3">
      <CardBody>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-brand-text font-semibold text-sm truncate">
              {mission.breakdown_type}
            </p>
            {mission.client_address && (
              <p className="text-brand-muted text-xs mt-0.5 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" /> {mission.client_address}
              </p>
            )}
          </div>
          <MissionBadge status={mission.status} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-brand-muted">
            {mission.vehicle_brand && (
              <span className="flex items-center gap-1">
                <Car className="w-3 h-3" /> {mission.vehicle_brand} {mission.vehicle_model}
              </span>
            )}
            {mission.distance_km && (
              <span className="flex items-center gap-1">
                <Ruler className="w-3 h-3" /> {mission.distance_km} km
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mission.final_price ? (
              <span className="text-green-400 font-bold text-sm">
                {formatCurrency(mission.final_price)}
              </span>
            ) : mission.estimated_price ? (
              <span className="text-brand-muted text-xs">
                ~{formatCurrency(mission.estimated_price)}
              </span>
            ) : null}
          </div>
        </div>

        <p className="text-brand-muted text-[10px] mt-2">
          {formatDate(mission.created_at)}
        </p>
      </CardBody>
    </Card>
  );
}
