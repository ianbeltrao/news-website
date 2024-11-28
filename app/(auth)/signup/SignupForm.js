"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { login } from "@/actions/login";
import { checkIfUsersExist } from "@/actions/createUser";
import { createUser } from "@/actions/createUser";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUp() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [disableButton, setDisableButton] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDisableButton(
      !(email && password && repeatPassword && password === repeatPassword)
    );
  }, [email, password, repeatPassword]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createUser(userCredential.user.uid, email);
      await login(userCredential.user.uid);
    } catch (error) {
      if (error?.message?.includes('NEXT_REDIRECT')) {
        return; // This is expected, let the redirect happen
      }

      console.error("Error creating user:", error);
      if (error.code === "auth/email-already-in-use") {
        toast({
          title: "Error",
          description: "Email is already in use.",
          variant: "destructive",
        });
      } else if (error.code === "auth/weak-password") {
        toast({
          title: "Error",
          description: "Password is too weak.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { uid, email } = userCredential.user;

      await createUser(uid, email);
      await login(uid);
    } catch (error) {
      if (error?.message?.includes('NEXT_REDIRECT')) {
        return; // This is expected, let the redirect happen
      }

      console.error("Google Sign-In error:", error);
      toast({
        title: "Google Sign-In Failed",
        description: "An error occurred during Google Sign-In. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto my-10 max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateAccount} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repeat-password">Confirm Password</Label>
            <Input
              id="repeat-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={disableButton || isLoading}
          >
            {isLoading ? "Creating account..." : "Create an account"}
          </Button>
        </form>
        <div className="mt-4">
          <Button
            type="button"
            className="w-full bg-red-500 text-white"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            Sign up with Google
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
