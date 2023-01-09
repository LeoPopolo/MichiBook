SELECT auth_user(('leo', 'popolo', 'leopopolo98', '$2a$10$vBoeuG9MMzYa5.oa9FI4W.MZaDZLSfSVOMhkgf7.9jgEgO7As3U6G', null, 'Soy un usuario de prueba')::personal_data, ('leopopolo98@gmail.com', '11 2272-8456', 'roca 771')::data_extension);
SELECT auth_user(('nico', 'lopez', 'nicolopez', '$2a$10$vBoeuG9MMzYa5.oa9FI4W.MZaDZLSfSVOMhkgf7.9jgEgO7As3U6G', null, 'Yo tambien soy un usuario de prueba')::personal_data, ('nicolopez@gmail.com', '11 2272-8456', 'roca 771')::data_extension);

SELECT auth_user(('maria', 'sanchez', 'mariasanchez', '$2a$10$vBoeuG9MMzYa5.oa9FI4W.MZaDZLSfSVOMhkgf7.9jgEgO7As3U6G', null, 'Soy una usuario de prueba')::personal_data, ('mariasanchez@gmail.com', '11 2272-8456', 'roca 771')::data_extension);
