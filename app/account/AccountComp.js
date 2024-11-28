"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { signOutFirebase, updateUserSettings } from "@/lib/firebase/client";

export default function AccountComp({ user }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [apiKey, setApiKey] = useState(user.settings?.newsApiKey || "");
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState(user.settings?.favoriteTopics || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutFirebase();
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const addTopic = () => {
    if (!topic.trim()) return;

    const newTopics = topic
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t && !topics.includes(t));

    if (newTopics.length > 0) {
      setTopics(prev => [...prev, ...newTopics]);
      setTopic("");
    }
  };

  const removeTopic = (topicToRemove) => {
    setTopics(prev => prev.filter(t => t !== topicToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  const handleSaveSettings = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "API Key is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateUserSettings(user.id, {
        ...user.settings,
        newsApiKey: apiKey,
        favoriteTopics: topics,
      });
      
      toast({
        title: "Success",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col max-w-full">
      <header className="flex items-center justify-between p-4 md:p-6">
        <h1 className="text-lg font-semibold">Account Settings</h1>
      </header>
      
      <main className="grid gap-4 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Email Display */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">News API Key</Label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your News API key"
              />
            </div>

            {/* Favorite Topics */}
            <div className="space-y-4">
              <Label>Favorite Topics</Label>
              <div className="flex gap-2">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add topics (comma-separated)"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addTopic}
                >
                  Add
                </Button>
              </div>

              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {t}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTopic(t)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Save Settings Button */}
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
