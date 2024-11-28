"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  saveArticleToCollection, 
  removeArticle 
} from "@/lib/firebase/client";
import { searchNews } from "@/actions/searchNews";
import NewsCard from "@/components/NewsCard";
import SaveArticleModal from "@/components/SaveArticleModal";

export default function DashboardContent({ 
  userId, 
  initialSettings, 
  initialSavedArticles 
}) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState(initialSavedArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [settings] = useState(initialSettings);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleSearch = async (query) => {
    if (!query) return;
    
    setIsLoading(true);
    try {
      const result = await searchNews(userId, query);
      
      if (result.success) {
        const formattedArticles = result.articles.map(article => ({
          ...article,
          topics: [query.toLowerCase()],
          title: article.title || '',
          description: article.description || '',
          url: article.url || '',
          urlToImage: article.urlToImage || '',
          source: article.source || { name: 'Unknown' },
          publishedAt: article.publishedAt || new Date().toISOString(),
        }));
        setArticles(formattedArticles);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news articles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveArticle = async (article) => {
    setSelectedArticle(article);
    
    if (!isArticleSaved(article)) {
      setIsSaveModalOpen(true);
    }
  };

  const handleSaveToCollection = async (collectionId) => {
    if (!selectedArticle) return;

    try {
      const { success, articleId, error } = await saveArticleToCollection(
        userId, 
        collectionId, 
        selectedArticle
      );
      
      if (success) {
        const savedArticle = {
          id: articleId,
          ...selectedArticle,
          collectionId,
          userId,
          savedAt: new Date().toISOString(),
        };
        
        setSavedArticles(prev => [...prev, savedArticle]);
        setIsSaveModalOpen(false);
        setSelectedArticle(null);
        
        toast({
          title: "Success",
          description: collectionId 
            ? "Article saved to collection"
            : "Article saved to library",
        });
      } else {
        throw new Error(error || 'Failed to save article');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    }
  };

  const handleRemoveArticle = async (articleId) => {
    try {
      const { success } = await removeArticle(articleId);
      if (success) {
        setSavedArticles(prev => prev.filter(article => article.id !== articleId));
        toast({
          title: "Success",
          description: "Article removed from collection.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove article.",
        variant: "destructive",
      });
    }
  };

  const isArticleSaved = (article) => {
    return savedArticles.some(saved => saved?.url === article?.url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search News</CardTitle>
          <CardDescription>
            Search for news articles or browse your favorite topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a topic to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
            />
            <Button
              onClick={() => handleSearch(searchQuery)}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
          
          {settings?.favoriteTopics?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {settings.favoriteTopics.map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(topic);
                    handleSearch(topic);
                  }}
                >
                  {topic}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {articles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <NewsCard
              key={index}
              article={article}
              onSave={handleSaveArticle}
              isSaved={isArticleSaved(article)}
              onRemove={handleRemoveArticle}
              userId={userId}
            />
          ))}
        </div>
      )}

      {!isArticleSaved(selectedArticle) && (
        <SaveArticleModal
          isOpen={isSaveModalOpen}
          onClose={() => {
            setIsSaveModalOpen(false);
            setSelectedArticle(null);
          }}
          onSave={handleSaveToCollection}
          userId={userId}
          article={selectedArticle}
          isEdit={false}
        />
      )}
    </div>
  );
} 