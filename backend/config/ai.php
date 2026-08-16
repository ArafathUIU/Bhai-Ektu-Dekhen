<?php

return [
    /*
    | Duplicate detection tuning.
    */
    'duplicate_geo_radius_m' => (float) env('DUPLICATE_GEO_RADIUS_M', 300),
    'duplicate_overall_threshold' => (float) env('DUPLICATE_OVERALL_THRESHOLD', 0.70),
];
