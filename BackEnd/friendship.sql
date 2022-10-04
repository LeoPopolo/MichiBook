CREATE TABLE friendship (
    user_emitted                auth_user NOT NULL,
    user_received               auth_user NOT NULL,
    is_accepted                 boolean DEFAULT FALSE
) INHERITS (
    core_object
);


-- CONSTRUCTORS & DESTRUCTORS


CREATE OR REPLACE FUNCTION friendship (
    p_user_emitted              auth_user,
    p_user_received             auth_user
) RETURNS friendship AS $$
DECLARE
    v_response                  friendship;
BEGIN

    INSERT INTO friendship(user_emitted, user_received) 
                    VALUES (p_user_emitted, p_user_received)
                    RETURNING * INTO v_response;

    RETURN v_response;

END$$ 
LANGUAGE plpgsql VOLATILE STRICT;


CREATE OR REPLACE FUNCTION friendship_delete (
    p_id                        int
) RETURNS void AS $$

    UPDATE friendship
        SET deleted = TRUE, is_accepted = FALSE
        WHERE id = p_id;

$$ LANGUAGE sql VOLATILE STRICT;


-- METHODS


CREATE OR REPLACE FUNCTION accept_friendship (
    p_friendship_id             int
) RETURNS friendship AS $$
DECLARE
    v_friendship                friendship;
    v_response                  friendship;
BEGIN

    v_friendship := friendship_identify_by_id(p_friendship_id);

    IF v_friendship IS NOT NULL
    THEN
        UPDATE friendship
            SET is_accepted = TRUE, deleted = FALSE
            WHERE id = p_friendship_id
            RETURNING * INTO v_response;
    ELSE
        RAISE EXCEPTION 'Friendship does not exist';
    END IF;

    RETURN v_response;
END$$ 
LANGUAGE plpgsql VOLATILE STRICT;


CREATE OR REPLACE FUNCTION decline_friendship (
    p_friendship_id             int
) RETURNS void AS $$
DECLARE
    v_friendship                friendship;
BEGIN

    v_friendship := friendship_identify_by_id(p_friendship_id);

    IF v_friendship IS NOT NULL
    THEN
        DELETE FROM friendship
            WHERE id = p_friendship_id;
    ELSE
        RAISE EXCEPTION 'Friendship does not exist';
    END IF;

END$$ 
LANGUAGE plpgsql VOLATILE STRICT;


CREATE OR REPLACE FUNCTION remove_friendship (
    p_friendship_id             int
) RETURNS void AS $$
DECLARE
    v_friendship                friendship;
BEGIN

    v_friendship := friendship_identify_by_id(p_friendship_id);

    IF v_friendship IS NOT NULL
        AND NOT deleted(v_friendship)
    THEN
        PERFORM friendship_delete(p_friendship_id);
    ELSE
        RAISE EXCEPTION 'Friendship does not exist';
    END IF;

END$$ 
LANGUAGE plpgsql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION reactivate_friendship (
    p_friendship_id             int,
    p_new_user_emitter_id       int
) RETURNS void AS $$
DECLARE
    v_friendship                friendship;
BEGIN

    v_friendship := friendship_identify_by_id(p_friendship_id);

    IF v_friendship IS NOT NULL
    THEN
        UPDATE friendship
            SET is_accepted = FALSE, deleted = FALSE
            WHERE id = p_friendship_id;

        IF p_new_user_emitter_id != id(user_emitted(v_friendship)) THEN
            PERFORM toggle_friendship_emitter(p_friendship_id);
        END IF;
    ELSE
        RAISE EXCEPTION 'Friendship does not exist';
    END IF;

END$$ 
LANGUAGE plpgsql VOLATILE STRICT;


CREATE OR REPLACE FUNCTION toggle_friendship_emitter (
    p_friendship_id             int
) RETURNS void AS $$
DECLARE
    v_friendship                friendship;
    v_aux_user_emitted          auth_user;
    v_aux_user_received         auth_user;
BEGIN

    v_friendship := friendship_identify_by_id(p_friendship_id);

    IF v_friendship IS NOT NULL
    THEN

        v_aux_user_emitted := user_emitted(v_friendship);
        v_aux_user_received := user_received(v_friendship);
        
        UPDATE friendship
            SET user_emitted = v_aux_user_received,
                user_received = v_aux_user_emitted
            WHERE id = p_friendship_id;
    ELSE
        RAISE EXCEPTION 'Friendship does not exist';
    END IF;

END$$ 
LANGUAGE plpgsql VOLATILE STRICT;


-- SEARCH AND IDENTIFY


CREATE OR REPLACE FUNCTION friendship_identify_by_id (
    p_friendship_id              int
) RETURNS friendship AS $$

    SELECT f FROM friendship f WHERE id = p_friendship_id;

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_get_by_user (
    p_user_id                    int
) RETURNS friendship[] AS $$

    SELECT array (
		SELECT f FROM friendship f 
			WHERE NOT deleted AND is_accepted = TRUE AND (id(user_emitted) = p_user_id OR id(user_received) = p_user_id)
				ORDER BY creation_timestamp DESC
	);

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_get_friends_by_user (
    p_user_id                    int
) RETURNS auth_user[] AS $$

    SELECT array (
		SELECT u FROM friendship f, auth_user u 
            WHERE NOT u.deleted AND NOT f.deleted AND (id(f.user_emitted) = p_user_id OR id(f.user_received) = p_user_id)
			    AND (id(f.user_emitted) = u.id OR id(f.user_received) = u.id)
                AND u.id != p_user_id
				    ORDER BY name(personal_data) ASC
	);

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_request_get_by_user_received (
    p_user_id                    int
) 
RETURNS friendship[] AS $$

    SELECT array (
		SELECT f FROM friendship f 
			WHERE NOT deleted AND NOT is_accepted AND (user_received = auth_user_identify_by_id(p_user_id))
				ORDER BY creation_timestamp DESC
	);

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_request_get_by_user_emitted (
    p_user_id                    int
) 
RETURNS friendship[] AS $$

    SELECT array (
		SELECT f FROM friendship f 
			WHERE NOT deleted AND NOT is_accepted AND (user_emitted = auth_user_identify_by_id(p_user_id))
				ORDER BY creation_timestamp DESC
	);

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_get_between_users (
    p_user_one_id                int,
    p_user_two_id                int
) 
RETURNS friendship AS $$

    SELECT f
        FROM friendship f
        WHERE ((id(user_emitted) = p_user_one_id AND id(user_received) = p_user_two_id) OR
                (id(user_emitted) = p_user_two_id AND id(user_received) = p_user_one_id));

$$ LANGUAGE sql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_exists_between_users (
    p_user_one_id                int,
    p_user_two_id                int
) 
RETURNS boolean AS $$
DECLARE
    v_response                   int;
BEGIN

    SELECT COUNT(*) 
        INTO v_response 
        FROM friendship
        WHERE ((id(user_emitted) = p_user_one_id AND id(user_received) = p_user_two_id) OR
                (id(user_emitted) = p_user_two_id AND id(user_received) = p_user_one_id)) AND
                NOT deleted AND is_accepted;

    RETURN v_response = 1;
END$$
LANGUAGE plpgsql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_request_exists_between_users (
    p_user_one_id                int,
    p_user_two_id                int
) 
RETURNS boolean AS $$
DECLARE
    v_response                   int;
BEGIN

    SELECT COUNT(*) 
        INTO v_response 
        FROM friendship
        WHERE ((id(user_emitted) = p_user_one_id AND id(user_received) = p_user_two_id) OR
                (id(user_emitted) = p_user_two_id AND id(user_received) = p_user_one_id)) AND
                NOT deleted AND NOT is_accepted;

    RETURN v_response = 1;
END$$
LANGUAGE plpgsql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_is_broken_between_users (
    p_user_one_id                int,
    p_user_two_id                int
) 
RETURNS boolean AS $$
DECLARE
    v_response                   int;
BEGIN

    SELECT COUNT(*) 
        INTO v_response 
        FROM friendship
        WHERE ((id(user_emitted) = p_user_one_id AND id(user_received) = p_user_two_id) OR
                (id(user_emitted) = p_user_two_id AND id(user_received) = p_user_one_id)) AND
                deleted;

    RETURN v_response = 1;
END$$
LANGUAGE plpgsql STABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_get_total_pages (
	p_friendships	             friendship[]
) RETURNS int AS $$

    SELECT get_total_pages(p_friendships);

$$ LANGUAGE sql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION friendship_paginate (
	p_page				         int,
	p_friendships			     friendship[]
) RETURNS friendship[] AS $$

    SELECT paginate(p_page, p_friendships);

$$ LANGUAGE sql IMMUTABLE STRICT;


-- WEBAPIS


CREATE OR REPLACE FUNCTION webapi_friendship_send_request (
    p_user_emitted_id            int,
    p_user_received_id           int
) RETURNS text AS $$
DECLARE
    v_response                   jsonb;
    v_friendship                 friendship;
    v_user_emitted               auth_user;
    v_user_received              auth_user;
BEGIN

    v_user_emitted := auth_user_identify_by_id(p_user_emitted_id);
    v_user_received := auth_user_identify_by_id(p_user_received_id);

    IF auth_user_exists(p_user_emitted_id) AND auth_user_exists(p_user_received_id) THEN

        IF NOT friendship_exists_between_users(p_user_emitted_id, p_user_received_id) AND
            NOT friendship_is_broken_between_users(p_user_emitted_id, p_user_received_id) AND
            NOT friendship_request_exists_between_users(p_user_emitted_id, p_user_received_id) THEN

            v_friendship := friendship(v_user_emitted, v_user_received);

        ELSIF friendship_is_broken_between_users(p_user_emitted_id, p_user_received_id) THEN

            v_friendship := friendship_get_between_users(p_user_emitted_id, p_user_received_id);
            PERFORM reactivate_friendship(id(v_friendship), p_user_emitted_id);
        ELSIF friendship_exists_between_users(p_user_emitted_id, p_user_received_id) THEN
            RAISE EXCEPTION 'Friendship already exists';
        ELSIF friendship_request_exists_between_users(p_user_emitted_id, p_user_received_id) THEN
            RAISE EXCEPTION 'Friendship request already sent';
        END IF;
    ELSIF NOT auth_user_exists(p_user_emitted_id) THEN
        RAISE EXCEPTION 'Cannot send friend request';
    ELSIF NOT auth_user_exists(p_user_received_id) THEN
        RAISE EXCEPTION 'The target user does not exists';
    END IF;
    
    v_response := jsonb_build_object (
        'status', 'OK',
		'friendship', to_json(v_friendship)
	);

	RETURN v_response::text;
END$$ 
LANGUAGE plpgsql STABLE STRICT;


CREATE OR REPLACE FUNCTION webapi_friendship_identify_by_user_id (
    p_user_from_id               int,
    p_user_id                    int
) RETURNS text AS $$
DECLARE
    v_user                       auth_user;
    v_friendship                 friendship;
    v_friendship_status          text;
	v_response				     jsonb;
    v_tmp_user                   jsonb;
BEGIN
	v_user := auth_user_identify_by_id(p_user_id);
    v_friendship := friendship_get_between_users(p_user_from_id, p_user_id);

    IF v_friendship IS NULL THEN
        v_friendship_status := 'no friends';
    ELSIF id(user_emitted(v_friendship)) = p_user_from_id AND NOT is_accepted(v_friendship) THEN
        v_friendship_status := 'emitted';
    ELSIF id(user_received(v_friendship)) = p_user_from_id AND NOT is_accepted(v_friendship) THEN
        v_friendship_status := 'received';
    ELSIF is_accepted(v_friendship) THEN
        v_friendship_status := 'friends';
    END IF;

    v_tmp_user := jsonb_build_object (
        'id', id(v_user),
        'personal_data', to_json(personal_data(v_user)),
        'contact_information', to_json(contact_information(v_user)),
        'friendship_status', v_friendship_status
    );
	
	v_response := jsonb_build_object (
		'user', v_tmp_user
	);
    
	RETURN v_response::text;
END$$ 
LANGUAGE plpgsql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION webapi_friendship_get_user_requests (
	p_page					     int,
    p_user_id                    int
) RETURNS text AS $$
DECLARE
	v_requests                   friendship[];
	v_response				     jsonb;
	v_total_pages			     int DEFAULT 0;
BEGIN
	v_requests := friendship_request_get_by_user_received(p_user_id);

    IF p_page != 1 THEN
		v_requests := friendship_paginate(p_page, v_requests);
	END IF;
    
	v_total_pages := friendship_get_total_pages(v_requests);
    
    IF v_total_pages IS NULL THEN
		v_total_pages := 0;
	END IF;
	
	v_response := jsonb_build_object (
		'requests', array_to_json(v_requests),
		'total_pages', v_total_pages,
		'page_number', p_page
	);
    
	RETURN v_response::text;
END$$ 
LANGUAGE plpgsql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION webapi_friendship_search (
	p_page					     int,
    p_user_id                    int
) RETURNS text AS $$
DECLARE
	v_friendships                friendship[];
	v_response				     jsonb;
	v_total_pages			     int DEFAULT 0;
BEGIN
	
	v_friendships := friendship_get_by_user(p_user_id);
	
	IF p_page != 1
	THEN
		v_friendships := friendship_paginate(p_page, v_friendships);
	END IF;

	v_total_pages := friendship_get_total_pages(v_friendships);

	IF v_total_pages IS NULL THEN
		v_total_pages := 0;
	END IF;
	
	v_response := jsonb_build_object (
		'friendships', array_to_json(v_friendships),
		'total_pages', v_total_pages,
		'page_number', p_page
	);

	RETURN v_response::text;
END$$ 
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION webapi_friendship_search_friends (
	p_page					     int,
    p_user_id                    int
) RETURNS text AS $$
DECLARE
	v_users                      auth_user[];
	v_response				     jsonb;
	v_total_pages			     int DEFAULT 0;
BEGIN
	
	v_users := friendship_get_friends_by_user(p_user_id);
	
	IF p_page != 1
	THEN
		v_users := auth_user_paginate(p_page, v_users);
	END IF;

	v_total_pages := auth_user_get_total_pages(v_users);

	IF v_total_pages IS NULL THEN
		v_total_pages := 0;
	END IF;
	
	v_response := jsonb_build_object (
		'friends', array_to_json(v_users),
		'total_pages', v_total_pages,
		'page_number', p_page
	);

	RETURN v_response::text;
END$$ 
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION webapi_accept_friendship (
    p_friendship_id              int,
    p_user_id                    int
) RETURNS text AS $$
DECLARE
    v_response                   jsonb;
    v_friendship                 friendship;
BEGIN
    v_friendship := friendship_identify_by_id(p_friendship_id);
    
    IF p_user_id = id(user_received(v_friendship)) THEN
        PERFORM accept_friendship(p_friendship_id);
    ELSE
        RAISE EXCEPTION 'User cannot accept request';
    END IF;

    v_response := jsonb_build_object (
		'message', 'Operation Completed',
        'status', 'OK'
	);

    RETURN v_response::text;
END$$ 
LANGUAGE plpgsql STABLE STRICT;


CREATE OR REPLACE FUNCTION webapi_decline_friendship (
    p_friendship_id              int,
    p_user_id                    int
) RETURNS text AS $$
DECLARE
    v_response                   jsonb;
    v_friendship                 friendship;
BEGIN
    v_friendship := friendship_identify_by_id(p_friendship_id);
    
    IF p_user_id = id(user_received(v_friendship)) THEN
        PERFORM decline_friendship(p_friendship_id);
    ELSE
        RAISE EXCEPTION 'User cannot decline request';
    END IF;

    v_response := jsonb_build_object (
		'message', 'Operation Completed',
        'status', 'OK'
	);

    RETURN v_response::text;
END$$ 
LANGUAGE plpgsql STABLE STRICT;


CREATE OR REPLACE FUNCTION webapi_remove_friendship (
    p_friendship_id              int,
    p_user_id                    int
) RETURNS text AS $$
DECLARE
    v_response                   jsonb;
    v_friendship                 friendship;
BEGIN
    v_friendship := friendship_identify_by_id(p_friendship_id);
    
    IF p_user_id = id(user_received(v_friendship)) OR
        p_user_id = id(user_emitted(v_friendship)) THEN

        PERFORM remove_friendship(p_friendship_id);
    ELSE
        RAISE EXCEPTION 'User cannot remove friendship';
    END IF;

    v_response := jsonb_build_object (
		'message', 'Operation Completed',
        'status', 'OK'
	);

    RETURN v_response::text;
END$$ 
LANGUAGE plpgsql STABLE STRICT;