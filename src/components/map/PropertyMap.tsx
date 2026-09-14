'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Property } from '@/types/property';
import { formatCurrency, formatArea, STATUS_LABELS } from '@/lib/utils/formatters';
import Link from 'next/link';

interface PropertyMapProps {
  mode?: 'picker' | 'viewer';
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange?: (lat: number, lng: number, address?: string, url?: string) => void;
  properties?: Property[];
  height?: string;
  initialZoom?: number;
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export default function PropertyMap({
  mode = 'viewer',
  latitude,
  longitude,
  onLocationChange,
  properties = [],
  height = '500px',
  initialZoom = 13,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeMarkerProperty, setActiveMarkerProperty] = useState<Property | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Default center: New Cairo / Madinaty (Cairo, Egypt)
  const defaultCenter = {
    lat: latitude || 30.0967,
    lng: longitude || 31.6294,
  };

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(defaultCenter);

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentCoords({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_google_maps_api_key')) {
      setApiKeyMissing(true);
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!mapRef.current || !(window as any).google) return;
        const google = (window as any).google;

        const map = new google.maps.Map(mapRef.current, {
          center: currentCoords,
          zoom: initialZoom,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a2233' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a2233' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#12252a' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b364c' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1c2536' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
          ],
          disableDefaultUI: false,
          zoomControl: true,
        });

        if (mode === 'picker') {
          const marker = new google.maps.Marker({
            position: currentCoords,
            map,
            draggable: true,
            title: 'موقع العقار',
            animation: google.maps.Animation.DROP,
          });

          map.addListener('click', (e: any) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              marker.setPosition({ lat, lng });
              setCurrentCoords({ lat, lng });
              const url = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
              onLocationChange?.(lat, lng, undefined, url);
            }
          });

          marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            if (pos) {
              const lat = pos.lat();
              const lng = pos.lng();
              setCurrentCoords({ lat, lng });
              const url = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
              onLocationChange?.(lat, lng, undefined, url);
            }
          });
        } else if (mode === 'viewer' && properties.length > 0) {
          properties.forEach((prop) => {
            if (prop.latitude && prop.longitude) {
              const marker = new google.maps.Marker({
                position: { lat: prop.latitude, lng: prop.longitude },
                map,
                title: `${prop.code} - ${prop.address}`,
              });

              marker.addListener('click', () => {
                setActiveMarkerProperty(prop);
              });
            }
          });
        }
      })
      .catch((err) => {
        console.warn('Google Maps load error:', err);
        setApiKeyMissing(true);
      });
  }, [apiKey, mode, properties]);

  const handleSimulatedMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'picker') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const simulatedLat = 30.0 + (1 - y / rect.height) * 0.15;
    const simulatedLng = 31.45 + (x / rect.width) * 0.25;

    const lat = Number(simulatedLat.toFixed(6));
    const lng = Number(simulatedLng.toFixed(6));
    setCurrentCoords({ lat, lng });
    const url = `https://maps.google.com/?q=${lat},${lng}`;
    onLocationChange?.(lat, lng, undefined, url);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Top coordinates bar */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          zIndex: 10,
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: 'rgba(15, 22, 38, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <MapPin size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {currentCoords.lat ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}` : 'حدد الموقع'}
        </span>
        {currentCoords.lat && (
          <a
            href={`https://maps.google.com/?q=${currentCoords.lat},${currentCoords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ padding: '3px 8px', fontSize: '0.75rem', gap: '4px' }}
          >
            فتح في Google Maps
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {!apiKeyMissing ? (
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div
          onClick={handleSimulatedMapClick}
          style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at center, #1B273E 0%, #0D1424 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: mode === 'picker' ? 'crosshair' : 'default',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 10,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              fontSize: '0.775rem',
              color: '#FBBF24',
            }}
          >
            {mode === 'picker' ? (
              <span>انقر على الخريطة لتحديد الإحداثيات وتوليد رابط خرائط Google.</span>
            ) : (
              <span>أضف NEXT_PUBLIC_GOOGLE_MAPS_API_KEY في .env.local لتفعيل خرائط الأقمار الصناعية المباشرة.</span>
            )}
          </div>

          {mode === 'picker' && currentCoords.lat && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  background: 'var(--primary)',
                  color: '#FFF',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                الموقع المختار
              </div>
              <MapPin size={38} color="#3B82F6" fill="#3B82F6" />
            </div>
          )}

          {mode === 'viewer' &&
            properties.map((p, idx) => {
              const topPercent = 20 + ((idx * 37) % 60);
              const leftPercent = 20 + ((idx * 53) % 65);

              return (
                <div
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMarkerProperty(p);
                  }}
                  style={{
                    position: 'absolute',
                    top: `${topPercent}%`,
                    left: `${leftPercent}%`,
                    transform: 'translate(-50%, -100%)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 20,
                  }}
                >
                  <div
                    style={{
                      background: p.colorTag || 'var(--primary)',
                      color: '#FFF',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      marginBottom: '2px',
                    }}
                  >
                    {p.code}
                  </div>
                  <MapPin size={30} color={p.colorTag || '#3B82F6'} fill={p.colorTag || '#3B82F6'} />
                </div>
              );
            })}
        </div>
      )}

      {activeMarkerProperty && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            maxWidth: '340px',
            width: 'calc(100% - 40px)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
            zIndex: 50,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#FFF' }}>{activeMarkerProperty.code}</span>
                <span className={`badge ${STATUS_LABELS[activeMarkerProperty.status]?.badgeClass || 'badge-secondary'}`}>
                  {STATUS_LABELS[activeMarkerProperty.status]?.ar}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeMarkerProperty.address}</div>
            </div>
            <button
              onClick={() => setActiveMarkerProperty(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '2px',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>الموقع: {activeMarkerProperty.locationName}</span>
            <strong style={{ color: 'var(--success)' }}>{formatCurrency(activeMarkerProperty.price)}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '8px',
              marginBottom: '12px',
            }}
          >
            <span>المساحة: {formatArea(activeMarkerProperty.area)}</span>
            <span>نوم: {activeMarkerProperty.bedrooms || '—'}</span>
            <span>حمام: {activeMarkerProperty.bathrooms || '—'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href={`/properties/${activeMarkerProperty.id}`}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, textAlign: 'center' }}
            >
              عرض التفاصيل
            </Link>
            {activeMarkerProperty.locationUrl && (
              <a
                href={activeMarkerProperty.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
