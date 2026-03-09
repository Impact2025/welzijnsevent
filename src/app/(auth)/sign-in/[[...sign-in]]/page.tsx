import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        variables: {
          colorPrimary: "#C8522A",
          colorBackground: "#FAF6F0",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-sans)",
        },
        elements: {
          card: "shadow-xl border border-sand",
          formButtonPrimary: "bg-terra-500 hover:bg-terra-600 font-semibold",
        },
      }}
    />
  );
}
