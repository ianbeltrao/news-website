"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import NewsCard from "@/components/NewsCard";
import { removeArticle } from "@/lib/firebase/client";
import { useToast } from "@/components/ui/use-toast";

export default function SavedArticlesContent({ userId, initialData }) {
  const { toast } = useToast();
  const [articles, setArticles] = useState(initialData.savedArticles);
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const topics = useMemo(() => {
    const topicSet = new Set(initialData.settings?.favoriteTopics || []);
    articles.forEach(article => {
      if (article.topics && Array.isArray(article.topics)) {
        article.topics.forEach(topic => topicSet.add(topic));
      }
    });
    return Array.from(topicSet).sort();
  }, [articles, initialData.settings]);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      if (selectedCollection !== "all" && article.collectionId !== selectedCollection) {
        return false;
      }
      
      if (selectedTopic !== "all") {
        return article.topics?.includes(selectedTopic.toLowerCase());
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          article.title?.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query) ||
          article.topics?.some(topic => topic.includes(query))
        );
      }
      
      return true;
    });
  }, [articles, selectedCollection, selectedTopic, searchQuery]);

  const handleRemoveArticle = async (articleId) => {
    try {
      await removeArticle(articleId);
      setArticles(prev => prev.filter(article => article.id !== articleId));
      toast({
        title: "Success",
        description: "Article removed from your library."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove article.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateArticle = async (articleId, collectionId) => {
    try {
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, collectionId } 
          : article
      ));
      toast({
        title: "Success",
        description: "Article updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update article.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved Articles</CardTitle>
          <CardDescription>
            Browse and manage your saved articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select
              value={selectedCollection}
              onValueChange={setSelectedCollection}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                {initialData.collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedTopic}
              onValueChange={setSelectedTopic}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(selectedCollection !== "all" || selectedTopic !== "all" || searchQuery) && (
            <div className="mt-4 flex gap-2">
              <div className="text-sm text-muted-foreground">
                Filters: 
                {selectedCollection !== "all" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="ml-2"
                    onClick={() => setSelectedCollection("all")}
                  >
                    {initialData.collections.find(c => c.id === selectedCollection)?.name}
                    ×
                  </Button>
                )}
                {selectedTopic !== "all" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="ml-2"
                    onClick={() => setSelectedTopic("all")}
                  >
                    {selectedTopic}
                    ×
                  </Button>
                )}
                {searchQuery && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="ml-2"
                    onClick={() => setSearchQuery("")}
                  >
                    &ldquo;{searchQuery}&rdquo;
                    ×
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCollection("all");
                  setSelectedTopic("all");
                  setSearchQuery("");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredArticles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onSave={handleUpdateArticle}
              onRemove={handleRemoveArticle}
              userId={userId}
              showCollectionBadge
              isSaved={true}
              collectionName={initialData.collections.find(c => c.id === article.collectionId)?.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No articles found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}