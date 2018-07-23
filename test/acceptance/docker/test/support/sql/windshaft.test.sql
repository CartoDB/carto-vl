--
-- Windshaft test database
--
-- To use run ../prepare_db.sh
-- NOTE: requires a postgis template called template_postgis
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET search_path = public, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;

-- public user role
DROP USER IF EXISTS :PUBLICUSER;
CREATE USER :PUBLICUSER WITH PASSWORD ':PUBLICPASS';

-- db owner role
DROP USER IF EXISTS :TESTUSER;
CREATE USER :TESTUSER WITH PASSWORD ':TESTPASS';

-- regular user role 1
DROP USER IF EXISTS test_windshaft_regular1;
CREATE USER test_windshaft_regular1 WITH PASSWORD 'regular1';

GRANT test_windshaft_regular1 to :TESTUSER;

-- first table
CREATE TABLE test_table (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    the_geom geometry,
    the_geom_webmercator geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

CREATE SEQUENCE test_table_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE test_table_cartodb_id_seq OWNED BY test_table.cartodb_id;

SELECT pg_catalog.setval('test_table_cartodb_id_seq', 60, true);

ALTER TABLE test_table ALTER COLUMN cartodb_id SET DEFAULT nextval('test_table_cartodb_id_seq'::regclass);

INSERT INTO test_table VALUES
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.314252', 1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', '0101000020E6100000A6B73F170D990DC064E8D84125364440', '0101000020110F000076491621312319C122D4663F1DCC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.319101', 2, 'El Estocolmo', 'Calle de la Palma 72, Madrid, Spain', '0101000020E6100000C90567F0F7AB0DC0AB07CC43A6364440', '0101000020110F0000C4356B29423319C15DD1092DADCC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.324', 3, 'El Rey del Tallarín', 'Plaza Conde de Toreno 2, Madrid, Spain', '0101000020E610000021C8410933AD0DC0CB0EF10F5B364440', '0101000020110F000053E71AC64D3419C10F664E4659CC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.329509', 4, 'El Lacón', 'Manuel Fernández y González 8, Madrid, Spain', '0101000020E6100000BC5983F755990DC07D923B6C22354440', '0101000020110F00005DACDB056F2319C1EC41A980FCCA5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.334931', 5, 'El Pico', 'Calle Divino Pastor 12, Madrid, Spain', '0101000020E61000003B6D8D08C6A10DC0371B2B31CF364440', '0101000020110F00005F716E91992A19C17DAAA4D6DACC5241');

ALTER TABLE ONLY test_table ADD CONSTRAINT test_table_pkey PRIMARY KEY (cartodb_id);

CREATE INDEX test_table_the_geom_idx ON test_table USING gist (the_geom);
CREATE INDEX test_table_the_geom_webmercator_idx ON test_table USING gist (the_geom_webmercator);

GRANT ALL ON TABLE test_table TO :TESTUSER;
GRANT SELECT ON TABLE test_table TO :PUBLICUSER;

-- second table
CREATE TABLE test_table_2 (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    the_geom geometry,
    the_geom_webmercator geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

CREATE SEQUENCE test_table_2_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE test_table_2_cartodb_id_seq OWNED BY test_table_2.cartodb_id;

SELECT pg_catalog.setval('test_table_2_cartodb_id_seq', 60, true);

ALTER TABLE test_table_2 ALTER COLUMN cartodb_id SET DEFAULT nextval('test_table_2_cartodb_id_seq'::regclass);

INSERT INTO test_table_2 VALUES
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.314252', 1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', '0101000020E6100000A6B73F170D990DC064E8D84125364440', '0101000020110F000076491621312319C122D4663F1DCC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.319101', 2, 'El Estocolmo', 'Calle de la Palma 72, Madrid, Spain', '0101000020E6100000C90567F0F7AB0DC0AB07CC43A6364440', '0101000020110F0000C4356B29423319C15DD1092DADCC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.324', 3, 'El Rey del Tallarín', 'Plaza Conde de Toreno 2, Madrid, Spain', '0101000020E610000021C8410933AD0DC0CB0EF10F5B364440', '0101000020110F000053E71AC64D3419C10F664E4659CC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.329509', 4, 'El Lacón', 'Manuel Fernández y González 8, Madrid, Spain', '0101000020E6100000BC5983F755990DC07D923B6C22354440', '0101000020110F00005DACDB056F2319C1EC41A980FCCA5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.334931', 5, 'El Pico', 'Calle Divino Pastor 12, Madrid, Spain', '0101000020E61000003B6D8D08C6A10DC0371B2B31CF364440', '0101000020110F00005F716E91992A19C17DAAA4D6DACC5241');

ALTER TABLE ONLY test_table_2 ADD CONSTRAINT test_table_2_pkey PRIMARY KEY (cartodb_id);

CREATE INDEX test_table_2_the_geom_idx ON test_table_2 USING gist (the_geom);
CREATE INDEX test_table_2_the_geom_webmercator_idx ON test_table_2 USING gist (the_geom_webmercator);

GRANT ALL ON TABLE test_table_2 TO :TESTUSER;
GRANT SELECT ON TABLE test_table_2 TO :PUBLICUSER;

-- third table
CREATE TABLE test_table_3 (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    the_geom geometry,
    the_geom_webmercator geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

CREATE SEQUENCE test_table_3_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE test_table_3_cartodb_id_seq OWNED BY test_table_3.cartodb_id;

SELECT pg_catalog.setval('test_table_3_cartodb_id_seq', 60, true);

ALTER TABLE test_table_3 ALTER COLUMN cartodb_id SET DEFAULT nextval('test_table_3_cartodb_id_seq'::regclass);

INSERT INTO test_table_3 VALUES
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.314252', 1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', '0101000020E6100000A6B73F170D990DC064E8D84125364440', '0101000020110F000076491621312319C122D4663F1DCC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.319101', 2, 'El Estocolmo', 'Calle de la Palma 72, Madrid, Spain', '0101000020E6100000C90567F0F7AB0DC0AB07CC43A6364440', '0101000020110F0000C4356B29423319C15DD1092DADCC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.324', 3, 'El Rey del Tallarín', 'Plaza Conde de Toreno 2, Madrid, Spain', '0101000020E610000021C8410933AD0DC0CB0EF10F5B364440', '0101000020110F000053E71AC64D3419C10F664E4659CC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.329509', 4, 'El Lacón', 'Manuel Fernández y González 8, Madrid, Spain', '0101000020E6100000BC5983F755990DC07D923B6C22354440', '0101000020110F00005DACDB056F2319C1EC41A980FCCA5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.334931', 5, 'El Pico', 'Calle Divino Pastor 12, Madrid, Spain', '0101000020E61000003B6D8D08C6A10DC0371B2B31CF364440', '0101000020110F00005F716E91992A19C17DAAA4D6DACC5241');

ALTER TABLE ONLY test_table_3 ADD CONSTRAINT test_table_3_pkey PRIMARY KEY (cartodb_id);

CREATE INDEX test_table_3_the_geom_idx ON test_table_3 USING gist (the_geom);
CREATE INDEX test_table_3_the_geom_webmercator_idx ON test_table_3 USING gist (the_geom_webmercator);

GRANT ALL ON TABLE test_table_3 TO :TESTUSER;
GRANT SELECT ON TABLE test_table_3 TO :PUBLICUSER;

-- private table
CREATE TABLE test_table_private_1 (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    the_geom geometry,
    the_geom_webmercator geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);
INSERT INTO test_table_private_1 SELECT * from test_table;

GRANT ALL ON TABLE test_table_private_1 TO :TESTUSER;

CREATE TABLE IF NOT EXISTS
  CDB_TableMetadata (
    tabname regclass not null primary key,
    updated_at timestamp with time zone not null default now()
  );

INSERT INTO CDB_TableMetadata (tabname, updated_at) VALUES ('test_table'::regclass, '2009-02-13T23:31:30.123Z');
INSERT INTO CDB_TableMetadata (tabname, updated_at) VALUES ('test_table_private_1'::regclass, '2009-02-13T23:31:30.123Z');

-- GRANT SELECT ON CDB_TableMetadata TO :PUBLICUSER;
GRANT SELECT ON CDB_TableMetadata TO :TESTUSER;
GRANT SELECT ON CDB_TableMetadata TO test_windshaft_regular1; -- for analysis. Warning: TBA

-- long name table
CREATE TABLE
long_table_name_with_enough_chars_to_break_querytables_function
(
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    the_geom geometry,
    the_geom_webmercator geometry
);

INSERT INTO long_table_name_with_enough_chars_to_break_querytables_function SELECT * from test_table;

ALTER TABLE ONLY long_table_name_with_enough_chars_to_break_querytables_function
    ADD CONSTRAINT long_table_name_with_enough_chars_to_break_querytables_func_pkey PRIMARY KEY (cartodb_id);

CREATE INDEX long_table_name_the_geom_idx
    ON long_table_name_with_enough_chars_to_break_querytables_function USING gist (the_geom);
CREATE INDEX long_table_name_the_geom_webmercator_idx
    ON long_table_name_with_enough_chars_to_break_querytables_function USING gist (the_geom_webmercator);

GRANT ALL ON TABLE long_table_name_with_enough_chars_to_break_querytables_function TO :TESTUSER;
GRANT SELECT ON TABLE long_table_name_with_enough_chars_to_break_querytables_function TO :PUBLICUSER;

INSERT INTO CDB_TableMetadata (tabname, updated_at) VALUES ('long_table_name_with_enough_chars_to_break_querytables_function'::regclass, '2009-02-13T23:31:30.123Z');

CREATE FUNCTION test_table_inserter(geometry, text) returns int AS $$
 INSERT INTO test_table(name, the_geom, the_geom_webmercator)
  SELECT $2, $1, ST_Transform($1, 3857) RETURNING cartodb_id;
$$ LANGUAGE 'sql' SECURITY DEFINER;

CREATE TABLE test_big_poly (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id serial NOT NULL,
    name character varying,
    the_geom geometry(polygon) CHECK ( ST_Srid(the_geom) = 4326 ),
    the_geom_webmercator geometry(polygon) CHECK ( ST_Srid(the_geom_webmercator) = 3857 )
);
INSERT INTO test_big_poly (name, the_geom) VALUES ('west', 'SRID=4326;POLYGON((-180 -80, -180 80, 0 80, 0 -80, -180 -80))');
UPDATE test_big_poly SET the_geom_webmercator = ST_Transform(the_geom, 3857);
CREATE INDEX test_big_poly_the_geom_idx ON test_big_poly USING gist (the_geom);
CREATE INDEX test_big_poly_the_geom_webmercator_idx ON test_big_poly USING gist (the_geom_webmercator);

GRANT ALL ON TABLE test_big_poly TO :TESTUSER;
GRANT SELECT ON TABLE test_big_poly TO :PUBLICUSER;

-- table with overviews

CREATE TABLE test_table_overviews (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    value float8,
    the_geom geometry,
    the_geom_webmercator geometry,
    _feature_count integer,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

GRANT ALL ON TABLE test_table_overviews TO :TESTUSER;
GRANT SELECT ON TABLE test_table_overviews TO :PUBLICUSER;

CREATE SEQUENCE test_table_overviews_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE test_table_overviews_cartodb_id_seq OWNED BY test_table_overviews.cartodb_id;

SELECT pg_catalog.setval('test_table_overviews_cartodb_id_seq', 60, true);

ALTER TABLE test_table_overviews ALTER COLUMN cartodb_id SET DEFAULT nextval('test_table_overviews_cartodb_id_seq'::regclass);

INSERT INTO test_table_overviews VALUES
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.314252', 1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', 1.0, '0101000020E6100000A6B73F170D990DC064E8D84125364440', '0101000020110F000076491621312319C122D4663F1DCC5241', 1),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.319101', 2, 'El Estocolmo', 'Calle de la Palma 72, Madrid, Spain', 2.0, '0101000020E6100000C90567F0F7AB0DC0AB07CC43A6364440', '0101000020110F0000C4356B29423319C15DD1092DADCC5241', 1),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.324', 3, 'El Rey del Tallarín', 'Plaza Conde de Toreno 2, Madrid, Spain', 3.0, '0101000020E610000021C8410933AD0DC0CB0EF10F5B364440', '0101000020110F000053E71AC64D3419C10F664E4659CC5241', 1),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.329509', 4, 'El Lacón', 'Manuel Fernández y González 8, Madrid, Spain', 4.0, '0101000020E6100000BC5983F755990DC07D923B6C22354440', '0101000020110F00005DACDB056F2319C1EC41A980FCCA5241', 1),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.334931', 5, 'El Pico', 'Calle Divino Pastor 12, Madrid, Spain', 5.0, '0101000020E61000003B6D8D08C6A10DC0371B2B31CF364440', '0101000020110F00005F716E91992A19C17DAAA4D6DACC5241', 1);

ALTER TABLE ONLY test_table_overviews ADD CONSTRAINT test_table_overviews_pkey PRIMARY KEY (cartodb_id);

CREATE INDEX test_table_overviews_the_geom_idx ON test_table_overviews USING gist (the_geom);
CREATE INDEX test_table_overviews_the_geom_webmercator_idx ON test_table_overviews USING gist (the_geom_webmercator);

GRANT ALL ON TABLE test_table_overviews TO :TESTUSER;
GRANT SELECT ON TABLE test_table_overviews TO :PUBLICUSER;

CREATE TABLE _vovw_1_test_table_overviews (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    value float8,
    the_geom geometry,
    the_geom_webmercator geometry,
    _feature_count integer,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

GRANT ALL ON TABLE _vovw_1_test_table_overviews TO :TESTUSER;
GRANT SELECT ON TABLE _vovw_1_test_table_overviews TO :PUBLICUSER;

CREATE TABLE _vovw_2_test_table_overviews (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    value float8,
    the_geom geometry,
    the_geom_webmercator geometry,
    _feature_count integer,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

GRANT ALL ON TABLE _vovw_2_test_table_overviews TO :TESTUSER;
GRANT SELECT ON TABLE _vovw_2_test_table_overviews TO :PUBLICUSER;

INSERT INTO _vovw_2_test_table_overviews VALUES
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.314252', 1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', 8.0/3.0, '0101000020E610000000000000000020C00000000000004440', '0101000020110F000076491621312319C122D4663F1DCC5241', 3),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.319101', 2, 'El Estocolmo', 'Calle de la Palma 72, Madrid, Spain', 7.0/2.0, '0101000020E610000000000000009431C026043C75E7224340', '0101000020110F0000C4356B29423319C15DD1092DADCC5241', 2);

INSERT INTO _vovw_1_test_table_overviews VALUES
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.314252', 1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', 3.0, '0101000020E610000000000000000020C00000000000004440', '0101000020110F000076491621312319C122D4663F1DCC5241', 5);

-- table with overviews whit special float values

CREATE TABLE test_special_float_values_table_overviews (
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    value float8,
    the_geom geometry,
    the_geom_webmercator geometry,
    _feature_count integer,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

GRANT ALL ON TABLE test_special_float_values_table_overviews TO :TESTUSER;
GRANT SELECT ON TABLE test_special_float_values_table_overviews TO :PUBLICUSER;

CREATE SEQUENCE test_special_float_values_table_overviews_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE test_special_float_values_table_overviews_cartodb_id_seq OWNED BY test_special_float_values_table_overviews.cartodb_id;

SELECT pg_catalog.setval('test_special_float_values_table_overviews_cartodb_id_seq', 60, true);

ALTER TABLE test_special_float_values_table_overviews ALTER COLUMN cartodb_id SET DEFAULT nextval('test_special_float_values_table_overviews_cartodb_id_seq'::regclass);

INSERT INTO test_special_float_values_table_overviews VALUES
(1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', 1.0, '0101000020E6100000A6B73F170D990DC064E8D84125364440', '0101000020110F000076491621312319C122D4663F1DCC5241', 1),
(2, 'El Estocolmo', 'Calle de la Palma 72, Madrid, Spain', 2.0, '0101000020E6100000C90567F0F7AB0DC0AB07CC43A6364440', '0101000020110F0000C4356B29423319C15DD1092DADCC5241', 1),
(3, 'El Rey del Tallarín', 'Plaza Conde de Toreno 2, Madrid, Spain', 'NaN'::float, '0101000020E610000021C8410933AD0DC0CB0EF10F5B364440', '0101000020110F000053E71AC64D3419C10F664E4659CC5241', 1),
(4, 'El Lacón', 'Manuel Fernández y González 8, Madrid, Spain', 4.0, '0101000020E6100000BC5983F755990DC07D923B6C22354440', '0101000020110F00005DACDB056F2319C1EC41A980FCCA5241', 1),
(5, 'El Pico', 'Calle Divino Pastor 12, Madrid, Spain', 'infinity'::float, '0101000020E61000003B6D8D08C6A10DC0371B2B31CF364440', '0101000020110F00005F716E91992A19C17DAAA4D6DACC5241', 1);

ALTER TABLE ONLY test_special_float_values_table_overviews ADD CONSTRAINT test_special_float_values_table_overviews_pkey PRIMARY KEY (cartodb_id);

CREATE INDEX test_special_float_values_table_overviews_the_geom_idx ON test_special_float_values_table_overviews USING gist (the_geom);
CREATE INDEX test_special_float_values_table_overviews_the_geom_webmercator_idx ON test_special_float_values_table_overviews USING gist (the_geom_webmercator);

GRANT ALL ON TABLE test_special_float_values_table_overviews TO :TESTUSER;
GRANT SELECT ON TABLE test_special_float_values_table_overviews TO :PUBLICUSER;

CREATE TABLE _vovw_1_test_special_float_values_table_overviews (
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    value float8,
    the_geom geometry,
    the_geom_webmercator geometry,
    _feature_count integer,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

GRANT ALL ON TABLE _vovw_1_test_special_float_values_table_overviews TO :TESTUSER;
GRANT SELECT ON TABLE _vovw_1_test_special_float_values_table_overviews TO :PUBLICUSER;

INSERT INTO _vovw_1_test_special_float_values_table_overviews VALUES
(1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', 3, '0101000020E610000000000000000020C00000000000004440', '0101000020110F000076491621312319C122D4663F1DCC5241', 2),
(3, 'El Rey del Tallarín', 'Plaza Conde de Toreno 2, Madrid, Spain', 'NaN'::float, '0101000020E610000021C8410933AD0DC0CB0EF10F5B364440', '0101000020110F000053E71AC64D3419C10F664E4659CC5241', 1),
(4, 'El Lacón', 'Manuel Fernández y González 8, Madrid, Spain', 'infinity'::float, '0101000020E6100000BC5983F755990DC07D923B6C22354440', '0101000020110F00005DACDB056F2319C1EC41A980FCCA5241', 2);

-- auth tables --------------------------------------------

CREATE TABLE test_table_localhost_regular1 (
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    cartodb_id integer NOT NULL,
    name character varying,
    address character varying,
    the_geom geometry,
    the_geom_webmercator geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

CREATE SEQUENCE test_table_localhost_regular1_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE test_table_localhost_regular1_cartodb_id_seq OWNED BY test_table_localhost_regular1.cartodb_id;

SELECT pg_catalog.setval('test_table_localhost_regular1_cartodb_id_seq', 60, true);

ALTER TABLE test_table_localhost_regular1 ALTER COLUMN cartodb_id SET DEFAULT nextval('test_table_localhost_regular1_cartodb_id_seq'::regclass);

INSERT INTO test_table_localhost_regular1 VALUES
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.314252', 1, 'Hawai', 'Calle de Pérez Galdós 9, Madrid, Spain', '0101000020E6100000A6B73F170D990DC064E8D84125364440', '0101000020110F000076491621312319C122D4663F1DCC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.319101', 2, 'El Estocolmo', 'Calle de la Palma 72, Madrid, Spain', '0101000020E6100000C90567F0F7AB0DC0AB07CC43A6364440', '0101000020110F0000C4356B29423319C15DD1092DADCC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.324', 3, 'El Rey del Tallarín', 'Plaza Conde de Toreno 2, Madrid, Spain', '0101000020E610000021C8410933AD0DC0CB0EF10F5B364440', '0101000020110F000053E71AC64D3419C10F664E4659CC5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.329509', 4, 'El Lacón', 'Manuel Fernández y González 8, Madrid, Spain', '0101000020E6100000BC5983F755990DC07D923B6C22354440', '0101000020110F00005DACDB056F2319C1EC41A980FCCA5241'),
('2011-09-21 14:02:21.358706', '2011-09-21 14:02:21.334931', 5, 'El Pico', 'Calle Divino Pastor 12, Madrid, Spain', '0101000020E61000003B6D8D08C6A10DC0371B2B31CF364440', '0101000020110F00005F716E91992A19C17DAAA4D6DACC5241');

ALTER TABLE ONLY test_table_localhost_regular1 ADD CONSTRAINT test_table_localhost_regular1_pkey PRIMARY KEY (cartodb_id);

CREATE INDEX test_table_localhost_regular1_the_geom_idx ON test_table_localhost_regular1 USING gist (the_geom);
CREATE INDEX test_table_localhost_regular1_the_geom_webmercator_idx ON test_table_localhost_regular1 USING gist (the_geom_webmercator);

GRANT ALL ON TABLE test_table_localhost_regular1 TO :TESTUSER;
GRANT ALL ON TABLE test_table_localhost_regular1 TO test_windshaft_regular1;

INSERT INTO CDB_TableMetadata (tabname, updated_at) VALUES ('test_table_localhost_regular1'::regclass, '2009-02-13T23:31:30.123Z');

-- analysis tables -----------------------------------------------

ALTER TABLE cdb_analysis_catalog OWNER TO :TESTUSER;


--
-- TOC entry 804 (class 1259 OID 13870252)
-- Name: analysis_banks; Type: TABLE; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886; Tablespace:
--

CREATE TABLE analysis_banks (
    cartodb_id bigint NOT NULL,
    the_geom geometry(Geometry,4326),
    the_geom_webmercator geometry(Geometry,3857),
    bank text
);


ALTER TABLE analysis_banks OWNER TO :TESTUSER;

--
-- TOC entry 803 (class 1259 OID 13870250)
-- Name: analysis_banks_cartodb_id_seq; Type: SEQUENCE; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

CREATE SEQUENCE analysis_banks_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE analysis_banks_cartodb_id_seq OWNER TO :TESTUSER;

--
-- TOC entry 5784 (class 0 OID 0)
-- Dependencies: 803
-- Name: analysis_banks_cartodb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

ALTER SEQUENCE analysis_banks_cartodb_id_seq OWNED BY analysis_banks.cartodb_id;


--
-- TOC entry 802 (class 1259 OID 13870235)
-- Name: analysis_rent_listings; Type: TABLE; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886; Tablespace:
--

CREATE TABLE analysis_rent_listings (
    cartodb_id bigint NOT NULL,
    the_geom geometry(Geometry,4326),
    the_geom_webmercator geometry(Geometry,3857),
    price double precision
);


ALTER TABLE analysis_rent_listings OWNER TO :TESTUSER;

--
-- TOC entry 801 (class 1259 OID 13870233)
-- Name: analysis_rent_listings_cartodb_id_seq; Type: SEQUENCE; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

CREATE SEQUENCE analysis_rent_listings_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE analysis_rent_listings_cartodb_id_seq OWNER TO :TESTUSER;

--
-- TOC entry 5786 (class 0 OID 0)
-- Dependencies: 801
-- Name: analysis_rent_listings_cartodb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

ALTER SEQUENCE analysis_rent_listings_cartodb_id_seq OWNED BY analysis_rent_listings.cartodb_id;


--
-- TOC entry 5612 (class 2604 OID 13870258)
-- Name: cartodb_id; Type: DEFAULT; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

ALTER TABLE ONLY analysis_banks ALTER COLUMN cartodb_id SET DEFAULT nextval('analysis_banks_cartodb_id_seq'::regclass);


--
-- TOC entry 5611 (class 2604 OID 13870241)
-- Name: cartodb_id; Type: DEFAULT; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

ALTER TABLE ONLY analysis_rent_listings ALTER COLUMN cartodb_id SET DEFAULT nextval('analysis_rent_listings_cartodb_id_seq'::regclass);


--
-- TOC entry 5778 (class 0 OID 13870252)
-- Dependencies: 804
-- Data for Name: analysis_banks; Type: TABLE DATA; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

COPY analysis_banks (cartodb_id, the_geom, the_geom_webmercator, bank) FROM stdin;
1	0101000020E61000000AEC3F6BE5A80DC09EF022E20C364440	0101000020110F0000AD24852BA63019C13215440E02CC5241	BBVA
2	0101000020E61000005AB3C72EE6A40DC02A499181E3364440	0101000020110F0000DE3E9A22412D19C1B059CF80F1CC5241	Santander
3	0101000020E6100000FD52FCA1E1960DC0DD48F7ADB9354440	0101000020110F00008C1CE860592119C12B37FC3BA5CB5241	BBVA
4	0101000020E61000008A52C823B69F0DC02579E6E0B4354440	0101000020110F0000DC41553AD92819C170BBE0E09FCB5241	Santander
5	0101000020E6100000A6C9EAA399B00DC00A31DF64BD354440	0101000020110F000041C09F2D313719C1EDC9C960A9CB5241	Santander
6	0101000020E6100000D2AD3EB570970DC01F85791E1B354440	0101000020110F00001D0E73E4D22119C14730F65AF4CA5241	BBVA
7	0101000020E6100000B2F9AF3A6FA40DC0BA91F3D44C364440	0101000020110F0000B071A11BDC2C19C16DD5026649CC5241	BBVA
8	0101000020E61000000F1B8134EE8E0DC067D8E65807374440	0101000020110F000033B46EB0981A19C10322017E19CD5241	BBVA
9	0101000020E6100000F12A179193880DC07EBCEDABC2354440	0101000020110F0000C11C4B2F331519C1B2B8FD43AFCB5241	BBVA
10	0101000020E61000004B602775E0A50DC0037374A875364440	0101000020110F00004B5097B1152E19C1481948F276CC5241	BBVA
11	0101000020E6100000F796A5DDEE880DC05337CD960A364440	0101000020110F0000ACE39CB9801519C1F843077FFFCB5241	Santander
12	0101000020E610000041BC5F214A920DC0AFCE2B5507354440	0101000020110F000027682406731D19C15145B148DECA5241	BBVA
13	0101000020E6100000CC2EFD14A0AF0DC00550C5AE47354440	0101000020110F000095956F3A5D3619C11CACED1026CB5241	BBVA
14	0101000020E6100000B113F5FFF28E0DC01075C9419A354440	0101000020110F00005E9EE8C29C1A19C1DB38342E82CB5241	BBVA
15	0101000020E6100000997EFF432F990DC0E6D8677BF1364440	0101000020110F00007E0667274E2319C1ACE7B01801CD5241	Santander
\.


--
-- TOC entry 5787 (class 0 OID 0)
-- Dependencies: 803
-- Name: analysis_banks_cartodb_id_seq; Type: SEQUENCE SET; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

SELECT pg_catalog.setval('analysis_banks_cartodb_id_seq', 15, true);


--
-- TOC entry 5776 (class 0 OID 13870235)
-- Dependencies: 802
-- Data for Name: analysis_rent_listings; Type: TABLE DATA; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

COPY analysis_rent_listings (cartodb_id, the_geom, the_geom_webmercator, price) FROM stdin;
1	0101000020E61000006300CEA9C4920DC0FCB8FEFB04354440	0101000020110F0000EA3B5C17DB1D19C135CF17AADBCA5241	81
2	0101000020E6100000F49AD93201910DC0E37AB970F8354440	0101000020110F00009BD483A95B1C19C11FC4D53FEBCB5241	169
3	0101000020E610000096F9FBAA0F880DC03974BF03B8354440	0101000020110F00006891BA29C31419C1055F8260A3CB5241	163
4	0101000020E61000009F08C1D17C930DC0651427FA68364440	0101000020110F00006C35BB7E771E19C1837381CC68CC5241	127
5	0101000020E61000000A7B7928EAB40DC0425EE239C4364440	0101000020110F00000C6ADB3EDB3A19C14FDB889ACECC5241	58
6	0101000020E610000095B232CF20A00DC0584C660044354440	0101000020110F0000979587D2332919C177DEB3F521CB5241	184
7	0101000020E61000001E8C81FF328F0DC031AE47DFB2364440	0101000020110F00006634761DD31A19C13723EB3DBBCC5241	109
8	0101000020E61000008A014F8FD79D0DC0B1E8EA3376364440	0101000020110F000021A20DC5422719C15A18E08D77CC5241	87
9	0101000020E61000006ECAA9C393970DC0F71C39950A364440	0101000020110F0000A3016DAAF02119C19C71447DFFCB5241	132
10	0101000020E6100000FB434A9D57A60DC0F9FD273C3F354440	0101000020110F00008E7BC3E47A2E19C1798082A41CCB5241	134
11	0101000020E6100000C597512EFE8C0DC032DE0DCDFD344440	0101000020110F0000F51B6C6AF31819C15512CCA6D3CA5241	167
12	0101000020E610000025E84904589F0DC00BC88CB0BA364440	0101000020110F000024C7054A892819C1C84EBBF6C3CC5241	135
13	0101000020E61000002917E524E69E0DC0EE4915018C354440	0101000020110F00008011BC93282819C153F8E34772CB5241	160
14	0101000020E6100000617E8939B1A40DC05EF963BEF0344440	0101000020110F000071896E28142D19C160872616C5CA5241	185
15	0101000020E6100000B20B809602A30DC0514274FE37354440	0101000020110F00007D63FC6AA62B19C1DC88B19014CB5241	94
16	0101000020E6100000191978861B9C0DC05C902E6C45354440	0101000020110F0000EBC9ACA6C92519C10A76818B23CB5241	172
17	0101000020E610000098D6FCD1F2AC0DC01ED4EEFCAE354440	0101000020110F0000FA7E3A3C173419C1DFFAA34E99CB5241	154
18	0101000020E6100000F9C7CB37DC970DC0B7E914C94E354440	0101000020110F0000795D5C332E2219C1FAAE47FD2DCB5241	183
19	0101000020E61000002D0263B27B940DC09D26F27AC4354440	0101000020110F0000C4616AF64F1F19C1D2868548B1CB5241	77
20	0101000020E6100000BD682E39DA8D0DC0DA3ADC937A364440	0101000020110F000038D83D4CAE1919C143A35B6F7CCC5241	196
21	0101000020E6100000165B41DEB2A90DC0D0D1F568A4354440	0101000020110F00008B9179A8543119C1EAADBA818DCB5241	74
22	0101000020E6100000DECD65EC4A8D0DC08D309F6B1F354440	0101000020110F000063E4D797341919C1A1034827F9CA5241	164
23	0101000020E6100000D14DF59EC1AD0DC086C17713C7354440	0101000020110F0000E8ED02DFC63419C15FACD82DB4CB5241	180
24	0101000020E61000002A41F69FA7900DC063FF9C14AC364440	0101000020110F0000DDF34D960F1C19C1070119AAB3CC5241	62
25	0101000020E61000001E390026BA8B0DC0B506A19336354440	0101000020110F00005620FE36E01719C109E9F5FB12CB5241	103
26	0101000020E61000001856B89F9E890DC0AE3A805FA7364440	0101000020110F0000F4E717FF151619C102619069AECC5241	132
27	0101000020E61000006244348FA7AD0DC093992086E1354440	0101000020110F0000204AB0BCB03419C10E2515AFD1CB5241	64
28	0101000020E6100000C249D99ADA970DC0D7CF322454364440	0101000020110F00005303A5D42C2219C1463AA98D51CC5241	142
29	0101000020E61000001E36C089F2930DC0098310FAF2344440	0101000020110F0000E9293E79DB1E19C134C7D593C7CA5241	149
30	0101000020E610000084DC236A48970DC08AA0D30E37354440	0101000020110F0000A4E5D3ABB02119C12A57638513CB5241	190
31	0101000020E610000068C42C3D6DAE0DC0E316EF8262354440	0101000020110F000007FF5AA0583519C1CEF97EFE43CB5241	132
32	0101000020E6100000F0FCDE54BCA70DC03311579A9F354440	0101000020110F0000CE2C83DAA92F19C120A8E62488CB5241	180
33	0101000020E6100000B5A43D9E809B0DC059B84FF6F1364440	0101000020110F000035B5A016462519C15C07D2A101CD5241	160
34	0101000020E6100000D4D36C80629E0DC0249F8DFC8B354440	0101000020110F0000F241EAC5B82719C1904ED64272CB5241	95
35	0101000020E61000008BEA878AF1A50DC05DA77AA5B9354440	0101000020110F0000BBD0E633242E19C15D7E8432A5CB5241	108
36	0101000020E610000022D3CD1F62B40DC08AC22B852E364440	0101000020110F0000C8E240B6673A19C1DCF9E99427CC5241	168
37	0101000020E6100000EBAC4CB637950DC0E989CFA0D8364440	0101000020110F0000883BDDA4EF1F19C15478CE5DE5CC5241	80
38	0101000020E61000007CEFD63A8A960DC006B8BDD1C8364440	0101000020110F00003728B0250F2119C169FD71BAD3CC5241	168
39	0101000020E6100000756B387CCFA70DC084C36711F7354440	0101000020110F0000CEB4ED1EBA2F19C13F1EE7B7E9CB5241	56
40	0101000020E6100000A47B2BAC4E960DC0820DC4B760354440	0101000020110F00008BCCAF90DC2019C1AE4248FE41CB5241	162
41	0101000020E6100000D5645E0C31990DC0F535DB974F364440	0101000020110F00007E8BFFAA4F2319C1B884AA7A4CCC5241	102
42	0101000020E6100000E3B6E0EA41B40DC02ADE56A899364440	0101000020110F0000FFC4D55B4C3A19C1A602351C9FCC5241	174
43	0101000020E61000006C513CE4E3B00DC010B3C38659364440	0101000020110F00002817653D703719C14258A88F57CC5241	97
44	0101000020E61000006B6DF64366A10DC0C980E41EB2364440	0101000020110F0000CFE47B3B482A19C1EFCB4567BACC5241	63
45	0101000020E61000007031674EA8960DC073B9E40B22354440	0101000020110F0000A608EEB0282119C159033215FCCA5241	159
46	0101000020E610000002328782CB890DC0A6462A1EAF364440	0101000020110F000008823D1E3C1619C14C749B0DB7CC5241	141
47	0101000020E61000009694069312A70DC09438822A79354440	0101000020110F0000922DC0AD192F19C113F51A445DCB5241	185
48	0101000020E610000081F9078F75AE0DC069F4C3ADCD364440	0101000020110F00003F393EB15F3519C1D4F16926D9CC5241	113
49	0101000020E6100000E348615820AC0DC0D165849A50364440	0101000020110F0000ACEC8F7A643319C14D783D9B4DCC5241	124
50	0101000020E6100000378F35768FAD0DC085A048F310364440	0101000020110F0000BFF95B459C3419C12A94C89706CC5241	62
51	0101000020E6100000F25E60BD14B40DC0FA9EFA964F354440	0101000020110F0000EB4840FD253A19C1FF36F6E22ECB5241	109
52	0101000020E6100000B73BFD3FB6AF0DC0A3D844C97B364440	0101000020110F0000AD1F370E703619C1B9278EC87DCC5241	149
53	0101000020E6100000FF1181969EB10DC0136E39E5A0364440	0101000020110F0000D10A15CD0E3819C1828B712FA7CC5241	176
54	0101000020E6100000426F39BD459A0DC0A5505E4CB7354440	0101000020110F000074615DA93A2419C106D4EF93A2CB5241	90
55	0101000020E6100000E2B0F14972A80DC0AFA4D0BF84354440	0101000020110F00008817D563443019C1202D06306ACB5241	162
56	0101000020E6100000ADE43CA9F79A0DC0C24A1417D9364440	0101000020110F0000C4944EC5D12419C1D0B5C2E1E5CC5241	80
57	0101000020E6100000AD6B99A9818B0DC07E06699A33364440	0101000020110F00007EE2C43DB01719C12BBF9D402DCC5241	172
58	0101000020E610000098272DE67B960DC08EC657CCF4344440	0101000020110F0000352CE4F9022119C16660F49BC9CA5241	177
59	0101000020E6100000DEAA210E56A90DC0B45845C72B354440	0101000020110F00003689FED4053119C1F0FE50F006CB5241	172
60	0101000020E61000004CAD1CF03B8F0DC07A4C4F1EED364440	0101000020110F000048EE2CB5DA1A19C1E236513AFCCC5241	122
\.


--
-- TOC entry 5788 (class 0 OID 0)
-- Dependencies: 801
-- Name: analysis_rent_listings_cartodb_id_seq; Type: SEQUENCE SET; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

SELECT pg_catalog.setval('analysis_rent_listings_cartodb_id_seq', 60, true);


--
-- TOC entry 5618 (class 2606 OID 13870260)
-- Name: analysis_banks_pkey; Type: CONSTRAINT; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886; Tablespace:
--

ALTER TABLE ONLY analysis_banks
    ADD CONSTRAINT analysis_banks_pkey PRIMARY KEY (cartodb_id);


--
-- TOC entry 5614 (class 2606 OID 13870243)
-- Name: analysis_rent_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886; Tablespace:
--

ALTER TABLE ONLY analysis_rent_listings
    ADD CONSTRAINT analysis_rent_listings_pkey PRIMARY KEY (cartodb_id);


--
-- TOC entry 5619 (class 1259 OID 13870261)
-- Name: analysis_banks_the_geom_idx; Type: INDEX; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886; Tablespace:
--

CREATE INDEX analysis_banks_the_geom_idx ON analysis_banks USING gist (the_geom);


--
-- TOC entry 5620 (class 1259 OID 13870262)
-- Name: analysis_banks_the_geom_webmercator_idx; Type: INDEX; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886; Tablespace:
--

CREATE INDEX analysis_banks_the_geom_webmercator_idx ON analysis_banks USING gist (the_geom_webmercator);


--
-- TOC entry 5615 (class 1259 OID 13870244)
-- Name: analysis_rent_listings_the_geom_idx; Type: INDEX; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886; Tablespace:
--

CREATE INDEX analysis_rent_listings_the_geom_idx ON analysis_rent_listings USING gist (the_geom);


--
-- TOC entry 5616 (class 1259 OID 13870245)
-- Name: analysis_rent_listings_the_geom_webmercator_idx; Type: INDEX; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886; Tablespace:
--

CREATE INDEX analysis_rent_listings_the_geom_webmercator_idx ON analysis_rent_listings USING gist (the_geom_webmercator);

--
-- TOC entry 5783 (class 0 OID 0)
-- Dependencies: 804
-- Name: analysis_banks; Type: ACL; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

REVOKE ALL ON TABLE analysis_banks FROM PUBLIC;
REVOKE ALL ON TABLE analysis_banks FROM :TESTUSER;
GRANT ALL ON TABLE analysis_banks TO :TESTUSER;
GRANT SELECT ON TABLE analysis_banks TO :PUBLICUSER;


--
-- TOC entry 5785 (class 0 OID 0)
-- Dependencies: 802
-- Name: analysis_rent_listings; Type: ACL; Schema: public; Owner: development_cartodb_user_359a4d9f-a063-4130-9674-799e90960886
--

REVOKE ALL ON TABLE analysis_rent_listings FROM PUBLIC;
REVOKE ALL ON TABLE analysis_rent_listings FROM :TESTUSER;
GRANT ALL ON TABLE analysis_rent_listings TO :TESTUSER;
GRANT SELECT ON TABLE analysis_rent_listings TO :PUBLICUSER;


-- Completed on 2016-02-29 12:50:53 CET

--
-- PostgreSQL database dump complete
--

--
GRANT SELECT, UPDATE, INSERT, DELETE ON cdb_analysis_catalog TO :TESTUSER;
GRANT SELECT, UPDATE, INSERT, DELETE ON cdb_analysis_catalog TO test_windshaft_regular1; -- for analysis. Warning: TBA

DROP EXTENSION IF EXISTS crankshaft;
CREATE SCHEMA IF NOT EXISTS cdb_crankshaft;
GRANT USAGE ON SCHEMA cdb_crankshaft TO :TESTUSER;
CREATE TYPE kmeans_type as (cartodb_id numeric, cluster_no numeric);
CREATE OR REPLACE FUNCTION cdb_crankshaft.CDB_KMeans(query text, no_clusters integer,no_init integer default 20)
    RETURNS setof kmeans_type as $$
    DECLARE r kmeans_type;
    BEGIN
    FOR r IN EXECUTE format('select cartodb_id, ceil(random() * 10) AS cluster_no from (%s) _cdb_query', query) loop
        RETURN NEXT r;
    END LOOP;
    RETURN;
    END;
$$ LANGUAGE plpgsql;
GRANT ALL ON FUNCTION cdb_crankshaft.CDB_KMeans(text, integer, integer) TO :TESTUSER;

-- Table with 100 rows
-- first table
CREATE TABLE test_table_100 (
    cartodb_id integer NOT NULL,
    value int,
    the_geom geometry,
    the_geom_webmercator geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom_webmercator CHECK ((st_ndims(the_geom_webmercator) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom_webmercator CHECK (((geometrytype(the_geom_webmercator) = 'POINT'::text) OR (the_geom_webmercator IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((st_srid(the_geom) = 4326)),
    CONSTRAINT enforce_srid_the_geom_webmercator CHECK ((st_srid(the_geom_webmercator) = 3857))
);

CREATE SEQUENCE test_table_100_cartodb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE test_table_100_cartodb_id_seq OWNED BY test_table_100.cartodb_id;

SELECT pg_catalog.setval('test_table_100_cartodb_id_seq', 60, true);

ALTER TABLE test_table_100 ALTER COLUMN cartodb_id SET DEFAULT nextval('test_table_100_cartodb_id_seq'::regclass);

INSERT INTO test_table_100(the_geom, value)
  SELECT
    ST_SetSRID(ST_MakePoint(n*10 + 9E-3, n*10 + 9E-3), 4326) AS the_geom,n AS value
    FROM generate_series(1, 100) n;

ALTER TABLE ONLY test_table_100 ADD CONSTRAINT test_table_100_pkey PRIMARY KEY (cartodb_id);

CREATE INDEX test_table_100_the_geom_idx ON test_table_100 USING gist (the_geom);
CREATE INDEX test_table_100_the_geom_webmercator_idx ON test_table_100 USING gist (the_geom_webmercator);

GRANT ALL ON TABLE test_table_100 TO :TESTUSER;
GRANT SELECT ON TABLE test_table_100 TO :PUBLICUSER;


ANALYZE;
