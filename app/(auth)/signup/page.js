import Link from "next/link";
import SignupForm from "./SignupForm";
import Logo from "@/components/ui/Logo";

export const metadata = {
  title: "Create an Account",
  description: "Create an Account",
};

export default function Signup() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Link href="/">
        <Logo />
      </Link>
      <SignupForm />
    </div>
  );
}
