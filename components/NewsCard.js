import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { useState } from "react";
import SaveArticleModal from "./SaveArticleModal";

export default function NewsCard({ 
  article, 
  onSave, 
  isSaved, 
  onRemove,
  userId 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveClick = () => {
    if (isSaved) {
      // If article is already saved, open modal for editing
      setIsModalOpen(true);
    } else {
      // If article is not saved, directly call onSave
      onSave(article);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      {article.urlToImage && (
        <div className="h-48 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>    
        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
        <CardDescription>{article.source.name}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <p className="mb-4 text-sm text-gray-600 line-clamp-3">
          {article.description}
        </p>
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(article.url, "_blank")}
          >
            Read More
          </Button>
          <Button
            variant={isSaved ? "outline" : "default"}
            size="sm"
            onClick={handleSaveClick}
          >
            {isSaved ? (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              'Save Article'
            )}
          </Button>
        </div>
      </CardContent>

      {isSaved && (
        <SaveArticleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
          onRemove={onRemove}
          userId={userId}
          article={article}
          isEdit={true}
        />
      )}
    </Card>
  );
}