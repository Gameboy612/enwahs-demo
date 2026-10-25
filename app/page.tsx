import type { Metadata } from "next";
import { LoginScreen } from "@/components/domain/login-screen";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Enter the Enwahs CRM demo workspace. No credentials required — clickable demo with fictional data.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
