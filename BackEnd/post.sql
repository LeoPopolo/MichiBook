CREATE TABLE post (
    post_text                   text NOT NULL,
    image_id                    int,
    user_owner                  auth_user NOT NULL,
    parent_id                   int
) INHERITS (
    core_object
);


-- CONSTRUCTORS & DESTRUCTORS


CREATE OR REPLACE FUNCTION post (
    p_post_text                 text,
    p_image_id                  int,
    p_user_owner                auth_user,
    p_parent_id                 int
) RETURNS post AS $$
DECLARE
    v_response                  post;
BEGIN

    INSERT INTO post(post_text, image_id, user_owner, parent_id) 
                    VALUES (p_post_text, p_image_id, p_user_owner, p_parent_id)
                    RETURNING * INTO v_response;

    RETURN v_response;

END$$ 
LANGUAGE plpgsql VOLATILE;


CREATE OR REPLACE FUNCTION delete_post (
    p_post_id                   int
) RETURNS void AS $$

    UPDATE post 
        SET deleted = TRUE
        WHERE id = p_post_id;

$$ LANGUAGE sql VOLATILE STRICT;


-- SEARCH AND IDENTIFY


CREATE OR REPLACE FUNCTION post_identify_by_id (
    p_post_id              int
) RETURNS post AS $$

    SELECT p FROM post p WHERE id = p_post_id;

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION post_get_as_comment (
    p_post_id              int
) RETURNS post[] AS $$

    SELECT array (
		SELECT p FROM post p 
			WHERE NOT deleted AND parent_id = p_post_id
				ORDER BY creation_timestamp DESC
	);

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION post_get_by_user (
    p_user_id                   int
) RETURNS post[] AS $$

    SELECT array (
		SELECT p FROM post p 
			WHERE NOT deleted AND id(user_owner) = p_user_id AND parent_id IS NULL
				ORDER BY creation_timestamp DESC
	);

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION post_get_by_friendship (
    p_user_id                   int
) RETURNS post[] AS $$

    SELECT array (
		SELECT p FROM post p, friendship f WHERE (NOT p.deleted) AND (id(user_emitted) = p_user_id OR id(user_received) = p_user_id) 
                                                    AND ((id(user_owner) = id(user_received) AND id(user_owner) != p_user_id) OR 
                                                        (id(user_owner) = id(user_emitted) AND id(user_owner) != p_user_id))
                                                    AND parent_id IS NULL
				ORDER BY p.creation_timestamp DESC
	);

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION post_get_total_pages (
	p_posts	            post[]
) RETURNS int AS $$

    SELECT get_total_pages(p_posts);

$$ LANGUAGE sql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION post_paginate (
	p_page				        int,
	p_posts			    post[]
) RETURNS post[] AS $$

    SELECT paginate(p_page, p_posts);

$$ LANGUAGE sql IMMUTABLE STRICT;


-- WEBAPIS --


CREATE OR REPLACE FUNCTION webapi_create_post (
    p_user_id                   int,
    p_post_text                 text,
    p_image_id                  int
) RETURNS text AS $$
DECLARE
    v_post                      post;
    v_response                  jsonb;
    v_user                      auth_user;
BEGIN
    v_user := auth_user_identify_by_id(p_user_id);
    
    v_post := post(p_post_text, p_image_id, v_user, null);

    v_response := jsonb_build_object (
		'post', v_post,
        'status', 'OK'
	);

    RETURN v_response::text;
END$$ 
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION webapi_create_comment (
    p_user_id                   int,
    p_post_text                 text,
    p_image_id                  int,
    p_post_id                   int
) RETURNS text AS $$
DECLARE
    v_post                      post;
    v_response                  jsonb;
    v_user                      auth_user;
BEGIN
    v_user := auth_user_identify_by_id(p_user_id);
    
    v_post := post(p_post_text, p_image_id, v_user, p_post_id);

    v_response := jsonb_build_object (
		'post', v_post,
        'status', 'OK'
	);

    RETURN v_response::text;
END$$ 
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION webapi_delete_post (
    p_user_id                   int,
    p_post_id                   int
) RETURNS text AS $$
DECLARE
    v_post                      post;
    v_response                  jsonb;
BEGIN
    
    v_post := post_identify_by_id(p_post_id);

    IF id(user_owner(v_post)) != p_user_id THEN
        RAISE EXCEPTION 'User cannot delete post';
    END IF;

    IF deleted(v_post) THEN
        RAISE EXCEPTION 'Post is already deleted';
    END IF;

    PERFORM delete_post(p_post_id);

    v_response := jsonb_build_object (
		'message', 'Operation completed',
        'status', 'OK'
	);

    RETURN v_response::text;
END$$ 
LANGUAGE plpgsql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION webapi_post_search_by_friendship (
    p_user_id               int,
	p_page					int
) RETURNS text AS $$
DECLARE
	v_posts				    post[];
	v_response				jsonb;
    v_posts_with_comments   jsonb;
	v_total_pages			int DEFAULT 0;
    v_post                  post;
BEGIN
	
	v_posts := post_get_by_friendship(p_user_id);
	
	IF p_page != 1
	THEN
		v_posts := post_paginate(p_page, v_posts);
	END IF;

	v_total_pages := post_get_total_pages(v_posts);

	IF v_total_pages IS NULL THEN
		v_total_pages := 0;
	END IF;

    FOREACH v_post IN ARRAY v_posts
    LOOP
        v_posts_with_comments := jsonb_build_object (
            'post', v_post,
            'comments', post_get_as_comment(id(v_post))
        );
    END LOOP;
	
	v_response := jsonb_build_object (
		'posts', v_posts_with_comments,
		'total_pages', v_total_pages,
		'page_number', p_page
	);

	RETURN v_response::text;
END$$ 
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION webapi_post_search_own (
    p_user_id               int,
	p_page					int
) RETURNS text AS $$
DECLARE
	v_posts				    post[];
	v_response				jsonb;
    v_posts_with_comments   jsonb;
	v_total_pages			int DEFAULT 0;
    v_post                  post;
BEGIN
	
	v_posts := post_get_by_user(p_user_id);
	
	IF p_page != 1
	THEN
		v_posts := post_paginate(p_page, v_posts);
	END IF;

	v_total_pages := post_get_total_pages(v_posts);

	IF v_total_pages IS NULL THEN
		v_total_pages := 0;
	END IF;

    FOREACH v_post IN ARRAY v_posts
    LOOP
        v_posts_with_comments := jsonb_build_object (
            'post', v_post,
            'comments', post_get_as_comment(id(v_post))
        );
    END LOOP;
	
	v_response := jsonb_build_object (
		'posts', v_posts_with_comments,
		'total_pages', v_total_pages,
		'page_number', p_page
	);

	RETURN v_response::text;
END$$ 
LANGUAGE plpgsql IMMUTABLE;