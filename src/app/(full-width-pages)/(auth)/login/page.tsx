import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Halaman Login HMPSINF",
};

export default function Login() {
  return <LoginForm />;
}
