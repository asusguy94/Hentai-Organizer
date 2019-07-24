<?php
include('../_class.php');

if (isset($_GET['starID']) && isset($_GET['otherID']) && isset($_GET['title']) && isset($_GET['refID'])) {
	if (!empty($_GET['starID']) && !empty($_GET['otherID']) && !empty($_GET['title']) && !empty($_GET['refID'])) {
		$starID = $_GET['starID'];
		$otherID = $_GET['otherID'];
		$title = $_GET['title'];
		$refID = $_GET['refID'];

		global $pdo;
		$query = $pdo->prepare("SELECT * FROM starrelations WHERE starID = :starID AND otherstarID = :otherID && name = :title");
		$query->bindParam(':starID', $starID);
		$query->bindParam(':otherID', $otherID);
		$query->bindParam(':title', $title);
		$query->execute();

		if(!$query->rowCount()){
			$query = $pdo->prepare("UPDATE starrelations SET starID = :starID, otherstarID = :otherID, name = :title WHERE id = :id");
			$query->bindParam(':starID', $starID);
			$query->bindParam(':otherID', $otherID);
			$query->bindParam(':title', $title);
			$query->bindParam(':id', $refID);
			$query->execute();
		}
	}
}