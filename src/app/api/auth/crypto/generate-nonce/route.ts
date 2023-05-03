import { prisma } from '@/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

interface CryptoNonceResponse {
  nonce: string;
  expires: string;
}

// Generating a nonce is the first step of both registering and logging in.
//  In this function we generate a secure random string and assign it to
//  the public address that we get as a parameter.
// We save this to the database so if we don't have a user with the given
//  public address, we create a new user.
// Later steps of both logging in and registering require the user to sign
//  the nonce we send back, with that they prove that they are the owners
//  of the public address they gave.
async function POST(req: NextRequest, res: NextResponse) {
  const { publicAddress } = await req.json();

  // Note: this nonce is displayed in the user's wallet for them to sign
  //  you can use any other representation of the nonce that you want
  //  but make sure to keep it a true random number with enough length.
  const nonce = crypto.randomBytes(32).toString('hex');

  // Set the expiry of the nonce to 1 hour
  const expires = new Date(new Date().getTime() + 1000 * 60 * 60);

  // Create or update the nonce for the given user
  //  see: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#upsert
  await prisma.user.upsert({
    where: { publicAddress: publicAddress || '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9' },
    create: {
      publicAddress,
      cryptoLoginNonce: {
        create: {
          nonce,
          expires,
        },
      },
    },
    update: {
      cryptoLoginNonce: {
        upsert: {
          create: {
            nonce,
            expires,
          },
          update: {
            nonce,
            expires,
          },
        },
      },
    },
  });

  return NextResponse.json({
    nonce,
    expires: expires.toISOString(),
  });
}

export { POST };
