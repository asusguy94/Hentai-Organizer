<?php
include '_class.php';
$basic = new Basic();
$video = new Video();
global $pdo;
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head('Star Search', ['bootstrap', 'prettydropdown', 'search'], ['jquery', 'lazyload', 'prettydropdown', 'star.search'])?>
    </head>

    <body>
        <nav><?php $basic->navigation()?></nav>
        <main class="container-fluid">
            <div class="row">
                <aside class="col-2">

<h2>Breast</h2>
<?php
$query = $pdo->prepare("SELECT breast FROM stars WHERE breast IS NOT NULL GROUP BY breast");
$query->execute();
if ($query->rowCount()) {
    print '<div id="breasts">';
    foreach ($query->fetchAll() as $data) {
        print '<div class="input-wrapper">';
        print "<input type='radio' name='breast' id='breast_$data[breast]'>";
        print "<label for='breast_$data[breast]'>$data[breast]</label>";
        print '</div>';
    }
    print '</div>';
}
?>

<h2>Eye Color</h2>
<?php
$query = $pdo->prepare("SELECT eyecolor FROM stars WHERE eyecolor IS NOT NULL GROUP BY eyecolor");
$query->execute();
if ($query->rowCount()) {
    print '<div id="eye">';
    foreach ($query->fetchAll() as $data) {
        print '<div class="input-wrapper">';
        print "<input type='radio' name='eye' id='eye_$data[eyecolor]'>";
        print "<label for='eye_$data[eyecolor]'>$data[eyecolor]</label>";
        print '</div>';
    }
    print '</div>';
}
?>

<h2>Hair Color</h2>
<?php
$query = $pdo->prepare("SELECT haircolor FROM stars WHERE haircolor IS NOT NULL GROUP BY haircolor");
$query->execute();
if ($query->rowCount()) {
    print '<div id="hair">';
    foreach ($query->fetchAll() as $data) {
        print '<div class="input-wrapper">';
        print "<input type='radio' name='hair' id='hair_$data[haircolor]'>";
        print "<label for='hair_$data[haircolor]'>$data[haircolor]</label>";
        print '</div>';
    }
    print '</div>';
}
?>

                    <h2>Hair Style</h2>
<?php
$query = $pdo->prepare("SELECT hairstyle FROM stars WHERE hairstyle IS NOT NULL GROUP BY hairstyle");
$query->execute();
if ($query->rowCount()) {
    print '<div id="hairstyle">';
    foreach ($query->fetchAll() as $data) {
        print '<div class="input-wrapper">';
        print "<input type='radio' name='hairstyle' id='hairstyle_$data[hairstyle]'>";
        print "<label for='hairstyle_$data[hairstyle]'>$data[hairstyle]</label>";
        print '</div>';
    }
    print '</div>';
}
?>

<h2>Attributes</h2>
<?php
$query = $pdo->prepare("SELECT * FROM attributes JOIN starattributes ON attributes.id = starattributes.attributeID GROUP BY attributes.id ORDER BY name");
$query->execute();
if ($query->rowCount()) {
    print '<div id="attributes">';

    foreach ($query->fetchAll() as $data) {
        print '<div class="input-wrapper">';
        print "<input type='checkbox' name='attribute_$data[name]' id='attribute_$data[name]'>";
        print "<label for='attribute_$data[name]'>$data[name]</label>";
        print '</div>';
    }
    print '</div>';
}
?>
                </aside>
                <section id="stars" class="col-10"></section>
            </div>
        </main>
    </body>
</html>