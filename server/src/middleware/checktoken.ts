import { FastifyReply, FastifyRequest } from 'fastify';
import jwt_decode from 'jwt-decode';
import { prisma } from "../../lib/prisma";

interface jwtToken {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: {
    identities: {
      email: string[];
    };
    sign_in_provider: string;
  }
}

export interface UFastifyRequest extends FastifyRequest {
  userId: string;
  firebaseId: string;
}

export async function checkToken(request: FastifyRequest, response: FastifyReply) {

  const token = request.headers.authorization?.replace('Bearer ', '');
  // console.log('token exists', typeof token === 'string')

  if (!token) {
    return response.status(401).send({ error: 'User not Found or token expired' });
  }

  const decoded = jwt_decode(token) as jwtToken;

  //check time logged if expired token return 401
  const now = new Date().getTime();

  if (decoded.exp * 1000 < now) {


    return response.status(401).send({ error: 'User not Found or token expired' });
  }
  // console.log('decoded', decoded)
  //check if user exists
  const user = await prisma.user.findUnique({
    where: {
      firebaseId: decoded.user_id,
    }
  });

  if (!user) {
    return response.status(401).send({ error: 'User not Found or token expired' });
  }

  return { userId: user.id, firebaseId: decoded.user_id }

}
