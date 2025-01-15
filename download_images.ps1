$images = @{
    "plants/anemone.jpg" = "https://upload.wikimedia.org/wikipedia/commons/1/16/Anemone_coronaria_-_Red_form.jpg"
    "plants/squill.jpg" = "https://upload.wikimedia.org/wikipedia/commons/3/3a/Drimia_maritima_kz1.jpg"
    "plants/cyclamen.jpg" = "https://upload.wikimedia.org/wikipedia/commons/f/f4/Cyclamen_persicum_1.jpg"
    "plants/narcissus.jpg" = "https://upload.wikimedia.org/wikipedia/commons/7/7e/Narcissus_tazetta_2.jpg"
    "plants/tulipa.jpg" = "https://upload.wikimedia.org/wikipedia/commons/2/29/Tulipa_agenensis_1.jpg"
    "plants/iris.jpg" = "https://upload.wikimedia.org/wikipedia/commons/7/7f/Iris_atropurpurea_001.JPG"
    "plants/lupinus.jpg" = "https://upload.wikimedia.org/wikipedia/commons/8/88/Lupinus_pilosus_1.jpg"
    "animals/fox.jpg" = "https://upload.wikimedia.org/wikipedia/commons/1/16/Fox_-_British_Wildlife_Centre_%2817429406401%29.jpg"
    "animals/ibex.jpg" = "https://upload.wikimedia.org/wikipedia/commons/3/38/Capra_nubiana_in_Ein_Gedi.jpg"
    "animals/gazelle.jpg" = "https://upload.wikimedia.org/wikipedia/commons/7/7d/PikiWiki_Israel_39754_Wildlife_and_Plants_of_Israel.jpg"
    "animals/porcupine.jpg" = "https://upload.wikimedia.org/wikipedia/commons/d/d3/Indian_Crested_Porcupine_Hystrix_indica_by_Dr_Raju_Kasambe_DSCN7558_%2811%29.jpg"
    "animals/chukar.jpg" = "https://upload.wikimedia.org/wikipedia/commons/9/9b/Chukar_Partridge.jpg"
    "animals/vulture.jpg" = "https://upload.wikimedia.org/wikipedia/commons/9/9e/Gyps_fulvus_-_01.jpg"
    "animals/tortoise.jpg" = "https://upload.wikimedia.org/wikipedia/commons/f/f1/Testudo_graeca_ibera_02.JPG"
}

foreach ($path in $images.Keys) {
    $url = $images[$path]
    $fullPath = "src/assets/images/$path"
    
    Write-Host "Downloading $url to $fullPath"
    
    $webClient = New-Object System.Net.WebClient
    New-Item -ItemType File -Path $fullPath -Force
    $webClient.DownloadFile($url, $fullPath)
}
