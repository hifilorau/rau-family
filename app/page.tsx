import { getMainPhoto, getFamilyLinks } from '@/lib/airtable';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Album, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const mainPhoto = await getMainPhoto();
  const familyLinks = await getFamilyLinks();
  console.log('familyLinks', familyLinks);
  const albumLinks = familyLinks.filter((link) => link.category === 'album');
  const otherLinks = familyLinks.filter((link) => link.category === 'link'); 
console.log('albumLinks', albumLinks);
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          Welcome to the Raus Family Website
        </h1>

        {mainPhoto && (
          <div className="mb-12 max-w-4xl mx-auto">
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
              <Image
                src={mainPhoto.url}
                alt={mainPhoto.caption}
                fill
                className="object-cover"
                priority
              />
            </AspectRatio>
            <p className="text-center text-muted-foreground mt-2">{mainPhoto.caption}</p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Photo Albums Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Album className="h-6 w-6" />
              Photo Albums
            </h2>
            <div className="grid gap-4">
              {albumLinks.map((link) => (
                <Card key={link.id} className="transition-transform hover:scale-102">
                  <CardHeader>
                    <CardTitle>
                      <a
                        href={link.url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {link.name as string}
                      </a>
                    </CardTitle>
                    {/* <CardDescription>{link.description}</CardDescription> */}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* Other Links Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <LinkIcon className="h-6 w-6" />
              Family Links
            </h2>
            <div className="grid gap-4">
              {otherLinks.map((link) => (
                <Card key={link.id} className="transition-transform hover:scale-102">
                  <CardHeader>
                    <CardTitle>
                      <a
                        href={link.url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {link.name as string}
                      </a>
                    </CardTitle>
                    {/* <CardDescription>{link.description}</CardDescription> */}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}