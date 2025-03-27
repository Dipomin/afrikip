import { useState, useEffect } from "react";

interface File {
  name: string;
  path: string;
  isDirectory: boolean;
}

const useFetchFiles = (path: string) => {
  const [data, setData] = useState<File[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/ftpfolder?path=${path}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch files: ${res.statusText}`);
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [path]);

  return { data, error };
};

export default useFetchFiles;
