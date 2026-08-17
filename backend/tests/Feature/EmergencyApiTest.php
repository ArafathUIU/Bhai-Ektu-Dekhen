<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class EmergencyApiTest extends TestCase
{
    public function test_nearby_returns_grouped_stations_sorted_by_distance(): void
    {
        Http::fake([
            'overpass-api.de/*' => Http::response([
                'elements' => [
                    [
                        'type' => 'node',
                        'lat' => 23.811,
                        'lon' => 90.412,
                        'tags' => ['amenity' => 'police', 'name' => 'Ramna Police Station', 'phone' => '+880 2 935 5348'],
                    ],
                    [
                        'type' => 'node',
                        'lat' => 23.835,
                        'lon' => 90.425,
                        'tags' => ['amenity' => 'fire_station', 'name' => 'Lalbagh Fire Station', 'contact:phone' => '+8801712123456'],
                    ],
                ],
            ]),
        ]);

        $response = $this->getJson('/api/v1/emergency/nearby?lat=23.8103&lng=90.4125&radius=10000');

        $response->assertOk()
            ->assertJsonPath('data.source', 'overpass')
            ->assertJsonCount(1, 'data.police_stations')
            ->assertJsonCount(1, 'data.fire_stations')
            ->assertJsonPath('data.police_stations.0.name', 'Ramna Police Station')
            ->assertJsonPath('data.police_stations.0.phone', '+88029355348')
            ->assertJsonCount(3, 'data.emergency_numbers');
    }

    public function test_nearby_returns_fallback_when_overpass_fails(): void
    {
        Http::fake([
            'overpass-api.de/*' => Http::response('', 503),
        ]);

        $response = $this->getJson('/api/v1/emergency/nearby?lat=23.8103&lng=90.4125');

        $response->assertOk()
            ->assertJsonPath('data.source', 'fallback')
            ->assertJsonCount(1, 'data.police_stations')
            ->assertJsonCount(1, 'data.fire_stations')
            ->assertJsonCount(3, 'data.emergency_numbers');
    }

    public function test_nearby_validates_input(): void
    {
        $response = $this->getJson('/api/v1/emergency/nearby?lat=abc&lng=90.4');

        $response->assertUnprocessable();
    }
}