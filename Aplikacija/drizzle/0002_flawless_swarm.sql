CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Album" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"godina_izdavanja" integer NOT NULL,
	"spotify_id" varchar(22) NOT NULL,
	CONSTRAINT "Album_spotify_id_key" UNIQUE("spotify_id")
);
--> statement-breakpoint
CREATE TABLE "Album_Genres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Critic_Album_Review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"album_id" uuid NOT NULL,
	"naslov" varchar(128) NOT NULL,
	"ocena" integer NOT NULL,
	"tekst_kritike" text NOT NULL,
	"zakljucak" varchar(255),
	"date_created" date DEFAULT now() NOT NULL,
	CONSTRAINT "critic_album_ocena_in_range" CHECK ((ocena >= 0) AND (ocena <= 10))
);
--> statement-breakpoint
CREATE TABLE "Critic_Album_Review_Likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_critic_album_review_like" UNIQUE("review_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "Critic_Song_Review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"song_id" uuid NOT NULL,
	"naslov" varchar(128) NOT NULL,
	"ocena" integer NOT NULL,
	"tekst_kritike" text NOT NULL,
	"zakljucak" varchar(255),
	"date_created" date DEFAULT now() NOT NULL,
	CONSTRAINT "critic_song_ocena_in_range" CHECK ((ocena >= 0) AND (ocena <= 10))
);
--> statement-breakpoint
CREATE TABLE "Critic_Song_Review_Likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_critic_song_review_like" UNIQUE("review_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "Following" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"followed_id" text NOT NULL,
	"following_id" text NOT NULL,
	"date_followed" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_following_followed" UNIQUE("followed_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "Genre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	CONSTRAINT "Genre_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "Role_Request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"requested_role" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"obrazlozenje" text,
	"resolved_by" text,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"date_resolved" timestamp,
	CONSTRAINT "valid_requested_role" CHECK (requested_role IN ('critic', 'artist', 'admin')),
	CONSTRAINT "valid_status" CHECK (status IN ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Song" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"name" varchar(64) NOT NULL,
	"spotify_id" varchar(22) NOT NULL,
	CONSTRAINT "Song_spotify_id_key" UNIQUE("spotify_id")
);
--> statement-breakpoint
CREATE TABLE "Story" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"description" text,
	"image" text NOT NULL,
	"name" varchar(64) NOT NULL,
	"date_created" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Story_Likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_story_like" UNIQUE("story_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "Story_Songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"song_id" uuid NOT NULL,
	"date_added" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User_Album_Review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"album_id" uuid NOT NULL,
	"ocena" integer,
	"liked" boolean,
	"description" text,
	"date_created" date DEFAULT now() NOT NULL,
	CONSTRAINT "ocena_in_range" CHECK ((ocena >= 0) AND (ocena <= 10))
);
--> statement-breakpoint
CREATE TABLE "User_Album_Review_Likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_album_review_like" UNIQUE("review_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "UserPreferences" (
	"user_id" text NOT NULL,
	"preference_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"profile_picture_url" text,
	"artist_bio" text,
	"anthem" varchar(22),
	"spotify_connected" boolean DEFAULT false NOT NULL,
	"spotify_access_token" text,
	"spotify_refresh_token" text,
	CONSTRAINT "UserPreferences_pkey" PRIMARY KEY("user_id","preference_id"),
	CONSTRAINT "UserPreferences_anthem_key" UNIQUE("anthem")
);
--> statement-breakpoint
CREATE TABLE "User_Song_Review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"song_id" uuid NOT NULL,
	"ocena" integer,
	"liked" boolean,
	"description" text,
	"date_created" date DEFAULT now(),
	CONSTRAINT "ocena_in_range" CHECK ((ocena >= 0) AND (ocena <= 10))
);
--> statement-breakpoint
CREATE TABLE "User_Song_Review_Likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_song_review_like" UNIQUE("review_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Album_Genres" ADD CONSTRAINT "album_has_genres" FOREIGN KEY ("album_id") REFERENCES "public"."Album"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Album_Genres" ADD CONSTRAINT "genre_of_album" FOREIGN KEY ("genre_id") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Critic_Album_Review" ADD CONSTRAINT "critic_reviewed_album_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Critic_Album_Review" ADD CONSTRAINT "critic_review_of_album_fk" FOREIGN KEY ("album_id") REFERENCES "public"."Album"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Critic_Album_Review_Likes" ADD CONSTRAINT "critic_album_review_like_review_fk" FOREIGN KEY ("review_id") REFERENCES "public"."Critic_Album_Review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Critic_Album_Review_Likes" ADD CONSTRAINT "critic_album_review_like_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Critic_Song_Review" ADD CONSTRAINT "critic_reviewed_song_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Critic_Song_Review" ADD CONSTRAINT "critic_review_of_song_fk" FOREIGN KEY ("song_id") REFERENCES "public"."Song"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Critic_Song_Review_Likes" ADD CONSTRAINT "critic_song_review_like_review_fk" FOREIGN KEY ("review_id") REFERENCES "public"."Critic_Song_Review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Critic_Song_Review_Likes" ADD CONSTRAINT "critic_song_review_like_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Following" ADD CONSTRAINT "fk_followed_user" FOREIGN KEY ("followed_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Following" ADD CONSTRAINT "fk_following_user" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Role_Request" ADD CONSTRAINT "role_request_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Role_Request" ADD CONSTRAINT "role_request_resolved_by_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Song" ADD CONSTRAINT "song_belongs_to_album" FOREIGN KEY ("album_id") REFERENCES "public"."Album"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Story" ADD CONSTRAINT "story_owned_by_user" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Story_Likes" ADD CONSTRAINT "story_like_story_fk" FOREIGN KEY ("story_id") REFERENCES "public"."Story"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Story_Likes" ADD CONSTRAINT "story_like_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Story_Songs" ADD CONSTRAINT "story_contains_song" FOREIGN KEY ("story_id") REFERENCES "public"."Story"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Story_Songs" ADD CONSTRAINT "song_is_in_story" FOREIGN KEY ("song_id") REFERENCES "public"."Song"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Album_Review" ADD CONSTRAINT "user_reviewed_album" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Album_Review" ADD CONSTRAINT "review_of_album" FOREIGN KEY ("album_id") REFERENCES "public"."Album"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Album_Review_Likes" ADD CONSTRAINT "user_album_review_like_review_fk" FOREIGN KEY ("review_id") REFERENCES "public"."User_Album_Review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Album_Review_Likes" ADD CONSTRAINT "user_album_review_like_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserPreferences" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Song_Review" ADD CONSTRAINT "user_reviewed_song" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Song_Review" ADD CONSTRAINT "review_of_song" FOREIGN KEY ("song_id") REFERENCES "public"."Song"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Song_Review_Likes" ADD CONSTRAINT "user_song_review_like_review_fk" FOREIGN KEY ("review_id") REFERENCES "public"."User_Song_Review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Song_Review_Likes" ADD CONSTRAINT "user_song_review_like_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;