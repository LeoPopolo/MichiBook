CREATE TYPE user_role AS ENUM('admin', 'operator');

CREATE TYPE data_extension AS (
    email                       text,
    phone_number                text,
    address                     text
);

CREATE TABLE auth_user (
    name                        text,
    surname                     text,
    username                    text,
    password                    text,
    role                        user_role,
    contact_information         data_extension,
    deleted                     boolean DEFAULT FALSE
) INHERITS (
    core_object
);


-- CONSTRUCTORS


CREATE OR REPLACE FUNCTION auth_user (
    p_name                      text,
    p_surname                   text,
    p_username                  text,
    p_password                  text,
    p_role                      user_role,
    p_contact_information       data_extension
) RETURNS auth_user AS $$
DECLARE
    v_response                  auth_user;
BEGIN

    INSERT INTO auth_user(name, surname, username, password, role, contact_information) 
                    VALUES (p_name, p_surname, p_username, p_password, p_role, p_contact_information)
                    RETURNING * INTO v_response;

    RETURN v_response;

END$$ 
LANGUAGE plpgsql VOLATILE STRICT;


-- SEARCH AND IDENTIFY


CREATE OR REPLACE FUNCTION auth_user_identify_by_id (
    p_id                        int
) RETURNS auth_user AS $$

    SELECT s FROM auth_user s WHERE id = p_id;

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION auth_user_get_users () 
RETURNS auth_user[] AS $$

    SELECT array (
		SELECT s FROM auth_user s 
			WHERE NOT deleted
				ORDER BY id ASC
	);

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION auth_user_get_total_pages (
	p_users			            auth_user[]
) RETURNS int AS $$

    SELECT get_total_pages(p_users);

$$ LANGUAGE sql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION auth_user_paginate (
	p_page				        int,
	p_users			            auth_user[]
) RETURNS auth_user[] AS $$

    SELECT paginate(p_page, p_users);

$$ LANGUAGE sql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION auth_user_filter_by_name (
    p_users                     auth_user[],
    p_name                     	text
) RETURNS auth_user[] AS $$
DECLARE
    v_users                     text;
    v_querystring               text;
BEGIN

    v_querystring := format (
        'SELECT ARRAY(SELECT x FROM unnest(%L::%s) x 
            WHERE name ilike ''%%'' || %L || ''%%'')', 
        p_users,
        pg_typeof(p_users),
        p_name
    );

    EXECUTE v_querystring INTO v_users;

    RETURN v_users;
END$$ 
LANGUAGE plpgsql STABLE STRICT;


CREATE OR REPLACE FUNCTION auth_user_filter_by_surname (
    p_users                     auth_user[],
    p_surname                   text
) RETURNS auth_user[] AS $$
DECLARE
    v_users                     text;
    v_querystring               text;
BEGIN

    v_querystring := format (
        'SELECT ARRAY(SELECT x FROM unnest(%L::%s) x 
            WHERE surname ilike ''%%'' || %L || ''%%'')', 
        p_users,
        pg_typeof(p_users),
        p_surname
    );

    EXECUTE v_querystring INTO v_users;

    RETURN v_users;
END$$ 
LANGUAGE plpgsql STABLE STRICT;


CREATE OR REPLACE FUNCTION auth_user_filter_by_username (
    p_users                     auth_user[],
    p_username                  text
) RETURNS auth_user[] AS $$
DECLARE
    v_users                     text;
    v_querystring               text;
BEGIN

    v_querystring := format (
        'SELECT ARRAY(SELECT x FROM unnest(%L::%s) x 
            WHERE username ilike ''%%'' || %L || ''%%'')', 
        p_users,
        pg_typeof(p_users),
        p_username
    );

    EXECUTE v_querystring INTO v_users;

    RETURN v_users;
END$$ 
LANGUAGE plpgsql STABLE STRICT;


-- WEBAPIS


CREATE OR REPLACE FUNCTION webapi_auth_user_search (
	p_page					int,
	p_name					text DEFAULT '%',
	p_surname				text DEFAULT '%',
	p_username				text DEFAULT '%'
) RETURNS text AS $$
DECLARE
	v_users				    auth_user[];
	v_response				jsonb;
	v_total_pages			int DEFAULT 0;
BEGIN
	
	v_users := auth_user_get_users();
	
	IF p_name != '%' AND p_name IS NOT NULL
	THEN
		v_users := auth_user_filter_by_name(v_users, p_name);
	END IF;
	
	IF p_surname != '%' AND p_surname IS NOT NULL
	THEN
		v_users := auth_user_filter_by_surname(v_users, p_surname);
	END IF;

	IF p_username != '%' AND p_username IS NOT NULL
	THEN
		v_users := auth_user_filter_by_username(v_users, p_username);
	END IF;
	
	IF p_page != 1
	THEN
		v_users := auth_user_paginate(p_page, v_users);
	END IF;

	v_total_pages := auth_user_get_total_pages(v_users);

	IF v_total_pages IS NULL THEN
		v_total_pages := 0;
	END IF;
	
	v_response := jsonb_build_object (
		'users', array_to_json(v_users),
		'total_pages', v_total_pages,
		'page_number', p_page
	);

	RETURN v_response::text;
END$$ 
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION webapi_auth_user_identify_by_id (
	p_id						int
) RETURNS text AS $$
DECLARE
	v_response					jsonb;
	v_user					    auth_user;
BEGIN
	v_user := auth_user_identify_by_id(p_id);

	v_response := to_json(v_user);

	RETURN v_response::text;
END$$
LANGUAGE plpgsql STABLE STRICT;