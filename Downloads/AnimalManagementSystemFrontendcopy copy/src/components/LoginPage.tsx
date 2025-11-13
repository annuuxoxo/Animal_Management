import { FormEvent, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Leaf, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors: typeof errors = {};

    if (!email) {
      validationErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      validationErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      validationErrors.password = 'Password is required';
    } else if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onLogin(email.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2e4f34] via-[#4a7c59] to-[#6b8e23] px-4 py-12">
      <Card className="w-full max-w-md bg-white/95 shadow-2xl border-none">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Leaf className="w-8 h-8 text-emerald-700" />
          </div>
          <div>
            <CardTitle className="text-3xl text-emerald-800">Wild Care Pro</CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              Sign in to manage animals, staff, health records, and more.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder=".     you@wildcarepro.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  className="pl-9"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="       Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  className="pl-9"
                  required
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {errors.general && (
              <Alert variant="destructive">
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Demo access - use any valid email and a password with at least 6 characters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

