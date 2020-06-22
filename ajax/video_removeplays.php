<?php
include('../_class.php');

if (isset($_POST['videoID'])) {
	if (!empty($_POST['videoID'])) {
		$videoID = $_POST['videoID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM plays WHERE videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
	}
}