<?php
include('../_class.php');

if (isset($_POST['videoID']) && isset($_POST['aliasID']) && isset($_POST['aliasName'])) {
	if (!empty($_POST['videoID']) && !empty($_POST['aliasID']) && !empty($_POST['aliasName'])) {
		$videoID = $_POST['videoID'];
		$aliasID = $_POST['aliasID'];
		$aliasName = $_POST['aliasName'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videoalias WHERE videoID = :videoID AND name = :aliasName LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':aliasName', $aliasName);
		$query->execute();
		if(!$query->rowCount()){
			$query = $pdo->prepare("UPDATE videoalias SET name = :aliasName WHERE id = :aliasID");
			$query->bindParam(':aliasName', $aliasName);
			$query->bindParam(':aliasID', $aliasID);
			$query->execute();
		}
	}
}