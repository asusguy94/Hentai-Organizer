<?php
include '_class.php';
$basic = new Basic();
$video = new Video();
global $pdo;
?>

<!doctype html>
<html>
    <head>
        <?php $basic->head('Video Search', array('jqueryui', 'bootstrap', 'search'), array('jquery', 'jqueryui', 'bootstrap', 'lazyload', 'video.search'))?>
    </head>

    <body>
        <nav><?php $basic->navigation()?></nav>
        <main class="container-fluid">
            <div class="row">
                <aside class="col-2">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <label class="btn btn-primary">
                            <input type="radio" name="cen" value="cen">Censored
                        </label>

                        <label class="btn btn-primary active">
                            <input type="radio" name="cen" value="0" checked>All
                        </label>

                        <label class="btn btn-primary">
                            <input type="radio" name="cen" value="ucen">Uncensored
                        </label>
                    </div>

                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <label class="btn btn-primary">
                            <input type="radio" name="nostar" value="no-star">No Star
                        </label>

                        <label class="btn btn-primary active">
                            <input type="radio" name="nostar" value="0" checked>All
                        </label>

                        <label class="btn btn-primary">
                            <input type="radio" name="nostar" value="has-star">Has Star
                        </label>
                    </div>

                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <label class="btn btn-primary">
                            <input type="radio" name="quality" value="!1080">!1080p
                        </label>

                        <label class="btn btn-primary active">
                            <input type="radio" name="quality" value="0" checked>All
                        </label>

                        <label class="btn btn-primary">
                            <input type="radio" name="quality" value="1080">1080p
                        </label>
                    </div>

                    <br><br>

                    <div class="input-wrapper">
                        <label for="title">Title </label>
                        <input type="text" name="title" placeholder="15 Bishoujo Hyouryuuki Episode 1" autofocus>
                    </div>

                    <div class="input-wrapper">
                        <input type="checkbox" name="existing" data-toggle="switchbutton" data-width="100"
                               data-offlabel="Any" data-onlabel="Existing">
                    </div>

                    <h2>Sort</h2>
                    <div class="input-wrapper selected">
                        <input id="alphabetically" type="radio" name="sort" checked>
                        <label for="alphabetically">A-Z</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="alphabetically_desc" type="radio" name="sort">
                        <label for="alphabetically_desc">Z-A</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="added" type="radio" name="sort">
                        <label for="added">Old Upload</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="added_desc" type="radio" name="sort">
                        <label for="added_desc">Recent Upload</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="date" type="radio" name="sort">
                        <label for="date">Oldest</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="date_desc" type="radio" name="sort">
                        <label for="date_desc">Newest</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="plays_desc" type="radio" name="sort">
                        <label for="plays_desc">Most Popular</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="plays" type="radio" name="sort">
                        <label for="plays">Least Popular</label>
                    </div>

<h2>Categories</h2>
<?php
$query = $pdo->prepare("SELECT * FROM categories ORDER BY name");
$query->execute();
if ($query->rowCount()) {
    print '<div id="categories">';
    print "<div class='input-wrapper'><input type='checkbox' name='category_NULL' id='category_NULL'><label for='category_NULL'>NULL</label></div>";
    foreach ($query->fetchAll() as $data) {
        print '<div class="input-wrapper">';
        print "<input type='checkbox' name='category_$data[name]' id='category_$data[name]'>";
        print "<label for='category_$data[name]'>$data[name]</label>";
        print '</div>';
    }
    print '</div>';
}
?>

<h2>Attributes</h2>
<?php
$query = $pdo->prepare("SELECT * FROM attributes ORDER BY name");
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

                <section id="videos" class="col-10">
                    <h2 class="text-center"><span id="video-count">0</span> Videos</h2>
                    <div id="update" class="col btn btn-outline-primary d-none">Update Data</div>
                    <div id="loader"></div>
                </section>
            </div>
        </main>
    </body>
</html>