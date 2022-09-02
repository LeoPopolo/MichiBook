CREATE TABLE comment (
    user_comment_id             int,
    description                 text,
    reactions                   reaction[] DEFAULT '{}'
) INHERITS (
    core_object
);
