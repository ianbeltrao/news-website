import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Logo from "@/components/ui/Logo";

export const metadata = {
  title: "Forgot Password",
  description: "Forgot Password",
};

export default function Reset() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Link href="/">
        <Logo />
      </Link>
      <ForgotPasswordForm />
    </div>
  );
}
