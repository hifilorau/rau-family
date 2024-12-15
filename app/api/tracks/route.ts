import { getMusicTracks } from '@/lib/airtable';
import { NextResponse } from 'next/server';

// export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
	try {
		const tracks = await getMusicTracks();
		console.log('music tracks', tracks)
		return NextResponse.json(tracks);
	} catch (error) {
		console.error('Error fetching tracks:', error);
		return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
	}
}