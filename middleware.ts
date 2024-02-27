import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest, response: NextResponse) {
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set(
        'x-version',
        process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
    );

    return NextResponse.next({
        headers: responseHeaders
    });
}
