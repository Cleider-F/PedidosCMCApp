<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if(!isset($data['token']) || !isset($data['acao'])){
    echo json_encode(['status'=>'erro', 'msg'=>'Token ou ação não informados']);
    exit;
}

$token = $data['token'];
$acao = $data['acao'];

$arquivo = 'tokens.json';
$tokens = [];

if(file_exists($arquivo)){
    $tokens = json_decode(file_get_contents($arquivo), true);
}

// Ativar token
if($acao === 'ativar' && !in_array($token, $tokens)){
    $tokens[] = $token;
}

// Desativar token
if($acao === 'desativar'){
    $tokens = array_filter($tokens, fn($t) => $t !== $token);
}

// Salva novamente
file_put_contents($arquivo, json_encode(array_values($tokens)));

echo json_encode(['status'=>'ok', 'acao'=>$acao]);
?>
