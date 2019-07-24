<?php
include('../_class.php');

if (isset($_GET['starID']) && isset($_GET['otherID']) && isset($_GET['title'])) {
	if (!empty($_GET['starID']) && !empty($_GET['otherID']) && !empty($_GET['title'])) {
		$starID = $_GET['starID'];
		$otherID = $_GET['otherID'];
		$title = $_GET['title'];

		global $pdo;
		$query = $pdo->prepare("SELECT * FROM starrelations WHERE starID = :starID AND otherstarID = :otherID");
		$query->bindParam(':starID', $starID);
		$query->bindParam(':otherID', $otherID);
		$query->execute();

		if(!$query->rowCount()){
			$query = $pdo->prepare("INSERT INTO starrelations(starID, otherstarID, name) VALUES(:starID, :otherID, :title)");
			$query->bindParam(':starID', $starID);
			$query->bindParam(':otherID', $otherID);
			$query->bindParam(':title', $title);
			$query->execute();
		}
	}
}