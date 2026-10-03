@echo off
echo ========================================
echo Stopping MySQL Docker Container
echo ========================================
echo.

docker stop cccp_amazon_mysql
docker rm cccp_amazon_mysql

echo.
echo MySQL container stopped and removed.
echo.
pause
