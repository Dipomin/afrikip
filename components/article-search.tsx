// components/ArticleSearch.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "../@/components/ui/input";
import { Button } from "../@/components/ui/button";

const ArticleSearch: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push({
      pathname: "/recherche",
      query: { keyword, page: 1 },
    });
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <div className="flex gap-4 pb-6">
          <Input
            type="text"
            placeholder="Rechercher un article..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button type="submit">Rechercher</Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleSearch;
