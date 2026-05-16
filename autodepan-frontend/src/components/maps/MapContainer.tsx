import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { OSM_TILE_URL, OSM_ATTRIBUTION, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/config/maps';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Correction icônes Leaflet avec Vite
import L from 'leaflet';
import iconUrl        from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl  from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl      from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

interface MapContainerProps {
  center?:   [number, number];
  zoom?:     number;
  className?: string;
  children?: React.ReactNode;
}

export function MapContainer({
  center    = DEFAULT_MAP_CENTER,
  zoom      = DEFAULT_MAP_ZOOM,
  className,
  children,
}: MapContainerProps) {
  return (
    <LeafletMap
      center={center}
      zoom={zoom}
      className={cn('w-full h-full z-0', className)}
      zoomControl={false}
    >
      <TileLayer
        url={OSM_TILE_URL}
        attribution={OSM_ATTRIBUTION}
        maxZoom={19}
      />
      {children}
    </LeafletMap>
  );
}
