import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { formatDate } from "@/utils/FormatDate";
import { BACKEND_URL } from "@/config";
import axios from "axios";
type Project = {
  id: string;
  description: string;
  createdAt: string;
};

export function useProjects() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<{ [date: string]: Project[] }>({});
  useEffect(() => {
    (async () => {
      const token = await getToken();

      const response = await axios.get(`${BACKEND_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const projectsByDate = response.data.projects.reduce(
        (acc: { [date: string]: Project[] }, project: Project) => {
          const date = formatDate(project.createdAt);
          //   const date = new Date(project.createdAt).toLocaleDateString("en-US", {
          //     year: "numeric",
          //     month: "long",
          //     day: "numeric",
          //   });
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(project);
          return acc;
        },
        {}
      );
      setProjects(projectsByDate);
    })();
  }, []);

  return projects;
}
