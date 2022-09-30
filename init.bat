psql -U dba postgres < ./BackEnd/setup.sql
psql -U dba michibook < ./BackEnd/core_object.sql
psql -U dba michibook < ./BackEnd/user.sql
psql -U dba michibook < ./BackEnd/friendship.sql
psql -U dba michibook < ./BackEnd/post.sql
pause