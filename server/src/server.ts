
import cors from '@fastify/cors';
import Fastify from "fastify";
import { appRoutes } from './routes';


const app = Fastify();

//add res header in all routes to allow cors
app.addHook("onSend", (req, res, payload, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.register(cors, {
  origin: ["https://habitsio.vercel.app", "https://habitsio-arthurdias01.vercel.app", /\.habitsio.vercel\.app$/],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept", 'Access-Control-Allow-Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
});
app.register(appRoutes);



app.listen({
  port: 3333,
  host: "0.0.0.0",
}).then(() => {
  console.log("Server is running on port 3333!");
})
