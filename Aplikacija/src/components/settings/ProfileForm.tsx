"use client";

import { upload } from "@vercel/blob/client";
import { type ChangeEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateOwnProfile } from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";

function buildAvatarPath(userId: string, fileName: string): string {
  const sanitizedName = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");

  return `avatars/${userId}/${Date.now()}-${sanitizedName || "avatar"}`;
}

export function ProfileForm({
  userId,
  role,
  initialName,
  initialArtistBio,
  initialProfilePictureUrl,
  initialDisplayImageUrl,
}: {
  userId: string;
  role: "user" | "critic" | "artist" | "admin";
  initialName: string;
  initialArtistBio: string | null;
  initialProfilePictureUrl: string | null;
  initialDisplayImageUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fallbackPreviewUrl = initialDisplayImageUrl;
  const [name, setName] = useState(initialName);
  const [artistBio, setArtistBio] = useState(initialArtistBio ?? "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    initialProfilePictureUrl,
  );
  const [previewUrl, setPreviewUrl] = useState(initialDisplayImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    const temporaryPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(temporaryPreviewUrl);

    try {
      const blob = await upload(buildAvatarPath(userId, file.name), file, {
        access: "public",
        handleUploadUrl: "/api/settings/avatar/upload",
        onUploadProgress: ({ percentage }) => {
          setUploadProgress(Math.round(percentage));
        },
      });

      setProfilePictureUrl(blob.url);
      setPreviewUrl(blob.url);
    } catch (uploadError) {
      setPreviewUrl(profilePictureUrl ?? fallbackPreviewUrl);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the profile picture right now.",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      event.target.value = "";
      URL.revokeObjectURL(temporaryPreviewUrl);
    }
  };

  const handleSubmit = () => {
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        await updateOwnProfile({
          name,
          artistBio: role === "artist" ? artistBio : null,
          profilePictureUrl,
        });
        setSuccessMessage("Profile updated.");
        router.refresh();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Could not update your profile right now.",
        );
      }
    });
  };

  return (
    <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.16),_transparent_35%),#1c1b1b] p-5 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[28px] bg-[#2a2a2a]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={name || "Profile picture"}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-[linear-gradient(135deg,#2a2a2a,#353534)] text-5xl font-serif text-[#ffb59e]">
                {(name.trim()[0] ?? "U").toUpperCase()}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isPending}
            className="w-full border-[#5c4037] text-[#f0d6cd]"
          >
            {isUploading ? "Uploading..." : "Change Profile Picture"}
          </Button>

          {uploadProgress !== null ? (
            <div className="rounded-2xl bg-[#2a2a2a] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
                Upload progress
              </p>
              <div className="mt-3 h-2 rounded-full bg-[#131313]">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[#d7b8ad]">{uploadProgress}%</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
              Settings
            </p>
            <h1 className="mt-2 text-4xl font-serif leading-none text-[#f5ebe8] sm:text-5xl">
              Edit profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7b8ad]">
              Keep your public presence on Vinyld current. Changes here update
              your profile card, your story bylines, and every place your avatar
              shows up across the app.
            </p>
          </div>

          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
              Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#3b2b26] bg-[#2a2a2a] px-4 py-3 text-lg font-serif text-[#f5ebe8] outline-none transition focus:border-[#ffb59e]"
            />
          </label>

          {role === "artist" ? (
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
                Artist bio
              </span>
              <textarea
                value={artistBio}
                onChange={(event) => setArtistBio(event.target.value)}
                rows={10}
                placeholder="Tell listeners who you are, what you make, and what pulls your sound together..."
                className="mt-2 w-full resize-none rounded-2xl border border-[#3b2b26] bg-[#2a2a2a] px-4 py-4 text-sm leading-7 text-[#ecd2c8] outline-none transition focus:border-[#ffb59e]"
              />
            </label>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {error ? (
              <p className="text-sm text-[#ffb59e]">{error}</p>
            ) : successMessage ? (
              <p className="text-sm text-[#ffb59e]">{successMessage}</p>
            ) : (
              <p className="text-sm text-[#8f7b74]">
                Save once you are happy with the new public profile.
              </p>
            )}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || isPending}
              className="w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95 sm:w-auto"
            >
              {isPending ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
