"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { saveOnboardingData } from "@/lib/firebase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function OnboardingForm({ userId }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    apiKey: "",
    topic: "",
    topics: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTopic = () => {
    const { topic, topics } = formData;
    if (!topic.trim()) return;

    const newTopics = topic
      .split(',')
      .map(t => t.trim())
      .filter(t => t && !topics.includes(t));

    if (newTopics.length > 0) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, ...newTopics],
        topic: ""
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  const removeTopic = (topicToRemove) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((t) => t !== topicToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await saveOnboardingData(userId, {
        apiKey: formData.apiKey,
        topics: formData.topics,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Your settings have been saved successfully.",
        });
        window.location.reload();
      } else {
        throw new Error("Failed to save onboarding data");
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Error",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Complete Your Setup</CardTitle>
        <CardDescription>
          Enter your News API key and select your favorite topics to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">News API Key</Label>
            <Input
              id="apiKey"
              type="text"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your News API key"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topics">Favorite Topics</Label>
            <div className="flex gap-2">
              <Input
                id="topics"
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                onKeyPress={handleKeyPress}
                placeholder="Enter a topic (e.g., crypto, AI)"
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={addTopic}
              >
                Add
              </Button>
            </div>
          </div>

          {formData.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 py-2">
              {formData.topics.map((t) => (
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !formData.apiKey || formData.topics.length === 0}
          >
            {isSubmitting ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 