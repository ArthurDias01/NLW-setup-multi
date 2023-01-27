
import cors from '@fastify/cors';
import Fastify from "fastify";
import { appRoutes } from './routes';


const app = Fastify();

//add res header in all routes to allow cors
app.addHook("onSend", (req, res, payload, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  console.log('req', JSON.stringify(req.headers, null, 2))
  next();
});

app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept", 'Access-Control-Allow-Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
});
app.register(appRoutes);



app.listen({
  port: 3333,
  host: "0.0.0.0"
}).then(() => {
  console.log("Server is running on port 3333!");
})
