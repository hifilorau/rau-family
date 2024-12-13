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

export const getMainPhoto = async () => {
  try {
    const records = await base('Photos')
      .select({
        maxRecords: 1,
        filterByFormula: '{isMainPhoto} = 1',
      })
      .firstPage();

    if (records.length > 0) {
      return {
        url: records[0].get('URL') as string,
        caption: records[0].get('Caption') as string,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching main photo:', error);
    return null;
  }
};

export const getFamilyLinks = async () => {
  try {
    const records = await base('Links')
      .select({
        sort: [{ field: 'Order', direction: 'asc' }],
      })
      .firstPage();

    return records.map((record) => ({
      id: record.id,
      title: record.get('Title'),
      url: record.get('URL'),
      description: record.get('Description'),
      category: record.get('Category'),
    }));
  } catch (error) {
    console.error('Error fetching family links:', error);
    return [];
  }
};