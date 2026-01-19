import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Ange en giltig e-postadress');
const passwordSchema = z.string().min(6, 'Lösenord måste vara minst 6 tecken');

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    const errors = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      errors.email = e.errors[0].message;
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      errors.password = e.errors[0].message;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Felaktig e-post eller lösenord');
          } else {
            setError(signInError.message);
          }
        }
      } else {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('E-postadressen är redan registrerad. Försök logga in istället.');
          } else {
            setError(signUpError.message);
          }
        }
      }
    } catch (err) {
      setError('Ett oväntat fel uppstod. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/anavid.png" 
              alt="Ana" 
              className="h-16 w-16 rounded-full"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Välkommen tillbaka' : 'Skapa konto'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Logga in för att fortsätta till Ana' 
              : 'Registrera dig för att komma igång'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-destructive">{validationErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.password && (
                <p className="text-sm text-destructive">{validationErrors.password}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Loggar in...' : 'Skapar konto...'}
                </>
              ) : (
                isLogin ? 'Logga in' : 'Skapa konto'
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  Har du inget konto?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setError('');
                      setValidationErrors({});
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Registrera dig
                  </button>
                </>
              ) : (
                <>
                  Har du redan ett konto?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setError('');
                      setValidationErrors({});
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Logga in
                  </button>
                </>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
