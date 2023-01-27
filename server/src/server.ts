
import cors from '@fastify/cors';
import Fastify from "fastify";
import { appRoutes } from './routes';


const app = Fastify();


app.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
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
