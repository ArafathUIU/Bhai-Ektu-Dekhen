<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$a = App\Models\AiAnalysis::where('report_id', 8)->first();
echo 'analysis8 status: '.$a?->status.PHP_EOL;
echo 'analysis8 metadata: '.json_encode($a?->metadata).PHP_EOL;

$m = App\Models\IssueMatch::where('report_id', 8)->first();
echo 'match: '.json_encode($m?->toArray()).PHP_EOL;
echo 'report8 issue_id: '.App\Models\Report::find(8)?->issue_id.PHP_EOL;

$reports = App\Models\Report::whereIn('id', [7, 8])->get();
foreach ($reports as $r) {
    $an = $r->analyses()->latest()->first();
    echo 'report '.$r->id.' '.$r->public_id.' status='.$r->status.' issue_id='.($r->issue_id ?? 'NULL')
        .' analysis='.($an?->status ?? 'NULL').' embedding='.(is_array($an?->embedding) ? count($an->embedding).'d' : 'NULL')
        .' severity='.($an?->severity_score ?? 'NULL').PHP_EOL;
}