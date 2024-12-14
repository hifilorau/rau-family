export const getMainPhoto = async () => {
  try {
    const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Links?maxRecords=1`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });
    const { records } = await res.json();

    if (records.length > 0) {
      return {
        url: records[0].fields['URL'],
        caption: records[0].fields['Caption']
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
    const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Links`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });
    const { records } = await res.json();

    return records.map(record => ({
      id: record.id,
      name: record.fields['Name'],
      url: record.fields['links'],
      category: record.fields['category']
    }));
  } catch (error) {
    console.error('Error fetching family links:', error);
    return [];
  }
};
