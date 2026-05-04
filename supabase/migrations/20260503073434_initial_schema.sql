-- 1. Create Independent/Primary Tables
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text,
  role text DEFAULT 'player'::text CHECK (role = ANY (ARRAY['admin'::text, 'player'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.tournaments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  tournament_date date,
  bracket_locked boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  level text CHECK (level = ANY (ARRAY['District'::text, 'State'::text])),
  CONSTRAINT tournaments_pkey PRIMARY KEY (id)
);

CREATE TABLE public.players (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  age integer,
  weight double precision,
  gender text,
  belt_rank text,
  email text UNIQUE,
  phone text,
  district text,
  student_type text CHECK (student_type = ANY (ARRAY['school'::text, 'college'::text, 'none'::text])),
  school_name text,
  college_name text,
  academy text,
  age_category text,
  weight_category text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  pincode text,
  birth_certificate_url text,
  aadhar_card_url text,
  belt_certificate_url text,
  school_bonafide_url text,
  college_proof_url text,
  user_id uuid UNIQUE,
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 2. Create Dependent/Relation Tables
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tournament_id uuid,
  player1_id uuid,
  player2_id uuid,
  winner_id uuid,
  round integer,
  position integer,
  next_match_id uuid,
  next_match_slot integer,
  walkover boolean DEFAULT false,
  category_key text,
  player1_present boolean DEFAULT true,
  player2_present boolean DEFAULT true,
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id),
  CONSTRAINT matches_player1_id_fkey FOREIGN KEY (player1_id) REFERENCES public.players(id),
  CONSTRAINT matches_player2_id_fkey FOREIGN KEY (player2_id) REFERENCES public.players(id),
  CONSTRAINT matches_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.players(id)
);

CREATE TABLE public.registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  player_id uuid,
  tournament_id uuid,
  approved boolean DEFAULT false,
  category_key text NOT NULL,
  age integer,
  weight integer,
  gender text,
  belt_rank text,
  district text,
  academy text,
  student_type text,
  school_name text,
  college_name text,
  age_category text,
  weight_category text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  pincode text,
  birth_certificate_url text,
  aadhar_card_url text,
  belt_certificate_url text,
  school_bonafide_url text,
  college_proof_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT registrations_pkey PRIMARY KEY (id),
  CONSTRAINT registrations_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id),
  CONSTRAINT registrations_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id)
);

CREATE TABLE public.player_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  player_id uuid,
  level text NOT NULL,
  medal_type text NOT NULL,
  year integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  certificate_url text,
  CONSTRAINT player_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT player_achievements_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);

CREATE TABLE public.player_participations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  player_id uuid,
  level text NOT NULL,
  year integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  certificate_url text,
  CONSTRAINT player_participations_pkey PRIMARY KEY (id),
  CONSTRAINT player_participations_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);