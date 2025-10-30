--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0 (Debian 16.0-1.pgdg120+1)
-- Dumped by pg_dump version 17.0

-- Started on 2025-06-08 23:51:02
--SET ROLE giventa_event_management;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
--SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--DROP DATABASE giventa_event_management;
--
-- TOC entry 3921 (class 1262 OID 58386)
-- Name: giventa_event_management; Type: DATABASE; Schema: -; Owner: giventa_event_management
--

--CREATE DATABASE giventa_event_management WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


-- ALTER DATABASE giventa_event_management OWNER TO giventa_event_management;

--\connect giventa_event_management

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Drop existing types if they exist (for clean recreation)
DROP TYPE IF EXISTS public.guest_age_group CASCADE;
DROP TYPE IF EXISTS public.user_to_guest_relationship CASCADE;
DROP TYPE IF EXISTS public.user_event_registration_status CASCADE;
DROP TYPE IF EXISTS public.user_event_check_in_status CASCADE;
DROP TYPE IF EXISTS public.subscription_plan_type CASCADE;
DROP TYPE IF EXISTS public.subscription_status_type CASCADE;
DROP TYPE IF EXISTS public.user_role_type CASCADE;
DROP TYPE IF EXISTS public.user_status_type CASCADE;
DROP TYPE IF EXISTS public.event_admission_type CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_status CASCADE;


-- Guest age group classifications
CREATE TYPE public.guest_age_group AS ENUM ('ADULT', 'TEEN', 'CHILD', 'INFANT');

-- User to guest relationship types
CREATE TYPE public.user_to_guest_relationship AS ENUM ('SPOUSE', 'CHILD', 'FRIEND', 'COLLEAGUE', 'PARENT', 'SIBLING', 'RELATIVE', 'OTHER');

-- Registration status for events
CREATE TYPE public.user_event_registration_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLISTED');

-- Check-in status for events
CREATE TYPE public.user_event_check_in_status AS ENUM ('NOT_CHECKED_IN', 'CHECKED_IN', 'NO_SHOW', 'LEFT_EARLY');

-- Subscription plans
CREATE TYPE public.subscription_plan_type AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- Subscription status
CREATE TYPE public.subscription_status_type AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'TRIAL');

-- User roles
CREATE TYPE public.user_role_type AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'ORGANIZER', 'VOLUNTEER');

-- User status
CREATE TYPE public.user_status_type AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'BANNED');

-- Event admission types
CREATE TYPE public.event_admission_type AS ENUM ('FREE', 'TICKETED', 'INVITATION_ONLY', 'DONATION_BASED');

-- Transaction types
CREATE TYPE public.transaction_type AS ENUM ('SUBSCRIPTION', 'TICKET_SALE', 'COMMISSION', 'REFUND', 'CHARGEBACK');

-- Transaction status
CREATE TYPE public.transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');



-- ===================================================
-- drop functions
-- ===================================================
DROP FUNCTION IF EXISTS public.generate_attendee_qr_code() CASCADE;
DROP FUNCTION IF EXISTS public.generate_enhanced_qr_code() CASCADE;
DROP FUNCTION IF EXISTS public.manage_ticket_inventory() CASCADE;
DROP FUNCTION IF EXISTS public.update_ticket_sold_quantity() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_dates() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_dates_alt1() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_dates_alt2() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_details() CASCADE;
DROP FUNCTION IF EXISTS public.set_transaction_reference() CASCADE;

DROP TRIGGER IF EXISTS trg_set_transaction_reference ON public.event_ticket_transaction;

-- Drop sequence if exists and recreate
DROP SEQUENCE IF EXISTS public.sequence_generator CASCADE;
DROP SEQUENCE IF EXISTS public.discount_code_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.event_live_update_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.event_score_card_detail_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.event_score_card_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.event_live_update_attachment_id_seq  CASCADE;


-- ===================================================
-- DROP EXISTING TABLES (in reverse dependency order)
-- ===================================================

DROP TABLE IF EXISTS public.bulk_operation_log CASCADE;
DROP TABLE IF EXISTS public.qr_code_usage CASCADE;

DROP TABLE IF EXISTS public.event_attendee_guest CASCADE;
DROP TABLE IF EXISTS public.event_guest_pricing CASCADE;
DROP TABLE IF EXISTS public.event_attendee CASCADE;
DROP TABLE IF EXISTS public.event_admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.event_calendar_entry CASCADE;
DROP TABLE IF EXISTS public.event_media CASCADE;
DROP TABLE IF EXISTS public.event_poll_response CASCADE;
DROP TABLE IF EXISTS public.event_poll_option CASCADE;
DROP TABLE IF EXISTS public.event_poll CASCADE;
DROP TABLE IF EXISTS public.event_ticket_transaction CASCADE;
DROP TABLE IF EXISTS public.event_ticket_transaction_item CASCADE;
DROP TABLE IF EXISTS public.user_payment_transaction CASCADE;
DROP TABLE IF EXISTS public.event_ticket_type CASCADE;
DROP TABLE IF EXISTS public.event_organizer CASCADE;
-- New event-related tables (in reverse dependency order)
DROP TABLE IF EXISTS public.event_program_directors CASCADE;
DROP TABLE IF EXISTS public.event_emails CASCADE;
DROP TABLE IF EXISTS public.event_sponsors_join CASCADE;
DROP TABLE IF EXISTS public.event_sponsors CASCADE;
DROP TABLE IF EXISTS public.event_contacts CASCADE;
DROP TABLE IF EXISTS public.event_featured_performers CASCADE;
DROP TABLE IF EXISTS public.event_details CASCADE;
DROP TABLE IF EXISTS public.event_admin CASCADE;
DROP TABLE IF EXISTS public.event_live_update_attachment CASCADE;
DROP TABLE IF EXISTS public.event_live_update CASCADE;
DROP TABLE IF EXISTS public.event_score_card CASCADE;
DROP TABLE IF EXISTS public.event_score_card_detail CASCADE;
DROP TABLE IF EXISTS public.rel_event_details__discount_codes CASCADE;
DROP TABLE IF EXISTS public.user_task CASCADE;
DROP TABLE IF EXISTS public.user_subscription CASCADE;
DROP TABLE IF EXISTS public.event_type_details CASCADE;
DROP TABLE IF EXISTS public.tenant_settings CASCADE;
DROP TABLE IF EXISTS public.user_profile CASCADE;
DROP TABLE IF EXISTS public.tenant_organization CASCADE;
DROP TABLE IF EXISTS public.databasechangeloglock CASCADE;
DROP TABLE IF EXISTS public.databasechangelog CASCADE;
DROP TABLE IF EXISTS public.discount_code CASCADE;
DROP TABLE IF EXISTS public.communication_campaign CASCADE;
DROP TABLE IF EXISTS public.email_log CASCADE;
DROP TABLE IF EXISTS public.whatsapp_log CASCADE;
DROP TABLE IF EXISTS public.executive_committee_team_members CASCADE;

CREATE FUNCTION public.generate_attendee_qr_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.registration_status = 'CONFIRMED' AND (OLD IS NULL OR OLD.registration_status != 'CONFIRMED') THEN
        NEW.qr_code_data = 'ATTENDEE:' || NEW.id || '|EVENT:' || NEW.event_id || '|TENANT:' || NEW.tenant_id || '|TIMESTAMP:' || extract(epoch from NOW());
        NEW.qr_code_generated = TRUE;
    END IF;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.generate_attendee_qr_code() OWNER TO giventa_event_management;

--
-- TOC entry 272 (class 1255 OID 71151)
-- Name: generate_enhanced_qr_code(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.generate_enhanced_qr_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    qr_data TEXT;
    event_title TEXT;
    attendee_name TEXT;
BEGIN
    -- Only generate QR code for confirmed attendees
    IF NEW.registration_status = 'CONFIRMED' AND
       (OLD IS NULL OR OLD.registration_status != 'CONFIRMED' OR OLD.qr_code_data IS NULL) THEN

        -- Get event title and attendee name for better QR code
        SELECT e.title INTO event_title
        FROM public.event_details e
        WHERE e.id = NEW.event_id;

        SELECT up.first_name || ' ' || up.last_name INTO attendee_name
        FROM public.user_profile up
        WHERE up.id = NEW.user_id;

        -- Generate comprehensive QR code data
        qr_data := 'ATTENDEE:' || NEW.id ||
                   '|EVENT:' || NEW.event_id ||
                   '|TENANT:' || NEW.tenant_id ||
                   '|NAME:' || COALESCE(attendee_name, 'Unknown') ||
                   '|EVENT_TITLE:' || COALESCE(event_title, 'Unknown Event') ||
                   '|TIMESTAMP:' || extract(epoch from NOW()) ||
                   '|TYPE:' || COALESCE(NEW.attendee_type, 'MEMBER');

        NEW.qr_code_data = qr_data;
        NEW.qr_code_generated = TRUE;
        NEW.qr_code_generated_at = NOW();

        RAISE NOTICE 'Generated QR code for attendee % at event %', attendee_name, event_title;
    END IF;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.generate_enhanced_qr_code() OWNER TO giventa_event_management;

--
-- TOC entry 273 (class 1255 OID 71150)
-- Name: manage_ticket_inventory(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE OR REPLACE FUNCTION public.manage_ticket_inventory() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    ticket_type_record RECORD;
    available_quantity INTEGER;
    parent_status TEXT;
    txn_id BIGINT;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        txn_id := NEW.transaction_id;
    ELSE
        txn_id := OLD.transaction_id;
    END IF;

    -- Get parent transaction status
    SELECT status INTO parent_status FROM public.event_ticket_transaction WHERE id = txn_id;

    IF parent_status != 'COMPLETED' THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Get ticket type details
    IF TG_OP = 'INSERT' THEN
        SELECT * INTO ticket_type_record
        FROM public.event_ticket_type
        WHERE id = NEW.ticket_type_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Ticket type not found for ID: %', NEW.ticket_type_id;
        END IF;

        available_quantity := ticket_type_record.available_quantity - ticket_type_record.sold_quantity;
        IF available_quantity < NEW.quantity THEN
            RAISE EXCEPTION 'Insufficient tickets available. Requested: %, Available: %',
                NEW.quantity, available_quantity;
        END IF;

        UPDATE public.event_ticket_type
        SET sold_quantity = sold_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.ticket_type_id;

        RAISE NOTICE 'Added % tickets to sold quantity for ticket type %', NEW.quantity, NEW.ticket_type_id;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.ticket_type_id = NEW.ticket_type_id THEN
            UPDATE public.event_ticket_type
            SET sold_quantity = sold_quantity - OLD.quantity + NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.ticket_type_id;
        ELSE
            -- Remove from old ticket type
            UPDATE public.event_ticket_type
            SET sold_quantity = sold_quantity - OLD.quantity,
                updated_at = NOW()
            WHERE id = OLD.ticket_type_id;
            -- Add to new ticket type
            UPDATE public.event_ticket_type
            SET sold_quantity = sold_quantity + NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.ticket_type_id;
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.event_ticket_type
        SET sold_quantity = sold_quantity - OLD.quantity,
            updated_at = NOW()
        WHERE id = OLD.ticket_type_id;

        RAISE NOTICE 'Removed % tickets from sold quantity for ticket type %', OLD.quantity, OLD.ticket_type_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


-- ALTER FUNCTION public.manage_ticket_inventory() OWNER TO giventa_event_management;


--
-- TOC entry 255 (class 1255 OID 71143)
-- Name: update_ticket_sold_quantity(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.update_ticket_sold_quantity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'COMPLETED' THEN
        UPDATE public.event_ticket_type
        SET sold_quantity = sold_quantity + NEW.quantity
        WHERE id = NEW.ticket_type_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
        UPDATE public.event_ticket_type
        SET sold_quantity = sold_quantity + NEW.quantity
        WHERE id = NEW.ticket_type_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'COMPLETED' AND NEW.status != 'COMPLETED' THEN
        UPDATE public.event_ticket_type
        SET sold_quantity = sold_quantity - OLD.quantity
        WHERE id = OLD.ticket_type_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'COMPLETED' THEN
        UPDATE public.event_ticket_type
        SET sold_quantity = sold_quantity - OLD.quantity
        WHERE id = OLD.ticket_type_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


-- ALTER FUNCTION public.update_ticket_sold_quantity() OWNER TO giventa_event_management;

--
-- TOC entry 271 (class 1255 OID 70264)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.update_updated_at_column() OWNER TO giventa_event_management;

--
-- TOC entry 254 (class 1255 OID 71141)
-- Name: validate_event_dates(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.validate_event_dates() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure start_date is not in the past (allow same day)
--    IF NEW.start_date < CURRENT_DATE THEN
--        RAISE EXCEPTION 'Event start date cannot be in the past';
--    END IF;

    -- Ensure registration deadline is before event start
    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
    END IF;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.validate_event_dates() OWNER TO giventa_event_management;

--
-- TOC entry 257 (class 1255 OID 71147)
-- Name: validate_event_dates_alt1(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.validate_event_dates_alt1() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
--    IF NEW.start_date < CURRENT_DATE THEN
--        RAISE EXCEPTION 'Event start date cannot be in the past';
--    END IF;

    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
    END IF;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.validate_event_dates_alt1() OWNER TO giventa_event_management;

--
-- TOC entry 258 (class 1255 OID 71148)
-- Name: validate_event_dates_alt2(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.validate_event_dates_alt2() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
--    IF NEW.start_date < CURRENT_DATE THEN
--        RAISE EXCEPTION 'Event start date cannot be in the past';
--    END IF;

    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
    END IF;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.validate_event_dates_alt2() OWNER TO giventa_event_management;

--
-- TOC entry 270 (class 1255 OID 71149)
-- Name: validate_event_details(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.validate_event_details() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Validate start date
--    IF NEW.start_date < CURRENT_DATE THEN
--        RAISE EXCEPTION 'Event start date (%) cannot be in the past. Current date: %',
--            NEW.start_date, CURRENT_DATE;
--    END IF;

    -- Validate end date
--    IF NEW.end_date < NEW.start_date THEN
--        RAISE EXCEPTION 'Event end date (%) cannot be before start date (%)',
--            NEW.end_date, NEW.start_date;
--    END IF;

    -- JDL VALIDATION: If allowGuests = true, maxGuestsPerAttendee should be > 0
    IF NEW.allow_guests = TRUE AND (NEW.max_guests_per_attendee IS NULL OR NEW.max_guests_per_attendee <= 0) THEN
        RAISE EXCEPTION 'When guests are allowed, max_guests_per_attendee must be greater than 0';
    END IF;

    -- JDL VALIDATION: Validate capacity
    IF NEW.capacity IS NOT NULL AND NEW.capacity <= 0 THEN
        RAISE EXCEPTION 'Event capacity must be greater than zero, got: %', NEW.capacity;
    END IF;

    -- Log the validation success
    RAISE NOTICE 'Event validation passed for event: %', NEW.title;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.validate_event_details() OWNER TO giventa_event_management;

--
-- TOC entry 224 (class 1259 OID 82754)
-- Name: sequence_generator; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.sequence_generator
    START WITH 1050
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.sequence_generator OWNER TO giventa_event_management;

SET default_tablespace = '';

SET default_table_access_method = heap;



--
-- TOC entry 230 (class 1259 OID 82796)
-- Name: user_profile; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.user_profile (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
user_id character varying(255) NOT NULL,
first_name character varying(255),
last_name character varying(255),
email character varying(255),
phone character varying(255),
address_line_1 character varying(255),
address_line_2 character varying(255),
city character varying(255),
state character varying(255),
zip_code character varying(255),
country character varying(255),
notes text,
family_name character varying(255),
city_town character varying(255),
district character varying(255),
educational_institution character varying(255),
profile_image_url character varying(1024),
is_email_subscribed BOOLEAN,
email_subscription_token VARCHAR(255),
is_email_subscription_token_used BOOLEAN,
user_status character varying(50),
user_role character varying(50),
reviewed_by_admin_at timestamp without time zone,
reviewed_by_admin_id bigint,
created_at timestamp without time zone DEFAULT now() NOT NULL,
updated_at timestamp without time zone DEFAULT now() NOT NULL,
CONSTRAINT check_email_format CHECK (((email IS NULL) OR ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
    request_id character varying(255) UNIQUE,
    request_reason text,
    status character varying(50),
    admin_comments text,
    submitted_at timestamp without time zone,
    reviewed_at timestamp without time zone,
    approved_at timestamp without time zone,
    rejected_at timestamp without time zone,
    CONSTRAINT user_profile_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.user_profile OWNER TO giventa_event_management;

--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE user_profile; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.user_profile IS 'User profiles with tenant isolation and enhanced fields';

--
-- TOC entry 238 (class 1259 OID 82938)
-- Name: bulk_operation_log; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.bulk_operation_log (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    operation_type character varying(50) NOT NULL,
    operation_name character varying(255),
    performed_by bigint,
    target_count integer NOT NULL,
    success_count integer DEFAULT 0,
    error_count integer DEFAULT 0,
    skipped_count integer DEFAULT 0,
    operation_details  VARCHAR(16384),
    error_details text,
    execution_time_ms integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    CONSTRAINT check_operation_counts CHECK ((((success_count + error_count) + skipped_count) <= target_count))
);


-- ALTER TABLE public.bulk_operation_log OWNER TO giventa_event_management;

--
-- TOC entry 225 (class 1259 OID 82755)
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


-- ALTER TABLE public.databasechangelog OWNER TO giventa_event_management;

--
-- TOC entry 226 (class 1259 OID 82760)
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


-- ALTER TABLE public.databasechangeloglock OWNER TO giventa_event_management;


--
-- TOC entry 234 (class 1259 OID 82865)
-- Name: event_details; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_details (
   id int8 DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
	tenant_id varchar(255) NULL,
	title varchar(255) NOT NULL,
	caption varchar(500) NULL,
	description text NULL,
	start_date date NOT NULL,
	promotion_start_date date NOT NULL,
	end_date date NOT NULL,
	start_time varchar(100) NOT NULL,
	end_time varchar(100) NOT NULL,
	timezone varchar(64) NOT NULL,
	"location" varchar(500) NULL,
	directions_to_venue text NULL,
	capacity int4 NULL,
	admission_type varchar(50) NULL,
	is_active bool DEFAULT true NULL,
	max_guests_per_attendee int4 DEFAULT 0 NULL,
	allow_guests bool DEFAULT false NULL,
	require_guest_approval bool DEFAULT false NULL,
	enable_guest_pricing bool DEFAULT false NULL,
	registration_deadline timestamp NULL,
	cancellation_deadline timestamp NULL,
	minimum_age int4 NULL,
	maximum_age int4 NULL,
	requires_approval bool DEFAULT false NULL,
	enable_waitlist bool DEFAULT true NULL,
	enable_qr_code bool DEFAULT false NULL,
	external_registration_url varchar(1024) NULL,
	created_by_id int8 NULL,
	event_type_id int8 NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	is_registration_required bool DEFAULT false NULL,
	is_sports_event bool DEFAULT false NULL,
	is_live bool DEFAULT false NULL,
	is_featured_event BOOLEAN NOT NULL DEFAULT false,
    featured_event_priority_ranking INT4 NOT NULL DEFAULT 0,
    live_event_priority_ranking INT4 NOT NULL DEFAULT 0,
    CONSTRAINT check_age_ranges CHECK (((minimum_age IS NULL) OR (maximum_age IS NULL) OR (maximum_age >= minimum_age))),
    CONSTRAINT check_capacity_positive CHECK (((capacity IS NULL) OR (capacity > 0))),
    CONSTRAINT check_deadlines CHECK (((registration_deadline IS NULL) OR (cancellation_deadline IS NULL) OR (cancellation_deadline <= registration_deadline))),
    CONSTRAINT check_event_dates CHECK ((end_date >= start_date)),
    CONSTRAINT event_details_max_guests_per_attendee_check CHECK ((max_guests_per_attendee >= 0)),
    CONSTRAINT event_details_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_details OWNER TO giventa_event_management;

--
-- TOC entry 3944 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE event_details; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_details IS 'Enhanced event details with guest management and validation';


--
-- TOC entry 3945 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.max_guests_per_attendee; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.max_guests_per_attendee IS 'Maximum number of guests allowed per primary attendee';


--
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.allow_guests; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.allow_guests IS 'Whether guest registrations are allowed for this event';


--
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.require_guest_approval; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.require_guest_approval IS 'Whether guest registrations require admin approval';


--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.enable_guest_pricing; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.enable_guest_pricing IS 'Whether special pricing applies to guests';


--
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_registration_required; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.is_registration_required IS 'Whether formal registration is required for this event';


--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_sports_event; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.is_sports_event IS 'Whether this event is a sports event';


--
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_live; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.is_live IS 'Whether this event is currently live and should be featured on the home page';



--
-- TOC entry 251 (class 1259 OID 83147)
-- Name: event_guest_pricing; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_guest_pricing (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    event_id bigint NOT NULL,
    age_group character varying(20) NOT NULL,
    price numeric(21,2) DEFAULT 0.00 NOT NULL,
    is_active boolean DEFAULT true,
    valid_from date,
    valid_to date,
    description character varying(255),
    max_guests integer,
    pricing_tier character varying(100),
    early_bird_price numeric(21,2),
    early_bird_deadline timestamp without time zone,
    group_discount_threshold integer,
    group_discount_percentage numeric(5,2),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_group_discount_threshold CHECK (((group_discount_threshold IS NULL) OR (group_discount_threshold > 1))),
    CONSTRAINT check_guest_pricing_amounts CHECK (((price >= (0)::numeric) AND ((early_bird_price IS NULL) OR (early_bird_price >= (0)::numeric)) AND ((group_discount_percentage IS NULL) OR ((group_discount_percentage >= (0)::numeric) AND (group_discount_percentage <= (100)::numeric))))),
    CONSTRAINT check_max_guests_positive CHECK (((max_guests IS NULL) OR (max_guests > 0))),
    CONSTRAINT check_valid_date_range CHECK (((valid_from IS NULL) OR (valid_to IS NULL) OR (valid_to >= valid_from))),
    CONSTRAINT event_guest_pricing_price_check CHECK ((price >= (0)::numeric))
);


-- ALTER TABLE public.event_guest_pricing OWNER TO giventa_event_management;

--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE event_guest_pricing; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_guest_pricing IS 'Flexible pricing structure for event guests with JDL validation';


--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.price; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.price IS 'Guest price (required, minimum 0)';


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.is_active; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.is_active IS 'Whether this pricing is currently active';


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.valid_from; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.valid_from IS 'Start date for pricing validity';


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.valid_to; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.valid_to IS 'End date for pricing validity';


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.description; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.description IS 'Pricing description (max 255 chars)';


--
-- TOC entry 220 (class 1259 OID 77428)
-- Name: event_live_update; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_live_update (
    id bigint NOT NULL,
    event_id bigint NOT NULL,
    update_type character varying(20) NOT NULL,
    content_text text,
    content_image_url character varying(1024),
    content_video_url character varying(1024),
    content_link_url character varying(1024),
    metadata  VARCHAR(4096),
    display_order integer DEFAULT 0,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT event_live_update_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_live_update OWNER TO giventa_event_management;

--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE event_live_update; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_live_update IS 'Live updates (text, image, video, etc.) for events';


--
-- TOC entry 222 (class 1259 OID 77446)
-- Name: event_live_update_attachment; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_live_update_attachment (
    id bigint NOT NULL,
    live_update_id bigint NOT NULL,
    attachment_type character varying(20),
    attachment_url character varying(1024),
    display_order integer DEFAULT 0,
     metadata  VARCHAR(4096),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


-- ALTER TABLE public.event_live_update_attachment OWNER TO giventa_event_management;

--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE event_live_update_attachment; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_live_update_attachment IS 'Attachments (image, video, etc.) for live event updates';


--
-- TOC entry 221 (class 1259 OID 77445)
-- Name: event_live_update_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.event_live_update_attachment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.event_live_update_attachment_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 221
-- Name: event_live_update_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--

ALTER SEQUENCE public.event_live_update_attachment_id_seq OWNED BY public.event_live_update_attachment.id;


--
-- TOC entry 219 (class 1259 OID 77427)
-- Name: event_live_update_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.event_live_update_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.event_live_update_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 219
-- Name: event_live_update_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--

ALTER SEQUENCE public.event_live_update_id_seq OWNED BY public.event_live_update.id;

--
-- TOC entry 235 (class 1259 OID 82890)
-- Name: event_admin; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_admin (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    role character varying(255) NOT NULL,
    permissions text[],
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id bigint,
    created_by_id bigint
);


-- ALTER TABLE public.event_admin OWNER TO giventa_event_management;

--
-- TOC entry 249 (class 1259 OID 83122)
-- Name: event_admin_audit_log; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_admin_audit_log (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    action character varying(255) NOT NULL,
    table_name character varying(255) NOT NULL,
    record_id character varying(255) NOT NULL,
    changes VARCHAR(8192) NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    session_id character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    admin_id bigint
);


-- ALTER TABLE public.event_admin_audit_log OWNER TO giventa_event_management;

--
-- TOC entry 3932 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE event_admin_audit_log; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_admin_audit_log IS 'Comprehensive audit logging for all admin actions';

--
-- TOC entry 248 (class 1259 OID 83101)
-- Name: event_attendee; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_attendee (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
event_id bigint NOT NULL,
user_id bigint,
registration_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
registration_date timestamp without time zone DEFAULT now() NOT NULL,
confirmation_date timestamp without time zone,
cancellation_date timestamp without time zone,
cancellation_reason text,
attendee_type character varying(50) DEFAULT 'MEMBER'::character varying,
special_requirements text,
dietary_restrictions text,
accessibility_needs text,
emergency_contact_name character varying(255),
emergency_contact_phone character varying(50),
emergency_contact_relationship character varying(100),
total_number_of_guests integer,
number_of_guests_checked_in integer,
check_in_status character varying(20) DEFAULT 'NOT_CHECKED_IN'::character varying,
check_in_time timestamp without time zone,
check_out_time timestamp without time zone,
attendance_rating integer,
feedback text,
notes text,
qr_code_data character varying(1000),
qr_code_generated boolean DEFAULT false,
qr_code_generated_at timestamp without time zone,
registration_source character varying(100) DEFAULT 'DIRECT'::character varying,
    waitlist_position integer,
    priority_score integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255),
    phone character varying(255),
    is_member boolean,
    CONSTRAINT event_attendee_pkey PRIMARY KEY (id),
    CONSTRAINT check_waitlist_position_positive CHECK (((waitlist_position IS NULL) OR (waitlist_position > 0))),
    CONSTRAINT event_attendee_attendance_rating_check CHECK (((attendance_rating >= 1) AND (attendance_rating <= 5))),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE SET null,
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET null
);


-- ALTER TABLE public.event_attendee OWNER TO giventa_event_management;

--
-- TOC entry 3934 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE event_attendee; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_attendee IS 'Enhanced event registration and attendance tracking with QR code support';


--
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_data; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee.qr_code_data IS 'QR code data for check-in (auto-generated)';


--
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_generated; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee.qr_code_generated IS 'Whether QR code has been generated for this attendee';


--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_generated_at; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee.qr_code_generated_at IS 'Timestamp when QR code was generated';


--
-- TOC entry 250 (class 1259 OID 83131)
-- Name: event_attendee_guest; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_attendee_guest (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
primary_attendee_id bigint NOT NULL,
age_group character varying(20) NOT NULL,
relationship character varying(20),
special_requirements text,
dietary_restrictions text,
accessibility_needs text,
registration_status character varying(20) DEFAULT 'PENDING'::character varying,
check_in_status character varying(20) DEFAULT 'NOT_CHECKED_IN'::character varying,
check_in_time timestamp without time zone,
check_out_time timestamp without time zone,
approval_status character varying(50) DEFAULT 'PENDING'::character varying,
approved_by_id bigint,
approved_at timestamp without time zone,
rejection_reason text,
pricing_tier character varying(100),
fee_amount numeric(21,2) DEFAULT 0,
payment_status character varying(50) DEFAULT 'PENDING'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_guest_fee_non_negative CHECK ((fee_amount >= (0)::numeric)),
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255),
    phone character varying(255)
);


-- ALTER TABLE public.event_attendee_guest OWNER TO giventa_event_management;

--
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE event_attendee_guest; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_attendee_guest IS 'Guest registrations linked to primary attendees using JDL enum types';


--
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN event_attendee_guest.age_group; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee_guest.age_group IS 'Guest age group: ADULT, TEEN, CHILD, INFANT';


--
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN event_attendee_guest.relationship; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee_guest.relationship IS 'Relationship to primary attendee';


--
-- TOC entry 247 (class 1259 OID 83088)
-- Name: event_calendar_entry; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_calendar_entry (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
calendar_provider character varying(255) NOT NULL,
external_event_id character varying(255),
calendar_link character varying(2048) NOT NULL,
sync_status character varying(50) DEFAULT 'PENDING'::character varying,
    last_sync_at timestamp without time zone,
    sync_error_message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    event_id bigint,
    created_by_id bigint
);


-- ALTER TABLE public.event_calendar_entry OWNER TO giventa_event_management;


--
-- TOC entry 246 (class 1259 OID 83070)
-- Name: event_media; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_media (
    id int8 DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
	tenant_id varchar(255) NULL,
	title varchar(255) NOT NULL,
	description varchar(2048) NULL,
	event_media_type varchar(255) NOT NULL,
	storage_type varchar(255) NOT NULL,
	file_url varchar(2048) NULL,
	file_data_content_type varchar(255) NULL,
	content_type varchar(255) NULL,
	file_size int8 NULL,
	is_public bool DEFAULT true NULL,
	event_flyer bool DEFAULT false NULL,
	is_event_management_official_document bool DEFAULT false NULL,
	pre_signed_url varchar(2048) NULL,
	pre_signed_url_expires_at timestamp NULL,
	alt_text varchar(500) NULL,
	display_order int4 DEFAULT 0 NULL,
	download_count int4 DEFAULT 0 NULL,
	is_featured_video bool DEFAULT false NULL,
	featured_video_url varchar(2048) NULL,
	is_hero_image bool DEFAULT false NULL,
	is_active_hero_image bool DEFAULT false NULL,
	start_displaying_from_date date NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	event_id int8 NULL,
	uploaded_by_id int8 NULL,
	is_home_page_hero_image bool DEFAULT false NOT NULL,
	is_featured_event_image bool DEFAULT false NOT NULL,
	is_live_event_image bool DEFAULT false NOT NULL,
    CONSTRAINT check_download_count_non_negative CHECK ((download_count >= 0)),
    CONSTRAINT check_file_size_positive CHECK (((file_size IS NULL) OR (file_size >= 0)))
);

-- ALTER TABLE public.event_media OWNER TO giventa_event_management;

--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN event_media.pre_signed_url; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_media.pre_signed_url IS 'Pre-signed URL for temporary access (max length 2048 chars)';


--
-- TOC entry 239 (class 1259 OID 82951)
-- Name: event_organizer; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_organizer (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
title character varying(255) NOT NULL,
designation character varying(255),
contact_email character varying(255),
contact_phone character varying(255),
is_primary boolean DEFAULT false,
display_order integer DEFAULT 0,
bio text,
profile_image_url character varying(1024),
created_at timestamp without time zone DEFAULT now() NOT NULL,
updated_at timestamp without time zone DEFAULT now() NOT NULL,
event_id bigint,
organizer_id bigint,
CONSTRAINT check_contact_email_format CHECK (((contact_email IS NULL) OR ((contact_email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)))
);


-- ALTER TABLE public.event_organizer OWNER TO giventa_event_management;

--
-- TOC entry 243 (class 1259 OID 83028)
-- Name: event_poll; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_poll (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
title character varying(255) NOT NULL,
description text,
is_active boolean DEFAULT true,
is_anonymous boolean DEFAULT false,
allow_multiple_choices boolean DEFAULT false,
start_date timestamp without time zone NOT NULL,
end_date timestamp without time zone,
max_responses_per_user integer DEFAULT 1,
results_visible_to character varying(50) DEFAULT 'ALL'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    event_id bigint,
    created_by_id bigint,
    CONSTRAINT check_max_responses_positive CHECK ((max_responses_per_user > 0)),
    CONSTRAINT check_poll_dates CHECK (((end_date IS NULL) OR (end_date >= start_date))),
    CONSTRAINT event_poll_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_poll OWNER TO giventa_event_management;

--
-- TOC entry 244 (class 1259 OID 83045)
-- Name: event_poll_option; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_poll_option (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    option_text character varying(500) NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    poll_id bigint,
    CONSTRAINT event_poll_option_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_poll_option OWNER TO giventa_event_management;

--
-- TOC entry 245 (class 1259 OID 83057)
-- Name: event_poll_response; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_poll_response (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    comment text,
    response_value character varying(1000),
    is_anonymous boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    poll_id bigint,
    poll_option_id bigint,
    user_id bigint
);


-- ALTER TABLE public.event_poll_response OWNER TO giventa_event_management;

--
-- TOC entry 216 (class 1259 OID 77393)
-- Name: event_score_card; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_score_card (
    id bigint NOT NULL,
    event_id bigint NOT NULL,
    team_a_name character varying(255) NOT NULL,
    team_b_name character varying(255) NOT NULL,
    team_a_score integer DEFAULT 0 NOT NULL,
    team_b_score integer DEFAULT 0 NOT NULL,
    remarks text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT event_score_card_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_score_card OWNER TO giventa_event_management;

--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 216
-- Name: TABLE event_score_card; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_score_card IS 'Score card for sports events';


--
-- TOC entry 218 (class 1259 OID 77411)
-- Name: event_score_card_detail; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_score_card_detail (
    id bigint NOT NULL,
    score_card_id bigint NOT NULL,
    team_name character varying(255) NOT NULL,
    player_name character varying(255),
    points integer DEFAULT 0 NOT NULL,
    remarks text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT event_score_card_detail_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_score_card_detail OWNER TO giventa_event_management;

--
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE event_score_card_detail; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_score_card_detail IS 'Detailed breakdown for event score cards (per player or per team)';


--
-- TOC entry 217 (class 1259 OID 77410)
-- Name: event_score_card_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.event_score_card_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.event_score_card_detail_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 217
-- Name: event_score_card_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--

ALTER SEQUENCE public.event_score_card_detail_id_seq OWNED BY public.event_score_card_detail.id;


--
-- TOC entry 215 (class 1259 OID 77392)
-- Name: event_score_card_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.event_score_card_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.event_score_card_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 215
-- Name: event_score_card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--

ALTER SEQUENCE public.event_score_card_id_seq OWNED BY public.event_score_card.id;


--
-- TOC entry 241 (class 1259 OID 82986)
-- Name: event_ticket_transaction; Type: TABLE; Schema: public; Owner: giventa_event_management
-- here the transaction_reference field is auto generated as shown in the column description
--

CREATE TABLE public.event_ticket_transaction (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
transaction_reference varchar(255) GENERATED ALWAYS AS ('TKTN' || id::text) STORED,
email character varying(255) NOT NULL,
first_name character varying(255),
last_name character varying(255),
phone character varying(255),
quantity INTEGER NOT NULL,
price_per_unit numeric(21,2) NOT NULL,
total_amount numeric(21,2) NOT NULL,
tax_amount numeric(21,2) DEFAULT 0,
platform_fee_amount numeric(21,2) DEFAULT 0,
discount_code_id bigint,
discount_amount numeric(21,2) DEFAULT 0,
service_fee numeric(21,2),
final_amount numeric(21,2) NOT NULL,
status character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
payment_method character varying(100),
payment_reference character varying(255),
stripe_checkout_session_id character varying(255),
stripe_payment_intent_id character varying(255),
purchase_date timestamp without time zone NOT NULL,
confirmation_sent_at timestamp without time zone,
refund_amount numeric(21,2) DEFAULT 0 NULL,
refund_date timestamp NULL,
refund_reason VARCHAR(2048) NULL,
stripe_customer_id varchar(255) NULL,
stripe_payment_status varchar(50) NULL,
stripe_customer_email varchar(255) NULL,
stripe_payment_currency varchar(10) NULL,
stripe_amount_discount numeric(21,2) NULL,
stripe_amount_tax numeric(21,2) NULL,
stripe_fee_amount  numeric(21,2) NULL,
qr_code_image_url character varying(2048),
event_id bigint,
user_id bigint,
created_at timestamp DEFAULT now() NOT NULL,
updated_at timestamp DEFAULT now() NOT NULL,
number_of_guests_checked_in integer,
check_in_status character varying(20) DEFAULT 'NOT_CHECKED_IN'::character varying,
check_in_time timestamp without time zone,
check_out_time timestamp without time zone,

CONSTRAINT check_email_format_transaction CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT check_transaction_amounts CHECK (((total_amount >= (0)::numeric) AND (tax_amount >= (0)::numeric) AND (discount_amount >= (0)::numeric) AND (refund_amount >= (0)::numeric) AND (final_amount >= (0)::numeric))),
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE SET null,
    CONSTRAINT event_ticket_transaction_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_ticket_transaction OWNER TO giventa_event_management;

--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN event_ticket_transaction.discount_code_id; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_ticket_transaction.discount_code_id IS 'Discount code used for this ticket purchase';


--
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN event_ticket_transaction.discount_amount; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_ticket_transaction.discount_amount IS 'Discount amount applied to this ticket purchase';


--
-- TOC entry 240 (class 1259 OID 82964)
-- Name: event_ticket_type; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_ticket_type (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    name character varying(255) NOT NULL,
    description text,
    price numeric(21,2) NOT NULL,
    is_service_fee_included boolean DEFAULT false,
    service_fee numeric(21,2),
    code character varying(255) NOT NULL,
    available_quantity integer,
    sold_quantity integer DEFAULT 0,
    remaining_quantity integer,
    is_active boolean DEFAULT true,
    sale_start_date timestamp without time zone,
    sale_end_date timestamp without time zone,
    min_quantity_per_order integer DEFAULT 1,
    max_quantity_per_order integer DEFAULT 10,
    requires_approval boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    event_id bigint,
    CONSTRAINT check_price_non_negative CHECK ((price >= (0)::numeric)),
    CONSTRAINT check_quantities_positive CHECK ((((available_quantity IS NULL) OR (available_quantity >= 0)) AND (sold_quantity >= 0) AND (min_quantity_per_order > 0) AND (max_quantity_per_order >= min_quantity_per_order))),
    CONSTRAINT check_sale_dates CHECK (((sale_end_date IS NULL) OR (sale_start_date IS NULL) OR (sale_end_date >= sale_start_date))),
    CONSTRAINT check_sold_vs_available CHECK (((available_quantity IS NULL) OR (sold_quantity <= available_quantity))),
    CONSTRAINT event_ticket_type_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_ticket_type OWNER TO giventa_event_management;

--
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN event_ticket_type.sold_quantity; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_ticket_type.sold_quantity IS 'Number of tickets sold (auto-updated by triggers)';


CREATE TABLE public.event_ticket_transaction_item (
    id BIGSERIAL PRIMARY KEY,
    tenant_id character varying(255),
    transaction_id BIGINT NOT NULL REFERENCES public.event_ticket_transaction(id) ON DELETE CASCADE,
    ticket_type_id BIGINT NOT NULL REFERENCES public.event_ticket_type(id),
    quantity INTEGER NOT NULL,
    price_per_unit NUMERIC(21,2) NOT NULL,
    total_amount NUMERIC(21,2) NOT NULL,
    -- Optionally: discount_amount, fee_amount, etc.
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
--
-- TOC entry 232 (class 1259 OID 82832)
-- Name: event_type_details; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_type_details (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
name character varying(255) NOT NULL,
description text,
color character varying(7) DEFAULT '#3B82F6'::character varying,
icon character varying(100),
is_active boolean DEFAULT true,
display_order integer DEFAULT 0,
created_at timestamp without time zone DEFAULT now() NOT NULL,
updated_at timestamp without time zone DEFAULT now() NOT NULL,
CONSTRAINT check_color_format CHECK (((color)::text ~* '^#[0-9A-Fa-f]{6}$'::text)),
    CONSTRAINT event_type_details_pkey PRIMARY KEY (id)
);


-- ALTER TABLE public.event_type_details OWNER TO giventa_event_management;

--
-- TOC entry 3981 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE event_type_details; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_type_details IS 'Event type classifications with visual customization';


--
-- TOC entry 252 (class 1259 OID 83166)
-- Name: qr_code_usage; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.qr_code_usage (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
attendee_id bigint NOT NULL,
qr_code_data character varying(1000) NOT NULL,
qr_code_type character varying(50) DEFAULT 'CHECK_IN'::character varying,
    generated_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone,
    used_at timestamp without time zone,
    usage_count integer DEFAULT 0,
    max_usage_count integer DEFAULT 1,
    last_scanned_by character varying(255),
    scan_location character varying(255),
    device_info text,
    ip_address inet,
    is_valid boolean DEFAULT true,
    invalidated_at timestamp without time zone,
    invalidation_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_usage_counts CHECK (((usage_count >= 0) AND (max_usage_count > 0) AND (usage_count <= max_usage_count)))
);


-- ALTER TABLE public.qr_code_usage OWNER TO giventa_event_management;

--
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE qr_code_usage; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.qr_code_usage IS 'Enhanced QR code generation and usage tracking with security features';


--
-- TOC entry 223 (class 1259 OID 78121)
-- Name: rel_event_details__discount_codes; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.rel_event_details__discount_codes (
    event_details_id bigint NOT NULL,
    discount_codes_id bigint NOT NULL
);


-- ALTER TABLE public.rel_event_details__discount_codes OWNER TO giventa_event_management;

--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE rel_event_details__discount_codes; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.rel_event_details__discount_codes IS 'Join table for EventDetails <-> DiscountCode many-to-many relationship';


--
-- TOC entry 229 (class 1259 OID 82779)
-- Name: tenant_organization; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.tenant_organization (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    organization_name character varying(255) NOT NULL,
    domain character varying(255),
    primary_color character varying(7),
    secondary_color character varying(7),
    logo_url character varying(1024),
    contact_email character varying(255) NOT NULL,
    contact_phone character varying(50),
    subscription_plan character varying(20),
    subscription_status character varying(20),
    subscription_start_date date,
    subscription_end_date date,
    monthly_fee_usd numeric(21,2),
    stripe_customer_id character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_monthly_fee_positive CHECK ((monthly_fee_usd >= (0)::numeric)),
    CONSTRAINT check_subscription_dates CHECK (((subscription_end_date IS NULL) OR (subscription_end_date >= subscription_start_date))),
    CONSTRAINT tenant_organization_pkey PRIMARY KEY (id),
    CONSTRAINT tenant_organization_tenant_id_key UNIQUE (tenant_id),
    CONSTRAINT tenant_organization_domain_key UNIQUE (domain)
);


-- ALTER TABLE public.tenant_organization OWNER TO giventa_event_management;

--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE tenant_organization; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.tenant_organization IS 'Multi-tenant organization configuration and subscription management';


--
-- TOC entry 231 (class 1259 OID 82809)
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.tenant_settings (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    tenant_organization_id bigint,
    allow_user_registration boolean DEFAULT true,
    require_admin_approval boolean DEFAULT false,
    enable_whatsapp_integration boolean DEFAULT false,
    enable_email_marketing boolean DEFAULT false,
    whatsapp_api_key character varying(500),
    email_provider_config  VARCHAR(2048),
    custom_css  VARCHAR(8192),
    custom_js  VARCHAR(16384),
    max_events_per_month integer,
    max_attendees_per_event integer,
    enable_guest_registration boolean DEFAULT true,
    max_guests_per_attendee integer DEFAULT 5,
    default_event_capacity integer DEFAULT 100,
    platform_fee_percentage decimal(6,4),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_default_capacity_positive CHECK (((default_event_capacity IS NULL) OR (default_event_capacity > 0))),
    CONSTRAINT check_max_attendees_positive CHECK (((max_attendees_per_event IS NULL) OR (max_attendees_per_event > 0))),
    CONSTRAINT check_max_events_positive CHECK (((max_events_per_month IS NULL) OR (max_events_per_month > 0))),
    CONSTRAINT check_max_guests_positive CHECK (((max_guests_per_attendee IS NULL) OR (max_guests_per_attendee >= 0))),
    CONSTRAINT tenant_settings_pkey PRIMARY KEY (id),
    CONSTRAINT tenant_settings_tenant_id_key UNIQUE (tenant_id),
    CONSTRAINT fk_tenant_settings__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_settings_organization_id FOREIGN KEY (tenant_organization_id) REFERENCES public.tenant_organization(id) ON DELETE CASCADE
);


-- ALTER TABLE public.tenant_settings OWNER TO giventa_event_management;

-- Index for tenant_organization_id foreign key for better query performance
CREATE INDEX idx_tenant_settings_organization_id ON public.tenant_settings(tenant_organization_id);

--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE tenant_settings; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.tenant_settings IS 'Tenant-specific configuration settings with enhanced options';

COMMENT ON COLUMN public.tenant_settings.tenant_organization_id IS 'Foreign key reference to tenant_organization.id for standard Long->Long relationship';



--
-- TOC entry 227 (class 1259 OID 82765)
-- Name: discount_code_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.discount_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.discount_code_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 228 (class 1259 OID 82766)
-- Name: discount_code; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.discount_code (
    id bigint PRIMARY KEY DEFAULT nextval('public.discount_code_id_seq'::regclass),
code character varying(50) NOT NULL,
description character varying(255),
discount_type character varying(20) DEFAULT 'PERCENT'::character varying NOT NULL,
discount_value numeric(10,2) NOT NULL,
max_uses integer,
uses_count integer DEFAULT 0,
valid_from timestamp without time zone,
valid_to timestamp without time zone,
is_active boolean DEFAULT true,
created_at timestamp without time zone DEFAULT now(),
updated_at timestamp without time zone DEFAULT now(),
event_id bigint NOT NULL,
tenant_id character varying(255) NOT NULL,
CONSTRAINT fk_discount_code_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.discount_code IS 'Discount codes for ticket purchases, now per event and tenant.';


-- ALTER TABLE public.discount_code OWNER TO giventa_event_management;

--
-- TOC entry 3927 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE discount_code; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.discount_code IS 'Discount codes for ticket purchases';
--
-- TOC entry 242 (class 1259 OID 83010)
-- Name: user_payment_transaction; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.user_payment_transaction (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255) NOT NULL,
transaction_type character varying(20) NOT NULL,
amount numeric(21,2) NOT NULL,
currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
stripe_payment_intent_id character varying(255),
stripe_transfer_group character varying(255),
platform_fee_amount numeric(21,2) DEFAULT 0,
tenant_amount numeric(21,2) DEFAULT 0,
status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    processing_fee numeric(21,2) DEFAULT 0,
    metadata jsonb,
    external_transaction_id character varying(255),
    payment_method character varying(100),
    failure_reason text,
    reconciliation_date date,
    event_id bigint,
    ticket_transaction_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_payment_amounts CHECK (((amount >= (0)::numeric) AND (platform_fee_amount >= (0)::numeric) AND (tenant_amount >= (0)::numeric) AND (processing_fee >= (0)::numeric)))
);


-- ALTER TABLE public.user_payment_transaction OWNER TO giventa_event_management;



--
-- TOC entry 233 (class 1259 OID 82848)
-- Name: user_subscription; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.user_subscription (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255),
    stripe_price_id character varying(255),
    stripe_current_period_end timestamp without time zone,
    status character varying(255) NOT NULL,
    trial_ends_at timestamp without time zone,
    cancel_at_period_end boolean DEFAULT false,
    user_profile_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.user_task (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255),
title character varying(255) NOT NULL,
description  VARCHAR(4096),
status character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
priority character varying(255) DEFAULT 'MEDIUM'::character varying NOT NULL,
    due_date timestamp without time zone,
    completed boolean DEFAULT false NOT NULL,
    completion_date timestamp without time zone,
    estimated_hours numeric(5,2),
    actual_hours numeric(5,2),
    progress_percentage integer DEFAULT 0,
    event_id bigint,
    assignee_name character varying(255),
    assignee_contact_phone character varying(50),
    assignee_contact_email character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id bigint,
    CONSTRAINT check_completion_logic CHECK (((completed = false) OR ((completed = true) AND (completion_date IS NOT NULL)))),
    CONSTRAINT user_task_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);

-- Create the executive_committee_team_members table
CREATE TABLE public.executive_committee_team_members (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    bio VARCHAR(2048),
    email VARCHAR(255),
    priority_order integer,
    profile_image_url VARCHAR(500),
    expertise VARCHAR(500),
    image_background VARCHAR(255),
    image_style VARCHAR(100),
    department VARCHAR(100),
    join_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    website_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_exec_team_members_name ON public.executive_committee_team_members(first_name);
CREATE INDEX idx_exec_team_members_department ON public.executive_committee_team_members(department);
CREATE INDEX idx_exec_team_members_is_active ON public.executive_committee_team_members(is_active);
CREATE INDEX idx_exec_team_members_join_date ON public.executive_committee_team_members(join_date);

-- Add comments for documentation
COMMENT ON TABLE public.executive_committee_team_members IS 'Stores information about executive committee team members';
COMMENT ON COLUMN public.executive_committee_team_members.expertise IS 'JSON array of skills and expertise areas';
COMMENT ON COLUMN public.executive_committee_team_members.is_active IS 'Whether the team member is currently active';


-- TOC entry 3363 (class 2604 OID 82769)
-- Name: discount_code id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.discount_code ALTER COLUMN id SET DEFAULT nextval('public.discount_code_id_seq'::regclass);


--
-- TOC entry 3354 (class 2604 OID 77431)
-- Name: event_live_update id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_live_update ALTER COLUMN id SET DEFAULT nextval('public.event_live_update_id_seq'::regclass);


--
-- TOC entry 3359 (class 2604 OID 77449)
-- Name: event_live_update_attachment id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_live_update_attachment ALTER COLUMN id SET DEFAULT nextval('public.event_live_update_attachment_id_seq'::regclass);


--
-- TOC entry 3345 (class 2604 OID 77396)
-- Name: event_score_card id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_score_card ALTER COLUMN id SET DEFAULT nextval('public.event_score_card_id_seq'::regclass);


--
-- TOC entry 3350 (class 2604 OID 77414)
-- Name: event_score_card_detail id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_score_card_detail ALTER COLUMN id SET DEFAULT nextval('public.event_score_card_detail_id_seq'::regclass);


--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 227
-- Name: discount_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.discount_code_id_seq', 1, false);


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 221
-- Name: event_live_update_attachment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.event_live_update_attachment_id_seq', 1, false);


--
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 219
-- Name: event_live_update_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.event_live_update_id_seq', 1, false);


--
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 217
-- Name: event_score_card_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.event_score_card_detail_id_seq', 1, false);


--
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 215
-- Name: event_score_card_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.event_score_card_id_seq', 1, false);


--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 224
-- Name: sequence_generator; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.sequence_generator', 4000, true);



--
-- TOC entry 3575 (class 2606 OID 82778)
-- Name: discount_code discount_code_code_key; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.discount_code
    ADD CONSTRAINT discount_code_code_key UNIQUE (code);


--
-- TOC entry 3655 (class 2606 OID 83100)
-- Name: event_calendar_entry ux_calendar_entry_provider_external; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_calendar_entry
    ADD CONSTRAINT ux_calendar_entry_provider_external UNIQUE (calendar_provider, external_event_id);


--
-- TOC entry 3613 (class 2606 OID 82902)
-- Name: event_admin ux_event_admin_user_tenant; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_admin
    ADD CONSTRAINT ux_event_admin_user_tenant UNIQUE (user_id, tenant_id);


--
-- TOC entry 3662 (class 2606 OID 83121)
-- Name: event_attendee ux_event_attendee__event_attendee; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3674 (class 2606 OID 83165)
-- Name: event_guest_pricing ux_event_guest_pricing_event_age_tier; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_guest_pricing
    ADD CONSTRAINT ux_event_guest_pricing_event_age_tier UNIQUE (event_id, age_group, pricing_tier);


--
-- TOC entry 3631 (class 2606 OID 82985)
-- Name: event_ticket_type ux_event_ticket_type_event_code; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_ticket_type
    ADD CONSTRAINT ux_event_ticket_type_event_code UNIQUE (event_id, code);


--
-- TOC entry 3595 (class 2606 OID 82847)
-- Name: event_type_details ux_event_type_tenant_name; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_type_details
    ADD CONSTRAINT ux_event_type_tenant_name UNIQUE (tenant_id, name);


--
-- TOC entry 3639 (class 2606 OID 83027)
-- Name: user_payment_transaction ux_payment_transaction_stripe_intent; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_payment_transaction
    ADD CONSTRAINT ux_payment_transaction_stripe_intent UNIQUE (stripe_payment_intent_id);


--
-- TOC entry 3647 (class 2606 OID 83069)
-- Name: event_poll_response ux_poll_response_user_option; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT ux_poll_response_user_option UNIQUE (poll_id, poll_option_id, user_id);


--
-- TOC entry 3678 (class 2606 OID 83182)
-- Name: qr_code_usage ux_qr_code_attendee_type; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--


--
-- TOC entry 3635 (class 2606 OID 83004)
-- Name: event_ticket_transaction ux_ticket_transaction_reference; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT ux_ticket_transaction_reference UNIQUE (transaction_reference);


--
-- TOC entry 3587 (class 2606 OID 82808)
-- Name: user_profile ux_user_profile__user_id; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT ux_user_profile__user_id UNIQUE (user_id);





--
-- TOC entry 3599 (class 2606 OID 82860)
-- Name: user_subscription ux_user_subscription__stripe_customer_id; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT ux_user_subscription__stripe_customer_id UNIQUE (stripe_customer_id);


--
-- TOC entry 3601 (class 2606 OID 82862)
-- Name: user_subscription ux_user_subscription__stripe_subscription_id; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT ux_user_subscription__stripe_subscription_id UNIQUE (stripe_subscription_id);


--
-- TOC entry 3603 (class 2606 OID 82864)
-- Name: user_subscription ux_user_subscription__user_profile_id; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT ux_user_subscription__user_profile_id UNIQUE (user_profile_id);


--
-- TOC entry 3658 (class 1259 OID 83371)
-- Name: idx_event_attendee_qr_data; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_attendee_qr_data ON public.event_attendee USING btree (qr_code_data) WHERE (qr_code_data IS NOT NULL);


--
-- TOC entry 3659 (class 1259 OID 83369)
-- Name: idx_event_attendee_qr_generated; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_attendee_qr_generated ON public.event_attendee USING btree (qr_code_generated) WHERE (qr_code_generated = true);


--
-- TOC entry 3660 (class 1259 OID 83370)
-- Name: idx_event_attendee_qr_generated_at; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_attendee_qr_generated_at ON public.event_attendee USING btree (qr_code_generated_at);


--
-- TOC entry 3606 (class 1259 OID 83363)
-- Name: idx_event_details_allow_guests; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details_allow_guests ON public.event_details USING btree (allow_guests) WHERE (allow_guests = true);


--
-- TOC entry 3607 (class 1259 OID 83364)
-- Name: idx_event_details_guest_pricing; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details_guest_pricing ON public.event_details USING btree (enable_guest_pricing) WHERE (enable_guest_pricing = true);


--
-- TOC entry 3608 (class 1259 OID 83366)
-- Name: idx_event_details_max_guests; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details_max_guests ON public.event_details USING btree (max_guests_per_attendee) WHERE (max_guests_per_attendee > 0);


--
-- TOC entry 3609 (class 1259 OID 83365)
-- Name: idx_event_details_require_guest_approval; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details_require_guest_approval ON public.event_details USING btree (require_guest_approval) WHERE (require_guest_approval = true);


--
-- TOC entry 3669 (class 1259 OID 83375)
-- Name: idx_event_guest_pricing_description; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_guest_pricing_description ON public.event_guest_pricing USING btree (description) WHERE (description IS NOT NULL);


--
-- TOC entry 3670 (class 1259 OID 83374)
-- Name: idx_event_guest_pricing_event_age_active; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_guest_pricing_event_age_active ON public.event_guest_pricing USING btree (event_id, age_group, is_active) WHERE (is_active = true);


--
-- TOC entry 3671 (class 1259 OID 83372)
-- Name: idx_event_guest_pricing_is_active; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_guest_pricing_is_active ON public.event_guest_pricing USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 3672 (class 1259 OID 83373)
-- Name: idx_event_guest_pricing_valid_period; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_guest_pricing_valid_period ON public.event_guest_pricing USING btree (valid_from, valid_to);


--
-- TOC entry 3650 (class 1259 OID 83377)
-- Name: idx_event_media_pre_signed_expires; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_media_pre_signed_expires ON public.event_media USING btree (pre_signed_url_expires_at);


--
-- TOC entry 3651 (class 1259 OID 83376)
-- Name: idx_event_media_pre_signed_url; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_media_pre_signed_url ON public.event_media USING btree (pre_signed_url) WHERE (pre_signed_url IS NOT NULL);


--
-- TOC entry 3628 (class 1259 OID 83368)
-- Name: idx_event_ticket_type_availability; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_ticket_type_availability ON public.event_ticket_type USING btree (available_quantity, sold_quantity);


--
-- TOC entry 3629 (class 1259 OID 83367)
-- Name: idx_event_ticket_type_sold_quantity; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_ticket_type_sold_quantity ON public.event_ticket_type USING btree (sold_quantity);


--
-- TOC entry 3730 (class 2620 OID 83389)
-- Name: event_attendee generate_enhanced_qr_code_trigger; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER generate_enhanced_qr_code_trigger BEFORE INSERT OR UPDATE ON public.event_attendee FOR EACH ROW EXECUTE FUNCTION public.generate_enhanced_qr_code();


--
-- TOC entry 3729 (class 2620 OID 83388)
-- Name: event_ticket_transaction manage_ticket_inventory_trigger; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

  CREATE TRIGGER manage_ticket_inventory_trigger
   AFTER INSERT OR UPDATE OR DELETE
   ON public.event_ticket_transaction_item
   FOR EACH ROW
   EXECUTE FUNCTION public.manage_ticket_inventory();


--
-- TOC entry 3732 (class 2620 OID 83384)
-- Name: event_attendee_guest update_event_attendee_guest_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_attendee_guest_updated_at BEFORE UPDATE ON public.event_attendee_guest FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3731 (class 2620 OID 83383)
-- Name: event_attendee update_event_attendee_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_attendee_updated_at BEFORE UPDATE ON public.event_attendee FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3726 (class 2620 OID 83382)
-- Name: event_details update_event_details_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_details_updated_at BEFORE UPDATE ON public.event_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3733 (class 2620 OID 83385)
-- Name: event_guest_pricing update_event_guest_pricing_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_guest_pricing_updated_at BEFORE UPDATE ON public.event_guest_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3728 (class 2620 OID 83386)
-- Name: event_ticket_type update_event_ticket_type_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_ticket_type_updated_at BEFORE UPDATE ON public.event_ticket_type FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3725 (class 2620 OID 83381)
-- Name: event_type_details update_event_type_details_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_type_details_updated_at BEFORE UPDATE ON public.event_type_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3722 (class 2620 OID 83378)
-- Name: tenant_organization update_tenant_organization_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_tenant_organization_updated_at BEFORE UPDATE ON public.tenant_organization FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3724 (class 2620 OID 83379)
-- Name: tenant_settings update_tenant_settings_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON public.tenant_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3723 (class 2620 OID 83380)
-- Name: user_profile update_user_profile_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE ON public.user_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3727 (class 2620 OID 83387)
-- Name: event_details validate_event_details_trigger; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER validate_event_details_trigger BEFORE INSERT OR UPDATE ON public.event_details FOR EACH ROW EXECUTE FUNCTION public.validate_event_details();


--
-- TOC entry 3682 (class 2606 OID 77457)
-- Name: event_live_update_attachment event_live_update_attachment_live_update_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_live_update_attachment
    ADD CONSTRAINT event_live_update_attachment_live_update_id_fkey FOREIGN KEY (live_update_id) REFERENCES public.event_live_update(id) ON DELETE CASCADE;


--
-- TOC entry 3688 (class 2606 OID 83213)
-- Name: event_admin fk_admin__created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_admin
    ADD CONSTRAINT fk_admin__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3689 (class 2606 OID 83208)
-- Name: event_admin fk_admin__user_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_admin
    ADD CONSTRAINT fk_admin__user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3715 (class 2606 OID 83338)
-- Name: event_admin_audit_log fk_admin_audit_log__admin_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_admin_audit_log
    ADD CONSTRAINT fk_admin_audit_log__admin_id FOREIGN KEY (admin_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3693 (class 2606 OID 83233)
-- Name: bulk_operation_log fk_bulk_operation_log__performed_by; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.bulk_operation_log
    ADD CONSTRAINT fk_bulk_operation_log__performed_by FOREIGN KEY (performed_by) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3711 (class 2606 OID 83323)
-- Name: event_calendar_entry fk_calendar_event__created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_calendar_entry
    ADD CONSTRAINT fk_calendar_event__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3712 (class 2606 OID 83318)
-- Name: event_calendar_entry fk_calendar_event__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_calendar_entry
    ADD CONSTRAINT fk_calendar_event__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3686 (class 2606 OID 83198)
-- Name: event_details fk_event__created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_details
    ADD CONSTRAINT fk_event__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3687 (class 2606 OID 83203)
-- Name: event_details fk_event__event_type_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_details
    ADD CONSTRAINT fk_event__event_type_id FOREIGN KEY (event_type_id) REFERENCES public.event_type_details(id) ON DELETE SET NULL;

--
-- TOC entry 3714 (class 2606 OID 83328)
-- Name: event_attendee fk_event_attendee__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_attendee
    ADD CONSTRAINT fk_event_attendee__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3716 (class 2606 OID 83348)
-- Name: event_attendee_guest fk_event_attendee_guest__approved_by_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_attendee_guest
    ADD CONSTRAINT fk_event_attendee_guest__approved_by_id FOREIGN KEY (approved_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3717 (class 2606 OID 83343)
-- Name: event_attendee_guest fk_event_attendee_guest__primary_attendee_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_attendee_guest
    ADD CONSTRAINT fk_event_attendee_guest__primary_attendee_id FOREIGN KEY (primary_attendee_id) REFERENCES public.event_attendee(id) ON DELETE CASCADE;



--
-- TOC entry 3718 (class 2606 OID 83353)
-- Name: event_guest_pricing fk_event_guest_pricing__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_guest_pricing
    ADD CONSTRAINT fk_event_guest_pricing__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3709 (class 2606 OID 83308)
-- Name: event_media fk_event_media__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_media
    ADD CONSTRAINT fk_event_media__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3710 (class 2606 OID 83313)
-- Name: event_media fk_event_media__uploaded_by_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_media
    ADD CONSTRAINT fk_event_media__uploaded_by_id FOREIGN KEY (uploaded_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3694 (class 2606 OID 83238)
-- Name: event_organizer fk_event_organizer__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_organizer
    ADD CONSTRAINT fk_event_organizer__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3695 (class 2606 OID 83243)
-- Name: event_organizer fk_event_organizer__organizer_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_organizer
    ADD CONSTRAINT fk_event_organizer__organizer_id FOREIGN KEY (organizer_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3701 (class 2606 OID 83268)
-- Name: user_payment_transaction fk_payment_transaction__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_payment_transaction
    ADD CONSTRAINT fk_payment_transaction__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET NULL;


--
-- TOC entry 3702 (class 2606 OID 83273)
-- Name: user_payment_transaction fk_payment_transaction__ticket_transaction_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_payment_transaction
    ADD CONSTRAINT fk_payment_transaction__ticket_transaction_id FOREIGN KEY (ticket_transaction_id) REFERENCES public.event_ticket_transaction(id) ON DELETE SET NULL;


--
-- TOC entry 3703 (class 2606 OID 83283)
-- Name: event_poll fk_poll__created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_poll
    ADD CONSTRAINT fk_poll__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3704 (class 2606 OID 83278)
-- Name: event_poll fk_poll__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_poll
    ADD CONSTRAINT fk_poll__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3705 (class 2606 OID 83288)
-- Name: event_poll_option fk_poll_option__poll_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_poll_option
    ADD CONSTRAINT fk_poll_option__poll_id FOREIGN KEY (poll_id) REFERENCES public.event_poll(id) ON DELETE CASCADE;


--
-- TOC entry 3706 (class 2606 OID 83293)
-- Name: event_poll_response fk_poll_response__poll_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__poll_id FOREIGN KEY (poll_id) REFERENCES public.event_poll(id) ON DELETE CASCADE;


--
-- TOC entry 3707 (class 2606 OID 83298)
-- Name: event_poll_response fk_poll_response__poll_option_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__poll_option_id FOREIGN KEY (poll_option_id) REFERENCES public.event_poll_option(id) ON DELETE CASCADE;


--
-- TOC entry 3708 (class 2606 OID 83303)
-- Name: event_poll_response fk_poll_response__user_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3719 (class 2606 OID 83358)
-- Name: qr_code_usage fk_qr_code_usage__attendee_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.qr_code_usage
    ADD CONSTRAINT fk_qr_code_usage__attendee_id FOREIGN KEY (attendee_id) REFERENCES public.event_attendee(id) ON DELETE CASCADE;


--
-- TOC entry 3681 (class 2606 OID 77422)
-- Name: event_score_card_detail fk_score_card_detail__score_card_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_score_card_detail
    ADD CONSTRAINT fk_score_card_detail__score_card_id FOREIGN KEY (score_card_id) REFERENCES public.event_score_card(id) ON DELETE CASCADE;


--
-- TOC entry 3697 (class 2606 OID 83405)
-- Name: event_ticket_transaction fk_ticket_transaction__discount_code_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT fk_ticket_transaction__discount_code_id FOREIGN KEY (discount_code_id) REFERENCES public.discount_code(id) ON DELETE SET NULL;


--
-- TOC entry 3698 (class 2606 OID 83253)
-- Name: event_ticket_transaction fk_ticket_transaction__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT fk_ticket_transaction__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3700 (class 2606 OID 83263)
-- Name: event_ticket_transaction fk_ticket_transaction__user_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT fk_ticket_transaction__user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3696 (class 2606 OID 83248)
-- Name: event_ticket_type fk_ticket_type__event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_ticket_type
    ADD CONSTRAINT fk_ticket_type__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3683 (class 2606 OID 83188)
-- Name: user_profile fk_user_profile_reviewed_by_admin; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT fk_user_profile_reviewed_by_admin FOREIGN KEY (reviewed_by_admin_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;




--
-- TOC entry 3685 (class 2606 OID 83193)
-- Name: user_subscription fk_user_subscription__user_profile_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT fk_user_subscription__user_profile_id FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3690 (class 2606 OID 83223)
-- Name: user_task fk_user_task_event_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_task
    ADD CONSTRAINT fk_user_task_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET NULL;


--
-- TOC entry 3691 (class 2606 OID 83218)
-- Name: user_task fk_user_task_user_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.user_task
    ADD CONSTRAINT fk_user_task_user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

--GRANT USAGE ON SCHEMA public TO giventa_event_management;


--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 224
-- Name: SEQUENCE sequence_generator; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,USAGE ON SEQUENCE public.sequence_generator TO giventa_event_management;


--
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE bulk_operation_log; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.bulk_operation_log TO giventa_event_management;


--
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE databasechangelog; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.databasechangelog TO giventa_event_management;


--
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE databasechangeloglock; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.databasechangeloglock TO giventa_event_management;


--
-- TOC entry 3928 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE discount_code; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.discount_code TO giventa_event_management;


--
-- TOC entry 3930 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE discount_code_id_seq; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,USAGE ON SEQUENCE public.discount_code_id_seq TO giventa_event_management;


--
-- TOC entry 3931 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE event_admin; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_admin TO giventa_event_management;


--
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE event_admin_audit_log; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_admin_audit_log TO giventa_event_management;


--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE event_attendee; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_attendee TO giventa_event_management;


--
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE event_attendee_guest; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_attendee_guest TO giventa_event_management;


--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE event_calendar_entry; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_calendar_entry TO giventa_event_management;


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE event_details; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_details TO giventa_event_management;



--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE event_guest_pricing; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_guest_pricing TO giventa_event_management;


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE event_media; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_media TO giventa_event_management;


--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE event_organizer; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_organizer TO giventa_event_management;


--
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 243
-- Name: TABLE event_poll; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll TO giventa_event_management;


--
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE event_poll_option; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll_option TO giventa_event_management;


--
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 245
-- Name: TABLE event_poll_response; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll_response TO giventa_event_management;


--
-- TOC entry 3978 (class 0 OID 0)
-- Dependencies: 241
-- Name: TABLE event_ticket_transaction; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_ticket_transaction TO giventa_event_management;


--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE event_ticket_type; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_ticket_type TO giventa_event_management;


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE event_type_details; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_type_details TO giventa_event_management;


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE qr_code_usage; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.qr_code_usage TO giventa_event_management;


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE tenant_organization; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tenant_organization TO giventa_event_management;


--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE tenant_settings; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tenant_settings TO giventa_event_management;


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE user_payment_transaction; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_payment_transaction TO giventa_event_management;


--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE user_profile; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_profile TO giventa_event_management;




--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE user_subscription; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_subscription TO giventa_event_management;


--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE user_task; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_task TO giventa_event_management;


-- Completed on 2025-06-08 23:51:06

--
-- PostgreSQL database dump complete
--

-- Communication and Campaign Logging Tables (added from JDL)

CREATE TABLE public.communication_campaign (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255) NOT NULL,
name character varying(255) NOT NULL,
type character varying(50), -- EMAIL, WHATSAPP
description character varying(1000),
created_by_id bigint,
created_at timestamp without time zone NOT NULL,
scheduled_at timestamp without time zone,
sent_at timestamp without time zone,
status character varying(50), -- DRAFT, SCHEDULED, SENT, FAILED
    CONSTRAINT communication_campaign_pkey PRIMARY KEY (id),
    CONSTRAINT fk_communication_campaign_created_by FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);

CREATE TABLE public.email_log (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255) NOT NULL,
recipient_email character varying(255) NOT NULL,
subject character varying(255),
body VARCHAR(32768),
sent_at timestamp without time zone NOT NULL,
status character varying(50), -- SENT, FAILED, etc.
type character varying(50), -- TRANSACTIONAL, BULK
    campaign_id bigint,
    metadata VARCHAR(8192),
    CONSTRAINT email_log_pkey PRIMARY KEY (id),
    CONSTRAINT fk_email_log_campaign FOREIGN KEY (campaign_id) REFERENCES public.communication_campaign(id) ON DELETE SET NULL
);

CREATE TABLE public.whatsapp_log (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
tenant_id character varying(255) NOT NULL,
recipient_phone character varying(50) NOT NULL,
message_body VARCHAR(4096),
sent_at timestamp without time zone NOT NULL,
status character varying(50), -- SENT, FAILED, etc.
type character varying(50), -- TRANSACTIONAL, BULK
    campaign_id bigint,
    metadata VARCHAR(8192),
    CONSTRAINT whatsapp_log_pkey PRIMARY KEY (id),
    CONSTRAINT fk_whatsapp_log_campaign FOREIGN KEY (campaign_id) REFERENCES public.communication_campaign(id) ON DELETE SET NULL
);

-- =============================================
-- NEW EVENT-RELATED TABLES
-- =============================================

-- Table: event_featured_performers
-- Stores comprehensive information about featured performers/artists for an event
CREATE TABLE public.event_featured_performers (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    event_id bigint NOT NULL,
    -- Basic performer information
    name varchar(255) NOT NULL,
    stage_name varchar(255) NULL,
    role varchar(100) NULL,
    -- Personal details
    bio text NULL,
    nationality varchar(100) NULL,
    date_of_birth date NULL,
    -- Contact information
    email varchar(255) NULL,
    phone varchar(50) NULL,
    website_url varchar(1024) NULL,
    -- Media URLs (AWS S3 or other cloud storage)
    portrait_image_url varchar(1024) NULL,
    performance_image_url varchar(1024) NULL,
    gallery_image_urls text NULL, -- JSON array of additional image URLs
    -- Performance details
    performance_duration_minutes int4 NULL,
    performance_order int4 DEFAULT 0 NOT NULL,
    is_headliner boolean DEFAULT false NOT NULL,
    -- Social media presence
    facebook_url varchar(1024) NULL,
    twitter_url varchar(1024) NULL,
    instagram_url varchar(1024) NULL,
    youtube_url varchar(1024) NULL,
    linkedin_url varchar(1024) NULL,
    tiktok_url varchar(1024) NULL,
    -- Status and metadata
    is_active boolean DEFAULT true NOT NULL,
    priority_ranking int4 DEFAULT 0 NOT NULL,
    -- Timestamps
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    -- Constraints
    CONSTRAINT event_featured_performers_pkey PRIMARY KEY (id),
    CONSTRAINT check_performance_duration CHECK (performance_duration_minutes IS NULL OR performance_duration_minutes > 0),
    CONSTRAINT check_performance_order CHECK (performance_order >= 0),
    CONSTRAINT check_priority_ranking CHECK (priority_ranking >= 0),
    CONSTRAINT check_date_of_birth CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE),
    CONSTRAINT check_url_format_website CHECK (website_url IS NULL OR website_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_portrait CHECK (portrait_image_url IS NULL OR portrait_image_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_performance CHECK (performance_image_url IS NULL OR performance_image_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_facebook CHECK (facebook_url IS NULL OR facebook_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_twitter CHECK (twitter_url IS NULL OR twitter_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_instagram CHECK (instagram_url IS NULL OR instagram_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_youtube CHECK (youtube_url IS NULL OR youtube_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_linkedin CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_tiktok CHECK (tiktok_url IS NULL OR tiktok_url ~* '^https?://.*'),
    CONSTRAINT check_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table: event_contacts
-- Stores booking or organizing contact info for events
CREATE TABLE public.event_contacts (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    event_id bigint NOT NULL,
    name varchar(255) NOT NULL,
    phone varchar(50) NOT NULL,
    email varchar(255) NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT event_contacts_pkey PRIMARY KEY (id)
);

-- Table: event_sponsors
-- Stores comprehensive sponsor/company information
CREATE TABLE public.event_sponsors (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    name varchar(255) NOT NULL,
    type varchar(100) NOT NULL,
    -- Company information
    company_name varchar(255) NULL,
    tagline varchar(500) NULL,
    description text NULL,
    website_url varchar(1024) NULL,
    -- Contact information
    contact_email varchar(255) NULL,
    contact_phone varchar(50) NULL,
    -- Media URLs (AWS S3 or other cloud storage)
    logo_url varchar(1024) NULL,
    hero_image_url varchar(1024) NULL,
    banner_image_url varchar(1024) NULL,
    -- Status and metadata
    is_active boolean DEFAULT true NOT NULL,
    priority_ranking int4 DEFAULT 0 NOT NULL,
    -- Social media links
    facebook_url varchar(1024) NULL,
    twitter_url varchar(1024) NULL,
    linkedin_url varchar(1024) NULL,
    instagram_url varchar(1024) NULL,
    -- Timestamps
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    -- Constraints
    CONSTRAINT event_sponsors_pkey PRIMARY KEY (id),
    CONSTRAINT check_priority_ranking CHECK (priority_ranking >= 0),
    CONSTRAINT check_url_format_website CHECK (website_url IS NULL OR website_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_logo CHECK (logo_url IS NULL OR logo_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_hero CHECK (hero_image_url IS NULL OR hero_image_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_banner CHECK (banner_image_url IS NULL OR banner_image_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_facebook CHECK (facebook_url IS NULL OR facebook_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_twitter CHECK (twitter_url IS NULL OR twitter_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_linkedin CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_instagram CHECK (instagram_url IS NULL OR instagram_url ~* '^https?://.*'),
    CONSTRAINT check_email_format CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table: event_sponsors_join
-- Join table for many-to-many relationship between events and sponsors
CREATE TABLE public.event_sponsors_join (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    event_id bigint NOT NULL,
    sponsor_id bigint NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT event_sponsors_join_pkey PRIMARY KEY (id),
    CONSTRAINT unique_event_sponsor UNIQUE (event_id, sponsor_id)
);

-- Table: event_emails
-- For general event-level emails (for public or organizers)
CREATE TABLE public.event_emails (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    event_id bigint NOT NULL,
    email varchar(255) NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT event_emails_pkey PRIMARY KEY (id)
);

-- Table: event_program_directors
-- Stores info about the event's program director
CREATE TABLE public.event_program_directors (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    event_id bigint NOT NULL,
    name varchar(255) NOT NULL,
    photo_url varchar(1024) NULL,
    bio text NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT event_program_directors_pkey PRIMARY KEY (id)
);

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

-- Foreign key constraints for event_featured_performers
ALTER TABLE ONLY public.event_featured_performers
    ADD CONSTRAINT fk_event_featured_performers_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;

-- Foreign key constraints for event_contacts
ALTER TABLE ONLY public.event_contacts
    ADD CONSTRAINT fk_event_contacts_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;

-- Foreign key constraints for event_sponsors_join
ALTER TABLE ONLY public.event_sponsors_join
    ADD CONSTRAINT fk_event_sponsors_join_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.event_sponsors_join
    ADD CONSTRAINT fk_event_sponsors_join_sponsor_id FOREIGN KEY (sponsor_id) REFERENCES public.event_sponsors(id) ON DELETE CASCADE;

-- Foreign key constraints for event_emails
ALTER TABLE ONLY public.event_emails
    ADD CONSTRAINT fk_event_emails_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;

-- Foreign key constraints for event_program_directors
ALTER TABLE ONLY public.event_program_directors
    ADD CONSTRAINT fk_event_program_directors_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;

-- =============================================
-- TABLE COMMENTS
-- =============================================

COMMENT ON TABLE public.event_featured_performers IS 'Stores comprehensive information about featured performers/artists including bios, media assets, social presence, and performance details';
COMMENT ON TABLE public.event_contacts IS 'Stores booking or organizing contact info for events';
COMMENT ON TABLE public.event_sponsors IS 'Stores comprehensive sponsor/company information including logos, contact details, and social media links';
COMMENT ON TABLE public.event_sponsors_join IS 'Join table for many-to-many relationship between events and sponsors';
COMMENT ON TABLE public.event_emails IS 'Stores general event-level emails for public or organizers';
COMMENT ON TABLE public.event_program_directors IS 'Stores information about event program directors';

-- =============================================
-- COLUMN COMMENTS
-- =============================================

-- event_featured_performers column comments
COMMENT ON COLUMN public.event_featured_performers.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_featured_performers.name IS 'Full name of the featured performer/artist';
COMMENT ON COLUMN public.event_featured_performers.stage_name IS 'Stage name or artistic name (may differ from legal name)';
COMMENT ON COLUMN public.event_featured_performers.role IS 'Role of the performer (e.g., Singer, Violinist, Dancer, Comedian)';
COMMENT ON COLUMN public.event_featured_performers.bio IS 'Detailed biography and background of the performer';
COMMENT ON COLUMN public.event_featured_performers.nationality IS 'Nationality or country of origin';
COMMENT ON COLUMN public.event_featured_performers.date_of_birth IS 'Date of birth of the performer';
COMMENT ON COLUMN public.event_featured_performers.email IS 'Contact email for the performer or their management';
COMMENT ON COLUMN public.event_featured_performers.phone IS 'Contact phone number for the performer or their management';
COMMENT ON COLUMN public.event_featured_performers.website_url IS 'Official website URL of the performer (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_featured_performers.portrait_image_url IS 'URL to portrait/headshot image (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_featured_performers.performance_image_url IS 'URL to performance/action image (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_featured_performers.gallery_image_urls IS 'JSON array of additional image URLs for gallery display';
COMMENT ON COLUMN public.event_featured_performers.performance_duration_minutes IS 'Expected duration of performance in minutes';
COMMENT ON COLUMN public.event_featured_performers.performance_order IS 'Order of performance in the event lineup';
COMMENT ON COLUMN public.event_featured_performers.is_headliner IS 'Whether this performer is a headliner for the event';
COMMENT ON COLUMN public.event_featured_performers.facebook_url IS 'Facebook profile/page URL';
COMMENT ON COLUMN public.event_featured_performers.twitter_url IS 'Twitter profile URL';
COMMENT ON COLUMN public.event_featured_performers.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN public.event_featured_performers.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN public.event_featured_performers.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.event_featured_performers.tiktok_url IS 'TikTok profile URL';
COMMENT ON COLUMN public.event_featured_performers.is_active IS 'Whether the performer is currently active and should be displayed';
COMMENT ON COLUMN public.event_featured_performers.priority_ranking IS 'Display priority ranking (higher numbers = higher priority)';

-- event_contacts column comments
COMMENT ON COLUMN public.event_contacts.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_contacts.name IS 'Contact person name';
COMMENT ON COLUMN public.event_contacts.phone IS 'Contact phone number';
COMMENT ON COLUMN public.event_contacts.email IS 'Contact email address (optional)';

-- event_sponsors column comments
COMMENT ON COLUMN public.event_sponsors.name IS 'Sponsor display name';
COMMENT ON COLUMN public.event_sponsors.type IS 'Type of sponsor (e.g., Tour Sponsor, Hospitality Partner, Title Sponsor)';
COMMENT ON COLUMN public.event_sponsors.company_name IS 'Official company name (may differ from display name)';
COMMENT ON COLUMN public.event_sponsors.tagline IS 'Company tagline or slogan';
COMMENT ON COLUMN public.event_sponsors.description IS 'Detailed description of the sponsor/company';
COMMENT ON COLUMN public.event_sponsors.website_url IS 'Company website URL (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_sponsors.contact_email IS 'Primary contact email for the sponsor';
COMMENT ON COLUMN public.event_sponsors.contact_phone IS 'Primary contact phone number';
COMMENT ON COLUMN public.event_sponsors.logo_url IS 'URL to sponsor logo image (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_sponsors.hero_image_url IS 'URL to sponsor hero/banner image (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_sponsors.banner_image_url IS 'URL to sponsor banner image for event displays (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_sponsors.is_active IS 'Whether the sponsor is currently active and should be displayed';
COMMENT ON COLUMN public.event_sponsors.priority_ranking IS 'Display priority ranking (higher numbers = higher priority)';
COMMENT ON COLUMN public.event_sponsors.facebook_url IS 'Facebook page URL';
COMMENT ON COLUMN public.event_sponsors.twitter_url IS 'Twitter profile URL';
COMMENT ON COLUMN public.event_sponsors.linkedin_url IS 'LinkedIn company page URL';
COMMENT ON COLUMN public.event_sponsors.instagram_url IS 'Instagram profile URL';

-- event_sponsors_join column comments
COMMENT ON COLUMN public.event_sponsors_join.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_sponsors_join.sponsor_id IS 'Foreign key reference to event_sponsors.id';

-- event_emails column comments
COMMENT ON COLUMN public.event_emails.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_emails.email IS 'Event-related email address';

-- event_program_directors column comments
COMMENT ON COLUMN public.event_program_directors.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_program_directors.name IS 'Program director name';
COMMENT ON COLUMN public.event_program_directors.photo_url IS 'URL to program director photo';
COMMENT ON COLUMN public.event_program_directors.bio IS 'Program director biography';

