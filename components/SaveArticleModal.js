import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  getUserCollections, 
  createCollection, 
  removeArticle 
} from "@/lib/firebase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Edit3, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SaveArticleModal({ 
  isOpen, 
  onClose, 
  onSave,
  onRemove, 
  userId,
  article, // Pass the current article if editing
  isEdit = false // Flag to determine if we're editing an existing article
}) {
  const { toast } = useToast();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [activeTab, setActiveTab] = useState("quick-save");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const userCollections = await getUserCollections(userId);
        setCollections(userCollections);
        
        if (isEdit && article?.collectionId) {
          setSelectedCollection(article.collectionId);
          setActiveTab("collections");
        } else if (userCollections.length > 0) {
          setSelectedCollection(userCollections[0].id);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load collections.",
          variant: "destructive",
        });
      }
    };
    
    if (isOpen) {
      loadCollections();
      if (!isEdit) {
        setActiveTab("quick-save");
        setNewCollectionName("");
      }
    }
  }, [userId, isOpen, toast, isEdit, article]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    
    setIsLoading(true);
    try {
      const newCollection = await createCollection(userId, newCollectionName);
      setCollections(prev => [...prev, newCollection]);
      setSelectedCollection(newCollection.id);
      setActiveTab("collections");
      setNewCollectionName("");
      
      toast({
        title: "Success",
        description: "Collection created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const collectionId = activeTab === "quick-save" ? null : selectedCollection;
    
    if (activeTab === "collections" && !selectedCollection) {
      toast({
        title: "Error",
        description: "Please select a collection first.",
        variant: "destructive",
      });
      return;
    }
    
    await onSave(collectionId);
    onClose();
  };

  const handleDelete = async () => {
    if (article?.id) {
      await onRemove(article.id);
      setShowDeleteAlert(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Saved Article" : "Save Article"}
            </DialogTitle>
            <DialogDescription>
              {isEdit 
                ? "Update or remove this article from your library" 
                : "Save this article to your library"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick-save">Quick Save</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>

            <TabsContent value="quick-save" className="mt-4">
              <div className="text-sm text-muted-foreground">
                Save this article without adding it to a collection. 
                You can organize it later from your library.
              </div>
            </TabsContent>

            <TabsContent value="collections" className="mt-4 space-y-4">
              {collections.length > 0 ? (
                <Select
                  value={selectedCollection}
                  onValueChange={setSelectedCollection}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No collections yet. Create your first one below.
                </div>
              )}

              <form onSubmit={handleCreateCollection} className="flex gap-2">
                <Input
                  placeholder="New collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  type="submit"
                  variant="secondary" 
                  disabled={isLoading || !newCollectionName.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 space-x-2">
            {isEdit && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEdit ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </>
              ) : (
                'Save Article'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the article from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 