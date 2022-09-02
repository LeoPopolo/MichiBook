CREATE TABLE post (
    post_text                   text NOT NULL,
    image_id                    int,
    reactions                   reaction[] DEFAULT '{}',
    comments                    comment[] DEFAULT '{}'
) INHERITS (
    core_object
);


-- CONSTRUCTORS & DESCTRUCTORS


CREATE OR REPLACE FUNCTION post (
    p_post_text                 text,
    p_image_id                  int
) RETURNS post AS $$
DECLARE
    v_response                  post;
BEGIN

    INSERT INTO post(post_text, image_id) 
                    VALUES (p_post_text, p_image_id)
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

    SELECT f FROM post f WHERE id = p_post_id;

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION post_get_by_user (
    p_user_id                   int
) 
RETURNS post[] AS $$

    SELECT array (
		SELECT f FROM post f 
			WHERE NOT deleted AND id = p_user_id
				ORDER BY creation_timestamp DESC
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
