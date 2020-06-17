<?php
    include('_class.php');
    $basic = new Basic();
?>

<!doctype html>
<html>
    <head>
        <?php $basic->head('Settings', ['bootstrap'], ['jquery', 'bootstrap']) ?>
    </head>

    <body>
        <nav>
            <?php $basic->navigation() ?>
        </nav>

        <main class="container">
            <div class="row">
                <section class="col">
                    <form method="post">
                        <h2>Settings</h2>

                        <h4>Functionality</h4>
                        <!-- HTTPS -->
                        <fieldset class="form-group" data-toggle="tooltip" data-placement="right" data-html="true"
                                  title="Use HTTPS instead of HTTP<br>">
                            <div class="row">
                                <legend class="col-form-label col-2 pt-0">HTTPS</legend>
                                <div class="col-10">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="enable_https"
                                               data-toggle="switchbutton" data-onlabel="HTTPS"
                                               data-offlabel="HTTP" <? if (enableHTTPS) echo 'checked' ?>>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <!-- CDN -->
                        <fieldset class="form-group">
                            <div class="row">
                                <legend class="col-form-label col-2 pt-0">CDN</legend>
                                <div class="col-10">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="cdn"
                                               data-toggle="switchbutton" data-onlabel="Enable"
                                               data-offlabel="Disable" <? if (CDN) echo 'checked' ?>>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <!-- FA -->
                        <fieldset class="form-group" data-toggle="tooltip" data-placement="right" data-html="true"
                                  title="Use FontAwesome icons<br><u>DEBUG ONLY</u>">
                            <div class="row">
                                <legend class="col-form-label col-2 pt-0">FontAwesome</legend>
                                <div class="col-10">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="enable_fa"
                                               data-toggle="switchbutton" data-onlabel="Enable"
                                               data-offlabel="Disable" <? if (enableFA) echo 'checked' ?>>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <!-- WebM -->
                        <fieldset class="form-group" data-toggle="tooltip" data-placement="right"
                                  title="Enable .webm video files">
                            <div class="row">
                                <legend class="col-form-label col-2 pt-0">WebM</legend>
                                <div class="col-10">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="enable_webm"
                                               data-toggle="switchbutton" data-onlabel="Enable"
                                               data-offlabel="Disable" <? if (enableWEBM) echo 'checked' ?>>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <!-- MKV -->
                        <fieldset class="form-group" data-toggle="tooltip" data-placement="right"
                                  title="Enable MKV video files">
                            <div class="row">
                                <legend class="col-form-label col-2 pt-0">MKV</legend>
                                <div class="col-10">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="enable_mkv"
                                               data-toggle="switchbutton" data-onlabel="Enable"
                                               data-offlabel="Disable" <? if (enableMKV) echo 'checked' ?>>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <!-- DASH -->
                        <fieldset class="form-group" data-toggle="tooltip" data-placement="right" data-html="true"
                                  title="Enable DASH streaming instead of hardcoded video<br><u>Fallback to HLS & mp4 and <br>webm and/or mkv if enabled</u>">
                            <div class="row">
                                <legend class="col-form-label col-2 pt-0">DASH</legend>
                                <div class="col-10">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="enable_dash"
                                               data-toggle="switchbutton" data-onlabel="Enable"
                                               data-offlabel="Disable" <? if (enableDASH) echo 'checked' ?>>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <!-- HLS -->
                        <fieldset class="form-group" data-toggle="tooltip" data-placement="right" data-html="true"
                                  title="Enable HLS streaming instead of hardcoded video<br><u>Fallback to mp4 and <br>webm and/or mkv if enabled</u>">
                            <div class="row">
                                <legend class="col-form-label col-2 pt-0">HLS</legend>
                                <div class="col-10">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="enable_hls"
                                               data-toggle="switchbutton" data-onlabel="Enable"
                                               data-offlabel="Disable" <? if (enableHLS) echo 'checked' ?>>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <h4>Thumbnail</h4>
                        <!-- Thumbnail RES -->
                        <div class="form-group row" data-toggle="tooltip" data-placement="right" data-html="true"
                             title="Height of video thumbnails<br><u>Run &quot;Generate Thumbnails&quot; after changing</u>">
                            <label for="thumbnail-res" class="col-form-label col-2">Height</label>
                            <div><input type="number" class="form-control col-4" id="thumbnail-res" name="thumbnail_res"
                                        min="0"
                                        value="<?= THUMBNAIL_RES ?>"></div>
                        </div>

                        <!-- Thumbnail START -->
                        <div class="form-group row" data-toggle="tooltip" data-placement="right" data-html="true"
                             title="Start time of video thumbnails<br><u>Run &quot;Generate Thumbnails&quot; after changing</u>">
                            <label for="thumbnail-start" class="col-form-label col-2">Start</label>
                            <div><input type="number" class="form-control col-4" id="thumbnail-start"
                                        name="thumbnail_start" min="0"
                                        value="<?= THUMBNAIL_START ?>"></div>
                        </div>

                        <h4>CDN</h4>
                        <!-- CDN MAX -->
                        <div class="form-group row" data-toggle="tooltip" data-placement="right" data-html="true"
                             title="Number of CDN's to use.<br>CDN's would be formatted like cdn1.localhost, cnd2.localhost etc">
                            <label for="cdn-max" class="col-form-label col-2">CDN Limit</label>
                            <div><input type="number" class="form-control col-8" id="cdn-max" name="cdn_max" min="0"
                                        max="5"
                                        value="<?= CDN_MAX ?>"></div>
                        </div>

                        <button type="submit" class="btn btn-primary" name="submit">Save</button>
                        
                        <?php
                            
                            if (isset($_POST['submit'])) {
                                $names = [
                                    'enable_https', 'cdn', 'enable_fa', 'enable_webm', 'enable_mkv',
                                    'enable_dash', 'enable_hls', 'thumbnail_res', 'thumbnail_start', 'cdn_max',
                                ];
                                $values = array_map(function ($item) {
                                    $val = $_POST[$item];
                                    
                                    if (empty($val) || $val == 'off') {
                                        return 0;
                                    } else if ($val == 'on') {
                                        return 1;
                                    } else {
                                        return $val;
                                    }
                                }, $names);
                                
                                Settings::setSettings($names, $values);
                                Basic::reload();
                            }
                        
                        ?>
                    </form>
                </section>
            </div>
        </main>
    </body>
</html>

<script>$('[data-toggle="tooltip"]').tooltip()</script>