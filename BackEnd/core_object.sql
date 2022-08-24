CREATE TABLE core_object (
    id                      serial,
    creation_timestamp      timestamp DEFAULT current_timestamp
);


CREATE OR REPLACE FUNCTION paginate (
	p_page				    int,
	p_objects			    anyarray
)
RETURNS anyarray AS $$
DECLARE
	v_rest				    int;
	v_total_pages		    int;
	v_objects			    text;
BEGIN
	v_rest := array_length(p_objects, 1) % 20;
	v_total_pages := (array_length(p_objects, 1) / 20);

	IF v_rest > 0 THEN
		v_total_pages := v_total_pages + 1;
	END IF;
	
	IF p_page < 1 THEN
		RAISE EXCEPTION 'Page cannot be lesser than 1';
	END IF;
	
	IF p_page > v_total_pages THEN
		RAISE EXCEPTION 'Page cannot be more than maximum pages';
	END IF;

	EXECUTE format (
		'SELECT array(
			SELECT o FROM unnest(%L::%s) o
				LIMIT %L OFFSET %s
		)', p_objects, pg_typeof(p_objects), 20, ((p_page - 1) * 20)
    ) INTO v_objects;

    RETURN v_objects;
END$$
LANGUAGE plpgsql IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION get_total_pages (
	p_objects			    anyarray
)
RETURNS int AS $$
DECLARE
	v_rest				    int;
	v_total_pages		    int;
BEGIN
	v_rest := array_length(p_objects, 1) % 20;
	v_total_pages := (array_length(p_objects, 1) / 20);

	IF v_rest > 0 THEN
		v_total_pages := v_total_pages + 1;
	END IF;

    RETURN v_total_pages;
END$$
LANGUAGE plpgsql IMMUTABLE STRICT;