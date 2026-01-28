"use client";
import { useState } from "react";
import {
  EXTERNAL_STATUS_PAGES,
  ExternalStatusPage,
} from "../../lib/externalStatusPages";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Search,
  Github,
  Slack,
  Cloud,
  CreditCard,
  Cpu,
  MessageSquare,
  Globe,
  Briefcase,
  Bot,
} from "lucide-react";

export function ExternalStatusGrid() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPages = EXTERNAL_STATUS_PAGES.filter(
    (page) =>
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getIcon = (page: ExternalStatusPage) => {
    const name = page.name.toLowerCase();
    const category = page.category.toLowerCase();

    if (name.includes("github"))
      return <Github className="w-6 h-6 text-foreground" />;
    if (name.includes("slack"))
      return <Slack className="w-6 h-6 text-[#4A154B]" />;
    if (name.includes("openai") || name.includes("chatgpt"))
      return <Bot className="w-6 h-6 text-[#10a37f]" />;

    if (category.includes("cloud"))
      return <Cloud className="w-6 h-6 text-blue-500" />;
    if (category.includes("payment"))
      return <CreditCard className="w-6 h-6 text-green-600" />;
    if (category.includes("communication"))
      return <MessageSquare className="w-6 h-6 text-purple-500" />;
    if (category.includes("developer"))
      return <Cpu className="w-6 h-6 text-orange-500" />;
    if (category.includes("productivity"))
      return <Briefcase className="w-6 h-6 text-indigo-500" />;
    if (category.includes("australia"))
      return <Globe className="w-6 h-6 text-blue-700" />;

    return <Globe className="w-6 h-6 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row  justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">External Platform Status</h2>
          <p className="text-muted-foreground mt-1">
            Stay updated with the health of the tools and services your stack
            depends on.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Input
            placeholder="Search platforms (e.g., GitHub, AWS)..."
            className="px-10 "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-10">
        {Object.entries(
          filteredPages.reduce(
            (acc, page) => {
              if (!acc[page.category]) acc[page.category] = [];
              acc[page.category].push(page);
              return acc;
            },
            {} as Record<string, typeof EXTERNAL_STATUS_PAGES>,
          ),
        ).map(([category, pages]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="w-8 h-px bg-gray-200" />
              {category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pages.map((page) => (
                <a
                  key={page.name}
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block transition-all hover:-translate-y-1"
                >
                  <Card className="h-full border border-border group-hover:border-primary group-hover:shadow-md transition-all overflow-hidden bg-card text-card-foreground">
                    <CardHeader className="p-4 flex flex-col items-center justify-center space-y-3 text-center">
                      <div className="p-3 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
                        {getIcon(page)}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">
                          {page.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No platforms found matching &quot;{searchTerm}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
