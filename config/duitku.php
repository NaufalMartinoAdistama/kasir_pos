<?php

return [
    'merchant_code' => env('DUITKU_MERCHANT_CODE', ''),
    'api_key' => env('DUITKU_API_KEY', ''),
    'is_production' => (bool) env('DUITKU_IS_PRODUCTION', false),
    'callback_url' => env('DUITKU_CALLBACK_URL', env('APP_URL') . '/duitku/callback'),
    'return_url' => env('DUITKU_RETURN_URL', env('APP_URL') . '/pelanggan/pesanan'),
    'base_url' => env('DUITKU_IS_PRODUCTION', false)
        ? 'https://api-prod.duitku.com/api/merchant'
        : 'https://api-sandbox.duitku.com/api/merchant',
];
