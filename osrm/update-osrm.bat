@echo off
echo עדכון נתוני OSRM...

REM עצירת השרת הקיים אם הוא רץ
taskkill /F /IM osrm-routed.exe 2>nul

REM עיבוד הנתונים עם הפרופיל החדש
osrm-extract -p profiles/hiking.lua israel-latest.osm.pbf
osrm-partition israel-latest.osrm
osrm-customize israel-latest.osrm

REM הפעלת השרת עם הנתונים החדשים
start /B osrm-routed --algorithm mld israel-latest.osrm

echo OSRM עודכן בהצלחה!
