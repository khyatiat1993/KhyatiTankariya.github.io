<?php
$apiUrl = 'https://esonline.edusports.in/esonline-int/retrieve_data_via_api/api/v1/student_assessment/?esid=232954463,38249354&date=01012023,01082023';
$apiKey = 'e4xxO1WGZ6fEjGAalWin';
$apiSecret = 'kFY2QNctvrHfv1jaFCicI1kxaTBLZhYuwfgUsdek8z0B08a7Be';

// Set the Content-Type header
$headers = [
    'Content-Type: application/json',
    'API_KEY: ' . $apiKey,
];

// Initialize cURL session
$ch = curl_init($apiUrl);

// Set cURL options
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Use this for self-signed certificates

// Execute the GET request
$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    echo 'cURL error: ' . curl_error($ch);
}

// Close cURL session
curl_close($ch);

// Output the API response
echo $response;
