<?php
	include('_class.php');

	$basic = new Basic();
	$db = new DB();
	$ffmpeg = new FFMPEG();
?>

    <!doctype html>
    <html>
        <head>
			<?php $basic->head('', ['bootstrap'], ['stretchy']) ?>
        </head>

        <body>
            <nav>
				<?php $basic->navigation() ?>
            </nav>
        </body>
    </html>

<?php
	global $pdo;
	$files = glob('videos/*.mp4');
	$newFiles = [];

	foreach ($files as $path) {
		$file = $basic->pathToFname($path);

		if (!$db->videoExists($file)) {
			array_push($newFiles, $file);
		}
	}

	$query = $pdo->prepare("SELECT id, path FROM videos WHERE duration = 0 OR height = 0");
	$query->execute();
	foreach ($query->fetchAll() AS $item) {
		$query = $pdo->prepare("UPDATE videos SET duration = :duration, height = :height WHERE id = :id");
		$query->bindParam('id', $item['id']);

        $duration = $ffmpeg->getDuration($item['path']);
        $query->bindParam('duration', $duration);

        $videoHeight = $ffmpeg->getVideoHeight($item['path']);
        $query->bindParam('height', $videoHeight);
        
        $query->execute();
	}

	if (isset($_POST['submit'])) {
		if (count(array_filter($_POST)) === count($_POST)) { // check if all fields are filled out!
			$titleArr = [];
			$episodeArr = [];
			$franchiseArr = [];
			$fnameArr = [];
			foreach ($_POST['title'] as $data) {
				array_push($titleArr, $data);
			}
			foreach ($_POST['episode'] as $data) {
				array_push($episodeArr, $data);
			}
			foreach ($_POST['franchise'] as $data) {
				array_push($franchiseArr, $data);
			}
			foreach ($_POST['fname'] as $data) {
				array_push($fnameArr, $data);
			}

			for ($i = 0; $i < count($fnameArr); $i++) {
				$query = $pdo->prepare("INSERT INTO videos(name, episode, path, franchise, duration, height, date) VALUES(:name, :episode, :path, :franchise, :duration, :height, NOW())");
				$query->bindParam('name', $titleArr[$i]);
				$query->bindParam('episode', $episodeArr[$i]);
				$query->bindParam('path', $fnameArr[$i]);
				$query->bindParam('franchise', $franchiseArr[$i]);

                $duration = $ffmpeg->getDuration($fnameArr[$i]);
                $query->bindParam('duration', $duration);

                $videoHeight = Basic::getClosestQ($ffmpeg->getVideoHeight($fnameArr[$i]));
                $query->bindParam('height', $videoHeight);

				$query->execute();
			}

			header('Location: video_generatethumbnails.php');
		}
	} else if (count($newFiles)) {
		print '<form method="post" id="addVideos">';
		$len = count($newFiles);
		for ($i = 0; $i < $len; $i++) {
			print '<div class="row">';

			print '<div class="col-5"></div>';
			print '<div class="col-2">';

			print '<div class="form-group">';
			print '<label for="fname[]">FileName</label><br>';
			print sprintf("<input type='text' name='fname[]' value='%s'><br>", htmlspecialchars($newFiles[$i], ENT_QUOTES));
			print '</div>';

			print '<div class="form-group">';
			print '<label for="title[]">Title</label><br>';
			print sprintf("<input type='text' name='title[]' value='%s'><br>", htmlspecialchars($basic->generateName($newFiles[$i]), ENT_QUOTES));
			print '</div>';

			print '<div class="form-group">';
			print '<label for="franchise[]">Franchise</label><br>';
			print sprintf("<input type='text' name='franchise[]' value='%s'><br>", htmlspecialchars($basic->generateFranchise($newFiles[$i]), ENT_QUOTES));
			print '</div>';

			print '<div class="form-group">';
			print '<label for="episode[]">Episode</label><br>';
			print sprintf("<input type='number' name='episode[]' value='%s'><br>", $basic->generateEpisode($newFiles[$i]));
			print '</div>';

			if ($i < $len - 1) print '<br><hr>';
			else print '<input type="submit" class="btn btn-primary" name="submit" value="Save Changes">';
			print '</div>'; // .col-2

			print '</div>'; // .row

			if ($i < $len - 1) print '<br>';
		}
		print '</form>';
	}