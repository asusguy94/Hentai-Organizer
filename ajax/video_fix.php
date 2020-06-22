<?php
include('../_class.php');
global $pdo;

$ffmpeg = new FFMPEG();
$ffmpeg->rootFix = true;

if (isset($_GET['videoID'])) {
	if (!empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];

		$query = $pdo->prepare("SELECT path FROM videos WHERE id = :videoID LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		if ($query->rowCount()) {
			$fname = $query->fetch()['path'];
			
            $closestQ = Basic::getClosestQ($ffmpeg->getVideoHeight($fname));
            $duration = $ffmpeg->getDuration($fname);

			$query = $pdo->prepare("UPDATE videos SET height = :height, duration = :duration, date = NOW() WHERE id = :videoID");
            $query->bindParam(':height', $closestQ);
            $query->bindParam(':duration', $duration);
			$query->bindParam(':videoID', $videoID);
			$query->execute();
			
			// Temporarily remove files
            unlink("../images/videos/$videoID.jpg");
            unlink(sprintf("../images/videos/$videoID-%s.jpg", THUMBNAIL_RES));
            unlink("../images/thumbnails/$videoID.jpg");
            unlink("../vtt/$videoID.vtt");
		}
	}
}