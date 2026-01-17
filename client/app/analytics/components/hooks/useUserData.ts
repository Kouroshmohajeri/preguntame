import { useState } from "react";
import { UserDetail } from "../../types/analytics.types";
import { listUsers } from "@/app/api/users/actions";

export const useUserData = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      const usersArray = Array.isArray(data) ? data : data.users || [];
      setUsers(usersArray);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, fetchUsers };
};
