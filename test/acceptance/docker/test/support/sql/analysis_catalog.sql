-- Table to register analysis nodes from https://github.com/cartodb/camshaft
CREATE TABLE IF NOT EXISTS
    cartodb.cdb_analysis_catalog (
-- useful for multi account deployments
    username text,
-- md5 hex hash
    node_id char(40) CONSTRAINT cdb_analysis_catalog_pkey PRIMARY KEY,
-- being json allows to do queries like analysis_def->>'type' = 'buffer'
    analysis_def json NOT NULL,
-- can reference other nodes in this very same table, allowing recursive queries
    input_nodes char(40) ARRAY NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT valid_status CHECK (
        status IN ( 'pending', 'waiting', 'running', 'canceled', 'failed', 'ready' )
    ),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
-- should be updated when some operation was performed in the node
-- and anything associated to it might have changed
    updated_at timestamp with time zone DEFAULT NULL,
-- should register last time the node was used
    used_at timestamp with time zone NOT NULL DEFAULT now(),
-- should register the number of times the node was used
    hits NUMERIC DEFAULT 0,
-- should register what was the last node using current node
    last_used_from char(40),
-- last job modifying the node
    last_modified_by uuid,
-- store error message for failures
    last_error_message text,
-- cached tables involved in the analysis
    cache_tables regclass[] NOT NULL DEFAULT '{}'
);
