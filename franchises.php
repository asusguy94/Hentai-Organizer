<?php
include '_class.php';
$basic = new Basic();
$franchise = new Franchise();
?>

<!doctype html>
<html>
<head>
	<?php $basic->head('', ['jqueryui', 'contextmenu'], ['jquery', 'jqueryui', 'contextmenu', 'franchises'])?>
</head>

<body>
<nav><?php $basic->navigation()?></nav>
<main>
	<section>
		<h2>Franchises</h2>
        <?php $franchise->fetchFranchises()?>
	</section>
</main>
</body>
</html>