@echo off
echo ========================================
echo Starting MySQL Docker Container
echo ========================================
echo.

docker run -d --name cccp_amazon_mysql -e MYSQL_ROOT_PASSWORD=root_production_password_2026 -e MYSQL_DATABASE=cccp_amazon -e MYSQL_USER=cccp_admin -e MYSQL_PASSWORD=cccp_secure_db_pass_2026 -p 3307:3306 mysql:8.0

echo.
echo MySQL container starting...
echo Waiting 15 seconds for MySQL to initialize...
timeout /t 15 /nobreak

echo.
echo ========================================
echo MySQL Status:
echo ========================================
docker ps | findstr cccp_amazon_mysql

echo.
echo ========================================
echo MySQL container is ready!
echo Database: cccp_amazon
echo Port: 3307
echo User: cccp_admin
echo ========================================
pause
