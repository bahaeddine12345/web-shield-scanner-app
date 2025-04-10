
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScan } from '../hooks/useScan';
import { Search, AlertTriangle, Globe } from 'lucide-react';

// Form validation schema
const scanFormSchema = z.object({
  url: z.string()
    .url({ message: "Veuillez entrer une URL valide" })
    .refine(url => 
      url.startsWith('http://') || url.startsWith('https://'), 
      { message: "L'URL doit commencer par http:// ou https://" }
    ),
});

type ScanFormValues = z.infer<typeof scanFormSchema>;

const NewScan = () => {
  const { startScan, isLoading, error } = useScan();
  const navigate = useNavigate();
  const [showExamples, setShowExamples] = useState(false);
  
  const form = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      url: '',
    },
  });
  
  const onSubmit = async (data: ScanFormValues) => {
    const scanId = await startScan(data.url);
    if (scanId) {
      navigate(`/scan/${scanId}`);
    }
  };
  
  const examples = [
    'https://example.com',
    'https://demo.testfire.net',
    'https://juice-shop.herokuapp.com',
  ];
  
  const handleExample = (example: string) => {
    form.setValue('url', example);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Lancer un nouveau scan</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Analyser un site web</CardTitle>
          <CardDescription>
            Entrez l'URL du site web que vous souhaitez analyser pour détecter d'éventuelles vulnérabilités.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL du site web</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="https://example.com" 
                            className="pl-9"
                            {...field} 
                          />
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary-foreground rounded-full"></span>
                              Analyse...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Search className="mr-2 h-4 w-4" />
                              Analyser
                            </span>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Assurez-vous d'inclure le protocole (http:// ou https://)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
          
          <div className="mt-6">
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground"
              onClick={() => setShowExamples(!showExamples)}
            >
              {showExamples ? "Masquer les exemples" : "Voir quelques exemples d'URL"}
            </Button>
            
            {showExamples && (
              <div className="mt-2 space-y-2">
                {examples.map((example) => (
                  <Button
                    key={example}
                    variant="ghost"
                    size="sm"
                    className="text-primary text-sm w-full justify-start"
                    onClick={() => handleExample(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex-col items-start border-t px-6 py-4">
          <div>
            <h3 className="font-medium mb-2">Ce que nous analysons:</h3>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Failles d'injection (SQL, NoSQL, etc.)</li>
              <li>Cross-site scripting (XSS)</li>
              <li>Authentification cassée</li>
              <li>Exposition de données sensibles</li>
              <li>Contrôle d'accès cassé</li>
              <li>Mauvaise configuration de sécurité</li>
              <li>Et bien d'autres vulnérabilités basées sur OWASP Top 10</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewScan;
