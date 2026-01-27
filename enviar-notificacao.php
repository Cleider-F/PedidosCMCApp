<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$titulo = $data['titulo'] ?? "Novo pedido";
$corpo  = $data['corpo'] ?? "";

$tokensFile = 'tokens.json';
if(!file_exists($tokensFile)){
    echo json_encode(['status'=>'erro','msg'=>'Nenhum token encontrado']);
    exit;
}

$tokens = json_decode(file_get_contents($tokensFile), true);
$serverKey = "BFjRfkUJ8hXuoy7gWDDfUzSN28VQxTFrR2UrYgxLe_1oZehIdFVfNHdZba21LN9afSHWiKUppajQ2fQGeWR3-n0"; // do Firebase Console > Configurações do projeto > Cloud Messaging

$fields = [
    'registration_ids' => $tokens,
    'notification' => [
        'title' => $titulo,
        'body' => $corpo,
        'icon' => '/suzano-logo.png'
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://fcm.googleapis.com/fcm/send");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: key=' . $serverKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));

$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>
