import fastify, { FastifyRequest } from 'fastify';
import cors from 'fastify-cors';
import { RouteGenericInterface } from 'fastify/types/route';
import * as admin from 'firebase-admin';
import { IncomingMessage, Server } from 'http';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    storageBucket: '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

admin.initializeApp(firebaseConfig);

const getIdToken = (request: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>) => {
    if (!request.headers.authorization) {
        request.log.error('Missing authorization token in header.');
        throw new Error('Unauthorized');
    }
    const match = request.headers.authorization.match(/^Bearer (.*)$/);
    if (match) {
        const idToken = match[1];
        return idToken;
    }
    request.log.error('There is no bearer.');
    throw new Error('Unauthorized');
};

const server = fastify({
    logger: true,
});

server.register(cors);

server.get('/auth', async (request, reply) => {
    try {
        const idToken = getIdToken(request);
        await admin.auth().verifyIdToken(idToken);
        reply.type('application/json').code(200);
        return 'OK';
    } catch (error) {
        reply.type('application/json').code(401);
        return 'Unauthorized';
    }
});

server.listen(process.env.PORT ?? 3000, '0.0.0.0', (err, address) => {
    if (err) throw err;
    server.log.info(`server listening on ${address}`);
    server.log.info(`FIREBASE_API_KEY:${firebaseConfig.apiKey}`);
    server.log.info(`FIREBASE_PROJECT_ID:${firebaseConfig.projectId}`);
    server.log.info(`FIREBASE_MESSAGING_SENDER_ID:${firebaseConfig.messagingSenderId}`);
    server.log.info(`FIREBASE_APP_ID:${firebaseConfig.appId}`);
});
