<?php
include('../_class.php');

if (isset($_POST['videoID']) && isset($_POST['aliasName'])) {
	if (!empty($_POST['videoID']) && !empty($_POST['aliasName'])) {
		$videoID = $_POST['videoID'];
		$aliasName = $_POST['aliasName'];

		global $pdo;
		$query = $pdo->prepare("SELECT name, franchise FROM videos WHERE id = :videoID LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		if ($query->rowCount()) {
			$result = $query->fetch();
			$title = $result['name'];
			$franchise = $result['franchise'];
			$aliasName .= str_replace($franchise, '', $title);

			$query = $pdo->prepare("SELECT id FROM videoalias WHERE videoID = :videoID AND name = :aliasName LIMIT 1");
			$query->bindParam(':videoID', $videoID);
			$query->bindParam(':aliasName', $aliasName);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("INSERT INTO videoalias(videoID, name) VALUES(:videoID, :aliasName)");
				$query->bindParam(':videoID', $videoID);
				$query->bindParam(':aliasName', $aliasName);
				$query->execute();
			}
		}
	}
}