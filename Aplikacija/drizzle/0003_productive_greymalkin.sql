ALTER TABLE "Critic_Album_Review" ALTER COLUMN "date_created" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Critic_Album_Review" ALTER COLUMN "date_created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Critic_Song_Review" ALTER COLUMN "date_created" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Critic_Song_Review" ALTER COLUMN "date_created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Story" ALTER COLUMN "date_created" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "Story" ALTER COLUMN "date_created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "User_Album_Review" ALTER COLUMN "date_created" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "User_Album_Review" ALTER COLUMN "date_created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "User_Song_Review" ALTER COLUMN "date_created" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "User_Song_Review" ALTER COLUMN "date_created" SET DEFAULT now();