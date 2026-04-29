import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-bg px-4 py-12">
      <SignUp appearance={{ elements: { footerActionLink: 'text-primary hover:text-primary-hover' } }} />
    </div>
  );
}
