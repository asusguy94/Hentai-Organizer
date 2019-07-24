<?php
include('../_class.php');

if (isset($_GET['refID'])) {
	if (!empty($_GET['refID'])) {
		$refID = $_GET['refID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM starrelations WHERE id = :id");
		$query->bindParam(':id', $refID);
		$query->execute();
	}
}