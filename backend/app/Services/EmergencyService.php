<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class EmergencyService
{
    private const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

    private const CACHE_TTL = 86400;

    public function nearby(float $lat, float $lng, int $radius = 10000): array
    {
        $cacheKey = 'emergency:'.round($lat, 2).':'.round($lng, 2).':'.$radius;

        return Cache::remember($cacheKey, self::CACHE_TTL, fn () => $this->fetch($lat, $lng, $radius));
    }

    protected function fetch(float $lat, float $lng, int $radius): array
    {
        $query = <<<Q
        [out:json][timeout:25];
        (
          node["amenity"="police"](around:{$radius},{$lat},{$lng});
          way["amenity"="police"](around:{$radius},{$lat},{$lng});
          node["amenity"="fire_station"](around:{$radius},{$lat},{$lng});
          way["amenity"="fire_station"](around:{$radius},{$lat},{$lng});
        );
        out center tags;
        Q;

        try {
            $response = Http::timeout(25)
                ->withHeaders(['User-Agent' => 'curl/8.5.0'])
                ->asForm()
                ->post(self::OVERPASS_URL, ['data' => $query]);

            if (!$response->ok()) {
                throw new \RuntimeException('Overpass returned '.$response->status());
            }

            $elements = $response->json('elements') ?? [];

            return $this->build($elements, $lat, $lng);
        } catch (\Throwable) {
            return $this->fallback($lat, $lng);
        }
    }

    protected function build(array $elements, float $lat, float $lng): array
    {
        $stations = ['police_stations' => [], 'fire_stations' => []];

        foreach ($elements as $element) {
            $tags = $element['tags'] ?? [];
            $name = $tags['name'] ?? null;
            if (!$name || !$this->hasGeometry($element)) {
                continue;
            }

            $item = [
                'name' => $name,
                'address' => $tags['addr:street'] ?? $tags['addr:full'] ?? null,
                'phone' => $this->pickPhone($tags),
                'latitude' => (float) ($element['lat'] ?? $element['center']['lat']),
                'longitude' => (float) ($element['lon'] ?? $element['center']['lon']),
                'distance_km' => round($this->haversine($lat, $lng, (float) ($element['lat'] ?? $element['center']['lat']), (float) ($element['lon'] ?? $element['center']['lon'])) / 1000, 2),
            ];

            $key = ($tags['amenity'] ?? '') === 'fire_station' ? 'fire_stations' : 'police_stations';
            $stations[$key][] = $item;
        }

        foreach ($stations as $key => $list) {
            usort($list, fn ($a, $b) => $a['distance_km'] <=> $b['distance_km']);
            $stations[$key] = array_slice($list, 0, 12);
        }

        return [
            ...$stations,
            'emergency_numbers' => $this->emergencyNumbers(),
            'source' => 'overpass',
        ];
    }

    protected function fallback(float $lat, float $lng): array
    {
        return [
            'police_stations' => [
                [
                    'name' => 'Dhaka Metropolitan Police (Emergency)',
                    'address' => 'Dhaka, Bangladesh',
                    'phone' => '+880999',
                    'latitude' => 23.728,
                    'longitude' => 90.385,
                    'distance_km' => round($this->haversine($lat, $lng, 23.728, 90.385) / 1000, 2),
                ],
            ],
            'fire_stations' => [
                [
                    'name' => 'Fire Service & Civil Defence HQ',
                    'address' => '33, New Elephant Road, Dhaka',
                    'phone' => '+880102',
                    'latitude' => 23.738,
                    'longitude' => 90.385,
                    'distance_km' => round($this->haversine($lat, $lng, 23.738, 90.385) / 1000, 2),
                ],
            ],
            'emergency_numbers' => $this->emergencyNumbers(),
            'source' => 'fallback',
        ];
    }

    protected function emergencyNumbers(): array
    {
        return [
            ['service' => 'National Emergency Helpline', 'number' => '999'],
            ['service' => 'Fire Service & Civil Defence', 'number' => '102'],
            ['service' => 'International Emergency (mobile)', 'number' => '112'],
        ];
    }

    protected function pickPhone(array $tags): ?string
    {
        $phone = $tags['contact:phone'] ?? $tags['phone'] ?? $tags['emergency:phone'] ?? null;
        if (!$phone) {
            return null;
        }

        return preg_replace('/\s+/', '', $phone);
    }

    protected function hasGeometry(array $element): bool
    {
        return isset($element['lat']) || isset($element['center']['lat']);
    }

    protected function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earth = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earth * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}