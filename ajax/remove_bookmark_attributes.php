<?php
include('../_class.php');

if (isset($_POST['bookmarkID'])) {
	if (!empty($_POST['bookmarkID'])) {
		$bookmarkID = $_POST['bookmarkID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM bookmarkattributes WHERE bookmarkID = ?");
		$query->bindValue(1, $bookmarkID);
		$query->execute();
	}
}