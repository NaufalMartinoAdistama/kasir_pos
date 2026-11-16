<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$routesToTest = [
    ['GET', '/', 302], // redirect to login
    ['GET', '/login', 200], // login page
];

echo "=== PENGUJIAN HTTP ENDPOINT ===\n";
foreach ($routesToTest as [$method, $uri, $expectedStatus]) {
    $request = Illuminate\Http\Request::create($uri, $method);
    $response = $kernel->handle($request);
    $status = $response->getStatusCode();
    echo "Endpoint {$method} {$uri} -> Status: {$status} (" . ($status === $expectedStatus ? "OK" : "TIDAK SESUAI") . ")\n";
}
echo "=== SELESAI ===\n";
