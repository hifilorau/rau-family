import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('Missing AIRTABLE_API_KEY');
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing AIRTABLE_BASE_ID');
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export const getMainPhoto = async (): Promise<{ url: string; caption: string } | null> => {
  try {
    const records = await base('Links')
      .select({
        maxRecords: 1,
      })
      .all();

    if (records.length > 0) {
      const url = records[0].get('URL') as string;
      // Only return if URL is valid
      if (url && url.trim() !== '') {
        return {
          url,
          caption: records[0].get('Caption') as string || 'Family Photo',
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching main photo:', error);
    return null;
  }
};

export const getMusicTracks = async (): Promise<Array<{ id: string; name: string; songUrl: string; imageUrl: string; artist: string }>> => {
  try {
    const records = await base('music')
      .select()
      .all();

    return records
      .map(record => ({
        id: record.id,
        name: record.get('Name') as string,
        songUrl: record.get('link-song') as string,
        imageUrl: record.get('link-image') as string,
        artist: record.get('Artist') as string || 'Unknown Artist' // Add artist field with fallback
      }))
      .filter(track => 
        track.name && 
        track.songUrl && 
        track.songUrl.trim() !== '' && 
        track.imageUrl && 
        track.imageUrl.trim() !== ''
      );
  } catch (error) {
    console.error('Error fetching music tracks:', error);
    return [];
  }
};

export const getFamilyLinks = async (): Promise<Array<{ id: string; name: string; url: string; category: 'album' | 'link' }>> => {
  try {
    const records = await base('Links')
      .select()
      .all();

    return records
      .map(record => ({
        id: record.id,
        name: record.get('Name') as string,
        url: record.get('links') as string,
        category: record.get('category') as 'album' | 'link'
      }))
      .filter(link => link.url && link.url.trim() !== '' && link.name); // Filter out invalid links
  } catch (error) {
    console.error('Error fetching family links:', error);
    return [];
  }
};

