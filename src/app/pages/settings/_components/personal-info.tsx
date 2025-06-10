"use client";

import { EmailIcon, UserIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getUserById, updateUser } from "../actions";

export function PersonalInfoForm() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    createdAt: "",
    updatedAt: "",
    points: 0,
    preferences: {
      notifications: true,
      theme: "dark",
      language: "en",
    },
  });
  const [isClient, setIsClient] = useState(false);
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
        setUser(userData);
      } catch (err: any) {
        // Fallback to session data
        const nameParts = session.user?.name?.split(" ") || ["", ""];
        setUser({
          email: session.user?.email || "",
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          role: "student", // Default role
          createdAt: "",
          updatedAt: "",
          points: 0,
          preferences: {
            notifications: true,
            theme: "dark",
            language: "en",
          },
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(null);

    const formData = new FormData(e.target);
    const updatedUser = {
      ...user,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      preferences: {
        ...user.preferences,
        language: formData.get("language") as string,
        theme: formData.get("theme") as string,
        notifications: formData.get("notifications") === "enabled",
      },
    };

    try {
      await updateUser(session!.user.id, updatedUser);
      setUser(updatedUser); // Update local state
      setUpdateSuccess("Profile updated successfully!");
    } catch (err: any) {
      setUpdateError("Failed to update profile. Please try again.");
    }
  };

  // Format date to a stable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    } catch (e) {
      return dateString;
    }
  };

  // Render a placeholder during loading
  if (!isClient || status === "loading" || loading) {
    return (
      <ShowcaseSection title="Personal Information" className="!p-7">
        <div className="animate-pulse">
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2 h-12 bg-gray-200 rounded-md"></div>
            <div className="w-full sm:w-1/2 h-12 bg-gray-200 rounded-md"></div>
          </div>
          <div className="mb-5.5 h-12 bg-gray-200 rounded-md"></div>
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2 h-12 bg-gray-200 rounded-md"></div>
            <div className="w-full sm:w-1/2 h-12 bg-gray-200 rounded-md"></div>
          </div>
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2 h-12 bg-gray-200 rounded-md"></div>
            <div className="w-full sm:w-1/2 h-12 bg-gray-200 rounded-md"></div>
          </div>
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

  return (
    <ShowcaseSection title="Personal Information" className="!p-7">
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
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="firstName"
            label="First Name"
            placeholder="First Name"
            defaultValue={user.firstName}
            icon={<UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            iconPosition="left"
            height="sm"
            inputClassName="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="lastName"
            label="Last Name"
            placeholder="Last Name"
            defaultValue={user.lastName}
            icon={<UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            iconPosition="left"
            height="sm"
            inputClassName="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        <InputGroup
          className="mb-5.5"
          type="email"
          name="email"
          label="Email Address"
          placeholder="email@example.com"
          defaultValue={user.email}
          icon={<EmailIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
          iconPosition="left"
          height="sm"
          disabled
          inputClassName="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        />

        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="role"
            label="Role"
            defaultValue={user.role}
            icon={<UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            iconPosition="left"
            height="sm"
            disabled
            inputClassName="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="points"
            label="Points"
            defaultValue={user.points.toString()}
            icon={<UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            iconPosition="left"
            height="sm"
            disabled
            inputClassName="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="createdAt"
            label="Member Since"
            defaultValue={formatDate(user.createdAt)}
            icon={<UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            iconPosition="left"
            height="sm"
            disabled
            inputClassName="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="lastActive"
            label="Last Active"
            defaultValue={formatDate(user.updatedAt)}
            icon={<UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            iconPosition="left"
            height="sm"
            disabled
            inputClassName="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg bg-gradient-to-r from-primary to-primary-dark px-6 py-2 font-semibold text-white hover:from-primary-dark hover:to-primary transition-all duration-300"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}