import { FastifyReply, FastifyRequest } from "fastify";


export const corsResponse = (request: FastifyRequest, reply: FastifyReply) => {
  reply.header('Access-Control-Allow-Origin', '*');
}
