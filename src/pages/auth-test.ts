import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Get the session using getServerSession for better reliability
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({
                authenticated: false,
                message: 'Not authenticated',
                sessionFound: false,
                sessionValue: null,
                cookies: Object.keys(req.cookies).map(key => ({
                    name: key,
                    hasValue: !!req.cookies[key],
                    length: req.cookies[key]?.length
                }))
            });
        }

        // Return session details (without exposing the actual token)
        return res.status(200).json({
            authenticated: true,
            user: session.user,
            hasAccessToken: !!session.accessToken,
            accessTokenPrefix: session.accessToken ?
                `${session.accessToken.substring(0, 5)}...` : null,
            expires: session.expires,
            cookies: Object.keys(req.cookies)
                .filter(key => key.includes('next-auth'))
                .map(key => ({
                    name: key,
                    hasValue: !!req.cookies[key],
                    length: req.cookies[key]?.length
                }))
        });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
