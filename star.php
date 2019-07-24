<?php
include('_class.php');
$basic = new Basic();
$stars = new Star();

if (isset($_GET['id']) && !empty($_GET['id']))
	$id = $_GET['id'];
else
	header('Location: index.php');
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head($stars->getStar($id), array('bootstrap', 'jqueryui', 'contextmenu', 'autocomplete', 'fa', 'star'), array('jquery', 'jqueryui', 'contextmenu', 'autocomplete', 'star')) ?>
    </head>

    <body>
        <nav><?php $basic->navigation() ?></nav>
        <main class="container-fluid">
            <div class="row">
                <section class="col-7">
					<?php
					$stars->fetchStar($id);
					?>
                </section>

                <aside class="col-5">
                    <div id="relations">
                        <h1>Relations</h1>
                        <div class="row">
                            <div class="col-12">
                                <button id="relation-add" class="btn btn-primary">Add</button>
                            </div>
                        </div>


						<?php $stars->getRelations($id) ?>
                    </div>

                    <div id="relations">
						<?php $stars->getRelations_other($id) ?>
                    </div>
               </aside>
        </main>
    </body>
</html>