import { SignIn } from "@clerk/nextjs";
import { AuthLayout, clerkAppearance } from "@/components/auth/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout mode="sign-in">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
