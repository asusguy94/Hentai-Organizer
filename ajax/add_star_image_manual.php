<?php
include('../_class.php');
$basic = new Basic();
$stars = new Star();

if (isset($_GET['id']) && !empty($_GET['id'])) {
	$id = $_GET['id'];

	global $pdo;
	$query = $pdo->prepare("UPDATE stars SET image = ? WHERE id = ?");
	$query->bindValue(1, "$id.jpg");
	$query->bindValue(2, $id);
	$query->execute();
}
