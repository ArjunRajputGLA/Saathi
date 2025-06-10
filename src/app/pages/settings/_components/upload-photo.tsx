"use client";

import { UploadIcon } from "@/assets/icons";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getUserById, updateUserProfilePicture } from "../actions";

export function UploadPhotoForm() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    profilePicture: "/images/user/default-user-icon.avif",
  });
  const [isClient, setIsClient] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (status === "loading" || !session?.user?.id) {
        console.log("Session not ready:", { status, session });
        return;
      }

      console.log("Fetching user data for ID:", session.user.id);

      try {
        setLoading(true);
        const userData = await getUserById(session.user.id);
        console.log("User data from DB:", userData);
        setUser({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          profilePicture: userData.profilePicture || "/images/user/default-user-icon.avif",
        });
      } catch (err: any) {
        // Fallback to session data
        const nameParts = session.user?.name?.split(" ") || ["", ""];
        setUser({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          profilePicture: session.user?.image || "/images/user/default-user-icon.avif",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [session, status]);

  // Handle client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(null);

    if (!selectedFile) {
      setUpdateError("Please select a file to upload.");
      return;
    }

    if (!session?.user?.id) {
      setUpdateError("User not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);
    formData.append("userId", session.user.id);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // Log response details for debugging
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));
      const rawResponse = await response.text();
      console.log("Raw response:", rawResponse);

      // Attempt to parse as JSON regardless of content-type
      let result;
      try {
        result = JSON.parse(rawResponse);
      } catch (parseError) {
        throw new Error("Failed to parse response as JSON: " + rawResponse);
      }

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload file.");
      }

      // Update the profile picture in the database using updateUserProfilePicture
      await updateUserProfilePicture(session.user.id, result.profilePicture);

      setUser({ ...user, profilePicture: result.profilePicture });
      setUpdateSuccess("Profile photo updated successfully!");
      setSelectedFile(null);
    } catch (err: any) {
      setUpdateError(err.message || "Failed to update profile photo. Please try again.");
    }
  };

  // Render a placeholder during loading
  if (!isClient || status === "loading" || loading) {
    return (
      <ShowcaseSection title="Your Photo" className="!p-7">
        <div className="animate-pulse">
          <div className="mb-4 flex items-center gap-3">
            <div className="size-14 rounded-full bg-gray-200"></div>
            <div className="w-24 h-6 bg-gray-200 rounded-md"></div>
          </div>
          <div className="mb-5.5 h-24 bg-gray-200 rounded-xl"></div>
          <div className="mb-5.5 h-32 bg-gray-200 rounded-lg"></div>
          <div className="flex justify-end gap-3">
            <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </ShowcaseSection>
    );
  }

  if (!session) {
    return <div>Please sign in to view your settings.</div>;
  }

  // Use the profile picture from the user data, falling back to the default only if empty
  const imageSrc = user.profilePicture && user.profilePicture.trim() !== ""
    ? user.profilePicture
    : "/images/user/default-user-icon.avif";

  return (
    <ShowcaseSection title="Your Photo" className="!p-7">
      <form onSubmit={handleSubmit}>
        {updateSuccess && (
          <div className="mb-5 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-center text-sm">
            {updateSuccess}
          </div>
        )}
        {updateError && (
          <div className="mb-5 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-center text-sm">
            {updateError}
          </div>
        )}
        <div className="mb-4 flex items-center gap-3">
          <Image
            src={imageSrc}
            width={55}
            height={55}
            alt={`${user.firstName} ${user.lastName}`}
            className="size-14 rounded-full object-cover"
            quality={90}
          />
          <div>
            <span className="mb-1.5 block font-medium text-gray-800 dark:text-white">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </div>

        <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:border-primary dark:hover:border-primary transition-colors">
          <input
            type="file"
            name="profilePicture"
            id="profilePicture"
            accept="image/png, image/jpg, image/jpeg"
            hidden
            onChange={handleFileChange}
          />

          <label
            htmlFor="profilePicture"
            className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
          >
            <div className="flex size-13.5 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              <UploadIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>

            <p className="mt-2.5 text-sm font-medium text-gray-800 dark:text-gray-200">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>

            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              PNG, JPG, or JPEG (max, 800 x 800px, 5MB)
            </p>
          </label>
        </div>

        <div className="mb-5.5">
          <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 shadow-lg">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">
              Learning Statistics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Session Time:</span>
                <span className="text-sm text-gray-800 dark:text-gray-200">0 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Active Days:</span>
                <span className="text-sm text-gray-800 dark:text-gray-200">0 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak:</span>
                <span className="text-sm text-gray-800 dark:text-gray-200">0 days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-dark px-6 py-2 font-semibold text-white hover:from-primary-dark hover:to-primary transition-all duration-300"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}