<?php
include('../_class.php');
$date_class = new Date();

if (isset($_POST['date']) && isset($_POST['videoID'])) {
	if (!empty($_POST['date']) && !empty($_POST['videoID'])) {
		$date_str = $_POST['date'];
		$videoID = $_POST['videoID'];

		$date = $date_class->stringToDate($date_str);

		$query = $pdo->prepare("UPDATE videos SET date_published = :date WHERE id = :videoID");
		$query->bindParam(':date', $date);
		$query->bindParam(':videoID', $videoID);
		$query->execute();
	}
}
