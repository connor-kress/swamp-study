import { Link } from "react-router";
import Button from "../components/Button";
import LogoutButton from "../components/LogoutButton";
import SwampStudy from "../components/SwampStudy";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import {
  ClockIcon,
  ChevronDownIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/16/solid";
import { GroupWithMembers } from "../types";
import { useUserGroups } from "../hooks/useUserGroups";

export default function DashboardScreen() {
  const { user } = useAuth();
  const { userGroups, loading, error } = useUserGroups(user?.id ?? 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="flex items-center gap-3
                           text-3xl font-bold dark:text-gray-50">
              <SwampStudy />
              <span className="hidden sm:inline">Dashboard</span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name.split(" ")[0]}! 👋
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm
                          border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Your Groups
            </h3>
            <p className="mt-2 text-3xl font-semibold
                          text-gray-900 dark:text-gray-100">
              {loading ? "..." : userGroups?.length ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm
                          border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Graduation Year
            </h3>
            <p className="mt-2 text-3xl font-semibold
                          text-gray-900 dark:text-gray-100">
              {user?.grad_year}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm
                          border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Account Type
            </h3>
            <p className="mt-2 text-3xl font-semibold capitalize
                          text-gray-900 dark:text-gray-100">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex gap-4 mb-12">
          <Button
            to="/new-group"
            variant="primary"
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create a Group
          </Button>
          <Button
            to="/find-group"
            variant="secondary"
            className="flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Find Groups
          </Button>
        </div>

        {/* My Groups Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold dark:text-gray-100">
              My Study Groups
            </h2>
            {userGroups && userGroups.length > 0 && (
              <Link
                to="/find-group"
                className="text-sm text-blue-600 dark:text-blue-400
                           hover:text-blue-700 dark:hover:text-blue-300"
              >
                Find more groups →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500
                             border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading your groups...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700
                             dark:text-red-400 p-4 rounded-lg inline-block">
                <ExclamationCircleIcon className="w-6 h-6 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            </div>
          ) : userGroups && userGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                            gap-6">
              {userGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}

              {/* Add Group Card */}
              <Link
                to="/find-group"
                className="group p-6 rounded-xl border-2 border-dashed
                           border-gray-300 dark:border-gray-600
                           hover:border-blue-500 dark:hover:border-blue-400
                           hover:bg-blue-50 dark:hover:bg-blue-900/10
                           flex items-center justify-center h-full
                           transition-all duration-200"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100
                                 dark:bg-blue-900/30 flex items-center
                                 justify-center mx-auto mb-3
                                 group-hover:scale-110 transition-transform">
                    <PlusIcon className="w-6 h-6 text-blue-600
                                         dark:text-blue-400" />
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Join More Groups
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border
                            bg-white dark:bg-gray-800
                            border-gray-200 dark:border-gray-700">
              <UserGroupIcon className="w-12 h-12 text-gray-400
                                      dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900
                            dark:text-gray-100 mb-2">
                No Study Groups Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join your first study group to get started!
              </p>
              <Button to="/find-group" variant="primary">
                Browse Available Groups
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(time: Date) {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

function formatDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

function GroupCard({ group }: { group: GroupWithMembers }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-6 border border-gray-200 dark:border-gray-700
                    rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800
                    transition-colors shadow-sm relative">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
          <div className="space-y-2">
            {group.meeting_day && group.meeting_time && (
              <div className="flex items-center text-gray-600
                              dark:text-gray-400">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>
                  {formatDay(group.meeting_day)}s at{" "}
                  {formatTime(group.meeting_time)}
                </span>
              </div>
            )}
            {group.meeting_location && (
              <div className="flex items-center text-gray-600
                              dark:text-gray-400">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>{group.meeting_location}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
              <span>{group.contact_details}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Count and Dropdown Toggle */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-sm
                     text-gray-500 dark:text-gray-400 hover:text-gray-700
                     dark:hover:text-gray-300"
        >
          <div className="flex items-center">
            <UserGroupIcon className="w-4 h-4 mr-1" />
            <span>
              {group.members.length}{" "}
              member{group.members.length === 1 ? "" : "s"}
            </span>
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Member List Dropdown */}
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-1
                           text-sm text-gray-600 dark:text-gray-400"
              >
                <span>{member.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs
                                 ${member.group_role === "owner"
                                   ? `bg-blue-100 dark:bg-blue-900/30
                                      text-blue-700 dark:text-blue-400`
                                   : `bg-gray-100 dark:bg-gray-700
                                      text-gray-700 dark:text-gray-300`
                                 }`}>
                  {member.group_role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
