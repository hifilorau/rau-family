interface LinkFields {
  Name: string;
  URL: string;
  Caption: string;
  links: string;
  category: 'album' | 'link'; // Use a union type if you know possible values
}

interface AirtableRecord<T> {
  id: string;
  fields: T;
}

interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
}

export const getMainPhoto = async (): Promise<{ url: string; caption: string } | null> => {
  try {
    const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Links?maxRecords=1`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });

    const { records }: AirtableResponse<LinkFields> = await res.json();

    if (records.length > 0) {
      return {
        url: records[0].fields.URL,
        caption: records[0].fields.Caption
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching main photo:', error);
    return null;
  }
};

export const getFamilyLinks = async (): Promise<Array<{ id: string; name: string; url: string; category: 'album' | 'link' }>> => {
  try {
    const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Links`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });

    const { records }: AirtableResponse<LinkFields> = await res.json();

    return records.map(record => ({
      id: record.id,
      name: record.fields.Name,
      url: record.fields.links,
      category: record.fields.category
    }));
  } catch (error) {
    console.error('Error fetching family links:', error);
    return [];
  }
};
