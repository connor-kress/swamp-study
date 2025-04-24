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
} from "@heroicons/react/16/solid";
import { GroupWithMembers } from "../types";
import { useUserGroups } from "../hooks/useUserGroups";

export default function DashboardScreen() {
  const { user } = useAuth();
  const { userGroups, loading, error } = useUserGroups(user?.id ?? 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-gray-50">
          <SwampStudy /> Dashboard
        </h1>
        <LogoutButton />
      </div>

      {/* Main Actions */}
      <div className="flex gap-4 mb-12">
        <Button to="/new-group" variant="primary">Create a Group</Button>
        <Button to="/find-group" variant="secondary">Join a Group</Button>
      </div>

      {/* My Groups Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold dark:text-gray-100">
          My Groups
        </h2>

        {loading ? (
          <div className="text-center py-8">Loading groups...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : userGroups && userGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}

            {/* Add Group Card */}
            <Link to="/find-group">
              <div className="p-6 rounded-xl border-2 border-dashed
                              border-gray-300 dark:border-gray-600
                              hover:border-blue-500 dark:hover:border-blue-400
                              flex items-center justify-center
                              h-full transition cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100
                                  dark:bg-blue-900/30 flex items-center
                                  justify-center mx-auto mb-3">
                    <PlusIcon className="w-6 h-6 text-blue-600
                                         dark:text-blue-400" />
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Join More Groups
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>You haven't joined any groups yet.</p>
            <Link
              to="/find-group"
              className="text-blue-600 dark:text-blue-400
                         hover:underline mt-2 block"
            >
              Find a group to join
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: GroupWithMembers }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

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

      {/* Member count and dropdown toggle */}
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

        {/* Member list dropdown */}
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
