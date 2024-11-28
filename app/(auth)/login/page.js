import Link from "next/link";
import LoginForm from "./LoginForm";
import Logo from "@/components/ui/Logo";

export const metadata = {
  title: "Login to Your Account",
  description: "Login to Your Account",
};

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Link href="/">
        <Logo />
      </Link>
      <LoginForm />
    </div>
  );
}
