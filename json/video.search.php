<?php
    include('../_class.php');
    $basic = new Basic();
    $video = new Video();
    global $pdo;
    $sql = "
            SELECT videos.path, videos.height, videos.id AS videoID, videos.name AS video, videoalias.name AS alias, videos.date_published, videos.franchise, videos.noStar, attributes.name AS attribute, categories.name AS category, videos.episode, videos.cen
            FROM videos
              LEFT JOIN videoalias ON videos.id = videoalias.videoID
              LEFT JOIN videostars ON videostars.videoID = videos.id
              LEFT JOIN starattributes ON videostars.starID = starattributes.starID
              LEFT JOIN attributes ON starattributes.attributeID = attributes.id
              LEFT JOIN videocategories ON videos.id = videocategories.videoID
              LEFT JOIN categories ON videocategories.categoryID = categories.id
            
          UNION ALL
            SELECT videos.path, videos.height, videos.id AS videoID, videos.name AS video, videoalias.name AS alias, videos.date_published, videos.franchise, videos.noStar, attributes.name AS attribute, categories.name AS category, videos.episode, videos.cen
            FROM videos
              LEFT JOIN videoalias ON videos.id = videoalias.videoID
              LEFT JOIN bookmarks ON videos.id = bookmarks.videoID
              LEFT JOIN bookmarkattributes ON bookmarkattributes.bookmarkID = bookmarks.id
              LEFT JOIN attributes ON bookmarkattributes.attributeID = attributes.id
              LEFT JOIN categories ON bookmarks.categoryID = categories.id
              
          ORDER BY video, path
          ";
    
    $query = $pdo->prepare($sql);
    $query->execute();
    $result = $query->fetchAll(PDO::FETCH_OBJ);

// Initialize Arrays
    $attribute_arr = [];
    $category_arr = [];
    $alias_arr = [];
    
    print '{';
    print '"videos": [';
    for ($i = 0, $len = count($result); $i < $len; $i++) {
        $videoID = $result[$i]->videoID;
        $videoName = $result[$i]->video;
        $datePublished = $result[$i]->date_published;
        $noStar = $result[$i]->noStar;
        $franchise = $result[$i]->franchise;
        $attributeName = $result[$i]->attribute;
        $categoryName = $result[$i]->category;
        $fileName = $result[$i]->path;
        $aliasName = $result[$i]->alias;
        $cen = $result[$i]->cen;
        $quality = $result[$i]->height;
        
        $nextIsDuplicate = ($i < $len - 1 && ($result[$i + 1]->video == $videoName));
        $prevIsDuplicate = ($i > 0 && ($result[$i - 1]->video == $videoName));
        
        if (!$prevIsDuplicate) { // first video of the bunch
            print '{';
            
            $thumbnail = "images/videos/$videoID-" . THUMBNAIL_RES . ".jpg";
            
            print "\"videoID\": $videoID,";
            print "\"noStar\": " . intval($noStar) . ",";
            print "\"cen\": \"$cen\",";
            print "\"franchise\": \"$franchise\",";
            print "\"videoName\": \"$videoName\",";
            print "\"datePublished\": \"$datePublished\",";
            print "\"thumbnail\": \"$thumbnail\",";
            print "\"plays\": \"" . getPlays($videoID) . "\",";
            print "\"existing\": \"" . (int)Basic::file_check($fileName, $videoID, false) . "\",";
            print "\"quality\": \"$quality\",";
        }
        
        // Init Arrays
        initArray($attribute_arr, $attributeName);
        initArray($category_arr, $categoryName);
        initArray($alias_arr, $aliasName);
        
        if (!$nextIsDuplicate) {
            /* Build Arrays */
            handleArray('attribute', $attribute_arr);
            handleArray('category', $category_arr);
            handleArray('alias', $alias_arr, true);
            
            if ($i < $len - 1) print '},';
            else print '}';
            
            // Reset Arrays
            $attribute_arr = [];
            $category_arr = [];
            $alias_arr = [];
        }
    }
    
    print ']';
    print '}';
    
    function initArray(&$arr, $item)
    {
        if (!is_null($item)) {
            if (!in_array($item, $arr)) array_push($arr, $item);
        }
    }
    
    function handleArray($label, $arr, $last = false)
    {
        print '"' . $label . '": [';
        if (count($arr)) {
            for ($j = 0; $j < count($arr); $j++) {
                print "\"$arr[$j]\"";
                if ($j < count($arr) - 1) print ',';
            }
        }
        print ']';
        if (!$last) print ',';
    }
    
    function getPlays($id)
    {
        global $pdo;
        $query = $pdo->prepare("SELECT COUNT(*) AS total FROM plays WHERE videoID = :videoID");
        $query->bindParam(':videoID', $id);
        $query->execute();
        return $query->fetch()['total'];
    }