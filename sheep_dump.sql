--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment (
    id integer NOT NULL,
    vet_id integer NOT NULL,
    date timestamp without time zone DEFAULT now(),
    motivo text,
    comentarios text
);


ALTER TABLE public.appointment OWNER TO postgres;

--
-- Name: appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_id_seq OWNER TO postgres;

--
-- Name: appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointment_id_seq OWNED BY public.appointment.id;


--
-- Name: appointment_sheep; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_sheep (
    appointment_id integer NOT NULL,
    sheep_id integer NOT NULL
);


ALTER TABLE public.appointment_sheep OWNER TO postgres;

--
-- Name: farm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farm (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    location text
);


ALTER TABLE public.farm OWNER TO postgres;

--
-- Name: farm_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.farm_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.farm_id_seq OWNER TO postgres;

--
-- Name: farm_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.farm_id_seq OWNED BY public.farm.id;


--
-- Name: farm_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farm_inventory (
    id integer NOT NULL,
    farm_id integer NOT NULL,
    item_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit character varying(50) NOT NULL,
    last_updated timestamp without time zone DEFAULT now(),
    consumption_rate double precision NOT NULL,
    category character varying(99)
);


ALTER TABLE public.farm_inventory OWNER TO postgres;

--
-- Name: farm_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.farm_inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.farm_inventory_id_seq OWNER TO postgres;

--
-- Name: farm_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.farm_inventory_id_seq OWNED BY public.farm_inventory.id;


--
-- Name: farmer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farmer (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying NOT NULL,
    farm_id integer NOT NULL
);


ALTER TABLE public.farmer OWNER TO postgres;

--
-- Name: farmer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.farmer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.farmer_id_seq OWNER TO postgres;

--
-- Name: farmer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.farmer_id_seq OWNED BY public.farmer.id;


--
-- Name: medication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medication (
    id integer NOT NULL,
    appointment_id integer NOT NULL,
    name character varying(255) NOT NULL,
    dosage character varying(100),
    indication text
);


ALTER TABLE public.medication OWNER TO postgres;

--
-- Name: medication_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medication_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medication_id_seq OWNER TO postgres;

--
-- Name: medication_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medication_id_seq OWNED BY public.medication.id;


--
-- Name: milk_production_individual; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.milk_production_individual (
    id integer NOT NULL,
    sheep_id integer NOT NULL,
    date date NOT NULL,
    volume real NOT NULL
);


ALTER TABLE public.milk_production_individual OWNER TO postgres;

--
-- Name: milk_production_individual_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.milk_production_individual_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.milk_production_individual_id_seq OWNER TO postgres;

--
-- Name: milk_production_individual_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.milk_production_individual_id_seq OWNED BY public.milk_production_individual.id;


--
-- Name: sensor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensor (
    id integer NOT NULL,
    farm_id integer NOT NULL,
    name character varying(100) NOT NULL,
    min_value numeric(5,2),
    max_value numeric(5,2),
    current_value numeric(5,2) NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sensor OWNER TO postgres;

--
-- Name: sensor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sensor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sensor_id_seq OWNER TO postgres;

--
-- Name: sensor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sensor_id_seq OWNED BY public.sensor.id;


--
-- Name: sheep; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sheep (
    id integer NOT NULL,
    birth_date date,
    farm_id integer NOT NULL,
    feeding_hay real NOT NULL,
    feeding_feed real NOT NULL,
    gender character varying(10),
    group_id integer
);


ALTER TABLE public.sheep OWNER TO postgres;

--
-- Name: sheep_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sheep_group (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    farm_id integer NOT NULL
);


ALTER TABLE public.sheep_group OWNER TO postgres;

--
-- Name: sheep_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sheep_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sheep_group_id_seq OWNER TO postgres;

--
-- Name: sheep_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sheep_group_id_seq OWNED BY public.sheep_group.id;


--
-- Name: sheep_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sheep_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sheep_id_seq OWNER TO postgres;

--
-- Name: sheep_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sheep_id_seq OWNED BY public.sheep.id;


--
-- Name: sheep_parentage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sheep_parentage (
    id integer NOT NULL,
    parent_id integer NOT NULL,
    offspring_id integer NOT NULL
);


ALTER TABLE public.sheep_parentage OWNER TO postgres;

--
-- Name: sheep_parentage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sheep_parentage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sheep_parentage_id_seq OWNER TO postgres;

--
-- Name: sheep_parentage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sheep_parentage_id_seq OWNED BY public.sheep_parentage.id;


--
-- Name: veterinarian; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.veterinarian (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying NOT NULL,
    farm_id integer NOT NULL,
    farmer_id integer NOT NULL
);


ALTER TABLE public.veterinarian OWNER TO postgres;

--
-- Name: veterinarian_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.veterinarian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.veterinarian_id_seq OWNER TO postgres;

--
-- Name: veterinarian_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.veterinarian_id_seq OWNED BY public.veterinarian.id;


--
-- Name: appointment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment ALTER COLUMN id SET DEFAULT nextval('public.appointment_id_seq'::regclass);


--
-- Name: farm id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm ALTER COLUMN id SET DEFAULT nextval('public.farm_id_seq'::regclass);


--
-- Name: farm_inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm_inventory ALTER COLUMN id SET DEFAULT nextval('public.farm_inventory_id_seq'::regclass);


--
-- Name: farmer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmer ALTER COLUMN id SET DEFAULT nextval('public.farmer_id_seq'::regclass);


--
-- Name: medication id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medication ALTER COLUMN id SET DEFAULT nextval('public.medication_id_seq'::regclass);


--
-- Name: milk_production_individual id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milk_production_individual ALTER COLUMN id SET DEFAULT nextval('public.milk_production_individual_id_seq'::regclass);


--
-- Name: sensor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor ALTER COLUMN id SET DEFAULT nextval('public.sensor_id_seq'::regclass);


--
-- Name: sheep id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep ALTER COLUMN id SET DEFAULT nextval('public.sheep_id_seq'::regclass);


--
-- Name: sheep_group id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep_group ALTER COLUMN id SET DEFAULT nextval('public.sheep_group_id_seq'::regclass);


--
-- Name: sheep_parentage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep_parentage ALTER COLUMN id SET DEFAULT nextval('public.sheep_parentage_id_seq'::regclass);


--
-- Name: veterinarian id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarian ALTER COLUMN id SET DEFAULT nextval('public.veterinarian_id_seq'::regclass);


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment (id, vet_id, date, motivo, comentarios) FROM stdin;
19	30	2024-12-01 00:00:00	Vacinação Semestral	Todas as cabras foram vacinadas
20	30	2025-06-01 00:00:00	Vacinação Semestral	Próxima vacinação marcada
24	30	2025-05-15 00:00:00	Cabra mancando levemente, sem sinais de infecção	\N
29	30	2025-05-31 00:00:00	Ecografia	Ecografia
30	30	2025-06-17 00:00:00	Radiografia	Radiografia
31	30	2025-06-03 00:00:00	Check up	tudo ok
32	30	2025-06-30 00:00:00	Primeiro exame completo	Ficar em observação
33	30	2025-07-11 00:00:00	vacina interotoxemia	\N
34	30	2025-07-11 00:00:00	vacina	\N
36	30	2025-06-27 00:00:00	vacina	\N
37	30	2025-07-11 00:00:00	Vacina	\N
38	30	2025-07-11 00:00:00	vacina	\N
43	30	2025-07-31 00:00:00	Ecografia	\N
44	30	2025-08-09 00:00:00	Check up antes do parto	\N
45	30	2025-07-26 00:00:00	Check up após o parto	\N
\.


--
-- Data for Name: appointment_sheep; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment_sheep (appointment_id, sheep_id) FROM stdin;
19	315
19	322
19	323
19	324
19	325
19	326
19	327
19	328
19	329
19	330
19	331
19	332
19	333
20	315
20	322
20	323
20	324
20	325
20	326
20	327
20	328
20	329
20	330
20	331
20	332
20	333
24	326
29	330
29	331
30	332
30	333
31	326
31	327
31	328
31	329
32	334
32	335
32	336
32	338
33	330
34	338
36	325
37	323
38	323
43	323
43	325
44	330
44	331
45	332
45	333
\.


--
-- Data for Name: farm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farm (id, name, location) FROM stdin;
317	BeAlva	Serra da Estrela
316	Test Farm	Test Location
\.


--
-- Data for Name: farm_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farm_inventory (id, farm_id, item_name, quantity, unit, last_updated, consumption_rate, category) FROM stdin;
38	316	Detergente	60	L	2025-05-22 23:27:29.665	0	Limpeza
39	316	Ração recem nascido	85	kg	2025-05-22 23:27:44.611	0	Alimentação
74	317	Ração cabras lactantes	55	kg	2025-06-28 00:44:12.565	0	Alimento
82	317	Ração recem nascido	87	kg	2025-07-02 15:42:30.862	0	Alimento
77	317	Detergente	40	L	2025-07-12 19:39:02.632657	0	Limpeza
\.


--
-- Data for Name: farmer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farmer (id, name, email, password, farm_id) FROM stdin;
317	Luiza	luiza@gmail.com	$2a$12$9ULIzrIsjBJzYwyWFQFCqu2nL/Z.GzjC4y.23NuEyka5Gm5wEpewi	317
316	Test Farmer	farmer@test.com	$2b$12$NDny2Yu/Ic/6v20iYvhlS.uYp5/KzdvxoAUeVryjlNP5U075XCBBy	316
\.


--
-- Data for Name: medication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medication (id, appointment_id, name, dosage, indication) FROM stdin;
7	31	Tylenol	10mg	1x ao dia
19	32	Beroseg	10mg	1 dose
20	32	Albendazole	5mg	2x ao dia
\.


--
-- Data for Name: milk_production_individual; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.milk_production_individual (id, sheep_id, date, volume) FROM stdin;
476	316	2025-05-23	35
477	315	2025-05-23	50
478	316	2025-05-26	10
479	315	2025-05-26	29
481	322	2025-05-25	3.61
482	322	2025-05-24	3.69
483	322	2025-05-23	3.76
484	322	2025-05-22	3.92
485	322	2025-05-21	3.73
486	322	2025-05-20	3.6
488	323	2025-05-25	3.81
489	323	2025-05-24	3.81
490	323	2025-05-23	3.99
491	323	2025-05-22	4
492	323	2025-05-21	3.8
493	323	2025-05-20	3.87
494	324	2025-05-26	3.72
495	324	2025-05-25	3.79
496	324	2025-05-24	3.89
497	324	2025-05-23	3.65
498	324	2025-05-22	3.88
499	324	2025-05-21	3.84
500	324	2025-05-20	3.73
501	325	2025-05-26	3.68
502	325	2025-05-25	3.93
503	325	2025-05-24	3.73
504	325	2025-05-23	3.87
505	325	2025-05-22	3.88
506	325	2025-05-21	3.84
507	325	2025-05-20	3.79
508	326	2025-05-26	2.81
509	326	2025-05-25	2.79
510	326	2025-05-24	2.87
511	326	2025-05-23	2.55
512	326	2025-05-22	2.7
513	326	2025-05-21	2.57
514	326	2025-05-20	2.79
515	327	2025-05-26	2.62
516	327	2025-05-25	2.87
517	327	2025-05-24	2.51
518	327	2025-05-23	2.7
519	327	2025-05-22	2.6
520	327	2025-05-21	2.71
521	327	2025-05-20	2.76
522	328	2025-05-26	2.61
523	328	2025-05-25	2.67
524	328	2025-05-24	2.73
525	328	2025-05-23	2.76
526	328	2025-05-22	2.77
527	328	2025-05-21	2.81
528	328	2025-05-20	2.6
529	329	2025-05-26	2.82
530	329	2025-05-25	2.88
531	329	2025-05-24	2.8
532	329	2025-05-23	2.56
533	329	2025-05-22	2.88
534	329	2025-05-21	2.62
535	329	2025-05-20	2.65
480	322	2025-05-26	2.8
487	323	2025-05-26	2.6
536	322	2025-05-27	2.3
537	323	2025-05-27	1.75
538	324	2025-05-27	4
539	325	2025-05-27	2.2
540	332	2025-05-27	2.5
541	322	2025-06-15	5
542	323	2025-06-15	2
543	323	2025-06-22	2.71
544	323	2025-06-21	2.58
545	323	2025-06-20	2.83
546	323	2025-06-19	2.46
547	323	2025-06-18	2.91
548	323	2025-06-17	2.35
549	323	2025-06-16	2.77
550	326	2025-06-22	1.92
551	326	2025-06-21	1.86
552	326	2025-06-20	1.74
553	326	2025-06-19	1.95
554	326	2025-06-18	1.83
555	326	2025-06-17	1.67
556	326	2025-06-16	1.78
557	327	2025-06-22	1.64
558	327	2025-06-21	1.73
559	327	2025-06-20	1.69
560	327	2025-06-19	1.81
561	327	2025-06-18	1.55
562	327	2025-06-17	1.88
563	327	2025-06-16	1.71
564	328	2025-06-22	1.91
565	328	2025-06-21	1.76
566	328	2025-06-20	1.63
567	328	2025-06-19	1.97
568	328	2025-06-18	1.85
569	328	2025-06-17	1.7
570	328	2025-06-16	1.79
571	330	2025-06-22	0
572	330	2025-06-21	0.2
573	330	2025-06-20	0
574	330	2025-06-19	0.4
575	330	2025-06-18	0
576	330	2025-06-17	0.3
577	330	2025-06-16	0
578	331	2025-06-22	0.1
579	331	2025-06-21	0
580	331	2025-06-20	0.3
581	331	2025-06-19	0
582	331	2025-06-18	0
583	331	2025-06-17	0.2
584	331	2025-06-16	0
585	323	2025-07-02	6
594	323	2025-07-05	2.5
595	323	2025-07-06	2.7
596	323	2025-07-07	2.4
597	323	2025-07-08	2.9
598	323	2025-07-09	2.6
599	323	2025-07-10	2.8
600	323	2025-07-11	2.7
601	324	2025-07-05	2.3
602	324	2025-07-06	2.4
603	324	2025-07-07	2.6
604	324	2025-07-08	2.5
605	324	2025-07-09	2.7
606	324	2025-07-10	2.8
607	324	2025-07-11	2.9
608	325	2025-07-05	2.6
609	325	2025-07-06	2.5
610	325	2025-07-07	2.8
611	325	2025-07-08	2.9
612	325	2025-07-09	2.7
613	325	2025-07-10	2.6
614	325	2025-07-11	2.8
615	326	2025-07-05	1.7
616	326	2025-07-06	1.6
617	326	2025-07-07	1.8
618	326	2025-07-08	1.9
619	326	2025-07-09	1.6
620	326	2025-07-10	1.8
621	326	2025-07-11	1.7
622	327	2025-07-05	1.5
623	327	2025-07-06	1.6
624	327	2025-07-07	1.7
625	327	2025-07-08	1.8
626	327	2025-07-09	1.6
627	327	2025-07-10	1.9
628	327	2025-07-11	1.5
629	328	2025-07-05	1.6
630	328	2025-07-06	1.7
631	328	2025-07-07	1.9
632	328	2025-07-08	1.8
633	328	2025-07-09	1.7
634	328	2025-07-10	1.8
635	328	2025-07-11	1.6
636	330	2025-07-05	0.5
637	330	2025-07-06	0.6
638	330	2025-07-07	0.4
639	330	2025-07-08	0.7
640	330	2025-07-09	0.3
641	330	2025-07-10	0.5
642	330	2025-07-11	0.6
643	331	2025-07-05	0.8
644	331	2025-07-06	0.9
645	331	2025-07-07	0.7
646	331	2025-07-08	0.6
647	331	2025-07-09	0.9
648	331	2025-07-10	0.8
649	331	2025-07-11	0.7
650	332	2025-07-05	0.4
651	332	2025-07-06	0.6
652	332	2025-07-07	0.3
653	332	2025-07-08	0.5
654	332	2025-07-09	0.4
655	332	2025-07-10	0.6
656	332	2025-07-11	0.5
657	333	2025-07-05	0.7
658	333	2025-07-06	0.8
659	333	2025-07-07	0.6
660	333	2025-07-08	0.7
661	333	2025-07-09	0.5
662	333	2025-07-10	0.6
663	333	2025-07-11	0.7
664	323	2025-06-28	2.6
665	323	2025-06-29	2.8
666	323	2025-06-30	2.5
667	323	2025-07-01	2.9
668	323	2025-07-02	2.7
669	323	2025-07-03	2.4
670	323	2025-07-04	2.6
671	323	2025-07-12	2.8
672	324	2025-06-28	2.5
673	324	2025-06-29	2.6
674	324	2025-06-30	2.4
675	324	2025-07-01	2.7
676	324	2025-07-02	2.5
677	324	2025-07-03	2.8
678	324	2025-07-04	2.7
679	324	2025-07-12	2.6
680	325	2025-06-28	2.7
681	325	2025-06-29	2.9
682	325	2025-06-30	2.6
683	325	2025-07-01	2.5
684	325	2025-07-02	2.6
685	325	2025-07-03	2.8
686	325	2025-07-04	2.9
687	325	2025-07-12	2.7
688	326	2025-06-28	1.7
689	326	2025-06-29	1.6
690	326	2025-06-30	1.8
691	326	2025-07-01	1.7
692	326	2025-07-02	1.9
693	326	2025-07-03	1.6
694	326	2025-07-04	1.8
695	326	2025-07-12	1.7
696	327	2025-06-28	1.5
697	327	2025-06-29	1.7
698	327	2025-06-30	1.6
699	327	2025-07-01	1.8
700	327	2025-07-02	1.7
701	327	2025-07-03	1.6
702	327	2025-07-04	1.9
703	327	2025-07-12	1.6
704	328	2025-06-28	1.6
705	328	2025-06-29	1.5
706	328	2025-06-30	1.9
707	328	2025-07-01	1.8
708	328	2025-07-02	1.7
709	328	2025-07-03	1.8
710	328	2025-07-04	1.6
711	328	2025-07-12	1.8
712	330	2025-06-28	0.5
713	330	2025-06-29	0.6
714	330	2025-06-30	0.4
715	330	2025-07-01	0.5
716	330	2025-07-02	0.3
717	330	2025-07-03	0.6
718	330	2025-07-04	0.7
719	330	2025-07-12	0.6
720	331	2025-06-28	0.8
721	331	2025-06-29	0.7
722	331	2025-06-30	0.9
723	331	2025-07-01	0.8
724	331	2025-07-02	0.7
725	331	2025-07-03	0.9
726	331	2025-07-04	0.6
727	331	2025-07-12	0.8
728	332	2025-06-28	0.6
729	332	2025-06-29	0.4
730	332	2025-06-30	0.5
731	332	2025-07-01	0.3
732	332	2025-07-02	0.6
733	332	2025-07-03	0.5
734	332	2025-07-04	0.4
735	332	2025-07-12	0.5
736	333	2025-06-28	0.7
737	333	2025-06-29	0.6
738	333	2025-06-30	0.5
739	333	2025-07-01	0.7
740	333	2025-07-02	0.6
741	333	2025-07-03	0.8
742	333	2025-07-04	0.6
743	333	2025-07-12	0.7
\.


--
-- Data for Name: sensor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensor (id, farm_id, name, min_value, max_value, current_value, "timestamp") FROM stdin;
5	316	Amoníaco	30.00	50.00	51.00	2025-05-23 01:21:17.718949
15	317	Temperatura	12.00	37.00	25.00	2025-05-27 01:28:05.232929
17	317	Humidade	20.00	50.00	33.00	2025-05-27 01:33:53.665499
19	317	Amoníaco	0.00	20.00	21.00	2025-05-27 01:56:31.266306
\.


--
-- Data for Name: sheep; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sheep (id, birth_date, farm_id, feeding_hay, feeding_feed, gender, group_id) FROM stdin;
314	2025-05-01	316	15	5	Macho	\N
316	2025-05-03	316	9	3	Fêmea	\N
315	2025-05-02	316	8	3	Fêmea	104
323	2021-07-15	317	1.5	1	Fêmea	105
325	2022-02-05	317	1.5	1	Fêmea	105
326	2022-05-11	317	1.75	1.5	Fêmea	106
327	2021-08-08	317	1.75	1.5	Fêmea	106
328	2020-11-03	317	1.75	1.5	Fêmea	106
330	2022-06-10	317	0.5	0.8	Fêmea	107
331	2021-09-19	317	0.5	0.8	Fêmea	107
332	2021-10-10	317	1	1.5	Fêmea	108
333	2022-01-22	317	1	1.5	Fêmea	108
334	2025-05-10	317	0	0.25	Fêmea	109
335	2025-05-11	317	0	0.25	Macho	109
336	2025-05-12	317	0	0.25	Fêmea	109
340	2025-07-08	317	0	0	Fêmea	\N
320	2022-01-11	317	1.5	2	Macho	113
318	2021-05-20	317	1.5	2	Macho	113
319	2020-07-15	317	1.5	2	Macho	113
321	2021-12-22	317	1.5	2	Macho	113
337	2025-05-13	317	0	0.25	Macho	113
317	2021-03-10	317	1.5	2	Macho	113
338	2025-05-08	317	1	1.2	Fêmea	\N
322	2021-06-10	317	1.5	1	Fêmea	\N
324	2020-09-20	317	1.5	1	Fêmea	\N
329	2021-04-14	317	1.75	1.5	Fêmea	\N
339	2025-05-13	317	1	2	Fêmea	\N
\.


--
-- Data for Name: sheep_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sheep_group (id, name, description, farm_id) FROM stdin;
104	Baixa produção	\N	316
105	Alta Produção	\N	317
106	Média Produção	\N	317
107	Pré-Parto	\N	317
108	Pós-Parto	\N	317
109	Crias	\N	317
113	Machos	\N	317
\.


--
-- Data for Name: sheep_parentage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sheep_parentage (id, parent_id, offspring_id) FROM stdin;
28	314	315
29	318	334
30	319	335
31	320	336
32	321	337
35	320	338
36	322	338
37	317	339
38	323	339
39	317	322
40	324	322
42	321	324
43	322	324
44	317	333
45	323	333
46	317	340
47	323	340
\.


--
-- Data for Name: veterinarian; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.veterinarian (id, name, email, password, farm_id, farmer_id) FROM stdin;
30	Paulo	paulo@gmail.com	$2a$12$L.HMHBodKMtVk5gscQsDTugNMOer7hDfRcxj4tWS007D5kzAM0li6	317	317
\.


--
-- Name: appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointment_id_seq', 45, true);


--
-- Name: farm_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.farm_id_seq', 317, true);


--
-- Name: farm_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.farm_inventory_id_seq', 82, true);


--
-- Name: farmer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.farmer_id_seq', 317, true);


--
-- Name: medication_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medication_id_seq', 20, true);


--
-- Name: milk_production_individual_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.milk_production_individual_id_seq', 743, true);


--
-- Name: sensor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sensor_id_seq', 19, true);


--
-- Name: sheep_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sheep_group_id_seq', 117, true);


--
-- Name: sheep_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sheep_id_seq', 340, true);


--
-- Name: sheep_parentage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sheep_parentage_id_seq', 47, true);


--
-- Name: veterinarian_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.veterinarian_id_seq', 30, true);


--
-- Name: sheep_parentage _parent_offspring_uc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep_parentage
    ADD CONSTRAINT _parent_offspring_uc UNIQUE (parent_id, offspring_id);


--
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (id);


--
-- Name: appointment_sheep appointment_sheep_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_sheep
    ADD CONSTRAINT appointment_sheep_pkey PRIMARY KEY (appointment_id, sheep_id);


--
-- Name: farm_inventory farm_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm_inventory
    ADD CONSTRAINT farm_inventory_pkey PRIMARY KEY (id);


--
-- Name: farm farm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm
    ADD CONSTRAINT farm_pkey PRIMARY KEY (id);


--
-- Name: farmer farmer_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmer
    ADD CONSTRAINT farmer_email_key UNIQUE (email);


--
-- Name: farmer farmer_farm_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmer
    ADD CONSTRAINT farmer_farm_id_key UNIQUE (farm_id);


--
-- Name: farmer farmer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmer
    ADD CONSTRAINT farmer_pkey PRIMARY KEY (id);


--
-- Name: medication medication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medication
    ADD CONSTRAINT medication_pkey PRIMARY KEY (id);


--
-- Name: milk_production_individual milk_production_individual_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milk_production_individual
    ADD CONSTRAINT milk_production_individual_pkey PRIMARY KEY (id);


--
-- Name: sensor sensor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_pkey PRIMARY KEY (id);


--
-- Name: sheep_group sheep_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep_group
    ADD CONSTRAINT sheep_group_pkey PRIMARY KEY (id);


--
-- Name: sheep_parentage sheep_parentage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep_parentage
    ADD CONSTRAINT sheep_parentage_pkey PRIMARY KEY (id);


--
-- Name: sheep sheep_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep
    ADD CONSTRAINT sheep_pkey PRIMARY KEY (id);


--
-- Name: veterinarian veterinarian_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarian
    ADD CONSTRAINT veterinarian_email_key UNIQUE (email);


--
-- Name: veterinarian veterinarian_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarian
    ADD CONSTRAINT veterinarian_pkey PRIMARY KEY (id);


--
-- Name: ix_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_appointment_id ON public.appointment USING btree (id);


--
-- Name: ix_farm_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_farm_id ON public.farm USING btree (id);


--
-- Name: ix_farm_inventory_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_farm_inventory_id ON public.farm_inventory USING btree (id);


--
-- Name: ix_farmer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_farmer_id ON public.farmer USING btree (id);


--
-- Name: ix_medication_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_medication_id ON public.medication USING btree (id);


--
-- Name: ix_milk_production_individual_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_milk_production_individual_id ON public.milk_production_individual USING btree (id);


--
-- Name: ix_sheep_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sheep_group_id ON public.sheep_group USING btree (id);


--
-- Name: ix_sheep_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sheep_id ON public.sheep USING btree (id);


--
-- Name: ix_sheep_parentage_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sheep_parentage_id ON public.sheep_parentage USING btree (id);


--
-- Name: ix_veterinarian_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_veterinarian_id ON public.veterinarian USING btree (id);


--
-- Name: appointment_sheep appointment_sheep_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_sheep
    ADD CONSTRAINT appointment_sheep_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointment(id) ON DELETE CASCADE;


--
-- Name: appointment_sheep appointment_sheep_sheep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_sheep
    ADD CONSTRAINT appointment_sheep_sheep_id_fkey FOREIGN KEY (sheep_id) REFERENCES public.sheep(id) ON DELETE CASCADE;


--
-- Name: appointment appointment_vet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_vet_id_fkey FOREIGN KEY (vet_id) REFERENCES public.veterinarian(id);


--
-- Name: farm_inventory farm_inventory_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm_inventory
    ADD CONSTRAINT farm_inventory_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id);


--
-- Name: medication medication_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medication
    ADD CONSTRAINT medication_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointment(id);


--
-- Name: milk_production_individual milk_production_individual_sheep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milk_production_individual
    ADD CONSTRAINT milk_production_individual_sheep_id_fkey FOREIGN KEY (sheep_id) REFERENCES public.sheep(id);


--
-- Name: sensor sensor_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id);


--
-- Name: sheep sheep_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep
    ADD CONSTRAINT sheep_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id);


--
-- Name: sheep_group sheep_group_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep_group
    ADD CONSTRAINT sheep_group_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id);


--
-- Name: sheep sheep_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep
    ADD CONSTRAINT sheep_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.sheep_group(id);


--
-- Name: sheep_parentage sheep_parentage_offspring_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep_parentage
    ADD CONSTRAINT sheep_parentage_offspring_id_fkey FOREIGN KEY (offspring_id) REFERENCES public.sheep(id);


--
-- Name: sheep_parentage sheep_parentage_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheep_parentage
    ADD CONSTRAINT sheep_parentage_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.sheep(id);


--
-- Name: veterinarian veterinarian_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarian
    ADD CONSTRAINT veterinarian_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id);


--
-- Name: veterinarian veterinarian_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarian
    ADD CONSTRAINT veterinarian_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

