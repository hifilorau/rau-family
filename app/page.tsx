import { getMainPhoto, getFamilyLinks } from '@/lib/airtable';
import MusicPlayer from '@/app/components/MusicPlayer';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Album, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import SnowEffect from '@/app/components/SnowEffects';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  interface Link {
    id: string;
    name: string;
    url: string;
    category: 'album' | 'link';
  }
  
  const familyLinks: Link[] = await getFamilyLinks();
  const mainPhoto = await getMainPhoto();


  const albumLinks = familyLinks
    .filter((link) => link.category === 'album' && link.url && link.url.trim() !== '');
  const otherLinks = familyLinks
    .filter((link) => link.category === 'link' && link.url && link.url.trim() !== '');

  // Ensure we have a valid URL for the image
  const imageUrl = mainPhoto?.url && mainPhoto.url.trim() !== '' 
    ? mainPhoto.url 
    : '/fam.jpg'; // Fallback to local image
  const imageCaption = mainPhoto?.caption || 'Family Photo';

  return (
    <main className="min-h-screen relative bg-black">
      <SnowEffect />
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={imageCaption}
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      
      {/* Content Overlay */}
        <div className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-serif text-center mb-8 text-white font-bold tracking-tight">
            Oliver Rau Owen Chida Family Tree
            </h1>

            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto bg-black/40 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-white/10">

            {/* Photo Albums Section */}
            <section>
            <h2 className="text-3xl font-serif mb-4 flex items-center gap-2 tracking-tight text-white">
              <Album className="h-7 w-7" />
              Photo Albums
            </h2>
            <div className="grid gap-4">
            {albumLinks.filter(link => link.url && link.name).map((link) => (
                <Card key={link.id} className="transition-transform hover:scale-102 bg-white/10 backdrop-blur-sm border-white/5">
                  <CardHeader>
                  <CardTitle>
                  <a
                  href={link.url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 hover:underline font-light"
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
            <h2 className="text-3xl font-serif mb-4 flex items-center gap-2 tracking-tight text-white">
              <LinkIcon className="h-7 w-7" />
              Family Links
            </h2>
            <div className="grid gap-4">
            {otherLinks.filter(link => link.url && link.name).map((link) => (
                <Card key={link.id} className="transition-transform hover:scale-102 bg-white/10 backdrop-blur-sm border-white/5">
                  <CardHeader>
                  <CardTitle>
                  <a
                  href={link.url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 hover:underline font-light"
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
        </div>
        <MusicPlayer />


        </main>
  );
}